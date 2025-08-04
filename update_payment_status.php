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
$response = ['success' => false, 'message' => ''];

// Get request data
$data = json_decode(file_get_contents('php://input'), true);
$order_id = isset($data['order_id']) ? intval($data['order_id']) : 0;
$payment_status = isset($data['payment_status']) ? $data['payment_status'] : '';

try {
    // Validate input
    if (!$order_id || !$payment_status) {
        throw new Exception("Order ID and payment status are required");
    }

    // Update payment status
    $query = "UPDATE retailer_orders 
              SET payment_status = ?, 
                  updated_at = NOW() 
              WHERE order_id = ?";

    $stmt = $conn->prepare($query);

    if (!$stmt) {
        throw new Exception("Prepare failed: " . $conn->error);
    }

    $stmt->bind_param("si", $payment_status, $order_id);

    if (!$stmt->execute()) {
        throw new Exception("Execute failed: " . $stmt->error);
    }

    if ($stmt->affected_rows > 0) {
        // Add entry to status history
        $noteText = "Payment status updated to: " . $payment_status;
        $historyQuery = "INSERT INTO retailer_order_status_history 
                        (order_id, status, notes, created_at) 
                        VALUES (?, 'payment_update', ?, NOW())";
        
        $historyStmt = $conn->prepare($historyQuery);
        
        if (!$historyStmt) {
            throw new Exception("Prepare failed for history query: " . $conn->error);
        }
        
        $historyStmt->bind_param("is", $order_id, $noteText);
        
        if (!$historyStmt->execute()) {
            throw new Exception("Execute failed for history query: " . $historyStmt->error);
        }
        
        $response['success'] = true;
        $response['message'] = "Payment status updated successfully";
    } else {
        throw new Exception("No order found with ID: " . $order_id);
    }

} catch (Exception $e) {
    $response['message'] = "Error: " . $e->getMessage();
    error_log("Error updating payment status: " . $e->getMessage());
}

echo json_encode($response);
?>