<?php
// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Check if mysqli extension is loaded
if (!extension_loaded('mysqli')) {
    die('The mysqli extension is not loaded. Please enable it in your php.ini file.');
}

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

// Fetch batches for the product
$sql = "SELECT 
          b.batch_id,
          b.product_id,
          b.batch_code,
          b.quantity,
          b.manufacturing_date,
          b.expiration_date,
          b.unit_cost,
          b.created_at,
          b.updated_at,
          DATEDIFF(b.expiration_date, CURDATE()) as days_until_expiry,
          CASE 
              WHEN b.expiration_date < CURDATE() THEN 'expired'
              WHEN DATEDIFF(b.expiration_date, CURDATE()) <= 30 THEN 'expiring-soon'
              ELSE 'good'
          END as expiry_status
      FROM 
          product_batches b
      WHERE 
          b.product_id = ?
      ORDER BY 
          b.expiration_date ASC";

$stmt = mysqli_prepare($conn, $sql);

if (!$stmt) {
  echo json_encode([
      'success' => false,
      'error' => 'Prepare statement failed: ' . mysqli_error($conn)
  ]);
  exit;
}

mysqli_stmt_bind_param($stmt, "s", $product_id);
mysqli_stmt_execute($stmt);
$result = mysqli_stmt_get_result($stmt);

if (!$result) {
  echo json_encode([
      'success' => false,
      'error' => 'Error fetching batches: ' . mysqli_error($conn)
  ]);
  exit;
}

// Fetch all batches
$batches = [];
while ($row = mysqli_fetch_assoc($result)) {
  // Format dates for proper display
  if (isset($row['manufacturing_date']) && $row['manufacturing_date'] !== '0000-00-00') {
    // Keep the date as is, it will be formatted on the client side
  } else {
    // If manufacturing date is missing or invalid, set to creation date or today
    if (isset($row['created_at']) && $row['created_at'] !== '0000-00-00 00:00:00') {
      $row['manufacturing_date'] = date('Y-m-d', strtotime($row['created_at']));
    } else {
      $row['manufacturing_date'] = date('Y-m-d');
    }
  }
  
  if (isset($row['expiration_date']) && $row['expiration_date'] !== '0000-00-00') {
    // Keep the date as is, it will be formatted on the client side
  } else {
    // If expiration date is missing or invalid, generate it from manufacturing date
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

// Return JSON response
echo json_encode([
  'success' => true,
  'batches' => $batches,
  'product_id' => $product_id
]);

// Close statement and connection
mysqli_stmt_close($stmt);
mysqli_close($conn);
?>

