<?php
// Enable error reporting for debugging
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Set headers for JSON response
header('Content-Type: application/json');

// Include database connection
require_once 'db_connection.php';

// Get request parameters
$year = isset($_GET['year']) ? $_GET['year'] : date('Y');
$month = isset($_GET['month']) ? $_GET['month'] : date('m');
$category = isset($_GET['category']) ? $_GET['category'] : '';

// Format category filter
$categoryFilter = $category ? "AND category = '" . mysqli_real_escape_string($conn, $category) . "'" : "";

// Log request parameters for debugging
error_log("Inventory Report - Year: $year, Month: $month, Category: $category");

// Prepare response data
$response = [
    'success' => true,
    'report_type' => 'inventory',
    'year' => $year,
    'month' => $month,
    'category' => $category,
    'data' => []
];

// Query to get inventory data
$query = "SELECT 
            p.id,
            p.product_id,
            p.product_name,
            p.category,
            p.stocks,
            p.price,
            p.expiration_date,
            p.batch_tracking,
            p.status,
            p.created_at,
            p.updated_at
          FROM 
            products p
          WHERE 
            1=1
            $categoryFilter
          ORDER BY 
            p.stocks ASC";

// Execute query
$result = mysqli_query($conn, $query);

if ($result === false) {
    echo json_encode([
        'success' => false,
        'message' => 'Query failed: ' . mysqli_error($conn)
    ]);
    exit;
}

// Fetch data
while ($row = mysqli_fetch_assoc($result)) {
    $response['data'][] = $row;
}

// If no data found, provide a helpful message
if (empty($response['data'])) {
    $response['message'] = 'No inventory data found for the selected criteria';
}

// Log the response size for debugging
error_log("Inventory report data count: " . count($response['data']));

// Close connection
mysqli_close($conn);

// Return JSON response
echo json_encode($response);
?>

