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

if (!isset($_GET['search']) || empty(trim($_GET['search']))) {
    echo json_encode(['success' => false, 'message' => 'Search term is required']);
    exit;
}

$searchTerm = '%' . trim($_GET['search']) . '%';

try {
    // Search retailers with completed orders statistics (only paid revenue)
    $sql = "
        SELECT 
            u.id as user_id,
            u.username,
            u.email,
            u.full_name,
            u.is_active,
            u.email_verified,
            u.approval_status,
            u.created_at,
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
            COALESCE(completed_stats.completed_orders, 0) as completed_orders,
            COALESCE(completed_stats.total_revenue, 0) as total_revenue
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
        WHERE u.role = 'retailer' 
        AND (
            u.email LIKE ? 
            OR u.username LIKE ? 
            OR u.full_name LIKE ?
            OR rp.first_name LIKE ?
            OR rp.last_name LIKE ?
            OR rp.business_name LIKE ?
            OR rp.phone LIKE ?
            OR CONCAT(rp.first_name, ' ', rp.last_name) LIKE ?
        )
        ORDER BY 
            CASE 
                WHEN u.approval_status = 'approved' THEN 1
                WHEN u.approval_status = 'pending' OR u.approval_status IS NULL THEN 2  
                WHEN u.approval_status = 'rejected' THEN 3
                ELSE 2
            END,
            u.created_at DESC
    ";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        $searchTerm, $searchTerm, $searchTerm, $searchTerm, 
        $searchTerm, $searchTerm, $searchTerm, $searchTerm
    ]);
    $retailers = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Format the data
    foreach ($retailers as &$retailer) {
        // Ensure numeric values are properly formatted
        $retailer['completed_orders'] = (int)$retailer['completed_orders'];
        $retailer['total_revenue'] = (float)$retailer['total_revenue'];
        
        // Ensure approval_status is set correctly
        if (empty($retailer['approval_status'])) {
            $retailer['approval_status'] = 'pending';
        }
        
        // Format profile image path if exists
        if ($retailer['profile_image'] && !str_starts_with($retailer['profile_image'], 'http')) {
            $retailer['profile_image'] = '../' . $retailer['profile_image'];
        }
    }
    
    echo json_encode([
        'success' => true,
        'retailers' => $retailers,
        'search_term' => trim($_GET['search']),
        'total_count' => count($retailers)
    ]);
    
} catch(PDOException $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Database error: ' . $e->getMessage()
    ]);
}
?>