<?php
// Include database connection
require_once 'db_connection.php';

// Set headers for JSON response
header('Content-Type: application/json');

// Get parameters
$category = isset($_GET['category']) ? $_GET['category'] : '';

try {
    // Initialize summary data
    $summary = [
        'totalProducts' => 0,
        'totalStockValue' => 0,
        'lowStockItems' => 0,
        'outOfStockItems' => 0
    ];
    
    // Initialize chart data
    $chart = [
        'labels' => [],
        'data' => [],
        'datasetLabel' => 'Stock Value by Category (₱)'
    ];
    
    // Initialize report data array
    $reportData = [];
    
    // Query to get inventory data
    $query = "
        SELECT 
            p.product_id,
            p.product_name,
            p.category,
            p.stocks,
            p.price,
            (p.stocks * p.price) as stock_value,
            CASE 
                WHEN p.stocks = 0 THEN 'Out of Stock'
                WHEN p.stocks <= 10 THEN 'Low Stock'
                ELSE 'In Stock'
            END as status
        FROM 
            products p
    ";
    
    // Add category filter if specified
    $params = [];
    if (!empty($category)) {
        $query .= " WHERE p.category = ?";
        $params[] = $category;
    }
    
    $query .= " ORDER BY p.category, p.product_name";
    
    // Prepare and execute the query
    $stmt = mysqli_prepare($conn, $query);
    
    if (!$stmt) {
        throw new Exception(mysqli_error($conn));
    }
    
    // Bind parameters if any
    if (!empty($params)) {
        $types = str_repeat('s', count($params));
        mysqli_stmt_bind_param($stmt, $types, ...$params);
    }
    
    // Execute the query
    mysqli_stmt_execute($stmt);
    
    // Get result
    $result = mysqli_stmt_get_result($stmt);
    
    if (!$result) {
        throw new Exception(mysqli_error($conn));
    }
    
    // For chart data - category totals
    $categoryTotals = [];
    
    // Process results
    while ($row = mysqli_fetch_assoc($result)) {
        // Add to report data
        $reportData[] = [
            'product_id' => $row['product_id'],
            'product_name' => $row['product_name'],
            'category' => $row['category'],
            'stocks' => (int)$row['stocks'],
            'price' => (float)$row['price'],
            'stock_value' => (float)$row['stock_value'],
            'status' => $row['status']
        ];
        
        // Update summary data
        $summary['totalProducts']++;
        $summary['totalStockValue'] += (float)$row['stock_value'];
        
        if ($row['status'] === 'Low Stock') {
            $summary['lowStockItems']++;
        } else if ($row['status'] === 'Out of Stock') {
            $summary['outOfStockItems']++;
        }
        
        // Aggregate by category for chart
        if (!isset($categoryTotals[$row['category']])) {
            $categoryTotals[$row['category']] = 0;
        }
        $categoryTotals[$row['category']] += (float)$row['stock_value'];
    }
    
    // Prepare chart data from category totals
    foreach ($categoryTotals as $category => $value) {
        $chart['labels'][] = $category;
        $chart['data'][] = $value;
    }
    
    // Return success response with data
    echo json_encode([
        'success' => true,
        'summary' => $summary,
        'chart' => $chart,
        'data' => $reportData
    ]);
    
} catch (Exception $e) {
    // Return error response
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}

// Close database connection
mysqli_close($conn);
?>

