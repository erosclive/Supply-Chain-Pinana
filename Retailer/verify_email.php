<?php
// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Include database connection
require_once 'db_connection.php';
// Include email functions
require_once 'send_email.php';

// Log file for debugging
$logFile = 'verification_log.txt';

// Check if token is provided
if (!isset($_GET['token']) || empty($_GET['token'])) {
    // Log error
    file_put_contents($logFile, date('Y-m-d H:i:s') . " - Error: No token provided\n", FILE_APPEND);
    
    // Redirect to error page
    header('Location: verification_error.php?error=no_token');
    exit;
}

$token = $_GET['token'];

// Log verification attempt
file_put_contents($logFile, date('Y-m-d H:i:s') . " - Verification attempt with token: $token\n", FILE_APPEND);

try {
    // Check if token exists and is valid
    $check_token_sql = "SELECT id, email, full_name, verification_expires FROM users WHERE verification_token = ? AND email_verified = 0";
    $check_token_stmt = mysqli_prepare($conn, $check_token_sql);
    
    if (!$check_token_stmt) {
        throw new Exception("Database error: " . mysqli_error($conn));
    }
    
    mysqli_stmt_bind_param($check_token_stmt, "s", $token);
    mysqli_stmt_execute($check_token_stmt);
    $result = mysqli_stmt_get_result($check_token_stmt);
    
    if (mysqli_num_rows($result) === 0) {
        // Log error
        file_put_contents($logFile, date('Y-m-d H:i:s') . " - Error: Invalid or already used token\n", FILE_APPEND);
        
        // Redirect to error page
        header('Location: verification_error.php?error=invalid_token');
        exit;
    }
    
    $user = mysqli_fetch_assoc($result);
    mysqli_stmt_close($check_token_stmt);
    
    // Check if token has expired
    $now = new DateTime();
    $expires = new DateTime($user['verification_expires']);
    
    if ($now > $expires) {
        // Log error
        file_put_contents($logFile, date('Y-m-d H:i:s') . " - Error: Token expired for user ID: " . $user['id'] . "\n", FILE_APPEND);
        
        // Redirect to error page
        header('Location: verification_error.php?error=token_expired');
        exit;
    }
    
    // Update user as verified
    $update_sql = "UPDATE users SET email_verified = 1, verification_token = NULL WHERE id = ?";
    $update_stmt = mysqli_prepare($conn, $update_sql);
    
    if (!$update_stmt) {
        throw new Exception("Database error: " . mysqli_error($conn));
    }
    
    mysqli_stmt_bind_param($update_stmt, "i", $user['id']);
    
    if (!mysqli_stmt_execute($update_stmt)) {
        throw new Exception("Error updating user verification status: " . mysqli_stmt_error($update_stmt));
    }
    
    mysqli_stmt_close($update_stmt);
    
    // Send welcome email
    $welcomeEmailSent = sendWelcomeEmail($user['email'], $user['full_name']);
    
    // Log welcome email status
    if ($welcomeEmailSent) {
        file_put_contents($logFile, date('Y-m-d H:i:s') . " - Welcome email sent to: " . $user['email'] . "\n", FILE_APPEND);
    } else {
        file_put_contents($logFile, date('Y-m-d H:i:s') . " - Failed to send welcome email to: " . $user['email'] . "\n", FILE_APPEND);
    }
    
    // Log success
    file_put_contents($logFile, date('Y-m-d H:i:s') . " - Success: Email verified for user ID: " . $user['id'] . "\n", FILE_APPEND);
    
    // Redirect to success page
    header('Location: verification_success.php');
    exit;
    
} catch (Exception $e) {
    // Log error
    file_put_contents($logFile, date('Y-m-d H:i:s') . " - Error: " . $e->getMessage() . "\n", FILE_APPEND);
    
    // Redirect to error page
    header('Location: verification_error.php?error=system_error');
    exit;
}

// Close connection
if (isset($conn) && $conn) {
    mysqli_close($conn);
}
?>
