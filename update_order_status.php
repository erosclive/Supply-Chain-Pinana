<?php
// Include database connection
require_once 'db_connection.php';

// Set headers
header('Content-Type: application/json');

// Check if request is POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Invalid request method']);
    exit;
}

// Get POST data
$order_id = isset($_POST['order_id']) ? intval($_POST['order_id']) : 0;
$status = isset($_POST['status']) ? $_POST['status'] : '';
$delivery_mode = isset($_POST['delivery_mode']) ? $_POST['delivery_mode'] : '';
$notes = isset($_POST['notes']) ? $_POST['notes'] : '';

// Validate input
if (empty($order_id) || empty($status)) {
    echo json_encode(['success' => false, 'message' => 'Order ID and status are required']);
    exit;
}

// Start transaction
$conn->begin_transaction();

try {
    // Update order status
    $updateQuery = "UPDATE retailer_orders SET status = ? WHERE order_id = ?";
    $updateStmt = $conn->prepare($updateQuery);
    $updateStmt->bind_param('si', $status, $order_id);
    $updateResult = $updateStmt->execute();
    
    if (!$updateResult) {
        throw new Exception("Failed to update order status: " . $conn->error);
    }
    
    // Get current timestamp
    $timestamp = date('Y-m-d H:i:s');
    
    // Add entry to status history
    $historyQuery = "INSERT INTO retailer_order_status_history (order_id, status, notes, created_at) 
                     VALUES (?, ?, ?, ?)";
    
    // If notes are empty, add a default note
    if (empty($notes)) {
        $notes = "Status updated to " . ucfirst($status);
    }
    
    $historyStmt = $conn->prepare($historyQuery);
    $historyStmt->bind_param('isss', $order_id, $status, $notes, $timestamp);
    $historyResult = $historyStmt->execute();
    
    if (!$historyResult) {
        throw new Exception("Failed to add status history: " . $conn->error);
    }
    
    // Commit transaction
    $conn->commit();
    
    // Return success response
    echo json_encode([
        'success' => true, 
        'message' => 'Order status updated successfully',
        'timestamp' => $timestamp
    ]);
    
} catch (Exception $e) {
    // Rollback transaction on error
    $conn->rollback();
    
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}

// Close connection
$conn->close();
?>
