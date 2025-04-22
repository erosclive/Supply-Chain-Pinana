<?php
// Include database connection
require_once 'db_connection.php';

// Set header to return JSON
header('Content-Type: application/json');

try {
    // Query to get products with their available stock
    $query = "SELECT p.id, p.product_id, p.product_name, p.category, p.price, p.status, 
              p.batch_tracking, p.stocks as available_stock
              FROM products p
              WHERE p.status != 'Deleted'
              ORDER BY p.product_name ASC";
    
    $result = $conn->query($query);
    
    if (!$result) {
        throw new Exception("Error executing query: " . $conn->error);
    }
    
    $products = [];
    while ($row = $result->fetch_assoc()) {
        $products[] = $row;
    }
    
    echo json_encode([
        'success' => true,
        'products' => $products
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}

$conn->close();
?>
