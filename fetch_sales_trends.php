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
        'pos' => [],
        'retailer' => [],
        'total' => []
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
    $salesByDate = [];
    
    // Initialize sales data for each date
    foreach ($period as $date) {
        $dateStr = $date->format('Y-m-d');
        $dateLabels[] = $dateStr;
        $salesByDate[$dateStr] = [
            'POS' => 0,
            'Retailer' => 0
        ];
    }
    
    // Fetch POS data if channel is 'all' or 'POS'
    if ($channel === 'all' || $channel === 'POS') {
        $posQuery = "
            SELECT 
                DATE(ptp.payment_date) as sale_date,
                SUM(pti.total_price) as total_amount
            FROM 
                pos_transaction_payments ptp
            JOIN 
                pos_transaction_items pti ON ptp.transaction_id = pti.transaction_id
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
            if (isset($salesByDate[$date])) {
                $salesByDate[$date]['POS'] = floatval($row['total_amount']);
            }
        }
        
        $posStmt->close();
    }
    
    // Fetch Retailer data if channel is 'all' or 'Retailer'
    if ($channel === 'all' || $channel === 'Retailer') {
        $retailerQuery = "
            SELECT 
                DATE(ro.order_date) as sale_date,
                SUM(roi.total_price) as total_amount
            FROM 
                retailer_orders ro
            JOIN 
                retailer_order_items roi ON ro.order_id = roi.order_id
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
            if (isset($salesByDate[$date])) {
                $salesByDate[$date]['Retailer'] = floatval($row['total_amount']);
            }
        }
        
        $retailerStmt->close();
    }
    
    // Prepare data for response
    $posData = [];
    $retailerData = [];
    $totalData = [];
    
    foreach ($dateLabels as $date) {
        $posAmount = $salesByDate[$date]['POS'];
        $retailerAmount = $salesByDate[$date]['Retailer'];
        $totalAmount = $posAmount + $retailerAmount;
        
        $posData[] = $posAmount;
        $retailerData[] = $retailerAmount;
        $totalData[] = $totalAmount;
    }
    
    // Format date labels for display
    $formattedLabels = array_map(function($date) {
        return date('M d', strtotime($date));
    }, $dateLabels);
    
    // Set response data
    $response['data'] = [
        'labels' => $formattedLabels,
        'pos' => $posData,
        'retailer' => $retailerData,
        'total' => $totalData
    ];
    
} catch (Exception $e) {
    $response['status'] = 'error';
    $response['message'] = 'Error fetching sales trends data: ' . $e->getMessage();
}

// Close database connection
$conn->close();

// Return JSON response
echo json_encode($response);
?>