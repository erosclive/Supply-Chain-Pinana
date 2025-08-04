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

// Check if user is logged in
$user_id = isset($_SESSION['user_id']) ? $_SESSION['user_id'] : null;

if (!$user_id) {
    $response['message'] = 'User not logged in';
    echo json_encode($response);
    exit;
}

// Check if required parameters are provided
if (!isset($_POST['order_id']) || !isset($_POST['amount'])) {
    $response['message'] = 'Missing required parameters';
    echo json_encode($response);
    exit;
}

$order_id = intval($_POST['order_id']);
$amount = floatval($_POST['amount']);
$notes = isset($_POST['notes']) ? $_POST['notes'] : '';

try {
    // Start transaction
    $conn->begin_transaction();
    
    // 1. Check if order exists and belongs to the current user
    $orderQuery = "SELECT o.*, u.email 
                  FROM retailer_orders o 
                  JOIN users u ON u.id = ? 
                  WHERE o.order_id = ? 
                  AND o.retailer_email = u.email";
    
    $orderStmt = $conn->prepare($orderQuery);
    $orderStmt->bind_param("ii", $user_id, $order_id);
    $orderStmt->execute();
    $orderResult = $orderStmt->get_result();
    
    if ($orderResult->num_rows === 0) {
        throw new Exception("Order not found or does not belong to current user");
    }
    
    $order = $orderResult->fetch_assoc();
    
    // 2. Create payment record with cash payment details
    $paymentMethod = "cash";
    $paymentReference = "CASH-" . date('YmdHis');
    
    $paymentQuery = "INSERT INTO retailer_order_payments 
                    (order_id, payment_method, payment_amount, payment_reference, payment_notes, created_at) 
                    VALUES (?, ?, ?, ?, ?, NOW())";
    
    $paymentStmt = $conn->prepare($paymentQuery);
    $paymentStmt->bind_param("isdss", $order_id, $paymentMethod, $amount, $paymentReference, $notes);
    
    if (!$paymentStmt->execute()) {
        throw new Exception("Failed to create payment record: " . $paymentStmt->error);
    }
    
    $payment_id = $conn->insert_id;
    
    // 3. Update order payment status
    $updateOrderQuery = "UPDATE retailer_orders 
                        SET payment_status = 'paid', 
                            updated_at = NOW() 
                        WHERE order_id = ?";
    
    $updateOrderStmt = $conn->prepare($updateOrderQuery);
    $updateOrderStmt->bind_param("i", $order_id);
    
    if (!$updateOrderStmt->execute()) {
        throw new Exception("Failed to update order payment status: " . $updateOrderStmt->error);
    }
    
    // 4. Add order status history entry
    $historyQuery = "INSERT INTO retailer_order_status_history 
                    (order_id, status, notes, created_at) 
                    VALUES (?, 'paid', ?, NOW())";
    
    $historyNotes = "Cash payment received. Amount: ₱" . number_format($amount, 2);
    
    $historyStmt = $conn->prepare($historyQuery);
    $historyStmt->bind_param("is", $order_id, $historyNotes);
    
    if (!$historyStmt->execute()) {
        throw new Exception("Failed to add status history: " . $historyStmt->error);
    }
    
    // Commit transaction
    $conn->commit();
    
    $response['success'] = true;
    $response['message'] = "Cash payment processed successfully";
    $response['payment_id'] = $payment_id;
    
} catch (Exception $e) {
    // Rollback transaction on error
    $conn->rollback();
    
    $response['message'] = "Error: " . $e->getMessage();
    error_log("Cash payment processing error: " . $e->getMessage());
}

echo json_encode($response);
?>
