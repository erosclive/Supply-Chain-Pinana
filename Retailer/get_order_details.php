<?php
// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Include database connection
require_once 'db_connection.php';

// Start session if not already started
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Set header to return JSON
header('Content-Type: application/json');

// Check if user is logged in
if (!isset($_SESSION['user_id'])) {
    echo json_encode([
        'success' => false,
        'message' => 'User not logged in'
    ]);
    exit;
}

$user_id = $_SESSION['user_id'];

// Check if order_id is provided
if (!isset($_GET['order_id'])) {
    echo json_encode([
        'success' => false,
        'message' => 'Order ID is required'
    ]);
    exit;
}

$order_id = intval($_GET['order_id']);

try {
    // Verify the order belongs to this user
    $checkQuery = "SELECT ro.* FROM retailer_orders ro 
                  JOIN users u ON ro.retailer_email = u.email 
                  WHERE ro.order_id = ? AND u.id = ?";
    $checkStmt = mysqli_prepare($conn, $checkQuery);
    
    if (!$checkStmt) {
        throw new Exception("Query preparation failed: " . mysqli_error($conn));
    }
    
    mysqli_stmt_bind_param($checkStmt, "ii", $order_id, $user_id);
    
    if (!mysqli_stmt_execute($checkStmt)) {
        throw new Exception("Query execution failed: " . mysqli_stmt_error($checkStmt));
    }
    
    $result = mysqli_stmt_get_result($checkStmt);
    
    if (mysqli_num_rows($result) === 0) {
        echo json_encode([
            'success' => false,
            'message' => 'Order not found or you do not have permission to view it'
        ]);
        exit;
    }
    
    // Get order details
    $order = mysqli_fetch_assoc($result);
    
    // Get order items
    $itemsQuery = "SELECT roi.*, p.product_name 
                  FROM retailer_order_items roi
                  LEFT JOIN products p ON roi.product_id = p.product_id
                  WHERE roi.order_id = ?";
    $itemsStmt = mysqli_prepare($conn, $itemsQuery);
    
    if (!$itemsStmt) {
        throw new Exception("Items query preparation failed: " . mysqli_error($conn));
    }
    
    mysqli_stmt_bind_param($itemsStmt, "i", $order_id);
    
    if (!mysqli_stmt_execute($itemsStmt)) {
        throw new Exception("Items query execution failed: " . mysqli_stmt_error($itemsStmt));
    }
    
    $itemsResult = mysqli_stmt_get_result($itemsStmt);
    
    $items = [];
    while ($item = mysqli_fetch_assoc($itemsResult)) {
        $items[] = $item;
    }
    
    $order['items'] = $items;
    
    // Get status history
    $historyQuery = "SELECT * FROM retailer_order_status_history 
                    WHERE order_id = ? 
                    ORDER BY created_at ASC";
    $historyStmt = mysqli_prepare($conn, $historyQuery);
    
    if (!$historyStmt) {
        throw new Exception("History query preparation failed: " . mysqli_error($conn));
    }
    
    mysqli_stmt_bind_param($historyStmt, "i", $order_id);
    
    if (!mysqli_stmt_execute($historyStmt)) {
        throw new Exception("History query execution failed: " . mysqli_stmt_error($historyStmt));
    }
    
    $historyResult = mysqli_stmt_get_result($historyStmt);
    
    $statusHistory = [];
    while ($history = mysqli_fetch_assoc($historyResult)) {
        $statusHistory[] = $history;
    }
    
    $order['status_history'] = $statusHistory;
    
    // Return order details
    echo json_encode([
        'success' => true,
        'order' => $order
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>
