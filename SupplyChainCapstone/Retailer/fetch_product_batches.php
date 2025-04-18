<?php
// Include database connection
require_once 'db_connection.php';

// Set header to return JSON
header('Content-Type: application/json');

// Get product ID from request
$product_id = isset($_GET['product_id']) ? $_GET['product_id'] : null;

if (!$product_id) {
    echo json_encode([
        'success' => false,
        'message' => 'Product ID is required'
    ]);
    exit;
}

try {
    // Query to get batches for the product
    $query = "SELECT pb.batch_id, pb.batch_code, pb.quantity, pb.expiration_date, pb.manufacturing_date
              FROM product_batches pb
              WHERE pb.product_id = ?
              AND pb.quantity > 0
              ORDER BY pb.expiration_date ASC";
    
    $stmt = $conn->prepare($query);
    $stmt->bind_param("s", $product_id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if (!$result) {
        throw new Exception("Error executing query: " . $conn->error);
    }
    
    $batches = [];
    while ($row = $result->fetch_assoc()) {
        // Determine expiry status
        $expiryStatus = 'good';
        if ($row['expiration_date'] != '0000-00-00') {
            $today = new DateTime();
            $expiryDate = new DateTime($row['expiration_date']);
            $diff = $today->diff($expiryDate);
            
            if ($expiryDate < $today) {
                $expiryStatus = 'expired';
            } elseif ($diff->days <= 30) {
                $expiryStatus = 'expiring-soon';
            }
        }
        
        $row['expiry_status'] = $expiryStatus;
        $batches[] = $row;
    }
    
    echo json_encode([
        'success' => true,
        'batches' => $batches
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}

$stmt->close();
$conn->close();
?>
