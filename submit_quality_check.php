<?php
// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Include database connection
require_once 'db_connection.php';

// Start session if not already started
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Set header to return JSON
header('Content-Type: application/json');

// Initialize response array
$response = ['success' => false, 'message' => '', 'output_id' => null];

try {
    // Check if request method is POST
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception("Only POST requests are allowed");
    }

    // Get and validate required fields
    $production_id = $_POST['production_id'] ?? null;
    $quantity_produced = (int)($_POST['quantity_produced'] ?? 0);
    $quantity_passed_qc = (int)($_POST['quantity_passed_qc'] ?? 0);
    $quantity_failed_qc = (int)($_POST['quantity_failed_qc'] ?? 0);
    $quality_score = (int)($_POST['quality_score'] ?? 0);
    $quality_status = $_POST['quality_status'] ?? 'good';
    $quality_checked_by = $_POST['quality_checked_by'] ?? 'Quality Inspector';
    $quality_checked_at = $_POST['quality_checked_at'] ?? date('Y-m-d H:i:s');
    $quality_notes = $_POST['quality_notes'] ?? '';

    // Validate required fields
    if (!$production_id) {
        throw new Exception("Production ID is required");
    }

    if ($quantity_produced <= 0) {
        throw new Exception("Quantity produced must be greater than 0");
    }

    if ($quantity_passed_qc < 0 || $quantity_failed_qc < 0) {
        throw new Exception("Quality check quantities cannot be negative");
    }

    if (($quantity_passed_qc + $quantity_failed_qc) !== $quantity_produced) {
        throw new Exception("Passed + Failed quantities must equal total produced quantity");
    }

    // Start transaction
    $conn->begin_transaction();

    // Get production details
    $productionQuery = "SELECT * FROM productions WHERE id = ?";
    $productionStmt = $conn->prepare($productionQuery);
    
    if (!$productionStmt) {
        throw new Exception("Failed to prepare production query: " . $conn->error);
    }
    
    $productionStmt->bind_param("i", $production_id);
    
    if (!$productionStmt->execute()) {
        throw new Exception("Failed to execute production query: " . $productionStmt->error);
    }
    
    $productionResult = $productionStmt->get_result();
    $production = $productionResult->fetch_assoc();
    
    if (!$production) {
        throw new Exception("Production not found with ID: " . $production_id);
    }

    // Update production status to completed and add quality check data
    $updateProductionQuery = "UPDATE productions SET 
        status = 'completed',
        actual_completion = NOW(),
        quantity_produced = ?,
        quantity_passed_qc = ?,
        quantity_failed_qc = ?,
        quality_score = ?,
        quality_status = ?,
        quality_checked_by = ?,
        quality_checked_at = ?,
        quality_notes = ?,
        updated_at = NOW()
        WHERE id = ?";
    
    $updateProductionStmt = $conn->prepare($updateProductionQuery);
    
    if (!$updateProductionStmt) {
        throw new Exception("Failed to prepare production update query: " . $conn->error);
    }
    
    $updateProductionStmt->bind_param("iisisssssi", 
        $quantity_produced, 
        $quantity_passed_qc, 
        $quality_failed_qc, 
        $quality_score, 
        $quality_status, 
        $quality_checked_by, 
        $quality_checked_at, 
        $quality_notes, 
        $production_id
    );
    
    if (!$updateProductionStmt->execute()) {
        throw new Exception("Failed to update production: " . $updateProductionStmt->error);
    }

    // Prepare data for production_output table
    $output_batch_code = $_POST['output_batch_code'] ?? 'OUT' . date('Ymd') . '-' . $production_id;
    $manufacturing_date = $_POST['manufacturing_date'] ?? $production['start_date'];
    $expiration_date = $_POST['expiration_date'] ?? date('Y-m-d', strtotime($manufacturing_date . ' + 365 days'));
    $shelf_life_days = $_POST['shelf_life_days'] ?? 365;
    
    // Cost calculations
    $material_cost = (float)($_POST['material_cost'] ?? $production['total_material_cost'] ?? 0);
    $labor_cost = (float)($_POST['labor_cost'] ?? $production['total_operational_cost'] ?? 0);
    $overhead_cost = (float)($_POST['overhead_cost'] ?? 0);
    $total_cost = (float)($_POST['total_cost'] ?? $production['total_production_cost'] ?? 0);
    $cost_per_unit = $quantity_passed_qc > 0 ? ($total_cost / $quantity_passed_qc) : 0;
    
    // Quality metrics
    $defect_rate = $quantity_produced > 0 ? (($quantity_failed_qc / $quantity_produced) * 100) : 0;
    $yield_percentage = $quantity_produced > 0 ? (($quantity_passed_qc / $quantity_produced) * 100) : 0;
    $quality_grade = $_POST['quality_grade'] ?? 'B';
    
    // Additional fields
    $packaging_type = $_POST['packaging_type'] ?? 'Standard';
    $packaging_date = $_POST['packaging_date'] ?? date('Y-m-d');
    $storage_location = $_POST['storage_location'] ?? 'Main Warehouse';
    $quantity_rework = (int)($_POST['quantity_rework'] ?? 0);
    $created_product_id = $_POST['created_product_id'] ?? $production['product_id'];
    $created_batch_id = $_POST['created_batch_id'] ?? $output_batch_code;

    // Insert into production_output table
    $insertOutputQuery = "INSERT INTO production_output (
        production_id,
        output_batch_code,
        product_id,
        product_name,
        quantity_produced,
        quantity_passed_qc,
        quantity_failed_qc,
        quantity_rework,
        defect_rate,
        yield_percentage,
        quality_score,
        quality_status,
        quality_grade,
        quality_checked_by,
        quality_checked_at,
        quality_notes,
        manufacturing_date,
        packaging_date,
        expiration_date,
        shelf_life_days,
        material_cost,
        labor_cost,
        overhead_cost,
        total_cost,
        cost_per_unit,
        packaging_type,
        storage_location,
        created_product_id,
        created_batch_id,
        created_at,
        updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())";
    
    $insertOutputStmt = $conn->prepare($insertOutputQuery);
    
    if (!$insertOutputStmt) {
        throw new Exception("Failed to prepare output insert query: " . $conn->error);
    }
    
    $insertOutputStmt->bind_param("isssiiiiidissssssiiddddssss",
        $production_id,                    // production_id
        $output_batch_code,               // output_batch_code
        $production['product_id'],        // product_id
        $production['product_name'],      // product_name
        $quantity_produced,               // quantity_produced
        $quantity_passed_qc,             // quantity_passed_qc
        $quantity_failed_qc,             // quantity_failed_qc
        $quantity_rework,                // quantity_rework
        $defect_rate,                    // defect_rate
        $yield_percentage,               // yield_percentage
        $quality_score,                  // quality_score
        $quality_status,                 // quality_status
        $quality_grade,                  // quality_grade
        $quality_checked_by,             // quality_checked_by
        $quality_checked_at,             // quality_checked_at
        $quality_notes,                  // quality_notes
        $manufacturing_date,             // manufacturing_date
        $packaging_date,                 // packaging_date
        $expiration_date,                // expiration_date
        $shelf_life_days,                // shelf_life_days
        $material_cost,                  // material_cost
        $labor_cost,                     // labor_cost
        $overhead_cost,                  // overhead_cost
        $total_cost,                     // total_cost
        $cost_per_unit,                  // cost_per_unit
        $packaging_type,                 // packaging_type
        $storage_location,               // storage_location
        $created_product_id,             // created_product_id
        $created_batch_id                // created_batch_id
    );
    
    if (!$insertOutputStmt->execute()) {
        throw new Exception("Failed to insert production output: " . $insertOutputStmt->error);
    }
    
    $output_id = $conn->insert_id;

    // Prepare data for quality_checkpoints table
    $checkpoint_id = uniqid('qc_'); // Generate a unique ID for the checkpoint
    $production_step_id = null; // Assuming this is not applicable for final check
    $checkpoint_name = 'Final Quality Check';
    $checkpoint_type = 'final_inspection';
    $parameter_name = 'Overall Quality';
    $target_value = 'Acceptable'; // Assuming a target value
    $tolerance_min = 70; // Assuming a minimum tolerance
    $tolerance_max = 100; // Assuming a maximum tolerance
    $actual_value = $quality_score;
    $unit_of_measure = '%';
    $inspector = $quality_checked_by;
    $inspection_date = $quality_checked_at;
    $equipment_used = 'N/A'; // Assuming no specific equipment used
    $method = 'Visual Inspection'; // Assuming visual inspection method
    $corrective_action = $quality_notes;
    $attachments = null; // Assuming no attachments

    // Insert into quality_checkpoints table
    $insertCheckpointQuery = "INSERT INTO quality_checkpoints (
        checkpoint_id,
        production_id,
        production_step_id,
        checkpoint_name,
        checkpoint_type,
        parameter_name,
        target_value,
        tolerance_min,
        tolerance_max,
        actual_value,
        unit_of_measure,
        status,
        inspector,
        inspection_date,
        equipment_used,
        method,
        notes,
        corrective_action,
        attachments,
        created_at,
        updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())";

    $insertCheckpointStmt = $conn->prepare($insertCheckpointQuery);

    if (!$insertCheckpointStmt) {
        throw new Exception("Failed to prepare checkpoint insert query: " . $conn->error);
    }

    $insertCheckpointStmt->bind_param("ssissssiidssssssss",
        $checkpoint_id,
        $production_id,
        $production_step_id,
        $checkpoint_name,
        $checkpoint_type,
        $parameter_name,
        $target_value,
        $tolerance_min,
        $tolerance_max,
        $actual_value,
        $unit_of_measure,
        $quality_status,
        $inspector,
        $inspection_date,
        $equipment_used,
        $method,
        $quality_notes,
        $corrective_action,
        $attachments
    );

    if (!$insertCheckpointStmt->execute()) {
        throw new Exception("Failed to insert quality checkpoint: " . $insertCheckpointStmt->error);
    }

    // If this production created a new product, update the product stock
    if ($quantity_passed_qc > 0 && $production['product_id']) {
        $updateStockQuery = "UPDATE products SET 
            stocks = stocks + ?,
            updated_at = NOW()
            WHERE id = ?";
        
        $updateStockStmt = $conn->prepare($updateStockQuery);
        
        if ($updateStockStmt) {
            $updateStockStmt->bind_param("ii", $quantity_passed_qc, $production['product_id']);
            $updateStockStmt->execute();
        }
    }

    // Commit transaction
    $conn->commit();

    // Success response
    $response['success'] = true;
    $response['message'] = "Quality check completed successfully. Production marked as completed and output saved.";
    $response['output_id'] = $output_id;
    $response['production_id'] = $production['production_id'] ?? $production_id;
    $response['output_batch_code'] = $output_batch_code;
    $response['quantity_passed_qc'] = $quantity_passed_qc;
    $response['quality_score'] = $quality_score;
    $response['defect_rate'] = round($defect_rate, 2);
    $response['yield_percentage'] = round($yield_percentage, 2);

} catch (Exception $e) {
    // Rollback transaction on error
    if ($conn->in_transaction) {
        $conn->rollback();
    }
    
    $response['message'] = $e->getMessage();
    error_log("Quality check submission error: " . $e->getMessage());
}

// Close prepared statements
if (isset($productionStmt)) $productionStmt->close();
if (isset($updateProductionStmt)) $updateProductionStmt->close();
if (isset($insertOutputStmt)) $insertOutputStmt->close();
if (isset($updateStockStmt)) $updateStockStmt->close();
if (isset($insertCheckpointStmt)) $insertCheckpointStmt->close();

// Return JSON response
echo json_encode($response);
?>
