<?php
// Include database connection
require_once 'db_connection.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Invalid request method']);
    exit;
}

// Get POST data
$order_id = isset($_POST['order_id']) ? intval($_POST['order_id']) : 0;
$status = isset($_POST['status']) ? $_POST['status'] : '';
$notes = isset($_POST['notes']) ? $_POST['notes'] : '';
// Get delivery hours from POST data
$delivery_hours = isset($_POST['delivery_hours']) ? $_POST['delivery_hours'] : null;

if (!$order_id || empty($status)) {
    echo json_encode(['success' => false, 'message' => 'Order ID and status are required']);
    exit;
}

try {
    // Start transaction
    $conn->begin_transaction();

    // Fetch current order
    $query = "SELECT status, pickup_status, delivery_mode FROM retailer_orders WHERE order_id = ?";
    $stmt = $conn->prepare($query);
    $stmt->bind_param('i', $order_id);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
        throw new Exception('Order not found');
    }

    $order = $result->fetch_assoc();
    $currentStatus = $order['status'];
    $currentPickupStatus = $order['pickup_status'];
    $deliveryMode = $order['delivery_mode'];

    // Process status based on delivery mode
    if ($deliveryMode === 'pickup') {
        updatePickupOrderStatus($conn, $order_id, $status, $currentStatus, $currentPickupStatus, $notes);
    } else {
        updateDeliveryOrderStatus($conn, $order_id, $status, $currentStatus, $notes, $delivery_hours);
    }

    // Commit transaction
    $conn->commit();

    echo json_encode([
        'success' => true,
        'message' => 'Order status updated successfully'
    ]);
} catch (Exception $e) {
    $conn->rollback();

    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}

// === Functions ===

function updatePickupOrderStatus($conn, $order_id, $status, $currentStatus, $currentPickupStatus, $notes) {
    $normalizedStatus = normalizePickupStatus($status);

    validatePickupStatusTransition($currentStatus, $normalizedStatus);

    // Set final status
    $finalStatus = ($normalizedStatus === 'picked-up') ? 'delivered' : $normalizedStatus;

    // Update status and pickup_status
    $updateQuery = "UPDATE retailer_orders SET status = ?, pickup_status = ?, updated_at = NOW() WHERE order_id = ?";
    $stmt = $conn->prepare($updateQuery);
    $stmt->bind_param('ssi', $finalStatus, $normalizedStatus, $order_id);

    if (!$stmt->execute()) {
        throw new Exception('Failed to update order status: ' . $conn->error);
    }

    // Insert into history
    insertOrderStatusHistory($conn, $order_id, $normalizedStatus, $notes, null);

    // Special handling: set pickup date if ready-to-pickup
    if ($normalizedStatus === 'ready-to-pickup') {
        $expectedPickupDate = date('Y-m-d', strtotime('+3 days'));
        $pickupDateQuery = "UPDATE retailer_orders SET pickup_date = ? WHERE order_id = ? AND (pickup_date IS NULL OR pickup_date = '0000-00-00')";
        $stmt = $conn->prepare($pickupDateQuery);
        $stmt->bind_param('si', $expectedPickupDate, $order_id);
        $stmt->execute();
    }
}

function updateDeliveryOrderStatus($conn, $order_id, $status, $currentStatus, $notes, $delivery_hours = null) {
    validateDeliveryStatusTransition($currentStatus, $status);

    $updateQuery = "UPDATE retailer_orders SET status = ?, updated_at = NOW() WHERE order_id = ?";
    $stmt = $conn->prepare($updateQuery);
    $stmt->bind_param('si', $status, $order_id);

    if (!$stmt->execute()) {
        throw new Exception('Failed to update order status: ' . $conn->error);
    }

    // Insert into history
    insertOrderStatusHistory($conn, $order_id, $status, $notes, $delivery_hours);

    // Set expected delivery if shipped
    if ($status === 'shipped') {
        $expectedDeliveryDate = date('Y-m-d', strtotime('+3 days'));
        $deliveryDateQuery = "UPDATE retailer_orders SET expected_delivery = ? WHERE order_id = ? AND (expected_delivery IS NULL OR expected_delivery = '0000-00-00')";
        $stmt = $conn->prepare($deliveryDateQuery);
        $stmt->bind_param('si', $expectedDeliveryDate, $order_id);
        $stmt->execute();
    }
}

function insertOrderStatusHistory($conn, $order_id, $logicalStatus, $notes, $delivery_hours = null) {
    // Adjust logicalStatus for saving into history
    if ($logicalStatus === 'picked-up') {
        $historyStatus = 'picked up'; // Space instead of dash
    } else {
        $historyStatus = $logicalStatus;
    }

    if (empty($notes)) {
        // Auto-generate friendly notes
        switch ($logicalStatus) {
            case 'ready-to-pickup':
                $notes = 'Order is ready for pickup';
                break;
            case 'picked-up':
                $notes = 'Order has been picked up';
                break;
            case 'shipped':
                $notes = 'Order has been shipped';
                break;
            case 'delivered':
                $notes = 'Order has been delivered';
                break;
            case 'cancelled':
                $notes = 'Order has been cancelled';
                break;
            default:
                $notes = 'Order status updated';
        }
    }

    // Modified query to include delivery_hours
    if ($delivery_hours !== null) {
        $historyQuery = "INSERT INTO retailer_order_status_history (order_id, status, notes, created_at, delivery_hours)
                         VALUES (?, ?, ?, NOW(), ?)";
        $stmt = $conn->prepare($historyQuery);
        $stmt->bind_param('isss', $order_id, $historyStatus, $notes, $delivery_hours);
    } else {
        $historyQuery = "INSERT INTO retailer_order_status_history (order_id, status, notes, created_at)
                         VALUES (?, ?, ?, NOW())";
        $stmt = $conn->prepare($historyQuery);
        $stmt->bind_param('iss', $order_id, $historyStatus, $notes);
    }

    if (!$stmt->execute()) {
        throw new Exception('Failed to insert order status history: ' . $conn->error);
    }
}

function normalizePickupStatus($status) {
    $status = strtolower(str_replace(['_', ' '], '-', $status));

    if (in_array($status, ['ready-for-pickup', 'ready-to-pickup'])) {
        return 'ready-to-pickup';
    }
    if (in_array($status, ['picked-up', 'picked-up'])) {
        return 'picked-up';
    }

    return $status;
}

function validatePickupStatusTransition($currentStatus, $newStatus) {
    $valid = true;
    $message = '';

    switch ($currentStatus) {
        case 'order':
            if (!in_array($newStatus, ['confirmed', 'cancelled'])) {
                $valid = false;
                $message = 'Order can only be confirmed or cancelled';
            }
            break;
        case 'confirmed':
            if (!in_array($newStatus, ['ready-to-pickup', 'cancelled'])) {
                $valid = false;
                $message = 'Confirmed pickup can only be marked ready for pickup or cancelled';
            }
            break;
        case 'ready-to-pickup':
            if (!in_array($newStatus, ['picked-up', 'cancelled'])) {
                $valid = false;
                $message = 'Ready for pickup can only be picked up or cancelled';
            }
            break;
        case 'picked-up':
        case 'cancelled':
            $valid = false;
            $message = 'Cannot change status after pickup or cancellation';
            break;
    }

    if (!$valid) {
        throw new Exception($message);
    }
}

function validateDeliveryStatusTransition($currentStatus, $newStatus) {
    $valid = true;
    $message = '';

    switch ($currentStatus) {
        case 'order':
            if (!in_array($newStatus, ['confirmed', 'cancelled'])) {
                $valid = false;
                $message = 'Order can only be confirmed or cancelled';
            }
            break;
        case 'confirmed':
            if (!in_array($newStatus, ['shipped', 'cancelled'])) {
                $valid = false;
                $message = 'Confirmed delivery can only be shipped or cancelled';
            }
            break;
        case 'shipped':
            if (!in_array($newStatus, ['delivered', 'cancelled'])) {
                $valid = false;
                $message = 'Shipped can only be delivered or cancelled';
            }
            break;
        case 'delivered':
        case 'cancelled':
            $valid = false;
            $message = 'Cannot change status after delivery or cancellation';
            break;
    }

    if (!$valid) {
        throw new Exception($message);
    }
}

// Special handling for pickup orders being marked as picked up
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  $order_id = isset($_POST['order_id']) ? intval($_POST['order_id']) : 0;
  $status = isset($_POST['status']) ? $_POST['status'] : '';
  $pickup_status = isset($_POST['pickup_status']) ? $_POST['pickup_status'] : '';
  
  // If this is a pickup order being marked as picked up
  if (($status === 'picked-up' || $status === 'picked_up') && $order_id > 0) {
    // Get delivery mode to confirm this is a pickup order
    $checkQuery = "SELECT delivery_mode FROM retailer_orders WHERE order_id = ?";
    $stmt = $conn->prepare($checkQuery);
    $stmt->bind_param('i', $order_id);
    $stmt->execute();
    $result = $stmt->get_result();
    $orderData = $result->fetch_assoc();
    
    if ($orderData && $orderData['delivery_mode'] === 'pickup') {
      // Set status to "delivered" and pickup_status to "picked up"
      $finalStatus = 'delivered';
      $pickupStatus = 'picked up';
      
      // Update both status and pickup_status columns
      $updateQuery = "UPDATE retailer_orders SET status = ?, pickup_status = ?, updated_at = NOW() WHERE order_id = ?";
      $stmt = $conn->prepare($updateQuery);
      $stmt->bind_param('ssi', $finalStatus, $pickupStatus, $order_id);
      
      if (!$stmt->execute()) {
        error_log("Failed to update order status: " . $conn->error);
      }
      
      // Check if a history entry already exists for this status
      $checkHistoryQuery = "SELECT COUNT(*) as count FROM retailer_order_status_history 
                           WHERE order_id = ? AND status = 'picked up'";
      $stmt = $conn->prepare($checkHistoryQuery);
      $stmt->bind_param('i', $order_id);
      $stmt->execute();
      $historyResult = $stmt->get_result();
      $historyData = $historyResult->fetch_assoc();
      
      // Only add history entry if one doesn't already exist
      if ($historyData['count'] == 0) {
        $historyStatus = 'picked up'; // Use space instead of dash for history
        $historyNotes = isset($_POST['notes']) ? $_POST['notes'] : 'Order has been picked up';
        
        $historyQuery = "INSERT INTO retailer_order_status_history (order_id, status, notes, created_at) 
                        VALUES (?, ?, ?, NOW())";
        $stmt = $conn->prepare($historyQuery);
        $stmt->bind_param('iss', $order_id, $historyStatus, $historyNotes);
        
        if (!$stmt->execute()) {
          error_log("Failed to add status history: " . $conn->error);
        }
      }
    }
  }
}
?>
