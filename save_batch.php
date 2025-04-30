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
        $batch_id = isset($_POST['batchId']) ? intval($_POST['batchId']) : 0;
        $product_id = $_POST['productId'] ?? '';
        $batch_code = $_POST['batchCode'] ?? '';
        $quantity = intval($_POST['quantity'] ?? 0);
        $expiration_date = $_POST['expirationDate'] ?? '';
        $manufacturing_date = $_POST['manufacturingDate'] ?? null;
        $unit_cost = floatval($_POST['unitCost'] ?? 0);
        
        // Get expiration duration and custom duration days
        $expiration_duration = $_POST['expirationDuration'] ?? '';
        $custom_duration_days = null;
        if ($expiration_duration === 'custom' && isset($_POST['customDurationDays'])) {
            $custom_duration_days = intval($_POST['customDurationDays']);
            // Validate custom duration days
            if ($custom_duration_days < 1) {
                throw new Exception("Custom duration days must be at least 1.");
            }
        }
        
        // Log received data for debugging
        error_log("Received batch data: " . json_encode($_POST));
        
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
        
        // Check database connection
        if (!$conn) {
            throw new Exception("Database connection failed: " . mysqli_connect_error());
        }
        
        // Start transaction
        mysqli_begin_transaction($conn);
        
        if ($batch_id > 0) {
            // This is an update operation
            
            // Get current quantity to calculate difference
            $get_quantity_sql = "SELECT quantity FROM product_batches WHERE batch_id = ?";
            $get_quantity_stmt = mysqli_prepare($conn, $get_quantity_sql);
            
            if (!$get_quantity_stmt) {
                throw new Exception("Error preparing get quantity statement: " . mysqli_error($conn));
            }
            
            mysqli_stmt_bind_param($get_quantity_stmt, "i", $batch_id);
            mysqli_stmt_execute($get_quantity_stmt);
            mysqli_stmt_bind_result($get_quantity_stmt, $old_quantity);
            
            if (!mysqli_stmt_fetch($get_quantity_stmt)) {
                mysqli_stmt_close($get_quantity_stmt);
                throw new Exception("Batch not found");
            }
            
            mysqli_stmt_close($get_quantity_stmt);
            
            // Calculate quantity difference
            $quantity_diff = $quantity - $old_quantity;
            
            // Update batch information - CRITICAL FIX: Include expiration_duration and custom_duration_days
            $sql = "UPDATE product_batches SET 
                        batch_code = ?, 
                        quantity = ?, 
                        expiration_date = ?, 
                        manufacturing_date = ?, 
                        unit_cost = ?,
                        expiration_duration = ?,
                        custom_duration_days = ?,
                        updated_at = NOW()
                    WHERE batch_id = ?";
            
            $stmt = mysqli_prepare($conn, $sql);
            
            if (!$stmt) {
                throw new Exception("Error preparing update statement: " . mysqli_error($conn));
            }
            
            // Log the values being bound to the statement
            error_log("Binding values for update: batch_code=$batch_code, quantity=$quantity, expiration_date=$expiration_date, manufacturing_date=$manufacturing_date, unit_cost=$unit_cost, expiration_duration=$expiration_duration, custom_duration_days=$custom_duration_days, batch_id=$batch_id");
            
            // Bind parameters
            mysqli_stmt_bind_param(
                $stmt, 
                "sisddsii", 
                $batch_code, 
                $quantity, 
                $expiration_date, 
                $manufacturing_date, 
                $unit_cost,
                $expiration_duration,
                $custom_duration_days,
                $batch_id
            );
            
            // Execute statement
            if (!mysqli_stmt_execute($stmt)) {
                throw new Exception("Error executing update statement: " . mysqli_stmt_error($stmt));
            }
            
            mysqli_stmt_close($stmt);
            
            // Only update product stock if quantity changed
            if ($quantity_diff != 0) {
                // Update total stock in products table
                $update_sql = "UPDATE products 
                              SET stocks = stocks + ?, 
                                  updated_at = NOW() 
                              WHERE product_id = ?";
                
                $update_stmt = mysqli_prepare($conn, $update_sql);
                
                if (!$update_stmt) {
                    throw new Exception("Error preparing stock update statement: " . mysqli_error($conn));
                }
                
                // Bind parameters
                mysqli_stmt_bind_param($update_stmt, "is", $quantity_diff, $product_id);
                
                // Execute statement
                if (!mysqli_stmt_execute($update_stmt)) {
                    throw new Exception("Error executing stock update statement: " . mysqli_stmt_error($update_stmt));
                }
                
                mysqli_stmt_close($update_stmt);
            }
            
            $message = "Batch updated successfully!";
        } else {
            // This is an insert operation
            
            // Insert batch information - CRITICAL FIX: Include expiration_duration and custom_duration_days
            $sql = "INSERT INTO product_batches (
                        product_id, 
                        batch_code, 
                        quantity, 
                        expiration_date, 
                        manufacturing_date, 
                        unit_cost,
                        expiration_duration,
                        custom_duration_days,
                        created_at, 
                        updated_at
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())";
            
            $stmt = mysqli_prepare($conn, $sql);
            
            if (!$stmt) {
                throw new Exception("Error preparing insert statement: " . mysqli_error($conn));
            }
            
            // Log the values being bound to the statement
            error_log("Binding values for insert: product_id=$product_id, batch_code=$batch_code, quantity=$quantity, expiration_date=$expiration_date, manufacturing_date=$manufacturing_date, unit_cost=$unit_cost, expiration_duration=$expiration_duration, custom_duration_days=$custom_duration_days");
            
            // Bind parameters
            mysqli_stmt_bind_param(
                $stmt, 
                "ssisddsi", 
                $product_id, 
                $batch_code, 
                $quantity, 
                $expiration_date, 
                $manufacturing_date, 
                $unit_cost,
                $expiration_duration,
                $custom_duration_days
            );
            
            // Execute statement
            if (!mysqli_stmt_execute($stmt)) {
                throw new Exception("Error executing insert statement: " . mysqli_stmt_error($stmt));
            }
            
            $batch_id = mysqli_insert_id($conn);
            
            mysqli_stmt_close($stmt);
            
            // Update total stock in products table
            $update_sql = "UPDATE products 
                          SET stocks = stocks + ?, 
                              updated_at = NOW() 
                          WHERE product_id = ?";
            
            $update_stmt = mysqli_prepare($conn, $update_sql);
            
            if (!$update_stmt) {
                throw new Exception("Error preparing stock update statement: " . mysqli_error($conn));
            }
            
            // Bind parameters
            mysqli_stmt_bind_param($update_stmt, "is", $quantity, $product_id);
            
            // Execute statement
            if (!mysqli_stmt_execute($update_stmt)) {
                throw new Exception("Error executing stock update statement: " . mysqli_stmt_error($update_stmt));
            }
            
            mysqli_stmt_close($update_stmt);
            
            $message = "Batch added successfully!";
        }
        
        // Update product status based on new stock level
        $status_sql = "UPDATE products 
                      SET status = CASE 
                                    WHEN stocks > 20 THEN 'In Stock' 
                                    WHEN stocks > 0 THEN 'Low Stock' 
                                    ELSE 'Out of Stock' 
                                  END,
                          batch_tracking = 1,
                          updated_at = NOW()
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
        
        // Update product expiration date to the earliest batch expiration date
        $update_expiry_sql = "UPDATE products p
                            SET p.expiration_date = (
                              SELECT MIN(b.expiration_date)
                              FROM product_batches b
                              WHERE b.product_id = p.product_id
                              AND b.quantity > 0
                            )
                            WHERE p.product_id = ?";
        
        $update_expiry_stmt = mysqli_prepare($conn, $update_expiry_sql);
        
        if (!$update_expiry_stmt) {
            throw new Exception("Error preparing expiry update statement: " . mysqli_error($conn));
        }
        
        // Bind parameters
        mysqli_stmt_bind_param($update_expiry_stmt, "s", $product_id);
        
        // Execute statement
        if (!mysqli_stmt_execute($update_expiry_stmt)) {
            throw new Exception("Error executing expiry update statement: " . mysqli_stmt_error($update_expiry_stmt));
        }
        
        mysqli_stmt_close($update_expiry_stmt);
        
        // Commit transaction
        mysqli_commit($conn);
        
        echo json_encode([
            'success' => true,
            'message' => $message,
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