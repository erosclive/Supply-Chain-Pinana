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

// Only allow PUT requests
if ($method !== 'PUT') {
    sendResponse('error', 'Method not allowed');
}

// Get JSON data from request body
$data = json_decode(file_get_contents('php://input'), true);

if (!$data) {
    sendResponse('error', 'Invalid JSON data');
}

// Validate required fields
if (!isset($data['name'])) {
    sendResponse('error', 'Name is required');
}

// Sanitize input
$name = sanitizeInput($data['name']);
$contactInfo = isset($data['contactInfo']) ? sanitizeInput($data['contactInfo']) : '';
$farmLocation = isset($data['farmLocation']) ? sanitizeInput($data['farmLocation']) : '';
$deliveryInfo = isset($data['deliveryInfo']) ? sanitizeInput($data['deliveryInfo']) : '';
$communicationMode = isset($data['communicationMode']) ? sanitizeInput($data['communicationMode']) : '';
$notes = isset($data['notes']) ? sanitizeInput($data['notes']) : '';
$harvestSeason = isset($data['harvestSeason']) ? sanitizeInput($data['harvestSeason']) : '';
$plantingCycle = isset($data['plantingCycle']) ? sanitizeInput($data['plantingCycle']) : '';
$variety = isset($data['variety']) ? sanitizeInput($data['variety']) : '';
$shelfLife = isset($data['shelfLife']) ? sanitizeInput($data['shelfLife']) : '';

// Get current timestamp
$currentTime = date('Y-m-d H:i:s');

// Update fixed pineapple supplier
$sql = "UPDATE fixed_pineapple_supplier SET 
        name = '$name', 
        contact_info = '$contactInfo', 
        farm_location = '$farmLocation', 
        delivery_info = '$deliveryInfo', 
        communication_mode = '$communicationMode', 
        notes = '$notes', 
        harvest_season = '$harvestSeason', 
        planting_cycle = '$plantingCycle', 
        variety = '$variety', 
        shelf_life = '$shelfLife', 
        updated_at = '$currentTime'
        WHERE id = 1";  // Add WHERE clause to target the specific record

$result = mysqli_query($conn, $sql);

if (!$result) {
    sendResponse('error', 'Database error: ' . mysqli_error($conn));
}

sendResponse('success', 'Fixed pineapple supplier updated successfully');
?>
