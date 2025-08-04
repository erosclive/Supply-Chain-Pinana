<?php
// Include database connection
require_once 'db_connection.php';

// Set header to return JSON
header('Content-Type: application/json');

// Check if order ID and product ID are provided
if (!isset($_GET['order_id']) || !isset($_GET['product_id'])) {
    echo json_encode(['success' => false, 'message' => 'Order ID and Product ID are required']);
    exit;
}

$orderId = $_GET['order_id'];
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
    
    // Get order details
    $orderQuery = "SELECT ro.order_id, COALESCE(ro.po_number, ro.order_id) as order_number, 
                  roi.quantity, roi.unit_price, roi.total_price
                  FROM retailer_orders ro
                  JOIN retailer_order_items roi ON ro.order_id = roi.order_id
                  WHERE ro.order_id = ? AND roi.product_id = ?";
    
    $orderStmt = $conn->prepare($orderQuery);
    $orderStmt->bind_param('is', $orderId, $productId);
    $orderStmt->execute();
    $orderResult = $orderStmt->get_result();
    
    if (!$orderResult || $orderResult->num_rows === 0) {
        echo json_encode(['success' => false, 'message' => 'Order or product not found in order']);
        exit;
    }
    
    $order = $orderResult->fetch_assoc();
    
    // If batch tracking is not enabled, return empty batch details
    if (!$batchTrackingEnabled) {
        echo json_encode([
            'success' => true,
            'batch_tracking_enabled' => false,
            'order' => $order,
            'batch_details' => []
        ]);
        exit;
    }
    
    // Get batch deduction details from inventory log
    $logQuery = "SELECT il.log_id, il.quantity as quantity_deducted, il.batch_details, il.created_at as deduction_date
                FROM inventory_log il
                WHERE il.order_id = ? AND il.product_id = ? AND il.change_type = 'order_completion'
                ORDER BY il.created_at DESC
                LIMIT 1";
    
    $logStmt = $conn->prepare($logQuery);
    $logStmt->bind_param('is', $orderId, $productId);
    $logStmt->execute();
    $logResult = $logStmt->get_result();
    
    $batchDetails = [];
    $deductionDate = null;
    $quantityDeducted = 0;
    
    if ($logResult && $logResult->num_rows > 0) {
        $log = $logResult->fetch_assoc();
        $deductionDate = $log['deduction_date'];
        $quantityDeducted = $log['quantity_deducted'];
        
        // Parse batch details JSON if available
        if (!empty($log['batch_details'])) {
            $batchDetails = json_decode($log['batch_details'], true);
        }
    }
    
    echo json_encode([
        'success' => true,
        'batch_tracking_enabled' => true,
        'order' => $order,
        'quantity_deducted' => $quantityDeducted,
        'deduction_date' => $deductionDate,
        'batch_details' => $batchDetails
    ]);
    
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
    exit;
}
?>
