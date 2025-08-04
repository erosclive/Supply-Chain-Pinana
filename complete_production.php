<?php
// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Include database connection
require_once 'db_connection.php';

// Set header to return JSON
header('Content-Type: application/json');

// Check if request method is POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode([
        'success' => false,
        'message' => 'Invalid request method'
    ]);
    exit;
}

// Check database connection
if (!$conn) {
    echo json_encode([
        'success' => false,
        'message' => 'Database connection failed: ' . mysqli_connect_error()
    ]);
    exit;
}

try {
    // Debug: Log all POST data and batch_tracking value
    error_log("[DEBUG] POST data: " . print_r($_POST, true));
    error_log("[DEBUG] batch_tracking from POST: " . (isset($_POST['batch_tracking']) ? $_POST['batch_tracking'] : 'NOT SET'));
    error_log("=== Production completion started ===");
    error_log("POST data received: " . print_r($_POST, true));
    error_log("Product ID from POST: " . ($_POST['product_id'] ?? 'NOT SET'));
    error_log("Product Name from POST: " . ($_POST['product_name'] ?? 'NOT SET'));
    error_log("Production Type from POST: " . ($_POST['production_type'] ?? 'NOT SET'));
    
    // --- 1. Gather and sanitize POST fields for production_output ---
    $production_id = intval($_POST['production_id'] ?? 0);
    $quantity_produced = intval($_POST['quantity_produced'] ?? 0);
    $quantity_passed_qc = intval($_POST['quantity_passed_qc'] ?? 0);
    $quantity_failed_qc = intval($_POST['quantity_failed_qc'] ?? ($quantity_produced - $quantity_passed_qc));
    $quantity_rework = intval($_POST['quantity_rework'] ?? 0);
    $quality_score = floatval($_POST['quality_score'] ?? 0);
    $quality_grade = $_POST['quality_grade'] ?? '';
    $defect_rate = floatval($_POST['defect_rate'] ?? ($quantity_produced > 0 ? ($quantity_failed_qc / $quantity_produced) * 100 : 0));
    $yield_percentage = floatval($_POST['yield_percentage'] ?? ($quantity_produced > 0 ? ($quantity_passed_qc / $quantity_produced) * 100 : 0));
    $output_batch_code = $_POST['output_batch_code'] ?? ('OUT' . date('Ymd') . sprintf('%04d', $production_id));
    $expiration_date = $_POST['expiration_date'] ?? null;
    $shelf_life_days = intval($_POST['shelf_life_days'] ?? 0);
    $manufacturing_date = $_POST['manufacturing_date'] ?? null;
    $material_cost = floatval($_POST['material_cost'] ?? 0);
    $labor_cost = floatval($_POST['labor_cost'] ?? 0);
    $overhead_cost = floatval($_POST['overhead_cost'] ?? 0);
    $total_cost = floatval($_POST['total_cost'] ?? ($material_cost + $labor_cost + $overhead_cost));
    $total_operational_cost = floatval($_POST['total_operational_cost'] ?? ($labor_cost + $overhead_cost));
    $cost_per_unit = floatval($_POST['cost_per_unit'] ?? ($quantity_produced > 0 ? $total_cost / $quantity_produced : 0));
    $packaging_type = $_POST['packaging_type'] ?? '';
    $packaging_date = $_POST['packaging_date'] ?? null;
    $storage_location = $_POST['storage_location'] ?? '';
    $notes = $_POST['notes'] ?? '';
    $created_at = date('Y-m-d H:i:s');
    $updated_at = $created_at;

    // --- 2. Gather and sanitize POST fields for products ---
    $product_id = $_POST['product_id'] ?? '';
    $product_name = $_POST['product_name'] ?? '';
    $category = $_POST['category'] ?? '';
    $stocks = intval($_POST['stocks'] ?? $quantity_passed_qc);
    $price = floatval($_POST['price'] ?? 0);
    $product_expiration_date = $_POST['product_expiration_date'] ?? $expiration_date;
    $batch_tracking = intval($_POST['batch_tracking'] ?? 0);
    $status = $_POST['status'] ?? ($stocks > 10 ? 'In Stock' : ($stocks > 0 ? 'Low Stock' : 'Out of Stock'));
    $production_reference = $production_id;
    $created_by = intval($_POST['created_by'] ?? 1);
    $product_photo_path = null;
    $product_created_at = $created_at;
    $product_updated_at = $updated_at;
    $slug = $_POST['slug'] ?? '';

    // --- 3. Get product photo from production record ---
    $get_production_photo_query = "SELECT product_photo FROM productions WHERE id = ?";
    $get_photo_stmt = mysqli_prepare($conn, $get_production_photo_query);
    if ($get_photo_stmt) {
        mysqli_stmt_bind_param($get_photo_stmt, 'i', $production_id);
        mysqli_stmt_execute($get_photo_stmt);
        $photo_result = mysqli_stmt_get_result($get_photo_stmt);
        $photo_data = mysqli_fetch_assoc($photo_result);
        if ($photo_data && !empty($photo_data['product_photo'])) {
            $product_photo_path = $photo_data['product_photo'];
            error_log("Retrieved product photo from production: " . $product_photo_path);
        }
        mysqli_stmt_close($get_photo_stmt);
    }

    // --- 4. Handle additional product photo upload if provided in completion ---
    if (isset($_FILES['product_photo']) && $_FILES['product_photo']['error'] === UPLOAD_ERR_OK) {
        $upload_dir = 'uploads/products/';
        if (!is_dir($upload_dir)) {
            mkdir($upload_dir, 0777, true);
        }
        
        $tmp_name = $_FILES['product_photo']['tmp_name'];
        $original_name = $_FILES['product_photo']['name'];
        $file_extension = strtolower(pathinfo($original_name, PATHINFO_EXTENSION));
        
        // Validate file type
        $allowed_extensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
        if (!in_array($file_extension, $allowed_extensions)) {
            throw new Exception('Invalid file type. Only JPG, PNG, GIF, and WebP files are allowed.');
        }
        
        // Validate file size (max 5MB)
        if ($_FILES['product_photo']['size'] > 5 * 1024 * 1024) {
            throw new Exception('File size too large. Maximum size is 5MB.');
        }
        
        $photo_filename = 'product_' . time() . '_' . rand(1000, 9999) . '.' . $file_extension;
        $new_photo_path = $upload_dir . $photo_filename;
        
        if (move_uploaded_file($tmp_name, $new_photo_path)) {
            // If there was an old photo from production, we can keep both or replace
            // For this implementation, we'll use the new photo
            $product_photo_path = $new_photo_path;
            error_log("New product photo uploaded: " . $product_photo_path);
        } else {
            error_log("Failed to upload new product photo");
        }
    }

    // --- 5. Validate required fields ---
    if (!$production_id) throw new Exception('Production ID is required');
    if ($quantity_produced <= 0) throw new Exception('Quantity produced must be greater than 0');
    if ($quantity_passed_qc > $quantity_produced) throw new Exception('Quantity passed QC cannot exceed quantity produced');
    if (!$product_id) throw new Exception('Product ID is required');
    
    // Check if this is for an existing product or new product
    $is_existing_product = false;
    $existing_product = null;
    
    // Get production details to determine if this is an existing batch production
    $production_query = "SELECT production_type, auto_create_product, price FROM productions WHERE id = ?";
    $production_stmt = mysqli_prepare($conn, $production_query);
    if ($production_stmt) {
        mysqli_stmt_bind_param($production_stmt, 'i', $production_id);
        mysqli_stmt_execute($production_stmt);
        $production_result = mysqli_stmt_get_result($production_stmt);
        $production_data = mysqli_fetch_assoc($production_result);
        mysqli_stmt_close($production_stmt);
        
        if ($production_data) {
            $production_type = $production_data['production_type'];
            $auto_create_product = $production_data['auto_create_product'];
            $production_price = isset($production_data['price']) ? floatval($production_data['price']) : 0;
            
            error_log("Production type: " . $production_type . ", Auto create product: " . $auto_create_product);
            
            // For existing batch productions, we should NOT create a new product
            if ($production_type === 'existing-batch' || $auto_create_product == 0) {
                // Check if product already exists
                error_log("Checking for existing product with product_id: " . $product_id);
                
                // First, let's see what products exist in the database
                $debug_query = "SELECT product_id, product_name FROM products WHERE batch_tracking = 1 LIMIT 5";
                $debug_result = mysqli_query($conn, $debug_query);
                error_log("Available products with batch tracking:");
                while ($row = mysqli_fetch_assoc($debug_result)) {
                    error_log("  - " . $row['product_id'] . " (" . $row['product_name'] . ")");
                }
                
                $check_product_query = "SELECT * FROM products WHERE product_id = ?";
                $check_product_stmt = mysqli_prepare($conn, $check_product_query);
                if ($check_product_stmt) {
                    mysqli_stmt_bind_param($check_product_stmt, 's', $product_id);
                    mysqli_stmt_execute($check_product_stmt);
                    $check_result = mysqli_stmt_get_result($check_product_stmt);
                    $existing_product = mysqli_fetch_assoc($check_result);
                    
                    if ($existing_product) {
                        $is_existing_product = true;
                        error_log("Found existing product: " . $existing_product['product_name'] . " (ID: " . $existing_product['id'] . ")");
                    } else {
                        // If product_id is empty or NULL, this might be an old production
                        if (empty($product_id)) {
                            error_log("WARNING: Product ID is empty for existing batch production. This might be an old production.");
                            error_log("Available product IDs: ");
                            $all_products = mysqli_query($conn, "SELECT product_id FROM products WHERE batch_tracking = 1");
                            while ($prod = mysqli_fetch_assoc($all_products)) {
                                error_log("  - " . $prod['product_id']);
                            }
                            throw new Exception('Product ID is missing for this production. Please contact support to fix this production record.');
                        } else {
                            error_log("ERROR: Product not found for existing batch production. Product ID: " . $product_id);
                            error_log("Available product IDs: ");
                            $all_products = mysqli_query($conn, "SELECT product_id FROM products WHERE batch_tracking = 1");
                            while ($prod = mysqli_fetch_assoc($all_products)) {
                                error_log("  - " . $prod['product_id']);
                            }
                            throw new Exception('Selected product not found in database. Please try again.');
                        }
                    }
                    mysqli_stmt_close($check_product_stmt);
                }
            } else {
                // For new product productions, check if product already exists
                error_log("Checking for existing product with product_id: " . $product_id);
                $check_product_query = "SELECT * FROM products WHERE product_id = ?";
                $check_product_stmt = mysqli_prepare($conn, $check_product_query);
                if ($check_product_stmt) {
                    mysqli_stmt_bind_param($check_product_stmt, 's', $product_id);
                    mysqli_stmt_execute($check_product_stmt);
                    $check_result = mysqli_stmt_get_result($check_product_stmt);
                    $existing_product = mysqli_fetch_assoc($check_result);
                    
                    if ($existing_product) {
                        $is_existing_product = true;
                        error_log("Found existing product: " . $existing_product['product_name'] . " (ID: " . $existing_product['id'] . ")");
                    } else {
                        error_log("Product not found with product_id: " . $product_id . ", will create new product");
                        // For new products, validate required fields
                        if (!$product_name) throw new Exception('Product name is required');
                        if (!$category) throw new Exception('Category is required');
                    }
                    mysqli_stmt_close($check_product_stmt);
                }
            }
        }
    }

    // --- 6. Start transaction ---
    mysqli_begin_transaction($conn);

    // --- 7. Insert into production_output ---
    $output_query = "INSERT INTO production_output (
        production_id, quantity_produced, quantity_passed_qc, quantity_failed_qc, 
        quantity_rework, quality_score, quality_grade, defect_rate, yield_percentage, 
        output_batch_code, expiration_date, shelf_life_days, manufacturing_date, 
        material_cost, labor_cost, overhead_cost, total_cost, created_product_id, created_batch_id, cost_per_unit, 
        packaging_type, packaging_date, storage_location, notes, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    
    $output_stmt = mysqli_prepare($conn, $output_query);
    if (!$output_stmt) {
        throw new Exception('Failed to prepare production_output query: ' . mysqli_error($conn));
    }
    
    // Debug: Count parameters for production_output
    $created_product_id_temp = null;
    $created_batch_id_temp = null;
    $output_params = [$production_id, $quantity_produced, $quantity_passed_qc, $quantity_failed_qc, 
        $quantity_rework, $quality_score, $quality_grade, $defect_rate, $yield_percentage, 
        $output_batch_code, $expiration_date, $shelf_life_days, $manufacturing_date, 
        $material_cost, $labor_cost, $overhead_cost, $total_cost, $created_product_id_temp, $created_batch_id_temp, $cost_per_unit, 
        $packaging_type, $packaging_date, $storage_location, $notes, $created_at, $updated_at];
    error_log("Production output - Parameters: " . count($output_params) . ", Type string length: " . strlen('iiiiddsddssissddiissssssss'));
    
    // Bind parameters - 26 parameters total
    $type_string = 'iiiiddsddssissddiissssssss';
    mysqli_stmt_bind_param($output_stmt, $type_string,
        $production_id, $quantity_produced, $quantity_passed_qc, $quantity_failed_qc, 
        $quantity_rework, $quality_score, $quality_grade, $defect_rate, $yield_percentage, 
        $output_batch_code, $expiration_date, $shelf_life_days, $manufacturing_date, 
        $material_cost, $labor_cost, $overhead_cost, $total_cost, $created_product_id_temp, $created_batch_id_temp, $cost_per_unit, 
        $packaging_type, $packaging_date, $storage_location, $notes, $created_at, $updated_at
    );
    
    if (!mysqli_stmt_execute($output_stmt)) {
        throw new Exception('Failed to create production output: ' . mysqli_stmt_error($output_stmt));
    }
    $output_id = mysqli_insert_id($conn);

    // --- 8. Handle product creation or update ---
    if ($is_existing_product) {
        // Update existing product's stock
        $update_product_query = "UPDATE products SET 
            stocks = stocks + ?,
            updated_at = NOW()
            WHERE product_id = ?";
        
        $update_product_stmt = mysqli_prepare($conn, $update_product_query);
        if (!$update_product_stmt) {
            throw new Exception('Failed to prepare product update query: ' . mysqli_error($conn));
        }
        
        mysqli_stmt_bind_param($update_product_stmt, 'is', $quantity_passed_qc, $product_id);
        
        if (!mysqli_stmt_execute($update_product_stmt)) {
            throw new Exception('Failed to update existing product: ' . mysqli_stmt_error($update_product_stmt));
        }
        
        $created_product_id = $existing_product['id'];
        error_log("Updated existing product stock. New total: " . ($existing_product['stocks'] + $quantity_passed_qc));
        
        // Update product status based on new stock level
        $status_update_query = "UPDATE products SET status = CASE WHEN stocks > 20 THEN 'In Stock' WHEN stocks > 0 THEN 'Low Stock' ELSE 'Out of Stock' END, updated_at = NOW() WHERE product_id = ?";
        $status_update_stmt = mysqli_prepare($conn, $status_update_query);
        if (!$status_update_stmt) {
            throw new Exception('Failed to prepare product status update query: ' . mysqli_error($conn));
        }
        mysqli_stmt_bind_param($status_update_stmt, 's', $product_id);
        if (!mysqli_stmt_execute($status_update_stmt)) {
            throw new Exception('Failed to update product status: ' . mysqli_stmt_error($status_update_stmt));
        }
        mysqli_stmt_close($status_update_stmt);
        
    } else {
        // Check if this is an existing batch production that shouldn't create new products
        if ($production_type === 'existing-batch' || $auto_create_product == 0) {
            error_log("ERROR: Attempting to create new product for existing batch production");
            throw new Exception('Cannot create new product for existing batch production. Please select an existing product.');
        }
        
        // Create new product (now including product_photo)
        $product_query = "INSERT INTO products (
            slug, product_id, product_photo, product_name, category, stocks, price, 
            expiration_date, batch_tracking, status, created_at, updated_at, 
            created_from_production, production_reference, created_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        
        $product_stmt = mysqli_prepare($conn, $product_query);
        if (!$product_stmt) {
            throw new Exception('Failed to prepare products query: ' . mysqli_error($conn));
        }
        // Use the price from the production record
        $price = $production_price;
        $product_params = [$slug, $product_id, $product_photo_path, $product_name, $category, $stocks, $price, 
            $product_expiration_date, $batch_tracking, $status, $product_created_at, 
            $product_updated_at, $output_id, $production_reference, $created_by];
        $product_type_string = 'sssssidsssiisii';
        error_log("Products - Parameters: " . count($product_params) . ", Type string length: " . strlen($product_type_string));
        
        mysqli_stmt_bind_param($product_stmt, $product_type_string,
            $slug, $product_id, $product_photo_path, $product_name, $category, $stocks, $price, 
            $product_expiration_date, $batch_tracking, $status, $product_created_at, 
            $product_updated_at, $output_id, $production_reference, $created_by
        );
        
        if (!mysqli_stmt_execute($product_stmt)) {
            throw new Exception('Failed to create new product: ' . mysqli_stmt_error($product_stmt));
        }
        $created_product_id = mysqli_insert_id($conn);
        mysqli_stmt_close($product_stmt);

        // Update product status based on new stock level (in case stocks/status logic needs to be enforced)
        $status_update_query = "UPDATE products SET status = CASE WHEN stocks > 20 THEN 'In Stock' WHEN stocks > 0 THEN 'Low Stock' ELSE 'Out of Stock' END, updated_at = NOW() WHERE product_id = ?";
        $status_update_stmt = mysqli_prepare($conn, $status_update_query);
        if (!$status_update_stmt) {
            throw new Exception('Failed to prepare product status update query: ' . mysqli_error($conn));
        }
        mysqli_stmt_bind_param($status_update_stmt, 's', $product_id);
        if (!mysqli_stmt_execute($status_update_stmt)) {
            throw new Exception('Failed to update product status: ' . mysqli_stmt_error($status_update_stmt));
        }
        mysqli_stmt_close($status_update_stmt);
    }

    // --- 8.5. Create batch record ---
    $created_batch_id = null;
    
    // Only create batch if the product has batch tracking enabled
    // For existing products, check if they have batch tracking enabled
    // For new products, create batch if batch tracking is enabled
    $should_create_batch = false;
    
    if ($is_existing_product) {
        // Check if the existing product has batch tracking enabled
        $should_create_batch = ($existing_product['batch_tracking'] == 1);
        error_log("Existing product batch tracking: " . ($existing_product['batch_tracking'] == 1 ? 'ENABLED' : 'DISABLED'));
    } else {
        // For new products, use the batch_tracking flag from the form
        $should_create_batch = ($batch_tracking == 1);
        error_log("New product batch tracking: " . ($batch_tracking == 1 ? 'ENABLED' : 'DISABLED'));
    }
    
    if ($should_create_batch) {
        // Use batch details from POST if available
        $batch_code = $_POST['batch_code'] ?? (date('Ymd') . '-' . sprintf('%03d', rand(1, 999)));
        $batch_expiration_date = $_POST['expiration_date'] ?? $expiration_date;
        $batch_manufacturing_date = $_POST['manufacturing_date'] ?? $manufacturing_date;
        $batch_unit_cost = $cost_per_unit;
        $batch_created_at = $created_at;
        $batch_updated_at = $updated_at;
        
        // Create batch record
        $batch_query = "INSERT INTO product_batches (
            product_id, batch_code, quantity, expiration_date, manufacturing_date, 
            unit_cost, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
        
        $batch_stmt = mysqli_prepare($conn, $batch_query);
        if (!$batch_stmt) {
            throw new Exception('Failed to prepare product_batches query: ' . mysqli_error($conn));
        }
        
        $batch_quantity = $quantity_passed_qc; // Use passed QC quantity for batch
        
        mysqli_stmt_bind_param($batch_stmt, 'ssissdss',
            $product_id, $batch_code, $batch_quantity, $batch_expiration_date, 
            $batch_manufacturing_date, $batch_unit_cost, $batch_created_at, $batch_updated_at
        );
        
        if (!mysqli_stmt_execute($batch_stmt)) {
            throw new Exception('Failed to create product batch: ' . mysqli_stmt_error($batch_stmt));
        }
        $created_batch_id = mysqli_insert_id($conn);
        mysqli_stmt_close($batch_stmt);
        
        if ($is_existing_product) {
            error_log("Created batch for existing product: " . $product_id . " with batch ID: " . $created_batch_id);
        } else {
            error_log("Created batch for new product: " . $product_id . " with batch ID: " . $created_batch_id);
        }
    } else {
        error_log("No batch created - product does not have batch tracking enabled");
    }

    // --- 9. Update production_output with created_product_id and created_batch_id ---
    $update_output_query = "UPDATE production_output SET created_product_id = ?, created_batch_id = ? WHERE id = ?";
    $update_output_stmt = mysqli_prepare($conn, $update_output_query);
    mysqli_stmt_bind_param($update_output_stmt, 'iii', $created_product_id, $created_batch_id, $output_id);
    mysqli_stmt_execute($update_output_stmt);

    // --- 9.5. Update material stock levels (deduct used materials) ---
    if (isset($_POST['recipe_data']) && !empty($_POST['recipe_data'])) {
        try {
            $recipe_data = json_decode($_POST['recipe_data'], true);
            if (is_array($recipe_data)) {
                foreach ($recipe_data as $material) {
                    if (isset($material['materialId']) && isset($material['quantity'])) {
                        $material_id = intval($material['materialId']);
                        $used_quantity = floatval($material['quantity']);
                        
                        // Update material stock
                        $update_material_query = "UPDATE materials SET 
                            quantity = GREATEST(0, quantity - ?),
                            updated_at = NOW()
                            WHERE id = ?";
                        $update_material_stmt = mysqli_prepare($conn, $update_material_query);
                        mysqli_stmt_bind_param($update_material_stmt, 'di', $used_quantity, $material_id);
                        mysqli_stmt_execute($update_material_stmt);
                    }
                }
            }
        } catch (Exception $e) {
            // Log error but don't fail the entire transaction
            error_log("Error updating material stocks: " . $e->getMessage());
        }
    }

    // --- 10. Update production status to completed ---
    $update_prod_query = "UPDATE productions SET 
        status = ?,
        progress = ?,
        actual_completion = ?,
        actual_duration_hours = ?,
        quality_status = ?,
        quality_notes = ?,
        quality_checked_by = ?,
        quality_checked_at = ?,
        target_price = ?,
        total_operational_cost = ?,
        notes = CONCAT(COALESCE(notes, ''), ?, ' [Completed: ', NOW(), ']'),
        updated_at = NOW()
        WHERE id = ?";
    
    $status = 'completed';
    $progress = 100;
    $actual_completion = date('Y-m-d H:i:s');
    $actual_duration_hours = floatval($_POST['actual_duration_hours'] ?? 8);
    $quality_status = $_POST['quality_status'] ?? 'passed';
    $quality_notes = $_POST['quality_notes'] ?? '';
    $quality_checked_by = intval($_POST['quality_checked_by'] ?? 1);
    $quality_checked_at = date('Y-m-d H:i:s');
    $target_price = floatval($_POST['target_price'] ?? 0);
    $completion_note = "\n" . $notes;
    
    $update_prod_stmt = mysqli_prepare($conn, $update_prod_query);
    if (!$update_prod_stmt) {
        throw new Exception('Failed to prepare production update query: ' . mysqli_error($conn));
    }
    
    // Debug: Count parameters for productions update
    $update_params = [$status, $progress, $actual_completion, $actual_duration_hours, 
        $quality_status, $quality_notes, $quality_checked_by, $quality_checked_at, 
        $target_price, $total_operational_cost, $completion_note, $production_id];
    $update_type_string = 'sisisssidssi';
    error_log("Productions update - Parameters: " . count($update_params) . ", Type string length: " . strlen($update_type_string));
    
    // Bind parameters - 12 parameters total
    mysqli_stmt_bind_param($update_prod_stmt, $update_type_string, 
        $status, $progress, $actual_completion, $actual_duration_hours, 
        $quality_status, $quality_notes, $quality_checked_by, $quality_checked_at, 
        $target_price, $total_operational_cost, $completion_note, $production_id);
    
    if (!mysqli_stmt_execute($update_prod_stmt)) {
        throw new Exception('Failed to update production status: ' . mysqli_stmt_error($update_prod_stmt));
    }

    // --- 10.5. Update consumption_date for all materials used in this production ---
    $update_materials_date_query = "UPDATE production_materials SET consumption_date = NOW(), status = 'consumed' WHERE production_id = ?";
    $update_materials_date_stmt = mysqli_prepare($conn, $update_materials_date_query);
    if ($update_materials_date_stmt) {
        mysqli_stmt_bind_param($update_materials_date_stmt, 'i', $production_id);
        mysqli_stmt_execute($update_materials_date_stmt);
        mysqli_stmt_close($update_materials_date_stmt);
    }

    // --- 11. Commit transaction ---
    mysqli_commit($conn);

    // Determine the appropriate success message
    $success_message = '';
    if ($is_existing_product) {
        if ($should_create_batch) {
            $success_message = 'Production completed and batch added to existing product';
        } else {
            $success_message = 'Production completed and stock updated for existing product';
        }
    } else {
        $success_message = 'Production and product saved successfully';
    }
    
    echo json_encode([
        'success' => true,
        'message' => $success_message,
        'production_output_id' => $output_id,
        'created_product_id' => $created_product_id,
        'created_batch_id' => $created_batch_id,
        'output_batch_code' => $should_create_batch ? $output_batch_code : null,
        'product_id' => $product_id,
        'batch_tracking_enabled' => $should_create_batch,
        'is_existing_product' => $is_existing_product,
        'product_name' => $is_existing_product ? $existing_product['product_name'] : $product_name,
        'batch_created' => $should_create_batch,
        'product_photo' => $product_photo_path
    ]);

} catch (Exception $e) {
    // Rollback transaction on error
    if (isset($conn) && mysqli_ping($conn)) {
        mysqli_rollback($conn);
    }
    error_log("Production completion error: " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
} catch (Error $e) {
    // Handle PHP 7+ Error exceptions
    if (isset($conn) && mysqli_ping($conn)) {
        mysqli_rollback($conn);
    }
    error_log("Production completion PHP error: " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => 'PHP Error: ' . $e->getMessage()
    ]);
}

mysqli_close($conn);
?>
