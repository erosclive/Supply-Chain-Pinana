<?php
// fetch_dashboard_data.php - Retrieves data for the KPI dashboard

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
$previousStartDate = '';
$previousEndDate = '';

switch ($period) {
  case 'today':
      $startDate = $today;
      $previousStartDate = date('Y-m-d', strtotime('-1 day'));
      $previousEndDate = $previousStartDate;
      break;
  case 'week':
      $startDate = date('Y-m-d', strtotime('-7 days'));
      $previousStartDate = date('Y-m-d', strtotime('-14 days'));
      $previousEndDate = date('Y-m-d', strtotime('-8 days'));
      break;
  case 'month':
      $startDate = date('Y-m-d', strtotime('-30 days'));
      $previousStartDate = date('Y-m-d', strtotime('-60 days'));
      $previousEndDate = date('Y-m-d', strtotime('-31 days'));
      break;
  case 'quarter':
      $startDate = date('Y-m-d', strtotime('-90 days'));
      $previousStartDate = date('Y-m-d', strtotime('-180 days'));
      $previousEndDate = date('Y-m-d', strtotime('-91 days'));
      break;
  case 'year':
      $startDate = date('Y-m-d', strtotime('-365 days'));
      $previousStartDate = date('Y-m-d', strtotime('-730 days'));
      $previousEndDate = date('Y-m-d', strtotime('-366 days'));
      break;
}

try {
    // Initialize response array
    $response = [
        'success' => true,
        'kpi' => [],
        'sales_trend' => [],
        'category_revenue' => [],
        'inventory_status' => [],
        'payment_methods' => [],
        'top_products' => [],
        'recent_transactions' => []
    ];

    // 1. KPI Data - Total Sales (combining POS and Orders)
    // POS Sales
    $posSalesQuery = "SELECT SUM(total_amount) as pos_sales 
                     FROM pos_transactions 
                     WHERE DATE(transaction_date) BETWEEN ? AND ?
                     AND status = 'completed'";
    $stmt = mysqli_prepare($conn, $posSalesQuery);
    mysqli_stmt_bind_param($stmt, 'ss', $startDate, $endDate);
    mysqli_stmt_execute($stmt);
    $posSalesResult = mysqli_stmt_get_result($stmt);
    $posSales = mysqli_fetch_assoc($posSalesResult)['pos_sales'] ?? 0;

    // Order Sales
    $orderSalesQuery = "SELECT SUM(total_amount) as order_sales 
                       FROM orders 
                       WHERE DATE(order_date) BETWEEN ? AND ?
                       AND status IN ('delivered', 'completed')";
    $stmt = mysqli_prepare($conn, $orderSalesQuery);
    mysqli_stmt_bind_param($stmt, 'ss', $startDate, $endDate);
    mysqli_stmt_execute($stmt);
    $orderSalesResult = mysqli_stmt_get_result($stmt);
    $orderSales = mysqli_fetch_assoc($orderSalesResult)['order_sales'] ?? 0;

    // Total Sales
    $totalSales = $posSales + $orderSales;

    // Previous period sales for growth calculation
    // Previous POS Sales
    $prevPosSalesQuery = "SELECT SUM(total_amount) as prev_pos_sales 
                         FROM pos_transactions 
                         WHERE DATE(transaction_date) BETWEEN ? AND ?
                         AND status = 'completed'";
    $stmt = mysqli_prepare($conn, $prevPosSalesQuery);
    mysqli_stmt_bind_param($stmt, 'ss', $previousStartDate, $previousEndDate);
    mysqli_stmt_execute($stmt);
    $prevPosSalesResult = mysqli_stmt_get_result($stmt);
    $prevPosSales = mysqli_fetch_assoc($prevPosSalesResult)['prev_pos_sales'] ?? 0;

    // Previous Order Sales
    $prevOrderSalesQuery = "SELECT SUM(total_amount) as prev_order_sales 
                           FROM orders 
                           WHERE DATE(order_date) BETWEEN ? AND ?
                           AND status IN ('delivered', 'completed')";
    $stmt = mysqli_prepare($conn, $prevOrderSalesQuery);
    mysqli_stmt_bind_param($stmt, 'ss', $previousStartDate, $previousEndDate);
    mysqli_stmt_execute($stmt);
    $prevOrderSalesResult = mysqli_stmt_get_result($stmt);
    $prevOrderSales = mysqli_fetch_assoc($prevOrderSalesResult)['prev_order_sales'] ?? 0;

    // Previous Total Sales
    $prevTotalSales = $prevPosSales + $prevOrderSales;

    // Calculate sales growth
    $salesGrowth = 0;
    if ($prevTotalSales > 0) {
        $salesGrowth = round((($totalSales - $prevTotalSales) / $prevTotalSales) * 100, 1);
    }

    // 2. KPI Data - Total Transactions (combining POS and Orders)
    // POS Transactions
    $posTransactionsQuery = "SELECT COUNT(*) as pos_transactions 
                            FROM pos_transactions 
                            WHERE DATE(transaction_date) BETWEEN ? AND ?
                            AND status = 'completed'";
    $stmt = mysqli_prepare($conn, $posTransactionsQuery);
    mysqli_stmt_bind_param($stmt, 'ss', $startDate, $endDate);
    mysqli_stmt_execute($stmt);
    $posTransactionsResult = mysqli_stmt_get_result($stmt);
    $posTransactions = mysqli_fetch_assoc($posTransactionsResult)['pos_transactions'] ?? 0;

    // Order Transactions
    $orderTransactionsQuery = "SELECT COUNT(*) as order_transactions 
                              FROM orders 
                              WHERE DATE(order_date) BETWEEN ? AND ?";
    $stmt = mysqli_prepare($conn, $orderTransactionsQuery);
    mysqli_stmt_bind_param($stmt, 'ss', $startDate, $endDate);
    mysqli_stmt_execute($stmt);
    $orderTransactionsResult = mysqli_stmt_get_result($stmt);
    $orderTransactions = mysqli_fetch_assoc($orderTransactionsResult)['order_transactions'] ?? 0;

    // Total Transactions
    $totalTransactions = $posTransactions + $orderTransactions;

    // Previous period transactions for growth calculation
    // Previous POS Transactions
    $prevPosTransactionsQuery = "SELECT COUNT(*) as prev_pos_transactions 
                                FROM pos_transactions 
                                WHERE DATE(transaction_date) BETWEEN ? AND ?
                                AND status = 'completed'";
    $stmt = mysqli_prepare($conn, $prevPosTransactionsQuery);
    mysqli_stmt_bind_param($stmt, 'ss', $previousStartDate, $previousEndDate);
    mysqli_stmt_execute($stmt);
    $prevPosTransactionsResult = mysqli_stmt_get_result($stmt);
    $prevPosTransactions = mysqli_fetch_assoc($prevPosTransactionsResult)['prev_pos_transactions'] ?? 0;

    // Previous Order Transactions
    $prevOrderTransactionsQuery = "SELECT COUNT(*) as prev_order_transactions 
                                  FROM orders 
                                  WHERE DATE(order_date) BETWEEN ? AND ?";
    $stmt = mysqli_prepare($conn, $prevOrderTransactionsQuery);
    mysqli_stmt_bind_param($stmt, 'ss', $previousStartDate, $previousEndDate);
    mysqli_stmt_execute($stmt);
    $prevOrderTransactionsResult = mysqli_stmt_get_result($stmt);
    $prevOrderTransactions = mysqli_fetch_assoc($prevOrderTransactionsResult)['prev_order_transactions'] ?? 0;

    // Previous Total Transactions
    $prevTotalTransactions = $prevPosTransactions + $prevOrderTransactions;

    // Calculate transactions growth
    $transactionsGrowth = 0;
    if ($prevTotalTransactions > 0) {
        $transactionsGrowth = round((($totalTransactions - $prevTotalTransactions) / $prevTotalTransactions) * 100, 1);
    }

    // 3. KPI Data - Average Transaction Value
    $avgTransactionValue = 0;
    if ($totalTransactions > 0) {
        $avgTransactionValue = $totalSales / $totalTransactions;
    }

    // Previous period average transaction value
    $prevAvgTransactionValue = 0;
    if ($prevTotalTransactions > 0) {
        $prevAvgTransactionValue = $prevTotalSales / $prevTotalTransactions;
    }

    // Calculate average transaction value growth
    $avgTransactionGrowth = 0;
    if ($prevAvgTransactionValue > 0) {
        $avgTransactionGrowth = round((($avgTransactionValue - $prevAvgTransactionValue) / $prevAvgTransactionValue) * 100, 1);
    }

    // 4. KPI Data - Total Items Sold (from POS transactions)
    $itemsSoldQuery = "SELECT SUM(quantity) as total_items_sold 
                      FROM pos_transaction_items ti
                      JOIN pos_transactions t ON ti.transaction_id = t.transaction_id
                      WHERE DATE(t.transaction_date) BETWEEN ? AND ?
                      AND t.status = 'completed'";
    $stmt = mysqli_prepare($conn, $itemsSoldQuery);
    mysqli_stmt_bind_param($stmt, 'ss', $startDate, $endDate);
    mysqli_stmt_execute($stmt);
    $itemsSoldResult = mysqli_stmt_get_result($stmt);
    $totalItemsSold = mysqli_fetch_assoc($itemsSoldResult)['total_items_sold'] ?? 0;

    // Previous period items sold
    $prevItemsSoldQuery = "SELECT SUM(quantity) as prev_items_sold 
                          FROM pos_transaction_items ti
                          JOIN pos_transactions t ON ti.transaction_id = t.transaction_id
                          WHERE DATE(t.transaction_date) BETWEEN ? AND ?
                          AND t.status = 'completed'";
    $stmt = mysqli_prepare($conn, $prevItemsSoldQuery);
    mysqli_stmt_bind_param($stmt, 'ss', $previousStartDate, $previousEndDate);
    mysqli_stmt_execute($stmt);
    $prevItemsSoldResult = mysqli_stmt_get_result($stmt);
    $prevItemsSold = mysqli_fetch_assoc($prevItemsSoldResult)['prev_items_sold'] ?? 0;

    // Calculate items sold growth
    $itemsSoldGrowth = 0;
    if ($prevItemsSold > 0) {
        $itemsSoldGrowth = round((($totalItemsSold - $prevItemsSold) / $prevItemsSold) * 100, 1);
    }

    // Set KPI data in response
    $response['kpi'] = [
        'total_sales' => $totalSales,
        'sales_growth' => $salesGrowth,
        'total_transactions' => $totalTransactions,
        'transactions_growth' => $transactionsGrowth,
        'avg_transaction_value' => $avgTransactionValue,
        'avg_transaction_growth' => $avgTransactionGrowth,
        'total_items_sold' => $totalItemsSold,
        'items_sold_growth' => $itemsSoldGrowth
    ];

    // 5. Sales Trend Data (combining POS and Orders)
    $salesTrendLabels = [];
    $salesTrendValues = [];

    // Generate labels and query data based on period
    switch ($period) {
        case 'today':
            // Hourly data for today
            for ($i = 0; $i < 24; $i++) {
                $hour = str_pad($i, 2, '0', STR_PAD_LEFT);
                $salesTrendLabels[] = $hour . ':00';
                
                $hourStart = $today . ' ' . $hour . ':00:00';
                $hourEnd = $today . ' ' . $hour . ':59:59';
                
                // POS hourly sales
                $posHourlyQuery = "SELECT SUM(total_amount) as pos_hourly_sales 
                                  FROM pos_transactions 
                                  WHERE transaction_date BETWEEN ? AND ?
                                  AND status = 'completed'";
                $stmt = mysqli_prepare($conn, $posHourlyQuery);
                mysqli_stmt_bind_param($stmt, 'ss', $hourStart, $hourEnd);
                mysqli_stmt_execute($stmt);
                $posHourlyResult = mysqli_stmt_get_result($stmt);
                $posHourlySales = mysqli_fetch_assoc($posHourlyResult)['pos_hourly_sales'] ?? 0;
                
                // Order hourly sales
                $orderHourlyQuery = "SELECT SUM(total_amount) as order_hourly_sales 
                                    FROM orders 
                                    WHERE order_date BETWEEN ? AND ?
                                    AND status IN ('delivered', 'completed')";
                $stmt = mysqli_prepare($conn, $orderHourlyQuery);
                mysqli_stmt_bind_param($stmt, 'ss', $hourStart, $hourEnd);
                mysqli_stmt_execute($stmt);
                $orderHourlyResult = mysqli_stmt_get_result($stmt);
                $orderHourlySales = mysqli_fetch_assoc($orderHourlyResult)['order_hourly_sales'] ?? 0;
                
                // Total hourly sales
                $salesTrendValues[] = $posHourlySales + $orderHourlySales;
            }
            break;
            
        case 'week':
            // Daily data for the last 7 days
            for ($i = 6; $i >= 0; $i--) {
                $day = date('Y-m-d', strtotime("-$i days"));
                $salesTrendLabels[] = date('D', strtotime($day));
                
                $dayStart = $day . ' 00:00:00';
                $dayEnd = $day . ' 23:59:59';
                
                // POS daily sales
                $posDailyQuery = "SELECT SUM(total_amount) as pos_daily_sales 
                                 FROM pos_transactions 
                                 WHERE transaction_date BETWEEN ? AND ?
                                 AND status = 'completed'";
                $stmt = mysqli_prepare($conn, $posDailyQuery);
                mysqli_stmt_bind_param($stmt, 'ss', $dayStart, $dayEnd);
                mysqli_stmt_execute($stmt);
                $posDailyResult = mysqli_stmt_get_result($stmt);
                $posDailySales = mysqli_fetch_assoc($posDailyResult)['pos_daily_sales'] ?? 0;
                
                // Order daily sales
                $orderDailyQuery = "SELECT SUM(total_amount) as order_daily_sales 
                                   FROM orders 
                                   WHERE order_date BETWEEN ? AND ?
                                   AND status IN ('delivered', 'completed')";
                $stmt = mysqli_prepare($conn, $orderDailyQuery);
                mysqli_stmt_bind_param($stmt, 'ss', $dayStart, $dayEnd);
                mysqli_stmt_execute($stmt);
                $orderDailyResult = mysqli_stmt_get_result($stmt);
                $orderDailySales = mysqli_fetch_assoc($orderDailyResult)['order_daily_sales'] ?? 0;
                
                // Total daily sales
                $salesTrendValues[] = $posDailySales + $orderDailySales;
            }
            break;
            
        case 'month':
            // Weekly data for the last 4 weeks
            for ($i = 4; $i >= 1; $i--) {
                $weekStart = date('Y-m-d', strtotime("-" . ($i * 7) . " days"));
                $weekEnd = date('Y-m-d', strtotime("-" . (($i - 1) * 7 - 1) . " days"));
                $salesTrendLabels[] = 'Week ' . (5 - $i);
                
                // POS weekly sales
                $posWeeklyQuery = "SELECT SUM(total_amount) as pos_weekly_sales 
                                  FROM pos_transactions 
                                  WHERE DATE(transaction_date) BETWEEN ? AND ?
                                  AND status = 'completed'";
                $stmt = mysqli_prepare($conn, $posWeeklyQuery);
                mysqli_stmt_bind_param($stmt, 'ss', $weekStart, $weekEnd);
                mysqli_stmt_execute($stmt);
                $posWeeklyResult = mysqli_stmt_get_result($stmt);
                $posWeeklySales = mysqli_fetch_assoc($posWeeklyResult)['pos_weekly_sales'] ?? 0;
                
                // Order weekly sales
                $orderWeeklyQuery = "SELECT SUM(total_amount) as order_weekly_sales 
                                    FROM orders 
                                    WHERE DATE(order_date) BETWEEN ? AND ?
                                    AND status IN ('delivered', 'completed')";
                $stmt = mysqli_prepare($conn, $orderWeeklyQuery);
                mysqli_stmt_bind_param($stmt, 'ss', $weekStart, $weekEnd);
                mysqli_stmt_execute($stmt);
                $orderWeeklyResult = mysqli_stmt_get_result($stmt);
                $orderWeeklySales = mysqli_fetch_assoc($orderWeeklyResult)['order_weekly_sales'] ?? 0;
                
                // Total weekly sales
                $salesTrendValues[] = $posWeeklySales + $orderWeeklySales;
            }
            break;
            
        case 'quarter':
            // Monthly data for the last 3 months
            for ($i = 2; $i >= 0; $i--) {
                $monthStart = date('Y-m-01', strtotime("-$i months"));
                $monthEnd = date('Y-m-t', strtotime("-$i months"));
                $salesTrendLabels[] = date('M', strtotime($monthStart));
                
                // POS monthly sales
                $posMonthlyQuery = "SELECT SUM(total_amount) as pos_monthly_sales 
                                   FROM pos_transactions 
                                   WHERE DATE(transaction_date) BETWEEN ? AND ?
                                   AND status = 'completed'";
                $stmt = mysqli_prepare($conn, $posMonthlyQuery);
                mysqli_stmt_bind_param($stmt, 'ss', $monthStart, $monthEnd);
                mysqli_stmt_execute($stmt);
                $posMonthlyResult = mysqli_stmt_get_result($stmt);
                $posMonthlySales = mysqli_fetch_assoc($posMonthlyResult)['pos_monthly_sales'] ?? 0;
                
                // Order monthly sales
                $orderMonthlyQuery = "SELECT SUM(total_amount) as order_monthly_sales 
                                     FROM orders 
                                     WHERE DATE(order_date) BETWEEN ? AND ?
                                     AND status IN ('delivered', 'completed')";
                $stmt = mysqli_prepare($conn, $orderMonthlyQuery);
                mysqli_stmt_bind_param($stmt, 'ss', $monthStart, $monthEnd);
                mysqli_stmt_execute($stmt);
                $orderMonthlyResult = mysqli_stmt_get_result($stmt);
                $orderMonthlySales = mysqli_fetch_assoc($orderMonthlyResult)['order_monthly_sales'] ?? 0;
                
                // Total monthly sales
                $salesTrendValues[] = $posMonthlySales + $orderMonthlySales;
            }
            break;
            
        case 'year':
            // Quarterly data for the last 4 quarters
            for ($i = 3; $i >= 0; $i--) {
                $quarterStart = date('Y-m-d', strtotime("-" . ($i * 3) . " months"));
                $quarterEnd = date('Y-m-d', strtotime("-" . (($i - 1) * 3) . " months - 1 day"));
                $salesTrendLabels[] = 'Q' . (4 - $i);
                
                // POS quarterly sales
                $posQuarterlyQuery = "SELECT SUM(total_amount) as pos_quarterly_sales 
                                     FROM pos_transactions 
                                     WHERE DATE(transaction_date) BETWEEN ? AND ?
                                     AND status = 'completed'";
                $stmt = mysqli_prepare($conn, $posQuarterlyQuery);
                mysqli_stmt_bind_param($stmt, 'ss', $quarterStart, $quarterEnd);
                mysqli_stmt_execute($stmt);
                $posQuarterlyResult = mysqli_stmt_get_result($stmt);
                $posQuarterlySales = mysqli_fetch_assoc($posQuarterlyResult)['pos_quarterly_sales'] ?? 0;
                
                // Order quarterly sales
                $orderQuarterlyQuery = "SELECT SUM(total_amount) as order_quarterly_sales 
                                       FROM orders 
                                       WHERE DATE(order_date) BETWEEN ? AND ?
                                       AND status IN ('delivered', 'completed')";
                $stmt = mysqli_prepare($conn, $orderQuarterlyQuery);
                mysqli_stmt_bind_param($stmt, 'ss', $quarterStart, $quarterEnd);
                mysqli_stmt_execute($stmt);
                $orderQuarterlyResult = mysqli_stmt_get_result($stmt);
                $orderQuarterlySales = mysqli_fetch_assoc($orderQuarterlyResult)['order_quarterly_sales'] ?? 0;
                
                // Total quarterly sales
                $salesTrendValues[] = $posQuarterlySales + $orderQuarterlySales;
            }
            break;
    }

    // Set sales trend data in response
    $response['sales_trend'] = [
        'labels' => $salesTrendLabels,
        'values' => $salesTrendValues
    ];

    // 6. Category Revenue Data (from POS transactions)
    $categoryQuery = "SELECT p.category, SUM(ti.total_price) as revenue 
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
    
    $categoryLabels = [];
    $categoryValues = [];
    $totalRevenue = 0;
    
    while ($category = mysqli_fetch_assoc($categoryResult)) {
        $categoryLabels[] = $category['category'] ?: 'Other';
        $categoryValues[] = $category['revenue'];
        $totalRevenue += $category['revenue'];
    }
    
    // Set category revenue data in response
    $response['category_revenue'] = [
        'labels' => $categoryLabels,
        'values' => $categoryValues,
        'total' => $totalRevenue
    ];

    // 7. Inventory Status Data
    $inventoryStatusQuery = "SELECT 
                            SUM(CASE WHEN status = 'In Stock' THEN 1 ELSE 0 END) as in_stock,
                            SUM(CASE WHEN status = 'Low Stock' THEN 1 ELSE 0 END) as low_stock,
                            SUM(CASE WHEN status = 'Out of Stock' THEN 1 ELSE 0 END) as out_of_stock,
                            COUNT(*) as total
                            FROM products";
    
    $inventoryStatusResult = mysqli_query($conn, $inventoryStatusQuery);
    $inventoryStatus = mysqli_fetch_assoc($inventoryStatusResult);
    
    // Set inventory status data in response
    $response['inventory_status'] = [
        'in_stock' => $inventoryStatus['in_stock'] ?? 0,
        'low_stock' => $inventoryStatus['low_stock'] ?? 0,
        'out_of_stock' => $inventoryStatus['out_of_stock'] ?? 0,
        'total' => $inventoryStatus['total'] ?? 0
    ];

    // 8. Payment Methods Data (from POS transactions)
    $paymentMethodsQuery = "SELECT pm.method_name, COUNT(tp.payment_id) as count, SUM(tp.amount) as total
                           FROM pos_transaction_payments tp
                           JOIN pos_payment_methods pm ON tp.payment_method_id = pm.payment_method_id
                           JOIN pos_transactions t ON tp.transaction_id = t.transaction_id
                           WHERE DATE(t.transaction_date) BETWEEN ? AND ?
                           AND t.status = 'completed'
                           GROUP BY pm.method_name
                           ORDER BY total DESC";
    
    $stmt = mysqli_prepare($conn, $paymentMethodsQuery);
    mysqli_stmt_bind_param($stmt, 'ss', $startDate, $endDate);
    mysqli_stmt_execute($stmt);
    $paymentMethodsResult = mysqli_stmt_get_result($stmt);
    
    $paymentMethodsLabels = [];
    $paymentMethodsValues = [];
    
    while ($method = mysqli_fetch_assoc($paymentMethodsResult)) {
        $paymentMethodsLabels[] = $method['method_name'];
        $paymentMethodsValues[] = $method['total'];
    }
    
    // Add payment methods from orders
    $orderPaymentMethodsQuery = "SELECT payment_method, COUNT(*) as count, SUM(total_amount) as total
                                FROM orders
                                WHERE DATE(order_date) BETWEEN ? AND ?
                                AND status IN ('delivered', 'completed')
                                GROUP BY payment_method
                                ORDER BY total DESC";
    
    $stmt = mysqli_prepare($conn, $orderPaymentMethodsQuery);
    mysqli_stmt_bind_param($stmt, 'ss', $startDate, $endDate);
    mysqli_stmt_execute($stmt);
    $orderPaymentMethodsResult = mysqli_stmt_get_result($stmt);
    
    while ($method = mysqli_fetch_assoc($orderPaymentMethodsResult)) {
        // Check if this payment method already exists in the array
        $methodName = $method['payment_method'];
        $methodIndex = array_search($methodName, $paymentMethodsLabels);
        
        if ($methodIndex !== false) {
            // Payment method already exists, add to its total
            $paymentMethodsValues[$methodIndex] += $method['total'];
        } else {
            // New payment method, add to arrays
            $paymentMethodsLabels[] = $methodName;
            $paymentMethodsValues[] = $method['total'];
        }
    }
    
    // Set payment methods data in response
    $response['payment_methods'] = [
        'labels' => $paymentMethodsLabels,
        'values' => $paymentMethodsValues
    ];

    // 9. Top Products Data (from POS transactions)
    $topProductsQuery = "SELECT 
                        ti.product_name,
                        p.category,
                        SUM(ti.quantity) as units_sold,
                        SUM(ti.total_price) as revenue
                        FROM pos_transaction_items ti
                        JOIN products p ON ti.product_id = p.product_id
                        JOIN pos_transactions t ON ti.transaction_id = t.transaction_id
                        WHERE DATE(t.transaction_date) BETWEEN ? AND ?
                        AND t.status = 'completed'
                        GROUP BY ti.product_id
                        ORDER BY units_sold DESC
                        LIMIT 5";
    
    $stmt = mysqli_prepare($conn, $topProductsQuery);
    mysqli_stmt_bind_param($stmt, 'ss', $startDate, $endDate);
    mysqli_stmt_execute($stmt);
    $topProductsResult = mysqli_stmt_get_result($stmt);
    $topProducts = [];
    
    while ($product = mysqli_fetch_assoc($topProductsResult)) {
        // Format revenue
        $product['revenue_formatted'] = '₱' . number_format($product['revenue'], 2);
        $product['revenue'] = floatval($product['revenue']);
        $product['units_sold'] = intval($product['units_sold']);
        $topProducts[] = $product;
    }
    
    // Set top products in response
    $response['top_products'] = $topProducts;

    // 10. Recent Transactions (combining POS and Orders)
    // Recent POS Transactions
    $recentPosTransactionsQuery = "SELECT 
                                  t.transaction_id, 
                                  t.customer_name, 
                                  DATE_FORMAT(t.transaction_date, '%b %d, %Y %H:%i') as transaction_date,
                                  t.total_amount,
                                  COUNT(ti.item_id) as item_count,
                                  pm.method_name as payment_method,
                                  'pos' as transaction_type
                                  FROM pos_transactions t
                                  LEFT JOIN pos_transaction_items ti ON t.transaction_id = ti.transaction_id
                                  LEFT JOIN pos_transaction_payments tp ON t.transaction_id = tp.transaction_id
                                  LEFT JOIN pos_payment_methods pm ON tp.payment_method_id = pm.payment_method_id
                                  WHERE t.status = 'completed'
                                  GROUP BY t.transaction_id
                                  ORDER BY t.transaction_date DESC
                                  LIMIT 5";
    
    $recentPosTransactionsResult = mysqli_query($conn, $recentPosTransactionsQuery);
    $recentPosTransactions = [];
    
    while ($transaction = mysqli_fetch_assoc($recentPosTransactionsResult)) {
        // Format total amount
        $transaction['total_amount_formatted'] = '₱' . number_format($transaction['total_amount'], 2);
        $transaction['total_amount'] = floatval($transaction['total_amount']);
        $recentPosTransactions[] = $transaction;
    }
    
    // Recent Order Transactions
    $recentOrderTransactionsQuery = "SELECT 
                                    o.order_id as transaction_id, 
                                    o.customer_name, 
                                    DATE_FORMAT(o.order_date, '%b %d, %Y %H:%i') as transaction_date,
                                    o.total_amount,
                                    1 as item_count, -- Placeholder as we don't have order items table
                                    o.payment_method,
                                    'order' as transaction_type
                                    FROM orders o
                                    ORDER BY o.order_date DESC
                                    LIMIT 5";
    
    $recentOrderTransactionsResult = mysqli_query($conn, $recentOrderTransactionsQuery);
    $recentOrderTransactions = [];
    
    while ($transaction = mysqli_fetch_assoc($recentOrderTransactionsResult)) {
        // Format total amount
        $transaction['total_amount_formatted'] = '₱' . number_format($transaction['total_amount'], 2);
        $transaction['total_amount'] = floatval($transaction['total_amount']);
        $recentOrderTransactions[] = $transaction;
    }
    
    // Combine and sort transactions
    $recentTransactions = array_merge($recentPosTransactions, $recentOrderTransactions);
    
    // Sort by transaction date (descending)
    usort($recentTransactions, function($a, $b) {
        return strtotime($b['transaction_date']) - strtotime($a['transaction_date']);
    });
    
    // Limit to 5 most recent transactions
    $recentTransactions = array_slice($recentTransactions, 0, 5);
    
    // Set recent transactions in response
    $response['recent_transactions'] = $recentTransactions;

    // Return response as JSON
    echo json_encode($response);
} catch (Exception $e) {
    // Return error response
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>