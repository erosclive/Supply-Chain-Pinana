<?php
header('Content-Type: application/json');
include 'db_connection.php';

try {
    $date_from = $_GET['date_from'] ?? date('Y-m-01'); // First day of current month
    $date_to = $_GET['date_to'] ?? date('Y-m-d'); // Today
    $category_filter = $_GET['category'] ?? '';
    
    // Production Overview Analytics
    $overview_sql = "SELECT 
                        COUNT(*) as total_productions,
                        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_productions,
                        COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_productions,
                        COUNT(CASE WHEN status IN ('pending', 'in-progress', 'quality-check') THEN 1 END) as ongoing_productions,
                        AVG(CASE WHEN status = 'completed' AND estimated_duration_hours > 0 THEN estimated_duration_hours END) as avg_estimated_duration,
                        AVG(CASE WHEN status = 'completed' AND actual_duration_hours > 0 THEN actual_duration_hours END) as avg_actual_duration,
                        SUM(CASE WHEN status = 'completed' THEN batch_size ELSE 0 END) as total_units_produced,
                        AVG(progress) as avg_progress
                    FROM productions 
                    WHERE start_date BETWEEN ? AND ?";
    
    $params = [$date_from, $date_to];
    $param_types = 'ss';
    
    if (!empty($category_filter)) {
        $overview_sql .= " AND category = ?";
        $params[] = $category_filter;
        $param_types .= 's';
    }
    
    $stmt = $conn->prepare($overview_sql);
    $stmt->bind_param($param_types, ...$params);
    $stmt->execute();
    $overview = $stmt->get_result()->fetch_assoc();
    
    // Calculate completion rate and efficiency
    $overview['completion_rate'] = $overview['total_productions'] > 0 ? 
        ($overview['completed_productions'] / $overview['total_productions']) * 100 : 0;
    
    $overview['time_efficiency'] = ($overview['avg_estimated_duration'] > 0 && $overview['avg_actual_duration'] > 0) ? 
        ($overview['avg_estimated_duration'] / $overview['avg_actual_duration']) * 100 : 0;
    
    // Production by Category
    $category_sql = "SELECT 
                        category,
                        COUNT(*) as production_count,
                        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_count,
                        SUM(CASE WHEN status = 'completed' THEN batch_size ELSE 0 END) as total_units,
                        AVG(CASE WHEN status = 'completed' THEN progress ELSE NULL END) as avg_completion_rate
                    FROM productions 
                    WHERE start_date BETWEEN ? AND ?
                    GROUP BY category
                    ORDER BY production_count DESC";
    
    $stmt = $conn->prepare($category_sql);
    $stmt->bind_param('ss', $date_from, $date_to);
    $stmt->execute();
    $category_result = $stmt->get_result();
    
    $categories = [];
    while ($row = $category_result->fetch_assoc()) {
        $row['completion_percentage'] = $row['production_count'] > 0 ? 
            ($row['completed_count'] / $row['production_count']) * 100 : 0;
        $categories[] = $row;
    }
    
    // Daily Production Trend (last 30 days)
    $trend_sql = "SELECT 
                    DATE(start_date) as production_date,
                    COUNT(*) as productions_started,
                    COUNT(CASE WHEN status = 'completed' THEN 1 END) as productions_completed,
                    SUM(batch_size) as total_batch_size
                  FROM productions 
                  WHERE start_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
                  GROUP BY DATE(start_date)
                  ORDER BY production_date DESC
                  LIMIT 30";
    
    $trend_result = $conn->query($trend_sql);
    $daily_trends = [];
    while ($row = $trend_result->fetch_assoc()) {
        $daily_trends[] = $row;
    }
    
    // Cost Analysis
    $cost_sql = "SELECT 
                    p.category,
                    COUNT(p.id) as production_count,
                    AVG(pc.total_cost) as avg_material_cost,
                    SUM(pc.total_cost) as total_material_cost,
                    AVG(pc.total_cost / p.batch_size) as avg_cost_per_unit
                FROM productions p
                LEFT JOIN (
                    SELECT 
                        production_id,
                        SUM(total_cost) as total_cost
                    FROM production_costs 
                    WHERE cost_type = 'material'
                    GROUP BY production_id
                ) pc ON p.id = pc.production_id
                WHERE p.start_date BETWEEN ? AND ?
                AND p.status = 'completed'
                GROUP BY p.category
                ORDER BY total_material_cost DESC";
    
    $stmt = $conn->prepare($cost_sql);
    $stmt->bind_param('ss', $date_from, $date_to);
    $stmt->execute();
    $cost_result = $stmt->get_result();
    
    $cost_analysis = [];
    while ($row = $cost_result->fetch_assoc()) {
        $cost_analysis[] = $row;
    }
    
    // Quality Metrics
    $quality_sql = "SELECT 
                        p.category,
                        COUNT(qc.id) as total_checks,
                        COUNT(CASE WHEN qc.pass_fail = 'pass' THEN 1 END) as passed_checks,
                        COUNT(CASE WHEN qc.pass_fail = 'fail' THEN 1 END) as failed_checks,
                        COUNT(CASE WHEN qc.severity = 'critical' AND qc.pass_fail = 'fail' THEN 1 END) as critical_failures
                    FROM productions p
                    LEFT JOIN production_quality_checks qc ON p.id = qc.production_id
                    WHERE p.start_date BETWEEN ? AND ?
                    GROUP BY p.category
                    HAVING total_checks > 0
                    ORDER BY p.category";
    
    $stmt = $conn->prepare($quality_sql);
    $stmt->bind_param('ss', $date_from, $date_to);
    $stmt->execute();
    $quality_result = $stmt->get_result();
    
    $quality_metrics = [];
    while ($row = $quality_result->fetch_assoc()) {
        $row['pass_rate'] = $row['total_checks'] > 0 ? 
            ($row['passed_checks'] / $row['total_checks']) * 100 : 0;
        $row['failure_rate'] = $row['total_checks'] > 0 ? 
            ($row['failed_checks'] / $row['total_checks']) * 100 : 0;
        $quality_metrics[] = $row;
    }
    
    // Top Performing Products
    $top_products_sql = "SELECT 
                            product_name,
                            category,
                            COUNT(*) as production_count,
                            SUM(batch_size) as total_units_produced,
                            AVG(progress) as avg_progress,
                            COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_batches
                        FROM productions 
                        WHERE start_date BETWEEN ? AND ?
                        GROUP BY product_name, category
                        HAVING production_count >= 2
                        ORDER BY completed_batches DESC, total_units_produced DESC
                        LIMIT 10";
    
    $stmt = $conn->prepare($top_products_sql);
    $stmt->bind_param('ss', $date_from, $date_to);
    $stmt->execute();
    $top_products_result = $stmt->get_result();
    
    $top_products = [];
    while ($row = $top_products_result->fetch_assoc()) {
        $row['completion_rate'] = $row['production_count'] > 0 ? 
            ($row['completed_batches'] / $row['production_count']) * 100 : 0;
        $top_products[] = $row;
    }
    
    // Material Usage Analysis
    $material_usage_sql = "SELECT 
                            rm.name as material_name,
                            rm.category as material_category,
                            COUNT(DISTINCT pm.production_id) as used_in_productions,
                            SUM(pm.consumed_quantity) as total_consumed,
                            rm.unit,
                            AVG(pm.consumed_quantity) as avg_consumption_per_batch,
                            SUM(pm.actual_cost) as total_cost
                        FROM production_materials pm
                        JOIN raw_materials rm ON pm.material_id = rm.id
                        JOIN productions p ON pm.production_id = p.id
                        WHERE p.start_date BETWEEN ? AND ?
                        AND pm.status = 'consumed'
                        GROUP BY rm.id, rm.name, rm.category, rm.unit
                        ORDER BY total_consumed DESC
                        LIMIT 15";
    
    $stmt = $conn->prepare($material_usage_sql);
    $stmt->bind_param('ss', $date_from, $date_to);
    $stmt->execute();
    $material_usage_result = $stmt->get_result();
    
    $material_usage = [];
    while ($row = $material_usage_result->fetch_assoc()) {
        $material_usage[] = $row;
    }
    
    // Recent Alerts Summary
    $alerts_sql = "SELECT 
                    alert_type,
                    severity,
                    COUNT(*) as alert_count,
                    COUNT(CASE WHEN is_resolved = 0 THEN 1 END) as unresolved_count
                  FROM production_alerts pa
                  JOIN productions p ON pa.production_id = p.id
                  WHERE p.start_date BETWEEN ? AND ?
                  GROUP BY alert_type, severity
                  ORDER BY 
                    CASE severity 
                        WHEN 'critical' THEN 1 
                        WHEN 'error' THEN 2 
                        WHEN 'warning' THEN 3 
                        ELSE 4 
                    END,
                    alert_count DESC";
    
    $stmt = $conn->prepare($alerts_sql);
    $stmt->bind_param('ss', $date_from, $date_to);
    $stmt->execute();
    $alerts_result = $stmt->get_result();
    
    $alerts_summary = [];
    while ($row = $alerts_result->fetch_assoc()) {
        $alerts_summary[] = $row;
    }
    
    echo json_encode([
        'success' => true,
        'period' => [
            'from' => $date_from,
            'to' => $date_to,
            'days' => (strtotime($date_to) - strtotime($date_from)) / (60 * 60 * 24) + 1
        ],
        'overview' => $overview,
        'categories' => $categories,
        'daily_trends' => array_reverse($daily_trends), // Show oldest first
        'cost_analysis' => $cost_analysis,
        'quality_metrics' => $quality_metrics,
        'top_products' => $top_products,
        'material_usage' => $material_usage,
        'alerts_summary' => $alerts_summary
    ]);
    
} catch (Exception $e) {
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}

$conn->close();
?>
