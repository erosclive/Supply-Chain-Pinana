<?php
// Include database connection
require_once 'db_connection.php';

// Set header to return JSON
header('Content-Type: application/json');

// Get retailer email from request
$retailer_email = isset($_GET['retailer_email']) ? $_GET['retailer_email'] : '';

// Get filter parameters
$status = isset($_GET['status']) ? $_GET['status'] : 'all';
$date_range = isset($_GET['date_range']) ? $_GET['date_range'] : 'all';
$search = isset($_GET['search']) ? $_GET['search'] : '';

try {
    // Build the query
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
    ";
    
    $params = [];
    $types = "";
    
    // Filter by retailer email if provided
    if (!empty($retailer_email)) {
        $query .= " WHERE ro.retailer_email = ?";
        $params[] = $retailer_email;
        $types .= "s";
    } else {
        $query .= " WHERE 1=1"; // Always true condition to allow adding more filters
    }
    
    // Filter by status if provided
    if ($status !== 'all') {
        $query .= " AND ro.status = ?";
        $params[] = $status;
        $types .= "s";
    }
    
    // Filter by date range if provided
    if ($date_range !== 'all') {
        switch ($date_range) {
            case 'today':
                $query .= " AND DATE(ro.order_date) = CURDATE()";
                break;
            case 'week':
                $query .= " AND YEARWEEK(ro.order_date, 1) = YEARWEEK(CURDATE(), 1)";
                break;
            case 'month':
                $query .= " AND MONTH(ro.order_date) = MONTH(CURDATE()) AND YEAR(ro.order_date) = YEAR(CURDATE())";
                break;
        }
    }
    
    // Search functionality
    if (!empty($search)) {
        $query .= " AND (ro.po_number LIKE ? OR ro.retailer_name LIKE ? OR ro.notes LIKE ?)";
        $searchTerm = "%$search%";
        $params[] = $searchTerm;
        $params[] = $searchTerm;
        $params[] = $searchTerm;
        $types .= "sss";
    }
    
    // Order by most recent first
    $query .= " ORDER BY ro.order_date DESC";
    
    // Prepare and execute the query
    $stmt = $conn->prepare($query);
    
    if (!$stmt) {
        throw new Exception("Prepare failed: " . $conn->error);
    }
    
    if (!empty($params)) {
        $stmt->bind_param($types, ...$params);
    }
    
    if (!$stmt->execute()) {
        throw new Exception("Execute failed: " . $stmt->error);
    }
    
    $result = $stmt->get_result();
    
    // Fetch all orders
    $orders = [];
    while ($row = $result->fetch_assoc()) {
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
        
        $itemsStmt = $conn->prepare($itemsQuery);
        $itemsStmt->bind_param("i", $row['order_id']);
        $itemsStmt->execute();
        $itemsResult = $itemsStmt->get_result();
        
        $items = [];
        while ($item = $itemsResult->fetch_assoc()) {
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
        
        $historyStmt = $conn->prepare($historyQuery);
        $historyStmt->bind_param("i", $row['order_id']);
        $historyStmt->execute();
        $historyResult = $historyStmt->get_result();
        
        $history = [];
        while ($historyItem = $historyResult->fetch_assoc()) {
            $history[] = $historyItem;
        }
        
        $row['status_history'] = $history;
        
        $orders[] = $row;
    }
    
    echo json_encode([
        'success' => true,
        'orders' => $orders
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Error: ' . $e->getMessage()
    ]);
}
?>