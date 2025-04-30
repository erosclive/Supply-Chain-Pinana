<?php
// Include database connection
require_once 'db_connection.php';

// Set header to return JSON
header('Content-Type: application/json');

try {
    // Get all retailer orders
    $query = "
        SELECT 
            ro.order_id,
            ro.po_number,
            ro.retailer_name,
            ro.retailer_email,
            ro.retailer_contact,
            ro.order_date,
            ro.expected_delivery,
            ro.delivery_mode,
            ro.pickup_location,
            ro.pickup_date,
            ro.status,
            ro.subtotal,
            ro.tax,
            ro.discount,
            ro.total_amount,
            ro.notes
        FROM retailer_orders ro
        ORDER BY ro.order_date DESC
    ";
    
    $result = mysqli_query($conn, $query);
    
    if (!$result) {
        throw new Exception("Database query failed: " . mysqli_error($conn));
    }
    
    $orders = [];
    while ($row = mysqli_fetch_assoc($result)) {
        // Get order items
        $itemsQuery = "
            SELECT 
                roi.item_id,
                roi.product_id,
                p.product_name,
                roi.quantity,
                roi.unit_price,
                roi.total_price
            FROM retailer_order_items roi
            LEFT JOIN products p ON roi.product_id = p.product_id
            WHERE roi.order_id = ?
        ";
        
        $stmt = mysqli_prepare($conn, $itemsQuery);
        mysqli_stmt_bind_param($stmt, 'i', $row['order_id']);
        mysqli_stmt_execute($stmt);
        $itemsResult = mysqli_stmt_get_result($stmt);
        
        $items = [];
        while ($item = mysqli_fetch_assoc($itemsResult)) {
            $items[] = $item;
        }
        
        $row['items'] = $items;
        
        // Get status history
        $historyQuery = "
            SELECT 
                history_id,
                order_id,
                status,
                notes,
                created_at
            FROM retailer_order_status_history
            WHERE order_id = ?
            ORDER BY created_at DESC
        ";
        
        $stmt = mysqli_prepare($conn, $historyQuery);
        mysqli_stmt_bind_param($stmt, 'i', $row['order_id']);
        mysqli_stmt_execute($stmt);
        $historyResult = mysqli_stmt_get_result($stmt);
        
        $history = [];
        while ($historyItem = mysqli_fetch_assoc($historyResult)) {
            $history[] = $historyItem;
        }
        
        $row['status_history'] = $history;
        
        $orders[] = $row;
    }
    
    echo json_encode(['success' => true, 'orders' => $orders]);
    
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}

// Close connection
mysqli_close($conn);
?>