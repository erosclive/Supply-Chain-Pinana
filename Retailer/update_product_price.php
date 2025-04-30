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

// Get user ID from session
$user_id = isset($_SESSION['user_id']) ? $_SESSION['user_id'] : null;

try {
    // Check if user is logged in
    if (!$user_id) {
        throw new Exception("User not logged in");
    }
    
    // Get JSON data from request
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($data['product_id']) || !isset($data['price'])) {
        throw new Exception("Missing required fields");
    }
    
    $product_id = $data['product_id'];
    $price = floatval($data['price']);
    
    // Validate price
    if ($price <= 0) {
        throw new Exception("Price must be greater than zero");
    }
    
    // Get user's email for logging
    $userQuery = "SELECT email, full_name FROM users WHERE id = ?";
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
        $userName = $userRow['full_name'] ?: $userEmail;
        
        // Start transaction
        $conn->begin_transaction();
        
        // Check if product pricing record exists
        $checkQuery = "SELECT retail_price FROM product_pricing WHERE product_id = ? AND retailer_id = ?";
        $checkStmt = $conn->prepare($checkQuery);
        
        if (!$checkStmt) {
            throw new Exception("Prepare failed for check query: " . $conn->error);
        }
        
        $checkStmt->bind_param("si", $product_id, $user_id);
        
        if (!$checkStmt->execute()) {
            throw new Exception("Execute failed for check query: " . $checkStmt->error);
        }
        
        $checkResult = $checkStmt->get_result();
        
        if ($checkResult->num_rows > 0) {
            // Record exists, get current price for history
            $currentPriceRow = $checkResult->fetch_assoc();
            $currentPrice = $currentPriceRow['retail_price'];
            
            // Update existing record
            $updateQuery = "UPDATE product_pricing SET retail_price = ?, updated_at = NOW() WHERE product_id = ? AND retailer_id = ?";
            $updateStmt = $conn->prepare($updateQuery);
            
            if (!$updateStmt) {
                throw new Exception("Prepare failed for update query: " . $conn->error);
            }
            
            $updateStmt->bind_param("dsi", $price, $product_id, $user_id);
            
            if (!$updateStmt->execute()) {
                throw new Exception("Execute failed for update query: " . $updateStmt->error);
            }
            
            // Add price history record
            $historyQuery = "INSERT INTO product_price_history (product_id, retailer_id, previous_price, new_price, updated_by, created_at) VALUES (?, ?, ?, ?, ?, NOW())";
            $historyStmt = $conn->prepare($historyQuery);
            
            if (!$historyStmt) {
                throw new Exception("Prepare failed for history query: " . $conn->error);
            }
            
            $historyStmt->bind_param("sidds", $product_id, $user_id, $currentPrice, $price, $userName);
            
            if (!$historyStmt->execute()) {
                throw new Exception("Execute failed for history query: " . $historyStmt->error);
            }
            
        } else {
            // Record doesn't exist, create new one
            $insertQuery = "INSERT INTO product_pricing (product_id, retailer_id, retail_price, created_at, updated_at) VALUES (?, ?, ?, NOW(), NOW())";
            $insertStmt = $conn->prepare($insertQuery);
            
            if (!$insertStmt) {
                throw new Exception("Prepare failed for insert query: " . $conn->error);
            }
            
            $insertStmt->bind_param("sid", $product_id, $user_id, $price);
            
            if (!$insertStmt->execute()) {
                throw new Exception("Execute failed for insert query: " . $insertStmt->error);
            }
            
            // Add price history record (initial price setting)
            $historyQuery = "INSERT INTO product_price_history (product_id, retailer_id, previous_price, new_price, updated_by, created_at) VALUES (?, ?, ?, ?, ?, NOW())";
            $historyStmt = $conn->prepare($historyQuery);
            
            if (!$historyStmt) {
                throw new Exception("Prepare failed for history query: " . $conn->error);
            }
            
            // For initial price, set previous price to the same as supplier price
            $supplierPriceQuery = "SELECT unit_price FROM retailer_order_items WHERE product_id = ? LIMIT 1";
            $supplierPriceStmt = $conn->prepare($supplierPriceQuery);
            $supplierPriceStmt->bind_param("s", $product_id);
            $supplierPriceStmt->execute();
            $supplierPriceResult = $supplierPriceStmt->get_result();
            $supplierPrice = $supplierPriceResult->fetch_assoc()['unit_price'] ?? $price;
            
            $historyStmt->bind_param("sidds", $product_id, $user_id, $supplierPrice, $price, $userName);
            
            if (!$historyStmt->execute()) {
                throw new Exception("Execute failed for history query: " . $historyStmt->error);
            }
        }
        
        // Commit transaction
        $conn->commit();
        
        $response['success'] = true;
        $response['message'] = "Product price updated successfully";
        
    } else {
        throw new Exception("User not found");
    }
    
} catch (Exception $e) {
    // Rollback transaction on error
    if (isset($conn) && $conn->ping()) {
        $conn->rollback();
    }
    $response['message'] = "Error: " . $e->getMessage();
    error_log("Error updating product price: " . $e->getMessage());
}

echo json_encode($response);
?>
