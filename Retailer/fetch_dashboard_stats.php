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

// Get total products ordered
$totalProductsQuery = "SELECT COUNT(DISTINCT roi.product_id) as total 
                      FROM retailer_order_items roi
                      JOIN retailer_orders ro ON roi.order_id = ro.order_id
                      WHERE ro.retailer_id = ?";
$stmt = $conn->prepare($totalProductsQuery);
$stmt->bind_param("i", $retailer_id);
$stmt->execute();
$result = $stmt->get_result();
$totalProducts = $result->fetch_assoc()['total'];

// Get active orders count
$activeOrdersQuery = "SELECT COUNT(*) as total 
                     FROM retailer_orders 
                     WHERE retailer_id = ? 
                     AND status IN ('order', 'confirmed', 'ready-to-pickup', 'shipped')";
$stmt = $conn->prepare($activeOrdersQuery);
$stmt->bind_param("i", $retailer_id);
$stmt->execute();
$result = $stmt->get_result();
$activeOrders = $result->fetch_assoc()['total'];

// Get pending payments count
$pendingPaymentsQuery = "SELECT COUNT(*) as total 
                        FROM retailer_orders 
                        WHERE retailer_id = ? 
                        AND payment_status = 'pending'";
$stmt = $conn->prepare($pendingPaymentsQuery);
$stmt->bind_param("i", $retailer_id);
$stmt->execute();
$result = $stmt->get_result();
$pendingPayments = $result->fetch_assoc()['total'];

// Return the data as JSON
header('Content-Type: application/json');
echo json_encode([
    'totalProducts' => $totalProducts,
    'activeOrders' => $activeOrders,
    'pendingPayments' => $pendingPayments
]);
?>
