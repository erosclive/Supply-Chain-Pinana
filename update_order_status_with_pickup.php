<?php
// Include database connection
require_once 'db_connection.php';

// Check if request method is POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Invalid request method']);
    exit;
}

// Get form data
$orderId = $_POST['order_id'] ?? '';
$status = $_POST['status'] ?? '';
$pickupStatus = $_POST['pickup_status'] ?? '';
$pickupPersonName = $_POST['pickup_person_name'] ?? '';
$pickupIdVerified = isset($_POST['pickup_id_verified']) ? 1 : 0;
$pickupNotes = $_POST['pickup_notes'] ?? '';
$notes = $_POST['notes'] ?? '';
$notifyEmail = isset($_POST['notify_email']) && $_POST['notify_email'] == '1';

// Validate required fields
if (empty($orderId) || empty($pickupPersonName)) {
    echo json_encode(['success' => false, 'message' => 'Order ID and pickup person name are required']);
    exit;
}

// Validate ID verification
if (!$pickupIdVerified) {
    echo json_encode(['success' => false, 'message' => 'ID verification is required']);
    exit;
}

try {
    // Update order status and add pickup information
    // Use mysqli instead of PDO to match your db_connection.php
    $stmt = $conn->prepare("UPDATE retailer_orders SET 
        status = 'delivered', 
        pickup_status = 'picked up', 
        notes = ?, 
        pickup_person_name = ?, 
        pickup_id_verified = ?, 
        pickup_notes = ?, 
        updated_at = NOW() 
        WHERE order_id = ?");
    
    $stmt->bind_param("ssssi", 
        $notes, 
        $pickupPersonName, 
        $pickupIdVerified, 
        $pickupNotes, 
        $orderId
    );
    
    $result = $stmt->execute();
    
    if ($result) {
        // Add to status history
        $historyQuery = "INSERT INTO retailer_order_status_history (order_id, status, notes, created_at) VALUES (?, ?, ?, NOW())";
        $historyStmt = $conn->prepare($historyQuery);
        $historyStatus = "picked up"; // Space instead of dash for history
        $historyStmt->bind_param("iss", $orderId, $historyStatus, $notes);
        $historyStmt->execute();
        
        // Send email notification if requested
        if ($notifyEmail) {
            // Email notification logic would go here
        }
        
        echo json_encode(['success' => true, 'message' => 'Order status updated successfully']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Failed to update order status']);
    }
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}
?>
