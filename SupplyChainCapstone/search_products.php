<?php
// search_products.php - Quick search for products

// Set headers for JSON response
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');

// Include database connection
require_once 'db_connection.php';

// Get search term
$search = isset($_GET['term']) ? $_GET['term'] : '';

if (empty($search)) {
    echo json_encode([
        'success' => false,
        'error' => 'Search term is required'
    ]);
    exit;
}

try {
    // Prepare search query
    $search = mysqli_real_escape_string($conn, $search);
    
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
                product_name LIKE ? OR 
                product_id LIKE ? OR 
                category LIKE ? OR
                barcode LIKE ?
            ORDER BY 
                product_name ASC
            LIMIT 10";
    
    $search_param = "%$search%";
    $stmt = mysqli_prepare($conn, $sql);
    mysqli_stmt_bind_param($stmt, "ssss", $search_param, $search_param, $search_param, $search_param);
    
    if (!mysqli_stmt_execute($stmt)) {
        throw new Exception("Error searching products: " . mysqli_error($conn));
    }
    
    $result = mysqli_stmt_get_result($stmt);
    
    // Fetch products
    $products = [];
    while ($row = mysqli_fetch_assoc($result)) {
        // Format product data
        $row['price'] = (float) $row['price'];
        $row['stocks'] = (int) $row['stocks'];
        
        // Handle product photo
        if (empty($row['product_photo'])) {
            $row['product_photo'] = "/placeholder.svg?height=100&width=100";
        } else if (!filter_var($row['product_photo'], FILTER_VALIDATE_URL)) {
            // If it's a relative path, make sure it points to the right location
            if (!str_starts_with($row['product_photo'], 'uploads/')) {
                $row['product_photo'] = 'uploads/' . $row['product_photo'];
            }
        }
        
        $products[] = $row;
    }
    
    echo json_encode([
        'success' => true,
        'products' => $products,
        'count' => count($products)
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

