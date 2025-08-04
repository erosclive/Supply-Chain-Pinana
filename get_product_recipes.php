<?php
require_once 'db_connection.php';
header('Content-Type: application/json');

file_put_contents('debug_log.txt', 'get_product_recipes.php executed at '.date('c')."\n", FILE_APPEND);
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);


// Accept both numeric and string product IDs
$product_id_param = $_GET['product_id'] ?? '';
$is_numeric_id = is_numeric($product_id_param) && (string)(int)$product_id_param === (string)$product_id_param;

try {
    if ($is_numeric_id) {
        $product_id = intval($product_id_param);
        $product_sql = "SELECT id, product_id, product_name, category FROM products WHERE id = ?";
        $stmt = mysqli_prepare($conn, $product_sql);
        mysqli_stmt_bind_param($stmt, 'i', $product_id);
    } else {
        $product_id = $product_id_param;
        $product_sql = "SELECT id, product_id, product_name, category FROM products WHERE product_id = ?";
        $stmt = mysqli_prepare($conn, $product_sql);
        mysqli_stmt_bind_param($stmt, 's', $product_id);
    }

    mysqli_stmt_execute($stmt);
    $product_result = mysqli_stmt_get_result($stmt);
    if (!$product_result || mysqli_num_rows($product_result) === 0) {
        echo json_encode(['success' => false, 'message' => 'Product not found']);
        exit;
    }
    $product = mysqli_fetch_assoc($product_result);
    mysqli_stmt_close($stmt);

    // Get recipes for this product - use the actual product id from the products table
    $actual_product_id = $product['id'];
    $recipes_sql = "SELECT r.*, 
                           COUNT(rm.id) as material_count,
                           SUM(rm.total_cost) as total_material_cost
                    FROM recipes r
                    LEFT JOIN recipe_materials rm ON r.id = rm.recipe_id
                    WHERE r.product_id = ?
                    GROUP BY r.id
                    ORDER BY r.created_at DESC";
    file_put_contents('debug_log.txt', 'About to run SQL: ' . $recipes_sql . "\n", FILE_APPEND);
    $stmt = mysqli_prepare($conn, $recipes_sql);
    if (!$stmt) file_put_contents('debug_log.txt', 'ERROR: ' . mysqli_error($conn) . "\n", FILE_APPEND);
    mysqli_stmt_bind_param($stmt, 'i', $actual_product_id);
    mysqli_stmt_execute($stmt);
    $recipes_result = mysqli_stmt_get_result($stmt);
        
        $recipes = [];
        while ($recipe = mysqli_fetch_assoc($recipes_result)) {
            // Get materials for this recipe
            $materials_sql = "SELECT rm.*, 
                                    r.name as material_name,
                                    r.category as material_category,
                                    r.measurement_type,
                                    r.unit_measurement
                             FROM recipe_materials rm
                             JOIN raw_materials r ON rm.material_id = r.id
                             WHERE rm.recipe_id = ?
                             ORDER BY r.name";
            file_put_contents('debug_log.txt', 'About to run SQL: ' . $materials_sql . "\n", FILE_APPEND);
            $materials_stmt = mysqli_prepare($conn, $materials_sql);
            if (!$materials_stmt) file_put_contents('debug_log.txt', 'ERROR: ' . mysqli_error($conn) . "\n", FILE_APPEND);
            mysqli_stmt_bind_param($materials_stmt, 'i', $recipe['id']);
            mysqli_stmt_execute($materials_stmt);
            $materials_result = mysqli_stmt_get_result($materials_stmt);
            
            $materials = [];
            while ($material = mysqli_fetch_assoc($materials_result)) {
                $materials[] = [
                    'material_id' => $material['material_id'],
                    'material_name' => $material['material_name'],
                    'material_category' => $material['material_category'],
                    'quantity' => $material['quantity'],
                    'unit' => $material['unit'],
                    'unit_cost' => $material['unit_cost'],
                    'total_cost' => $material['total_cost'],
                    'notes' => $material['notes'],
                    'measurement_type' => $material['measurement_type'],
                    'unit_measurement' => $material['unit_measurement']
                ];
            }
            mysqli_stmt_close($materials_stmt);
            
            $recipe['materials'] = $materials;
            $recipes[] = $recipe;
        }
        mysqli_stmt_close($stmt);

    // --- NEW: Get all unique material IDs from recipe_materials and production_materials for this product ---
    $all_material_ids = [];
    $material_latest_recipe_qty = [];

    // 1. Get all material_ids from all recipes for this product
    $recipe_materials_sql = "SELECT rm.material_id, rm.quantity
                             FROM recipe_materials rm
                             JOIN recipes r ON rm.recipe_id = r.id
                             WHERE r.product_id = ?";
    file_put_contents('debug_log.txt', 'About to run SQL: ' . $recipe_materials_sql . "\n", FILE_APPEND);
    $stmt = mysqli_prepare($conn, $recipe_materials_sql);
    if (!$stmt) file_put_contents('debug_log.txt', 'ERROR: ' . mysqli_error($conn) . "\n", FILE_APPEND);
    mysqli_stmt_bind_param($stmt, 'i', $actual_product_id);
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);
    while ($row = mysqli_fetch_assoc($result)) {
        $all_material_ids[$row['material_id']] = true;
        // Store the latest recipe quantity for this material (will be overwritten by later recipes, so last one stays)
        $material_latest_recipe_qty[$row['material_id']] = $row['quantity'];
    }
    mysqli_stmt_close($stmt);

    // 2. Get all material_ids from production_materials for this product
    $prod_materials_sql = "SELECT pm.material_id
                           FROM production_materials pm
                           JOIN productions p ON pm.production_id = p.id
                           WHERE p.product_id = ?";
    file_put_contents('debug_log.txt', 'About to run SQL: ' . $prod_materials_sql . "\n", FILE_APPEND);
    $stmt = mysqli_prepare($conn, $prod_materials_sql);
    if (!$stmt) file_put_contents('debug_log.txt', 'ERROR: ' . mysqli_error($conn) . "\n", FILE_APPEND);
    mysqli_stmt_bind_param($stmt, 'i', $actual_product_id);
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);
    while ($row = mysqli_fetch_assoc($result)) {
        $all_material_ids[$row['material_id']] = true;
    }
    mysqli_stmt_close($stmt);

    // 3. For each unique material_id, get details from raw_materials
    $all_materials_used = [];
    foreach (array_keys($all_material_ids) as $material_id) {
        $material_sql = "SELECT id, material_id, name, category, measurement_type, unit_measurement, cost, quantity FROM raw_materials WHERE id = ?";
        file_put_contents('debug_log.txt', 'About to run SQL: ' . $material_sql . "\n", FILE_APPEND);
        $stmt = mysqli_prepare($conn, $material_sql);
        if (!$stmt) file_put_contents('debug_log.txt', 'ERROR: ' . mysqli_error($conn) . "\n", FILE_APPEND);
        mysqli_stmt_bind_param($stmt, 'i', $material_id);
        mysqli_stmt_execute($stmt);
        $result = mysqli_stmt_get_result($stmt);
        if ($mat = mysqli_fetch_assoc($result)) {
            $all_materials_used[] = [
                'material_id' => $mat['id'],
                'material_name' => $mat['name'],
                'material_category' => $mat['category'],
                'measurement_type' => $mat['measurement_type'],
                'unit_measurement' => $mat['unit_measurement'],
                'cost' => $mat['cost'],
                'quantity' => '', // Always blank for user input
                'stock_quantity' => $mat['quantity'],
            ];
        }
        mysqli_stmt_close($stmt);
    }

    echo json_encode([
        'success' => true,
        'product' => $product,
        'recipes' => $recipes,
        'all_materials_used' => $all_materials_used
    ]);

} catch (Exception $e) {
    file_put_contents('debug_log.txt', 'CATCH ERROR: ' . $e->getMessage() . "\n", FILE_APPEND);
    echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
}

mysqli_close($conn);
?> 