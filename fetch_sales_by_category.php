<?php

ini_set('display_errors', 1);
error_reporting(E_ALL);
header('Content-Type: application/json');

// Include database configuration
require_once 'db_connection.php';

// Get request parameters
$startDate = isset($_GET['startDate'])
    ? $_GET['startDate']
    : date('Y-m-d', strtotime('-30 days'));
$endDate   = isset($_GET['endDate'])
    ? $_GET['endDate']
    : date('Y-m-d');
$channel  = isset($_GET['channel'])  ? $_GET['channel']  : 'all';
$category = isset($_GET['category']) ? $_GET['category'] : 'all';


// Initialize response array
$response = [
    'status' => 'success',
    'data'   => [
        'categories' => [],
        'sales'      => [],
        'byChannel'  => []
    ],
    'message' => ''
];

try {
    // 1) Fetch only real categories (no NULL, no Test Category)
    $categoriesQuery = "
        SELECT DISTINCT category
          FROM products
         WHERE category IS NOT NULL
           AND category <> 'Test Category'
         ORDER BY category
    ";
    $categoriesResult = $conn->query($categoriesQuery);
    $categories = [];
    while ($row = $categoriesResult->fetch_assoc()) {
        $categories[] = $row['category'];
    }

    // 2) Initialize sales data
    $salesByCategory           = [];
    $salesByCategoryAndChannel = [];
    foreach ($categories as $cat) {
        $salesByCategory[$cat]           = 0;
        $salesByCategoryAndChannel[$cat] = [
            'POS'      => 0,
            'Retailer' => 0
        ];
    }

    // 3) POS channel
    if ($channel === 'all' || $channel === 'POS') {
        $posQuery = "
            SELECT
                p.category             AS category,
                SUM(pti.total_price)   AS total_amount
            FROM pos_transaction_payments ptp
            JOIN pos_transaction_items pti
              ON ptp.transaction_id = pti.transaction_id
            JOIN products p
              ON pti.product_id = p.product_id
            WHERE DATE(ptp.payment_date) BETWEEN ? AND ?
              AND ptp.payment_status = 'completed'
              AND (? = 'all' OR p.category = ?)
            GROUP BY p.category
        ";
        $posStmt = $conn->prepare($posQuery);
        $posStmt->bind_param('ssss',
  $startDate, $endDate,
  $category,  $category
);

        $posStmt->execute();
        $posResult = $posStmt->get_result();
        while ($row = $posResult->fetch_assoc()) {
            $cat = $row['category'];
            $amt = (float)$row['total_amount'];
            if (isset($salesByCategory[$cat])) {
                $salesByCategory[$cat]                  += $amt;
                $salesByCategoryAndChannel[$cat]['POS']  = $amt;
            }
        }
        $posStmt->close();
    }

    // 4) Retailer channel
    if ($channel === 'all' || $channel === 'Retailer') {
        $retailerQuery = "
       SELECT
           p.category           AS category,
           SUM(roi.total_price) AS total_amount
       FROM retailer_order_payments rop
      JOIN retailer_orders ro
        ON rop.order_id = ro.order_id
       JOIN retailer_order_items roi
         ON roi.order_id = rop.order_id
       JOIN products p
         ON roi.product_id = p.product_id
      WHERE DATE(rop.created_at) BETWEEN ? AND ?
        AND (? = 'all' OR p.category = ?)
      GROUP BY p.category
    ";
        $retailerStmt = $conn->prepare($retailerQuery);
       $retailerStmt->bind_param('ssss',
      $startDate, $endDate,
      $category,  $category
    );
        $retailerStmt->execute();
        $retailerResult = $retailerStmt->get_result();
        while ($row = $retailerResult->fetch_assoc()) {
            $cat = $row['category'];
            $amt = (float)$row['total_amount'];
            if (isset($salesByCategory[$cat])) {
                $salesByCategory[$cat]                        += $amt;
                $salesByCategoryAndChannel[$cat]['Retailer']   = $amt;
            }
        }
        $retailerStmt->close();
    }

    // 5) Build response
    $labels    = array_keys($salesByCategory);
    $sales     = array_values($salesByCategory);
    $byChannel = ['POS' => [], 'Retailer' => []];
    foreach ($labels as $cat) {
        $byChannel['POS'][]      = $salesByCategoryAndChannel[$cat]['POS'];
        $byChannel['Retailer'][] = $salesByCategoryAndChannel[$cat]['Retailer'];
    }

    $response['data'] = [
        'categories' => $labels,
        'sales'      => $sales,
        'byChannel'  => $byChannel
    ];

} catch (\Throwable $e) {
    $response['status']  = 'error';
    $response['message'] = 'Error fetching sales by category data.';
}

$conn->close();
echo json_encode($response);