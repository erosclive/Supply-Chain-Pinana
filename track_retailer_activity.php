<?php
// Include database connection
require_once 'db_connection.php';

// This script can be run via cron job to update retailer activity statistics

// Set headers for CLI or web output
if (php_sapi_name() !== 'cli') {
    header('Content-Type: application/json');
}

// Calculate date ranges
$now = date('Y-m-d H:i:s');
$sevenDaysAgo = date('Y-m-d H:i:s', strtotime('-7 days'));
$thirtyDaysAgo = date('Y-m-d H:i:s', strtotime('-30 days'));
$ninetyDaysAgo = date('Y-m-d H:i:s', strtotime('-90 days'));

// Create retailer_activity table if it doesn't exist
$createTableSql = "CREATE TABLE IF NOT EXISTS retailer_activity (
    id INT AUTO_INCREMENT PRIMARY KEY,
    retailer_id INT NOT NULL,
    last_order_date DATETIME NULL,
    orders_7_days INT DEFAULT 0,
    orders_30_days INT DEFAULT 0,
    orders_90_days INT DEFAULT 0,
    total_orders INT DEFAULT 0,
    total_order_value DECIMAL(10,2) DEFAULT 0.00,
    is_active TINYINT(1) DEFAULT 0,
    last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY (retailer_id)
)";

$conn->query($createTableSql);

// Get all retailers
$retailersSql = "SELECT id FROM users WHERE role = 'retailer'";
$retailersResult = $conn->query($retailersSql);

$updatedCount = 0;
$errors = [];

if ($retailersResult) {
    while ($retailer = $retailersResult->fetch_assoc()) {
        $retailerId = $retailer['id'];
        
        // Get retailer order statistics
        $statsSql = "SELECT 
            MAX(created_at) as last_order_date,
            COUNT(*) as total_orders,
            SUM(total_amount) as total_order_value,
            SUM(IF(created_at >= '$sevenDaysAgo', 1, 0)) as orders_7_days,
            SUM(IF(created_at >= '$thirtyDaysAgo', 1, 0)) as orders_30_days,
            SUM(IF(created_at >= '$ninetyDaysAgo', 1, 0)) as orders_90_days
            FROM retailer_orders 
            WHERE retailer_id = $retailerId";
        
        $statsResult = $conn->query($statsSql);
        
        if ($statsResult && $stats = $statsResult->fetch_assoc()) {
            // Determine if retailer is active (has orders in last 7 days)
            $isActive = ($stats['orders_7_days'] > 0) ? 1 : 0;
            
            // Insert or update retailer activity
            $upsertSql = "INSERT INTO retailer_activity 
                (retailer_id, last_order_date, orders_7_days, orders_30_days, orders_90_days, 
                total_orders, total_order_value, is_active, last_updated) 
                VALUES 
                ($retailerId, " . 
                ($stats['last_order_date'] ? "'" . $stats['last_order_date'] . "'" : "NULL") . ", " .
                intval($stats['orders_7_days']) . ", " .
                intval($stats['orders_30_days']) . ", " .
                intval($stats['orders_90_days']) . ", " .
                intval($stats['total_orders']) . ", " .
                floatval($stats['total_order_value']) . ", " .
                $isActive . ", '$now')
                ON DUPLICATE KEY UPDATE 
                last_order_date = " . ($stats['last_order_date'] ? "'" . $stats['last_order_date'] . "'" : "NULL") . ",
                orders_7_days = " . intval($stats['orders_7_days']) . ",
                orders_30_days = " . intval($stats['orders_30_days']) . ",
                orders_90_days = " . intval($stats['orders_90_days']) . ",
                total_orders = " . intval($stats['total_orders']) . ",
                total_order_value = " . floatval($stats['total_order_value']) . ",
                is_active = $isActive,
                last_updated = '$now'";
            
            if ($conn->query($upsertSql)) {
                $updatedCount++;
            } else {
                $errors[] = "Error updating retailer ID $retailerId: " . $conn->error;
            }
        } else {
            $errors[] = "Error fetching stats for retailer ID $retailerId: " . $conn->error;
        }
    }
}

// Output results
$result = [
    'success' => count($errors) === 0,
    'updated_count' => $updatedCount,
    'total_retailers' => $retailersResult ? $retailersResult->num_rows : 0,
    'timestamp' => $now
];

if (count($errors) > 0) {
    $result['errors'] = $errors;
}

if (php_sapi_name() === 'cli') {
    echo "Activity tracking completed.\n";
    echo "Updated $updatedCount retailers.\n";
    if (count($errors) > 0) {
        echo "Errors: " . count($errors) . "\n";
        foreach ($errors as $error) {
            echo "- $error\n";
        }
    }
} else {
    echo json_encode($result);
}

// Close database connection
$conn->close();
?>
