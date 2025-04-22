<?php
// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Include database connection
require_once 'db_connection.php';

// Function to validate and sanitize input
function sanitize($conn, $input) {
    return mysqli_real_escape_string($conn, trim($input));
}

// Check if form was submitted
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    try {
        // Start transaction
        mysqli_begin_transaction($conn);
        
        // Get form data
        $order_id = sanitize($conn, $_POST['order_id']);
        $product_ids = $_POST['product_ids'] ?? [];
        $quantities = $_POST['quantities'] ?? [];
        $prices = $_POST['prices'] ?? [];
        
        // Validate required fields
        if (empty($order_id) || empty($product_ids) || count($product_ids) === 0) {
            throw new Exception("Required fields are missing");
        }
        
        // Get the database ID for the order
        $check_sql = "SELECT id FROM orders WHERE order_id = ?";
        $check_stmt = mysqli_prepare($conn, $check_sql);
        mysqli_stmt_bind_param($check_stmt, "s", $order_id);
        mysqli_stmt_execute($check_stmt);
        $result = mysqli_stmt_get_result($check_stmt);
        
        if (mysqli_num_rows($result) === 0) {
            throw new Exception("Order not found");
        }
        
        $order_db_id = mysqli_fetch_assoc($result)['id'];
        
        // Process order items
        for ($i = 0; $i < count($product_ids); $i++) {
            if (empty($product_ids[$i])) continue;
            
            $product_id = sanitize($conn, $product_ids[$i]);
            $quantity = intval($quantities[$i]);
            $price = floatval($prices[$i]);
            
            // Get product name
            $product_sql = "SELECT product_name FROM products WHERE product_id = ?";
            $product_stmt = mysqli_prepare($conn, $product_sql);
            mysqli_stmt_bind_param($product_stmt, "s", $product_id);
            mysqli_stmt_execute($product_stmt);
            $product_result = mysqli_stmt_get_result($product_stmt);
            $product_name = "";
            
            if ($product_row = mysqli_fetch_assoc($product_result)) {
                $product_name = $product_row['product_name'];
            }
            
            $item_sql = "INSERT INTO order_items (
                order_id, 
                product_id,
                product_name,
                quantity, 
                price
            ) VALUES (?, ?, ?, ?, ?)";
            
            $item_stmt = mysqli_prepare($conn, $item_sql);
            mysqli_stmt_bind_param(
                $item_stmt, 
                "sssid", 
                $order_db_id, 
                $product_id,
                $product_name,
                $quantity, 
                $price
            );
            
            if (!mysqli_stmt_execute($item_stmt)) {
                throw new Exception("Error adding order item: " . mysqli_stmt_error($item_stmt));
            }
        }
        
        // Update order totals - Calculate total directly from subtotal minus discount (no tax)
        $update_totals_sql = "
            UPDATE orders 
            SET 
                subtotal = (SELECT SUM(quantity * price) FROM order_items WHERE order_id = ?),
                total_amount = (SELECT SUM(quantity * price) FROM order_items WHERE order_id = ?) - discount,
                updated_at = NOW()
            WHERE id = ?
        ";
        
        $update_totals_stmt = mysqli_prepare($conn, $update_totals_sql);
        mysqli_stmt_bind_param($update_totals_stmt, "iii", $order_db_id, $order_db_id, $order_db_id);
        
        if (!mysqli_stmt_execute($update_totals_stmt)) {
            throw new Exception("Error updating order totals: " . mysqli_stmt_error($update_totals_stmt));
        }
        
        // Commit transaction
        mysqli_commit($conn);
        
        // Return success response
        echo json_encode(['success' => true, 'message' => 'Order items added successfully']);
        
    } catch (Exception $e) {
        // Rollback transaction on error
        mysqli_rollback($conn);
        
        // Return error response
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
} else {
    // Not a POST request
    echo json_encode(['success' => false, 'message' => 'Invalid request method']);
}
?>
