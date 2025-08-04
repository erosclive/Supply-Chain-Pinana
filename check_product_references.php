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
$productId = isset($_GET['productId']) ? $_GET['productId'] : '';

if (empty($productId)) {
  echo json_encode([
    'success' => false,
    'error' => 'Product ID is required'
  ]);
  exit;
}

try {
  // Initialize references counter
  $references = [
    'orders' => 0,
    'orderItems' => 0,
    'batches' => 0,
    'other' => []
  ];
  
  // Check for references in orders table (if it exists)
  $checkOrdersTable = mysqli_query($conn, "SHOW TABLES LIKE 'orders'");
  if (mysqli_num_rows($checkOrdersTable) > 0) {
    $ordersSql = "SELECT COUNT(*) as count FROM orders WHERE product_id = ?";
    $ordersStmt = mysqli_prepare($conn, $ordersSql);
    
    if ($ordersStmt) {
      mysqli_stmt_bind_param($ordersStmt, "s", $productId);
      mysqli_stmt_execute($ordersStmt);
      $ordersResult = mysqli_stmt_get_result($ordersStmt);
      $ordersRow = mysqli_fetch_assoc($ordersResult);
      $references['orders'] = $ordersRow['count'];
      mysqli_stmt_close($ordersStmt);
    }
  }
  
  // Check for references in order_items table (if it exists)
  $checkOrderItemsTable = mysqli_query($conn, "SHOW TABLES LIKE 'order_items'");
  if (mysqli_num_rows($checkOrderItemsTable) > 0) {
    $orderItemsSql = "SELECT COUNT(*) as count FROM order_items WHERE product_id = ?";
    $orderItemsStmt = mysqli_prepare($conn, $orderItemsSql);
    
    if ($orderItemsStmt) {
      mysqli_stmt_bind_param($orderItemsStmt, "s", $productId);
      mysqli_stmt_execute($orderItemsStmt);
      $orderItemsResult = mysqli_stmt_get_result($orderItemsStmt);
      $orderItemsRow = mysqli_fetch_assoc($orderItemsResult);
      $references['orderItems'] = $orderItemsRow['count'];
      mysqli_stmt_close($orderItemsStmt);
    }
  }
  
  // Check for references in product_batches table
  $batchesSql = "SELECT COUNT(*) as count FROM product_batches WHERE product_id = ?";
  $batchesStmt = mysqli_prepare($conn, $batchesSql);
  
  if ($batchesStmt) {
    mysqli_stmt_bind_param($batchesStmt, "s", $productId);
    mysqli_stmt_execute($batchesStmt);
    $batchesResult = mysqli_stmt_get_result($batchesStmt);
    $batchesRow = mysqli_fetch_assoc($batchesResult);
    $references['batches'] = $batchesRow['count'];
    mysqli_stmt_close($batchesStmt);
  }
  
  // Check for any other tables that might reference products
  // This is a more generic approach to find foreign key constraints
  $tablesSql = "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES 
                WHERE TABLE_SCHEMA = DATABASE() 
                AND TABLE_NAME NOT IN ('products', 'orders', 'order_items', 'product_batches')";
  $tablesResult = mysqli_query($conn, $tablesSql);
  
  if ($tablesResult) {
    while ($tableRow = mysqli_fetch_assoc($tablesResult)) {
      $tableName = $tableRow['TABLE_NAME'];
      
      // Check if this table has a product_id column
      $columnsSql = "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
                    WHERE TABLE_SCHEMA = DATABASE() 
                    AND TABLE_NAME = '$tableName' 
                    AND COLUMN_NAME = 'product_id'";
      $columnsResult = mysqli_query($conn, $columnsSql);
      
      if ($columnsResult && mysqli_num_rows($columnsResult) > 0) {
        // This table has a product_id column, check for references
        $refSql = "SELECT COUNT(*) as count FROM $tableName WHERE product_id = ?";
        $refStmt = mysqli_prepare($conn, $refSql);
        
        if ($refStmt) {
          mysqli_stmt_bind_param($refStmt, "s", $productId);
          mysqli_stmt_execute($refStmt);
          $refResult = mysqli_stmt_get_result($refStmt);
          $refRow = mysqli_fetch_assoc($refResult);
          
          if ($refRow['count'] > 0) {
            $references['other'][] = [
              'table' => $tableName,
              'count' => $refRow['count']
            ];
          }
          
          mysqli_stmt_close($refStmt);
        }
      }
    }
  }
  
  // Determine if the product can be deleted
  $canDelete = ($references['orders'] == 0 && 
                $references['orderItems'] == 0 && 
                $references['batches'] == 0 && 
                empty($references['other']));
  
  // Return the result
  echo json_encode([
    'success' => true,
    'canDelete' => $canDelete,
    'references' => $references
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
