<?php
// --- Output buffering and error suppression for clean JSON responses ---
ob_start();
error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('display_startup_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/php-error.log');

require_once 'db_connection.php';
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Invalid request method']);
    exit;
}

// Check database connection
if (!$conn) {
    echo json_encode([
        'success' => false,
        'message' => 'Database connection failed: ' . mysqli_connect_error()
    ]);
    exit;
}

try {
    // Start transaction
    mysqli_begin_transaction($conn);
    
    // Handle product photo upload
    $product_photo_path = null;
    if (isset($_FILES['product_photo']) && $_FILES['product_photo']['error'] === UPLOAD_ERR_OK) {
        $upload_dir = 'uploads/products/';
        
        // Create upload directory if it doesn't exist
        if (!is_dir($upload_dir)) {
            mkdir($upload_dir, 0777, true);
        }
        
        $tmp_name = $_FILES['product_photo']['tmp_name'];
        $original_name = $_FILES['product_photo']['name'];
        $file_extension = strtolower(pathinfo($original_name, PATHINFO_EXTENSION));
        
        // Validate file type
        $allowed_extensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
        if (!in_array($file_extension, $allowed_extensions)) {
            throw new Exception('Invalid file type. Only JPG, PNG, GIF, and WebP files are allowed.');
        }
        
        // Validate file size (max 5MB)
        if ($_FILES['product_photo']['size'] > 5 * 1024 * 1024) {
            throw new Exception('File size too large. Maximum size is 5MB.');
        }
        
        // Generate unique filename
        $photo_filename = 'product_' . time() . '_' . rand(1000, 9999) . '.' . $file_extension;
        $product_photo_path = $upload_dir . $photo_filename;
        
        // Move uploaded file
        if (!move_uploaded_file($tmp_name, $product_photo_path)) {
            throw new Exception('Failed to upload product photo.');
        }
    }
    
    // Get and validate required fields
    $production_type = $_POST['production_type'] ?? '';
    $product_name = trim($_POST['product_name'] ?? '');
    $batch_size = intval($_POST['batch_size'] ?? 0);
    
    // Get product_id from POST for new product type
    $product_id = isset($_POST['product_id']) && $_POST['product_id'] !== '' ? $_POST['product_id'] : null;
    
    // Enhanced validation with better error messages
    if (empty($production_type)) {
        throw new Exception('Production type is required. Please select either "New Product" or "Another Batch".');
    }
    
    if (empty($product_name)) {
        throw new Exception('Product name is required. Please enter a valid product name.');
    }
    
    if ($batch_size <= 0) {
        throw new Exception('Batch size must be greater than 0. Please enter a valid quantity.');
    }
    
    // Get other fields with defaults
    $category = $_POST['category'] ?? 'Unknown';
    $priority = $_POST['priority'] ?? 'normal';
    $start_date = $_POST['start_date'] ?? date('Y-m-d');
    $start_time = $_POST['start_time'] ?? '08:00';
    $estimated_duration = intval($_POST['estimated_duration'] ?? 8);
    $assigned_to = $_POST['assigned_to'] ?? 'Admin User';
    $notes = $_POST['notes'] ?? '';
    
    // Target fields that exist in your schema
    $price = floatval($_POST['price'] ?? 0);
    $target_expiration_days = intval($_POST['target_expiration_days'] ?? 30);
    $auto_create_product = $_POST['auto_create_product'] ?? 'yes';
    
    // Cost fields
    $total_material_cost = floatval($_POST['total_material_cost'] ?? 0);
    $total_operational_cost = floatval($_POST['total_operational_cost'] ?? 0);
    $total_production_cost = floatval($_POST['total_production_cost'] ?? 0);
    
    // Generate production ID
    $production_id = 'PROD' . date('Ymd') . '-' . str_pad(rand(1, 9999), 4, '0', STR_PAD_LEFT);
    
    // Calculate estimated completion
    $start_datetime = $start_date . ' ' . $start_time;
    $estimated_completion = date('Y-m-d H:i:s', strtotime($start_datetime . ' +' . $estimated_duration . ' hours'));
    
    // Calculate cost per unit
    $cost_per_unit = $batch_size > 0 ? $total_production_cost / $batch_size : 0;
    
    // Handle different production types
    if ($production_type === 'new-product') {
        // Handle new product production
        $recipe_data = $_POST['recipe'] ?? '';
        $status = 'pending';
        $progress = 0.00;
        $quality_status = 'pending';
        $created_by = 1; // Default admin user ID
        
        // Insert production record for new product (now including product_photo)
        $sql = "INSERT INTO productions (
            production_id, product_id, product_name, category, batch_size, 
            priority, status, progress, start_date, estimated_completion, 
            estimated_duration_hours, production_type, recipe_data, 
            auto_create_product, price, target_expiration_days, notes, 
            quality_status, assigned_to, created_by, product_photo, 
            total_material_cost, total_operational_cost, total_production_cost, cost_per_unit,
            created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())";
        
        $stmt = mysqli_prepare($conn, $sql);
        if (!$stmt) {
            throw new Exception('Failed to prepare statement: ' . mysqli_error($conn));
        }
        
        $auto_create_product_int = ($auto_create_product === 'yes' || $auto_create_product === 1 || $auto_create_product === '1') ? 1 : 0;
        
        mysqli_stmt_bind_param($stmt, 'sssssissssisssdisssisdddd', 
            $production_id, $product_id, $product_name, $category, $batch_size, 
            $priority, $status, $progress, $start_date, $estimated_completion, 
            $estimated_duration, $production_type, $recipe_data, $auto_create_product_int, 
            $price, $target_expiration_days, $notes, $quality_status, $assigned_to, $created_by, $product_photo_path,
            $total_material_cost, $total_operational_cost, $total_production_cost, $cost_per_unit
        );
        
        if (!mysqli_stmt_execute($stmt)) {
            throw new Exception('Failed to create production: ' . mysqli_stmt_error($stmt));
        }
        $production_db_id = mysqli_insert_id($conn);
        mysqli_stmt_close($stmt);
        
        // Save recipe for new product
        $recipe_id = null;
        if (!empty($recipe_data)) {
            $recipe = json_decode($recipe_data, true);
            if ($recipe && is_array($recipe)) {
                // Create recipe record
                $recipe_name = $product_name . " Recipe";
                $recipe_description = "Standard recipe for " . $product_name;
                
                $recipe_sql = "INSERT INTO recipes (product_id, recipe_name, recipe_description, total_cost) VALUES (?, ?, ?, ?)";
                $recipe_stmt = mysqli_prepare($conn, $recipe_sql);
                if ($recipe_stmt) {
                    mysqli_stmt_bind_param($recipe_stmt, 'issd', $production_db_id, $recipe_name, $recipe_description, $total_material_cost);
                    if (mysqli_stmt_execute($recipe_stmt)) {
                        $recipe_id = mysqli_insert_id($conn);
                        mysqli_stmt_close($recipe_stmt);
                        
                        // Save recipe materials
                        foreach ($recipe as $material) {
                            $material_id = intval($material['materialId'] ?? 0);
                            $quantity = floatval($material['quantity'] ?? 0);
                            $unit = $material['unit'] ?? 'units';
                            $unit_cost = floatval($material['unitCost'] ?? 0);
                            $total_cost = floatval($material['totalCost'] ?? 0);
                            $notes = $material['notes'] ?? '';
                            
                            if ($material_id > 0 && $quantity > 0) {
                                $recipe_material_sql = "INSERT INTO recipe_materials (recipe_id, material_id, quantity, unit, unit_cost, total_cost, notes) VALUES (?, ?, ?, ?, ?, ?, ?)";
                                $recipe_material_stmt = mysqli_prepare($conn, $recipe_material_sql);
                                if ($recipe_material_stmt) {
                                    mysqli_stmt_bind_param($recipe_material_stmt, 'iidsdds', $recipe_id, $material_id, $quantity, $unit, $unit_cost, $total_cost, $notes);
                                    mysqli_stmt_execute($recipe_material_stmt);
                                    mysqli_stmt_close($recipe_material_stmt);
                                }
                            }
                        }
                        
                        // Update production with recipe_id
                        $update_production_sql = "UPDATE productions SET recipe_id = ? WHERE id = ?";
                        $update_production_stmt = mysqli_prepare($conn, $update_production_sql);
                        if ($update_production_stmt) {
                            mysqli_stmt_bind_param($update_production_stmt, 'ii', $recipe_id, $production_db_id);
                            mysqli_stmt_execute($update_production_stmt);
                            mysqli_stmt_close($update_production_stmt);
                        }
                    }
                }
            }
        }
        
        // Add materials to production if recipe data exists
        if (!empty($recipe_data)) {
            $recipe = json_decode($recipe_data, true);
            if ($recipe && is_array($recipe)) {
                foreach ($recipe as $material) {
                    $material_id = intval($material['materialId'] ?? $material['material_id'] ?? 0);
                    $quantity = floatval($material['quantity'] ?? 0);
                    
                    if ($material_id > 0 && $quantity > 0) {
                        // Check if production_materials table exists, if not, we'll skip this part
                        $table_check = mysqli_query($conn, "SHOW TABLES LIKE 'production_materials'");
                        if (mysqli_num_rows($table_check) > 0) {
                            // Get material details
                            $material_sql = "SELECT name, measurement_type, cost FROM raw_materials WHERE id = ?";
                            $material_stmt = mysqli_prepare($conn, $material_sql);
                            if ($material_stmt) {
                                mysqli_stmt_bind_param($material_stmt, 'i', $material_id);
                                mysqli_stmt_execute($material_stmt);
                                $material_result = mysqli_stmt_get_result($material_stmt);
                                $material_data = mysqli_fetch_assoc($material_result);
                                mysqli_stmt_close($material_stmt);
                                
                                if ($material_data) {
                                    $required_unit = $material_data['measurement_type'];
                                    $estimated_cost = $quantity * floatval($material_data['cost'] ?? 0);
                                    
                                    // Insert production material
                                    $pm_sql = "INSERT INTO production_materials (
                                        production_id, material_id, required_quantity, required_unit, 
                                        estimated_cost, status, created_at, updated_at
                                    ) VALUES (?, ?, ?, ?, ?, 'pending', NOW(), NOW())";
                                    
                                    $pm_stmt = mysqli_prepare($conn, $pm_sql);
                                    if ($pm_stmt) {
                                        mysqli_stmt_bind_param($pm_stmt, 'iidsd', 
                                            $production_db_id, $material_id, $quantity, $required_unit, $estimated_cost
                                        );
                                        
                                        if (!mysqli_stmt_execute($pm_stmt)) {
                                            // Log error but don't fail the entire production
                                            error_log('Failed to add material to production: ' . mysqli_stmt_error($pm_stmt));
                                        }
                                        mysqli_stmt_close($pm_stmt);

                                        // Deduct used quantity from raw_materials
                                        $update_sql = "UPDATE raw_materials SET quantity = quantity - ? WHERE id = ?";
                                        $update_stmt = mysqli_prepare($conn, $update_sql);
                                        if ($update_stmt) {
                                            mysqli_stmt_bind_param($update_stmt, 'di', $quantity, $material_id);
                                            if (!mysqli_stmt_execute($update_stmt)) {
                                                error_log('Failed to update raw material quantity: ' . mysqli_stmt_error($update_stmt));
                                            }
                                            mysqli_stmt_close($update_stmt);
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        
    } else if ($production_type === 'existing-batch') {
        // Handle existing product batch
        $product_id = $_POST['product_id'] ?? '';
        $status = 'pending';
        $progress = 0.00;
        $quality_status = 'pending';
        $created_by = 1; // Default admin user ID
        $recipe_data = $_POST['recipe'] ?? '';
        
        // Insert production record for existing product (now including product_photo)
        $sql = "INSERT INTO productions (
            production_id, product_id, product_name, category, batch_size, 
            priority, status, progress, start_date, estimated_completion, 
            estimated_duration_hours, production_type, recipe_data, auto_create_product, 
            price, target_expiration_days, notes, quality_status, assigned_to, created_by, 
            product_photo, total_material_cost, total_operational_cost, total_production_cost, cost_per_unit,
            created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())";
        
        $stmt = mysqli_prepare($conn, $sql);
        if (!$stmt) {
            throw new Exception('Failed to prepare statement: ' . mysqli_error($conn));
        }
        
        $auto_create_product_int = ($auto_create_product === 'yes' || $auto_create_product === 1 || $auto_create_product === '1') ? 1 : 0;
        
        mysqli_stmt_bind_param($stmt, 'ssssissssisssdisssissdddd',
            $production_id, $product_id, $product_name, $category, $batch_size, 
            $priority, $status, $progress, $start_date, $estimated_completion, 
            $estimated_duration, $production_type, $recipe_data, $auto_create_product_int, 
            $price, $target_expiration_days, $notes, $quality_status, $assigned_to, $created_by, $product_photo_path,
            $total_material_cost, $total_operational_cost, $total_production_cost, $cost_per_unit
        );
        
        if (!mysqli_stmt_execute($stmt)) {
            throw new Exception('Failed to create production: ' . mysqli_stmt_error($stmt));
        }
        $production_db_id = mysqli_insert_id($conn);
        mysqli_stmt_close($stmt);
        
        // Add materials to production if recipe data exists
        if (!empty($recipe_data)) {
            $recipe = json_decode($recipe_data, true);
            if ($recipe && is_array($recipe)) {
                foreach ($recipe as $material) {
                    $material_id = intval($material['materialId'] ?? $material['material_id'] ?? 0);
                    $quantity = floatval($material['quantity'] ?? 0);
                    if ($material_id > 0 && $quantity > 0) {
                        // Check if production_materials table exists
                        $table_check = mysqli_query($conn, "SHOW TABLES LIKE 'production_materials'");
                        if (mysqli_num_rows($table_check) > 0) {
                            // Get material details
                            $material_sql = "SELECT name, measurement_type, cost FROM raw_materials WHERE id = ?";
                            $material_stmt = mysqli_prepare($conn, $material_sql);
                            if ($material_stmt) {
                                mysqli_stmt_bind_param($material_stmt, 'i', $material_id);
                                mysqli_stmt_execute($material_stmt);
                                $material_result = mysqli_stmt_get_result($material_stmt);
                                $material_data = mysqli_fetch_assoc($material_result);
                                mysqli_stmt_close($material_stmt);
                                if ($material_data) {
                                    $required_unit = $material_data['measurement_type'];
                                    $estimated_cost = $quantity * floatval($material_data['cost'] ?? 0);
                                    // Insert production material
                                    $pm_sql = "INSERT INTO production_materials (
                                        production_id, material_id, required_quantity, required_unit, 
                                        estimated_cost, status, created_at, updated_at
                                    ) VALUES (?, ?, ?, ?, ?, 'pending', NOW(), NOW())";
                                    $pm_stmt = mysqli_prepare($conn, $pm_sql);
                                    if ($pm_stmt) {
                                        mysqli_stmt_bind_param($pm_stmt, 'iidsd', 
                                            $production_db_id, $material_id, $quantity, $required_unit, $estimated_cost
                                        );
                                        if (!mysqli_stmt_execute($pm_stmt)) {
                                            error_log('Failed to add material to production: ' . mysqli_stmt_error($pm_stmt));
                                        }
                                        mysqli_stmt_close($pm_stmt);

                                        // Deduct used quantity from raw_materials
                                        $update_sql = "UPDATE raw_materials SET quantity = quantity - ? WHERE id = ?";
                                        $update_stmt = mysqli_prepare($conn, $update_sql);
                                        if ($update_stmt) {
                                            mysqli_stmt_bind_param($update_stmt, 'di', $quantity, $material_id);
                                            if (!mysqli_stmt_execute($update_stmt)) {
                                                error_log('Failed to update raw material quantity: ' . mysqli_stmt_error($update_stmt));
                                            }
                                            mysqli_stmt_close($update_stmt);
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    } else {
        throw new Exception('Invalid production type: ' . $production_type);
    }
    
    // Create default production steps (only if production_steps table exists)
    $table_check = mysqli_query($conn, "SHOW TABLES LIKE 'production_steps'");
    if (mysqli_num_rows($table_check) > 0) {
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
            if ($step_stmt) {
                mysqli_stmt_bind_param($step_stmt, 'iissi', 
                    $production_db_id, $step['step_number'], $step['step_name'], 
                    $step['description'], $step['estimated_duration']
                );
                
                if (!mysqli_stmt_execute($step_stmt)) {
                    // Log error but don't fail the entire production
                    error_log('Failed to create production step: ' . mysqli_stmt_error($step_stmt));
                }
                mysqli_stmt_close($step_stmt);
            }
        }
    }
    
    // Commit transaction
    mysqli_commit($conn);
    
    echo json_encode([
        'success' => true, 
        'message' => 'Production started successfully',
        'production_id' => $production_id,
        'production_db_id' => $production_db_id,
        'product_id' => $production_db_id,
        'recipe_id' => $recipe_id ?? null,
        'product_photo' => $product_photo_path,
        'debug_info' => [
            'production_type' => $production_type,
            'product_name' => $product_name,
            'batch_size' => $batch_size,
            'total_cost' => $total_production_cost,
            'recipe_saved' => isset($recipe_id) && $recipe_id ? true : false,
            'photo_uploaded' => $product_photo_path ? true : false
        ]
    ]);
    
} catch (Exception $e) {
    // Rollback transaction on error
    mysqli_rollback($conn);
    
    // Clean up uploaded file if there was an error
    if (isset($product_photo_path) && $product_photo_path && file_exists($product_photo_path)) {
        unlink($product_photo_path);
    }
    
    // Enhanced error logging
    error_log("Production start error: " . $e->getMessage());
    
    echo json_encode([
        'success' => false, 
        'message' => $e->getMessage(),
        'debug_info' => [
            'error_type' => get_class($e),
            'mysql_error' => mysqli_error($conn),
            'connection_status' => $conn ? 'Connected' : 'Not Connected'
        ]
    ]);
}

if ($conn) {
    mysqli_close($conn);
}
?>
