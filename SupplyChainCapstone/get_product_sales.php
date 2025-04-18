<?php
// Include database connection
require_once 'db_connection.php';

// Set headers for JSON response
header('Content-Type: application/json');

// Get parameters
$start_date = isset($_GET['start_date']) ? $_GET['start_date'] : date('Y-m-d', strtotime('-30 days'));
$end_date = isset($_GET['end_date']) ? $_GET['end_date'] : date('Y-m-d');
$category = isset($_GET['category']) ? $_GET['category'] : '';

try {
    // Initialize summary data
    $summary = [
        'totalQuantity' => 0,
        'totalRevenue' => 0,
        'bestSellingProduct' => 'N/A',
        'uniqueProducts' => 0
    ];
    
    // Initialize chart data
    $chart = [
        'labels' => [],
        'data' => [],
        'datasetLabel' => 'Units Sold'
    ];
    
    // Initialize report data array
    $reportData = [];
    
    // Combined data array to store results from both queries
    $combined_data = [];
    
    // Query to get product sales data from POS transactions
    $query_pos = "
        SELECT 
            p.product_id,
            p.product_name,
            p.category,
            SUM(ti.quantity) as quantity_sold,
            SUM(ti.total_price) as revenue
        FROM 
            pos_transaction_items ti
        JOIN 
            products p ON ti.product_id = p.product_id
        JOIN 
            pos_transactions t ON ti.transaction_id = t.transaction_id
        WHERE 
            t.transaction_date BETWEEN ? AND DATE_ADD(?, INTERVAL 1 DAY)
            AND t.status = 'completed'
    ";
    
    // Add category filter if specified
    $params_pos = [$start_date, $end_date];
    if (!empty($category)) {
        $query_pos .= " AND p.category = ?";
        $params_pos[] = $category;
    }
    
    $query_pos .= " GROUP BY p.product_id";
    
    // Query to get product sales data from Orders
    $query_orders = "
        SELECT 
            p.product_id,
            p.product_name,
            p.category,
            SUM(oi.quantity) as quantity_sold,
            SUM(oi.quantity * oi.price) as revenue
        FROM 
            order_items oi
        JOIN 
            products p ON oi.product_id = p.product_id
        JOIN 
            orders o ON oi.order_id = o.order_id
        WHERE 
            o.order_date BETWEEN ? AND DATE_ADD(?, INTERVAL 1 DAY)
            AND o.status IN ('delivered', 'completed', 'shipped')
    ";
    
    // Add category filter if specified
    $params_orders = [$start_date, $end_date];
    if (!empty($category)) {
        $query_orders .= " AND p.category = ?";
        $params_orders[] = $category;
    }
    
    $query_orders .= " GROUP BY p.product_id";
    
    // Execute POS transactions query
    $stmt_pos = mysqli_prepare($conn, $query_pos);
    
    if (!$stmt_pos) {
        throw new Exception("Error preparing POS query: " . mysqli_error($conn));
    }
    
    // Bind parameters for POS query
    $types_pos = str_repeat('s', count($params_pos));
    mysqli_stmt_bind_param($stmt_pos, $types_pos, ...$params_pos);
    
    // Execute the POS query
    mysqli_stmt_execute($stmt_pos);
    
    // Get result for POS query
    $result_pos = mysqli_stmt_get_result($stmt_pos);
    
    if (!$result_pos) {
        throw new Exception("Error executing POS query: " . mysqli_error($conn));
    }
    
    // Process POS results
    while ($row = mysqli_fetch_assoc($result_pos)) {
        $product_id = $row['product_id'];
        
        // Initialize product in combined data if not exists
        if (!isset($combined_data[$product_id])) {
            $combined_data[$product_id] = [
                'product_id' => $product_id,
                'product_name' => $row['product_name'],
                'category' => $row['category'],
                'quantity_sold' => 0,
                'revenue' => 0
            ];
        }
        
        // Add POS data to combined data
        $combined_data[$product_id]['quantity_sold'] += (int)$row['quantity_sold'];
        $combined_data[$product_id]['revenue'] += (float)$row['revenue'];
    }
    
    // Execute Orders query
    $stmt_orders = mysqli_prepare($conn, $query_orders);
    
    if (!$stmt_orders) {
        throw new Exception("Error preparing Orders query: " . mysqli_error($conn));
    }
    
    // Bind parameters for Orders query
    $types_orders = str_repeat('s', count($params_orders));
    mysqli_stmt_bind_param($stmt_orders, $types_orders, ...$params_orders);
    
    // Execute the Orders query
    mysqli_stmt_execute($stmt_orders);
    
    // Get result for Orders query
    $result_orders = mysqli_stmt_get_result($stmt_orders);
    
    if (!$result_orders) {
        throw new Exception("Error executing Orders query: " . mysqli_error($conn));
    }
    
    // Process Orders results
    while ($row = mysqli_fetch_assoc($result_orders)) {
        $product_id = $row['product_id'];
        
        // Initialize product in combined data if not exists
        if (!isset($combined_data[$product_id])) {
            $combined_data[$product_id] = [
                'product_id' => $product_id,
                'product_name' => $row['product_name'],
                'category' => $row['category'],
                'quantity_sold' => 0,
                'revenue' => 0
            ];
        }
        
        // Add Orders data to combined data
        $combined_data[$product_id]['quantity_sold'] += (int)$row['quantity_sold'];
        $combined_data[$product_id]['revenue'] += (float)$row['revenue'];
    }
    
    // Calculate average price and prepare report data
    foreach ($combined_data as $product_id => $data) {
        // Calculate average price
        $avg_price = $data['quantity_sold'] > 0 ? 
            $data['revenue'] / $data['quantity_sold'] : 0;
        
        // Add to report data
        $reportData[] = [
            'product_id' => $data['product_id'],
            'product_name' => $data['product_name'],
            'category' => $data['category'],
            'quantity_sold' => $data['quantity_sold'],
            'revenue' => $data['revenue'],
            'avg_price' => $avg_price
        ];
        
        // Update summary data
        $summary['totalQuantity'] += $data['quantity_sold'];
        $summary['totalRevenue'] += $data['revenue'];
    }
    
    // Sort report data by quantity sold (descending)
    usort($reportData, function($a, $b) {
        return $b['quantity_sold'] - $a['quantity_sold'];
    });
    
    // Set best selling product (first item after sorting)
    if (!empty($reportData)) {
        $summary['bestSellingProduct'] = $reportData[0]['product_name'];
    }
    
    // Set unique products count
    $summary['uniqueProducts'] = count($reportData);
    
    // Prepare chart data (top 10 products)
    $topProducts = array_slice($reportData, 0, 10);
    foreach ($topProducts as $product) {
        $chart['labels'][] = $product['product_name'];
        $chart['data'][] = $product['quantity_sold'];
    }
    
    // Return success response with data
    echo json_encode([
        'success' => true,
        'summary' => $summary,
        'chart' => $chart,
        'data' => $reportData
    ]);
    
} catch (Exception $e) {
    // Return error response with detailed error message
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}

// Close database connection
mysqli_close($conn);
?>

