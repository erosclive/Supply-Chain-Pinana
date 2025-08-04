<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

ini_set('display_errors', 1);
error_reporting(E_ALL);

// === CONFIG ===
$sanityProjectId = '29vxjvjm';
$sanityDataset = 'production';
$sanityToken = 'skMGJManAgirosEUNqE7NdVRckrSjvu8pf4PqjM4tlxyt9SqizUDbVCHYKp8ITfvuPFVo5WXyxlFTRWjyxp0DAgGSl1sJ4peUXjU2yo8yHi4ancQ2jBJ0UM72m57wW8Uvy6RoJUuBxDDnPjHlL4N5MWQaKCJe88zdh7L3fvJcC5h4dU6ClOj'; // replace securely

// === GROQ QUERY for orders ===
$orderQuery = '*[_type == "order" && status == "delivered"]{
  orderNumber,
  orderDate,
  totalPrice,
  amountDiscount,
  currency,
  products[]{
    quantity,
    product->{
      name,
      "slug": slug.current
    }
  },
  address {
    cityormunicipality,
    province
  }
}';

$orderUrl = "https://$sanityProjectId.api.sanity.io/v2023-01-01/data/query/$sanityDataset?query=" . urlencode($orderQuery);

// === Execute orders query ===
$ch = curl_init($orderUrl);
curl_setopt($ch, CURLOPT_HTTPHEADER, ["Authorization: Bearer $sanityToken"]);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$orderResponse = curl_exec($ch);

if ($orderResponse === false) {
  http_response_code(500);
  echo json_encode(["error" => curl_error($ch)]);
  exit;
}
curl_close($ch);

$orderData = json_decode($orderResponse, true);
if (json_last_error() !== JSON_ERROR_NONE) {
  http_response_code(500);
  echo json_encode(["error" => "JSON decode error: " . json_last_error_msg()]);
  exit;
}
$orders = $orderData['result'] ?? [];

// === GROQ QUERY for products (to get categories) ===
$productQuery = '*[_type == "product"]{
  "slug": slug.current,
  categories[]-> { title }
}';

$productUrl = "https://$sanityProjectId.api.sanity.io/v2023-01-01/data/query/$sanityDataset?query=" . urlencode($productQuery);

// === Execute products query ===
$ch = curl_init($productUrl);
curl_setopt($ch, CURLOPT_HTTPHEADER, ["Authorization: Bearer $sanityToken"]);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$productResponse = curl_exec($ch);

if ($productResponse === false) {
  http_response_code(500);
  echo json_encode(["error" => curl_error($ch)]);
  exit;
}
curl_close($ch);

$productData = json_decode($productResponse, true);
if (json_last_error() !== JSON_ERROR_NONE) {
  http_response_code(500);
  echo json_encode(["error" => "JSON decode error: " . json_last_error_msg()]);
  exit;
}
$products = $productData['result'] ?? [];

// === Build slug ➔ categories map ===
$slugCategoryMap = [];
foreach ($products as $p) {
  $slug = $p['slug'] ?? 'unknown';
  $categories = [];

  if (isset($p['categories'])) {
    foreach ($p['categories'] as $cat) {
      if (isset($cat['title'])) {
        $categories[] = $cat['title'];
      }
    }
  }

  if (empty($categories)) {
    $categories[] = 'Uncategorized';
  }

  $slugCategoryMap[$slug] = $categories;
}

// === Process analytics ===

$totalRevenue = 0;
$totalDiscount = 0;
$totalOrders = count($orders);
$productSales = []; // slug => [name, quantity]
$salesByDate = []; // date => total
$regionalSales = []; // province => total
$salesByCategory = []; // category => total sales

foreach ($orders as $order) {
  $totalRevenue += $order['totalPrice'] ?? 0;
  $totalDiscount += $order['amountDiscount'] ?? 0;

  // Group sales by date
  $date = isset($order['orderDate']) ? date('Y-m-d', strtotime($order['orderDate'])) : 'Unknown';
  if (!isset($salesByDate[$date])) {
    $salesByDate[$date] = 0;
  }
  $salesByDate[$date] += $order['totalPrice'] ?? 0;

  // Regional sales
  $province = $order['address']['province'] ?? 'Unknown';
  if (!isset($regionalSales[$province])) {
    $regionalSales[$province] = 0;
  }
  $regionalSales[$province] += $order['totalPrice'] ?? 0;

  // Product and category sales
  foreach ($order['products'] as $p) {
    $slug = $p['product']['slug'] ?? 'unknown';
    $name = $p['product']['name'] ?? 'Unnamed';
    $qty = $p['quantity'] ?? 0;

    if (!isset($productSales[$slug])) {
      $productSales[$slug] = ['name' => $name, 'quantity' => 0];
    }
    $productSales[$slug]['quantity'] += $qty;

    // Get categories for this product
    $categories = $slugCategoryMap[$slug] ?? ['Uncategorized'];
    foreach ($categories as $cat) {
      if (!isset($salesByCategory[$cat])) {
        $salesByCategory[$cat] = 0;
      }
      $salesByCategory[$cat] += $p['quantity'] * ($order['totalPrice'] / array_sum(array_column($order['products'], 'quantity')));
    }
  }
}

// Sort top products by quantity descending
usort($productSales, function($a, $b) {
  return $b['quantity'] <=> $a['quantity'];
});

// Sort sales by category descending
arsort($salesByCategory);

// === Return analytics as JSON ===
echo json_encode([
  "totalOrders" => $totalOrders,
  "totalRevenue" => $totalRevenue,
  "totalDiscount" => $totalDiscount,
  "salesByDate" => $salesByDate,
  "topProducts" => array_slice($productSales, 0, 10), // top 10 products
  "regionalSales" => $regionalSales,
  "salesByCategory" => $salesByCategory
]);