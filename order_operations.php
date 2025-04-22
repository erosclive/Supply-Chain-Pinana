<?php
// Include database connection
require_once 'db_connection.php';

// Set headers to prevent caching
header('Cache-Control: no-cache, must-revalidate');
header('Expires: Mon, 26 Jul 1997 05:00:00 GMT');
header('Content-Type: application/json');

// Get action from request
$action = isset($_GET['action']) ? $_GET['action'] : (isset($_POST['action']) ? $_POST['action'] : '');

// Handle different actions
switch ($action) {
    case 'get_orders':
        getOrders();
        break;
    case 'get_order_details':
        getOrderDetails();
        break;
    case 'create_order':
        createOrder();
        break;
    case 'update_order':
        updateOrder();
        break;
    case 'delete_order':
        deleteOrder();
        break;
    case 'get_products':
        getProducts();
        break;
    case 'export_orders':
        exportOrders();
        break;
    case 'get_delivered_orders':
        getDeliveredOrders();
        break;
    default:
        echo json_encode(['success' => false, 'message' => 'Invalid action']);
        break;
}

/**
 * Reduces product quantity from batches using FIFO method (earliest batch first)
 * 
 * @param string $product_id The product ID
 * @param int $quantity The quantity to reduce
 * @param mysqli $conn Database connection
 * @return bool True if successful, false otherwise
 */
function reduceProductFromBatches($product_id, $quantity, $conn) {
    // Check if product uses batch tracking
    $checkBatchQuery = "SELECT batch_tracking FROM products WHERE product_id = ?";
    $stmt = mysqli_prepare($conn, $checkBatchQuery);
    mysqli_stmt_bind_param($stmt, "s", $product_id);
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);
    $product = mysqli_fetch_assoc($result);
    mysqli_stmt_close($stmt);
    
    // If product doesn't use batch tracking, just return true (handled by regular inventory update)
    if (!$product || $product['batch_tracking'] != 1) {
        return true;
    }
    
    // Get available batches ordered by expiration date (FIFO)
    $batchQuery = "SELECT batch_id, quantity FROM product_batches 
                  WHERE product_id = ? AND quantity > 0 
                  ORDER BY expiration_date ASC";
    $stmt = mysqli_prepare($conn, $batchQuery);
    mysqli_stmt_bind_param($stmt, "s", $product_id);
    mysqli_stmt_execute($stmt);
    $batchResult = mysqli_stmt_get_result($stmt);
    mysqli_stmt_close($stmt);
    
    $remainingQuantity = $quantity;
    $batchUpdates = [];
    
    // Calculate how much to take from each batch
    while ($batch = mysqli_fetch_assoc($batchResult)) {
        if ($remainingQuantity <= 0) {
            break;
        }
        
        $batchId = $batch['batch_id'];
        $batchQuantity = $batch['quantity'];
        
        $quantityToReduce = min($remainingQuantity, $batchQuantity);
        $remainingQuantity -= $quantityToReduce;
        
        $batchUpdates[] = [
            'batch_id' => $batchId,
            'reduce_by' => $quantityToReduce
        ];
    }
    
    // If we couldn't fulfill the entire quantity, return false
    if ($remainingQuantity > 0) {
        return false;
    }
    
    // Update each batch
    foreach ($batchUpdates as $update) {
        $batchId = $update['batch_id'];
        $reduceBy = $update['reduce_by'];
        
        // Get batch details before updating
        $batchDetailsQuery = "SELECT batch_id, product_id, batch_code, quantity, manufacturing_date, 
                             expiration_date, unit_cost FROM product_batches WHERE batch_id = ?";
        $stmt = mysqli_prepare($conn, $batchDetailsQuery);
        mysqli_stmt_bind_param($stmt, "i", $batchId);
        mysqli_stmt_execute($stmt);
        $batchResult = mysqli_stmt_get_result($stmt);
        $batchDetails = mysqli_fetch_assoc($batchResult);
        mysqli_stmt_close($stmt);
        
        // Update batch quantity
        $updateQuery = "UPDATE product_batches SET quantity = quantity - ? WHERE batch_id = ?";
        $stmt = mysqli_prepare($conn, $updateQuery);
        mysqli_stmt_bind_param($stmt, "ii", $reduceBy, $batchId);
        $result = mysqli_stmt_execute($stmt);
        mysqli_stmt_close($stmt);
        
        if (!$result) {
            return false;
        }
        
        // Check if batch is now depleted (quantity = 0)
        $checkDepleted = "SELECT quantity FROM product_batches WHERE batch_id = ?";
        $stmt = mysqli_prepare($conn, $checkDepleted);
        mysqli_stmt_bind_param($stmt, "i", $batchId);
        mysqli_stmt_execute($stmt);
        $depletedResult = mysqli_stmt_get_result($stmt);
        $currentQuantity = mysqli_fetch_assoc($depletedResult)['quantity'];
        mysqli_stmt_close($stmt);
        
        if ($currentQuantity == 0) {
            // Transfer to batch_history
            $insertHistoryQuery = "INSERT INTO batch_history 
                          (batch_id, product_id, batch_code, quantity_sold, manufacturing_date, 
                           expiration_date, unit_cost, transaction_id, moved_at, notes) 
                          VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?)";
    
            // Generate transaction ID (format: TRX-YYMMDD-XXXXX)
            $transactionPrefix = 'TRX-' . date('ymd') . '-';
            $transactionSuffix = mt_rand(10000, 99999);
            $transactionId = $transactionPrefix . $transactionSuffix;
            
            $notes = "Batch depleted through order process";
            
            $stmt = mysqli_prepare($conn, $insertHistoryQuery);
            
            if (!$stmt) {
                error_log("Prepare failed: " . mysqli_error($conn));
                return false;
            }
            
            mysqli_stmt_bind_param(
                $stmt, 
                "issssssss", 
                $batchDetails['batch_id'],
                $batchDetails['product_id'],
                $batchDetails['batch_code'],
                $reduceBy,
                $batchDetails['manufacturing_date'],
                $batchDetails['expiration_date'],
                $batchDetails['unit_cost'],
                $transactionId,
                $notes
            );
            
            $historyResult = mysqli_stmt_execute($stmt);
            
            if (!$historyResult) {
                error_log("Batch history insert failed: " . mysqli_stmt_error($stmt));
                return false;
            }
            
            mysqli_stmt_close($stmt);
            
            // Delete the depleted batch from product_batches
            $deleteBatchQuery = "DELETE FROM product_batches WHERE batch_id = ?";
            $stmt = mysqli_prepare($conn, $deleteBatchQuery);
            
            if (!$stmt) {
                error_log("Prepare delete failed: " . mysqli_error($conn));
                return false;
            }
            
            mysqli_stmt_bind_param($stmt, "i", $batchId);
            $deleteResult = mysqli_stmt_execute($stmt);
            
            if (!$deleteResult) {
                error_log("Delete batch failed: " . mysqli_stmt_error($stmt));
                return false;
            }
            
            mysqli_stmt_close($stmt);
        }
    }
    
    return true;
}

// Function to get orders with pagination and filters
function getOrders() {
    global $conn;
    
    // Get pagination parameters
    $page = isset($_GET['page']) ? intval($_GET['page']) : 1;
    $limit = isset($_GET['limit']) ? intval($_GET['limit']) : 10;
    $offset = ($page - 1) * $limit;
    
    // Get filter parameters
    $status = isset($_GET['status']) ? $_GET['status'] : 'all';
    $dateRange = isset($_GET['date_range']) ? $_GET['date_range'] : 'all';
    $search = isset($_GET['search']) ? $_GET['search'] : '';
    $excludeTax = isset($_GET['exclude_tax']) && $_GET['exclude_tax'] === 'true';
    
    // Build WHERE clause
    $whereClause = "WHERE 1=1";
    $params = [];
    
    // Status filter
    if ($status !== 'all') {
        $whereClause .= " AND o.status = ?";
        $params[] = $status;
    }
    
    // Date range filter
    if ($dateRange !== 'all') {
        $today = date('Y-m-d');
        
        switch ($dateRange) {
            case 'today':
                $whereClause .= " AND DATE(o.order_date) = ?";
                $params[] = $today;
                break;
            case 'week':
                $weekAgo = date('Y-m-d', strtotime('-7 days'));
                $whereClause .= " AND o.order_date BETWEEN ? AND ?";
                $params[] = $weekAgo;
                $params[] = $today . ' 23:59:59';
                break;
            case 'month':
                $monthAgo = date('Y-m-d', strtotime('-30 days'));
                $whereClause .= " AND o.order_date BETWEEN ? AND ?";
                $params[] = $monthAgo;
                $params[] = $today . ' 23:59:59';
                break;
            case 'custom':
                if (isset($_GET['start_date']) && isset($_GET['end_date'])) {
                    $startDate = $_GET['start_date'];
                    $endDate = $_GET['end_date'];
                    $whereClause .= " AND o.order_date BETWEEN ? AND ?";
                    $params[] = $startDate;
                    $params[] = $endDate . ' 23:59:59';
                }
                break;
        }
    }
    
    // Search filter
    if (!empty($search)) {
        $whereClause .= " AND (o.order_id LIKE ? OR o.customer_name LIKE ? OR o.customer_email LIKE ?)";
        $searchTerm = "%$search%";
        $params[] = $searchTerm;
        $params[] = $searchTerm;
        $params[] = $searchTerm;
    }
    
    // Count total orders with filters
    $countQuery = "SELECT COUNT(*) as total FROM orders o $whereClause";
    $stmt = mysqli_prepare($conn, $countQuery);
    
    if (!empty($params)) {
        $types = str_repeat('s', count($params));
        mysqli_stmt_bind_param($stmt, $types, ...$params);
    }
    
    mysqli_stmt_execute($stmt);
    $countResult = mysqli_stmt_get_result($stmt);
    $totalCount = mysqli_fetch_assoc($countResult)['total'];
    
    // Get orders with pagination
    $query = "
        SELECT 
            o.order_id, 
            o.customer_name, 
            o.customer_email, 
            o.order_date,
            TIME(o.order_date) as order_time,
            o.status, 
            o.payment_method,
            CASE WHEN ? THEN (o.total_amount - o.tax) ELSE o.total_amount END as total_amount,
            (SELECT COUNT(*) FROM order_items WHERE order_id = o.order_id) as item_count
        FROM orders o
        $whereClause
        ORDER BY o.order_date DESC
        LIMIT ?, ?
    ";
    
    $stmt = mysqli_prepare($conn, $query);
    
    // Add exclude tax parameter at the beginning
    array_unshift($params, $excludeTax);
    $params[] = $offset;
    $params[] = $limit;
    $types = 'i' . str_repeat('s', count($params) - 3) . 'ii';
    mysqli_stmt_bind_param($stmt, $types, ...$params);
    
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);
    
    $orders = [];
    while ($row = mysqli_fetch_assoc($result)) {
        $orders[] = $row;
    }
    
    // Get order statistics
    $stats = getOrderStats();
    
    echo json_encode([
        'success' => true,
        'orders' => $orders,
        'total_count' => $totalCount,
        'stats' => $stats
    ]);
}

// Function to get order statistics
function getOrderStats() {
    global $conn;
    
    $excludeTax = isset($_GET['exclude_tax']) && $_GET['exclude_tax'] === 'true';
    
    // Total orders
    $totalQuery = "SELECT COUNT(*) as total FROM orders";
    $totalResult = mysqli_query($conn, $totalQuery);
    $totalOrders = mysqli_fetch_assoc($totalResult)['total'];
    
    // Pending orders
    $pendingQuery = "SELECT COUNT(*) as total FROM orders WHERE status = 'pending'";
    $pendingResult = mysqli_query($conn, $pendingQuery);
    $pendingOrders = mysqli_fetch_assoc($pendingResult)['total'];
    
    // Delivered orders
    $deliveredQuery = "SELECT COUNT(*) as total FROM orders WHERE status = 'delivered'";
    $deliveredResult = mysqli_query($conn, $deliveredQuery);
    $deliveredOrders = mysqli_fetch_assoc($deliveredResult)['total'];
    
    // Total revenue
    $revenueQuery = "SELECT SUM(" . ($excludeTax ? "(total_amount - tax)" : "total_amount") . ") as total FROM orders";
    $revenueResult = mysqli_query($conn, $revenueQuery);
    $totalRevenue = mysqli_fetch_assoc($revenueResult)['total'] ?? 0;
    
    // Growth percentage (comparing current month to previous month)
    $currentMonth = date('Y-m');
    $previousMonth = date('Y-m', strtotime('-1 month'));
    
    $currentMonthQuery = "SELECT COUNT(*) as total FROM orders WHERE DATE_FORMAT(order_date, '%Y-%m') = '$currentMonth'";
    $previousMonthQuery = "SELECT COUNT(*) as total FROM orders WHERE DATE_FORMAT(order_date, '%Y-%m') = '$previousMonth'";
    
    $currentMonthResult = mysqli_query($conn, $currentMonthQuery);
    $previousMonthResult = mysqli_query($conn, $previousMonthQuery);
    
    $currentMonthOrders = mysqli_fetch_assoc($currentMonthResult)['total'];
    $previousMonthOrders = mysqli_fetch_assoc($previousMonthResult)['total'];
    
    $growthPercentage = 0;
    if ($previousMonthOrders > 0) {
        $growthPercentage = round((($currentMonthOrders - $previousMonthOrders) / $previousMonthOrders) * 100, 2);
    }
    
    return [
        'total_orders' => $totalOrders,
        'pending_orders' => $pendingOrders,
        'delivered_orders' => $deliveredOrders,
        'total_revenue' => $totalRevenue,
        'growth_percentage' => $growthPercentage
    ];
}

// Function to get order details
function getOrderDetails() {
    global $conn;
    
    $orderId = isset($_GET['order_id']) ? $_GET['order_id'] : '';
    $excludeTax = isset($_GET['exclude_tax']) && $_GET['exclude_tax'] === 'true';
    
    if (empty($orderId)) {
        echo json_encode(['success' => false, 'message' => 'Order ID is required']);
        return;
    }
    
    // Get order details
    $query = "
        SELECT 
            o.order_id, 
            o.customer_name, 
            o.customer_email, 
            o.customer_phone,
            o.shipping_address,
            o.order_date,
            o.status, 
            o.payment_method,
            o.subtotal,
            o.tax,
            o.discount,
            o.total_amount,
            o.notes,
            o.created_at,
            o.updated_at
        FROM orders o
        WHERE o.order_id = ?
    ";
    
    $stmt = mysqli_prepare($conn, $query);
    mysqli_stmt_bind_param($stmt, 's', $orderId);
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);
    
    if (mysqli_num_rows($result) === 0) {
        echo json_encode(['success' => false, 'message' => 'Order not found']);
        return;
    }
    
    $order = mysqli_fetch_assoc($result);
    
    // Get order items
    $itemsQuery = "
        SELECT 
            oi.item_id,
            oi.product_id,
            p.product_name,
            oi.quantity,
            oi.price
        FROM order_items oi
        JOIN products p ON oi.product_id = p.product_id
        WHERE oi.order_id = ?
    ";
    
    $stmt = mysqli_prepare($conn, $itemsQuery);
    mysqli_stmt_bind_param($stmt, 's', $orderId);
    mysqli_stmt_execute($stmt);
    $itemsResult = mysqli_stmt_get_result($stmt);
    
    $items = [];
    while ($item = mysqli_fetch_assoc($itemsResult)) {
        $items[] = $item;
    }
    
    $order['items'] = $items;
    
    // Get status updates
    $statusQuery = "
        SELECT status, updated_at as date
        FROM order_status_history
        WHERE order_id = ?
        ORDER BY updated_at DESC
    ";
    
    $stmt = mysqli_prepare($conn, $statusQuery);
    mysqli_stmt_bind_param($stmt, 's', $orderId);
    mysqli_stmt_execute($stmt);
    $statusResult = mysqli_stmt_get_result($stmt);
    
    $statusUpdates = [];
    while ($status = mysqli_fetch_assoc($statusResult)) {
        $statusUpdates[$status['status']] = $status;
    }
    
    $order['status_updates'] = $statusUpdates;
    
    // Adjust total amount if tax should be excluded
    if ($excludeTax) {
        $order['total_amount'] = $order['total_amount'] - $order['tax'];
    }
    
    echo json_encode(['success' => true, 'order' => $order]);
}

// Function to create a new order
function createOrder() {
    global $conn;
    
    // Start transaction
    mysqli_begin_transaction($conn);
    
    try {
        // Get form data
        $customerName = $_POST['customerName'] ?? '';
        $customerEmail = $_POST['customerEmail'] ?? '';
        $customerPhone = $_POST['customerPhone'] ?? '';
        $shippingAddress = $_POST['shippingAddress'] ?? '';
        $orderDate = $_POST['orderDate'] ?? date('Y-m-d');
        $status = $_POST['orderStatus'] ?? 'pending';
        $paymentMethod = $_POST['paymentMethod'] ?? 'cash';
        $discount = floatval($_POST['discount'] ?? 0);
        $notes = $_POST['notes'] ?? '';
        
        // Validate required fields
        if (empty($customerName) || empty($orderDate) || empty($status) || empty($paymentMethod)) {
            throw new Exception('Required fields are missing');
        }
        
        // Validate products
        $products = $_POST['products'] ?? [];
        $quantities = $_POST['quantities'] ?? [];
        $prices = $_POST['prices'] ?? [];
        
        if (empty($products) || count($products) === 0) {
            throw new Exception('Order must have at least one product');
        }
        
        // Calculate order totals
        $subtotal = 0;
        for ($i = 0; $i < count($products); $i++) {
            $price = floatval($prices[$i]);
            $quantity = intval($quantities[$i]);
            $subtotal += $price * $quantity;
        }
        
        $tax = $subtotal * 0.12; // 12% tax
        $totalAmount = $subtotal + $tax - $discount;
        
        // Generate order ID (format: ORD-YYMMDD-XXXXX)
        $orderPrefix = 'ORD-' . date('ymd') . '-';
        $orderSuffix = mt_rand(10000, 99999);
        $orderId = $orderPrefix . $orderSuffix;
        
        // Insert order
        $query = "
            INSERT INTO orders (
                order_id, customer_name, customer_email, customer_phone, 
                shipping_address, order_date, status, payment_method,
                subtotal, tax, discount, total_amount, notes, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
        ";
        
        $stmt = mysqli_prepare($conn, $query);
        mysqli_stmt_bind_param(
            $stmt, 
            'ssssssssdddds', 
            $orderId, $customerName, $customerEmail, $customerPhone,
            $shippingAddress, $orderDate, $status, $paymentMethod,
            $subtotal, $tax, $discount, $totalAmount, $notes
        );
        
        $result = mysqli_stmt_execute($stmt);
        
        if (!$result) {
            throw new Exception('Failed to create order: ' . mysqli_error($conn));
        }
        
        // Insert order items
        for ($i = 0; $i < count($products); $i++) {
            $productId = $products[$i];
            $quantity = intval($quantities[$i]);
            $price = floatval($prices[$i]);
            
            $itemQuery = "
                INSERT INTO order_items (order_id, product_id, quantity, price)
                VALUES (?, ?, ?, ?)
            ";
            
            $stmt = mysqli_prepare($conn, $itemQuery);
            mysqli_stmt_bind_param($stmt, 'ssid', $orderId, $productId, $quantity, $price);
            
            $itemResult = mysqli_stmt_execute($stmt);
            
            if (!$itemResult) {
                throw new Exception('Failed to add order item: ' . mysqli_error($conn));
            }
            
            // Check if product uses batch tracking
            $checkBatchQuery = "SELECT batch_tracking FROM products WHERE product_id = ?";
            $stmt = mysqli_prepare($conn, $checkBatchQuery);
            mysqli_stmt_bind_param($stmt, "s", $productId);
            mysqli_stmt_execute($stmt);
            $result = mysqli_stmt_get_result($stmt);
            $product = mysqli_fetch_assoc($result);
            
            if ($product && $product['batch_tracking'] == 1) {
                // Handle batch-tracked inventory reduction
                $batchResult = reduceProductFromBatches($productId, $quantity, $conn);
                
                if (!$batchResult) {
                    throw new Exception('Insufficient batch inventory for product: ' . $productId);
                }
            }
            
            // Update product stock
            $updateStockQuery = "
                UPDATE products 
                SET stocks = stocks - ? 
                WHERE product_id = ?
            ";
            
            $stmt = mysqli_prepare($conn, $updateStockQuery);
            mysqli_stmt_bind_param($stmt, 'is', $quantity, $productId);
            
            $updateResult = mysqli_stmt_execute($stmt);
            
            if (!$updateResult) {
                throw new Exception('Failed to update product stock: ' . mysqli_error($conn));
            }
            
            // Update product status based on new stock level
            $updateStatusQuery = "
                UPDATE products 
                SET status = CASE
                    WHEN stocks <= 0 THEN 'Out of Stock'
                    WHEN stocks <= 20 THEN 'Low Stock'
                    ELSE 'In Stock'
                END
                WHERE product_id = ?
            ";
            
            $stmt = mysqli_prepare($conn, $updateStatusQuery);
            mysqli_stmt_bind_param($stmt, 's', $productId);
            mysqli_stmt_execute($stmt);
        }
        
        // Add status history
        $historyQuery = "
            INSERT INTO order_status_history (order_id, status, updated_at)
            VALUES (?, ?, NOW())
        ";
        
        $stmt = mysqli_prepare($conn, $historyQuery);
        mysqli_stmt_bind_param($stmt, 'ss', $orderId, $status);
        
        $historyResult = mysqli_stmt_execute($stmt);
        
        if (!$historyResult) {
            throw new Exception('Failed to add status history: ' . mysqli_error($conn));
        }
        
        // Commit transaction
        mysqli_commit($conn);
        
        echo json_encode(['success' => true, 'message' => 'Order created successfully', 'order_id' => $orderId]);
    } catch (Exception $e) {
        // Rollback transaction on error
        mysqli_rollback($conn);
        
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
}

// Function to update an existing order
function updateOrder() {
    global $conn;
    
    // Start transaction
    mysqli_begin_transaction($conn);
    
    try {
        // Get form data
        $orderId = $_POST['orderId'] ?? '';
        $customerName = $_POST['customerName'] ?? '';
        $customerEmail = $_POST['customerEmail'] ?? '';
        $customerPhone = $_POST['customerPhone'] ?? '';
        $shippingAddress = $_POST['shippingAddress'] ?? '';
        $orderDate = $_POST['orderDate'] ?? date('Y-m-d');
        $status = $_POST['orderStatus'] ?? 'pending';
        $paymentMethod = $_POST['paymentMethod'] ?? 'cash';
        $discount = floatval($_POST['discount'] ?? 0);
        $notes = $_POST['notes'] ?? '';
        
        // Validate required fields
        if (empty($orderId) || empty($customerName) || empty($orderDate) || empty($status) || empty($paymentMethod)) {
            throw new Exception('Required fields are missing');
        }
        
        // Check if order exists
        $checkQuery = "SELECT status FROM orders WHERE order_id = ?";
        $stmt = mysqli_prepare($conn, $checkQuery);
        mysqli_stmt_bind_param($stmt, 's', $orderId);
        mysqli_stmt_execute($stmt);
        $checkResult = mysqli_stmt_get_result($stmt);
        
        if (mysqli_num_rows($checkResult) === 0) {
            throw new Exception('Order not found');
        }
        
        $currentStatus = mysqli_fetch_assoc($checkResult)['status'];
        
        // Validate products
        $products = $_POST['products'] ?? [];
        $quantities = $_POST['quantities'] ?? [];
        $prices = $_POST['prices'] ?? [];
        
        if (empty($products) || count($products) === 0) {
            throw new Exception('Order must have at least one product');
        }
        
        // Calculate order totals
        $subtotal = 0;
        for ($i = 0; $i < count($products); $i++) {
            $price = floatval($prices[$i]);
            $quantity = intval($quantities[$i]);
            $subtotal += $price * $quantity;
        }
        
        $tax = $subtotal * 0.12; // 12% tax
        $totalAmount = $subtotal + $tax - $discount;
        
        // Get current order items to restore stock
        $currentItemsQuery = "
            SELECT product_id, quantity 
            FROM order_items 
            WHERE order_id = ?
        ";
        
        $stmt = mysqli_prepare($conn, $currentItemsQuery);
        mysqli_stmt_bind_param($stmt, 's', $orderId);
        mysqli_stmt_execute($stmt);
        $currentItemsResult = mysqli_stmt_get_result($stmt);
        
        $currentItems = [];
        while ($item = mysqli_fetch_assoc($currentItemsResult)) {
            $currentItems[$item['product_id']] = $item['quantity'];
        }
        
        // Restore stock for current items
        foreach ($currentItems as $productId => $quantity) {
            // Check if product uses batch tracking
            $checkBatchQuery = "SELECT batch_tracking FROM products WHERE product_id = ?";
            $stmt = mysqli_prepare($conn, $checkBatchQuery);
            mysqli_stmt_bind_param($stmt, "s", $productId);
            mysqli_stmt_execute($stmt);
            $result = mysqli_stmt_get_result($stmt);
            $product = mysqli_fetch_assoc($result);
            
            if ($product && $product['batch_tracking'] == 1) {
                // For batch-tracked products, we would ideally restore to specific batches
                // This is a simplified approach that just adds back to the most recent batch
                $batchQuery = "SELECT batch_id FROM product_batches 
                              WHERE product_id = ? 
                              ORDER BY created_at DESC LIMIT 1";
                $stmt = mysqli_prepare($conn, $batchQuery);
                mysqli_stmt_bind_param($stmt, "s", $productId);
                mysqli_stmt_execute($stmt);
                $batchResult = mysqli_stmt_get_result($stmt);
                
                if ($batch = mysqli_fetch_assoc($batchResult)) {
                    $updateBatchQuery = "UPDATE product_batches 
                                        SET quantity = quantity + ? 
                                        WHERE batch_id = ?";
                    $stmt = mysqli_prepare($conn, $updateBatchQuery);
                    mysqli_stmt_bind_param($stmt, "ii", $quantity, $batch['batch_id']);
                    mysqli_stmt_execute($stmt);
                }
            }
            
            $restoreStockQuery = "
                UPDATE products 
                SET stocks = stocks + ? 
                WHERE product_id = ?
            ";
            
            $stmt = mysqli_prepare($conn, $restoreStockQuery);
            mysqli_stmt_bind_param($stmt, 'is', $quantity, $productId);
            mysqli_stmt_execute($stmt);
        }
        
        // Delete current order items
        $deleteItemsQuery = "DELETE FROM order_items WHERE order_id = ?";
        $stmt = mysqli_prepare($conn, $deleteItemsQuery);
        mysqli_stmt_bind_param($stmt, 's', $orderId);
        $deleteResult = mysqli_stmt_execute($stmt);
        
        if (!$deleteResult) {
            throw new Exception('Failed to update order items: ' . mysqli_error($conn));
        }
        
        // Update order
        $query = "
            UPDATE orders 
            SET 
                customer_name = ?, 
                customer_email = ?, 
                customer_phone = ?,
                shipping_address = ?, 
                order_date = ?, 
                status = ?, 
                payment_method = ?,
                subtotal = ?, 
                tax = ?, 
                discount = ?, 
                total_amount = ?, 
                notes = ?,
                updated_at = NOW()
            WHERE order_id = ?
        ";
        
        $stmt = mysqli_prepare($conn, $query);
        mysqli_stmt_bind_param(
            $stmt, 
            'sssssssddddss', 
            $customerName, $customerEmail, $customerPhone,
            $shippingAddress, $orderDate, $status, $paymentMethod,
            $subtotal, $tax, $discount, $totalAmount, $notes,
            $orderId
        );
        
        $result = mysqli_stmt_execute($stmt);
        
        if (!$result) {
            throw new Exception('Failed to update order: ' . mysqli_error($conn));
        }
        
        // Insert new order items
        for ($i = 0; $i < count($products); $i++) {
            $productId = $products[$i];
            $quantity = intval($quantities[$i]);
            $price = floatval($prices[$i]);
            
            $itemQuery = "
                INSERT INTO order_items (order_id, product_id, quantity, price)
                VALUES (?, ?, ?, ?)
            ";
            
            $stmt = mysqli_prepare($conn, $itemQuery);
            mysqli_stmt_bind_param($stmt, 'ssid', $orderId, $productId, $quantity, $price);
            
            $itemResult = mysqli_stmt_execute($stmt);
            
            if (!$itemResult) {
                throw new Exception('Failed to add order item: ' . mysqli_error($conn));
            }
            
            // Check if product uses batch tracking
            $checkBatchQuery = "SELECT batch_tracking FROM products WHERE product_id = ?";
            $stmt = mysqli_prepare($conn, $checkBatchQuery);
            mysqli_stmt_bind_param($stmt, "s", $productId);
            mysqli_stmt_execute($stmt);
            $result = mysqli_stmt_get_result($stmt);
            $product = mysqli_fetch_assoc($result);
            
            if ($product && $product['batch_tracking'] == 1) {
                // Handle batch-tracked inventory reduction
                $batchResult = reduceProductFromBatches($productId, $quantity, $conn);
                
                if (!$batchResult) {
                    throw new Exception('Insufficient batch inventory for product: ' . $productId);
                }
            }
            
            // Update product stock
            $updateStockQuery = "
                UPDATE products 
                SET stocks = stocks - ? 
                WHERE product_id = ?
            ";
            
            $stmt = mysqli_prepare($conn, $updateStockQuery);
            mysqli_stmt_bind_param($stmt, 'is', $quantity, $productId);
            
            $updateResult = mysqli_stmt_execute($stmt);
            
            if (!$updateResult) {
                throw new Exception('Failed to update product stock: ' . mysqli_error($conn));
            }
            
            // Update product status based on new stock level
            $updateStatusQuery = "
                UPDATE products 
                SET status = CASE
                    WHEN stocks <= 0 THEN 'Out of Stock'
                    WHEN stocks <= 20 THEN 'Low Stock'
                    ELSE 'In Stock'
                END
                WHERE product_id = ?
            ";
            
            $stmt = mysqli_prepare($conn, $updateStatusQuery);
            mysqli_stmt_bind_param($stmt, 's', $productId);
            mysqli_stmt_execute($stmt);
        }
        
        // Add status history if status changed
        if ($status !== $currentStatus) {
            $historyQuery = "
                INSERT INTO order_status_history (order_id, status, updated_at)
                VALUES (?, ?, NOW())
            ";
            
            $stmt = mysqli_prepare($conn, $historyQuery);
            mysqli_stmt_bind_param($stmt, 'ss', $orderId, $status);
            
            $historyResult = mysqli_stmt_execute($stmt);
            
            if (!$historyResult) {
                throw new Exception('Failed to add status history: ' . mysqli_error($conn));
            }
        }
        
        // Commit transaction
        mysqli_commit($conn);
        
        echo json_encode(['success' => true, 'message' => 'Order updated successfully']);
    } catch (Exception $e) {
        // Rollback transaction on error
        mysqli_rollback($conn);
        
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
}

// Function to delete an order
function deleteOrder() {
    global $conn;
    
    // Start transaction
    mysqli_begin_transaction($conn);
    
    try {
        $orderId = $_POST['order_id'] ?? '';
        
        if (empty($orderId)) {
            throw new Exception('Order ID is required');
        }
        
        // Get current order items to restore stock
        $itemsQuery = "SELECT product_id, quantity FROM order_items WHERE order_id = ?";
        $stmt = mysqli_prepare($conn, $itemsQuery);
        mysqli_stmt_bind_param($stmt, 's', $orderId);
        mysqli_stmt_execute($stmt);
        $itemsResult = mysqli_stmt_get_result($stmt);
        
        $items = [];
        while ($item = mysqli_fetch_assoc($itemsResult)) {
            $items[] = $item;
        }
        
        // Restore stock for each item
        foreach ($items as $item) {
            $productId = $item['product_id'];
            $quantity = $item['quantity'];
            
            // Check if product uses batch tracking
            $checkBatchQuery = "SELECT batch_tracking FROM products WHERE product_id = ?";
            $stmt = mysqli_prepare($conn, $checkBatchQuery);
            mysqli_stmt_bind_param($stmt, "s", $productId);
            mysqli_stmt_execute($stmt);
            $result = mysqli_stmt_get_result($stmt);
            $product = mysqli_fetch_assoc($result);
            
            if ($product && $product['batch_tracking'] == 1) {
                // For batch-tracked products, add back to the most recent batch
                $batchQuery = "SELECT batch_id FROM product_batches 
                              WHERE product_id = ? 
                              ORDER BY created_at DESC LIMIT 1";
                $stmt = mysqli_prepare($conn, $batchQuery);
                mysqli_stmt_bind_param($stmt, "s", $productId);
                mysqli_stmt_execute($stmt);
                $batchResult = mysqli_stmt_get_result($stmt);
                
                if ($batch = mysqli_fetch_assoc($batchResult)) {
                    $updateBatchQuery = "UPDATE product_batches 
                                        SET quantity = quantity + ? 
                                        WHERE batch_id = ?";
                    $stmt = mysqli_prepare($conn, $updateBatchQuery);
                    mysqli_stmt_bind_param($stmt, "ii", $quantity, $batch['batch_id']);
                    mysqli_stmt_execute($stmt);
                }
            }
            
            $updateStockQuery = "
                UPDATE products 
                SET stocks = stocks + ? 
                WHERE product_id = ?
            ";
            
            $stmt = mysqli_prepare($conn, $updateStockQuery);
            mysqli_stmt_bind_param($stmt, 'is', $quantity, $productId);
            mysqli_stmt_execute($stmt);
            
            // Update product status based on new stock level
            $updateStatusQuery = "
                UPDATE products 
                SET status = CASE
                    WHEN stocks <= 0 THEN 'Out of Stock'
                    WHEN stocks <= 20 THEN 'Low Stock'
                    ELSE 'In Stock'
                END
                WHERE product_id = ?
            ";
            
            $stmt = mysqli_prepare($conn, $updateStatusQuery);
            mysqli_stmt_bind_param($stmt, 's', $productId);
            mysqli_stmt_execute($stmt);
        }
        
        // Delete order items
        $deleteItemsQuery = "DELETE FROM order_items WHERE order_id = ?";
        $stmt = mysqli_prepare($conn, $deleteItemsQuery);
        mysqli_stmt_bind_param($stmt, 's', $orderId);
        mysqli_stmt_execute($stmt);
        
        // Delete order status history
        $deleteHistoryQuery = "DELETE FROM order_status_history WHERE order_id = ?";
        $stmt = mysqli_prepare($conn, $deleteHistoryQuery);
        mysqli_stmt_bind_param($stmt, 's', $orderId);
        mysqli_stmt_execute($stmt);
        
        // Delete order
        $deleteOrderQuery = "DELETE FROM orders WHERE order_id = ?";
        $stmt = mysqli_prepare($conn, $deleteOrderQuery);
        mysqli_stmt_bind_param($stmt, 's', $orderId);
        $result = mysqli_stmt_execute($stmt);
        
        if (!$result) {
            throw new Exception('Failed to delete order: ' . mysqli_error($conn));
        }
        
        // Commit transaction
        mysqli_commit($conn);
        
        echo json_encode(['success' => true, 'message' => 'Order deleted successfully']);
    } catch (Exception $e) {
        // Rollback transaction on error
        mysqli_rollback($conn);
        
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
}

// Function to get products for order form
function getProducts() {
    global $conn;
    
    $query = "
        SELECT 
            product_id, 
            product_name, 
            price, 
            stocks,
            status
        FROM products
        WHERE status != 'Archived'
        ORDER BY product_name
    ";
    
    $result = mysqli_query($conn, $query);
    
    if (!$result) {
        echo json_encode(['success' => false, 'message' => 'Failed to fetch products: ' . mysqli_error($conn)]);
        return;
    }
    
    $products = [];
    while ($row = mysqli_fetch_assoc($result)) {
        $products[] = $row;
    }
    
    echo json_encode(['success' => true, 'products' => $products]);
}

// Function to export orders to CSV
function exportOrders() {
    global $conn;
    
    // Get current date for filename
    $today = date('Y-m-d');
    $filename = "pinana_gourmet_orders_" . $today . ".csv";
    
    // Set headers for CSV download
    header('Content-Type: text/csv; charset=utf-8');
    header('Content-Disposition: attachment; filename="' . $filename . '"');
    
    // Create output stream
    $output = fopen('php://output', 'w');
    
    // Add UTF-8 BOM for Excel compatibility
    fprintf($output, chr(0xEF).chr(0xBB).chr(0xBF));
    
    // Add CSV header row with better formatting
    fputcsv($output, [
        'Order ID', 
        'Customer Name', 
        'Customer Email', 
        'Customer Phone',
        'Shipping Address',
        'Order Date', 
        'Order Time',
        'Status', 
        'Payment Method',
        'Subtotal (₱)',
        'Tax (₱)',
        'Discount (₱)',
        'Total Amount (₱)',
        'Number of Items',
        'Products',
        'Notes'
    ]);
    
    // Get filter parameters
    $status = isset($_GET['status']) ? $_GET['status'] : 'all';
    $dateRange = isset($_GET['date_range']) ? $_GET['date_range'] : 'all';
    $search = isset($_GET['search']) ? $_GET['search'] : '';
    $excludeTax = isset($_GET['exclude_tax']) && $_GET['exclude_tax'] === 'true';
    
    // Build WHERE clause
    $whereClause = "WHERE 1=1";
    $params = [];
    
    // Status filter
    if ($status !== 'all') {
        $whereClause .= " AND o.status = ?";
        $params[] = $status;
    }
    
    // Date range filter
    if ($dateRange !== 'all') {
        $today = date('Y-m-d');
        
        switch ($dateRange) {
            case 'today':
                $whereClause .= " AND DATE(o.order_date) = ?";
                $params[] = $today;
                break;
            case 'week':
                $weekAgo = date('Y-m-d', strtotime('-7 days'));
                $whereClause .= " AND o.order_date BETWEEN ? AND ?";
                $params[] = $weekAgo;
                $params[] = $today . ' 23:59:59';
                break;
            case 'month':
                $monthAgo = date('Y-m-d', strtotime('-30 days'));
                $whereClause .= " AND o.order_date BETWEEN ? AND ?";
                $params[] = $monthAgo;
                $params[] = $today . ' 23:59:59';
                break;
            case 'custom':
                if (isset($_GET['start_date']) && isset($_GET['end_date'])) {
                    $startDate = $_GET['start_date'];
                    $endDate = $_GET['end_date'];
                    $whereClause .= " AND o.order_date BETWEEN ? AND ?";
                    $params[] = $startDate;
                    $params[] = $endDate . ' 23:59:59';
                }
                break;
        }
    }
    
    // Search filter
    if (!empty($search)) {
        $whereClause .= " AND (o.order_id LIKE ? OR o.customer_name LIKE ? OR o.customer_email LIKE ?)";
        $searchTerm = "%$search%";
        $params[] = $searchTerm;
        $params[] = $searchTerm;
        $params[] = $searchTerm;
    }
    
    // Get orders
    $query = "
        SELECT 
            o.order_id, 
            o.customer_name, 
            o.customer_email, 
            o.customer_phone,
            o.shipping_address,
            o.order_date,
            o.status, 
            o.payment_method,
            o.subtotal,
            o.tax,
            o.discount,
            o.total_amount,
            o.notes,
            (SELECT COUNT(*) FROM order_items WHERE order_id = o.order_id) as item_count
        FROM orders o
        $whereClause
        ORDER BY o.order_date DESC
    ";
    
    $stmt = mysqli_prepare($conn, $query);
    
    if (!empty($params)) {
        $types = str_repeat('s', count($params));
        mysqli_stmt_bind_param($stmt, $types, ...$params);
    }
    
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);
    
    // Write orders to CSV
    while ($order = mysqli_fetch_assoc($result)) {
        // Get order items
        $itemsQuery = "
            SELECT 
                p.product_name,
                oi.quantity,
                oi.price
            FROM order_items oi
            JOIN products p ON oi.product_id = p.product_id
            WHERE oi.order_id = ?
        ";
        
        $stmt = mysqli_prepare($conn, $itemsQuery);
        mysqli_stmt_bind_param($stmt, 's', $order['order_id']);
        mysqli_stmt_execute($stmt);
        $itemsResult = mysqli_stmt_get_result($stmt);
        
        $items = [];
        while ($item = mysqli_fetch_assoc($itemsResult)) {
            $items[] = "{$item['product_name']} ({$item['quantity']} x ₱{$item['price']})";
        }
        
        // Format date and time separately
        $orderDateTime = new DateTime($order['order_date']);
        $formattedDate = $orderDateTime->format('Y-m-d');
        $formattedTime = $orderDateTime->format('H:i:s');
        
        // Format status with proper capitalization
        $formattedStatus = ucfirst($order['status']);
        
        // Format payment method
        $formattedPaymentMethod = str_replace('_', ' ', ucwords($order['payment_method']));
        
        // Format currency values
        $subtotal = number_format($order['subtotal'], 2);
        $tax = number_format($order['tax'], 2);
        $discount = number_format($order['discount'], 2);
        $totalAmount = $excludeTax ? number_format($order['total_amount'] - $order['tax'], 2) : number_format($order['total_amount'], 2);
        
        // Create CSV row
        $csvRow = [
            $order['order_id'],
            $order['customer_name'],
            $order['customer_email'],
            $order['customer_phone'],
            $order['shipping_address'],
            $formattedDate,
            $formattedTime,
            $formattedStatus,
            $formattedPaymentMethod,
            $subtotal,
            $tax,
            $discount,
            $totalAmount,
            $order['item_count'],
            implode('; ', $items),
            $order['notes']
        ];
        
        // Write order to CSV
        fputcsv($output, $csvRow);
    }
    
    fclose($output);
    exit;
}

/**
 * Function to get all delivered orders
 */
function getDeliveredOrders() {
    global $conn;
    
    try {
        // Check database connection
        if (!$conn) {
            throw new Exception("Database connection failed");
        }
        
        // Prepare the query to get all delivered orders
        $sql = "SELECT 
                    o.order_id, 
                    o.customer_name, 
                    o.customer_email,
                    o.customer_phone,
                    o.shipping_address,
                    o.order_date,
                    o.status,
                    o.payment_method,
                    o.total_amount,
                    (SELECT COUNT(*) FROM order_items WHERE order_id = o.order_id) as item_count
                FROM 
                    orders o
                WHERE 
                    o.status = 'delivered'
                ORDER BY 
                    o.order_date DESC";
        
        $result = mysqli_query($conn, $sql);
        
        if (!$result) {
            throw new Exception('Database query error: ' . mysqli_error($conn));
        }
        
        $orders = [];
        while ($row = mysqli_fetch_assoc($result)) {
            $orders[] = $row;
        }
        
        // Get statistics for delivered orders
        $statsQuery = "SELECT 
                        COUNT(*) as total_count,
                        SUM(total_amount) as total_revenue,
                        AVG(total_amount) as average_order
                      FROM orders 
                      WHERE status = 'delivered'";
        
        $statsResult = mysqli_query($conn, $statsQuery);
        
        if (!$statsResult) {
            throw new Exception('Stats query error: ' . mysqli_error($conn));
        }
        
        $stats = mysqli_fetch_assoc($statsResult);
        
        // Return the orders as JSON
        echo json_encode([
            'success' => true,
            'orders' => $orders,
            'total_count' => count($orders),
            'stats' => $stats
        ]);
        
    } catch (Exception $e) {
        // Log the error (if you have error logging)
        error_log('Error in getDeliveredOrders: ' . $e->getMessage());
        
        // Return error response
        echo json_encode([
            'success' => false,
            'message' => $e->getMessage()
        ]);
    }
}
?>
