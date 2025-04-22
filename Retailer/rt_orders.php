<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Piñana Gourmet - Order Management</title>
  <!-- Bootstrap CSS -->
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/css/bootstrap.min.css" rel="stylesheet">
  <!-- Bootstrap Icons -->
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.0/font/bootstrap-icons.css">
  <!-- Flatpickr for date picking -->
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/flatpickr/dist/flatpickr.min.css">
  <!-- Custom CSS -->
  <link rel="stylesheet" href="styles.css">
  <!-- Pineapple Theme CSS -->
  <style>
    /* Pineapple Theme Colors */
    :root {
      --pineapple-yellow: #f5cc39;
      --pineapple-yellow-light: #ffeea3;
      --pineapple-yellow-dark: #e3b728;
      --pineapple-green: #59df99;
      --pineapple-green-light: #a1f3c5;
      --pineapple-green-dark: #19ac54;
      --pineapple-brown: #8b572a;
      --text-dark: #333333;
      --text-light: #6c757d;
      --background-light: #f9f9f9;
    }

    /* Enhanced Modal Styles */
    .modal-content {
      border: none;
      border-radius: 12px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
    }

    .modal-header {
      background-color: var(--pineapple-yellow-light);
      border-bottom: 1px solid rgba(0, 0, 0, 0.05);
      padding: 1.25rem 1.5rem;
    }

    .modal-header .modal-title {
      color: var(--text-dark);
      font-weight: 600;
      display: flex;
      align-items: center;
    }

    .modal-header .modal-title i {
      color: var(--pineapple-yellow-dark);
      margin-right: 10px;
    }

    .modal-body {
      padding: 1.5rem;
    }

    .modal-footer {
      border-top: 1px solid rgba(0, 0, 0, 0.05);
      padding: 1.25rem 1.5rem;
    }

    /* Enhanced Form Controls */
    .form-control, .form-select {
      border-radius: 8px;
      border: 1px solid #e0e0e0;
      padding: 0.6rem 1rem;
      transition: all 0.3s ease;
    }

    .form-control:focus, .form-select:focus {
      border-color: var(--pineapple-yellow);
      box-shadow: 0 0 0 0.25rem rgba(245, 204, 57, 0.25);
    }

    /* Enhanced Buttons */
    .btn-primary {
      background-color: var(--pineapple-green);
      border-color: var(--pineapple-green);
      color: white;
    }

    .btn-primary:hover {
      background-color: var(--pineapple-green-dark);
      border-color: var(--pineapple-green-dark);
    }

    .btn-secondary {
      background-color: #f0f0f0;
      border-color: #e0e0e0;
      color: var(--text-dark);
    }

    .btn-secondary:hover {
      background-color: #e0e0e0;
      border-color: #d0d0d0;
    }

    .btn-pineapple {
      background-color: var(--pineapple-yellow);
      border-color: var(--pineapple-yellow);
      color: var(--text-dark);
    }

    .btn-pineapple:hover {
      background-color: var(--pineapple-yellow-dark);
      border-color: var(--pineapple-yellow-dark);
    }

    /* Enhanced Order Items Table */
    .order-items-table {
      border-radius: 8px;
      overflow: hidden;
      border: 1px solid rgba(0, 0, 0, 0.05);
    }

    .order-items-table thead th {
      background-color: rgba(245, 204, 57, 0.15);
      font-weight: 600;
      font-size: 0.85rem;
      padding: 0.75rem;
      color: var(--text-dark);
    }

    .order-items-table tbody td {
      padding: 0.75rem;
      vertical-align: middle;
    }

    .order-items-table tfoot td {
      background-color: #f8f9fa;
      font-weight: 500;
    }

    /* Status Badges */
    .status-badge {
      padding: 0.35em 0.65em;
      font-size: 0.75em;
      font-weight: 500;
      border-radius: 30px;
      display: inline-block;
      min-width: 90px;
      text-align: center;
    }

    .status-order {
      background-color: rgba(245, 204, 57, 0.15);
      color: var(--pineapple-yellow-dark);
    }

    .status-processing {
      background-color: rgba(13, 202, 240, 0.1);
      color: #0dcaf0;
    }

    .status-shipped {
      background-color: rgba(13, 110, 253, 0.1);
      color: #0d6efd;
    }

    .status-delivered {
      background-color: rgba(25, 135, 84, 0.1);
      color: #198754;
    }

    .status-cancelled {
      background-color: rgba(220, 53, 69, 0.1);
      color: #dc3545;
    }

    /* Stats Cards */
    .stats-card {
      background-color: #fff;
      border-radius: 10px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
      transition: all 0.3s ease;
      height: 100%;
      border-left: 4px solid var(--pineapple-yellow);
    }

    .stats-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
    }

    /* Product Selection Area */
    .product-selection-area {
      background-color: #f9f9f9;
      border-radius: 8px;
      padding: 15px;
      margin-bottom: 15px;
    }

    .product-list {
      max-height: 300px;
      overflow-y: auto;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      background-color: white;
    }

    .product-item {
      padding: 10px 15px;
      border-bottom: 1px solid #e0e0e0;
      cursor: pointer;
      transition: background-color 0.2s ease;
      display: flex;
      align-items: center;
    }

    .product-item:hover {
      background-color: rgba(245, 204, 57, 0.1);
    }

    .product-item.selected {
      background-color: rgba(89, 223, 153, 0.1);
      border-left: 3px solid var(--pineapple-green);
    }

    .product-item-details {
      flex: 1;
    }

    .product-item-name {
      font-weight: 600;
      margin-bottom: 2px;
    }

    .product-item-price {
      color: var(--pineapple-yellow-dark);
      font-weight: 500;
    }

    .product-item-stock {
      font-size: 0.8rem;
      color: var(--text-light);
    }

    .product-quantity-input {
      width: 80px;
    }

    /* Animation for adding items */
    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .order-item-row {
      animation: fadeInUp 0.3s ease-out;
    }

    /* Create Order Button */
    #create-order-btn {
      background-color: var(--pineapple-yellow);
      border-color: var(--pineapple-yellow);
      color: var(--text-dark);
      font-weight: 500;
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
      transition: all 0.3s ease;
    }

    #create-order-btn:hover {
      background-color: var(--pineapple-yellow-dark);
      border-color: var(--pineapple-yellow-dark);
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
    }
  </style>
</head>
<body>
  <!-- Response Message Alert -->
  <div id="response-message" class="alert" role="alert"></div>

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
              <a class="nav-link " href="rt_dashboard.php" data-page="dashboard">
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
              <a class="nav-link active" href="rt_orders.php" data-page="orders">
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
              <h5 class="mb-0" id="pageTitle">Orders</h5>
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
          <!-- Orders Content -->
          <div class="orders-section">
            <!-- Order Stats -->
            <div class="row mb-4">
              <div class="col-md-3">
                <div class="stats-card">
                  <div class="stats-card-body">
                    <div class="stats-card-icon bg-primary-light">
                      <i class="bi bi-cart"></i>
                    </div>
                    <div class="stats-card-info">
                      <h6 class="stats-card-title">Total Orders</h6>
                      <h3 class="stats-card-value" id="total-orders">0</h3>
                    </div>
                  </div>
                </div>
              </div>
              <div class="col-md-3">
                <div class="stats-card">
                  <div class="stats-card-body">
                    <div class="stats-card-icon bg-warning-light">
                      <i class="bi bi-hourglass-split"></i>
                    </div>
                    <div class="stats-card-info">
                      <h6 class="stats-card-title">Pending</h6>
                      <h3 class="stats-card-value" id="pending-orders">0</h3>
                    </div>
                  </div>
                </div>
              </div>
              <div class="col-md-3">
                <div class="stats-card">
                  <div class="stats-card-body">
                    <div class="stats-card-icon bg-success-light">
                      <i class="bi bi-check-circle"></i>
                    </div>
                    <div class="stats-card-info">
                      <h6 class="stats-card-title">Received</h6>
                      <h3 class="stats-card-value" id="received-orders">0</h3>
                    </div>
                  </div>
                </div>
              </div>
              <div class="col-md-3">
                <div class="stats-card">
                  <div class="stats-card-body">
                    <div class="stats-card-icon bg-info-light">
                      <i class="bi bi-currency-dollar"></i>
                    </div>
                    <div class="stats-card-info">
                      <h6 class="stats-card-title">Total Spent</h6>
                      <h3 class="stats-card-value" id="total-spent">₱0.00</h3>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Orders Filters and Actions -->
            <div class="row mb-4">
              <div class="col-md-12">
                <div class="d-flex justify-content-between align-items-center flex-wrap">
                  <div class="d-flex flex-wrap gap-2 mb-2 mb-md-0">
                    <div class="dropdown me-2">
                      <button class="btn btn-outline-secondary dropdown-toggle" type="button" id="statusDropdown" data-bs-toggle="dropdown" aria-expanded="false">
                        <i class="bi bi-funnel me-1"></i> All Status
                      </button>
                      <ul class="dropdown-menu" aria-labelledby="statusDropdown">
                        <li><a class="dropdown-item status-filter" href="#" data-status="all">All Status</a></li>
                        <li><a class="dropdown-item status-filter" href="#" data-status="order">Order Placed</a></li>
                        <li><a class="dropdown-item status-filter" href="#" data-status="processing">Processing</a></li>
                        <li><a class="dropdown-item status-filter" href="#" data-status="shipped">Shipped</a></li>
                        <li><a class="dropdown-item status-filter" href="#" data-status="delivered">Delivered</a></li>
                        <li><a class="dropdown-item status-filter" href="#" data-status="cancelled">Cancelled</a></li>
                      </ul>
                    </div>
                    <div class="dropdown me-2">
                      <button class="btn btn-outline-secondary dropdown-toggle" type="button" id="dateRangeDropdown" data-bs-toggle="dropdown" aria-expanded="false">
                        <i class="bi bi-calendar-range me-1"></i> Date Range
                      </button>
                      <ul class="dropdown-menu" aria-labelledby="dateRangeDropdown">
                        <li><a class="dropdown-item date-range-filter" href="#" data-range="all">All Time</a></li>
                        <li><a class="dropdown-item date-range-filter" href="#" data-range="today">Today</a></li>
                        <li><a class="dropdown-item date-range-filter" href="#" data-range="week">This Week</a></li>
                        <li><a class="dropdown-item date-range-filter" href="#" data-range="month">This Month</a></li>
                        <li><a class="dropdown-item date-range-filter" href="#" data-range="custom">Custom Range</a></li>
                      </ul>
                    </div>
                    <div class="search-container">
                      <div class="input-group">
                        <span class="input-group-text bg-white border-end-0">
                          <i class="bi bi-search"></i>
                        </span>
                        <input type="text" class="form-control border-start-0" id="order-search" placeholder="Search orders...">
                      </div>
                    </div>
                  </div>
                  <button class="btn" id="create-order-btn">
                    <i class="bi bi-plus-lg me-1"></i> Create New Order
                  </button>
                </div>
              </div>
            </div>
            
            <!-- Custom Date Range Selector (initially hidden) -->
            <div class="row mb-4" id="custom-date-range" style="display: none;">
              <div class="col-md-12">
                <div class="card">
                  <div class="card-body">
                    <div class="row">
                      <div class="col-md-5">
                        <div class="mb-0">
                          <label for="start-date" class="form-label">Start Date</label>
                          <input type="date" class="form-control" id="start-date">
                        </div>
                      </div>
                      <div class="col-md-5">
                        <div class="mb-0">
                          <label for="end-date" class="form-label">End Date</label>
                          <input type="date" class="form-control" id="end-date">
                        </div>
                      </div>
                      <div class="col-md-2 d-flex align-items-end">
                        <button class="btn btn-pineapple w-100" id="apply-date-range">Apply</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Orders Table -->
            <div class="row">
              <div class="col-12">
                <div class="card">
                  <div class="card-body">
                    <h5 class="card-title">Order List</h5>
                    
                    <div class="table-responsive">
                      <table class="table table-hover">
                        <thead>
                          <tr>
                            <th>Order #</th>
                            <th>Date</th>
                            <th>Items</th>
                            <th>Total</th>
                            <th>Status</th>
                            <th>Expected Delivery</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody id="orders-table-body">
                          <!-- Orders will be loaded here -->
                          <tr>
                            <td colspan="7" class="text-center py-3">
                              <div class="spinner-border spinner-border-sm text-primary" role="status">
                                <span class="visually-hidden">Loading...</span>
                              </div>
                              <span class="ms-2">Loading orders...</span>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    
                    <!-- Pagination -->
                    <div class="row mt-3">
                      <div class="col-12">
                        <nav aria-label="Order pagination">
                          <ul class="pagination justify-content-center" id="pagination-container">
                            <!-- Pagination will be generated here -->
                          </ul>
                        </nav>
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

  <!-- Create Order Modal -->
  <div class="modal fade" id="createOrderModal" tabindex="-1" aria-labelledby="createOrderModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered modal-xl">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="createOrderModalLabel">
            <i class="bi bi-cart-plus me-2"></i>Create New Order
          </h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <form id="create-order-form">
            <div class="row mb-4">
              <!-- Customer Information -->
              <div class="col-md-6">
                <div class="card h-100">
                  <div class="card-header bg-light">
                    <h6 class="mb-0"><i class="bi bi-person me-2"></i>Customer Information</h6>
                  </div>
                  <div class="card-body">
                    <div class="mb-3">
                      <label for="retailer-name" class="form-label">Retailer Name</label>
                      <input type="text" class="form-control" id="retailer-name" name="retailer_name" required>
                    </div>
                    <div class="mb-3">
                      <label for="retailer-email" class="form-label">Email</label>
                      <input type="email" class="form-control" id="retailer-email" name="retailer_email" required>
                    </div>
                    <div class="mb-3">
                      <label for="retailer-contact" class="form-label">Contact Number</label>
                      <input type="text" class="form-control" id="retailer-contact" name="retailer_contact">
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Order Details -->
              <div class="col-md-6">
                <div class="card h-100">
                  <div class="card-header bg-light">
                    <h6 class="mb-0"><i class="bi bi-calendar-date me-2"></i>Order Details</h6>
                  </div>
                  <div class="card-body">
                    <div class="mb-3">
                      <label for="order-date" class="form-label">Order Date</label>
                      <input type="date" class="form-control" id="order-date" name="order_date" required>
                    </div>
                    <div class="mb-3">
                      <label for="expected-delivery" class="form-label">Expected Delivery Date</label>
                      <input type="date" class="form-control" id="expected-delivery" name="expected_delivery" required>
                    </div>
                    <div class="mb-3">
                      <label for="order-notes" class="form-label">Notes</label>
                      <textarea class="form-control" id="order-notes" name="notes" rows="2"></textarea>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Product Selection Area -->
            <div class="card mb-4">
              <div class="card-header bg-light d-flex justify-content-between align-items-center">
                <h6 class="mb-0"><i class="bi bi-box me-2"></i>Add Products</h6>
              </div>
              <div class="card-body">
                <div class="row">
                  <div class="col-md-5">
                    <!-- Product Search and List -->
                    <div class="mb-3">
                      <label for="product-search" class="form-label">Search Products</label>
                      <input type="text" class="form-control" id="product-search" placeholder="Search by name or ID...">
                    </div>
                    
                    <div class="product-list" id="product-list">
                      <!-- Products will be loaded here -->
                      <div class="text-center py-4 text-muted">
                        <i class="bi bi-search mb-2" style="font-size: 1.5rem;"></i>
                        <p>Search for products to add to the order</p>
                      </div>
                    </div>
                  </div>
                  
                  <div class="col-md-7">
                    <!-- Selected Product Details -->
                    <div id="selected-product-details" class="mb-3" style="display: none;">
                      <div class="card">
                        <div class="card-header bg-light">
                          <h6 class="mb-0">Selected Product</h6>
                        </div>
                        <div class="card-body">
                          <h5 id="selected-product-name">Product Name</h5>
                          <div class="row mb-3">
                            <div class="col-md-6">
                              <p class="mb-1"><strong>Price:</strong> ₱<span id="selected-product-price">0.00</span></p>
                              <p class="mb-1"><strong>Available Stock:</strong> <span id="selected-product-stock">0</span></p>
                            </div>
                            <div class="col-md-6">
                              <label for="product-quantity" class="form-label">Quantity</label>
                              <div class="input-group">
                                <button type="button" class="btn btn-outline-secondary" id="decrease-quantity">-</button>
                                <input type="number" class="form-control text-center" id="product-quantity" value="1" min="1">
                                <button type="button" class="btn btn-outline-secondary" id="increase-quantity">+</button>
                              </div>
                            </div>
                          </div>
                          <button type="button" class="btn btn-pineapple w-100" id="add-to-order-btn">
                            <i class="bi bi-plus-lg me-1"></i>Add to Order
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    <!-- Order Items Table -->
                    <div class="table-responsive order-items-table">
                      <table class="table table-sm mb-0" id="order-items-table">
                        <thead>
                          <tr>
                            <th style="width: 40%;">Product</th>
                            <th style="width: 15%;">Unit Price</th>
                            <th style="width: 15%;">Quantity</th>
                            <th style="width: 20%;">Total</th>
                            <th style="width: 10%;">Actions</th>
                          </tr>
                        </thead>
                        <tbody id="order-items-body">
                          <tr id="no-items-row">
                            <td colspan="5" class="text-center py-3">No items added yet</td>
                          </tr>
                        </tbody>
                        <tfoot>
                          <tr>
                            <td colspan="3" class="text-end fw-bold">Subtotal:</td>
                            <td class="fw-bold">₱<span id="subtotal">0.00</span></td>
                            <td></td>
                          </tr>
                          <tr>
                            <td colspan="3" class="text-end">Discount:</td>
                            <td>
                              <div class="input-group input-group-sm">
                                <span class="input-group-text">₱</span>
                                <input type="number" class="form-control" id="discount" name="discount" value="0" min="0" step="0.01">
                              </div>
                            </td>
                            <td></td>
                          </tr>
                          <tr>
                            <td colspan="3" class="text-end fw-bold">Total:</td>
                            <td class="fw-bold">₱<span id="total-amount">0.00</span></td>
                            <td></td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                <i class="bi bi-x-lg me-1"></i> Cancel
              </button>
              <button type="submit" class="btn btn-pineapple" id="save-order-btn">
                <i class="bi bi-save me-1"></i> Save Order
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>

  <!-- Edit Order Modal -->
  <div class="modal fade" id="editOrderModal" tabindex="-1" aria-labelledby="editOrderModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered modal-xl">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="editOrderModalLabel">
            <i class="bi bi-pencil-square me-2"></i>Edit Order
          </h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <form id="edit-order-form">
            <input type="hidden" id="edit-order-id" name="order_id">
            <div class="row mb-4">
              <!-- Customer Information -->
              <div class="col-md-6">
                <div class="card h-100">
                  <div class="card-header bg-light">
                    <h6 class="mb-0"><i class="bi bi-person me-2"></i>Customer Information</h6>
                  </div>
                  <div class="card-body">
                    <div class="mb-3">
                      <label for="edit-retailer-name" class="form-label">Retailer Name</label>
                      <input type="text" class="form-control" id="edit-retailer-name" name="retailer_name" required>
                    </div>
                    <div class="mb-3">
                      <label for="edit-retailer-email" class="form-label">Email</label>
                      <input type="email" class="form-control" id="edit-retailer-email" name="retailer_email" required>
                    </div>
                    <div class="mb-3">
                      <label for="edit-retailer-contact" class="form-label">Contact Number</label>
                      <input type="text" class="form-control" id="edit-retailer-contact" name="retailer_contact">
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Order Details -->
              <div class="col-md-6">
                <div class="card h-100">
                  <div class="card-header bg-light">
                    <h6 class="mb-0"><i class="bi bi-calendar-date me-2"></i>Order Details</h6>
                  </div>
                  <div class="card-body">
                    <div class="mb-3">
                      <label for="edit-order-date" class="form-label">Order Date</label>
                      <input type="date" class="form-control" id="edit-order-date" name="order_date" required>
                    </div>
                    <div class="mb-3">
                      <label for="edit-expected-delivery" class="form-label">Expected Delivery Date</label>
                      <input type="date" class="form-control" id="edit-expected-delivery" name="expected_delivery" required>
                    </div>
                    <div class="mb-3">
                      <label for="edit-order-notes" class="form-label">Notes</label>
                      <textarea class="form-control" id="edit-order-notes" name="notes" rows="2"></textarea>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Product Selection Area -->
            <div class="card mb-4">
              <div class="card-header bg-light d-flex justify-content-between align-items-center">
                <h6 class="mb-0"><i class="bi bi-box me-2"></i>Add Products</h6>
              </div>
              <div class="card-body">
                <div class="row">
                  <div class="col-md-5">
                    <!-- Product Search and List -->
                    <div class="mb-3">
                      <label for="edit-product-search" class="form-label">Search Products</label>
                      <input type="text" class="form-control" id="edit-product-search" placeholder="Search by name or ID...">
                    </div>
                    
                    <div class="product-list" id="edit-product-list">
                      <!-- Products will be loaded here -->
                      <div class="text-center py-4 text-muted">
                        <i class="bi bi-search mb-2" style="font-size: 1.5rem;"></i>
                        <p>Search for products to add to the order</p>
                      </div>
                    </div>
                  </div>
                  
                  <div class="col-md-7">
                    <!-- Selected Product Details -->
                    <div id="edit-selected-product-details" class="mb-3" style="display: none;">
                      <div class="card">
                        <div class="card-header bg-light">
                          <h6 class="mb-0">Selected Product</h6>
                        </div>
                        <div class="card-body">
                          <h5 id="edit-selected-product-name">Product Name</h5>
                          <div class="row mb-3">
                            <div class="col-md-6">
                              <p class="mb-1"><strong>Price:</strong> ₱<span id="edit-selected-product-price">0.00</span></p>
                              <p class="mb-1"><strong>Available Stock:</strong> <span id="edit-selected-product-stock">0</span></p>
                            </div>
                            <div class="col-md-6">
                              <label for="edit-product-quantity" class="form-label">Quantity</label>
                              <div class="input-group">
                                <button type="button" class="btn btn-outline-secondary" id="edit-decrease-quantity">-</button>
                                <input type="number" class="form-control text-center" id="edit-product-quantity" value="1" min="1">
                                <button type="button" class="btn btn-outline-secondary" id="edit-increase-quantity">+</button>
                              </div>
                            </div>
                          </div>
                          <button type="button" class="btn btn-pineapple w-100" id="edit-add-to-order-btn">
                            <i class="bi bi-plus-lg me-1"></i>Add to Order
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    <!-- Order Items Table -->
                    <div class="table-responsive order-items-table">
                      <table class="table table-sm mb-0" id="edit-order-items-table">
                        <thead>
                          <tr>
                            <th style="width: 40%;">Product</th>
                            <th style="width: 15%;">Unit Price</th>
                            <th style="width: 15%;">Quantity</th>
                            <th style="width: 20%;">Total</th>
                            <th style="width: 10%;">Actions</th>
                          </tr>
                        </thead>
                        <tbody id="edit-order-items-body">
                          <tr id="edit-no-items-row">
                            <td colspan="5" class="text-center py-3">No items added yet</td>
                          </tr>
                        </tbody>
                        <tfoot>
                          <tr>
                            <td colspan="3" class="text-end fw-bold">Subtotal:</td>
                            <td class="fw-bold">₱<span id="edit-subtotal">0.00</span></td>
                            <td></td>
                          </tr>
                          <tr>
                            <td colspan="3" class="text-end">Discount:</td>
                            <td>
                              <div class="input-group input-group-sm">
                                <span class="input-group-text">₱</span>
                                <input type="number" class="form-control" id="edit-discount" name="discount" value="0" min="0" step="0.01">
                              </div>
                            </td>
                            <td></td>
                          </tr>
                          <tr>
                            <td colspan="3" class="text-end fw-bold">Total:</td>
                            <td class="fw-bold">₱<span id="edit-total-amount">0.00</span></td>
                            <td></td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                <i class="bi bi-x-lg me-1"></i> Cancel
              </button>
              <button type="submit" class="btn btn-pineapple" id="update-order-btn">
                <i class="bi bi-save me-1"></i> Update Order
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>

  <!-- View Order Modal -->
  <div class="modal fade" id="viewOrderModal" tabindex="-1" aria-labelledby="viewOrderModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered modal-lg">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="viewOrderModalLabel">
            <i class="bi bi-info-circle me-2"></i>Order Details
          </h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <div class="row mb-4">
            <div class="col-md-6">
              <h6 class="text-muted mb-2">Order Information</h6>
              <p class="mb-1"><strong>Order #:</strong> <span id="view-order-number"></span></p>
              <p class="mb-1"><strong>Date:</strong> <span id="view-order-date"></span></p>
              <p class="mb-1"><strong>Status:</strong> <span id="view-order-status"></span></p>
              <p class="mb-1"><strong>Expected Delivery:</strong> <span id="view-expected-delivery"></span></p>
            </div>
            <div class="col-md-6">
              <h6 class="text-muted mb-2">Retailer Information</h6>
              <p class="mb-1"><strong>Name:</strong> <span id="view-retailer-name"></span></p>
              <p class="mb-1"><strong>Email:</strong> <span id="view-retailer-email"></span></p>
              <p class="mb-1"><strong>Contact:</strong> <span id="view-retailer-contact"></span></p>
            </div>
          </div>
          
          <div class="table-responsive mb-4">
            <table class="table table-sm">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Unit Price</th>
                  <th>Quantity</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody id="view-order-items">
                <!-- Order items will be loaded here -->
              </tbody>
              <tfoot>
                <tr>
                  <td colspan="3" class="text-end fw-bold">Subtotal:</td>
                  <td class="fw-bold">₱<span id="view-subtotal"></span></td>
                </tr>
                <tr>
                  <td colspan="3" class="text-end">Discount:</td>
                  <td>₱<span id="view-discount"></span></td>
                </tr>
                <tr>
                  <td colspan="3" class="text-end fw-bold">Total:</td>
                  <td class="fw-bold">₱<span id="view-total-amount"></span></td>
                </tr>
              </tfoot>
            </table>
          </div>
          
          <div class="mb-3">
            <h6 class="text-muted mb-2">Notes</h6>
            <p id="view-notes" class="mb-0">No notes available</p>
          </div>
          
          <div class="mb-0">
            <h6 class="text-muted mb-2">Status History</h6>
            <div id="status-timeline">
              <!-- Status timeline will be loaded here -->
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
            <i class="bi bi-x-lg me-1"></i> Close
          </button>
          <div class="dropdown">
            <button class="btn btn-pineapple dropdown-toggle" type="button" id="updateStatusDropdown" data-bs-toggle="dropdown" aria-expanded="false">
              <i class="bi bi-arrow-repeat me-1"></i> Update Status
            </button>
            <ul class="dropdown-menu" aria-labelledby="updateStatusDropdown">
              <li><a class="dropdown-item update-status" href="#" data-status="order">Order Placed</a></li>
              <li><a class="dropdown-item update-status" href="#" data-status="processing">Processing</a></li>
              <li><a class="dropdown-item update-status" href="#" data-status="shipped">Shipped</a></li>
              <li><a class="dropdown-item update-status" href="#" data-status="delivered">Delivered</a></li>
              <li><a class="dropdown-item update-status" href="#" data-status="cancelled">Cancelled</a></li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Update Status Modal -->
  <div class="modal fade" id="updateStatusModal" tabindex="-1" aria-labelledby="updateStatusModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="updateStatusModalLabel">
            <i class="bi bi-arrow-repeat me-2"></i>Update Order Status
          </h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <form id="update-status-form">
            <input type="hidden" id="update-order-id">
            <input type="hidden" id="update-status">
            
            <div class="mb-3">
              <label for="status-notes" class="form-label">Notes (Optional)</label>
              <textarea class="form-control" id="status-notes" rows="3" placeholder="Add any notes about this status change..."></textarea>
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
            <i class="bi bi-x-lg me-1"></i> Cancel
          </button>
          <button type="button" class="btn btn-pineapple" id="confirm-status-update">
            <i class="bi bi-check-lg me-1"></i> Update Status
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- Delete Order Confirmation Modal -->
  <div class="modal fade" id="deleteOrderModal" tabindex="-1" aria-labelledby="deleteOrderModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered modal-sm">
      <div class="modal-content">
        <div class="modal-body text-center p-4">
          <div class="delete-confirm-icon">
            <i class="bi bi-exclamation-triangle-fill"></i>
          </div>
          <h5 class="modal-title mb-3" id="deleteOrderModalLabel">Confirm Delete</h5>
          <p class="delete-confirm-text">Are you sure you want to delete this order? This action cannot be undone.</p>
          <input type="hidden" id="delete-order-id">
          
          <div class="d-flex justify-content-center gap-2 mt-4">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
              <i class="bi bi-x-lg me-1"></i> Cancel
            </button>
            <button type="button" class="btn btn-danger" id="confirm-delete-btn">
              <i class="bi bi-trash me-1"></i> Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Bootstrap JS Bundle with Popper -->
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/js/bootstrap.bundle.min.js"></script>
  <!-- Flatpickr JS -->
  <script src="https://cdn.jsdelivr.net/npm/flatpickr"></script>
  <!-- Custom JavaScript -->
  <script src="script.js"></script>
  <script src="mobile-menu.js"></script>
  <!-- Orders JavaScript -->
  <script src="retail_orders.js"></script>
</body>
</html>