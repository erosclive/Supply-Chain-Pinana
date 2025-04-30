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
$deliveryMode = isset($_GET['delivery_mode']) ? $_GET['delivery_mode'] : 'all';
$search = isset($_GET['search']) ? $_GET['search'] : '';
$ongoing = isset($_GET['ongoing']) && $_GET['ongoing'] === 'true';
$completed = isset($_GET['completed']) && $_GET['completed'] === 'true';

// Build WHERE clause
$whereClause = "WHERE 1=1";
$params = [];
$types = "";

// Status filter
if ($status !== 'all') {
    if ($status === 'ongoing') {
        // Ongoing orders: confirmed, shipped, or ready for pickup
        $whereClause .= " AND (ro.status = 'confirmed' OR ro.status = 'shipped' OR ro.status = 'ready_for_pickup' OR ro.status = 'ready-to-pickup' OR ro.status = 'ready for pickup')";
    } else if ($status === 'completed') {
        // Completed orders: delivered or picked up
        $whereClause .= " AND ((ro.status = 'delivered') OR (ro.delivery_mode = 'pickup' AND (ro.status = 'picked_up' OR ro.status = 'picked-up' OR ro.pickup_status = 'picked_up' OR ro.pickup_status = 'picked-up')))";
    } else {
        // Regular status filter
        $whereClause .= " AND ro.status = ?";
        $params[] = $status;
        $types .= "s";
    }
}

// Delivery mode filter
if ($deliveryMode !== 'all') {
    $whereClause .= " AND ro.delivery_mode = ?";
    $params[] = $deliveryMode;
    $types .= "s";
}

// Ongoing orders filter (confirmed, shipped, ready for pickup)
if ($ongoing) {
    $whereClause .= " AND (ro.status = 'confirmed' OR ro.status = 'shipped' OR ro.status = 'ready_for_pickup' OR ro.status = 'ready-to-pickup' OR ro.status = 'ready for pickup')";
}

// Completed orders filter (delivered or picked up)
if ($completed) {
    $whereClause .= " AND ((ro.status = 'delivered') OR (ro.delivery_mode = 'pickup' AND (ro.status = 'picked_up' OR ro.status = 'picked up' OR ro.pickup_status = 'picked_up' OR ro.pickup_status = 'picked-up')))";
}
// Search filter
if (!empty($search)) {
    $whereClause .= " AND (ro.po_number LIKE ? OR ro.retailer_name LIKE ? OR ro.retailer_email LIKE ?)";
    $searchTerm = "%$search%";
    $params[] = $searchTerm;
    $params[] = $searchTerm;
    $params[] = $searchTerm;
    $types .= "sss";
}

// Count total orders with filters
$countQuery = "SELECT COUNT(*) as total FROM retailer_orders ro $whereClause";
$stmt = mysqli_prepare($conn, $countQuery);

if (!empty($params)) {
    mysqli_stmt_bind_param($stmt, $types, ...$params);
}

mysqli_stmt_execute($stmt);
$countResult = mysqli_stmt_get_result($stmt);
$totalCount = mysqli_fetch_assoc($countResult)['total'];

// Get orders with pagination
$query = "
    SELECT 
        ro.order_id, 
        ro.po_number,
        ro.retailer_name, 
        ro.retailer_email, 
        ro.retailer_contact,
        ro.order_date,
        ro.expected_delivery,
        ro.delivery_mode,
        ro.pickup_location,
        ro.pickup_date,
        ro.status,
        ro.pickup_status,
        ro.subtotal,
        ro.tax,
        ro.discount,
        ro.total_amount,
        ro.notes,
        (SELECT COUNT(*) FROM retailer_order_items WHERE order_id = ro.order_id) as item_count
    FROM retailer_orders ro
    $whereClause
    ORDER BY ro.order_date DESC
    LIMIT ?, ?
";

$stmt = mysqli_prepare($conn, $query);

// Add pagination parameters
$params[] = $offset;
$params[] = $limit;
$types .= "ii";

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
    'stats' => $stats
]);

// Function to get retailer order statistics
function getRetailerOrderStats() {
    global $conn;
    
    // Total orders
    $totalQuery = "SELECT COUNT(*) as total FROM retailer_orders";
    $totalResult = mysqli_query($conn, $totalQuery);
    $totalOrders = mysqli_fetch_assoc($totalResult)['total'];
    
    // Pending orders (order status)
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
    
    // Add pickup-specific stats
    $pickupOrdersQuery = "SELECT COUNT(*) as total FROM retailer_orders WHERE delivery_mode = 'pickup'";
    $pickupOrdersResult = mysqli_query($conn, $pickupOrdersQuery);
    $pickupOrders = mysqli_fetch_assoc($pickupOrdersResult)['total'];
    
    $readyForPickupQuery = "SELECT COUNT(*) as total FROM retailer_orders WHERE delivery_mode = 'pickup' AND (status = 'ready_for_pickup' OR status = 'ready-to-pickup' OR status = 'ready for pickup')";
    $readyForPickupResult = mysqli_query($conn, $readyForPickupQuery);
    $readyForPickup = mysqli_fetch_assoc($readyForPickupResult)['total'];
    
    $pickedUpQuery = "SELECT COUNT(*) as total FROM retailer_orders WHERE delivery_mode = 'pickup' AND (status = 'picked_up' OR status = 'picked up')";
    $pickedUpResult = mysqli_query($conn, $pickedUpQuery);
    $pickedUp = mysqli_fetch_assoc($pickedUpResult)['total'];
    
    return [
        'total_orders' => $totalOrders,
        'pending_orders' => $pendingOrders,
        'confirmed_orders' => $confirmedOrders,
        'total_revenue' => $totalRevenue,
        'growth_percentage' => $growthPercentage,
        'pickup_orders' => $pickupOrders,
        'ready_for_pickup' => $readyForPickup,
        'picked_up' => $pickedUp
    ];
}
?>
