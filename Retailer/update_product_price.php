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

// Check if request is POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Invalid request method']);
    exit;
}

// Get POST data
$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['product_id']) || !isset($data['retail_price'])) {
    echo json_encode(['success' => false, 'message' => 'Missing required fields']);
    exit;
}

$retailer_id = $_SESSION['user_id'];
$product_id = $data['product_id'];
$retail_price = floatval($data['retail_price']);
$wholesale_price = isset($data['wholesale_price']) ? floatval($data['wholesale_price']) : null;

try {
    // Insert new price record
    $query = "INSERT INTO product_pricing 
              (retailer_id, product_id, retail_price, wholesale_price, last_updated) 
              VALUES (?, ?, ?, ?, NOW())";
    
    $stmt = $conn->prepare($query);
    $stmt->bind_param('isdd', $retailer_id, $product_id, $retail_price, $wholesale_price);
    
    if ($stmt->execute()) {
        // Get the updated price record
        $selectQuery = "SELECT retail_price, wholesale_price, last_updated 
                        FROM product_pricing 
                        WHERE retailer_id = ? AND product_id = ?
                        ORDER BY last_updated DESC
                        LIMIT 1";
        
        $selectStmt = $conn->prepare($selectQuery);
        $selectStmt->bind_param('is', $retailer_id, $product_id);
        $selectStmt->execute();
        $result = $selectStmt->get_result();
        
        if ($row = $result->fetch_assoc()) {
            echo json_encode([
                'success' => true,
                'message' => 'Price updated successfully',
                'price_data' => [
                    'retail_price' => $row['retail_price'],
                    'retail_price_formatted' => '₱' . number_format($row['retail_price'], 2),
                    'wholesale_price' => $row['wholesale_price'],
                    'wholesale_price_formatted' => '₱' . number_format($row['wholesale_price'], 2),
                    'last_updated' => $row['last_updated'],
                    'last_updated_formatted' => date('M d, Y H:i', strtotime($row['last_updated']))
                ]
            ]);
        } else {
            echo json_encode([
                'success' => true,
                'message' => 'Price updated successfully, but could not retrieve updated data'
            ]);
        }
    } else {
        throw new Exception($stmt->error);
    }
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Error updating price: ' . $e->getMessage()
    ]);
}
?>
