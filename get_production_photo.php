<?php
require_once 'db_connection.php';
header('Content-Type: application/json');

if (!isset($_GET['id'])) {
    echo json_encode(['success' => false, 'message' => 'Production ID required']);
    exit;
}

$production_id = intval($_GET['id']);

try {
    $query = "SELECT product_photo FROM productions WHERE id = ?";
    $stmt = mysqli_prepare($conn, $query);
    
    if (!$stmt) {
        throw new Exception('Failed to prepare statement: ' . mysqli_error($conn));
    }
    
    mysqli_stmt_bind_param($stmt, 'i', $production_id);
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);
    $data = mysqli_fetch_assoc($result);
    
    if ($data && !empty($data['product_photo'])) {
        echo json_encode([
            'success' => true,
            'photo_path' => $data['product_photo']
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'No photo found'
        ]);
    }
    
    mysqli_stmt_close($stmt);
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}

mysqli_close($conn);
?>
