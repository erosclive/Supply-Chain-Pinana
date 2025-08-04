<?php
require_once 'db_connection.php';
header('Content-Type: application/json');

$response = ['success' => false, 'message' => '', 'material' => null];

if (!isset($_GET['id']) || empty($_GET['id'])) {
    $response['message'] = 'Material ID is required';
    echo json_encode($response);
    exit;
}

try {
    $material_id = mysqli_real_escape_string($conn, $_GET['id']);

    // Get raw material details with enhanced fields
    $sql = "SELECT m.*, s.name AS supplier_name
            FROM raw_materials m
            LEFT JOIN suppliers s ON m.supplier_id = s.id
            WHERE m.id = ?";

    $stmt = mysqli_prepare($conn, $sql);
    if (!$stmt) throw new Exception("Prepare failed: " . mysqli_error($conn));

    mysqli_stmt_bind_param($stmt, 'i', $material_id);
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);

    if ($material = mysqli_fetch_assoc($result)) {
        mysqli_stmt_close($stmt);

        // Fetch batches
        $batches_sql = "SELECT * FROM material_batches WHERE material_id = ? ORDER BY batch_number DESC";
        $batches_stmt = mysqli_prepare($conn, $batches_sql);
        mysqli_stmt_bind_param($batches_stmt, 'i', $material_id);
        mysqli_stmt_execute($batches_stmt);
        $batch_result = mysqli_stmt_get_result($batches_stmt);

        $batches = [];
        $total_cost = 0;

        while ($batch = mysqli_fetch_assoc($batch_result)) {
            $batches[] = $batch;
            $total_cost += floatval($batch['cost']);
        }

        mysqli_stmt_close($batches_stmt);

        // Determine which supplier name to show
        $supplier_display_name = 'N/A';
        if ($material['is_alternative_supplier'] === 'yes' && !empty($material['alternative_supplier'])) {
            $supplier_display_name = $material['alternative_supplier'];
        } elseif (!empty($material['supplier_name'])) {
            $supplier_display_name = $material['supplier_name'];
        }

        // Add calculated fields
        $material['batches'] = $batches;
        $material['total_cost'] = $total_cost;
        $material['supplier'] = $supplier_display_name;
        
        // Ensure all enhanced fields are present
        $material['measurement_type'] = $material['measurement_type'] ?? 'Unit';
        $material['unit_measurement'] = $material['unit_measurement'] ?? null;
        $material['base_unit'] = $material['base_unit'] ?? 'pieces';
        $material['pieces_per_container'] = $material['pieces_per_container'] ?? null;
        $material['container_status'] = $material['container_status'] ?? 'unopened';
        $material['opened_containers'] = $material['opened_containers'] ?? 0;
        $material['remaining_in_container'] = $material['remaining_in_container'] ?? null;

        $response['success'] = true;
        $response['material'] = $material;
    } else {
        $response['message'] = 'Material not found';
    }

} catch (Exception $e) {
    $response['message'] = 'Error: ' . $e->getMessage();
    error_log("Exception in get_material.php: " . $e->getMessage());
}

echo json_encode($response);
mysqli_close($conn);
?>
