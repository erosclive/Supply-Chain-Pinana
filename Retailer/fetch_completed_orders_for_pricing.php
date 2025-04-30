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
$response = ['success' => false, 'message' => '', 'orders' => [], 'product_prices' => [], 'price_history' => []];

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
        
        // Get all completed orders
        $query = "SELECT 
                    ro.order_id,
                    ro.po_number,
                    ro.retailer_name,
                    ro.retailer_email,
                    ro.retailer_contact,
                    ro.order_date,
                    ro.status,
                    ro.subtotal,
                    ro.total_amount,
                    ro.created_at,
                    ro.updated_at
                FROM 
                    retailer_orders ro
                WHERE 
                    ro.status = 'completed'
                    AND ro.retailer_email = ?
                ORDER BY 
                    ro.created_at DESC";
        
        $stmt = $conn->prepare($query);
        
        if (!$stmt) {
            throw new Exception("Prepare failed: " . $conn->error);
        }
        
        $stmt->bind_param("s", $userEmail);
        
        if (!$stmt->execute()) {
            throw new Exception("Execute failed: " . $stmt->error);
        }
        
        $result = $stmt->get_result();
        
        // Fetch all completed orders
        $orders = [];
        while ($row = $result->fetch_assoc()) {
            // Get order items
            $itemsQuery = "SELECT 
                            roi.item_id,
                            roi.order_id,
                            roi.product_id,
                            roi.quantity,
                            roi.unit_price,
                            roi.total_price,
                            roi.created_at,
                            roi.product_name,
                            p.id as product_db_id,
                            p.category,
                            p.price as current_price,
                            p.retail_price,
                            p.status as product_status
                        FROM 
                            retailer_order_items roi
                        LEFT JOIN 
                            products p ON roi.product_id = p.product_id
                        WHERE 
                            roi.order_id = ?";
            
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
                // First try to use the product_name from the order_items table
                $productName = $itemRow['product_name'];
                
                // If product_name is empty or NULL, look it up from the products table
                if (empty($productName) && !empty($itemRow['product_id'])) {
                    $productQuery = "SELECT product_name FROM products WHERE product_id = ?";
                    $productStmt = $conn->prepare($productQuery);
                    $productStmt->bind_param("s", $itemRow['product_id']);
                    $productStmt->execute();
                    $productResult = $productStmt->get_result();
                    
                    if ($productRow = $productResult->fetch_assoc()) {
                        $productName = $productRow['product_name'];
                        
                        // Update the product_name in the order_items table for future use
                        $updateQuery = "UPDATE retailer_order_items SET product_name = ? WHERE item_id = ?";
                        $updateStmt = $conn->prepare($updateQuery);
                        $updateStmt->bind_param("si", $productName, $itemRow['item_id']);
                        $updateStmt->execute();
                    } else {
                        $productName = "Unknown Product";
                    }
                } else if (empty($productName)) {
                    $productName = "Unknown Product";
                }
                
                $itemRow['product_name'] = $productName;
                $items[] = $itemRow;
            }
            
            $row['items'] = $items;
            $orders[] = $row;
        }
        
        // Get current retail prices for all products
        $pricesQuery = "SELECT product_id, retail_price FROM product_pricing WHERE retailer_id = ?";
        $pricesStmt = $conn->prepare($pricesQuery);
        
        if (!$pricesStmt) {
            throw new Exception("Prepare failed for prices query: " . $conn->error);
        }
        
        $pricesStmt->bind_param("i", $user_id);
        
        if (!$pricesStmt->execute()) {
            throw new Exception("Execute failed for prices query: " . $pricesStmt->error);
        }
        
        $pricesResult = $pricesStmt->get_result();
        
        $productPrices = [];
        while ($priceRow = $pricesResult->fetch_assoc()) {
            $productPrices[$priceRow['product_id']] = $priceRow['retail_price'];
        }
        
        // Get price history for all products
        $historyQuery = "SELECT 
                            ph.history_id,
                            ph.product_id,
                            ph.previous_price,
                            ph.new_price,
                            ph.updated_by,
                            ph.created_at
                        FROM 
                            product_price_history ph
                        WHERE 
                            ph.retailer_id = ?
                        ORDER BY 
                            ph.created_at DESC";
        
        $historyStmt = $conn->prepare($historyQuery);
        
        if (!$historyStmt) {
            throw new Exception("Prepare failed for history query: " . $conn->error);
        }
        
        $historyStmt->bind_param("i", $user_id);
        
        if (!$historyStmt->execute()) {
            throw new Exception("Execute failed for history query: " . $historyStmt->error);
        }
        
        $historyResult = $historyStmt->get_result();
        
        $priceHistory = [];
        while ($historyRow = $historyResult->fetch_assoc()) {
            if (!isset($priceHistory[$historyRow['product_id']])) {
                $priceHistory[$historyRow['product_id']] = [];
            }
            $priceHistory[$historyRow['product_id']][] = $historyRow;
        }
        
        $response['success'] = true;
        $response['orders'] = $orders;
        $response['product_prices'] = $productPrices;
        $response['price_history'] = $priceHistory;
        
    } else {
        throw new Exception("User email not found");
    }
    
} catch (Exception $e) {
    $response['message'] = "Error: " . $e->getMessage();
    error_log("Error fetching completed orders for pricing: " . $e->getMessage());
}

echo json_encode($response);
?>
