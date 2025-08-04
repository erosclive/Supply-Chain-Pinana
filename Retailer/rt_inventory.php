<?php

session_start();
include 'db_connection.php'; 

$retailer_id = $_SESSION['user_id'];

$sql = "SELECT first_name, last_name FROM retailer_profiles WHERE user_id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $retailer_id);
$stmt->execute();
$result = $stmt->get_result();
$fullName = "Retailer Name"; 

if ($row = $result->fetch_assoc()) {
    $fullName = $row['first_name'] . ' ' . $row['last_name'];
}
?>


<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Piñana Gourmet Retailer</title>
  <!-- Bootstrap CSS -->
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/css/bootstrap.min.css" rel="stylesheet">
  <!-- Bootstrap Icons -->
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.0/font/bootstrap-icons.css">
  <!-- Flatpickr for date picking -->
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/flatpickr/dist/flatpickr.min.css">
  <!-- Custom CSS -->
  <link rel="stylesheet" href="styles.css">
  <!-- Inventory Styles -->
  <link rel="stylesheet" href="inventory-styles.css">

  <style>
/* Add this to your CSS file */
.badge.bg-danger {
  background-color: #dc3545 !important;
}

.badge.bg-success {
  background-color: #198754 !important;
}

.badge.bg-secondary {
  background-color: #6c757d !important;
}

#orderProductBatchDetailsModal .modal-body {
  max-height: 60vh;
  overflow-y: auto;
}

/* Batch history item styling */
.batch-history-item {
  border-left: 3px solid #6c757d;
  margin-bottom: 15px;
}

.batch-history-item .card-header {
  background-color: #f8f9fa;
}

/* Product details modal styling */
.product-detail-image {
  max-height: 200px;
  object-fit: contain;
  margin-bottom: 10px;
}

/* Batch status badges */
.badge.bg-danger {
  background-color: #dc3545 !important;
}

.badge.bg-warning {
  background-color: #ffc107 !important;
  color: #212529;
}

.badge.bg-success {
  background-color: #198754 !important;
}

/* Table styling for batch details */
.table-sm {
  font-size: 0.9rem;
}

/* Tabs styling */
.nav-tabs .nav-link.active {
  font-weight: 500;
  border-bottom: 2px solid #0d6efd;
}

.tab-content {
  padding-top: 1rem;
}

/* Batch deduction history modal */
#batchDeductionHistoryModal .modal-body {
  max-height: 70vh;
  overflow-y: auto;
}
/* Batch Alerts Dropdown Styles */
.batch-alerts-dropdown {
    position: absolute;
    top: 100%;
    right: 0;
    width: 350px;
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
    z-index: 1000;
    overflow: hidden;
}

.batch-alerts-header {
    padding: 12px 15px;
    background-color: #f8f9fa;
    border-bottom: 1px solid #e9ecef;
}

.batch-alerts-body {
    max-height: 350px;
    overflow-y: auto;
    padding: 15px;
}

.batch-alerts-footer {
    padding: 10px 15px;
    background-color: #f8f9fa;
    border-top: 1px solid #e9ecef;
}

.batch-alerts-body .alert {
    margin-bottom: 10px;
    font-size: 0.9rem;
}

.batch-alerts-body ul {
    margin-bottom: 0;
    font-size: 0.85rem;
}

/* Pricing tab styles */
.profit-positive {
  color: #198754;
}

.profit-negative {
  color: #dc3545;
}

.profit-neutral {
  color: #6c757d;
}

.price-input {
  max-width: 120px;
}

.order-card {
  transition: all 0.3s ease;
}

.order-card:hover {
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.product-row {
  transition: background-color 0.2s ease;
}

.product-row:hover {
  background-color: rgba(13, 110, 253, 0.05);
}

.price-history-btn {
  cursor: pointer;
}

.price-changed {
  animation: highlight 2s ease-in-out;
}

@keyframes highlight {
  0% { background-color: rgba(255, 193, 7, 0.2); }
  100% { background-color: transparent; }
}

/* Add this to your CSS file */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.loading-spinner-container {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  text-align: center;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

/* Success message styling */
.alert-success {
  background-color: #d4edda;
  border-color: #c3e6cb;
  color: #155724;
}

/* Error message styling */
.alert-danger {
  background-color: #f8d7da;
  border-color: #f5c6cb;
  color: #721c24;
}

/* Payment modal styling */
#cashPaymentModal,
#mobilePaymentModal {
  z-index: 1056;
}

/* Payment status badge styling */
.badge.partial {
  background-color: #ffc107 !important;
  color: #212529;
}

</style>
</head>
<body>
  <div class="container-fluid">
    <div class="row">
      <!-- Sidebar -->
      <div class="col-md-3 col-lg-2 d-md-block sidebar" id="sidebar">
        <div class="sidebar-inner">
            <div class="logo-container d-flex align-items-center mb-4 mt-3">
                <img src="final-light.png" class="pineapple-logo" alt="Piñana Gourmet Logo">
            </div>
          
          <div class="sidebar-divider">
            <span>MAIN MENU</span>
          </div>
          
          <ul class="nav flex-column sidebar-nav">
            <li class="nav-item">
              <a class="nav-link" href="rt_home.php" data-page="home">
                <div class="nav-icon">
                  <i class="bi bi-grid"></i>
                </div>
                <span>Home</span>
              </a>
            </li>
            <li class="nav-item">
              <a class="nav-link active" href="rt_home.php" data-page="home">
                <div class="nav-icon">
                  <i class="bi bi-box"></i>
                </div>
                <span>Inventory</span>
              </a>
            </li>
            <li class="nav-item">
              <a class="nav-link" href="rt_orders.php" data-page="orders">
                <div class="nav-icon">
                  <i class="bi bi-cart"></i>
                </div>
                <span>Orders</span>
              </a>
            </li>
           
          </ul>
          
        </div>
      </div>
      
      <!-- Main content -->
      <div class="col-md-9 ms-sm-auto col-lg-10 px-md-4 main-content">
        <!-- Header -->
        <div class="fixed-top-header">
          <div class="d-flex justify-content-between align-items-center w-100">
            <div class="d-flex align-items-center">
              <button class="navbar-toggler d-md-none collapsed me-2" type="button" id="sidebarToggle">
                <i class="bi bi-list"></i>
              </button>
              <h5 class="mb-0" id="pageTitle">Inventory Management</h5>
            </div>
            <div class="d-flex align-items-center">
            <div class="notification-container me-3 position-relative">
    <div class="notification-icon" id="batch-alerts-icon">
        <i class="bi bi-bell"></i>
        <span class="badge bg-danger position-absolute top-0 start-100 translate-middle badge rounded-pill" id="batch-alerts-count" style="display: none;">0</span>
    </div>
    
    <!-- Batch Alerts Dropdown -->
    <div class="batch-alerts-dropdown" id="batch-alerts-dropdown" style="display: none;">
        <div class="batch-alerts-header">
            <h6 class="mb-0">Batch Expiration Alerts</h6>
        </div>
        <div class="batch-alerts-body" id="batch-alerts-body">
            <div class="text-center py-3">
                <div class="spinner-border spinner-border-sm text-primary" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
                <span class="ms-2">Loading alerts...</span>
            </div>
        </div>
        <div class="batch-alerts-footer">
            <a href="batch_inventory.php" class="btn btn-sm btn-primary w-100">View All Batches</a>
        </div>
    </div>
</div>
              <!-- User Profile Dropdown -->
              <div class="dropdown user-profile-dropdown">
                <div class="profile-circle dropdown-toggle" id="userProfileDropdown" data-bs-toggle="dropdown" aria-expanded="false">
                  <i class="bi bi-person-fill"></i>
                </div>
                <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="userProfileDropdown">
                  <li class="dropdown-item-text">
                    <div class="d-flex flex-column">
                    <span class="fw-bold"><?php echo htmlspecialchars($fullName); ?></span>
                      <small class="text-muted">Retailer</small>
                    </div>
                  </li>
                  <li><hr class="dropdown-divider"></li>
                  <li><a class="dropdown-item" href="rt_profile.php"><i class="bi bi-person me-2"></i>My Profile</a></li>
                  <li><a class="dropdown-item" href="#"><i class="bi bi-gear me-2"></i>Settings</a></li>
                  <li><hr class="dropdown-divider"></li>
                  <li><a class="dropdown-item text-danger" href="#" id="logoutButton"><i class="bi bi-box-arrow-right me-2"></i>Logout</a></li>
                </ul>
              </div>
            </div>
            
          </div>
        </div>

        <div class="main-content-inner">
          <!-- Response Message Alert -->
          <div id="response-message" class="alert" role="alert" style="display: none;"></div>
          
          <!-- Inventory Content -->
          <div class="inventory-section">
            <!-- Inventory Tabs -->
            <ul class="nav nav-tabs mb-4" id="inventoryTabs" role="tablist">
              <li class="nav-item" role="presentation">
                <button class="nav-link active" id="products-tab" data-bs-toggle="tab" data-bs-target="#products" type="button" role="tab" aria-controls="products" aria-selected="true">Products</button>
              </li>
              <li class="nav-item" role="presentation">
                <button class="nav-link" id="consignment-tab" data-bs-toggle="tab" data-bs-target="#consignment" type="button" role="tab" aria-controls="consignment" aria-selected="false">Consignment Inventory</button>
              </li>
              <li class="nav-item" role="presentation">
                <button class="nav-link" id="pricing-tab" data-bs-toggle="tab" data-bs-target="#pricing" type="button" role="tab" aria-controls="pricing" aria-selected="false">Pricing</button>
              </li>
            </ul>
            
            <!-- Tab Content -->
            <div class="tab-content" id="inventoryTabContent">
              <!-- Products Tab -->
              <div class="tab-pane fade show active" id="products" role="tabpanel" aria-labelledby="products-tab">
                <div class="card">
                  <div class="card-body">
                    <div class="d-flex justify-content-between align-items-center mb-4">
                      <h5 class="card-title mb-0">Product Inventory</h5>
                      <div>
                        <div class="input-group">
                          <input type="text" class="form-control form-control-sm" id="product-search" placeholder="Search products...">
                          <button class="btn btn-sm btn-outline-primary" id="refresh-products-btn">
                            <i class="bi bi-arrow-clockwise me-1"></i> Refresh
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    <!-- Update the Products tab alert message -->
                    <div class="alert alert-info">
                      <i class="bi bi-info-circle-fill me-2"></i>
                      This section shows products from completed orders with their details and ordered quantities.
                    </div>
                    
                    <!-- Products Inventory Container -->
                    <div id="products-inventory-container" class="mt-4">
                      <!-- Products will be loaded here -->
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Consignment Inventory Tab -->
              <div class="tab-pane fade" id="consignment" role="tabpanel" aria-labelledby="consignment-tab">
                <div class="card">
                  <div class="card-body">
                    <div class="d-flex justify-content-between align-items-center mb-4">
                      <h5 class="card-title mb-0">Consignment Inventory</h5>
                      <button class="btn btn-sm btn-outline-primary" id="refresh-inventory-btn">
                        <i class="bi bi-arrow-clockwise me-1"></i> Refresh
                      </button>
                    </div>
                    
                    <div class="alert alert-info">
                      <i class="bi bi-info-circle-fill me-2"></i>
                      This section shows your completed orders that are currently in consignment. The consignment period starts from the date the order was marked as completed.
                    </div>
                    
                    <!-- Consignment Inventory Container -->
                    <div id="consignment-inventory-container" class="mt-4">
                      <!-- Consignment inventory cards will be loaded here -->
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Pricing Tab (Replaced Reports Tab) -->
              <div class="tab-pane fade" id="pricing" role="tabpanel" aria-labelledby="pricing-tab">
                <div class="card">
                  <div class="card-body">
                    <div class="d-flex justify-content-between align-items-center mb-4">
                      <h5 class="card-title mb-0">Product Pricing Management</h5>
                      <div>
                        <div class="input-group">
                          <input type="text" class="form-control form-control-sm" id="pricing-search" placeholder="Search orders or products...">
                          <button class="btn btn-sm btn-outline-primary" id="refresh-pricing-btn">
                            <i class="bi bi-arrow-clockwise me-1"></i> Refresh
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    <div class="alert alert-info">
                      <i class="bi bi-info-circle-fill me-2"></i>
                      This section allows you to set retail prices for products you've ordered from suppliers. Set competitive prices to maximize your profit margins.
                    </div>
                    
                    <!-- Pricing Container -->
                    <div id="pricing-container" class="mt-4">
                      <div class="text-center py-5">
                        <div class="spinner-border text-primary" role="status">
                          <span class="visually-hidden">Loading...</span>
                        </div>
                        <div class="mt-3">Loading completed orders...</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Price History Modal -->
  <div class="modal fade" id="priceHistoryModal" tabindex="-1" aria-labelledby="priceHistoryModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="priceHistoryModalLabel">
            <i class="bi bi-clock-history me-2"></i> Price History
          </h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body" id="priceHistoryModalBody">
          <div class="text-center py-4">
            <div class="spinner-border text-primary" role="status">
              <span class="visually-hidden">Loading...</span>
            </div>
            <p class="mt-2">Loading price history...</p>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
        </div>
      </div>
    </div>
  </div>

  <!-- Cash Payment Modal -->
<div class="modal fade" id="cashPaymentModal" tabindex="-1" aria-labelledby="cashPaymentModalLabel" aria-hidden="true" style="z-index: 1056;">
  <div class="modal-dialog modal-dialog-centered">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title" id="cashPaymentModalLabel">
          <i class="bi bi-cash-coin me-2"></i> Cash Payment
        </h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <div class="modal-body">
        <form id="cashPaymentForm">
          <div class="mb-3">
            <label for="cashTotalAmount" class="form-label">Total Amount</label>
            <input type="text" class="form-control" id="cashTotalAmount" readonly>
          </div>
          <div class="mb-3">
            <label for="cashNotes" class="form-label">Notes (Optional)</label>
            <textarea class="form-control" id="cashNotes" rows="3" placeholder="Add any notes..."></textarea>
          </div>
        </form>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
        <button type="button" class="btn btn-success" id="confirmCashPayment">Confirm Payment</button>
      </div>
    </div>
  </div>
</div>

<!-- Mobile Payment Modal -->
<div class="modal fade" id="mobilePaymentModal" tabindex="-1" aria-labelledby="mobilePaymentModalLabel" aria-hidden="true" style="z-index: 1056;">
  <div class="modal-dialog modal-dialog-centered">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title" id="mobilePaymentModalLabel">
          <i class="bi bi-phone me-2"></i> Mobile Payment
        </h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <div class="modal-body">
        <form id="mobilePaymentForm">
          <div class="mb-3">
            <label for="mobileTotalAmount" class="form-label">Total Amount</label>
            <input type="text" class="form-control" id="mobileTotalAmount" readonly>
          </div>
          <div class="mb-3">
            <label for="mobileReferenceNumber" class="form-label">Reference Number</label>
            <input type="text" class="form-control" id="mobileReferenceNumber" placeholder="Enter reference number" required>
          </div>
          <div class="mb-3">
            <label for="mobileNotes" class="form-label">Notes (Optional)</label>
            <textarea class="form-control" id="mobileNotes" rows="3" placeholder="Add any notes..."></textarea>
          </div>
        </form>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
        <button type="button" class="btn btn-success" id="confirmMobilePayment">Confirm Payment</button>
      </div>
    </div>
  </div>
</div>

  <script>
document.addEventListener('DOMContentLoaded', function() {
    // Fetch batch alerts
    function fetchBatchAlerts() {
        fetch('batch_alerts.php')
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    updateBatchAlertsUI(data);
                }
            })
            .catch(error => {
                console.error('Error fetching batch alerts:', error);
            });
    }
    
    // Update batch alerts UI
    function updateBatchAlertsUI(data) {
        const alertsCount = document.getElementById('batch-alerts-count');
        const alertsBody = document.getElementById('batch-alerts-body');
        
        // Update count
        if (data.total_alerts > 0) {
            alertsCount.textContent = data.total_alerts;
            alertsCount.style.display = 'block';
        } else {
            alertsCount.style.display = 'none';
        }
        
        // Update dropdown content
        let alertsHtml = '';
        
        // Expired batches
        if (data.alerts.expired.length > 0) {
            alertsHtml += `<div class="alert alert-danger mb-2 py-2">
                <h6 class="mb-1"><i class="bi bi-exclamation-triangle-fill me-1"></i>Expired Batches</h6>
                <ul class="mb-0 ps-3">`;
            
            data.alerts.expired.forEach(batch => {
                alertsHtml += `<li>${batch.product_name} - Batch ${batch.batch_code} (Expired ${Math.abs(batch.days_until_expiry)} days ago)</li>`;
            });
            
            alertsHtml += `</ul></div>`;
        }
        
        // Critical batches
        if (data.alerts.critical.length > 0) {
            alertsHtml += `<div class="alert alert-warning mb-2 py-2">
                <h6 class="mb-1"><i class="bi bi-exclamation-circle-fill me-1"></i>Critical (0-7 days)</h6>
                <ul class="mb-0 ps-3">`;
            
            data.alerts.critical.forEach(batch => {
                alertsHtml += `<li>${batch.product_name} - Batch ${batch.batch_code} (${batch.days_until_expiry} days left)</li>`;
            });
            
            alertsHtml += `</ul></div>`;
        }
        
        // Warning batches
        if (data.alerts.warning.length > 0) {
            alertsHtml += `<div class="alert alert-info mb-2 py-2">
                <h6 class="mb-1"><i class="bi bi-info-circle-fill me-1"></i>Warning (8-30 days)</h6>
                <ul class="mb-0 ps-3">`;
            
            data.alerts.warning.forEach(batch => {
                alertsHtml += `<li>${batch.product_name} - Batch ${batch.batch_code} (${batch.days_until_expiry} days left)</li>`;
            });
            
            alertsHtml += `</ul></div>`;
        }
        
        // No alerts
        if (data.total_alerts === 0) {
            alertsHtml = `<div class="text-center py-3">
                <i class="bi bi-check-circle-fill text-success fs-4"></i>
                <p class="mb-0 mt-2">No expiring batches found</p>
            </div>`;
        }
        
        alertsBody.innerHTML = alertsHtml;
    }
    
    // Toggle batch alerts dropdown
    const batchAlertsIcon = document.getElementById('batch-alerts-icon');
    const batchAlertsDropdown = document.getElementById('batch-alerts-dropdown');
    
    if (batchAlertsIcon && batchAlertsDropdown) {
        batchAlertsIcon.addEventListener('click', function(e) {
            e.stopPropagation();
            batchAlertsDropdown.style.display = batchAlertsDropdown.style.display === 'none' ? 'block' : 'none';
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', function(e) {
            if (!batchAlertsDropdown.contains(e.target) && e.target !== batchAlertsIcon) {
                batchAlertsDropdown.style.display = 'none';
            }
        });
    }
    
    // Fetch alerts on page load
    fetchBatchAlerts();
    
    // Refresh alerts every 5 minutes
    setInterval(fetchBatchAlerts, 5 * 60 * 1000);
});
</script>

  <!-- Bootstrap JS Bundle with Popper -->
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/js/bootstrap.bundle.min.js"></script>
  <!-- Flatpickr JS -->
  <script src="https://cdn.jsdelivr.net/npm/flatpickr"></script>
  <!-- jQuery (needed for some functionality) -->
  <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
  <!-- Custom JavaScript -->
  <script src="scripts.js"></script>
  <script src="inventory.js"></script>
  <script src="inventory-batch-tracking.js"></script>
  <script src="inventory-pricing.js"></script>
  <script src="payment-functions.js"></script>
  
</body>
</html>
