<?php
require_once 'config.php';

// Start session if not already started
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Check if it's a POST request
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    send_response('error', 'Invalid request method');
}

// Get parameters
$user_id = isset($_POST['user_id']) ? (int)$_POST['user_id'] : 0;
$verification = isset($_POST['verification']) ? (int)$_POST['verification'] : null;

if ($user_id <= 0) {
    send_response('error', 'Invalid user ID');
}

if ($verification === null || ($verification !== 0 && $verification !== 1)) {
    send_response('error', 'Invalid verification value');
}

// Update retailer verification status
$query = "UPDATE users SET email_verified = ? WHERE id = ? AND role = 'retailer'";
$stmt = $conn->prepare($query);
$stmt->bind_param("ii", $verification, $user_id);
$stmt->execute();

if ($stmt->affected_rows === 0) {
    send_response('error', 'Failed to update retailer verification status or no changes made');
}

send_response('success', 'Retailer verification status updated successfully');
?>
