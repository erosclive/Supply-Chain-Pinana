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

$message = '';
$messageType = '';

// Check if form was submitted
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Get email from form
    $email = isset($_POST['email']) ? trim($_POST['email']) : '';
    
    // Validate email
    if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $message = 'Please enter a valid email address.';
        $messageType = 'danger';
    } else {
        try {
            // Check if email exists and is not verified
            $check_sql = "SELECT id, full_name, email_verified FROM users WHERE email = ?";
            $check_stmt = mysqli_prepare($conn, $check_sql);
            
            if (!$check_stmt) {
                throw new Exception("Database error: " . mysqli_error($conn));
            }
            
            mysqli_stmt_bind_param($check_stmt, "s", $email);
            mysqli_stmt_execute($check_stmt);
            $result = mysqli_stmt_get_result($check_stmt);
            
            if (mysqli_num_rows($result) === 0) {
                $message = 'Email address not found. Please check your email or register a new account.';
                $messageType = 'danger';
            } else {
                $user = mysqli_fetch_assoc($result);
                
                if ($user['email_verified'] == 1) {
                    $message = 'This email has already been verified. You can log in to your account.';
                    $messageType = 'info';
                } else {
                    // Generate new verification token
                    $verification_token = bin2hex(random_bytes(32));
                    
                    // Set token expiration (24 hours from now)
                    $token_expiration = date('Y-m-d H:i:s', strtotime('+24 hours'));
                    
                    // Update user with new token
                    $update_sql = "UPDATE users SET verification_token = ?, verification_expires = ? WHERE id = ?";
                    $update_stmt = mysqli_prepare($conn, $update_sql);
                    
                    if (!$update_stmt) {
                        throw new Exception("Database error: " . mysqli_error($conn));
                    }
                    
                    mysqli_stmt_bind_param($update_stmt, "ssi", $verification_token, $token_expiration, $user['id']);
                    
                    if (!mysqli_stmt_execute($update_stmt)) {
                        throw new Exception("Error updating verification token: " . mysqli_stmt_error($update_stmt));
                    }
                    
                    mysqli_stmt_close($update_stmt);
                    
                    // Send verification email
                    $emailSent = sendVerificationEmail($email, $user['full_name'], $verification_token);
                    
                    if ($emailSent) {
                        $message = 'A new verification email has been sent. Please check your inbox and spam folder.';
                        $messageType = 'success';
                        
                        // Log success
                        file_put_contents($logFile, date('Y-m-d H:i:s') . " - Resent verification email to: $email\n", FILE_APPEND);
                    } else {
                        $message = 'Failed to send verification email. Please try again later.';
                        $messageType = 'danger';
                        
                        // Log error
                        file_put_contents($logFile, date('Y-m-d H:i:s') . " - Failed to resend verification email to: $email\n", FILE_APPEND);
                    }
                }
            }
            
            mysqli_stmt_close($check_stmt);
            
        } catch (Exception $e) {
            $message = 'An error occurred: ' . $e->getMessage();
            $messageType = 'danger';
            
            // Log error
            file_put_contents($logFile, date('Y-m-d H:i:s') . " - Error in resend verification: " . $e->getMessage() . "\n", FILE_APPEND);
        }
    }
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Resend Verification Email - Piñana Gourmet</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/css/bootstrap.min.css" rel="stylesheet">
    <style>
        body {
            background-color: #f8f9fa;
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
        }
        .verification-container {
            max-width: 600px;
            margin: 80px auto;
            padding: 40px;
            background-color: #fff;
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
        }
        .verification-title {
            font-size: 24px;
            font-weight: 600;
            margin-bottom: 20px;
            color: #212529;
            text-align: center;
        }
        .verification-message {
            font-size: 16px;
            color: #6c757d;
            margin-bottom: 30px;
            line-height: 1.6;
            text-align: center;
        }
        .btn-primary {
            background-color: #0d6efd;
            border-color: #0d6efd;
            padding: 10px 24px;
            font-weight: 500;
            border-radius: 6px;
        }
        .btn-primary:hover {
            background-color: #0b5ed7;
            border-color: #0a58ca;
        }
        .logo {
            max-width: 180px;
            margin: 0 auto 30px;
            display: block;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="verification-container">
            <img src="images/final-light.png" alt="Piñana Gourmet Logo" class="logo">
            <h1 class="verification-title">Resend Verification Email</h1>
            <p class="verification-message">
                Enter your email address below to receive a new verification email.
            </p>
            
            <?php if (!empty($message)): ?>
                <div class="alert alert-<?php echo $messageType; ?> mb-4">
                    <?php echo $message; ?>
                </div>
            <?php endif; ?>
            
            <form method="post" action="resend_verification.php">
                <div class="mb-3">
                    <label for="email" class="form-label">Email Address</label>
                    <input type="email" class="form-control" id="email" name="email" required>
                </div>
                <div class="d-grid gap-2">
                    <button type="submit" class="btn btn-primary">Send Verification Email</button>
                    <a href="index.html" class="btn btn-outline-secondary">Back to Login</a>
                </div>
            </form>
        </div>
    </div>
</body>
</html>
