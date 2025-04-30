<?php
// Include database connection
require_once '../db_connection.php';

// Set headers for JSON response
header('Content-Type: application/json');

try {
    // Get the 'since' parameter from the request (last checked timestamp)
    $since = isset($_GET['since']) ? $_GET['since'] : date('Y-m-d H:i:s', strtotime('-1 day'));
    
    // Prepare the SQL query to fetch new orders
    $sql = "SELECT ro.order_id, ro.po_number, ro.retailer_name, ro.retailer_email, 
                   ro.retailer_contact, ro.order_date, ro.total_amount, ro.status, 
                   ro.created_at, ro.updated_at, rp.first_name, rp.last_name, 
                   rp.business_name, rp.phone
            FROM retailer_orders ro
            LEFT JOIN retailer_profiles rp ON ro.retailer_name = CONCAT(rp.first_name, ' ', rp.last_name)
            WHERE ro.created_at > ?
            ORDER BY ro.created_at DESC";
    
    $stmt = mysqli_prepare($conn, $sql);
    mysqli_stmt_bind_param($stmt, "s", $since);
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);
    
    // Fetch all new orders
    $orders = [];
    while ($row = mysqli_fetch_assoc($result)) {
        $orders[] = $row;
    }
    
    // For each order, fetch its items
    foreach ($orders as &$order) {
        $itemsSql = "SELECT roi.item_id, roi.product_id, roi.quantity, 
                            roi.unit_price, roi.total_price, roi.product_name
                     FROM retailer_order_items roi
                     WHERE roi.order_id = ?";
        
        $itemsStmt = mysqli_prepare($conn, $itemsSql);
        mysqli_stmt_bind_param($itemsStmt, "s", $order['order_id']);
        mysqli_stmt_execute($itemsStmt);
        $itemsResult = mysqli_stmt_get_result($itemsStmt);
        
        $order['items'] = [];
        while ($itemRow = mysqli_fetch_assoc($itemsResult)) {
            $order['items'][] = $itemRow;
        }
        
        mysqli_stmt_close($itemsStmt);
    }
    
    // Return the orders as JSON
    echo json_encode([
        'status' => 'success',
        'data' => $orders,
        'count' => count($orders)
    ]);
    
} catch (Exception $e) {
    // Return error message
    echo json_encode([
        'status' => 'error',
        'message' => 'Database error: ' . $e->getMessage()
    ]);
}

// Close the connection
mysqli_close($conn);
?>
