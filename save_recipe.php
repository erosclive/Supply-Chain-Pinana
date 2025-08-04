<?php
require_once 'db_connection.php';
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Invalid request method']);
    exit;
}

try {
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!$data) {
        echo json_encode(['success' => false, 'message' => 'Invalid JSON data']);
        exit;
    }

    $product_id = intval($data['product_id'] ?? 0);
    $recipe_name = trim($data['recipe_name'] ?? '');
    $recipe_description = trim($data['recipe_description'] ?? '');
    $materials = $data['materials'] ?? [];
    $total_cost = floatval($data['total_cost'] ?? 0);

    // Validate required fields
    if (!$product_id) {
        echo json_encode(['success' => false, 'message' => 'Product ID is required']);
        exit;
    }

    if (empty($recipe_name)) {
        echo json_encode(['success' => false, 'message' => 'Recipe name is required']);
        exit;
    }

    if (empty($materials)) {
        echo json_encode(['success' => false, 'message' => 'At least one material is required']);
        exit;
    }

    // Check if product exists
    $check_product = "SELECT id, name FROM products WHERE id = ?";
    $stmt = mysqli_prepare($conn, $check_product);
    mysqli_stmt_bind_param($stmt, 'i', $product_id);
    mysqli_stmt_execute($stmt);
    $product_result = mysqli_stmt_get_result($stmt);
    
    if (!$product_result || mysqli_num_rows($product_result) === 0) {
        echo json_encode(['success' => false, 'message' => 'Product not found']);
        exit;
    }
    
    $product = mysqli_fetch_assoc($product_result);
    mysqli_stmt_close($stmt);

    // Start transaction
    mysqli_begin_transaction($conn);

    try {
        // Create recipe
        $create_recipe = "INSERT INTO recipes (product_id, recipe_name, recipe_description, total_cost) VALUES (?, ?, ?, ?)";
        $stmt = mysqli_prepare($conn, $create_recipe);
        mysqli_stmt_bind_param($stmt, 'issd', $product_id, $recipe_name, $recipe_description, $total_cost);
        
        if (!mysqli_stmt_execute($stmt)) {
            throw new Exception('Failed to create recipe: ' . mysqli_stmt_error($stmt));
        }
        
        $recipe_id = mysqli_insert_id($conn);
        mysqli_stmt_close($stmt);

        // Save recipe materials
        $save_material = "INSERT INTO recipe_materials (recipe_id, material_id, quantity, unit, unit_cost, total_cost, notes) VALUES (?, ?, ?, ?, ?, ?, ?)";
        $stmt = mysqli_prepare($conn, $save_material);

        foreach ($materials as $material) {
            $material_id = intval($material['material_id']);
            $quantity = floatval($material['quantity']);
            $unit = trim($material['unit']);
            $unit_cost = floatval($material['unit_cost'] ?? 0);
            $total_cost = floatval($material['total_cost'] ?? 0);
            $notes = trim($material['notes'] ?? '');

            mysqli_stmt_bind_param($stmt, 'iidsdds', $recipe_id, $material_id, $quantity, $unit, $unit_cost, $total_cost, $notes);
            
            if (!mysqli_stmt_execute($stmt)) {
                throw new Exception('Failed to save recipe material: ' . mysqli_stmt_error($stmt));
            }
        }
        
        mysqli_stmt_close($stmt);

        // Commit transaction
        mysqli_commit($conn);

        echo json_encode([
            'success' => true,
            'message' => 'Recipe saved successfully',
            'recipe_id' => $recipe_id,
            'product_name' => $product['name']
        ]);

    } catch (Exception $e) {
        // Rollback transaction
        mysqli_rollback($conn);
        echo json_encode(['success' => false, 'message' => 'Error saving recipe: ' . $e->getMessage()]);
    }

} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
}

mysqli_close($conn);
?> 