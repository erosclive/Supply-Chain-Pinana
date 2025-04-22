<?php
// reports.php - Handles fetching data for various report types

// Set headers for JSON response
header('Content-Type: application/json');

// Include database connection
require_once '../db_connection.php';

// Enable error reporting for debugging (remove in production)
error_reporting(E_ALL);
ini_set('display_errors', 1);

try {
    // Get report parameters
    $reportType = isset($_GET['type']) ? $_GET['type'] : 'sales';
    $startDate = isset($_GET['start_date']) ? $_GET['start_date'] : date('Y-m-d', strtotime('-30 days'));
    $endDate = isset($_GET['end_date']) ? $_GET['end_date'] : date('Y-m-d');
    $category = isset($_GET['category']) ? $_GET['category'] : '';
    
    // Validate dates
    if (!validateDate($startDate) || !validateDate($endDate)) {
        throw new Exception("Invalid date format. Use YYYY-MM-DD format.");
    }
    
    // Fetch report data based on type
    $data = [];
    
    switch ($reportType) {
        case 'sales':
            $data = getSalesReport($conn, $startDate, $endDate, $category);
            break;
        case 'products':
            $data = getProductSalesReport($conn, $startDate, $endDate, $category);
            break;
        case 'categories':
            $data = getCategorySalesReport($conn, $startDate, $endDate);
            break;
        case 'transactions':
            $data = getTransactionsReport($conn, $startDate, $endDate, $category);
            break;
        default:
            throw new Exception("Invalid report type");
    }
    
    // Return success response
    echo json_encode([
        'success' => true,
        'report_type' => $reportType,
        'start_date' => $startDate,
        'end_date' => $endDate,
        'category' => $category,
        'data' => $data
    ]);
    
} catch (Exception $e) {
    // Return error response
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
} finally {
    // Close connection
    if (isset($conn)) {
        mysqli_close($conn);
    }
}

// Function to validate date format
function validateDate($date, $format = 'Y-m-d') {
    $d = DateTime::createFromFormat($format, $date);
    return $d && $d->format($format) === $date;
}

// Function to get sales report data
function getSalesReport($conn, $startDate, $endDate, $category) {
    // Add time to end date to include the entire day
    $endDate = $endDate . ' 23:59:59';
    
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
        ";
        $params = [$category, $startDate, $endDate];
    } else {
        $query .= "
            WHERE pt.transaction_date BETWEEN ? AND ?
        ";
        $params = [$startDate, $endDate];
    }
    
    // Group by date
    $query .= "
        GROUP BY DATE(pt.transaction_date)
        ORDER BY date ASC
    ";
    
    // Prepare and execute query
    $stmt = mysqli_prepare($conn, $query);
    
    if (!empty($category)) {
        mysqli_stmt_bind_param($stmt, 'sss', $params[0], $params[1], $params[2]);
    } else {
        mysqli_stmt_bind_param($stmt, 'ss', $params[0], $params[1]);
    }
    
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);
    
    // Fetch data
    $data = [];
    while ($row = mysqli_fetch_assoc($result)) {
        $data[] = $row;
    }
    
    return $data;
}

// Function to get product sales report data
function getProductSalesReport($conn, $startDate, $endDate, $category) {
    // Add time to end date to include the entire day
    $endDate = $endDate . ' 23:59:59';
    
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
    ";
    
    // Add category filter if specified
    if (!empty($category)) {
        $query .= " AND p.category = ?";
        $params = [$startDate, $endDate, $category];
    } else {
        $params = [$startDate, $endDate];
    }
    
    // Group by product
    $query .= "
        GROUP BY p.product_id, p.product_name, p.category
        ORDER BY total_revenue DESC
    ";
    
    // Prepare and execute query
    $stmt = mysqli_prepare($conn, $query);
    
    if (!empty($category)) {
        mysqli_stmt_bind_param($stmt, 'sss', $params[0], $params[1], $params[2]);
    } else {
        mysqli_stmt_bind_param($stmt, 'ss', $params[0], $params[1]);
    }
    
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);
    
    // Fetch data
    $data = [];
    while ($row = mysqli_fetch_assoc($result)) {
        $data[] = $row;
    }
    
    return $data;
}

// Function to get category sales report data
function getCategorySalesReport($conn, $startDate, $endDate) {
    // Add time to end date to include the entire day
    $endDate = $endDate . ' 23:59:59';
    
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
            AND p.category IS NOT NULL
            AND p.category != ''
        GROUP BY 
            p.category
        ORDER BY 
            total_revenue DESC
    ";
    
    // Prepare and execute query
    $stmt = mysqli_prepare($conn, $query);
    mysqli_stmt_bind_param($stmt, 'ss', $startDate, $endDate);
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);
    
    // Fetch data
    $data = [];
    while ($row = mysqli_fetch_assoc($result)) {
        $data[] = $row;
    }
    
    return $data;
}

// Function to get transactions report data
function getTransactionsReport($conn, $startDate, $endDate, $category) {
    // Add time to end date to include the entire day
    $endDate = $endDate . ' 23:59:59';
    
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
            (SELECT method_name FROM pos_payment_methods WHERE payment_method_id = ptp.payment_method_id) as payment_method
        FROM 
            pos_transactions pt
        LEFT JOIN 
            pos_transaction_payments ptp ON pt.transaction_id = ptp.transaction_id
    ";
    
    // Add category filter if specified
    if (!empty($category)) {
        $query .= "
            JOIN pos_transaction_items pti ON pt.transaction_id = pti.transaction_id
            JOIN products p ON pti.product_id = p.product_id
            WHERE p.category = ? AND pt.transaction_date BETWEEN ? AND ?
        ";
        $params = [$category, $startDate, $endDate];
    } else {
        $query .= "
            WHERE pt.transaction_date BETWEEN ? AND ?
        ";
        $params = [$startDate, $endDate];
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
            pt.status,
            payment_method
        ORDER BY 
            pt.transaction_date DESC
    ";
    
    // Prepare and execute query
    $stmt = mysqli_prepare($conn, $query);
    
    if (!empty($category)) {
        mysqli_stmt_bind_param($stmt, 'sss', $params[0], $params[1], $params[2]);
    } else {
        mysqli_stmt_bind_param($stmt, 'ss', $params[0], $params[1]);
    }
    
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);
    
    // Fetch data
    $data = [];
    while ($row = mysqli_fetch_assoc($result)) {
        $data[] = $row;
    }
    
    return $data;
}
?>

