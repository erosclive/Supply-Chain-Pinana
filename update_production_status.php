<?php
require_once 'db_connection.php';
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Invalid request method']);
    exit;
}

try {
    $production_id = intval($_POST['production_id'] ?? 0);
    $action = $_POST['action'] ?? '';
    $target_status = $_POST['target_status'] ?? '';
    
    if (!$production_id) {
        throw new Exception('Production ID is required');
    }
    
    mysqli_autocommit($conn, false); // Start transaction
    
    // Get current production status
    $current_sql = "SELECT status, progress, batch_size FROM productions WHERE id = ?";
    $current_stmt = mysqli_prepare($conn, $current_sql);
    mysqli_stmt_bind_param($current_stmt, 'i', $production_id);
    mysqli_stmt_execute($current_stmt);
    $current_result = mysqli_stmt_get_result($current_stmt);
    $current_data = mysqli_fetch_assoc($current_result);
    mysqli_stmt_close($current_stmt);
    
    if (!$current_data) {
        throw new Exception('Production not found');
    }
    
    $current_status = $current_data['status'];
    $current_progress = floatval($current_data['progress']);
    $batch_size = intval($current_data['batch_size']);
    
    // Determine next status based on current status
    $new_status = $current_status;
    $new_progress = $current_progress;
    
    if ($action === 'advance_status') {
        switch ($current_status) {
            case 'pending':
                $new_status = 'in-progress';
                $new_progress = max(10, $current_progress);
                break;
                
            case 'in-progress':
                $new_status = 'quality-check';
                $new_progress = max(80, $current_progress);
                break;
                
            case 'quality-check':
                // This should be handled by the quality check process
                $new_status = 'completed';
                $new_progress = 100;
                
                // Set actual completion time
                $completion_sql = "UPDATE productions 
                                 SET actual_completion = NOW() 
                                 WHERE id = ?";
                $completion_stmt = mysqli_prepare($conn, $completion_sql);
                mysqli_stmt_bind_param($completion_stmt, 'i', $production_id);
                mysqli_stmt_execute($completion_stmt);
                mysqli_stmt_close($completion_stmt);
                break;
                
            default:
                throw new Exception('Cannot advance from current status: ' . $current_status);
        }
    } else if ($target_status) {
        // Direct status update
        $new_status = $target_status;
        
        // Set appropriate progress based on status
        switch ($new_status) {
            case 'pending':
                $new_progress = 0;
                break;
            case 'in-progress':
                $new_progress = max(10, $current_progress);
                break;
            case 'quality-check':
                $new_progress = max(80, $current_progress);
                break;
            case 'completed':
                $new_progress = 100;
                break;
            case 'cancelled':
                $new_progress = $current_progress; // Keep current progress
                break;
        }
    }
    
    // Update production status and progress
    $update_sql = "UPDATE productions 
                  SET status = ?, progress = ?, updated_at = NOW() 
                  WHERE id = ?";
    $update_stmt = mysqli_prepare($conn, $update_sql);
    mysqli_stmt_bind_param($update_stmt, 'sdi', $new_status, $new_progress, $production_id);
    
    if (!mysqli_stmt_execute($update_stmt)) {
        throw new Exception('Failed to update production: ' . mysqli_stmt_error($update_stmt));
    }
    mysqli_stmt_close($update_stmt);
    
    // Create production step records if moving to in-progress for the first time
    if ($new_status === 'in-progress' && $current_status === 'pending') {
        $steps_check_sql = "SELECT COUNT(*) as step_count FROM production_steps WHERE production_id = ?";
        $steps_check_stmt = mysqli_prepare($conn, $steps_check_sql);
        mysqli_stmt_bind_param($steps_check_stmt, 'i', $production_id);
        mysqli_stmt_execute($steps_check_stmt);
        $steps_check_result = mysqli_stmt_get_result($steps_check_stmt);
        $steps_data = mysqli_fetch_assoc($steps_check_result);
        mysqli_stmt_close($steps_check_stmt);
        
        if ($steps_data['step_count'] == 0) {
            // Create default production steps
            $default_steps = [
                ['step_number' => 1, 'step_name' => 'Material Preparation', 'description' => 'Gather and prepare all materials', 'estimated_duration' => 30],
                ['step_number' => 2, 'step_name' => 'Production Setup', 'description' => 'Set up equipment and workspace', 'estimated_duration' => 15],
                ['step_number' => 3, 'step_name' => 'Production Process', 'description' => 'Execute main production process', 'estimated_duration' => 240],
                ['step_number' => 4, 'step_name' => 'Quality Control', 'description' => 'Quality inspection and testing', 'estimated_duration' => 30],
                ['step_number' => 5, 'step_name' => 'Packaging', 'description' => 'Package finished products', 'estimated_duration' => 45],
                ['step_number' => 6, 'step_name' => 'Final Inspection', 'description' => 'Final quality check and documentation', 'estimated_duration' => 15]
            ];
            
            foreach ($default_steps as $step) {
                $step_sql = "INSERT INTO production_steps (
                    production_id, step_number, step_name, description, 
                    estimated_duration_minutes, status, created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, 'pending', NOW(), NOW())";
                
                $step_stmt = mysqli_prepare($conn, $step_sql);
                mysqli_stmt_bind_param($step_stmt, 'iissi', 
                    $production_id, $step['step_number'], $step['step_name'], 
                    $step['description'], $step['estimated_duration']
                );
                
                if (!mysqli_stmt_execute($step_stmt)) {
                    throw new Exception('Failed to create production step: ' . mysqli_stmt_error($step_stmt));
                }
                mysqli_stmt_close($step_stmt);
            }
        }
    }
    
    mysqli_commit($conn); // Commit transaction
    
    echo json_encode([
        'success' => true,
        'message' => 'Production status updated successfully',
        'new_status' => $new_status,
        'new_progress' => $new_progress,
        'previous_status' => $current_status
    ]);
    
} catch (Exception $e) {
    mysqli_rollback($conn); // Rollback on error
    echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
    error_log("Update production status error: " . $e->getMessage());
}

mysqli_close($conn);
?>
