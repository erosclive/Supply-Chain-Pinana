<?php
require_once 'db_connection.php';
header('Content-Type: application/json');

$response = ['success' => false, 'message' => ''];

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    $response['message'] = 'Invalid request method';
    echo json_encode($response);
    exit;
}

try {
    $id = $_POST['id'] ?? '';
    $material_id = $_POST['material_id'] ?? '';
    $name = $_POST['material_name'] ?? '';
    $category = $_POST['category'] ?? '';
    $measurement_type = $_POST['measurement_type'] ?? 'Unit';
    $unit_measurement = $_POST['unit_measurement'] ?? null;
    $unit_measurement = !empty($unit_measurement) ? $unit_measurement : null;
    $pieces_per_container = isset($_POST['pieces_per_container']) ? intval($_POST['pieces_per_container']) : null;
    $base_unit = $_POST['base_unit'] ?? 'pieces';
    $is_alternative_supplier = $_POST['is_alternative_supplier'] ?? 'no';
    $supplier_id = $is_alternative_supplier === 'yes' ? null : ($_POST['supplier'] ?? null);
    $alternative_supplier = $is_alternative_supplier === 'yes' ? ($_POST['alternative_supplier'] ?? null) : null;
    $notes = $_POST['notes'] ?? null;

    // Handle receipt file
    $receipt_file = null;
    $update_receipt = false;

    if (isset($_FILES['receipt_upload']) && $_FILES['receipt_upload']['error'] === UPLOAD_ERR_OK) {
        $upload_dir = 'uploads/receipts/';
        if (!file_exists($upload_dir)) mkdir($upload_dir, 0777, true);

        $file_name = time() . '_' . basename($_FILES['receipt_upload']['name']);
        $target_file = $upload_dir . $file_name;

        if (move_uploaded_file($_FILES['receipt_upload']['tmp_name'], $target_file)) {
            $receipt_file = 'uploads/receipts/' . $file_name;
            $update_receipt = true;
        }
    }

    // Build SQL query with enhanced fields
    if ($update_receipt) {
        $sql = "UPDATE raw_materials SET 
                    material_id = ?, name = ?, category = ?, 
                    measurement_type = ?, unit_measurement = ?, pieces_per_container = ?, base_unit = ?,
                    supplier_id = ?, is_alternative_supplier = ?, alternative_supplier = ?, 
                    receipt_file = ?, notes = ?, updated_at = NOW() 
                WHERE id = ?";
        $stmt = mysqli_prepare($conn, $sql);
        mysqli_stmt_bind_param(
            $stmt,
            'sssssississsi',
            $material_id,
            $name,
            $category,
            $measurement_type,
            $unit_measurement,
            $pieces_per_container,
            $base_unit,
            $supplier_id,
            $is_alternative_supplier,
            $alternative_supplier,
            $receipt_file,
            $notes,
            $id
        );
    } else {
        $sql = "UPDATE raw_materials SET 
                    material_id = ?, name = ?, category = ?, 
                    measurement_type = ?, unit_measurement = ?, pieces_per_container = ?, base_unit = ?,
                    supplier_id = ?, is_alternative_supplier = ?, alternative_supplier = ?, 
                    notes = ?, updated_at = NOW() 
                WHERE id = ?";
        $stmt = mysqli_prepare($conn, $sql);
        mysqli_stmt_bind_param(
            $stmt,
            'sssssississi',
            $material_id,
            $name,
            $category,
            $measurement_type,
            $unit_measurement,
            $pieces_per_container,
            $base_unit,
            $supplier_id,
            $is_alternative_supplier,
            $alternative_supplier,
            $notes,
            $id
        );
    }

    if (!$stmt) {
        throw new Exception("Prepare failed: " . mysqli_error($conn));
    }

    if (mysqli_stmt_execute($stmt)) {
        $response['success'] = true;
        $response['message'] = 'Material updated successfully';
    } else {
        $response['message'] = 'Execute failed: ' . mysqli_stmt_error($stmt);
    }

    mysqli_stmt_close($stmt);

} catch (Exception $e) {
    $response['message'] = 'Error: ' . $e->getMessage();
    error_log("Update Error: " . $e->getMessage());
}

echo json_encode($response);
mysqli_close($conn);
?>
