<?php
// auth_check.php
// This file checks if the user is authenticated and is a retailer

// Start session if not already started
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Check if user is logged in
if (!isset($_SESSION['user_id'])) {
    // Redirect to login page
    header("Location: login.php?redirect=" . urlencode($_SERVER['REQUEST_URI']));
    exit;
}

// Include database connection
require_once 'db_connection.php';

// Get user ID from session
$userId = $_SESSION['user_id'];

// Check if user exists and is a retailer
$userQuery = "SELECT u.id, u.username, u.email, u.full_name, u.role 
              FROM users u 
              WHERE u.id = ?";

$stmt = $conn->prepare($userQuery);
$stmt->bind_param("i", $userId);
$stmt->execute();
$userResult = $stmt->get_result();

if ($userResult->num_rows === 0) {
    // User not found, redirect to login
    session_destroy();
    header("Location: login.php?redirect=" . urlencode($_SERVER['REQUEST_URI']));
    exit;
}

$user = $userResult->fetch_assoc();

// Check if user is a retailer
if ($user['role'] !== 'retailer') {
    // Not a retailer, redirect to access denied page
    header("Location: access_denied.php");
    exit;
}

// Get retailer profile
$retailerQuery = "SELECT r.* 
                  FROM retailer_profiles r 
                  WHERE r.user_id = ?";

$stmt = $conn->prepare($retailerQuery);
$stmt->bind_param("i", $userId);
$stmt->execute();
$retailerResult = $stmt->get_result();

if ($retailerResult->num_rows === 0) {
    // Retailer profile not found, redirect to complete profile page
    header("Location: complete_profile.php");
    exit;
}

$retailer = $retailerResult->fetch_assoc();

// Set retailer data in session for easy access
$_SESSION['retailer_id'] = $retailer['id'];
$_SESSION['retailer_name'] = $retailer['name'];

// User is authenticated and is a retailer with a profile
// Continue with the page
?>