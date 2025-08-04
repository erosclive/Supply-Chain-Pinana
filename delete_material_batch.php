<?php
require_once 'db_connection.php';
header('Content-Type: application/json');

$response = [
    'success' => false,
    'message' => ''
];

// Check request method
if ($_SERVER['REQUEST_METHOD'] !== 'DELETE' && $_SERVER['REQUEST_METHOD'] !== 'POST') {
    $response['message'] = 'Invalid request method';
    echo json_encode($response);
    exit;
}

// Get material batch ID from appropriate request type
$material_batch_id = $_SERVER['REQUEST_METHOD'] === 'DELETE'
    ? ($_GET['id'] ?? '')
    : ($_POST['batch_id'] ?? '');

if (empty($material_batch_id)) {
    $response['message'] = 'Material batch ID is required';
    echo json_encode($response);
    exit;
}

try {
    // Get batch data before deletion
    $query = "SELECT quantity, cost, material_id, receipt_file FROM material_batches WHERE id = ?";
    $stmt = mysqli_prepare($conn, $query);
    if (!$stmt) throw new Exception("Prepare failed: " . mysqli_error($conn));

    mysqli_stmt_bind_param($stmt, 'i', $material_batch_id);
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);
    $batch = mysqli_fetch_assoc($result);
    mysqli_stmt_close($stmt);

    if (!$batch) throw new Exception("Material batch not found");

    $quantity = $batch['quantity'];
    $cost = $batch['cost'];
    $material_id = $batch['material_id'];
    $receipt_file = $batch['receipt_file'];

    // Delete batch
    $delete_sql = "DELETE FROM material_batches WHERE id = ?";
    $delete_stmt = mysqli_prepare($conn, $delete_sql);
    if (!$delete_stmt) throw new Exception("Prepare delete failed: " . mysqli_error($conn));

    mysqli_stmt_bind_param($delete_stmt, 'i', $material_batch_id);

    if (!mysqli_stmt_execute($delete_stmt)) {
        throw new Exception("Delete failed: " . mysqli_stmt_error($delete_stmt));
    }
    mysqli_stmt_close($delete_stmt);

    // Update raw_materials: subtract quantity and cost
    $update_sql = "UPDATE raw_materials 
                   SET quantity = quantity - ?, cost = cost - ?, updated_at = NOW() 
                   WHERE id = ?";
    $update_stmt = mysqli_prepare($conn, $update_sql);
    if (!$update_stmt) throw new Exception("Prepare update failed: " . mysqli_error($conn));

    mysqli_stmt_bind_param($update_stmt, 'ddi', $quantity, $cost, $material_id);
    mysqli_stmt_execute($update_stmt);
    mysqli_stmt_close($update_stmt);

    // Delete receipt file if it exists
    if ($receipt_file && file_exists($receipt_file)) {
        unlink($receipt_file);
    }

    $response['success'] = true;
    $response['message'] = 'Material batch deleted successfully';

} catch (Exception $e) {
    $response['message'] = 'Error: ' . $e->getMessage();
    error_log("Exception in delete_material_batch.php: " . $e->getMessage());
}

echo json_encode($response);
mysqli_close($conn);
