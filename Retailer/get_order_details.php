<?php
// Include database connection
require_once 'db_connection.php';

// Set header to return JSON
header('Content-Type: application/json');

// Check if order_id is provided
if (!isset($_GET['order_id'])) {
    echo json_encode([
        'success' => false,
        'message' => 'Order ID is required'
    ]);
    exit;
}

$order_id = intval($_GET['order_id']);

try {
    // Get order items with product details
    $itemsQuery = "SELECT 
                    roi.item_id,
                    roi.order_id,
                    roi.product_id,
                    roi.quantity,
                    roi.unit_price,
                    roi.total_price,
                    roi.product_name,
                    p.product_photo,
                    p.category
                FROM 
                    retailer_order_items roi
                LEFT JOIN 
                    products p ON roi.product_id = p.product_id
                WHERE 
                    roi.order_id = ?";
    
    $itemsStmt = $conn->prepare($itemsQuery);
    $itemsStmt->bind_param("i", $order_id);
    $itemsStmt->execute();
    $itemsResult = $itemsStmt->get_result();
    
    $items = [];
    while ($row = $itemsResult->fetch_assoc()) {
        $items[] = $row;
    }
    
    // Get order status history
    $historyQuery = "SELECT 
                        history_id,
                        order_id,
                        status,
                        notes,
                        created_at
                    FROM 
                        retailer_order_status_history
                    WHERE 
                        order_id = ?
                    ORDER BY 
                        created_at DESC";
    
    $historyStmt = $conn->prepare($historyQuery);
    $historyStmt->bind_param("i", $order_id);
    $historyStmt->execute();
    $historyResult = $historyStmt->get_result();
    
    $status_history = [];
    while ($row = $historyResult->fetch_assoc()) {
        $status_history[] = $row;
    }
    
    // Get delivery issues if any
    $issuesQuery = "SELECT 
                        issue_id,
                        order_id,
                        issue_type,
                        issue_severity,
                        issue_description,
                        requested_action,
                        issue_status,
                        resolution_notes,
                        reported_at,
                        resolved_at
                    FROM 
                        retailer_order_delivery_issues
                    WHERE 
                        order_id = ?";
    
    $issuesStmt = $conn->prepare($issuesQuery);
    $issuesStmt->bind_param("i", $order_id);
    $issuesStmt->execute();
    $issuesResult = $issuesStmt->get_result();
    
    $delivery_issues = [];
    while ($row = $issuesResult->fetch_assoc()) {
        $delivery_issues[] = $row;
    }
    
    echo json_encode([
        'success' => true,
        'items' => $items,
        'status_history' => $status_history,
        'delivery_issues' => $delivery_issues
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Error: ' . $e->getMessage()
    ]);
}
?>
