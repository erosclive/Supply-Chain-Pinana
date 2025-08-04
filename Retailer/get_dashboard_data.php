<?php
session_start();
include 'db_connection.php';

if (!isset($_SESSION['user_id'])) {
    header('Content-Type: application/json');
    echo json_encode(['error' => 'Not logged in']);
    exit;
}

$retailer_id = $_SESSION['user_id'];

function getUserEmail($conn, $userId) {
    $stmt = $conn->prepare("SELECT email FROM users WHERE id = ?");
    $stmt->bind_param("i", $userId);
    $stmt->execute();
    $result = $stmt->get_result();
    $row = $result->fetch_assoc();

    return $row['email'] ?? null;
}

function getTotalProductsOrdered($conn, $userId) {
    $userEmail = getUserEmail($conn, $userId);
    if (!$userEmail) return 0;

    $sql = "
        SELECT COUNT(DISTINCT roi.product_id) AS total
        FROM retailer_order_items roi
        INNER JOIN retailer_orders ro ON roi.order_id = ro.order_id
        WHERE ro.retailer_email = ? 
        AND ro.status = 'completed'
        AND ro.payment_status = 'paid'
    ";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $userEmail);
    $stmt->execute();
    $result = $stmt->get_result();
    $row = $result->fetch_assoc();

    return $row['total'];
}

function getActiveOrdersCount($conn, $userId) {
    $userEmail = getUserEmail($conn, $userId);
    if (!$userEmail) return 0;

    $sql = "
        SELECT COUNT(DISTINCT ro.order_id) AS total
        FROM retailer_orders ro
        WHERE ro.retailer_email = ? 
        AND ro.status = 'completed'
        AND ro.payment_status = 'pending'
    ";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $userEmail);
    $stmt->execute();
    $result = $stmt->get_result();
    $row = $result->fetch_assoc();

    return $row['total'];
}

function getPendingPaymentsCount($conn, $userId) {
    $userEmail = getUserEmail($conn, $userId);
    if (!$userEmail) return 0;

    $sql = "
        SELECT COUNT(DISTINCT ro.order_id) AS total
        FROM retailer_orders ro
        WHERE ro.retailer_email = ? AND ro.payment_status = 'pending'
    ";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $userEmail);
    $stmt->execute();
    $result = $stmt->get_result();
    $row = $result->fetch_assoc();

    return $row['total'];
}

function getLowStockCount($conn, $userId) {
    $userEmail = getUserEmail($conn, $userId);
    if (!$userEmail) return 0;

    $sql = "
        SELECT COUNT(*) AS total_low_stock_products
        FROM (
            SELECT roi.product_name, SUM(roi.quantity) AS total_quantity
            FROM retailer_order_items roi
            INNER JOIN retailer_orders ro ON roi.order_id = ro.order_id
            WHERE ro.retailer_email = ? AND ro.status = 'completed'
            GROUP BY roi.product_name
            HAVING total_quantity > 0 AND total_quantity <= 5
        ) AS low_stock_summary
    ";

    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $userEmail);
    $stmt->execute();
    $result = $stmt->get_result();
    $row = $result->fetch_assoc();

    return $row['total_low_stock_products'] ?? 0;
}




function getRecentRetailerOrders($conn, $userId) {
    $userEmail = getUserEmail($conn, $userId);
    if (!$userEmail) return [];

    $sql = "
        SELECT order_id, po_number, order_date, status, pickup_status, total_amount
        FROM retailer_orders
        WHERE retailer_email = ?
        AND (
            status IN ('order', 'shipped', 'delivered')
            OR pickup_status IN ('ready-to-pickup', 'picked up')
        )
        ORDER BY order_date DESC
        LIMIT 6
    ";

    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $userEmail);
    $stmt->execute();
    $result = $stmt->get_result();

    $orders = [];
    while ($row = $result->fetch_assoc()) {
        $orders[] = $row;
    }

    return $orders;
}

function getActiveRetailerOrders($conn, $userId) {
    $userEmail = getUserEmail($conn, $userId);
    error_log("Email for ActiveOrdersList: $userEmail");
    if (!$userEmail) return [];

    $sql = "
        SELECT order_id, po_number, order_date, status, pickup_status, total_amount
        FROM retailer_orders
        WHERE retailer_email = ?
        AND status = 'completed'
        AND payment_status = 'pending'
        ORDER BY order_date DESC
        LIMIT 6
    ";
    $stmt = $conn->prepare($sql);
    if (!$stmt) error_log("getActiveRetailerOrders prepare failed: " . $conn->error);
    $stmt->bind_param("s", $userEmail);
    $stmt->execute();
    $result = $stmt->get_result();

    $orders = [];
    while ($row = $result->fetch_assoc()) {
        $orders[] = $row;
    }

    error_log("Fetched active orders: " . json_encode($orders));
    return $orders;
}

function getPartialPayments($conn, $userId) {
    $userEmail = getUserEmail($conn, $userId);
    error_log("Email for PartialPayments: $userEmail");
    if (!$userEmail) return [];

    $sql = "
        SELECT 
            ro.order_id, 
            ro.po_number, 
            ro.order_date, 
            ro.total_amount,
            COALESCE(SUM(rop.payment_amount), 0) AS paid_amount
        FROM retailer_orders ro
        LEFT JOIN retailer_order_payments rop ON ro.order_id = rop.order_id
        WHERE ro.retailer_email = ?
        AND ro.payment_status = 'partial'
        AND ro.status = 'completed'
        GROUP BY ro.order_id
        ORDER BY ro.order_date DESC
        LIMIT 6
    ";
    $stmt = $conn->prepare($sql);
    if (!$stmt) error_log("getPartialPayments prepare failed: " . $conn->error);
    $stmt->bind_param("s", $userEmail);
    $stmt->execute();
    $result = $stmt->get_result();

    $orders = [];
    while ($row = $result->fetch_assoc()) {
        $orders[] = $row;
    }

    error_log("Fetched partial payments: " . json_encode($orders));
    return $orders;
}

function getMyOrderedProducts($conn, $userId) {
    $userEmail = getUserEmail($conn, $userId);
    if (!$userEmail) return [];

    $sql = "
        SELECT 
            p.product_name,
            p.category,
            p.price,
            p.product_photo,
            SUM(roi.quantity) AS stocks
        FROM retailer_order_items roi
        INNER JOIN retailer_orders ro ON roi.order_id = ro.order_id
        INNER JOIN products p ON roi.product_name = p.product_name
        WHERE ro.retailer_email = ?
        AND ro.status = 'completed'
        GROUP BY p.product_name, p.category, p.price, p.product_photo
        ORDER BY stocks DESC
    ";
    $stmt = $conn->prepare($sql);
    if (!$stmt) {
        error_log("getMyOrderedProducts prepare failed: " . $conn->error);
        return [];
    }

    $stmt->bind_param("s", $userEmail);
    $stmt->execute();
    $result = $stmt->get_result();

    $products = [];
    while ($row = $result->fetch_assoc()) {
        $products[] = $row;
    }

    return $products;
}


$dashboardData = [
    'totalProductsOrdered' => getTotalProductsOrdered($conn, $retailer_id),
    'activeOrdersCount' => getActiveOrdersCount($conn, $retailer_id),
    'pendingPaymentsCount' => getPendingPaymentsCount($conn, $retailer_id),
    'lowStockCount' => getLowStockCount($conn, $retailer_id),
    'recentOrders' => getRecentRetailerOrders($conn, $retailer_id),
    'activeOrders' => getActiveRetailerOrders($conn, $retailer_id),
    'partialPayments' => getPartialPayments($conn, $retailer_id),
    'myProducts' => getMyOrderedProducts($conn, $retailer_id)


];


header('Content-Type: application/json');
echo json_encode($dashboardData);
?>