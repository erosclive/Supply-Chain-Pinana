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
$response = ['success' => false, 'message' => '', 'order' => null];

// Get request data
$data = json_decode(file_get_contents('php://input'), true);
$order_id = isset($data['order_id']) ? intval($data['order_id']) : 0;

try {
    // Validate input
    if (!$order_id) {
        throw new Exception("Order ID is required");
    }
    
    // Get order details without user restriction
    $query = "SELECT o.*, 
              DATEDIFF(DATE_ADD(o.created_at, INTERVAL o.consignment_term DAY), CURDATE()) as days_remaining
              FROM retailer_orders o 
              WHERE o.order_id = ?";
    
    $stmt = $conn->prepare($query);
    
    if (!$stmt) {
        throw new Exception("Prepare failed for order query: " . $conn->error);
    }
    
    $stmt->bind_param("i", $order_id);
    
    if (!$stmt->execute()) {
        throw new Exception("Execute failed for order query: " . $stmt->error);
    }
    
    $result = $stmt->get_result();
    
    if ($order = $result->fetch_assoc()) {
        // Get order items
        $itemsQuery = "SELECT oi.*, p.product_name 
                      FROM retailer_order_items oi 
                      LEFT JOIN products p ON oi.product_id = p.product_id
                      WHERE oi.order_id = ?";
        
        $itemsStmt = $conn->prepare($itemsQuery);
        
        if (!$itemsStmt) {
            throw new Exception("Prepare failed for items query: " . $conn->error);
        }
        
        $itemsStmt->bind_param("i", $order_id);
        
        if (!$itemsStmt->execute()) {
            throw new Exception("Execute failed for items query: " . $itemsStmt->error);
        }
        
        $itemsResult = $itemsStmt->get_result();
        
        $items = [];
        while ($itemRow = $itemsResult->fetch_assoc()) {
            $items[] = $itemRow;
        }
        
        $order['items'] = $items;
        
        // Calculate days since consignment started
        $consignmentStartDate = new DateTime($order['created_at']);
        $currentDate = new DateTime();
        $daysSinceStart = $currentDate->diff($consignmentStartDate)->days;
        
        $order['days_since_start'] = $daysSinceStart;
        
        $response['success'] = true;
        $response['order'] = $order;
    } else {
        throw new Exception("Order not found");
    }

} catch (Exception $e) {
    $response['message'] = "Error: " . $e->getMessage();
    error_log("Error fetching order details: " . $e->getMessage());
}

echo json_encode($response);
?>