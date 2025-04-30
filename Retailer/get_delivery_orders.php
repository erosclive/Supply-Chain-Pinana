<?php
// Include database connection
require_once 'db_connection.php';

// Set header to return JSON
header('Content-Type: application/json');

// Start session if not already started
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Check if user is logged in
if (!isset($_SESSION['user_id'])) {
    echo json_encode([
        'success' => false,
        'message' => 'User not logged in'
    ]);
    exit;
}

// Get user ID from session
$userId = $_SESSION['user_id'];

try {
    // First, get the user's email
    $userQuery = "SELECT email FROM users WHERE id = ?";
    $userStmt = $conn->prepare($userQuery);
    
    if (!$userStmt) {
        throw new Exception("Prepare failed for user query: " . $conn->error);
    }
    
    $userStmt->bind_param("i", $userId);
    
    if (!$userStmt->execute()) {
        throw new Exception("Execute failed for user query: " . $userStmt->error);
    }
    
    $userResult = $userStmt->get_result();
    
    if ($userRow = $userResult->fetch_assoc()) {
        $userEmail = $userRow['email'];
        
        // Get filter parameters
        $status = isset($_GET['status']) ? $_GET['status'] : 'all';
        $dateRange = isset($_GET['date_range']) ? $_GET['date_range'] : 'all';
        $search = isset($_GET['search']) ? $_GET['search'] : '';
        
        // Build the query - filter by retailer_email matching user's email
        $query = "SELECT * FROM retailer_orders WHERE retailer_email = ?";
        $params = [$userEmail];
        $types = "s"; // string for email
        
        // Filter by status if provided
        if ($status !== 'all') {
            $query .= " AND status = ?";
            $params[] = $status;
            $types .= "s";
        }
        
        // Filter by date range if provided
        if ($dateRange !== 'all') {
            switch ($dateRange) {
                case 'today':
                    $query .= " AND DATE(order_date) = CURDATE()";
                    break;
                case 'week':
                    $query .= " AND YEARWEEK(order_date, 1) = YEARWEEK(CURDATE(), 1)";
                    break;
                case 'month':
                    $query .= " AND MONTH(order_date) = MONTH(CURDATE()) AND YEAR(order_date) = YEAR(CURDATE())";
                    break;
            }
        }
        
        // Search functionality
        if (!empty($search)) {
            $query .= " AND (po_number LIKE ? OR retailer_name LIKE ? OR notes LIKE ?)";
            $searchTerm = "%$search%";
            $params[] = $searchTerm;
            $params[] = $searchTerm;
            $params[] = $searchTerm;
            $types .= "sss";
        }
        
        // Order by most recent first
        $query .= " ORDER BY order_date DESC";
        
        // Prepare and execute the query
        $stmt = $conn->prepare($query);
        
        if (!$stmt) {
            throw new Exception("Prepare failed: " . $conn->error);
        }
        
        $stmt->bind_param($types, ...$params);
        
        if (!$stmt->execute()) {
            throw new Exception("Execute failed: " . $stmt->error);
        }
        
        $result = $stmt->get_result();
        
        // Fetch all orders
        $orders = [];
        while ($row = $result->fetch_assoc()) {
            // Get order items
            $itemsQuery = "SELECT * FROM retailer_order_items WHERE order_id = ?";
            $itemsStmt = $conn->prepare($itemsQuery);
            $itemsStmt->bind_param("i", $row['order_id']);
            $itemsStmt->execute();
            $itemsResult = $itemsStmt->get_result();
            
            $items = [];
            $itemCount = 0;
            while ($item = $itemsResult->fetch_assoc()) {
                $items[] = $item;
                $itemCount += $item['quantity'];
            }
            
            $row['items'] = $items;
            $row['item_count'] = $itemCount;
            
            // Get status history
            $historyQuery = "SELECT * FROM retailer_order_status_history WHERE order_id = ? ORDER BY created_at DESC";
            $historyStmt = $conn->prepare($historyQuery);
            $historyStmt->bind_param("i", $row['order_id']);
            $historyStmt->execute();
            $historyResult = $historyStmt->get_result();
            
            $statusHistory = [];
            while ($history = $historyResult->fetch_assoc()) {
                $statusHistory[] = $history;
            }
            
            $row['status_history'] = $statusHistory;
            
            $orders[] = $row;
        }
        
        echo json_encode([
            'success' => true,
            'orders' => $orders
        ]);
        
    } else {
        throw new Exception("User email not found");
    }
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Error: ' . $e->getMessage()
    ]);
}
?>
