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
        $order_id = isset($_POST['order_id']) ? sanitize($conn, $_POST['order_id']) : '';
        $customer_name = sanitize($conn, $_POST['customerName']);
        $customer_email = sanitize($conn, $_POST['customerEmail']);
        $customer_phone = sanitize($conn, $_POST['customerPhone']);
        $shipping_address = sanitize($conn, $_POST['shippingAddress']);
        $order_date = sanitize($conn, $_POST['orderDate']);
        $status = sanitize($conn, $_POST['orderStatus']);
        $payment_method = sanitize($conn, $_POST['paymentMethod']);
        $subtotal = floatval($_POST['subtotal']);
        $discount_percentage = floatval($_POST['orderDiscount']);
        $discount = floatval($_POST['discount']);
        $total_amount = floatval($_POST['totalAmount']);
        $notes = sanitize($conn, $_POST['orderNotes']);
        
        // Validate required fields
        if (empty($customer_name) || empty($shipping_address) || empty($order_date) || empty($status)) {
            throw new Exception("Required fields are missing");
        }
        
        // Validate products
        if (!isset($_POST['products']) || !is_array($_POST['products']) || count($_POST['products']) === 0) {
            throw new Exception("Order must have at least one product");
        }
        
        $products = $_POST['products'];
        $quantities = $_POST['quantities'];
        $prices = $_POST['prices'];
        
        
        // Check if order_id exists (update) or not (insert)
        if (!empty($order_id)) {
            // Get the database ID for the order
            $check_sql = "SELECT id FROM orders WHERE order_id = ?";
            $check_stmt = mysqli_prepare($conn, $check_sql);
            mysqli_stmt_bind_param($check_stmt, "s", $order_id);
            mysqli_stmt_execute($check_stmt);
            $result = mysqli_stmt_get_result($check_stmt);
            
            if (mysqli_num_rows($result) > 0) {
                // Update existing order
                $row = mysqli_fetch_assoc($result);
                $order_db_id = $row['id'];
                
                $update_sql = "UPDATE orders SET 
                    customer_name = ?, 
                    customer_email = ?, 
                    customer_phone = ?, 
                    shipping_address = ?, 
                    order_date = ?, 
                    status = ?, 
                    payment_method = ?, 
                    subtotal = ?, 
                    discount = ?, 
                    discount_percentage = ?, 
                    total_amount = ?, 
                    notes = ?,
                    updated_at = NOW()
                    WHERE id = ?";
                    
                $update_stmt = mysqli_prepare($conn, $update_sql);
                mysqli_stmt_bind_param(
                    $update_stmt, 
                    "sssssssddddsi", 
                    $customer_name, 
                    $customer_email, 
                    $customer_phone, 
                    $shipping_address, 
                    $order_date, 
                    $status, 
                    $payment_method, 
                    $subtotal, 
                    $discount, 
                    $discount_percentage, 
                    $total_amount, 
                    $notes,
                    $order_db_id
                );
                
                if (!mysqli_stmt_execute($update_stmt)) {
                    throw new Exception("Error updating order: " . mysqli_stmt_error($update_stmt));
                }
                
                // Delete existing order items to replace with new ones
                $delete_items_sql = "DELETE FROM order_items WHERE order_id = ?";
                $delete_items_stmt = mysqli_prepare($conn, $delete_items_sql);
                mysqli_stmt_bind_param($delete_items_stmt, "i", $order_db_id);
                
                if (!mysqli_stmt_execute($delete_items_stmt)) {
                    throw new Exception("Error deleting order items: " . mysqli_stmt_error($delete_items_stmt));
                }
                
                // Add status history if status changed
                $get_status_sql = "SELECT status FROM order_status_history WHERE order_id = ? ORDER BY updated_at DESC LIMIT 1";
                $get_status_stmt = mysqli_prepare($conn, $get_status_sql);
                mysqli_stmt_bind_param($get_status_stmt, "i", $order_db_id);
                mysqli_stmt_execute($get_status_stmt);
                $status_result = mysqli_stmt_get_result($get_status_stmt);
                
                if ($status_row = mysqli_fetch_assoc($status_result)) {
                    $current_status = $status_row['status'];
                    
                    if ($status !== $current_status) {
                        $status_sql = "INSERT INTO order_status_history (order_id, status, updated_at) VALUES (?, ?, NOW())";
                        $status_stmt = mysqli_prepare($conn, $status_sql);
                        mysqli_stmt_bind_param($status_stmt, "is", $order_db_id, $status);
                        
                        if (!mysqli_stmt_execute($status_stmt)) {
                            throw new Exception("Error recording order status: " . mysqli_stmt_error($status_stmt));
                        }
                    }
                }
            } else {
                throw new Exception("Order not found");
            }
        } else {
            // Generate new order ID
            $order_prefix = 'ORD-' . date('ymd') . '-';
            $order_suffix = mt_rand(10000, 99999);
            $order_id = $order_prefix . $order_suffix;
            
            // Insert new order
            $insert_sql = "INSERT INTO orders (
                order_id, 
                customer_name, 
                customer_email, 
                customer_phone, 
                shipping_address, 
                order_date, 
                status, 
                payment_method, 
                subtotal, 
                discount, 
                discount_percentage, 
                total_amount, 
                notes, 
                created_at, 
                updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())";
            
            $insert_stmt = mysqli_prepare($conn, $insert_sql);
            mysqli_stmt_bind_param(
                $insert_stmt, 
                "ssssssssdddds", 
                $order_id, 
                $customer_name, 
                $customer_email, 
                $customer_phone, 
                $shipping_address, 
                $order_date, 
                $status, 
                $payment_method, 
                $subtotal, 
                $discount, 
                $discount_percentage, 
                $total_amount, 
                $notes
            );
            
            if (!mysqli_stmt_execute($insert_stmt)) {
                throw new Exception("Error creating order: " . mysqli_stmt_error($insert_stmt));
            }
            
            $order_db_id = mysqli_insert_id($conn);
            
            // Insert order status history
            $status_sql = "INSERT INTO order_status_history (order_id, status, updated_at) VALUES (?, ?, NOW())";
            $status_stmt = mysqli_prepare($conn, $status_sql);
            mysqli_stmt_bind_param($status_stmt, "is", $order_db_id, $status);
            
            if (!mysqli_stmt_execute($status_stmt)) {
                throw new Exception("Error recording order status: " . mysqli_stmt_error($status_stmt));
            }
        }
        
        // Process order items
        for ($i = 0; $i < count($products); $i++) {
            if (empty($products[$i])) continue;
            
            $product_id = $products[$i];
            $quantity = intval($quantities[$i]);
            $unit_price = floatval($prices[$i]);
            
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
                "issid", 
                $order_db_id, 
                $product_id,
                $product_name,
                $quantity, 
                $unit_price
            );
            
            if (!mysqli_stmt_execute($item_stmt)) {
                throw new Exception("Error adding order item: " . mysqli_stmt_error($item_stmt));
            }
        }
        
        // Commit transaction
        mysqli_commit($conn);
        
        // Redirect back to orders page with success message
        header("Location: rt_orders.php?success=1&message=" . urlencode("Order saved successfully"));
        exit;
        
    } catch (Exception $e) {
        // Rollback transaction on error
        mysqli_rollback($conn);
        
        // Redirect back with error message
        header("Location: rt_orders.php?error=1&message=" . urlencode($e->getMessage()));
        exit;
    }
} else {
    // Not a POST request
    header("Location: rt_orders.php");
    exit;
}
?>
