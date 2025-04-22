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

// Get action from request
$action = isset($_GET['action']) ? $_GET['action'] : '';

// Handle different actions
switch ($action) {
    case 'get_orders':
        getOrders($conn, $user_id);
        break;
    case 'get_products':
        getProducts($conn);
        break;
    case 'update_status':
        updateOrderStatus($conn, $user_id);
        break;
    case 'delete_order':
        deleteOrder($conn, $user_id);
        break;
    default:
        $response['message'] = 'Invalid action';
        echo json_encode($response);
        break;
}

// Function to get orders for the current user
function getOrders($conn, $user_id = null) {
    // Initialize response array
    $response = ['success' => false, 'message' => '', 'orders' => []];
    
    try {
        // Check if user is logged in
        if (!$user_id) {
            throw new Exception("User not logged in");
        }
        
        // Log the user ID for debugging
        error_log("Getting orders for user ID: $user_id");
        
        // Build the query based on filters - IMPORTANT: Filter by retailer_email matching user's email
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
            
            // Now get orders where retailer_email matches the user's email
            $query = "SELECT o.* FROM retailer_orders o WHERE o.retailer_email = ?";
            $params = [$userEmail];
            $types = "s"; // string for email
            
            // Filter by status if provided
            if (isset($_GET['status']) && $_GET['status'] != 'all') {
                $query .= " AND o.status = ?";
                $params[] = $_GET['status'];
                $types .= "s";
            }
            
            // Filter by date range if provided
            if (isset($_GET['date_range'])) {
                switch ($_GET['date_range']) {
                    case 'today':
                        $query .= " AND DATE(o.order_date) = CURDATE()";
                        break;
                    case 'week':
                        $query .= " AND YEARWEEK(o.order_date, 1) = YEARWEEK(CURDATE(), 1)";
                        break;
                    case 'month':
                        $query .= " AND MONTH(o.order_date) = MONTH(CURDATE()) AND YEAR(o.order_date) = YEAR(CURDATE())";
                        break;
                }
            } else if (isset($_GET['start_date']) && isset($_GET['end_date'])) {
                $query .= " AND o.order_date BETWEEN ? AND ?";
                $params[] = $_GET['start_date'];
                $params[] = $_GET['end_date'];
                $types .= "ss";
            }
            
            // Search functionality
            if (isset($_GET['search']) && !empty($_GET['search'])) {
                $search = $_GET['search'];
                $query .= " AND (o.po_number LIKE ? OR o.retailer_name LIKE ? OR o.notes LIKE ?)";
                $searchTerm = "%$search%";
                $params[] = $searchTerm;
                $params[] = $searchTerm;
                $params[] = $searchTerm;
                $types .= "sss";
            }
            
            // Order by most recent first
            $query .= " ORDER BY o.order_date DESC";
            
            // Log the query for debugging
            error_log("Orders query: $query with user email: $userEmail");
            
            // Prepare and execute the query
            $stmt = $conn->prepare($query);
            
            if (!$stmt) {
                throw new Exception("Prepare failed: " . $conn->error);
            }
            
            $stmt->bind_param($types, ...$params);
            
            if (!$stmt->execute()) {
                throw new Exception("Execute failed: " . $stmt->error);
            }
            
            $result = $stmt->get_result();
            
            // Fetch all orders
            $orders = [];
            while ($row = $result->fetch_assoc()) {
                // Get order items with product information
                $itemsQuery = "SELECT oi.* FROM retailer_order_items oi WHERE oi.order_id = ?";
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
                $itemCount = 0;
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
                    
                    $items[] = [
                        'item_id' => $itemRow['item_id'],
                        'product_id' => $itemRow['product_id'],
                        'product_name' => $productName,
                        'quantity' => $itemRow['quantity'],
                        'unit_price' => $itemRow['unit_price'],
                        'total_price' => $itemRow['total_price'] ?? ($itemRow['quantity'] * $itemRow['unit_price'])
                    ];
                    $itemCount += $itemRow['quantity']; // Sum up quantities for total item count
                }
                
                $row['items'] = $items;
                $row['item_count'] = $itemCount;
                
                // Get status history
                $historyQuery = "SELECT * FROM retailer_order_status_history WHERE order_id = ? ORDER BY created_at DESC";
                $historyStmt = $conn->prepare($historyQuery);
                $historyStmt->bind_param("i", $row['order_id']);
                $historyStmt->execute();
                $historyResult = $historyStmt->get_result();
                
                $statusHistory = [];
                while ($historyRow = $historyResult->fetch_assoc()) {
                    $statusHistory[] = $historyRow;
                }
                
                $row['status_history'] = $statusHistory;
                
                // Set default delivery mode if not set
                if (!isset($row['delivery_mode']) || empty($row['delivery_mode'])) {
                    $row['delivery_mode'] = 'delivery';
                }
                
                $orders[] = $row;
            }
            
            $response['success'] = true;
            $response['orders'] = $orders;
            
        } else {
            throw new Exception("User email not found");
        }
        
    } catch (Exception $e) {
        $response['message'] = "Error: " . $e->getMessage();
        error_log("Error fetching orders: " . $e->getMessage());
    }
    
    echo json_encode($response);
}

// Function to update order status - ensure user can only update their own orders
function updateOrderStatus($conn, $user_id = null) {
    // Initialize response array
    $response = ['success' => false, 'message' => ''];
    
    try {
        // Check if user is logged in
        if (!$user_id) {
            throw new Exception("User not logged in");
        }
        
        // Get JSON data from request
        $data = json_decode(file_get_contents('php://input'), true);
        
        if (!isset($data['order_id']) || !isset($data['status'])) {
            throw new Exception("Missing required fields");
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
            $checkQuery = "SELECT order_id FROM retailer_orders WHERE order_id = ? AND retailer_email = ?";
            $checkStmt = $conn->prepare($checkQuery);
            $checkStmt->bind_param("is", $data['order_id'], $userEmail);
            $checkStmt->execute();
            $checkResult = $checkStmt->get_result();
            
            if ($checkResult->num_rows === 0) {
                throw new Exception("You don't have permission to update this order");
            }
            
            // Start transaction
            $conn->begin_transaction();
            
            // Update order status
            $updateQuery = "UPDATE retailer_orders SET status = ?, updated_at = NOW() WHERE order_id = ?";
            $updateStmt = $conn->prepare($updateQuery);
            
            if (!$updateStmt) {
                throw new Exception("Prepare failed: " . $conn->error);
            }
            
            $updateStmt->bind_param("si", $data['status'], $data['order_id']);
            
            if (!$updateStmt->execute()) {
                throw new Exception("Execute failed: " . $updateStmt->error);
            }
            
            if ($updateStmt->affected_rows <= 0 && $updateStmt->errno != 0) {
                throw new Exception("Failed to update order status");
            }
            
            // Add status history entry
            $historyQuery = "INSERT INTO retailer_order_status_history (order_id, status, notes, created_at) VALUES (?, ?, ?, NOW())";
            $historyStmt = $conn->prepare($historyQuery);
            
            if (!$historyStmt) {
                throw new Exception("Prepare failed for history: " . $conn->error);
            }
            
            $notes = isset($data['notes']) ? $data['notes'] : '';
            $historyStmt->bind_param("iss", $data['order_id'], $data['status'], $notes);
            
            if (!$historyStmt->execute()) {
                throw new Exception("Execute failed for history: " . $historyStmt->error);
            }
            
            // Commit transaction
            $conn->commit();
            
            $response['success'] = true;
            $response['message'] = "Order status updated successfully";
        } else {
            throw new Exception("User email not found");
        }
        
    } catch (Exception $e) {
        // Rollback transaction on error
        if (isset($conn) && $conn->ping()) {
            $conn->rollback();
        }
        $response['message'] = "Error: " . $e->getMessage();
        error_log("Error updating order status: " . $e->getMessage());
    }
    
    echo json_encode($response);
}

// Function to delete order - ensure user can only delete their own orders
function deleteOrder($conn, $user_id = null) {
    // Initialize response array
    $response = ['success' => false, 'message' => ''];
    
    try {
        // Check if user is logged in
        if (!$user_id) {
            throw new Exception("User not logged in");
        }
        
        // Get JSON data from request
        $data = json_decode(file_get_contents('php://input'), true);
        
        if (!isset($data['order_id'])) {
            throw new Exception("Missing order ID");
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
            $checkQuery = "SELECT order_id FROM retailer_orders WHERE order_id = ? AND retailer_email = ?";
            $checkStmt = $conn->prepare($checkQuery);
            $checkStmt->bind_param("is", $data['order_id'], $userEmail);
            $checkStmt->execute();
            $checkResult = $checkStmt->get_result();
            
            if ($checkResult->num_rows === 0) {
                throw new Exception("You don't have permission to delete this order");
            }
            
            // Start transaction
            $conn->begin_transaction();
            
            // Delete order items first (foreign key constraint)
            $deleteItemsQuery = "DELETE FROM retailer_order_items WHERE order_id = ?";
            $deleteItemsStmt = $conn->prepare($deleteItemsQuery);
            
            if (!$deleteItemsStmt) {
                throw new Exception("Prepare failed for delete items: " . $conn->error);
            }
            
            $deleteItemsStmt->bind_param("i", $data['order_id']);
            
            if (!$deleteItemsStmt->execute()) {
                throw new Exception("Execute failed for delete items: " . $deleteItemsStmt->error);
            }
            
            // Delete status history
            $deleteHistoryQuery = "DELETE FROM retailer_order_status_history WHERE order_id = ?";
            $deleteHistoryStmt = $conn->prepare($deleteHistoryQuery);
            
            if (!$deleteHistoryStmt) {
                throw new Exception("Prepare failed for delete history: " . $conn->error);
            }
            
            $deleteHistoryStmt->bind_param("i", $data['order_id']);
            
            if (!$deleteHistoryStmt->execute()) {
                throw new Exception("Execute failed for delete history: " . $deleteHistoryStmt->error);
            }
            
            // Delete the order
            $deleteOrderQuery = "DELETE FROM retailer_orders WHERE order_id = ?";
            $deleteOrderStmt = $conn->prepare($deleteOrderQuery);
            
            if (!$deleteOrderStmt) {
                throw new Exception("Prepare failed for delete order: " . $conn->error);
            }
            
            $deleteOrderStmt->bind_param("i", $data['order_id']);
            
            if (!$deleteOrderStmt->execute()) {
                throw new Exception("Execute failed for delete order: " . $deleteOrderStmt->error);
            }
            
            if ($deleteOrderStmt->affected_rows <= 0) {
                throw new Exception("Order not found or already deleted");
            }
            
            // Commit transaction
            $conn->commit();
            
            $response['success'] = true;
            $response['message'] = "Order deleted successfully";
        } else {
            throw new Exception("User email not found");
        }
        
    } catch (Exception $e) {
        // Rollback transaction on error
        if (isset($conn) && $conn->ping()) {
            $conn->rollback();
        }
        $response['message'] = "Error: " . $e->getMessage();
        error_log("Error deleting order: " . $e->getMessage());
    }
    
    echo json_encode($response);
}

// Function to get products
function getProducts($conn) {
    // Initialize response array
    $response = ['success' => false, 'message' => '', 'products' => []];
    
    try {
        // Query to get all active products
        $query = "SELECT 
                    p.product_id,
                    p.product_name,
                    p.price as retail_price,
                    p.stocks as available_stock,
                    p.batch_tracking
                  FROM products p
                  WHERE p.stocks > 0
                  ORDER BY p.product_name";
        
        $result = $conn->query($query);
        
        if (!$result) {
            throw new Exception("Query failed: " . $conn->error);
        }
        
        $products = [];
        while ($row = $result->fetch_assoc()) {
            $products[] = $row;
        }
        
        $response['success'] = true;
        $response['products'] = $products;
        
    } catch (Exception $e) {
        $response['message'] = "Error: " . $e->getMessage();
        error_log("Error fetching products: " . $e->getMessage());
    }
    
    echo json_encode($response);
}
?>