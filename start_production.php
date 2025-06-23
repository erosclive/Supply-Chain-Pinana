<?php
require_once 'db_connection.php';
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Invalid request method']);
    exit;
}

try {
    mysqli_autocommit($conn, false); // Start transaction
    
    $production_type = $_POST['production_type'] ?? '';
    $product_name = $_POST['product_name'] ?? '';
    $category = $_POST['category'] ?? '';
    $batch_size = intval($_POST['batch_size'] ?? 0);
    $priority = $_POST['priority'] ?? 'normal';
    $start_date = $_POST['start_date'] ?? date('Y-m-d');
    $estimated_duration = intval($_POST['estimated_duration'] ?? 8);
    
    // Validate required fields
    if (empty($production_type) || empty($product_name) || $batch_size <= 0) {
        throw new Exception('Missing required fields: production_type, product_name, and batch_size are required');
    }
    
    // Generate production ID
    $production_id = 'PROD' . date('Ymd') . '-' . str_pad(rand(1, 9999), 4, '0', STR_PAD_LEFT);
    
    // Calculate estimated completion
    $estimated_completion = date('Y-m-d H:i:s', strtotime($start_date . ' +' . $estimated_duration . ' hours'));
    
    if ($production_type === 'new-product') {
        // Handle new product production
        $recipe_data = $_POST['recipe'] ?? '';
        $recipe = json_decode($recipe_data, true);
        
        if (!$recipe || empty($recipe)) {
            throw new Exception('Recipe data is required for new products');
        }
        
        // Insert production record
        $sql = "INSERT INTO productions (
            production_id, product_id, product_name, category, batch_size, 
            priority, status, start_date, estimated_completion, 
            estimated_duration_hours, production_type, recipe_data, 
            assigned_to, created_at, updated_at
        ) VALUES (?, NULL, ?, ?, ?, ?, 'pending', ?, ?, ?, ?, ?, 'Admin User', NOW(), NOW())";
        
        $stmt = mysqli_prepare($conn, $sql);
        mysqli_stmt_bind_param($stmt, 'sssisssiss', 
            $production_id, $product_name, $category, $batch_size, 
            $priority, $start_date, $estimated_completion, 
            $estimated_duration, $production_type, $recipe_data
        );
        
        if (!mysqli_stmt_execute($stmt)) {
            throw new Exception('Failed to create production: ' . mysqli_stmt_error($stmt));
        }
        
        $production_db_id = mysqli_insert_id($conn);
        mysqli_stmt_close($stmt);
        
        // Add materials to production
        foreach ($recipe as $material) {
            $material_id = intval($material['material_id']);
            $quantity = floatval($material['quantity']);
            
            // Get material details
            $material_sql = "SELECT name, measurement_type, cost FROM raw_materials WHERE id = ?";
            $material_stmt = mysqli_prepare($conn, $material_sql);
            mysqli_stmt_bind_param($material_stmt, 'i', $material_id);
            mysqli_stmt_execute($material_stmt);
            $material_result = mysqli_stmt_get_result($material_stmt);
            $material_data = mysqli_fetch_assoc($material_result);
            mysqli_stmt_close($material_stmt);
            
            if (!$material_data) {
                throw new Exception('Material not found: ' . $material_id);
            }
            
            $required_unit = $material_data['measurement_type'];
            $estimated_cost = $quantity * floatval($material_data['cost']);
            
            // Insert production material
            $pm_sql = "INSERT INTO production_materials (
                production_id, material_id, required_quantity, required_unit, 
                estimated_cost, status, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, 'pending', NOW(), NOW())";
            
            $pm_stmt = mysqli_prepare($conn, $pm_sql);
            mysqli_stmt_bind_param($pm_stmt, 'iidsd', 
                $production_db_id, $material_id, $quantity, $required_unit, $estimated_cost
            );
            
            if (!mysqli_stmt_execute($pm_stmt)) {
                throw new Exception('Failed to add material to production: ' . mysqli_stmt_error($pm_stmt));
            }
            mysqli_stmt_close($pm_stmt);
        }
        
    } else if ($production_type === 'existing-batch') {
        // Handle existing product batch
        $product_id = intval($_POST['product_id'] ?? 0);
        
        if (!$product_id) {
            throw new Exception('Product ID is required for existing batch production');
        }
        
        // Insert production record
        $sql = "INSERT INTO productions (
            production_id, product_id, product_name, category, batch_size, 
            priority, status, start_date, estimated_completion, 
            estimated_duration_hours, production_type, assigned_to,
            created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, 'pending', ?, ?, ?, ?, 'Admin User', NOW(), NOW())";
        
        $stmt = mysqli_prepare($conn, $sql);
        mysqli_stmt_bind_param($stmt, 'sissssssss', 
            $production_id, $product_id, $product_name, $category, $batch_size, 
            $priority, $start_date, $estimated_completion, 
            $estimated_duration, $production_type
        );
        
        if (!mysqli_stmt_execute($stmt)) {
            throw new Exception('Failed to create production: ' . mysqli_stmt_error($stmt));
        }
        
        $production_db_id = mysqli_insert_id($conn);
        mysqli_stmt_close($stmt);
    }
    
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
            $production_db_id, $step['step_number'], $step['step_name'], 
            $step['description'], $step['estimated_duration']
        );
        
        if (!mysqli_stmt_execute($step_stmt)) {
            throw new Exception('Failed to create production step: ' . mysqli_stmt_error($step_stmt));
        }
        mysqli_stmt_close($step_stmt);
    }
    
    mysqli_commit($conn); // Commit transaction
    
    echo json_encode([
        'success' => true, 
        'message' => 'Production started successfully',
        'production_id' => $production_id,
        'production_db_id' => $production_db_id
    ]);
    
} catch (Exception $e) {
    mysqli_rollback($conn); // Rollback on error
    echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
    error_log("Production start error: " . $e->getMessage());
}

mysqli_close($conn);
?>
