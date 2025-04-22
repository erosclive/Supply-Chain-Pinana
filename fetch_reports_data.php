<?php
// Add error reporting at the top for debugging
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Set headers for JSON response
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

// Include database connection
require_once 'db_connection.php';

// Get request parameters
$reportType = isset($_GET['type']) ? $_GET['type'] : 'sales';
$startDate = isset($_GET['start_date']) ? $_GET['start_date'] : date('Y-m-d', strtotime('-30 days'));
$endDate = isset($_GET['end_date']) ? $_GET['end_date'] : date('Y-m-d');
$category = isset($_GET['category']) ? $_GET['category'] : '';

// Log request parameters for debugging
error_log("Report Type: $reportType, Start Date: $startDate, End Date: $endDate, Category: $category");

// Format dates for SQL query
$startDateFormatted = mysqli_real_escape_string($conn, $startDate);
$endDateFormatted = mysqli_real_escape_string($conn, $endDate);
$categoryFormatted = mysqli_real_escape_string($conn, $category);

// Prepare response data
$response = [
    'success' => true,
    'report_type' => $reportType,
    'start_date' => $startDate,
    'end_date' => $endDate,
    'category' => $category,
    'data' => []
];

try {
    // Generate report based on type
    switch ($reportType) {
        case 'sales':
            // Sales report - daily sales data from POS transactions
            $query = "SELECT 
                        DATE(transaction_date) as date,
                        COUNT(*) as transaction_count,
                        SUM(total_amount) as total_sales,
                        SUM(tax_amount) as total_tax,
                        SUM(discount_amount) as total_discount,
                        AVG(total_amount) as avg_transaction_value
                    FROM 
                        pos_transactions
                    WHERE 
                        transaction_date BETWEEN '$startDateFormatted 00:00:00' AND '$endDateFormatted 23:59:59'
                        AND status = 'completed'
                    GROUP BY 
                        DATE(transaction_date)
                    ORDER BY 
                        date DESC";
            break;
            
        case 'products':
            // Product sales report
            $categoryFilter = $category ? "AND p.category = '$categoryFormatted'" : "";
            
            $query = "SELECT 
                        pti.product_id,
                        pti.product_name,
                        p.category,
                        SUM(pti.quantity) as units_sold,
                        AVG(pti.unit_price) as avg_price,
                        SUM(pti.total_price) as total_revenue,
                        COUNT(DISTINCT pti.transaction_id) as transaction_count
                    FROM 
                        pos_transaction_items pti
                    JOIN 
                        pos_transactions pt ON pti.transaction_id = pt.transaction_id
                    LEFT JOIN
                        products p ON pti.product_id = p.product_id
                    WHERE 
                        pt.transaction_date BETWEEN '$startDateFormatted 00:00:00' AND '$endDateFormatted 23:59:59'
                        AND pt.status = 'completed'
                        $categoryFilter
                    GROUP BY 
                        pti.product_id, pti.product_name, p.category
                    ORDER BY 
                        total_revenue DESC";
            break;
            
        case 'inventory':
            // Inventory report
            $categoryFilter = $category ? "WHERE category = '$categoryFormatted'" : "";
            
            $query = "SELECT 
                        p.product_id,
                        p.product_name,
                        p.category,
                        p.stocks as current_stock,
                        p.price as unit_price,
                        (p.stocks * p.price) as inventory_value,
                        p.status,
                        (SELECT COUNT(*) FROM product_batches WHERE product_id = p.product_id) as batch_count
                    FROM 
                        products p
                    $categoryFilter
                    ORDER BY 
                        p.category, p.product_name";
            break;
            
        case 'orders':
            // Orders report
            $query = "SELECT 
                        o.order_id,
                        o.customer_name,
                        o.order_date,
                        o.status,
                        o.payment_method,
                        o.total_amount,
                        (SELECT COUNT(*) FROM order_items WHERE order_id = o.order_id) as item_count
                    FROM 
                        orders o
                    WHERE 
                        o.order_date BETWEEN '$startDateFormatted 00:00:00' AND '$endDateFormatted 23:59:59'
                    ORDER BY 
                        o.order_date DESC";
            break;
            
        case 'categories':
            // Category sales report
            $query = "SELECT 
                        p.category,
                        COUNT(DISTINCT pti.product_id) as product_count,
                        SUM(pti.quantity) as units_sold,
                        SUM(pti.total_price) as total_revenue,
                        COUNT(DISTINCT pti.transaction_id) as transaction_count
                    FROM 
                        pos_transaction_items pti
                    JOIN 
                        pos_transactions pt ON pti.transaction_id = pt.transaction_id
                    LEFT JOIN
                        products p ON pti.product_id = p.product_id
                    WHERE 
                        pt.transaction_date BETWEEN '$startDateFormatted 00:00:00' AND '$endDateFormatted 23:59:59'
                        AND pt.status = 'completed'
                        AND p.category IS NOT NULL
                    GROUP BY 
                        p.category
                    ORDER BY 
                        total_revenue DESC";
            break;
            
        case 'transactions':
            // Transactions report
            $query = "SELECT 
                        pt.transaction_id,
                        pt.transaction_date,
                        pt.customer_name,
                        (SELECT COUNT(*) FROM pos_transaction_items WHERE transaction_id = pt.transaction_id) as item_count,
                        pt.subtotal,
                        pt.tax_amount,
                        pt.discount_amount,
                        pt.total_amount,
                        pm.method_name as payment_method
                    FROM 
                        pos_transactions pt
                    LEFT JOIN 
                        pos_transaction_payments ptp ON pt.transaction_id = ptp.transaction_id
                    LEFT JOIN 
                        pos_payment_methods pm ON ptp.payment_method_id = pm.payment_method_id
                    WHERE 
                        pt.transaction_date BETWEEN '$startDateFormatted 00:00:00' AND '$endDateFormatted 23:59:59'
                        AND pt.status = 'completed'
                    ORDER BY 
                        pt.transaction_date DESC";
            break;
            
        default:
            throw new Exception('Invalid report type');
    }

    // Log the query for debugging
    error_log("SQL Query: $query");

    // Execute query
    $result = mysqli_query($conn, $query);

    if (!$result) {
        throw new Exception('Query failed: ' . mysqli_error($conn));
    }

    // Fetch data
    while ($row = mysqli_fetch_assoc($result)) {
        $response['data'][] = $row;
    }

    // If no data found, provide a helpful message
    if (empty($response['data'])) {
        $response['message'] = 'No data found for the selected criteria';
    }

} catch (Exception $e) {
    $response = [
        'success' => false,
        'message' => $e->getMessage()
    ];
    
    // Log the error
    error_log("Error in fetch_reports_data.php: " . $e->getMessage());
}

// Log the response size for debugging
error_log("Response data count: " . (isset($response['data']) ? count($response['data']) : 0));

// Close connection
mysqli_close($conn);

// Return JSON response
echo json_encode($response);
?>

