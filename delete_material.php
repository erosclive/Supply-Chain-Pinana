<?php
// Include database connection
require_once 'db_connection.php';

// Set headers for JSON response
header('Content-Type: application/json');

// Initialize response array
$response = array(
    'success' => false,
    'message' => ''
);

// Check if ID is provided
if (!isset($_GET['id']) || empty($_GET['id'])) {
    $response['message'] = 'Material ID is required';
    echo json_encode($response);
    exit;
}

try {
    $material_id = mysqli_real_escape_string($conn, $_GET['id']);
    
    // Start transaction
    mysqli_begin_transaction($conn);
    
    // Delete batches first (foreign key constraint)
    $batch_sql = "DELETE FROM material_batches WHERE material_id = ?";
    $batch_stmt = mysqli_prepare($conn, $batch_sql);
    
    if (!$batch_stmt) {
        throw new Exception("Prepare batch statement failed: " . mysqli_error($conn));
    }
    
    mysqli_stmt_bind_param($batch_stmt, 'i', $material_id);
    mysqli_stmt_execute($batch_stmt);
    mysqli_stmt_close($batch_stmt);
    
    // Delete material
    $sql = "DELETE FROM raw_materials WHERE id = ?";
    $stmt = mysqli_prepare($conn, $sql);
    
    if (!$stmt) {
        throw new Exception("Prepare statement failed: " . mysqli_error($conn));
    }
    
    mysqli_stmt_bind_param($stmt, 'i', $material_id);
    
    if (mysqli_stmt_execute($stmt)) {
        // Commit transaction
        mysqli_commit($conn);
        
        $response['success'] = true;
        $response['message'] = 'Material deleted successfully';
    } else {
        // Rollback transaction
        mysqli_rollback($conn);
        
        $response['message'] = 'Failed to execute statement: ' . mysqli_stmt_error($stmt);
    }
    
    mysqli_stmt_close($stmt);
    
} catch (Exception $e) {
    // Rollback transaction
    mysqli_rollback($conn);
    
    $response['message'] = 'Error: ' . $e->getMessage();
    error_log("Exception in delete_material.php: " . $e->getMessage());
}

// Return JSON response
echo json_encode($response);

// Close connection
mysqli_close($conn);
?>