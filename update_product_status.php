<?php
// Create a new PHP file to handle the product status update
header('Content-Type: application/json');

// Include database connection
require_once 'db_connection.php';

// Check if the request method is POST
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Get the product ID from the request
    $productId = $_POST['productId'] ?? '';
    $totalStock = $_POST['totalStock'] ?? null;
    $newStatus = $_POST['newStatus'] ?? null;

    // Validate inputs
    if (empty($productId)) {
        echo json_encode(['success' => false, 'error' => 'Product ID is required']);
        exit;
    }

    try {
        // If totalStock and newStatus are not provided, calculate them
        if ($totalStock === null || $newStatus === null) {
            // Check if the product uses batch tracking
            $stmt = $conn->prepare("SELECT batch_tracking FROM products WHERE product_id = ?");
            $stmt->bind_param("s", $productId);
            $stmt->execute();
            $result = $stmt->get_result();
            $product = $result->fetch_assoc();

            if (!$product) {
                echo json_encode(['success' => false, 'error' => 'Product not found']);
                exit;
            }

            $batchTracking = $product['batch_tracking'];
            $totalStock = 0;

            if ($batchTracking) {
                // Calculate total stock across all batches
                $stmt = $conn->prepare("SELECT SUM(quantity) AS total_stock FROM product_batches WHERE product_id = ?");
                $stmt->bind_param("s", $productId);
                $stmt->execute();
                $result = $stmt->get_result();
                $batchData = $result->fetch_assoc();
                $totalStock = $batchData['total_stock'] ?? 0;
            } else {
                // Get the stock for normal tracking products
                $stmt = $conn->prepare("SELECT stocks FROM products WHERE product_id = ?");
                $stmt->bind_param("s", $productId);
                $stmt->execute();
                $result = $stmt->get_result();
                $productData = $result->fetch_assoc();
                $totalStock = $productData['stocks'] ?? 0;
            }

            // Determine the new status based on total stock
            if ($totalStock <= 0) {
                $newStatus = 'Out of Stock';
            } elseif ($totalStock <= 10) {
                $newStatus = 'Low Stock';
            } else {
                $newStatus = 'In Stock';
            }
        }

        // Update the product status and total stock in the database
        $stmt = $conn->prepare("UPDATE products SET stocks = ?, status = ? WHERE product_id = ?");
        $stmt->bind_param("iss", $totalStock, $newStatus, $productId);
        $result = $stmt->execute();

        // If new status is 'Low Stock', create a notification
        if ($newStatus === 'Low Stock') {
            require_once __DIR__ . '/api/store-notification.php';
            $type = 'low_stock';
            $message = 'Product ID ' . $productId . ' is low on stock (' . $totalStock . ' left).';
            // Try to get user_id from session if available
            session_start();
            $user_id = $_SESSION['user_id'] ?? null;
            storeNotification($conn, $productId, $type, $message, $user_id);
        }

        if ($result) {
            echo json_encode([
                'success' => true, 
                'message' => 'Product status updated successfully',
                'data' => [
                    'product_id' => $productId,
                    'total_stock' => $totalStock,
                    'status' => $newStatus
                ]
            ]);
        } else {
            echo json_encode(['success' => false, 'error' => 'Failed to update product status']);
        }
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'error' => 'Database error: ' . $e->getMessage()]);
    }
} else {
    echo json_encode(['success' => false, 'error' => 'Invalid request method']);
}
?>
