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
$product_id = isset($_GET['id']) ? $_GET['id'] : '';

if (empty($product_id)) {
  echo json_encode([
      'success' => false,
      'error' => 'Product ID is required'
  ]);
  exit;
}

// Fetch product details
$sql = "SELECT * FROM products WHERE product_id = ?";
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
      'error' => 'Error fetching product: ' . mysqli_error($conn)
  ]);
  exit;
}

// Check if product exists
if (mysqli_num_rows($result) === 0) {
  echo json_encode([
      'success' => false,
      'error' => 'Product not found'
  ]);
  exit;
}

// Get product data
$product = mysqli_fetch_assoc($result);

// Return JSON response
echo json_encode([
  'success' => true,
  'product' => $product
]);

// Close statement and connection
mysqli_stmt_close($stmt);
mysqli_close($conn);
?>

