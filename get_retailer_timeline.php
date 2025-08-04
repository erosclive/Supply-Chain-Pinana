<?php
require_once 'config.php';

// Start session if not already started
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Get parameters
$user_id = isset($_GET['user_id']) ? (int)$_GET['user_id'] : 0;
$page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
$limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 20;
$offset = ($page - 1) * $limit;

if ($user_id <= 0) {
    send_response('error', 'Invalid user ID');
}

// Timeline query
$query = "
    (SELECT 
        'order_status' as type,
        rosh.id as history_id,
        rosh.order_id,
        ro.id as order_id,
        rosh.status,
        rosh.notes,
        rosh.created_at,
        rosh.delivery_hours
    FROM 
        retailer_order_status_history rosh
    JOIN 
        retailer_orders ro ON rosh.order_id = ro.id
    WHERE 
        ro.user_id = ?)
    
    UNION ALL
    
    (SELECT 
        'order_created' as type,
        ro.id as history_id,
        ro.id as order_id,
        ro.id as order_id,
        'order' as status,
        'Order created' as notes,
        ro.created_at,
        NULL as delivery_hours
    FROM 
        retailer_orders ro
    WHERE 
        ro.user_id = ?)
    
    ORDER BY 
        created_at DESC
    LIMIT ?, ?
";

// Count total records for pagination
$countQuery = "
    SELECT COUNT(*) as total FROM (
        (SELECT 
            rosh.id
        FROM 
            retailer_order_status_history rosh
        JOIN 
            retailer_orders ro ON rosh.order_id = ro.id
        WHERE 
            ro.user_id = ?)
        
        UNION ALL
        
        (SELECT 
            ro.id
        FROM 
            retailer_orders ro
        WHERE 
            ro.user_id = ?)
    ) as count_table
";

$stmt = $conn->prepare($countQuery);
$stmt->bind_param("ii", $user_id, $user_id);
$stmt->execute();
$countResult = $stmt->get_result();
$totalRecords = $countResult->fetch_assoc()['total'];
$totalPages = ceil($totalRecords / $limit);

// Execute timeline query
$stmt = $conn->prepare($query);
$stmt->bind_param("iiii", $user_id, $user_id, $offset, $limit);
$stmt->execute();
$result = $stmt->get_result();

// Fetch timeline
$timeline = [];
while ($row = $result->fetch_assoc()) {
    $row['created_at_formatted'] = date('M d, Y H:i', strtotime($row['created_at']));
    
    // Add icon and color based on status
    switch ($row['status']) {
        case 'order':
            $row['icon'] = 'bi-cart';
            $row['color'] = 'secondary';
            break;
        case 'confirmed':
            $row['icon'] = 'bi-check-circle';
            $row['color'] = 'success';
            break;
        case 'shipped':
            $row['icon'] = 'bi-truck';
            $row['color'] = 'info';
            break;
        case 'delivered':
            $row['icon'] = 'bi-box-seam';
            $row['color'] = 'primary';
            break;
        case 'ready-to-pickup':
            $row['icon'] = 'bi-bag-check';
            $row['color'] = 'warning';
            break;
        case 'picked up':
            $row['icon'] = 'bi-person-check';
            $row['color'] = 'success';
            break;
        default:
            $row['icon'] = 'bi-circle';
            $row['color'] = 'secondary';
    }
    
    $timeline[] = $row;
}

// Return response
send_response('success', 'Timeline fetched successfully', [
    'timeline' => $timeline,
    'pagination' => [
        'total' => $totalRecords,
        'pages' => $totalPages,
        'current' => $page,
        'limit' => $limit
    ]
]);
?>
