<?php
// Include database connection
require_once 'db_connection.php';

// Set headers for JSON response
header('Content-Type: application/json');

try {
    // Query to get all unique categories from products table
    $query = "SELECT DISTINCT category FROM products ORDER BY category";
    
    // Execute query
    $result = mysqli_query($conn, $query);
    
    if (!$result) {
        throw new Exception(mysqli_error($conn));
    }
    
    // Fetch all categories
    $categories = [];
    while ($row = mysqli_fetch_assoc($result)) {
        $categories[] = $row['category'];
    }
    
    // Return success response with categories
    echo json_encode([
        'success' => true,
        'categories' => $categories
    ]);
    
} catch (Exception $e) {
    // Return error response
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}

// Close database connection
mysqli_close($conn);
?>

