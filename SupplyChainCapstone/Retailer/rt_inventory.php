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
              <a class="nav-link active" href="rt_inventory.php" data-page="inventory">
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
              <h5 class="mb-0" id="pageTitle">Inventory Management</h5>
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
          <!-- Inventory Content -->
          <div id="inventoryContent" class="content-section active">
            <!-- Inventory Header with Search, Filter, and View Toggle -->
            <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
              <div class="d-flex align-items-center">
                <h2 class="section-title mb-0 me-3"><i class="bi bi-box"></i> Inventory</h2>
                <div class="view-toggle btn-group" role="group" aria-label="View toggle">
                  <button type="button" class="btn btn-sm btn-outline-primary active" id="tableViewBtn" data-view="table">
                    <i class="bi bi-table me-1"></i>Table
                  </button>
                  <button type="button" class="btn btn-sm btn-outline-primary" id="cardViewBtn" data-view="card">
                    <i class="bi bi-grid-3x3-gap me-1"></i>Cards
                  </button>
                </div>
              </div>
              
              <div class="d-flex flex-column flex-md-row gap-2">
                <div class="input-group">
                  <input type="text" class="form-control" placeholder="Search products..." id="inventorySearch">
                  <button class="btn btn-outline-secondary" type="button" id="searchInventoryBtn">
                    <i class="bi bi-search"></i>
                  </button>
                </div>
                <button class="btn btn-primary" id="addProductBtn">
                  <i class="bi bi-plus-lg me-1"></i> Add Product
                </button>
              </div>
            </div>
            
            <!-- Filters and Sorting Row -->
            <div class="card mb-4">
              <div class="card-body py-3">
                <div class="row align-items-center">
                  <div class="col-md-8">
                    <div class="d-flex flex-wrap gap-2">
                      <!-- Category Filter -->
                      <div class="dropdown">
                        <button class="btn btn-outline-secondary dropdown-toggle" type="button" id="categoryFilter" data-bs-toggle="dropdown" aria-expanded="false">
                          <i class="bi bi-tag me-1"></i> Category: All
                        </button>
                        <ul class="dropdown-menu" aria-labelledby="categoryFilter">
                          <li><a class="dropdown-item category-filter active" href="#" data-category="all">All Categories</a></li>
                          <li><a class="dropdown-item category-filter" href="#" data-category="preserves">Preserves</a></li>
                          <li><a class="dropdown-item category-filter" href="#" data-category="beverages">Beverages</a></li>
                          <li><a class="dropdown-item category-filter" href="#" data-category="snacks">Snacks</a></li>
                          <li><a class="dropdown-item category-filter" href="#" data-category="bakery">Bakery</a></li>
                          <li><a class="dropdown-item category-filter" href="#" data-category="condiments">Condiments</a></li>
                        </ul>
                      </div>
                      
                      <!-- Stock Status Filter -->
                      <div class="dropdown">
                        <button class="btn btn-outline-secondary dropdown-toggle" type="button" id="stockFilter" data-bs-toggle="dropdown" aria-expanded="false">
                          <i class="bi bi-layers me-1"></i> Status: All
                        </button>
                        <ul class="dropdown-menu" aria-labelledby="stockFilter">
                          <li><a class="dropdown-item stock-filter active" href="#" data-stock="all">All Status</a></li>
                          <li><a class="dropdown-item stock-filter" href="#" data-stock="in-stock">In Stock</a></li>
                          <li><a class="dropdown-item stock-filter" href="#" data-stock="low-stock">Low Stock</a></li>
                          <li><a class="dropdown-item stock-filter" href="#" data-stock="out-of-stock">Out of Stock</a></li>
                        </ul>
                      </div>
                      
                      <!-- Expiry Filter -->
                      <div class="dropdown">
                        <button class="btn btn-outline-secondary dropdown-toggle" type="button" id="expiryFilter" data-bs-toggle="dropdown" aria-expanded="false">
                          <i class="bi bi-calendar-x me-1"></i> Expiry: All
                        </button>
                        <ul class="dropdown-menu" aria-labelledby="expiryFilter">
                          <li><a class="dropdown-item expiry-filter active" href="#" data-expiry="all">All Items</a></li>
                          <li><a class="dropdown-item expiry-filter" href="#" data-expiry="expiring-soon">Expiring Soon (30 days)</a></li>
                          <li><a class="dropdown-item expiry-filter" href="#" data-expiry="expired">Expired</a></li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  
                  <div class="col-md-4 mt-3 mt-md-0">
                    <div class="d-flex justify-content-md-end">
                      <!-- Sort By -->
                      <div class="dropdown">
                        <button class="btn btn-outline-secondary dropdown-toggle" type="button" id="sortByFilter" data-bs-toggle="dropdown" aria-expanded="false">
                          <i class="bi bi-sort-alpha-down me-1"></i> Sort By: Name
                        </button>
                        <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="sortByFilter">
                          <li><a class="dropdown-item sort-by active" href="#" data-sort="name-asc">Name (A-Z)</a></li>
                          <li><a class="dropdown-item sort-by" href="#" data-sort="name-desc">Name (Z-A)</a></li>
                          <li><a class="dropdown-item sort-by" href="#" data-sort="stock-asc">Stock (Low to High)</a></li>
                          <li><a class="dropdown-item sort-by" href="#" data-sort="stock-desc">Stock (High to Low)</a></li>
                          <li><a class="dropdown-item sort-by" href="#" data-sort="expiry-asc">Expiry (Earliest First)</a></li>
                          <li><a class="dropdown-item sort-by" href="#" data-sort="expiry-desc">Expiry (Latest First)</a></li>
                        </ul>
                      </div>
                      
                      <!-- Export Button -->
                      <button class="btn btn-outline-secondary ms-2" id="exportInventoryBtn">
                        <i class="bi bi-download me-1"></i> Export
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Active Filters Display -->
            <div id="activeFilters" class="mb-3 d-none">
              <div class="d-flex flex-wrap gap-2 align-items-center">
                <span class="text-muted">Active Filters:</span>
                <div class="active-filter-tags">
                  <!-- Active filter tags will be added here dynamically -->
                </div>
                <button class="btn btn-sm btn-link text-decoration-none" id="clearAllFilters">Clear All</button>
              </div>
            </div>
            
            <!-- Table View -->
            <div id="tableView" class="view-container">
              <div class="card mb-4">
                <div class="card-body p-0">
                  <div class="table-responsive">
                    <table class="table table-hover table-modern mb-0">
                      <thead>
                        <tr>
                          <th>Product</th>
                          <th>SKU</th>
                          <th>Category</th>
                          <th>Total Stock</th>
                          <th>Batches</th>
                          <th>Status</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody id="inventoryTableBody">
                        <!-- Table rows will be populated dynamically -->
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Card View -->
            <div id="cardView" class="view-container d-none">
              <div class="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4" id="inventoryCardContainer">
                <!-- Cards will be populated dynamically -->
              </div>
            </div>
            
            <!-- Empty State -->
            <div id="emptyState" class="text-center py-5 d-none">
              <div class="py-5">
                <i class="bi bi-box-seam display-1 text-muted mb-3"></i>
                <h4>No Products Found</h4>
                <p class="text-muted">Try adjusting your search or filter to find what you're looking for.</p>
                <button class="btn btn-primary" id="resetFiltersBtn">Reset Filters</button>
              </div>
            </div>
            
            <!-- Loading State -->
            <div id="loadingState" class="text-center py-5">
              <div class="py-5">
                <div class="spinner-border text-primary mb-3" role="status">
                  <span class="visually-hidden">Loading...</span>
                </div>
                <h4>Loading Inventory...</h4>
                <p class="text-muted">Please wait while we fetch your inventory data.</p>
              </div>
            </div>
            
            <!-- Pagination -->
            <div class="d-flex justify-content-between align-items-center mt-4">
              <div class="text-muted" id="inventoryCount">
                Showing <span id="currentCount">0</span> of <span id="totalCount">0</span> products
              </div>
              <nav aria-label="Inventory pagination">
                <ul class="pagination" id="inventoryPagination">
                  <!-- Pagination will be populated dynamically -->
                </ul>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Product Details Modal -->
  <div class="modal fade" id="productDetailsModal" tabindex="-1" aria-labelledby="productDetailsModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="productDetailsModalLabel">Product Details</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <div class="row">
            <div class="col-md-4 text-center mb-3 mb-md-0">
              <img src="/placeholder.svg" alt="Product" class="img-fluid rounded" id="modalProductImage">
            </div>
            <div class="col-md-8">
              <h4 id="modalProductName"></h4>
              <p id="modalProductDescription"></p>
              
              <div class="row mt-4">
                <div class="col-6">
                  <p><strong>SKU:</strong> <span id="modalProductSku"></span></p>
                  <p><strong>Category:</strong> <span id="modalProductCategory"></span></p>
                  <p><strong>Total Stock:</strong> <span id="modalProductStock"></span></p>
                </div>
                <div class="col-6">
                  <p><strong>Reorder Level:</strong> <span id="modalProductReorderLevel"></span></p>
                  <p><strong>Supplier:</strong> <span id="modalProductSupplier"></span></p>
                  <p><strong>Status:</strong> <span id="modalProductStatus" class="badge"></span></p>
                </div>
              </div>
            </div>
          </div>
          
          <div class="mt-4">
            <h5>Batch Information</h5>
            <div class="table-responsive">
              <table class="table table-bordered table-hover">
                <thead>
                  <tr>
                    <th>Batch ID</th>
                    <th>Quantity</th>
                    <th>Manufacturing Date</th>
                    <th>Expiry Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody id="modalBatchesTable">
                  <!-- Batch rows will be populated dynamically -->
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
          <button type="button" class="btn btn-primary" id="modalOrderMoreBtn">Order More</button>
          <button type="button" class="btn btn-warning" id="modalEditBtn">Edit Product</button>
        </div>
      </div>
    </div>
  </div>

  <!-- Add/Edit Product Modal -->
  <div class="modal fade" id="productFormModal" tabindex="-1" aria-labelledby="productFormModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="productFormModalLabel">Add New Product</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <form id="productForm">
            <input type="hidden" id="productId" name="productId">
            
            <div class="row mb-3">
              <div class="col-md-6">
                <label for="productName" class="form-label">Product Name</label>
                <input type="text" class="form-control" id="productName" name="productName" required>
              </div>
              <div class="col-md-6">
                <label for="productSku" class="form-label">SKU</label>
                <input type="text" class="form-control" id="productSku" name="productSku" required>
              </div>
            </div>
            
            <div class="row mb-3">
              <div class="col-md-6">
                <label for="productCategory" class="form-label">Category</label>
                <select class="form-select" id="productCategory" name="productCategory" required>
                  <option value="">Select Category</option>
                  <option value="preserves">Preserves</option>
                  <option value="beverages">Beverages</option>
                  <option value="snacks">Snacks</option>
                  <option value="bakery">Bakery</option>
                  <option value="condiments">Condiments</option>
                </select>
              </div>
              <div class="col-md-6">
                <label for="productSupplier" class="form-label">Supplier</label>
                <input type="text" class="form-control" id="productSupplier" name="productSupplier" value="Piñana Gourmet" required>
              </div>
            </div>
            
            <div class="row mb-3">
              <div class="col-md-6">
                <label for="productReorderLevel" class="form-label">Reorder Level</label>
                <input type="number" class="form-control" id="productReorderLevel" name="productReorderLevel" min="1" required>
              </div>
              <div class="col-md-6">
                <label for="productPrice" class="form-label">Price</label>
                <div class="input-group">
                  <span class="input-group-text">₱</span>
                  <input type="number" class="form-control" id="productPrice" name="productPrice" min="0" step="0.01" required>
                </div>
              </div>
            </div>
            
            <div class="mb-3">
              <label for="productDescription" class="form-label">Description</label>
              <textarea class="form-control" id="productDescription" name="productDescription" rows="3"></textarea>
            </div>
            
            <div class="mb-3">
              <label for="productImage" class="form-label">Product Image</label>
              <input type="file" class="form-control" id="productImage" name="productImage">
              <div class="form-text">Recommended size: 500x500px. Max file size: 2MB.</div>
            </div>
            
            <h5 class="mt-4 mb-3">Initial Batch Information</h5>
            <div class="row mb-3">
              <div class="col-md-4">
                <label for="batchId" class="form-label">Batch ID</label>
                <input type="text" class="form-control" id="batchId" name="batchId">
              </div>
              <div class="col-md-4">
                <label for="batchQuantity" class="form-label">Quantity</label>
                <input type="number" class="form-control" id="batchQuantity" name="batchQuantity" min="1">
              </div>
              <div class="col-md-4">
                <label for="batchManufacturingDate" class="form-label">Manufacturing Date</label>
                <input type="text" class="form-control" id="batchManufacturingDate" name="batchManufacturingDate">
              </div>
            </div>
            <div class="row mb-3">
              <div class="col-md-4">
                <label for="batchExpiryDate" class="form-label">Expiry Date</label>
                <input type="text" class="form-control" id="batchExpiryDate" name="batchExpiryDate">
              </div>
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
          <button type="button" class="btn btn-primary" id="saveProductBtn">Save Product</button>
        </div>
      </div>
    </div>
  </div>

  <!-- Confirm Delete Modal -->
  <div class="modal fade" id="confirmDeleteModal" tabindex="-1" aria-labelledby="confirmDeleteModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="confirmDeleteModalLabel">Confirm Delete</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <p>Are you sure you want to delete <strong id="deleteProductName"></strong>?</p>
          <p class="text-danger">This action cannot be undone.</p>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
          <button type="button" class="btn btn-danger" id="confirmDeleteBtn">Delete</button>
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
  <script src="inventory.js"></script>
</body>
</html>
