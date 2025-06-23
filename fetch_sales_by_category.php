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
        'categories' => [],
        'sales' => [],
        'byChannel' => []
    ],
    'message' => ''
];

try {
    // Get all categories
    $categoriesQuery = "
        SELECT DISTINCT category 
        FROM products 
        WHERE category IS NOT NULL
        ORDER BY category
    ";
    
    $categoriesResult = $conn->query($categoriesQuery);
    $categories = [];
    
    while ($row = $categoriesResult->fetch_assoc()) {
        $categories[] = $row['category'];
    }
    
    // Add "Uncategorized" for products without category
    $categories[] = 'Uncategorized';
    
    // Initialize sales data by category
    $salesByCategory = [];
    $salesByCategoryAndChannel = [];
    
    foreach ($categories as $category) {
        $salesByCategory[$category] = 0;
        $salesByCategoryAndChannel[$category] = [
            'POS' => 0,
            'Retailer' => 0
        ];
    }
    
    // Fetch POS data if channel is 'all' or 'POS'
    if ($channel === 'all' || $channel === 'POS') {
        $posQuery = "
            SELECT 
                COALESCE(p.category, 'Uncategorized') as category,
                SUM(pti.total_price) as total_amount
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
                COALESCE(p.category, 'Uncategorized')
        ";
        
        $posStmt = $conn->prepare($posQuery);
        $posStmt->bind_param("ss", $startDate, $endDate);
        $posStmt->execute();
        $posResult = $posStmt->get_result();
        
        while ($row = $posResult->fetch_assoc()) {
            $category = $row['category'];
            $amount = floatval($row['total_amount']);
            
            if (isset($salesByCategory[$category])) {
                $salesByCategory[$category] += $amount;
                $salesByCategoryAndChannel[$category]['POS'] = $amount;
            }
        }
        
        $posStmt->close();
    }
    
    // Fetch Retailer data if channel is 'all' or 'Retailer'
    if ($channel === 'all' || $channel === 'Retailer') {
        $retailerQuery = "
            SELECT 
                COALESCE(p.category, 'Uncategorized') as category,
                SUM(roi.total_price) as total_amount
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
                COALESCE(p.category, 'Uncategorized')
        ";
        
        $retailerStmt = $conn->prepare($retailerQuery);
        $retailerStmt->bind_param("ss", $startDate, $endDate);
        $retailerStmt->execute();
        $retailerResult = $retailerStmt->get_result();
        
        while ($row = $retailerResult->fetch_assoc()) {
            $category = $row['category'];
            $amount = floatval($row['total_amount']);
            
            if (isset($salesByCategory[$category])) {
                $salesByCategory[$category] += $amount;
                $salesByCategoryAndChannel[$category]['Retailer'] = $amount;
            }
        }
        
        $retailerStmt->close();
    }
    
    // Prepare data for response
    $categoryLabels = array_keys($salesByCategory);
    $salesData = array_values($salesByCategory);
    
    // Prepare data by channel
    $channelData = [
        'POS' => [],
        'Retailer' => []
    ];
    
    foreach ($categoryLabels as $category) {
        $channelData['POS'][] = $salesByCategoryAndChannel[$category]['POS'];
        $channelData['Retailer'][] = $salesByCategoryAndChannel[$category]['Retailer'];
    }
    
    // Set response data
    $response['data'] = [
        'categories' => $categoryLabels,
        'sales' => $salesData,
        'byChannel' => $channelData
    ];
    
} catch (Exception $e) {
    $response['status'] = 'error';
    $response['message'] = 'Error fetching sales by category data: ' . $e->getMessage();
}

// Close database connection
$conn->close();

// Return JSON response
echo json_encode($response);
?>