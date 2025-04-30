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

// Get user ID from session
$user_id = isset($_SESSION['user_id']) ? $_SESSION['user_id'] : null;

// Check if user is logged in
if (!$user_id) {
    $response['message'] = 'User not logged in';
    echo json_encode($response);
    exit;
}

// Get JSON data from request
$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['order_id']) || !isset($data['return_reason']) || 
    !isset($data['return_items']) || empty($data['return_items'])) {
    $response['message'] = 'Missing required fields';
    echo json_encode($response);
    exit;
}

try {
    // Start transaction
    $conn->begin_transaction();
    
    // Verify the order belongs to this user
    $userQuery = "SELECT email FROM users WHERE id = ?";
    $userStmt = $conn->prepare($userQuery);
    $userStmt->bind_param("i", $user_id);
    $userStmt->execute();
    $userResult = $userStmt->get_result();
    
    if ($userRow = $userResult->fetch_assoc()) {
        $userEmail = $userRow['email'];
        
        // Check if the order belongs to this user
        $checkQuery = "SELECT order_id, status FROM retailer_orders WHERE order_id = ? AND retailer_email = ?";
        $checkStmt = $conn->prepare($checkQuery);
        $checkStmt->bind_param("is", $data['order_id'], $userEmail);
        $checkStmt->execute();
        $checkResult = $checkStmt->get_result();
        
        if ($checkResult->num_rows === 0) {
            throw new Exception("You don't have permission to return this order");
        }
        
        $orderRow = $checkResult->fetch_assoc();
        
        // Check if order status is delivered or picked up
        if ($orderRow['status'] !== 'delivered' && $orderRow['status'] !== 'picked up') {
            throw new Exception("Only delivered or picked up orders can be returned");
        }
        
        // Create return record
        $returnQuery = "INSERT INTO retailer_order_returns 
                       (order_id, return_reason, return_details, return_status, requested_at) 
                       VALUES (?, ?, ?, 'requested', NOW())";
        $returnStmt = $conn->prepare($returnQuery);
        $returnStmt->bind_param("iss", $data['order_id'], $data['return_reason'], $data['return_details']);
        $returnStmt->execute();
        
        // Get the return ID
        $returnId = $conn->insert_id;
        
        // Process each return item
        foreach ($data['return_items'] as $item) {
            if ($item['quantity'] > 0) {
                // Insert return item record
                $returnItemQuery = "INSERT INTO retailer_order_return_items 
                                  (return_id, item_id, return_quantity, return_reason) 
                                  VALUES (?, ?, ?, ?)";
                $returnItemStmt = $conn->prepare($returnItemQuery);
                $returnItemStmt->bind_param("iiis", $returnId, $item['item_id'], $item['quantity'], $item['reason']);
                $returnItemStmt->execute();
            }
        }
        
        // Update order status to return requested
$updateQuery = "UPDATE retailer_orders SET status = 'return_requested', updated_at = NOW() WHERE order_id = ?";
$updateStmt = $conn->prepare($updateQuery);
$updateStmt->bind_param("i", $data['order_id']);
$updateStmt->execute();

// Add status history entry
$historyQuery = "INSERT INTO retailer_order_status_history (order_id, status, notes, created_at) 
                VALUES (?, 'return_requested', ?, NOW())";
$notes = "Return requested: " . $data['return_reason'];
$historyStmt = $conn->prepare($historyQuery);
$historyStmt->bind_param("is", $data['order_id'], $notes);
$historyStmt->execute();
        
        // Commit transaction
        $conn->commit();
        
        $response['success'] = true;
        $response['message'] = "Return request submitted successfully";
    } else {
        throw new Exception("User email not found");
    }
    
} catch (Exception $e) {
    // Rollback transaction on error
    if (isset($conn) && $conn->ping()) {
        $conn->rollback();
    }
    $response['message'] = "Error: " . $e->getMessage();
    error_log("Error submitting return request: " . $e->getMessage());
}

echo json_encode($response);
?>