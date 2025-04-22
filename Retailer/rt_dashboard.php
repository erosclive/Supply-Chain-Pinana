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
              <a class="nav-link active" href="rt_dashboard.php" data-page="dashboard">
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
              <a class="nav-link" href="rt_delivery.php" data-page="delivery">
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
              <h5 class="mb-0" id="pageTitle">Dashboard</h5>
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
          <!-- Dashboard Content -->
          <div id="dashboardContent" class="content-section active">
            <!-- Stats Cards Row -->
            <div class="row mb-4">
              <div class="col-md-3 col-sm-6 mb-3">
                <div class="kpi-card card h-100">
                  <div class="card-body">
                    <div class="d-flex justify-content-between align-items-center mb-2">
                      <h6 class="card-subtitle text-muted">Total Products</h6>
                      <div class="icon-bg rounded-circle d-flex align-items-center justify-content-center">
                        <i class="bi bi-box-seam text-success"></i>
                      </div>
                    </div>
                    <h3 class="card-title mb-1">42</h3>
                    <p class="card-text small mb-0">
                      <span class="text-success"><i class="bi bi-arrow-up"></i> 5</span> since last month
                    </p>
                  </div>
                </div>
              </div>
              <div class="col-md-3 col-sm-6 mb-3">
                <div class="kpi-card card h-100">
                  <div class="card-body">
                    <div class="d-flex justify-content-between align-items-center mb-2">
                      <h6 class="card-subtitle text-muted">Pending Orders</h6>
                      <div class="icon-bg rounded-circle d-flex align-items-center justify-content-center">
                        <i class="bi bi-cart text-primary"></i>
                      </div>
                    </div>
                    <h3 class="card-title mb-1">3</h3>
                    <p class="card-text small mb-0">
                      <span class="text-danger"><i class="bi bi-arrow-up"></i> 1</span> since yesterday
                    </p>
                  </div>
                </div>
              </div>
              <div class="col-md-3 col-sm-6 mb-3">
                <div class="kpi-card card h-100">
                  <div class="card-body">
                    <div class="d-flex justify-content-between align-items-center mb-2">
                      <h6 class="card-subtitle text-muted">Low Stock Items</h6>
                      <div class="icon-bg rounded-circle d-flex align-items-center justify-content-center">
                        <i class="bi bi-exclamation-triangle text-warning"></i>
                      </div>
                    </div>
                    <h3 class="card-title mb-1">8</h3>
                    <p class="card-text small mb-0">
                      <span class="text-danger"><i class="bi bi-arrow-up"></i> 3</span> since last week
                    </p>
                  </div>
                </div>
              </div>
              <div class="col-md-3 col-sm-6 mb-3">
                <div class="kpi-card card h-100">
                  <div class="card-body">
                    <div class="d-flex justify-content-between align-items-center mb-2">
                      <h6 class="card-subtitle text-muted">Expiring Soon</h6>
                      <div class="icon-bg rounded-circle d-flex align-items-center justify-content-center">
                        <i class="bi bi-calendar-x text-danger"></i>
                      </div>
                    </div>
                    <h3 class="card-title mb-1">12</h3>
                    <p class="card-text small mb-0">
                      <span class="text-danger"><i class="bi bi-arrow-up"></i> 5</span> in next 30 days
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Quick Actions Row -->
            <div class="row mb-4">
              <div class="col-12">
                <div class="card">
                  <div class="card-header">
                    <h5 class="card-title mb-0">Quick Actions</h5>
                  </div>
                  <div class="card-body">
                    <div class="row">
                      <div class="col-md-3 col-sm-6 mb-3 mb-md-0">
                        <button class="btn btn-primary w-100 py-3" id="newOrderBtn">
                          <i class="bi bi-cart-plus me-2"></i>Place New Order
                        </button>
                      </div>
                      <div class="col-md-3 col-sm-6 mb-3 mb-md-0">
                        <button class="btn btn-outline-primary w-100 py-3" id="checkExpiringBtn">
                          <i class="bi bi-calendar-check me-2"></i>Check Expiring Items
                        </button>
                      </div>
                      <div class="col-md-3 col-sm-6 mb-3 mb-sm-0">
                        <button class="btn btn-outline-primary w-100 py-3" id="updateInventoryBtn">
                          <i class="bi bi-arrow-repeat me-2"></i>Update Inventory
                        </button>
                      </div>
                      <div class="col-md-3 col-sm-6">
                        <button class="btn btn-outline-primary w-100 py-3" id="generateReportBtn">
                          <i class="bi bi-file-earmark-text me-2"></i>Generate Report
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Expiring Products & Recent Orders Row -->
            <div class="row mb-4">
              <div class="col-lg-6 mb-3">
                <div class="card h-100">
                  <div class="card-header d-flex justify-content-between align-items-center">
                    <h5 class="card-title mb-0">Expiring Products</h5>
                    <a href="#" class="btn btn-sm btn-outline-primary" data-page="expiring">View All</a>
                  </div>
                  <div class="card-body p-0">
                    <div class="table-responsive">
                      <table class="table table-hover table-modern mb-0">
                        <thead>
                          <tr>
                            <th>Product</th>
                            <th>Batch</th>
                            <th>Quantity</th>
                            <th>Expiry Date</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td>
                              <div class="d-flex align-items-center">
                                <img src="https://via.placeholder.com/40" alt="Product" class="me-2">
                                <span class="product-name">Pineapple Jam</span>
                              </div>
                            </td>
                            <td>BATCH-001</td>
                            <td>15 units</td>
                            <td>May 15, 2023</td>
                            <td><span class="status-badge status-out-stock">Expired</span></td>
                          </tr>
                          <tr>
                            <td>
                              <div class="d-flex align-items-center">
                                <img src="https://via.placeholder.com/40" alt="Product" class="me-2">
                                <span class="product-name">Pineapple Juice</span>
                              </div>
                            </td>
                            <td>BATCH-005</td>
                            <td>28 units</td>
                            <td>May 30, 2023</td>
                            <td><span class="status-badge status-low-stock">Expiring Soon</span></td>
                          </tr>
                          <tr>
                            <td>
                              <div class="d-flex align-items-center">
                                <img src="https://via.placeholder.com/40" alt="Product" class="me-2">
                                <span class="product-name">Dried Pineapple</span>
                              </div>
                            </td>
                            <td>BATCH-008</td>
                            <td>42 units</td>
                            <td>Jun 10, 2023</td>
                            <td><span class="status-badge status-low-stock">Expiring Soon</span></td>
                          </tr>
                          <tr>
                            <td>
                              <div class="d-flex align-items-center">
                                <img src="https://via.placeholder.com/40" alt="Product" class="me-2">
                                <span class="product-name">Pineapple Candy</span>
                              </div>
                            </td>
                            <td>BATCH-012</td>
                            <td>35 units</td>
                            <td>Jun 25, 2023</td>
                            <td><span class="status-badge status-low-stock">Expiring Soon</span></td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
              <div class="col-lg-6 mb-3">
                <div class="card h-100">
                  <div class="card-header d-flex justify-content-between align-items-center">
                    <h5 class="card-title mb-0">Recent Orders</h5>
                    <a href="#" class="btn btn-sm btn-outline-primary" data-page="orders">View All</a>
                  </div>
                  <div class="card-body p-0">
                    <div class="table-responsive">
                      <table class="table table-hover table-modern mb-0">
                        <thead>
                          <tr>
                            <th>Order ID</th>
                            <th>Date</th>
                            <th>Items</th>
                            <th>Status</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td class="order-id">#ORD-0025</td>
                            <td>Apr 22, 2023</td>
                            <td>5 products</td>
                            <td><span class="status-badge status-in-stock">Delivered</span></td>
                            <td>
                              <div class="action-buttons">
                                <button class="action-btn action-btn-view" data-bs-toggle="tooltip" title="View Order">
                                  <i class="bi bi-eye"></i>
                                </button>
                              </div>
                            </td>
                          </tr>
                          <tr>
                            <td class="order-id">#ORD-0024</td>
                            <td>Apr 21, 2023</td>
                            <td>3 products</td>
                            <td><span class="status-badge status-low-stock">Processing</span></td>
                            <td>
                              <div class="action-buttons">
                                <button class="action-btn action-btn-view" data-bs-toggle="tooltip" title="View Order">
                                  <i class="bi bi-eye"></i>
                                </button>
                              </div>
                            </td>
                          </tr>
                          <tr>
                            <td class="order-id">#ORD-0023</td>
                            <td>Apr 20, 2023</td>
                            <td>7 products</td>
                            <td><span class="status-badge status-in-stock">Delivered</span></td>
                            <td>
                              <div class="action-buttons">
                                <button class="action-btn action-btn-view" data-bs-toggle="tooltip" title="View Order">
                                  <i class="bi bi-eye"></i>
                                </button>
                              </div>
                            </td>
                          </tr>
                          <tr>
                            <td class="order-id">#ORD-0022</td>
                            <td>Apr 19, 2023</td>
                            <td>2 products</td>
                            <td><span class="status-badge status-out-stock">Cancelled</span></td>
                            <td>
                              <div class="action-buttons">
                                <button class="action-btn action-btn-view" data-bs-toggle="tooltip" title="View Order">
                                  <i class="bi bi-eye"></i>
                                </button>
                              </div>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Low Stock Items Row -->
            <div class="row">
              <div class="col-12">
                <div class="card">
                  <div class="card-header d-flex justify-content-between align-items-center">
                    <h5 class="card-title mb-0">Low Stock Items</h5>
                    <a href="#" class="btn btn-sm btn-outline-primary" data-page="inventory">View All</a>
                  </div>
                  <div class="card-body p-0">
                    <div class="table-responsive">
                      <table class="table table-hover table-modern mb-0">
                        <thead>
                          <tr>
                            <th>Product</th>
                            <th>SKU</th>
                            <th>Category</th>
                            <th>Current Stock</th>
                            <th>Reorder Level</th>
                            <th>Status</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td>
                              <div class="d-flex align-items-center">
                                <img src="https://via.placeholder.com/40" alt="Product" class="me-2">
                                <span class="product-name">Pineapple Juice</span>
                              </div>
                            </td>
                            <td class="product-id">SKU-002</td>
                            <td>Beverages</td>
                            <td>
                              <div class="progress">
                                <div class="progress-bar bg-warning" role="progressbar" style="width: 25%"></div>
                              </div>
                              <span class="small">25 units</span>
                            </td>
                            <td>50 units</td>
                            <td><span class="status-badge status-low-stock">Low Stock</span></td>
                            <td>
                              <div class="action-buttons">
                                <button class="action-btn action-btn-edit" data-bs-toggle="tooltip" title="Order More">
                                  <i class="bi bi-cart-plus"></i>
                                </button>
                                <button class="action-btn action-btn-view" data-bs-toggle="tooltip" title="View">
                                  <i class="bi bi-eye"></i>
                                </button>
                              </div>
                            </td>
                          </tr>
                          <tr>
                            <td>
                              <div class="d-flex align-items-center">
                                <img src="https://via.placeholder.com/40" alt="Product" class="me-2">
                                <span class="product-name">Pineapple Cake</span>
                              </div>
                            </td>
                            <td class="product-id">SKU-004</td>
                            <td>Bakery</td>
                            <td>
                              <div class="progress">
                                <div class="progress-bar bg-danger" role="progressbar" style="width: 10%"></div>
                              </div>
                              <span class="small">10 units</span>
                            </td>
                            <td>40 units</td>
                            <td><span class="status-badge status-out-stock">Critical</span></td>
                            <td>
                              <div class="action-buttons">
                                <button class="action-btn action-btn-edit" data-bs-toggle="tooltip" title="Order More">
                                  <i class="bi bi-cart-plus"></i>
                                </button>
                                <button class="action-btn action-btn-view" data-bs-toggle="tooltip" title="View">
                                  <i class="bi bi-eye"></i>
                                </button>
                              </div>
                            </td>
                          </tr>
                          <tr>
                            <td>
                              <div class="d-flex align-items-center">
                                <img src="https://via.placeholder.com/40" alt="Product" class="me-2">
                                <span class="product-name">Pineapple Syrup</span>
                              </div>
                            </td>
                            <td class="product-id">SKU-007</td>
                            <td>Syrups</td>
                            <td>
                              <div class="progress">
                                <div class="progress-bar bg-warning" role="progressbar" style="width: 30%"></div>
                              </div>
                              <span class="small">30 units</span>
                            </td>
                            <td>60 units</td>
                            <td><span class="status-badge status-low-stock">Low Stock</span></td>
                            <td>
                              <div class="action-buttons">
                                <button class="action-btn action-btn-edit" data-bs-toggle="tooltip" title="Order More">
                                  <i class="bi bi-cart-plus"></i>
                                </button>
                                <button class="action-btn action-btn-view" data-bs-toggle="tooltip" title="View">
                                  <i class="bi bi-eye"></i>
                                </button>
                              </div>
                            </td>
                          </tr>
                          <tr>
                            <td>
                              <div class="d-flex align-items-center">
                                <img src="https://via.placeholder.com/40" alt="Product" class="me-2">
                                <span class="product-name">Pineapple Vinegar</span>
                              </div>
                            </td>
                            <td class="product-id">SKU-009</td>
                            <td>Condiments</td>
                            <td>
                              <div class="progress">
                                <div class="progress-bar bg-warning" role="progressbar" style="width: 20%"></div>
                              </div>
                              <span class="small">20 units</span>
                            </td>
                            <td>45 units</td>
                            <td><span class="status-badge status-low-stock">Low Stock</span></td>
                            <td>
                              <div class="action-buttons">
                                <button class="action-btn action-btn-edit" data-bs-toggle="tooltip" title="Order More">
                                  <i class="bi bi-cart-plus"></i>
                                </button>
                                <button class="action-btn action-btn-view" data-bs-toggle="tooltip" title="View">
                                  <i class="bi bi-eye"></i>
                                </button>
                              </div>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Other content sections remain the same -->
        </div>
      </div>
    </div>
  </div>

  <!-- Modals remain the same -->

  <!-- Bootstrap JS Bundle with Popper -->
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/js/bootstrap.bundle.min.js"></script>
  <!-- Flatpickr JS -->
  <script src="https://cdn.jsdelivr.net/npm/flatpickr"></script>
  <!-- jQuery (needed for some functionality) -->
  <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
  <!-- Custom JavaScript -->
  <script src="scripts.js"></script>
  <script src="dashboard.js"></script>
</body>
</html>
