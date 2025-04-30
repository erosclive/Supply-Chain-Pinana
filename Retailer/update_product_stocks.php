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
$response = ['success' => false, 'message' => '', 'updated_products' => []];

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
        
        // Begin transaction
        $conn->begin_transaction();
        
        // Get all products from completed orders that need stock update
        $query = "SELECT 
                    p.product_id,
                    p.product_name,
                    p.stocks as current_stock,
                    SUM(roi.quantity) as ordered_quantity
                FROM 
                    retailer_order_items roi
                JOIN 
                    retailer_orders ro ON roi.order_id = ro.order_id
                JOIN 
                    products p ON roi.product_id = p.product_id
                WHERE 
                    ro.status = 'completed'
                    AND ro.retailer_email = ?
                GROUP BY 
                    p.product_id, p.product_name, p.stocks";
        
        $stmt = $conn->prepare($query);
        
        if (!$stmt) {
            throw new Exception("Prepare failed: " . $conn->error);
        }
        
        $stmt->bind_param("s", $userEmail);
        
        if (!$stmt->execute()) {
            throw new Exception("Execute failed: " . $stmt->error);
        }
        
        $result = $stmt->get_result();
        
        $updatedProducts = [];
        
        // Update stock for each product
        while ($row = $result->fetch_assoc()) {
            $productId = $row['product_id'];
            $orderedQuantity = $row['ordered_quantity'];
            $currentStock = $row['current_stock'];
            
            // Calculate new stock level (ensure it doesn't go below 0)
            $newStock = max(0, $currentStock - $orderedQuantity);
            
            // Update the product stock in the database
            $updateQuery = "UPDATE products SET stocks = ? WHERE product_id = ?";
            $updateStmt = $conn->prepare($updateQuery);
            
            if (!$updateStmt) {
                throw new Exception("Prepare failed for update query: " . $conn->error);
            }
            
            $updateStmt->bind_param("is", $newStock, $productId);
            
            if (!$updateStmt->execute()) {
                throw new Exception("Execute failed for update query: " . $updateStmt->error);
            }
            
            // Add to updated products list
            $updatedProducts[] = [
                'product_id' => $productId,
                'product_name' => $row['product_name'],
                'previous_stock' => $currentStock,
                'ordered_quantity' => $orderedQuantity,
                'new_stock' => $newStock
            ];
            
            $updateStmt->close();
        }
        
        // Commit transaction
        $conn->commit();
        
        $response['success'] = true;
        $response['message'] = count($updatedProducts) . " products stock levels updated successfully";
        $response['updated_products'] = $updatedProducts;
        
    } else {
        throw new Exception("User email not found");
    }
    
} catch (Exception $e) {
    // Rollback transaction on error
    if ($conn && $conn->ping()) {
        $conn->rollback();
    }
    
    $response['message'] = "Error: " . $e->getMessage();
    error_log("Error updating product stocks: " . $e->getMessage());
}

echo json_encode($response);
?>
