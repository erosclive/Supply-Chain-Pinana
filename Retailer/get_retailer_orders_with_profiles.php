<?php
// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Include database connection
require_once 'db_connection.php';

// Set header to return JSON
header('Content-Type: application/json');

// Initialize response array
$response = ['success' => false, 'data' => [], 'message' => ''];

try {
    // Query to join retailer_orders with retailer_profiles using user_id
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
                rp.birthday,
                rp.age,
                rp.nationality,
                rp.business_name,
                rp.business_type,
                rp.province,
                rp.city,
                rp.barangay,
                rp.house_number,
                rp.address_notes,
                rp.business_address,
                rp.phone,
                rp.profile_image,
                rp.facebook,
                rp.instagram,
                rp.tiktok,
                rp.gov_id_type,
                rp.gov_id_file_path,
                rp.business_doc_type,
                rp.business_doc_file_path,
                rp.approval_status
              FROM retailer_orders ro
              LEFT JOIN retailer_profiles rp ON ro.user_id = rp.user_id
              ORDER BY ro.created_at DESC";
    
    $result = $conn->query($query);
    
    if (!$result) {
        throw new Exception("Query failed: " . $conn->error);
    }
    
    $orders = [];
    while ($row = $result->fetch_assoc()) {
        $orders[] = $row;
    }
    
    $response['success'] = true;
    $response['data'] = $orders;
    $response['message'] = "Orders retrieved successfully";
    $response['count'] = count($orders);
    
} catch (Exception $e) {
    $response['message'] = "Error: " . $e->getMessage();
    error_log("Get orders error: " . $e->getMessage());
}

echo json_encode($response);
?>