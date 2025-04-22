<?php
// update_order_status.php
// This file handles updating order status and reporting issues

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

// Check if request is POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode([
        'success' => false,
        'message' => 'Invalid request method',
        'data' => null
    ]);
    exit;
}

// Get action from request
$action = isset($_POST['action']) ? $_POST['action'] : '';

// Handle different actions
switch ($action) {
    case 'receive_order':
        receiveOrder($conn, $retailerId);
        break;
    case 'report_issue':
        reportIssue($conn, $retailerId);
        break;
    default:
        echo json_encode([
            'success' => false,
            'message' => 'Invalid action',
            'data' => null
        ]);
}

// Function to mark an order as received
function receiveOrder($conn, $retailerId) {
    // Get parameters from request
    $order_id = isset($_POST['order_id']) ? intval($_POST['order_id']) : 0;
    $receive_date = isset($_POST['receive_date']) ? $_POST['receive_date'] : date('Y-m-d');
    $notes = isset($_POST['notes']) ? $_POST['notes'] : '';
    
    // Validate order belongs to retailer
    $sql_check = "SELECT order_id, delivery_mode FROM retailer_orders WHERE order_id = ? AND retailer_id = ?";
    $stmt_check = $conn->prepare($sql_check);
    $stmt_check->bind_param("ii", $order_id, $retailerId);
    $stmt_check->execute();
    $result_check = $stmt_check->get_result();
    
    if ($result_check->num_rows === 0) {
        echo json_encode([
            'success' => false,
            'message' => 'Order not found or does not belong to this retailer',
            'data' => null
        ]);
        return;
    }
    
    $order = $result_check->fetch_assoc();
    $delivery_mode = $order['delivery_mode'];
    
    // Start transaction
    $conn->begin_transaction();
    
    try {
        // Update order status based on delivery mode
        $new_status = ($delivery_mode === 'delivery') ? 'delivered' : 'picked up';
        
        $sql_update = "UPDATE retailer_orders SET status = ? WHERE order_id = ?";
        $stmt_update = $conn->prepare($sql_update);
        $stmt_update->bind_param("si", $new_status, $order_id);
        $stmt_update->execute();
        
        // Add status history entry
        $sql_history = "INSERT INTO retailer_order_status_history (order_id, status, notes) VALUES (?, ?, ?)";
        $stmt_history = $conn->prepare($sql_history);
        $stmt_history->bind_param("iss", $order_id, $new_status, $notes);
        $stmt_history->execute();
        
        // Process received items if provided
        if (isset($_POST['items']) && is_array($_POST['items'])) {
            foreach ($_POST['items'] as $item) {
                // Here you would typically update inventory or other related tables
                // This is a placeholder for that functionality
            }
        }
        
        // Commit transaction
        $conn->commit();
        
        echo json_encode([
            'success' => true,
            'message' => 'Order marked as ' . $new_status . ' successfully',
            'data' => null
        ]);
    } catch (Exception $e) {
        // Rollback transaction on error
        $conn->rollback();
        
        echo json_encode([
            'success' => false,
            'message' => 'Error updating order status: ' . $e->getMessage(),
            'data' => null
        ]);
    }
}

// Function to report an issue with an order
function reportIssue($conn, $retailerId) {
    // Get parameters from request
    $order_id = isset($_POST['order_id']) ? intval($_POST['order_id']) : 0;
    $issue_type = isset($_POST['issue_type']) ? $_POST['issue_type'] : '';
    $issue_severity = isset($_POST['issue_severity']) ? $_POST['issue_severity'] : 'medium';
    $issue_description = isset($_POST['issue_description']) ? $_POST['issue_description'] : '';
    $requested_action = isset($_POST['requested_action']) ? $_POST['requested_action'] : '';
    
    // Validate order belongs to retailer
    $sql_check = "SELECT order_id FROM retailer_orders WHERE order_id = ? AND retailer_id = ?";
    $stmt_check = $conn->prepare($sql_check);
    $stmt_check->bind_param("ii", $order_id, $retailerId);
    $stmt_check->execute();
    $result_check = $stmt_check->get_result();
    
    if ($result_check->num_rows === 0) {
        echo json_encode([
            'success' => false,
            'message' => 'Order not found or does not belong to this retailer',
            'data' => null
        ]);
        return;
    }
    
    // Start transaction
    $conn->begin_transaction();
    
    try {
        // Update order status to 'issue'
        $sql_update = "UPDATE retailer_orders SET status = 'issue' WHERE order_id = ?";
        $stmt_update = $conn->prepare($sql_update);
        $stmt_update->bind_param("i", $order_id);
        $stmt_update->execute();
        
        // Add status history entry
        $notes = "Issue reported: " . $issue_description;
        $sql_history = "INSERT INTO retailer_order_status_history (order_id, status, notes) VALUES (?, 'issue', ?)";
        $stmt_history = $conn->prepare($sql_history);
        $stmt_history->bind_param("is", $order_id, $notes);
        $stmt_history->execute();
        
        // Insert into issues table
        $sql_issue = "INSERT INTO retailer_order_issues (order_id, issue_type, severity, description, requested_action) 
                      VALUES (?, ?, ?, ?, ?)";
        $stmt_issue = $conn->prepare($sql_issue);
        $stmt_issue->bind_param("issss", $order_id, $issue_type, $issue_severity, $issue_description, $requested_action);
        $stmt_issue->execute();
        
        // Commit transaction
        $conn->commit();
        
        echo json_encode([
            'success' => true,
            'message' => 'Issue reported successfully',
            'data' => null
        ]);
    } catch (Exception $e) {
        // Rollback transaction on error
        $conn->rollback();
        
        echo json_encode([
            'success' => false,
            'message' => 'Error reporting issue: ' . $e->getMessage(),
            'data' => null
        ]);
    }
}
?>