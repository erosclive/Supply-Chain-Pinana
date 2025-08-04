<?php
// Set headers for JSON response
header('Content-Type: application/json');

// Include database configuration
require_once 'db_connection.php';

// Initialize response array
$response = [
    'status' => 'success',
    'products' => [],
    'message' => ''
];

try {
    // Query to get all products
    $query = "
        SELECT 
            product_id,
            product_name
        FROM 
            products
        ORDER BY 
            product_name ASC
    ";
    
    $stmt = $conn->prepare($query);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $products = [];
    
    while ($row = $result->fetch_assoc()) {
        $products[] = [
            'id' => $row['product_id'],
            'name' => $row['product_name']
        ];
    }
    
    $response['products'] = $products;
    $stmt->close();
    
} catch (Exception $e) {
    $response['status'] = 'error';
    $response['message'] = 'Error fetching product list: ' . $e->getMessage();
}

// Close database connection
$conn->close();

// Return JSON response
echo json_encode($response);
?>
