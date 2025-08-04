<?php
// Set headers for JSON response
header('Content-Type: application/json');

// Include database configuration
require_once 'db_connection.php';

// Get request parameters
$startDate = isset($_GET['startDate']) ? $_GET['startDate'] : date('Y-m-d', strtotime('-30 days'));
$endDate = isset($_GET['endDate']) ? $_GET['endDate'] : date('Y-m-d');
$channel = isset($_GET['channel']) ? $_GET['channel'] : 'all';

// Initialize response array
$response = [
    'status' => 'success',
    'data' => [
        'labels' => [],
        'sales' => [],
        'costs' => [],
        'profits' => [],
        'margins' => [],
        'byChannel' => []
    ],
    'message' => ''
];

try {
    // Generate date range
    $period = new DatePeriod(
        new DateTime($startDate),
        new DateInterval('P1D'),
        (new DateTime($endDate))->modify('+1 day')
    );
    
    $dateLabels = [];
    $profitByDate = [];
    
    // Initialize profit data for each date
    foreach ($period as $date) {
        $dateStr = $date->format('Y-m-d');
        $dateLabels[] = $dateStr;
        $profitByDate[$dateStr] = [
            'sales' => 0,
            'costs' => 0
        ];
    }
    
    // Fetch POS data if channel is 'all' or 'POS'
    if ($channel === 'all' || $channel === 'POS') {
        $posQuery = "
            SELECT 
                DATE(ptp.payment_date) as sale_date,
                SUM(pti.total_price) as total_sales,
                SUM(p.price * pti.quantity) as total_costs
            FROM 
                pos_transaction_payments ptp
            JOIN 
                pos_transaction_items pti ON ptp.transaction_id = pti.transaction_id
            LEFT JOIN 
                products p ON pti.product_id = p.product_id
            WHERE 
                ptp.payment_date BETWEEN ? AND ?
                AND ptp.payment_status = 'completed'
            GROUP BY 
                DATE(ptp.payment_date)
        ";
        
        $posStmt = $conn->prepare($posQuery);
        $posStmt->bind_param("ss", $startDate, $endDate);
        $posStmt->execute();
        $posResult = $posStmt->get_result();
        
        while ($row = $posResult->fetch_assoc()) {
            $date = $row['sale_date'];
            if (isset($profitByDate[$date])) {
                $profitByDate[$date]['sales'] += floatval($row['total_sales']);
                $profitByDate[$date]['costs'] += floatval($row['total_costs']);
            }
        }
        
        $posStmt->close();
    }
    
    // Fetch Retailer data if channel is 'all' or 'Retailer'
    if ($channel === 'all' || $channel === 'Retailer') {
        $retailerQuery = "
            SELECT 
                DATE(ro.order_date) as sale_date,
                SUM(roi.total_price) as total_sales,
                SUM(p.price * roi.quantity) as total_costs
            FROM 
                retailer_orders ro
            JOIN 
                retailer_order_items roi ON ro.order_id = roi.order_id
            LEFT JOIN 
                products p ON roi.product_id = p.product_id
            WHERE 
                ro.order_date BETWEEN ? AND ?
                AND (ro.payment_status = 'paid' OR ro.payment_status = 'completed')
            GROUP BY 
                DATE(ro.order_date)
        ";
        
        $retailerStmt = $conn->prepare($retailerQuery);
        $retailerStmt->bind_param("ss", $startDate, $endDate);
        $retailerStmt->execute();
        $retailerResult = $retailerStmt->get_result();
        
        while ($row = $retailerResult->fetch_assoc()) {
            $date = $row['sale_date'];
            if (isset($profitByDate[$date])) {
                $profitByDate[$date]['sales'] += floatval($row['total_sales']);
                $profitByDate[$date]['costs'] += floatval($row['total_costs']);
            }
        }
        
        $retailerStmt->close();
    }
    
    // Calculate profit margins by channel
    $profitByChannel = [];
    
    if ($channel === 'all' || $channel === 'POS') {
        $posTotalQuery = "
            SELECT 
                SUM(pti.total_price) as total_sales,
                SUM(p.price * pti.quantity) as total_costs
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
        
        $posTotalStmt = $conn->prepare($posTotalQuery);
        $posTotalStmt->bind_param("ss", $startDate, $endDate);
        $posTotalStmt->execute();
        $posTotalResult = $posTotalStmt->get_result();
        
        if ($row = $posTotalResult->fetch_assoc()) {
            $sales = floatval($row['total_sales']);
            $costs = floatval($row['total_costs']);
            $profit = $sales - $costs;
            $margin = $sales > 0 ? ($profit / $sales) * 100 : 0;
            
            $profitByChannel['POS'] = [
                'sales' => $sales,
                'costs' => $costs,
                'profit' => $profit,
                'margin' => $margin
            ];
        }
        
        $posTotalStmt->close();
    }
    
    if ($channel === 'all' || $channel === 'Retailer') {
        $retailerTotalQuery = "
            SELECT 
                SUM(roi.total_price) as total_sales,
                SUM(p.price * roi.quantity) as total_costs
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
        
        $retailerTotalStmt = $conn->prepare($retailerTotalQuery);
        $retailerTotalStmt->bind_param("ss", $startDate, $endDate);
        $retailerTotalStmt->execute();
        $retailerTotalResult = $retailerTotalStmt->get_result();
        
        if ($row = $retailerTotalResult->fetch_assoc()) {
            $sales = floatval($row['total_sales']);
            $costs = floatval($row['total_costs']);
            $profit = $sales - $costs;
            $margin = $sales > 0 ? ($profit / $sales) * 100 : 0;
            
            $profitByChannel['Retailer'] = [
                'sales' => $sales,
                'costs' => $costs,
                'profit' => $profit,
                'margin' => $margin
            ];
        }
        
        $retailerTotalStmt->close();
    }
    
    // Prepare data for response
    $salesData = [];
    $costsData = [];
    $profitsData = [];
    $marginsData = [];
    
    foreach ($dateLabels as $date) {
        $sales = $profitByDate[$date]['sales'];
        $costs = $profitByDate[$date]['costs'];
        $profit = $sales - $costs;
        $margin = $sales > 0 ? ($profit / $sales) * 100 : 0;
        
        $salesData[] = $sales;
        $costsData[] = $costs;
        $profitsData[] = $profit;
        $marginsData[] = $margin;
    }
    
    // Format date labels for display
    $formattedLabels = array_map(function($date) {
        return date('M d', strtotime($date));
    }, $dateLabels);
    
    // Set response data
    $response['data'] = [
        'labels' => $formattedLabels,
        'sales' => $salesData,
        'costs' => $costsData,
        'profits' => $profitsData,
        'margins' => $marginsData,
        'byChannel' => $profitByChannel
    ];
    
} catch (Exception $e) {
    $response['status'] = 'error';
    $response['message'] = 'Error fetching profit analysis data: ' . $e->getMessage();
}

// Close database connection
$conn->close();

// Return JSON response
echo json_encode($response);
?>