<?php
// Include database connection
require_once 'db_connection.php';

// Set headers for JSON response
header('Content-Type: application/json');

try {
    // Create notifications table if it doesn't exist
    $createTableSql = "CREATE TABLE IF NOT EXISTS notifications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        notification_id VARCHAR(50) NOT NULL,
        related_id VARCHAR(50) NOT NULL,
        type VARCHAR(50) NOT NULL,
        message TEXT NOT NULL,
        is_read TINYINT(1) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        read_at TIMESTAMP NULL,
        INDEX (notification_id),
        INDEX (related_id),
        INDEX (is_read),
        INDEX (created_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4";
    
    if (!mysqli_query($conn, $createTableSql)) {
        throw new Exception("Error creating notifications table: " . mysqli_error($conn));
    }
    
    // Create a table to track the last check time if it doesn't exist
    $createLastCheckTableSql = "CREATE TABLE IF NOT EXISTS last_check_times (
        id INT AUTO_INCREMENT PRIMARY KEY,
        check_type VARCHAR(50) NOT NULL UNIQUE,
        last_check_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX (check_type)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4";
    
    if (!mysqli_query($conn, $createLastCheckTableSql)) {
        throw new Exception("Error creating last_check_times table: " . mysqli_error($conn));
    }
    
    // Get the last check time for orders
    $lastCheckSql = "SELECT last_check_time FROM last_check_times WHERE check_type = 'retailer_orders'";
    $lastCheckResult = mysqli_query($conn, $lastCheckSql);
    
    $lastCheckTime = null;
    if (mysqli_num_rows($lastCheckResult) > 0) {
        $lastCheckRow = mysqli_fetch_assoc($lastCheckResult);
        $lastCheckTime = $lastCheckRow['last_check_time'];
    } else {
        // If no record exists, insert one with current time minus 1 hour
        $lastCheckTime = date('Y-m-d H:i:s', strtotime('-1 hour'));
        $insertLastCheckSql = "INSERT INTO last_check_times (check_type, last_check_time) 
                               VALUES ('retailer_orders', ?)";
        $insertLastCheckStmt = mysqli_prepare($conn, $insertLastCheckSql);
        mysqli_stmt_bind_param($insertLastCheckStmt, "s", $lastCheckTime);
        mysqli_stmt_execute($insertLastCheckStmt);
        mysqli_stmt_close($insertLastCheckStmt);
    }
    
    // Get new orders since last check
    $sql = "SELECT ro.order_id, ro.po_number, ro.retailer_name, ro.created_at, 
                  ro.expected_delivery, ro.delivery_mode, ro.pickup_date, ro.pickup_location, ro.status
           FROM retailer_orders ro
           WHERE ro.created_at > ?
           ORDER BY ro.created_at DESC";
    
    $stmt = mysqli_prepare($conn, $sql);
    mysqli_stmt_bind_param($stmt, "s", $lastCheckTime);
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);
    
    $newOrders = [];
    while ($row = mysqli_fetch_assoc($result)) {
        $newOrders[] = $row;
    }
    
    mysqli_stmt_close($stmt);
    
    $currentTime = date('Y-m-d H:i:s');
    $notificationsCreated = [];
    
    // Create notifications for new orders
    foreach ($newOrders as $order) {
        // Determine delivery info based on delivery mode
        $deliveryInfo = "";
        if ($order['delivery_mode'] == 'pickup') {
            $deliveryInfo = "Pickup on " . date('M d, Y', strtotime($order['pickup_date'])) . 
                           " at " . $order['pickup_location'];
        } else {
            $deliveryInfo = "Expected delivery on " . date('M d, Y', strtotime($order['expected_delivery']));
        }
        
        // Create detailed message
        $message = "New order ({$order['po_number']}) from {$order['retailer_name']}. $deliveryInfo";
        
        // Generate a unique notification ID
        $notificationId = uniqid('notif_');
        
        // Insert notification
        $insertNotifSql = "INSERT INTO notifications (notification_id, related_id, type, message) 
                          VALUES (?, ?, ?, ?)";
        $insertStmt = mysqli_prepare($conn, $insertNotifSql);
        $type = 'new_order';
        mysqli_stmt_bind_param($insertStmt, "ssss", $notificationId, $order['order_id'], $type, $message);
        
        if (mysqli_stmt_execute($insertStmt)) {
            $notificationsCreated[] = [
                'order_id' => $order['order_id'],
                'notification_id' => $notificationId,
                'message' => $message
            ];
        }
        
        mysqli_stmt_close($insertStmt);
    }
    
    // Update the last check time
    $updateLastCheckSql = "UPDATE last_check_times 
                           SET last_check_time = ? 
                           WHERE check_type = 'retailer_orders'";
    $updateLastCheckStmt = mysqli_prepare($conn, $updateLastCheckSql);
    mysqli_stmt_bind_param($updateLastCheckStmt, "s", $currentTime);
    mysqli_stmt_execute($updateLastCheckStmt);
    mysqli_stmt_close($updateLastCheckStmt);
    
    // Return success response
    echo json_encode([
        'status' => 'success',
        'last_check_time' => $lastCheckTime,
        'current_time' => $currentTime,
        'orders_found' => count($newOrders),
        'notifications_created' => $notificationsCreated
    ]);
    
} catch (Exception $e) {
    // Return error response
    echo json_encode([
        'status' => 'error',
        'message' => $e->getMessage()
    ]);
}

// Close the connection
mysqli_close($conn);
?>
