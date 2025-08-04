<?php
// Start session if not already started
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Include database connection
require_once 'db_connection.php';

// Get current user ID from session
$user_id = $_SESSION['user_id'] ?? 0;

// Prepare SQL to get user data
$sql = "SELECT u.id, u.username, u.full_name, u.email, u.role, 
               rp.first_name, rp.last_name, rp.profile_image, rp.business_name
        FROM users u
        LEFT JOIN retailer_profiles rp ON u.id = rp.user_id
        WHERE u.id = ?";

$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $user_id);
$stmt->execute();
$result = $stmt->get_result();

$userData = [];

if ($result->num_rows > 0) {
    $userData = $result->fetch_assoc();
}

// Close statement
$stmt->close();

// Return user data as JSON
header('Content-Type: application/json');
echo json_encode($userData);
?>
