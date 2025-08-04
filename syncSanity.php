<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);

// === CONFIG ===
$sanityProjectId = '29vxjvjm';
$sanityDataset = 'production';
$sanityToken = 'skFSThqjCPcFJ1glaIVKeoZfoZ8uJC4Po9fODAJPbm4qXrooQVmpamen279JFVOcZCjlH3vMwgGhwWbsUrexQgAdJQfkF3ZCeYbcTPDeNClBFZy9WM3GzWA6ONyKyzV1v87R5kC5d6PtvnonKtRhjYAoaKbqnTjXkXrHCeF1hSvZjgw1h6xH'; // Must have write access

// === MYSQL CONNECTION ===
include("db_connection.php"); // adjust if your db.php path differs

if ($conn->connect_error) {
  error_log("❌ MySQL connection failed: " . $conn->connect_error);
  exit("MySQL connection error.");
}

// === FETCH PRODUCTS ===
$sql = "SELECT slug, stocks FROM products";
$result = $conn->query($sql);

if (!$result) {
  error_log("❌ MySQL query failed: " . $conn->error);
  exit("MySQL query error.");
}

$products = [];
while ($row = $result->fetch_assoc()) {
  $products[] = [
    'slug' => $row['slug'],
    'stocks' => $row['stocks']
  ];
}

$conn->close();

// === SYNC EACH PRODUCT TO SANITY ===
foreach ($products as $product) {
  $slug = $product['slug'];
  $stocks = (int)$product['stocks'];

  // --- Fetch Sanity product ID by slug ---
  $query = urlencode("*[_type == 'product' && slug.current == '$slug'][0]{_id}");
  $url = "https://$sanityProjectId.api.sanity.io/v2023-01-01/data/query/$sanityDataset?query=$query";

  $ch = curl_init($url);
  curl_setopt($ch, CURLOPT_HTTPHEADER, ["Authorization: Bearer $sanityToken"]);
  curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
  $result = curl_exec($ch);

  if ($result === false) {
    error_log("❌ cURL error fetching product slug '$slug': " . curl_error($ch));
    curl_close($ch);
    continue;
  }
  curl_close($ch);

  $data = json_decode($result, true);
  if (isset($data['result']['_id'])) {
    $id = $data['result']['_id'];

    // --- Update Sanity stock field ---
    $patchUrl = "https://$sanityProjectId.api.sanity.io/v2023-01-01/data/mutate/$sanityDataset";
    $payload = json_encode([
      "mutations" => [[
        "patch" => [
          "id" => $id,
          "set" => ["stock" => $stocks]
        ]
      ]]
    ]);

    $ch = curl_init($patchUrl);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
      "Authorization: Bearer $sanityToken",
      "Content-Type: application/json"
    ]);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    $patchResult = curl_exec($ch);

    if ($patchResult === false) {
      error_log("❌ cURL PATCH error for product '$slug': " . curl_error($ch));
    } else {
      error_log("✅ Updated '$slug' stock to $stocks");
    }

    curl_close($ch);

  } else {
    error_log("❌ No Sanity product found for slug '$slug'");
  }
}

echo "Sync complete.\n";
?>
