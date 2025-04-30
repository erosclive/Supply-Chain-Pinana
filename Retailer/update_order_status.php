<?php
// Include database connection
require_once 'db_connection.php';

// Set headers
header('Content-Type: application/json');

// Check if request method is POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Invalid request method']);
    exit;
}

// Get order ID and new status
$order_id = isset($_POST['order_id']) ? intval($_POST['order_id']) : 0;
$status = isset($_POST['status']) ? $_POST['status'] : '';
$notes = isset($_POST['notes']) ? $_POST['notes'] : '';

// Validate input
if (!$order_id || empty($status)) {
    echo json_encode(['success' => false, 'message' => 'Order ID and status are required']);
    exit;
}

try {
    // Start transaction
    $conn->begin_transaction();
    
    // Get current order status
    $query = "SELECT status, delivery_mode FROM retailer_orders WHERE order_id = ?";
    $stmt = $conn->prepare($query);
    $stmt->bind_param('i', $order_id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        throw new Exception('Order not found');
    }
    
    $order = $result->fetch_assoc();
    $currentStatus = $order['status'];
    $deliveryMode = $order['delivery_mode'];
    
    // Update the update_order_status.php file to handle the specific status transitions
    // Validate status transition
    $validTransition = true;
    $message = "";

    // Update the status transition validation to handle both delivery and pickup modes properly

switch ($currentStatus) {
    case 'order':
        // Order can only be confirmed or cancelled
        if ($status !== 'confirmed' && $status !== 'cancelled') {
            $validTransition = false;
            $message = "Order can only be confirmed or cancelled";
        }
        break;
    case 'confirmed':
        // Handle different transitions based on delivery mode
        if ($deliveryMode === 'delivery') {
            if ($status !== 'shipped' && $status !== 'cancelled') {
                $validTransition = false;
                $message = "Confirmed delivery order can only be shipped or cancelled";
            }
        } else if ($deliveryMode === 'pickup') {
            if ($status !== 'ready' && $status !== 'ready_for_pickup' && 
                $status !== 'ready-to-pickup' && $status !== 'ready for pickup' && 
                $status !== 'cancelled') {
                $validTransition = false;
                $message = "Confirmed pickup order can only be marked as ready for pickup or cancelled";
            }
        } else {
            if ($status !== 'shipped' && 
                $status !== 'ready_for_pickup' && 
                $status !== 'ready-to-pickup' && 
                $status !== 'ready for pickup' && 
                $status !== 'ready' && 
                $status !== 'cancelled') {
                $validTransition = false;
                $message = "Confirmed order can only be shipped, marked ready for pickup, or cancelled";
            }
        }
        break;
    case 'shipped':
        // Shipped can only be delivered or cancelled
        if ($status !== 'delivered' && $status !== 'cancelled') {
            $validTransition = false;
            $message = "Shipped order can only be delivered or cancelled";
        }
        break;
    case 'ready_for_pickup':
    case 'ready-to-pickup':
    case 'ready for pickup':
    case 'ready':
        // Ready for pickup can only be picked up or cancelled
        if ($status !== 'picked_up' && $status !== 'picked up' && $status !== 'cancelled') {
            $validTransition = false;
            $message = "Ready for pickup order can only be picked up or cancelled";
        }
        break;
    case 'delivered':
    case 'picked_up':
    case 'picked up':
        // Delivered and picked up are final states, can't be changed
        $validTransition = false;
        $message = "Order status cannot be changed after delivery or pickup";
        break;
    case 'cancelled':
        // Cancelled is final state, can't be changed
        $validTransition = false;
        $message = "Cancelled order status cannot be changed";
        break;
}

// Also update the delivery mode check to handle both formats
if ($validTransition && $deliveryMode) {
    if ($deliveryMode === 'delivery' && ($status === 'ready_for_pickup' || $status === 'ready-to-pickup' || $status === 'ready for pickup' || $status === 'ready' || $status === 'picked_up' || $status === 'picked up')) {
        $validTransition = false;
        $message = "Delivery orders cannot have pickup statuses";
    } else if ($deliveryMode === 'pickup' && ($status === 'shipped' || $status === 'delivered')) {
        // Convert delivery statuses to pickup equivalents
        if ($status === 'shipped') {
            $status = 'ready';
        } else if ($status === 'delivered') {
            $status = 'picked up';
        }
    }
}

    if (!$validTransition) {
        echo json_encode([
            'success' => false,
            'message' => $message
        ]);
        exit;
    }
    
    // Only update if status is different
    if ($currentStatus !== $status) {
        // Update order status
        $updateQuery = "UPDATE retailer_orders SET status = ?, updated_at = NOW() WHERE order_id = ?";
        $stmt = $conn->prepare($updateQuery);
        $stmt->bind_param('si', $status, $order_id);
        
        if (!$stmt->execute()) {
            throw new Exception('Failed to update order status: ' . $conn->error);
        }
        
        // Add status history entry
        $historyQuery = "INSERT INTO retailer_order_status_history (order_id, status, notes, created_at) VALUES (?, ?, ?, NOW())";
        $stmt = $conn->prepare($historyQuery);
        $stmt->bind_param('iss', $order_id, $status, $notes);
        
        if (!$stmt->execute()) {
            throw new Exception('Failed to add status history: ' . $conn->error);
        }
        
        // If status is "shipped" or "ready", set expected delivery/pickup date if not already set
        if (($status === 'shipped' || $status === 'ready_for_pickup' || $status === 'ready')) {
            $dateField = ($deliveryMode === 'delivery') ? 'expected_delivery' : 'pickup_date';
            $expectedDate = date('Y-m-d', strtotime('+3 days')); // Default to 3 days from now
            
            $updateDateQuery = "UPDATE retailer_orders SET $dateField = ? WHERE order_id = ? AND ($dateField IS NULL OR $dateField = '0000-00-00')";
            $stmt = $conn->prepare($updateDateQuery);
            $stmt->bind_param('si', $expectedDate, $order_id);
            $stmt->execute();
        }
    }
    
    // Commit transaction
    $conn->commit();
    
    echo json_encode([
        'success' => true,
        'message' => 'Order status updated successfully',
        'new_status' => $status
    ]);
    
} catch (Exception $e) {
    // Rollback transaction on error
    $conn->rollback();
    
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}

// Close connection
$conn->close();
?>
