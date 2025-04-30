<?php
// Include database connection
require_once '../db_connection.php';

// Set headers for JSON response
header('Content-Type: application/json');

// Get query parameters
$page = isset($_GET['page']) ? intval($_GET['page']) : 1;
$limit = isset($_GET['limit']) ? intval($_GET['limit']) : 10;
$status = isset($_GET['status']) ? $_GET['status'] : '';
$search = isset($_GET['search']) ? $_GET['search'] : '';

// Calculate offset
$offset = ($page - 1) * $limit;

// Build the base query
$query = "SELECT ro.*, 
          (SELECT COUNT(*) FROM retailer_order_items WHERE order_id = ro.order_id) as item_count 
          FROM retailer_orders ro 
          WHERE 1=1";

// Add status filter if provided
if (!empty($status)) {
    $status = mysqli_real_escape_string($conn, $status);
    $query .= " AND ro.status = '$status'";
}

// Add search filter if provided
if (!empty($search)) {
    $search = mysqli_real_escape_string($conn, $search);
    $query .= " AND (ro.po_number LIKE '%$search%' OR ro.retailer_name LIKE '%$search%' OR ro.retailer_email LIKE '%$search%')";
}

// Count total records for pagination
$countQuery = str_replace("ro.*, (SELECT COUNT(*) FROM retailer_order_items WHERE order_id = ro.order_id) as item_count", "COUNT(*) as total", $query);
$countResult = mysqli_query($conn, $countQuery);
$totalRow = mysqli_fetch_assoc($countResult);
$total = $totalRow['total'];

// Add pagination
$query .= " ORDER BY ro.order_id DESC LIMIT $offset, $limit";

// Execute the query
$result = mysqli_query($conn, $query);

if (!$result) {
    echo json_encode([
        'success' => false,
        'message' => 'Database error: ' . mysqli_error($conn)
    ]);
    exit;
}

// Fetch all orders
$orders = [];
while ($row = mysqli_fetch_assoc($result)) {
    $orders[] = $row;
}

// Return the response
echo json_encode([
    'success' => true,
    'orders' => $orders,
    'total' => $total,
    'page' => $page,
    'limit' => $limit,
    'pages' => ceil($total / $limit)
]);

// Close the connection
mysqli_close($conn);
?>