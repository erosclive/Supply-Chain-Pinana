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
        'totalSales' => 0,
        'totalOrders' => 0,
        'avgOrderValue' => 0,
        'totalTax' => 0
    ];
    
    // Initialize chart data
    $chart = [
        'labels' => [],
        'data' => [],
        'datasetLabel' => 'Daily Sales (₱)'
    ];
    
    // Initialize report data array
    $reportData = [];
    
    // Query to get daily sales data from POS transactions
    $query_pos = "
        SELECT 
            DATE(transaction_date) as date,
            COUNT(*) as orders,
            SUM(total_amount) as revenue,
            SUM(tax_amount) as tax,
            SUM(discount_amount) as discount,
            SUM(subtotal) as subtotal
        FROM 
            pos_transactions
        WHERE 
            transaction_date BETWEEN ? AND DATE_ADD(?, INTERVAL 1 DAY)
            AND status = 'completed'
    ";
    
    // Add category filter if specified for POS transactions
    $params_pos = [$start_date, $end_date];
    if (!empty($category)) {
        $query_pos .= " AND transaction_id IN (
            SELECT DISTINCT ti.transaction_id 
            FROM pos_transaction_items ti 
            JOIN products p ON ti.product_id = p.product_id 
            WHERE p.category = ?
        )";
        $params_pos[] = $category;
    }
    
    $query_pos .= " GROUP BY DATE(transaction_date)";
    
    // Query to get daily sales data from Orders
    $query_orders = "
        SELECT 
            DATE(order_date) as date,
            COUNT(*) as orders,
            SUM(total_amount) as revenue,
            SUM(tax) as tax,
            SUM(discount) as discount,
            SUM(subtotal) as subtotal
        FROM 
            orders
        WHERE 
            order_date BETWEEN ? AND DATE_ADD(?, INTERVAL 1 DAY)
            AND status IN ('delivered', 'completed', 'shipped')
    ";
    
    // Add category filter if specified for Orders
    $params_orders = [$start_date, $end_date];
    if (!empty($category)) {
        $query_orders .= " AND order_id IN (
            SELECT DISTINCT oi.order_id 
            FROM order_items oi 
            JOIN products p ON oi.product_id = p.product_id 
            WHERE p.category = ?
        )";
        $params_orders[] = $category;
    }
    
    $query_orders .= " GROUP BY DATE(order_date)";
    
    // Combined data array to store results from both queries
    $combined_data = [];
    
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
        $date = $row['date'];
        
        // Initialize date in combined data if not exists
        if (!isset($combined_data[$date])) {
            $combined_data[$date] = [
                'orders' => 0,
                'revenue' => 0,
                'tax' => 0,
                'discount' => 0,
                'subtotal' => 0
            ];
        }
        
        // Add POS data to combined data
        $combined_data[$date]['orders'] += (int)$row['orders'];
        $combined_data[$date]['revenue'] += (float)$row['revenue'];
        $combined_data[$date]['tax'] += (float)$row['tax'];
        $combined_data[$date]['discount'] += (float)$row['discount'];
        $combined_data[$date]['subtotal'] += (float)$row['subtotal'];
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
        $date = $row['date'];
        
        // Initialize date in combined data if not exists
        if (!isset($combined_data[$date])) {
            $combined_data[$date] = [
                'orders' => 0,
                'revenue' => 0,
                'tax' => 0,
                'discount' => 0,
                'subtotal' => 0
            ];
        }
        
        // Add Orders data to combined data
        $combined_data[$date]['orders'] += (int)$row['orders'];
        $combined_data[$date]['revenue'] += (float)$row['revenue'];
        $combined_data[$date]['tax'] += (float)$row['tax'];
        $combined_data[$date]['discount'] += (float)$row['discount'];
        $combined_data[$date]['subtotal'] += (float)$row['subtotal'];
    }
    
    // Sort combined data by date
    ksort($combined_data);
    
    // Process combined data
    foreach ($combined_data as $date => $data) {
        // Format date for display
        $displayDate = date('M d, Y', strtotime($date));
        
        // Calculate net sales
        $netSales = $data['revenue'] - $data['discount'];
        
        // Add to report data
        $reportData[] = [
            'date' => $displayDate,
            'orders' => (int)$data['orders'],
            'revenue' => (float)$data['revenue'],
            'tax' => (float)$data['tax'],
            'discount' => (float)$data['discount'],
            'netSales' => (float)$netSales
        ];
        
        // Add to chart data
        $chart['labels'][] = $displayDate;
        $chart['data'][] = (float)$netSales;
        
        // Update summary data
        $summary['totalSales'] += (float)$netSales;
        $summary['totalOrders'] += (int)$data['orders'];
        $summary['totalTax'] += (float)$data['tax'];
    }
    
    // Calculate average order value
    $summary['avgOrderValue'] = $summary['totalOrders'] > 0 ? 
        $summary['totalSales'] / $summary['totalOrders'] : 0;
    
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

