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
$resolution_action = isset($_POST['resolution_action']) ? $_POST['resolution_action'] : '';
$resolution_notes = isset($_POST['resolution_notes']) ? $_POST['resolution_notes'] : '';
$notify_customer = isset($_POST['notify_customer']) && $_POST['notify_customer'] === '1';
$new_status = isset($_POST['new_status']) ? $_POST['new_status'] : 'delivered'; // Default to delivered

// Validate required fields
if (!$order_id || empty($resolution_action) || empty($resolution_notes)) {
    echo json_encode(['success' => false, 'message' => 'Order ID, resolution action, and notes are required']);
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
    
    // Check if order status is return_requested
    if ($order['status'] !== 'return_requested') {
        throw new Exception('Order is not in return requested status');
    }
    
    // Determine final status based on delivery mode
    $finalStatus = $new_status;
    $pickupStatus = '';
    
    if ($order['delivery_mode'] === 'pickup') {
        $finalStatus = 'delivered'; // For pickup orders, we set status to delivered
        $pickupStatus = 'picked up'; // And pickup_status to picked up
    }
    
    // Update order status
    $updateQuery = "UPDATE retailer_orders SET 
                    status = ?, 
                    pickup_status = ?, 
                    return_resolution_action = ?,
                    return_resolution_notes = ?,
                    return_resolved_at = NOW(),
                    updated_at = NOW()
                    WHERE order_id = ?";
                    
    $updateStmt = $conn->prepare($updateQuery);
    $updateStmt->bind_param('ssssi', $finalStatus, $pickupStatus, $resolution_action, $resolution_notes, $order_id);
    
    if (!$updateStmt->execute()) {
        throw new Exception('Failed to update order status: ' . $conn->error);
    }
    
    // Add status history entry
    $historyNotes = "Return request resolved: " . $resolution_notes;
    $historyQuery = "INSERT INTO retailer_order_status_history (order_id, status, notes, created_at)
                    VALUES (?, ?, ?, NOW())";
                    
    $historyStmt = $conn->prepare($historyQuery);
    $historyStmt->bind_param('iss', $order_id, $finalStatus, $historyNotes);
    
    if (!$historyStmt->execute()) {
        throw new Exception('Failed to add status history: ' . $conn->error);
    }
    
    // Notify customer if requested
    if ($notify_customer) {
        // In a real application, you would send an email or SMS here
        // For now, we'll just log it
        $notifyQuery = "INSERT INTO customer_notifications (order_id, notification_type, message, created_at)
                        VALUES (?, 'return_resolution', ?, NOW())";
                        
        $notifyStmt = $conn->prepare($notifyQuery);
        $notifyMessage = "Your return request has been resolved. Action taken: " . $resolution_action . ". " . $resolution_notes;
        $notifyStmt->bind_param('is', $order_id, $notifyMessage);
        $notifyStmt->execute();
    }
    
    // Commit transaction
    $conn->commit();
    
    echo json_encode([
        'success' => true,
        'message' => 'Return request resolved successfully',
        'new_status' => $finalStatus,
        'pickup_status' => $pickupStatus
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