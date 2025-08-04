<?php
// DEBUG: show every error/warning
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Set headers for JSON response
header('Content-Type: application/json');

// Ensure PHP "today" matches your charts
date_default_timezone_set('Asia/Manila');

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
    $totalProfit = 0;
    $totalOrders = 0;

    // —— POS metrics —— 
    if ($channel === 'all' || $channel === 'POS') {
        $posQuery = "
            SELECT 
                COUNT(DISTINCT ptp.transaction_id) AS order_count,
                SUM(pti.total_price) AS total_sales,
                SUM(pti.total_price - ((pr.total_production_cost / pr.batch_size) * pti.quantity)) AS total_profit
            FROM pos_transaction_payments ptp
            JOIN pos_transaction_items pti ON pti.transaction_id = ptp.transaction_id
            LEFT JOIN products p ON pti.product_id = p.product_id
            LEFT JOIN productions pr ON p.product_id = pr.product_id
            WHERE DATE(ptp.payment_date) BETWEEN ? AND ?
            AND ptp.payment_status = 'completed'
        ";

        // add category filter if needed
        if ($category !== 'all') {
            $posQuery .= " AND p.category = ?";
            $posStmt = $conn->prepare($posQuery);
            $posStmt->bind_param("sss", $startDate, $endDate, $category);
        } else {
            $posStmt = $conn->prepare($posQuery);
            $posStmt->bind_param("ss", $startDate, $endDate);
        }

        $posStmt->execute();
        $posStmt->bind_result($posOrders, $posSales, $posProfit);
        $posStmt->fetch();
        $posStmt->close();

        $totalOrders += intval($posOrders ?? 0);
        $totalSales += floatval($posSales ?? 0);
        $totalProfit += floatval($posProfit ?? 0);
    }

    // —— Retailer metrics ——
    if ($channel === 'all' || $channel === 'Retailer') {
        $retailerQuery = "
            SELECT 
                COUNT(DISTINCT rop.order_id) AS order_count,
                SUM(roi.total_price) AS total_sales,
                SUM(roi.total_price - ((pr.total_production_cost / pr.batch_size) * roi.unit_price)) AS total_profit
            FROM retailer_order_payments rop
            JOIN retailer_orders ro ON ro.order_id = rop.order_id
            JOIN retailer_order_items roi ON roi.order_id = ro.order_id
            LEFT JOIN products p ON roi.product_id = p.product_id
            LEFT JOIN productions pr ON p.product_id = pr.product_id
            WHERE DATE(rop.created_at) BETWEEN ? AND ?
            AND (ro.payment_status = 'paid' OR ro.payment_status = 'completed')
        ";

        // add category filter if needed
        if ($category !== 'all') {
            $retailerQuery .= " AND p.category = ?";
            $retailerStmt = $conn->prepare($retailerQuery);
            $retailerStmt->bind_param("sss", $startDate, $endDate, $category);
        } else {
            $retailerStmt = $conn->prepare($retailerQuery);
            $retailerStmt->bind_param("ss", $startDate, $endDate);
        }

        $retailerStmt->execute();
        $retailerStmt->bind_result($retOrders, $retSales, $retProfit);
        $retailerStmt->fetch();
        $retailerStmt->close();

        $totalOrders += intval($retOrders ?? 0);
        $totalSales += floatval($retSales ?? 0);
        $totalProfit += floatval($retProfit ?? 0);
    }

    // Calculate final metrics
    $profitMargin = $totalSales > 0 ? ($totalProfit / $totalSales) * 100 : 0;
    $averageOrder = $totalOrders > 0 ? $totalSales / $totalOrders : 0;

    // Populate response
    $response['metrics'] = [
        'totalSales' => $totalSales,
        'totalProfit' => $totalProfit,
        'profitMargin' => round($profitMargin, 2),
        'averageOrder' => round($averageOrder, 2),
        'totalOrders' => $totalOrders
    ];

} catch (Exception $e) {
    $response['status'] = 'error';
    $response['message'] = 'Error calculating metrics: ' . $e->getMessage();
}

// Close connection and output
$conn->close();
echo json_encode($response);
?>