<?php
// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Include database connection
require_once 'db_connection.php';

// Function to deduct stock using FIFO (First In, First Out) based on expiration date
function deductStockWithFIFO($conn, $product_id, $quantity_needed) {
    // Start transaction
    mysqli_begin_transaction($conn);
    
    try {
        // Check if product uses batch tracking
        $batch_check_sql = "SELECT batch_tracking FROM products WHERE product_id = ?";
        $batch_check_stmt = mysqli_prepare($conn, $batch_check_sql);
        
        if (!$batch_check_stmt) {
            throw new Exception("Error preparing batch check statement: " . mysqli_error($conn));
        }
        
        mysqli_stmt_bind_param($batch_check_stmt, "s", $product_id);
        mysqli_stmt_execute($batch_check_stmt);
        mysqli_stmt_bind_result($batch_check_stmt, $batch_tracking);
        
        if (!mysqli_stmt_fetch($batch_check_stmt)) {
            throw new Exception("Product not found.");
        }
        
        mysqli_stmt_close($batch_check_stmt);
        
        // If batch tracking is not enabled, simply deduct from the main stock
        if (!$batch_tracking) {
            $update_sql = "UPDATE products 
                          SET stocks = stocks - ?, 
                              updated_at = NOW() 
                          WHERE product_id = ? AND stocks >= ?";
            
            $update_stmt = mysqli_prepare($conn, $update_sql);
            
            if (!$update_stmt) {
                throw new Exception("Error preparing update statement: " . mysqli_error($conn));
            }
            
            mysqli_stmt_bind_param($update_stmt, "isi", $quantity_needed, $product_id, $quantity_needed);
            mysqli_stmt_execute($update_stmt);
            
            if (mysqli_stmt_affected_rows($update_stmt) == 0) {
                throw new Exception("Insufficient stock for product: " . $product_id);
            }
            
            mysqli_stmt_close($update_stmt);
        } else {
            // For batch tracking, deduct from batches starting with earliest expiration date
            $remaining_quantity = $quantity_needed;
            
            // Get batches ordered by expiration date (FIFO)
            $batches_sql = "SELECT batch_id, quantity, expiration_date 
                           FROM product_batches 
                           WHERE product_id = ? AND quantity > 0 
                           ORDER BY expiration_date ASC";
            
            $batches_stmt = mysqli_prepare($conn, $batches_sql);
            
            if (!$batches_stmt) {
                throw new Exception("Error preparing batches statement: " . mysqli_error($conn));
            }
            
            mysqli_stmt_bind_param($batches_stmt, "s", $product_id);
            mysqli_stmt_execute($batches_stmt);
            $batches_result = mysqli_stmt_get_result($batches_stmt);
            
            $batches = [];
            while ($row = mysqli_fetch_assoc($batches_result)) {
                $batches[] = $row;
            }
            
            mysqli_stmt_close($batches_stmt);
            
            // Check if we have enough total stock
            $total_available = array_sum(array_column($batches, 'quantity'));
            
            if ($total_available < $quantity_needed) {
                throw new Exception("Insufficient stock for product: " . $product_id);
            }
            
            // Deduct from batches
            foreach ($batches as $batch) {
                if ($remaining_quantity <= 0) {
                    break;
                }
                
                $batch_id = $batch['batch_id'];
                $available_quantity = $batch['quantity'];
                
                $deduct_quantity = min($remaining_quantity, $available_quantity);
                $new_quantity = $available_quantity - $deduct_quantity;
                
                // Update batch quantity
                $update_batch_sql = "UPDATE product_batches 
                                    SET quantity = ?, 
                                        updated_at = NOW() 
                                    WHERE batch_id = ?";
                
                $update_batch_stmt = mysqli_prepare($conn, $update_batch_sql);
                
                if (!$update_batch_stmt) {
                    throw new Exception("Error preparing batch update statement: " . mysqli_error($conn));
                }
                
                mysqli_stmt_bind_param($update_batch_stmt, "ii", $new_quantity, $batch_id);
                mysqli_stmt_execute($update_batch_stmt);
                mysqli_stmt_close($update_batch_stmt);
                
                $remaining_quantity -= $deduct_quantity;
            }
            
            // Update total stock in products table
            $update_product_sql = "UPDATE products 
                                  SET stocks = stocks - ?, 
                                      updated_at = NOW() 
                                  WHERE product_id = ?";
            
            $update_product_stmt = mysqli_prepare($conn, $update_product_sql);
            
            if (!$update_product_stmt) {
                throw new Exception("Error preparing product update statement: " . mysqli_error($conn));
            }
            
            mysqli_stmt_bind_param($update_product_stmt, "is", $quantity_needed, $product_id);
            mysqli_stmt_execute($update_product_stmt);
            mysqli_stmt_close($update_product_stmt);
        }
        
        // Update product status
        $status_sql = "UPDATE products 
                      SET status = CASE 
                                    WHEN stocks > 20 THEN 'In Stock' 
                                    WHEN stocks > 0 THEN 'Low Stock' 
                                    ELSE 'Out of Stock' 
                                  END 
                      WHERE product_id = ?";
        
        $status_stmt = mysqli_prepare($conn, $status_sql);
        
        if (!$status_stmt) {
            throw new Exception("Error preparing status update statement: " . mysqli_error($conn));
        }
        
        mysqli_stmt_bind_param($status_stmt, "s", $product_id);
        mysqli_stmt_execute($status_stmt);
        mysqli_stmt_close($status_stmt);
        
        // Commit transaction
        mysqli_commit($conn);
        
        return true;
    } catch (Exception $e) {
        // Rollback transaction on error
        mysqli_rollback($conn);
        throw $e;
    }
}

// Example usage in order processing
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        // Get order data
        $order_id = $_POST['orderID'] ?? '';
        $products = isset($_POST['products']) ? json_decode($_POST['products'], true) : [];
        
        if (empty($order_id) || empty($products)) {
            throw new Exception("Order ID and products are required.");
        }
        
        // Process each product in the order
        foreach ($products as $product) {
            $product_id = $product['product_id'];
            $quantity = $product['quantity'];
            
            // Deduct stock using FIFO
            deductStockWithFIFO($conn, $product_id, $quantity);
        }
        
        echo json_encode([
            'success' => true,
            'message' => 'Order processed successfully with FIFO inventory management!'
        ]);
        
    } catch (Exception $e) {
        echo json_encode([
            'success' => false,
            'error' => $e->getMessage()
        ]);
    }
}

// Close connection
if (isset($conn) && $conn) {
    mysqli_close($conn);
}
?>

