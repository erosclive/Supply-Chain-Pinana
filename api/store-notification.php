<?php
// Include database connection
require_once '../db_connection.php';

// Set headers for JSON response
header('Content-Type: application/json');

// Function to store a notification in the database
function storeNotification($conn, $relatedId, $type, $message, $user_id = null) {
    // Generate a unique notification ID
    $notificationId = uniqid('notif_');
    
    $sql = "INSERT INTO notifications (notification_id, related_id, type, message, user_id) 
            VALUES (?, ?, ?, ?, ?)";
    
    $stmt = mysqli_prepare($conn, $sql);
    mysqli_stmt_bind_param($stmt, "ssssi", $notificationId, $relatedId, $type, $message, $user_id);
    $result = mysqli_stmt_execute($stmt);
    mysqli_stmt_close($stmt);
    
    return $result;
}

try {
    // Create notifications table if it doesn't exist
    $createTableSql = "CREATE TABLE IF NOT EXISTS notifications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        notification_id VARCHAR(50) NOT NULL,
        related_id VARCHAR(50) NOT NULL,
        type VARCHAR(50) NOT NULL,
        message TEXT NOT NULL,
        is_read TINYINT(1) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        read_at TIMESTAMP NULL
    )";
    
    if (!mysqli_query($conn, $createTableSql)) {
        throw new Exception(mysqli_error($conn));
    }
    
    // Check if it's a POST request to manually create a notification
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $data = json_decode(file_get_contents('php://input'), true);
        
        if (isset($data['related_id']) && isset($data['type']) && isset($data['message'])) {
            $user_id = $data['user_id'] ?? ($_SESSION['user_id'] ?? null);
            $success = storeNotification(
                $conn, 
                $data['related_id'], 
                $data['type'], 
                $data['message'],
                $user_id
            );
            
            if ($success) {
                echo json_encode([
                    'status' => 'success',
                    'message' => 'Notification stored successfully'
                ]);
            } else {
                echo json_encode([
                    'status' => 'error',
                    'message' => 'Failed to store notification: ' . mysqli_error($conn)
                ]);
            }
        } else {
            echo json_encode([
                'status' => 'error',
                'message' => 'Missing required fields'
            ]);
        }
        exit;
    }
    
} catch (Exception $e) {
    // Return error message
    echo json_encode([
        'status' => 'error',
        'message' => 'Database error: ' . $e->getMessage()
    ]);
}

// Close the connection
mysqli_close($conn);
?>
