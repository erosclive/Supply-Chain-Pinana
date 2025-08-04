<?php
session_start();
include 'db_connection.php';

// Check if user is logged in
if (!isset($_SESSION['user_id'])) {
    header('Content-Type: application/json');
    echo json_encode(['error' => 'Not logged in']);
    exit;
}

$retailer_id = $_SESSION['user_id'];

// Get products from completed orders with pending/partial payment for this user
$query = "SELECT DISTINCT p.product_id, p.product_name, p.category, p.price, p.stocks, p.product_photo
          FROM retailer_order_items roi
          JOIN products p ON roi.product_id = p.product_id
          JOIN retailer_orders ro ON roi.order_id = ro.order_id
          WHERE ro.retailer_id = ?
          AND ro.payment_status IN ('pending', 'partial')
          ORDER BY p.product_name";

$stmt = $conn->prepare($query);
$stmt->bind_param("i", $retailer_id);
$stmt->execute();
$result = $stmt->get_result();

$products = [];
while ($row = $result->fetch_assoc()) {
    $products[] = $row;
}

// Return the data as JSON
header('Content-Type: application/json');
echo json_encode([
    'success' => true,
    'products' => $products
]);
?>
