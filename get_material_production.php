<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

try {
    require_once 'db_connection.php';

    // Fetch raw materials with their basic information
    $rawMaterialsQuery = "
        SELECT 
            rm.id,
            rm.material_id,
            rm.name,
            rm.category,
            rm.quantity,
            rm.measurement_type,
            rm.unit_measurement,
            rm.base_unit,
            rm.pieces_per_container,
            rm.cost,
            rm.supplier_id,
            rm.date_received,
            rm.expiry_date,
            rm.container_status,
            rm.opened_containers,
            rm.remaining_in_opened,
            'raw_material' as source_type,
            NULL as batch_number,
            NULL as batch_id
        FROM raw_materials rm 
        WHERE rm.quantity > 0
        ORDER BY rm.name ASC
    ";

    // Fetch material batches with their information
    $batchMaterialsQuery = "
        SELECT 
            mb.id,
            mb.material_id,
            rm.name,
            rm.category,
            mb.quantity,
            rm.measurement_type,
            rm.unit_measurement,
            rm.base_unit,
            rm.pieces_per_container,
            mb.cost,
            rm.supplier_id,
            mb.date_received,
            mb.expiry_date,
            rm.container_status,
            rm.opened_containers,
            rm.remaining_in_opened,
            'material_batch' as source_type,
            mb.batch_number,
            mb.id as batch_id
        FROM material_batches mb
        LEFT JOIN raw_materials rm ON mb.material_id = rm.material_id
        WHERE mb.quantity > 0
        ORDER BY rm.name ASC, mb.batch_number ASC
    ";

    // Execute queries
    $rawMaterialsResult = mysqli_query($conn, $rawMaterialsQuery);
    $batchMaterialsResult = mysqli_query($conn, $batchMaterialsQuery);

    if (!$rawMaterialsResult || !$batchMaterialsResult) {
        throw new Exception("Database query failed: " . mysqli_error($conn));
    }

    $materials = [];

    // Process raw materials
    while ($row = mysqli_fetch_assoc($rawMaterialsResult)) {
        // Calculate effective cost per unit
        $effectiveCost = calculateEffectiveCost($row);
        
        // Determine available quantity
        $availableQuantity = calculateAvailableQuantity($row);
        
        // Check expiry status
        $expiryStatus = checkExpiryStatus($row['expiry_date']);
        
        $materials[] = [
            'id' => 'raw_' . $row['id'],
            'material_id' => $row['material_id'],
            'name' => $row['name'],
            'category' => $row['category'],
            'quantity' => $availableQuantity,
            'measurement_type' => $row['measurement_type'] ?: $row['unit_measurement'],
            'base_unit' => $row['base_unit'],
            'pieces_per_container' => (int)$row['pieces_per_container'],
            'cost' => $effectiveCost,
            'supplier_id' => $row['supplier_id'],
            'date_received' => $row['date_received'],
            'expiry_date' => $row['expiry_date'],
            'expiry_status' => $expiryStatus,
            'source_type' => $row['source_type'],
            'batch_number' => null,
            'batch_id' => null,
            'container_status' => $row['container_status'],
            'opened_containers' => (int)$row['opened_containers'],
            'remaining_in_opened' => (float)$row['remaining_in_opened'],
            'display_name' => generateDisplayName($row, null)
        ];
    }



    // Sort materials by name and then by expiry date (fresher first)
    usort($materials, function($a, $b) {
        $nameComparison = strcmp($a['name'], $b['name']);
        if ($nameComparison !== 0) {
            return $nameComparison;
        }
        
        // If same material, prioritize by expiry date (fresher first)
        if ($a['expiry_date'] && $b['expiry_date']) {
            return strcmp($b['expiry_date'], $a['expiry_date']); // Reverse for fresher first
        }
        
        // If one has expiry and other doesn't, prioritize the one with expiry
        if ($a['expiry_date'] && !$b['expiry_date']) return -1;
        if (!$a['expiry_date'] && $b['expiry_date']) return 1;
        
        return 0;
    });

    // Group materials by category for better organization
    $categorizedMaterials = [];
    foreach ($materials as $material) {
        $category = $material['category'] ?: 'Uncategorized';
        if (!isset($categorizedMaterials[$category])) {
            $categorizedMaterials[$category] = [];
        }
        $categorizedMaterials[$category][] = $material;
    }

    echo json_encode([
        'success' => true,
        'materials' => $materials,
        'categorized_materials' => $categorizedMaterials,
        'total_count' => count($materials),
        'categories' => array_keys($categorizedMaterials)
    ]);

} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Error fetching materials: ' . $e->getMessage(),
        'materials' => [],
        'categorized_materials' => [],
        'total_count' => 0
    ]);
}

// Helper Functions

function calculateEffectiveCost($row) {
    $cost = (float)$row['cost'];
    $piecesPerContainer = (int)$row['pieces_per_container'];
    
    // If cost is per container and we have pieces per container, calculate per piece cost
    if ($piecesPerContainer > 0 && $row['measurement_type'] === 'pieces') {
        return $cost / $piecesPerContainer;
    }
    
    return $cost;
}

function calculateAvailableQuantity($row) {
    $totalQuantity = (float)$row['quantity'];
    $openedContainers = (int)$row['opened_containers'];
    $remainingInOpened = (float)$row['remaining_in_opened'];
    $piecesPerContainer = (int)$row['pieces_per_container'];
    
    // For container-based materials
    if ($piecesPerContainer > 0 && $row['container_status'] === 'unopened') {
        return $totalQuantity * $piecesPerContainer;
    }
    
    // For opened containers
    if ($openedContainers > 0 && $remainingInOpened > 0) {
        $unopenedQuantity = max(0, $totalQuantity - $openedContainers);
        if ($piecesPerContainer > 0) {
            return ($unopenedQuantity * $piecesPerContainer) + $remainingInOpened;
        } else {
            return $unopenedQuantity + $remainingInOpened;
        }
    }
    
    return $totalQuantity;
}

function checkExpiryStatus($expiryDate) {
    if (!$expiryDate || $expiryDate === '0000-00-00') {
        return 'no_expiry';
    }
    
    $today = new DateTime();
    $expiry = new DateTime($expiryDate);
    $interval = $today->diff($expiry);
    
    if ($expiry < $today) {
        return 'expired';
    } elseif ($interval->days <= 7) {
        return 'expiring_soon';
    } elseif ($interval->days <= 30) {
        return 'expiring_this_month';
    } else {
        return 'fresh';
    }
}

function generateDisplayName($row, $batchNumber = null) {
    $name = $row['name'];
    $quantity = calculateAvailableQuantity($row);
    $unit = $row['measurement_type'] ?: $row['unit_measurement'];
    $cost = calculateEffectiveCost($row);
    
    $displayName = $name;
    
    // Add batch number if available
    if ($batchNumber) {
        $displayName .= " (Batch: {$batchNumber})";
    }
    
    // Add quantity and unit
    $displayName .= " - {$quantity} {$unit}";
    
    // Add cost per unit
    $displayName .= " @ ₱" . number_format($cost, 2) . "/{$unit}";
    
    // Add expiry warning if applicable
    $expiryStatus = checkExpiryStatus($row['expiry_date']);
    if ($expiryStatus === 'expiring_soon') {
        $displayName .= " ⚠️ Expiring Soon";
    } elseif ($expiryStatus === 'expired') {
        $displayName .= " ❌ Expired";
    }
    
    return $displayName;
}
?>