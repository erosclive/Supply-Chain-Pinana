<?php
// Include database connection
require_once 'db_connection.php';

// Set headers
header('Content-Type: application/json');

// Get order ID
$order_id = isset($_GET['order_id']) ? intval($_GET['order_id']) : 0;

if (!$order_id) {
    echo json_encode(['success' => false, 'message' => 'Order ID is required']);
    exit;
}

try {
    // Get order details
    $query = "SELECT 
                ro.*, 
                COALESCE(ro.pickup_status, ro.status) as effective_status
              FROM 
                retailer_orders ro
              WHERE 
                ro.order_id = ?";
    
    $stmt = $conn->prepare($query);
    $stmt->bind_param('i', $order_id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        throw new Exception('Order not found');
    }
    
    $order = $result->fetch_assoc();
    
    // Get order items
    $itemsQuery = "SELECT 
                    roi.*,
                    p.product_name
                  FROM 
                    retailer_order_items roi
                  LEFT JOIN 
                    products p ON roi.product_id = p.product_id
                  WHERE 
                    roi.order_id = ?";
    
    $stmt = $conn->prepare($itemsQuery);
    $stmt->bind_param('i', $order_id);
    $stmt->execute();
    $itemsResult = $stmt->get_result();
    
    $items = [];
    while ($item = $itemsResult->fetch_assoc()) {
        $items[] = $item;
    }
    
    // Get status history
    $historyQuery = "SELECT 
                      rosh.*,
                      CASE 
                        WHEN rosh.status = 'ready_for_pickup' THEN 'ready for pickup'
                        WHEN rosh.status = 'picked_up' THEN 'picked up'
                        ELSE rosh.status
                      END as display_status
                    FROM 
                      retailer_order_status_history rosh
                    WHERE 
                      rosh.order_id = ?
                    ORDER BY 
                      rosh.created_at DESC";
    
    $stmt = $conn->prepare($historyQuery);
    $stmt->bind_param('i', $order_id);
    $stmt->execute();
    $historyResult = $stmt->get_result();
    
    $statusHistory = [];
    while ($history = $historyResult->fetch_assoc()) {
        $statusHistory[] = $history;
    }
    
    echo json_encode([
        'success' => true,
        'order' => $order,
        'items' => $items,
        'statusHistory' => $statusHistory
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}

// Close connection
$conn->close();
?>