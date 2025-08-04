<?php
// Include database connection
require_once 'db_connection.php';

// Set headers for JSON response
header('Content-Type: application/json');

// Initialize response array
$response = array(
    'success' => false,
    'message' => '',
    'materials' => array(),
    'total_pages' => 0
);

try {
    // Get pagination parameters
    $page = isset($_GET['page']) ? intval($_GET['page']) : 1;
    $items_per_page = 10;
    $offset = ($page - 1) * $items_per_page;
    
    // Get filter and sort parameters
    $filter = isset($_GET['filter']) ? $_GET['filter'] : 'all';
    $sort = isset($_GET['sort']) ? $_GET['sort'] : 'date-desc';
    $search = isset($_GET['search']) ? mysqli_real_escape_string($conn, $_GET['search']) : '';
    
    // Build WHERE clause based on filter
    $where_clause = "";
    if ($filter === 'in-stock') {
        $where_clause = "WHERE m.quantity > 10";
    } elseif ($filter === 'low-stock') {
        $where_clause = "WHERE m.quantity > 0 AND m.quantity <= 10";
    } elseif ($filter === 'out-of-stock') {
        $where_clause = "WHERE m.quantity <= 0";
    }
    
    // Add search condition if provided
    if (!empty($search)) {
        if (empty($where_clause)) {
            $where_clause = "WHERE ";
        } else {
            $where_clause .= " AND ";
        }
        $where_clause .= "(m.material_id LIKE '%$search%' OR m.name LIKE '%$search%' OR m.category LIKE '%$search%')";
    }
    
    // Build ORDER BY clause based on sort
    $order_clause = "";
    switch ($sort) {
        case 'date-desc':
            $order_clause = "ORDER BY m.date_received DESC";
            break;
        case 'date-asc':
            $order_clause = "ORDER BY m.date_received ASC";
            break;
        case 'name-asc':
            $order_clause = "ORDER BY m.name ASC";
            break;
        case 'name-desc':
            $order_clause = "ORDER BY m.name DESC";
            break;
        case 'price-asc':
            $order_clause = "ORDER BY m.cost ASC";
            break;
        case 'price-desc':
            $order_clause = "ORDER BY m.cost DESC";
            break;
        case 'stock-asc':
            $order_clause = "ORDER BY m.quantity ASC";
            break;
        case 'stock-desc':
            $order_clause = "ORDER BY m.quantity DESC";
            break;
        default:
            $order_clause = "ORDER BY m.date_received DESC";
    }
    
    // Count total materials for pagination
    $count_sql = "SELECT COUNT(*) as total FROM raw_materials m $where_clause";
    $count_result = mysqli_query($conn, $count_sql);
    $count_row = mysqli_fetch_assoc($count_result);
    $total_materials = $count_row['total'];
    $total_pages = ceil($total_materials / $items_per_page);
    
    // Get materials with pagination
    $sql = "SELECT m.*, s.name as supplier 
            FROM raw_materials m 
            LEFT JOIN suppliers s ON m.supplier_id = s.id 
            $where_clause 
            $order_clause 
            LIMIT $offset, $items_per_page";
    
    $result = mysqli_query($conn, $sql);
    
    if (!$result) {
        throw new Exception("Query failed: " . mysqli_error($conn));
    }
    
    $materials = array();
    while ($row = mysqli_fetch_assoc($result)) {
        $materials[] = $row;
    }
    
    $response['success'] = true;
    $response['materials'] = $materials;
    $response['total_pages'] = $total_pages;
    
} catch (Exception $e) {
    $response['message'] = 'Error: ' . $e->getMessage();
    error_log("Exception in get_materials.php: " . $e->getMessage());
}

// Return JSON response
echo json_encode($response);

// Close connection
mysqli_close($conn);
?>