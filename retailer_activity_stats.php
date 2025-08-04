<?php
// Include database connection
require_once 'db_connection.php';

// Set headers for JSON response
header('Content-Type: application/json');

// Get summary statistics
$statsSql = "SELECT 
    COUNT(*) as total_retailers,
    SUM(IF(is_active = 1, 1, 0)) as active_retailers,
    SUM(IF(is_active = 0, 1, 0)) as inactive_retailers,
    SUM(orders_7_days) as total_orders_7_days,
    SUM(orders_30_days) as total_orders_30_days,
    SUM(total_orders) as all_time_orders,
    SUM(total_order_value) as all_time_value,
    MAX(last_updated) as last_updated
    FROM retailer_activity";

$statsResult = $conn->query($statsSql);

// Get top active retailers
$topRetailersSql = "SELECT 
    ra.retailer_id,
    u.username,
    rp.first_name,
    rp.last_name,
    rp.business_name,
    ra.orders_7_days,
    ra.orders_30_days,
    ra.total_orders,
    ra.total_order_value,
    ra.last_order_date
    FROM retailer_activity ra
    JOIN users u ON ra.retailer_id = u.id
    JOIN retailer_profiles rp ON ra.retailer_id = rp.user_id
    WHERE ra.is_active = 1
    ORDER BY ra.orders_7_days DESC, ra.total_order_value DESC
    LIMIT 10";

$topRetailersResult = $conn->query($topRetailersSql);

// Get inactive retailers
$inactiveRetailersSql = "SELECT 
    ra.retailer_id,
    u.username,
    rp.first_name,
    rp.last_name,
    rp.business_name,
    ra.total_orders,
    ra.last_order_date,
    DATEDIFF(NOW(), ra.last_order_date) as days_since_last_order
    FROM retailer_activity ra
    JOIN users u ON ra.retailer_id = u.id
    JOIN retailer_profiles rp ON ra.retailer_id = rp.user_id
    WHERE ra.is_active = 0 AND ra.last_order_date IS NOT NULL
    ORDER BY ra.last_order_date DESC
    LIMIT 10";

$inactiveRetailersResult = $conn->query($inactiveRetailersSql);

// Prepare response
$response = [
    'success' => true,
    'summary' => null,
    'top_active_retailers' => [],
    'inactive_retailers' => []
];

// Process summary stats
if ($statsResult && $stats = $statsResult->fetch_assoc()) {
    $response['summary'] = [
        'total_retailers' => intval($stats['total_retailers']),
        'active_retailers' => intval($stats['active_retailers']),
        'inactive_retailers' => intval($stats['inactive_retailers']),
        'active_percentage' => $stats['total_retailers'] > 0 ? 
            round(($stats['active_retailers'] / $stats['total_retailers']) * 100, 2) : 0,
        'total_orders_7_days' => intval($stats['total_orders_7_days']),
        'total_orders_30_days' => intval($stats['total_orders_30_days']),
        'all_time_orders' => intval($stats['all_time_orders']),
        'all_time_value' => floatval($stats['all_time_value']),
        'last_updated' => $stats['last_updated']
    ];
}

// Process top active retailers
if ($topRetailersResult) {
    while ($retailer = $topRetailersResult->fetch_assoc()) {
        $response['top_active_retailers'][] = [
            'retailer_id' => intval($retailer['retailer_id']),
            'username' => $retailer['username'],
            'name' => $retailer['first_name'] . ' ' . $retailer['last_name'],
            'business_name' => $retailer['business_name'],
            'orders_7_days' => intval($retailer['orders_7_days']),
            'orders_30_days' => intval($retailer['orders_30_days']),
            'total_orders' => intval($retailer['total_orders']),
            'total_order_value' => floatval($retailer['total_order_value']),
            'last_order_date' => $retailer['last_order_date']
        ];
    }
}

// Process inactive retailers
if ($inactiveRetailersResult) {
    while ($retailer = $inactiveRetailersResult->fetch_assoc()) {
        $response['inactive_retailers'][] = [
            'retailer_id' => intval($retailer['retailer_id']),
            'username' => $retailer['username'],
            'name' => $retailer['first_name'] . ' ' . $retailer['last_name'],
            'business_name' => $retailer['business_name'],
            'total_orders' => intval($retailer['total_orders']),
            'last_order_date' => $retailer['last_order_date'],
            'days_since_last_order' => intval($retailer['days_since_last_order'])
        ];
    }
}

// Output response
echo json_encode($response);

// Close database connection
$conn->close();
?>
