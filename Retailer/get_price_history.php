<?php
// Start session and include database connection
session_start();
require_once 'db_connection.php';

// Set header to return JSON
header('Content-Type: application/json');

// Check if user is logged in
if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'User not logged in']);
    exit;
}

// Check if product_id is provided
if (!isset($_GET['product_id'])) {
    echo json_encode(['success' => false, 'message' => 'Product ID is required']);
    exit;
}

$retailer_id = $_SESSION['user_id'];
$product_id = $_GET['product_id'];

try {
    // Get price history for this product
    $query = "SELECT 
                pp.pricing_id,
                pp.retail_price,
                pp.wholesale_price,
                pp.last_updated,
                p.product_name,
                p.product_id
              FROM 
                product_pricing pp
              JOIN
                products p ON pp.product_id = p.product_id
              WHERE 
                pp.retailer_id = ? AND pp.product_id = ?
              ORDER BY 
                pp.last_updated DESC
              LIMIT 10";
    
    $stmt = $conn->prepare($query);
    $stmt->bind_param('is', $retailer_id, $product_id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $history = [];
    $product_name = '';
    
    while ($row = $result->fetch_assoc()) {
        $product_name = $row['product_name'];
        
        $history[] = [
            'pricing_id' => $row['pricing_id'],
            'retail_price' => $row['retail_price'],
            'retail_price_formatted' => '₱' . number_format($row['retail_price'], 2),
            'wholesale_price' => $row['wholesale_price'],
            'wholesale_price_formatted' => '₱' . number_format($row['wholesale_price'], 2),
            'last_updated' => $row['last_updated'],
            'last_updated_formatted' => date('M d, Y h:i A', strtotime($row['last_updated']))
        ];
    }
    
    echo json_encode([
        'success' => true,
        'product_id' => $product_id,
        'product_name' => $product_name,
        'history' => $history
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Error: ' . $e->getMessage()
    ]);
}
?>
