<?php
// update_batch_tracking.php
// This file updates the complete_order.php script to handle batch tracking

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
if (!isset($data['order_id'])) {
    $response['message'] = 'Order ID is required';
    echo json_encode($response);
    exit;
}

$order_id = intval($data['order_id']);

try {
    // Start transaction
    $conn->begin_transaction();
    
    // Get current order status
    $statusQuery = "SELECT status FROM retailer_orders WHERE order_id = ?";
    $statusStmt = $conn->prepare($statusQuery);
    $statusStmt->bind_param('i', $order_id);
    $statusStmt->execute();
    $statusResult = $statusStmt->get_result();
    
    if ($statusResult->num_rows === 0) {
        throw new Exception('Order not found');
    }
    
    $orderData = $statusResult->fetch_assoc();
    $currentStatus = $orderData['status'];
    
    // Only proceed if order is not already completed
    if ($currentStatus === 'completed') {
        throw new Exception('Order is already completed');
    }
    
    // Update order status to completed
    $updateQuery = "UPDATE retailer_orders SET status = 'completed', updated_at = NOW() WHERE order_id = ?";
    $updateStmt = $conn->prepare($updateQuery);
    $updateStmt->bind_param('i', $order_id);
    
    if (!$updateStmt->execute()) {
        throw new Exception('Failed to update order status: ' . $conn->error);
    }
    
    // Add status history entry
    $historyQuery = "INSERT INTO retailer_order_status_history (order_id, status, notes, created_at) 
                    VALUES (?, 'completed', 'Order completed and inventory updated', NOW())";
    $historyStmt = $conn->prepare($historyQuery);
    $historyStmt->bind_param('i', $order_id);
    
    if (!$historyStmt->execute()) {
        throw new Exception('Failed to add status history: ' . $historyStmt->error);
    }
    
    // Get order items
    $itemsQuery = "SELECT oi.product_id, oi.quantity 
                  FROM retailer_order_items oi 
                  WHERE oi.order_id = ?";
    $itemsStmt = $conn->prepare($itemsQuery);
    $itemsStmt->bind_param('i', $order_id);
    $itemsStmt->execute();
    $itemsResult = $itemsStmt->get_result();
    
    $updatedProducts = [];
    
    // Update inventory for each item
    while ($item = $itemsResult->fetch_assoc()) {
        $productId = $item['product_id'];
        $quantity = $item['quantity'];
        
        // Check if product has batch tracking enabled
        $batchTrackingQuery = "SELECT batch_tracking FROM products WHERE product_id = ?";
        $batchTrackingStmt = $conn->prepare($batchTrackingQuery);
        $batchTrackingStmt->bind_param('s', $productId);
        $batchTrackingStmt->execute();
        $batchTrackingResult = $batchTrackingStmt->get_result();
        $batchTrackingEnabled = false;
        
        if ($batchTrackingResult->num_rows > 0) {
            $productData = $batchTrackingResult->fetch_assoc();
            $batchTrackingEnabled = ($productData['batch_tracking'] == 1);
        }
        
        // Get current stock
        $stockQuery = "SELECT stocks FROM products WHERE product_id = ?";
        $stockStmt = $conn->prepare($stockQuery);
        $stockStmt->bind_param('s', $productId);
        $stockStmt->execute();
        $stockResult = $stockStmt->get_result();
        
        if ($stockResult->num_rows === 0) {
            throw new Exception("Product with ID $productId not found");
        }
        
        $productData = $stockResult->fetch_assoc();
        $currentStock = $productData['stocks'];
        
        // Calculate new stock level
        $newStock = max(0, $currentStock - $quantity);
        
        // Update product stock
        $updateStockQuery = "UPDATE products SET stocks = ?, updated_at = NOW() WHERE product_id = ?";
        $updateStockStmt = $conn->prepare($updateStockQuery);
        $updateStockStmt->bind_param('is', $newStock, $productId);
        
        if (!$updateStockStmt->execute()) {
            throw new Exception("Failed to update stock for product $productId: " . $conn->error);
        }
        
        // Add to list of updated products
        $updatedProducts[] = [
            'product_id' => $productId,
            'previous_stock' => $currentStock,
            'quantity_reduced' => $quantity,
            'new_stock' => $newStock
        ];
        
        // Handle batch tracking if enabled
        $batchDetails = null;
        if ($batchTrackingEnabled) {
            $batchDetails = deductFromBatches($conn, $productId, $quantity);
        }
        
        // Log inventory change
        $logQuery = "INSERT INTO inventory_log (product_id, change_type, quantity, order_id, previous_stock, new_stock, batch_details, created_at) 
                    VALUES (?, 'order_completion', ?, ?, ?, ?, ?, NOW())";
        $logStmt = $conn->prepare($logQuery);
        $changeType = 'order_completion';
        $batchDetailsJson = $batchDetails ? json_encode($batchDetails) : null;
        $logStmt->bind_param('siiiss', $productId, $quantity, $order_id, $currentStock, $newStock, $batchDetailsJson);
        $logStmt->execute();
    }
    
    // Commit transaction
    $conn->commit();
    
    // Prepare success response
    $response['success'] = true;
    $response['message'] = 'Order completed and inventory updated successfully';
    $response['updated_products'] = $updatedProducts;
    
} catch (Exception $e) {
    // Rollback transaction on error
    $conn->rollback();
    $response['message'] = 'Error: ' . $e->getMessage();
    error_log("Error completing order: " . $e->getMessage());
}

// Return response
echo json_encode($response);

/**
 * Deduct quantity from batches using FIFO method
 * 
 * @param mysqli $conn Database connection
 * @param string $productId Product ID
 * @param int $quantity Quantity to deduct
 * @return array Batch deduction details
 */
function deductFromBatches($conn, $productId, $quantity) {
    // Get batches for this product ordered by expiration date (FIFO)
    $batchQuery = "SELECT batch_id, batch_code, quantity, expiration_date 
                  FROM product_batches 
                  WHERE product_id = ? AND quantity > 0
                  ORDER BY 
                    CASE WHEN expiration_date = '0000-00-00' THEN 1 ELSE 0 END,
                    expiration_date ASC,
                    batch_id ASC";
    
    $batchStmt = $conn->prepare($batchQuery);
    $batchStmt->bind_param('s', $productId);
    $batchStmt->execute();
    $batchResult = $batchStmt->get_result();
    
    $remainingQuantity = $quantity;
    $batchDeductions = [];
    
    // Deduct from batches until quantity is fulfilled
    while ($remainingQuantity > 0 && $batch = $batchResult->fetch_assoc()) {
        $batchId = $batch['batch_id'];
        $batchCode = $batch['batch_code'];
        $batchQuantity = $batch['quantity'];
        $expirationDate = $batch['expiration_date'];
        
        // Calculate how much to deduct from this batch
        $deductFromBatch = min($remainingQuantity, $batchQuantity);
        $newBatchQuantity = $batchQuantity - $deductFromBatch;
        
        // Update batch quantity
        $updateBatchQuery = "UPDATE product_batches SET quantity = ? WHERE batch_id = ?";
        $updateBatchStmt = $conn->prepare($updateBatchQuery);
        $updateBatchStmt->bind_param('ii', $newBatchQuantity, $batchId);
        $updateBatchStmt->execute();
        
        // Add to deduction details
        $batchDeductions[] = [
            'batch_id' => $batchId,
            'batch_code' => $batchCode,
            'deducted' => $deductFromBatch,
            'remaining' => $newBatchQuantity,
            'expiration_date' => $expirationDate
        ];
        
        // Reduce remaining quantity
        $remainingQuantity -= $deductFromBatch;
        
        // If all quantity is fulfilled, break the loop
        if ($remainingQuantity <= 0) {
            break;
        }
    }
    
    return $batchDeductions;
}
?>
