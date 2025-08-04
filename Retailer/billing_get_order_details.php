<?php
// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Include database connection
require_once 'db_connection.php';

// Start session if not already started
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Set header to return JSON
header('Content-Type: application/json');

// Initialize response array
$response = [
    'success' => false, 
    'message' => '', 
    'order' => null, 
    'items' => [], 
    'status_history' => [], 
    'inventory_logs' => []
];

// Check if order_id is provided
if (!isset($_GET['order_id'])) {
    $response['message'] = 'Order ID is required';
    echo json_encode($response);
    exit;
}

$order_id = intval($_GET['order_id']);
$retailer_id = isset($_SESSION['user_id']) ? $_SESSION['user_id'] : null;

try {
    // Check if user is logged in
    if (!$retailer_id) {
        throw new Exception("User not logged in");
    }
    
    // Verify the order belongs to the current retailer
    $orderQuery = "SELECT * FROM retailer_orders WHERE order_id = ? AND retailer_id = ?";
    $orderStmt = $conn->prepare($orderQuery);
    
    if (!$orderStmt) {
        throw new Exception("Prepare failed for order query: " . $conn->error);
    }
    
    $orderStmt->bind_param("ii", $order_id, $retailer_id);
    
    if (!$orderStmt->execute()) {
        throw new Exception("Execute failed for order query: " . $orderStmt->error);
    }
    
    $orderResult = $orderStmt->get_result();
    
    if ($orderResult->num_rows === 0) {
        throw new Exception("Order not found or access denied");
    }
    
    $order = $orderResult->fetch_assoc();
    
    // Format dates and amounts
    $order['order_date_formatted'] = date('M d, Y', strtotime($order['order_date']));
    $order['delivery_date_formatted'] = $order['delivery_date'] ? date('M d, Y', strtotime($order['delivery_date'])) : 'N/A';
    $order['pickup_date_formatted'] = $order['pickup_date'] ? date('M d, Y', strtotime($order['pickup_date'])) : 'N/A';
    $order['created_at_formatted'] = date('M d, Y h:i A', strtotime($order['created_at']));
    
    $order['total_amount_formatted'] = '₱' . number_format($order['total_amount'], 2);
    $order['subtotal_formatted'] = '₱' . number_format($order['subtotal'], 2);
    $order['tax_formatted'] = '₱' . number_format($order['tax'], 2);
    $order['discount_formatted'] = '₱' . number_format($order['discount'], 2);
    
    // Get order items with product details
    $itemsQuery = "SELECT 
                    roi.item_id,
                    roi.order_id,
                    roi.product_id,
                    roi.quantity,
                    roi.unit_price,
                    roi.total_price,
                    roi.product_name,
                    roi.created_at
                FROM 
                    retailer_order_items roi
                WHERE 
                    roi.order_id = ?";
    
    $itemsStmt = $conn->prepare($itemsQuery);
    
    if (!$itemsStmt) {
        throw new Exception("Prepare failed for items query: " . $conn->error);
    }
    
    $itemsStmt->bind_param("i", $order_id);
    
    if (!$itemsStmt->execute()) {
        throw new Exception("Execute failed for items query: " . $itemsStmt->error);
    }
    
    $itemsResult = $itemsStmt->get_result();
    
    $items = [];
    while ($row = $itemsResult->fetch_assoc()) {
        // Format prices
        $row['unit_price_formatted'] = '₱' . number_format($row['unit_price'], 2);
        $row['total_price_formatted'] = '₱' . number_format($row['total_price'], 2);
        $row['created_at_formatted'] = date('M d, Y h:i A', strtotime($row['created_at']));
        $items[] = $row;
    }
    
    // Get order status history
    $historyQuery = "SELECT 
                        history_id,
                        order_id,
                        status,
                        notes,
                        created_at,
                        delivery_hours
                    FROM 
                        retailer_order_status_history
                    WHERE 
                        order_id = ?
                    ORDER BY 
                        created_at DESC";
    
    $historyStmt = $conn->prepare($historyQuery);
    
    if (!$historyStmt) {
        throw new Exception("Prepare failed for history query: " . $conn->error);
    }
    
    $historyStmt->bind_param("i", $order_id);
    
    if (!$historyStmt->execute()) {
        throw new Exception("Execute failed for history query: " . $historyStmt->error);
    }
    
    $historyResult = $historyStmt->get_result();
    
    $status_history = [];
    while ($row = $historyResult->fetch_assoc()) {
        $row['created_at_formatted'] = date('M d, Y h:i A', strtotime($row['created_at']));
        $status_history[] = $row;
    }
    
    // Get inventory logs for this order
    $inventoryQuery = "SELECT 
                        log_id,
                        product_id,
                        change_type,
                        quantity,
                        order_id,
                        previous_stock,
                        new_stock,
                        notes,
                        batch_details,
                        created_at
                    FROM 
                        inventory_log
                    WHERE 
                        order_id = ? AND change_type = 'order_completion'
                    ORDER BY 
                        created_at DESC";
    
    $inventoryStmt = $conn->prepare($inventoryQuery);
    
    if (!$inventoryStmt) {
        throw new Exception("Prepare failed for inventory query: " . $conn->error);
    }
    
    $inventoryStmt->bind_param("i", $order_id);
    
    if (!$inventoryStmt->execute()) {
        throw new Exception("Execute failed for inventory query: " . $inventoryStmt->error);
    }
    
    $inventoryResult = $inventoryStmt->get_result();
    
    $inventory_logs = [];
    while ($row = $inventoryResult->fetch_assoc()) {
        $row['created_at_formatted'] = date('M d, Y h:i A', strtotime($row['created_at']));
        $inventory_logs[] = $row;
    }
    
    $response['success'] = true;
    $response['order'] = $order;
    $response['items'] = $items;
    $response['status_history'] = $status_history;
    $response['inventory_logs'] = $inventory_logs;
    
} catch (Exception $e) {
    $response['message'] = "Error: " . $e->getMessage();
    error_log("Error fetching order details: " . $e->getMessage());
}

echo json_encode($response);
?>