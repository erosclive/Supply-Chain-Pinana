<?php
// Include database connection
require_once 'db_connection.php';

// Set headers
header('Content-Type: application/json');

// Check if request method is POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Invalid request method']);
    exit;
}

// Get POST data
$order_id = isset($_POST['order_id']) ? intval($_POST['order_id']) : 0;
$return_reason = isset($_POST['return_reason']) ? $_POST['return_reason'] : '';

// Validate required fields
if (!$order_id || empty($return_reason)) {
    echo json_encode(['success' => false, 'message' => 'Order ID and return reason are required']);
    exit;
}

try {
    // Start transaction
    $conn->begin_transaction();
    
    // Get current order details
    $orderQuery = "SELECT * FROM retailer_orders WHERE order_id = ?";
    $orderStmt = $conn->prepare($orderQuery);
    $orderStmt->bind_param('i', $order_id);
    $orderStmt->execute();
    $orderResult = $orderStmt->get_result();
    
    if ($orderResult->num_rows === 0) {
        throw new Exception('Order not found');
    }
    
    $order = $orderResult->fetch_assoc();
    
    // Check if order can be returned (delivered or picked up)
    if ($order['status'] !== 'delivered' && $order['pickup_status'] !== 'picked up') {
        throw new Exception('Only delivered or picked up orders can be returned');
    }
    
    // Update order status to return_requested
    $updateQuery = "UPDATE retailer_orders SET 
                    status = 'return_requested', 
                    updated_at = NOW()
                    WHERE order_id = ?";
                    
    $updateStmt = $conn->prepare($updateQuery);
    $updateStmt->bind_param('i', $order_id);
    
    if (!$updateStmt->execute()) {
        throw new Exception('Failed to update order status: ' . $conn->error);
    }
    
    // Add status history entry
    $historyQuery = "INSERT INTO retailer_order_status_history (order_id, status, notes, created_at)
                    VALUES (?, 'return_requested', ?, NOW())";
                    
    $historyStmt = $conn->prepare($historyQuery);
    $historyStmt->bind_param('is', $order_id, $return_reason);
    
    if (!$historyStmt->execute()) {
        throw new Exception('Failed to add status history: ' . $conn->error);
    }
    
    // Commit transaction
    $conn->commit();
    
    echo json_encode([
        'success' => true,
        'message' => 'Return request submitted successfully'
    ]);
    
} catch (Exception $e) {
    // Rollback transaction on error
    $conn->rollback();
    
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}

// Close connection
$conn->close();
?>