<?php
// export_report.php - Handles exporting report data to CSV

// Set headers for CSV download
header('Content-Type: text/csv');
header('Content-Disposition: attachment; filename="report_export.csv"');
header('Pragma: no-cache');
header('Expires: 0');

// Include database connection
require_once '../db_connection.php';

// Get report parameters
$reportType = isset($_GET['type']) ? $_GET['type'] : 'sales';
$startDate = isset($_GET['start_date']) ? $_GET['start_date'] : date('Y-m-d', strtotime('-30 days'));
$endDate = isset($_GET['end_date']) ? $_GET['end_date'] : date('Y-m-d');
$category = isset($_GET['category']) ? $_GET['category'] : '';

// Set filename based on report type
$filename = $reportType . '_report_' . date('Y-m-d') . '.csv';
header('Content-Disposition: attachment; filename="' . $filename . '"');

// Create output stream
$output = fopen('php://output', 'w');

try {
    // Prepare headers and data based on report type
    switch ($reportType) {
        case 'sales':
            // Write headers
            fputcsv($output, ['Date', 'Transactions', 'Sales', 'Tax', 'Discount', 'Avg. Transaction Value']);
            
            // Get data
            $data = getSalesReport($conn, $startDate, $endDate, $category);
            
            // Write data
            foreach ($data as $row) {
                fputcsv($output, [
                    $row['date'],
                    $row['transaction_count'],
                    $row['total_sales'],
                    $row['total_tax'],
                    $row['total_discount'],
                    $row['avg_transaction_value']
                ]);
            }
            break;
            
        case 'products':
            // Write headers
            fputcsv($output, ['Product', 'Category', 'Units Sold', 'Avg. Price', 'Revenue', 'Transactions']);
            
            // Get data
            $data = getProductSalesReport($conn, $startDate, $endDate, $category);
            
            // Write data
            foreach ($data as $row) {
                fputcsv($output, [
                    $row['product_name'],
                    $row['category'],
                    $row['units_sold'],
                    $row['avg_price'],
                    $row['total_revenue'],
                    $row['transaction_count']
                ]);
            }
            break;
            
        case 'categories':
            // Write headers
            fputcsv($output, ['Category', 'Products', 'Units Sold', 'Revenue', 'Transactions']);
            
            // Get data
            $data = getCategorySalesReport($conn, $startDate, $endDate);
            
            // Write data
            foreach ($data as $row) {
                fputcsv($output, [
                    $row['category'],
                    $row['product_count'],
                    $row['units_sold'],
                    $row['total_revenue'],
                    $row['transaction_count']
                ]);
            }
            break;
            
        case 'transactions':
            // Write headers
            fputcsv($output, ['Transaction ID', 'Date', 'Customer', 'Items', 'Subtotal', 'Tax', 'Discount', 'Total', 'Payment Method']);
            
            // Get data
            $data = getTransactionsReport($conn, $startDate, $endDate, $category);
            
            // Write data
            foreach ($data as $row) {
                fputcsv($output, [
                    $row['transaction_id'],
                    $row['transaction_date'],
                    $row['customer_name'],
                    $row['item_count'],
                    $row['subtotal'],
                    $row['tax_amount'],
                    $row['discount_amount'],
                    $row['total_amount'],
                    $row['payment_method'] ?? 'N/A'
                ]);
            }
            break;
            
        default:
            throw new Exception("Invalid report type");
    }
    
} catch (Exception $e) {
    // Write error message to CSV
    fputcsv($output, ['Error', $e->getMessage()]);
} finally {
    // Close output stream
    fclose($output);
    
    // Close database connection
    if (isset($conn)) {
        mysqli_close($conn);
    }
}

// Functions to get report data (same as in fetch_reports_data.php)
function getSalesReport($conn, $startDate, $endDate, $category) {
    // Add time to end date to include the entire day
    $endDateWithTime = $endDate . ' 23:59:59';
    
    // Base query for sales report
    $query = "
        SELECT 
            DATE(pt.transaction_date) as date,
            COUNT(pt.transaction_id) as transaction_count,
            SUM(pt.total_amount) as total_sales,
            SUM(pt.tax_amount) as total_tax,
            SUM(pt.discount_amount) as total_discount,
            AVG(pt.total_amount) as avg_transaction_value
        FROM 
            pos_transactions pt
    ";
    
    // Add category filter if specified
    if (!empty($category)) {
        $query .= "
            JOIN pos_transaction_items pti ON pt.transaction_id = pti.transaction_id
            JOIN products p ON pti.product_id = p.product_id
            WHERE p.category = ? AND pt.transaction_date BETWEEN ? AND ?
            AND pt.status = 'completed'
        ";
        $params = [$category, $startDate, $endDateWithTime];
    } else {
        $query .= "
            WHERE pt.transaction_date BETWEEN ? AND ?
            AND pt.status = 'completed'
        ";
        $params = [$startDate, $endDateWithTime];
    }
    
    // Group by date
    $query .= "
        GROUP BY DATE(pt.transaction_date)
        ORDER BY date DESC
    ";
    
    // Prepare and execute query
    $stmt = $conn->prepare($query);
    
    if (!empty($category)) {
        $stmt->bind_param('sss', $params[0], $params[1], $params[2]);
    } else {
        $stmt->bind_param('ss', $params[0], $params[1]);
    }
    
    $stmt->execute();
    $result = $stmt->get_result();
    
    // Fetch data
    $data = [];
    while ($row = $result->fetch_assoc()) {
        $data[] = $row;
    }
    
    return $data;
}

function getProductSalesReport($conn, $startDate, $endDate, $category) {
    // Add time to end date to include the entire day
    $endDateWithTime = $endDate . ' 23:59:59';
    
    // Base query for product sales report
    $query = "
        SELECT 
            p.product_id,
            p.product_name,
            p.category,
            SUM(pti.quantity) as units_sold,
            AVG(pti.unit_price) as avg_price,
            SUM(pti.total_price) as total_revenue,
            COUNT(DISTINCT pt.transaction_id) as transaction_count
        FROM 
            pos_transaction_items pti
        JOIN 
            products p ON pti.product_id = p.product_id
        JOIN 
            pos_transactions pt ON pti.transaction_id = pt.transaction_id
        WHERE 
            pt.transaction_date BETWEEN ? AND ?
            AND pt.status = 'completed'
    ";
    
    // Add category filter if specified
    if (!empty($category)) {
        $query .= " AND p.category = ?";
        $params = [$startDate, $endDateWithTime, $category];
    } else {
        $params = [$startDate, $endDateWithTime];
    }
    
    // Group by product
    $query .= "
        GROUP BY p.product_id, p.product_name, p.category
        ORDER BY total_revenue DESC
    ";
    
    // Prepare and execute query
    $stmt = $conn->prepare($query);
    
    if (!empty($category)) {
        $stmt->bind_param('sss', $params[0], $params[1], $params[2]);
    } else {
        $stmt->bind_param('ss', $params[0], $params[1]);
    }
    
    $stmt->execute();
    $result = $stmt->get_result();
    
    // Fetch data
    $data = [];
    while ($row = $result->fetch_assoc()) {
        $data[] = $row;
    }
    
    return $data;
}

function getCategorySalesReport($conn, $startDate, $endDate) {
    // Add time to end date to include the entire day
    $endDateWithTime = $endDate . ' 23:59:59';
    
    // Query for category sales report
    $query = "
        SELECT 
            p.category,
            COUNT(DISTINCT p.product_id) as product_count,
            SUM(pti.quantity) as units_sold,
            SUM(pti.total_price) as total_revenue,
            COUNT(DISTINCT pt.transaction_id) as transaction_count
        FROM 
            pos_transaction_items pti
        JOIN 
            products p ON pti.product_id = p.product_id
        JOIN 
            pos_transactions pt ON pti.transaction_id = pt.transaction_id
        WHERE 
            pt.transaction_date BETWEEN ? AND ?
            AND pt.status = 'completed'
            AND p.category IS NOT NULL
            AND p.category != ''
        GROUP BY 
            p.category
        ORDER BY 
            total_revenue DESC
    ";
    
    // Prepare and execute query
    $stmt = $conn->prepare($query);
    $stmt->bind_param('ss', $startDate, $endDateWithTime);
    $stmt->execute();
    $result = $stmt->get_result();
    
    // Fetch data
    $data = [];
    while ($row = $result->fetch_assoc()) {
        $data[] = $row;
    }
    
    return $data;
}

function getTransactionsReport($conn, $startDate, $endDate, $category) {
    // Add time to end date to include the entire day
    $endDateWithTime = $endDate . ' 23:59:59';
    
    // Base query for transactions report
    $query = "
        SELECT 
            pt.transaction_id,
            pt.transaction_date,
            pt.customer_name,
            pt.subtotal,
            pt.tax_amount,
            pt.discount_amount,
            pt.total_amount,
            pt.status,
            (SELECT COUNT(*) FROM pos_transaction_items WHERE transaction_id = pt.transaction_id) as item_count,
            (SELECT method_name FROM pos_payment_methods WHERE payment_method_id = 
                (SELECT payment_method_id FROM pos_transaction_payments WHERE transaction_id = pt.transaction_id LIMIT 1)
            ) as payment_method
        FROM 
            pos_transactions pt
    ";
    
    // Add category filter if specified
    if (!empty($category)) {
        $query .= "
            JOIN pos_transaction_items pti ON pt.transaction_id = pti.transaction_id
            JOIN products p ON pti.product_id = p.product_id
            WHERE p.category = ? AND pt.transaction_date BETWEEN ? AND ?
            AND pt.status = 'completed'
        ";
        $params = [$category, $startDate, $endDateWithTime];
    } else {
        $query .= "
            WHERE pt.transaction_date BETWEEN ? AND ?
            AND pt.status = 'completed'
        ";
        $params = [$startDate, $endDateWithTime];
    }
    
    // Group by transaction to avoid duplicates
    $query .= "
        GROUP BY 
            pt.transaction_id, 
            pt.transaction_date, 
            pt.customer_name, 
            pt.subtotal, 
            pt.tax_amount, 
            pt.discount_amount, 
            pt.total_amount, 
            pt.status
        ORDER BY 
            pt.transaction_date DESC
    ";
    
    // Prepare and execute query
    $stmt = $conn->prepare($query);
    
    if (!empty($category)) {
        $stmt->bind_param('sss', $params[0], $params[1], $params[2]);
    } else {
        $stmt->bind_param('ss', $params[0], $params[1]);
    }
    
    $stmt->execute();
    $result = $stmt->get_result();
    
    // Fetch data
    $data = [];
    while ($row = $result->fetch_assoc()) {
        $data[] = $row;
    }
    
    return $data;
}
?>

