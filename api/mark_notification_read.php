<?php
// Include database connection
require_once 'db_connection.php';

// Set headers for JSON response
header('Content-Type: application/json');

// Check if it's a POST request
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode([
        'status' => 'error',
        'message' => 'Invalid request method. POST required.'
    ]);
    exit;
}

// Get the notification ID from the request
$data = json_decode(file_get_contents('php://input'), true);
$notificationId = isset($data['notification_id']) ? $data['notification_id'] : null;

if (!$notificationId) {
    echo json_encode([
        'status' => 'error',
        'message' => 'Notification ID is required'
    ]);
    exit;
}

try {
    // Update the notification to mark it as read
    $sql = "UPDATE notifications 
            SET is_read = 1, read_at = NOW() 
            WHERE notification_id = ?";
    
    $stmt = mysqli_prepare($conn, $sql);
    mysqli_stmt_bind_param($stmt, "s", $notificationId);
    mysqli_stmt_execute($stmt);
    
    // Check if any rows were affected
    if (mysqli_stmt_affected_rows($stmt) > 0) {
        echo json_encode([
            'status' => 'success',
            'message' => 'Notification marked as read'
        ]);
    } else {
        echo json_encode([
            'status' => 'error',
            'message' => 'Notification not found or already read'
        ]);
    }
    
    mysqli_stmt_close($stmt);
    
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
