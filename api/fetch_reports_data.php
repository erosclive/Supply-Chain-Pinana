<?php
// Set headers for JSON response
header('Content-Type: application/json');

// Include database configuration
require_once 'db_connection.php';

// Get request parameters
$startDate = isset($_GET['startDate']) ? $_GET['startDate'] : date('Y-m-d', strtotime('-30 days'));
$endDate = isset($_GET['endDate']) ? $_GET['endDate'] : date('Y-m-d');
$channel = isset($_GET['channel']) ? $_GET['channel'] : 'all';
$reportType = isset($_GET['reportType']) ? $_GET['reportType'] : 'salesTrends';
$category = isset($_GET['category']) ? $_GET['category'] : 'all';

// Initialize response array
$response = [
    'status' => 'success',
    'data' => [],
    'message' => ''
];

try {
    // Array to store all data
    $allData = [];
    
    // Fetch POS data if channel is 'all' or 'POS'
    if ($channel === 'all' || $channel === 'POS') {
        // Query to get POS transaction payments with product information
        $posQuery = "
            SELECT 
                ptp.payment_id,
                ptp.transaction_id,
                ptp.amount,
                ptp.payment_date,
                ptp.payment_method_id,
                pti.product_id,
                pti.product_name,
                pti.quantity,
                pti.unit_price,
                pti.subtotal,
                pti.total_price,
                p.category,
                p.price as cost_price,
                'POS' as channel
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
        
        // Prepare and execute the query
        $posStmt = $conn->prepare($posQuery);
        $posStmt->bind_param("ss", $startDate, $endDate);
        $posStmt->execute();
        $posResult = $posStmt->get_result();
        
        // Process results
        while ($row = $posResult->fetch_assoc()) {
            $date = date('Y-m-d', strtotime($row['payment_date']));
            $allData[] = [
                'date' => $date,
                'channel' => 'POS',
                'category' => $row['category'] ?? 'Uncategorized',
                'amount' => floatval($row['total_price']),
                'cost' => floatval($row['cost_price'] * $row['quantity']),
                'payment_method' => $row['payment_method_id'],
                'transaction_id' => $row['transaction_id'],
                'product_name' => $row['product_name'],
                'quantity' => $row['quantity']
            ];
        }
        
        $posStmt->close();
    }
    
    // Fetch Retailer data if channel is 'all' or 'Retailer'
    if ($channel === 'all' || $channel === 'Retailer') {
        // Query to get retailer orders with paid status
        $retailerQuery = "
            SELECT 
                ro.order_id,
                ro.order_date,
                ro.total_amount,
                ro.payment_status,
                rop.payment_amount,
                rop.payment_method,
                roi.product_id,
                roi.product_name,
                roi.quantity,
                roi.unit_price,
                roi.total_price,
                p.category,
                p.price as cost_price,
                'Retailer' as channel
            FROM 
                retailer_orders ro
            LEFT JOIN 
                retailer_order_payments rop ON ro.order_id = rop.order_id
            JOIN 
                retailer_order_items roi ON ro.order_id = roi.order_id
            LEFT JOIN 
                products p ON roi.product_id = p.product_id
            WHERE 
                ro.order_date BETWEEN ? AND ?
                AND (ro.payment_status = 'paid' OR ro.payment_status = 'completed')
        ";
        
        // Prepare and execute the query
        $retailerStmt = $conn->prepare($retailerQuery);
        $retailerStmt->bind_param("ss", $startDate, $endDate);
        $retailerStmt->execute();
        $retailerResult = $retailerStmt->get_result();
        
        // Process results
        while ($row = $retailerResult->fetch_assoc()) {
            $date = date('Y-m-d', strtotime($row['order_date']));
            $allData[] = [
                'date' => $date,
                'channel' => 'Retailer',
                'category' => $row['category'] ?? 'Uncategorized',
                'amount' => floatval($row['total_price']),
                'cost' => floatval($row['cost_price'] * $row['quantity']),
                'payment_method' => $row['payment_method'] ?? 'Unknown',
                'order_id' => $row['order_id'],
                'product_name' => $row['product_name'],
                'quantity' => $row['quantity']
            ];
        }
        
        $retailerStmt->close();
    }
    
    // Filter by category if applicable
    if ($reportType === 'salesByCategory' && $category !== 'all') {
        $allData = array_filter($allData, function($item) use ($category) {
            return $item['category'] === $category;
        });
    }
    
    // Set response data
    $response['data'] = array_values($allData); // Reset array keys
    $response['count'] = count($allData);
    
} catch (Exception $e) {
    $response['status'] = 'error';
    $response['message'] = 'Error fetching data: ' . $e->getMessage();
}

// Close database connection
$conn->close();

// Return JSON response
echo json_encode($response);
?>