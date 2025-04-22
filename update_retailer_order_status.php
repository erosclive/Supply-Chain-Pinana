<?php
// Include database connection
require_once 'db_connection.php';

// Check if required parameters are provided
if (!isset($_GET['order_id']) || empty($_GET['order_id']) || !isset($_GET['action']) || empty($_GET['action'])) {
    echo json_encode(['success' => false, 'message' => 'Order ID and action are required']);
    exit;
}

$order_id = intval($_GET['order_id']);
$action = $_GET['action'];

// Validate action
$validActions = ['prepare_delivery', 'prepare_pickup'];
if (!in_array($action, $validActions)) {
    echo json_encode(['success' => false, 'message' => 'Invalid action']);
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
        echo json_encode(['success' => false, 'message' => 'Order not found']);
        $conn->rollback();
        exit;
    }
    
    $order = $orderResult->fetch_assoc();
    
    // Determine action and update accordingly
    $notes = '';
    $newStatus = 'preparing';
    
    if ($action === 'prepare_delivery') {
        // Check if delivery mode is set to delivery
        if ($order['delivery_mode'] !== 'delivery') {
            echo json_encode(['success' => false, 'message' => 'This order is not set for delivery']);
            $conn->rollback();
            exit;
        }
        $notes = 'Preparing order for delivery';
    } else if ($action === 'prepare_pickup') {
        // Check if delivery mode is set to pickup
        if ($order['delivery_mode'] !== 'pickup') {
            echo json_encode(['success' => false, 'message' => 'This order is not set for pickup']);
            $conn->rollback();
            exit;
        }
        $notes = 'Preparing order for pickup';
    }
    
    // Update order status in retailer_orders table
    $updateOrderQuery = "UPDATE retailer_orders SET status = ? WHERE order_id = ?";
    $updateOrderStmt = $conn->prepare($updateOrderQuery);
    $updateOrderStmt->bind_param('si', $newStatus, $order_id);
    $updateOrderStmt->execute();
    
    // Add status history entry
    $insertHistoryQuery = "INSERT INTO retailer_order_status_history (order_id, status, notes, created_at) 
                          VALUES (?, ?, ?, NOW())";
    $insertHistoryStmt = $conn->prepare($insertHistoryQuery);
    $insertHistoryStmt->bind_param('iss', $order_id, $newStatus, $notes);
    $insertHistoryStmt->execute();
    
    // Commit transaction
    $conn->commit();
    
    // Return success response
    echo json_encode([
        'success' => true,
        'message' => 'Order status updated successfully'
    ]);
    
} catch (Exception $e) {
    // Rollback transaction on error
    $conn->rollback();
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}

// Close connection
$conn->close();
?>