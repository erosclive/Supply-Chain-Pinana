<?php
require_once 'db_connection.php';
header('Content-Type: application/json');

try {
    $sql = "SELECT 
                p.id,
                p.production_id,
                p.product_name,
                p.category,
                p.batch_size,
                p.priority,
                p.status,
                p.progress,
                p.start_date,
                p.estimated_completion,
                p.actual_completion,
                p.production_type,
                p.created_at,
                COUNT(ps.id) as total_steps,
                COUNT(CASE WHEN ps.status = 'completed' THEN 1 END) as completed_steps
            FROM productions p
            LEFT JOIN production_steps ps ON p.id = ps.production_id
            WHERE p.status IN ('pending', 'in-progress', 'quality-check')
            GROUP BY p.id
            ORDER BY 
                CASE p.priority 
                    WHEN 'urgent' THEN 1 
                    WHEN 'high' THEN 2 
                    WHEN 'normal' THEN 3 
                END,
                p.start_date ASC";
    
    $result = mysqli_query($conn, $sql);
    
    if (!$result) {
        throw new Exception('Database query failed: ' . mysqli_error($conn));
    }
    
    $productions = [];
    
    while ($row = mysqli_fetch_assoc($result)) {
        // Calculate progress based on completed steps
        $progress = 0;
        if ($row['total_steps'] > 0) {
            $progress = round(($row['completed_steps'] / $row['total_steps']) * 100, 2);
        }
        
        // Update progress in database if different
        if ($progress != $row['progress']) {
            $update_sql = "UPDATE productions SET progress = ? WHERE id = ?";
            $update_stmt = mysqli_prepare($conn, $update_sql);
            mysqli_stmt_bind_param($update_stmt, 'di', $progress, $row['id']);
            mysqli_stmt_execute($update_stmt);
            mysqli_stmt_close($update_stmt);
            $row['progress'] = $progress;
        }
        
        // Auto-update status based on progress
        $new_status = $row['status'];
        if ($progress >= 100 && $row['status'] != 'completed') {
            $new_status = 'quality-check';
        } else if ($progress >= 80 && $row['status'] == 'pending') {
            $new_status = 'quality-check';
        } else if ($progress > 0 && $row['status'] == 'pending') {
            $new_status = 'in-progress';
        }
        
        if ($new_status != $row['status']) {
            $status_sql = "UPDATE productions SET status = ? WHERE id = ?";
            $status_stmt = mysqli_prepare($conn, $status_sql);
            mysqli_stmt_bind_param($status_stmt, 'si', $new_status, $row['id']);
            mysqli_stmt_execute($status_stmt);
            mysqli_stmt_close($status_stmt);
            $row['status'] = $new_status;
        }
        
        $productions[] = [
            'id' => $row['id'],
            'production_id' => $row['production_id'],
            'product_name' => $row['product_name'],
            'category' => $row['category'],
            'batch_size' => intval($row['batch_size']),
            'priority' => $row['priority'],
            'status' => $row['status'],
            'progress' => floatval($row['progress']),
            'start_date' => $row['start_date'],
            'estimated_completion' => $row['estimated_completion'],
            'actual_completion' => $row['actual_completion'],
            'production_type' => $row['production_type'],
            'total_steps' => intval($row['total_steps']),
            'completed_steps' => intval($row['completed_steps'])
        ];
    }
    
    echo json_encode([
        'success' => true,
        'productions' => $productions,
        'total_count' => count($productions)
    ]);
    
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
    error_log("Get ongoing productions error: " . $e->getMessage());
}

mysqli_close($conn);
?>
