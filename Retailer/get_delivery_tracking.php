<?php
// Include database connection
require_once 'db_connection.php';

// Set header to return JSON
header('Content-Type: application/json');

// Start session if not already started
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Check if user is logged in
if (!isset($_SESSION['user_id'])) {
    echo json_encode([
        'success' => false,
        'message' => 'User not logged in'
    ]);
    exit;
}

// Get order ID from request
$orderId = isset($_GET['order_id']) ? intval($_GET['order_id']) : 0;

if (!$orderId) {
    echo json_encode([
        'success' => false,
        'message' => 'Order ID is required'
    ]);
    exit;
}

try {
    // First, check if the user has access to this order
    $userQuery = "SELECT u.id, u.email 
                  FROM users u 
                  WHERE u.id = ?";
    
    $stmt = $conn->prepare($userQuery);
    $stmt->bind_param("i", $_SESSION['user_id']);
    $stmt->execute();
    $userResult = $stmt->get_result();
    
    if ($userResult->num_rows === 0) {
        echo json_encode([
            'success' => false,
            'message' => 'User not found'
        ]);
        exit;
    }
    
    $user = $userResult->fetch_assoc();
    $userEmail = $user['email'];
    
    // Check if order belongs to this user
    $orderQuery = "SELECT ro.* 
                  FROM retailer_orders ro 
                  WHERE ro.order_id = ? AND ro.retailer_email = ?";
    
    $stmt = $conn->prepare($orderQuery);
    $stmt->bind_param("is", $orderId, $userEmail);
    $stmt->execute();
    $orderResult = $stmt->get_result();
    
    if ($orderResult->num_rows === 0) {
        echo json_encode([
            'success' => false,
            'message' => 'Order not found or access denied'
        ]);
        exit;
    }
    
    $order = $orderResult->fetch_assoc();
    
    // Get tracking information
    $trackingQuery = "SELECT rod.* 
                     FROM retailer_order_deliveries rod 
                     WHERE rod.order_id = ?";
    
    $stmt = $conn->prepare($trackingQuery);
    $stmt->bind_param("i", $orderId);
    $stmt->execute();
    $trackingResult = $stmt->get_result();
    
    $tracking = null;
    if ($trackingResult->num_rows > 0) {
        $tracking = $trackingResult->fetch_assoc();
        
        // Format dates
        if (!empty($tracking['estimated_arrival']) && $tracking['estimated_arrival'] != '0000-00-00 00:00:00') {
            $estimatedArrival = new DateTime($tracking['estimated_arrival']);
            $tracking['formatted_estimated_arrival'] = $estimatedArrival->format('F j, Y - h:i A');
        } else {
            $tracking['formatted_estimated_arrival'] = 'Not specified';
        }
        
        if (!empty($tracking['actual_arrival']) && $tracking['actual_arrival'] != '0000-00-00 00:00:00') {
            $actualArrival = new DateTime($tracking['actual_arrival']);
            $tracking['formatted_actual_arrival'] = $actualArrival->format('F j, Y - h:i A');
        } else {
            $tracking['formatted_actual_arrival'] = 'Not delivered yet';
        }
        
        if (!empty($tracking['last_updated']) && $tracking['last_updated'] != '0000-00-00 00:00:00') {
            $lastUpdated = new DateTime($tracking['last_updated']);
            $tracking['formatted_last_updated'] = $lastUpdated->format('F j, Y - h:i A');
        } else {
            $tracking['formatted_last_updated'] = 'Not available';
        }
    }
    
    // Get status history
    $historyQuery = "SELECT rosh.* 
                    FROM retailer_order_status_history rosh 
                    WHERE rosh.order_id = ? 
                    ORDER BY rosh.created_at DESC";
    
    $stmt = $conn->prepare($historyQuery);
    $stmt->bind_param("i", $orderId);
    $stmt->execute();
    $historyResult = $stmt->get_result();
    
    $history = [];
    while ($historyItem = $historyResult->fetch_assoc()) {
        // Format date
        $createdAt = new DateTime($historyItem['created_at']);
        $historyItem['formatted_date'] = $createdAt->format('F j, Y - h:i A');
        
        $history[] = $historyItem;
    }
    
    // Return the tracking information
    echo json_encode([
        'success' => true,
        'order' => $order,
        'tracking' => $tracking,
        'history' => $history
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Error: ' . $e->getMessage()
    ]);
}
?>