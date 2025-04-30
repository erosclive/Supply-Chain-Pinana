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

// Check if user is logged in
if (!isset($_SESSION['user_id'])) {
    header('Location: login.php');
    exit;
}

// Function to complete an order
function completeOrder($conn, $orderId) {
    // Initialize response array
    $response = [
        'success' => false,
        'message' => '',
        'updated_products' => []
    ];
    
    try {
        // Start transaction
        $conn->begin_transaction();
        
        // Check if order exists and is not already completed
        $orderQuery = "SELECT * FROM retailer_orders WHERE order_id = ?";
        $orderStmt = $conn->prepare($orderQuery);
        $orderStmt->bind_param('i', $orderId);
        $orderStmt->execute();
        $orderResult = $orderStmt->get_result();
        
        if ($orderResult->num_rows === 0) {
            throw new Exception("Order not found");
        }
        
        $order = $orderResult->fetch_assoc();
        
        if ($order['status'] === 'completed') {
            throw new Exception("Order is already completed");
        }
        
        // Get order items
        $itemsQuery = "SELECT * FROM retailer_order_items WHERE order_id = ?";
        $itemsStmt = $conn->prepare($itemsQuery);
        $itemsStmt->bind_param('i', $orderId);
        $itemsStmt->execute();
        $itemsResult = $itemsStmt->get_result();
        
        if ($itemsResult->num_rows === 0) {
            throw new Exception("No items found for this order");
        }
        
        // Process each order item
        $updatedProducts = [];
        
        while ($item = $itemsResult->fetch_assoc()) {
            $productId = $item['product_id'];
            $quantity = $item['quantity'];
            
            // Get product details
            $productQuery = "SELECT * FROM products WHERE product_id = ?";
            $productStmt = $conn->prepare($productQuery);
            $productStmt->bind_param('s', $productId);
            $productStmt->execute();
            $productResult = $productStmt->get_result();
            
            if ($productResult->num_rows === 0) {
                throw new Exception("Product not found: $productId");
            }
            
            $product = $productResult->fetch_assoc();
            $currentStock = $product['stocks'];
            $batchTracking = $product['batch_tracking'];
            
            // Check if we have enough stock
            if ($currentStock < $quantity) {
                throw new Exception("Insufficient stock for product {$product['product_name']}");
            }
            
            // Calculate new stock level
            $newStock = $currentStock - $quantity;
            
            // If batch tracking is enabled, use FIFO logic
            $batchUpdates = [];
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
                    throw new Exception("No batches available for product {$product['product_name']}");
                }
                
                $remainingToDeduct = $quantity;
                
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
                    $updateBatchQuery = "UPDATE product_batches SET quantity = ?, updated_at = NOW() WHERE batch_id = ?";
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
                    throw new Exception("Insufficient batch quantities for product {$product['product_name']}");
                }
            }
            
            // Update product stock
            $updateStockQuery = "UPDATE products SET stocks = ?, updated_at = NOW() WHERE product_id = ?";
            $updateStockStmt = $conn->prepare($updateStockQuery);
            $updateStockStmt->bind_param('is', $newStock, $productId);
            
            if (!$updateStockStmt->execute()) {
                throw new Exception("Failed to update stock for product {$product['product_name']}: " . $conn->error);
            }
            
            // Log inventory change
            $batchDetailsJson = !empty($batchUpdates) ? json_encode($batchUpdates) : null;
            
            $logQuery = "INSERT INTO inventory_log 
                        (product_id, change_type, quantity, order_id, previous_stock, new_stock, notes, batch_details, created_at) 
                        VALUES (?, 'order_completion', ?, ?, ?, ?, ?, ?, NOW())";
            $logStmt = $conn->prepare($logQuery);
            $notes = $batchTracking == 1 ? "FIFO batch deduction" : "Regular deduction";
            $logStmt->bind_param('siiiiss', $productId, $quantity, $orderId, $currentStock, $newStock, $notes, $batchDetailsJson);
            
            if (!$logStmt->execute()) {
                throw new Exception("Failed to log inventory change: " . $conn->error);
            }
            
            // Add to updated products list
            $updatedProducts[] = [
                'product_id' => $productId,
                'product_name' => $product['product_name'],
                'previous_stock' => $currentStock,
                'new_stock' => $newStock,
                'quantity_reduced' => $quantity,
                'batch_tracking' => $batchTracking == 1 ? "Yes" : "No",
                'batch_updates' => $batchUpdates
            ];
        }
        
        // Update order status
        $updateOrderQuery = "UPDATE retailer_orders SET status = 'completed', updated_at = NOW() WHERE order_id = ?";
        $updateOrderStmt = $conn->prepare($updateOrderQuery);
        $updateOrderStmt->bind_param('i', $orderId);
        
        if (!$updateOrderStmt->execute()) {
            throw new Exception("Failed to update order status: " . $conn->error);
        }
        
        // Add status history entry
        $historyQuery = "INSERT INTO retailer_order_status_history 
                        (order_id, status, notes, created_at) 
                        VALUES (?, 'completed', 'Order completed and inventory updated', NOW())";
        $historyStmt = $conn->prepare($historyQuery);
        $historyStmt->bind_param('i', $orderId);
        
        if (!$historyStmt->execute()) {
            throw new Exception("Failed to add status history: " . $conn->error);
        }
        
        // Commit transaction
        $conn->commit();
        
        // Prepare success response
        $response['success'] = true;
        $response['message'] = "Order #$orderId completed successfully";
        $response['updated_products'] = $updatedProducts;
        
    } catch (Exception $e) {
        // Rollback transaction on error
        $conn->rollback();
        $response['message'] = 'Error: ' . $e->getMessage();
        error_log("Error completing order: " . $e->getMessage());
    }
    
    return $response;
}

// Handle POST request
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Get JSON data from request
    $data = json_decode(file_get_contents('php://input'), true);
    
    // Check if order ID is provided
    if (!isset($data['order_id'])) {
        echo json_encode(['success' => false, 'message' => 'Order ID is required']);
        exit;
    }
    
    $orderId = intval($data['order_id']);
    
    // Complete the order
    $result = completeOrder($conn, $orderId);
    
    // Return JSON response
    header('Content-Type: application/json');
    echo json_encode($result);
    exit;
}
?>