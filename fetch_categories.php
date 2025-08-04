<?php
// Set headers for JSON response
header('Content-Type: application/json');

// Include database configuration
require_once 'db_connection.php';

// Initialize response array
$response = [
    'status' => 'success',
    'categories' => [],
    'message' => ''
];

try {
    // Query to get distinct product categories
    $query = "
        SELECT DISTINCT category 
        FROM products 
        WHERE category IS NOT NULL
        ORDER BY category
    ";
    
    // Execute the query
    $result = $conn->query($query);
    
    // Process results
    if ($result) {
        $categories = [];
        while ($row = $result->fetch_assoc()) {
            $categories[] = $row['category'];
        }
        
        $response['categories'] = $categories;
        $response['count'] = count($categories);
    } else {
        throw new Exception("Error executing query: " . $conn->error);
    }
    
} catch (Exception $e) {
    $response['status'] = 'error';
    $response['message'] = 'Error fetching categories: ' . $e->getMessage();
}

// Close database connection
$conn->close();

// Return JSON response
echo json_encode($response);
?>