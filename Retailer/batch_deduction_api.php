<?php
// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Include database connection
require_once 'db_connection.php';

// Set header to return JSON
header('Content-Type: application/json');

// Start session if not already started
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Initialize response array
$response = ['success' => false, 'message' => ''];

// Check if request method is POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    $response['message'] = 'Invalid request method';
    echo json_encode($response);
    exit;
}

// Get JSON data from request
$data = json_decode(file_get_contents('php://input'), true);

// Validate required fields
if (!isset($data['product_id']) || !isset($data['quantity']) || !isset($data['order_id'])) {
    $response['message'] = 'Missing required fields';
    echo json_encode($response);
    exit;
}

$productId = $data['product_id'];
$quantity = intval($data['quantity']);
$orderId = intval($data['order_id']);

try {
    // Start transaction
    $conn->begin_transaction();
    
    // Check if product has batch tracking enabled
    $batchCheckQuery = "SELECT batch_tracking, stocks, product_name FROM products WHERE product_id = ?";
    $batchCheckStmt = $conn->prepare($batchCheckQuery);
    $batchCheckStmt->bind_param('s', $productId);
    $batchCheckStmt->execute();
    $batchCheckResult = $batchCheckStmt->get_result();
    
    if ($batchCheckResult->num_rows === 0) {
        throw new Exception("Product not found");
    }
    
    $productData = $batchCheckResult->fetch_assoc();
    $batchTracking = $productData['batch_tracking'];
    $currentStock = $productData['stocks'];
    $productName = $productData['product_name'];
    
    // Check if we have enough stock
    if ($currentStock < $quantity) {
        throw new Exception("Insufficient stock for product $productName");
    }
    
    // Calculate new stock level
    $newStock = $currentStock - $quantity;
    
    // If batch tracking is enabled, use FIFO logic
    if ($batchTracking == 1) {
        // Get batches ordered by expiration date (FIFO)
        $batchesQuery = "SELECT batch_id, batch_code, quantity, expiration_date 
                        FROM product_batches 
                        WHERE product_id = ? AND quantity > 0 
                        ORDER BY expiration_date ASC, batch_id ASC";
        $batchesStmt = $conn->prepare($batchesQuery);
        $batchesStmt->bind_param('s', $productId);
        $batchesStmt->execute();
        $batchesResult = $batchesStmt->get_result();
        
        if ($batchesResult->num_rows === 0) {
            throw new Exception("No batches available for product $productName");
        }
        
        $remainingToDeduct = $quantity;
        $batchUpdates = [];
        
        // Deduct from batches starting with earliest expiration date
        while ($batch = $batchesResult->fetch_assoc()) {
            if ($remainingToDeduct <= 0) break;
            
            $batchId = $batch['batch_id'];
            $batchCode = $batch['batch_code'];
            $batchQuantity = $batch['quantity'];
            $expirationDate = $batch['expiration_date'];
            
            $deductFromBatch = min($batchQuantity, $remainingToDeduct);
            $newBatchQuantity = $batchQuantity - $deductFromBatch;
            
            // Update batch quantity
            $updateBatchQuery = "UPDATE product_batches SET quantity = ? WHERE batch_id = ?";
            $updateBatchStmt = $conn->prepare($updateBatchQuery);
            $updateBatchStmt->bind_param('ii', $newBatchQuantity, $batchId);
            
            if (!$updateBatchStmt->execute()) {
                throw new Exception("Failed to update batch $batchId: " . $conn->error);
            }
            
            // Record which batch was deducted from
            $batchUpdates[] = [
                'batch_id' => $batchId,
                'batch_code' => $batchCode,
                'deducted' => $deductFromBatch,
                'remaining' => $newBatchQuantity,
                'expiration_date' => $expirationDate
            ];
            
            $remainingToDeduct -= $deductFromBatch;
        }
        
        // If we couldn't deduct the full quantity, rollback
        if ($remainingToDeduct > 0) {
            throw new Exception("Insufficient batch quantities for product $productName");
        }
        
        // Convert batch updates to JSON for logging
        $batchDetailsJson = json_encode($batchUpdates);
        
        // Log inventory change with batch details
        $logQuery = "INSERT INTO inventory_log 
                    (product_id, change_type, quantity, order_id, previous_stock, new_stock, notes, batch_details, created_at) 
                    VALUES (?, 'order_completion', ?, ?, ?, ?, 'FIFO batch deduction', ?, NOW())";
        $logStmt = $conn->prepare($logQuery);
        $logStmt->bind_param('siiiss', $productId, $quantity, $orderId, $currentStock, $newStock, $batchDetailsJson);
        
        if (!$logStmt->execute()) {
            throw new Exception("Failed to log inventory change: " . $conn->error);
        }
        
        $response['batch_updates'] = $batchUpdates;
    } else {
        // For non-batch tracked products, use simple deduction
        // Log inventory change without batch details
        $logQuery = "INSERT INTO inventory_log 
                    (product_id, change_type, quantity, order_id, previous_stock, new_stock, created_at) 
                    VALUES (?, 'order_completion', ?, ?, ?, ?, NOW())";
        $logStmt = $conn->prepare($logQuery);
        $logStmt->bind_param('siiii', $productId, $quantity, $orderId, $currentStock, $newStock);
        
        if (!$logStmt->execute()) {
            throw new Exception("Failed to log inventory change: " . $conn->error);
        }
    }
    
    // Update product stock
    $updateStockQuery = "UPDATE products SET stocks = ?, updated_at = NOW() WHERE product_id = ?";
    $updateStockStmt = $conn->prepare($updateStockQuery);
    $updateStockStmt->bind_param('is', $newStock, $productId);
    
    if (!$updateStockStmt->execute()) {
        throw new Exception("Failed to update stock for product $productName: " . $conn->error);
    }
    
    // Commit transaction
    $conn->commit();
    
    // Prepare success response
    $response['success'] = true;
    $response['message'] = "Inventory updated successfully for $productName";
    $response['product_id'] = $productId;
    $response['product_name'] = $productName;
    $response['previous_stock'] = $currentStock;
    $response['new_stock'] = $newStock;
    $response['quantity_deducted'] = $quantity;
    $response['batch_tracking'] = $batchTracking == 1 ? true : false;
    
} catch (Exception $e) {
    // Rollback transaction on error
    $conn->rollback();
    $response['message'] = 'Error: ' . $e->getMessage();
    error_log("Error in batch deduction: " . $e->getMessage());
}

// Return response
echo json_encode($response);
?>