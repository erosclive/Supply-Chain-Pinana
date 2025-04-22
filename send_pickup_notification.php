<?php
// Include database connection
require_once 'db_connection.php';

// Get JSON data from request
$jsonData = file_get_contents('php://input');
$data = json_decode($jsonData, true);

// Check if required data is provided
if (!isset($data['order_id']) || empty($data['order_id']) || 
    !isset($data['pickup_date']) || empty($data['pickup_date']) || 
    !isset($data['pickup_time']) || empty($data['pickup_time']) || 
    !isset($data['pickup_location']) || empty($data['pickup_location'])) {
    echo json_encode(['success' => false, 'message' => 'Required fields are missing']);
    exit;
}

$order_id = intval($data['order_id']);
$pickup_date = $data['pickup_date'];
$pickup_time = $data['pickup_time'];
$pickup_location = $data['pickup_location'];
$pickup_notes = $data['pickup_notes'] ?? '';
$send_sms = $data['send_sms'] ?? false;
$send_email = $data['send_email'] ?? false;

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
    
    // Check if delivery mode is set to pickup
    if ($order['delivery_mode'] !== 'pickup') {
        echo json_encode(['success' => false, 'message' => 'This order is not set for pickup']);
        $conn->rollback();
        exit;
    }
    
    // Update order with pickup details
    $updateOrderQuery = "UPDATE retailer_orders 
                        SET pickup_date = ?, 
                            pickup_location = ?, 
                            notes = CONCAT(IFNULL(notes, ''), '\nPickup Notes: ', ?) 
                        WHERE order_id = ?";
    $updateOrderStmt = $conn->prepare($updateOrderQuery);
    $formattedPickupDate = $pickup_date . ' ' . $pickup_time;
    $updateOrderStmt->bind_param('sssi', $formattedPickupDate, $pickup_location, $pickup_notes, $order_id);
    $updateOrderStmt->execute();
    
    // Add status history entry
    $notes = "Pickup notification sent. Pickup scheduled for {$formattedPickupDate} at {$pickup_location}";
    
    $insertHistoryQuery = "INSERT INTO retailer_order_status_history (order_id, status, notes, created_at) 
                          VALUES (?, ?, ?, NOW())";
    $insertHistoryStmt = $conn->prepare($insertHistoryQuery);
    $status = $order['status']; // Keep current status
    $insertHistoryStmt->bind_param('iss', $order_id, $status, $notes);
    $insertHistoryStmt->execute();
    
    // Send notifications (placeholder for actual implementation)
    $notificationSent = false;
    
    if ($send_sms && !empty($order['retailer_contact'])) {
        // Placeholder for SMS sending logic
        // In a real implementation, you would integrate with an SMS API
        $notificationSent = true;
        
        // Log SMS notification
        $smsNotes = "SMS notification sent to {$order['retailer_contact']}";
        $insertSmsLogQuery = "INSERT INTO retailer_order_status_history (order_id, status, notes, created_at) 
                             VALUES (?, ?, ?, NOW())";
        $insertSmsLogStmt = $conn->prepare($insertSmsLogQuery);
        $insertSmsLogStmt->bind_param('iss', $order_id, $status, $smsNotes);
        $insertSmsLogStmt->execute();
    }
    
    if ($send_email && !empty($order['retailer_email'])) {
        // Placeholder for email sending logic
        // In a real implementation, you would use PHPMailer or similar
        $notificationSent = true;
        
        // Log email notification
        $emailNotes = "Email notification sent to {$order['retailer_email']}";
        $insertEmailLogQuery = "INSERT INTO retailer_order_status_history (order_id, status, notes, created_at) 
                              VALUES (?, ?, ?, NOW())";
        $insertEmailLogStmt = $conn->prepare($insertEmailLogQuery);
        $insertEmailLogStmt->bind_param('iss', $order_id, $status, $emailNotes);
        $insertEmailLogStmt->execute();
    }
    
    // Commit transaction
    $conn->commit();
    
    // Return success response
    echo json_encode([
        'success' => true,
        'message' => 'Pickup notification sent successfully',
        'notification_sent' => $notificationSent
    ]);
    
} catch (Exception $e) {
    // Rollback transaction on error
    $conn->rollback();
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}

// Close connection
$conn->close();
?>