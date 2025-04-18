<?php
// Include database connection
require_once 'db_connection.php';

// Set header to return JSON
header('Content-Type: application/json');

try {
    // Query to get retailers from users table
    $query = "SELECT u.id, u.email, u.full_name, r.phone, r.business_name 
              FROM users u 
              JOIN retailers r ON u.user_id = r.user_id 
              WHERE u.role = 'retailer' AND u.is_active = 1
              ORDER BY u.full_name ASC";
    
    $result = $conn->query($query);
    
    if (!$result) {
        throw new Exception("Error executing query: " . $conn->error);
    }
    
    $retailers = [];
    while ($row = $result->fetch_assoc()) {
        $retailers[] = [
            'id' => $row['id'],
            'full_name' => $row['full_name'],
            'email' => $row['email'],
            'phone' => $row['phone'],
            'business_name' => $row['business_name']
        ];
    }
    
    echo json_encode([
        'success' => true,
        'retailers' => $retailers
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}

$conn->close();
?>
