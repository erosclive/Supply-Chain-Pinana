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
    
    // Get order items
    $itemsQuery = "SELECT i.*, p.product_name 
                  FROM retailer_order_items i 
                  LEFT JOIN products p ON i.product_id = p.product_id 
                  WHERE i.order_id = ?";
    $itemsStmt = $conn->prepare($itemsQuery);
    $itemsStmt->bind_param('i', $order_id);
    $itemsStmt->execute();
    $itemsResult = $itemsStmt->get_result();
    
    $items = [];
    while ($item = $itemsResult->fetch_assoc()) {
        $items[] = $item;
    }
    
    // Get order status history
    $historyQuery = "SELECT * FROM retailer_order_status_history 
                    WHERE order_id = ? 
                    ORDER BY created_at DESC";
    $historyStmt = $conn->prepare($historyQuery);
    $historyStmt->bind_param('i', $order_id);
    $historyStmt->execute();
    $historyResult = $historyStmt->get_result();
    
    $history = [];
    while ($historyItem = $historyResult->fetch_assoc()) {
        $history[] = $historyItem;
    }
    
    // Return success response with data
    echo json_encode([
        'success' => true,
        'order' => $order,
        'items' => $items,
        'history' => $history
    ]);
    
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}

// Close connection
$conn->close();
?>