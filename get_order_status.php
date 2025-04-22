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
    // Get current order status
    $query = "SELECT status FROM retailer_orders WHERE order_id = ?";
    $stmt = $conn->prepare($query);
    $stmt->bind_param('i', $order_id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        echo json_encode(['success' => false, 'message' => 'Order not found']);
        exit;
    }
    
    $order = $result->fetch_assoc();
    
    // Return success response
    echo json_encode([
        'success' => true,
        'status' => $order['status']
    ]);
    
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}

// Close connection
$conn->close();
?>
