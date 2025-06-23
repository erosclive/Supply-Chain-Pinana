<?php
// Include database connection
require_once 'db_connection.php';

// Set headers for JSON response
header('Content-Type: application/json');

try {
    // Check if supplier_id is provided to filter alternative suppliers
    $supplier_id = isset($_GET['supplier_id']) ? $_GET['supplier_id'] : null;
    
    // Get all regular suppliers
    $sql = "SELECT id, name FROM suppliers ORDER BY name ASC";
    $result = mysqli_query($conn, $sql);
    
    $suppliers = [];
    
    if (mysqli_num_rows($result) > 0) {
        while ($row = mysqli_fetch_assoc($result)) {
            $suppliers[] = [
                'id' => $row['id'],
                'name' => $row['name'],
                'type' => 'regular'
            ];
        }
    }
    
    // Get alternative suppliers
    $alt_sql = "SELECT id, name, supplier_id FROM supplier_alternatives ORDER BY name ASC";
    $alt_result = mysqli_query($conn, $alt_sql);
    
    $alternative_suppliers = [];
    
    if (mysqli_num_rows($alt_result) > 0) {
        while ($row = mysqli_fetch_assoc($alt_result)) {
            $alternative_suppliers[] = [
                'id' => $row['id'],
                'name' => $row['name'],
                'supplier_id' => $row['supplier_id'],
                'type' => 'alternative'
            ];
        }
    }
    
    echo json_encode([
        'success' => true, 
        'suppliers' => $suppliers,
        'alternative_suppliers' => $alternative_suppliers
    ]);
    
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
}

// Close connection
mysqli_close($conn);
?>
