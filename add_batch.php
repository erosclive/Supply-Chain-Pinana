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
    $material_id = $_POST['material_id'] ?? '';
    $quantity = $_POST['quantity'] ?? 0;
    $cost = $_POST['cost'] ?? 0;
    $date_received = $_POST['date_received'] ?? date('Y-m-d');
    $expiry_date = !empty($_POST['expiry_date']) ? $_POST['expiry_date'] : null;
    $notes = $_POST['notes'] ?? null;

    $receipt_file = null;
    if (isset($_FILES['receipt_upload']) && $_FILES['receipt_upload']['error'] === UPLOAD_ERR_OK) {
        $upload_dir = 'uploads/receipts/';
        if (!file_exists($upload_dir)) mkdir($upload_dir, 0777, true);

        $file_name = time() . '_' . basename($_FILES['receipt_upload']['name']);
        $target_file = $upload_dir . $file_name;

        if (move_uploaded_file($_FILES['receipt_upload']['tmp_name'], $target_file)) {
            $receipt_file = $target_file;
        }
    }

    // Get next batch number
    $batch_query = "SELECT MAX(batch_number) as max_batch FROM material_batches WHERE material_id = ?";
    $batch_stmt = mysqli_prepare($conn, $batch_query);
    mysqli_stmt_bind_param($batch_stmt, 'i', $material_id);
    mysqli_stmt_execute($batch_stmt);
    $batch_result = mysqli_stmt_get_result($batch_stmt);
    $batch_row = mysqli_fetch_assoc($batch_result);
    $next_batch_number = ($batch_row['max_batch'] ?? 0) + 1;
    mysqli_stmt_close($batch_stmt);

    // Insert new batch
    $sql = "INSERT INTO material_batches (
                material_id, batch_number, quantity, cost,
                date_received, expiry_date, receipt_file, notes, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())";

    $stmt = mysqli_prepare($conn, $sql);
    if (!$stmt) throw new Exception("Prepare failed: " . mysqli_error($conn));

    mysqli_stmt_bind_param(
        $stmt,
        'iiddssss',
        $material_id,
        $next_batch_number,
        $quantity,
        $cost,
        $date_received,
        $expiry_date,
        $receipt_file,
        $notes
    );

    if (mysqli_stmt_execute($stmt)) {
        // Update quantity AND cost in raw_materials
        $update_sql = "UPDATE raw_materials 
                       SET quantity = quantity + ?, cost = cost + ?, updated_at = NOW() 
                       WHERE id = ?";
        $update_stmt = mysqli_prepare($conn, $update_sql);
        if (!$update_stmt) throw new Exception("Prepare update failed: " . mysqli_error($conn));

        mysqli_stmt_bind_param($update_stmt, 'ddi', $quantity, $cost, $material_id);
        mysqli_stmt_execute($update_stmt);
        mysqli_stmt_close($update_stmt);

        $response['success'] = true;
        $response['message'] = 'Batch added successfully';
    } else {
        $response['message'] = 'Failed to execute statement: ' . mysqli_stmt_error($stmt);
    }

    mysqli_stmt_close($stmt);

} catch (Exception $e) {
    $response['message'] = 'Error: ' . $e->getMessage();
    error_log("Exception in add_batch.php: " . $e->getMessage());
}

echo json_encode($response);
mysqli_close($conn);
