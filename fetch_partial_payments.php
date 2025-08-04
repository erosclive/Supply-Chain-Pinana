<?php
// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Include database connection
require_once 'db_connection.php';

// Start session if not already started
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Set header to return JSON
header('Content-Type: application/json');

// Initialize response array
$response = ['success' => false, 'message' => '', 'orders' => []];

try {
    // Fetch orders with partial payment status
    $query = "SELECT o.*, 
              COALESCE(o.payment_status, 'pending') as payment_status,
              COALESCE((SELECT SUM(payment_amount) FROM retailer_order_payments WHERE order_id = o.order_id), 0) as paid_amount,
              (o.total_amount - COALESCE((SELECT SUM(payment_amount) FROM retailer_order_payments WHERE order_id = o.order_id), 0)) as remaining_amount
              FROM retailer_orders o 
              WHERE o.status = 'completed' 
              AND o.payment_status = 'partial'
              ORDER BY o.created_at DESC";
    
    $stmt = $conn->prepare($query);
    
    if (!$stmt) {
        throw new Exception("Prepare failed: " . $conn->error);
    }
    
    if (!$stmt->execute()) {
        throw new Exception("Execute failed: " . $stmt->error);
    }
    
    $result = $stmt->get_result();
    
    $orders = [];
    while ($row = $result->fetch_assoc()) {
        $orders[] = $row;
    }
    
    $response['success'] = true;
    $response['orders'] = $orders;
    
} catch (Exception $e) {
    $response['message'] = "Error: " . $e->getMessage();
    error_log("Error fetching partial payment orders: " . $e->getMessage());
}

echo json_encode($response);
?>