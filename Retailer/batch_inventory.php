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

// Get products with batch tracking enabled
function getBatchTrackedProducts($conn) {
    $query = "SELECT p.product_id, p.product_name, p.stocks, p.category, p.price, p.batch_tracking 
              FROM products p 
              WHERE p.batch_tracking = 1 
              ORDER BY p.product_name";
    
    $result = $conn->query($query);
    
    $products = [];
    while ($row = $result->fetch_assoc()) {
        $products[] = $row;
    }
    
    return $products;
}

// Get batch details for a product
function getProductBatches($conn, $productId) {
    $query = "SELECT b.batch_id, b.batch_code, b.quantity, b.expiration_date, 
              b.manufacturing_date, b.created_at, b.updated_at 
              FROM product_batches b 
              WHERE b.product_id = ? AND b.quantity > 0 
              ORDER BY b.expiration_date ASC, b.batch_id ASC";
    
    $stmt = $conn->prepare($query);
    $stmt->bind_param('s', $productId);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $batches = [];
    while ($row = $result->fetch_assoc()) {
        $batches[] = $row;
    }
    
    return $batches;
}

// Get products with expiring batches
function getExpiringBatches($conn, $daysThreshold = 30) {
    $query = "SELECT p.product_id, p.product_name, b.batch_id, b.batch_code, 
              b.quantity, b.expiration_date, 
              DATEDIFF(b.expiration_date, CURDATE()) as days_until_expiry 
              FROM product_batches b 
              JOIN products p ON b.product_id = p.product_id 
              WHERE b.quantity > 0 
              AND b.expiration_date IS NOT NULL 
              AND b.expiration_date != '0000-00-00' 
              AND DATEDIFF(b.expiration_date, CURDATE()) <= ? 
              ORDER BY days_until_expiry ASC";
    
    $stmt = $conn->prepare($query);
    $stmt->bind_param('i', $daysThreshold);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $expiringBatches = [];
    while ($row = $result->fetch_assoc()) {
        $expiringBatches[] = $row;
    }
    
    return $expiringBatches;
}

// Get data
$products = getBatchTrackedProducts($conn);
$expiringBatches = getExpiringBatches($conn, 30);

// Get batches for a specific product if requested
$selectedProductId = isset($_GET['product_id']) ? $_GET['product_id'] : null;
$productBatches = $selectedProductId ? getProductBatches($conn, $selectedProductId) : [];

// Close connection
$conn->close();
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Batch Inventory - Piñana Gourmet</title>
    <!-- Bootstrap CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/css/bootstrap.min.css" rel="stylesheet">
    <!-- Bootstrap Icons -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.0/font/bootstrap-icons.css">
    <!-- Custom CSS -->
    <link rel="stylesheet" href="styles.css">
    <style>
        .expiry-warning { background-color: #fff3cd; }
        .expiry-danger { background-color: #f8d7da; }
        .expiry-expired { background-color: #dc3545; color: white; }

        /* FIFO Batch Tracking Styles */

/* Batch status colors */
.batch-status-expired {
    background-color: #f8d7da;
    border-left: 4px solid #dc3545;
}

.batch-status-critical {
    background-color: #fff3cd;
    border-left: 4px solid #ffc107;
}

.batch-status-warning {
    background-color: #e2f0fb;
    border-left: 4px solid #0dcaf0;
}

.batch-status-good {
    background-color: #d1e7dd;
    border-left: 4px solid #198754;
}

/* Batch details modal */
.batch-details-modal .modal-header {
    background-color: #f8f9fa;
}

.batch-details-table th {
    background-color: #f8f9fa;
    font-weight: 600;
}

.batch-details-table .expiry-date {
    font-weight: 500;
}

/* Batch deduction animation */
@keyframes batch-deduction {
    0% { background-color: rgba(255, 193, 7, 0.2); }
    100% { background-color: transparent; }
}

.batch-deducted {
    animation: batch-deduction 2s ease-out;
}

/* FIFO order indicator */
.fifo-indicator {
    display: inline-block;
    padding: 0.25rem 0.5rem;
    background-color: #e9ecef;
    border-radius: 0.25rem;
    font-size: 0.75rem;
    font-weight: 600;
    margin-bottom: 0.5rem;
}

.fifo-indicator i {
    margin-right: 0.25rem;
}

/* Batch tracking badge */
.batch-tracking-badge {
    display: inline-flex;
    align-items: center;
    padding: 0.25rem 0.5rem;
    background-color: #e9ecef;
    border-radius: 0.25rem;
    font-size: 0.75rem;
    font-weight: 600;
}

.batch-tracking-badge i {
    margin-right: 0.25rem;
}

.batch-tracking-enabled {
    background-color: #d1e7dd;
    color: #0f5132;
}

.batch-tracking-disabled {
    background-color: #f8d7da;
    color: #842029;
}
    </style>
    
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
                            <h5 class="mb-0">Batch Inventory Management</h5>
                        </div>
                        <!-- User profile dropdown (include your existing dropdown here) -->
                    </div>
                </div>
                
                <div class="main-content-inner">
                    <!-- Expiring Batches Alert -->
                    <?php if (!empty($expiringBatches)): ?>
                    <div class="card mb-4">
                        <div class="card-header bg-warning text-dark">
                            <h5 class="card-title mb-0">
                                <i class="bi bi-exclamation-triangle-fill me-2"></i>Expiring Batches Alert
                            </h5>
                        </div>
                        <div class="card-body">
                            <div class="table-responsive">
                                <table class="table table-hover">
                                    <thead>
                                        <tr>
                                            <th>Product</th>
                                            <th>Batch Code</th>
                                            <th>Quantity</th>
                                            <th>Expiration Date</th>
                                            <th>Days Until Expiry</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <?php foreach ($expiringBatches as $batch): ?>
                                            <?php 
                                                $rowClass = '';
                                                if ($batch['days_until_expiry'] < 0) {
                                                    $rowClass = 'expiry-expired';
                                                } elseif ($batch['days_until_expiry'] <= 7) {
                                                    $rowClass = 'expiry-danger';
                                                } elseif ($batch['days_until_expiry'] <= 30) {
                                                    $rowClass = 'expiry-warning';
                                                }
                                            ?>
                                            <tr class="<?= $rowClass ?>">
                                                <td><?= htmlspecialchars($batch['product_name']) ?></td>
                                                <td><?= htmlspecialchars($batch['batch_code']) ?></td>
                                                <td><?= htmlspecialchars($batch['quantity']) ?></td>
                                                <td><?= htmlspecialchars(date('Y-m-d', strtotime($batch['expiration_date']))) ?></td>
                                                <td>
                                                    <?php if ($batch['days_until_expiry'] < 0): ?>
                                                        <span class="badge bg-danger">Expired <?= abs($batch['days_until_expiry']) ?> days ago</span>
                                                    <?php else: ?>
                                                        <span class="badge bg-<?= $batch['days_until_expiry'] <= 7 ? 'danger' : 'warning' ?>">
                                                            <?= $batch['days_until_expiry'] ?> days left
                                                        </span>
                                                    <?php endif; ?>
                                                </td>
                                                <td>
                                                    <a href="batch_inventory.php?product_id=<?= $batch['product_id'] ?>" class="btn btn-sm btn-outline-primary">
                                                        View All Batches
                                                    </a>
                                                </td>
                                            </tr>
                                        <?php endforeach; ?>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                    <?php endif; ?>
                    
                    <!-- Products with Batch Tracking -->
                    <div class="card mb-4">
                        <div class="card-header">
                            <h5 class="card-title mb-0">
                                <i class="bi bi-box-seam me-2"></i>Products with Batch Tracking
                            </h5>
                        </div>
                        <div class="card-body">
                            <?php if (empty($products)): ?>
                                <div class="alert alert-info">
                                    No products with batch tracking enabled.
                                </div>
                            <?php else: ?>
                                <div class="table-responsive">
                                    <table class="table table-hover">
                                        <thead>
                                            <tr>
                                                <th>Product ID</th>
                                                <th>Product Name</th>
                                                <th>Category</th>
                                                <th>Total Stock</th>
                                                <th>Price</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <?php foreach ($products as $product): ?>
                                                <tr>
                                                    <td><?= htmlspecialchars($product['product_id']) ?></td>
                                                    <td><?= htmlspecialchars($product['product_name']) ?></td>
                                                    <td><?= htmlspecialchars($product['category']) ?></td>
                                                    <td><?= htmlspecialchars($product['stocks']) ?></td>
                                                    <td>₱<?= htmlspecialchars(number_format($product['price'], 2)) ?></td>
                                                    <td>
                                                        <a href="batch_inventory.php?product_id=<?= $product['product_id'] ?>" class="btn btn-sm btn-primary">
                                                            View Batches
                                                        </a>
                                                    </td>
                                                </tr>
                                            <?php endforeach; ?>
                                        </tbody>
                                    </table>
                                </div>
                            <?php endif; ?>
                        </div>
                    </div>
                    
                    <!-- Product Batches Detail -->
                    <?php if ($selectedProductId && !empty($productBatches)): ?>
                        <?php 
                            // Get product details
                            $selectedProduct = null;
                            foreach ($products as $product) {
                                if ($product['product_id'] == $selectedProductId) {
                                    $selectedProduct = $product;
                                    break;
                                }
                            }
                        ?>
                        <div class="card">
                            <div class="card-header">
                                <div class="d-flex justify-content-between align-items-center">
                                    <h5 class="card-title mb-0">
                                        <i class="bi bi-layers me-2"></i>Batches for: <?= htmlspecialchars($selectedProduct['product_name']) ?>
                                    </h5>
                                    <a href="batch_inventory.php" class="btn btn-sm btn-outline-secondary">
                                        <i class="bi bi-arrow-left me-1"></i>Back to All Products
                                    </a>
                                </div>
                            </div>
                            <div class="card-body">
                                <div class="alert alert-info">
                                    <strong>FIFO Order:</strong> Batches are listed in the order they will be deducted when orders are completed (earliest expiration first).
                                </div>
                                <div class="table-responsive">
                                    <table class="table table-hover">
                                        <thead>
                                            <tr>
                                                <th>Batch ID</th>
                                                <th>Batch Code</th>
                                                <th>Quantity</th>
                                                <th>Expiration Date</th>
                                                <th>Manufacturing Date</th>
                                                <th>Created At</th>
                                                <th>Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <?php foreach ($productBatches as $batch): ?>
                                                <?php 
                                                    $daysUntilExpiry = null;
                                                    $rowClass = '';
                                                    $statusBadge = '';
                                                    
                                                    if ($batch['expiration_date'] && $batch['expiration_date'] != '0000-00-00') {
                                                        $expiryDate = new DateTime($batch['expiration_date']);
                                                        $today = new DateTime();
                                                        $interval = $today->diff($expiryDate);
                                                        $daysUntilExpiry = $expiryDate > $today ? $interval->days : -$interval->days;
                                                        
                                                        if ($daysUntilExpiry < 0) {
                                                            $rowClass = 'expiry-expired';
                                                            $statusBadge = '<span class="badge bg-danger">Expired</span>';
                                                        } elseif ($daysUntilExpiry <= 7) {
                                                            $rowClass = 'expiry-danger';
                                                            $statusBadge = '<span class="badge bg-danger">Critical</span>';
                                                        } elseif ($daysUntilExpiry <= 30) {
                                                            $rowClass = 'expiry-warning';
                                                            $statusBadge = '<span class="badge bg-warning text-dark">Warning</span>';
                                                        } else {
                                                            $statusBadge = '<span class="badge bg-success">Good</span>';
                                                        }
                                                    } else {
                                                        $statusBadge = '<span class="badge bg-secondary">No Expiry</span>';
                                                    }
                                                ?>
                                                <tr class="<?= $rowClass ?>">
                                                    <td><?= htmlspecialchars($batch['batch_id']) ?></td>
                                                    <td><?= htmlspecialchars($batch['batch_code']) ?></td>
                                                    <td><?= htmlspecialchars($batch['quantity']) ?></td>
                                                    <td>
                                                        <?= $batch['expiration_date'] && $batch['expiration_date'] != '0000-00-00' 
                                                            ? htmlspecialchars(date('Y-m-d', strtotime($batch['expiration_date']))) 
                                                            : 'N/A' ?>
                                                    </td>
                                                    <td>
                                                        <?= $batch['manufacturing_date'] && $batch['manufacturing_date'] != '0000-00-00' 
                                                            ? htmlspecialchars(date('Y-m-d', strtotime($batch['manufacturing_date']))) 
                                                            : 'N/A' ?>
                                                    </td>
                                                    <td><?= htmlspecialchars(date('Y-m-d', strtotime($batch['created_at']))) ?></td>
                                                    <td>
                                                        <?= $statusBadge ?>
                                                        <?php if ($daysUntilExpiry !== null): ?>
                                                            <?php if ($daysUntilExpiry < 0): ?>
                                                                <small class="d-block"><?= abs($daysUntilExpiry) ?> days ago</small>
                                                            <?php else: ?>
                                                                <small class="d-block"><?= $daysUntilExpiry ?> days left</small>
                                                            <?php endif; ?>
                                                        <?php endif; ?>
                                                    </td>
                                                </tr>
                                            <?php endforeach; ?>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    <?php elseif ($selectedProductId): ?>
                        <div class="card">
                            <div class="card-body">
                                <div class="alert alert-warning">
                                    No batches found for this product or all batches have zero quantity.
                                </div>
                                <a href="batch_inventory.php" class="btn btn-outline-secondary">
                                    <i class="bi bi-arrow-left me-1"></i>Back to All Products
                                </a>
                            </div>
                        </div>
                    <?php endif; ?>
                </div>
            </div>
        </div>
    </div>
    
    <!-- Bootstrap JS Bundle with Popper -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/js/bootstrap.bundle.min.js"></script>
    <!-- jQuery (needed for some functionality) -->
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
</body>
</html>