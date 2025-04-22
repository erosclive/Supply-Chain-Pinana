<?php
// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Include database connection
require_once 'db_connection.php';

// Set header to return JSON
header('Content-Type: application/json');

try {
    // Query to get all products
    $query = "SELECT product_id, product_name, price FROM products WHERE stocks > 0 ORDER BY product_name ASC";
    $result = mysqli_query($conn, $query);
    
    if (!$result) {
        throw new Exception("Error fetching products: " . mysqli_error($conn));
    }
    
    $products = [];
    
    while ($row = mysqli_fetch_assoc($result)) {
        $products[] = [
            'id' => $row['product_id'],
            'name' => $row['product_name'],
            'price' => floatval($row['price'])
        ];
    }
    
    // Return products as JSON
    echo json_encode([
        'success' => true,
        'products' => $products
    ]);
    
} catch (Exception $e) {
    // Return error as JSON
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}

// Close connection
mysqli_close($conn);
?>
