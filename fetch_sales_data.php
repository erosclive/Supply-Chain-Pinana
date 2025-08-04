<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");
ini_set('display_errors', 1);
error_reporting(E_ALL);

// Include your database connection
require_once 'db_connection.php';

// === SANITY CONFIG ===
$sanityProjectId = '29vxjvjm';
$sanityDataset = 'production';
$sanityToken = 'skMGJManAgirosEUNqE7NdVRckrSjvu8pf4PqjM4tlxyt9SqizUDbVCHYKp8ITfvuPFVo5WXyxlFTRWjyxp0DAgGSl1sJ4peUXjU2yo8yHi4ancQ2jBJ0UM72m57wW8Uvy6RoJUuBxDDnPjHlL4N5MWQaKCJe88zdh7L3fvJcC5h4dU6ClOj';

// === DATE RANGE (Optional - if not provided, get ALL data) ===
$startDate = $_GET['start_date'] ?? null;
$endDate = $_GET['end_date'] ?? null;

// === CHANNEL FILTER ===
$channel = $_GET['channel'] ?? 'all'; // all, pos, retailer, ecommerce

try {
    // Check if database connection exists
    if (!$conn) {
        throw new Exception("Database connection not available");
    }
    
    // Initialize sales data
    $salesData = [];
    $totalSales = 0;
    
    // Build POS Sales Query - ONLY records with valid dates
    if ($startDate && $endDate) {
        $posSalesQuery = "SELECT SUM(total_amount) as pos_sales
                          FROM pos_transactions
                          WHERE DATE(transaction_date) BETWEEN ? AND ?
                          AND status = 'completed'
                          AND transaction_date IS NOT NULL
                          AND transaction_date != '0000-00-00'
                          AND transaction_date != ''";
    } else {
        $posSalesQuery = "SELECT SUM(total_amount) as pos_sales
                          FROM pos_transactions
                          WHERE status = 'completed'
                          AND transaction_date IS NOT NULL
                          AND transaction_date != '0000-00-00'
                          AND transaction_date != ''";
    }
    
    $stmt = mysqli_prepare($conn, $posSalesQuery);
    if (!$stmt) {
        throw new Exception("POS query preparation failed: " . mysqli_error($conn));
    }
    
    if ($startDate && $endDate) {
        mysqli_stmt_bind_param($stmt, 'ss', $startDate, $endDate);
    }
    
    mysqli_stmt_execute($stmt);
    $posSalesResult = mysqli_stmt_get_result($stmt);
    $posSales = mysqli_fetch_assoc($posSalesResult)['pos_sales'] ?? 0;
    mysqli_stmt_close($stmt);
    
    // Build Order Sales Query - ONLY records with valid dates
    if ($startDate && $endDate) {
        $orderSalesQuery = "SELECT SUM(total_amount) as order_sales
                            FROM orders
                            WHERE DATE(order_date) BETWEEN ? AND ?
                            AND status IN ('delivered', 'completed')
                            AND order_date IS NOT NULL
                            AND order_date != '0000-00-00'
                            AND order_date != ''";
    } else {
        $orderSalesQuery = "SELECT SUM(total_amount) as order_sales
                            FROM orders
                            WHERE status IN ('delivered', 'completed')
                            AND order_date IS NOT NULL
                            AND order_date != '0000-00-00'
                            AND order_date != ''";
    }
    
    $stmt = mysqli_prepare($conn, $orderSalesQuery);
    if (!$stmt) {
        throw new Exception("Orders query preparation failed: " . mysqli_error($conn));
    }
    
    if ($startDate && $endDate) {
        mysqli_stmt_bind_param($stmt, 'ss', $startDate, $endDate);
    }
    
    mysqli_stmt_execute($stmt);
    $orderSalesResult = mysqli_stmt_get_result($stmt);
    $orderSales = mysqli_fetch_assoc($orderSalesResult)['order_sales'] ?? 0;
    mysqli_stmt_close($stmt);
    
    // Build Retailer Sales Query - ONLY records with valid dates and paid status
    if ($startDate && $endDate) {
        $retailerSalesQuery = "SELECT SUM(total_amount) AS retailer_sales
                               FROM retailer_orders 
                               WHERE DATE(created_at) BETWEEN ? AND ?
                               AND created_at IS NOT NULL
                               AND created_at != '0000-00-00'
                               AND created_at != ''
                               AND payment_status = 'paid'";
    } else {
        $retailerSalesQuery = "SELECT SUM(total_amount) AS retailer_sales
                               FROM retailer_orders
                               WHERE created_at IS NOT NULL
                               AND created_at != '0000-00-00'
                               AND created_at != ''
                               AND payment_status = 'paid'";
    }
    
    $stmt = mysqli_prepare($conn, $retailerSalesQuery);
    if (!$stmt) {
        throw new Exception("Retailer query preparation failed: " . mysqli_error($conn));
    }
    
    if ($startDate && $endDate) {
        mysqli_stmt_bind_param($stmt, 'ss', $startDate, $endDate);
    }
    
    mysqli_stmt_execute($stmt);
    $retailerSalesResult = mysqli_stmt_get_result($stmt);
    $retailerSales = mysqli_fetch_assoc($retailerSalesResult)['retailer_sales'] ?? 0;
    mysqli_stmt_close($stmt);
    
    // === FETCH E-COMMERCE SALES FROM SANITY ===
    $ecommerceSales = 0;
    
    try {
        // Build Sanity query with date filter if provided
        if ($startDate && $endDate) {
            $query = '*[_type == "order" && status == "delivered" && orderDate >= "' . $startDate . '" && orderDate <= "' . $endDate . '"]{
                orderNumber,
                orderDate,
                totalPrice,
                amountDiscount
            }';
        } else {
            $query = '*[_type == "order" && status == "delivered"]{
                orderNumber,
                orderDate,
                totalPrice,
                amountDiscount
            }';
        }
        
        $url = "https://$sanityProjectId.api.sanity.io/v2023-01-01/data/query/$sanityDataset?query=" . urlencode($query);
        
        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_HTTPHEADER, ["Authorization: Bearer $sanityToken"]);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 10); // 10 second timeout
        
        $response = curl_exec($ch);
        
        if ($response === false) {
            throw new Exception("E-commerce API error: " . curl_error($ch));
        }
        
        curl_close($ch);
        
        $sanityData = json_decode($response, true);
        
        if (json_last_error() !== JSON_ERROR_NONE) {
            throw new Exception("E-commerce JSON decode error: " . json_last_error_msg());
        }
        
        $ecommerceOrders = $sanityData['result'] ?? [];
        
        // Calculate e-commerce sales total - only orders with valid dates
        foreach ($ecommerceOrders as $order) {
            // Only include orders with valid dates
            if (isset($order['orderDate']) && !empty($order['orderDate'])) {
                $orderDate = date('Y-m-d', strtotime($order['orderDate']));
                
                // Additional date validation
                if ($orderDate && $orderDate !== '1970-01-01') {
                    $ecommerceSales += floatval($order['totalPrice'] ?? 0);
                }
            }
        }
        
    } catch (Exception $e) {
        // Log e-commerce error but don't fail the entire request
        error_log("E-commerce fetch error: " . $e->getMessage());
        $ecommerceSales = 0;
    }
    
    // Convert to float to handle null values
    $posSales = floatval($posSales);
    $orderSales = floatval($orderSales);
    $retailerSales = floatval($retailerSales);
    $ecommerceSales = floatval($ecommerceSales);
    
    // Calculate total sales (POS + Orders + Retailer + E-commerce)
    $totalSales = $posSales + $orderSales + $retailerSales + $ecommerceSales;
    
    // Prepare sales data based on channel filter
    if ($channel === 'all' || $channel === 'pos') {
        $salesData['POS'] = [
            'amount' => $posSales,
            'percentage' => $totalSales > 0 ? round(($posSales / $totalSales) * 100, 2) : 0
        ];
    }
    
    if ($channel === 'all' || $channel === 'retailer') {
        $salesData['Retailer'] = [
            'amount' => $orderSales + $retailerSales, // Combine orders + retailer_orders
            'percentage' => $totalSales > 0 ? round((($orderSales + $retailerSales) / $totalSales) * 100, 2) : 0
        ];
    }
    
    if ($channel === 'all' || $channel === 'ecommerce') {
        $salesData['E-commerce'] = [
            'amount' => $ecommerceSales,
            'percentage' => $totalSales > 0 ? round(($ecommerceSales / $totalSales) * 100, 2) : 0
        ];
    }
    
    // If filtering by specific channel, recalculate percentages
    if ($channel !== 'all') {
        $filteredTotal = 0;
        foreach ($salesData as $channelData) {
            $filteredTotal += $channelData['amount'];
        }
        
        foreach ($salesData as $channelName => &$channelData) {
            $channelData['percentage'] = 100; // Single channel = 100%
        }
        $totalSales = $filteredTotal;
    }
    
    // Return response in format expected by Sales Distribution Reports
    $response = [
        'success' => true,
        'data' => [
            'salesData' => $salesData,
            'totalSales' => $totalSales,
            'channel' => $channel,
            'dateRange' => $startDate && $endDate ? "From $startDate to $endDate" : "All time",
            'breakdown' => [
                'pos_sales' => $posSales,
                'order_sales' => $orderSales,
                'retailer_sales' => $retailerSales,
                'ecommerce_sales' => $ecommerceSales,
                'total_with_valid_dates' => $totalSales
            ]
        ]
    ];
    
    header('Content-Type: application/json');
    echo json_encode($response, JSON_PRETTY_PRINT);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage(),
        'timestamp' => date('Y-m-d H:i:s')
    ]);
} finally {
    // Close connection if it exists
    if (isset($conn) && $conn) {
        mysqli_close($conn);
    }
}
?>