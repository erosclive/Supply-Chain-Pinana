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
    
    // Add Pineapple Supplier from fixed_pineapple_supplier
    $pineapple_sql = "SELECT * FROM fixed_pineapple_supplier LIMIT 1";
    $pineapple_result = mysqli_query($conn, $pineapple_sql);
    if ($pineapple_result && mysqli_num_rows($pineapple_result) > 0) {
        $pineapple = mysqli_fetch_assoc($pineapple_result);
        $suppliers[] = [
            'id' => 'fixed-pineapple',
            'name' => $pineapple['name'],
            'type' => 'pineapple',
            'contact_info' => $pineapple['contact_info'],
            'farm_location' => $pineapple['farm_location'],
            'delivery_info' => $pineapple['delivery_info'],
            'communication_mode' => $pineapple['communication_mode'],
            'notes' => $pineapple['notes'],
            'harvest_season' => $pineapple['harvest_season'],
            'planting_cycle' => $pineapple['planting_cycle'],
            'variety' => $pineapple['variety'],
            'shelf_life' => $pineapple['shelf_life'],
            'created_at' => $pineapple['created_at'],
            'updated_at' => $pineapple['updated_at']
        ];
    }
    
    // Get alternative suppliers (including for Pineapple Supplier)
    $alt_sql = "SELECT id, name, supplier_id, is_fixed_pineapple FROM supplier_alternatives ORDER BY name ASC";
    $alt_result = mysqli_query($conn, $alt_sql);
    
    $alternative_suppliers = [];
    
    if (mysqli_num_rows($alt_result) > 0) {
        while ($row = mysqli_fetch_assoc($alt_result)) {
            $alternative_suppliers[] = [
                'id' => $row['id'],
                'name' => $row['name'],
                'supplier_id' => $row['supplier_id'],
                'type' => ($row['is_fixed_pineapple'] == 1 ? 'pineapple' : 'alternative'),
                'is_fixed_pineapple' => $row['is_fixed_pineapple']
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
