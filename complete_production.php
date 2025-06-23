<?php
// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Include database connection
require_once 'db_connection.php';

// Set header to return JSON
header('Content-Type: application/json');

// Check if request method is POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode([
        'success' => false,
        'message' => 'Invalid request method'
    ]);
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
    // Get form data
    $production_id = intval($_POST['production_id'] ?? 0);
    $quantity_produced = intval($_POST['quantity_produced'] ?? 0);
    $quantity_passed_qc = intval($_POST['quantity_passed_qc'] ?? 0);
    $quantity_failed_qc = intval($_POST['quantity_failed_qc'] ?? 0);
    $quality_score = floatval($_POST['quality_score'] ?? 95);
    $target_price = floatval($_POST['target_price'] ?? 0);
    $notes = $_POST['notes'] ?? '';
    
    if (!$production_id) {
        throw new Exception('Production ID is required');
    }
    
    if ($quantity_produced <= 0) {
        throw new Exception('Quantity produced must be greater than 0');
    }
    
    if ($quantity_passed_qc > $quantity_produced) {
        throw new Exception('Quantity passed QC cannot exceed quantity produced');
    }
    
    // Start transaction
    mysqli_begin_transaction($conn);
    
    // Get production details
    $prod_query = "SELECT * FROM productions WHERE id = ?";
    $prod_stmt = mysqli_prepare($conn, $prod_query);
    mysqli_stmt_bind_param($prod_stmt, 'i', $production_id);
    mysqli_stmt_execute($prod_stmt);
    $prod_result = mysqli_stmt_get_result($prod_stmt);
    $production = mysqli_fetch_assoc($prod_result);
    
    if (!$production) {
        throw new Exception('Production not found');
    }
    
    // Calculate costs
    $material_cost = 0;
    $labor_cost = 0;
    $overhead_cost = 0;
    
    // Get material costs from production_materials if exists
    $cost_query = "SELECT SUM(actual_cost) as total_material_cost FROM production_materials WHERE production_id = ?";
    $cost_stmt = mysqli_prepare($conn, $cost_query);
    mysqli_stmt_bind_param($cost_stmt, 'i', $production_id);
    mysqli_stmt_execute($cost_stmt);
    $cost_result = mysqli_stmt_get_result($cost_stmt);
    $cost_data = mysqli_fetch_assoc($cost_result);
    $material_cost = floatval($cost_data['total_material_cost'] ?? 0);
    
    // Get operational costs from production_costs if exists
    $op_cost_query = "SELECT SUM(total_cost) as total_op_cost FROM production_costs WHERE production_id = ?";
    $op_cost_stmt = mysqli_prepare($conn, $op_cost_query);
    mysqli_stmt_bind_param($op_cost_stmt, 'i', $production_id);
    mysqli_stmt_execute($op_cost_stmt);
    $op_cost_result = mysqli_stmt_get_result($op_cost_stmt);
    $op_cost_data = mysqli_fetch_assoc($op_cost_result);
    $labor_cost = floatval($op_cost_data['total_op_cost'] ?? 0);
    
    $total_cost = $material_cost + $labor_cost + $overhead_cost;
    $cost_per_unit = $quantity_produced > 0 ? $total_cost / $quantity_produced : 0;
    
    // If no target price provided, use cost-plus pricing (50% markup)
    if ($target_price <= 0) {
        $target_price = $cost_per_unit * 1.5;
    }
    
    // Generate output batch code
    $output_batch_code = 'OUT' . date('Ymd') . sprintf('%04d', $production_id);
    
    // Create production output record
    $output_query = "INSERT INTO production_output (
        production_id,
        quantity_produced,
        quantity_passed_qc,
        quantity_failed_qc,
        quality_score,
        material_cost,
        labor_cost,
        overhead_cost,
        total_cost,
        cost_per_unit,
        output_batch_code,
        manufacturing_date,
        created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())";
    
    $output_stmt = mysqli_prepare($conn, $output_query);
    mysqli_stmt_bind_param($output_stmt, 'iiiddddddds', 
        $production_id,
        $quantity_produced,
        $quantity_passed_qc,
        $quantity_failed_qc,
        $quality_score,
        $material_cost,
        $labor_cost,
        $overhead_cost,
        $total_cost,
        $cost_per_unit,
        $output_batch_code
    );
    
    if (!mysqli_stmt_execute($output_stmt)) {
        throw new Exception('Failed to create production output: ' . mysqli_stmt_error($output_stmt));
    }
    
    $output_id = mysqli_insert_id($conn);
    
    // Update production status to completed
    $update_prod_query = "UPDATE productions SET 
        status = 'completed',
        progress = 100,
        actual_completion = NOW(),
        quality_status = 'passed',
        notes = CONCAT(COALESCE(notes, ''), ?, ' [Completed: ', NOW(), ']'),
        updated_at = NOW()
        WHERE id = ?";
    
    $update_prod_stmt = mysqli_prepare($conn, $update_prod_query);
    $completion_note = "\n" . $notes;
    mysqli_stmt_bind_param($update_prod_stmt, 'si', $completion_note, $production_id);
    
    if (!mysqli_stmt_execute($update_prod_stmt)) {
        throw new Exception('Failed to update production: ' . mysqli_stmt_error($update_prod_stmt));
    }
    
    // Create or update product in inventory
    $created_product = null;
    if ($production['auto_create_product'] == 1 && $quantity_passed_qc > 0) {
        // Check if product already exists
        $check_product_query = "SELECT id FROM products WHERE product_id = ?";
        $check_product_stmt = mysqli_prepare($conn, $check_product_query);
        mysqli_stmt_bind_param($check_product_stmt, 's', $production['product_id']);
        mysqli_stmt_execute($check_product_stmt);
        $check_product_result = mysqli_stmt_get_result($check_product_stmt);
        
        if (mysqli_num_rows($check_product_result) > 0) {
            // Update existing product stock
            $update_stock_query = "UPDATE products SET 
                stocks = stocks + ?,
                price = ?,
                status = CASE 
                    WHEN stocks + ? > 10 THEN 'In Stock'
                    WHEN stocks + ? > 0 THEN 'Low Stock'
                    ELSE 'Out of Stock'
                END,
                updated_at = NOW()
                WHERE product_id = ?";
            
            $update_stock_stmt = mysqli_prepare($conn, $update_stock_query);
            mysqli_stmt_bind_param($update_stock_stmt, 'idiis', 
                $quantity_passed_qc, $target_price, $quantity_passed_qc, $quantity_passed_qc, $production['product_id']);
            
            if (!mysqli_stmt_execute($update_stock_stmt)) {
                throw new Exception('Failed to update product stock: ' . mysqli_stmt_error($update_stock_stmt));
            }
            
            $created_product = $production['product_name'] . ' (stock updated)';
        } else {
            // Create new product
            $create_product_query = "INSERT INTO products (
                product_id,
                product_name,
                name,
                category,
                price,
                stocks,
                batch_tracking,
                status,
                created_from_production,
                production_reference,
                created_at,
                updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, 0, 'In Stock', 1, ?, NOW(), NOW())";
            
            $create_product_stmt = mysqli_prepare($conn, $create_product_query);
            mysqli_stmt_bind_param($create_product_stmt, 'ssssdis',
                $production['product_id'],
                $production['product_name'],
                $production['product_name'],
                $production['category'],
                $target_price,
                $quantity_passed_qc,
                $production['production_id']
            );
            
            if (!mysqli_stmt_execute($create_product_stmt)) {
                throw new Exception('Failed to create product: ' . mysqli_stmt_error($create_product_stmt));
            }
            
            $created_product = $production['product_name'] . ' (new product created)';
        }
        
        // Update production output with created product info
        $update_output_query = "UPDATE production_output SET 
            created_product_id = (SELECT id FROM products WHERE product_id = ? LIMIT 1)
            WHERE id = ?";
        
        $update_output_stmt = mysqli_prepare($conn, $update_output_query);
        mysqli_stmt_bind_param($update_output_stmt, 'si', $production['product_id'], $output_id);
        mysqli_stmt_execute($update_output_stmt);
    }
    
    // Commit transaction
    mysqli_commit($conn);
    
    echo json_encode([
        'success' => true,
        'message' => 'Production completed successfully',
        'production_id' => $production['production_id'],
        'output_id' => $output_id,
        'output_batch_code' => $output_batch_code,
        'quantity_produced' => $quantity_produced,
        'quantity_passed_qc' => $quantity_passed_qc,
        'total_cost' => $total_cost,
        'cost_per_unit' => $cost_per_unit,
        'created_product' => $created_product
    ]);
    
} catch (Exception $e) {
    // Rollback transaction on error
    mysqli_rollback($conn);
    
    error_log("Production completion error: " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}

mysqli_close($conn);
?>