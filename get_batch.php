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

// Get batch ID parameter
$batch_id = isset($_GET['batch_id']) ? intval($_GET['batch_id']) : 0;

if ($batch_id <= 0) {
  echo json_encode([
      'success' => false,
      'error' => 'Valid batch ID is required'
  ]);
  exit;
}

try {
  // Fetch batch details
  $sql = "SELECT * FROM product_batches WHERE batch_id = ?";
  $stmt = mysqli_prepare($conn, $sql);
  
  if (!$stmt) {
    throw new Exception("Prepare statement failed: " . mysqli_error($conn));
  }
  
  mysqli_stmt_bind_param($stmt, "i", $batch_id);
  mysqli_stmt_execute($stmt);
  $result = mysqli_stmt_get_result($stmt);
  
  if (!$result) {
    throw new Exception("Error fetching batch: " . mysqli_error($conn));
  }
  
  // Get batch data
  $batch = mysqli_fetch_assoc($result);
  
  if (!$batch) {
    throw new Exception("Batch not found");
  }
  
  // Format dates for proper display
  if (isset($batch['manufacturing_date']) && $batch['manufacturing_date'] !== '0000-00-00') {
    $batch['manufacturing_date'] = date('Y-m-d', strtotime($batch['manufacturing_date']));
  } else {
    // If manufacturing date is missing or invalid, set to today
    $batch['manufacturing_date'] = date('Y-m-d');
  }
  
  if (isset($batch['expiration_date']) && $batch['expiration_date'] !== '0000-00-00') {
    $batch['expiration_date'] = date('Y-m-d', strtotime($batch['expiration_date']));
  } else {
    // If expiration date is missing or invalid, generate it from manufacturing date
    if (!empty($batch['manufacturing_date'])) {
      $mfg_date = new DateTime($batch['manufacturing_date']);
      $mfg_date->modify('+2 months');
      $batch['expiration_date'] = $mfg_date->format('Y-m-d');
    } else {
      // If no manufacturing date, set expiration to 2 months from today
      $today = new DateTime();
      $today->modify('+2 months');
      $batch['expiration_date'] = $today->format('Y-m-d');
    }
  }
  
  mysqli_stmt_close($stmt);
  
  echo json_encode([
    'success' => true,
    'batch' => $batch
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

