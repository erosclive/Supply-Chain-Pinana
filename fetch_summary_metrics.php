<?php
// Set headers for JSON response
header('Content-Type: application/json');

// Include database configuration
require_once 'db_connection.php';

// Get request parameters
$startDate = isset($_GET['startDate']) ? $_GET['startDate'] : date('Y-m-d', strtotime('-30 days'));
$endDate = isset($_GET['endDate']) ? $_GET['endDate'] : date('Y-m-d');
$channel = isset($_GET['channel']) ? $_GET['channel'] : 'all';
$category = isset($_GET['category']) ? $_GET['category'] : 'all';

// Initialize response array
$response = [
    'status' => 'success',
    'metrics' => [
        'totalSales' => 0,
        'totalProfit' => 0,
        'profitMargin' => 0,
        'averageOrder' => 0,
        'totalOrders' => 0
    ],
    'message' => ''
];

try {
    $totalSales = 0;
    $totalCost = 0;
    $totalOrders = 0;
    
    // Calculate metrics for POS
    if ($channel === 'all' || $channel === 'POS') {
        $posQuery = "
            SELECT 
                COUNT(DISTINCT ptp.transaction_id) as order_count,
                SUM(pti.total_price) as total_sales,
                SUM(p.price * pti.quantity) as total_cost
            FROM 
                pos_transaction_payments ptp
            JOIN 
                pos_transaction_items pti ON ptp.transaction_id = pti.transaction_id
            LEFT JOIN 
                products p ON pti.product_id = p.product_id
            WHERE 
                ptp.payment_date BETWEEN ? AND ?
                AND ptp.payment_status = 'completed'
        ";
        
        // Add category filter if applicable
        if ($category !== 'all') {
            $posQuery .= " AND p.category = ?";
            $posStmt = $conn->prepare($posQuery);
            $posStmt->bind_param("sss", $startDate, $endDate, $category);
        } else {
            $posStmt = $conn->prepare($posQuery);
            $posStmt->bind_param("ss", $startDate, $endDate);
        }
        
        $posStmt->execute();
        $posResult = $posStmt->get_result();
        
        if ($row = $posResult->fetch_assoc()) {
            $totalSales += floatval($row['total_sales'] ?: 0);
            $totalCost += floatval($row['total_cost'] ?: 0);
            $totalOrders += intval($row['order_count'] ?: 0);
        }
        
        $posStmt->close();
    }
    
    // Calculate metrics for Retailer
    if ($channel === 'all' || $channel === 'Retailer') {
        $retailerQuery = "
            SELECT 
                COUNT(DISTINCT ro.order_id) as order_count,
                SUM(roi.total_price) as total_sales,
                SUM(p.price * roi.quantity) as total_cost
            FROM 
                retailer_orders ro
            JOIN 
                retailer_order_items roi ON ro.order_id = roi.order_id
            LEFT JOIN 
                products p ON roi.product_id = p.product_id
            WHERE 
                ro.order_date BETWEEN ? AND ?
                AND (ro.payment_status = 'paid' OR ro.payment_status = 'completed')
        ";
        
        // Add category filter if applicable
        if ($category !== 'all') {
            $retailerQuery .= " AND p.category = ?";
            $retailerStmt = $conn->prepare($retailerQuery);
            $retailerStmt->bind_param("sss", $startDate, $endDate, $category);
        } else {
            $retailerStmt = $conn->prepare($retailerQuery);
            $retailerStmt->bind_param("ss", $startDate, $endDate);
        }
        
        $retailerStmt->execute();
        $retailerResult = $retailerStmt->get_result();
        
        if ($row = $retailerResult->fetch_assoc()) {
            $totalSales += floatval($row['total_sales'] ?: 0);
            $totalCost += floatval($row['total_cost'] ?: 0);
            $totalOrders += intval($row['order_count'] ?: 0);
        }
        
        $retailerStmt->close();
    }
    
    // Calculate metrics
    $totalProfit = $totalSales - $totalCost;
    $profitMargin = $totalSales > 0 ? ($totalProfit / $totalSales) * 100 : 0;
    $averageOrder = $totalOrders > 0 ? $totalSales / $totalOrders : 0;
    
    // Set response metrics
    $response['metrics'] = [
        'totalSales' => $totalSales,
        'totalProfit' => $totalProfit,
        'profitMargin' => $profitMargin,
        'averageOrder' => $averageOrder,
        'totalOrders' => $totalOrders
    ];
    
} catch (Exception $e) {
    $response['status'] = 'error';
    $response['message'] = 'Error calculating metrics: ' . $e->getMessage();
}

// Close database connection
$conn->close();

// Return JSON response
echo json_encode($response);
?>