<?php
// Start session and include database connection
session_start();
require_once 'db_connection.php';

// Set header to return JSON
header('Content-Type: application/json');

// Check if user is logged in
if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'User not logged in']);
    exit;
}

$retailer_id = $_SESSION['user_id'];

try {
    // Get all completed orders for this retailer with their products
    $query = "SELECT ro.order_id, ro.po_number, ro.order_date, ro.status, ro.total_amount,
                     roi.item_id, roi.product_id, roi.quantity, roi.unit_price, roi.total_price,
                     p.retail_price, p.wholesale_price, p.category, roi.product_name
              FROM retailer_orders ro
              JOIN retailer_order_items roi ON ro.order_id = roi.order_id
              LEFT JOIN products p ON roi.product_id = p.product_id
              WHERE ro.retailer_id = ? AND (ro.status = 'completed' OR ro.status = 'delivered' OR ro.status = 'picked up')
              ORDER BY ro.order_date DESC, roi.product_name ASC";
    
    $stmt = $conn->prepare($query);
    $stmt->bind_param('i', $retailer_id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    // Group results by order
    $orders = [];
    while ($row = $result->fetch_assoc()) {
        $order_id = $row['order_id'];
        
        // If this is a new order, initialize it
        if (!isset($orders[$order_id])) {
            $orders[$order_id] = [
                'order_id' => $order_id,
                'po_number' => $row['po_number'],
                'order_number' => $row['po_number'] ?: ('RO-' . str_pad($order_id, 6, '0', STR_PAD_LEFT)),
                'order_date' => $row['order_date'],
                'order_date_formatted' => date('M d, Y', strtotime($row['order_date'])),
                'status' => $row['status'],
                'total_amount' => $row['total_amount'],
                'total_amount_formatted' => '₱' . number_format($row['total_amount'], 2),
                'products' => []
            ];
        }
        
        // Get current retail price from product_pricing table if available
        $pricingQuery = "SELECT retail_price, wholesale_price, last_updated 
                         FROM product_pricing 
                         WHERE retailer_id = ? AND product_id = ?
                         ORDER BY last_updated DESC
                         LIMIT 1";
        
        $pricingStmt = $conn->prepare($pricingQuery);
        $pricingStmt->bind_param('is', $retailer_id, $row['product_id']);
        $pricingStmt->execute();
        $pricingResult = $pricingStmt->get_result();
        
        $customRetailPrice = null;
        $customWholesalePrice = null;
        $lastUpdated = null;
        
        if ($pricingRow = $pricingResult->fetch_assoc()) {
            $customRetailPrice = $pricingRow['retail_price'];
            $customWholesalePrice = $pricingRow['wholesale_price'];
            $lastUpdated = $pricingRow['last_updated'];
        }
        
        // Get price history
        $historyQuery = "SELECT retail_price, wholesale_price, last_updated 
                         FROM product_pricing 
                         WHERE retailer_id = ? AND product_id = ?
                         ORDER BY last_updated DESC
                         LIMIT 5";
        
        $historyStmt = $conn->prepare($historyQuery);
        $historyStmt->bind_param('is', $retailer_id, $row['product_id']);
        $historyStmt->execute();
        $historyResult = $historyStmt->get_result();
        
        $priceHistory = [];
        while ($historyRow = $historyResult->fetch_assoc()) {
            $priceHistory[] = [
                'retail_price' => $historyRow['retail_price'],
                'wholesale_price' => $historyRow['wholesale_price'],
                'last_updated' => $historyRow['last_updated'],
                'formatted_date' => date('M d, Y H:i', strtotime($historyRow['last_updated']))
            ];
        }
        
        // Calculate suggested retail price (20% markup from unit price as default)
        $suggestedRetailPrice = round($row['unit_price'] * 1.2, 2);
        
        // Add product to the order
        $orders[$order_id]['products'][] = [
            'item_id' => $row['item_id'],
            'product_id' => $row['product_id'],
            'product_name' => $row['product_name'],
            'quantity' => $row['quantity'],
            'unit_price' => $row['unit_price'],
            'unit_price_formatted' => '₱' . number_format($row['unit_price'], 2),
            'retail_price' => $customRetailPrice ?: $row['retail_price'] ?: $suggestedRetailPrice,
            'retail_price_formatted' => '₱' . number_format($customRetailPrice ?: $row['retail_price'] ?: $suggestedRetailPrice, 2),
            'wholesale_price' => $customWholesalePrice ?: $row['wholesale_price'] ?: $row['unit_price'],
            'wholesale_price_formatted' => '₱' . number_format($customWholesalePrice ?: $row['wholesale_price'] ?: $row['unit_price'], 2),
            'suggested_retail_price' => $suggestedRetailPrice,
            'suggested_retail_price_formatted' => '₱' . number_format($suggestedRetailPrice, 2),
            'product_photo' => $row['product_photo'],
            'category' => $row['category'],
            'custom_price_set' => ($customRetailPrice !== null),
            'last_updated' => $lastUpdated,
            'last_updated_formatted' => $lastUpdated ? date('M d, Y H:i', strtotime($lastUpdated)) : 'Never',
            'price_history' => $priceHistory
        ];
    }
    
    echo json_encode([
        'success' => true,
        'orders' => array_values($orders)
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false, 
        'message' => 'Error: ' . $e->getMessage()
    ]);
}
?>
