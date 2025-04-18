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

// Get JSON data from request
$jsonData = file_get_contents('php://input');
$data = json_decode($jsonData, true);

if (!$data || !isset($data['order_id'])) {
    echo json_encode([
        'success' => false,
        'message' => 'Invalid data format or missing order ID'
    ]);
    exit;
}

$order_id = intval($data['order_id']);

try {
    // Start transaction
    mysqli_begin_transaction($conn);
    
    // Verify the order belongs to this user
    $checkQuery = "SELECT ro.order_id FROM retailer_orders ro 
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
        throw new Exception("Order not found or you do not have permission to delete it");
    }
    
    // Check if order can be deleted (only draft or order status)
    $statusQuery = "SELECT status FROM retailer_orders WHERE order_id = ?";
    $statusStmt = mysqli_prepare($conn, $statusQuery);
    mysqli_stmt_bind_param($statusStmt, "i", $order_id);
    mysqli_stmt_execute($statusStmt);
    $statusResult = mysqli_stmt_get_result($statusStmt);
    $orderStatus = mysqli_fetch_assoc($statusResult)['status'];
    
    if (!in_array($orderStatus, ['draft', 'order'])) {
        throw new Exception("Only orders with 'draft' or 'order' status can be deleted");
    }
    
    // Delete order items
    $deleteItemsQuery = "DELETE FROM retailer_order_items WHERE order_id = ?";
    $deleteItemsStmt = mysqli_prepare($conn, $deleteItemsQuery);
    
    if (!$deleteItemsStmt) {
        throw new Exception("Delete items query preparation failed: " . mysqli_error($conn));
    }
    
    mysqli_stmt_bind_param($deleteItemsStmt, "i", $order_id);
    
    if (!mysqli_stmt_execute($deleteItemsStmt)) {
        throw new Exception("Error deleting order items: " . mysqli_stmt_error($deleteItemsStmt));
    }
    
    // Delete status history
    $deleteHistoryQuery = "DELETE FROM retailer_order_status_history WHERE order_id = ?";
    $deleteHistoryStmt = mysqli_prepare($conn, $deleteHistoryQuery);
    
    if (!$deleteHistoryStmt) {
        throw new Exception("Delete history query preparation failed: " . mysqli_error($conn));
    }
    
    mysqli_stmt_bind_param($deleteHistoryStmt, "i", $order_id);
    
    if (!mysqli_stmt_execute($deleteHistoryStmt)) {
        throw new Exception("Error deleting status history: " . mysqli_stmt_error($deleteHistoryStmt));
    }
    
    // Delete order
    $deleteOrderQuery = "DELETE FROM retailer_orders WHERE order_id = ?";
    $deleteOrderStmt = mysqli_prepare($conn, $deleteOrderQuery);
    
    if (!$deleteOrderStmt) {
        throw new Exception("Delete order query preparation failed: " . mysqli_error($conn));
    }
    
    mysqli_stmt_bind_param($deleteOrderStmt, "i", $order_id);
    
    if (!mysqli_stmt_execute($deleteOrderStmt)) {
        throw new Exception("Error deleting order: " . mysqli_stmt_error($deleteOrderStmt));
    }
    
    // Commit transaction
    mysqli_commit($conn);
    
    echo json_encode([
        'success' => true,
        'message' => 'Order deleted successfully'
    ]);
    
} catch (Exception $e) {
    // Rollback transaction on error
    mysqli_rollback($conn);
    
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>
