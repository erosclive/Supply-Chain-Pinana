<?php
// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Include database connection
require_once 'db_connection.php';

// Start session if not already started
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Set header to return JSON
header('Content-Type: application/json');

// Check if product_id is provided
if (!isset($_GET['product_id'])) {
    echo json_encode([
        'success' => false,
        'message' => 'Product ID is required'
    ]);
    exit;
}

$product_id = $_GET['product_id'];

try {
    // Get product details
    $query = "SELECT 
                p.id,
                p.product_id,
                p.product_name,
                p.price,
                p.stocks,
                p.category,
                p.product_photo,
                p.expiration_date
              FROM products p
              WHERE p.product_id = ?";
    
    $stmt = mysqli_prepare($conn, $query);
    if (!$stmt) {
        throw new Exception("Prepare failed: " . mysqli_error($conn));
    }
    
    mysqli_stmt_bind_param($stmt, "s", $product_id);
    
    if (!mysqli_stmt_execute($stmt)) {
        throw new Exception("Error fetching product details: " . mysqli_stmt_error($stmt));
    }
    
    $result = mysqli_stmt_get_result($stmt);
    $product = mysqli_fetch_assoc($result);
    
    if (!$product) {
        echo json_encode([
            'success' => false,
            'message' => 'Product not found'
        ]);
        exit;
    }
    
    echo json_encode([
        'success' => true,
        'product' => $product
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>
