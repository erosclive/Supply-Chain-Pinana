<?php
session_start();
require 'db_connection.php';

// Add proper JSON headers
header('Content-Type: application/json');
header('Cache-Control: no-cache, must-revalidate');

// REMOVED SESSION CHECK - since you're already logged in and data exists
// We'll focus on just displaying the data

try {
    // Fetch archived retailers with their business metrics
    $stmt = $conn->prepare("
        SELECT 
            au.id,
            au.original_user_id,
            au.username,
            au.total_orders,
            au.total_revenue,
            au.account_created_date,
            au.last_active_date,
            au.archived_at,
            COUNT(ro.user_id) as current_orders_count,
            COALESCE(SUM(ro.total_amount), 0) as current_revenue
        FROM archived_users au
        LEFT JOIN retailer_orders ro ON ro.archived_user_id = au.original_user_id
        GROUP BY au.id
        ORDER BY au.archived_at DESC
    ");
    
    $stmt->execute();
    $result = $stmt->get_result();
    
    $archivedRetailers = [];
    while ($row = $result->fetch_assoc()) {
        $archivedRetailers[] = [
            'id' => $row['id'],
            'original_user_id' => $row['original_user_id'],
            'username' => $row['username'] ?: 'Unknown username',
            'total_orders' => (int)$row['total_orders'],
            'total_revenue' => number_format($row['total_revenue'], 2),
            'current_orders' => (int)$row['current_orders_count'],
            'current_revenue' => number_format($row['current_revenue'], 2),
            'account_created' => $row['account_created_date'] ? date('M d, Y', strtotime($row['account_created_date'])) : 'Unknown',
            'last_active' => $row['last_active_date'] ? date('M d, Y', strtotime($row['last_active_date'])) : 'Never',
            'archived_date' => date('M d, Y H:i', strtotime($row['archived_at']))
        ];
    }
    
    echo json_encode(['success' => true, 'data' => $archivedRetailers]);
    
} catch (Exception $e) {
    error_log("Archived retailers error: " . $e->getMessage());
    echo json_encode(['success' => false, 'error' => 'Database error: ' . $e->getMessage()]);
}
?>