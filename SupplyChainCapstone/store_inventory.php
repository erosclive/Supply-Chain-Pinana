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
      // Get tracking type - explicitly check for 'normal' or 'batch'
      $tracking_type = isset($_POST['tracking_type']) ? $_POST['tracking_type'] : 'normal';
      
      // Get common form data
      $product_id = $_POST['productID'] ?? '';
      $product_name = $_POST['productName'] ?? '';
      $category = $_POST['category'] ?? '';
      $price = $_POST['price'] ?? 0;
      
      // Validate required fields
      if (empty($product_id) || empty($product_name) || empty($category) || empty($price)) {
          throw new Exception("Required fields cannot be empty");
      }
      
      // Handle file upload for product photo
      $product_photo = '';
      if (isset($_FILES['productPhoto']) && $_FILES['productPhoto']['error'] === UPLOAD_ERR_OK) {
          $upload_dir = 'uploads/';
          
          // Create directory if it doesn't exist
          if (!file_exists($upload_dir)) {
              mkdir($upload_dir, 0777, true);
          }
          
          // Generate unique filename
          $file_extension = pathinfo($_FILES['productPhoto']['name'], PATHINFO_EXTENSION);
          $filename = uniqid('product_') . '.' . $file_extension;
          $target_file = $upload_dir . $filename;
          
          // Move uploaded file
          if (move_uploaded_file($_FILES['productPhoto']['tmp_name'], $target_file)) {
              $product_photo = $target_file;
          } else {
              throw new Exception("Failed to upload image.");
          }
      }
      
      // Begin transaction
      mysqli_begin_transaction($conn);
      
      // Different handling based on tracking type
      if ($tracking_type === 'normal') {
          // Normal tracking - single product entry
          $stocks = $_POST['stocks'] ?? 0;
          $manufacturing_date = date('Y-m-d'); // Today's date
          
          // Determine status based on stock level
          $status = 'Out of Stock';
          if ($stocks > 20) {
              $status = 'In Stock';
          } elseif ($stocks > 0) {
              $status = 'Low Stock';
          }
          
          // Insert product - explicitly set batch_tracking to 0 for normal tracking
          $sql = "INSERT INTO products (product_id, product_photo, product_name, category, stocks, price, status, batch_tracking) 
                  VALUES (?, ?, ?, ?, ?, ?, ?, 0)";
          
          $stmt = mysqli_prepare($conn, $sql);
          
          if (!$stmt) {
              throw new Exception("Prepare statement failed: " . mysqli_error($conn));
          }
          
          mysqli_stmt_bind_param(
              $stmt, 
              "ssssdss", 
              $product_id, 
              $product_photo, 
              $product_name, 
              $category, 
              $stocks, 
              $price, 
              $status
          );
          
          if (!mysqli_stmt_execute($stmt)) {
              throw new Exception("Error executing statement: " . mysqli_stmt_error($stmt));
          }
          
          $product_insert_id = mysqli_insert_id($conn);
          mysqli_stmt_close($stmt);
          
      } else {
          // Batch tracking
          // Insert product with batch tracking enabled
          $sql = "INSERT INTO products (product_id, product_photo, product_name, category, stocks, price, status, batch_tracking) 
                  VALUES (?, ?, ?, ?, 0, ?, 'Out of Stock', 1)";
          
          $stmt = mysqli_prepare($conn, $sql);
          
          if (!$stmt) {
              throw new Exception("Prepare statement failed: " . mysqli_error($conn));
          }
          
          mysqli_stmt_bind_param(
              $stmt, 
              "ssssd", 
              $product_id, 
              $product_photo, 
              $product_name, 
              $category, 
              $price
          );
          
          if (!mysqli_stmt_execute($stmt)) {
              throw new Exception("Error executing statement: " . mysqli_stmt_error($stmt));
          }
          
          $product_insert_id = mysqli_insert_id($conn);
          mysqli_stmt_close($stmt);
          
          // Get batch details
          $batch_code = $_POST['batchCode'] ?? '';
          $quantity = $_POST['quantity'] ?? 0;
          $manufacturing_date = $_POST['manufacturingDate'] ?? date('Y-m-d');
          $expiration_date = $_POST['expirationDate'] ?? '';
          // Set default unit cost to 0 since we removed the field
          $unit_cost = 0;
          
          // Validate batch details
          if (empty($batch_code) || empty($quantity) || empty($expiration_date)) {
              throw new Exception("Batch details are required");
          }
          
          // Insert batch
          $batch_sql = "INSERT INTO product_batches (product_id, batch_code, quantity, expiration_date, manufacturing_date, unit_cost) 
                        VALUES (?, ?, ?, ?, ?, ?)";
          
          $batch_stmt = mysqli_prepare($conn, $batch_sql);
          
          if (!$batch_stmt) {
              throw new Exception("Prepare batch statement failed: " . mysqli_error($conn));
          }
          
          mysqli_stmt_bind_param(
              $batch_stmt, 
              "ssdssd", 
              $product_id, 
              $batch_code, 
              $quantity, 
              $expiration_date, 
              $manufacturing_date, 
              $unit_cost
          );
          
          if (!mysqli_stmt_execute($batch_stmt)) {
              throw new Exception("Error executing batch statement: " . mysqli_stmt_error($batch_stmt));
          }
          
          mysqli_stmt_close($batch_stmt);
          
          // Update product stocks and status
          $update_sql = "UPDATE products SET stocks = ?, status = ? WHERE id = ?";
          
          $status = 'Out of Stock';
          if ($quantity > 20) {
              $status = 'In Stock';
          } elseif ($quantity > 0) {
              $status = 'Low Stock';
          }
          
          $update_stmt = mysqli_prepare($conn, $update_sql);
          
          if (!$update_stmt) {
              throw new Exception("Prepare update statement failed: " . mysqli_error($conn));
          }
          
          mysqli_stmt_bind_param(
              $update_stmt, 
              "dsi", 
              $quantity, 
              $status, 
              $product_insert_id
          );
          
          if (!mysqli_stmt_execute($update_stmt)) {
              throw new Exception("Error executing update statement: " . mysqli_stmt_error($update_stmt));
          }
          
          mysqli_stmt_close($update_stmt);
      }
      
      // Commit transaction
      mysqli_commit($conn);
      
      echo json_encode([
          'success' => true,
          'message' => 'Product added successfully!',
          'id' => $product_insert_id,
          'tracking_type' => $tracking_type
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
if (isset($conn) && $conn) {
  mysqli_close($conn);
}
?>

