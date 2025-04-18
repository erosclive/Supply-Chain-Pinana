<?php
// Set headers for JSON response
header('Content-Type: application/json');

// Include database connection
require_once 'db_connection.php';

// Check database connection
if (!$conn) {
    echo json_encode([
        'success' => false,
        'error' => 'Database connection failed: ' . mysqli_connect_error()
    ]);
    exit;
}

// Get filter, sort, and search parameters
$filter = isset($_GET['filter']) ? $_GET['filter'] : 'all';
$sort = isset($_GET['sort']) ? $_GET['sort'] : 'id-desc';
$search = isset($_GET['search']) ? $_GET['search'] : '';

// Pagination parameters
$items_per_page = 6; // Number of items per page
$page = isset($_GET['page']) ? intval($_GET['page']) : 1; // Current page, default is 1
if ($page < 1) $page = 1; // Ensure page is at least 1

// Build WHERE clause for filtering and searching
$where_clause = "WHERE 1=1"; // Always true condition to start

// Apply filter
if ($filter !== 'all') {
    if ($filter === 'in-stock') {
        $where_clause .= " AND status = 'In Stock'";
    } elseif ($filter === 'low-stock') {
        $where_clause .= " AND status = 'Low Stock'";
    } elseif ($filter === 'out-of-stock') {
        $where_clause .= " AND status = 'Out of Stock'";
    }
}

// Apply search
if (!empty($search)) {
    $search = mysqli_real_escape_string($conn, $search);
    $where_clause .= " AND (product_id LIKE '%$search%' OR product_name LIKE '%$search%' OR category LIKE '%$search%')";
}

// Build ORDER BY clause for sorting
$order_clause = "ORDER BY ";
if ($sort === 'name-asc') {
    $order_clause .= "product_name ASC";
} elseif ($sort === 'name-desc') {
    $order_clause .= "product_name DESC";
} elseif ($sort === 'price-asc') {
    $order_clause .= "price ASC";
} elseif ($sort === 'price-desc') {
    $order_clause .= "price DESC";
} elseif ($sort === 'stock-asc') {
    $order_clause .= "stocks ASC";
} elseif ($sort === 'stock-desc') {
    $order_clause .= "stocks DESC";
} else {
    // Default sort by ID descending (newest first)
    $order_clause .= "id DESC";
}

// Get total number of products for pagination (with filters and search applied)
$count_sql = "SELECT COUNT(*) as total FROM products $where_clause";
$count_result = mysqli_query($conn, $count_sql);

if (!$count_result) {
    echo json_encode([
        'success' => false,
        'error' => 'Error counting products: ' . mysqli_error($conn)
    ]);
    exit;
}

$count_row = mysqli_fetch_assoc($count_result);
$total_products = $count_row['total'];
$total_pages = ceil($total_products / $items_per_page);

// Calculate offset for SQL query
$offset = ($page - 1) * $items_per_page;

// Fetch products with pagination, filtering, sorting, and searching
$sql = "SELECT * FROM products $where_clause $order_clause LIMIT $items_per_page OFFSET $offset";
$result = mysqli_query($conn, $sql);

if (!$result) {
    echo json_encode([
        'success' => false,
        'error' => 'Error fetching products: ' . mysqli_error($conn)
    ]);
    exit;
}

// Fetch all products
$products = [];
while ($row = mysqli_fetch_assoc($result)) {
    $products[] = $row;
}

// Return JSON response
echo json_encode([
    'success' => true,
    'products' => $products,
    'pagination' => [
        'current_page' => $page,
        'total_pages' => $total_pages,
        'items_per_page' => $items_per_page,
        'total_items' => $total_products
    ],
    'filter' => $filter,
    'sort' => $sort,
    'search' => $search
]);


// Close connection
mysqli_close($conn);
?>