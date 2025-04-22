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

// Get user ID from session
$userId = $_SESSION['user_id'];

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
            'message' => 'User not found'
        ]);
        exit;
    }
    
    $user = $userResult->fetch_assoc();
    
    // Now get retailer-specific information
    $retailerQuery = "SELECT r.* 
                  FROM retailer_profiles r 
                  WHERE r.user_id = ?";
    
    $stmt = $conn->prepare($retailerQuery);
    $stmt->bind_param("i", $userId);
    $stmt->execute();
    $retailerResult = $stmt->get_result();
    
    // Merge retailer data with user data if available
    if ($retailerResult->num_rows > 0) {
        $retailer = $retailerResult->fetch_assoc();
        
        // Merge retailer data with user data
        $user = array_merge($user, $retailer);
    } else if ($user['role'] == 'retailer') {
        // If user is a retailer but no retailer data found, log warning
        error_log("Warning: User ID $userId has retailer role but no retailer data found");
    }
    
    // Return the combined user data
    echo json_encode([
        'success' => true,
        'user' => $user
    ]);
    
} catch (Exception $e) {
    error_log("Error in get_current_user.php: " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => 'Error: ' . $e->getMessage()
    ]);
}
?>
