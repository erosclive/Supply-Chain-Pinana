<?php
// Include database connection
require_once 'db_connection.php';

// Set headers for JSON response
header('Content-Type: application/json');

try {
    // Prepare SQL query to fetch orders with pending payment status
    $sql = "SELECT ro.order_id, ro.retailer_name, ro.total_amount, ro.payment_status, ro.status
            FROM retailer_orders ro
            WHERE ro.payment_status = 'pending'
            ORDER BY ro.order_date DESC";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute();
    
    $orders = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Return the orders as JSON
    echo json_encode($orders);
} catch (PDOException $e) {
    // Return error message
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}
?>