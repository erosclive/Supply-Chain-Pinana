<?php
// get_batch_details.php
// This file handles retrieving batch details for a product

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
    
    // If batch tracking is not enabled, return empty batches
    if ($product['batch_tracking'] != 1) {
        echo json_encode([
            'success' => true,
            'batch_tracking_enabled' => false,
            'batches' => []
        ]);
        exit;
    }
    
    // Get batches for the product
    $batchesQuery = "SELECT batch_id, product_id, batch_code, quantity, expiration_date, 
                    manufacturing_date, created_at, updated_at
                    FROM product_batches 
                    WHERE product_id = ? AND quantity > 0
                    ORDER BY expiration_date ASC, batch_id ASC";
    $batchesStmt = $conn->prepare($batchesQuery);
    $batchesStmt->bind_param('s', $productId);
    $batchesStmt->execute();
    $batchesResult = $batchesStmt->get_result();
    
    $batches = [];
    while ($batch = $batchesResult->fetch_assoc()) {
        // Calculate days until expiry
        $expiryDate = $batch['expiration_date'] ? new DateTime($batch['expiration_date']) : null;
        $today = new DateTime();
        $daysUntilExpiry = null;
        
        if ($expiryDate && $batch['expiration_date'] !== '0000-00-00') {
            $interval = $today->diff($expiryDate);
            $daysUntilExpiry = $interval->invert ? -$interval->days : $interval->days;
        }
        
        $batch['days_until_expiry'] = $daysUntilExpiry;
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