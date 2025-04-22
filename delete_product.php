<?php
// Include database connection
require_once 'db_connection.php';

// Set headers for JSON response
header('Content-Type: application/json');

// Check if the form was submitted
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        // Get product ID
        $product_id = $_POST['productID'] ?? '';
        
        // Validate product ID
        if (empty($product_id)) {
            throw new Exception("Product ID is required.");
        }
        
        // Check database connection
        if (!$conn) {
            throw new Exception("Database connection failed: " . mysqli_connect_error());
        }
        
        // Start transaction
        mysqli_begin_transaction($conn);
        
        // First, get the product photo path to delete the file if it exists
        $photo_query = "SELECT product_photo FROM products WHERE product_id = ?";
        $photo_stmt = mysqli_prepare($conn, $photo_query);
        
        if (!$photo_stmt) {
            throw new Exception("Error preparing statement: " . mysqli_error($conn));
        }
        
        mysqli_stmt_bind_param($photo_stmt, "s", $product_id);
        mysqli_stmt_execute($photo_stmt);
        mysqli_stmt_store_result($photo_stmt);
        
        if (mysqli_stmt_num_rows($photo_stmt) > 0) {
            mysqli_stmt_bind_result($photo_stmt, $photo_path);
            mysqli_stmt_fetch($photo_stmt);
            
            // Delete the photo file if it exists
            if (!empty($photo_path) && file_exists($photo_path)) {
                unlink($photo_path);
            }
        }
        
        mysqli_stmt_close($photo_stmt);
        
        // Delete all associated batches first
        $delete_batches_sql = "DELETE FROM product_batches WHERE product_id = ?";
        $delete_batches_stmt = mysqli_prepare($conn, $delete_batches_sql);
        
        if (!$delete_batches_stmt) {
            throw new Exception("Error preparing batch delete statement: " . mysqli_error($conn));
        }
        
        // Bind parameters
        mysqli_stmt_bind_param($delete_batches_stmt, "s", $product_id);
        
        // Execute statement
        if (!mysqli_stmt_execute($delete_batches_stmt)) {
            throw new Exception("Error executing batch delete statement: " . mysqli_stmt_error($delete_batches_stmt));
        }
        
        // Log how many batches were deleted
        $batches_deleted = mysqli_stmt_affected_rows($delete_batches_stmt);
        error_log("Deleted $batches_deleted batches for product $product_id");
        
        mysqli_stmt_close($delete_batches_stmt);
        
        // Now delete the product
        $sql = "DELETE FROM products WHERE product_id = ?";
        $stmt = mysqli_prepare($conn, $sql);
        
        if (!$stmt) {
            throw new Exception("Error preparing product delete statement: " . mysqli_error($conn));
        }
        
        // Bind parameters
        mysqli_stmt_bind_param($stmt, "s", $product_id);
        
        // Execute statement
        if (mysqli_stmt_execute($stmt)) {
            // Commit the transaction
            mysqli_commit($conn);
            
            echo json_encode([
                'success' => true,
                'message' => 'Product and all associated batches deleted successfully!'
            ]);
        } else {
            throw new Exception("Error executing product delete statement: " . mysqli_stmt_error($stmt));
        }
        
        // Close statement
        mysqli_stmt_close($stmt);
        
    } catch (Exception $e) {
        // Rollback the transaction on error
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

