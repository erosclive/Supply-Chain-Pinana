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
$typeFilter = isset($_GET['type']) ? $_GET['type'] : 'all';

try {
  // Initialize response array
  $response = [
      'success' => true,
      'summary' => [],
      'trend' => [],
      'transactions' => []
  ];

  // 1. Get transaction summary data
  // POS Transactions
  $posQuery = "SELECT 
                COUNT(*) as pos_count,
                SUM(total_amount) as pos_sales
              FROM pos_transactions
              WHERE DATE(transaction_date) BETWEEN ? AND ?
              AND status = 'completed'";
  
  if ($typeFilter === 'pos') {
      $posQuery .= " AND 1=1";
  } else if ($typeFilter === 'order') {
      $posQuery .= " AND 1=0"; // Exclude POS transactions if only orders are requested
  }
  
  $stmt = mysqli_prepare($conn, $posQuery);
  mysqli_stmt_bind_param($stmt, 'ss', $startDate, $endDate);
  mysqli_stmt_execute($stmt);
  $posResult = mysqli_stmt_get_result($stmt);
  
  if (!$posResult) {
      throw new Exception("Error executing POS query: " . mysqli_error($conn));
  }
  
  $posData = mysqli_fetch_assoc($posResult);
  
  // Order Transactions
  $orderQuery = "SELECT 
                  COUNT(*) as order_count,
                  SUM(total_amount) as order_sales
                FROM orders
                WHERE DATE(order_date) BETWEEN ? AND ?";
  
  if ($typeFilter === 'order') {
      $orderQuery .= " AND 1=1";
  } else if ($typeFilter === 'pos') {
      $orderQuery .= " AND 1=0"; // Exclude orders if only POS transactions are requested
  }
  
  $stmt = mysqli_prepare($conn, $orderQuery);
  mysqli_stmt_bind_param($stmt, 'ss', $startDate, $endDate);
  mysqli_stmt_execute($stmt);
  $orderResult = mysqli_stmt_get_result($stmt);
  
  if (!$orderResult) {
      throw new Exception("Error executing order query: " . mysqli_error($conn));
  }
  
  $orderData = mysqli_fetch_assoc($orderResult);
  
  // Calculate totals
  $totalTransactions = ($posData['pos_count'] ?? 0) + ($orderData['order_count'] ?? 0);
  $totalSales = ($posData['pos_sales'] ?? 0) + ($orderData['order_sales'] ?? 0);
  $avgTransaction = $totalTransactions > 0 ? $totalSales / $totalTransactions : 0;
  
  // Set summary data in response
  $response['summary'] = [
      'total_transactions' => (int)$totalTransactions,
      'pos_sales' => (float)($posData['pos_sales'] ?? 0),
      'order_sales' => (float)($orderData['order_sales'] ?? 0),
      'total_sales' => (float)$totalSales,
      'avg_transaction' => (float)$avgTransaction
  ];

  // 2. Get transaction trend data
  // Determine date format based on date range
  $dateFormat = '%Y-%m-%d'; // Default to daily
  $daysDiff = (strtotime($endDate) - strtotime($startDate)) / (60 * 60 * 24);
  
  if ($daysDiff > 60) {
      $dateFormat = '%Y-%m'; // Monthly for longer ranges
  } else if ($daysDiff > 14) {
      $dateFormat = '%x-W%v'; // Weekly for medium ranges
  }
  
  // POS Trend
  $posTrendQuery = "SELECT 
                    DATE_FORMAT(transaction_date, ?) as period,
                    COUNT(*) as transaction_count
                  FROM pos_transactions
                  WHERE DATE(transaction_date) BETWEEN ? AND ?
                  AND status = 'completed'";
  
  if ($typeFilter === 'pos') {
      $posTrendQuery .= " AND 1=1";
  } else if ($typeFilter === 'order') {
      $posTrendQuery .= " AND 1=0"; // Exclude POS transactions if only orders are requested
  }
  
  $posTrendQuery .= " GROUP BY period
                      ORDER BY MIN(transaction_date) ASC";
  
  $stmt = mysqli_prepare($conn, $posTrendQuery);
  mysqli_stmt_bind_param($stmt, 'sss', $dateFormat, $startDate, $endDate);
  mysqli_stmt_execute($stmt);
  $posTrendResult = mysqli_stmt_get_result($stmt);
  
  if (!$posTrendResult) {
      throw new Exception("Error executing POS trend query: " . mysqli_error($conn));
  }
  
  $trendLabels = [];
  $trendValues = [];
  $allPeriods = [];
  
  // Collect all periods from POS transactions
  while ($row = mysqli_fetch_assoc($posTrendResult)) {
      $allPeriods[$row['period']] = true;
  }
  
  // Order Trend
  $orderTrendQuery = "SELECT 
                      DATE_FORMAT(order_date, ?) as period,
                      COUNT(*) as transaction_count
                    FROM orders
                    WHERE DATE(order_date) BETWEEN ? AND ?";
  
  if ($typeFilter === 'order') {
      $orderTrendQuery .= " AND 1=1";
  } else if ($typeFilter === 'pos') {
      $orderTrendQuery .= " AND 1=0"; // Exclude orders if only POS transactions are requested
  }
  
  $orderTrendQuery .= " GROUP BY period
                        ORDER BY MIN(order_date) ASC";
  
  $stmt = mysqli_prepare($conn, $orderTrendQuery);
  mysqli_stmt_bind_param($stmt, 'sss', $dateFormat, $startDate, $endDate);
  mysqli_stmt_execute($stmt);
  $orderTrendResult = mysqli_stmt_get_result($stmt);
  
  if (!$orderTrendResult) {
      throw new Exception("Error executing order trend query: " . mysqli_error($conn));
  }
  
  // Collect all periods from orders
  while ($row = mysqli_fetch_assoc($orderTrendResult)) {
      $allPeriods[$row['period']] = true;
  }
  
  // Sort periods
  ksort($allPeriods);
  
  // Reset result pointers
  mysqli_data_seek($posTrendResult, 0);
  mysqli_data_seek($orderTrendResult, 0);
  
  // Create associative arrays for easy lookup
  $posTrendData = [];
  while ($row = mysqli_fetch_assoc($posTrendResult)) {
      $posTrendData[$row['period']] = (int)$row['transaction_count'];
  }
  
  $orderTrendData = [];
  while ($row = mysqli_fetch_assoc($orderTrendResult)) {
      $orderTrendData[$row['period']] = (int)$row['transaction_count'];
  }
  
  // Fill in the trend arrays
  foreach (array_keys($allPeriods) as $period) {
      // Format label based on period format
      $label = $period;
      if (strpos($period, '-W') !== false) {
          // Convert YYYY-WW format to "Week X" format
          $parts = explode('-W', $period);
          $label = 'Week ' . $parts[1];
      } else if (strlen($period) === 7) { // YYYY-MM format
          // Convert YYYY-MM format to "Month YYYY" format
          $date = DateTime::createFromFormat('Y-m', $period);
          if ($date) {
              $label = $date->format('M Y');
          }
      }
      
      $trendLabels[] = $label;
      $posCount = $posTrendData[$period] ?? 0;
      $orderCount = $orderTrendData[$period] ?? 0;
      $trendValues[] = $posCount + $orderCount;
  }
  
  // If no trend data found, provide default data
  if (empty($trendLabels)) {
      $trendLabels = ['No Data'];
      $trendValues = [0];
  }
  
  // Set trend data in response
  $response['trend'] = [
      'labels' => $trendLabels,
      'values' => $trendValues
  ];

  // 3. Get transaction list
  // POS Transactions
  $posListQuery = "SELECT 
                    t.transaction_id,
                    DATE_FORMAT(t.transaction_date, '%b %d, %Y %H:%i') as transaction_date,
                    t.customer_name,
                    'pos' as transaction_type,
                    (SELECT COUNT(*) FROM pos_transaction_items WHERE transaction_id = t.transaction_id) as item_count,
                    pm.method_name as payment_method,
                    t.total_amount as amount
                  FROM pos_transactions t
                  LEFT JOIN pos_transaction_payments tp ON t.transaction_id = tp.transaction_id
                  LEFT JOIN pos_payment_methods pm ON tp.payment_method_id = pm.payment_method_id
                  WHERE DATE(t.transaction_date) BETWEEN ? AND ?
                  AND t.status = 'completed'";
  
  if ($typeFilter === 'pos') {
      $posListQuery .= " AND 1=1";
  } else if ($typeFilter === 'order') {
      $posListQuery .= " AND 1=0"; // Exclude POS transactions if only orders are requested
  }
  
  $posListQuery .= " GROUP BY t.transaction_id
                    ORDER BY t.transaction_date DESC
                    LIMIT 50";
  
  $stmt = mysqli_prepare($conn, $posListQuery);
  mysqli_stmt_bind_param($stmt, 'ss', $startDate, $endDate);
  mysqli_stmt_execute($stmt);
  $posListResult = mysqli_stmt_get_result($stmt);
  
  if (!$posListResult) {
      throw new Exception("Error executing POS list query: " . mysqli_error($conn));
  }
  
  $transactions = [];
  
  while ($row = mysqli_fetch_assoc($posListResult)) {
      $transactions[] = [
          'transaction_id' => $row['transaction_id'],
          'transaction_date' => $row['transaction_date'],
          'customer_name' => $row['customer_name'],
          'transaction_type' => $row['transaction_type'],
          'item_count' => (int)$row['item_count'],
          'payment_method' => $row['payment_method'] ?? 'N/A',
          'amount' => (float)$row['amount'],
          'amount_formatted' => '₱' . number_format($row['amount'], 2)
      ];
  }
  
  // Order Transactions
  $orderListQuery = "SELECT 
                      o.order_id as transaction_id,
                      DATE_FORMAT(o.order_date, '%b %d, %Y %H:%i') as transaction_date,
                      o.customer_name,
                      'order' as transaction_type,
                      (SELECT COUNT(*) FROM order_items WHERE order_id = o.order_id) as item_count,
                      o.payment_method,
                      o.total_amount as amount
                    FROM orders o
                    WHERE DATE(o.order_date) BETWEEN ? AND ?";
  
  if ($typeFilter === 'order') {
      $orderListQuery .= " AND 1=1";
  } else if ($typeFilter === 'pos') {
      $orderListQuery .= " AND 1=0"; // Exclude orders if only POS transactions are requested
  }
  
  $orderListQuery .= " ORDER BY o.order_date DESC
                      LIMIT 50";
  
  $stmt = mysqli_prepare($conn, $orderListQuery);
  mysqli_stmt_bind_param($stmt, 'ss', $startDate, $endDate);
  mysqli_stmt_execute($stmt);
  $orderListResult = mysqli_stmt_get_result($stmt);
  
  if (!$orderListResult) {
      throw new Exception("Error executing order list query: " . mysqli_error($conn));
  }
  
  while ($row = mysqli_fetch_assoc($orderListResult)) {
      $transactions[] = [
          'transaction_id' => $row['transaction_id'],
          'transaction_date' => $row['transaction_date'],
          'customer_name' => $row['customer_name'],
          'transaction_type' => $row['transaction_type'],
          'item_count' => (int)$row['item_count'],
          'payment_method' => $row['payment_method'] ?? 'N/A',
          'amount' => (float)$row['amount'],
          'amount_formatted' => '₱' . number_format($row['amount'], 2)
      ];
  }
  
  // Sort by transaction date (descending)
  usort($transactions, function($a, $b) {
      return strtotime($b['transaction_date']) - strtotime($a['transaction_date']);
  });
  
  // Limit to 100 most recent transactions
  $transactions = array_slice($transactions, 0, 100);
  
  // Set transactions data in response
  $response['transactions'] = $transactions;

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

