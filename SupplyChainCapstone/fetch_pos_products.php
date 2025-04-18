<?php
// Set headers for JSON response
header('Content-Type: application/json');

// Include database connection
require_once 'db_connection.php';

// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

try {
    // Ensure database connection
    if (!$conn) {
        throw new Exception("Database connection failed: " . mysqli_connect_error());
    }

    // Prepare SQL query to fetch product data
    $sql = "SELECT product_id, product_name, price, category, product_photo, stocks, status FROM products ORDER BY product_name ASC";
    $result = mysqli_query($conn, $sql);

    if (!$result) {
        throw new Exception("Query failed: " . mysqli_error($conn));
    }

    // Fetch all products
    $products = mysqli_fetch_all($result, MYSQLI_ASSOC);

    // Format product data for POS system
    foreach ($products as &$product) {
        $product['price'] = (float) $product['price'];
        $product['stocks'] = (int) $product['stocks'];
        
        // Handle product photo
        if (empty($product['product_photo'])) {
            $product['product_photo'] = "/placeholder.svg?height=100&width=100";
        } else if (!filter_var($product['product_photo'], FILTER_VALIDATE_URL)) {
            // If it's a relative path, make sure it points to the right location
            if (!str_starts_with($product['product_photo'], 'uploads/')) {
                $product['product_photo'] = 'uploads/' . $product['product_photo'];
            }
        }
        
        // Ensure category is set
        if (empty($product['category'])) {
            $product['category'] = 'Other';
        }
    }

    // Return JSON response
    echo json_encode([
        'success' => true,
        'products' => $products,
        'count' => count($products)
    ], JSON_UNESCAPED_SLASHES);

} catch (Exception $e) {
    // Return error response
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
} finally {
    // Close connection
    if (isset($conn)) {
        mysqli_close($conn);
    }
}
?>

