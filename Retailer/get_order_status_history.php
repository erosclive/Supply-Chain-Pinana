<?php
// Include database connection
require_once 'db_connection.php';

// Set header to return JSON
header('Content-Type: application/json');

// Get POST data
$data = json_decode(file_get_contents('php://input'), true);

// Check if order_ids is provided
if (!isset($data['order_ids']) || !is_array($data['order_ids'])) {
    echo json_encode([
        'success' => false,
        'message' => 'Order IDs are required'
    ]);
    exit;
}

$orderIds = $data['order_ids'];

try {
    // Create placeholders for the IN clause
    $placeholders = str_repeat('?,', count($orderIds) - 1) . '?';
    
    // Query to get status history for the orders
    $query = "SELECT * FROM supplychain_db.retailer_order_status_history WHERE order_id IN ($placeholders) ORDER BY created_at ASC";
    
    $stmt = $conn->prepare($query);
    
    // Bind parameters dynamically
    $types = str_repeat('i', count($orderIds));
    $stmt->bind_param($types, ...$orderIds);
    
    $stmt->execute();
    $result = $stmt->get_result();
    
    $history = [];
    while ($row = $result->fetch_assoc()) {
        $history[] = $row;
    }
    
    echo json_encode([
        'success' => true,
        'history' => $history
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Error: ' . $e->getMessage()
    ]);
}
?>
