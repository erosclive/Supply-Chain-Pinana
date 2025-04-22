<?php
// Enable error reporting for debugging
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Set headers for JSON response
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

// Include database connection
require_once 'db_connection.php';

try {
    // Query to get unique categories
    $query = "SELECT DISTINCT category FROM products WHERE category IS NOT NULL AND category != '' ORDER BY category";
    $result = mysqli_query($conn, $query);
    
    if (!$result) {
        throw new Exception("Query failed: " . mysqli_error($conn));
    }
    
    // Fetch categories
    $categories = [];
    while ($row = mysqli_fetch_assoc($result)) {
        $categories[] = $row['category'];
    }
    
    // Log the categories found
    error_log("Categories found: " . count($categories));
    
    // Return JSON response
    echo json_encode([
        'success' => true,
        'categories' => $categories
    ]);
    
} catch (Exception $e) {
    // Log the error
    error_log("Error in fetch_categories.php: " . $e->getMessage());
    
    // Return error response
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
} finally {
    // Close connection
    mysqli_close($conn);
}
?>

