<?php
// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Include database connection
require_once 'db_connection.php';

// Start session if not already started
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Check if user is logged in
if (!isset($_SESSION['user_id'])) {
    header('Location: login.php');
    exit;
}

// Get inventory log data
function getInventoryLogs($conn, $filters = []) {
    $query = "SELECT il.*, p.product_name, 
              CASE 
                WHEN il.change_type = 'order_completion' THEN CONCAT('Order #', il.order_id)
                ELSE il.notes
              END AS description
              FROM inventory_log il
              JOIN products p ON il.product_id = p.product_id
              WHERE 1=1";
    
    $params = [];
    $types = "";
    
    // Apply filters
    if (!empty($filters['product_id'])) {
        $query .= " AND il.product_id = ?";
        $params[] = $filters['product_id'];
        $types .= "s";
    }
    
    if (!empty($filters['change_type'])) {
        $query .= " AND il.change_type = ?";
        $params[] = $filters['change_type'];
        $types .= "s";
    }
    
    if (!empty($filters['start_date']) && !empty($filters['end_date'])) {
        $query .= " AND DATE(il.created_at) BETWEEN ? AND ?";
        $params[] = $filters['start_date'];
        $params[] = $filters['end_date'];
        $types .= "ss";
    }
    
    // Order by most recent first
    $query .= " ORDER BY il.created_at DESC LIMIT 100";
    
    $stmt = $conn->prepare($query);
    
    if (!empty($params)) {
        $stmt->bind_param($types, ...$params);
    }
    
    $stmt->execute();
    $result = $stmt->get_result();
    
    $logs = [];
    while ($row = $result->fetch_assoc()) {
        $logs[] = $row;
    }
    
    return $logs;
}

// Get products for filter dropdown
function getProducts($conn) {
    $query = "SELECT product_id, product_name FROM products ORDER BY product_name";
    $result = $conn->query($query);
    
    $products = [];
    while ($row = $result->fetch_assoc()) {
        $products[] = $row;
    }
    
    return $products;
}

// Get filters from request
$filters = [
    'product_id' => $_GET['product_id'] ?? '',
    'change_type' => $_GET['change_type'] ?? '',
    'start_date' => $_GET['start_date'] ?? '',
    'end_date' => $_GET['end_date'] ?? ''
];

// Get data
$logs = getInventoryLogs($conn, $filters);
$products = getProducts($conn);

// Close connection
$conn->close();
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Inventory Change Log - Piñana Gourmet</title>
    <!-- Bootstrap CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/css/bootstrap.min.css" rel="stylesheet">
    <!-- Bootstrap Icons -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.0/font/bootstrap-icons.css">
    <!-- Flatpickr for date picking -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/flatpickr/dist/flatpickr.min.css">
    <!-- Custom CSS -->
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <div class="container-fluid">
        <div class="row">
            <!-- Sidebar (include your existing sidebar here) -->
            
            <!-- Main content -->
            <div class="col-md-9 ms-sm-auto col-lg-10 px-md-4 main-content">
                <!-- Header -->
                <div class="fixed-top-header">
                    <div class="d-flex justify-content-between align-items-center w-100">
                        <div class="d-flex align-items-center">
                            <button class="navbar-toggler d-md-none collapsed me-2" type="button" id="sidebarToggle">
                                <i class="bi bi-list"></i>
                            </button>
                            <h5 class="mb-0">Inventory Change Log</h5>
                        </div>
                        <!-- User profile dropdown (include your existing dropdown here) -->
                    </div>
                </div>
                
                <div class="main-content-inner">
                    <!-- Filters -->
                    <div class="card mb-4">
                        <div class="card-body">
                            <h5 class="card-title mb-3">
                                <i class="bi bi-funnel me-2"></i>Filter Inventory Changes
                            </h5>
                            <form method="get" class="row g-3">
                                <div class="col-md-3">
                                    <label for="product_id" class="form-label">Product</label>
                                    <select class="form-select" id="product_id" name="product_id">
                                        <option value="">All Products</option>
                                        <?php foreach ($products as $product): ?>
                                            <option value="<?= htmlspecialchars($product['product_id']) ?>" 
                                                <?= ($filters['product_id'] == $product['product_id']) ? 'selected' : '' ?>>
                                                <?= htmlspecialchars($product['product_name']) ?>
                                            </option>
                                        <?php endforeach; ?>
                                    </select>
                                </div>
                                <div class="col-md-3">
                                    <label for="change_type" class="form-label">Change Type</label>
                                    <select class="form-select" id="change_type" name="change_type">
                                        <option value="">All Types</option>
                                        <option value="order_completion" <?= ($filters['change_type'] == 'order_completion') ? 'selected' : '' ?>>Order Completion</option>
                                        <option value="manual_adjustment" <?= ($filters['change_type'] == 'manual_adjustment') ? 'selected' : '' ?>>Manual Adjustment</option>
                                        <option value="return" <?= ($filters['change_type'] == 'return') ? 'selected' : '' ?>>Return</option>
                                        <option value="restock" <?= ($filters['change_type'] == 'restock') ? 'selected' : '' ?>>Restock</option>
                                    </select>
                                </div>
                                <div class="col-md-2">
                                    <label for="start_date" class="form-label">Start Date</label>
                                    <input type="date" class="form-control datepicker" id="start_date" name="start_date" value="<?= htmlspecialchars($filters['start_date']) ?>">
                                </div>
                                <div class="col-md-2">
                                    <label for="end_date" class="form-label">End Date</label>
                                    <input type="date" class="form-control datepicker" id="end_date" name="end_date" value="<?= htmlspecialchars($filters['end_date']) ?>">
                                </div>
                                <div class="col-md-2 d-flex align-items-end">
                                    <button type="submit" class="btn btn-primary me-2">
                                        <i class="bi bi-search me-1"></i> Filter
                                    </button>
                                    <a href="inventory_report.php" class="btn btn-outline-secondary">
                                        <i class="bi bi-x-circle me-1"></i> Clear
                                    </a>
                                </div>
                            </form>
                        </div>
                    </div>
                    
                    <!-- Inventory Log Table -->
                    <div class="card">
                        <div class="card-body">
                            <h5 class="card-title mb-3">
                                <i class="bi bi-clock-history me-2"></i>Inventory Change History
                            </h5>
                            
                            <div class="table-responsive">
                                <table class="table table-hover">
                                    <thead class="table-light">
                                        <tr>
                                            <th>Date & Time</th>
                                            <th>Product</th>
                                            <th>Change Type</th>
                                            <th>Description</th>
                                            <th>Previous Stock</th>
                                            <th>Quantity</th>
                                            <th>New Stock</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <?php if (empty($logs)): ?>
                                            <tr>
                                                <td colspan="7" class="text-center py-4">
                                                    <i class="bi bi-inbox fs-1 text-muted"></i>
                                                    <p class="mt-2 mb-0">No inventory changes found</p>
                                                </td>
                                            </tr>
                                        <?php else: ?>
                                            <?php foreach ($logs as $log): ?>
                                                <tr>
                                                    <td><?= htmlspecialchars(date('Y-m-d H:i:s', strtotime($log['created_at']))) ?></td>
                                                    <td><?= htmlspecialchars($log['product_name']) ?></td>
                                                    <td>
                                                        <?php 
                                                        $badgeClass = '';
                                                        $changeType = '';
                                                        
                                                        switch ($log['change_type']) {
                                                            case 'order_completion':
                                                                $badgeClass = 'bg-primary';
                                                                $changeType = 'Order Completion';
                                                                break;
                                                            case 'manual_adjustment':
                                                                $badgeClass = 'bg-warning';
                                                                $changeType = 'Manual Adjustment';
                                                                break;
                                                            case 'return':
                                                                $badgeClass = 'bg-success';
                                                                $changeType = 'Return';
                                                                break;
                                                            case 'restock':
                                                                $badgeClass = 'bg-info';
                                                                $changeType = 'Restock';
                                                                break;
                                                            default:
                                                                $badgeClass = 'bg-secondary';
                                                                $changeType = $log['change_type'];
                                                        }
                                                        ?>
                                                        <span class="badge <?= $badgeClass ?>"><?= $changeType ?></span>
                                                    </td>
                                                    <td><?= htmlspecialchars($log['description']) ?></td>
                                                    <td><?= htmlspecialchars($log['previous_stock']) ?></td>
                                                    <td>
                                                        <?php if ($log['change_type'] == 'order_completion' || $log['change_type'] == 'manual_adjustment'): ?>
                                                            <span class="text-danger">-<?= htmlspecialchars($log['quantity']) ?></span>
                                                        <?php else: ?>
                                                            <span class="text-success">+<?= htmlspecialchars($log['quantity']) ?></span>
                                                        <?php endif; ?>
                                                    </td>
                                                    <td><?= htmlspecialchars($log['new_stock']) ?></td>
                                                </tr>
                                            <?php endforeach; ?>
                                        <?php endif; ?>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    
    <!-- Bootstrap JS Bundle with Popper -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/js/bootstrap.bundle.min.js"></script>
    <!-- Flatpickr JS -->
    <script src="https://cdn.jsdelivr.net/npm/flatpickr"></script>
    <!-- jQuery (needed for some functionality) -->
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    
    <script>
        // Initialize date pickers
        document.addEventListener('DOMContentLoaded', function() {
            if (typeof flatpickr !== 'undefined') {
                flatpickr(".datepicker", {
                    dateFormat: "Y-m-d",
                    allowInput: true
                });
            }
        });
    </script>
</body>
</html>
