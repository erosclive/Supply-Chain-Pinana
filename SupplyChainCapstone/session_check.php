<?php
// Start session
session_start();

// Check if user is logged in
if (!isset($_SESSION["logged_in"]) || $_SESSION["logged_in"] !== true) {
    // Redirect to login page
    header("Location: login.php");
    exit();
}

// Optional: Check if session has expired (e.g., after 30 minutes)
if (isset($_SESSION["last_activity"]) && (time() - $_SESSION["last_activity"] > 1800)) {
    // Session expired, destroy session and redirect to login
    session_unset();
    session_destroy();
    header("Location: login.php?expired=1");
    exit();
}

// Update last activity time
$_SESSION["last_activity"] = time();

// Optional: Check user role for restricted pages
function requireRole($role) {
    if (!isset($_SESSION["role"]) || $_SESSION["role"] !== $role) {
        header("Location: unauthorized.php");
        exit();
    }
}
?>