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

// Check if user is logged in
if (!isset($_SESSION['user_id'])) {
    echo json_encode([
        'success' => false,
        'message' => 'User not logged in'
    ]);
    exit;
}

$user_id = $_SESSION['user_id'];

// Get JSON data from request
$jsonData = file_get_contents('php://input');
$data = json_decode($jsonData, true);

// Log the received data for debugging
error_log("Received order data in save_retailer_order.php: " . $jsonData);

if (!$data) {
    echo json_encode([
        'success' => false,
        'message' => 'Invalid data format'
    ]);
    exit;
}

try {
    // Start transaction
    mysqli_begin_transaction($conn);
    
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
    
    // Check if this is an update or new order
    $orderId = isset($data['order_id']) && !empty($data['order_id']) ? $data['order_id'] : null;
    
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
        updateOrder($conn, $data, $orderId);
    } else {
        // Create new order
        $orderId = insertOrder($conn, $data, $user);
    }
    
    // Commit transaction
    mysqli_commit($conn);
    
    echo json_encode([
        'success' => true,
        'message' => $orderId ? 'Order saved successfully' : 'Failed to save order',
        'order_id' => $orderId
    ]);
    
} catch (Exception $e) {
    // Rollback transaction on error
    mysqli_rollback($conn);
    
    error_log("Order save error: " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}

// Replace the entire insertOrder function with this updated version
function insertOrder($conn, $data, $user) {
    // Force a specific status value for debugging
    $status = 'order'; // Hardcoded default status
    
    // Try to get status from the data if available
    if (isset($data['status']) && !empty($data['status'])) {
        $status = $data['status'];
        error_log("Using status from data: " . $status);
    } else if (isset($data['targetStatus']) && !empty($data['targetStatus'])) {
        $status = $data['targetStatus'];
        error_log("Using targetStatus: " . $status);
    }
    
    error_log("FINAL STATUS TO INSERT: " . $status);
    
    // Generate PO number (format: RO-YYYYMMDD-XXX)
    $poNumber = 'RO-' . date('Ymd') . '-' . sprintf('%03d', rand(1, 999));
    
    // Prepare order data
    $retailerName = $data['retailer_name'] ?: $user['full_name'];
    $retailerEmail = $data['retailer_email'] ?: $user['email'];
    $retailerContact = $data['retailer_contact'] ?: '';
    
    // Add explicit debugging for expected delivery date
    $expectedDeliveryValue = isset($data['expected_delivery']) ? $data['expected_delivery'] : 'NOT SET';
    error_log("Expected delivery value received: " . $expectedDeliveryValue);
    
    $orderDate = $data['order_date'];
    
    $expectedDelivery = !empty($data['expected_delivery']) ? $data['expected_delivery'] : date('Y-m-d', strtotime('+7 days'));
    // Validate date format
    if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $expectedDelivery)) {
        error_log("Invalid expected delivery date format: $expectedDelivery - reformatting");
        // Try to reformat or default to a week from now
        $parsedDate = strtotime($expectedDelivery);
        if ($parsedDate) {
            $expectedDelivery = date('Y-m-d', $parsedDate);
        } else {
            $expectedDelivery = date('Y-m-d', strtotime('+7 days'));
        }
    }
    error_log("Final expected delivery date to be inserted: " . $expectedDelivery);
    
    $subtotal = $data['subtotal'];
    $discount = $data['discount'];
    $totalAmount = $subtotal - $discount;
    $notes = isset($data['notes']) ? $data['notes'] : '';
    
    // Direct SQL query with explicit status value
    $query = "INSERT INTO retailer_orders (
            po_number, 
            retailer_name, 
            retailer_email, 
            retailer_contact, 
            order_date, 
            expected_delivery, 
            status, 
            subtotal, 
            discount, 
            total_amount, 
            notes, 
            created_at,
            updated_at
        ) VALUES (?, ?, ?, ?, ?, '$expectedDelivery', '$status', ?, ?, ?, ?, NOW(), NOW())";

    $stmt = mysqli_prepare($conn, $query);
    if (!$stmt) {
        throw new Exception("Prepare failed: " . mysqli_error($conn));
    }

    // Note: We're not binding expected_delivery or status parameters anymore since they're directly in the query
    mysqli_stmt_bind_param(
        $stmt, 
        "sssssddds", 
        $poNumber, 
        $retailerName, 
        $retailerEmail, 
        $retailerContact, 
        $orderDate,
        $subtotal, 
        $discount, 
        $totalAmount, 
        $notes
    );
    
    if (!mysqli_stmt_execute($stmt)) {
        throw new Exception("Error creating order: " . mysqli_stmt_error($stmt));
    }
    
    $orderId = mysqli_insert_id($conn);
    if (!$orderId) {
        throw new Exception("Failed to get insert ID after creating order");
    }
    
    error_log("Order created with ID: $orderId and status: $status");
    
    // Insert order items
    insertOrderItems($conn, $data['items'], $orderId);
    
    // Insert status history
    insertStatusHistory($conn, $orderId, $status, $notes);
    
    return $orderId;
}

// Replace the entire updateOrder function with this updated version
function updateOrder($conn, $data, $orderId) {
    // Force a specific status value for debugging
    $status = 'order'; // Hardcoded default status
    
    // Try to get status from the data if available
    if (isset($data['status']) && !empty($data['status'])) {
        $status = $data['status'];
        error_log("Using status from data: " . $status);
    } else if (isset($data['targetStatus']) && !empty($data['targetStatus'])) {
        $status = $data['targetStatus'];
        error_log("Using targetStatus: " . $status);
    }
    
    error_log("FINAL STATUS TO UPDATE: " . $status);
    
    // Prepare order data
    $retailerName = $data['retailer_name'];
    $retailerEmail = $data['retailer_email'];
    $retailerContact = $data['retailer_contact'];
    
    // Add explicit debugging for expected delivery date
    $expectedDeliveryValue = isset($data['expected_delivery']) ? $data['expected_delivery'] : 'NOT SET';
    error_log("Expected delivery value received: " . $expectedDeliveryValue);
    
    $orderDate = $data['order_date'];
    
    $expectedDelivery = !empty($data['expected_delivery']) ? $data['expected_delivery'] : date('Y-m-d', strtotime('+7 days'));
    // Validate date format
    if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $expectedDelivery)) {
        error_log("Invalid expected delivery date format: $expectedDelivery - reformatting");
        // Try to reformat or default to a week from now
        $parsedDate = strtotime($expectedDelivery);
        if ($parsedDate) {
            $expectedDelivery = date('Y-m-d', $parsedDate);
        } else {
            $expectedDelivery = date('Y-m-d', strtotime('+7 days'));
        }
    }
    error_log("Final expected delivery date to be updated: " . $expectedDelivery);
    
    $subtotal = $data['subtotal'];
    $discount = $data['discount'];
    $totalAmount = $subtotal - $discount;
    $notes = isset($data['notes']) ? $data['notes'] : '';
    
    // Direct SQL query with explicit status value
    $query = "UPDATE retailer_orders SET 
            retailer_name = ?, 
            retailer_email = ?, 
            retailer_contact = ?, 
            order_date = ?, 
            expected_delivery = '$expectedDelivery', 
            status = '$status', 
            subtotal = ?, 
            discount = ?, 
            total_amount = ?, 
            notes = ?,
            updated_at = NOW()
        WHERE order_id = ?";

    $stmt = mysqli_prepare($conn, $query);
    if (!$stmt) {
        throw new Exception("Prepare failed: " . mysqli_error($conn));
    }

    // Note: We're not binding expected_delivery or status parameters anymore
    mysqli_stmt_bind_param(
        $stmt, 
        "ssssdddssi", 
        $retailerName, 
        $retailerEmail, 
        $retailerContact, 
        $orderDate,
        $subtotal, 
        $discount, 
        $totalAmount, 
        $notes,
        $orderId
    );
    
    if (!mysqli_stmt_execute($stmt)) {
        throw new Exception("Error updating order: " . mysqli_stmt_error($stmt));
    }
    
    // Delete existing order items
    $deleteQuery = "DELETE FROM retailer_order_items WHERE order_id = ?";
    $deleteStmt = mysqli_prepare($conn, $deleteQuery);
    mysqli_stmt_bind_param($deleteStmt, "i", $orderId);
    
    if (!mysqli_stmt_execute($deleteStmt)) {
        throw new Exception("Error deleting order items: " . mysqli_stmt_error($deleteStmt));
    }
    
    // Insert new order items
    insertOrderItems($conn, $data['items'], $orderId);
    
    // Insert status history
    insertStatusHistory($conn, $orderId, $status, $notes);
    
    return true;
}

// Function to insert order items
function insertOrderItems($conn, $items, $orderId) {
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
        
        error_log("Saving order item - Order ID: $orderId, Product ID: $productId, Quantity: $quantity, Unit Price: $unitPrice");
        
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
        
        mysqli_stmt_bind_param($stmt, "ssidd", $orderId, $productId, $quantity, $unitPrice, $totalPrice);
        
        if (!mysqli_stmt_execute($stmt)) {
            throw new Exception("Error adding order item: " . mysqli_stmt_error($stmt));
        }
    }
}

// Function to insert status history
function insertStatusHistory($conn, $orderId, $status, $notes = '') {
    error_log("Inserting status history for order ID: $orderId, Status: $status");
    
    $query = "INSERT INTO retailer_order_status_history (order_id, status, notes, created_at) VALUES (?, ?, ?, NOW())";
    $stmt = mysqli_prepare($conn, $query);
    if (!$stmt) {
        throw new Exception("Prepare failed for status history: " . mysqli_error($conn));
    }
    
    mysqli_stmt_bind_param($stmt, "iss", $orderId, $status, $notes);
    
    if (!mysqli_stmt_execute($stmt)) {
        throw new Exception("Error adding status history: " . mysqli_stmt_error($stmt));
    }
}
?>
