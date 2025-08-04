<?php
require_once 'db_connection.php';
header('Content-Type: application/json');

$production_id = intval($_GET['id'] ?? 0);

if (!$production_id) {
    echo json_encode(['success' => false, 'message' => 'Production ID is required']);
    exit;
}

try {
    // Get production details with output information
    $sql = "SELECT p.*, 
                   po.quantity_produced, po.quantity_passed_qc, po.quantity_failed_qc,
                   po.quality_score, po.material_cost, po.labor_cost, po.overhead_cost,
                   po.total_cost, po.cost_per_unit, po.output_batch_code,
                   po.created_product_id, po.created_batch_id,
                   prod.product_name as created_product_name,
                   pb.batch_code as created_batch_code
            FROM productions p
            LEFT JOIN production_output po ON p.id = po.production_id
            LEFT JOIN products prod ON po.created_product_id = prod.id
            LEFT JOIN product_batches pb ON po.created_batch_id = pb.batch_id
            WHERE p.id = ?";
    
    $stmt = mysqli_prepare($conn, $sql);
    mysqli_stmt_bind_param($stmt, 'i', $production_id);
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);
    $production = mysqli_fetch_assoc($result);
    mysqli_stmt_close($stmt);
    
    if (!$production) {
        echo json_encode(['success' => false, 'message' => 'Production not found']);
        exit;
    }
    
    // Get production materials
    $materials_sql = "SELECT pm.*, rm.name as material_name, rm.category as material_category,
                             rm.measurement_type, rm.unit_measurement
                      FROM production_materials pm
                      JOIN raw_materials rm ON pm.material_id = rm.id
                      WHERE pm.production_id = ?
                      ORDER BY rm.name";
    
    $materials_stmt = mysqli_prepare($conn, $materials_sql);
    mysqli_stmt_bind_param($materials_stmt, 'i', $production_id);
    mysqli_stmt_execute($materials_stmt);
    $materials_result = mysqli_stmt_get_result($materials_stmt);
    
    $materials = [];
    while ($material = mysqli_fetch_assoc($materials_result)) {
        $materials[] = $material;
    }
    mysqli_stmt_close($materials_stmt);
    
    // Get production steps
    $steps_sql = "SELECT * FROM production_steps 
                  WHERE production_id = ? 
                  ORDER BY step_number";
    
    $steps_stmt = mysqli_prepare($conn, $steps_sql);
    mysqli_stmt_bind_param($steps_stmt, 'i', $production_id);
    mysqli_stmt_execute($steps_stmt);
    $steps_result = mysqli_stmt_get_result($steps_stmt);
    
    $steps = [];
    while ($step = mysqli_fetch_assoc($steps_result)) {
        $steps[] = $step;
    }
    mysqli_stmt_close($steps_stmt);
    
    // Get material usage log
    $usage_sql = "SELECT pmu.*, rm.name as material_name
                  FROM production_material_usage pmu
                  JOIN raw_materials rm ON pmu.material_id = rm.id
                  WHERE pmu.production_id = ?
                  ORDER BY pmu.usage_date DESC";
    
    $usage_stmt = mysqli_prepare($conn, $usage_sql);
    mysqli_stmt_bind_param($usage_stmt, 'i', $production_id);
    mysqli_stmt_execute($usage_stmt);
    $usage_result = mysqli_stmt_get_result($usage_stmt);
    
    $material_usage = [];
    while ($usage = mysqli_fetch_assoc($usage_result)) {
        $material_usage[] = $usage;
    }
    mysqli_stmt_close($usage_stmt);
    
    $response = [
        'success' => true,
        'production' => $production,
        'materials' => $materials,
        'steps' => $steps,
        'material_usage' => $material_usage
    ];
    
    echo json_encode($response);
    
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
    error_log("Get production details error: " . $e->getMessage());
}

mysqli_close($conn);
?>
