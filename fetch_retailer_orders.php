<?php
// Include database connection
require_once 'db_connection.php';

// Set headers to prevent caching
header('Cache-Control: no-cache, must-revalidate');
header('Expires: Mon, 26 Jul 1997 05:00:00 GMT');
header('Content-Type: application/json');

// Get pagination parameters
$page = isset($_GET['page']) ? intval($_GET['page']) : 1;
$limit = isset($_GET['limit']) ? intval($_GET['limit']) : 10;
$offset = ($page - 1) * $limit;

// Get filter parameters
$status = isset($_GET['status']) ? $_GET['status'] : 'all';
$search = isset($_GET['search']) ? $_GET['search'] : '';

// Build WHERE clause
$whereClause = "WHERE 1=1";
$params = [];

// Status filter
if ($status !== 'all') {
    $whereClause .= " AND status = ?";
    $params[] = $status;
}

// Search filter
if (!empty($search)) {
    $whereClause .= " AND (order_id LIKE ? OR retailer_name LIKE ? OR po_number LIKE ?)";
    $searchTerm = "%$search%";
    $params[] = $searchTerm;
    $params[] = $searchTerm;
    $params[] = $searchTerm;
}

// Count total orders with filters
$countQuery = "SELECT COUNT(*) as total FROM retailer_orders $whereClause";
$stmt = mysqli_prepare($conn, $countQuery);

if (!empty($params)) {
    $types = str_repeat('s', count($params));
    mysqli_stmt_bind_param($stmt, $types, ...$params);
}

mysqli_stmt_execute($stmt);
$countResult = mysqli_stmt_get_result($stmt);
$totalCount = mysqli_fetch_assoc($countResult)['total'];

// Get orders with pagination
$query = "
    SELECT 
        order_id, 
        po_number,
        retailer_name, 
        retailer_email, 
        retailer_contact,
        order_date,
        expected_delivery,
        delivery_mode,
        pickup_location,
        pickup_date,
        status, 
        subtotal,
        tax,
        discount,
        total_amount,
        notes,
        (SELECT COUNT(*) FROM retailer_order_items WHERE order_id = retailer_orders.order_id) as item_count
    FROM retailer_orders
    $whereClause
    ORDER BY order_date DESC
    LIMIT ?, ?
";

$stmt = mysqli_prepare($conn, $query);

$params[] = $offset;
$params[] = $limit;
$types = str_repeat('s', count($params) - 2) . 'ii';
mysqli_stmt_bind_param($stmt, $types, ...$params);

mysqli_stmt_execute($stmt);
$result = mysqli_stmt_get_result($stmt);

$orders = [];
while ($row = mysqli_fetch_assoc($result)) {
    $orders[] = $row;
}

// Get order statistics
$stats = getRetailerOrderStats();

echo json_encode([
    'success' => true,
    'orders' => $orders,
    'total_count' => $totalCount,
    'total_pages' => ceil($totalCount / $limit),
    'stats' => $stats
]);

// Function to get retailer order statistics
function getRetailerOrderStats() {
    global $conn;
    
    // Total orders
    $totalQuery = "SELECT COUNT(*) as total FROM retailer_orders";
    $totalResult = mysqli_query($conn, $totalQuery);
    $totalOrders = mysqli_fetch_assoc($totalResult)['total'];
    
    // Pending orders (status = 'order')
    $pendingQuery = "SELECT COUNT(*) as total FROM retailer_orders WHERE status = 'order'";
    $pendingResult = mysqli_query($conn, $pendingQuery);
    $pendingOrders = mysqli_fetch_assoc($pendingResult)['total'];
    
    // Confirmed orders
    $confirmedQuery = "SELECT COUNT(*) as total FROM retailer_orders WHERE status = 'confirmed'";
    $confirmedResult = mysqli_query($conn, $confirmedQuery);
    $confirmedOrders = mysqli_fetch_assoc($confirmedResult)['total'];
    
    // Total revenue
    $revenueQuery = "SELECT SUM(total_amount) as total FROM retailer_orders";
    $revenueResult = mysqli_query($conn, $revenueQuery);
    $totalRevenue = mysqli_fetch_assoc($revenueResult)['total'] ?? 0;
    
    // Growth percentage (comparing current month to previous month)
    $currentMonth = date('Y-m');
    $previousMonth = date('Y-m', strtotime('-1 month'));
    
    $currentMonthQuery = "SELECT COUNT(*) as total FROM retailer_orders WHERE DATE_FORMAT(order_date, '%Y-%m') = '$currentMonth'";
    $previousMonthQuery = "SELECT COUNT(*) as total FROM retailer_orders WHERE DATE_FORMAT(order_date, '%Y-%m') = '$previousMonth'";
    
    $currentMonthResult = mysqli_query($conn, $currentMonthQuery);
    $previousMonthResult = mysqli_query($conn, $previousMonthQuery);
    
    $currentMonthOrders = mysqli_fetch_assoc($currentMonthResult)['total'];
    $previousMonthOrders = mysqli_fetch_assoc($previousMonthResult)['total'];
    
    $growthPercentage = 0;
    if ($previousMonthOrders > 0) {
        $growthPercentage = round((($currentMonthOrders - $previousMonthOrders) / $previousMonthOrders) * 100, 2);
    }
    
    return [
        'total_orders' => $totalOrders,
        'pending_orders' => $pendingOrders,
        'confirmed_orders' => $confirmedOrders,
        'total_revenue' => $totalRevenue,
        'growth_percentage' => $growthPercentage
    ];
}
?>