<?php
// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Include database connection
require_once 'db_connection.php';

// Set header to return JSON
header('Content-Type: application/json');

// Get query parameters
$page = isset($_GET['page']) ? intval($_GET['page']) : 1;
$limit = isset($_GET['limit']) ? intval($_GET['limit']) : 10;
$status = isset($_GET['status']) ? $_GET['status'] : 'all';
$search = isset($_GET['search']) ? $_GET['search'] : '';
$dateRange = isset($_GET['dateRange']) ? $_GET['dateRange'] : 'all';
$startDate = isset($_GET['startDate']) ? $_GET['startDate'] : '';
$endDate = isset($_GET['endDate']) ? $_GET['endDate'] : '';

// Calculate offset
$offset = ($page - 1) * $limit;

try {
    // Build query
    $query = "SELECT o.* FROM orders o WHERE 1=1";
    $countQuery = "SELECT COUNT(*) as total FROM orders o WHERE 1=1";
    $params = [];
    $types = "";
    
    // Add status filter
    if ($status !== 'all') {
        $query .= " AND o.status = ?";
        $countQuery .= " AND o.status = ?";
        $params[] = $status;
        $types .= "s";
    }
    
    // Add search filter
    if (!empty($search)) {
        $searchTerm = "%$search%";
        $query .= " AND (o.order_id LIKE ? OR o.customer_name LIKE ? OR o.customer_email LIKE ? OR o.customer_phone LIKE ?)";
        $countQuery .= " AND (o.order_id LIKE ? OR o.customer_name LIKE ? OR o.customer_email LIKE ? OR o.customer_phone LIKE ?)";
        $params[] = $searchTerm;
        $params[] = $searchTerm;
        $params[] = $searchTerm;
        $params[] = $searchTerm;
        $types .= "ssss";
    }
    
    // Add date filter
    if ($dateRange !== 'all') {
        if ($dateRange === 'today') {
            $query .= " AND DATE(o.order_date) = CURDATE()";
            $countQuery .= " AND DATE(o.order_date) = CURDATE()";
        } elseif ($dateRange === 'week') {
            $query .= " AND o.order_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)";
            $countQuery .= " AND o.order_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)";
        } elseif ($dateRange === 'month') {
            $query .= " AND o.order_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)";
            $countQuery .= " AND o.order_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)";
        } elseif ($dateRange === 'custom' && !empty($startDate) && !empty($endDate)) {
            $query .= " AND o.order_date BETWEEN ? AND ?";
            $countQuery .= " AND o.order_date BETWEEN ? AND ?";
            $params[] = $startDate;
            $params[] = $endDate;
            $types .= "ss";
        }
    }
    
    // Add order by
    $query .= " ORDER BY o.created_at DESC";
    
    // Add limit and offset
    $query .= " LIMIT ? OFFSET ?";
    $params[] = $limit;
    $params[] = $offset;
    $types .= "ii";
    
    // Prepare and execute count query
    $countStmt = mysqli_prepare($conn, $countQuery);
    if ($types !== "" && count($params) > 0) {
        $countBindParams = array_merge([$countStmt, $types], $params);
        call_user_func_array('mysqli_stmt_bind_param', $countBindParams);
    }
    
    mysqli_stmt_execute($countStmt);
    $countResult = mysqli_stmt_get_result($countStmt);
    $totalRow = mysqli_fetch_assoc($countResult);
    $total = $totalRow['total'];
    
    // Prepare and execute main query
    $stmt = mysqli_prepare($conn, $query);
    if ($types !== "" && count($params) > 0) {
        $bindParams = array_merge([$stmt, $types], $params);
        call_user_func_array('mysqli_stmt_bind_param', $bindParams);
    }
    
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);
    
    $orders = [];
    
    while ($row = mysqli_fetch_assoc($result)) {
        $order_id = $row['id'];
        
        // Get order items
        $itemsQuery = "SELECT * FROM order_items WHERE order_id = ?";
        $itemsStmt = mysqli_prepare($conn, $itemsQuery);
        mysqli_stmt_bind_param($itemsStmt, "i", $order_id);
        mysqli_stmt_execute($itemsStmt);
        $itemsResult = mysqli_stmt_get_result($itemsStmt);
        
        $items = [];
        while ($itemRow = mysqli_fetch_assoc($itemsResult)) {
            $items[] = [
                'product_id' => $itemRow['product_id'],
                'product_name' => $itemRow['product_name'],
                'quantity' => $itemRow['quantity'],
                'unit_price' => $itemRow['unit_price'],
                'total_price' => $itemRow['total_price']
            ];
        }
        
        $row['items'] = $items;
        $orders[] = $row;
    }
    
    // Calculate total pages
    $totalPages = ceil($total / $limit);
    
    // Return orders as JSON
    echo json_encode([
        'success' => true,
        'orders' => $orders,
        'pagination' => [
            'total' => $total,
            'totalPages' => $totalPages,
            'currentPage' => $page,
            'limit' => $limit
        ],
        'stats' => [
            'total_orders' => $total,
            'pending_orders' => getOrderCountByStatus($conn, 'pending'),
            'received_orders' => getOrderCountByStatus($conn, 'delivered'),
            'total_spent' => getTotalSpent($conn)
        ]
    ]);
    
} catch (Exception $e) {
    // Return error as JSON
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}

// Function to get order count by status
function getOrderCountByStatus($conn, $status) {
    $query = "SELECT COUNT(*) as count FROM orders WHERE status = ?";
    $stmt = mysqli_prepare($conn, $query);
    mysqli_stmt_bind_param($stmt, "s", $status);
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);
    $row = mysqli_fetch_assoc($result);
    return $row['count'];
}

// Function to get total spent
function getTotalSpent($conn) {
    $query = "SELECT SUM(total_amount) as total FROM orders";
    $result = mysqli_query($conn, $query);
    $row = mysqli_fetch_assoc($result);
    return $row['total'] ? $row['total'] : 0;
}

// Close connection
mysqli_close($conn);
?>
