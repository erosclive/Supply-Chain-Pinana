<?php
include 'db_connection.php';

header('Content-Type: application/json');

try {
    $query = "SELECT ro.order_id, ro.retailer_id, r.retailer_name, ro.total_amount, ro.payment_status, 
                     rop.payment_id, rop.payment_method, rop.amount AS payment_amount, rop.reference_number, rop.notes, 
                     roip.item_id, roip.product_id, roip.quantity_paid, roip.quantity_unsold
              FROM retailer_orders ro
              LEFT JOIN retailers r ON ro.retailer_id = r.retailer_id
              LEFT JOIN retailer_order_payments rop ON ro.order_id = rop.order_id
              LEFT JOIN retailer_order_item_payments roip ON rop.payment_id = roip.payment_id
              ORDER BY ro.order_id DESC";

    $result = $conn->query($query);

    $orders = [];
    while ($row = $result->fetch_assoc()) {
        $orders[] = $row;
    }

    echo json_encode(['success' => true, 'orders' => $orders]);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Failed to fetch orders: ' . $e->getMessage()]);
}