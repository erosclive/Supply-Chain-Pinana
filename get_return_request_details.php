<?php
// Include database connection
require_once 'db_connection.php';

// Set headers
header('Content-Type: application/json');

// Check if order ID is provided
if (!isset($_GET['order_id']) || empty($_GET['order_id'])) {
    echo json_encode(['success' => false, 'message' => 'Order ID is required']);
    exit;
}

$order_id = intval($_GET['order_id']);

try {
    // Get return request details
    $query = "SELECT o.*, 
              (SELECT notes FROM retailer_order_status_history 
               WHERE order_id = o.order_id AND status = 'return_requested' 
               ORDER BY created_at DESC LIMIT 1) as return_reason
              FROM retailer_orders o
              WHERE o.order_id = ? AND o.status = 'return_requested'";
              
    $stmt = $conn->prepare($query);
    $stmt->bind_param('i', $order_id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        echo json_encode(['success' => false, 'message' => 'Return request not found']);
        exit;
    }
    
    $returnRequest = $result->fetch_assoc();
    
    // Return success response
    echo json_encode([
        'success' => true,
        'order_id' => $returnRequest['order_id'],
        'retailer_name' => $returnRequest['retailer_name'],
        'delivery_mode' => $returnRequest['delivery_mode'],
        'return_reason' => $returnRequest['return_reason'],
        'order_date' => $returnRequest['order_date']
    ]);
    
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}

// Close connection
$conn->close();
?>