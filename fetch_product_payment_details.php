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
$response = [
    'success' => false, 
    'message' => '', 
    'paid_products' => [],
    'unsold_products' => [],
    'payments' => []
];

// Get request data
$data = json_decode(file_get_contents('php://input'), true);
$order_id = isset($data['order_id']) ? intval($data['order_id']) : 0;

try {
    // Validate input
    if (!$order_id) {
        throw new Exception("Order ID is required");
    }
    
    // Get all order items
    $itemsQuery = "SELECT oi.item_id, oi.product_id, p.product_name, oi.quantity, oi.unit_price, oi.total_price
                  FROM retailer_order_items oi 
                  LEFT JOIN products p ON oi.product_id = p.product_id
                  WHERE oi.order_id = ?";
    
    $itemsStmt = $conn->prepare($itemsQuery);
    
    if (!$itemsStmt) {
        throw new Exception("Prepare failed for items query: " . $conn->error);
    }
    
    $itemsStmt->bind_param("i", $order_id);
    
    if (!$itemsStmt->execute()) {
        throw new Exception("Execute failed for items query: " . $itemsStmt->error);
    }
    
    $itemsResult = $itemsStmt->get_result();
    
    $orderItems = [];
    while ($row = $itemsResult->fetch_assoc()) {
        $orderItems[$row['item_id']] = $row;
        // Initialize quantities
        $orderItems[$row['item_id']]['quantity_paid'] = 0;
        $orderItems[$row['item_id']]['quantity_unsold'] = $row['quantity'];
    }
    
    // Get paid quantities from item payments
    $paymentsQuery = "SELECT ip.item_id, ip.product_id, SUM(ip.quantity_paid) as total_paid, 
                     SUM(ip.quantity_unsold) as total_unsold
                     FROM retailer_order_item_payments ip
                     WHERE ip.item_id IN (SELECT item_id FROM retailer_order_items WHERE order_id = ?)
                     GROUP BY ip.item_id, ip.product_id";
    
    $paymentsStmt = $conn->prepare($paymentsQuery);
    
    if (!$paymentsStmt) {
        throw new Exception("Prepare failed for payments query: " . $conn->error);
    }
    
    $paymentsStmt->bind_param("i", $order_id);
    
    if (!$paymentsStmt->execute()) {
        throw new Exception("Execute failed for payments query: " . $paymentsStmt->error);
    }
    
    $paymentsResult = $paymentsStmt->get_result();
    
    // Update quantities based on payments
    while ($row = $paymentsResult->fetch_assoc()) {
        if (isset($orderItems[$row['item_id']])) {
            $orderItems[$row['item_id']]['quantity_paid'] = $row['total_paid'];
            $orderItems[$row['item_id']]['quantity_unsold'] = $row['total_unsold'];
        }
    }
    
    // Separate paid and unsold products
    $paidProducts = [];
    $unsoldProducts = [];
    
    foreach ($orderItems as $item) {
        if ($item['quantity_paid'] > 0) {
            $paidProducts[] = $item;
        }
        
        if ($item['quantity_unsold'] > 0) {
            $unsoldProducts[] = $item;
        }
    }
    
    // Fetch payment_method and payment_reference from retailer_order_payments table
    $paymentDetailsQuery = "SELECT payment_method, payment_reference FROM retailer_order_payments WHERE order_id = ?";
    $paymentDetailsStmt = $conn->prepare($paymentDetailsQuery);
    $paymentDetailsStmt->bind_param('i', $order_id);
    $paymentDetailsStmt->execute();
    $paymentDetailsResult = $paymentDetailsStmt->get_result();

    $payments = [];
    while ($row = $paymentDetailsResult->fetch_assoc()) {
        $payments[] = $row;
    }

    $response['success'] = true;
    $response['paid_products'] = $paidProducts;
    $response['unsold_products'] = $unsoldProducts;
    $response['payments'] = $payments;
    
} catch (Exception $e) {
    $response['message'] = "Error: " . $e->getMessage();
    error_log("Error fetching product payment details: " . $e->getMessage());
}

echo json_encode($response);
?>