<?php
// fetch_retailer_orders.php
// This file fetches retailer orders from the database for the delivery tracking system

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
        'message' => 'User not logged in',
        'data' => null
    ]);
    exit;
}

// Get user ID from session
$userId = $_SESSION['user_id'];

// Get retailer information
try {
    // First, check if the user exists and get basic info
    $userQuery = "SELECT u.id, u.username, u.email, u.full_name, u.role 
                  FROM users u 
                  WHERE u.id = ?";
    
    $stmt = $conn->prepare($userQuery);
    $stmt->bind_param("i", $userId);
    $stmt->execute();
    $userResult = $stmt->get_result();
    
    if ($userResult->num_rows === 0) {
        echo json_encode([
            'success' => false,
            'message' => 'User not found',
            'data' => null
        ]);
        exit;
    }
    
    $user = $userResult->fetch_assoc();
    
    // Check if user is a retailer
    if ($user['role'] !== 'retailer') {
        echo json_encode([
            'success' => false,
            'message' => 'Access denied. Only retailers can access this page.',
            'data' => null
        ]);
        exit;
    }
    
    // Now get retailer-specific information
    $retailerQuery = "SELECT r.* 
                      FROM retailer_profiles r 
                      WHERE r.user_id = ?";
    
    $stmt = $conn->prepare($retailerQuery);
    $stmt->bind_param("i", $userId);
    $stmt->execute();
    $retailerResult = $stmt->get_result();
    
    if ($retailerResult->num_rows === 0) {
        echo json_encode([
            'success' => false,
            'message' => 'Retailer profile not found',
            'data' => null
        ]);
        exit;
    }
    
    $retailer = $retailerResult->fetch_assoc();
    $retailerId = $retailer['id']; // Get the retailer ID from the profile
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Error: ' . $e->getMessage(),
        'data' => null
    ]);
    exit;
}

// Get action from request
$action = isset($_GET['action']) ? $_GET['action'] : '';

// Handle different actions
switch ($action) {
    case 'get_all_orders':
        getAllOrders($conn, $retailerId);
        break;
    case 'get_order_details':
        $order_id = isset($_GET['order_id']) ? $_GET['order_id'] : null;
        if ($order_id) {
            getOrderDetails($conn, $retailerId, $order_id);
        } else {
            echo json_encode([
                'success' => false,
                'message' => 'Order ID is required',
                'data' => null
            ]);
        }
        break;
    case 'get_upcoming_orders':
        getUpcomingOrders($conn, $retailerId);
        break;
    case 'get_recent_updates':
        getRecentUpdates($conn, $retailerId);
        break;
    case 'get_order_stats':
        getOrderStats($conn, $retailerId);
        break;
    default:
        echo json_encode([
            'success' => false,
            'message' => 'Invalid action',
            'data' => null
        ]);
}

// Function to get all orders for the retailer
function getAllOrders($conn, $retailerId) {
    // Prepare SQL query to get all orders for the retailer
    $sql = "SELECT 
                ro.order_id, 
                ro.po_number, 
                ro.retailer_name, 
                ro.retailer_email, 
                ro.retailer_contact, 
                ro.order_date, 
                ro.expected_delivery, 
                ro.delivery_mode, 
                ro.pickup_location, 
                ro.pickup_date, 
                ro.status, 
                ro.subtotal, 
                ro.tax, 
                ro.discount, 
                ro.total_amount, 
                ro.notes,
                (SELECT MAX(created_at) FROM retailer_order_status_history WHERE order_id = ro.order_id) as last_update
            FROM 
                retailer_orders ro
            WHERE 
                ro.retailer_id = ?
            ORDER BY 
                ro.order_date DESC";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $retailerId);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $orders = [];
    while ($row = $result->fetch_assoc()) {
        // Format dates for display
        $row['formatted_order_date'] = date('M d, Y', strtotime($row['order_date']));
        $row['formatted_expected_delivery'] = $row['expected_delivery'] ? date('M d, Y', strtotime($row['expected_delivery'])) : 'Not specified';
        $row['formatted_pickup_date'] = $row['pickup_date'] ? date('M d, Y', strtotime($row['pickup_date'])) : 'Not specified';
        $row['formatted_last_update'] = $row['last_update'] ? date('M d, Y h:i A', strtotime($row['last_update'])) : 'Not available';
        
        // Get order items
        $row['items'] = getOrderItems($conn, $row['order_id']);
        
        // Get order timeline
        $row['timeline'] = getOrderTimeline($conn, $row['order_id']);
        
        $orders[] = $row;
    }
    
    echo json_encode([
        'success' => true,
        'message' => 'Orders fetched successfully',
        'data' => $orders
    ]);
}

// Function to get order details
function getOrderDetails($conn, $retailerId, $order_id) {
    // Prepare SQL query to get order details
    $sql = "SELECT 
                ro.order_id, 
                ro.po_number, 
                ro.retailer_name, 
                ro.retailer_email, 
                ro.retailer_contact, 
                ro.order_date, 
                ro.expected_delivery, 
                ro.delivery_mode, 
                ro.pickup_location, 
                ro.pickup_date, 
                ro.status, 
                ro.subtotal, 
                ro.tax, 
                ro.discount, 
                ro.total_amount, 
                ro.notes
            FROM 
                retailer_orders ro
            WHERE 
                ro.retailer_id = ? AND ro.order_id = ?";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("ii", $retailerId, $order_id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        echo json_encode([
            'success' => false,
            'message' => 'Order not found',
            'data' => null
        ]);
        return;
    }
    
    $order = $result->fetch_assoc();
    
    // Format dates for display
    $order['formatted_order_date'] = date('M d, Y', strtotime($order['order_date']));
    $order['formatted_expected_delivery'] = $order['expected_delivery'] ? date('M d, Y', strtotime($order['expected_delivery'])) : 'Not specified';
    $order['formatted_pickup_date'] = $order['pickup_date'] ? date('M d, Y', strtotime($order['pickup_date'])) : 'Not specified';
    
    // Get order items
    $order['items'] = getOrderItems($conn, $order_id);
    
    // Get order timeline
    $order['timeline'] = getOrderTimeline($conn, $order_id);
    
    echo json_encode([
        'success' => true,
        'message' => 'Order details fetched successfully',
        'data' => $order
    ]);
}

// Function to get order items
function getOrderItems($conn, $order_id) {
    $sql = "SELECT 
                roi.item_id, 
                roi.order_id, 
                roi.product_id, 
                roi.quantity, 
                roi.unit_price, 
                roi.total_price, 
                roi.created_at,
                roi.product_name
            FROM 
                retailer_order_items roi
            WHERE 
                roi.order_id = ?";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $order_id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $items = [];
    while ($row = $result->fetch_assoc()) {
        $items[] = $row;
    }
    
    return $items;
}

// Function to get order timeline
function getOrderTimeline($conn, $order_id) {
    $sql = "SELECT 
                rosh.history_id, 
                rosh.order_id, 
                rosh.status, 
                rosh.notes, 
                rosh.created_at
            FROM 
                retailer_order_status_history rosh
            WHERE 
                rosh.order_id = ?
            ORDER BY 
                rosh.created_at DESC";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $order_id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $timeline = [];
    while ($row = $result->fetch_assoc()) {
        $row['formatted_date'] = date('M d, Y h:i A', strtotime($row['created_at']));
        $timeline[] = $row;
    }
    
    return $timeline;
}

// Function to get upcoming orders
function getUpcomingOrders($conn, $retailerId) {
    // Get orders that are scheduled for delivery or pickup in the future
    $sql = "SELECT 
                ro.order_id, 
                ro.po_number, 
                ro.retailer_name, 
                ro.order_date, 
                ro.expected_delivery, 
                ro.delivery_mode, 
                ro.pickup_date, 
                ro.status,
                ro.total_amount,
                COUNT(roi.item_id) as item_count
            FROM 
                retailer_orders ro
            LEFT JOIN 
                retailer_order_items roi ON ro.order_id = roi.order_id
            WHERE 
                ro.retailer_id = ? AND 
                ro.status = 'confirmed' AND 
                ((ro.delivery_mode = 'delivery' AND ro.expected_delivery >= CURDATE()) OR 
                (ro.delivery_mode = 'pickup' AND ro.pickup_date >= CURDATE()))
            GROUP BY 
                ro.order_id
            ORDER BY 
                CASE 
                    WHEN ro.delivery_mode = 'delivery' THEN ro.expected_delivery 
                    ELSE ro.pickup_date 
                END ASC
            LIMIT 5";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $retailerId);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $upcomingOrders = [];
    while ($row = $result->fetch_assoc()) {
        // Format dates for display
        $row['formatted_order_date'] = date('M d, Y', strtotime($row['order_date']));
        $row['formatted_expected_date'] = $row['delivery_mode'] === 'delivery' 
            ? ($row['expected_delivery'] ? date('M d, Y', strtotime($row['expected_delivery'])) : 'Not specified')
            : ($row['pickup_date'] ? date('M d, Y', strtotime($row['pickup_date'])) : 'Not specified');
        
        $upcomingOrders[] = $row;
    }
    
    echo json_encode([
        'success' => true,
        'message' => 'Upcoming orders fetched successfully',
        'data' => $upcomingOrders
    ]);
}

// Function to get recent updates
function getRecentUpdates($conn, $retailerId) {
    $sql = "SELECT 
                rosh.history_id, 
                rosh.order_id, 
                rosh.status, 
                rosh.notes, 
                rosh.created_at,
                ro.po_number,
                ro.delivery_mode
            FROM 
                retailer_order_status_history rosh
            JOIN 
                retailer_orders ro ON rosh.order_id = ro.order_id
            WHERE 
                ro.retailer_id = ?
            ORDER BY 
                rosh.created_at DESC
            LIMIT 10";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $retailerId);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $updates = [];
    while ($row = $result->fetch_assoc()) {
        $row['formatted_date'] = date('M d, Y h:i A', strtotime($row['created_at']));
        $updates[] = $row;
    }
    
    echo json_encode([
        'success' => true,
        'message' => 'Recent updates fetched successfully',
        'data' => $updates
    ]);
}

// Function to get order statistics
function getOrderStats($conn, $retailerId) {
    // Get total orders count
    $sql_total = "SELECT COUNT(*) as total FROM retailer_orders WHERE retailer_id = ?";
    $stmt_total = $conn->prepare($sql_total);
    $stmt_total->bind_param("i", $retailerId);
    $stmt_total->execute();
    $result_total = $stmt_total->get_result();
    $total_orders = $result_total->fetch_assoc()['total'];
    
    // Get in-transit orders count (confirmed but not delivered/picked up)
    $sql_in_transit = "SELECT COUNT(*) as in_transit FROM retailer_orders 
                      WHERE retailer_id = ? AND status = 'confirmed'";
    $stmt_in_transit = $conn->prepare($sql_in_transit);
    $stmt_in_transit->bind_param("i", $retailerId);
    $stmt_in_transit->execute();
    $result_in_transit = $stmt_in_transit->get_result();
    $in_transit_orders = $result_in_transit->fetch_assoc()['in_transit'];
    
    // Get completed orders count
    $sql_completed = "SELECT COUNT(*) as completed FROM retailer_orders 
                     WHERE retailer_id = ? AND status IN ('delivered', 'picked up')";
    $stmt_completed = $conn->prepare($sql_completed);
    $stmt_completed->bind_param("i", $retailerId);
    $stmt_completed->execute();
    $result_completed = $stmt_completed->get_result();
    $completed_orders = $result_completed->fetch_assoc()['completed'];
    
    // Get issues count (orders with issues)
    $sql_issues = "SELECT COUNT(*) as issues FROM retailer_orders 
                  WHERE retailer_id = ? AND status = 'issue'";
    $stmt_issues = $conn->prepare($sql_issues);
    $stmt_issues->bind_param("i", $retailerId);
    $stmt_issues->execute();
    $result_issues = $stmt_issues->get_result();
    $issues_orders = $result_issues->fetch_assoc()['issues'];
    
    // Calculate growth percentage (mock data for now)
    $growth_percentage = 15; // This would typically be calculated based on historical data
    
    $stats = [
        'total_deliveries' => $total_orders,
        'in_transit' => $in_transit_orders,
        'completed' => $completed_orders,
        'issues' => $issues_orders,
        'growth_percentage' => $growth_percentage
    ];
    
    echo json_encode([
        'success' => true,
        'message' => 'Order statistics fetched successfully',
        'data' => $stats
    ]);
}
?>