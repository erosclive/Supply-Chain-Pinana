<?php
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
            'batches' => []
        ]);
        exit;
    }
    
    // Get active batches for this product
    $batchQuery = "SELECT pb.batch_id, pb.batch_code, pb.quantity, pb.expiration_date, pb.manufacturing_date 
                  FROM product_batches pb
                  WHERE pb.product_id = ? AND pb.quantity > 0
                  ORDER BY 
                    CASE WHEN pb.expiration_date = '0000-00-00' THEN 1 ELSE 0 END,
                    pb.expiration_date ASC,
                    pb.batch_id ASC";
    
    $batchStmt = $conn->prepare($batchQuery);
    $batchStmt->bind_param('s', $productId);
    $batchStmt->execute();
    $batchResult = $batchStmt->get_result();
    
    $batches = [];
    while ($batch = $batchResult->fetch_assoc()) {
        $batches[] = $batch;
    }
    
    echo json_encode([
        'success' => true,
        'batch_tracking_enabled' => true,
        'batches' => $batches
    ]);
    
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
    exit;
}
?>
