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
$response = ['success' => false, 'message' => '', 'payment' => null];

// Get request data
$data = json_decode(file_get_contents('php://input'), true);
$order_id = isset($data['order_id']) ? intval($data['order_id']) : 0;

try {
    // Validate input
    if (!$order_id) {
        throw new Exception("Order ID is required");
    }
    
    // Get the latest payment for this order
    $query = "SELECT * FROM retailer_order_payments 
              WHERE order_id = ? 
              ORDER BY created_at DESC 
              LIMIT 1";
    
    $stmt = $conn->prepare($query);
    
    if (!$stmt) {
        throw new Exception("Prepare failed: " . $conn->error);
    }
    
    $stmt->bind_param("i", $order_id);
    
    if (!$stmt->execute()) {
        throw new Exception("Execute failed: " . $stmt->error);
    }
    
    $result = $stmt->get_result();
    
    if ($payment = $result->fetch_assoc()) {
        $response['success'] = true;
        $response['payment'] = $payment;
    } else {
        $response['message'] = "No payment records found for this order";
    }
    
} catch (Exception $e) {
    $response['message'] = "Error: " . $e->getMessage();
    error_log("Error fetching latest payment: " . $e->getMessage());
}

echo json_encode($response);
?>