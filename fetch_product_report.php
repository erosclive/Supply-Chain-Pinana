<?php
// Set headers for JSON response
header('Content-Type: application/json');

// Include database connection
require_once 'db_connection.php';

// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Check database connection
if (!$conn) {
  echo json_encode([
      'success' => false,
      'error' => 'Database connection failed: ' . mysqli_connect_error()
  ]);
  exit;
}

// Get parameters
$startDate = isset($_GET['start_date']) ? $_GET['start_date'] : date('Y-m-d', strtotime('-30 days'));
$endDate = isset($_GET['end_date']) ? $_GET['end_date'] : date('Y-m-d');
$categoryFilter = isset($_GET['category']) ? $_GET['category'] : 'all';

// Calculate previous period for trend calculation
$daysDiff = (strtotime($endDate) - strtotime($startDate)) / (60 * 60 * 24);
$prevStartDate = date('Y-m-d', strtotime($startDate . ' -' . $daysDiff . ' days'));
$prevEndDate = date('Y-m-d', strtotime($endDate . ' -' . $daysDiff . ' days'));

try {
  // Initialize response array
  $response = [
      'success' => true,
      'top_products' => [],
      'product_revenue' => [],
      'products' => []
  ];

  // 1. Get top products by units sold
  $topProductsQuery = "SELECT 
                        p.product_name,
                        SUM(ti.quantity) as units_sold
                      FROM pos_transaction_items ti
                      JOIN products p ON ti.product_id = p.product_id
                      JOIN pos_transactions t ON ti.transaction_id = t.transaction_id
                      WHERE DATE(t.transaction_date) BETWEEN ? AND ?
                      AND t.status = 'completed'";
  
  // Apply category filter
  if ($categoryFilter !== 'all') {
      $topProductsQuery .= " AND p.category = ?";
  }
  
  $topProductsQuery .= " GROUP BY p.product_id
                        ORDER BY units_sold DESC
                        LIMIT 5";
  
  $stmt = mysqli_prepare($conn, $topProductsQuery);
  
  if ($categoryFilter !== 'all') {
      mysqli_stmt_bind_param($stmt, 'sss', $startDate, $endDate, $categoryFilter);
  } else {
      mysqli_stmt_bind_param($stmt, 'ss', $startDate, $endDate);
  }
  
  mysqli_stmt_execute($stmt);
  $topProductsResult = mysqli_stmt_get_result($stmt);
  
  if (!$topProductsResult) {
      throw new Exception("Error executing top products query: " . mysqli_error($conn));
  }
  
  $topProductsLabels = [];
  $topProductsValues = [];
  
  while ($row = mysqli_fetch_assoc($topProductsResult)) {
      $topProductsLabels[] = $row['product_name'];
      $topProductsValues[] = (int)$row['units_sold'];
  }
  
  // If no top products found, provide default data
  if (empty($topProductsLabels)) {
      $topProductsLabels = ['No Data'];
      $topProductsValues = [0];
  }
  
  // Set top products data in response
  $response['top_products'] = [
      'labels' => $topProductsLabels,
      'values' => $topProductsValues
  ];

  // 2. Get top products by revenue
  $revenueQuery = "SELECT 
                    p.product_name,
                    SUM(ti.total_price) as revenue
                  FROM pos_transaction_items ti
                  JOIN products p ON ti.product_id = p.product_id
                  JOIN pos_transactions t ON ti.transaction_id = t.transaction_id
                  WHERE DATE(t.transaction_date) BETWEEN ? AND ?
                  AND t.status = 'completed'";
  
  // Apply category filter
  if ($categoryFilter !== 'all') {
      $revenueQuery .= " AND p.category = ?";
  }
  
  $revenueQuery .= " GROUP BY p.product_id
                    ORDER BY revenue DESC
                    LIMIT 5";
  
  $stmt = mysqli_prepare($conn, $revenueQuery);
  
  if ($categoryFilter !== 'all') {
      mysqli_stmt_bind_param($stmt, 'sss', $startDate, $endDate, $categoryFilter);
  } else {
      mysqli_stmt_bind_param($stmt, 'ss', $startDate, $endDate);
  }
  
  mysqli_stmt_execute($stmt);
  $revenueResult = mysqli_stmt_get_result($stmt);
  
  if (!$revenueResult) {
      throw new Exception("Error executing revenue query: " . mysqli_error($conn));
  }
  
  $revenueLabels = [];
  $revenueValues = [];
  
  while ($row = mysqli_fetch_assoc($revenueResult)) {
      $revenueLabels[] = $row['product_name'];
      $revenueValues[] = (float)$row['revenue'];
  }
  
  // If no revenue data found, provide default data
  if (empty($revenueLabels)) {
      $revenueLabels = ['No Data'];
      $revenueValues = [0];
  }
  
  // Set product revenue data in response
  $response['product_revenue'] = [
      'labels' => $revenueLabels,
      'values' => $revenueValues
  ];

  // 3. Get all products with sales data
  $productsQuery = "SELECT 
                    p.product_id,
                    p.product_name,
                    p.category,
                    IFNULL(SUM(ti.quantity), 0) as units_sold,
                    IFNULL(SUM(ti.total_price), 0) as revenue
                  FROM products p
                  LEFT JOIN pos_transaction_items ti ON p.product_id = ti.product_id
                  LEFT JOIN pos_transactions t ON ti.transaction_id = t.transaction_id AND DATE(t.transaction_date) BETWEEN ? AND ? AND t.status = 'completed'";
  
  // Apply category filter
  if ($categoryFilter !== 'all') {
      $productsQuery .= " WHERE p.category = ?";
  }
  
  $productsQuery .= " GROUP BY p.product_id
                      ORDER BY revenue DESC";
  
  $stmt = mysqli_prepare($conn, $productsQuery);
  
  if ($categoryFilter !== 'all') {
      mysqli_stmt_bind_param($stmt, 'sss', $startDate, $endDate, $categoryFilter);
  } else {
      mysqli_stmt_bind_param($stmt, 'ss', $startDate, $endDate);
  }
  
  mysqli_stmt_execute($stmt);
  $productsResult = mysqli_stmt_get_result($stmt);
  
  if (!$productsResult) {
      throw new Exception("Error executing products query: " . mysqli_error($conn));
  }
  
  $products = [];
  
  while ($row = mysqli_fetch_assoc($productsResult)) {
      // Get previous period data for trend calculation
      $prevQuery = "SELECT 
                    IFNULL(SUM(ti.quantity), 0) as prev_units_sold,
                    IFNULL(SUM(ti.total_price), 0) as prev_revenue
                  FROM pos_transaction_items ti
                  JOIN pos_transactions t ON ti.transaction_id = t.transaction_id
                  WHERE ti.product_id = ?
                  AND DATE(t.transaction_date) BETWEEN ? AND ?
                  AND t.status = 'completed'";
      
      $prevStmt = mysqli_prepare($conn, $prevQuery);
      mysqli_stmt_bind_param($prevStmt, 'sss', $row['product_id'], $prevStartDate, $prevEndDate);
      mysqli_stmt_execute($prevStmt);
      $prevResult = mysqli_stmt_get_result($prevStmt);
      
      if (!$prevResult) {
          throw new Exception("Error executing previous period query: " . mysqli_error($conn));
      }
      
      $prevData = mysqli_fetch_assoc($prevResult);
      
      // Calculate trend
      $trend = 0;
      if ($prevData && $prevData['prev_revenue'] > 0) {
          $trend = (($row['revenue'] - $prevData['prev_revenue']) / $prevData['prev_revenue']) * 100;
      }
      
      $products[] = [
          'product_id' => $row['product_id'],
          'product_name' => $row['product_name'],
          'category' => $row['category'],
          'units_sold' => (int)$row['units_sold'],
          'revenue' => (float)$row['revenue'],
          'trend' => round($trend, 1)
      ];
  }
  
  // Set products data in response
  $response['products'] = $products;

  // Return response as JSON
  echo json_encode($response);
} catch (Exception $e) {
  // Return error response
  echo json_encode([
      'success' => false,
      'message' => $e->getMessage()
  ]);
}

// Close connection
mysqli_close($conn);
?>

