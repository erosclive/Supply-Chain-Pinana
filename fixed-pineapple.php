<?php
// Include database connection
require_once 'db_connection.php';

// Set headers for JSON response
header('Content-Type: application/json');

// Get request method
$method = $_SERVER['REQUEST_METHOD'];

// Handle CORS if needed
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0);
}

// Function to generate a response
function sendResponse($status, $message, $data = null) {
    $response = [
        'status' => $status,
        'message' => $message
    ];
    
    if ($data !== null) {
        $response['data'] = $data;
    }
    
    echo json_encode($response);
    exit;
}

// Function to sanitize input data
function sanitizeInput($data) {
    global $conn;
    return mysqli_real_escape_string($conn, trim($data));
}

// Handle different request methods
switch ($method) {
    case 'GET':
        getFixedPineappleSupplier();
        break;
        
    case 'PUT':
        // Get JSON data from request body
        $data = json_decode(file_get_contents('php://input'), true);
        
        if (!$data) {
            sendResponse('error', 'Invalid JSON data');
        }
        
        updateFixedPineappleSupplier($data);
        break;
        
    default:
        sendResponse('error', 'Method not allowed');
        break;
}

// Function to get the fixed pineapple supplier
function getFixedPineappleSupplier() {
    global $conn;
    
    $sql = "SELECT * FROM fixed_pineapple_supplier LIMIT 1";
    $result = mysqli_query($conn, $sql);
    
    if (!$result) {
        sendResponse('error', 'Database error: ' . mysqli_error($conn));
    }
    
    if (mysqli_num_rows($result) === 0) {
        sendResponse('error', 'Fixed pineapple supplier not found');
    }
    
    $row = mysqli_fetch_assoc($result);
    
    // Convert database field names to camelCase for JavaScript (farm_location still removed from main supplier)
    $supplier = [
        'id' => 'fixed-pineapple',
        'name' => $row['name'],
        'contactInfo' => $row['contact_info'],
        'deliveryInfo' => $row['delivery_info'],
        'communicationMode' => $row['communication_mode'],
        'notes' => $row['notes'],
        'harvestSeason' => $row['harvest_season'],
        'plantingCycle' => $row['planting_cycle'],
        'variety' => $row['variety'],
        'shelfLife' => $row['shelf_life'],
        'created_at' => $row['created_at'],
        'updated_at' => $row['updated_at'],
        'alternatives' => [] // Will be populated separately
    ];
    
    // Get alternatives for fixed pineapple supplier (NOW INCLUDING farm_location)
    $altSql = "SELECT * FROM supplier_alternatives WHERE is_fixed_pineapple = 1";
    $altResult = mysqli_query($conn, $altSql);
    
    if ($altResult) {
        while ($altRow = mysqli_fetch_assoc($altResult)) {
            $alternative = [
                'id' => $altRow['id'],
                'name' => $altRow['name'],
                'contactInfo' => $altRow['contact_info'],
                'farmLocation' => $altRow['farm_location'], // RESTORED for alternatives
                'link' => $altRow['link'],
                'deliveryInfo' => $altRow['delivery_info'],
                'communicationMode' => $altRow['communication_mode'],
                'notes' => $altRow['notes'],
                'harvestSeason' => $altRow['harvest_season'],
                'plantingCycle' => $altRow['planting_cycle'],
                'variety' => $altRow['variety'],
                'shelfLife' => $altRow['shelf_life'],
                'created_at' => $altRow['created_at'],
                'updated_at' => $altRow['updated_at']
            ];
            
            $supplier['alternatives'][] = $alternative;
        }
    }
    
    sendResponse('success', 'Fixed pineapple supplier retrieved successfully', $supplier);
}

// Function to update fixed pineapple supplier (farm_location still removed from main supplier)
function updateFixedPineappleSupplier($data) {
    global $conn;
    
    // Validate required fields
    if (!isset($data['name'])) {
        sendResponse('error', 'Name is required');
    }
    
    // Sanitize input (farm_location still not included for main supplier)
    $name = sanitizeInput($data['name']);
    $contactInfo = isset($data['contactInfo']) ? sanitizeInput($data['contactInfo']) : '';
    $deliveryInfo = isset($data['deliveryInfo']) ? sanitizeInput($data['deliveryInfo']) : '';
    $communicationMode = isset($data['communicationMode']) ? sanitizeInput($data['communicationMode']) : '';
    $notes = isset($data['notes']) ? sanitizeInput($data['notes']) : '';
    $harvestSeason = isset($data['harvestSeason']) ? sanitizeInput($data['harvestSeason']) : '';
    $plantingCycle = isset($data['plantingCycle']) ? sanitizeInput($data['plantingCycle']) : '';
    $variety = isset($data['variety']) ? sanitizeInput($data['variety']) : '';
    $shelfLife = isset($data['shelfLife']) ? sanitizeInput($data['shelfLife']) : '';
    
    // Get current timestamp
    $currentTime = date('Y-m-d H:i:s');
    
    // Update fixed pineapple supplier (farm_location still not included for main supplier)
    $sql = "UPDATE fixed_pineapple_supplier SET 
            name = '$name', 
            contact_info = '$contactInfo', 
            delivery_info = '$deliveryInfo', 
            communication_mode = '$communicationMode', 
            notes = '$notes', 
            harvest_season = '$harvestSeason', 
            planting_cycle = '$plantingCycle', 
            variety = '$variety', 
            shelf_life = '$shelfLife', 
            updated_at = '$currentTime'
            WHERE id = 1";
    
    $result = mysqli_query($conn, $sql);
    
    if (!$result) {
        sendResponse('error', 'Database error: ' . mysqli_error($conn));
    }
    
    sendResponse('success', 'Fixed pineapple supplier updated successfully');
}
?>
