<?php
// get_order_batch_details.php
// This file retrieves batch details for a specific product in a completed order

// Include database connection
require_once 'db_connection.php';

// Set header to return JSON
header('Content-Type: application/json');

// Check if required parameters are provided
if (!isset($_GET['order_id']) || !isset($_GET['product_id'])) {
    echo json_encode(['success' => false, 'message' => 'Order ID and Product ID are required']);
    exit;
}

$orderId = $_GET['order_id'];
$productId = $_GET['product_id'];

try {
    // First check if the order exists and is completed
    $orderQuery = "SELECT order_id, order_number, status FROM retailer_orders WHERE order_id = ?";
    $orderStmt = $conn->prepare($orderQuery);
    $orderStmt->bind_param('i', $orderId);
    $orderStmt->execute();
    $orderResult = $orderStmt->get_result();
    
    if (!$orderResult || $orderResult->num_rows === 0) {
        echo json_encode(['success' => false, 'message' => 'Order not found']);
        exit;
    }
    
    $order = $orderResult->fetch_assoc();
    
    if ($order['status'] !== 'completed') {
        echo json_encode([
            'success' => false, 
            'message' => 'Order is not completed. Batch details are only available for completed orders.'
        ]);
        exit;
    }
    
    // Get the inventory log entry for this order and product
    $logQuery = "SELECT log_id, change_type, quantity, previous_stock, new_stock, 
                batch_details, notes, created_at 
                FROM inventory_log 
                WHERE order_id = ? AND product_id = ? AND change_type = 'order_completion'";
    $logStmt = $conn->prepare($logQuery);
    $logStmt->bind_param('is', $orderId, $productId);
    $logStmt->execute();
    $logResult = $logStmt->get_result();
    
    if (!$logResult || $logResult->num_rows === 0) {
        echo json_encode([
            'success' => false, 
            'message' => 'No batch deduction records found for this product in this order'
        ]);
        exit;
    }
    
    $log = $logResult->fetch_assoc();
    
    // Get product details
    $productQuery = "SELECT product_id, product_name, batch_tracking FROM products WHERE product_id = ?";
    $productStmt = $conn->prepare($productQuery);
    $productStmt->bind_param('s', $productId);
    $productStmt->execute();
    $productResult = $productStmt->get_result();
    
    if (!$productResult || $productResult->num_rows === 0) {
        echo json_encode(['success' => false, 'message' => 'Product not found']);
        exit;
    }
    
    $product = $productResult->fetch_assoc();
    
    // If batch tracking is not enabled or no batch details, return empty
    if ($product['batch_tracking'] != 1 || empty($log['batch_details'])) {
        echo json_encode([
            'success' => true,
            'order' => $order,
            'product' => $product,
            'batch_tracking_enabled' => ($product['batch_tracking'] == 1),
            'quantity_deducted' => $log['quantity'],
            'batch_details' => []
        ]);
        exit;
    }
    
    // Parse the batch details JSON
    $batchDetails = json_decode($log['batch_details'], true);
    
    // If batch details couldn't be parsed, return empty
    if (!$batchDetails) {
        echo json_encode([
            'success' => true,
            'order' => $order,
            'product' => $product,
            'batch_tracking_enabled' => true,
            'quantity_deducted' => $log['quantity'],
            'batch_details' => []
        ]);
        exit;
    }
    
    echo json_encode([
        'success' => true,
        'order' => $order,
        'product' => $product,
        'batch_tracking_enabled' => true,
        'quantity_deducted' => $log['quantity'],
        'deduction_date' => $log['created_at'],
        'batch_details' => $batchDetails
    ]);
    
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
    exit;
}
?>