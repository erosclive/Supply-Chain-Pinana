<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Database connection
$host = 'localhost';
$dbname = 'supplychain_db';
$username = 'root'; // Update with your database username
$password = ''; // Update with your database password

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch(PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Database connection failed: ' . $e->getMessage()]);
    exit;
}

// Get JSON input
$input = json_decode(file_get_contents('php://input'), true);

if (!isset($input['user_id']) || !isset($input['approval_status'])) {
    echo json_encode(['success' => false, 'message' => 'User ID and approval status are required']);
    exit;
}

$user_id = (int)$input['user_id'];
$approval_status = $input['approval_status'];

// Validate approval status
if (!in_array($approval_status, ['pending', 'approved', 'rejected'])) {
    echo json_encode(['success' => false, 'message' => 'Invalid approval status']);
    exit;
}

try {
    // Start transaction
    $pdo->beginTransaction();
    
    // Map approval status to user table fields
    $email_verified = 0;
    $is_active = 0;
    
    switch ($approval_status) {
        case 'approved':
            $email_verified = 1;  // Email is considered verified when approved
            $is_active = 1;       // Account is active
            break;
        case 'pending':
            $email_verified = 0;  // Email not verified while pending
            $is_active = 0;       // Account inactive while pending
            break;
        case 'rejected':
            $email_verified = 0;  // Email verification revoked when rejected
            $is_active = 0;       // Account inactive when rejected
            break;
    }
    
    // Update user status with explicit approval_status
$sql = "UPDATE users SET 
            approval_status = ?, 
            email_verified = ?, 
            is_active = ?
        WHERE id = ? AND role = 'retailer'";

$stmt = $pdo->prepare($sql);
$result1 = $stmt->execute([$approval_status, $email_verified, $is_active, $user_id]);

// Also update retailer_profiles table
$sql2 = "UPDATE retailer_profiles SET 
             approval_status = ?, 
             updated_at = CURRENT_TIMESTAMP
         WHERE user_id = ?";

$stmt2 = $pdo->prepare($sql2);
$result2 = $stmt2->execute([$approval_status, $user_id]);

if ($result1 && $result2 && ($stmt->rowCount() > 0 || $stmt2->rowCount() > 0)) {
        // Get retailer info for logging/notification
        $retailer_sql = "SELECT u.email, u.full_name, rp.first_name, rp.last_name 
                        FROM users u 
                        LEFT JOIN retailer_profiles rp ON u.id = rp.user_id 
                        WHERE u.id = ?";
        $retailer_stmt = $pdo->prepare($retailer_sql);
        $retailer_stmt->execute([$user_id]);
        $retailer_info = $retailer_stmt->fetch(PDO::FETCH_ASSOC);
        
        // Commit transaction
        $pdo->commit();
        
        // Log the status change
        $log_message = date('Y-m-d H:i:s') . " - Retailer status updated: User ID $user_id ({$retailer_info['email']}) changed to $approval_status\n";
        file_put_contents('retailer_status_log.txt', $log_message, FILE_APPEND);
        
        echo json_encode([
            'success' => true,
            'message' => 'Retailer status updated successfully',
            'user_id' => $user_id,
            'approval_status' => $approval_status,
            'retailer_name' => $retailer_info['first_name'] . ' ' . $retailer_info['last_name']
        ]);
    } else {
        $pdo->rollback();
        echo json_encode(['success' => false, 'message' => 'Retailer not found or no changes made']);
    }
    
} catch(PDOException $e) {
    $pdo->rollback();
    echo json_encode([
        'success' => false,
        'message' => 'Database error: ' . $e->getMessage()
    ]);
}
?>