<?php
// Include database connection
require_once 'db_connection.php';

// Set headers
header('Content-Type: application/json');

try {
    // Start transaction
    $conn->begin_transaction();
    
    // Find all pickup orders with NULL pickup_status
    $query = "SELECT order_id, status FROM retailer_orders 
              WHERE delivery_mode = 'pickup' AND (pickup_status IS NULL OR pickup_status = '')";
    $result = $conn->query($query);
    
    $updatedCount = 0;
    $errors = [];
    
    while ($order = $result->fetch_assoc()) {
        $orderId = $order['order_id'];
        $status = $order['status'];
        
        // Map main status to pickup status
        $pickupStatus = null;
        
        switch ($status) {
            case 'order':
                $pickupStatus = 'order';
                break;
            case 'confirmed':
                $pickupStatus = 'confirmed';
                break;
            case 'ready_for_pickup':
            case 'ready-to-pickup':
            case 'ready for pickup':
                $pickupStatus = 'ready for pickup';
                break;
            case 'picked_up':
            case 'picked up':
                $pickupStatus = 'picked up';
                break;
            case 'cancelled':
                $pickupStatus = 'cancelled';
                break;
            default:
                // If status is NULL or unknown, check the status history
                $historyQuery = "SELECT status FROM retailer_order_status_history 
                                WHERE order_id = ? ORDER BY created_at DESC LIMIT 1";
                $stmt = $conn->prepare($historyQuery);
                $stmt->bind_param('i', $orderId);
                $stmt->execute();
                $historyResult = $stmt->get_result();
                
                if ($historyResult->num_rows > 0) {
                    $historyStatus = $historyResult->fetch_assoc()['status'];
                    
                    switch ($historyStatus) {
                        case 'order':
                            $pickupStatus = 'order';
                            break;
                        case 'confirmed':
                            $pickupStatus = 'confirmed';
                            break;
                        case 'ready_for_pickup':
                        case 'ready-to-pickup':
                        case 'ready for pickup':
                            $pickupStatus = 'ready for pickup';
                            break;
                        case 'picked_up':
                        case 'picked up':
                            $pickupStatus = 'picked up';
                            break;
                        case 'cancelled':
                            $pickupStatus = 'cancelled';
                            break;
                        default:
                            $pickupStatus = $historyStatus;
                    }
                    
                    // Also update the main status if it's NULL
                    if (empty($status)) {
                        $updateStatusQuery = "UPDATE retailer_orders SET status = ? WHERE order_id = ?";
                        $stmt = $conn->prepare($updateStatusQuery);
                        $stmt->bind_param('si', $historyStatus, $orderId);
                        $stmt->execute();
                    }
                } else {
                    // If no history, default to 'order'
                    $pickupStatus = 'order';
                }
        }
        
        // Update pickup_status
        $updateQuery = "UPDATE retailer_orders SET pickup_status = ? WHERE order_id = ?";
        $stmt = $conn->prepare($updateQuery);
        $stmt->bind_param('si', $pickupStatus, $orderId);
        
        if ($stmt->execute()) {
            $updatedCount++;
        } else {
            $errors[] = "Failed to update order #$orderId: " . $conn->error;
        }
    }
    
    // Commit transaction
    $conn->commit();
    
    echo json_encode([
        'success' => true,
        'message' => "Fixed pickup status for $updatedCount orders",
        'errors' => $errors
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