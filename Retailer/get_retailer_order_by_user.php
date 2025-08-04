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
$response = ['success' => false, 'data' => [], 'message' => ''];

try {
    // Get user_id from request or session
    $userId = null;
    
    if (isset($_GET['user_id']) && !empty($_GET['user_id'])) {
        $userId = $_GET['user_id'];
    } elseif (isset($_SESSION['user_id']) && !empty($_SESSION['user_id'])) {
        $userId = $_SESSION['user_id'];
    } else {
        throw new Exception("User ID is required");
    }
    
    // Query to get orders for specific user with profile information
    $query = "SELECT 
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
                ro.pickup_status,
                ro.subtotal,
                ro.tax,
                ro.discount,
                ro.total_amount,
                ro.payment_status,
                ro.consignment_term,
                ro.notes,
                ro.created_at,
                ro.updated_at,
                ro.delivery_proof_photo,
                ro.pickup_person_name,
                ro.pickup_id_verified,
                ro.pickup_notes,
                ro.user_id,
                -- Retailer profile information
                rp.first_name,
                rp.last_name,
                rp.business_name,
                rp.business_type,
                rp.province,
                rp.city,
                rp.phone,
                rp.approval_status
              FROM retailer_orders ro
              LEFT JOIN retailer_profiles rp ON ro.user_id = rp.user_id
              WHERE ro.user_id = ?
              ORDER BY ro.created_at DESC";
    
    $stmt = $conn->prepare($query);
    
    if (!$stmt) {
        throw new Exception("Prepare failed: " . $conn->error);
    }
    
    $stmt->bind_param("i", $userId);
    
    if (!$stmt->execute()) {
        throw new Exception("Execute failed: " . $stmt->error);
    }
    
    $result = $stmt->get_result();
    $orders = [];
    
    while ($row = $result->fetch_assoc()) {
        $orders[] = $row;
    }
    
    $response['success'] = true;
    $response['data'] = $orders;
    $response['message'] = "User orders retrieved successfully";
    $response['count'] = count($orders);
    $response['user_id'] = $userId;
    
} catch (Exception $e) {
    $response['message'] = "Error: " . $e->getMessage();
    error_log("Get user orders error: " . $e->getMessage());
}

echo json_encode($response);
?>