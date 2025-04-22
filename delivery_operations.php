<?php
// Include database connection
require_once 'db_connection.php';

// Set headers to prevent caching
header('Cache-Control: no-cache, must-revalidate');
header('Expires: Mon, 26 Jul 1997 05:00:00 GMT');
header('Content-Type: application/json');

// Get action from request
$action = isset($_GET['action']) ? $_GET['action'] : (isset($_POST['action']) ? $_POST['action'] : '');

// Handle different actions
switch ($action) {
  case 'get_pending_deliveries':
      getPendingDeliveries();
      break;
  case 'get_active_deliveries':
      getActiveDeliveries();
      break;
  case 'get_completed_deliveries':
      getCompletedDeliveries();
      break;
  case 'get_delivery_issues':
      getDeliveryIssues();
      break;
  case 'mark_order_ready':
      markOrderReady();
      break;
  case 'schedule_delivery':
      scheduleDelivery();
      break;
  case 'update_delivery_status':
      updateDeliveryStatus();
      break;
  case 'get_orders_for_delivery':
      getOrdersForDelivery();
      break;
  case 'get_delivery_details':
      getDeliveryDetails();
      break;
  case 'get_delivery_tracking':
    getDeliveryTracking();
    break;
  case 'report_delivery_issue':
      reportDeliveryIssue();
      break;
  case 'resolve_issue':
      resolveIssue();
      break;
  default:
      echo json_encode(['success' => false, 'message' => 'Invalid action']);
      break;
}

// Function to get pending deliveries (orders with status 'confirmed')
function getPendingDeliveries() {
  global $conn;
  
  $query = "
      SELECT 
          ro.order_id, 
          ro.retailer_name as customer_name, 
          ro.retailer_email as customer_email,
          ro.retailer_contact as customer_phone,
          ro.pickup_location as shipping_address,
          ro.order_date,
          ro.status,
          ro.delivery_mode,
          ro.total_amount,
          (SELECT COUNT(*) FROM retailer_order_items WHERE order_id = ro.order_id) as item_count,
          (SELECT GROUP_CONCAT(p.product_name SEPARATOR ', ') 
           FROM retailer_order_items roi 
           JOIN products p ON roi.product_id = p.product_id 
           WHERE roi.order_id = ro.order_id) as product_list
      FROM retailer_orders ro
      WHERE ro.status = 'confirmed'
      ORDER BY ro.order_date DESC
  ";
  
  $result = mysqli_query($conn, $query);
  
  if (!$result) {
      echo json_encode(['success' => false, 'message' => 'Failed to fetch pending deliveries: ' . mysqli_error($conn)]);
      return;
  }
  
  $deliveries = [];
  while ($row = mysqli_fetch_assoc($result)) {
      // Format the date
      $orderDate = new DateTime($row['order_date']);
      $row['formatted_date'] = $orderDate->format('M d, Y - h:i A');
      
      // Format total amount
      $row['formatted_amount'] = '₱' . number_format((float)$row['total_amount'], 2);
      
      $deliveries[] = $row;
  }
  
  echo json_encode(['success' => true, 'deliveries' => $deliveries]);
}

// Function to get active deliveries (orders with status 'shipped' or 'ready')
function getActiveDeliveries() {
  global $conn;
  
  $query = "
      SELECT 
          ro.order_id, 
          ro.retailer_name as customer_name, 
          ro.retailer_email as customer_email,
          ro.retailer_contact as customer_phone,
          ro.pickup_location as shipping_address,
          ro.order_date,
          ro.status,
          ro.delivery_mode,
          ro.total_amount,
          d.estimated_delivery_time,
          d.delivery_notes,
          d.driver_id,
          (SELECT COUNT(*) FROM retailer_order_items WHERE order_id = ro.order_id) as item_count,
          (SELECT GROUP_CONCAT(p.product_name SEPARATOR ', ') 
           FROM retailer_order_items roi 
           JOIN products p ON roi.product_id = p.product_id 
           WHERE roi.order_id = ro.order_id) as product_list
      FROM retailer_orders ro
      LEFT JOIN deliveries d ON ro.order_id = d.order_id
      WHERE ro.status IN ('shipped', 'ready')
      ORDER BY d.estimated_delivery_time ASC
  ";
  
  $result = mysqli_query($conn, $query);
  
  if (!$result) {
      echo json_encode(['success' => false, 'message' => 'Failed to fetch active deliveries: ' . mysqli_error($conn)]);
      return;
  }
  
  $deliveries = [];
  while ($row = mysqli_fetch_assoc($result)) {
      // Format the estimated delivery time
      if (!empty($row['estimated_delivery_time'])) {
          $estimatedTime = new DateTime($row['estimated_delivery_time']);
          $row['formatted_eta'] = $estimatedTime->format('M d, Y - h:i A');
      } else {
          $row['formatted_eta'] = 'Not specified';
      }
      
      // Format order date
      $orderDate = new DateTime($row['order_date']);
      $row['formatted_date'] = $orderDate->format('M d, Y - h:i A');
      
      // Format total amount
      $row['formatted_amount'] = '₱' . number_format((float)$row['total_amount'], 2);
      
      $deliveries[] = $row;
  }
  
  echo json_encode(['success' => true, 'deliveries' => $deliveries]);
}

// Function to get completed deliveries (orders with status 'delivered' or 'picked up')
function getCompletedDeliveries() {
  global $conn;
  
  $query = "
      SELECT 
          ro.order_id, 
          ro.retailer_name as customer_name, 
          ro.retailer_email as customer_email,
          ro.retailer_contact as customer_phone,
          ro.pickup_location as shipping_address,
          ro.order_date,
          ro.status,
          ro.delivery_mode,
          ro.total_amount,
          d.actual_delivery_time,
          d.rating,
          d.feedback,
          (SELECT COUNT(*) FROM retailer_order_items WHERE order_id = ro.order_id) as item_count,
          (SELECT GROUP_CONCAT(p.product_name SEPARATOR ', ') 
           FROM retailer_order_items roi 
           JOIN products p ON roi.product_id = p.product_id 
           WHERE roi.order_id = ro.order_id) as product_list
      FROM retailer_orders ro
      LEFT JOIN deliveries d ON ro.order_id = d.order_id
      WHERE ro.status IN ('delivered', 'picked up')
      ORDER BY COALESCE(d.actual_delivery_time, ro.updated_at) DESC
      LIMIT 50
  ";
  
  $result = mysqli_query($conn, $query);
  
  if (!$result) {
      echo json_encode(['success' => false, 'message' => 'Failed to fetch completed deliveries: ' . mysqli_error($conn)]);
      return;
  }
  
  $deliveries = [];
  while ($row = mysqli_fetch_assoc($result)) {
      // Format the delivery time
      if (!empty($row['actual_delivery_time'])) {
          $deliveryTimeObj = new DateTime($row['actual_delivery_time']);
          $row['formatted_delivery_time'] = $deliveryTimeObj->format('M d, Y - h:i A');
      } else {
          $row['formatted_delivery_time'] = date('M d, Y - h:i A', strtotime($row['order_date'] . ' +1 day'));
      }
      
      // Format order date
      $orderDate = new DateTime($row['order_date']);
      $row['formatted_date'] = $orderDate->format('M d, Y - h:i A');
      
      // Format total amount
      $row['formatted_amount'] = '₱' . number_format((float)$row['total_amount'], 2);
      
      // Default rating if not set
      if (empty($row['rating'])) {
          $row['rating'] = 0;
      }
      
      $deliveries[] = $row;
  }
  
  echo json_encode(['success' => true, 'deliveries' => $deliveries]);
}

// Function to get delivery issues
function getDeliveryIssues() {
  global $conn;
  
  // Check if delivery_issues table exists, create if not
  $checkIssuesTableQuery = "SHOW TABLES LIKE 'delivery_issues'";
  $issuesTableResult = mysqli_query($conn, $checkIssuesTableQuery);
  
  if (mysqli_num_rows($issuesTableResult) === 0) {
      // Create delivery_issues table
      $createIssuesTableQuery = "
          CREATE TABLE delivery_issues (
              issue_id INT AUTO_INCREMENT PRIMARY KEY,
              order_id VARCHAR(20) NOT NULL,
              issue_type ENUM('delay', 'damage', 'wrong_item', 'missing_item', 'other') NOT NULL,
              description TEXT,
              status ENUM('reported', 'investigating', 'resolved') NOT NULL DEFAULT 'reported',
              reported_at DATETIME NOT NULL,
              resolved_at DATETIME,
              resolution TEXT,
              INDEX (order_id)
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      ";
      
      $createIssuesResult = mysqli_query($conn, $createIssuesTableQuery);
      
      if (!$createIssuesResult) {
          echo json_encode(['success' => false, 'message' => 'Failed to create delivery_issues table: ' . mysqli_error($conn)]);
          return;
      }
  }
  
  $query = "
      SELECT 
          di.issue_id,
          di.order_id,
          ro.retailer_name as customer_name,
          ro.retailer_email as customer_email,
          ro.retailer_contact as customer_phone,
          di.issue_type,
          di.description,
          di.reported_at,
          di.status,
          di.resolved_at,
          di.resolution,
          ro.total_amount
      FROM delivery_issues di
      JOIN retailer_orders ro ON di.order_id = ro.order_id
      ORDER BY 
          CASE 
              WHEN di.status = 'reported' THEN 1
              WHEN di.status = 'investigating' THEN 2
              WHEN di.status = 'resolved' THEN 3
          END,
          di.reported_at DESC
  ";
  
  $result = mysqli_query($conn, $query);
  
  if (!$result) {
      echo json_encode(['success' => false, 'message' => 'Failed to fetch delivery issues: ' . mysqli_error($conn)]);
      return;
  }
  
  $issues = [];
  while ($row = mysqli_fetch_assoc($result)) {
      // Format the reported time
      if (!empty($row['reported_at'])) {
          $reportedTime = new DateTime($row['reported_at']);
          $row['formatted_reported_at'] = $reportedTime->format('M d, Y - h:i A');
      } else {
          $row['formatted_reported_at'] = 'Unknown';
      }
      
      // Format the resolved time if available
      if (!empty($row['resolved_at'])) {
          $resolvedTime = new DateTime($row['resolved_at']);
          $row['formatted_resolved_at'] = $resolvedTime->format('M d, Y - h:i A');
      } else {
          $row['formatted_resolved_at'] = 'Not resolved';
      }
      
      // Format total amount
      $row['formatted_amount'] = '₱' . number_format((float)$row['total_amount'], 2);
      
      $issues[] = $row;
  }
  
  echo json_encode(['success' => true, 'issues' => $issues]);
}

// Function to mark an order as ready for delivery
function markOrderReady() {
  global $conn;
  
  // Start transaction
  mysqli_begin_transaction($conn);
  
  try {
      // Get form data
      $orderId = $_POST['order_id'] ?? '';
      $estimatedTime = $_POST['estimated_time'] ?? '';
      $deliveryNotes = $_POST['delivery_notes'] ?? '';
      $driverId = $_POST['driver_id'] ?? '';
      $notifyCustomer = isset($_POST['notify_customer']) ? (int)$_POST['notify_customer'] : 0;
      
      // Validate required fields
      if (empty($orderId)) {
          throw new Exception('Order ID is required');
      }
      
      // Check if order exists and is in a valid state
      $checkQuery = "SELECT status, retailer_name, retailer_email, delivery_mode FROM retailer_orders WHERE order_id = ?";
      $stmt = mysqli_prepare($conn, $checkQuery);
      mysqli_stmt_bind_param($stmt, 's', $orderId);
      mysqli_stmt_execute($stmt);
      $checkResult = mysqli_stmt_get_result($stmt);
      
      if (mysqli_num_rows($checkResult) === 0) {
          throw new Exception('Order not found');
      }
      
      $orderData = mysqli_fetch_assoc($checkResult);
      $currentStatus = $orderData['status'];
      $customerName = $orderData['retailer_name'];
      $customerEmail = $orderData['retailer_email'];
      $deliveryMode = $orderData['delivery_mode'];
      
      // Only allow confirmed orders to be marked as ready
      if ($currentStatus !== 'confirmed') {
          throw new Exception('Order is not in a valid state to be marked as ready');
      }
      
      // Set the appropriate status based on delivery mode
      $newStatus = ($deliveryMode === 'pickup') ? 'ready' : 'shipped';
      
      // Update order status
      $updateOrderQuery = "
          UPDATE retailer_orders 
          SET status = ?, updated_at = NOW() 
          WHERE order_id = ?
      ";
      
      $stmt = mysqli_prepare($conn, $updateOrderQuery);
      mysqli_stmt_bind_param($stmt, 'ss', $newStatus, $orderId);
      $updateResult = mysqli_stmt_execute($stmt);
      
      if (!$updateResult) {
          throw new Exception('Failed to update order status: ' . mysqli_error($conn));
      }
      
      // Add status history
      $historyQuery = "
          INSERT INTO retailer_order_status_history (order_id, status, notes, created_at)
          VALUES (?, ?, ?, NOW())
      ";
      
      $notes = "Order marked as " . ($deliveryMode === 'pickup' ? 'ready for pickup' : 'shipped');
      if (!empty($deliveryNotes)) {
          $notes .= ". Notes: " . $deliveryNotes;
      }
      
      $stmt = mysqli_prepare($conn, $historyQuery);
      mysqli_stmt_bind_param($stmt, 'sss', $orderId, $newStatus, $notes);
      $historyResult = mysqli_stmt_execute($stmt);
      
      if (!$historyResult) {
          throw new Exception('Failed to add status history: ' . mysqli_error($conn));
      }
      
      // Check if deliveries table exists, create if not
      $checkTableQuery = "SHOW TABLES LIKE 'deliveries'";
      $tableResult = mysqli_query($conn, $checkTableQuery);
      
      if (mysqli_num_rows($tableResult) === 0) {
          // Create deliveries table
          $createTableQuery = "
              CREATE TABLE deliveries (
                  delivery_id INT AUTO_INCREMENT PRIMARY KEY,
                  order_id VARCHAR(20) NOT NULL,
                  estimated_delivery_time DATETIME,
                  actual_delivery_time DATETIME,
                  delivery_notes TEXT,
                  driver_id VARCHAR(20),
                  rating INT,
                  feedback TEXT,
                  created_at DATETIME NOT NULL,
                  updated_at DATETIME NOT NULL,
                  INDEX (order_id)
              ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
          ";
          
          $createResult = mysqli_query($conn, $createTableQuery);
          
          if (!$createResult) {
              throw new Exception('Failed to create deliveries table: ' . mysqli_error($conn));
          }
      }
      
      // Add or update delivery record
      $checkDeliveryQuery = "SELECT delivery_id FROM deliveries WHERE order_id = ?";
      $stmt = mysqli_prepare($conn, $checkDeliveryQuery);
      mysqli_stmt_bind_param($stmt, 's', $orderId);
      mysqli_stmt_execute($stmt);
      $deliveryResult = mysqli_stmt_get_result($stmt);
      
      if (mysqli_num_rows($deliveryResult) === 0) {
          // Insert new delivery record
          $insertDeliveryQuery = "
              INSERT INTO deliveries (
                  order_id, 
                  estimated_delivery_time, 
                  delivery_notes,
                  driver_id,
                  created_at, 
                  updated_at
              ) VALUES (?, ?, ?, ?, NOW(), NOW())
          ";
          
          $stmt = mysqli_prepare($conn, $insertDeliveryQuery);
          mysqli_stmt_bind_param($stmt, 'ssss', $orderId, $estimatedTime, $deliveryNotes, $driverId);
          $insertResult = mysqli_stmt_execute($stmt);
          
          if (!$insertResult) {
              throw new Exception('Failed to create delivery record: ' . mysqli_error($conn));
          }
      } else {
          // Update existing delivery record
          $updateDeliveryQuery = "
              UPDATE deliveries 
              SET 
                  estimated_delivery_time = ?, 
                  delivery_notes = ?,
                  driver_id = ?,
                  updated_at = NOW() 
              WHERE order_id = ?
          ";
          
          $stmt = mysqli_prepare($conn, $updateDeliveryQuery);
          mysqli_stmt_bind_param($stmt, 'ssss', $estimatedTime, $deliveryNotes, $driverId, $orderId);
          $updateResult = mysqli_stmt_execute($stmt);
          
          if (!$updateResult) {
              throw new Exception('Failed to update delivery record: ' . mysqli_error($conn));
          }
      }
      
      // Notify customer if requested
      if ($notifyCustomer && !empty($customerEmail)) {
          // This would typically send an email to the customer
          // For now, we'll just log it
          error_log("Would notify customer $customerName at $customerEmail about order $orderId being ready for " . ($deliveryMode === 'pickup' ? 'pickup' : 'delivery'));
      }
      
      // Commit transaction
      mysqli_commit($conn);
      
      echo json_encode(['success' => true, 'message' => 'Order marked as ' . ($deliveryMode === 'pickup' ? 'ready for pickup' : 'ready for delivery')]);
  } catch (Exception $e) {
      // Rollback transaction on error
      mysqli_rollback($conn);
      
      echo json_encode(['success' => false, 'message' => $e->getMessage()]);
  }
}

// Function to schedule a delivery
function scheduleDelivery() {
  global $conn;
  
  // Start transaction
  mysqli_begin_transaction($conn);
  
  try {
      // Get form data
      $orderId = $_POST['order_id'] ?? '';
      $deliveryDate = $_POST['delivery_date'] ?? '';
      $timeWindow = $_POST['time_window'] ?? '';
      $driverId = $_POST['driver_id'] ?? '';
      $notes = $_POST['notes'] ?? '';
      $notifyCustomer = isset($_POST['notify_customer']) ? (int)$_POST['notify_customer'] : 0;
      
      // Validate required fields
      if (empty($orderId) || empty($deliveryDate) || empty($timeWindow)) {
          throw new Exception('Required fields are missing');
      }
      
      // Check if order exists
      $checkQuery = "SELECT status, retailer_name, retailer_email, delivery_mode FROM retailer_orders WHERE order_id = ?";
      $stmt = mysqli_prepare($conn, $checkQuery);
      mysqli_stmt_bind_param($stmt, 's', $orderId);
      mysqli_stmt_execute($stmt);
      $checkResult = mysqli_stmt_get_result($stmt);
      
      if (mysqli_num_rows($checkResult) === 0) {
          throw new Exception('Order not found');
      }
      
      $orderData = mysqli_fetch_assoc($checkResult);
      $customerName = $orderData['retailer_name'];
      $customerEmail = $orderData['retailer_email'];
      $deliveryMode = $orderData['delivery_mode'];
      
      // Determine estimated delivery time based on time window
      $estimatedTime = $deliveryDate . ' ';
      switch ($timeWindow) {
          case 'morning':
              $estimatedTime .= '10:00:00'; // Middle of morning window
              break;
          case 'afternoon':
              $estimatedTime .= '14:00:00'; // Middle of afternoon window
              break;
          case 'evening':
              $estimatedTime .= '18:00:00'; // Middle of evening window
              break;
          default:
              $estimatedTime .= '12:00:00'; // Default to noon
      }
      
      // Check if deliveries table exists, create if not
      $checkTableQuery = "SHOW TABLES LIKE 'deliveries'";
      $tableResult = mysqli_query($conn, $checkTableQuery);
      
      if (mysqli_num_rows($tableResult) === 0) {
          // Create deliveries table
          $createTableQuery = "
              CREATE TABLE deliveries (
                  delivery_id INT AUTO_INCREMENT PRIMARY KEY,
                  order_id VARCHAR(20) NOT NULL,
                  estimated_delivery_time DATETIME,
                  actual_delivery_time DATETIME,
                  delivery_notes TEXT,
                  driver_id VARCHAR(20),
                  rating INT,
                  feedback TEXT,
                  created_at DATETIME NOT NULL,
                  updated_at DATETIME NOT NULL,
                  INDEX (order_id)
              ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
          ";
          
          $createResult = mysqli_query($conn, $createTableQuery);
          
          if (!$createResult) {
              throw new Exception('Failed to create deliveries table: ' . mysqli_error($conn));
          }
      }
      
      // Add or update delivery record
      $checkDeliveryQuery = "SELECT delivery_id FROM deliveries WHERE order_id = ?";
      $stmt = mysqli_prepare($conn, $checkDeliveryQuery);
      mysqli_stmt_bind_param($stmt, 's', $orderId);
      mysqli_stmt_execute($stmt);
      $deliveryResult = mysqli_stmt_get_result($stmt);
      
      if (mysqli_num_rows($deliveryResult) === 0) {
          // Insert new delivery record
          $insertDeliveryQuery = "
              INSERT INTO deliveries (
                  order_id, 
                  estimated_delivery_time, 
                  delivery_notes,
                  driver_id,
                  created_at, 
                  updated_at
              ) VALUES (?, ?, ?, ?, NOW(), NOW())
          ";
          
          $stmt = mysqli_prepare($conn, $insertDeliveryQuery);
          mysqli_stmt_bind_param($stmt, 'ssss', $orderId, $estimatedTime, $notes, $driverId);
          $insertResult = mysqli_stmt_execute($stmt);
          
          if (!$insertResult) {
              throw new Exception('Failed to create delivery record: ' . mysqli_error($conn));
          }
      } else {
          // Update existing delivery record
          $updateDeliveryQuery = "
              UPDATE deliveries 
              SET 
                  estimated_delivery_time = ?, 
                  delivery_notes = ?,
                  driver_id = ?,
                  updated_at = NOW() 
              WHERE order_id = ?
          ";
          
          $stmt = mysqli_prepare($conn, $updateDeliveryQuery);
          mysqli_stmt_bind_param($stmt, 'ssss', $estimatedTime, $notes, $driverId, $orderId);
          $updateResult = mysqli_stmt_execute($stmt);
          
          if (!$updateResult) {
              throw new Exception('Failed to update delivery record: ' . mysqli_error($conn));
          }
      }
      
      // Update order status if it's not already shipped/ready
      if ($orderData['status'] !== 'shipped' && $orderData['status'] !== 'ready' && 
          $orderData['status'] !== 'delivered' && $orderData['status'] !== 'picked up') {
          
          // Set the appropriate status based on delivery mode
          $newStatus = ($deliveryMode === 'pickup') ? 'ready' : 'shipped';
          
          $updateOrderQuery = "
              UPDATE retailer_orders 
              SET status = ?, updated_at = NOW() 
              WHERE order_id = ?
          ";
          
          $stmt = mysqli_prepare($conn, $updateOrderQuery);
          mysqli_stmt_bind_param($stmt, 'ss', $newStatus, $orderId);
          $updateResult = mysqli_stmt_execute($stmt);
          
          if (!$updateResult) {
              throw new Exception('Failed to update order status: ' . mysqli_error($conn));
          }
          
          // Add status history
          $historyQuery = "
              INSERT INTO retailer_order_status_history (order_id, status, notes, created_at)
              VALUES (?, ?, ?, NOW())
          ";
          
          $historyNotes = ($deliveryMode === 'pickup') ? 'Scheduled for pickup' : 'Scheduled for delivery';
          $historyNotes .= " on " . date('Y-m-d', strtotime($deliveryDate));
          
          $stmt = mysqli_prepare($conn, $historyQuery);
          mysqli_stmt_bind_param($stmt, 'sss', $orderId, $newStatus, $historyNotes);
          $historyResult = mysqli_stmt_execute($stmt);
          
          if (!$historyResult) {
              throw new Exception('Failed to add status history: ' . mysqli_error($conn));
          }
      }
      
      // Notify customer if requested
      if ($notifyCustomer && !empty($customerEmail)) {
          // This would typically send an email to the customer
          // For now, we'll just log it
          error_log("Would notify customer $customerName at $customerEmail about " . 
                   ($deliveryMode === 'pickup' ? 'pickup' : 'delivery') . 
                   " scheduled for order $orderId on " . date('Y-m-d', strtotime($deliveryDate)));
      }
      
      // Commit transaction
      mysqli_commit($conn);
      
      echo json_encode(['success' => true, 'message' => ($deliveryMode === 'pickup' ? 'Pickup' : 'Delivery') . ' scheduled successfully']);
  } catch (Exception $e) {
      // Rollback transaction on error
      mysqli_rollback($conn);
      
      echo json_encode(['success' => false, 'message' => $e->getMessage()]);
  }
}

// Function to update delivery status
function updateDeliveryStatus() {
  global $conn;
  
  // Start transaction
  mysqli_begin_transaction($conn);
  
  try {
      // Get form data
      $orderId = $_POST['order_id'] ?? '';
      $status = $_POST['status'] ?? '';
      $notes = $_POST['notes'] ?? '';
      $confirmationType = $_POST['confirmation_type'] ?? '';
      $actualDeliveryTime = $_POST['actual_delivery_time'] ?? '';
      $notifyCustomer = isset($_POST['notify_customer']) ? (int)$_POST['notify_customer'] : 0;
      
      // Validate required fields
      if (empty($orderId) || empty($status)) {
          throw new Exception('Order ID and status are required');
      }
      
      // Validate status
      $validStatuses = ['order', 'confirmed', 'ready', 'shipped', 'delivered', 'picked up', 'cancelled'];
      if (!in_array($status, $validStatuses)) {
          throw new Exception('Invalid status');
      }
      
      // Check if order exists
      $checkQuery = "SELECT status, delivery_mode, retailer_name, retailer_email FROM retailer_orders WHERE order_id = ?";
      $stmt = mysqli_prepare($conn, $checkQuery);
      mysqli_stmt_bind_param($stmt, 's', $orderId);
      mysqli_stmt_execute($stmt);
      $checkResult = mysqli_stmt_get_result($stmt);
      
      if (mysqli_num_rows($checkResult) === 0) {
          throw new Exception('Order not found');
      }
      
      $orderData = mysqli_fetch_assoc($checkResult);
      $currentStatus = $orderData['status'];
      $deliveryMode = $orderData['delivery_mode'];
      $customerName = $orderData['retailer_name'];
      $customerEmail = $orderData['retailer_email'];
      
      // Validate status transition
      if ($status === 'delivered' && $deliveryMode !== 'delivery') {
          throw new Exception('Cannot mark a pickup order as delivered');
      }
      
      if ($status === 'picked up' && $deliveryMode !== 'pickup') {
          throw new Exception('Cannot mark a delivery order as picked up');
      }
      
      if ($status === 'shipped' && $deliveryMode !== 'delivery') {
          throw new Exception('Cannot mark a pickup order as shipped');
      }
      
      if ($status === 'ready' && $deliveryMode !== 'pickup') {
          throw new Exception('Cannot mark a delivery order as ready');
      }
      
      // Update order status
      $updateOrderQuery = "
          UPDATE retailer_orders 
          SET status = ?, updated_at = NOW() 
          WHERE order_id = ?
      ";
      
      $stmt = mysqli_prepare($conn, $updateOrderQuery);
      mysqli_stmt_bind_param($stmt, 'ss', $status, $orderId);
      $updateResult = mysqli_stmt_execute($stmt);
      
      if (!$updateResult) {
          throw new Exception('Failed to update order status: ' . mysqli_error($conn));
      }
      
      // Add status history
      $historyQuery = "
          INSERT INTO retailer_order_status_history (order_id, status, notes, created_at)
          VALUES (?, ?, ?, NOW())
      ";
      
      $historyNotes = $notes;
      if (empty($historyNotes)) {
          $historyNotes = "Status updated to " . $status;
      }
      
      $stmt = mysqli_prepare($conn, $historyQuery);
      mysqli_stmt_bind_param($stmt, 'sss', $orderId, $status, $historyNotes);
      $historyResult = mysqli_stmt_execute($stmt);
      
      if (!$historyResult) {
          throw new Exception('Failed to add status history: ' . mysqli_error($conn));
      }
      
      // Update delivery record if status is 'delivered' or 'picked up'
      if ($status === 'delivered' || $status === 'picked up') {
          // Check if deliveries table exists
          $checkTableQuery = "SHOW TABLES LIKE 'deliveries'";
          $tableResult = mysqli_query($conn, $checkTableQuery);
          
          if (mysqli_num_rows($tableResult) === 0) {
              // Create deliveries table if it doesn't exist
              $createTableQuery = "
                  CREATE TABLE deliveries (
                      delivery_id INT AUTO_INCREMENT PRIMARY KEY,
                      order_id VARCHAR(20) NOT NULL,
                      estimated_delivery_time DATETIME,
                      actual_delivery_time DATETIME,
                      delivery_notes TEXT,
                      driver_id VARCHAR(20),
                      rating INT,
                      feedback TEXT,
                      created_at DATETIME NOT NULL,
                      updated_at DATETIME NOT NULL,
                      INDEX (order_id)
                  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
              ";
              
              $createResult = mysqli_query($conn, $createTableQuery);
              
              if (!$createResult) {
                  throw new Exception('Failed to create deliveries table: ' . mysqli_error($conn));
              }
          }
          
          // Check if delivery record exists
          $checkDeliveryQuery = "SELECT delivery_id FROM deliveries WHERE order_id = ?";
          $stmt = mysqli_prepare($conn, $checkDeliveryQuery);
          mysqli_stmt_bind_param($stmt, 's', $orderId);
          mysqli_stmt_execute($stmt);
          $deliveryResult = mysqli_stmt_get_result($stmt);
          
          $actualTime = !empty($actualDeliveryTime) ? $actualDeliveryTime : date('Y-m-d H:i:s');
          
          if (mysqli_num_rows($deliveryResult) === 0) {
              // Create new delivery record
              $insertDeliveryQuery = "
                  INSERT INTO deliveries (
                      order_id, 
                      actual_delivery_time, 
                      delivery_notes,
                      created_at, 
                      updated_at
                  ) VALUES (?, ?, ?, NOW(), NOW())
              ";
              
              $stmt = mysqli_prepare($conn, $insertDeliveryQuery);
              mysqli_stmt_bind_param($stmt, 'sss', $orderId, $actualTime, $notes);
              $insertResult = mysqli_stmt_execute($stmt);
              
              if (!$insertResult) {
                  throw new Exception('Failed to create delivery record: ' . mysqli_error($conn));
              }
          } else {
              // Update existing delivery record
              $updateDeliveryQuery = "
                  UPDATE deliveries 
                  SET 
                      actual_delivery_time = ?, 
                      delivery_notes = CONCAT(IFNULL(delivery_notes, ''), '\n', ?),
                      updated_at = NOW() 
                  WHERE order_id = ?
              ";
              
              $stmt = mysqli_prepare($conn, $updateDeliveryQuery);
              mysqli_stmt_bind_param($stmt, 'sss', $actualTime, $notes, $orderId);
              $updateResult = mysqli_stmt_execute($stmt);
              
              if (!$updateResult) {
                  throw new Exception('Failed to update delivery record: ' . mysqli_error($conn));
              }
          }
      }
      
      // Notify customer if requested
      if ($notifyCustomer && !empty($customerEmail)) {
          // This would typically send an email to the customer
          // For now, we'll just log it
          error_log("Would notify customer $customerName at $customerEmail about order $orderId status update to $status");
      }
      
      // Commit transaction
      mysqli_commit($conn);
      
      echo json_encode(['success' => true, 'message' => 'Order status updated successfully']);
  } catch (Exception $e) {
      // Rollback transaction on error
      mysqli_rollback($conn);
      
      echo json_encode(['success' => false, 'message' => $e->getMessage()]);
  }
}

// Function to get orders available for delivery
function getOrdersForDelivery() {
  global $conn;
  
  $query = "
      SELECT 
          ro.order_id, 
          ro.retailer_name as customer_name,
          ro.total_amount,
          ro.order_date,
          ro.delivery_mode,
          (SELECT COUNT(*) FROM retailer_order_items WHERE order_id = ro.order_id) as item_count
      FROM retailer_orders ro
      WHERE ro.status = 'confirmed'
      ORDER BY ro.order_date ASC
  ";
  
  $result = mysqli_query($conn, $query);
  
  if (!$result) {
      echo json_encode(['success' => false, 'message' => 'Failed to fetch orders: ' . mysqli_error($conn)]);
      return;
  }
  
  $orders = [];
  while ($row = mysqli_fetch_assoc($result)) {
      // Format order date
      $orderDate = new DateTime($row['order_date']);
      $row['formatted_date'] = $orderDate->format('M d, Y');
      
      // Format total amount
      $row['formatted_amount'] = '₱' . number_format((float)$row['total_amount'], 2);
      
      $orders[] = $row;
  }
  
  echo json_encode(['success' => true, 'orders' => $orders]);
}

// Function to get delivery details
function getDeliveryDetails() {
  global $conn;
  
  $orderId = isset($_GET['order_id']) ? $_GET['order_id'] : '';
  
  if (empty($orderId)) {
      echo json_encode(['success' => false, 'message' => 'Order ID is required']);
      return;
  }
  
  // Get order details
  $query = "
      SELECT 
          ro.order_id, 
          ro.retailer_name as customer_name, 
          ro.retailer_email as customer_email,
          ro.retailer_contact as customer_phone,
          ro.pickup_location as shipping_address,
          ro.order_date,
          ro.status,
          ro.delivery_mode,
          ro.total_amount,
          d.estimated_delivery_time,
          d.actual_delivery_time,
          d.delivery_notes,
          d.driver_id,
          d.rating,
          d.feedback
      FROM retailer_orders ro
      LEFT JOIN deliveries d ON ro.order_id = d.order_id
      WHERE ro.order_id = ?
  ";
  
  $stmt = mysqli_prepare($conn, $query);
  mysqli_stmt_bind_param($stmt, 's', $orderId);
  mysqli_stmt_execute($stmt);
  $result = mysqli_stmt_get_result($stmt);
  
  if (mysqli_num_rows($result) === 0) {
      echo json_encode(['success' => false, 'message' => 'Order not found']);
      return;
  }
  
  $order = mysqli_fetch_assoc($result);
  
  // Format dates
  $orderDate = new DateTime($order['order_date']);
  $order['formatted_order_date'] = $orderDate->format('F j, Y');
  
  if (!empty($order['estimated_delivery_time'])) {
      $estimatedTime = new DateTime($order['estimated_delivery_time']);
      $order['formatted_eta'] = $estimatedTime->format('F j, Y - h:i A');
  } else {
      $order['formatted_eta'] = 'Not specified';
  }
  
  if (!empty($order['actual_delivery_time'])) {
      $actualTime = new DateTime($order['actual_delivery_time']);
      $order['formatted_delivery_time'] = $actualTime->format('F j, Y - h:i A');
  } else {
      $order['formatted_delivery_time'] = 'Not delivered yet';
  }
  
  // Format total amount
  $order['formatted_amount'] = '₱' . number_format((float)$order['total_amount'], 2);
  
  // Get order items
  $itemsQuery = "
      SELECT 
          roi.item_id,
          roi.product_id,
          p.product_name,
          roi.quantity,
          roi.unit_price as price
      FROM retailer_order_items roi
      JOIN products p ON roi.product_id = p.product_id
      WHERE roi.order_id = ?
  ";
  
  $stmt = mysqli_prepare($conn, $itemsQuery);
  mysqli_stmt_bind_param($stmt, 's', $orderId);
  mysqli_stmt_execute($stmt);
  $itemsResult = mysqli_stmt_get_result($stmt);
  
  $items = [];
  while ($item = mysqli_fetch_assoc($itemsResult)) {
      $items[] = $item;
  }
  
  $order['items'] = $items;
  
  // Get status history
  $historyQuery = "
      SELECT status, notes, created_at as updated_at
      FROM retailer_order_status_history
      WHERE order_id = ?
      ORDER BY created_at ASC
  ";
  
  $stmt = mysqli_prepare($conn, $historyQuery);
  mysqli_stmt_bind_param($stmt, 's', $orderId);
  mysqli_stmt_execute($stmt);
  $historyResult = mysqli_stmt_get_result($stmt);
  
  $statusHistory = [];
  while ($history = mysqli_fetch_assoc($historyResult)) {
      $updatedAt = new DateTime($history['updated_at']);
      $history['formatted_date'] = $updatedAt->format('F j, Y - h:i A');
      $statusHistory[] = $history;
  }
  
  $order['status_history'] = $statusHistory;
  
  echo json_encode(['success' => true, 'delivery' => $order]);
}

// Add a new function to get delivery tracking information
// Add this after the getDeliveryDetails function

// Function to get delivery tracking information
function getDeliveryTracking() {
  global $conn;
  
  $orderId = isset($_GET['order_id']) ? $_GET['order_id'] : '';
  
  if (empty($orderId)) {
    echo json_encode(['success' => false, 'message' => 'Order ID is required']);
    return;
  }
  
  // Get order details with tracking information
  $query = "
    SELECT 
      ro.order_id, 
      ro.status,
      ro.delivery_mode,
      ro.pickup_location,
      ro.pickup_date,
      ro.notes,
      d.estimated_delivery_time,
      d.actual_delivery_time,
      d.driver_id,
      d.delivery_notes,
      (
        SELECT MAX(created_at) 
        FROM retailer_order_status_history 
        WHERE order_id = ro.order_id AND status = ro.status
      ) as status_updated_at
    FROM retailer_orders ro
    LEFT JOIN deliveries d ON ro.order_id = d.order_id
    WHERE ro.order_id = ?
  ";
  
  $stmt = mysqli_prepare($conn, $query);
  mysqli_stmt_bind_param($stmt, 's', $orderId);
  mysqli_stmt_execute($stmt);
  $result = mysqli_stmt_get_result($stmt);
  
  if (mysqli_num_rows($result) === 0) {
    echo json_encode(['success' => false, 'message' => 'Order not found']);
    return;
  }
  
  $tracking = mysqli_fetch_assoc($result);
  
  // Format dates
  if (!empty($tracking['estimated_delivery_time'])) {
    $estimatedTime = new DateTime($tracking['estimated_delivery_time']);
    $tracking['formatted_eta'] = $estimatedTime->format('F j, Y - h:i A');
  } else {
    $tracking['formatted_eta'] = 'Not specified';
  }
  
  if (!empty($tracking['actual_delivery_time'])) {
    $actualTime = new DateTime($tracking['actual_delivery_time']);
    $tracking['formatted_delivery_time'] = $actualTime->format('F j, Y - h:i A');
  } else {
    $tracking['formatted_delivery_time'] = 'Not delivered yet';
  }
  
  if (!empty($tracking['status_updated_at'])) {
    $statusTime = new DateTime($tracking['status_updated_at']);
    $tracking['formatted_status_time'] = $statusTime->format('F j, Y - h:i A');
  } else {
    $tracking['formatted_status_time'] = 'Unknown';
  }
  
  if (!empty($tracking['pickup_date'])) {
    $pickupDate = new DateTime($tracking['pickup_date']);
    $tracking['formatted_pickup_date'] = $pickupDate->format('F j, Y');
  } else {
    $tracking['formatted_pickup_date'] = 'Not specified';
  }
  
  // Get status history for tracking timeline
  $historyQuery = "
    SELECT status, notes, created_at
    FROM retailer_order_status_history
    WHERE order_id = ?
    ORDER BY created_at ASC
  ";
  
  $stmt = mysqli_prepare($conn, $historyQuery);
  mysqli_stmt_bind_param($stmt, 's', $orderId);
  mysqli_stmt_execute($stmt);
  $historyResult = mysqli_stmt_get_result($stmt);
  
  $statusHistory = [];
  while ($history = mysqli_fetch_assoc($historyResult)) {
    $createdAt = new DateTime($history['created_at']);
    $history['formatted_date'] = $createdAt->format('F j, Y - h:i A');
    $statusHistory[] = $history;
  }
  
  $tracking['status_history'] = $statusHistory;
  
  echo json_encode(['success' => true, 'tracking' => $tracking]);
}

// Function to report a delivery issue
function reportDeliveryIssue() {
  global $conn;
  
  // Start transaction
  mysqli_begin_transaction($conn);
  
  try {
      // Get form data
      $orderId = $_POST['order_id'] ?? '';
      $issueType = $_POST['issue_type'] ?? '';
      $description = $_POST['description'] ?? '';
      
      // Validate required fields
      if (empty($orderId) || empty($issueType)) {
          throw new Exception('Order ID and issue type are required');
      }
      
      // Check if order exists
      $checkQuery = "SELECT order_id FROM retailer_orders WHERE order_id = ?";
      $stmt = mysqli_prepare($conn, $checkQuery);
      mysqli_stmt_bind_param($stmt, 's', $orderId);
      mysqli_stmt_execute($stmt);
      $checkResult = mysqli_stmt_get_result($stmt);
      
      if (mysqli_num_rows($checkResult) === 0) {
          throw new Exception('Order not found');
      }
      
      // Check if delivery_issues table exists, create if not
      $checkIssuesTableQuery = "SHOW TABLES LIKE 'delivery_issues'";
      $issuesTableResult = mysqli_query($conn, $checkIssuesTableQuery);
      
      if (mysqli_num_rows($issuesTableResult) === 0) {
          // Create delivery_issues table
          $createIssuesTableQuery = "
              CREATE TABLE delivery_issues (
                  issue_id INT AUTO_INCREMENT PRIMARY KEY,
                  order_id VARCHAR(20) NOT NULL,
                  issue_type ENUM('delay', 'damage', 'wrong_item', 'missing_item', 'other') NOT NULL,
                  description TEXT,
                  status ENUM('reported', 'investigating', 'resolved') NOT NULL DEFAULT 'reported',
                  reported_at DATETIME NOT NULL,
                  resolved_at DATETIME,
                  resolution TEXT,
                  INDEX (order_id)
              ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
          ";
          
          $createIssuesResult = mysqli_query($conn, $createIssuesTableQuery);
          
          if (!$createIssuesResult) {
              throw new Exception('Failed to create delivery_issues table: ' . mysqli_error($conn));
          }
      }
      
      // Insert issue
      $insertIssueQuery = "
          INSERT INTO delivery_issues (
              order_id,
              issue_type,
              description,
              status,
              reported_at
          ) VALUES (?, ?, ?, 'reported', NOW())
      ";
      
      $stmt = mysqli_prepare($conn, $insertIssueQuery);
      mysqli_stmt_bind_param($stmt, 'sss', $orderId, $issueType, $description);
      $insertResult = mysqli_stmt_execute($stmt);
      
      if (!$insertResult) {
          throw new Exception('Failed to report issue: ' . mysqli_error($conn));
      }
      
      // Get the issue ID
      $issueId = mysqli_insert_id($conn);
      
      // Commit transaction
      mysqli_commit($conn);
      
      echo json_encode(['success' => true, 'message' => 'Issue reported successfully', 'issue_id' => $issueId]);
  } catch (Exception $e) {
      // Rollback transaction on error
      mysqli_rollback($conn);
      
      echo json_encode(['success' => false, 'message' => $e->getMessage()]);
  }
}

// Function to resolve a delivery issue
function resolveIssue() {
  global $conn;
  
  // Start transaction
  mysqli_begin_transaction($conn);
  
  try {
      // Get form data
      $issueId = $_POST['issue_id'] ?? '';
      $resolution = $_POST['resolution'] ?? '';
      
      // Validate required fields
      if (empty($issueId)) {
          throw new Exception('Issue ID is required');
      }
      
      // Check if issue exists
      $checkQuery = "SELECT issue_id, order_id FROM delivery_issues WHERE issue_id = ?";
      $stmt = mysqli_prepare($conn, $checkQuery);
      mysqli_stmt_bind_param($stmt, 'i', $issueId);
      mysqli_stmt_execute($stmt);
      $checkResult = mysqli_stmt_get_result($stmt);
      
      if (mysqli_num_rows($checkResult) === 0) {
          throw new Exception('Issue not found');
      }
      
      $issueData = mysqli_fetch_assoc($checkResult);
      
      // Update issue status
      $updateIssueQuery = "
          UPDATE delivery_issues
          SET 
              status = 'resolved',
              resolved_at = NOW(),
              resolution = ?
          WHERE issue_id = ?
      ";
      
      $stmt = mysqli_prepare($conn, $updateIssueQuery);
      mysqli_stmt_bind_param($stmt, 'si', $resolution, $issueId);
      $updateResult = mysqli_stmt_execute($stmt);
      
      if (!$updateResult) {
          throw new Exception('Failed to resolve issue: ' . mysqli_error($conn));
      }
      
      // Commit transaction
      mysqli_commit($conn);
      
      echo json_encode(['success' => true, 'message' => 'Issue resolved successfully']);
  } catch (Exception $e) {
      // Rollback transaction on error
      mysqli_rollback($conn);
      
      echo json_encode(['success' => false, 'message' => $e->getMessage()]);
  }
}
?>
