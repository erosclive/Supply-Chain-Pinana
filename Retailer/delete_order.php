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
    
    $orderId = $data['order_id'];
    $isPermanent = isset($data['permanent']) && $data['permanent'] === true;
    
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
        
        // Check if the order belongs to this user
        $checkQuery = "SELECT status FROM retailer_orders WHERE order_id = ? AND retailer_email = ?";
        $checkStmt = $conn->prepare($checkQuery);
        $checkStmt->bind_param("is", $orderId, $userEmail);
        $checkStmt->execute();
        $checkResult = $checkStmt->get_result();
        
        if ($checkResult->num_rows === 0) {
            throw new Exception("You don't have permission to delete this order");
        }
        
        $orderStatus = $checkResult->fetch_assoc()['status'];
        
        // For permanent deletion, check if the order is cancelled
        if ($isPermanent && $orderStatus !== 'cancelled') {
            throw new Exception("Only cancelled orders can be permanently deleted");
        }
        
        // For regular deletion (cancellation), check if the order is in a valid state
        if (!$isPermanent && !in_array($orderStatus, ['order', 'order placed'])) {
            throw new Exception("Only orders with status 'order' or 'order placed' can be cancelled");
        }
        
        // Start transaction
        $conn->begin_transaction();
        
        if ($isPermanent) {
            // Permanent deletion - delete all related records
            
            // Delete order items
            $deleteItemsQuery = "DELETE FROM retailer_order_items WHERE order_id = ?";
            $deleteItemsStmt = $conn->prepare($deleteItemsQuery);
            $deleteItemsStmt->bind_param("i", $orderId);
            
            if (!$deleteItemsStmt->execute()) {
                throw new Exception("Failed to delete order items");
            }
            
            // Delete status history
            $deleteHistoryQuery = "DELETE FROM retailer_order_status_history WHERE order_id = ?";
            $deleteHistoryStmt = $conn->prepare($deleteHistoryQuery);
            $deleteHistoryStmt->bind_param("i", $orderId);
            
            if (!$deleteHistoryStmt->execute()) {
                throw new Exception("Failed to delete status history");
            }
            
            // Delete the order
            $deleteOrderQuery = "DELETE FROM retailer_orders WHERE order_id = ?";
            $deleteOrderStmt = $conn->prepare($deleteOrderQuery);
            $deleteOrderStmt->bind_param("i", $orderId);
            
            if (!$deleteOrderStmt->execute()) {
                throw new Exception("Failed to delete order");
            }
            
            $message = "Order permanently deleted successfully";
        } else {
            // Regular deletion - update status to cancelled
            
            // Update order status to "cancelled"
            $updateQuery = "UPDATE retailer_orders SET status = 'cancelled', updated_at = NOW() WHERE order_id = ?";
            $updateStmt = $conn->prepare($updateQuery);
            $updateStmt->bind_param("i", $orderId);
            
            if (!$updateStmt->execute()) {
                throw new Exception("Failed to cancel order");
            }
            
            // Add status history entry
            $historyQuery = "INSERT INTO retailer_order_status_history (order_id, status, notes, created_at) VALUES (?, 'cancelled', ?, NOW())";
            $historyStmt = $conn->prepare($historyQuery);
            $notes = "Order cancelled by user";
            $historyStmt->bind_param("is", $orderId, $notes);
            
            if (!$historyStmt->execute()) {
                throw new Exception("Failed to create status history");
            }
            
            $message = "Order cancelled successfully";
        }
        
        // Commit transaction
        $conn->commit();
        
        $response['success'] = true;
        $response['message'] = $message;
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