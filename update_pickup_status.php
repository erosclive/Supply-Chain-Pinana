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

// Get order ID and new pickup status
$order_id = isset($_POST['order_id']) ? intval($_POST['order_id']) : 0;
$pickup_status = isset($_POST['pickup_status']) ? $_POST['pickup_status'] : '';
$notes = isset($_POST['notes']) ? $_POST['notes'] : '';

// Validate input
if (!$order_id || empty($pickup_status)) {
    echo json_encode(['success' => false, 'message' => 'Order ID and pickup status are required']);
    exit;
}

try {
    // Start transaction
    $conn->begin_transaction();
    
    // First, check if this order exists in the pickup orders table
    $checkQuery = "SELECT pickup_order_id, pickup_status FROM retailer_pickup_orders WHERE order_id = ?";
    $stmt = $conn->prepare($checkQuery);
    $stmt->bind_param('i', $order_id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        // Order not found in pickup table, check if it exists in main orders table
        $mainOrderQuery = "SELECT order_id, delivery_mode FROM retailer_orders WHERE order_id = ?";
        $stmt = $conn->prepare($mainOrderQuery);
        $stmt->bind_param('i', $order_id);
        $stmt->execute();
        $mainResult = $stmt->get_result();
        
        if ($mainResult->num_rows === 0) {
            throw new Exception('Order not found');
        }
        
        $mainOrder = $mainResult->fetch_assoc();
        
        // If it's a delivery order, cannot update pickup status
        if ($mainOrder['delivery_mode'] !== 'pickup') {
            throw new Exception('Cannot update pickup status for non-pickup orders');
        }
        
        // It's a pickup order but not yet in the pickup table, need to migrate it
        $migrateQuery = "
            INSERT INTO retailer_pickup_orders (
                order_id, po_number, retailer_name, retailer_email, retailer_contact,
                order_date, pickup_location, pickup_date, pickup_status,
                subtotal, tax, discount, total_amount, notes, created_at, updated_at
            )
            SELECT 
                order_id, po_number, retailer_name, retailer_email, retailer_contact,
                order_date, pickup_location, pickup_date, 'order',
                subtotal, tax, discount, total_amount, notes, created_at, updated_at
            FROM retailer_orders
            WHERE order_id = ?
        ";
        
        $stmt = $conn->prepare($migrateQuery);
        $stmt->bind_param('i', $order_id);
        
        if (!$stmt->execute()) {
            throw new Exception('Failed to migrate order to pickup table: ' . $conn->error);
        }
        
        // Get the new pickup_order_id
        $pickupOrderId = $conn->insert_id;
        $currentPickupStatus = 'order';
    } else {
        // Order found in pickup table
        $pickupOrder = $result->fetch_assoc();
        $pickupOrderId = $pickupOrder['pickup_order_id'];
        $currentPickupStatus = $pickupOrder['pickup_status'];
    }
    
    // Validate status transition
    $validTransition = true;
    $message = "";

    switch ($currentPickupStatus) {
        case 'order':
            // Order can only be confirmed or cancelled
            if ($pickup_status !== 'confirmed' && $pickup_status !== 'cancelled') {
                $validTransition = false;
                $message = "Order can only be confirmed or cancelled";
            }
            break;
        case 'confirmed':
            // Confirmed can only be ready or cancelled
            if ($pickup_status !== 'ready' && $pickup_status !== 'ready-to-pickup' && $pickup_status !== 'ready_for_pickup' && $pickup_status !== 'cancelled') {
                $validTransition = false;
                $message = "Confirmed order can only be marked as ready for pickup or cancelled";
            }
            break;
        case 'ready':
        case 'ready-to-pickup':
        case 'ready_for_pickup':
            // Ready can only be picked up or cancelled
            if ($pickup_status !== 'picked up' && $pickup_status !== 'picked_up' && $pickup_status !== 'cancelled') {
                $validTransition = false;
                $message = "Ready order can only be picked up or cancelled";
            }
            break;
        case 'picked up':
        case 'picked_up':
            // Picked up is a final state, can't be changed
            $validTransition = false;
            $message = "Order status cannot be changed after pickup";
            break;
        case 'cancelled':
            // Cancelled is final state, can't be changed
            $validTransition = false;
            $message = "Cancelled order status cannot be changed";
            break;
    }

    if (!$validTransition) {
        echo json_encode([
            'success' => false,
            'message' => $message
        ]);
        exit;
    }
    
    // Normalize pickup status to a consistent format
    $normalizedStatus = $pickup_status;
    if ($pickup_status === 'ready-to-pickup' || $pickup_status === 'ready_for_pickup') {
        $normalizedStatus = 'ready';
    }
    if ($pickup_status === 'picked_up') {
        $normalizedStatus = 'picked up';
    }
    
    // Only update if status is different
    if ($currentPickupStatus !== $normalizedStatus) {
        // Update pickup status
        $updateQuery = "UPDATE retailer_pickup_orders SET pickup_status = ?, updated_at = NOW() WHERE pickup_order_id = ?";
        $stmt = $conn->prepare($updateQuery);
        $stmt->bind_param('si', $normalizedStatus, $pickupOrderId);
        
        if (!$stmt->execute()) {
            throw new Exception('Failed to update pickup status: ' . $conn->error);
        }
        
        // Add status history entry
        $historyQuery = "INSERT INTO retailer_pickup_status_history (pickup_order_id, pickup_status, notes, created_at) VALUES (?, ?, ?, NOW())";
        $stmt = $conn->prepare($historyQuery);
        $stmt->bind_param('iss', $pickupOrderId, $normalizedStatus, $notes);
        
        if (!$stmt->execute()) {
            throw new Exception('Failed to add status history: ' . $conn->error);
        }
        
        // If status is "ready", set pickup date if not already set
        if ($normalizedStatus === 'ready') {
            $expectedDate = date('Y-m-d', strtotime('+3 days')); // Default to 3 days from now
            
            $updateDateQuery = "UPDATE retailer_pickup_orders SET pickup_date = ? WHERE pickup_order_id = ? AND (pickup_date IS NULL OR pickup_date = '0000-00-00')";
            $stmt = $conn->prepare($updateDateQuery);
            $stmt->bind_param('si', $expectedDate, $pickupOrderId);
            $stmt->execute();
        }
        
        // Also update the main retailer_orders table for consistency
        $mainTableStatus = '';
        switch ($normalizedStatus) {
            case 'order':
                $mainTableStatus = 'order';
                break;
            case 'confirmed':
                $mainTableStatus = 'confirmed';
                break;
            case 'ready':
                $mainTableStatus = 'ready_for_pickup';
                break;
            case 'picked up':
                $mainTableStatus = 'picked_up';
                break;
            case 'cancelled':
                $mainTableStatus = 'cancelled';
                break;
            default:
                $mainTableStatus = $normalizedStatus;
        }
        
        $updateMainQuery = "UPDATE retailer_orders SET status = ?, updated_at = NOW() WHERE order_id = ?";
        $stmt = $conn->prepare($updateMainQuery);
        $stmt->bind_param('si', $mainTableStatus, $order_id);
        $stmt->execute();
    }
    
    // Commit transaction
    $conn->commit();
    
    echo json_encode([
        'success' => true,
        'message' => 'Pickup status updated successfully',
        'new_pickup_status' => $normalizedStatus
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
