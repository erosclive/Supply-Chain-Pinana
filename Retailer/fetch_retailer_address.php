<?php
// Include database connection
require_once 'db_connection.php';

// Set header to return JSON
header('Content-Type: application/json');

// Check if user_id is provided
if (!isset($_GET['user_id'])) {
    echo json_encode([
        'success' => false,
        'message' => 'User ID is required'
    ]);
    exit;
}

$userId = $_GET['user_id'];

try {
    // Query to get retailer address from retailer_profiles table
    $query = "SELECT 
                id, 
                user_id, 
                business_name, 
                business_address, 
                province, 
                city, 
                barangay, 
                house_number, 
                address_notes, 
                phone
              FROM retailer_profiles 
              WHERE user_id = ?";
    
    $stmt = $conn->prepare($query);
    $stmt->bind_param("i", $userId);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        echo json_encode([
            'success' => false,
            'message' => 'Retailer profile not found'
        ]);
        exit;
    }
    
    $retailer = $result->fetch_assoc();
    
    // Format the address
    $addressParts = [];
    if (!empty($retailer['house_number'])) $addressParts[] = $retailer['house_number'];
    if (!empty($retailer['address_notes'])) $addressParts[] = $retailer['address_notes'];
    if (!empty($retailer['barangay'])) $addressParts[] = $retailer['barangay'];
    if (!empty($retailer['city'])) $addressParts[] = $retailer['city'];
    if (!empty($retailer['province'])) $addressParts[] = $retailer['province'];
    
    // Use business_address if available, otherwise use the constructed address
    $formattedAddress = !empty($retailer['business_address']) ? 
                        $retailer['business_address'] : 
                        implode(', ', $addressParts);
    
    $retailer['formatted_address'] = $formattedAddress;
    
    // Debug output
    error_log("Retailer address fetched for user_id: $userId - Address: $formattedAddress");
    
    echo json_encode([
        'success' => true,
        'retailer' => $retailer
    ]);
    
} catch (Exception $e) {
    error_log("Error in fetch_retailer_address.php: " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => 'Error: ' . $e->getMessage()
    ]);
}

$conn->close();
?>
