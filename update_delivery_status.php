<?php
// Include database connection
require_once 'db_connect.php';

// Get JSON data from request
$jsonData = file_get_contents('php://input');
$data = json_decode($jsonData, true);

// Check if required data is provided
if (!isset($data['order_id']) || empty($data['order_id']) || !isset($data['status']) || empty($data['status'])) {
    echo json_encode(['success' => false, 'message' => 'Order ID and status are required']);
    exit;
}

$order_id = intval($data['order_id']);
$status = $data['status'];

// Validate status
$validStatuses = ['confirmed', 'preparing', 'out_for_delivery', 'delivered'];
if (!in_array($status, $validStatuses)) {
    echo json_encode(['success' => false, 'message' => 'Invalid status']);
    exit;
}

try {
    // Start transaction
    $conn->begin_transaction();
    
    // Update order status in retailer_orders table if needed
    if ($status === 'delivered') {
        $updateOrderQuery = "UPDATE retailer_orders SET status = 'confirmed' WHERE order_id = ?";
        $updateOrderStmt = $conn->prepare($updateOrderQuery);
        $updateOrderStmt->bind_param('i', $order_id);
        $updateOrderStmt->execute();
    }
    
    // Add status history entry
    $notes = '';
    switch ($status) {
        case 'confirmed':
            $notes = 'Order confirmed';
            break;
        case 'preparing':
            $notes = 'Preparing order for delivery';
            break;
        case 'out_for_delivery':
            $notes = 'Order out for delivery';
            break;
        case 'delivered':
            $notes = 'Order delivered successfully';
            break;
    }
    
    $insertHistoryQuery = "INSERT INTO retailer_order_status_history (order_id, status, notes, created_at) 
                          VALUES (?, ?, ?, NOW())";
    $insertHistoryStmt = $conn->prepare($insertHistoryQuery);
    $insertHistoryStmt->bind_param('iss', $order_id, $status, $notes);
    $insertHistoryStmt->execute();
    
    // Commit transaction
    $conn->commit();
    
    // Return success response
    echo json_encode([
        'success' => true,
        'message' => 'Delivery status updated successfully'
    ]);
    
} catch (Exception $e) {
    // Rollback transaction on error
    $conn->rollback();
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}

// Close connection
$conn->close();
?>