<?php
header('Content-Type: application/json');
include 'db_connection.php';

try {
    $production_id = $_GET['production_id'] ?? '';
    
    if (empty($production_id)) {
        echo json_encode(['error' => 'Production ID is required']);
        exit;
    }

    // Get production details first
    $prod_sql = "SELECT * FROM productions WHERE production_id = ?";
    $prod_stmt = $conn->prepare($prod_sql);
    $prod_stmt->bind_param("s", $production_id);
    $prod_stmt->execute();
    $production = $prod_stmt->get_result()->fetch_assoc();
    
    if (!$production) {
        echo json_encode(['error' => 'Production not found']);
        exit;
    }

    // Get production steps with enhanced details
    $steps_sql = "SELECT 
                    ps.*,
                    CASE 
                        WHEN ps.estimated_duration_minutes > 0 AND ps.actual_duration_minutes > 0 THEN
                            ROUND((ps.estimated_duration_minutes / ps.actual_duration_minutes) * 100, 2)
                        ELSE NULL 
                    END as efficiency_percentage,
                    CASE 
                        WHEN ps.started_at IS NOT NULL AND ps.completed_at IS NULL THEN
                            TIMESTAMPDIFF(MINUTE, ps.started_at, NOW())
                        ELSE NULL
                    END as current_duration_minutes,
                    -- Get quality checks for this step
                    (SELECT COUNT(*) FROM production_quality_checks qc WHERE qc.production_step_id = ps.id) as quality_checks_count,
                    (SELECT COUNT(*) FROM production_quality_checks qc WHERE qc.production_step_id = ps.id AND qc.pass_fail = 'pass') as passed_checks,
                    (SELECT COUNT(*) FROM production_quality_checks qc WHERE qc.production_step_id = ps.id AND qc.pass_fail = 'fail') as failed_checks
                FROM production_steps ps
                WHERE ps.production_id = ?
                ORDER BY ps.step_number";
    
    $stmt = $conn->prepare($steps_sql);
    $stmt->bind_param("i", $production['id']);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $steps = [];
    $total_estimated_time = 0;
    $total_actual_time = 0;
    $completed_steps = 0;
    $total_steps = 0;
    
    while ($row = $result->fetch_assoc()) {
        $total_steps++;
        $total_estimated_time += $row['estimated_duration_minutes'];
        
        if ($row['status'] === 'completed') {
            $completed_steps++;
            $total_actual_time += $row['actual_duration_minutes'] ?? $row['estimated_duration_minutes'];
        }
        
        // Add status indicators
        $row['is_pending'] = $row['status'] === 'pending';
        $row['is_in_progress'] = $row['status'] === 'in-progress';
        $row['is_completed'] = $row['status'] === 'completed';
        $row['is_skipped'] = $row['status'] === 'skipped';
        
        // Calculate progress for in-progress steps
        if ($row['is_in_progress'] && $row['current_duration_minutes'] && $row['estimated_duration_minutes']) {
            $row['progress_percentage'] = min(100, ($row['current_duration_minutes'] / $row['estimated_duration_minutes']) * 100);
        } else {
            $row['progress_percentage'] = $row['is_completed'] ? 100 : 0;
        }
        
        // Format times
        $row['estimated_duration_formatted'] = $row['estimated_duration_minutes'] . ' minutes';
        $row['actual_duration_formatted'] = $row['actual_duration_minutes'] ? 
            $row['actual_duration_minutes'] . ' minutes' : null;
        
        // Format dates
        $row['started_at_formatted'] = $row['started_at'] ? 
            date('M d, Y H:i', strtotime($row['started_at'])) : null;
        $row['completed_at_formatted'] = $row['completed_at'] ? 
            date('M d, Y H:i', strtotime($row['completed_at'])) : null;
        
        // Quality check summary
        $row['has_quality_checks'] = $row['quality_checks_count'] > 0;
        $row['quality_pass_rate'] = $row['quality_checks_count'] > 0 ? 
            ($row['passed_checks'] / $row['quality_checks_count']) * 100 : null;
        
        // Get detailed quality checks for this step
        $qc_sql = "SELECT * FROM production_quality_checks 
                   WHERE production_step_id = ? 
                   ORDER BY checked_at DESC";
        
        $qc_stmt = $conn->prepare($qc_sql);
        $qc_stmt->bind_param("i", $row['id']);
        $qc_stmt->execute();
        $qc_result = $qc_stmt->get_result();
        
        $quality_checks = [];
        while ($qc_row = $qc_result->fetch_assoc()) {
            $qc_row['checked_at_formatted'] = date('M d, H:i', strtotime($qc_row['checked_at']));
            $quality_checks[] = $qc_row;
        }
        $row['quality_checks'] = $quality_checks;
        
        $steps[] = $row;
    }
    
    // Calculate overall progress and efficiency
    $overall_progress = $total_steps > 0 ? ($completed_steps / $total_steps) * 100 : 0;
    $time_efficiency = ($total_estimated_time > 0 && $total_actual_time > 0) ? 
        ($total_estimated_time / $total_actual_time) * 100 : null;
    
    // Find current step
    $current_step = null;
    $next_step = null;
    
    foreach ($steps as $index => $step) {
        if ($step['is_in_progress']) {
            $current_step = $step;
            $next_step = isset($steps[$index + 1]) ? $steps[$index + 1] : null;
            break;
        }
    }
    
    // If no step is in progress, find the next pending step
    if (!$current_step) {
        foreach ($steps as $step) {
            if ($step['is_pending']) {
                $next_step = $step;
                break;
            }
        }
    }
    
    // Get step timeline for visualization
    $timeline = [];
    foreach ($steps as $step) {
        $timeline[] = [
            'step_number' => $step['step_number'],
            'step_name' => $step['step_name'],
            'status' => $step['status'],
            'started_at' => $step['started_at'],
            'completed_at' => $step['completed_at'],
            'duration' => $step['actual_duration_minutes'] ?? $step['estimated_duration_minutes'],
            'efficiency' => $step['efficiency_percentage']
        ];
    }
    
    echo json_encode([
        'success' => true,
        'production' => [
            'id' => $production['id'],
            'production_id' => $production['production_id'],
            'product_name' => $production['product_name'],
            'status' => $production['status'],
            'progress' => $production['progress']
        ],
        'steps' => $steps,
        'summary' => [
            'total_steps' => $total_steps,
            'completed_steps' => $completed_steps,
            'pending_steps' => array_sum(array_map(function($s) { return $s['is_pending'] ? 1 : 0; }, $steps)),
            'in_progress_steps' => array_sum(array_map(function($s) { return $s['is_in_progress'] ? 1 : 0; }, $steps)),
            'skipped_steps' => array_sum(array_map(function($s) { return $s['is_skipped'] ? 1 : 0; }, $steps)),
            'overall_progress' => round($overall_progress, 1),
            'total_estimated_time' => $total_estimated_time,
            'total_actual_time' => $total_actual_time,
            'time_efficiency' => $time_efficiency ? round($time_efficiency, 1) : null
        ],
        'current_step' => $current_step,
        'next_step' => $next_step,
        'timeline' => $timeline
    ]);
    
} catch (Exception $e) {
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}

$conn->close();
?>
