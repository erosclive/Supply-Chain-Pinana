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

// Get action from request
$action = isset($_GET['action']) ? $_GET['action'] : '';

// Test database connection if requested
if (isset($_GET['test'])) {
    if ($conn) {
        echo "Database connection successful";
    } else {
        echo "Database connection failed: " . mysqli_connect_error();
    }
    exit;
}

// Check if user is logged in
$user_id = isset($_SESSION['user_id']) ? $_SESSION['user_id'] : null;

// Handle different actions
switch ($action) {
    case 'get_orders':
        getOrders($user_id);
        break;
    case 'create_order':
        createOrder($user_id);
        break;
    case 'update_status':
        updateOrderStatus($user_id);
        break;
    case 'delete_order':
        deleteOrder($user_id);
        break;
    case 'get_products':
        getProducts();
        break;
    default:
        echo json_encode(['success' => false, 'message' => 'Invalid action']);
        break;
}

// Modify the getOrders function to handle product_id = 0
function getOrders($user_id = null) {
    global $conn;
    
    // Check if user is logged in
    if (!$user_id) {
        echo json_encode(['success' => false, 'message' => 'User not logged in']);
        return;
    }
    
    // Get filter parameters
    $status = isset($_GET['status']) ? $_GET['status'] : 'all';
    $search = isset($_GET['search']) ? $_GET['search'] : '';
    $startDate = isset($_GET['start_date']) ? $_GET['start_date'] : null;
    $endDate = isset($_GET['end_date']) ? $_GET['end_date'] : null;
    $dateRange = isset($_GET['date_range']) ? $_GET['date_range'] : 'all';
    
    // Start building the query - UPDATED to filter by user_id
    $query = "SELECT ro.* FROM retailer_orders ro 
              JOIN users u ON ro.retailer_email = u.email 
              WHERE u.id = ?";
    $params = [$user_id];
    $types = "i"; // integer for user_id
    
    // Add status filter
    if ($status !== 'all') {
        $query .= " AND ro.status = ?";
        $params[] = $status;
        $types .= "s"; // string for status
    }
    
    // Add date range filter based on predefined ranges
    if ($dateRange === 'today') {
        $query .= " AND DATE(ro.order_date) = CURDATE()";
    } else if ($dateRange === 'week') {
        $query .= " AND YEARWEEK(ro.order_date, 1) = YEARWEEK(CURDATE(), 1)";
    } else if ($dateRange === 'month') {
        $query .= " AND MONTH(ro.order_date) = MONTH(CURDATE()) AND YEAR(ro.order_date) = YEAR(CURDATE())";
    } else if ($dateRange === 'custom' && $startDate && $endDate) {
        $query .= " AND ro.order_date BETWEEN ? AND ?";
        $params[] = $startDate;
        $params[] = $endDate;
        $types .= "ss"; // two strings for dates
    }
    
    // Add search filter
    if (!empty($search)) {
        $query .= " AND (ro.po_number LIKE ? OR ro.retailer_name LIKE ? OR ro.notes LIKE ?)";
        $searchTerm = "%$search%";
        $params[] = $searchTerm;
        $params[] = $searchTerm;
        $params[] = $searchTerm;
        $types .= "sss"; // three strings for search terms
    }
    
    // Add order by
    $query .= " ORDER BY ro.order_date DESC";
    
    // Log the query for debugging
    error_log("Orders query: $query with user_id: $user_id");
    
    // Prepare and execute the query
    $stmt = mysqli_prepare($conn, $query);
    
    if (!$stmt) {
        echo json_encode(['success' => false, 'message' => 'Query preparation failed: ' . mysqli_error($conn)]);
        return;
    }
    
    // Bind parameters
    mysqli_stmt_bind_param($stmt, $types, ...$params);
    
    // Execute the query
    if (!mysqli_stmt_execute($stmt)) {
        echo json_encode(['success' => false, 'message' => 'Query execution failed: ' . mysqli_stmt_error($stmt)]);
        return;
    }
    
    $result = mysqli_stmt_get_result($stmt);
    
    // Fetch all orders
    $orders = [];
    while ($row = mysqli_fetch_assoc($result)) {
        // Get order items with product information
        $itemsQuery = "SELECT roi.* FROM retailer_order_items roi WHERE roi.order_id = ?";
        $itemsStmt = mysqli_prepare($conn, $itemsQuery);
        mysqli_stmt_bind_param($itemsStmt, "i", $row['order_id']);
        mysqli_stmt_execute($itemsStmt);
        $itemsResult = mysqli_stmt_get_result($itemsStmt);
        
        $items = [];
        $itemCount = 0;
        while ($item = mysqli_fetch_assoc($itemsResult)) {
            // Look up the product name from the products table
            $productName = "Piñana Gourmet Product"; // Default name
            
            if (!empty($item['product_id'])) {
                $productQuery = "SELECT product_name FROM products WHERE product_id = ?";
                $productStmt = mysqli_prepare($conn, $productQuery);
                mysqli_stmt_bind_param($productStmt, "s", $item['product_id']);
                mysqli_stmt_execute($productStmt);
                $productResult = mysqli_stmt_get_result($productStmt);
                
                if ($productRow = mysqli_fetch_assoc($productResult)) {
                    $productName = $productRow['product_name'];
                }
            }
            
            $items[] = [
                'item_id' => $item['item_id'],
                'product_id' => $item['product_id'],
                'product_name' => $productName,
                'quantity' => $item['quantity'],
                'unit_price' => $item['unit_price'],
                'total_price' => $item['total_price']
            ];
            $itemCount += $item['quantity']; // Sum up quantities for total item count
        }
        
        $row['items'] = $items;
        $row['item_count'] = $itemCount;
        
        // Get status history
        $historyQuery = "SELECT * FROM retailer_order_status_history WHERE order_id = ? ORDER BY created_at ASC";
        $historyStmt = mysqli_prepare($conn, $historyQuery);
        mysqli_stmt_bind_param($historyStmt, "i", $row['order_id']);
        mysqli_stmt_execute($historyStmt);
        $historyResult = mysqli_stmt_get_result($historyStmt);
        
        $statusHistory = [];
        while ($history = mysqli_fetch_assoc($historyResult)) {
            $statusHistory[] = $history;
        }
        
        $row['status_history'] = $statusHistory;
        
        $orders[] = $row;
    }
    
    echo json_encode(['success' => true, 'orders' => $orders]);
}

// Function to create a new order
function createOrder($user_id = null) {
    global $conn;
    
    // Check if user is logged in
    if (!$user_id) {
        echo json_encode(['success' => false, 'message' => 'User not logged in']);
        return;
    }
    
    // Get JSON data from request
    $jsonData = file_get_contents('php://input');
    
    // Log the received data for debugging
    error_log("Received order data: " . $jsonData);
    
    $data = json_decode($jsonData, true);
    
    if (!$data) {
        echo json_encode(['success' => false, 'message' => 'Invalid data format']);
        error_log("JSON decode failed: " . json_last_error_msg());
        return;
    }
    
    try {
        // Start transaction
        mysqli_begin_transaction($conn);
        
        // Check if this is an update or new order
        $orderId = isset($data['order_id']) ? $data['order_id'] : null;
        
        if ($orderId) {
            // Verify the order belongs to this user
            $checkQuery = "SELECT ro.order_id FROM retailer_orders ro 
                          JOIN users u ON ro.retailer_email = u.email 
                          WHERE ro.order_id = ? AND u.id = ?";
            $checkStmt = mysqli_prepare($conn, $checkQuery);
            mysqli_stmt_bind_param($checkStmt, "ii", $orderId, $user_id);
            mysqli_stmt_execute($checkStmt);
            mysqli_stmt_store_result($checkStmt);
            
            if (mysqli_stmt_num_rows($checkStmt) === 0) {
                throw new Exception("You don't have permission to update this order");
            }
            
            // Update existing order
            updateOrder($data, $orderId);
        } else {
            // Create new order
            insertOrder($data, $user_id);
        }
        
        // Commit transaction
        mysqli_commit($conn);
        
        echo json_encode(['success' => true, 'message' => $orderId ? 'Order updated successfully' : 'Order created successfully']);
    } catch (Exception $e) {
        // Rollback transaction on error
        mysqli_rollback($conn);
        
        error_log("Order creation error: " . $e->getMessage());
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
}

// Function to insert a new order
function insertOrder($data, $user_id) {
    global $conn;
    
    // Get user information
    $userQuery = "SELECT * FROM users WHERE id = ?";
    $userStmt = mysqli_prepare($conn, $userQuery);
    mysqli_stmt_bind_param($userStmt, "i", $user_id);
    mysqli_stmt_execute($userStmt);
    $userResult = mysqli_stmt_get_result($userStmt);
    $user = mysqli_fetch_assoc($userResult);
    
    if (!$user) {
        throw new Exception("User information not found");
    }
    
    // Generate PO number (format: RO-YYYYMMDD-XXX)
    $poNumber = 'RO-' . date('Ymd') . '-' . sprintf('%03d', rand(1, 999));
    
    // Prepare order data
    $retailerName = $data['retailer_name'] ?: $user['full_name'];
    $retailerEmail = $data['retailer_email'] ?: $user['email'];
    $retailerContact = $data['retailer_contact'] ?: '';
    $orderDate = $data['order_date'];
    $expectedDelivery = $data['expected_delivery'];
    $status = $data['status'];
    $subtotal = $data['subtotal'];
    $tax = isset($data['tax']) ? $data['tax'] : 0;
    $discount = $data['discount'];
    $totalAmount = $data['total_amount'];
    $notes = isset($data['notes']) ? $data['notes'] : '';
    
    // Log the data being inserted
    error_log("Inserting order with PO: $poNumber, Status: $status, User ID: $user_id");
    
    // Insert order
    $query = "INSERT INTO retailer_orders (
                po_number, 
                retailer_name, 
                retailer_email, 
                retailer_contact, 
                order_date, 
                expected_delivery, 
                status, 
                subtotal, 
                tax, 
                discount, 
                total_amount, 
                notes, 
                created_at,
                updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())";
    
    $stmt = mysqli_prepare($conn, $query);
    if (!$stmt) {
        throw new Exception("Prepare failed: " . mysqli_error($conn));
    }
    
    mysqli_stmt_bind_param(
        $stmt, 
        "ssssssddddss", 
        $poNumber, 
        $retailerName, 
        $retailerEmail, 
        $retailerContact, 
        $orderDate, 
        $expectedDelivery, 
        $status, 
        $subtotal, 
        $tax, 
        $discount, 
        $totalAmount, 
        $notes
    );
    
    if (!mysqli_stmt_execute($stmt)) {
        throw new Exception("Error creating order: " . mysqli_error($conn) . " (Query: $query)");
    }
    
    $orderId = mysqli_insert_id($conn);
    if (!$orderId) {
        throw new Exception("Failed to get insert ID after creating order");
    }
    
    error_log("Order created with ID: $orderId");
    
    // Insert order items
    insertOrderItems($data['items'], $orderId);
    
    // Insert status history
    insertStatusHistory($orderId, $status, $notes);
    
    return $orderId;
}

// Function to update an existing order
function updateOrder($data, $orderId) {
    global $conn;
    
    // Prepare order data
    $retailerName = $data['retailer_name'];
    $retailerEmail = $data['retailer_email'];
    $retailerContact = $data['retailer_contact'];
    $orderDate = $data['order_date'];
    $expectedDelivery = $data['expected_delivery'];
    $status = $data['status'];
    $subtotal = $data['subtotal'];
    $tax = isset($data['tax']) ? $data['tax'] : 0;
    $discount = $data['discount'];
    $totalAmount = $data['total_amount'];
    $notes = isset($data['notes']) ? $data['notes'] : '';
    
    // Update order
    $query = "UPDATE retailer_orders SET 
                retailer_name = ?, 
                retailer_email = ?, 
                retailer_contact = ?, 
                order_date = ?, 
                expected_delivery = ?, 
                status = ?, 
                subtotal = ?, 
                tax = ?, 
                discount = ?, 
                total_amount = ?, 
                notes = ?,
                updated_at = NOW()
            WHERE order_id = ?";
    
    $stmt = mysqli_prepare($conn, $query);
    if (!$stmt) {
        throw new Exception("Prepare failed: " . mysqli_error($conn));
    }
    
    mysqli_stmt_bind_param(
        $stmt, 
        "ssssssddddsi", 
        $retailerName, 
        $retailerEmail, 
        $retailerContact, 
        $orderDate, 
        $expectedDelivery, 
        $status, 
        $subtotal, 
        $tax, 
        $discount, 
        $totalAmount, 
        $notes,
        $orderId
    );
    
    if (!mysqli_stmt_execute($stmt)) {
        throw new Exception("Error updating order: " . mysqli_error($conn));
    }
    
    // Delete existing order items
    $deleteQuery = "DELETE FROM retailer_order_items WHERE order_id = ?";
    $deleteStmt = mysqli_prepare($conn, $deleteQuery);
    mysqli_stmt_bind_param($deleteStmt, "i", $orderId);
    
    if (!mysqli_stmt_execute($deleteStmt)) {
        throw new Exception("Error deleting order items: " . mysqli_error($conn));
    }
    
    // Insert new order items
    insertOrderItems($data['items'], $orderId);
    
    // Check if status has changed
    $statusQuery = "SELECT status FROM retailer_orders WHERE order_id = ?";
    $statusStmt = mysqli_prepare($conn, $statusQuery);
    mysqli_stmt_bind_param($statusStmt, "i", $orderId);
    mysqli_stmt_execute($statusStmt);
    $statusResult = mysqli_stmt_get_result($statusStmt);
    $currentStatus = mysqli_fetch_assoc($statusResult)['status'];
    
    if ($currentStatus !== $status) {
        insertStatusHistory($orderId, $status, $notes);
    }
    
    return true;
}

// Function to insert order items
function insertOrderItems($items, $orderId) {
    global $conn;
    
    if (empty($items)) {
        error_log("No items to insert for order ID: $orderId");
        return;
    }
    
    error_log("Inserting " . count($items) . " items for order ID: $orderId");
    
    foreach ($items as $item) {
        $productId = $item['product_id'];
        $quantity = $item['quantity'];
        $unitPrice = $item['unit_price'];
        $totalPrice = $quantity * $unitPrice;
        
        error_log("Inserting item: Product ID: $productId, Quantity: $quantity, Unit Price: $unitPrice");
        
        $query = "INSERT INTO retailer_order_items (
                    order_id, 
                    product_id, 
                    quantity, 
                    unit_price,
                    total_price,
                    created_at
                ) VALUES (?, ?, ?, ?, ?, NOW())";
        
        $stmt = mysqli_prepare($conn, $query);
        if (!$stmt) {
            throw new Exception("Prepare failed for item insert: " . mysqli_error($conn));
        }
        
        mysqli_stmt_bind_param($stmt, "isidd", $orderId, $productId, $quantity, $unitPrice, $totalPrice);
        
        if (!mysqli_stmt_execute($stmt)) {
            throw new Exception("Error adding order item: " . mysqli_error($conn));
        }
    }
}

// Function to insert status history
function insertStatusHistory($orderId, $status, $notes = '') {
    global $conn;
    
    error_log("Inserting status history for order ID: $orderId, Status: $status");
    
    $query = "INSERT INTO retailer_order_status_history (order_id, status, notes, created_at) VALUES (?, ?, ?, NOW())";
    $stmt = mysqli_prepare($conn, $query);
    if (!$stmt) {
        throw new Exception("Prepare failed for status history: " . mysqli_error($conn));
    }
    
    mysqli_stmt_bind_param($stmt, "iss", $orderId, $status, $notes);
    
    if (!mysqli_stmt_execute($stmt)) {
        throw new Exception("Error adding status history: " . mysqli_error($conn));
    }
}

// Function to update order status
function updateOrderStatus($user_id = null) {
    global $conn;
    
    // Check if user is logged in
    if (!$user_id) {
        echo json_encode(['success' => false, 'message' => 'User not logged in']);
        return;
    }
    
    // Get JSON data from request
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!$data || !isset($data['order_id']) || !isset($data['status'])) {
        echo json_encode(['success' => false, 'message' => 'Invalid data format']);
        return;
    }
    
    try {
        // Start transaction
        mysqli_begin_transaction($conn);
        
        $orderId = $data['order_id'];
        $status = $data['status'];
        $notes = isset($data['notes']) ? $data['notes'] : '';
        
        // Verify the order belongs to this user
        $checkQuery = "SELECT ro.order_id FROM retailer_orders ro 
                      JOIN users u ON ro.retailer_email = u.email 
                      WHERE ro.order_id = ? AND u.id = ?";
        $checkStmt = mysqli_prepare($conn, $checkQuery);
        mysqli_stmt_bind_param($checkStmt, "ii", $orderId, $user_id);
        mysqli_stmt_execute($checkStmt);
        mysqli_stmt_store_result($checkStmt);
        
        if (mysqli_stmt_num_rows($checkStmt) === 0) {
            throw new Exception("You don't have permission to update this order");
        }
        
        // Update order status
        $query = "UPDATE retailer_orders SET status = ?, updated_at = NOW() WHERE order_id = ?";
        $stmt = mysqli_prepare($conn, $query);
        mysqli_stmt_bind_param($stmt, "si", $status, $orderId);
        
        if (!mysqli_stmt_execute($stmt)) {
            throw new Exception("Error updating order status: " . mysqli_error($conn));
        }
        
        // Insert status history
        insertStatusHistory($orderId, $status, $notes);
        
        // Commit transaction
        mysqli_commit($conn);
        
        echo json_encode(['success' => true, 'message' => 'Order status updated successfully']);
    } catch (Exception $e) {
        // Rollback transaction on error
        mysqli_rollback($conn);
        
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
}

// Function to delete an order
function deleteOrder($user_id = null) {
    global $conn;
    
    // Check if user is logged in
    if (!$user_id) {
        echo json_encode(['success' => false, 'message' => 'User not logged in']);
        return;
    }
    
    // Get JSON data from request
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!$data || !isset($data['order_id'])) {
        echo json_encode(['success' => false, 'message' => 'Invalid data format']);
        return;
    }
    
    try {
        // Start transaction
        mysqli_begin_transaction($conn);
        
        $orderId = $data['order_id'];
        
        // Verify the order belongs to this user
        $checkQuery = "SELECT ro.order_id FROM retailer_orders ro 
                      JOIN users u ON ro.retailer_email = u.email 
                      WHERE ro.order_id = ? AND u.id = ?";
        $checkStmt = mysqli_prepare($conn, $checkQuery);
        mysqli_stmt_bind_param($checkStmt, "ii", $orderId, $user_id);
        mysqli_stmt_execute($checkStmt);
        mysqli_stmt_store_result($checkStmt);
        
        if (mysqli_stmt_num_rows($checkStmt) === 0) {
            throw new Exception("You don't have permission to delete this order");
        }
        
        // Delete order items
        $deleteItemsQuery = "DELETE FROM retailer_order_items WHERE order_id = ?";
        $deleteItemsStmt = mysqli_prepare($conn, $deleteItemsQuery);
        mysqli_stmt_bind_param($deleteItemsStmt, "i", $orderId);
        
        if (!mysqli_stmt_execute($deleteItemsStmt)) {
            throw new Exception("Error deleting order items: " . mysqli_error($conn));
        }
        
        // Delete status history
        $deleteHistoryQuery = "DELETE FROM retailer_order_status_history WHERE order_id = ?";
        $deleteHistoryStmt = mysqli_prepare($conn, $deleteHistoryQuery);
        mysqli_stmt_bind_param($deleteHistoryStmt, "i", $orderId);
        
        if (!mysqli_stmt_execute($deleteHistoryStmt)) {
            throw new Exception("Error deleting status history: " . mysqli_error($conn));
        }
        
        // Delete order
        $deleteOrderQuery = "DELETE FROM retailer_orders WHERE order_id = ?";
        $deleteOrderStmt = mysqli_prepare($conn, $deleteOrderQuery);
        mysqli_stmt_bind_param($deleteOrderStmt, "i", $orderId);
        
        if (!mysqli_stmt_execute($deleteOrderStmt)) {
            throw new Exception("Error deleting order: " . mysqli_error($conn));
        }
        
        // Commit transaction
        mysqli_commit($conn);
        
        echo json_encode(['success' => true, 'message' => 'Order deleted successfully']);
    } catch (Exception $e) {
        // Rollback transaction on error
        mysqli_rollback($conn);
        
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
}

// Function to get products
function getProducts() {
    global $conn;
    
    $query = "SELECT 
                p.product_id,
                p.product_name,
                p.price as retail_price,
                p.stocks as available_stock,
                p.batch_tracking
            FROM products p
            WHERE p.stocks > 0
            ORDER BY p.product_name";
    
    $result = mysqli_query($conn, $query);
    
    if (!$result) {
        echo json_encode(['success' => false, 'message' => 'Error fetching products: ' . mysqli_error($conn)]);
        return;
    }
    
    $products = [];
    while ($row = mysqli_fetch_assoc($result)) {
        $products[] = $row;
    }
    
    echo json_encode(['success' => true, 'products' => $products]);
}
?>
