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

// Get product ID parameter
$product_id = isset($_GET['product_id']) ? $_GET['product_id'] : '';

if (empty($product_id)) {
  echo json_encode([
      'success' => false,
      'error' => 'Product ID is required'
  ]);
  exit;
}

try {
  // Fetch batches for the product
  $sql = "SELECT * FROM product_batches WHERE product_id = ? ORDER BY created_at DESC";
  $stmt = mysqli_prepare($conn, $sql);
  
  if (!$stmt) {
    throw new Exception("Prepare statement failed: " . mysqli_error($conn));
  }
  
  mysqli_stmt_bind_param($stmt, "s", $product_id);
  mysqli_stmt_execute($stmt);
  $result = mysqli_stmt_get_result($stmt);
  
  if (!$result) {
    throw new Exception("Error fetching batches: " . mysqli_error($conn));
  }
  
  // Get batches
  $batches = [];
  while ($row = mysqli_fetch_assoc($result)) {
    // Format dates properly
    if (isset($row['expiration_date']) && $row['expiration_date'] === '0000-00-00') {
      // If expiration date is invalid, generate it from manufacturing date
      if (isset($row['manufacturing_date']) && $row['manufacturing_date'] !== '0000-00-00') {
        $mfg_date = new DateTime($row['manufacturing_date']);
        $mfg_date->modify('+2 months');
        $row['expiration_date'] = $mfg_date->format('Y-m-d');
      } else {
        // If no manufacturing date, set expiration to 2 months from today
        $today = new DateTime();
        $today->modify('+2 months');
        $row['expiration_date'] = $today->format('Y-m-d');
      }
    }
    
    $batches[] = $row;
  }
  
  mysqli_stmt_close($stmt);
  
  echo json_encode([
    'success' => true,
    'batches' => $batches
  ]);
  
} catch (Exception $e) {
  echo json_encode([
    'success' => false,
    'error' => $e->getMessage()
  ]);
}

// Close connection
mysqli_close($conn);
?>

