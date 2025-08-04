<?php
// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Include database connection
require_once 'db_connection.php';

// Set header to return JSON
header('Content-Type: application/json');

// Check database connection
if (!$conn) {
    echo json_encode([
        'success' => false,
        'message' => 'Database connection failed: ' . mysqli_connect_error(),
        'productions' => []
    ]);
    exit;
}

try {
    // Query to get all productions
    $query = "SELECT 
                id,
                production_id,
                product_id,
                product_name,
                category,
                batch_size,
                priority,
                status,
                progress,
                start_date,
                estimated_completion,
                actual_completion,
                estimated_duration_hours,
                actual_duration_hours,
                production_type,
                recipe_data,
                auto_create_product,
                target_price,
                price,
                target_expiration_days,
                notes,
                quality_status,
                quality_notes,
                created_at,
                updated_at
              FROM productions 
              WHERE status != 'completed' AND status != 'cancelled'
              ORDER BY created_at DESC";
    
    $result = mysqli_query($conn, $query);
    
    if (!$result) {
        throw new Exception("Query failed: " . mysqli_error($conn));
    }
    
    $productions = [];
    while ($row = mysqli_fetch_assoc($result)) {
        // Parse recipe data if it exists
        $recipeData = [];
        if (!empty($row['recipe_data'])) {
            $recipeData = json_decode($row['recipe_data'], true) ?: [];
        }
        
        // Format the production data for frontend
        $production = [
            'id' => intval($row['id']),
            'production_id' => $row['production_id'],
            'product_id' => $row['product_id'],
            'product_name' => $row['product_name'],
            'category' => $row['category'],
            'batch_size' => intval($row['batch_size']),
            'priority' => $row['priority'] ?: 'normal',
            'status' => $row['status'],
            'progress' => floatval($row['progress']),
            'start_date' => $row['start_date'],
            'estimated_completion' => $row['estimated_completion'],
            'actual_completion' => $row['actual_completion'],
            'estimated_duration_hours' => isset($row['estimated_duration_hours']) ? intval($row['estimated_duration_hours']) : null,
            'production_type' => $row['production_type'],
            'recipe_data' => $recipeData,
            'target_price' => floatval($row['target_price'] ?: 0),
            'price' => isset($row['price']) ? floatval($row['price']) : 0,
            'notes' => $row['notes'],
            'quality_status' => $row['quality_status'],
            'created_at' => $row['created_at'],
            'updated_at' => $row['updated_at'],
            // Add assigned_to for frontend compatibility
            'assigned_to' => 'Production Team'
        ];
        
        $productions[] = $production;
    }
    
    echo json_encode([
        'success' => true,
        'message' => 'Productions loaded successfully',
        'productions' => $productions,
        'count' => count($productions)
    ]);
    
} catch (Exception $e) {
    error_log("Error fetching productions: " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => 'Error fetching productions: ' . $e->getMessage(),
        'productions' => []
    ]);
}
?>
