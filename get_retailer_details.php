<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Database connection
$host = 'localhost';
$dbname = 'supplychain_db';
$username = 'root'; // Update with your database username
$password = ''; // Update with your database password

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch(PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Database connection failed: ' . $e->getMessage()]);
    exit;
}

if (!isset($_GET['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'User ID is required']);
    exit;
}

$user_id = (int)$_GET['user_id'];

try {
    // Get retailer details with completed orders statistics (only paid revenue)
    $sql = "
        SELECT 
            u.id as user_id,
            u.username,
            u.email,
            u.full_name,
            u.is_active,
            u.email_verified,
            u.created_at,
            u.approval_status,
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
            rp.tiktok,
            rp.gov_id_type,
    rp.gov_id_file_path,
    rp.business_doc_type,
    rp.business_doc_file_path,
            COALESCE(completed_stats.completed_orders, 0) as completed_orders,
            COALESCE(completed_stats.total_revenue, 0) as total_revenue,
            CASE 
                WHEN u.approval_status IS NOT NULL AND u.approval_status != '' THEN u.approval_status
                WHEN u.email_verified = 1 AND u.is_active = 1 THEN 'approved'
                WHEN u.email_verified = 0 THEN 'pending'
                WHEN u.is_active = 0 THEN 'rejected'
                ELSE 'pending'
            END as final_approval_status
        FROM users u
        LEFT JOIN retailer_profiles rp ON u.id = rp.user_id
        LEFT JOIN (
            SELECT 
                rp2.user_id,
                COUNT(ro.order_id) as completed_orders,
                SUM(CASE WHEN ro.payment_status = 'paid' THEN ro.total_amount ELSE 0 END) as total_revenue
            FROM retailer_profiles rp2
            LEFT JOIN retailer_orders ro ON (
                (rp2.first_name = ro.retailer_name 
                OR rp2.business_name = ro.retailer_name
                OR CONCAT(rp2.first_name, ' ', rp2.last_name) = ro.retailer_name)
                AND ro.status = 'completed'
            )
            WHERE ro.status = 'completed'
            GROUP BY rp2.user_id
        ) completed_stats ON u.id = completed_stats.user_id
        WHERE u.id = ? AND u.role = 'retailer'
    ";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$user_id]);
    $retailer = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$retailer) {
        echo json_encode(['success' => false, 'message' => 'Retailer not found']);
        exit;
    }
    
    // Use the final_approval_status as the main approval_status
    $retailer['approval_status'] = $retailer['final_approval_status'];
    unset($retailer['final_approval_status']);
    
    // Get completed orders details for this retailer
    $ordersSql = "
        SELECT 
            ro.order_id,
            ro.po_number,
            ro.order_date,
            ro.total_amount,
            ro.payment_status,
            ro.delivery_mode,
            ro.created_at
        FROM retailer_orders ro
        LEFT JOIN retailer_profiles rp ON (
            rp.first_name = ro.retailer_name 
            OR rp.business_name = ro.retailer_name
            OR CONCAT(rp.first_name, ' ', rp.last_name) = ro.retailer_name
        )
        WHERE rp.user_id = ? AND ro.status = 'completed'
        ORDER BY ro.created_at DESC
        LIMIT 10
    ";
    
    $ordersStmt = $pdo->prepare($ordersSql);
    $ordersStmt->execute([$user_id]);
    $completed_orders_list = $ordersStmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Format the data
    $retailer['completed_orders'] = (int)$retailer['completed_orders'];
    $retailer['total_revenue'] = (float)$retailer['total_revenue'];
    $retailer['completed_orders_list'] = $completed_orders_list;
    
    // Format profile image path if exists
    if ($retailer['profile_image'] && !str_starts_with($retailer['profile_image'], 'http')) {
        $retailer['profile_image'] = '../SupplyChainCapstone/profile_images/' . $retailer['profile_image'];
    }

    // Format gov ID path
if (!empty($retailer['gov_id_file_path']) && !str_starts_with($retailer['gov_id_file_path'], 'http')) {
    $retailer['gov_id_file_path'] = '../SupplyChainCapstone/' . $retailer['gov_id_file_path'];
}

// Format business document path
if (!empty($retailer['business_doc_file_path']) && !str_starts_with($retailer['business_doc_file_path'], 'http')) {
    $retailer['business_doc_file_path'] = '../SupplyChainCapstone/' . $retailer['business_doc_file_path'];
}

    
    echo json_encode([
        'success' => true,
        'retailer' => $retailer
    ]);
    
} catch(PDOException $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Database error: ' . $e->getMessage()
    ]);
}
?>