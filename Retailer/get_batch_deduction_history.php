<?php
// get_batch_deduction_history.php
// This file retrieves the history of batch deductions for a product

// Include database connection
require_once 'db_connection.php';

// Set header to return JSON
header('Content-Type: application/json');

// Check if product ID is provided
if (!isset($_GET['product_id'])) {
    echo json_encode(['success' => false, 'message' => 'Product ID is required']);
    exit;
}

$productId = $_GET['product_id'];

try {
    // Get product details first to check if batch tracking is enabled
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
    
    // Check if batch tracking is enabled for this product
    $batchTrackingEnabled = ($product['batch_tracking'] == 1);
    
    if (!$batchTrackingEnabled) {
        echo json_encode([
            'success' => true,
            'batch_tracking_enabled' => false,
            'logs' => []
        ]);
        exit;
    }
    
    // Get inventory logs with batch details for this product
    $logQuery = "SELECT il.log_id, il.change_type, il.quantity, il.order_id, il.previous_stock, il.new_stock, 
                il.batch_details, il.created_at, ro.po_number as order_number
                FROM inventory_log il
                LEFT JOIN retailer_orders ro ON il.order_id = ro.order_id
                WHERE il.product_id = ? AND il.batch_details IS NOT NULL
                ORDER BY il.created_at DESC";
    
    $logStmt = $conn->prepare($logQuery);
    $logStmt->bind_param('s', $productId);
    $logStmt->execute();
    $logResult = $logStmt->get_result();
    
    $logs = [];
    while ($log = $logResult->fetch_assoc()) {
        // Parse batch details JSON
        $log['batch_details_parsed'] = !empty($log['batch_details']) ? json_decode($log['batch_details'], true) : [];
        $logs[] = $log;
    }
    
    echo json_encode([
        'success' => true,
        'batch_tracking_enabled' => true,
        'product_name' => $product['product_name'],
        'logs' => $logs
    ]);
    
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
    exit;
}
?>
