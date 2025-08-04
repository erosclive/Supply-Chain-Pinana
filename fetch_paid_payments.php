<?php
// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Include database connection
require_once 'db_connection.php';

// Set header to return JSON
header('Content-Type: application/json');

// Initialize response array
$response = ['success' => false, 'message' => '', 'orders' => []];

try {
  // Modified query to avoid joining with the non-existent retailers table
  // Instead, we'll get retailer information directly from the retailer_orders table
  $query = "SELECT 
              ro.*
            FROM 
              retailer_orders ro
            WHERE 
              ro.status = 'completed' 
              AND ro.payment_status = 'paid'
            ORDER BY 
              ro.order_date DESC";
  
  $stmt = $conn->prepare($query);
  
  if (!$stmt) {
      throw new Exception("Prepare failed for orders query: " . $conn->error);
  }
  
  if (!$stmt->execute()) {
      throw new Exception("Execute failed for orders query: " . $stmt->error);
  }
  
  $result = $stmt->get_result();
  $orders = [];
  
  while ($order = $result->fetch_assoc()) {
      // Get payment details for this order
      $paymentQuery = "SELECT * 
                      FROM retailer_order_payments 
                      WHERE order_id = ? 
                      ORDER BY created_at DESC";
      
      $paymentStmt = $conn->prepare($paymentQuery);
      
      if (!$paymentStmt) {
          throw new Exception("Prepare failed for payments query: " . $conn->error);
      }
      
      $paymentStmt->bind_param("i", $order['order_id']);
      
      if (!$paymentStmt->execute()) {
          throw new Exception("Execute failed for payments query: " . $paymentStmt->error);
      }
      
      $paymentResult = $paymentStmt->get_result();
      $payments = [];
      
      while ($payment = $paymentResult->fetch_assoc()) {
          $payments[] = $payment;
      }
      
      $order['payments'] = $payments;
      
      // Get order items
      $itemsQuery = "SELECT 
                      roi.*,
                      p.product_name 
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
      
      $itemsStmt->bind_param("i", $order['order_id']);
      
      if (!$itemsStmt->execute()) {
          throw new Exception("Execute failed for items query: " . $itemsStmt->error);
      }
      
      $itemsResult = $itemsStmt->get_result();
      $items = [];
      
      while ($item = $itemsResult->fetch_assoc()) {
          $items[] = $item;
      }
      
      $order['items'] = $items;
      
      // Get item payment details
      $itemPaymentsQuery = "SELECT 
                              roip.*,
                              rop.payment_method,
                              rop.payment_reference,
                              p.product_name
                            FROM 
                              retailer_order_item_payments roip
                            JOIN 
                              retailer_order_payments rop ON roip.payment_id = rop.payment_id
                            JOIN 
                              products p ON roip.product_id = p.product_id
                            WHERE 
                              rop.order_id = ?";
      
      $itemPaymentsStmt = $conn->prepare($itemPaymentsQuery);
      
      if (!$itemPaymentsStmt) {
          throw new Exception("Prepare failed for item payments query: " . $conn->error);
      }
      
      $itemPaymentsStmt->bind_param("i", $order['order_id']);
      
      if (!$itemPaymentsStmt->execute()) {
          throw new Exception("Execute failed for item payments query: " . $itemPaymentsStmt->error);
      }
      
      $itemPaymentsResult = $itemPaymentsStmt->get_result();
      $itemPayments = [];
      
      while ($itemPayment = $itemPaymentsResult->fetch_assoc()) {
          $itemPayments[] = $itemPayment;
      }
      
      $order['item_payments'] = $itemPayments;
      
      // Add default retailer information if not available
      if (!isset($order['retailer_name'])) {
          $order['retailer_name'] = "Retailer #" . $order['retailer_id'];
          $order['retailer_email'] = "N/A";
          $order['retailer_contact'] = "N/A";
      }
      
      $orders[] = $order;
  }
  
  $response['success'] = true;
  $response['orders'] = $orders;
  $response['count'] = count($orders);

} catch (Exception $e) {
  $response['message'] = "Error: " . $e->getMessage();
  error_log("Error fetching paid retailer orders: " . $e->getMessage());
}

echo json_encode($response);
?>