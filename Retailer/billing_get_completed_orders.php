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
$response = ['success' => false, 'message' => '', 'orders' => [], 'stats' => []];

// Get user ID from session
$retailer_id = isset($_SESSION['user_id']) ? $_SESSION['user_id'] : null;

try {
    // Check if user is logged in
    if (!$retailer_id) {
        throw new Exception("User not logged in");
    }
    
    // Get all completed orders for this retailer
    $query = "SELECT ro.order_id, ro.po_number, ro.order_date, ro.delivery_date, ro.status, 
                     ro.pickup_date, ro.pickup_status, ro.total_amount, ro.payment_status,
                     ro.subtotal, ro.tax, ro.discount, ro.notes, ro.created_at,
                     (SELECT COUNT(*) FROM retailer_order_items WHERE order_id = ro.order_id) as item_count,
                     (SELECT SUM(quantity) FROM retailer_order_items WHERE order_id = ro.order_id) as total_quantity,
                     (SELECT created_at FROM retailer_order_status_history 
                      WHERE order_id = ro.order_id AND status = 'completed' 
                      ORDER BY created_at DESC LIMIT 1) as completed_date
              FROM retailer_orders ro
              WHERE ro.retailer_id = ? AND ro.status = 'completed'
              ORDER BY ro.order_date DESC";
    
    $stmt = $conn->prepare($query);
    
    if (!$stmt) {
        throw new Exception("Prepare failed: " . $conn->error);
    }
    
    $stmt->bind_param('i', $retailer_id);
    
    if (!$stmt->execute()) {
        throw new Exception("Execute failed: " . $stmt->error);
    }
    
    $result = $stmt->get_result();
    
    $orders = [];
    while ($row = $result->fetch_assoc()) {
        // Format dates
        $row['order_date_formatted'] = date('M d, Y', strtotime($row['order_date']));
        $row['delivery_date_formatted'] = $row['delivery_date'] ? date('M d, Y', strtotime($row['delivery_date'])) : 'N/A';
        $row['pickup_date_formatted'] = $row['pickup_date'] ? date('M d, Y', strtotime($row['pickup_date'])) : 'N/A';
        $row['completed_date_formatted'] = $row['completed_date'] ? date('M d, Y', strtotime($row['completed_date'])) : 'N/A';
        
        // Format order number
        $row['order_number'] = $row['po_number'] ?: ('RO-' . str_pad($row['order_id'], 6, '0', STR_PAD_LEFT));
        
        // Format total amount
        $row['total_amount_formatted'] = '₱' . number_format($row['total_amount'], 2);
        $row['subtotal_formatted'] = '₱' . number_format($row['subtotal'], 2);
        $row['tax_formatted'] = '₱' . number_format($row['tax'], 2);
        $row['discount_formatted'] = '₱' . number_format($row['discount'], 2);
        
        // Get order items
        $itemsQuery = "SELECT oi.*, p.product_name 
                      FROM retailer_order_items oi 
                      LEFT JOIN products p ON oi.product_id = p.product_id
                      WHERE oi.order_id = ?";
        
        $itemsStmt = $conn->prepare($itemsQuery);
        
        if (!$itemsStmt) {
            throw new Exception("Prepare failed for items query: " . $conn->error);
        }
        
        $itemsStmt->bind_param("i", $row['order_id']);
        
        if (!$itemsStmt->execute()) {
            throw new Exception("Execute failed for items query: " . $itemsStmt->error);
        }
        
        $itemsResult = $itemsStmt->get_result();
        
        $items = [];
        while ($itemRow = $itemsResult->fetch_assoc()) {
            // Format item prices
            $itemRow['unit_price_formatted'] = '₱' . number_format($itemRow['unit_price'], 2);
            $itemRow['total_price_formatted'] = '₱' . number_format($itemRow['total_price'], 2);
            $items[] = $itemRow;
        }
        
        $row['items'] = $items;
        
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
    
    $response['success'] = true;
    $response['orders'] = $orders;
    $response['stats'] = $stats;
    
} catch (Exception $e) {
    $response['message'] = "Error: " . $e->getMessage();
    error_log("Error fetching completed orders: " . $e->getMessage());
}

echo json_encode($response);
?>