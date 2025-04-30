<?php
// get_product_completed_orders.php
// This file retrieves batch details for a product in all completed orders

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
    
    // If batch tracking is not enabled, return empty orders
    if ($product['batch_tracking'] != 1) {
        echo json_encode([
            'success' => true,
            'batch_tracking_enabled' => false,
            'orders' => []
        ]);
        exit;
    }
    
    // Get all completed orders containing this product
    $ordersQuery = "SELECT ro.order_id, ro.order_number, ro.po_number, ro.created_at, 
                    roi.quantity, roi.unit_price, roi.total_price
                    FROM retailer_orders ro
                    JOIN retailer_order_items roi ON ro.order_id = roi.order_id
                    WHERE roi.product_id = ? AND ro.status = 'completed'
                    ORDER BY ro.created_at DESC";
    
    $ordersStmt = $conn->prepare($ordersQuery);
    $ordersStmt->bind_param('s', $productId);
    $ordersStmt->execute();
    $ordersResult = $ordersStmt->get_result();
    
    $orders = [];
    
    while ($order = $ordersResult->fetch_assoc()) {
        // Get batch details for this order and product
        $batchQuery = "SELECT log_id, batch_details, created_at
                      FROM inventory_log
                      WHERE order_id = ? AND product_id = ? AND change_type = 'order_completion'
                      LIMIT 1";
        
        $batchStmt = $conn->prepare($batchQuery);
        $batchStmt->bind_param('is', $order['order_id'], $productId);
        $batchStmt->execute();
        $batchResult = $batchStmt->get_result();
        
        if ($batchResult && $batchResult->num_rows > 0) {
            $batchLog = $batchResult->fetch_assoc();
            
            // Parse batch details JSON
            $batchDetails = !empty($batchLog['batch_details']) ? json_decode($batchLog['batch_details'], true) : [];
            
            // Add batch details to order
            $order['batch_details'] = $batchDetails;
            $order['deduction_date'] = $batchLog['created_at'];
            
            $orders[] = $order;
        }
    }
    
    echo json_encode([
        'success' => true,
        'product' => $product,
        'batch_tracking_enabled' => true,
        'orders' => $orders
    ]);
    
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
    exit;
}
?>
