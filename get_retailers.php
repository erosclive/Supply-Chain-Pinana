<?php
require_once 'config.php';

// Start session if not already started
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Get query parameters for pagination and filtering
$page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
$limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 10;
$search = isset($_GET['search']) ? sanitize_input($_GET['search']) : '';
$status = isset($_GET['status']) ? sanitize_input($_GET['status']) : '';
$verification = isset($_GET['verification']) ? sanitize_input($_GET['verification']) : '';
$offset = ($page - 1) * $limit;

// Base query
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
        rp.user_id,
        rp.first_name, 
        rp.last_name, 
        rp.business_name, 
        rp.business_type, 
        rp.phone, 
        rp.profile_image,
        rp.city,
        rp.province,
        rp.barangay,
        (SELECT COUNT(*) FROM retailer_orders ro WHERE ro.user_id = u.id) as order_count
    FROM 
        users u
    LEFT JOIN 
        retailer_profiles rp ON u.id = rp.user_id
    WHERE 
        u.role = 'retailer'
";

// Add search condition if search parameter is provided
if (!empty($search)) {
    $search = mysqli_real_escape_string($conn, $search);
    $query .= " AND (
        u.username LIKE '%$search%' OR 
        u.email LIKE '%$search%' OR 
        u.full_name LIKE '%$search%' OR 
        rp.first_name LIKE '%$search%' OR 
        rp.last_name LIKE '%$search%' OR 
        rp.business_name LIKE '%$search%' OR
        rp.phone LIKE '%$search%'
    )";
}

// Add status filter if provided
if ($status !== '') {
    $status = mysqli_real_escape_string($conn, $status);
    $query .= " AND u.is_active = '$status'";
}

// Add verification filter if provided
if ($verification !== '') {
    $verification = mysqli_real_escape_string($conn, $verification);
    $query .= " AND u.email_verified = '$verification'";
}

// Count total records for pagination
$countQuery = "SELECT COUNT(*) as total FROM (" . $query . ") as count_table";
$countResult = mysqli_query($conn, $countQuery);

if (!$countResult) {
    send_response('error', 'Database query error: ' . mysqli_error($conn));
}

$totalRecords = mysqli_fetch_assoc($countResult)['total'];
$totalPages = ceil($totalRecords / $limit);

// Add pagination
$query .= " ORDER BY u.created_at DESC LIMIT $offset, $limit";

// Execute query
$result = mysqli_query($conn, $query);

if (!$result) {
    send_response('error', 'Database query error: ' . mysqli_error($conn));
}

// Fetch all retailers
$retailers = [];
while ($row = mysqli_fetch_assoc($result)) {
    // Format profile image URL
    if (!empty($row['profile_image'])) {
        $row['profile_image_url'] = 'uploads/profile_images/' . $row['profile_image'];
    } else {
        $row['profile_image_url'] = 'images/default-profile.png';
    }
    
    // Format dates
    $row['created_at_formatted'] = date('M d, Y', strtotime($row['created_at']));
    $row['last_login_formatted'] = $row['last_login'] ? date('M d, Y H:i', strtotime($row['last_login'])) : 'Never';
    
    $retailers[] = $row;
}

// Return response
send_response('success', 'Retailers fetched successfully', [
    'retailers' => $retailers,
    'pagination' => [
        'total' => $totalRecords,
        'pages' => $totalPages,
        'current' => $page,
        'limit' => $limit
    ]
]);
?>
