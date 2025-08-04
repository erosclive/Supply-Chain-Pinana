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
$response = ['success' => false, 'message' => '', 'products' => []];

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
        
        // Get all products from completed orders
        $query = "SELECT 
                    roi.item_id,
                    roi.order_id,
                    roi.product_id,
                    roi.quantity,
                    roi.unit_price,
                    roi.total_price,
                    roi.created_at,
                    roi.product_name,
                    p.id,
                    p.category,
                    p.price,
                    p.status,
                    p.batch_tracking,
                    p.stocks as available_stock,
                    p.product_photo, /* Added product_photo field */
                    ro.order_id as ro_order_id,
                    ro.po_number,
                    ro.retailer_name,
                    ro.retailer_email,
                    ro.status as order_status
                FROM 
                    retailer_order_items roi
                JOIN 
                    retailer_orders ro ON roi.order_id = ro.order_id
                LEFT JOIN 
                    products p ON roi.product_id = p.product_id
                WHERE 
                    ro.status = 'completed'
                    AND ro.retailer_email = ?
                ORDER BY 
                    roi.product_name ASC";
        
        $stmt = $conn->prepare($query);
        
        if (!$stmt) {
            throw new Exception("Prepare failed: " . $conn->error);
        }
        
        $stmt->bind_param("s", $userEmail);
        
        if (!$stmt->execute()) {
            throw new Exception("Execute failed: " . $stmt->error);
        }
        
        $result = $stmt->get_result();
        
        // Fetch all products from completed orders
        $products = [];
        while ($row = $result->fetch_assoc()) {
            // Format the price
            $row['price_formatted'] = '₱' . number_format($row['price'], 2);
            $row['unit_price_formatted'] = '₱' . number_format($row['unit_price'], 2);
            $row['total_price_formatted'] = '₱' . number_format($row['total_price'], 2);
            
            $products[] = $row;
        }
        
        $response['success'] = true;
        $response['products'] = $products;
        
    } else {
        throw new Exception("User email not found");
    }
    
} catch (Exception $e) {
    $response['message'] = "Error: " . $e->getMessage();
    error_log("Error fetching products: " . $e->getMessage());
}

echo json_encode($response);
?>
