<?php
// Start session if not already started
if (session_status() === PHP_SESSION_NONE) {
   session_start();
}

// Include database connection
require_once 'db_connection.php';

/**
* Get user data by user ID
* 
* @param mysqli $conn Database connection
* @param int $user_id User ID
* @return array|null User data or null if not found
*/
function getUserData($conn, $user_id) {
   $query = "SELECT * FROM users WHERE id = ?";
   $stmt = $conn->prepare($query);
   $stmt->bind_param("i", $user_id);
   $stmt->execute();
   $result = $stmt->get_result();
   
   if ($result->num_rows > 0) {
       return $result->fetch_assoc();
   }
   
   return null;
}

/**
* Get retailer profile data by user ID
* 
* @param mysqli $conn Database connection
* @param int $user_id User ID
* @return array|null Profile data or null if not found
*/
function getRetailerProfile($conn, $user_id) {
   $query = "SELECT * FROM retailer_profiles WHERE user_id = ?";
   $stmt = $conn->prepare($query);
   $stmt->bind_param("i", $user_id);
   $stmt->execute();
   $result = $stmt->get_result();
   
   if ($result->num_rows > 0) {
       return $result->fetch_assoc();
   }
   
   return null;
}

/**
* Update retailer profile
* 
* @param mysqli $conn Database connection
* @param int $user_id User ID
* @param array $data Profile data to update
* @return bool True if successful, false otherwise
*/
function updateRetailerProfile($conn, $user_id, $data) {
   $birthday = $data['birthday'] ?? '';
   $age = 0; // Default age to 0

   if (!empty($birthday)) {
       try {
           $birthdate_obj = new DateTime($birthday);
           $today = new DateTime();
           $age = $birthdate_obj->diff($today)->y;
       } catch (Exception $e) {
           // If birthday is invalid, age remains 0 and birthday remains empty string
           $birthday = '';
       }
   }
   
   $query = "UPDATE retailer_profiles SET 
             first_name = ?, 
             last_name = ?, 
             birthday = ?, 
             age = ?, 
             nationality = ?, 
             business_name = ?, 
             business_address = ?, 
             phone = ?, 
             facebook = ?, 
             instagram = ?, 
             tiktok = ?, 
             updated_at = NOW() 
             WHERE user_id = ?";
             
   $stmt = $conn->prepare($query);
   $stmt->bind_param("sssisssisssi", 
                   $data['first_name'], 
                   $data['last_name'], 
                   $birthday, // Use the potentially modified birthday
                   $age,      // Use the calculated or default age
                   $data['nationality'], 
                   $data['business_name'], 
                   $data['business_address'], 
                   $data['phone'], 
                   $data['facebook'], 
                   $data['instagram'], 
                   $data['tiktok'], 
                   $user_id);
   
   return $stmt->execute();
}

/**
* Update profile image
* 
* @param mysqli $conn Database connection
* @param int $user_id User ID
* @param string $image_path Path to the profile image
* @return bool True if successful, false otherwise
*/
function updateProfileImage($conn, $user_id, $image_path) {
   $query = "UPDATE retailer_profiles SET profile_image = ? WHERE user_id = ?";
   $stmt = $conn->prepare($query);
   $stmt->bind_param("si", $image_path, $user_id);
   return $stmt->execute();
}

/**
* Update user account information
* 
* @param mysqli $conn Database connection
* @param int $user_id User ID
* @param string $email New email
* @param string|null $new_password New password (if provided)
* @return bool True if successful, false otherwise
*/
function updateUserAccount($conn, $user_id, $email, $new_password = null) {
   if ($new_password) {
       // Update email and password
       $hashed_password = password_hash($new_password, PASSWORD_DEFAULT);
       $query = "UPDATE users SET email = ?, password = ? WHERE id = ?";
       $stmt = $conn->prepare($query);
       $stmt->bind_param("ssi", $email, $hashed_password, $user_id);
   } else {
       // Update only email
       $query = "UPDATE users SET email = ? WHERE id = ?";
       $stmt = $conn->prepare($query);
       $stmt->bind_param("si", $email, $user_id);
   }
   
   return $stmt->execute();
}

/**
* Verify user password
* 
* @param mysqli $conn Database connection
* @param int $user_id User ID
* @param string $password Password to verify
* @return bool True if password is correct, false otherwise
*/
function verifyPassword($conn, $user_id, $password) {
   $query = "SELECT password FROM users WHERE id = ?";
   $stmt = $conn->prepare($query);
   $stmt->bind_param("i", $user_id);
   $stmt->execute();
   $result = $stmt->get_result();
   
   if ($result->num_rows > 0) {
       $user = $result->fetch_assoc();
       return password_verify($password, $user['password']);
   }
   
   return false;
}

/**
* Get recent orders for a user
* 
* @param mysqli $conn Database connection
* @param int $user_id User ID
* @param int $limit Number of orders to return
* @return array Recent orders
*/
function getRecentOrders($conn, $user_id, $limit = 3) {
   // First, check if the orders table has a customer_id column
   $tableInfo = $conn->query("SHOW COLUMNS FROM orders");
   $hasCustomerId = false;
   $hasRetailerId = false;
   
   while ($column = $tableInfo->fetch_assoc()) {
       if ($column['Field'] === 'customer_id') {
           $hasCustomerId = true;
       }
       if ($column['Field'] === 'retailer_id') {
           $hasRetailerId = true;
       }
   }
   
   // Get the retailer profile to find the business name
   $profile = getRetailerProfile($conn, $user_id);
   $businessName = $profile ? $profile['business_name'] : '';
   
   // Build the query based on available columns
   if ($hasRetailerId) {
       // If there's a retailer_id column, use it
       $query = "SELECT o.order_id, o.order_date, o.status, o.total_amount, 
                (SELECT COUNT(*) FROM order_items WHERE order_id = o.order_id) as item_count 
                FROM orders o 
                WHERE o.retailer_id = ? 
                ORDER BY o.order_date DESC 
                LIMIT ?";
       
       $stmt = $conn->prepare($query);
       $stmt->bind_param("ii", $user_id, $limit);
   } elseif ($hasCustomerId) {
       // If there's a customer_id column, use it
       $query = "SELECT o.order_id, o.order_date, o.status, o.total_amount, 
                (SELECT COUNT(*) FROM order_items WHERE order_id = o.order_id) as item_count 
                FROM orders o 
                WHERE o.customer_id = ? 
                ORDER BY o.order_date DESC 
                LIMIT ?";
       
       $stmt = $conn->prepare($query);
       $stmt->bind_param("ii", $user_id, $limit);
   } else {
       // If neither column exists, try to match by customer_name with the business name
       $query = "SELECT o.order_id, o.order_date, o.status, o.total_amount, 
                (SELECT COUNT(*) FROM order_items WHERE order_id = o.order_id) as item_count 
                FROM orders o 
                WHERE o.customer_name LIKE ? 
                ORDER BY o.order_date DESC 
                LIMIT ?";
       
       $businessNamePattern = "%$businessName%";
       $stmt = $conn->prepare($query);
       $stmt->bind_param("si", $businessNamePattern, $limit);
   }
   
   // Execute the query
   $stmt->execute();
   $result = $stmt->get_result();
   
   $orders = [];
   while ($row = $result->fetch_assoc()) {
       $orders[] = $row;
   }
   
   return $orders;
}

/**
* Get user activity log
* 
* @param mysqli $conn Database connection
* @param int $user_id User ID
* @param int $limit Number of activities to return
* @return array Activity log
*/
function getUserActivity($conn, $user_id, $limit = 5) {
   // Check if the user_activity_log table exists
   $tableExists = $conn->query("SHOW TABLES LIKE 'user_activity_log'")->num_rows > 0;
   
   if (!$tableExists) {
       return [];
   }
   
   $query = "SELECT * FROM user_activity_log 
             WHERE user_id = ? 
             ORDER BY activity_date DESC 
             LIMIT ?";
   
   $stmt = $conn->prepare($query);
   $stmt->bind_param("ii", $user_id, $limit);
   $stmt->execute();
   $result = $stmt->get_result();
   
   $activities = [];
   while ($row = $result->fetch_assoc()) {
       $activities[] = $row;
   }
   
   return $activities;
}

/**
* Get user login history
* 
* @param mysqli $conn Database connection
* @param int $user_id User ID
* @param int $limit Number of logins to return
* @return array Login history
*/
function getLoginHistory($conn, $user_id, $limit = 3) {
   // Check if the login_history table exists
   $tableExists = $conn->query("SHOW TABLES LIKE 'login_history'")->num_rows >
   0;
   
   if (!$tableExists) {
       return [];
   }
   
   $query = "SELECT * FROM login_history 
             WHERE user_id = ? 
             ORDER BY login_time DESC 
             LIMIT ?";
   
   $stmt = $conn->prepare($query);
   $stmt->bind_param("ii", $user_id, $limit);
   $stmt->execute();
   $result = $stmt->get_result();
   
   $logins = [];
   while ($row = $result->fetch_assoc()) {
       $logins[] = $row;
   }
   
   return $logins;
}

// Handle AJAX requests
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
   $response = ['success' => false, 'message' => 'Unknown action'];
   
   // Check if user is logged in
   if (!isset($_SESSION['user_id'])) {
       $response = ['success' => false, 'message' => 'Not logged in'];
       echo json_encode($response);
       exit;
   }
   
   $user_id = $_SESSION['user_id'];
   
   // Handle file upload for profile image
   if (isset($_FILES['profile_image']) && $_FILES['profile_image']['error'] === UPLOAD_ERR_OK) {
       // Create upload directory if it doesn't exist
       $upload_dir = '../uploads/profile_images/';
       
       // Make sure the directory exists and is writable
       if (!file_exists($upload_dir)) {
           if (!mkdir($upload_dir, 0755, true)) {
               $response = ['success' => false, 'message' => 'Failed to create upload directory'];
               echo json_encode($response);
               exit;
           }
       }
       
       if (!is_writable($upload_dir)) {
           $response = ['success' => false, 'message' => 'Upload directory is not writable'];
           echo json_encode($response);
           exit;
       }
       
       // Get file info
       $file_name = $_FILES['profile_image']['name'];
       $file_tmp = $_FILES['profile_image']['tmp_name'];
       $file_size = $_FILES['profile_image']['size'];
       $file_ext = strtolower(pathinfo($file_name, PATHINFO_EXTENSION));
       
       // Allowed file extensions
       $allowed_extensions = ['jpg', 'jpeg', 'png', 'gif'];
       
       // Validate file extension
       if (!in_array($file_ext, $allowed_extensions)) {
           $response = ['success' => false, 'message' => 'Invalid file extension. Only JPG, JPEG, PNG, and GIF are allowed.'];
           echo json_encode($response);
           exit;
       }
       
       // Validate file size (max 2MB)
       if ($file_size > 2097152) {
           $response = ['success' => false, 'message' => 'File size is too large. Maximum size is 2MB.'];
           echo json_encode($response);
           exit;
       }
       
       // Generate unique file name
       $new_file_name = 'profile_' . $user_id . '_' . time() . '.' . $file_ext;
       $upload_path = $upload_dir . $new_file_name;
       
       // Move uploaded file
       if (move_uploaded_file($file_tmp, $upload_path)) {
           // Update profile image in database
           $image_path = '../uploads/profile_images/' . $new_file_name;
           
           // Get current profile image
           $profile_data = getRetailerProfile($conn, $user_id);
           $old_image = $profile_data['profile_image'] ?? '';
           
           // Delete old image if it exists
           if (!empty($old_image) && file_exists($old_image) && $old_image !== $image_path) {
               @unlink($old_image);
           }
           
           if (updateProfileImage($conn, $user_id, $image_path)) {
               $response = [
                   'success' => true, 
                   'message' => 'Profile image updated successfully', 
                   'image_path' => $image_path
               ];
           } else {
               $response = ['success' => false, 'message' => 'Failed to update profile image in database: ' . $conn->error];
           }
       } else {
           $response = ['success' => false, 'message' => 'Failed to upload image'];
       }
       
       echo json_encode($response);
       exit;
   }
   
   // Handle other actions
   if (isset($_POST['action'])) {
       $action = $_POST['action'];
       
       switch ($action) {
           case 'update_profile':
               // Removed validation for required fields.
               // All fields are now optional on the server-side.
               
               // Prepare data for update, defaulting to empty string if not set
               $data = [
                   'first_name' => $_POST['first_name'] ?? '',
                   'last_name' => $_POST['last_name'] ?? '',
                   'birthday' => $_POST['birthday'] ?? '',
                   'nationality' => $_POST['nationality'] ?? '',
                   'business_name' => $_POST['business_name'] ?? '',
                   'business_address' => $_POST['business_address'] ?? '',
                   'phone' => $_POST['phone'] ?? '',
                   'facebook' => $_POST['facebook'] ?? '',
                   'instagram' => $_POST['instagram'] ?? '',
                   'tiktok' => $_POST['tiktok'] ?? ''
               ];
               
               // Update profile
               if (updateRetailerProfile($conn, $user_id, $data)) {
                   $response = ['success' => true, 'message' => 'Profile updated successfully'];
               } else {
                   $response = ['success' => false, 'message' => 'Failed to update profile: ' . $conn->error];
               }
               break;
               
           case 'update_account':
               // Validate email
               if (!isset($_POST['email']) || empty($_POST['email'])) {
                   $response = ['success' => false, 'message' => 'Email is required'];
                   echo json_encode($response);
                   exit;
               }
               
               $email = $_POST['email'];
               $current_password = $_POST['current_password'] ?? '';
               $new_password = $_POST['new_password'] ?? '';
               $confirm_password = $_POST['confirm_password'] ?? '';
               
               // If current password is provided, verify it
               if (!empty($current_password)) {
                   if (!verifyPassword($conn, $user_id, $current_password)) {
                       $response = ['success' => false, 'message' => 'Current password is incorrect'];
                       echo json_encode($response);
                       exit;
                   }
                   
                   // If new password is provided, check if it matches confirmation
                   if (!empty($new_password)) {
                       if ($new_password !== $confirm_password) {
                           $response = ['success' => false, 'message' => 'New password and confirmation do not match'];
                           echo json_encode($response);
                           exit;
                       }
                       
                       // Update email and password
                       if (updateUserAccount($conn, $user_id, $email, $new_password)) {
                           $response = ['success' => true, 'message' => 'Account information updated successfully'];
                       } else {
                           $response = ['success' => false, 'message' => 'Failed to update account information: ' . $conn->error];
                       }
                   } else {
                       // Update only email
                       if (updateUserAccount($conn, $user_id, $email)) {
                           $response = ['success' => true, 'message' => 'Email updated successfully'];
                       } else {
                           $response = ['success' => false, 'message' => 'Failed to update email: ' . $conn->error];
                       }
                   }
               } else {
                   // Update only email without password verification
                   if (updateUserAccount($conn, $user_id, $email)) {
                       $response = ['success' => true, 'message' => 'Email updated successfully'];
                   } else {
                       $response = ['success' => false, 'message' => 'Failed to update email: ' . $conn->error];
                   }
               }
               break;
               
           case 'get_profile_data':
               $user_data = getUserData($conn, $user_id);
               $profile_data = getRetailerProfile($conn, $user_id);
               
               if ($user_data && $profile_data) {
                   $response = [
                       'success' => true,
                       'user_data' => $user_data,
                       'profile_data' => $profile_data
                   ];
               } else {
                   $response = ['success' => false, 'message' => 'Failed to fetch profile data'];
               }
               break;
       }
   }
   
   echo json_encode($response);
   exit;
}
?>