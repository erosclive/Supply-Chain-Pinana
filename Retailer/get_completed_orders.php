<?php
// Start session and include database connection
session_start();
require_once 'db_connection.php';

// Set header to return JSON
header('Content-Type: application/json');

// Check if user is logged in
if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'User not logged in']);
    exit;
}

$retailer_id = $_SESSION['user_id'];

try {
    // Get all completed orders for this retailer
    $query = "SELECT ro.order_id, ro.po_number, ro.order_date, ro.delivery_date, ro.status, 
                     ro.pickup_date, ro.pickup_status, ro.total_amount, ro.payment_status,
                     rp.first_name, rp.last_name, rp.company_name,
                     (SELECT COUNT(*) FROM retailer_order_items WHERE order_id = ro.order_id) as item_count,
                     (SELECT SUM(quantity) FROM retailer_order_items WHERE order_id = ro.order_id) as total_quantity
              FROM retailer_orders ro
              LEFT JOIN retailer_profiles rp ON ro.retailer_id = rp.user_id
              WHERE ro.retailer_id = ? AND ro.status = 'completed'
              ORDER BY ro.order_date DESC";
    
    $stmt = $conn->prepare($query);
    $stmt->bind_param('i', $retailer_id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $orders = [];
    while ($row = $result->fetch_assoc()) {
        // Format dates
        $row['order_date_formatted'] = date('M d, Y', strtotime($row['order_date']));
        $row['delivery_date_formatted'] = $row['delivery_date'] ? date('M d, Y', strtotime($row['delivery_date'])) : 'N/A';
        $row['pickup_date_formatted'] = $row['pickup_date'] ? date('M d, Y', strtotime($row['pickup_date'])) : 'N/A';
        
        // Format customer name
        $row['customer_name'] = $row['company_name'] ?: ($row['first_name'] . ' ' . $row['last_name']);
        
        // Format order number
        $row['order_number'] = $row['po_number'] ?: ('RO-' . str_pad($row['order_id'], 6, '0', STR_PAD_LEFT));
        
        // Format total amount
        $row['total_amount_formatted'] = '₱' . number_format($row['total_amount'], 2);
        
        $orders[] = $row;
    }
    
    // Get payment statistics
    $statsQuery = "SELECT 
                    COUNT(*) as total_orders,
                    SUM(total_amount) as total_sales,
                    SUM(CASE WHEN payment_status = 'pending' THEN 1 ELSE 0 END) as pending_payments,
                    SUM(CASE WHEN payment_status = 'completed' THEN 1 ELSE 0 END) as completed_payments
                  FROM retailer_orders
                  WHERE retailer_id = ? AND status = 'completed'";
    
    $statsStmt = $conn->prepare($statsQuery);
    $statsStmt->bind_param('i', $retailer_id);
    $statsStmt->execute();
    $statsResult = $statsStmt->get_result();
    $stats = $statsResult->fetch_assoc();
    
    // Format stats
    $stats['total_sales_formatted'] = '₱' . number_format($stats['total_sales'] ?? 0, 2);
    
    echo json_encode([
        'success' => true,
        'orders' => $orders,
        'stats' => $stats
    ]);
    
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
}
?>