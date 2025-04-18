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
              <a class="nav-link" href="rt_dashboard.php" data-page="dashboard">
                <div class="nav-icon">
                  <i class="bi bi-grid"></i>
                </div>
                <span>Dashboard</span>
              </a>
            </li>
            <li class="nav-item">
              <a class="nav-link" href="rt_inventory.php" data-page="inventory">
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
            <li class="nav-item">
              <a class="nav-link active" href="rt_delivery.php" data-page="delivery">
                <div class="nav-icon">
                  <i class="bi bi-truck"></i>
                </div>
                <span>Delivery</span>
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
              <h5 class="mb-0" id="pageTitle">Delivery</h5>
            </div>
            <div class="d-flex align-items-center">
              <div class="notification-container me-3">
                <div class="notification-icon">
                  <i class="bi bi-bell"></i>
                  <span class="badge bg-danger position-absolute top-0 start-100 translate-middle badge rounded-pill">3</span>
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
                      <span class="fw-bold">Retailer</span>
                      <small class="text-muted">Pinana Gourmet</small>
                    </div>
                  </li>
                  <li><hr class="dropdown-divider"></li>
                  <li><a class="dropdown-item" href="#"><i class="bi bi-person me-2"></i>My Profile</a></li>
                  <li><a class="dropdown-item" href="#"><i class="bi bi-gear me-2"></i>Settings</a></li>
                  <li><hr class="dropdown-divider"></li>
                  <li><a class="dropdown-item text-danger" href="#" id="logoutButton"><i class="bi bi-box-arrow-right me-2"></i>Logout</a></li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div class="main-content-inner">
          <!-- Delivery Dashboard -->
          <div class="row mb-4">
            <div class="col-12">
              <div class="section-title">
                <i class="bi bi-truck"></i> Delivery Dashboard
              </div>
            </div>
            
            <!-- KPI Cards -->
            <div class="col-md-3 mb-4">
              <div class="card kpi-card h-100">
                <div class="card-body">
                  <div class="d-flex justify-content-between align-items-center mb-3">
                    <div class="d-flex align-items-center">
                      <div class="icon-bg rounded-circle d-flex align-items-center justify-content-center me-2">
                        <i class="bi bi-box-seam text-primary"></i>
                      </div>
                      <h6 class="kpi-title mb-0">Total Deliveries</h6>
                    </div>
                  </div>
                  <h2 class="mb-1" id="totalDeliveriesCount">0</h2>
                  <div class="text-success small">
                    <i class="bi bi-graph-up"></i> <span id="totalDeliveriesGrowth">+15%</span> from last month
                  </div>
                </div>
              </div>
            </div>
            
            <div class="col-md-3 mb-4">
              <div class="card kpi-card h-100">
                <div class="card-body">
                  <div class="d-flex justify-content-between align-items-center mb-3">
                    <div class="d-flex align-items-center">
                      <div class="icon-bg rounded-circle d-flex align-items-center justify-content-center me-2">
                        <i class="bi bi-hourglass-split text-warning"></i>
                      </div>
                      <h6 class="kpi-title mb-0">In Transit</h6>
                    </div>
                  </div>
                  <h2 class="mb-1" id="inTransitCount">0</h2>
                  <div class="text-muted small">
                    <i class="bi bi-truck"></i> <span id="inTransitPercentage">0%</span> of total deliveries
                  </div>
                </div>
              </div>
            </div>
            
            <div class="col-md-3 mb-4">
              <div class="card kpi-card h-100">
                <div class="card-body">
                  <div class="d-flex justify-content-between align-items-center mb-3">
                    <div class="d-flex align-items-center">
                      <div class="icon-bg rounded-circle d-flex align-items-center justify-content-center me-2">
                        <i class="bi bi-check-circle text-success"></i>
                      </div>
                      <h6 class="kpi-title mb-0">Completed</h6>
                    </div>
                  </div>
                  <h2 class="mb-1" id="completedCount">0</h2>
                  <div class="text-success small">
                    <i class="bi bi-arrow-up"></i> <span id="completedPercentage">0%</span> of total deliveries
                  </div>
                </div>
              </div>
            </div>
            
            <div class="col-md-3 mb-4">
              <div class="card kpi-card h-100">
                <div class="card-body">
                  <div class="d-flex justify-content-between align-items-center mb-3">
                    <div class="d-flex align-items-center">
                      <div class="icon-bg rounded-circle d-flex align-items-center justify-content-center me-2">
                        <i class="bi bi-exclamation-triangle text-danger"></i>
                      </div>
                      <h6 class="kpi-title mb-0">Issues</h6>
                    </div>
                  </div>
                  <h2 class="mb-1" id="issuesCount">0</h2>
                  <div class="text-danger small">
                    <i class="bi bi-arrow-down"></i> <span id="issuesPercentage">0%</span> of total deliveries
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Delivery Tracking -->
          <div class="row mb-4">
            <div class="col-12">
              <div class="card">
                <div class="card-header bg-white">
                  <div class="d-flex justify-content-between align-items-center">
                    <h5 class="mb-0"><i class="bi bi-geo-alt me-2"></i>Delivery Tracking</h5>
                    <div>
                      <button class="btn btn-sm btn-outline-primary refresh-btn">
                        <i class="bi bi-arrow-clockwise"></i> Refresh
                      </button>
                    </div>
                  </div>
                </div>
                <div class="card-body">
                  <!-- Filters -->
                  <div class="row mb-4">
                    <div class="col-md-8">
                      <div class="d-flex flex-wrap gap-2">
                        <!-- Status Filter -->
                        <div class="dropdown">
                          <button class="btn btn-outline-secondary dropdown-toggle" type="button" id="statusFilter" data-bs-toggle="dropdown" aria-expanded="false">
                            <i class="bi bi-funnel me-1"></i> Status: All
                          </button>
                          <ul class="dropdown-menu" aria-labelledby="statusFilter">
                            <li><a class="dropdown-item status-filter active" href="#" data-status="all">All</a></li>
                            <li><a class="dropdown-item status-filter" href="#" data-status="scheduled">Scheduled</a></li>
                            <li><a class="dropdown-item status-filter" href="#" data-status="in_transit">In Transit</a></li>
                            <li><a class="dropdown-item status-filter" href="#" data-status="delivered">Delivered</a></li>
                            <li><a class="dropdown-item status-filter" href="#" data-status="delayed">Delayed</a></li>
                            <li><a class="dropdown-item status-filter" href="#" data-status="issue">Issue</a></li>
                          </ul>
                        </div>
                        
                        <!-- Supplier Filter -->
                        <div class="dropdown">
                          <button class="btn btn-outline-secondary dropdown-toggle" type="button" id="supplierFilter" data-bs-toggle="dropdown" aria-expanded="false">
                            <i class="bi bi-building me-1"></i> Supplier: All
                          </button>
                          <ul class="dropdown-menu" aria-labelledby="supplierFilter">
                            <li><a class="dropdown-item supplier-filter active" href="#" data-supplier="all">All</a></li>
                            <li><a class="dropdown-item supplier-filter" href="#" data-supplier="pinana-main">Piñana Gourmet Main</a></li>
                            <li><a class="dropdown-item supplier-filter" href="#" data-supplier="pinana-south">Piñana Gourmet South</a></li>
                            <li><a class="dropdown-item supplier-filter" href="#" data-supplier="tropical-fruits">Tropical Fruits Inc.</a></li>
                            <li><a class="dropdown-item supplier-filter" href="#" data-supplier="packaging-pro">Packaging Pro</a></li>
                          </ul>
                        </div>
                        
                        <!-- Date Filter -->
                        <div class="dropdown">
                          <button class="btn btn-outline-secondary dropdown-toggle" type="button" id="dateFilter" data-bs-toggle="dropdown" aria-expanded="false">
                            <i class="bi bi-calendar3 me-1"></i> Date: All Time
                          </button>
                          <ul class="dropdown-menu" aria-labelledby="dateFilter">
                            <li><a class="dropdown-item date-filter active" href="#" data-range="all">All Time</a></li>
                            <li><a class="dropdown-item date-filter" href="#" data-range="today">Today</a></li>
                            <li><a class="dropdown-item date-filter" href="#" data-range="week">Last 7 Days</a></li>
                            <li><a class="dropdown-item date-filter" href="#" data-range="month">Last 30 Days</a></li>
                            <li><a class="dropdown-item date-filter" href="#" data-range="custom">Custom Range</a></li>
                          </ul>
                        </div>
                        
                        <!-- Date Range Picker (hidden by default) -->
                        <div class="date-range-picker d-none">
                          <div class="input-group">
                            <input type="text" class="form-control form-control-sm" id="dateRangeStart" placeholder="Start Date">
                            <span class="input-group-text">to</span>
                            <input type="text" class="form-control form-control-sm" id="dateRangeEnd" placeholder="End Date">
                            <button class="btn btn-sm btn-primary" id="applyDateRange">Apply</button>
                          </div>
                        </div>
                        
                        <!-- Reset Filters -->
                        <button class="btn btn-sm btn-outline-secondary" id="resetFiltersBtn">
                          <i class="bi bi-x-circle me-1"></i> Reset
                        </button>
                      </div>
                      
                      <!-- Active Filters -->
                      <div id="activeFilters" class="mt-2 d-none">
                        <small class="text-muted me-2">Active filters:</small>
                        <div class="active-filter-tags d-inline-flex flex-wrap gap-1">
                          <!-- Active filter tags will be added here dynamically -->
                        </div>
                        <button class="btn btn-link btn-sm p-0 ms-2" id="clearAllFilters">Clear all</button>
                      </div>
                    </div>
                    
                    <div class="col-md-4">
                      <div class="input-group">
                        <input type="text" class="form-control" placeholder="Search deliveries..." id="deliverySearch">
                        <button class="btn btn-primary" type="button" id="searchBtn">
                          <i class="bi bi-search"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <!-- Deliveries Table -->
                  <div class="table-responsive">
                    <table class="table table-hover table-modern">
                      <thead>
                        <tr>
                          <th>Tracking #</th>
                          <th>PO Number</th>
                          <th>Supplier</th>
                          <th>Scheduled Date</th>
                          <th>Status</th>
                          <th>Last Update</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody id="deliveries-table-body">
                        <!-- Deliveries will be loaded here -->
                      </tbody>
                    </table>
                  </div>
                  
                  <!-- Loading State -->
                  <div id="loadingState" class="text-center py-5">
                    <div class="spinner-border text-primary" role="status">
                      <span class="visually-hidden">Loading...</span>
                    </div>
                    <p class="mt-2">Loading deliveries...</p>
                  </div>
                  
                  <!-- Empty State -->
                  <div id="emptyState" class="text-center py-5 d-none">
                    <i class="bi bi-truck fs-1 text-muted mb-3"></i>
                    <h5>No deliveries found</h5>
                    <p class="text-muted">Try adjusting your filters or search criteria</p>
                  </div>
                  
                  <!-- Pagination and Count -->
                  <div class="d-flex justify-content-between align-items-center mt-4">
                    <div class="small text-muted" id="deliveryCount">Showing 0 of 0 deliveries</div>
                    <nav aria-label="Page navigation">
                      <ul class="pagination pagination-sm" id="deliveriesPagination">
                        <!-- Pagination will be added here dynamically -->
                      </ul>
                    </nav>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Upcoming Deliveries -->
          <div class="row mb-4">
            <div class="col-12">
              <div class="section-title">
                <i class="bi bi-calendar-check"></i> Upcoming Deliveries
              </div>
            </div>
            
            <div class="col-12">
              <div class="card">
                <div class="card-body p-0">
                  <div class="table-responsive">
                    <table class="table table-hover mb-0">
                      <thead>
                        <tr>
                          <th>Tracking #</th>
                          <th>Supplier</th>
                          <th>Expected Date</th>
                          <th>Items</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody id="upcoming-deliveries">
                        <!-- Upcoming deliveries will be loaded here -->
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Recent Updates -->
          <div class="row">
            <div class="col-12">
              <div class="section-title">
                <i class="bi bi-clock-history"></i> Recent Updates
              </div>
            </div>
            
            <div class="col-12">
              <div class="card">
                <div class="card-body p-0">
                  <div class="list-group list-group-flush" id="recent-updates">
                    <!-- Recent updates will be loaded here -->
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- View Delivery Modal -->
  <div class="modal fade" id="viewDeliveryModal" tabindex="-1" aria-labelledby="viewDeliveryModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="viewDeliveryModalLabel"><i class="bi bi-truck me-2"></i>Delivery Details</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <div class="row mb-4">
            <div class="col-md-6">
              <h6 class="fw-bold">Delivery Information</h6>
              <div class="mb-2">
                <small class="text-muted">Tracking Number:</small>
                <div id="viewTrackingNumber" class="fw-medium"></div>
              </div>
              <div class="mb-2">
                <small class="text-muted">PO Number:</small>
                <div id="viewPONumber" class="fw-medium"></div>
              </div>
              <div class="mb-2">
                <small class="text-muted">Status:</small>
                <div id="viewDeliveryStatus"></div>
              </div>
              <div class="mb-2">
                <small class="text-muted">Scheduled Date:</small>
                <div id="viewScheduledDate" class="fw-medium"></div>
              </div>
              <div class="mb-2">
                <small class="text-muted">Estimated Arrival:</small>
                <div id="viewEstimatedArrival" class="fw-medium"></div>
              </div>
            </div>
            <div class="col-md-6">
              <h6 class="fw-bold">Supplier Information</h6>
              <div class="mb-2">
                <small class="text-muted">Supplier:</small>
                <div id="viewSupplierName" class="fw-medium"></div>
              </div>
              <div class="mb-2">
                <small class="text-muted">Contact Person:</small>
                <div id="viewSupplierContact" class="fw-medium"></div>
              </div>
              <div class="mb-2">
                <small class="text-muted">Email:</small>
                <div id="viewSupplierEmail" class="fw-medium"></div>
              </div>
              <div class="mb-2">
                <small class="text-muted">Phone:</small>
                <div id="viewSupplierPhone" class="fw-medium"></div>
              </div>
            </div>
          </div>
          
          <div class="row mb-4">
            <div class="col-12">
              <h6 class="fw-bold">Delivery Items</h6>
              <div class="table-responsive">
                <table class="table table-sm">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Quantity</th>
                      <th>Unit Price</th>
                      <th class="text-end">Total</th>
                    </tr>
                  </thead>
                  <tbody id="viewDeliveryItems">
                    <!-- Delivery items will be loaded here -->
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          
          <div class="row mb-4">
            <div class="col-12">
              <h6 class="fw-bold">Delivery Timeline</h6>
              <div class="delivery-timeline mt-4" id="deliveryTimeline">
                <!-- Timeline will be loaded here -->
              </div>
            </div>
          </div>
          
          <div class="row">
            <div class="col-12">
              <h6 class="fw-bold">Notes</h6>
              <div class="card">
                <div class="card-body bg-light" id="viewDeliveryNotes">
                  No notes available.
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
          <button type="button" class="btn btn-success" id="receiveDeliveryBtn">Mark as Received</button>
          <button type="button" class="btn btn-warning" id="reportIssueBtn">Report Issue</button>
        </div>
      </div>
    </div>
  </div>

  <!-- Receive Delivery Modal -->
  <div class="modal fade" id="receiveDeliveryModal" tabindex="-1" aria-labelledby="receiveDeliveryModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="receiveDeliveryModalLabel"><i class="bi bi-box-seam me-2"></i>Receive Delivery</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <div class="alert alert-info">
            <i class="bi bi-info-circle me-2"></i> Please verify all items before confirming receipt.
          </div>
          
          <div class="mb-3">
            <div class="row">
              <div class="col-md-6">
                <p class="mb-1"><strong>Tracking Number:</strong> <span id="receiveTrackingNumber"></span></p>
                <p class="mb-1"><strong>PO Number:</strong> <span id="receivePONumber"></span></p>
              </div>
              <div class="col-md-6">
                <p class="mb-1"><strong>Supplier:</strong> <span id="receiveSupplierName"></span></p>
                <p class="mb-1"><strong>Scheduled Date:</strong> <span id="receiveScheduledDate"></span></p>
              </div>
            </div>
          </div>
          
          <div class="mb-3">
            <label for="receiveDate" class="form-label">Receive Date</label>
            <input type="text" class="form-control" id="receiveDate" readonly>
          </div>
          
          <div class="table-responsive mb-3">
            <table class="table table-bordered">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Expected Qty</th>
                  <th>Received Qty</th>
                  <th>Condition</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody id="receiveDeliveryItems">
                <!-- Items will be loaded here -->
              </tbody>
            </table>
          </div>
          
          <div class="mb-3">
            <label for="receiveNotes" class="form-label">Receipt Notes</label>
            <textarea class="form-control" id="receiveNotes" rows="3" placeholder="Add any notes about this delivery receipt..."></textarea>
          </div>
          
          <div class="form-check mb-3">
            <input class="form-check-input" type="checkbox" id="confirmReceiptCheck">
            <label class="form-check-label" for="confirmReceiptCheck">
              I confirm that I have verified all items in this delivery
            </label>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
          <button type="button" class="btn btn-success" id="confirmReceiveBtn" disabled>Confirm Receipt</button>
        </div>
      </div>
    </div>
  </div>

  <!-- Report Issue Modal -->
  <div class="modal fade" id="reportIssueModal" tabindex="-1" aria-labelledby="reportIssueModalLabel" aria-hidden="true">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="reportIssueModalLabel"><i class="bi bi-exclamation-triangle me-2"></i>Report Delivery Issue</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <div class="mb-3">
            <p><strong>Tracking Number:</strong> <span id="issueTrackingNumber"></span></p>
            <p><strong>Supplier:</strong> <span id="issueSupplierName"></span></p>
          </div>
          
          <div class="mb-3">
            <label for="issueType" class="form-label">Issue Type</label>
            <select class="form-select" id="issueType" required>
              <option value="">Select issue type</option>
              <option value="damaged">Damaged Items</option>
              <option value="missing">Missing Items</option>
              <option value="wrong">Wrong Items</option>
              <option value="late">Late Delivery</option>
              <option value="other">Other</option>
            </select>
          </div>
          
          <div class="mb-3">
            <label for="issueSeverity" class="form-label">Severity</label>
            <select class="form-select" id="issueSeverity" required>
              <option value="low">Low - Minor issue</option>
              <option value="medium">Medium - Significant issue</option>
              <option value="high">High - Critical issue</option>
            </select>
          </div>
          
          <div class="mb-3">
            <label for="issueDescription" class="form-label">Description</label>
            <textarea class="form-control" id="issueDescription" rows="4" placeholder="Describe the issue in detail..." required></textarea>
          </div>
          
          <div class="mb-3">
            <label for="issueAction" class="form-label">Requested Action</label>
            <select class="form-select" id="issueAction" required>
              <option value="">Select requested action</option>
              <option value="replace">Replace items</option>
              <option value="refund">Refund</option>
              <option value="partial">Partial refund</option>
              <option value="information">Information only</option>
            </select>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
          <button type="button" class="btn btn-primary" id="submitIssueBtn">Submit Issue</button>
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
  <!-- Custom JavaScript -->
  <script src="scripts.js"></script>
  <script src="delivery.js"></script>
</body>
</html>
