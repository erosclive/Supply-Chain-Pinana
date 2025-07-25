<?php
// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Start session
session_start();

// Include database connection
require_once 'db_connection.php';
// Include email functions
require_once 'send_email.php';

// Log file for debugging
$logFile = 'registration_log.txt';

// Check if form was submitted
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Get form data
    $firstName = isset($_POST['firstName']) ? trim($_POST['firstName']) : '';
    $lastName = isset($_POST['lastName']) ? trim($_POST['lastName']) : '';
    $birthday = isset($_POST['birthday']) ? $_POST['birthday'] : '';
    $age = isset($_POST['age']) ? (int)$_POST['age'] : 0;
    
    $businessName = isset($_POST['businessName']) ? trim($_POST['businessName']) : null;
    $businessType = isset($_POST['businessType']) ? trim($_POST['businessType']) : '';
    
    $province = isset($_POST['province']) ? trim($_POST['province']) : '';
    $city = isset($_POST['city']) ? trim($_POST['city']) : '';
    $barangay = isset($_POST['barangay']) ? trim($_POST['barangay']) : '';
    $houseNumber = isset($_POST['houseNumber']) ? trim($_POST['houseNumber']) : '';
    $addressNotes = isset($_POST['addressNotes']) ? trim($_POST['addressNotes']) : '';
    
    $phone = isset($_POST['phone']) ? trim($_POST['phone']) : '';
    $email = isset($_POST['email']) ? trim($_POST['email']) : '';
    
    $facebook = isset($_POST['facebook']) ? trim($_POST['facebook']) : '';
    $instagram = isset($_POST['instagram']) ? trim($_POST['instagram']) : '';
    $tiktok = isset($_POST['tiktok']) ? trim($_POST['tiktok']) : '';
    
    $username = isset($_POST['reg_username']) ? trim($_POST['reg_username']) : '';
    $password = isset($_POST['reg_password']) ? $_POST['reg_password'] : '';
    $passwordConfirm = isset($_POST['reg_password_confirm']) ? $_POST['reg_password_confirm'] : '';
    
    // Log registration attempt
    file_put_contents($logFile, date('Y-m-d H:i:s') . " - Registration attempt for: $firstName $lastName, Email: $email\n", FILE_APPEND);
    
    // Validate input
    $errors = [];
    
    if (empty($firstName)) $errors[] = "First name is required";
    if (empty($lastName)) $errors[] = "Last name is required";
    if (empty($birthday)) $errors[] = "Birthday is required";
    
    if (empty($businessType)) $errors[] = "Business type is required";
    
    if (empty($province)) $errors[] = "Province is required";
    if (empty($city)) $errors[] = "City is required";
    if (empty($barangay)) $errors[] = "Barangay is required";
    if (empty($houseNumber)) $errors[] = "House/Building number is required";
    
    if (empty($phone)) $errors[] = "Phone number is required";
    if (empty($email)) $errors[] = "Email is required";
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) $errors[] = "Invalid email format";
    
    // Check if email is Gmail
    if (!preg_match('/@gmail\.com$/i', $email)) {
        $errors[] = "Please use a Gmail address for registration";
    }
    
    if (empty($username)) $errors[] = "Username is required";
    if (empty($password)) $errors[] = "Password is required";
    if (empty($passwordConfirm)) $errors[] = "Password confirmation is required";
    if ($password !== $passwordConfirm) $errors[] = "Passwords do not match";
    
    // Check password strength
    if (strlen($password) < 8) $errors[] = "Password must be at least 8 characters long";
    if (!preg_match('/[A-Z]/', $password)) $errors[] = "Password must contain at least one uppercase letter";
    if (!preg_match('/[a-z]/', $password)) $errors[] = "Password must contain at least one lowercase letter";
    if (!preg_match('/[0-9]|[^A-Za-z0-9]/', $password)) $errors[] = "Password must contain at least one number or special character";
    
    // Check if username or email already exists
    try {
        $check_sql = "SELECT id FROM users WHERE username = ? OR email = ?";
        $check_stmt = mysqli_prepare($conn, $check_sql);
        
        if (!$check_stmt) {
            throw new Exception("Database error: " . mysqli_error($conn));
        }
        
        mysqli_stmt_bind_param($check_stmt, "ss", $username, $email);
        mysqli_stmt_execute($check_stmt);
        $result = mysqli_stmt_get_result($check_stmt);
        
        if (mysqli_num_rows($result) > 0) {
            $errors[] = "Username or email already exists";
        }
        
        mysqli_stmt_close($check_stmt);
    } catch (Exception $e) {
        $errors[] = "Error checking username/email: " . $e->getMessage();
        file_put_contents($logFile, date('Y-m-d H:i:s') . " - Error: " . $e->getMessage() . "\n", FILE_APPEND);
    }
    
    // If there are errors, return them
    if (!empty($errors)) {
        echo json_encode([
            'success' => false,
            'error' => implode(", ", $errors)
        ]);
        exit;
    }
    
    // Process registration
    try {
        // Start transaction
        mysqli_begin_transaction($conn);
        
        // Hash password
        $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
        
        // Generate verification token
        $verificationToken = bin2hex(random_bytes(32));
        
        // Set token expiration (24 hours from now)
        $tokenExpiration = date('Y-m-d H:i:s', strtotime('+24 hours'));
        
        // Create user record
        $fullName = $firstName . ' ' . $lastName;
        $insert_user_sql = "INSERT INTO users (username, password, email, full_name, role, email_verified, verification_token, verification_expires, created_at) VALUES (?, ?, ?, ?, 'retailer', 0, ?, ?, NOW())";
        $insert_user_stmt = mysqli_prepare($conn, $insert_user_sql);
        
        if (!$insert_user_stmt) {
            throw new Exception("Database error: " . mysqli_error($conn));
        }
        
        mysqli_stmt_bind_param($insert_user_stmt, "ssssss", $username, $hashedPassword, $email, $fullName, $verificationToken, $tokenExpiration);
        
        if (!mysqli_stmt_execute($insert_user_stmt)) {
            throw new Exception("Error creating user: " . mysqli_stmt_error($insert_user_stmt));
        }
        
        $userId = mysqli_insert_id($conn);
        mysqli_stmt_close($insert_user_stmt);
        
        // Create business address
        $businessAddress = "$houseNumber, Barangay $barangay, $city, $province";
        
        // Create retailer profile
        $insert_profile_sql = "INSERT INTO retailer_profiles (user_id, first_name, last_name, birthday, age, business_name, business_type, province, city, barangay, house_number, address_notes, business_address, phone, facebook, instagram, tiktok) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        $insert_profile_stmt = mysqli_prepare($conn, $insert_profile_sql);
        
        if (!$insert_profile_stmt) {
            throw new Exception("Database error: " . mysqli_error($conn));
        }
        
        mysqli_stmt_bind_param($insert_profile_stmt, "isssississsssssss", $userId, $firstName, $lastName, $birthday, $age, $businessName, $businessType, $province, $city, $barangay, $houseNumber, $addressNotes, $businessAddress, $phone, $facebook, $instagram, $tiktok);
        
        if (!mysqli_stmt_execute($insert_profile_stmt)) {
            throw new Exception("Error creating retailer profile: " . mysqli_stmt_error($insert_profile_stmt));
        }
        
        mysqli_stmt_close($insert_profile_stmt);
        
        // Send verification email
        $emailSent = sendVerificationEmail($email, $fullName, $verificationToken);
        
        if (!$emailSent) {
            // Log error but continue with registration
            file_put_contents($logFile, date('Y-m-d H:i:s') . " - Warning: Failed to send verification email to: $email\n", FILE_APPEND);
        }
        
        // Commit transaction
        mysqli_commit($conn);
        
        // Log success
        file_put_contents($logFile, date('Y-m-d H:i:s') . " - Registration successful for: $firstName $lastName, Email: $email, User ID: $userId\n", FILE_APPEND);
        
        // Return success response
        echo json_encode([
            'success' => true,
            'message' => 'Registration successful',
            'requiresVerification' => true,
            'email' => $email
        ]);
        
    } catch (Exception $e) {
        // Rollback transaction
        mysqli_rollback($conn);
        
        // Log error
        file_put_contents($logFile, date('Y-m-d H:i:s') . " - Error: " . $e->getMessage() . "\n", FILE_APPEND);
        
        // Return error response
        echo json_encode([
            'success' => false,
            'error' => $e->getMessage()
        ]);
    }
} else {
    // Return error for non-POST requests
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
