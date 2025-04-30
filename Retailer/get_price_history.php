<?php
// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Include database connection
require_once 'db_connection.php';

// Start session if not already started
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Set header to return JSON
header('Content-Type: application/json');

// Initialize response array
$response = ['success' => false, 'message' => '', 'history' => []];

// Get user ID from session
$user_id = isset($_SESSION['user_id']) ? $_SESSION['user_id'] : null;

try {
    // Check if user is logged in
    if (!$user_id) {
        throw new Exception("User not logged in");
    }
    
    // Check if product_id is provided
    if (!isset($_GET['product_id'])) {
        throw new Exception("Product ID is required");
    }
    
    $product_id = $_GET['product_id'];
    
    // Get price history for the product
    $historyQuery = "SELECT 
                        ph.history_id,
                        ph.product__id,
                        ph.previous_price,
                        ph.new_price,
                        ph.updated_by,
                        ph.created_at
                    FROM 
                        product_price_history ph
                    WHERE 
                        ph.retailer_id = ? AND ph.product_id = ?
                    ORDER BY 
                        ph.created_at DESC";
    
    $historyStmt = $conn->prepare($historyQuery);
    
    if (!$historyStmt) {
        throw new Exception("Prepare failed for history query: " . $conn->error);
    }
    
    $historyStmt->bind_param("is", $user_id, $product_id);
    
    if (!$historyStmt->execute()) {
        throw new Exception("Execute failed for history query: " . $historyStmt->error);
    }
    
    $historyResult = $historyStmt->get_result();
    
    $history = [];
    while ($historyRow = $historyResult->fetch_assoc()) {
        $history[] = $historyRow;
    }
    
    $response['success'] = true;
    $response['history'] = $history;
    
} catch (Exception $e) {
    $response['message'] = "Error: " . $e->getMessage();
    error_log("Error fetching price history: " . $e->getMessage());
}

echo json_encode($response);
?>
