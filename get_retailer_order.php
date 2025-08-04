<?php
require_once 'config.php';

// Start session if not already started
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Get user ID
$user_id = isset($_GET['user_id']) ? (int)$_GET['user_id'] : 0;

if ($user_id <= 0) {
    send_response('error', 'Invalid user ID');
}

// Get retailer details
$query = "
    SELECT 
        u.id, 
        u.username, 
        u.email, 
        u.full_name, 
        u.role, 
        u.created_at, 
        u.last_login, 
        u.is_active, 
        u.email_verified,
        rp.first_name, 
        rp.last_name, 
        rp.birthday, 
        rp.age, 
        rp.nationality,
        rp.business_name, 
        rp.business_type, 
        rp.province, 
        rp.city, 
        rp.barangay, 
        rp.house_number, 
        rp.address_notes, 
        rp.business_address,
        rp.phone, 
        rp.profile_image,
        rp.facebook,
        rp.instagram,
        rp.tiktok
    FROM 
        users u
    LEFT JOIN 
        retailer_profiles rp ON u.id = rp.user_id
    WHERE 
        u.id = ? AND u.role = 'retailer'
";

$stmt = $conn->prepare($query);
$stmt->bind_param("i", $user_id);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    send_response('error', 'Retailer not found');
}

$retailer = $result->fetch_assoc();

// Format profile image URL
if (!empty($retailer['profile_image'])) {
    $retailer['profile_image_url'] = 'uploads/profile_images/' . $retailer['profile_image'];
} else {
    $retailer['profile_image_url'] = 'images/default-profile.png';
}

// Format dates
$retailer['created_at_formatted'] = date('M d, Y', strtotime($retailer['created_at']));
$retailer['last_login_formatted'] = $retailer['last_login'] ? date('M d, Y H:i', strtotime($retailer['last_login'])) : 'Never';
$retailer['birthday_formatted'] = $retailer['birthday'] ? date('M d, Y', strtotime($retailer['birthday'])) : '';

// Get retailer orders
$ordersQuery = "
    SELECT 
        ro.id,
        ro.user_id,
        ro.total_amount,
        ro.payment_method,
        ro.payment_status,
        ro.created_at,
        (SELECT COUNT(*) FROM retailer_order_items roi WHERE roi.order_id = ro.id) as item_count,
        (SELECT status FROM retailer_order_status_history rosh WHERE rosh.order_id = ro.id ORDER BY rosh.created_at DESC LIMIT 1) as status
    FROM 
        retailer_orders ro
    WHERE 
        ro.user_id = ?
    ORDER BY 
        ro.created_at DESC
    LIMIT 10
";

$stmt = $conn->prepare($ordersQuery);
$stmt->bind_param("i", $user_id);
$stmt->execute();
$ordersResult = $stmt->get_result();

$orders = [];
while ($row = $ordersResult->fetch_assoc()) {
    $row['created_at_formatted'] = date('M d, Y H:i', strtotime($row['created_at']));
    $orders[] = $row;
}

$retailer['recent_orders'] = $orders;

// Get activity timeline
$timelineQuery = "
    SELECT 
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
        ro.user_id = ?
    
    UNION ALL
    
    SELECT 
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
        ro.user_id = ?
    
    ORDER BY 
        created_at DESC
    LIMIT 20
";

$stmt = $conn->prepare($timelineQuery);
$stmt->bind_param("ii", $user_id, $user_id);
$stmt->execute();
$timelineResult = $stmt->get_result();

$timeline = [];
while ($row = $timelineResult->fetch_assoc()) {
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

$retailer['activity_timeline'] = $timeline;

send_response('success', 'Retailer details fetched successfully', $retailer);
?>
