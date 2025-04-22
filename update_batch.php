<?php
// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Include database connection
require_once 'db_connection.php';

// Set headers for JSON response
header('Content-Type: application/json');

// Check if the form was submitted
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        // Get form data
        $batch_id = $_POST['batchID'] ?? '';
        $batch_code = $_POST['batchCode'] ?? '';
        $quantity = intval($_POST['quantity'] ?? 0);
        $old_quantity = intval($_POST['oldQuantity'] ?? 0);
        $expiration_date = $_POST['expirationDate'] ?? '';
        $manufacturing_date = $_POST['manufacturingDate'] ?? null;
        $unit_cost = floatval($_POST['unitCost'] ?? 0);
        $product_id = $_POST['productID'] ?? '';
        
        // Validate required fields
        if (empty($batch_id) || empty($batch_code) || $quantity < 0 || empty($expiration_date) || empty($product_id)) {
            throw new Exception("Required fields are missing or invalid.");
        }
        
        // Check database connection
        if (!$conn) {
            throw new Exception("Database connection failed: " . mysqli_connect_error());
        }
        
        // Start transaction
        mysqli_begin_transaction($conn);
        
        // Update batch information
        $sql = "UPDATE product_batches 
                SET batch_code = ?,
                    quantity = ?,
                    expiration_date = ?,
                    manufacturing_date = ?,
                    unit_cost = ?,
                    updated_at = NOW()
                WHERE batch_id = ?";
        
        $stmt = mysqli_prepare($conn, $sql);
        
        if (!$stmt) {
            throw new Exception("Error preparing statement: " . mysqli_error($conn));
        }
        
        // Bind parameters
        mysqli_stmt_bind_param(
            $stmt, 
            "sisddi", 
            $batch_code, 
            $quantity, 
            $expiration_date, 
            $manufacturing_date, 
            $unit_cost,
            $batch_id
        );
        
        // Execute statement
        if (!mysqli_stmt_execute($stmt)) {
            throw new Exception("Error executing statement: " . mysqli_stmt_error($stmt));
        }
        
        // Calculate quantity difference
        $quantity_diff = $quantity - $old_quantity;
        
        // Update total stock in products table if quantity changed
        if ($quantity_diff != 0) {
            $update_sql = "UPDATE products 
                          SET stocks = stocks + ?, 
                              updated_at = NOW() 
                          WHERE product_id = ?";
            
            $update_stmt = mysqli_prepare($conn, $update_sql);
            
            if (!$update_stmt) {
                throw new Exception("Error preparing update statement: " . mysqli_error($conn));
            }
            
            // Bind parameters
            mysqli_stmt_bind_param($update_stmt, "is", $quantity_diff, $product_id);
            
            // Execute statement
            if (!mysqli_stmt_execute($update_stmt)) {
                throw new Exception("Error executing update statement: " . mysqli_stmt_error($update_stmt));
            }
            
            mysqli_stmt_close($update_stmt);
            
            // Update product status based on new stock level
            $status_sql = "UPDATE products 
                          SET status = CASE 
                                        WHEN stocks > 20 THEN 'In Stock' 
                                        WHEN stocks > 0 THEN 'Low Stock' 
                                        ELSE 'Out of Stock' 
                                      END 
                          WHERE product_id = ?";
            
            $status_stmt = mysqli_prepare($conn, $status_sql);
            
            if (!$status_stmt) {
                throw new Exception("Error preparing status update statement: " . mysqli_error($conn));
            }
            
            // Bind parameters
            mysqli_stmt_bind_param($status_stmt, "s", $product_id);
            
            // Execute statement
            if (!mysqli_stmt_execute($status_stmt)) {
                throw new Exception("Error executing status update statement: " . mysqli_stmt_error($status_stmt));
            }
            
            mysqli_stmt_close($status_stmt);
        }
        
        // Commit transaction
        mysqli_commit($conn);
        
        // Close statement
        mysqli_stmt_close($stmt);
        
        echo json_encode([
            'success' => true,
            'message' => 'Batch updated successfully!'
        ]);
        
    } catch (Exception $e) {
        // Rollback transaction on error
        if (isset($conn) && $conn) {
            mysqli_rollback($conn);
        }
        
        echo json_encode([
            'success' => false,
            'error' => $e->getMessage()
        ]);
    }
} else {
    echo json_encode([
        'success' => false,
        'error' => 'Invalid request method'
    ]);
}

// Close connection
if (isset($conn) && $conn) {
    mysqli_close($conn);
}
?>

