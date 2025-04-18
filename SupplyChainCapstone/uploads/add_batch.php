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
        $product_id = $_POST['productID'] ?? '';
        $batch_code = $_POST['batchCode'] ?? '';
        $quantity = intval($_POST['quantity'] ?? 0);
        $expiration_date = $_POST['expirationDate'] ?? '';
        $manufacturing_date = $_POST['manufacturingDate'] ?? null;
        $unit_cost = floatval($_POST['unitCost'] ?? 0);
        
        // Validate required fields
        if (empty($product_id) || empty($batch_code) || $quantity <= 0 || empty($expiration_date)) {
            throw new Exception("Required fields are missing or invalid.");
        }
        
        // Validate date formats
        if (!empty($expiration_date) && !validateDate($expiration_date)) {
            throw new Exception("Invalid expiration date format. Use YYYY-MM-DD format.");
        }
        
        if (!empty($manufacturing_date) && !validateDate($manufacturing_date)) {
            throw new Exception("Invalid manufacturing date format. Use YYYY-MM-DD format.");
        }

        // Validate and fix expiration date if needed
        if (empty($expiration_date) || $expiration_date === '0000-00-00') {
          // If expiration date is missing or invalid, generate it from manufacturing date
          if (!empty($manufacturing_date) && $manufacturing_date !== '0000-00-00') {
            $mfg_date = new DateTime($manufacturing_date);
            $mfg_date->modify('+2 months');
            $expiration_date = $mfg_date->format('Y-m-d');
          } else {
            // If no manufacturing date, set expiration to 2 months from today
            $today = new DateTime();
            $today->modify('+2 months');
            $expiration_date = $today->format('Y-m-d');
          }
        }

        // Log the dates for debugging
        error_log("Manufacturing date: " . $manufacturing_date);
        error_log("Expiration date: " . $expiration_date);
        
        // Check database connection
        if (!$conn) {
            throw new Exception("Database connection failed: " . mysqli_connect_error());
        }
        
        // Start transaction
        mysqli_begin_transaction($conn);
        
        // Insert batch information
        $sql = "INSERT INTO product_batches (
                    product_id, 
                    batch_code, 
                    quantity, 
                    expiration_date, 
                    manufacturing_date, 
                    unit_cost, 
                    created_at, 
                    updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())";
        
        $stmt = mysqli_prepare($conn, $sql);
        
        if (!$stmt) {
            throw new Exception("Error preparing statement: " . mysqli_error($conn));
        }
        
        // Bind parameters
        mysqli_stmt_bind_param(
            $stmt, 
            "ssisdd", 
            $product_id, 
            $batch_code, 
            $quantity, 
            $expiration_date, 
            $manufacturing_date, 
            $unit_cost
        );
        
        // Execute statement
        if (!mysqli_stmt_execute($stmt)) {
            throw new Exception("Error executing statement: " . mysqli_stmt_error($stmt));
        }
        
        $batch_id = mysqli_insert_id($conn);
        
        // Update total stock in products table
        $update_sql = "UPDATE products 
                      SET stocks = stocks + ?, 
                          updated_at = NOW() 
                      WHERE product_id = ?";
        
        $update_stmt = mysqli_prepare($conn, $update_sql);
        
        if (!$update_stmt) {
            throw new Exception("Error preparing update statement: " . mysqli_error($conn));
        }
        
        // Bind parameters
        mysqli_stmt_bind_param($update_stmt, "is", $quantity, $product_id);
        
        // Execute statement
        if (!mysqli_stmt_execute($update_stmt)) {
            throw new Exception("Error executing update statement: " . mysqli_stmt_error($update_stmt));
        }
        
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
        
        // Commit transaction
        mysqli_commit($conn);
        
        // Close statements
        mysqli_stmt_close($stmt);
        mysqli_stmt_close($update_stmt);
        mysqli_stmt_close($status_stmt);
        
        echo json_encode([
            'success' => true,
            'message' => 'Batch added successfully!',
            'batch_id' => $batch_id
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

// Helper function to validate date format (YYYY-MM-DD)
function validateDate($date, $format = 'Y-m-d') {
    $d = DateTime::createFromFormat($format, $date);
    return $d && $d->format($format) === $date;
}
?>

