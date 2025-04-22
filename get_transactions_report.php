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
        'totalTransactions' => 0,
        'totalRevenue' => 0,
        'avgTransaction' => 0,
        'cashTransactions' => 0
    ];
    
    // Initialize chart data
    $chart = [
        'labels' => [],
        'data' => [],
        'datasetLabel' => 'Transaction Count'
    ];
    
    // Initialize report data array
    $reportData = [];
    
    // Query to get POS transaction data
    $query_pos = "
        SELECT 
            t.transaction_id,
            t.transaction_date,
            t.customer_name,
            t.total_amount,
            COUNT(ti.item_id) as items,
            p.method_name as payment_method
        FROM 
            pos_transactions t
        LEFT JOIN 
            pos_transaction_items ti ON t.transaction_id = ti.transaction_id
        LEFT JOIN 
            pos_transaction_payments tp ON t.transaction_id = tp.transaction_id
        LEFT JOIN 
            pos_payment_methods p ON tp.payment_method_id = p.payment_method_id
        WHERE 
            t.transaction_date BETWEEN ? AND DATE_ADD(?, INTERVAL 1 DAY)
            AND t.status = 'completed'
    ";
    
    // Add category filter if specified for POS transactions
    $params_pos = [$start_date, $end_date];
    if (!empty($category)) {
        $query_pos .= " AND t.transaction_id IN (
            SELECT DISTINCT ti2.transaction_id 
            FROM pos_transaction_items ti2 
            JOIN products p2 ON ti2.product_id = p2.product_id 
            WHERE p2.category = ?
        )";
        $params_pos[] = $category;
    }
    
    $query_pos .= " GROUP BY t.transaction_id";
    
    // Query to get Order transaction data
    $query_orders = "
        SELECT 
            o.order_id as transaction_id,
            o.order_date as transaction_date,
            o.customer_name,
            o.total_amount,
            COUNT(oi.item_id) as items,
            o.payment_method
        FROM 
            orders o
        LEFT JOIN 
            order_items oi ON o.order_id = oi.order_id
        WHERE 
            o.order_date BETWEEN ? AND DATE_ADD(?, INTERVAL 1 DAY)
            AND o.status IN ('delivered', 'completed')
    ";
    
    // Add category filter if specified for Orders
    $params_orders = [$start_date, $end_date];
    if (!empty($category)) {
        $query_orders .= " AND o.order_id IN (
            SELECT DISTINCT oi2.order_id 
            FROM order_items oi2 
            JOIN products p2 ON oi2.product_id = p2.product_id 
            WHERE p2.category = ?
        )";
        $params_orders[] = $category;
    }
    
    $query_orders .= " GROUP BY o.order_id";
    
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
    
    // For chart data - daily transaction counts
    $dailyTransactions = [];
    
    // Process POS results
    while ($row = mysqli_fetch_assoc($result_pos)) {
        // Format date for display
        $displayDate = date('M d, Y H:i', strtotime($row['transaction_date']));
        $chartDate = date('M d', strtotime($row['transaction_date']));
        
        // Add to report data
        $reportData[] = [
            'transaction_id' => $row['transaction_id'],
            'transaction_date' => $displayDate,
            'customer_name' => $row['customer_name'] ?: 'Guest',
            'items' => (int)$row['items'],
            'total_amount' => (float)$row['total_amount'],
            'payment_method' => $row['payment_method'] ?: 'Cash'
        ];
        
        // Update summary data
        $summary['totalTransactions']++;
        $summary['totalRevenue'] += (float)$row['total_amount'];
        
        if (strtolower($row['payment_method']) === 'cash' || $row['payment_method'] === null) {
            $summary['cashTransactions']++;
        }
        
        // Aggregate by day for chart
        if (!isset($dailyTransactions[$chartDate])) {
            $dailyTransactions[$chartDate] = 0;
        }
        $dailyTransactions[$chartDate]++;
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
        // Format date for display
        $displayDate = date('M d, Y H:i', strtotime($row['transaction_date']));
        $chartDate = date('M d', strtotime($row['transaction_date']));
        
        // Add to report data
        $reportData[] = [
            'transaction_id' => $row['transaction_id'],
            'transaction_date' => $displayDate,
            'customer_name' => $row['customer_name'] ?: 'Guest',
            'items' => (int)$row['items'],
            'total_amount' => (float)$row['total_amount'],
            'payment_method' => $row['payment_method'] ?: 'Cash'
        ];
        
        // Update summary data
        $summary['totalTransactions']++;
        $summary['totalRevenue'] += (float)$row['total_amount'];
        
        if (strtolower($row['payment_method']) === 'cash' || $row['payment_method'] === null) {
            $summary['cashTransactions']++;
        }
        
        // Aggregate by day for chart
        if (!isset($dailyTransactions[$chartDate])) {
            $dailyTransactions[$chartDate] = 0;
        }
        $dailyTransactions[$chartDate]++;
    }
    
    // Sort report data by transaction date (newest first)
    usort($reportData, function($a, $b) {
        return strtotime($b['transaction_date']) - strtotime($a['transaction_date']);
    });
    
    // Calculate average transaction value
    $summary['avgTransaction'] = $summary['totalTransactions'] > 0 ? 
        $summary['totalRevenue'] / $summary['totalTransactions'] : 0;
    
    // Prepare chart data from daily transactions
    ksort($dailyTransactions); // Sort by date
    foreach ($dailyTransactions as $date => $count) {
        $chart['labels'][] = $date;
        $chart['data'][] = $count;
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

