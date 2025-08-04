<?php
// Include database connection
require_once 'db_connection.php';

// Set headers for JSON response
header('Content-Type: application/json');

session_start();
$user_id = $_SESSION['user_id'] ?? null;
if (!$user_id) {
    echo json_encode(['status' => 'error', 'message' => 'Not logged in']);
    exit;
}

try {
    // Get parameters
    $limit = isset($_GET['limit']) ? intval($_GET['limit']) : 10;
    $offset = isset($_GET['offset']) ? intval($_GET['offset']) : 0;
    $unreadOnly = isset($_GET['unread_only']) && $_GET['unread_only'] === 'true';
    
    // Build the SQL query
    $sql = "SELECT n.*, ro.po_number, ro.retailer_name, ro.expected_delivery, ro.delivery_mode, ro.pickup_date, ro.pickup_location, ro.status
            FROM notifications n
            LEFT JOIN retailer_orders ro ON n.related_id = ro.order_id
            WHERE n.user_id = ?";
    
    if ($unreadOnly) {
        $sql .= " AND n.is_read = 0";
    }
    
    $sql .= " ORDER BY n.created_at DESC LIMIT ?, ?";
    
    $stmt = mysqli_prepare($conn, $sql);
    mysqli_stmt_bind_param($stmt, "iii", $user_id, $offset, $limit);
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);
    
    // Fetch all notifications
    $notifications = [];
    while ($row = mysqli_fetch_assoc($result)) {
        $notifications[] = $row;
    }
    
    mysqli_stmt_close($stmt);
    
    // Get total count
    $countSql = "SELECT COUNT(*) as total FROM notifications";
    if ($unreadOnly) {
        $countSql .= " WHERE is_read = 0";
    }
    
    $countResult = mysqli_query($conn, $countSql);
    $totalCount = mysqli_fetch_assoc($countResult)['total'];
    
    // Return the notifications as JSON
    echo json_encode([
        'status' => 'success',
        'data' => $notifications,
        'count' => count($notifications),
        'total' => intval($totalCount)
    ]);
    
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
