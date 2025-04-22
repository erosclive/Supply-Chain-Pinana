<?php
// find_product_by_barcode.php - Find product by barcode

// Set headers for JSON response
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');

// Include database connection
require_once 'db_connection.php';

// Get barcode
$barcode = isset($_GET['barcode']) ? $_GET['barcode'] : '';

if (empty($barcode)) {
    echo json_encode([
        'success' => false,
        'error' => 'Barcode is required'
    ]);
    exit;
}

try {
    // Prepare query
    $barcode = mysqli_real_escape_string($conn, $barcode);
    
    $sql = "SELECT 
                product_id, 
                product_name, 
                price, 
                category, 
                product_photo, 
                stocks, 
                status,
                barcode
            FROM 
                products 
            WHERE 
                barcode = ? OR 
                product_id = ?
            LIMIT 1";
    
    $stmt = mysqli_prepare($conn, $sql);
    mysqli_stmt_bind_param($stmt, "ss", $barcode, $barcode);
    
    if (!mysqli_stmt_execute($stmt)) {
        throw new Exception("Error finding product: " . mysqli_error($conn));
    }
    
    $result = mysqli_stmt_get_result($stmt);
    
    if (mysqli_num_rows($result) === 0) {
        echo json_encode([
            'success' => false,
            'error' => 'Product not found'
        ]);
        exit;
    }
    
    // Fetch product
    $product = mysqli_fetch_assoc($result);
    
    // Format product data
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
    
    echo json_encode([
        'success' => true,
        'product' => $product
    ]);
    
} catch (Exception $e) {
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

