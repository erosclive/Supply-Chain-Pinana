<?php
// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Set headers for JSON response
header('Content-Type: application/json');

// Include database connection
require_once 'db_connection.php';

// Check database connection
if (!$conn) {
  echo json_encode([
      'success' => false,
      'error' => 'Database connection failed: ' . mysqli_connect_error()
  ]);
  exit;
}

// Check if the form was submitted
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  echo json_encode([
      'success' => false,
      'error' => 'Invalid request method'
  ]);
  exit;
}

try {
  // Get batch ID and product ID
  $batch_id = isset($_POST['batch_id']) ? intval($_POST['batch_id']) : 0;
  $product_id = $_POST['product_id'] ?? '';
  
  // Validate required fields
  if ($batch_id <= 0 || empty($product_id)) {
    throw new Exception("Batch ID and Product ID are required");
  }
  
  // Begin transaction
  mysqli_begin_transaction($conn);
  
  // Get current batch quantity to update product stock
  $get_quantity_sql = "SELECT quantity FROM product_batches WHERE batch_id = ?";
  $get_quantity_stmt = mysqli_prepare($conn, $get_quantity_sql);
  
  if (!$get_quantity_stmt) {
    throw new Exception("Prepare get quantity statement failed: " . mysqli_error($conn));
  }
  
  mysqli_stmt_bind_param($get_quantity_stmt, "i", $batch_id);
  mysqli_stmt_execute($get_quantity_stmt);
  mysqli_stmt_bind_result($get_quantity_stmt, $batch_quantity);
  
  if (!mysqli_stmt_fetch($get_quantity_stmt)) {
    mysqli_stmt_close($get_quantity_stmt);
    throw new Exception("Batch not found");
  }
  
  mysqli_stmt_close($get_quantity_stmt);
  
  // Delete the batch
  $delete_sql = "DELETE FROM product_batches WHERE batch_id = ?";
  $delete_stmt = mysqli_prepare($conn, $delete_sql);
  
  if (!$delete_stmt) {
    throw new Exception("Prepare delete statement failed: " . mysqli_error($conn));
  }
  
  mysqli_stmt_bind_param($delete_stmt, "i", $batch_id);
  
  if (!mysqli_stmt_execute($delete_stmt)) {
    throw new Exception("Error executing delete statement: " . mysqli_stmt_error($delete_stmt));
  }
  
  mysqli_stmt_close($delete_stmt);
  
  // Update product stock (subtract the batch quantity)
  $quantity_change = -$batch_quantity; // Negative value to subtract
  
  $update_sql = "UPDATE products SET 
                  stocks = stocks + ?,
                  status = CASE 
                      WHEN (stocks + ?) > 20 THEN 'In Stock'
                      WHEN (stocks + ?) > 0 THEN 'Low Stock'
                      ELSE 'Out of Stock'
                  END,
                  updated_at = NOW()
                WHERE product_id = ?";
  
  $update_stmt = mysqli_prepare($conn, $update_sql);
  
  if (!$update_stmt) {
    throw new Exception("Prepare update statement failed: " . mysqli_error($conn));
  }
  
  mysqli_stmt_bind_param($update_stmt, "iiis", $quantity_change, $quantity_change, $quantity_change, $product_id);
  
  if (!mysqli_stmt_execute($update_stmt)) {
    throw new Exception("Error executing update statement: " . mysqli_stmt_error($update_stmt));
  }
  
  mysqli_stmt_close($update_stmt);
  
  // Update product expiration date to the earliest remaining batch expiration date
  $update_expiry_sql = "UPDATE products p
                        SET p.expiration_date = (
                          SELECT MIN(b.expiration_date)
                          FROM product_batches b
                          WHERE b.product_id = p.product_id
                          AND b.quantity > 0
                        )
                        WHERE p.product_id = ?";
  
  $update_expiry_stmt = mysqli_prepare($conn, $update_expiry_sql);
  
  if (!$update_expiry_stmt) {
    throw new Exception("Prepare update expiry statement failed: " . mysqli_error($conn));
  }
  
  mysqli_stmt_bind_param($update_expiry_stmt, "s", $product_id);
  
  if (!mysqli_stmt_execute($update_expiry_stmt)) {
    throw new Exception("Error executing update expiry statement: " . mysqli_stmt_error($update_expiry_stmt));
  }
  
  mysqli_stmt_close($update_expiry_stmt);
  
  // Check if there are any batches left for this product
  $check_batches_sql = "SELECT COUNT(*) FROM product_batches WHERE product_id = ?";
  $check_batches_stmt = mysqli_prepare($conn, $check_batches_sql);
  
  if (!$check_batches_stmt) {
    throw new Exception("Prepare check batches statement failed: " . mysqli_error($conn));
  }
  
  mysqli_stmt_bind_param($check_batches_stmt, "s", $product_id);
  mysqli_stmt_execute($check_batches_stmt);
  mysqli_stmt_bind_result($check_batches_stmt, $batch_count);
  mysqli_stmt_fetch($check_batches_stmt);
  mysqli_stmt_close($check_batches_stmt);
  
  // If no batches left, update batch_tracking to 0
  /*
  if ($batch_count == 0) {
    $update_tracking_sql = "UPDATE products SET batch_tracking = 0 WHERE product_id = ?";
    $update_tracking_stmt = mysqli_prepare($conn, $update_tracking_sql);
    
    if (!$update_tracking_stmt) {
      throw new Exception("Prepare update tracking statement failed: " . mysqli_error($conn));
    }
    
    mysqli_stmt_bind_param($update_tracking_stmt, "s", $product_id);
    
    if (!mysqli_stmt_execute($update_tracking_stmt)) {
      throw new Exception("Error executing update tracking statement: " . mysqli_stmt_error($update_tracking_stmt));
    }
    
    mysqli_stmt_close($update_tracking_stmt);
  }
  */
  
  // Commit transaction
  mysqli_commit($conn);
  
  echo json_encode([
    'success' => true,
    'message' => 'Batch deleted successfully'
  ]);
  
} catch (Exception $e) {
  // Rollback transaction on error
  mysqli_rollback($conn);
  
  echo json_encode([
    'success' => false,
    'error' => $e->getMessage()
  ]);
}

// Close connection
mysqli_close($conn);
?>