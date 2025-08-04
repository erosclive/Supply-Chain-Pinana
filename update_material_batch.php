<?php
// Include database connection
require_once 'db_connection.php';

// Set headers for JSON response
header('Content-Type: application/json');

// Initialize response array
$response = [
    'success' => false,
    'message' => ''
];

// Validate request method
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    $response['message'] = 'Invalid request method';
    echo json_encode($response);
    exit;
}

try {
    // Collect form inputs
    $material_batch_id = $_POST['batch_id'] ?? '';
    $material_quantity = isset($_POST['quantity']) ? floatval($_POST['quantity']) : 0;
    $material_cost = isset($_POST['cost']) ? floatval($_POST['cost']) : 0;
    $material_date_received = $_POST['date_received'] ?? date('Y-m-d');
    $material_expiry_date = !empty($_POST['expiry_date']) ? $_POST['expiry_date'] : null;
    $material_notes = $_POST['notes'] ?? null;

    // Sanitize optional fields
    $material_expiry_date = $material_expiry_date ?: null;
    $material_notes = $material_notes ?: null;

    if (empty($material_batch_id)) {
        throw new Exception("Material batch ID is required");
    }

    // Get current batch data to compute quantity difference
    $select_sql = "SELECT quantity, material_id, cost FROM material_batches WHERE id = ?";

    $select_stmt = mysqli_prepare($conn, $select_sql);
    if (!$select_stmt) throw new Exception("Select prepare failed: " . mysqli_error($conn));

    mysqli_stmt_bind_param($select_stmt, 'i', $material_batch_id);
    mysqli_stmt_execute($select_stmt);
    $result = mysqli_stmt_get_result($select_stmt);
    $existing = mysqli_fetch_assoc($result);
    mysqli_stmt_close($select_stmt);

    if (!$existing) throw new Exception("Material batch not found");

    $old_quantity = $existing['quantity'];
    $material_id = $existing['material_id'];
    $quantity_difference = $material_quantity - $old_quantity;

    // Handle receipt upload
    $receipt_file = null;
    $update_receipt = false;

    if (isset($_FILES['receipt_upload']) && $_FILES['receipt_upload']['error'] === UPLOAD_ERR_OK) {
        $upload_dir = 'uploads/receipts/';
        if (!file_exists($upload_dir)) mkdir($upload_dir, 0777, true);

        $file_name = time() . '_' . preg_replace('/[^a-zA-Z0-9.\-_]/', '_', basename($_FILES['receipt_upload']['name']));
        $target_path = $upload_dir . $file_name;

        if (move_uploaded_file($_FILES['receipt_upload']['tmp_name'], $target_path)) {
            $receipt_file = $target_path;
            $update_receipt = true;
        }
    }

    // Prepare update query
    if ($update_receipt) {
        $sql = "UPDATE material_batches SET 
                    quantity = ?, cost = ?, date_received = ?, 
                    expiry_date = ?, receipt_file = ?, notes = ?, 
                    updated_at = NOW()
                WHERE id = ?";
        $stmt = mysqli_prepare($conn, $sql);
        if (!$stmt) throw new Exception("Prepare failed: " . mysqli_error($conn));

        mysqli_stmt_bind_param(
            $stmt,
            'ddsssssi',
            $material_quantity,
            $material_cost,
            $material_date_received,
            $material_expiry_date,
            $receipt_file,
            $material_notes,
            $material_batch_id
        );
    } else {
        $sql = "UPDATE material_batches SET 
            quantity = ?, cost = ?, date_received = ?, 
            expiry_date = ?, notes = ?, 
            updated_at = NOW()
        WHERE id = ?";

        $stmt = mysqli_prepare($conn, $sql);
        if (!$stmt) throw new Exception("Prepare failed: " . mysqli_error($conn));

        mysqli_stmt_bind_param(
            $stmt,
            'ddsssi',
            $material_quantity,
            $material_cost,
            $material_date_received,
            $material_expiry_date,
            $material_notes,
            $material_batch_id
        );
    }

    // Execute batch update
    if (!mysqli_stmt_execute($stmt)) {
        throw new Exception("Execute failed: " . mysqli_stmt_error($stmt));
    }
    mysqli_stmt_close($stmt);

    // Also get previous cost for comparison
$old_cost = $existing['cost'];
$cost_difference = $material_cost - $old_cost;

if ($quantity_difference != 0 || $cost_difference != 0) {
    $update_raw_sql = "UPDATE raw_materials 
                       SET quantity = quantity + ?, cost = cost + ?, updated_at = NOW() 
                       WHERE id = ?";
    $update_raw_stmt = mysqli_prepare($conn, $update_raw_sql);
    if (!$update_raw_stmt) throw new Exception("Prepare raw material update failed: " . mysqli_error($conn));

    mysqli_stmt_bind_param($update_raw_stmt, 'ddi', $quantity_difference, $cost_difference, $material_id);
    mysqli_stmt_execute($update_raw_stmt);
    mysqli_stmt_close($update_raw_stmt);
}


    $response['success'] = true;
    $response['message'] = 'Material batch updated successfully';

} catch (Exception $e) {
    $response['message'] = 'Error: ' . $e->getMessage();
    error_log("Exception in update_material_batch.php: " . $e->getMessage());
}

echo json_encode($response);
mysqli_close($conn);
?>