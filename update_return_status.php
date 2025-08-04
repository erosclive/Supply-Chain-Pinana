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
$resolution = isset($_POST['resolution']) ? $_POST['resolution'] : '';

if (!$order_id || empty($resolution)) {
    echo json_encode(['success' => false, 'message' => 'Order ID and resolution are required']);
    exit;
}

try {
    // Start transaction
    $conn->begin_transaction();

    // Fetch current order to get delivery mode
    $query = "SELECT delivery_mode FROM retailer_orders WHERE order_id = ?";
    $stmt = $conn->prepare($query);
    $stmt->bind_param('i', $order_id);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
        throw new Exception('Order not found');
    }

    $order = $result->fetch_assoc();
    $deliveryMode = $order['delivery_mode'];

    // Determine new status based on delivery mode
    $newStatus = ($deliveryMode === 'pickup') ? 'picked up' : 'delivered';
    
    // Update order status
    $updateQuery = "UPDATE retailer_orders SET status = ?, updated_at = NOW() WHERE order_id = ?";
    $stmt = $conn->prepare($updateQuery);
    $stmt->bind_param('si', $newStatus, $order_id);

    if (!$stmt->execute()) {
        throw new Exception('Failed to update order status: ' . $conn->error);
    }

    // Add resolution to status history
    $notes = "Return request resolved: " . $resolution;
    $historyQuery = "INSERT INTO retailer_order_status_history (order_id, status, notes, created_at)
                     VALUES (?, ?, ?, NOW())";
    $stmt = $conn->prepare($historyQuery);
    $stmt->bind_param('iss', $order_id, $newStatus, $notes);

    if (!$stmt->execute()) {
        throw new Exception('Failed to add resolution to history: ' . $conn->error);
    }

    // Commit transaction
    $conn->commit();

    echo json_encode([
        'success' => true,
        'message' => 'Return request resolved successfully'
    ]);
} catch (Exception $e) {
    $conn->rollback();

    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>
