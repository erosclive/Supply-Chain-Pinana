<?php
header('Content-Type: application/json');
require_once 'config.php';

// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Invalid request method']);
    exit;
}

try {
    // Get POST data
    $material_id = $_POST['material_id'] ?? '';
    $usage_amount = floatval($_POST['usage_amount'] ?? 0);
    $production_batch = $_POST['production_batch'] ?? '';
    $usage_notes = $_POST['usage_notes'] ?? '';
    
    // Validate input
    if (empty($material_id) || $usage_amount <= 0) {
        throw new Exception('Invalid material ID or usage amount');
    }
    
    // Convert usage amount to base unit
    $base_usage_amount = convertToBaseUnit($material_id, $usage_amount);
    
    // Start transaction
    $pdo->beginTransaction();
    
    // Get material details
    $stmt = $pdo->prepare("
        SELECT m.*, 
               COALESCE(SUM(b.quantity), 0) as total_quantity,
               m.measurement_type,
               m.unit_measurement,
               m.pieces_per_container,
               m.allow_partial_usage,
               m.minimum_usage_unit,
               m.base_unit,
               m.opened_containers,
               m.remaining_in_opened
        FROM raw_materials m
        LEFT JOIN material_batches b ON m.id = b.material_id
        WHERE m.id = ? AND m.deleted_at IS NULL
        GROUP BY m.id
    ");
    $stmt->execute([$material_id]);
    $material = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$material) {
        throw new Exception('Material not found');
    }
    
    // Check if enough material is available
    if ($usage_amount > $material['total_quantity']) {
        throw new Exception('Insufficient material available. Available: ' . $material['total_quantity'] . ' ' . $material['measurement_type']);
    }
    
    // Check partial usage restrictions
    if (!$material['allow_partial_usage'] && fmod($usage_amount, 1) !== 0.0) {
        throw new Exception('Partial usage is not allowed for this material');
    }
    
    // Check minimum usage unit
    if ($usage_amount < $material['minimum_usage_unit']) {
        throw new Exception('Usage amount is below minimum usage unit of ' . $material['minimum_usage_unit']);
    }
    
    // Handle different measurement types
    $usage_result = handleMaterialUsage($material, $usage_amount, $pdo);
    
    // Calculate cost
    $total_cost = calculateUsageCost($material_id, $usage_amount, $pdo);
    
    // Log the usage
    $stmt = $pdo->prepare("
        INSERT INTO material_usage_log 
        (material_id, usage_amount, base_unit_amount, cost_used, production_batch, usage_notes, usage_date, created_at) 
        VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())
    ");
    $stmt->execute([
        $material_id,
        $usage_amount,
        $base_usage_amount,
        $total_cost,
        $production_batch,
        $usage_notes
    ]);
    
    // Update material containers if applicable
    if ($material['measurement_type'] !== 'Unit' && $material['measurement_type'] !== 'Bulk') {
        updateMaterialContainers($material, $usage_amount, $pdo);
    }
    
    // Commit transaction
    $pdo->commit();
    
    echo json_encode([
        'success' => true,
        'message' => 'Material usage recorded successfully',
        'usage_details' => [
            'material_name' => $material['name'],
            'amount_used' => $usage_amount,
            'unit' => $material['measurement_type'],
            'cost' => $total_cost,
            'remaining' => $material['total_quantity'] - $usage_amount,
            'production_batch' => $production_batch
        ]
    ]);
    
} catch (Exception $e) {
    // Rollback transaction on error
    if ($pdo->inTransaction()) {
        $pdo->rollback();
    }
    
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}

/**
 * Convert usage amount to base unit for consistent tracking
 */
function convertToBaseUnit($material_id, $usage_amount) {
    global $pdo;
    
    try {
        // Get material measurement details
        $stmt = $pdo->prepare("
            SELECT measurement_type, unit_measurement, pieces_per_container, base_unit
            FROM raw_materials 
            WHERE id = ?
        ");
        $stmt->execute([$material_id]);
        $material = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$material) {
            throw new Exception('Material not found for conversion');
        }
        
        $base_amount = $usage_amount;
        
        switch ($material['measurement_type']) {
            case 'Dozen':
                // Convert dozen to pieces
                $base_amount = $usage_amount * 12;
                break;
                
            case 'Pack':
            case 'Box':
                // Convert containers to pieces
                if ($material['pieces_per_container']) {
                    $base_amount = $usage_amount * $material['pieces_per_container'];
                }
                break;
                
            case 'Unit':
                // Handle weight/volume conversions
                $base_amount = convertWeightVolumeToBase($usage_amount, $material['unit_measurement'], $material['base_unit']);
                break;
                
            case 'Bulk':
                // Handle bulk conversions
                $base_amount = convertWeightVolumeToBase($usage_amount, $material['unit_measurement'], $material['base_unit']);
                break;
                
            case 'Pieces':
            default:
                // Already in base unit (pieces)
                $base_amount = $usage_amount;
                break;
        }
        
        return $base_amount;
        
    } catch (Exception $e) {
        error_log("Conversion error: " . $e->getMessage());
        return $usage_amount; // Fallback to original amount
    }
}

/**
 * Convert weight/volume units to base unit
 */
function convertWeightVolumeToBase($amount, $from_unit, $base_unit) {
    // Conversion factors to grams (for weight) and milliliters (for volume)
    $weight_conversions = [
        'kg' => 1000,
        'g' => 1,
        'lb' => 453.592,
        'oz' => 28.3495
    ];
    
    $volume_conversions = [
        'L' => 1000,
        'ml' => 1,
        'gal' => 3785.41,
        'fl_oz' => 29.5735
    ];
    
    // Determine if it's weight or volume
    if (isset($weight_conversions[$from_unit]) && isset($weight_conversions[$base_unit])) {
        // Weight conversion
        $base_grams = $amount * $weight_conversions[$from_unit];
        return $base_grams / $weight_conversions[$base_unit];
    } elseif (isset($volume_conversions[$from_unit]) && isset($volume_conversions[$base_unit])) {
        // Volume conversion
        $base_ml = $amount * $volume_conversions[$from_unit];
        return $base_ml / $volume_conversions[$base_unit];
    }
    
    // No conversion needed or unknown units
    return $amount;
}

/**
 * Handle material usage based on measurement type
 */
function handleMaterialUsage($material, $usage_amount, $pdo) {
    switch ($material['measurement_type']) {
        case 'Unit':
        case 'Bulk':
            return handleBulkUsage($material, $usage_amount, $pdo);
            
        case 'Dozen':
        case 'Pack':
        case 'Box':
        case 'Pieces':
            return handleContainerUsage($material, $usage_amount, $pdo);
            
        default:
            throw new Exception('Unknown measurement type: ' . $material['measurement_type']);
    }
}

/**
 * Handle bulk material usage (weight/volume based)
 */
function handleBulkUsage($material, $usage_amount, $pdo) {
    // For bulk materials, we need to deduct from available batches
    // Use FIFO (First In, First Out) method
    
    $remaining_to_use = $usage_amount;
    $batches_used = [];
    
    // Get available batches ordered by date (FIFO)
    $stmt = $pdo->prepare("
        SELECT * FROM material_batches 
        WHERE material_id = ? AND quantity > 0 
        ORDER BY date_received ASC, id ASC
    ");
    $stmt->execute([$material['id']]);
    $batches = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    foreach ($batches as $batch) {
        if ($remaining_to_use <= 0) break;
        
        $batch_available = floatval($batch['quantity']);
        $use_from_batch = min($remaining_to_use, $batch_available);
        
        // Update batch quantity
        $new_quantity = $batch_available - $use_from_batch;
        $stmt = $pdo->prepare("UPDATE material_batches SET quantity = ? WHERE id = ?");
        $stmt->execute([$new_quantity, $batch['id']]);
        
        $batches_used[] = [
            'batch_id' => $batch['id'],
            'batch_number' => $batch['batch_number'],
            'amount_used' => $use_from_batch,
            'remaining_in_batch' => $new_quantity
        ];
        
        $remaining_to_use -= $use_from_batch;
    }
    
    if ($remaining_to_use > 0) {
        throw new Exception('Insufficient material in batches. Missing: ' . $remaining_to_use);
    }
    
    return [
        'type' => 'bulk',
        'batches_used' => $batches_used,
        'total_used' => $usage_amount
    ];
}

/**
 * Handle container-based material usage
 */
function handleContainerUsage($material, $usage_amount, $pdo) {
    $pieces_per_container = $material['pieces_per_container'] ?? 1;
    
    // Calculate pieces needed
    $pieces_needed = 0;
    switch ($material['measurement_type']) {
        case 'Dozen':
            $pieces_needed = $usage_amount * 12;
            break;
        case 'Pack':
        case 'Box':
            $pieces_needed = $usage_amount * $pieces_per_container;
            break;
        case 'Pieces':
            $pieces_needed = $usage_amount;
            break;
    }
    
    // Update container tracking
    $opened_containers = intval($material['opened_containers'] ?? 0);
    $remaining_in_opened = floatval($material['remaining_in_opened'] ?? 0);
    
    $pieces_from_opened = min($pieces_needed, $remaining_in_opened);
    $remaining_pieces_needed = $pieces_needed - $pieces_from_opened;
    
    // Update remaining in opened container
    $new_remaining_in_opened = $remaining_in_opened - $pieces_from_opened;
    
    // Calculate how many new containers need to be opened
    $new_containers_to_open = 0;
    if ($remaining_pieces_needed > 0) {
        $new_containers_to_open = ceil($remaining_pieces_needed / $pieces_per_container);
        $pieces_from_last_container = $remaining_pieces_needed % $pieces_per_container;
        
        if ($pieces_from_last_container == 0) {
            $pieces_from_last_container = $pieces_per_container;
        }
        
        $new_remaining_in_opened = $pieces_per_container - $pieces_from_last_container;
        $opened_containers += $new_containers_to_open;
    }
    
    // Update material container tracking
    $stmt = $pdo->prepare("
        UPDATE raw_materials 
        SET opened_containers = ?, remaining_in_opened = ?
        WHERE id = ?
    ");
    $stmt->execute([$opened_containers, $new_remaining_in_opened, $material['id']]);
    
    // Update batch quantities using FIFO
    $remaining_to_deduct = $usage_amount;
    $stmt = $pdo->prepare("
        SELECT * FROM material_batches 
        WHERE material_id = ? AND quantity > 0 
        ORDER BY date_received ASC, id ASC
    ");
    $stmt->execute([$material['id']]);
    $batches = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    foreach ($batches as $batch) {
        if ($remaining_to_deduct <= 0) break;
        
        $batch_available = floatval($batch['quantity']);
        $use_from_batch = min($remaining_to_deduct, $batch_available);
        
        $new_quantity = $batch_available - $use_from_batch;
        $stmt = $pdo->prepare("UPDATE material_batches SET quantity = ? WHERE id = ?");
        $stmt->execute([$new_quantity, $batch['id']]);
        
        $remaining_to_deduct -= $use_from_batch;
    }
    
    return [
        'type' => 'container',
        'pieces_used' => $pieces_needed,
        'containers_opened' => $new_containers_to_open,
        'remaining_in_opened' => $new_remaining_in_opened,
        'total_opened_containers' => $opened_containers
    ];
}

/**
 * Calculate the cost of material usage
 */
function calculateUsageCost($material_id, $usage_amount, $pdo) {
    // Get batches ordered by date (FIFO costing)
    $stmt = $pdo->prepare("
        SELECT quantity, cost FROM material_batches 
        WHERE material_id = ? AND quantity > 0 
        ORDER BY date_received ASC, id ASC
    ");
    $stmt->execute([$material_id]);
    $batches = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    $total_cost = 0;
    $remaining_to_cost = $usage_amount;
    
    foreach ($batches as $batch) {
        if ($remaining_to_cost <= 0) break;
        
        $batch_quantity = floatval($batch['quantity']);
        $batch_cost = floatval($batch['cost']);
        $unit_cost = $batch_quantity > 0 ? $batch_cost / $batch_quantity : 0;
        
        $use_from_batch = min($remaining_to_cost, $batch_quantity);
        $cost_from_batch = $use_from_batch * $unit_cost;
        
        $total_cost += $cost_from_batch;
        $remaining_to_cost -= $use_from_batch;
    }
    
    return round($total_cost, 2);
}

/**
 * Update material container information
 */
function updateMaterialContainers($material, $usage_amount, $pdo) {
    // This function handles the container tracking updates
    // Already handled in handleContainerUsage, but kept for compatibility
    return true;
}
?>