<?php
// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Include database connection
require_once 'db_connection.php';
// Include email functions
require_once 'send_email.php';

// Set headers for JSON response
header('Content-Type: application/json');

// Log incoming data for debugging
$logFile = 'register_log.txt';
file_put_contents($logFile, date('Y-m-d H:i:s') . " - POST data: " . print_r($_POST, true) . "\n", FILE_APPEND);

// Check if the form was submitted
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        // Get form data - Basic Information
        $firstName = isset($_POST['firstName']) ? trim($_POST['firstName']) : '';
        $lastName = isset($_POST['lastName']) ? trim($_POST['lastName']) : '';
        $birthday = isset($_POST['birthday']) ? trim($_POST['birthday']) : '';
        $age = isset($_POST['age']) ? intval($_POST['age']) : 0;
        $nationality = isset($_POST['nationality']) ? trim($_POST['nationality']) : '';
        
        // Get form data - Business Information
        $businessName = isset($_POST['businessName']) ? trim($_POST['businessName']) : '';
        $businessType = isset($_POST['businessType']) ? trim($_POST['businessType']) : '';
        
        // Get new address fields
        $province = isset($_POST['province']) ? trim($_POST['province']) : '';
        $city = isset($_POST['city']) ? trim($_POST['city']) : '';
        $barangay = isset($_POST['barangay']) ? trim($_POST['barangay']) : '';
        $houseNumber = isset($_POST['houseNumber']) ? trim($_POST['houseNumber']) : '';
        $addressNotes = isset($_POST['addressNotes']) ? trim($_POST['addressNotes']) : '';
        
        // Construct full address for backward compatibility
        $businessAddress = "$houseNumber, Barangay $barangay, $city, $province";
        if (!empty($addressNotes)) {
            $businessAddress .= " ($addressNotes)";
        }
        
        // Get form data - Contact Information
        $phone = isset($_POST['phone']) ? trim($_POST['phone']) : '';
        $email = isset($_POST['email']) ? trim($_POST['email']) : '';
        $facebook = isset($_POST['facebook']) ? trim($_POST['facebook']) : '';
        $instagram = isset($_POST['instagram']) ? trim($_POST['instagram']) : '';
        $tiktok = isset($_POST['tiktok']) ? trim($_POST['tiktok']) : '';
        
        // Get form data - Account Information
        $username = isset($_POST['reg_username']) ? trim($_POST['reg_username']) : '';
        $password = isset($_POST['reg_password']) ? $_POST['reg_password'] : '';
        
        // Log the extracted data
        file_put_contents($logFile, date('Y-m-d H:i:s') . " - Extracted data: " . 
            "firstName: $firstName, lastName: $lastName, username: $username, email: $email\n", FILE_APPEND);
        
        // Validate required fields
        if (empty($firstName) || empty($lastName) || empty($birthday) || 
            empty($nationality) || empty($businessName) || empty($businessType) || 
            empty($province) || empty($city) || empty($barangay) || empty($houseNumber) ||
            empty($phone) || empty($email) || empty($username) || empty($password)) {
            throw new Exception("All required fields must be filled.");
        }
        
        // Validate email format
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            throw new Exception("Invalid email format.");
        }
        
        // Log database connection status
        file_put_contents($logFile, date('Y-m-d H:i:s') . " - Database connection: " . 
            (isset($conn) ? "Connected" : "Not connected") . "\n", FILE_APPEND);
        
        // Check if username already exists
        $check_sql = "SELECT COUNT(*) as count FROM users WHERE username = ?";
        $check_stmt = mysqli_prepare($conn, $check_sql);
        
        if (!$check_stmt) {
            throw new Exception("Database error: " . mysqli_error($conn));
        }
        
        mysqli_stmt_bind_param($check_stmt, "s", $username);
        mysqli_stmt_execute($check_stmt);
        $result = mysqli_stmt_get_result($check_stmt);
        $row = mysqli_fetch_assoc($result);
        
        if ($row['count'] > 0) {
            throw new Exception("Username already exists. Please choose another one.");
        }
        
        mysqli_stmt_close($check_stmt);
        
        // Check if email already exists
        $check_email_sql = "SELECT COUNT(*) as count FROM users WHERE email = ?";
        $check_email_stmt = mysqli_prepare($conn, $check_email_sql);
        
        if (!$check_email_stmt) {
            throw new Exception("Database error: " . mysqli_error($conn));
        }
        
        mysqli_stmt_bind_param($check_email_stmt, "s", $email);
        mysqli_stmt_execute($check_email_stmt);
        $email_result = mysqli_stmt_get_result($check_email_stmt);
        $email_row = mysqli_fetch_assoc($email_result);
        
        if ($email_row['count'] > 0) {
            throw new Exception("Email already registered. Please use a different email address.");
        }
        
        mysqli_stmt_close($check_email_stmt);
        
        // Hash the password
        $hashed_password = password_hash($password, PASSWORD_DEFAULT);
        
        // Generate full name
        $full_name = $firstName . ' ' . $lastName;
        
        // Generate verification token
        $verification_token = bin2hex(random_bytes(32));
        
        // Set token expiration (24 hours from now)
        $token_expiration = date('Y-m-d H:i:s', strtotime('+24 hours'));
        
        // Start transaction
        mysqli_begin_transaction($conn);
        
        // Insert user data into users table with verification token
        $user_sql = "INSERT INTO users (
                        username, 
                        password, 
                        role, 
                        email, 
                        full_name,
                        is_active,
                        email_verified,
                        verification_token,
                        verification_expires,
                        created_at
                    ) VALUES (?, ?, 'retailer', ?, ?, 1, 0, ?, ?, NOW())";
        
        $user_stmt = mysqli_prepare($conn, $user_sql);
        
        if (!$user_stmt) {
            throw new Exception("Database error: " . mysqli_error($conn));
        }
        
        mysqli_stmt_bind_param($user_stmt, "ssssss", $username, $hashed_password, $email, $full_name, $verification_token, $token_expiration);
        
        // Log before executing user insert
        file_put_contents($logFile, date('Y-m-d H:i:s') . " - Before user insert\n", FILE_APPEND);
        
        if (!mysqli_stmt_execute($user_stmt)) {
            throw new Exception("Error creating user account: " . mysqli_stmt_error($user_stmt));
        }
        
        $user_id = mysqli_insert_id($conn);
        
        // Log after user insert
        file_put_contents($logFile, date('Y-m-d H:i:s') . " - User inserted with ID: $user_id\n", FILE_APPEND);
        
        mysqli_stmt_close($user_stmt);
        
        // Check if retailer_profiles table has the new address fields
        $check_fields_sql = "SHOW COLUMNS FROM retailer_profiles LIKE 'province'";
        $check_fields_result = mysqli_query($conn, $check_fields_sql);
        
        if (mysqli_num_rows($check_fields_result) > 0) {
            // New fields exist, use them
            $profile_sql = "INSERT INTO retailer_profiles (
                                user_id, 
                                first_name, 
                                last_name, 
                                birthday, 
                                age,
                                nationality,
                                business_name,
                                business_type,
                                province,
                                city,
                                barangay,
                                house_number,
                                address_notes,
                                business_address,
                                phone,
                                facebook,
                                instagram,
                                tiktok,
                                created_at,
                                updated_at
                            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())";
            
            $profile_stmt = mysqli_prepare($conn, $profile_sql);
            
            if (!$profile_stmt) {
                throw new Exception("Database error: " . mysqli_error($conn));
            }
            
            mysqli_stmt_bind_param(
                $profile_stmt, 
                "isssississssssssss", 
                $user_id, 
                $firstName, 
                $lastName, 
                $birthday, 
                $age,
                $nationality,
                $businessName,
                $businessType,
                $province,
                $city,
                $barangay,
                $houseNumber,
                $addressNotes,
                $businessAddress,
                $phone,
                $facebook,
                $instagram,
                $tiktok
            );
        } else {
            // Use original structure
            $profile_sql = "INSERT INTO retailer_profiles (
                                user_id, 
                                first_name, 
                                last_name, 
                                birthday, 
                                age,
                                nationality,
                                business_name,
                                business_type,
                                business_address,
                                phone,
                                facebook,
                                instagram,
                                tiktok,
                                created_at,
                                updated_at
                            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())";
            
            $profile_stmt = mysqli_prepare($conn, $profile_sql);
            
            if (!$profile_stmt) {
                throw new Exception("Database error: " . mysqli_error($conn));
            }
            
            mysqli_stmt_bind_param(
                $profile_stmt, 
                "isssississsss", 
                $user_id, 
                $firstName, 
                $lastName, 
                $birthday, 
                $age,
                $nationality,
                $businessName,
                $businessType,
                $businessAddress,
                $phone,
                $facebook,
                $instagram,
                $tiktok
            );
        }
        
        // Log before executing profile insert
        file_put_contents($logFile, date('Y-m-d H:i:s') . " - Before profile insert\n", FILE_APPEND);
        
        if (!mysqli_stmt_execute($profile_stmt)) {
            throw new Exception("Error creating retailer profile: " . mysqli_stmt_error($profile_stmt));
        }
        
        // Log after profile insert
        file_put_contents($logFile, date('Y-m-d H:i:s') . " - Profile inserted successfully\n", FILE_APPEND);
        
        mysqli_stmt_close($profile_stmt);
        
        // Commit transaction
        mysqli_commit($conn);
        
        // Test email connection before sending
        $connectionTest = testEmailConnection();
        file_put_contents($logFile, date('Y-m-d H:i:s') . " - Email connection test: " . 
            ($connectionTest ? "Successful" : "Failed") . "\n", FILE_APPEND);
        
        // Testing email connection before sending verification email
        file_put_contents($logFile, date('Y-m-d H:i:s') . " - Testing email connection before sending verification email\n", FILE_APPEND);

        // Force a small delay to ensure database transaction completes
        sleep(1);

        // Send verification email with improved error handling
        try {
            $emailSent = sendVerificationEmail($email, $full_name, $verification_token);
            
            if ($emailSent) {
                file_put_contents($logFile, date('Y-m-d H:i:s') . " - Verification email sent successfully to: $email\n", FILE_APPEND);
            } else {
                file_put_contents($logFile, date('Y-m-d H:i:s') . " - Failed to send verification email to: $email (no error details available)\n", FILE_APPEND);
            }
        } catch (Exception $emailException) {
            file_put_contents($logFile, date('Y-m-d H:i:s') . " - Exception while sending verification email: " . $emailException->getMessage() . "\n", FILE_APPEND);
            // We don't want to roll back the transaction if email fails
            // The user can request a new verification email
        }
        
        // Log success
        file_put_contents($logFile, date('Y-m-d H:i:s') . " - Registration successful\n", FILE_APPEND);

        // Create verification URL for direct redirect if needed
        $protocol = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? 'https://' : 'http://';
        $host = isset($_SERVER['HTTP_HOST']) ? $_SERVER['HTTP_HOST'] : 'localhost';
        $scriptPath = $_SERVER['SCRIPT_NAME'] ?? '';
        $subdirectory = dirname($scriptPath);
        $subdirectory = ($subdirectory == '/' || $subdirectory == '\\') ? '' : $subdirectory;
        $verificationRequiredUrl = $protocol . $host . $subdirectory . '/verification_required.php?email=' . urlencode($email);

        echo json_encode([
            'success' => true,
            'requiresVerification' => true,
            'email' => $email,
            'verificationUrl' => $verificationRequiredUrl,
            'message' => "Registration successful! Please check your email to verify your account."
        ]);
        
    } catch (Exception $e) {
        // Rollback transaction on error
        if (isset($conn) && $conn) {
            mysqli_rollback($conn);
        }
        
        // Log error
        file_put_contents($logFile, date('Y-m-d H:i:s') . " - ERROR: " . $e->getMessage() . "\n", FILE_APPEND);
        
        echo json_encode([
            'success' => false,
            'error' => $e->getMessage()
        ]);
    }
} else {
    // Log invalid request
    file_put_contents($logFile, date('Y-m-d H:i:s') . " - Invalid request method\n", FILE_APPEND);
    
    echo json_encode([
        'success' => false,
        'error' => 'Invalid request method'
    ]);
}

// Close connection
if (isset($conn) && $conn) {
    mysqli_close($conn);
}
?>
