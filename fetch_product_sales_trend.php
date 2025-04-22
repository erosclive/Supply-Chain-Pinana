<?php
// fetch_product_sales_trend.php - Retrieves product sales trend data for the dashboard

// Set headers for JSON response
header('Content-Type: application/json');

// Include database connection
require_once 'db_connection.php';

// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Get period parameter
$period = isset($_GET['period']) ? $_GET['period'] : 'month';

// Validate period
$validPeriods = ['today', 'week', 'month', 'quarter', 'year'];
if (!in_array($period, $validPeriods)) {
  $period = 'month'; // Default to month if invalid
}

// Set date ranges based on period
$today = date('Y-m-d');
$startDate = '';
$endDate = $today;

switch ($period) {
  case 'today':
      $startDate = $today;
      break;
  case 'week':
      $startDate = date('Y-m-d', strtotime('-7 days'));
      break;
  case 'month':
      $startDate = date('Y-m-d', strtotime('-30 days'));
      break;
  case 'quarter':
      $startDate = date('Y-m-d', strtotime('-90 days'));
      break;
  case 'year':
      $startDate = date('Y-m-d', strtotime('-365 days'));
      break;
}

try {
    // Ensure database connection
    if (!$conn) {
        throw new Exception("Database connection failed: " . mysqli_connect_error());
    }

    // Update the query to properly join with the products table and ensure we get product data
    $query = "SELECT 
            p.product_id,
            p.product_name,
            SUM(ti.quantity) as total_quantity,
            SUM(ti.total_price) as total_sales
          FROM 
            pos_transaction_items ti
          JOIN 
            products p ON ti.product_id = p.product_id
          JOIN 
            pos_transactions t ON ti.transaction_id = t.transaction_id
          WHERE 
            DATE(t.transaction_date) BETWEEN ? AND ?
            AND t.status = 'completed'
          GROUP BY 
            p.product_id, p.product_name
          ORDER BY 
            total_sales DESC
          LIMIT 10";
    
    $stmt = mysqli_prepare($conn, $query);
    mysqli_stmt_bind_param($stmt, 'ss', $startDate, $endDate);
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);
    
    if (!$result) {
        throw new Exception("Query failed: " . mysqli_error($conn));
    }
    
    // Prepare data for chart
    $labels = [];
    $quantities = [];
    $sales = [];
    
    while ($row = mysqli_fetch_assoc($result)) {
        $labels[] = $row['product_name'];
        $quantities[] = (int)$row['total_quantity'];
        $sales[] = (float)$row['total_sales'];
    }
    
    // Return JSON response
    echo json_encode([
        'success' => true,
        'period' => $period,
        'data' => [
            'labels' => $labels,
            'quantities' => $quantities,
            'sales' => $sales
        ]
    ]);
    
} catch (Exception $e) {
    // Return error response
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
} finally {
    // Close connection
    if (isset($conn) && $conn) {
        mysqli_close($conn);
    }
}
?>

