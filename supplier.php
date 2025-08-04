<?php
// Configure error handling to prevent HTML errors from breaking JSON responses
ini_set('display_errors', 0);
error_reporting(E_ALL);

// Function to log errors instead of displaying them
function logError($message) {
    error_log($message, 0);
}

// Set error handler
set_error_handler(function($errno, $errstr, $errfile, $errline) {
    logError("Error [$errno] $errstr in $errfile on line $errline");
    return true;
});

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
        // Check if we're fetching a specific supplier or all suppliers
        if (isset($_GET['id'])) {
            // Get specific supplier
            $id = sanitizeInput($_GET['id']);
            
            // Check if we're getting the fixed pineapple supplier
            if ($id === 'fixed-pineapple') {
                getFixedPineappleSupplier();
            } else {
                getSupplier($id);
            }
        } elseif (isset($_GET['type']) && $_GET['type'] === 'fixed-pineapple-alternatives') {
            // Get fixed pineapple alternatives
            getFixedPineappleAlternatives();
        } elseif (isset($_GET['supplier_id']) && isset($_GET['type']) && $_GET['type'] === 'alternatives') {
            // Get alternatives for a specific supplier
            $supplierId = sanitizeInput($_GET['supplier_id']);
            getSupplierAlternatives($supplierId);
        } elseif (isset($_GET['type']) && $_GET['type'] === 'all') {
            // Get all suppliers
            getAllSuppliers();
        } else {
            // Default to getting all suppliers if no specific parameters
            getAllSuppliers();
        }
        break;
        
    case 'POST':
        // Get JSON data from request body
        $data = json_decode(file_get_contents('php://input'), true);
        
        if (!$data) {
            sendResponse('error', 'Invalid JSON data');
        }
        
        // Check if we're adding an alternative supplier
        if (isset($data['is_alternative']) && $data['is_alternative'] === true) {
            addAlternativeSupplier($data);
        } else {
            // Add new supplier
            addSupplier($data);
        }
        break;
        
    case 'PUT':
        // Get JSON data from request body
        $data = json_decode(file_get_contents('php://input'), true);
        
        if (!$data) {
            sendResponse('error', 'Invalid JSON data or missing ID');
        }
        
        // Check if we're updating the fixed pineapple supplier
        if (isset($data['id']) && $data['id'] === 'fixed-pineapple') {
            updateFixedPineappleSupplier($data);
        } elseif (isset($data['id'])) {
            // Update regular supplier
            updateSupplier($data);
        } else {
            sendResponse('error', 'Missing ID parameter');
        }
        break;
        
    case 'DELETE':
        // Check if we're deleting a supplier or an alternative
        if (isset($_GET['id']) && isset($_GET['type']) && $_GET['type'] === 'alternative') {
            // Delete alternative
            $alternativeId = sanitizeInput($_GET['id']);
            $isFixedPineapple = isset($_GET['fixed']) && $_GET['fixed'] === 'true';
            deleteAlternative($alternativeId, $isFixedPineapple);
        } else if (isset($_GET['id'])) {
            // Delete supplier
            $id = sanitizeInput($_GET['id']);
            deleteSupplier($id);
        } else {
            sendResponse('error', 'Missing ID parameter');
        }
        break;
        
    default:
        sendResponse('error', 'Method not allowed');
        break;
}

// Function to get all suppliers
function getAllSuppliers() {
    global $conn;
    
    $sql = "SELECT * FROM suppliers ORDER BY name";
    $result = mysqli_query($conn, $sql);
    
    if (!$result) {
        sendResponse('error', 'Database error: ' . mysqli_error($conn));
    }
    
    $suppliers = [];
    while ($row = mysqli_fetch_assoc($result)) {
        // Convert database field names to camelCase for JavaScript
        $supplier = [
            'id' => $row['id'],
            'name' => $row['name'],
            'type' => $row['type'],
            'created_at' => $row['created_at'],
            'updated_at' => $row['updated_at'],
            'alternatives' => [] // Will be populated separately
        ];
        
        // Add type-specific fields
        if ($row['type'] === 'physical') {
            $supplier['address'] = $row['address'];
            $supplier['contactName'] = $row['contact_name'];
            $supplier['contactNumber'] = $row['contact_number'];
            $supplier['email'] = $row['email'];
            $supplier['openingHours'] = $row['opening_hours'];
            $supplier['deliveryInfo'] = $row['delivery_info'];
            $supplier['communicationMode'] = $row['communication_mode'];
        } else if ($row['type'] === 'online') {
            $supplier['link'] = $row['link'];
            $supplier['platform'] = $row['platform'];
            $supplier['deliveryInfo'] = $row['delivery_info'];
        }
        
        // Add common fields
        $supplier['notes'] = $row['notes'];
        
        // Handle legacy data
        if ($row['type'] === 'local') {
            $supplier['type'] = 'physical'; // Convert legacy type
            $supplier['contactPerson'] = $row['contact_name'];
            $supplier['phone'] = $row['contact_number'];
            $supplier['email'] = $row['email'];
            $supplier['address'] = $row['address'];
            $supplier['preferredPayment'] = $row['delivery_info']; // Repurposing field
        } else if ($row['type'] === 'online' && isset($row['link'])) {
            $supplier['contactPerson'] = $row['contact_name'];
            $supplier['phone'] = $row['contact_number'];
            $supplier['email'] = $row['email'];
            $supplier['website'] = $row['link'];
            $supplier['preferredPayment'] = $row['delivery_info']; // Repurposing field
        }
        
        $suppliers[] = $supplier;
    }
    
    // Get alternatives for each supplier
    foreach ($suppliers as &$supplier) {
        $supplierId = $supplier['id'];
        $altSql = "SELECT * FROM supplier_alternatives WHERE supplier_id = $supplierId AND is_fixed_pineapple = 0";
        $altResult = mysqli_query($conn, $altSql);
        
        if ($altResult) {
            while ($altRow = mysqli_fetch_assoc($altResult)) {
                $alternative = [
                    'id' => $altRow['id'],
                    'name' => $altRow['name'],
                    'contactInfo' => $altRow['contact_info'],
                    'link' => $altRow['link'],
                    'created_at' => $altRow['created_at'],
                    'updated_at' => $altRow['updated_at']
                ];
                
                // Add individual fields if they exist
                if (isset($altRow['address'])) $alternative['address'] = $altRow['address'];
                if (isset($altRow['contact_name'])) $alternative['contactName'] = $altRow['contact_name'];
                if (isset($altRow['contact_number'])) $alternative['contactNumber'] = $altRow['contact_number'];
                if (isset($altRow['email'])) $alternative['email'] = $altRow['email'];
                if (isset($altRow['opening_hours'])) $alternative['openingHours'] = $altRow['opening_hours'];
                
                $supplier['alternatives'][] = $alternative;
            }
        }
    }
    
    sendResponse('success', 'Suppliers retrieved successfully', $suppliers);
}

// Function to get a specific supplier
function getSupplier($id) {
    global $conn;
    
    $sql = "SELECT * FROM suppliers WHERE id = $id";
    $result = mysqli_query($conn, $sql);
    
    if (!$result) {
        sendResponse('error', 'Database error: ' . mysqli_error($conn));
    }
    
    if (mysqli_num_rows($result) === 0) {
        sendResponse('error', 'Supplier not found');
    }
    
    $row = mysqli_fetch_assoc($result);
    
    // Convert database field names to camelCase for JavaScript
    $supplier = [
        'id' => $row['id'],
        'name' => $row['name'],
        'type' => $row['type'],
        'created_at' => $row['created_at'],
        'updated_at' => $row['updated_at'],
        'alternatives' => [] // Will be populated separately
    ];
    
    // Add type-specific fields
    if ($row['type'] === 'physical') {
        $supplier['address'] = $row['address'];
        $supplier['contactName'] = $row['contact_name'];
        $supplier['contactNumber'] = $row['contact_number'];
        $supplier['email'] = $row['email'];
        $supplier['openingHours'] = $row['opening_hours'];
        $supplier['deliveryInfo'] = $row['delivery_info'];
        $supplier['communicationMode'] = $row['communication_mode'];
    } else if ($row['type'] === 'online') {
        $supplier['link'] = $row['link'];
        $supplier['platform'] = $row['platform'];
        $supplier['deliveryInfo'] = $row['delivery_info'];
    }
    
    // Add common fields
    $supplier['notes'] = $row['notes'];
    
    // Handle legacy data
    if ($row['type'] === 'local') {
        $supplier['type'] = 'physical'; // Convert legacy type
        $supplier['contactPerson'] = $row['contact_name'];
        $supplier['phone'] = $row['contact_number'];
        $supplier['email'] = $row['email'];
        $supplier['address'] = $row['address'];
        $supplier['preferredPayment'] = $row['delivery_info']; // Repurposing field
    } else if ($row['type'] === 'online' && isset($row['link'])) {
        $supplier['contactPerson'] = $row['contact_name'];
        $supplier['phone'] = $row['contact_number'];
        $supplier['email'] = $row['email'];
        $supplier['website'] = $row['link'];
        $supplier['preferredPayment'] = $row['delivery_info']; // Repurposing field
    }
    
    // Get alternatives for this supplier
    $altSql = "SELECT * FROM supplier_alternatives WHERE supplier_id = $id AND is_fixed_pineapple = 0";
    $altResult = mysqli_query($conn, $altSql);
    
    if ($altResult) {
        while ($altRow = mysqli_fetch_assoc($altResult)) {
            $alternative = [
                'id' => $altRow['id'],
                'name' => $altRow['name'],
                'contactInfo' => $altRow['contact_info'],
                'link' => $altRow['link'],
                'created_at' => $altRow['created_at'],
                'updated_at' => $altRow['updated_at']
            ];
            
            $supplier['alternatives'][] = $alternative;
        }
    }
    
    sendResponse('success', 'Supplier retrieved successfully', $supplier);
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
    $altSql = "SELECT * FROM supplier_alternatives WHERE is_fixed_pineapple = 1 ORDER BY created_at DESC";
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

// Function to get fixed pineapple alternatives (NOW INCLUDING farm_location)
function getFixedPineappleAlternatives() {
    global $conn;
    
    $sql = "SELECT * FROM supplier_alternatives WHERE is_fixed_pineapple = 1 ORDER BY created_at DESC";
    $result = mysqli_query($conn, $sql);
    
    if (!$result) {
        sendResponse('error', 'Database error: ' . mysqli_error($conn));
    }
    
    $alternatives = [];
    while ($row = mysqli_fetch_assoc($result)) {
        $alternative = [
            'id' => $row['id'],
            'name' => $row['name'],
            'contactInfo' => $row['contact_info'],
            'farmLocation' => $row['farm_location'], // RESTORED for alternatives
            'link' => $row['link'],
            'deliveryInfo' => $row['delivery_info'],
            'communicationMode' => $row['communication_mode'],
            'notes' => $row['notes'],
            'harvestSeason' => $row['harvest_season'],
            'plantingCycle' => $row['planting_cycle'],
            'variety' => $row['variety'],
            'shelfLife' => $row['shelf_life'],
            'created_at' => $row['created_at'],
            'updated_at' => $row['updated_at']
        ];
        
        $alternatives[] = $alternative;
    }
    
    sendResponse('success', 'Fixed pineapple alternatives retrieved successfully', $alternatives);
}

// Function to get alternatives for a specific supplier
function getSupplierAlternatives($supplierId) {
    global $conn;
    
    $sql = "SELECT * FROM supplier_alternatives WHERE supplier_id = $supplierId AND is_fixed_pineapple = 0";
    $result = mysqli_query($conn, $sql);
    
    if (!$result) {
        sendResponse('error', 'Database error: ' . mysqli_error($conn));
    }
    
    $alternatives = [];
    while ($row = mysqli_fetch_assoc($result)) {
        $alternative = [
            'id' => $row['id'],
            'name' => $row['name'],
            'contactInfo' => $row['contact_info'],
            'link' => $row['link'],
            'created_at' => $row['created_at'],
            'updated_at' => $row['updated_at']
        ];
        
        // Add individual fields if they exist
        if (isset($row['address'])) $alternative['address'] = $row['address'];
        if (isset($row['contact_name'])) $alternative['contactName'] = $row['contact_name'];
        if (isset($row['contact_number'])) $alternative['contactNumber'] = $row['contact_number'];
        if (isset($row['email'])) $alternative['email'] = $row['email'];
        if (isset($row['opening_hours'])) $alternative['openingHours'] = $row['opening_hours'];
        
        $alternatives[] = $alternative;
    }
    
    sendResponse('success', 'Supplier alternatives retrieved successfully', $alternatives);
}

// Function to add a new supplier
function addSupplier($data) {
    global $conn;
    
    // Validate required fields
    if (!isset($data['name']) || !isset($data['type'])) {
        sendResponse('error', 'Name and type are required');
    }
    
    // Sanitize input
    $name = sanitizeInput($data['name']);
    $type = sanitizeInput($data['type']);
    $notes = isset($data['notes']) ? sanitizeInput($data['notes']) : '';
    
    // Get current timestamp
    $currentTime = date('Y-m-d H:i:s');
    
    // Prepare SQL based on supplier type
    $sql = "INSERT INTO suppliers (name, type, notes, created_at, updated_at";
    $values = "'$name', '$type', '$notes', '$currentTime', '$currentTime'";
    
    // Add type-specific fields
    if ($type === 'physical') {
        $address = isset($data['address']) ? sanitizeInput($data['address']) : '';
        $contactName = isset($data['contactName']) ? sanitizeInput($data['contactName']) : '';
        $contactNumber = isset($data['contactNumber']) ? sanitizeInput($data['contactNumber']) : '';
        $email = isset($data['email']) ? sanitizeInput($data['email']) : '';
        $openingHours = isset($data['openingHours']) ? sanitizeInput($data['openingHours']) : '';
        $deliveryInfo = isset($data['deliveryInfo']) ? sanitizeInput($data['deliveryInfo']) : '';
        $communicationMode = isset($data['communicationMode']) ? sanitizeInput($data['communicationMode']) : '';
        
        $sql .= ", address, contact_name, contact_number, email, opening_hours, delivery_info, communication_mode";
        $values .= ", '$address', '$contactName', '$contactNumber', '$email', '$openingHours', '$deliveryInfo', '$communicationMode'";
    } else if ($type === 'online') {
        $link = isset($data['link']) ? sanitizeInput($data['link']) : '';
        $platform = isset($data['platform']) ? sanitizeInput($data['platform']) : '';
        $deliveryInfo = isset($data['deliveryInfo']) ? sanitizeInput($data['deliveryInfo']) : '';
        
        $sql .= ", link, platform, delivery_info";
        $values .= ", '$link', '$platform', '$deliveryInfo'";
    }
    
    $sql .= ") VALUES ($values)";
    
    $result = mysqli_query($conn, $sql);
    
    if (!$result) {
        sendResponse('error', 'Database error: ' . mysqli_error($conn));
    }
    
    $newId = mysqli_insert_id($conn);
    
    sendResponse('success', 'Supplier added successfully', ['id' => $newId]);
}

// Function to update a supplier
function updateSupplier($data) {
    global $conn;
    
    // Validate required fields
    if (!isset($data['id']) || !isset($data['name'])) {
        sendResponse('error', 'ID and name are required');
    }
    
    // Sanitize input
    $id = sanitizeInput($data['id']);
    $name = sanitizeInput($data['name']);
    $type = isset($data['type']) ? sanitizeInput($data['type']) : '';
    $notes = isset($data['notes']) ? sanitizeInput($data['notes']) : '';
    
    // Get current timestamp
    $currentTime = date('Y-m-d H:i:s');
    
    // Prepare SQL
    $sql = "UPDATE suppliers SET name = '$name', notes = '$notes', updated_at = '$currentTime'";
    
    // Add type-specific fields based on the type
    if ($type === 'physical') {
        $address = isset($data['address']) ? sanitizeInput($data['address']) : '';
        $contactName = isset($data['contactName']) ? sanitizeInput($data['contactName']) : '';
        $contactNumber = isset($data['contactNumber']) ? sanitizeInput($data['contactNumber']) : '';
        $email = isset($data['email']) ? sanitizeInput($data['email']) : '';
        $openingHours = isset($data['openingHours']) ? sanitizeInput($data['openingHours']) : '';
        $deliveryInfo = isset($data['deliveryInfo']) ? sanitizeInput($data['deliveryInfo']) : '';
        $communicationMode = isset($data['communicationMode']) ? sanitizeInput($data['communicationMode']) : '';
        
        $sql .= ", address = '$address', contact_name = '$contactName', contact_number = '$contactNumber', 
                  email = '$email', opening_hours = '$openingHours', delivery_info = '$deliveryInfo', 
                  communication_mode = '$communicationMode'";
    } else if ($type === 'online') {
        $link = isset($data['link']) ? sanitizeInput($data['link']) : '';
        $platform = isset($data['platform']) ? sanitizeInput($data['platform']) : '';
        $deliveryInfo = isset($data['deliveryInfo']) ? sanitizeInput($data['deliveryInfo']) : '';
        
        $sql .= ", link = '$link', platform = '$platform', delivery_info = '$deliveryInfo'";
    }
    
    $sql .= " WHERE id = $id";
    
    $result = mysqli_query($conn, $sql);
    
    if (!$result) {
        sendResponse('error', 'Database error: ' . mysqli_error($conn));
    }
    
    sendResponse('success', 'Supplier updated successfully');
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

// Function to delete a supplier
function deleteSupplier($id) {
    global $conn;
    
    // First delete all alternatives for this supplier
    $altSql = "DELETE FROM supplier_alternatives WHERE supplier_id = $id AND is_fixed_pineapple = 0";
    mysqli_query($conn, $altSql);
    
    // Then delete the supplier
    $sql = "DELETE FROM suppliers WHERE id = $id";
    $result = mysqli_query($conn, $sql);
    
    if (!$result) {
        sendResponse('error', 'Database error: ' . mysqli_error($conn));
    }
    
    sendResponse('success', 'Supplier deleted successfully');
}

// Function to add an alternative supplier (INCLUDING farm_location for pineapple alternatives)
function addAlternativeSupplier($data) {
    global $conn;
    
    try {
        // Log that the function is being called
        error_log("addAlternativeSupplier called with data: " . json_encode($data));

        // Validate required fields
        if (!isset($data['name'])) {
            sendResponse('error', 'Name is required');
        }
        
        // Sanitize input (INCLUDING farmLocation for pineapple alternatives)
        $name = sanitizeInput($data['name']);
        $contactInfo = isset($data['contactInfo']) ? sanitizeInput($data['contactInfo']) : '';
        $farmLocation = isset($data['farmLocation']) ? sanitizeInput($data['farmLocation']) : ''; // RESTORED
        $link = isset($data['link']) ? sanitizeInput($data['link']) : '';
        $deliveryInfo = isset($data['deliveryInfo']) ? sanitizeInput($data['deliveryInfo']) : '';
        $communicationMode = isset($data['communicationMode']) ? sanitizeInput($data['communicationMode']) : '';
        $notes = isset($data['notes']) ? sanitizeInput($data['notes']) : '';
        $harvestSeason = isset($data['harvestSeason']) ? sanitizeInput($data['harvestSeason']) : '';
        $plantingCycle = isset($data['plantingCycle']) ? sanitizeInput($data['plantingCycle']) : '';
        $variety = isset($data['variety']) ? sanitizeInput($data['variety']) : '';
        $shelfLife = isset($data['shelfLife']) ? sanitizeInput($data['shelfLife']) : '';
        
        // Check if this is for the fixed pineapple supplier
        $isFixedPineapple = isset($data['isFixedPineapple']) && $data['isFixedPineapple'] === true ? 1 : 0;
        
        // Get current timestamp
        $currentTime = date('Y-m-d H:i:s');
        
        // Log the data for debugging
        error_log("Adding alternative supplier - isFixedPineapple: $isFixedPineapple, farmLocation: $farmLocation");
        
        // For fixed pineapple alternatives, we'll use a different approach
        if ($isFixedPineapple) {
            // Check if a similar record already exists to prevent duplicates
            $checkSql = "SELECT id FROM supplier_alternatives WHERE 
                        name = '$name' AND 
                        contact_info = '$contactInfo' AND 
                        is_fixed_pineapple = 1 AND 
                        created_at > DATE_SUB(NOW(), INTERVAL 1 MINUTE)";
            
            $checkResult = mysqli_query($conn, $checkSql);
            
            if ($checkResult && mysqli_num_rows($checkResult) > 0) {
                // A similar record was recently added, likely a duplicate submission
                sendResponse('success', 'Alternative supplier already added');
                return;
            }
            
            // Insert without supplier_id for fixed pineapple alternatives (INCLUDING farm_location)
            $sql = "INSERT INTO supplier_alternatives (
                        name, 
                        contact_info, 
                        farm_location,
                        link, 
                        is_fixed_pineapple,
                        delivery_info,
                        communication_mode,
                        notes,
                        harvest_season,
                        planting_cycle,
                        variety,
                        shelf_life,
                        created_at,
                        updated_at
                    ) VALUES (
                        '$name', 
                        '$contactInfo', 
                        '$farmLocation',
                        '$link', 
                        1,
                        '$deliveryInfo',
                        '$communicationMode',
                        '$notes',
                        '$harvestSeason',
                        '$plantingCycle',
                        '$variety',
                        '$shelfLife',
                        '$currentTime',
                        '$currentTime'
                    )";
                    
            error_log("SQL Query for fixed pineapple alternative: " . $sql);
        } else {
            // For regular supplier alternatives, include supplier_id
            if (!isset($data['supplierId']) || empty($data['supplierId'])) {
                sendResponse('error', 'Supplier ID is required for non-fixed pineapple alternatives');
            }
            
            $supplierId = sanitizeInput($data['supplierId']);
            
            // Check if supplier exists
            $checkSql = "SELECT id FROM suppliers WHERE id = '$supplierId'";
            $checkResult = mysqli_query($conn, $checkSql);
            
            if (!$checkResult || mysqli_num_rows($checkResult) === 0) {
                sendResponse('error', 'Invalid supplier ID: Supplier does not exist');
            }
            
            // Extract individual fields for physical supplier alternatives
            $address = isset($data['address']) ? sanitizeInput($data['address']) : '';
            $contactName = isset($data['contactName']) ? sanitizeInput($data['contactName']) : '';
            $contactNumber = isset($data['contactNumber']) ? sanitizeInput($data['contactNumber']) : '';
            $email = isset($data['email']) ? sanitizeInput($data['email']) : '';
            $openingHours = isset($data['openingHours']) ? sanitizeInput($data['openingHours']) : '';
            $deliveryInfo = isset($data['deliveryInfo']) ? sanitizeInput($data['deliveryInfo']) : '';
            $communicationMode = isset($data['communicationMode']) ? sanitizeInput($data['communicationMode']) : '';
            $contactInfo = "Name: $contactName, Number: $contactNumber"; // Format contact info from separate fields
            
            // Regular alternatives don't need farm_location, so we don't include it
            $sql = "INSERT INTO supplier_alternatives (
                        name, 
                        contact_info,
                        link, 
                        supplier_id, 
                        is_fixed_pineapple,
                        delivery_info,
                        communication_mode,
                        notes,
                        harvest_season,
                        planting_cycle,
                        variety,
                        shelf_life,
                        created_at,
                        updated_at,
                        address,
                        contact_name,
                        contact_number,
                        email,
                        opening_hours
                    ) VALUES (
                        '$name', 
                        '$contactInfo',
                        '$link', 
                        '$supplierId', 
                        0,
                        '$deliveryInfo',
                        '$communicationMode',
                        '$notes',
                        NULL,
                        NULL,
                        NULL,
                        NULL,
                        '$currentTime',
                        '$currentTime',
                        '$address',
                        '$contactName',
                        '$contactNumber',
                        '$email',
                        '$openingHours'
                    )";
                    
            error_log("SQL Query for regular alternative: " . $sql);
        }
        
        $result = mysqli_query($conn, $sql);
        
        if (!$result) {
            logError("Database error in addAlternativeSupplier: " . mysqli_error($conn) . " - SQL: " . $sql);
            sendResponse('error', 'Database error: ' . mysqli_error($conn));
        }
        
        $newId = mysqli_insert_id($conn);
        
        sendResponse('success', 'Alternative supplier added successfully', ['id' => $newId]);
    } catch (Exception $e) {
        logError("Exception in addAlternativeSupplier: " . $e->getMessage());
        sendResponse('error', 'An unexpected error occurred: ' . $e->getMessage());
    }
}

// Function to delete an alternative
function deleteAlternative($id, $isFixedPineapple) {
    global $conn;
    
    $fixedCondition = $isFixedPineapple ? "AND is_fixed_pineapple = 1" : "AND is_fixed_pineapple = 0";
    
    $sql = "DELETE FROM supplier_alternatives WHERE id = $id $fixedCondition";
    $result = mysqli_query($conn, $sql);
    
    if (!$result) {
        sendResponse('error', 'Database error: ' . mysqli_error($conn));
    }
    
    sendResponse('success', 'Alternative supplier deleted successfully');
}
?>
