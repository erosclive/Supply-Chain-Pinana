<?php
require_once '../db_connection.php';
header('Content-Type: application/json');

$product_id = isset($_GET['product_id']) ? $_GET['product_id'] : '';
if (!$product_id) {
    echo json_encode(['success' => false, 'message' => 'Missing product_id']);
    exit;
}

try {
    $sql = "SELECT id, production_id, recipe_data, status, created_at FROM productions WHERE product_id = ? AND status = 'completed' AND recipe_data IS NOT NULL AND recipe_data != '' ORDER BY created_at DESC LIMIT 1";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('s', $product_id);
    $stmt->execute();
    $result = $stmt->get_result();
    $row = $result->fetch_assoc();
    if ($row && !empty($row['recipe_data'])) {
        $row['recipe_data'] = json_decode($row['recipe_data'], true);
        echo json_encode(['success' => true, 'production' => $row]);
    } else {
        echo json_encode(['success' => false, 'message' => 'No completed production with recipe_data found for this product.']);
    }
    $stmt->close();
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
} 