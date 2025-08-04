<?php
// Include database connection
require_once 'db_connection.php';

// Set headers for JSON response
header('Content-Type: application/json');

// Initialize response array
$response = array(
    'success' => false,
    'message' => '',
    'material_batch' => null
);

// Check if material batch ID is provided
if (!isset($_GET['id']) || empty($_GET['id'])) {
    $response['message'] = 'Material batch ID is required';
    echo json_encode($response);
    exit;
}

try {
    $material_batch_id = mysqli_real_escape_string($conn, $_GET['id']);
    
    // Get material batch details with material information
    $sql = "SELECT mb.*, rm.name as material_name, rm.material_id, rm.measurement_type, rm.unit_measurement
            FROM material_batches mb 
            LEFT JOIN raw_materials rm ON mb.material_id = rm.id 
            WHERE mb.id = ?";
    
    $stmt = mysqli_prepare($conn, $sql);
    
    if (!$stmt) {
        throw new Exception("Prepare statement failed: " . mysqli_error($conn));
    }
    
    mysqli_stmt_bind_param($stmt, 'i', $material_batch_id);
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);
    
    if ($row = mysqli_fetch_assoc($result)) {
    $response['success'] = true;
    $response['batch'] = array(
        'id' => $row['id'],
        'material_id' => $row['material_id'],
        'batch_number' => $row['batch_number'],
        'quantity' => $row['quantity'],
        'cost' => $row['cost'],
        'date_received' => $row['date_received'],
        'expiry_date' => $row['expiry_date'],
        'receipt_file' => $row['receipt_file'],
        'notes' => $row['notes']
    );

    $response['material'] = array(
        'name' => $row['material_name'],
        'material_id' => $row['material_id'],
        'measurement_type' => $row['measurement_type'],
        'unit_measurement' => $row['unit_measurement']
    );
} else {
        $response['message'] = 'Material batch not found';
    }
    
    mysqli_stmt_close($stmt);
    
} catch (Exception $e) {
    $response['message'] = 'Error: ' . $e->getMessage();
    error_log("Exception in get_material_batch.php: " . $e->getMessage());
}

// Return JSON response
echo json_encode($response);

// Close connection
mysqli_close($conn);
?>
