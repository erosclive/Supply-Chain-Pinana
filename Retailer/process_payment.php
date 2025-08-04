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

// Get request data - handle both JSON and form data
$input = file_get_contents('php://input');
$isJson = false;

// Check if input is JSON
if ($input && substr($input, 0, 1) === '{') {
    $isJson = true;
    $data = json_decode($input, true);
    
    // Log the received data for debugging
    error_log("Received payment data: " . print_r($data, true));
} else {
    $data = $_POST;
}

// Check if user is logged in
$user_id = isset($_SESSION['user_id']) ? $_SESSION['user_id'] : null;

if (!$user_id) {
    $response['message'] = 'User not logged in';
    echo json_encode($response);
    exit;
}

// Extract payment details from request data
$order_id = $isJson ? intval($data['orderId']) : intval($data['order_id']);
$payment_method = $isJson ? $data['paymentMethod'] : $data['payment_method'];
$payment_amount = $isJson ? floatval($data['totalPaymentAmount']) : floatval($data['payment_amount']);

// Handle payment reference based on payment method
$payment_reference = '';
if ($payment_method === 'mobile') {
    $payment_reference = $isJson ? $data['paymentReference'] : (isset($data['payment_reference']) ? $data['payment_reference'] : '');
} else {
    // For cash payments, generate a reference number
    $payment_reference = 'CASH-' . date('YmdHis');
}

// Set payment notes
$payment_notes = '';
if ($isJson && isset($data['paymentNotes'])) {
    $payment_notes = $data['paymentNotes'];
} elseif (isset($data['payment_notes'])) {
    $payment_notes = $data['payment_notes'];
} else {
    $payment_notes = $payment_method === 'mobile' ? 'Mobile payment' : 'Cash payment';
}

// Get items to be paid
$items_to_pay = [];
if ($isJson && isset($data['payQuantities'])) {
    foreach ($data['payQuantities'] as $item) {
        if (isset($item['productId']) && isset($item['quantity']) && $item['quantity'] > 0) {
            $item_data = [
                'product_id' => $item['productId'],
                'quantity' => intval($item['quantity'])
            ];
            
            // Include unsold quantity if provided
            if (isset($item['unsoldQuantity'])) {
                $item_data['unsold_quantity'] = intval($item['unsoldQuantity']);
            }
            
            $items_to_pay[] = $item_data;
        }
    }
    
    // Log the items to pay for debugging
    error_log("Items to pay: " . print_r($items_to_pay, true));
} elseif (isset($data['items'])) {
    $items_to_pay = $isJson ? $data['items'] : json_decode($data['items'], true);
}

try {
    // Start transaction
    $conn->begin_transaction();

    // 1. Check if order exists and belongs to the current user
    $orderQuery = "SELECT o.*, u.email 
                  FROM retailer_orders o 
                  JOIN users u ON u.id = ? 
                  WHERE o.order_id = ? 
                  AND o.retailer_email = u.email";
    
    $orderStmt = $conn->prepare($orderQuery);
    $orderStmt->bind_param("ii", $user_id, $order_id);
    $orderStmt->execute();
    $orderResult = $orderStmt->get_result();
    
    if ($orderResult->num_rows === 0) {
        throw new Exception("Order not found or does not belong to current user");
    }
    
    $order = $orderResult->fetch_assoc();
    
    // 2. Create payment record
    $paymentQuery = "INSERT INTO retailer_order_payments 
                    (order_id, payment_method, payment_amount, payment_reference, payment_notes, created_at) 
                    VALUES (?, ?, ?, ?, ?, NOW())";
    
    $paymentStmt = $conn->prepare($paymentQuery);
    $paymentStmt->bind_param("isdss", $order_id, $payment_method, $payment_amount, $payment_reference, $payment_notes);
    
    if (!$paymentStmt->execute()) {
        throw new Exception("Failed to create payment record: " . $paymentStmt->error);
    }
    
    $payment_id = $conn->insert_id;
    error_log("Created payment record with ID: " . $payment_id);
    
    // 3. Update order payment status to "Partial" instead of "paid"
    $updateOrderQuery = "UPDATE retailer_orders 
                        SET payment_status = 'Partial', 
                            updated_at = NOW() 
                        WHERE order_id = ?";
    
    $updateOrderStmt = $conn->prepare($updateOrderQuery);
    $updateOrderStmt->bind_param("i", $order_id);
    
    if (!$updateOrderStmt->execute()) {
        throw new Exception("Failed to update order payment status: " . $updateOrderStmt->error);
    }
    
    // 4. Add order status history entry with "Partial" payment status
    $historyQuery = "INSERT INTO retailer_order_status_history 
                    (order_id, status, notes, created_at) 
                    VALUES (?, 'Partial', ?, NOW())";

    $historyNotes = "Partial payment made via " . ucfirst($payment_method) . 
                   ". Amount: ₱" . number_format($payment_amount, 2) . 
                   ($payment_reference ? ". Reference: " . $payment_reference : "");
    
    $historyStmt = $conn->prepare($historyQuery);
    $historyStmt->bind_param("is", $order_id, $historyNotes);
    
    if (!$historyStmt->execute()) {
        throw new Exception("Failed to add status history: " . $historyStmt->error);
    }
    
    // 5. If items are specified, record which items were paid
    if (!empty($items_to_pay)) {
        // Get order items to match with product IDs
        $orderItemsQuery = "SELECT item_id, product_id, quantity FROM retailer_order_items WHERE order_id = ?";
        $orderItemsStmt = $conn->prepare($orderItemsQuery);
        $orderItemsStmt->bind_param("i", $order_id);
        $orderItemsStmt->execute();
        $orderItemsResult = $orderItemsStmt->get_result();
        
        $orderItems = [];
        while ($item = $orderItemsResult->fetch_assoc()) {
            $orderItems[$item['product_id']] = $item;
        }
        
        error_log("Order items found: " . print_r($orderItems, true));
        
        // Insert item payments
        $itemPaymentQuery = "INSERT INTO retailer_order_item_payments 
                            (payment_id, item_id, product_id, quantity_paid, quantity_unsold, created_at) 
                            VALUES (?, ?, ?, ?, ?, NOW())";
        
        $itemPaymentStmt = $conn->prepare($itemPaymentQuery);
        
        foreach ($items_to_pay as $item) {
            $product_id = $isJson ? $item['product_id'] : $item['product_id'];
            $quantity_paid = intval($isJson ? $item['quantity'] : $item['quantity']);
            
            // Skip if quantity is zero
            if ($quantity_paid <= 0) continue;
            
            // Find matching order item
            if (isset($orderItems[$product_id])) {
                $item_id = $orderItems[$product_id]['item_id'];
                $total_quantity = $orderItems[$product_id]['quantity'];
                
                // Calculate unsold quantity (use provided value if available, otherwise calculate)
                $quantity_unsold = isset($item['unsold_quantity']) ? 
                    $item['unsold_quantity'] : 
                    ($total_quantity - $quantity_paid);
                
                error_log("Inserting item payment: payment_id=$payment_id, item_id=$item_id, product_id=$product_id, quantity_paid=$quantity_paid, quantity_unsold=$quantity_unsold");
                
                $itemPaymentStmt->bind_param("iisii", $payment_id, $item_id, $product_id, $quantity_paid, $quantity_unsold);
                
                if (!$itemPaymentStmt->execute()) {
                    throw new Exception("Failed to record item payment: " . $itemPaymentStmt->error);
                }
            } else {
                error_log("Product ID $product_id not found in order items");
            }
        }
    } else {
        error_log("No items to pay specified");
    }
    
    // Commit transaction
    $conn->commit();
    
    $response['success'] = true;
    $response['message'] = "Payment request processed successfully";
    $response['payment_id'] = $payment_id;
    
} catch (Exception $e) {
    // Rollback transaction on error
    $conn->rollback();
    
    $response['message'] = "Error: " . $e->getMessage();
    error_log("Payment processing error: " . $e->getMessage());
}

echo json_encode($response);
?>
