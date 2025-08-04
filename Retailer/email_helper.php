<?php
// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Include PHPMailer classes
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;

// Function to send verification email
function sendVerificationEmail($to, $token, $firstName, $lastName, $logFile = null) {
    // Log attempt
    if ($logFile) {
        file_put_contents($logFile, date('Y-m-d H:i:s') . " - Attempting to send verification email to: $to\n", FILE_APPEND);
    }
    
    // Generate verification URL
    $verification_url = "http://" . $_SERVER['HTTP_HOST'] . "/verify_email.php?token=" . $token;
    
    // Email subject
    $subject = "Verify Your Piñana Gourmet Account";
    
    // Email body
    $message = getVerificationEmailTemplate($verification_url, $firstName, $lastName);
    
    // Try to send using SMTP if configured
    if (defined('SMTP_HOST') && defined('SMTP_USERNAME') && defined('SMTP_PASSWORD')) {
        return sendEmailWithSMTP($to, $subject, $message, $logFile);
    } else {
        // Fall back to PHP mail() function
        return sendEmailWithMailFunction($to, $subject, $message, $logFile);
    }
}

// Function to send email using PHP mail() function
function sendEmailWithMailFunction($to, $subject, $message, $logFile = null) {
    // Email headers
    $headers = "MIME-Version: 1.0" . "\r\n";
    $headers .= "Content-type:text/html;charset=UTF-8" . "\r\n";
    $headers .= "From: Piñana Gourmet <noreply@pinanagourmet.com>" . "\r\n";
    
    // Log attempt
    if ($logFile) {
        file_put_contents($logFile, date('Y-m-d H:i:s') . " - Attempting to send email using mail() function to: $to\n", FILE_APPEND);
    }
    
    // Send email
    $mail_sent = mail($to, $subject, $message, $headers);
    
    if ($logFile) {
        if ($mail_sent) {
            file_put_contents($logFile, date('Y-m-d H:i:s') . " - Email sent successfully using mail() function to: $to\n", FILE_APPEND);
        } else {
            file_put_contents($logFile, date('Y-m-d H:i:s') . " - Failed to send email using mail() function to: $to\n", FILE_APPEND);
            
            // Save the email content to a file for debugging
            $email_content = "To: $to\nSubject: $subject\nHeaders: $headers\n\n$message";
            file_put_contents('email_debug_' . time() . '.html', $email_content);
            file_put_contents($logFile, date('Y-m-d H:i:s') . " - Email content saved to debug file\n", FILE_APPEND);
            
            // Log PHP mail error if any
            $error = error_get_last();
            if ($error) {
                file_put_contents($logFile, date('Y-m-d H:i:s') . " - PHP Error: " . print_r($error, true) . "\n", FILE_APPEND);
            }
        }
    }
    
    return $mail_sent;
}

// Function to send email using SMTP (simplified version without PHPMailer)
function sendEmailWithSMTP($to, $subject, $message, $logFile = null) {
    // This is a placeholder for SMTP functionality
    // For a real implementation, you would need to use PHPMailer or another library
    
    if ($logFile) {
        file_put_contents($logFile, date('Y-m-d H:i:s') . " - SMTP sending is not implemented in this simplified version\n", FILE_APPEND);
    }
    
    // For now, we'll use the mail() function as a fallback
    return sendEmailWithMailFunction($to, $subject, $message, $logFile);
}

// Function to get the verification email template
function getVerificationEmailTemplate($verification_url, $firstName, $lastName) {
    return "
    <html>
    <head>
        <title>Verify Your Piñana Gourmet Account</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #f2d045; padding: 20px; text-align: center; }
            .content { padding: 20px; background-color: #fff; border: 1px solid #ddd; }
            .button { display: inline-block; padding: 10px 20px; background-color: #f2d045; color: #333; 
                      text-decoration: none; font-weight: bold; border-radius: 4px; }
            .footer { margin-top: 20px; font-size: 12px; color: #777; text-align: center; }
        </style>
    </head>
    <body>
        <div class='container'>
            <div class='header'>
                <h2>Welcome to Piñana Gourmet!</h2>
            </div>
            <div class='content'>
                <p>Hello $firstName $lastName,</p>
                <p>Thank you for registering with Piñana Gourmet. To complete your registration and activate your account, please click the button below:</p>
                <p style='text-align: center;'>
                    <a href='$verification_url' class='button'>Verify Email Address</a>
                </p>
                <p>Or copy and paste the following link into your browser:</p>
                <p>$verification_url</p>
                <p>This link will expire in 24 hours.</p>
                <p>If you did not create an account, please ignore this email.</p>
            </div>
            <div class='footer'>
                <p>&copy; " . date('Y') . " Piñana Gourmet. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    ";
}

// Function to send a test email (for debugging)
function sendTestEmail($to, $logFile = null) {
    if ($logFile) {
        file_put_contents($logFile, date('Y-m-d H:i:s') . " - Sending test email to: $to\n", FILE_APPEND);
    }
    
    $subject = "Test Email from Piñana Gourmet";
    $message = "
    <html>
    <head>
        <title>Test Email from Piñana Gourmet</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #f2d045; padding: 20px; text-align: center; }
            .content { padding: 20px; background-color: #fff; border: 1px solid #ddd; }
            .footer { margin-top: 20px; font-size: 12px; color: #777; text-align: center; }
        </style>
    </head>
    <body>
        <div class='container'>
            <div class='header'>
                <h2>Test Email</h2>
            </div>
            <div class='content'>
                <p>This is a test email to verify that the email system is working correctly.</p>
                <p>If you received this email, it means your email configuration is working!</p>
                <p>Time sent: " . date('Y-m-d H:i:s') . "</p>
            </div>
            <div class='footer'>
                <p>&copy; " . date('Y') . " Piñana Gourmet. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    ";
    
    // Email headers
    $headers = "MIME-Version: 1.0" . "\r\n";
    $headers .= "Content-type:text/html;charset=UTF-8" . "\r\n";
    $headers .= "From: Piñana Gourmet <noreply@pinanagourmet.com>" . "\r\n";
    
    $mail_sent = mail($to, $subject, $message, $headers);
    
    if ($logFile) {
        if ($mail_sent) {
            file_put_contents($logFile, date('Y-m-d H:i:s') . " - Test email sent successfully to: $to\n", FILE_APPEND);
        } else {
            file_put_contents($logFile, date('Y-m-d H:i:s') . " - Failed to send test email to: $to\n", FILE_APPEND);
            
            // Log PHP mail error if any
            $error = error_get_last();
            if ($error) {
                file_put_contents($logFile, date('Y-m-d H:i:s') . " - PHP Error: " . print_r($error, true) . "\n", FILE_APPEND);
            }
        }
    }
    
    return $mail_sent;
}

// Save email to file as a fallback when mail sending fails
function saveEmailToFile($to, $subject, $message, $logFile = null) {
    $emailDir = 'saved_emails';
    
    // Create directory if it doesn't exist
    if (!file_exists($emailDir)) {
        mkdir($emailDir, 0777, true);
    }
    
    $filename = $emailDir . '/email_' . time() . '_' . md5($to) . '.html';
    $content = "To: $to\nSubject: $subject\nDate: " . date('Y-m-d H:i:s') . "\n\n$message";
    
    $saved = file_put_contents($filename, $content);
    
    if ($logFile) {
        if ($saved) {
            file_put_contents($logFile, date('Y-m-d H:i:s') . " - Email saved to file: $filename\n", FILE_APPEND);
        } else {
            file_put_contents($logFile, date('Y-m-d H:i:s') . " - Failed to save email to file\n", FILE_APPEND);
        }
    }
    
    return $saved;
}

// Define SMTP settings - Replace these with your actual SMTP settings
if (!defined('SMTP_HOST')) {
    define('SMTP_HOST', 'smtp.gmail.com');  // e.g., smtp.gmail.com
    define('SMTP_PORT', 587);               // e.g., 587 for TLS
    define('SMTP_USERNAME', 'your-email@gmail.com');
    define('SMTP_PASSWORD', 'your-app-password');
    define('SMTP_FROM_EMAIL', 'noreply@pinanagourmet.com');
    define('SMTP_FROM_NAME', 'Piñana Gourmet');
}
?>
