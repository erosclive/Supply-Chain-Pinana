<?php
// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Include database connection
require_once 'db_connection.php';

// Set header to return JSON
header('Content-Type: application/json');

// Start session if not already started
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Initialize response array
$response = ['success' => false, 'message' => '', 'alerts' => []];

// Check if user is logged in
if (!isset($_SESSION['user_id'])) {
    $response['message'] = 'User not logged in';
    echo json_encode($response);
    exit;
}

// Get expiring batches
function getExpiringBatches($conn, $daysThreshold = 30) {
    $query = "SELECT p.product_id, p.product_name, b.batch_id, b.batch_code, 
              b.quantity, b.expiration_date, 
              DATEDIFF(b.expiration_date, CURDATE()) as days_until_expiry 
              FROM product_batches b 
              JOIN products p ON b.product_id = p.product_id 
              WHERE b.quantity > 0 
              AND b.expiration_date IS NOT NULL 
              AND b.expiration_date != '0000-00-00' 
              AND DATEDIFF(b.expiration_date, CURDATE()) <= ? 
              ORDER BY days_until_expiry ASC";
    
    $stmt = $conn->prepare($query);
    $stmt->bind_param('i', $daysThreshold);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $expiringBatches = [];
    while ($row = $result->fetch_assoc()) {
        $expiringBatches[] = $row;
    }
    
    return $expiringBatches;
}

try {
    // Get expiring batches
    $expiringBatches = getExpiringBatches($conn, 30);
    
    // Group by severity
    $critical = []; // 0-7 days
    $warning = []; // 8-30 days
    $expired = []; // already expired
    
    foreach ($expiringBatches as $batch) {
        if ($batch['days_until_expiry'] < 0) {
            $expired[] = $batch;
        } elseif ($batch['days_until_expiry'] <= 7) {
            $critical[] = $batch;
        } else {
            $warning[] = $batch;
        }
    }
    
    // Prepare response
    $response['success'] = true;
    $response['alerts'] = [
        'expired' => $expired,
        'critical' => $critical,
        'warning' => $warning
    ];
    $response['total_alerts'] = count($expired) + count($critical) + count($warning);
    $response['message'] = 'Batch alerts retrieved successfully';
    
} catch (Exception $e) {
    $response['message'] = 'Error: ' . $e->getMessage();
    error_log("Error getting batch alerts: " . $e->getMessage());
}

// Return response
echo json_encode($response);
?>