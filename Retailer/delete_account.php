<?php
session_start();
require 'db_connection.php';

$userId = $_SESSION['user_id'] ?? null;
$password = $_POST['password'] ?? '';

if (!$userId || empty($password)) {
    echo 'unauthorized';
    exit();
}

// Fetch user password and basic info
$stmt = $conn->prepare("SELECT password, username, created_at FROM users WHERE id = ?");
$stmt->bind_param("i", $userId);
$stmt->execute();
$result = $stmt->get_result();
$user = $result->fetch_assoc();

if (!$user || !password_verify($password, $user['password'])) {
    echo 'invalid'; // Wrong password
    exit();
}

// Check for pending payments
$paymentCheckStmt = $conn->prepare("SELECT COUNT(*) AS pending_count FROM retailer_orders WHERE user_id = ? AND payment_status = 'Pending'");
$paymentCheckStmt->bind_param("i", $userId);
$paymentCheckStmt->execute();
$paymentResult = $paymentCheckStmt->get_result();
$paymentStatus = $paymentResult->fetch_assoc();

if ($paymentStatus['pending_count'] > 0) {
    echo 'has_pending';
    exit();
}

// Start transaction for archiving process
$conn->begin_transaction();

try {
    // Calculate business metrics before archiving
    $metricsStmt = $conn->prepare("
        SELECT 
            COUNT(*) as total_orders,
            COALESCE(SUM(total_amount), 0) as total_revenue,
            MAX(order_date) as last_active_date
        FROM retailer_orders 
        WHERE user_id = ?
    ");
    $metricsStmt->bind_param("i", $userId);
    $metricsStmt->execute();
    $metrics = $metricsStmt->get_result()->fetch_assoc();

    // Archive user business data (keeping only business-relevant information)
    $archiveStmt = $conn->prepare("
        INSERT INTO archived_users (
            original_user_id, 
            username, 
            total_orders, 
            total_revenue, 
            account_created_date, 
            last_active_date
        ) VALUES (?, ?, ?, ?, ?, ?)
    ");
    
    $archiveStmt->bind_param(
        "isidss", 
        $userId,
        $user['username'],
        $metrics['total_orders'],
        $metrics['total_revenue'],
        $user['created_at'],
        $metrics['last_active_date']
    );
    $archiveStmt->execute();

    // Update retailer_orders to reference archived account
    $updateOrdersStmt = $conn->prepare("
        UPDATE retailer_orders 
        SET user_id = NULL, 
            archived_user_id = ? 
        WHERE user_id = ?
    ");
    $updateOrdersStmt->bind_param("ii", $userId, $userId);
    $updateOrdersStmt->execute();

    // Remove personal information but keep business records
    // Delete user account (personal data)
    $delStmt = $conn->prepare("DELETE FROM users WHERE id = ?");
    $delStmt->bind_param("i", $userId);
    $delStmt->execute();

    // Commit transaction
    $conn->commit();
    
    session_destroy();
    echo 'success';
    
} catch (Exception $e) {
    // Rollback transaction on error
    $conn->rollback();
    echo 'error';
}

exit();
?>