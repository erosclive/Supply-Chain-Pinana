<?php
// DEBUG: show every error/warning in dev (remove in production)
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Force JSON output
header('Content-Type: application/json');

// Include database configuration
require_once 'db_connection.php';

// Parse and normalize date range parameters (include full day)
$startDateTime = isset($_GET['startDate'])
    ? $_GET['startDate'] . ' 00:00:00'
    : date('Y-m-d', strtotime('-6 days')) . ' 00:00:00';
$endDateTime = isset($_GET['endDate'])
    ? $_GET['endDate'] . ' 23:59:59'
    : date('Y-m-d') . ' 23:59:59';

// Channel filter: default to 'all'
$rawChannel = isset($_GET['channel']) ? trim($_GET['channel']) : 'all';
$channel = strtolower($rawChannel) === '' ? 'all' : strtolower($rawChannel);
$category = isset($_GET['category']) ? $_GET['category'] : 'all';


// Initialize response
$response = [
    'status' => 'success',
    'data' => [
        'labels'   => [],
        'pos'      => [],
        'retailer' => [],
        'total'    => []
    ],
    'message' => ''
];

try {
    // Build date labels array
    $period = new DatePeriod(
        new DateTime(substr($startDateTime, 0, 10)),
        new DateInterval('P1D'),
        (new DateTime(substr($endDateTime, 0, 10)))->modify('+1 day')
    );
    $salesByDate = [];
    foreach ($period as $dt) {
        $d = $dt->format('Y-m-d');
        $response['data']['labels'][] = date('M d', strtotime($d));
        $salesByDate[$d] = ['POS' => 0, 'Retailer' => 0];
    }

    // 1) POS channel: as before
    if ($channel === 'all' || $channel === 'pos') {
        $sql = "
            SELECT
            DATE(ptp.payment_date) AS sale_date,
            SUM(pti.total_price)    AS total_amount
      FROM pos_transaction_payments ptp
        JOIN pos_transaction_items pti
          ON ptp.transaction_id = pti.transaction_id
        LEFT JOIN products p
          ON pti.product_id = p.product_id
       WHERE ptp.payment_date BETWEEN ? AND ?
         AND ptp.payment_status = 'completed'
          " . ($category !== 'all'
             ? " AND p.category = ?"
             : "") . "
        GROUP BY sale_date
        ";
        $stmt = $conn->prepare($sql);
    if ($category !== 'all') {
        $stmt->bind_param('sss', $startDateTime, $endDateTime, $category);
    } else {
        $stmt->bind_param('ss', $startDateTime, $endDateTime);
    }
        $stmt->execute();
        $res = $stmt->get_result();
        while ($r = $res->fetch_assoc()) {
            $d = $r['sale_date'];
            if (isset($salesByDate[$d])) {
                $salesByDate[$d]['POS'] = (float)$r['total_amount'];
            }
        }
        $stmt->close();
    }

    // 2) Retailer channel: use payments table
    if ($channel === 'all' || $channel === 'retailer') {
        $sql = "
            SELECT
            DATE(rop.created_at)      AS sale_date,
            SUM(roi.total_price)      AS total_amount
        FROM retailer_order_payments rop
        JOIN retailer_order_items roi
          ON rop.order_id = roi.order_id
        LEFT JOIN products p
          ON roi.product_id = p.product_id
        WHERE rop.created_at BETWEEN ? AND ?
          AND rop.payment_reference IS NOT NULL
          " . ($category !== 'all'
             ? " AND p.category = ?"
             : "") . "
        GROUP BY sale_date
        ";
        $stmt = $conn->prepare($sql);
    if ($category !== 'all') {
        $stmt->bind_param('sss', $startDateTime, $endDateTime, $category);
    } else {
        $stmt->bind_param('ss', $startDateTime, $endDateTime);
    }
        $stmt->execute();
        $res = $stmt->get_result();
        while ($r = $res->fetch_assoc()) {
            $d = $r['sale_date'];
            if (isset($salesByDate[$d])) {
                $salesByDate[$d]['Retailer'] = (float)$r['total_amount'];
            }
        }
        $stmt->close();
    }

    // Build final data arrays
    foreach ($salesByDate as $d => $counts) {
        $response['data']['pos'][]      = $counts['POS'];
        $response['data']['retailer'][] = $counts['Retailer'];
        $response['data']['total'][]    = $counts['POS'] + $counts['Retailer'];
    }

} catch (Exception $e) {
    $response['status']  = 'error';
    $response['message'] = 'Error fetching sales trends: ' . $e->getMessage();
}

// Send JSON response
echo json_encode($response);
exit;