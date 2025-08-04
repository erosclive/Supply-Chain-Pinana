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
$response = ['success' => false, 'message' => '', 'orders' => []];

// Get user ID from session
$user_id = isset($_SESSION['user_id']) ? $_SESSION['user_id'] : null;

try {
    // Check if user is logged in
    if (!$user_id) {
        throw new Exception("User not logged in");
    }
    
    // Get user's email
    $userQuery = "SELECT email FROM users WHERE id = ?";
    $userStmt = $conn->prepare($userQuery);
    
    if (!$userStmt) {
        throw new Exception("Prepare failed for user query: " . $conn->error);
    }
    
    $userStmt->bind_param("i", $user_id);
    
    if (!$userStmt->execute()) {
        throw new Exception("Execute failed for user query: " . $userStmt->error);
    }
    
    $userResult = $userStmt->get_result();
    
    if ($userRow = $userResult->fetch_assoc()) {
        $userEmail = $userRow['email'];
        
        // Get orders with status = 'completed' AND payment_status = 'Partial'
        $query = "SELECT o.*, 
                  DATEDIFF(DATE_ADD(o.created_at, INTERVAL o.consignment_term DAY), CURDATE()) as days_remaining
                  FROM retailer_orders o 
                  WHERE o.retailer_email = ? 
                  AND o.status = 'completed'
                  AND o.payment_status = 'Partial'
                  ORDER BY o.created_at DESC";
        
        $stmt = $conn->prepare($query);
        
        if (!$stmt) {
            throw new Exception("Prepare failed: " . $conn->error);
        }
        
        $stmt->bind_param("s", $userEmail);
        
        if (!$stmt->execute()) {
            throw new Exception("Execute failed: " . $stmt->error);
        }
        
        $result = $stmt->get_result();
        
        // Fetch all in-process orders
        $orders = [];
        while ($row = $result->fetch_assoc()) {
            // Get order items
            $itemsQuery = "SELECT oi.*, p.product_name 
                          FROM retailer_order_items oi 
                          LEFT JOIN products p ON oi.product_id = p.product_id
                          WHERE oi.order_id = ?";
            
            $itemsStmt = $conn->prepare($itemsQuery);
            
            if (!$itemsStmt) {
                throw new Exception("Prepare failed for items query: " . $conn->error);
            }
            
            $itemsStmt->bind_param("i", $row['order_id']);
            
            if (!$itemsStmt->execute()) {
                throw new Exception("Execute failed for items query: " . $itemsStmt->error);
            }
            
            $itemsResult = $itemsStmt->get_result();
            
            $items = [];
            while ($itemRow = $itemsResult->fetch_assoc()) {
                $items[] = $itemRow;
            }
            
            $row['items'] = $items;
            
            // Calculate days since consignment started
            $consignmentStartDate = new DateTime($row['created_at']);
            $currentDate = new DateTime();
            $daysSinceStart = $currentDate->diff($consignmentStartDate)->days;
            
            $row['days_since_start'] = $daysSinceStart;
            
            $orders[] = $row;
        }
        
        $response['success'] = true;
        $response['orders'] = $orders;
        
    } else {
        throw new Exception("User email not found");
    }
    
} catch (Exception $e) {
    $response['message'] = "Error: " . $e->getMessage();
    error_log("Error fetching in-process orders: " . $e->getMessage());
}

echo json_encode($response);
?>
