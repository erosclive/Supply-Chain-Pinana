<?php
// Include database connection
require_once 'db_connection.php';

// Check if order ID is provided
if (!isset($_GET['order_id']) || empty($_GET['order_id'])) {
    echo json_encode(['success' => false, 'message' => 'Order ID is required']);
    exit;
}

$order_id = intval($_GET['order_id']);

try {
    // Get order details
    $orderQuery = "SELECT * FROM retailer_orders WHERE order_id = ?";
    $orderStmt = $conn->prepare($orderQuery);
    $orderStmt->bind_param('i', $order_id);
    $orderStmt->execute();
    $orderResult = $orderStmt->get_result();
    
    if ($orderResult->num_rows === 0) {
        echo json_encode(['success' => false, 'message' => 'Order not found']);
        exit;
    }
    
    $order = $orderResult->fetch_assoc();
    
    // Check if delivery mode is set to delivery
    if ($order['delivery_mode'] !== 'delivery') {
        echo json_encode(['success' => false, 'message' => 'This order is not set for delivery']);
        exit;
    }
    
    // Get status history to determine delivery status
    $historyQuery = "SELECT * FROM retailer_order_status_history 
                    WHERE order_id = ? 
                    ORDER BY created_at ASC";
    $historyStmt = $conn->prepare($historyQuery);
    $historyStmt->bind_param('i', $order_id);
    $historyStmt->execute();
    $historyResult = $historyStmt->get_result();
    
    $history = [];
    while ($historyItem = $historyResult->fetch_assoc()) {
        $history[] = $historyItem;
    }
    
    // Determine current delivery status based on history
    $currentStatus = 'confirmed'; // Default status
    $timestamps = [
        'confirmed' => null,
        'preparing' => null,
        'out_for_delivery' => null,
        'delivered' => null
    ];
    
    // Check for delivery status in notes or status field
    foreach ($history as $item) {
        $note = strtolower($item['notes']);
        $status = strtolower($item['status']);
        
        if ($status === 'confirmed' || strpos($note, 'confirmed') !== false) {
            $currentStatus = 'confirmed';
            $timestamps['confirmed'] = $item['created_at'];
        } else if ($status === 'preparing' || strpos($note, 'preparing') !== false) {
            $currentStatus = 'preparing';
            $timestamps['preparing'] = $item['created_at'];
        } else if ($status === 'out_for_delivery' || strpos($note, 'out for delivery') !== false) {
            $currentStatus = 'out_for_delivery';
            $timestamps['out_for_delivery'] = $item['created_at'];
        } else if ($status === 'delivered' || strpos($note, 'delivered') !== false) {
            $currentStatus = 'delivered';
            $timestamps['delivered'] = $item['created_at'];
        }
    }
    
    // Build tracking information
    $tracking = [
        'status' => $currentStatus,
        'address' => $order['shipping_address'] ?? 'Not specified',
        'contact_person' => $order['retailer_name'],
        'contact_number' => $order['retailer_contact'],
        'expected_delivery' => $order['expected_delivery'],
        'timestamps' => array_values($timestamps), // Convert to indexed array
        'history' => $history
    ];
    
    // Return success response with tracking data
    echo json_encode([
        'success' => true,
        'tracking' => $tracking
    ]);
    
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}

// Close connection
$conn->close();
?>