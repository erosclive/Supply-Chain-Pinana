<?php
// Include database connection
require_once 'db_connection.php';

// Set header to return JSON
header('Content-Type: application/json');

// Get action from request
$action = isset($_GET['action']) ? $_GET['action'] : (isset($_POST['action']) ? $_POST['action'] : '');

// Handle different actions
switch ($action) {
    case 'sync_order_status':
        syncOrderStatus();
        break;
    case 'notify_retailer':
        notifyRetailer();
        break;
    case 'get_retailer_orders':
        getRetailerOrders();
        break;
    default:
        echo json_encode(['success' => false, 'message' => 'Invalid action']);
        break;
}

// Function to sync order status between supplier and retailer systems
function syncOrderStatus() {
    global $conn;
    
    // Get parameters
    $order_id = isset($_POST['order_id']) ? intval($_POST['order_id']) : 0;
    $status = isset($_POST['status']) ? $_POST['status'] : '';
    $notes = isset($_POST['notes']) ? $_POST['notes'] : '';
    
    if ($order_id <= 0 || empty($status)) {
        echo json_encode(['success' => false, 'message' => 'Order ID and status are required']);
        return;
    }
    
    // Start transaction
    mysqli_begin_transaction($conn);
    
    try {
        // Update order status in retailer_orders table
        $updateQuery = "UPDATE retailer_orders SET status = ? WHERE order_id = ?";
        $stmt = mysqli_prepare($conn, $updateQuery);
        mysqli_stmt_bind_param($stmt, 'si', $status, $order_id);
        $updateResult = mysqli_stmt_execute($stmt);
        
        if (!$updateResult) {
            throw new Exception("Failed to update order status: " . mysqli_error($conn));
        }
        
        // Add status history entry
        $historyQuery = "INSERT INTO retailer_order_status_history (order_id, status, notes, created_at) VALUES (?, ?, ?, NOW())";
        $stmt = mysqli_prepare($conn, $historyQuery);
        mysqli_stmt_bind_param($stmt, 'iss', $order_id, $status, $notes);
        $historyResult = mysqli_stmt_execute($stmt);
        
        if (!$historyResult) {
            throw new Exception("Failed to add status history: " . mysqli_error($conn));
        }
        
        // Commit transaction
        mysqli_commit($conn);
        
        echo json_encode(['success' => true, 'message' => 'Order status synchronized successfully']);
    } catch (Exception $e) {
        // Rollback transaction on error
        mysqli_rollback($conn);
        
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
}

// Function to notify retailer about order status changes
function notifyRetailer() {
    global $conn;
    
    // Get parameters
    $order_id = isset($_POST['order_id']) ? intval($_POST['order_id']) : 0;
    $message = isset($_POST['message']) ? $_POST['message'] : '';
    
    if ($order_id <= 0 || empty($message)) {
        echo json_encode(['success' => false, 'message' => 'Order ID and message are required']);
        return;
    }
    
    try {
        // Get retailer email
        $query = "SELECT retailer_name, retailer_email FROM retailer_orders WHERE order_id = ?";
        $stmt = mysqli_prepare($conn, $query);
        mysqli_stmt_bind_param($stmt, 'i', $order_id);
        mysqli_stmt_execute($stmt);
        $result = mysqli_stmt_get_result($stmt);
        
        if (mysqli_num_rows($result) === 0) {
            echo json_encode(['success' => false, 'message' => 'Order not found']);
            return;
        }
        
        $row = mysqli_fetch_assoc($result);
        $retailer_name = $row['retailer_name'];
        $retailer_email = $row['retailer_email'];
        
        // In a real implementation, this would send an email to the retailer
        // For now, we'll just log it
        error_log("Would notify retailer $retailer_name at $retailer_email about order #$order_id: $message");
        
        echo json_encode(['success' => true, 'message' => 'Notification sent to retailer']);
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
}

// Function to get retailer orders for a specific retailer
function getRetailerOrders() {
    global $conn;
    
    // Get retailer ID from request
    $retailer_email = isset($_GET['retailer_email']) ? $_GET['retailer_email'] : '';
    
    if (empty($retailer_email)) {
        echo json_encode(['success' => false, 'message' => 'Retailer email is required']);
        return;
    }
    
    try {
        // Get orders for this retailer
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
            WHERE ro.retailer_email = ?
            ORDER BY ro.order_date DESC
        ";
        
        $stmt = mysqli_prepare($conn, $query);
        mysqli_stmt_bind_param($stmt, 's', $retailer_email);
        mysqli_stmt_execute($stmt);
        $result = mysqli_stmt_get_result($stmt);
        
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
}
?>