<?php
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

try {
    // Get JSON data from request
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($data['order_id'])) {
        throw new Exception("Missing order ID");
    }
    
    // Get user ID from session
    $user_id = isset($_SESSION['user_id']) ? $_SESSION['user_id'] : null;
    
    if (!$user_id) {
        throw new Exception("User not logged in");
    }
    
    // Verify the order belongs to this user
    $userQuery = "SELECT email FROM users WHERE id = ?";
    $userStmt = $conn->prepare($userQuery);
    $userStmt->bind_param("i", $user_id);
    $userStmt->execute();
    $userResult = $userStmt->get_result();
    
    if ($userRow = $userResult->fetch_assoc()) {
        $userEmail = $userRow['email'];
        
        // Check if the order belongs to this user and is cancelled
        $checkQuery = "SELECT order_id, status FROM retailer_orders WHERE order_id = ? AND retailer_email = ? AND status = 'cancelled'";
        $checkStmt = $conn->prepare($checkQuery);
        $checkStmt->bind_param("is", $data['order_id'], $userEmail);
        $checkStmt->execute();
        $checkResult = $checkStmt->get_result();
        
        if ($checkResult->num_rows === 0) {
            throw new Exception("You don't have permission to reorder this order or it's not cancelled");
        }
        
        // Start transaction
        $conn->begin_transaction();
        
        // Update order status to "order"
        $updateQuery = "UPDATE retailer_orders SET status = 'order', updated_at = NOW() WHERE order_id = ?";
        $updateStmt = $conn->prepare($updateQuery);
        $updateStmt->bind_param("i", $data['order_id']);
        
        if (!$updateStmt->execute()) {
            throw new Exception("Failed to update order status");
        }
        
        // Add status history entry
        $historyQuery = "INSERT INTO retailer_order_status_history (order_id, status, notes, created_at) VALUES (?, 'order', 'Order placed again from cancelled order', NOW())";
        $historyStmt = $conn->prepare($historyQuery);
        $historyStmt->bind_param("i", $data['order_id']);
        
        if (!$historyStmt->execute()) {
            throw new Exception("Failed to create status history");
        }
        
        // Commit transaction
        $conn->commit();
        
        $response['success'] = true;
        $response['message'] = "Order has been placed again successfully";
    } else {
        throw new Exception("User email not found");
    }
    
} catch (Exception $e) {
    // Rollback transaction on error
    if (isset($conn) && $conn->ping()) {
        $conn->rollback();
    }
    $response['message'] = "Error: " . $e->getMessage();
}

echo json_encode($response);
?>