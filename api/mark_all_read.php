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

try {
    // Update all unread notifications to mark them as read
    $sql = "UPDATE notifications 
            SET is_read = 1, read_at = NOW() 
            WHERE is_read = 0";
    
    $result = mysqli_query($conn, $sql);
    
    // Check if query was successful
    if ($result) {
        $affectedRows = mysqli_affected_rows($conn);
        echo json_encode([
            'status' => 'success',
            'message' => $affectedRows . ' notification(s) marked as read',
            'count' => $affectedRows
        ]);
    } else {
        throw new Exception(mysqli_error($conn));
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
