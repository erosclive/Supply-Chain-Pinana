<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0);
}

try {
    // Use the existing database connection from get_products_track.php structure
    require_once 'db_connection.php';

    // Query to get products with additional information - matching your existing structure
    $stmt = $conn->prepare("
        SELECT 
            id, 
            product_id, 
            product_name AS name, 
            category, 
            stocks, 
            price, 
            batch_tracking,
            status,
            product_photo,
            expiration_date,
            created_at,
            updated_at
        FROM products 
        WHERE status IN ('In Stock', 'Low Stock', 'Out of Stock')
        ORDER BY 
            CASE 
                WHEN status = 'In Stock' THEN 1
                WHEN status = 'Low Stock' THEN 2
                WHEN status = 'Out of Stock' THEN 3
                ELSE 4
            END,
            product_name ASC
    ");
    $stmt->execute();
    
    $result = $stmt->get_result();
    $products = [];
    while ($row = $result->fetch_assoc()) {
        // Get latest batch information if batch tracking is enabled
        $latestBatch = null;
        if ((int)$row['batch_tracking'] === 1) {
            $batchStmt = $conn->prepare("
                SELECT 
                    batch_code,
                    manufacturing_date,
                    expiration_date,
                    custom_duration_days,
                    expiration_duration,
                    custom_duration_value,
                    custom_duration_unit,
                    created_at
                FROM product_batches 
                WHERE product_id = ? 
                ORDER BY created_at DESC 
                LIMIT 1
            ");
            $batchStmt->bind_param("s", $row['product_id']);
            $batchStmt->execute();
            $batchResult = $batchStmt->get_result();
            $latestBatch = $batchResult->fetch_assoc();
        }

        $products[] = [
            'id' => (int)$row['id'],
            'product_id' => $row['product_id'],
            'name' => $row['name'],
            'product_name' => $row['name'], // For compatibility
            'category' => $row['category'],
            'stocks' => (int)$row['stocks'],
            'price' => (float)$row['price'],
            'batch_tracking' => (int)$row['batch_tracking'],
            'status' => $row['status'],
            'product_photo' => $row['product_photo'],
            'expiration_date' => $row['expiration_date'],
            'created_at' => $row['created_at'],
            'updated_at' => $row['updated_at'],
            'latest_batch' => $latestBatch
        ];
    }
    
    // Format the response
    $response = [
        'success' => true,
        'products' => $products,
        'count' => count($products),
        'message' => 'Products loaded successfully'
    ];
    
    echo json_encode($response);
    
} catch (PDOException $e) {
    // Database error
    $response = [
        'success' => false,
        'products' => [],
        'count' => 0,
        'message' => 'Database error: ' . $e->getMessage()
    ];
    
    echo json_encode($response);
    
} catch (Exception $e) {
    // General error
    $response = [
        'success' => false,
        'products' => [],
        'count' => 0,
        'message' => 'Error: ' . $e->getMessage()
    ];
    
    echo json_encode($response);
}
?>
