<?php
header('Content-Type: application/json');
include 'db_connection.php';

try {
    $production_id = $_GET['production_id'] ?? '';
    
    if (empty($production_id)) {
        echo json_encode(['error' => 'Production ID is required']);
        exit;
    }

    // Get production details
    $prod_sql = "SELECT * FROM productions WHERE production_id = ?";
    $prod_stmt = $conn->prepare($prod_sql);
    $prod_stmt->bind_param("s", $production_id);
    $prod_stmt->execute();
    $production = $prod_stmt->get_result()->fetch_assoc();
    
    if (!$production) {
        echo json_encode(['error' => 'Production not found']);
        exit;
    }

    // Check material availability
    $availability_sql = "SELECT 
                            pm.id as production_material_id,
                            pm.material_id,
                            pm.required_quantity,
                            pm.required_unit,
                            pm.estimated_cost,
                            pm.status as material_status,
                            rm.name as material_name,
                            rm.category as material_category,
                            rm.quantity as available_quantity,
                            rm.unit as available_unit,
                            rm.cost as current_unit_cost,
                            rm.minimum_stock,
                            rm.status as stock_status,
                            CASE 
                                WHEN rm.quantity >= pm.required_quantity THEN 'Available'
                                WHEN rm.quantity > 0 THEN 'Insufficient'
                                ELSE 'Out of Stock'
                            END as availability_status,
                            (pm.required_quantity - rm.quantity) as shortage_quantity,
                            (pm.required_quantity * rm.cost) as total_cost
                        FROM production_materials pm
                        JOIN raw_materials rm ON pm.material_id = rm.id
                        WHERE pm.production_id = ?
                        ORDER BY 
                            CASE 
                                WHEN rm.quantity >= pm.required_quantity THEN 1
                                WHEN rm.quantity > 0 THEN 2
                                ELSE 3
                            END,
                            pm.id";
    
    $stmt = $conn->prepare($availability_sql);
    $stmt->bind_param("i", $production['id']);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $materials = [];
    $total_cost = 0;
    $available_materials = 0;
    $insufficient_materials = 0;
    $out_of_stock_materials = 0;
    
    while ($row = $result->fetch_assoc()) {
        // Add status indicators
        $row['is_available'] = $row['availability_status'] === 'Available';
        $row['is_insufficient'] = $row['availability_status'] === 'Insufficient';
        $row['is_out_of_stock'] = $row['availability_status'] === 'Out of Stock';
        $row['is_low_stock'] = $row['available_quantity'] <= $row['minimum_stock'];
        
        // Calculate percentages
        $row['availability_percentage'] = $row['required_quantity'] > 0 ? 
            min(100, ($row['available_quantity'] / $row['required_quantity']) * 100) : 0;
        
        // Count by status
        switch ($row['availability_status']) {
            case 'Available':
                $available_materials++;
                break;
            case 'Insufficient':
                $insufficient_materials++;
                break;
            case 'Out of Stock':
                $out_of_stock_materials++;
                break;
        }
        
        $total_cost += $row['total_cost'];
        $materials[] = $row;
    }
    
    // Calculate overall availability
    $total_materials = count($materials);
    $overall_availability = $total_materials > 0 ? 
        ($available_materials / $total_materials) * 100 : 0;
    
    // Determine production readiness
    $can_start_production = $out_of_stock_materials === 0;
    $has_warnings = $insufficient_materials > 0 || 
                   array_filter($materials, function($m) { return $m['is_low_stock']; });
    
    // Get alternative materials if any shortages
    $alternatives = [];
    if ($insufficient_materials > 0 || $out_of_stock_materials > 0) {
        $alt_sql = "SELECT 
                        rm.id,
                        rm.name,
                        rm.category,
                        rm.quantity,
                        rm.unit,
                        rm.cost,
                        rm.status
                    FROM raw_materials rm
                    WHERE rm.category IN (
                        SELECT DISTINCT rm2.category 
                        FROM production_materials pm2
                        JOIN raw_materials rm2 ON pm2.material_id = rm2.id
                        WHERE pm2.production_id = ?
                        AND rm2.quantity < pm2.required_quantity
                    )
                    AND rm.quantity > 0
                    AND rm.status = 'Available'
                    ORDER BY rm.category, rm.quantity DESC";
        
        $alt_stmt = $conn->prepare($alt_sql);
        $alt_stmt->bind_param("i", $production['id']);
        $alt_stmt->execute();
        $alt_result = $alt_stmt->get_result();
        
        while ($alt_row = $alt_result->fetch_assoc()) {
            $alternatives[] = $alt_row;
        }
    }
    
    echo json_encode([
        'success' => true,
        'production' => [
            'id' => $production['id'],
            'production_id' => $production['production_id'],
            'product_name' => $production['product_name'],
            'batch_size' => $production['batch_size'],
            'status' => $production['status']
        ],
        'materials' => $materials,
        'summary' => [
            'total_materials' => $total_materials,
            'available_materials' => $available_materials,
            'insufficient_materials' => $insufficient_materials,
            'out_of_stock_materials' => $out_of_stock_materials,
            'overall_availability' => round($overall_availability, 1),
            'total_estimated_cost' => $total_cost,
            'can_start_production' => $can_start_production,
            'has_warnings' => $has_warnings
        ],
        'alternatives' => $alternatives,
        'recommendations' => [
            'can_proceed' => $can_start_production,
            'message' => $can_start_production ? 
                'All materials are available. Production can start.' :
                'Some materials are out of stock. Please restock before starting production.',
            'actions' => $can_start_production ? [] : [
                'Restock out-of-stock materials',
                'Consider alternative materials',
                'Adjust batch size if possible'
            ]
        ]
    ]);
    
} catch (Exception $e) {
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}

$conn->close();
?>
