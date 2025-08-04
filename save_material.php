<?php
// Include database connection
require_once 'db_connection.php';

// Set headers for JSON response
header('Content-Type: application/json');

// Check if the request method is POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Invalid request method']);
    exit;
}

try {
    // Get basic form data
    $material_id = $_POST['material_id'] ?? '';
    $name = $_POST['material_name'] ?? '';
    $category = $_POST['category'] ?? '';
    $quantity = isset($_POST['quantity']) ? floatval($_POST['quantity']) : 0;
    $measurement_type = $_POST['measurement_type'] ?? '';
    $unit_measurement = $_POST['unit_measurement'] ?? null;

    // Enhanced fields matching your table structure
    $base_unit = $_POST['base_unit'] ?? null;
    $pieces_per_container = isset($_POST['pieces_per_container']) ? intval($_POST['pieces_per_container']) : null;
    
    // Container management fields
    $container_status = 'unopened'; // Default status
    $opened_containers = isset($_POST['opened_containers']) ? intval($_POST['opened_containers']) : 0;
    $remaining_in_opened = isset($_POST['remaining_in_opened']) ? floatval($_POST['remaining_in_opened']) : 0;

    // Check if material_id is provided
    if (empty($material_id)) {
        echo json_encode(['success' => false, 'message' => 'Material ID is required']);
        exit;
    }

    // Log received data for debugging
    error_log("Received material data: " . print_r($_POST, true));

    $cost = isset($_POST['cost']) ? floatval($_POST['cost']) : 0;
    $is_alternative_supplier = $_POST['is_alternative_supplier'] ?? 'no';
    $supplier_id = null;
    $alternative_supplier = null;

    if ($is_alternative_supplier === 'yes') {
        $alternative_supplier = $_POST['alternative_supplier'] ?? null;
    } else {
        $supplier_id = $_POST['supplier'] ?? null;
    }

    $date_received = $_POST['date_received'] ?? date('Y-m-d');
    $expiry_date = !empty($_POST['expiry_date']) ? $_POST['expiry_date'] : null;
    $notes = $_POST['notes'] ?? null;

    // Handle file upload
    $receipt_file = null;
    if (isset($_FILES['receipt_upload']) && $_FILES['receipt_upload']['error'] === UPLOAD_ERR_OK) {
        $upload_dir = 'uploads/receipts/';

        // Create directory if it doesn't exist
        if (!file_exists($upload_dir)) {
            mkdir($upload_dir, 0777, true);
        }

        $file_name = time() . '_' . basename($_FILES['receipt_upload']['name']);
        $target_file = $upload_dir . $file_name;

        // Validate file type
        $allowed_types = ['pdf', 'jpg', 'jpeg', 'png'];
        $file_extension = strtolower(pathinfo($file_name, PATHINFO_EXTENSION));
        
        if (!in_array($file_extension, $allowed_types)) {
            throw new Exception('Invalid file type. Only PDF, JPG, JPEG, and PNG files are allowed.');
        }

        // Move uploaded file
        if (move_uploaded_file($_FILES['receipt_upload']['tmp_name'], $target_file)) {
            $receipt_file = 'uploads/receipts/' . $file_name;
        } else {
            throw new Exception('Failed to upload receipt file.');
        }
    }

    // Validate enhanced data
    if ($measurement_type === 'Dozen' && $pieces_per_container !== 12) {
        $pieces_per_container = 12; // Force dozen to be 12 pieces
    }

    if (in_array($measurement_type, ['Pack', 'Box']) && (!$pieces_per_container || $pieces_per_container <= 0)) {
        throw new Exception('Pieces per container is required for ' . $measurement_type . ' measurement type');
    }

    // Set container status based on opened containers
    if ($opened_containers > 0) {
        $container_status = 'partially_opened';
    } else {
        $container_status = 'unopened';
    }

    // Start transaction
    mysqli_autocommit($conn, false);

    // Insert into raw_materials table - EXACTLY matching your table structure
    $sql = "INSERT INTO raw_materials (
               material_id, name, category, quantity, measurement_type,
               unit_measurement, base_unit, pieces_per_container, cost,
               supplier_id, is_alternative_supplier, alternative_supplier,
               date_received, expiry_date, receipt_file, notes,
               created_at, updated_at, container_status, opened_containers, remaining_in_opened
            ) VALUES (
                ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW(), ?, ?, ?
            )";

    $stmt = mysqli_prepare($conn, $sql);

    if (!$stmt) {
        throw new Exception("Prepare statement failed: " . mysqli_error($conn));
    }

    // Bind parameters - 20 parameters total
    mysqli_stmt_bind_param(
        $stmt,
        'sssdsssiissssssssid', // 20 parameters
        $material_id,           // s
        $name,                  // s
        $category,              // s
        $quantity,              // d
        $measurement_type,      // s
        $unit_measurement,      // s
        $base_unit,             // s
        $pieces_per_container,  // i
        $cost,                  // s (treating as string to handle NULL)
        $supplier_id,           // s
        $is_alternative_supplier, // s
        $alternative_supplier,  // s
        $date_received,         // s
        $expiry_date,           // s
        $receipt_file,          // s
        $notes,                 // s
        $container_status,      // s
        $opened_containers,     // i
        $remaining_in_opened    // d
    );

    // Debug log for SQL parameters
    error_log("SQL parameters: material_id=$material_id, name=$name, category=$category, quantity=$quantity, measurement_type=$measurement_type, unit_measurement=$unit_measurement, base_unit=$base_unit, pieces_per_container=$pieces_per_container, cost=$cost");

    if (!mysqli_stmt_execute($stmt)) {
        throw new Exception("Failed to execute material statement: " . mysqli_stmt_error($stmt));
    }

    // Get last inserted ID (auto-incremented 'id' from raw_materials)
    $material_db_id = mysqli_insert_id($conn);

    // Insert initial batch
    $batch_sql = "INSERT INTO material_batches (
        material_id, batch_number, quantity, cost,
        date_received, expiry_date, receipt_file, notes, created_at
    ) VALUES (
        ?, 1, ?, ?, ?, ?, ?, ?, NOW()
    )";

    $batch_stmt = mysqli_prepare($conn, $batch_sql);

    if (!$batch_stmt) {
        throw new Exception("Prepare batch statement failed: " . mysqli_error($conn));
    }

    mysqli_stmt_bind_param(
        $batch_stmt,
        'iddssss',
        $material_db_id,        // i - FK to raw_materials.id
        $quantity,              // d
        $cost,                  // d
        $date_received,         // s
        $expiry_date,           // s
        $receipt_file,          // s
        $notes                  // s
    );

    if (!mysqli_stmt_execute($batch_stmt)) {
        throw new Exception("Failed to execute batch statement: " . mysqli_stmt_error($batch_stmt));
    }

    // Insert conversion rules if any were provided
    if (isset($_POST['conversion_rules']) && !empty($_POST['conversion_rules'])) {
        $conversion_rules = json_decode($_POST['conversion_rules'], true);
        
        if ($conversion_rules && is_array($conversion_rules)) {
            $conversion_sql = "INSERT INTO material_conversions (
                material_id, from_unit, to_unit, conversion_factor, description, created_at
            ) VALUES (?, ?, ?, ?, ?, NOW())";
            
            $conversion_stmt = mysqli_prepare($conn, $conversion_sql);
            
            if ($conversion_stmt) {
                foreach ($conversion_rules as $rule) {
                    if (!empty($rule['from_unit']) && !empty($rule['to_unit']) && $rule['factor'] > 0) {
                        mysqli_stmt_bind_param(
                            $conversion_stmt,
                            'issds',
                            $material_db_id,
                            $rule['from_unit'],
                            $rule['to_unit'],
                            $rule['factor'],
                            $rule['description']
                        );
                        mysqli_stmt_execute($conversion_stmt);
                    }
                }
                mysqli_stmt_close($conversion_stmt);
            }
        }
    }

    // Commit transaction
    mysqli_commit($conn);

    // Close statements
    mysqli_stmt_close($stmt);
    mysqli_stmt_close($batch_stmt);

    // Prepare response matching your table structure
    $response_data = [
        'success' => true,
        'message' => 'Material added successfully',
        'material_data' => [
            'id' => $material_db_id,
            'material_id' => $material_id,
            'name' => $name,
            'category' => $category,
            'quantity' => $quantity,
            'measurement_type' => $measurement_type,
            'unit_measurement' => $unit_measurement,
            'base_unit' => $base_unit,
            'pieces_per_container' => $pieces_per_container,
            'cost' => $cost,
            'supplier_id' => $supplier_id,
            'is_alternative_supplier' => $is_alternative_supplier,
            'alternative_supplier' => $alternative_supplier,
            'date_received' => $date_received,
            'expiry_date' => $expiry_date,
            'receipt_file' => $receipt_file,
            'notes' => $notes,
            'container_status' => $container_status,
            'opened_containers' => $opened_containers,
            'remaining_in_opened' => $remaining_in_opened
        ]
    ];

    echo json_encode($response_data);

} catch (Exception $e) {
    // Rollback transaction on error
    mysqli_rollback($conn);
    
    echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
    error_log("Exception in save_material.php: " . $e->getMessage());
    
    // Close any open statements
    if (isset($stmt)) mysqli_stmt_close($stmt);
    if (isset($batch_stmt)) mysqli_stmt_close($batch_stmt);
}

// Close connection
mysqli_close($conn);
?>