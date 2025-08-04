<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

try {
    require_once 'db_connection.php';

    // Get product_id from request
    $product_id = isset($_GET['product_id']) ? $_GET['product_id'] : '';
    
    if (empty($product_id)) {
        echo json_encode([
            'success' => false,
            'message' => 'Product ID is required',
            'batches' => []
        ]);
        exit;
    }

    // Fetch all batches for the specific product
    $stmt = $conn->prepare("
        SELECT 
            batch_id,
            product_id,
            batch_code,
            quantity,
            expiration_date,
            manufacturing_date,
            unit_cost,
            created_at,
            updated_at,
            custom_duration_days,
            expiration_duration,
            custom_duration_value,
            custom_duration_unit
        FROM material_batches 
        WHERE product_id = ?
        ORDER BY created_at DESC
    ");
    
    $stmt->bind_param("s", $product_id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $batches = [];
    while ($row = $result->fetch_assoc()) {
        // Calculate days until expiration
        $daysUntilExpiration = null;
        if ($row['expiration_date'] && $row['expiration_date'] !== '0000-00-00') {
            $expirationDate = new DateTime($row['expiration_date']);
            $currentDate = new DateTime();
            $interval = $currentDate->diff($expirationDate);
            $daysUntilExpiration = $interval->invert ? -$interval->days : $interval->days;
        }
        
        // Determine batch status
        $status = 'Active';
        if ($daysUntilExpiration !== null) {
            if ($daysUntilExpiration < 0) {
                $status = 'Expired';
            } elseif ($daysUntilExpiration <= 7) {
                $status = 'Expiring Soon';
            }
        }
        
        $batches[] = [
            'batch_id' => (int)$row['batch_id'],
            'product_id' => $row['product_id'],
            'batch_code' => $row['batch_code'],
            'quantity' => (int)$row['quantity'],
            'expiration_date' => $row['expiration_date'],
            'manufacturing_date' => $row['manufacturing_date'],
            'unit_cost' => (float)$row['unit_cost'],
            'created_at' => $row['created_at'],
            'updated_at' => $row['updated_at'],
            'custom_duration_days' => $row['custom_duration_days'],
            'expiration_duration' => $row['expiration_duration'],
            'custom_duration_value' => $row['custom_duration_value'],
            'custom_duration_unit' => $row['custom_duration_unit'],
            'days_until_expiration' => $daysUntilExpiration,
            'status' => $status
        ];
    }

    echo json_encode([
        'success' => true,
        'product_id' => $product_id,
        'batches' => $batches,
        'count' => count($batches)
    ]);

} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Error fetching batches: ' . $e->getMessage(),
        'batches' => []
    ]);
}
?>