<?php
// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Include email functions
require_once 'send_email.php';

// Create a log file for this test
$logFile = 'email_test_log.txt';
file_put_contents($logFile, date('Y-m-d H:i:s') . " - Starting email test script\n", FILE_APPEND);

// Test connection to SMTP server
$connectionTest = testEmailConnection();
file_put_contents($logFile, date('Y-m-d H:i:s') . " - SMTP connection test: " . 
    ($connectionTest ? "Successful" : "Failed") . "\n", FILE_APPEND);

// If connection test passes, try sending a test email
if ($connectionTest) {
    // Test email parameters
    $testEmail = isset($_GET['email']) ? $_GET['email'] : 'test@example.com';
    $testName = 'Test User';
    $testToken = 'test_token_' . time();
    
    file_put_contents($logFile, date('Y-m-d H:i:s') . " - Attempting to send test email to: $testEmail\n", FILE_APPEND);
    
    // Try to send a test verification email
    $emailSent = sendVerificationEmail($testEmail, $testName, $testToken);
    
    if ($emailSent) {
        file_put_contents($logFile, date('Y-m-d H:i:s') . " - Test email sent successfully\n", FILE_APPEND);
        echo "<h1>Test Email Sent Successfully</h1>";
        echo "<p>A test verification email was sent to: $testEmail</p>";
        echo "<p>Check the email_log.txt and smtp_debug.log files for details.</p>";
    } else {
        file_put_contents($logFile, date('Y-m-d H:i:s') . " - Failed to send test email\n", FILE_APPEND);
        echo "<h1>Test Email Failed</h1>";
        echo "<p>Failed to send a test email to: $testEmail</p>";
        echo "<p>Check the email_log.txt and smtp_debug.log files for error details.</p>";
    }
} else {
    echo "<h1>SMTP Connection Test Failed</h1>";
    echo "<p>Could not connect to the SMTP server. Check your credentials and server settings.</p>";
    echo "<p>Check the email_test_log.txt and smtp_test_debug.log files for error details.</p>";
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email Test</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/css/bootstrap.min.css" rel="stylesheet">
    <style>
        body {
            padding: 20px;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
        }
        .card {
            margin-top: 20px;
        }
        pre {
            background-color: #f8f9fa;
            padding: 15px;
            border-radius: 5px;
            max-height: 300px;
            overflow: auto;
        }
    </style>
</head>
<body>
    <div class="container">
        <h2 class="mt-4">Email Test Tool</h2>
        
        <div class="card">
            <div class="card-header">
                Send Test Email
            </div>
            <div class="card-body">
                <form method="get" action="test_email.php">
                    <div class="mb-3">
                        <label for="email" class="form-label">Test Email Address</label>
                        <input type="email" class="form-control" id="email" name="email" required>
                        <div class="form-text">Enter an email address to send a test verification email.</div>
                    </div>
                    <button type="submit" class="btn btn-primary">Send Test Email</button>
                </form>
            </div>
        </div>
        
        <div class="card mt-4">
            <div class="card-header">
                Log Files
            </div>
            <div class="card-body">
                <h5>Email Test Log</h5>
                <pre><?php 
                    if (file_exists('email_test_log.txt')) {
                        echo htmlspecialchars(file_get_contents('email_test_log.txt'));
                    } else {
                        echo "No log file found.";
                    }
                ?></pre>
                
                <h5 class="mt-3">SMTP Debug Log</h5>
                <pre><?php 
                    if (file_exists('smtp_debug.log')) {
                        echo htmlspecialchars(file_get_contents('smtp_debug.log'));
                    } else {
                        echo "No SMTP debug log found.";
                    }
                ?></pre>
            </div>
        </div>
    </div>
</body>
</html>
