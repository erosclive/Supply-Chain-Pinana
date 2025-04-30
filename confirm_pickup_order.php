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

// Get order ID
$order_id = isset($_POST['order_id']) ? intval($_POST['order_id']) : 0;

// Validate input
if (!$order_id) {
    echo json_encode(['success' => false, 'message' => 'Order ID is required']);
    exit;
}

try {
    // Start transaction
    $conn->begin_transaction();
    
    // Get current order info
    $query = "SELECT delivery_mode FROM retailer_orders WHERE order_id = ?";
    $stmt = $conn->prepare($query);
    $stmt->bind_param('i', $order_id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        throw new Exception('Order not found');
    }
    
    $order = $result->fetch_assoc();
    $deliveryMode = $order['delivery_mode'];
    
    // Validate delivery mode
    if ($deliveryMode === 'pickup') {
        // For pickup orders, update pickup_status
        $updateQuery = "UPDATE retailer_orders SET pickup_status = 'confirmed', updated_at = NOW() WHERE order_id = ?";
        $stmt = $conn->prepare($updateQuery);
        $stmt->bind_param('i', $order_id);
        
        if (!$stmt->execute()) {
            throw new Exception('Failed to update pickup status: ' . $conn->error);
        }
        
        // Add status history entry
        $historyQuery = "INSERT INTO retailer_order_status_history (order_id, status, pickup_status, notes, created_at) VALUES (?, NULL, 'confirmed', 'Order confirmed for pickup', NOW())";
        $stmt = $conn->prepare($historyQuery);
        $stmt->bind_param('i', $order_id);
    } else {
        // For delivery orders, update status
        $updateQuery = "UPDATE retailer_orders SET status = 'confirmed', updated_at = NOW() WHERE order_id = ?";
        $stmt = $conn->prepare($updateQuery);
        $stmt->bind_param('i', $order_id);
        
        if (!$stmt->execute()) {
            throw new Exception('Failed to update order status: ' . $conn->error);
        }
        
        // Add status history entry
        $historyQuery = "INSERT INTO retailer_order_status_history (order_id, status, notes, created_at) VALUES (?, 'confirmed', 'Order confirmed for delivery', NOW())";
        $stmt = $conn->prepare($historyQuery);
        $stmt->bind_param('i', $order_id);
    }
    
    if (!$stmt->execute()) {
        throw new Exception('Failed to add status history: ' . $conn->error);
    }
    
    // Commit transaction
    $conn->commit();
    
    echo json_encode([
        'success' => true,
        'message' => 'Order confirmed successfully',
        'delivery_mode' => $deliveryMode
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
