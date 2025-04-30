<?php
// Include database connection
require_once 'db_connection.php';

// Check if request method is POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Invalid request method']);
    exit;
}

// Get form data
$orderId = $_POST['order_id'] ?? '';
$status = $_POST['status'] ?? '';
$notes = $_POST['notes'] ?? '';
$notifyEmail = isset($_POST['notify_email']) && $_POST['notify_email'] == '1';

// Validate required fields
if (empty($orderId) || empty($status)) {
    echo json_encode(['success' => false, 'message' => 'Order ID and status are required']);
    exit;
}

// Handle file upload
$uploadDir = 'uploads/delivery_proofs/';
$photoPath = '';

// Create directory if it doesn't exist
if (!file_exists($uploadDir)) {
    mkdir($uploadDir, 0777, true);
}

if (isset($_FILES['delivery_proof_photo']) && $_FILES['delivery_proof_photo']['error'] == 0) {
    $fileName = time() . '_' . basename($_FILES['delivery_proof_photo']['name']);
    $targetFile = $uploadDir . $fileName;
    
    // Check if image file is a actual image
    $check = getimagesize($_FILES['delivery_proof_photo']['tmp_name']);
    if ($check === false) {
        echo json_encode(['success' => false, 'message' => 'File is not an image']);
        exit;
    }
    
    // Check file size (limit to 5MB)
    if ($_FILES['delivery_proof_photo']['size'] > 5000000) {
        echo json_encode(['success' => false, 'message' => 'File is too large (max 5MB)']);
        exit;
    }
    
    // Allow certain file formats
    $imageFileType = strtolower(pathinfo($targetFile, PATHINFO_EXTENSION));
    if ($imageFileType != "jpg" && $imageFileType != "png" && $imageFileType != "jpeg") {
        echo json_encode(['success' => false, 'message' => 'Only JPG, JPEG, PNG files are allowed']);
        exit;
    }
    
    // Upload file
    if (move_uploaded_file($_FILES['delivery_proof_photo']['tmp_name'], $targetFile)) {
        $photoPath = $targetFile;
    } else {
        echo json_encode(['success' => false, 'message' => 'Failed to upload file']);
        exit;
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Delivery proof photo is required']);
    exit;
}

try {
    // Update order status and add delivery proof photo
    // Use mysqli instead of PDO to match your db_connection.php
    $stmt = $conn->prepare("UPDATE retailer_orders SET status = ?, notes = ?, delivery_proof_photo = ?, updated_at = NOW() WHERE order_id = ?");
    $stmt->bind_param("sssi", $status, $notes, $photoPath, $orderId);
    $result = $stmt->execute();
    
    if ($result) {
        // Add to status history
        $historyQuery = "INSERT INTO retailer_order_status_history (order_id, status, notes, created_at) VALUES (?, ?, ?, NOW())";
        $historyStmt = $conn->prepare($historyQuery);
        $historyStmt->bind_param("iss", $orderId, $status, $notes);
        $historyStmt->execute();
        
        // Send email notification if requested
        if ($notifyEmail) {
            // Email notification logic would go here
        }
        
        echo json_encode(['success' => true, 'message' => 'Order status updated successfully']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Failed to update order status']);
    }
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}
?>