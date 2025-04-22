<?php
// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Include PHPMailer classes
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;

// Check if PHPMailer is installed via Composer
if (file_exists('vendor/autoload.php')) {
    require 'vendor/autoload.php';
} else {
    // Manual include of PHPMailer files
    require_once __DIR__ . '/PHPMailer/src/Exception.php';
    require_once __DIR__ . '/PHPMailer/src/PHPMailer.php';
    require_once __DIR__ . '/PHPMailer/src/SMTP.php';
}

// Function to send verification email
function sendVerificationEmail($email, $name, $token) {
    // Log file for debugging
    $logFile = 'email_log.txt';
    file_put_contents($logFile, date('Y-m-d H:i:s') . " - Attempting to send verification email to: $email\n", FILE_APPEND);
    
    // Create a new PHPMailer instance
    $mail = new PHPMailer(true);
    
    try {
        // Server settings with improved error handling
        $mail->SMTPDebug = 3; // Enable verbose debug output (3 = write to log file)
        $mail->Debugoutput = function($str, $level) {
            file_put_contents('smtp_debug.log', date('Y-m-d H:i:s') . ": $str\n", FILE_APPEND);
        };
        
        $mail->isSMTP();
        $mail->Host       = 'smtp.gmail.com';
        $mail->SMTPAuth   = true;
        $mail->Username   = 'wantargaryen@gmail.com'; // Your Gmail address
        $mail->Password   = 'kjiz fcxe ajri xuwu';    // Your Gmail app password
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Port       = 587;
        $mail->Timeout    = 30; // Set timeout to 30 seconds (default is 10)
        $mail->SMTPKeepAlive = true; // Keep the SMTP connection open for multiple emails
        
        // Optional: Add this if you have SSL certificate issues
        $mail->SMTPOptions = array(
            'ssl' => array(
                'verify_peer' => false,
                'verify_peer_name' => false,
                'allow_self_signed' => true
            )
        );
        
        // Recipients
        $mail->setFrom('wantargaryen@gmail.com', 'Pinana Gourmet');
        $mail->addAddress($email, $name);
        
        // Content
        $mail->isHTML(true);
        $mail->Subject = 'Verify Your Pinana Gourmet Account';
        
        // Generate verification URL - Use full absolute URL
        $protocol = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? 'https://' : 'http://';
        $host = isset($_SERVER['HTTP_HOST']) ? $_SERVER['HTTP_HOST'] : 'localhost';

        // Get the subdirectory from the current script path
        $scriptPath = $_SERVER['SCRIPT_NAME'] ?? '';
        $subdirectory = dirname($scriptPath);
        $subdirectory = ($subdirectory == '/' || $subdirectory == '\\') ? '' : $subdirectory;

        // Create the verification URL with the correct path
        $verificationUrl = $protocol . $host . $subdirectory . '/verify_email.php?token=' . $token;

        // Log the generated URL for debugging
        file_put_contents('verification_url_log.txt', date('Y-m-d H:i:s') . " - Generated URL: $verificationUrl\n", FILE_APPEND);
        
        // Email body with enhanced design
        
        // Embed logo image directly in the email using base64 encoding
        $logoPath = __DIR__ . '/images/final-light.png';
        $logoData = '';
        
        if (file_exists($logoPath)) {
            $logoData = base64_encode(file_get_contents($logoPath));
            file_put_contents('email_log.txt', date('Y-m-d H:i:s') . " - Logo found and encoded\n", FILE_APPEND);
        } else {
            // Try with parent directory
            $logoPath = dirname(__DIR__) . '/images/final-light.png';
            if (file_exists($logoPath)) {
                $logoData = base64_encode(file_get_contents($logoPath));
                file_put_contents('email_log.txt', date('Y-m-d H:i:s') . " - Logo found in parent directory and encoded\n", FILE_APPEND);
            } else {
                file_put_contents('email_log.txt', date('Y-m-d H:i:s') . " - Logo not found at: " . $logoPath . "\n", FILE_APPEND);
            }
        }
        
        $logoImg = !empty($logoData) ? 
            '<img src="data:image/png;base64,' . $logoData . '" alt="Pinana Gourmet" style="max-width: 180px; height: auto;">' : 
            'Piñana Gourmet';
        
        $mail->Body = '
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Verify Your Piñana Gourmet Account</title>
            <style>
                @import url(\'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap\');
                
                body {
                    font-family: \'Poppins\', Arial, sans-serif;
                    line-height: 1.6;
                    color: #333333;
                    margin: 0;
                    padding: 0;
                    background-color: #f9f9f9;
                }
                
                .email-container {
                    max-width: 600px;
                    margin: 0 auto;
                    background-color: #ffffff;
                    border-radius: 8px;
                    overflow: hidden;
                    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
                }
                
                .email-header {
                    background-color: #f2d045;
                    padding: 30px 0;
                    text-align: center;
                }
                
                .email-header img {
                    max-width: 180px;
                    height: auto;
                }
                
                .email-content {
                    padding: 40px 30px;
                    background-color: #ffffff;
                }
                
                .greeting {
                    font-size: 22px;
                    font-weight: 600;
                    margin-bottom: 20px;
                    color: #333333;
                }
                
                .message {
                    font-size: 16px;
                    margin-bottom: 25px;
                    color: #555555;
                }
                
                .button-container {
                    text-align: center;
                    margin: 35px 0;
                }
                
                .button {
                    display: inline-block;
                    padding: 14px 30px;
                    background-color: #f2d045;
                    color: #333333;
                    text-decoration: none;
                    border-radius: 6px;
                    font-weight: 600;
                    font-size: 16px;
                    box-shadow: 0 3px 6px rgba(0, 0, 0, 0.1);
                    transition: all 0.3s ease;
                }
                
                .button:hover {
                    background-color: #e6c53d;
                    transform: translateY(-2px);
                }
                
                .alternative-link {
                    font-size: 14px;
                    color: #777777;
                    margin-bottom: 15px;
                }
                
                .link-container {
                    background-color: #f5f5f5;
                    padding: 15px;
                    border-radius: 6px;
                    margin-bottom: 25px;
                    word-break: break-all;
                }
                
                .link {
                    color: #0066cc;
                    font-size: 14px;
                }
                
                .note {
                    font-size: 14px;
                    color: #888888;
                    margin-top: 25px;
                    padding-top: 20px;
                    border-top: 1px solid #eeeeee;
                }
                
                .email-footer {
                    background-color: #f8f8f8;
                    padding: 25px 30px;
                    text-align: center;
                    color: #888888;
                    font-size: 13px;
                    border-top: 1px solid #eeeeee;
                }
                
                .social-links {
                    margin: 15px 0;
                }
                
                .social-link {
                    display: inline-block;
                    margin: 0 8px;
                    color: #555555;
                    text-decoration: none;
                    font-weight: 500;
                }
                
                @media only screen and (max-width: 600px) {
                    .email-content {
                        padding: 30px 20px;
                    }
                    
                    .greeting {
                        font-size: 20px;
                    }
                    
                    .message {
                        font-size: 15px;
                    }
                    
                    .button {
                        padding: 12px 25px;
                        font-size: 15px;
                    }
                }
            </style>
        </head>
        <body>
            <div class="email-container">
                <div class="email-header" style="background-color: #f2d045; padding: 30px 0; text-align: center;">
                    ' . $logoImg . '
                </div>
                
                <div class="email-content">
                    <div class="greeting">Hello, ' . $name . '!</div>
                    
                    <div class="message">
                        Thank you for registering as a retailer with Pinana Gourmet. We\'re excited to have you join our community of quality food retailers!
                    </div>
                    
                    <div class="message">
                        To complete your registration and activate your account, please verify your email address by clicking the button below:
                    </div>
                    
                    <div class="button-container">
                        <a href="' . $verificationUrl . '" class="button">Verify Email Address</a>
                    </div>
                    
                    <div class="alternative-link">
                        If the button above doesn\'t work, you can also copy and paste the following link into your browser:
                    </div>
                    
                    <div class="link-container">
                        <a href="' . $verificationUrl . '" class="link">' . $verificationUrl . '</a>
                    </div>
                    
                    <div class="note">
                        This verification link will expire in 24 hours. If you did not create an account with Pinana Gourmet, please ignore this email.
                    </div>
                </div>
                
                <div class="email-footer">
                    <div class="social-links">
                        <a href="#" class="social-link">Facebook</a> • 
                        <a href="#" class="social-link">Instagram</a> • 
                        <a href="#" class="social-link">Tiktok</a>
                    </div>
                    <div>
                        &copy; ' . date('Y') . ' Piñana Gourmet. All rights reserved.
                    </div>
                    <div style="margin-top: 10px;">
                        Brgy. San Isidro, Calauan, Laguna Philippines
                    </div>
                </div>
            </div>
        </body>
        </html>
        ';
        
        // Plain text version
        $mail->AltBody = "Hello $name,\n\n"
            . "Thank you for registering as a retailer with Pinana Gourmet. To complete your registration and activate your account, please verify your email address by clicking the link below:\n\n"
            . "$verificationUrl\n\n"
            . "This verification link will expire in 24 hours.\n\n"
            . "If you did not create an account, please ignore this email.\n\n"
            . "Piñana Gourmet";
        
        // Send email
        $mail->send();
        
        // Log success
        file_put_contents($logFile, date('Y-m-d H:i:s') . " - Verification email sent successfully to: $email\n", FILE_APPEND);
        
        return true;
    } catch (Exception $e) {
        // Log error
        file_put_contents($logFile, date('Y-m-d H:i:s') . " - Error sending verification email: " . $mail->ErrorInfo . "\n", FILE_APPEND);
        
        return false;
    }
}

// Function to send a welcome email after verification
function sendWelcomeEmail($email, $name) {
    // Log file for debugging
    $logFile = 'email_log.txt';
    file_put_contents($logFile, date('Y-m-d H:i:s') . " - Attempting to send welcome email to: $email\n", FILE_APPEND);
    
    // Create a new PHPMailer instance
    $mail = new PHPMailer(true);
    
    try {
        // Server settings
        $mail->SMTPDebug = 3; // Enable verbose debug output
        $mail->Debugoutput = function($str, $level) {
            file_put_contents('smtp_debug.log', date('Y-m-d H:i:s') . ": $str\n", FILE_APPEND);
        };
        
        $mail->isSMTP();
        $mail->Host       = 'smtp.gmail.com';
        $mail->SMTPAuth   = true;
        $mail->Username   = 'wantargaryen@gmail.com'; // Your Gmail address
        $mail->Password   = 'kjiz fcxe ajri xuwu';    // Your Gmail app password
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Port       = 587;
        
        // Optional: Add this if you have SSL certificate issues
        $mail->SMTPOptions = array(
            'ssl' => array(
                'verify_peer' => false,
                'verify_peer_name' => false,
                'allow_self_signed' => true
            )
        );
        
        // Recipients
        $mail->setFrom('wantargaryen@gmail.com', 'Pinana Gourmet');
        $mail->addAddress($email, $name);
        
        // Content
        $mail->isHTML(true);
        $mail->Subject = 'Welcome to Pinana Gourmet!';
        
        // Login URL
        $protocol = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? 'https://' : 'http://';
        $host = isset($_SERVER['HTTP_HOST']) ? $_SERVER['HTTP_HOST'] : 'localhost';
        
        // Get the subdirectory from the current script path
        $scriptPath = $_SERVER['SCRIPT_NAME'] ?? '';
        $subdirectory = dirname($scriptPath);
        $subdirectory = ($subdirectory == '/' || $subdirectory == '\\') ? '' : $subdirectory;
        
        $loginUrl = $protocol . $host . $subdirectory . '/index.html';
        
        // Email body with enhanced design
        // Embed logo image directly in the email using base64 encoding
        $logoPath = __DIR__ . '/images/final-light.png';
        $logoData = '';
        
        if (file_exists($logoPath)) {
            $logoData = base64_encode(file_get_contents($logoPath));
            file_put_contents('email_log.txt', date('Y-m-d H:i:s') . " - Logo found and encoded for welcome email\n", FILE_APPEND);
        } else {
            // Try with parent directory
            $logoPath = dirname(__DIR__) . '/images/final-light.png';
            if (file_exists($logoPath)) {
                $logoData = base64_encode(file_get_contents($logoPath));
                file_put_contents('email_log.txt', date('Y-m-d H:i:s') . " - Logo found in parent directory and encoded for welcome email\n", FILE_APPEND);
            } else {
                file_put_contents('email_log.txt', date('Y-m-d H:i:s') . " - Logo not found at: " . $logoPath . "\n", FILE_APPEND);
            }
        }
        
        $logoImg = !empty($logoData) ? 
            '<img src="data:image/png;base64,' . $logoData . '" alt="Piñana Gourmet Logo" style="max-width: 180px; height: auto;">' : 
            'Piñana Gourmet';
        
        $mail->Body = '
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Welcome to Pinana Gourmet!</title>
            <style>
                @import url(\'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap\');
                
                body {
                    font-family: \'Poppins\', Arial, sans-serif;
                    line-height: 1.6;
                    color: #333333;
                    margin: 0;
                    padding: 0;
                    background-color: #f9f9f9;
                }
                
                .email-container {
                    max-width: 600px;
                    margin: 0 auto;
                    background-color: #ffffff;
                    border-radius: 8px;
                    overflow: hidden;
                    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
                }
                
                .email-header {
                    background-color: #f2d045;
                    padding: 30px 0;
                    text-align: center;
                }
                
                .email-header img {
                    max-width: 180px;
                    height: auto;
                }
                
                .banner {
                    width: 100%;
                    height: auto;
                    display: block;
                }
                
                .email-content {
                    padding: 40px 30px;
                    background-color: #ffffff;
                }
                
                .greeting {
                    font-size: 24px;
                    font-weight: 600;
                    margin-bottom: 20px;
                    color: #333333;
                }
                
                .message {
                    font-size: 16px;
                    margin-bottom: 25px;
                    color: #555555;
                }
                
                .features {
                    margin: 30px 0;
                    padding: 25px;
                    background-color: #f9f9f9;
                    border-radius: 8px;
                }
                
                .feature {
                    margin-bottom: 15px;
                    display: flex;
                    align-items: flex-start;
                }
                
                .feature-icon {
                    width: 24px;
                    height: 24px;
                    margin-right: 15px;
                    color: #f2d045;
                }
                
                .feature-text {
                    flex: 1;
                    font-size: 15px;
                    color: #555555;
                }
                
                .button-container {
                    text-align: center;
                    margin: 35px 0;
                }
                
                .button {
                    display: inline-block;
                    padding: 14px 30px;
                    background-color: #f2d045;
                    color: #333333;
                    text-decoration: none;
                    border-radius: 6px;
                    font-weight: 600;
                    font-size: 16px;
                    box-shadow: 0 3px 6px rgba(0, 0, 0, 0.1);
                    transition: all 0.3s ease;
                }
                
                .button:hover {
                    background-color: #e6c53d;
                    transform: translateY(-2px);
                }
                
                .support {
                    margin-top: 30px;
                    padding-top: 25px;
                    border-top: 1px solid #eeeeee;
                    font-size: 15px;
                    color: #666666;
                }
                
                .support a {
                    color: #0066cc;
                    text-decoration: none;
                }
                
                .email-footer {
                    background-color: #f8f8f8;
                    padding: 25px 30px;
                    text-align: center;
                    color: #888888;
                    font-size: 13px;
                    border-top: 1px solid #eeeeee;
                }
                
                .social-links {
                    margin: 15px 0;
                }
                
                .social-link {
                    display: inline-block;
                    margin: 0 8px;
                    color: #555555;
                    text-decoration: none;
                    font-weight: 500;
                }
                
                @media only screen and (max-width: 600px) {
                    .email-content {
                        padding: 30px 20px;
                    }
                    
                    .greeting {
                        font-size: 22px;
                    }
                    
                    .message {
                        font-size: 15px;
                    }
                    
                    .button {
                        padding: 12px 25px;
                        font-size: 15px;
                    }
                    
                    .features {
                        padding: 20px;
                    }
                }
            </style>
        </head>
        <body>
            <div class="email-container">
                <div class="email-header">
                    ' . $logoImg . '
                </div>
                
                <div class="email-content">
                    <div class="greeting">Welcome to Pinana Gourmet, ' . $name . '!</div>
                    
                    <div class="message">
                        Thank you for verifying your email address. Your retailer account has been successfully activated!
                    </div>
                    
                    <div class="message">
                        You can now log in to your account and start using our platform to manage your products, orders, and more.
                    </div>
        ';
        
        // Plain text version
        $mail->AltBody = "Hello $name,\n\n"
            . "Thank you for verifying your email address. Your retailer account is now active!\n\n"
            . "You can now log in to your account and start using our platform to manage your products, orders, and more.\n\n"
            . "Log in here: $loginUrl\n\n"
            . "If you have any questions or need assistance, please don't hesitate to contact our support team.\n\n"
            . "We're excited to have you as a retailer partner!\n\n"
            . "Piñana Gourmet";
        
        // Send email
        $mail->send();
        
        // Log success
        file_put_contents($logFile, date('Y-m-d H:i:s') . " - Welcome email sent successfully to: $email\n", FILE_APPEND);
        
        return true;
    } catch (Exception $e) {
        // Log error
        file_put_contents($logFile, date('Y-m-d H:i:s') . " - Error sending welcome email: " . $mail->ErrorInfo . "\n", FILE_APPEND);
        
        return false;
    }
}

// Test function to check if PHPMailer is working
function testEmailConnection() {
    $logFile = 'email_test_log.txt';
    file_put_contents($logFile, date('Y-m-d H:i:s') . " - Testing email connection\n", FILE_APPEND);
    
    try {
        $mail = new PHPMailer(true);
        
        // Server settings
        $mail->SMTPDebug = 3;
        $mail->Debugoutput = function($str, $level) {
            file_put_contents('smtp_test_debug.log', date('Y-m-d H:i:s') . ": $str\n", FILE_APPEND);
        };
        
        $mail->isSMTP();
        $mail->Host       = 'smtp.gmail.com';
        $mail->SMTPAuth   = true;
        $mail->Username   = 'wantargaryen@gmail.com';
        $mail->Password   = 'kjiz fcxe ajri xuwu';
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Port       = 587;
        
        $mail->SMTPOptions = array(
            'ssl' => array(
                'verify_peer' => false,
                'verify_peer_name' => false,
                'allow_self_signed' => true
            )
        );
        
        // Test connection only
        $mail->SMTPKeepAlive = true;
        
        // Connect to the SMTP server
        if ($mail->smtpConnect()) {
            file_put_contents($logFile, date('Y-m-d H:i:s') . " - SMTP connection successful\n", FILE_APPEND);
            $mail->smtpClose();
            return true;
        } else {
            file_put_contents($logFile, date('Y-m-d H:i:s') . " - SMTP connection failed\n", FILE_APPEND);
            return false;
        }
    } catch (Exception $e) {
        file_put_contents($logFile, date('Y-m-d H:i:s') . " - Error testing connection: " . $e->getMessage() . "\n", FILE_APPEND);
        return false;
    }
}
?>
