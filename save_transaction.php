<?php
// save_transaction.php - Handles saving transaction data from the POS system

// Set headers for JSON response
header('Content-Type: application/json');

// Include database connection
require_once 'db_connection.php';

// Enable error reporting for debugging (remove in production)
error_reporting(E_ALL);
ini_set('display_errors', 1);

try {
    // Get JSON data from request
    $jsonData = file_get_contents('php://input');
    $data = json_decode($jsonData, true);
    
    if (!$data) {
        throw new Exception("Invalid JSON data received");
    }
    
    // Start transaction
    mysqli_begin_transaction($conn);
    
    // 1. Insert into pos_transactions table
    $transactionId = $data['orderNumber'];
    $customerName = mysqli_real_escape_string($conn, $data['customerName']);
    $subtotal = floatval($data['subtotal']);
    $taxAmount = floatval($data['tax']);
    $discountAmount = floatval($data['discount']);
    $totalAmount = floatval($data['total']);
    $cashierId = '001'; // Replace with actual cashier ID from session
    $cashierName = 'Admin User'; // Replace with actual cashier name from session
    
    $transactionQuery = "INSERT INTO pos_transactions 
                        (transaction_id, customer_name, subtotal, tax_amount, 
                         discount_amount, total_amount, cashier_id, cashier_name) 
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
    
    $stmt = mysqli_prepare($conn, $transactionQuery);
    mysqli_stmt_bind_param($stmt, 'ssddddss', 
                          $transactionId, $customerName, $subtotal, 
                          $taxAmount, $discountAmount, $totalAmount, 
                          $cashierId, $cashierName);
    
    if (!mysqli_stmt_execute($stmt)) {
        throw new Exception("Error saving transaction: " . mysqli_stmt_error($stmt));
    }
    
    // 2. Insert transaction items and update inventory using FIFO
    if (!empty($data['items'])) {
        $itemQuery = "INSERT INTO pos_transaction_items 
                     (transaction_id, product_id, product_name, quantity, 
                      unit_price, tax_percent, tax_amount, subtotal, total_price) 
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
        
        $itemStmt = mysqli_prepare($conn, $itemQuery);
        
        foreach ($data['items'] as $item) {
            $productId = $item['id'];
            $productName = mysqli_real_escape_string($conn, $item['name']);
            $quantity = floatval($item['quantity']);
            $unitPrice = floatval($item['price']);
            $taxPercent = 0; // 10% tax rate
            $itemTaxAmount = ($unitPrice * $quantity) * 0.0;
            $itemSubtotal = $unitPrice * $quantity;
            $itemTotal = $itemSubtotal + $itemTaxAmount;
            
            mysqli_stmt_bind_param($itemStmt, 'sssdddddd', 
                                  $transactionId, $productId, $productName, 
                                  $quantity, $unitPrice, $taxPercent, 
                                  $itemTaxAmount, $itemSubtotal, $itemTotal);
            
            if (!mysqli_stmt_execute($itemStmt)) {
                throw new Exception("Error saving transaction item: " . mysqli_stmt_error($itemStmt));
            }
            
            // Check if product uses batch tracking
            $batchCheckQuery = "SELECT batch_tracking FROM products WHERE product_id = ?";
            $batchCheckStmt = mysqli_prepare($conn, $batchCheckQuery);
            mysqli_stmt_bind_param($batchCheckStmt, 's', $productId);
            mysqli_stmt_execute($batchCheckStmt);
            mysqli_stmt_bind_result($batchCheckStmt, $batchTracking);
            mysqli_stmt_fetch($batchCheckStmt);
            mysqli_stmt_close($batchCheckStmt);
            
            if ($batchTracking) {
                // Product uses batch tracking - implement FIFO
                $remainingQuantity = $quantity;
                
                // Get batches ordered by expiration date (FIFO)
                $batchesQuery = "SELECT batch_id, quantity FROM product_batches 
                                WHERE product_id = ? AND quantity > 0 
                                ORDER BY expiration_date ASC";
                $batchesStmt = mysqli_prepare($conn, $batchesQuery);
                mysqli_stmt_bind_param($batchesStmt, 's', $productId);
                mysqli_stmt_execute($batchesStmt);
                $batchesResult = mysqli_stmt_get_result($batchesStmt);
                
                // Deduct from batches using FIFO
                while ($batch = mysqli_fetch_assoc($batchesResult)) {
                    if ($remainingQuantity <= 0) break;
                    
                    $batchId = $batch['batch_id'];
                    $batchQuantity = $batch['quantity'];
                    
                    // Calculate how much to deduct from this batch
                    $deductQuantity = min($remainingQuantity, $batchQuantity);
                    $newBatchQuantity = $batchQuantity - $deductQuantity;
                    
                    // Update batch quantity
                    $updateBatchQuery = "UPDATE product_batches SET quantity = ? WHERE batch_id = ?";
                    $updateBatchStmt = mysqli_prepare($conn, $updateBatchQuery);
                    mysqli_stmt_bind_param($updateBatchStmt, 'di', $newBatchQuantity, $batchId);
                    
                    if (!mysqli_stmt_execute($updateBatchStmt)) {
                        throw new Exception("Error updating batch quantity: " . mysqli_stmt_error($updateBatchStmt));
                    }
                    
                    mysqli_stmt_close($updateBatchStmt);
                    
                    // Reduce remaining quantity
                    $remainingQuantity -= $deductQuantity;
                }
                
                mysqli_stmt_close($batchesStmt);
                
                // If we still have remaining quantity, throw an error
                if ($remainingQuantity > 0) {
                    throw new Exception("Insufficient batch stock for product: $productName");
                }
                
                // Update total product stock
                $updateStockQuery = "UPDATE products SET 
                                    stocks = stocks - ?, 
                                    status = CASE 
                                        WHEN stocks - ? <= 0 THEN 'Out of Stock'
                                        WHEN stocks - ? <= 5 THEN 'Low Stock'
                                        ELSE 'In Stock'
                                    END
                                    WHERE product_id = ?";
                
                $stockStmt = mysqli_prepare($conn, $updateStockQuery);
                mysqli_stmt_bind_param($stockStmt, 'ddds', $quantity, $quantity, $quantity, $productId);
                
                if (!mysqli_stmt_execute($stockStmt)) {
                    throw new Exception("Error updating product stock: " . mysqli_stmt_error($stockStmt));
                }
            } else {
                // Product doesn't use batch tracking - update stock directly
                $updateStockQuery = "UPDATE products SET 
                                    stocks = stocks - ?, 
                                    status = CASE 
                                        WHEN stocks - ? <= 0 THEN 'Out of Stock'
                                        WHEN stocks - ? <= 5 THEN 'Low Stock'
                                        ELSE 'In Stock'
                                    END
                                    WHERE product_id = ?";
                
                $stockStmt = mysqli_prepare($conn, $updateStockQuery);
                mysqli_stmt_bind_param($stockStmt, 'ddds', $quantity, $quantity, $quantity, $productId);
                
                if (!mysqli_stmt_execute($stockStmt)) {
                    throw new Exception("Error updating product stock: " . mysqli_stmt_error($stockStmt));
                }
            }
        }
    }
    
    // 3. Insert payment information
    $paymentMethod = $data['paymentMethod'];
    $amountTendered = floatval($data['amountTendered']);
    $changeAmount = floatval($data['change']);
    
    // Get payment method ID
    $methodQuery = "SELECT payment_method_id FROM pos_payment_methods WHERE method_name = ?";
    $methodStmt = mysqli_prepare($conn, $methodQuery);
    mysqli_stmt_bind_param($methodStmt, 's', $paymentMethod);
    mysqli_stmt_execute($methodStmt);
    $methodResult = mysqli_stmt_get_result($methodStmt);
    
    if ($methodRow = mysqli_fetch_assoc($methodResult)) {
        $paymentMethodId = $methodRow['payment_method_id'];
    } else {
        // Default to cash if method not found
        $paymentMethodId = 1;
    }
    
    $paymentQuery = "INSERT INTO pos_transaction_payments 
                    (transaction_id, payment_method_id, amount, change_amount) 
                    VALUES (?, ?, ?, ?)";
    
    $paymentStmt = mysqli_prepare($conn, $paymentQuery);
    mysqli_stmt_bind_param($paymentStmt, 'sidd', 
                          $transactionId, $paymentMethodId, 
                          $totalAmount, $changeAmount);
    
    if (!mysqli_stmt_execute($paymentStmt)) {
        throw new Exception("Error saving payment information: " . mysqli_stmt_error($paymentStmt));
    }
    
    // Commit transaction
    mysqli_commit($conn);
    
    // Return success response
    echo json_encode([
        'success' => true,
        'message' => 'Transaction saved successfully with FIFO inventory management',
        'transaction_id' => $transactionId
    ]);
    
} catch (Exception $e) {
    // Rollback transaction on error
    if (isset($conn)) {
        mysqli_rollback($conn);
    }
    
    // Return error response
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
} finally {
    // Close connection
    if (isset($conn)) {
        mysqli_close($conn);
    }
}
?>