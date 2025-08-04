<?php
// Set headers for JSON response
header('Content-Type: application/json');

// Include database configuration
require_once 'db_connection.php';

// Get request parameters
$startDate = isset($_GET['startDate']) ? $_GET['startDate'] : date('Y-m-d', strtotime('-30 days'));
$endDate = isset($_GET['endDate']) ? $_GET['endDate'] : date('Y-m-d');
$channel = isset($_GET['channel']) ? $_GET['channel'] : 'all';
$productId = isset($_GET['productId']) ? $_GET['productId'] : 'all';

// Initialize response array
$response = [
    'status' => 'success',
    'data' => [
        'products' => [],
        'sales' => [],
        'byChannel' => [
            'POS' => [],
            'Retailer' => []
        ],
        'quantities' => []
    ],
    'message' => ''
];

try {
    // Array to store product data
    $productData = [];
    
    // Fetch POS data if channel is 'all' or 'POS'
    if ($channel === 'all' || $channel === 'POS') {
        $posQuery = "
            SELECT 
                pti.product_id,
                pti.product_name,
                SUM(pti.total_price) as total_sales,
                SUM(pti.quantity) as total_quantity
            FROM 
                pos_transaction_payments ptp
            JOIN 
                pos_transaction_items pti ON ptp.transaction_id = pti.transaction_id
            WHERE 
                ptp.payment_date BETWEEN ? AND ?
                AND ptp.payment_status = 'completed'
        ";
        
        // Add product filter if applicable
        if ($productId !== 'all') {
            $posQuery .= " AND pti.product_id = ?";
            $posStmt = $conn->prepare($posQuery);
            $posStmt->bind_param("sss", $startDate, $endDate, $productId);
        } else {
            $posStmt = $conn->prepare($posQuery);
            $posStmt->bind_param("ss", $startDate, $endDate);
        }
        
        $posQuery .= " GROUP BY pti.product_id, pti.product_name ORDER BY total_sales DESC LIMIT 20";
        
        $posStmt->execute();
        $posResult = $posStmt->get_result();
        
        while ($row = $posResult->fetch_assoc()) {
            $productId = $row['product_id'];
            if (!isset($productData[$productId])) {
                $productData[$productId] = [
                    'product_id' => $productId,
                    'product_name' => $row['product_name'],
                    'pos_sales' => 0,
                    'retailer_sales' => 0,
                    'total_sales' => 0,
                    'pos_quantity' => 0,
                    'retailer_quantity' => 0,
                    'total_quantity' => 0
                ];
            }
            
            $productData[$productId]['pos_sales'] = floatval($row['total_sales']);
            $productData[$productId]['total_sales'] += floatval($row['total_sales']);
            $productData[$productId]['pos_quantity'] = intval($row['total_quantity']);
            $productData[$productId]['total_quantity'] += intval($row['total_quantity']);
        }
        
        $posStmt->close();
    }
    
    // Fetch Retailer data if channel is 'all' or 'Retailer'
    if ($channel === 'all' || $channel === 'Retailer') {
        $retailerQuery = "
            SELECT 
                roi.product_id,
                roi.product_name,
                SUM(roi.total_price) as total_sales,
                SUM(roi.quantity) as total_quantity
            FROM 
                retailer_orders ro
            JOIN 
                retailer_order_items roi ON ro.order_id = roi.order_id
            WHERE 
                ro.order_date BETWEEN ? AND ?
                AND (ro.payment_status = 'paid' OR ro.payment_status = 'completed')
        ";
        
        // Add product filter if applicable
        if ($productId !== 'all') {
            $retailerQuery .= " AND roi.product_id = ?";
            $retailerStmt = $conn->prepare($retailerQuery);
            $retailerStmt->bind_param("sss", $startDate, $endDate, $productId);
        } else {
            $retailerStmt = $conn->prepare($retailerQuery);
            $retailerStmt->bind_param("ss", $startDate, $endDate);
        }
        
        $retailerQuery .= " GROUP BY roi.product_id, roi.product_name ORDER BY total_sales DESC LIMIT 20";
        
        $retailerStmt->execute();
        $retailerResult = $retailerStmt->get_result();
        
        while ($row = $retailerResult->fetch_assoc()) {
            $productId = $row['product_id'];
            if (!isset($productData[$productId])) {
                $productData[$productId] = [
                    'product_id' => $productId,
                    'product_name' => $row['product_name'],
                    'pos_sales' => 0,
                    'retailer_sales' => 0,
                    'total_sales' => 0,
                    'pos_quantity' => 0,
                    'retailer_quantity' => 0,
                    'total_quantity' => 0
                ];
            }
            
            $productData[$productId]['retailer_sales'] = floatval($row['total_sales']);
            $productData[$productId]['total_sales'] += floatval($row['total_sales']);
            $productData[$productId]['retailer_quantity'] = intval($row['total_quantity']);
            $productData[$productId]['total_quantity'] += intval($row['total_quantity']);
        }
        
        $retailerStmt->close();
    }
    
    // Sort products by total sales (descending)
    usort($productData, function($a, $b) {
        return $b['total_sales'] - $a['total_sales'];
    });
    
    // Limit to top 15 products for better visualization
    $productData = array_slice($productData, 0, 15);
    
    // Prepare data for response
    $products = [];
    $sales = [];
    $posSales = [];
    $retailerSales = [];
    $quantities = [];
    
    foreach ($productData as $product) {
        $products[] = $product['product_name'];
        $sales[] = $product['total_sales'];
        $posSales[] = $product['pos_sales'];
        $retailerSales[] = $product['retailer_sales'];
        $quantities[] = $product['total_quantity'];
    }
    
    // Set response data
    $response['data'] = [
        'products' => $products,
        'sales' => $sales,
        'byChannel' => [
            'POS' => $posSales,
            'Retailer' => $retailerSales
        ],
        'quantities' => $quantities
    ];
    
} catch (Exception $e) {
    $response['status'] = 'error';
    $response['message'] = 'Error fetching sales by products data: ' . $e->getMessage();
}

// Close database connection
$conn->close();

// Return JSON response
echo json_encode($response);
?>
