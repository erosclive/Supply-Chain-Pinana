<?php
// Enable error reporting for debugging (remove in production)
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Start session
session_start();

// Include database connection
require_once 'db_connection.php';

// Log file for debugging
$logFile = 'login_log.txt';

// Check if form was submitted
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Get form data
    $username = isset($_POST['username']) ? trim($_POST['username']) : '';
    $password = isset($_POST['password']) ? $_POST['password'] : '';
    $rememberMe = isset($_POST['rememberMe']) ? true : false;
    
    // Log login attempt
    file_put_contents($logFile, date('Y-m-d H:i:s') . " - Login attempt for username: $username\n", FILE_APPEND);
    
    // Validate input
    if (empty($username) || empty($password)) {
        // Log error
        file_put_contents($logFile, date('Y-m-d H:i:s') . " - Error: Empty username or password\n", FILE_APPEND);
        
        // Check if this is an AJAX request
        if (isAjaxRequest()) {
            sendJsonResponse(false, 'Please enter both username and password.');
        } else {
            // Redirect back to login with error
            header('Location: index.html?error=empty_fields');
            exit;
        }
    }
    
    try {
        // Check if user exists and get approval status
        $check_user_sql = "SELECT id, username, password, email, role, email_verified, approval_status, is_active FROM users WHERE username = ?";
        $check_user_stmt = mysqli_prepare($conn, $check_user_sql);
        
        if (!$check_user_stmt) {
            throw new Exception("Database error: " . mysqli_error($conn));
        }
        
        mysqli_stmt_bind_param($check_user_stmt, "s", $username);
        mysqli_stmt_execute($check_user_stmt);
        $result = mysqli_stmt_get_result($check_user_stmt);
        
        if (mysqli_num_rows($result) === 0) {
            // Log error
            file_put_contents($logFile, date('Y-m-d H:i:s') . " - Error: User not found\n", FILE_APPEND);
            
            // Check if this is an AJAX request
            if (isAjaxRequest()) {
                sendJsonResponse(false, 'Invalid username or password.');
            } else {
                // Redirect back to login with error
                header('Location: index.html?error=invalid_credentials');
                exit;
            }
        }
        
        $user = mysqli_fetch_assoc($result);
        mysqli_stmt_close($check_user_stmt);
        
        // Verify password
        if (!password_verify($password, $user['password'])) {
            // Log error
            file_put_contents($logFile, date('Y-m-d H:i:s') . " - Error: Invalid password\n", FILE_APPEND);
            
            // Check if this is an AJAX request
            if (isAjaxRequest()) {
                sendJsonResponse(false, 'Invalid username or password.');
            } else {
                // Redirect back to login with error
                header('Location: index.html?error=invalid_credentials');
                exit;
            }
        }
        
        // Check approval status for retailers FIRST (before email verification)
        if ($user['role'] === 'retailer') {
            $approvalStatus = $user['approval_status'] ?? 'pending';
            
            switch ($approvalStatus) {
                case 'pending':
                    // Log pending status
                    file_put_contents($logFile, date('Y-m-d H:i:s') . " - Error: Retailer account pending approval for user ID: " . $user['id'] . "\n", FILE_APPEND);
                    
                    if (isAjaxRequest()) {
                        sendJsonResponse(false, 'Your retailer account is still pending approval from our admin team. Please wait for approval before logging in.', [
                            'accountStatus' => 'pending'
                        ]);
                    } else {
                        header('Location: account_status.php?status=pending');
                        exit;
                    }
                    break;
                    
                case 'rejected':
                    // Log rejected status
                    file_put_contents($logFile, date('Y-m-d H:i:s') . " - Error: Retailer account rejected for user ID: " . $user['id'] . "\n", FILE_APPEND);
                    
                    if (isAjaxRequest()) {
                        sendJsonResponse(false, 'Your retailer account has been rejected by our admin team. Please contact us at pinyanagfp.scm@gmail.com for more information.', [
                            'accountStatus' => 'rejected'
                        ]);
                    } else {
                        header('Location: account_status.php?status=rejected');
                        exit;
                    }
                    break;
                    
                case 'approved':
                    // Account is approved, continue with login process
                    break;
                    
                default:
                    // Default to pending if status is unknown
                    file_put_contents($logFile, date('Y-m-d H:i:s') . " - Error: Unknown approval status '$approvalStatus' for user ID: " . $user['id'] . "\n", FILE_APPEND);
                    
                    if (isAjaxRequest()) {
                        sendJsonResponse(false, 'Your account status is unclear. Please contact us at pinyanagfp.scm@gmail.com for assistance.');
                    } else {
                        header('Location: account_status.php?status=unknown');
                        exit;
                    }
                    break;
            }
        }
        
        // Check if email is verified (for all users, but only after approval check for retailers)
        if ($user['email_verified'] == 0) {
            // Log error
            file_put_contents($logFile, date('Y-m-d H:i:s') . " - Error: Email not verified for user ID: " . $user['id'] . "\n", FILE_APPEND);
            
            // Check if this is an AJAX request
            if (isAjaxRequest()) {
                sendJsonResponse(false, 'Please verify your email before logging in.', [
                    'requiresVerification' => true,
                    'email' => $user['email']
                ]);
            } else {
                // Redirect to verification required page with email
                header('Location: verification_required.php?email=' . urlencode($user['email']));
                exit;
            }
        }
        
        // For non-retailers, just check if account is active
        if ($user['role'] !== 'retailer' && $user['is_active'] == 0) {
            file_put_contents($logFile, date('Y-m-d H:i:s') . " - Error: Account inactive for user ID: " . $user['id'] . "\n", FILE_APPEND);
            
            if (isAjaxRequest()) {
                sendJsonResponse(false, 'Your account has been deactivated. Please contact us at pinyanagfp.scm@gmail.com for assistance.');
            } else {
                header('Location: account_status.php?status=inactive');
                exit;
            }
        }
        
        // Final check for retailers - ensure account is active (should be 1 for approved retailers)
        if ($user['role'] === 'retailer' && $user['is_active'] == 0) {
            file_put_contents($logFile, date('Y-m-d H:i:s') . " - Error: Approved retailer account inactive for user ID: " . $user['id'] . "\n", FILE_APPEND);
            
            if (isAjaxRequest()) {
                sendJsonResponse(false, 'Your account has been deactivated. Please contact us at pinyanagfp.scm@gmail.com for assistance.');
            } else {
                header('Location: account_status.php?status=inactive');
                exit;
            }
        }
        
        // Set session variables
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['username'] = $user['username'];
        $_SESSION['role'] = $user['role'];
        
        // Update last login time
        $update_login_sql = "UPDATE users SET last_login = NOW() WHERE id = ?";
        $update_login_stmt = mysqli_prepare($conn, $update_login_sql);
        
        if (!$update_login_stmt) {
            throw new Exception("Database error: " . mysqli_error($conn));
        }
        
        mysqli_stmt_bind_param($update_login_stmt, "i", $user['id']);
        mysqli_stmt_execute($update_login_stmt);
        mysqli_stmt_close($update_login_stmt);
        
        // Set remember me cookie if checked
        if ($rememberMe) {
            $token = bin2hex(random_bytes(32));
            $expires = time() + (86400 * 30); // 30 days
            
            // Store token in database (create table if it doesn't exist)
            $create_table_sql = "CREATE TABLE IF NOT EXISTS remember_tokens (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                token VARCHAR(64) NOT NULL,
                expires DATETIME NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )";
            mysqli_query($conn, $create_table_sql);
            
            $store_token_sql = "INSERT INTO remember_tokens (user_id, token, expires) VALUES (?, ?, ?)";
            $store_token_stmt = mysqli_prepare($conn, $store_token_sql);
            
            if ($store_token_stmt) {
                $expires_date = date('Y-m-d H:i:s', $expires);
                mysqli_stmt_bind_param($store_token_stmt, "iss", $user['id'], $token, $expires_date);
                mysqli_stmt_execute($store_token_stmt);
                mysqli_stmt_close($store_token_stmt);
                
                // Set cookie
                setcookie('remember_token', $token, $expires, '/', '', true, true);
            }
        }
        
        // Log success
        file_put_contents($logFile, date('Y-m-d H:i:s') . " - Success: User logged in, ID: " . $user['id'] . ", Role: " . $user['role'] . "\n", FILE_APPEND);
        
        // Determine redirect URL based on role
        $redirectUrl = 'dashboard.html'; // Default
        
        switch ($user['role']) {
            case 'admin':
                $redirectUrl = 'dashboard.html';
                break;
            case 'retailer':
                $redirectUrl = 'Retailer/home.html';
                break;
            case 'cashier':
                $redirectUrl = 'pos.html';
                break;
            default:
                $redirectUrl = 'dashboard.html';
                break;
        }
        
        // Check if this is an AJAX request
        if (isAjaxRequest()) {
            sendJsonResponse(true, 'Login successful', [
                'role' => $user['role'],
                'redirectUrl' => $redirectUrl
            ]);
        } else {
            // Redirect based on role
            header("Location: $redirectUrl");
            exit;
        }
        
    } catch (Exception $e) {
        // Log error
        file_put_contents($logFile, date('Y-m-d H:i:s') . " - Error: " . $e->getMessage() . "\n", FILE_APPEND);
        
        // Check if this is an AJAX request
        if (isAjaxRequest()) {
            sendJsonResponse(false, 'A system error occurred. Please try again later.');
        } else {
            // Redirect back to login with error
            header('Location: index.html?error=system_error');
            exit;
        }
    }
} else {
    // Redirect to login page if not a POST request
    header('Location: index.html');
    exit;
}

// Close connection
if (isset($conn) && $conn) {
    mysqli_close($conn);
}

/**
 * Check if the request is an AJAX request
 * 
 * @return bool True if the request is an AJAX request
 */
function isAjaxRequest() {
    return (
        !empty($_SERVER['HTTP_X_REQUESTED_WITH']) && 
        strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) === 'xmlhttprequest'
    ) || (
        isset($_SERVER['HTTP_ACCEPT']) && 
        strpos($_SERVER['HTTP_ACCEPT'], 'application/json') !== false
    );
}

/**
 * Send a JSON response and exit
 * 
 * @param bool $success Whether the request was successful
 * @param string $message Message to display to the user
 * @param array $data Additional data to include in the response
 */
function sendJsonResponse($success, $message, $data = []) {
    header('Content-Type: application/json');
    echo json_encode(array_merge([
        'success' => $success,
        'message' => $message
    ], $data));
    exit;
}
?>