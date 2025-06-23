<?php

// Set headers for JSON response
header('Content-Type: application/json');

// Include database connection
require_once 'db_connection.php';

// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Get period parameter
$period = isset($_GET['period']) ? $_GET['period'] : 'month';

date_default_timezone_set('Asia/Manila');

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

    // Retailer Sales
$retailerSalesQuery = "
SELECT SUM(rop.payment_amount) AS retailer_sales
FROM retailer_order_item_payments roip
JOIN retailer_order_payments rop ON roip.payment_id = rop.payment_id
WHERE roip.quantity_paid > 0
AND DATE(roip.created_at) BETWEEN ? AND ?";
$stmt = mysqli_prepare($conn, $retailerSalesQuery);
mysqli_stmt_bind_param($stmt, 'ss', $startDate, $endDate);
mysqli_stmt_execute($stmt);
$retailerSalesResult = mysqli_stmt_get_result($stmt);
$retailerSales = mysqli_fetch_assoc($retailerSalesResult)['retailer_sales'] ?? 0;

    // Total Sales
    $totalSales = $posSales + $orderSales + $retailerSales;

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

    // Previous Retailer Sales
$prevRetailerSalesQuery = "
SELECT SUM(rop.payment_amount) AS prev_retailer_sales
FROM retailer_order_item_payments roip
JOIN retailer_order_payments rop ON roip.payment_id = rop.payment_id
WHERE roip.quantity_paid > 0
AND DATE(roip.created_at) BETWEEN ? AND ?";
$stmt = mysqli_prepare($conn, $prevRetailerSalesQuery);
mysqli_stmt_bind_param($stmt, 'ss', $previousStartDate, $previousEndDate);
mysqli_stmt_execute($stmt);
$prevRetailerSalesResult = mysqli_stmt_get_result($stmt);
$prevRetailerSales = mysqli_fetch_assoc($prevRetailerSalesResult)['prev_retailer_sales'] ?? 0;

    // Previous Total Sales
    $prevTotalSales = $prevPosSales + $prevOrderSales + $prevRetailerSales;

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

    // Retailer Transactions
    $retailerTransactionsQuery = "SELECT COUNT(*) as retailer_transactions 
    FROM retailer_order_items 
    WHERE DATE(created_at) BETWEEN ? AND ?";
    $stmt = mysqli_prepare($conn, $retailerTransactionsQuery);
    mysqli_stmt_bind_param($stmt, 'ss', $startDate, $endDate);
    mysqli_stmt_execute($stmt);
    $retailerTransactionsResult = mysqli_stmt_get_result($stmt);
    $retailerTransactions = mysqli_fetch_assoc($retailerTransactionsResult)['retailer_transactions'] ?? 0;

    // Total Transactions
    $totalTransactions = $posTransactions + $orderTransactions + $retailerTransactions;

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

    // Previous Retailer Transactions
    $prevRetailerTransactionsQuery = "SELECT COUNT(*) as prev_retailer_transactions 
    FROM retailer_order_items 
    WHERE DATE(created_at) BETWEEN ? AND ?";
    $stmt = mysqli_prepare($conn, $prevRetailerTransactionsQuery);
    mysqli_stmt_bind_param($stmt, 'ss', $previousStartDate, $previousEndDate);
    mysqli_stmt_execute($stmt);
    $prevRetailerTransactionsResult = mysqli_stmt_get_result($stmt);
    $prevRetailerTransactions = mysqli_fetch_assoc($prevRetailerTransactionsResult)['prev_retailer_transactions'] ?? 0;

    // Previous Total Transactions
    $prevTotalTransactions = $prevPosTransactions + $prevOrderTransactions + $prevRetailerTransactions;

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
    // 1. POS: Total Items Sold
$itemsSoldQuery = "SELECT SUM(quantity) AS total_items_sold 
FROM pos_transaction_items ti
JOIN pos_transactions t ON ti.transaction_id = t.transaction_id
WHERE DATE(t.transaction_date) BETWEEN ? AND ?
AND t.status = 'completed'";
$stmt = mysqli_prepare($conn, $itemsSoldQuery);
mysqli_stmt_bind_param($stmt, 'ss', $startDate, $endDate);
mysqli_stmt_execute($stmt);
$itemsSoldResult = mysqli_stmt_get_result($stmt);
$totalItemsSoldPOS = mysqli_fetch_assoc($itemsSoldResult)['total_items_sold'] ?? 0;

// 2. Retailer: Total Items Sold
$retailerItemsQuery = "SELECT SUM(ri.quantity_paid) AS total_retailer_items_sold
    FROM retailer_order_item_payments ri
    JOIN retailer_order_payments rp ON ri.payment_id = rp.payment_id
    JOIN retailer_orders ro ON rp.order_id = ro.order_id
    WHERE DATE(ri.created_at) BETWEEN ? AND ?";
$retailerStmt = mysqli_prepare($conn, $retailerItemsQuery);
mysqli_stmt_bind_param($retailerStmt, 'ss', $startDate, $endDate);
mysqli_stmt_execute($retailerStmt);
$retailerItemsResult = mysqli_stmt_get_result($retailerStmt);
$totalItemsSoldRetailer = mysqli_fetch_assoc($retailerItemsResult)['total_retailer_items_sold'] ?? 0;

// 3. Combine Total Items Sold
$totalItemsSold = (int)$totalItemsSoldPOS + (int)$totalItemsSoldRetailer;

// 4. Previous POS Items Sold
$prevItemsSoldQuery = "SELECT SUM(quantity) AS prev_items_sold 
    FROM pos_transaction_items ti
    JOIN pos_transactions t ON ti.transaction_id = t.transaction_id
    WHERE DATE(t.transaction_date) BETWEEN ? AND ?
    AND t.status = 'completed'";
$stmt = mysqli_prepare($conn, $prevItemsSoldQuery);
mysqli_stmt_bind_param($stmt, 'ss', $previousStartDate, $previousEndDate);
mysqli_stmt_execute($stmt);
$prevItemsSoldResult = mysqli_stmt_get_result($stmt);
$prevItemsSoldPOS = mysqli_fetch_assoc($prevItemsSoldResult)['prev_items_sold'] ?? 0;

// 5. Previous Retailer Items Sold
$prevRetailerItemsQuery = "SELECT SUM(ri.quantity_paid) AS prev_retailer_items_sold
        FROM retailer_order_item_payments ri
        JOIN retailer_order_payments rp ON ri.payment_id = rp.payment_id
        JOIN retailer_orders ro ON rp.order_id = ro.order_id
        WHERE DATE(ri.created_at) BETWEEN ? AND ?";
$prevRetailerStmt = mysqli_prepare($conn, $prevRetailerItemsQuery);
mysqli_stmt_bind_param($prevRetailerStmt, 'ss', $previousStartDate, $previousEndDate);
mysqli_stmt_execute($prevRetailerStmt);
$prevRetailerItemsResult = mysqli_stmt_get_result($prevRetailerStmt);
$prevItemsSoldRetailer = mysqli_fetch_assoc($prevRetailerItemsResult)['prev_retailer_items_sold'] ?? 0;

// 6. Combine Previous Items Sold
$prevItemsSold = (int)$prevItemsSoldPOS + (int)$prevItemsSoldRetailer;

// 7. Growth Calculation
$itemsSoldGrowth = 0;
if ($prevItemsSold > 0) {
$itemsSoldGrowth = round((($totalItemsSold - $prevItemsSold) / $prevItemsSold) * 100, 1);
}

// 8. Final KPI Response
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



    


// 5. Sales Trend Data (combining POS, Orders, and Retailers)
$salesTrendLabels = [];
$salesTrendValues = [];

switch ($period) {
    case 'today':
        for ($i = 0; $i < 24; $i++) {
            $hour = str_pad($i, 2, '0', STR_PAD_LEFT);
            $salesTrendLabels[] = $hour . ':00';

            $hourStart = $today . ' ' . $hour . ':00:00';
            $hourEnd = $today . ' ' . $hour . ':59:59';

            // POS
            $stmt = mysqli_prepare($conn, "SELECT SUM(total_amount) FROM pos_transactions WHERE transaction_date BETWEEN ? AND ? AND status = 'completed'");
            mysqli_stmt_bind_param($stmt, 'ss', $hourStart, $hourEnd);
            mysqli_stmt_execute($stmt);
            $posSales = mysqli_fetch_row(mysqli_stmt_get_result($stmt))[0] ?? 0;

            // Orders
            $stmt = mysqli_prepare($conn, "SELECT SUM(total_amount) FROM orders WHERE order_date BETWEEN ? AND ? AND status IN ('delivered', 'completed')");
            mysqli_stmt_bind_param($stmt, 'ss', $hourStart, $hourEnd);
            mysqli_stmt_execute($stmt);
            $orderSales = mysqli_fetch_row(mysqli_stmt_get_result($stmt))[0] ?? 0;

            // Retailers
            $stmt = mysqli_prepare($conn, "SELECT SUM(rop.payment_amount) FROM retailer_order_item_payments roip JOIN retailer_order_payments rop ON roip.payment_id = rop.payment_id WHERE roip.quantity_paid > 0 AND roip.created_at BETWEEN ? AND ?");
            mysqli_stmt_bind_param($stmt, 'ss', $hourStart, $hourEnd);
            mysqli_stmt_execute($stmt);
            $retailerSales = mysqli_fetch_row(mysqli_stmt_get_result($stmt))[0] ?? 0;

            $salesTrendValues[] = $posSales + $orderSales + $retailerSales;
        }
        break;

    case 'week':
        for ($i = 6; $i >= 0; $i--) {
            $day = date('Y-m-d', strtotime("-$i days"));
            $salesTrendLabels[] = date('D', strtotime($day));
            $dayStart = $day . ' 00:00:00';
            $dayEnd = $day . ' 23:59:59';

            // POS
            $stmt = mysqli_prepare($conn, "SELECT SUM(total_amount) FROM pos_transactions WHERE transaction_date BETWEEN ? AND ? AND status = 'completed'");
            mysqli_stmt_bind_param($stmt, 'ss', $dayStart, $dayEnd);
            mysqli_stmt_execute($stmt);
            $posSales = mysqli_fetch_row(mysqli_stmt_get_result($stmt))[0] ?? 0;

            // Orders
            $stmt = mysqli_prepare($conn, "SELECT SUM(total_amount) FROM orders WHERE order_date BETWEEN ? AND ? AND status IN ('delivered', 'completed')");
            mysqli_stmt_bind_param($stmt, 'ss', $dayStart, $dayEnd);
            mysqli_stmt_execute($stmt);
            $orderSales = mysqli_fetch_row(mysqli_stmt_get_result($stmt))[0] ?? 0;

            // Retailers
            $stmt = mysqli_prepare($conn, "SELECT SUM(rop.payment_amount) FROM retailer_order_item_payments roip JOIN retailer_order_payments rop ON roip.payment_id = rop.payment_id WHERE roip.quantity_paid > 0 AND roip.created_at BETWEEN ? AND ?");
            mysqli_stmt_bind_param($stmt, 'ss', $dayStart, $dayEnd);
            mysqli_stmt_execute($stmt);
            $retailerSales = mysqli_fetch_row(mysqli_stmt_get_result($stmt))[0] ?? 0;

            $salesTrendValues[] = $posSales + $orderSales + $retailerSales;
        }
        break;

    case 'month':
        for ($i = 4; $i >= 1; $i--) {
            $weekStart = date('Y-m-d', strtotime("-" . ($i * 7) . " days"));
            $weekEnd = date('Y-m-d', strtotime("-" . (($i - 1) * 7 - 1) . " days"));
            $salesTrendLabels[] = 'Week ' . (5 - $i);

            // POS
            $stmt = mysqli_prepare($conn, "SELECT SUM(total_amount) FROM pos_transactions WHERE DATE(transaction_date) BETWEEN ? AND ? AND status = 'completed'");
            mysqli_stmt_bind_param($stmt, 'ss', $weekStart, $weekEnd);
            mysqli_stmt_execute($stmt);
            $posSales = mysqli_fetch_row(mysqli_stmt_get_result($stmt))[0] ?? 0;

            // Orders
            $stmt = mysqli_prepare($conn, "SELECT SUM(total_amount) FROM orders WHERE DATE(order_date) BETWEEN ? AND ? AND status IN ('delivered', 'completed')");
            mysqli_stmt_bind_param($stmt, 'ss', $weekStart, $weekEnd);
            mysqli_stmt_execute($stmt);
            $orderSales = mysqli_fetch_row(mysqli_stmt_get_result($stmt))[0] ?? 0;

            // Retailers
            $stmt = mysqli_prepare($conn, "SELECT SUM(rop.payment_amount) FROM retailer_order_item_payments roip JOIN retailer_order_payments rop ON roip.payment_id = rop.payment_id WHERE roip.quantity_paid > 0 AND DATE(roip.created_at) BETWEEN ? AND ?");
            mysqli_stmt_bind_param($stmt, 'ss', $weekStart, $weekEnd);
            mysqli_stmt_execute($stmt);
            $retailerSales = mysqli_fetch_row(mysqli_stmt_get_result($stmt))[0] ?? 0;

            $salesTrendValues[] = $posSales + $orderSales + $retailerSales;
        }
        break;

    case 'quarter':
        for ($i = 2; $i >= 0; $i--) {
            $monthStart = date('Y-m-01', strtotime("-$i months"));
            $monthEnd = date('Y-m-t', strtotime("-$i months"));
            $salesTrendLabels[] = date('M', strtotime($monthStart));

            // POS
            $stmt = mysqli_prepare($conn, "SELECT SUM(total_amount) FROM pos_transactions WHERE DATE(transaction_date) BETWEEN ? AND ? AND status = 'completed'");
            mysqli_stmt_bind_param($stmt, 'ss', $monthStart, $monthEnd);
            mysqli_stmt_execute($stmt);
            $posSales = mysqli_fetch_row(mysqli_stmt_get_result($stmt))[0] ?? 0;

            // Orders
            $stmt = mysqli_prepare($conn, "SELECT SUM(total_amount) FROM orders WHERE DATE(order_date) BETWEEN ? AND ? AND status IN ('delivered', 'completed')");
            mysqli_stmt_bind_param($stmt, 'ss', $monthStart, $monthEnd);
            mysqli_stmt_execute($stmt);
            $orderSales = mysqli_fetch_row(mysqli_stmt_get_result($stmt))[0] ?? 0;

            // Retailers
            $stmt = mysqli_prepare($conn, "SELECT SUM(rop.payment_amount) FROM retailer_order_item_payments roip JOIN retailer_order_payments rop ON roip.payment_id = rop.payment_id WHERE roip.quantity_paid > 0 AND DATE(roip.created_at) BETWEEN ? AND ?");
            mysqli_stmt_bind_param($stmt, 'ss', $monthStart, $monthEnd);
            mysqli_stmt_execute($stmt);
            $retailerSales = mysqli_fetch_row(mysqli_stmt_get_result($stmt))[0] ?? 0;

            $salesTrendValues[] = $posSales + $orderSales + $retailerSales;
        }
        break;

    case 'year':
        for ($i = 3; $i >= 0; $i--) {
            $quarterStart = date('Y-m-d', strtotime("-" . ($i * 3) . " months"));
            $quarterEnd = date('Y-m-d', strtotime("-" . (($i - 1) * 3) . " months - 1 day"));
            $salesTrendLabels[] = 'Q' . (4 - $i);

            // POS
            $stmt = mysqli_prepare($conn, "SELECT SUM(total_amount) FROM pos_transactions WHERE DATE(transaction_date) BETWEEN ? AND ? AND status = 'completed'");
            mysqli_stmt_bind_param($stmt, 'ss', $quarterStart, $quarterEnd);
            mysqli_stmt_execute($stmt);
            $posSales = mysqli_fetch_row(mysqli_stmt_get_result($stmt))[0] ?? 0;

            // Orders
            $stmt = mysqli_prepare($conn, "SELECT SUM(total_amount) FROM orders WHERE DATE(order_date) BETWEEN ? AND ? AND status IN ('delivered', 'completed')");
            mysqli_stmt_bind_param($stmt, 'ss', $quarterStart, $quarterEnd);
            mysqli_stmt_execute($stmt);
            $orderSales = mysqli_fetch_row(mysqli_stmt_get_result($stmt))[0] ?? 0;

            // Retailers
            $stmt = mysqli_prepare($conn, "SELECT SUM(rop.payment_amount) FROM retailer_order_item_payments roip JOIN retailer_order_payments rop ON roip.payment_id = rop.payment_id WHERE roip.quantity_paid > 0 AND DATE(roip.created_at) BETWEEN ? AND ?");
            mysqli_stmt_bind_param($stmt, 'ss', $quarterStart, $quarterEnd);
            mysqli_stmt_execute($stmt);
            $retailerSales = mysqli_fetch_row(mysqli_stmt_get_result($stmt))[0] ?? 0;

            $salesTrendValues[] = $posSales + $orderSales + $retailerSales;
        }
        break;
}

$response['sales_trend'] = [
    'labels' => $salesTrendLabels,
    'values' => $salesTrendValues
];











  // 6. Category Revenue Data (from POS and Retailers)

// --- POS Category Revenue ---
$posCategoryQuery = "
SELECT p.category, SUM(ti.total_price) AS revenue
FROM pos_transaction_items ti
JOIN products p ON ti.product_id = p.product_id
JOIN pos_transactions t ON ti.transaction_id = t.transaction_id
WHERE DATE(t.transaction_date) BETWEEN ? AND ?
AND t.status = 'completed'
GROUP BY p.category
";

$stmt = mysqli_prepare($conn, $posCategoryQuery);
mysqli_stmt_bind_param($stmt, 'ss', $startDate, $endDate);
mysqli_stmt_execute($stmt);
$posResult = mysqli_stmt_get_result($stmt);

$categoryRevenue = [];

while ($row = mysqli_fetch_assoc($posResult)) {
$category = $row['category'] ?: 'Other';
$categoryRevenue[$category] = ($categoryRevenue[$category] ?? 0) + $row['revenue'];
}

// --- Retailer Category Revenue (using products.price) ---
$retailerCategoryQuery = "
SELECT p.category, SUM(roip.quantity_paid * p.price) AS revenue
FROM retailer_order_item_payments roip
JOIN products p ON roip.product_id = p.product_id
JOIN retailer_order_payments rop ON roip.payment_id = rop.payment_id
WHERE roip.quantity_paid > 0
AND DATE(roip.created_at) BETWEEN ? AND ?
GROUP BY p.category
";

$stmt = mysqli_prepare($conn, $retailerCategoryQuery);
mysqli_stmt_bind_param($stmt, 'ss', $startDate, $endDate);
mysqli_stmt_execute($stmt);
$retailerResult = mysqli_stmt_get_result($stmt);

while ($row = mysqli_fetch_assoc($retailerResult)) {
$category = $row['category'] ?: 'Other';
$categoryRevenue[$category] = ($categoryRevenue[$category] ?? 0) + $row['revenue'];
}

// --- Final Output ---
arsort($categoryRevenue); // Sort by revenue descending

$categoryLabels = array_keys($categoryRevenue);
$categoryValues = array_values($categoryRevenue);
$totalRevenue = array_sum($categoryRevenue);

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





    // Payment method normalization mapping (use lowercase keys)
$paymentMethodMap = [
    'cash' => 'Cash',
    'credit' => 'Credit Card',
    'debit' => 'Debit Card',
    'mobile' => 'Mobile Payment',
    'bank' => 'Bank Transfer'
];

// Normalize function trims, lowercases, and maps consistently
function normalizePaymentMethod($rawName, $map) {
    $normalized = strtolower(trim($rawName));
    return $map[$normalized] ?? ucwords($normalized); // Fallback for unexpected values
}

$paymentMethodsLabels = [];
$paymentMethodsValues = [];

// Step 1: POS payment methods
$paymentMethodsQuery = "SELECT pm.method_name, SUM(tp.amount) as total
                        FROM pos_transaction_payments tp
                        JOIN pos_payment_methods pm ON tp.payment_method_id = pm.payment_method_id
                        JOIN pos_transactions t ON tp.transaction_id = t.transaction_id
                        WHERE DATE(t.transaction_date) BETWEEN ? AND ?
                        AND t.status = 'completed'
                        GROUP BY pm.method_name";

$stmt = mysqli_prepare($conn, $paymentMethodsQuery);
mysqli_stmt_bind_param($stmt, 'ss', $startDate, $endDate);
mysqli_stmt_execute($stmt);
$paymentMethodsResult = mysqli_stmt_get_result($stmt);

while ($method = mysqli_fetch_assoc($paymentMethodsResult)) {
    $standardName = normalizePaymentMethod($method['method_name'], $paymentMethodMap);
    $index = array_search($standardName, $paymentMethodsLabels);

    if ($index !== false) {
        $paymentMethodsValues[$index] += $method['total'];
    } else {
        $paymentMethodsLabels[] = $standardName;
        $paymentMethodsValues[] = $method['total'];
    }
}

// Step 2: Orders payment methods
$orderPaymentMethodsQuery = "SELECT payment_method, SUM(total_amount) as total
                             FROM orders
                             WHERE DATE(order_date) BETWEEN ? AND ?
                             AND status IN ('delivered', 'completed')
                             GROUP BY payment_method";

$stmt = mysqli_prepare($conn, $orderPaymentMethodsQuery);
mysqli_stmt_bind_param($stmt, 'ss', $startDate, $endDate);
mysqli_stmt_execute($stmt);
$orderPaymentMethodsResult = mysqli_stmt_get_result($stmt);

while ($method = mysqli_fetch_assoc($orderPaymentMethodsResult)) {
    $standardName = normalizePaymentMethod($method['payment_method'], $paymentMethodMap);
    $index = array_search($standardName, $paymentMethodsLabels);

    if ($index !== false) {
        $paymentMethodsValues[$index] += $method['total'];
    } else {
        $paymentMethodsLabels[] = $standardName;
        $paymentMethodsValues[] = $method['total'];
    }
}

// Step 3: Retailer payment methods
$retailerPaymentMethodsQuery = "SELECT rop.payment_method, SUM(rop.payment_amount) as total
                                FROM retailer_order_item_payments roip
                                JOIN retailer_order_payments rop ON roip.payment_id = rop.payment_id
                                JOIN retailer_orders ro ON rop.order_id = ro.order_id
                                WHERE roip.quantity_paid > 0
                                AND DATE(ro.created_at) BETWEEN ? AND ?
                                GROUP BY rop.payment_method";

$stmt = mysqli_prepare($conn, $retailerPaymentMethodsQuery);
mysqli_stmt_bind_param($stmt, 'ss', $startDate, $endDate);
mysqli_stmt_execute($stmt);
$retailerPaymentMethodsResult = mysqli_stmt_get_result($stmt);

while ($method = mysqli_fetch_assoc($retailerPaymentMethodsResult)) {
    $standardName = normalizePaymentMethod($method['payment_method'], $paymentMethodMap);
    $index = array_search($standardName, $paymentMethodsLabels);

    if ($index !== false) {
        $paymentMethodsValues[$index] += $method['total'];
    } else {
        $paymentMethodsLabels[] = $standardName;
        $paymentMethodsValues[] = $method['total'];
    }
}

// Optional: Sort by total descending
$combined = array_map(null, $paymentMethodsLabels, $paymentMethodsValues);
usort($combined, function($a, $b) {
    return $b[1] <=> $a[1];
});
$paymentMethodsLabels = array_column($combined, 0);
$paymentMethodsValues = array_column($combined, 1);

// Final response for dashboard
$response['payment_methods'] = [
    'labels' => $paymentMethodsLabels,
    'values' => $paymentMethodsValues
];






    
// 9. Top Products Data (POS + Retailers)

// POS Query
$topProductsQuery = "SELECT 
                    ti.product_id,
                    ti.product_name,
                    p.category,
                    SUM(ti.quantity) as units_sold,
                    SUM(ti.total_price) as revenue
                    FROM pos_transaction_items ti
                    JOIN products p ON ti.product_id = p.product_id
                    JOIN pos_transactions t ON ti.transaction_id = t.transaction_id
                    WHERE DATE(t.transaction_date) BETWEEN ? AND ?
                    AND t.status = 'completed'
                    GROUP BY ti.product_id";

// Retailer Query
$retailerTopProductsQuery = "SELECT 
                            p.product_id,
                            p.product_name,
                            p.category,
                            SUM(roip.quantity_paid) as units_sold,
                            SUM(roip.quantity_paid * p.price) as revenue
                            FROM retailer_order_item_payments roip
                            JOIN retailer_order_payments rop ON roip.payment_id = rop.payment_id
                            JOIN retailer_order_items roi ON rop.order_id = roi.order_id AND roi.product_id = roip.product_id
                            JOIN products p ON roi.product_id = p.product_id
                            JOIN retailer_orders ro ON rop.order_id = ro.order_id
                            WHERE DATE(ro.created_at) BETWEEN ? AND ?
                            GROUP BY p.product_id";

// Initialize containers
$allProducts = [];

// POS Execution
$stmt = mysqli_prepare($conn, $topProductsQuery);
mysqli_stmt_bind_param($stmt, 'ss', $startDate, $endDate);
mysqli_stmt_execute($stmt);
$posResult = mysqli_stmt_get_result($stmt);

while ($product = mysqli_fetch_assoc($posResult)) {
    $id = $product['product_id'];
    $allProducts[$id] = [
        'product_name' => $product['product_name'],
        'category' => $product['category'],
        'units_sold' => intval($product['units_sold']),
        'revenue' => floatval($product['revenue'])
    ];
}

// Retailer Execution
$stmt = mysqli_prepare($conn, $retailerTopProductsQuery);
mysqli_stmt_bind_param($stmt, 'ss', $startDate, $endDate);
mysqli_stmt_execute($stmt);
$retailerResult = mysqli_stmt_get_result($stmt);

while ($product = mysqli_fetch_assoc($retailerResult)) {
    $id = $product['product_id'];
    if (isset($allProducts[$id])) {
        $allProducts[$id]['units_sold'] += intval($product['units_sold']);
        $allProducts[$id]['revenue'] += floatval($product['revenue']);
    } else {
        $allProducts[$id] = [
            'product_name' => $product['product_name'],
            'category' => $product['category'],
            'units_sold' => intval($product['units_sold']),
            'revenue' => floatval($product['revenue'])
        ];
    }
}

$sortBy = $_GET['sort_by'] ?? 'revenue'; // or 'units_sold'

usort($allProducts, function ($a, $b) use ($sortBy) {
    return $b[$sortBy] <=> $a[$sortBy];
});


// Limit to Top 5
$topProducts = array_slice($allProducts, 0, 5);

// Format revenue
foreach ($topProducts as &$product) {
    $product['revenue_formatted'] = '₱' . number_format($product['revenue'], 2);
}

// Set response
$response['top_products'] = $topProducts;





    // 10. Recent Transactions (combining POS, Orders, Retailers)
// Date-filtered POS Transactions
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
WHERE t.status = 'completed' AND DATE(t.transaction_date) BETWEEN ? AND ?
GROUP BY t.transaction_id
ORDER BY t.transaction_date DESC
LIMIT 5";

$stmt = mysqli_prepare($conn, $recentPosTransactionsQuery);
mysqli_stmt_bind_param($stmt, 'ss', $startDate, $endDate);
mysqli_stmt_execute($stmt);
$recentPosTransactionsResult = mysqli_stmt_get_result($stmt);
$recentPosTransactions = [];

while ($transaction = mysqli_fetch_assoc($recentPosTransactionsResult)) {
$transaction['total_amount_formatted'] = '₱' . number_format($transaction['total_amount'], 2);
$transaction['total_amount'] = floatval($transaction['total_amount']);
$recentPosTransactions[] = $transaction;
}

// Date-filtered Order Transactions
$recentOrderTransactionsQuery = "SELECT 
o.order_id as transaction_id, 
o.customer_name, 
DATE_FORMAT(o.order_date, '%b %d, %Y %H:%i') as transaction_date,
o.total_amount,
1 as item_count,
o.payment_method,
'order' as transaction_type
FROM orders o
WHERE DATE(o.order_date) BETWEEN ? AND ?
ORDER BY o.order_date DESC
LIMIT 5";

$stmt = mysqli_prepare($conn, $recentOrderTransactionsQuery);
mysqli_stmt_bind_param($stmt, 'ss', $startDate, $endDate);
mysqli_stmt_execute($stmt);
$recentOrderTransactionsResult = mysqli_stmt_get_result($stmt);
$recentOrderTransactions = [];

while ($transaction = mysqli_fetch_assoc($recentOrderTransactionsResult)) {
$transaction['total_amount_formatted'] = '₱' . number_format($transaction['total_amount'], 2);
$transaction['total_amount'] = floatval($transaction['total_amount']);
$recentOrderTransactions[] = $transaction;
}

// Date-filtered Retailer Transactions
$recentRetailerTransactionsQuery = "SELECT 
roi.order_id as transaction_id,
ro.retailer_name as customer_name,
DATE_FORMAT(MAX(roi.created_at), '%b %d, %Y %H:%i') as transaction_date,
SUM(roi.total_price) as total_amount,
SUM(roi.quantity) as item_count,
'Under Consignment' as payment_method,
'retailer' as transaction_type
FROM retailer_order_items roi
LEFT JOIN retailer_orders ro ON roi.order_id = ro.order_id
WHERE DATE(roi.created_at) BETWEEN ? AND ?
GROUP BY roi.order_id
ORDER BY MAX(roi.created_at) DESC
LIMIT 5";

$stmt = mysqli_prepare($conn, $recentRetailerTransactionsQuery);
mysqli_stmt_bind_param($stmt, 'ss', $startDate, $endDate);
mysqli_stmt_execute($stmt);
$recentRetailerTransactionsResult = mysqli_stmt_get_result($stmt);
$recentRetailerTransactions = [];

while ($transaction = mysqli_fetch_assoc($recentRetailerTransactionsResult)) {
$transaction['total_amount_formatted'] = '₱' . number_format($transaction['total_amount'], 2);
$transaction['total_amount'] = floatval($transaction['total_amount']);
$recentRetailerTransactions[] = $transaction;
}

    
   
 $recentTransactions = array_merge(
    $recentPosTransactions,
    $recentOrderTransactions,
    $recentRetailerTransactions
);

usort($recentTransactions, function($a, $b) {
    return strtotime($b['transaction_date']) - strtotime($a['transaction_date']);
});

$recentTransactions = array_slice($recentTransactions, 0, 5);
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