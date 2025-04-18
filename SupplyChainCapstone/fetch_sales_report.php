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
$groupBy = isset($_GET['group_by']) ? $_GET['group_by'] : 'weekly';

// Calculate previous period for growth comparison
$daysDiff = (strtotime($endDate) - strtotime($startDate)) / (60 * 60 * 24);
$prevStartDate = date('Y-m-d', strtotime($startDate . ' -' . $daysDiff . ' days'));
$prevEndDate = date('Y-m-d', strtotime($endDate . ' -' . $daysDiff . ' days'));

try {
  // Initialize response array
  $response = [
      'success' => true,
      'summary' => [],
      'trend' => [],
      'categories' => [],
      'payment_methods' => []
  ];

  // 1. Get sales summary data
  // Current period sales
  $salesQuery = "SELECT 
                  SUM(total_amount) as total_sales,
                  COUNT(*) as total_orders,
                  AVG(total_amount) as avg_order_value,
                  SUM(
                      (SELECT COUNT(*) FROM pos_transaction_items 
                       WHERE transaction_id = t.transaction_id)
                  ) as items_sold
                FROM pos_transactions t
                WHERE DATE(transaction_date) BETWEEN ? AND ?
                AND status = 'completed'";
  
  $stmt = mysqli_prepare($conn, $salesQuery);
  mysqli_stmt_bind_param($stmt, 'ss', $startDate, $endDate);
  mysqli_stmt_execute($stmt);
  $salesResult = mysqli_stmt_get_result($stmt);
  
  if (!$salesResult) {
      throw new Exception("Error executing sales query: " . mysqli_error($conn));
  }
  
  $salesData = mysqli_fetch_assoc($salesResult);
  
  // Previous period sales for growth calculation
  $prevSalesQuery = "SELECT 
                      SUM(total_amount) as prev_total_sales,
                      COUNT(*) as prev_total_orders,
                      AVG(total_amount) as prev_avg_order_value,
                      SUM(
                          (SELECT COUNT(*) FROM pos_transaction_items 
                           WHERE transaction_id = t.transaction_id)
                      ) as prev_items_sold
                    FROM pos_transactions t
                    WHERE DATE(transaction_date) BETWEEN ? AND ?
                    AND status = 'completed'";
  
  $stmt = mysqli_prepare($conn, $prevSalesQuery);
  mysqli_stmt_bind_param($stmt, 'ss', $prevStartDate, $prevEndDate);
  mysqli_stmt_execute($stmt);
  $prevSalesResult = mysqli_stmt_get_result($stmt);
  
  if (!$prevSalesResult) {
      throw new Exception("Error executing previous sales query: " . mysqli_error($conn));
  }
  
  $prevSalesData = mysqli_fetch_assoc($prevSalesResult);
  
  // Calculate growth percentages
  $salesGrowth = 0;
  if ($prevSalesData['prev_total_sales'] > 0) {
      $salesGrowth = (($salesData['total_sales'] - $prevSalesData['prev_total_sales']) / $prevSalesData['prev_total_sales']) * 100;
  }
  
  $ordersGrowth = 0;
  if ($prevSalesData['prev_total_orders'] > 0) {
      $ordersGrowth = (($salesData['total_orders'] - $prevSalesData['prev_total_orders']) / $prevSalesData['prev_total_orders']) * 100;
  }
  
  $aovGrowth = 0;
  if ($prevSalesData['prev_avg_order_value'] > 0) {
      $aovGrowth = (($salesData['avg_order_value'] - $prevSalesData['prev_avg_order_value']) / $prevSalesData['prev_avg_order_value']) * 100;
  }
  
  $itemsGrowth = 0;
  if ($prevSalesData['prev_items_sold'] > 0) {
      $itemsGrowth = (($salesData['items_sold'] - $prevSalesData['prev_items_sold']) / $prevSalesData['prev_items_sold']) * 100;
  }
  
  // Set summary data in response
  $response['summary'] = [
      'total_sales' => (float)($salesData['total_sales'] ?? 0),
      'sales_growth' => round($salesGrowth, 1),
      'total_orders' => (int)($salesData['total_orders'] ?? 0),
      'orders_growth' => round($ordersGrowth, 1),
      'average_order_value' => (float)($salesData['avg_order_value'] ?? 0),
      'aov_growth' => round($aovGrowth, 1),
      'items_sold' => (int)($salesData['items_sold'] ?? 0),
      'items_growth' => round($itemsGrowth, 1)
  ];

  // 2. Get sales trend data
  $trendLabels = [];
  $trendValues = [];
  
  // Format SQL based on grouping
  $dateFormat = '';
  $groupByClause = '';
  
  switch ($groupBy) {
      case 'daily':
          $dateFormat = '%Y-%m-%d';
          $groupByClause = 'DATE(transaction_date)';
          break;
      case 'weekly':
          $dateFormat = '%x-W%v'; // Year-Week format
          $groupByClause = 'YEARWEEK(transaction_date, 1)';
          break;
      case 'monthly':
          $dateFormat = '%Y-%m';
          $groupByClause = 'DATE_FORMAT(transaction_date, "%Y-%m")';
          break;
  }
  
  $trendQuery = "SELECT 
                  DATE_FORMAT(transaction_date, ?) as period,
                  SUM(total_amount) as sales
                FROM pos_transactions
                WHERE DATE(transaction_date) BETWEEN ? AND ?
                AND status = 'completed'
                GROUP BY $groupByClause
                ORDER BY MIN(transaction_date) ASC";
  
  $stmt = mysqli_prepare($conn, $trendQuery);
  mysqli_stmt_bind_param($stmt, 'sss', $dateFormat, $startDate, $endDate);
  mysqli_stmt_execute($stmt);
  $trendResult = mysqli_stmt_get_result($stmt);
  
  if (!$trendResult) {
      throw new Exception("Error executing trend query: " . mysqli_error($conn));
  }
  
  while ($row = mysqli_fetch_assoc($trendResult)) {
      // Format label based on grouping
      $label = $row['period'];
      if ($groupBy === 'weekly') {
          // Convert YYYY-WW format to "Week X" format
          $parts = explode('-W', $label);
          if (count($parts) > 1) {
              $label = 'Week ' . $parts[1];
          }
      } else if ($groupBy === 'monthly') {
          // Convert YYYY-MM format to "Month YYYY" format
          $date = DateTime::createFromFormat('Y-m', $label);
          if ($date) {
              $label = $date->format('M Y');
          }
      }
      
      $trendLabels[] = $label;
      $trendValues[] = (float)$row['sales'];
  }
  
  // Set trend data in response
  $response['trend'] = [
      'labels' => $trendLabels,
      'values' => $trendValues
  ];

  // 3. Get sales by category data
  $categoryQuery = "SELECT 
                      p.category,
                      SUM(ti.total_price) as revenue
                    FROM pos_transaction_items ti
                    JOIN products p ON ti.product_id = p.product_id
                    JOIN pos_transactions t ON ti.transaction_id = t.transaction_id
                    WHERE DATE(t.transaction_date) BETWEEN ? AND ?
                    AND t.status = 'completed'
                    GROUP BY p.category
                    ORDER BY revenue DESC";
  
  $stmt = mysqli_prepare($conn, $categoryQuery);
  mysqli_stmt_bind_param($stmt, 'ss', $startDate, $endDate);
  mysqli_stmt_execute($stmt);
  $categoryResult = mysqli_stmt_get_result($stmt);
  
  if (!$categoryResult) {
      throw new Exception("Error executing category query: " . mysqli_error($conn));
  }
  
  $categoryLabels = [];
  $categoryValues = [];
  
  while ($row = mysqli_fetch_assoc($categoryResult)) {
      $categoryLabels[] = $row['category'];
      $categoryValues[] = (float)$row['revenue'];
  }
  
  // If no categories found, provide default data
  if (empty($categoryLabels)) {
      $categoryLabels = ['No Data'];
      $categoryValues = [0];
  }
  
  // Set category data in response
  $response['categories'] = [
      'labels' => $categoryLabels,
      'values' => $categoryValues
  ];

  // 4. Get payment methods data
  $paymentQuery = "SELECT 
                    pm.method_name,
                    SUM(tp.amount) as total
                  FROM pos_transaction_payments tp
                  JOIN pos_payment_methods pm ON tp.payment_method_id = pm.payment_method_id
                  JOIN pos_transactions t ON tp.transaction_id = t.transaction_id
                  WHERE DATE(t.transaction_date) BETWEEN ? AND ?
                  AND t.status = 'completed'
                  GROUP BY pm.method_name
                  ORDER BY total DESC";
  
  $stmt = mysqli_prepare($conn, $paymentQuery);
  mysqli_stmt_bind_param($stmt, 'ss', $startDate, $endDate);
  mysqli_stmt_execute($stmt);
  $paymentResult = mysqli_stmt_get_result($stmt);
  
  if (!$paymentResult) {
      throw new Exception("Error executing payment methods query: " . mysqli_error($conn));
  }
  
  $paymentLabels = [];
  $paymentValues = [];
  
  while ($row = mysqli_fetch_assoc($paymentResult)) {
      $paymentLabels[] = $row['method_name'];
      $paymentValues[] = (float)$row['total'];
  }
  
  // If no payment methods found, provide default data
  if (empty($paymentLabels)) {
      $paymentLabels = ['No Data'];
      $paymentValues = [0];
  }
  
  // Set payment methods data in response
  $response['payment_methods'] = [
      'labels' => $paymentLabels,
      'values' => $paymentValues
  ];

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

