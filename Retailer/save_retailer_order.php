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

try {
    // Get JSON data from request
    $jsonData = file_get_contents('php://input');
    $data = json_decode($jsonData, true);
    
    // Log the received data for debugging
    error_log("Received order data in save_retailer_order.php: " . $jsonData);
    
    if (!$data) {
        throw new Exception("Invalid data format: " . json_last_error_msg());
    }
    
    // Validate required fields
    if (!isset($data['retailer_name']) || !isset($data['retailer_email']) || !isset($data['order_date'])) {
        throw new Exception("Missing required fields");
    }
    
    // Start transaction
    $conn->begin_transaction();
    
    // Check if this is an update (order_id is provided) or a new order
    $isUpdate = isset($data['order_id']) && !empty($data['order_id']);
    
    if ($isUpdate) {
        // Update existing order
        $updateQuery = "UPDATE retailer_orders SET 
                        retailer_name = ?,
                        retailer_email = ?,
                        retailer_contact = ?,
                        order_date = ?,
                        expected_delivery = ?,
                        delivery_mode = ?,
                        pickup_location = ?,
                        pickup_date = ?,
                        notes = ?,
                        status = ?,
                        subtotal = ?,
                        discount = ?,
                        total_amount = ?,
                        consignment_term = ?,
                        updated_at = NOW()
                        WHERE order_id = ?";
        
        $stmt = $conn->prepare($updateQuery);
        
        if (!$stmt) {
            throw new Exception("Prepare failed for update query: " . $conn->error);
        }
        
        // Set parameters
        $retailerName = $data['retailer_name'];
        $retailerEmail = $data['retailer_email'];
        $retailerContact = isset($data['retailer_contact']) ? $data['retailer_contact'] : '';
        $orderDate = $data['order_date'];
        $expectedDelivery = isset($data['expected_delivery']) ? $data['expected_delivery'] : null;
        $deliveryMode = isset($data['delivery_mode']) ? $data['delivery_mode'] : 'delivery';
        $pickupLocation = isset($data['pickup_location']) ? $data['pickup_location'] : '';
        $pickupDate = isset($data['pickup_date']) ? $data['pickup_date'] : null;
        $notes = isset($data['notes']) ? $data['notes'] : '';
        $status = isset($data['status']) ? $data['status'] : 'order';
        $subtotal = isset($data['subtotal']) ? $data['subtotal'] : 0;
        $discount = isset($data['discount']) ? $data['discount'] : 0;
        $totalAmount = isset($data['total_amount']) ? $data['total_amount'] : 0;
        $consignmentTerm = isset($data['consignment_term']) ? $data['consignment_term'] : 30;
        $orderId = $data['order_id'];
        
        // Debug log
        error_log("Updating order with ID: $orderId, Delivery Mode: $deliveryMode, Consignment Term: $consignmentTerm");
        
        // Validate date formats
        if ($expectedDelivery && !preg_match('/^\d{4}-\d{2}-\d{2}$/', $expectedDelivery)) {
            $parsedDate = strtotime($expectedDelivery);
            if ($parsedDate) {
                $expectedDelivery = date('Y-m-d', $parsedDate);
            } else {
                $expectedDelivery = date('Y-m-d', strtotime('+7 days'));
            }
        }
        
        if ($pickupDate && !preg_match('/^\d{4}-\d{2}-\d{2}$/', $pickupDate)) {
            $parsedDate = strtotime($pickupDate);
            if ($parsedDate) {
                $pickupDate = date('Y-m-d', $parsedDate);
            } else {
                $pickupDate = null;
            }
        }
        
        $stmt->bind_param("ssssssssssdddii", 
            $retailerName, $retailerEmail, $retailerContact, 
            $orderDate, $expectedDelivery, $deliveryMode, $pickupLocation, $pickupDate,
            $notes, $status, $subtotal, $discount, $totalAmount, $consignmentTerm, $orderId);
        
        if (!$stmt->execute()) {
            throw new Exception("Failed to update order: " . $stmt->error);
        }
        
        // Delete existing order items
        $deleteItemsQuery = "DELETE FROM retailer_order_items WHERE order_id = ?";
        $deleteItemsStmt = $conn->prepare($deleteItemsQuery);
        
        if (!$deleteItemsStmt) {
            throw new Exception("Prepare failed for delete items query: " . $conn->error);
        }
        
        $deleteItemsStmt->bind_param("i", $orderId);
        
        if (!$deleteItemsStmt->execute()) {
            throw new Exception("Failed to delete order items: " . $deleteItemsStmt->error);
        }
        
    } else {
        // Generate PO number (format: RO-YYYYMMDD-XXX)
        $today = date('Ymd');
        $poNumberQuery = "SELECT MAX(SUBSTRING_INDEX(po_number, '-', -1)) as last_number 
                         FROM retailer_orders 
                         WHERE po_number LIKE 'RO-$today-%'";
        $result = $conn->query($poNumberQuery);
        
        if (!$result) {
            throw new Exception("Failed to query for PO number: " . $conn->error);
        }
        
        $row = $result->fetch_assoc();
        $lastNumber = $row['last_number'] ? intval($row['last_number']) : 0;
        $newNumber = $lastNumber + 1;
        $poNumber = "RO-$today-" . str_pad($newNumber, 3, '0', STR_PAD_LEFT);
        
        // Insert new order
        $insertQuery = "INSERT INTO retailer_orders (
                        po_number, retailer_name, retailer_email, retailer_contact, 
                        order_date, expected_delivery, delivery_mode,
                        pickup_location, pickup_date, notes, status, subtotal, discount, total_amount,
                        consignment_term, created_at, updated_at
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())";
        
        $stmt = $conn->prepare($insertQuery);
        
        if (!$stmt) {
            throw new Exception("Prepare failed for insert query: " . $conn->error);
        }
        
        // Set parameters
        $retailerName = $data['retailer_name'];
        $retailerEmail = $data['retailer_email'];
        $retailerContact = isset($data['retailer_contact']) ? $data['retailer_contact'] : '';
        $orderDate = $data['order_date'];
        $expectedDelivery = isset($data['expected_delivery']) ? $data['expected_delivery'] : null;
        $deliveryMode = isset($data['delivery_mode']) ? $data['delivery_mode'] : 'delivery';
        $pickupLocation = isset($data['pickup_location']) ? $data['pickup_location'] : '';
        $pickupDate = isset($data['pickup_date']) ? $data['pickup_date'] : null;
        $notes = isset($data['notes']) ? $data['notes'] : '';
        $status = isset($data['status']) ? $data['status'] : 'order';
        $subtotal = isset($data['subtotal']) ? $data['subtotal'] : 0;
        $discount = isset($data['discount']) ? $data['discount'] : 0;
        $totalAmount = isset($data['total_amount']) ? $data['total_amount'] : 0;
        $consignmentTerm = isset($data['consignment_term']) ? $data['consignment_term'] : 30;
        
        // Validate date formats
        if ($expectedDelivery && !preg_match('/^\d{4}-\d{2}-\d{2}$/', $expectedDelivery)) {
            $parsedDate = strtotime($expectedDelivery);
            if ($parsedDate) {
                $expectedDelivery = date('Y-m-d', $parsedDate);
            } else {
                $expectedDelivery = date('Y-m-d', strtotime('+7 days'));
            }
        }
        
        if ($pickupDate && !preg_match('/^\d{4}-\d{2}-\d{2}$/', $pickupDate)) {
            $parsedDate = strtotime($pickupDate);
            if ($parsedDate) {
                $pickupDate = date('Y-m-d', $parsedDate);
            } else {
                $pickupDate = null;
            }
        }
        
        $stmt->bind_param("sssssssssssdddi", 
            $poNumber, $retailerName, $retailerEmail, $retailerContact, 
            $orderDate, $expectedDelivery, $deliveryMode, $pickupLocation, $pickupDate,
            $notes, $status, $subtotal, $discount, $totalAmount, $consignmentTerm);
        
        if (!$stmt->execute()) {
            throw new Exception("Failed to create order: " . $stmt->error);
        }
        
        // Get the new order ID
        $orderId = $conn->insert_id;
        
        if (!$orderId) {
            throw new Exception("Failed to get insert ID after creating order");
        }
        
        // Add initial status history entry
        $historyQuery = "INSERT INTO retailer_order_status_history (order_id, status, notes, created_at) VALUES (?, ?, ?, NOW())";
        $historyStmt = $conn->prepare($historyQuery);
        
        if (!$historyStmt) {
            throw new Exception("Prepare failed for history query: " . $conn->error);
        }
        
        $historyNotes = "Order created";
        $historyStmt->bind_param("iss", $orderId, $status, $historyNotes);
        
        if (!$historyStmt->execute()) {
            throw new Exception("Failed to create status history: " . $historyStmt->error);
        }
    }
    
    // Insert order items
    if (isset($data['items']) && is_array($data['items']) && count($data['items']) > 0) {
        $insertItemQuery = "INSERT INTO retailer_order_items (
                           order_id, product_id, product_name, quantity, unit_price, total_price, created_at
                           ) VALUES (?, ?, ?, ?, ?, ?, NOW())";
        $itemStmt = $conn->prepare($insertItemQuery);
        
        if (!$itemStmt) {
            throw new Exception("Prepare failed for item insert query: " . $conn->error);
        }
        
        foreach ($data['items'] as $item) {
            if (!isset($item['product_id']) || !isset($item['quantity']) || !isset($item['unit_price'])) {
                continue; // Skip invalid items
            }
            
            // Debug log for incoming data
            error_log("Item data: " . print_r($item, true));
            
            $productId = $item['product_id'];
            // Ensure product_id is a string
            if (is_numeric($productId)) {
                $productId = (string)$productId;
            }
            
            // Debug log for product ID
            error_log("Processing product_id: " . $productId . " (type: " . gettype($productId) . ")");
            
            $quantity = intval($item['quantity']);
            $unitPrice = floatval($item['unit_price']);
            $totalPrice = $quantity * $unitPrice;
            
            // Get product name from item or look it up
            $productName = isset($item['product_name']) && !empty($item['product_name']) 
                          ? $item['product_name'] 
                          : getProductName($conn, $productId);
            
            // Force product_id to be treated as a string
            $itemStmt->bind_param("issidd", $orderId, $productId, $productName, $quantity, $unitPrice, $totalPrice);
            
            if (!$itemStmt->execute()) {
                throw new Exception("Failed to insert order item: " . $itemStmt->error . " (Product ID: " . $productId . ")");
            }
            
            // Debug log for successful insertion
            error_log("Successfully inserted item with product_id: " . $productId);
        }
    }
    
    // Commit transaction
    $conn->commit();
    
    $response['success'] = true;
    $response['message'] = $isUpdate ? "Order updated successfully" : "Order created successfully";
    $response['order_id'] = $orderId;
    if (!$isUpdate) {
        $response['po_number'] = $poNumber;
    }
    
} catch (Exception $e) {
    // Rollback transaction on error
    if (isset($conn) && $conn->ping()) {
        $conn->rollback();
    }
    $response['message'] = "Error: " . $e->getMessage();
    error_log("Order save error: " . $e->getMessage());
}

echo json_encode($response);

// Function to get product name from database
function getProductName($conn, $productId) {
    if (empty($productId)) {
        return "Unknown Product";
    }
    
    $query = "SELECT product_name FROM products WHERE product_id = ?";
    $stmt = $conn->prepare($query);
    
    if (!$stmt) {
        error_log("Failed to prepare product name query: " . $conn->error);
        return "Unknown Product";
    }
    
    $stmt->bind_param("s", $productId);
    
    if (!$stmt->execute()) {
        error_log("Failed to execute product name query: " . $stmt->error);
        return "Unknown Product";
    }
    
    $result = $stmt->get_result();
    
    if ($row = $result->fetch_assoc()) {
        return $row['product_name'];
    }
    
    return "Unknown Product";
}
?>
