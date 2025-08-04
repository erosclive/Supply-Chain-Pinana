<?php
// Include database connection
require_once 'db_connection.php';

// Set headers
header('Content-Type: application/json');

try {
    // Get order counts by status
    $counts = [
        'all' => 0,
        'order' => 0,
        'ongoing' => 0,
        'completed' => 0
    ];
    
    // Count all orders
    $query = "SELECT COUNT(*) as count FROM retailer_orders";
    $result = $conn->query($query);
    if ($result && $row = $result->fetch_assoc()) {
        $counts['all'] = (int)$row['count'];
    }
    
    // Count orders with status 'order' (Place Order)
    $query = "SELECT COUNT(*) as count FROM retailer_orders WHERE status = 'order'";
    $result = $conn->query($query);
    if ($result && $row = $result->fetch_assoc()) {
        $counts['order'] = (int)$row['count'];
    }
    
    // Count ongoing orders (confirmed, shipped, ready_for_pickup)
    $query = "SELECT COUNT(*) as count FROM retailer_orders 
              WHERE status IN ('confirmed', 'shipped', 'ready_for_pickup', 'ready-to-pickup')";
    $result = $conn->query($query);
    if ($result && $row = $result->fetch_assoc()) {
        $counts['ongoing'] = (int)$row['count'];
    }
    
    // Count completed orders (delivered, picked_up)
    $query = "SELECT COUNT(*) as count FROM retailer_orders 
              WHERE status IN ('delivered', 'picked_up', 'picked up') 
              OR (delivery_mode = 'pickup' AND pickup_status = 'picked-up')";
    $result = $conn->query($query);
    if ($result && $row = $result->fetch_assoc()) {
        $counts['completed'] = (int)$row['count'];
    }
    
    echo json_encode([
        'success' => true,
        'counts' => $counts
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}

// Close connection
$conn->close();
?>
