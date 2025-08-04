<?php
// Get Production History with Output Data
error_reporting(E_ALL);
ini_set('display_errors', 1);

require_once 'db_connection.php';
header('Content-Type: application/json');

if (!$conn) {
    echo json_encode([
        'success' => false,
        'message' => 'Database connection failed: ' . mysqli_connect_error(),
        'history' => []
    ]);
    exit;
}

try {
    // Get completed productions with output data
    $query = "SELECT 
                p.id,
                p.production_id,
                p.product_id,
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
                p.quality_status,
                p.notes,
                p.created_at,
                p.updated_at,
                po.quantity_produced,
                po.quantity_passed_qc,
                po.quantity_failed_qc,
                po.quality_score,
                po.quality_grade,
                po.defect_rate,
                po.yield_percentage,
                po.output_batch_code,
                po.material_cost,
                po.labor_cost,
                po.overhead_cost,
                po.total_cost,
                po.cost_per_unit,
                po.expiration_date,
                po.shelf_life_days,
                po.manufacturing_date as output_manufacturing_date
              FROM productions p
              LEFT JOIN production_output po ON p.id = po.production_id
              WHERE p.status IN ('completed', 'cancelled')
              ORDER BY p.actual_completion DESC, p.updated_at DESC";
    
    $result = mysqli_query($conn, $query);
    
    if (!$result) {
        throw new Exception("Query failed: " . mysqli_error($conn));
    }
    
    $history = [];
    while ($row = mysqli_fetch_assoc($result)) {
        // Format the production history data
        $production = [
            'id' => intval($row['id']),
            'production_id' => $row['production_id'],
            'product_id' => $row['product_id'],
            'product_name' => $row['product_name'],
            'category' => $row['category'],
            'batch_size' => intval($row['batch_size']),
            'priority' => $row['priority'] ?: 'normal',
            'status' => $row['status'],
            'progress' => floatval($row['progress']),
            'start_date' => $row['start_date'],
            'estimated_completion' => $row['estimated_completion'],
            'actual_completion' => $row['actual_completion'],
            'production_type' => $row['production_type'],
            'quality_status' => $row['quality_status'],
            'notes' => $row['notes'],
            'created_at' => $row['created_at'],
            'updated_at' => $row['updated_at'],
            
            // Production output data
            'output' => null
        ];
        
        // Add output data if available
        if ($row['quantity_produced']) {
            $production['output'] = [
                'quantity_produced' => intval($row['quantity_produced']),
                'quantity_passed_qc' => intval($row['quantity_passed_qc']),
                'quantity_failed_qc' => intval($row['quantity_failed_qc']),
                'quality_score' => floatval($row['quality_score']),
                'quality_grade' => $row['quality_grade'],
                'defect_rate' => floatval($row['defect_rate']),
                'yield_percentage' => floatval($row['yield_percentage']),
                'output_batch_code' => $row['output_batch_code'],
                'material_cost' => floatval($row['material_cost']),
                'labor_cost' => floatval($row['labor_cost']),
                'overhead_cost' => floatval($row['overhead_cost']),
                'total_cost' => floatval($row['total_cost']),
                'cost_per_unit' => floatval($row['cost_per_unit']),
                'expiration_date' => $row['expiration_date'],
                'shelf_life_days' => intval($row['shelf_life_days']),
                'manufacturing_date' => $row['output_manufacturing_date']
            ];
        }
        
        $history[] = $production;
    }
    
    echo json_encode([
        'success' => true,
        'message' => 'Production history loaded successfully',
        'history' => $history,
        'count' => count($history)
    ]);
    
} catch (Exception $e) {
    error_log("Error fetching production history: " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => 'Error fetching production history: ' . $e->getMessage(),
        'history' => []
    ]);
}

mysqli_close($conn);
?>
