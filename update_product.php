<?php
// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Include database connection
require_once 'db_connection.php';

// Set headers for JSON response
header('Content-Type: application/json');

// Check if the form was submitted
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  try {
    // Get form data
    $id = $_POST['id'] ?? '';
    $productID = $_POST['productID'] ?? '';
    $productName = $_POST['productName'] ?? '';
    $category = $_POST['category'] ?? '';
    $stocks = $_POST['stocks'] ?? 0;
    $price = $_POST['price'] ?? 0;
    
    // Get batch tracking value - CRITICAL FIX
    // Log all POST data for debugging
    error_log("POST data: " . print_r($_POST, true));
    
    // Get batch tracking value from the hidden input
    $batchTracking = isset($_POST['batchTracking']) ? intval($_POST['batchTracking']) : 0;
    
    // Log the batch tracking value
    error_log("Batch tracking value: " . $batchTracking);
    
    // Validate required fields
    if (empty($id) || empty($productID) || empty($productName) || empty($category)) {
      throw new Exception("Required fields cannot be empty");
    }
    
    // Begin transaction
    mysqli_begin_transaction($conn);
    
    // If product is batch tracked, get current stock value from database instead of form
    if ($batchTracking == 1) {
      $stockSql = "SELECT stocks FROM products WHERE id = ?";
      $stockStmt = mysqli_prepare($conn, $stockSql);
      
      if ($stockStmt) {
        mysqli_stmt_bind_param($stockStmt, "i", $id);
        mysqli_stmt_execute($stockStmt);
        mysqli_stmt_bind_result($stockStmt, $currentStocks);
        mysqli_stmt_fetch($stockStmt);
        mysqli_stmt_close($stockStmt);
        
        // Use current stock value from database
        $stocks = $currentStocks;
        
        // Log the stock value
        error_log("Using database stock value for batch-tracked product: " . $stocks);
      }
    }
    
    // Determine status based on stock level
    $status = 'Out of Stock';
    if ($stocks > 20) {
      $status = 'In Stock';
    } elseif ($stocks > 0) {
      $status = 'Low Stock';
    }
    
    // Handle file upload for product photo
    $productPhotoSql = '';
    if (isset($_FILES['productPhoto']) && $_FILES['productPhoto']['error'] === UPLOAD_ERR_OK) {
      $uploadDir = 'uploads/';
      
      // Create directory if it doesn't exist
      if (!file_exists($uploadDir)) {
        mkdir($uploadDir, 0777, true);
      }
      
      // Generate unique filename
      $fileExtension = pathinfo($_FILES['productPhoto']['name'], PATHINFO_EXTENSION);
      $filename = uniqid('product_') . '.' . $fileExtension;
      $targetFile = $uploadDir . $filename;
      
      // Move uploaded file
      if (move_uploaded_file($_FILES['productPhoto']['tmp_name'], $targetFile)) {
        $productPhotoSql = ", product_photo = '$targetFile'";
      } else {
        throw new Exception("Failed to upload image.");
      }
    }
    
    // Update product - CRITICAL FIX: Ensure batch_tracking is properly set
    $sql = "UPDATE products SET 
            product_name = ?, 
            category = ?, 
            stocks = ?, 
            price = ?, 
            status = ?,
            batch_tracking = ?
            $productPhotoSql
            WHERE id = ?";
    
    $stmt = mysqli_prepare($conn, $sql);
    
    if (!$stmt) {
      throw new Exception("Prepare statement failed: " . mysqli_error($conn));
    }
    
    // Log the values being bound to the statement
    error_log("Binding values: name=$productName, category=$category, stocks=$stocks, price=$price, status=$status, batch_tracking=$batchTracking, id=$id");
    
    mysqli_stmt_bind_param(
      $stmt, 
      "ssdssii", 
      $productName, 
      $category, 
      $stocks, 
      $price, 
      $status,
      $batchTracking,
      $id
    );
    
    if (!mysqli_stmt_execute($stmt)) {
      throw new Exception("Error executing statement: " . mysqli_stmt_error($stmt));
    }
    
    mysqli_stmt_close($stmt);
    
    // If batch tracking is disabled, remove any existing batches
    if ($batchTracking == 0) {
      $deleteBatchesSql = "DELETE FROM product_batches WHERE product_id = ?";
      $deleteBatchesStmt = mysqli_prepare($conn, $deleteBatchesSql);
      
      if ($deleteBatchesStmt) {
        mysqli_stmt_bind_param($deleteBatchesStmt, "s", $productID);
        mysqli_stmt_execute($deleteBatchesStmt);
        mysqli_stmt_close($deleteBatchesStmt);
      }
    }
    
    // Commit transaction
    mysqli_commit($conn);
    
    echo json_encode([
      'success' => true,
      'message' => 'Product updated successfully!'
    ]);
    
  } catch (Exception $e) {
    // Rollback transaction on error
    mysqli_rollback($conn);
    
    echo json_encode([
      'success' => false,
      'error' => $e->getMessage()
    ]);
  }
} else {
  echo json_encode([
    'success' => false,
    'error' => 'Invalid request method'
  ]);
}

// Close connection
mysqli_close($conn);
?>

