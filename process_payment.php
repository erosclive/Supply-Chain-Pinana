<?php
include 'db_connection.php';

header('Content-Type: application/json');

// Get the JSON payload from the request
$input = json_decode(file_get_contents('php://input'), true);

if (!isset($input['orderId'], $input['paymentMethod'], $input['totalPaymentAmount'], $input['payQuantities'])) {
    echo json_encode(['success' => false, 'message' => 'Missing required parameters.']);
    exit;
}

$orderId = $input['orderId'];
$paymentMethod = $input['paymentMethod'];
$totalPaymentAmount = $input['totalPaymentAmount'];
$payQuantities = $input['payQuantities'];
$paymentReference = $input['paymentReference'] ?? null;
$paymentNotes = $input['paymentNotes'] ?? null;

$conn->begin_transaction();

try {
    // Update payment status in retailer_orders table
    $updateOrderQuery = "UPDATE retailer_orders SET payment_status = 'Partial' WHERE order_id = ?";
    $stmt = $conn->prepare($updateOrderQuery);
    if (!$stmt) {
        throw new Exception("Failed to prepare statement for updating retailer_orders: " . $conn->error);
    }
    $stmt->bind_param('i', $orderId);
    $stmt->execute();

    // Insert payment record into retailer_order_payments table
    $insertPaymentQuery = "INSERT INTO retailer_order_payments (order_id, payment_method, amount, reference_number, notes) VALUES (?, ?, ?, ?, ?)";
    $stmt = $conn->prepare($insertPaymentQuery);
    if (!$stmt) {
        throw new Exception("Failed to prepare statement for inserting into retailer_order_payments: " . $conn->error);
    }
    $stmt->bind_param('isdss', $orderId, $paymentMethod, $totalPaymentAmount, $paymentReference, $paymentNotes);
    $stmt->execute();
    $paymentId = $stmt->insert_id;

    // Calculate and record unsold items for all products in the order
    $fetchAllItemsQuery = "SELECT item_id, product_id, quantity FROM retailer_order_items WHERE order_id = ?";
    $stmt = $conn->prepare($fetchAllItemsQuery);
    $stmt->bind_param('i', $orderId);
    $stmt->execute();
    $result = $stmt->get_result();

    while ($orderItem = $result->fetch_assoc()) {
        $itemId = $orderItem['item_id'];
        $productId = $orderItem['product_id'];
        $totalQuantity = $orderItem['quantity'];

        // Check if the product is part of the payment
        $paidItem = array_filter($payQuantities, function ($item) use ($productId) {
            return $item['productId'] === $productId;
        });

        $quantityPaid = $paidItem ? array_values($paidItem)[0]['quantity'] : 0;

        // Calculate unsold quantity as the reduced quantity
        $quantityUnsold = $totalQuantity - $quantityPaid;

        // Log the values for debugging
        error_log("Processing item: productId=$productId, totalQuantity=$totalQuantity, quantityPaid=$quantityPaid, quantityUnsold=$quantityUnsold");

        // Insert payment details into retailer_order_item_payments table
        $insertItemPaymentQuery = "INSERT INTO retailer_order_item_payments (payment_id, item_id, product_id, quantity_paid, quantity_unsold, created_at) VALUES (?, ?, ?, ?, ?, ?)";
        $stmt = $conn->prepare($insertItemPaymentQuery);
        $createdAt = date('Y-m-d H:i:s');
        $stmt->bind_param('iisiii', $paymentId, $itemId, $productId, $quantityPaid, $quantityUnsold, $createdAt);
        $stmt->execute();
    }

    $conn->commit();

    echo json_encode(['success' => true, 'message' => 'Payment processed successfully.']);
} catch (Exception $e) {
    $conn->rollback();
    error_log("Payment processing error: " . $e->getMessage());
    echo json_encode(['success' => false, 'message' => 'Failed to process payment: ' . $e->getMessage()]);
}
?>