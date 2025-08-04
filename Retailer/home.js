document.addEventListener("DOMContentLoaded", () => {
    // Add content to the main-content div
    const mainContent = document.querySelector(".main-content")
  
    // Create dashboard content container
    const dashboardContent = document.createElement("div")
    dashboardContent.className = "dashboard-content mt-5 pt-4"
    dashboardContent.innerHTML = `
          <div class="container-fluid">
              <!-- Dashboard Summary Cards -->
              <div class="row mb-4">
                  <div class="col-md-3 mb-3">
                      <div class="card dashboard-card">
                          <div class="card-body">
                              <div class="d-flex justify-content-between align-items-center">
                                  <div>
                                      <h6 class="card-subtitle mb-2 text-muted">Total Products Ordered</h6>
                                      <h3 class="card-title mb-0" id="total-products">--</h3>
                                      
                                  </div>
                                  <div class="dashboard-icon bg-primary">
                                      <i class="bi bi-box-seam"></i>
                                  </div>
                              </div>
                          </div>
                      </div>
                  </div>
                  <div class="col-md-3 mb-3">
                      <div class="card dashboard-card">
                          <div class="card-body">
                              <div class="d-flex justify-content-between align-items-center">
                                  <div>
                                      <h6 class="card-subtitle mb-2 text-muted">Active Orders</h6>
                                      <h3 class="card-title mb-0" id="active-orders">--</h3>
                                  </div>
                                  <div class="dashboard-icon bg-success">
                                      <i class="bi bi-cart-check"></i>
                                  </div>
                              </div>
                          </div>
                      </div>
                  </div>
                  <div class="col-md-3 mb-3">
                      <div class="card dashboard-card">
                          <div class="card-body">
                              <div class="d-flex justify-content-between align-items-center">
                                  <div>
                                      <h6 class="card-subtitle mb-2 text-muted">Pending Payments</h6>
                                      <h3 class="card-title mb-0" id="pending-payments">--</h3>
                                  </div>
                                  <div class="dashboard-icon bg-warning">
                                      <i class="bi bi-credit-card"></i>
                                  </div>
                              </div>
                          </div>
                      </div>
                  </div>
                  <div class="col-md-3 mb-3">
                      <div class="card dashboard-card">
                          <div class="card-body">
                              <div class="d-flex justify-content-between align-items-center">
                                  <div>
                                      <h6 class="card-subtitle mb-2 text-muted">Low Stock Items</h6>
                                      <h3 class="card-title mb-0" id="low-stock">--</h3>
                                  </div>
                                  <div class="dashboard-icon bg-danger">
                                      <i class="bi bi-exclamation-triangle"></i>
                                  </div>
                              </div>
                          </div>
                      </div>
                  </div>
              </div>
  
              <!-- Orders and Payments Section -->
              <div class="row mb-4">
                  <!-- Recent Orders -->
                  <div class="col-12">
                      <div class="card">
                          <div class="card-header d-flex justify-content-between align-items-center">
                              <h5 class="mb-0">Recent Orders</h5>
                              <a href="orders.html" class="btn btn-sm btn-outline-primary">View All</a>
                          </div>
                          <div class="card-body">
                              <div class="row" id="recent-orders-container">
                                  <div class="col-12 text-center py-4">
                                      <div class="spinner-border text-primary" role="status">
                                          <span class="visually-hidden">Loading...</span>
                                      </div>
                                  </div>
                              </div>
                          </div>
                      </div>
                  </div>
              </div>
  
              <!-- Active Orders Section -->
              <div class="row mb-4">
                  <div class="col-12">
                      <div class="card">
                          <div class="card-header d-flex justify-content-between align-items-center">
                              <h5 class="mb-0">Active Orders</h5>
                              <a href="orders.html?filter=active" class="btn btn-sm btn-outline-primary">View All</a>
                          </div>
                          <div class="card-body">
                              <div class="row" id="active-orders-container">
                                  <div class="col-12 text-center py-4">
                                      <div class="spinner-border text-primary" role="status">
                                          <span class="visually-hidden">Loading...</span>
                                      </div>
                                  </div>
                              </div>
                          </div>
                      </div>
                  </div>
              </div>
  
              <!-- In-Process Payments Section -->
              <div class="row mb-4">
                  <div class="col-12">
                      <div class="card">
                          <div class="card-header d-flex justify-content-between align-items-center">
                              <h5 class="mb-0">In-Process Payments</h5>
                              <a href="billing.html?filter=partial" class="btn btn-sm btn-outline-primary">View All</a>
                          </div>
                          <div class="card-body">
                              <div class="row" id="partial-payments-container">
                                  <div class="col-12 text-center py-4">
                                      <div class="spinner-border text-primary" role="status">
                                          <span class="visually-hidden">Loading...</span>
                                      </div>
                                  </div>
                              </div>
                          </div>
                      </div>
                  </div>
              </div>
              
              <!-- My Products Section -->
              <div class="row mb-4">
                  <div class="col-12">
                      <div class="card">
                          <div class="card-header d-flex justify-content-between align-items-center">
                              <h5 class="mb-0">My Products</h5>
                              <a href="inventory.html?filter=ordered" class="btn btn-sm btn-outline-primary">View All</a>
                          </div>
                          <div class="card-body">
                              <div class="table-responsive">
                                  <table class="table table-hover">
                                      <thead>
                                          <tr>
                                              <th>Image</th>
                                              <th>Product Name</th>
                                              <th>Category</th>
                                              <th>Price</th>
                                              <th>Stock</th>
                                          </tr>
                                      </thead>
                                      <tbody id="my-products-table">
                                          <tr>
                                              <td colspan="5" class="text-center">Loading...</td>
                                          </tr>
                                      </tbody>
                                  </table>
                              </div>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      `
  
    mainContent.appendChild(dashboardContent)
  
    // Add CSS for dashboard
    const style = document.createElement("style")
    style.textContent = `
          .dashboard-content {
              padding-top: 5px;
          }
          .dashboard-card {
              border-radius: 10px;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
              transition: transform 0.3s ease;
          }
          .dashboard-card:hover {
              transform: translateY(-5px);
          }
          .dashboard-icon {
              width: 50px;
              height: 50px;
              border-radius: 10px;
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
          }
          .dashboard-icon i {
              font-size: 1.5rem;
          }
          .status-badge {
              padding: 5px 10px;
              border-radius: 20px;
              font-size: 0.8rem;
              font-weight: 500;
          }
          .status-order { background-color: #e0f7fa; color: #006064; }
          .status-confirmed { background-color: #e8f5e9; color: #1b5e20; }
          .status-shipped { background-color: #ede7f6; color: #4527a0; }
          .status-delivered { background-color: #e8f5e9; color: #1b5e20; }
          .status-ready-to-pickup { background-color: #fff8e1; color: #ff6f00; }
          .status-picked-up { background-color: #e8f5e9; color: #1b5e20; }
          .status-completed { background-color: #e8f5e9; color: #1b5e20; }
          .payment-pending { background-color: #ffebee; color: #b71c1c; }
          .payment-partial { background-color: #fff8e1; color: #ff6f00; }
          .payment-paid { background-color: #e8f5e9; color: #1b5e20; }
          .order-card {
              border-radius: 10px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.05);
              transition: transform 0.2s ease;
              margin-bottom: 10px;
          }
          .order-card:hover {
              transform: translateY(-3px);
              box-shadow: 0 4px 8px rgba(0,0,0,0.1);
          }
          .order-card .card-body {
              padding: 15px;
          }
          .order-card .order-number {
              font-weight: 600;
              font-size: 1.1rem;
          }
          .order-card .order-date {
              color: #6c757d;
              font-size: 0.85rem;
          }
          .order-card .order-amount {
              font-weight: 600;
              color: #495057;
          }
          .order-card .order-status {
              margin-top: 10px;
          }
          .order-card .btn-sm {
              padding: 0.25rem 0.5rem;
              font-size: 0.75rem;
          }
      `
    document.head.appendChild(style)
  
    // Fetch dashboard data
    fetchDashboardData()
  })
  
  /**
 * Fetch dashboard data from the server
 */
function fetchDashboardData() {
    fetch("get_dashboard_data.php")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        // Update summary cards
        document.getElementById("total-products").textContent = data.totalProductsOrdered || 0;
        document.getElementById("active-orders").textContent = data.activeOrdersCount || 0;
        document.getElementById("pending-payments").textContent = data.pendingPaymentsCount || 0;
        document.getElementById("low-stock").textContent = data.lowStockCount || 0;
  
        // ✅ Populate recent orders
        if (data.recentOrders) {
          populateRecentOrdersCards(data.recentOrders);
        }
  
        // ✅ Populate active orders
        if (data.activeOrders) {
          populateActiveOrdersCards(data.activeOrders);
        }

        if (data.partialPayments) {
            populatePartialPaymentsCards(data.partialPayments);
          }

          if (data.myProducts) {
            populateMyProducts(data.myProducts);
          }
          
  
        // Optional: use if added later
        // if (data.partialPaymentOrders) populatePartialPaymentsCards(data.partialPaymentOrders);
        // if (data.completedOrderProducts) populateMyProducts(data.completedOrderProducts);
      })
      .catch((error) => {
        console.error("Error fetching dashboard data:", error);
        document.getElementById("total-products").textContent = "Error";
        document.getElementById("active-orders").textContent = "Error";
        document.getElementById("pending-payments").textContent = "Error";
        document.getElementById("low-stock").textContent = "Error";
  
        document.getElementById("recent-orders-container").innerHTML =
          '<div class="col-12 text-center text-danger">Error loading data. Please refresh.</div>';
        document.getElementById("active-orders-container").innerHTML =
          '<div class="col-12 text-center text-danger">Error loading data. Please refresh.</div>';
        document.getElementById("partial-payments-container").innerHTML =
          '<div class="col-12 text-center text-danger">Error loading data. Please refresh.</div>';
        document.getElementById("my-products-table").innerHTML =
          '<tr><td colspan="5" class="text-center text-danger">Error loading data. Please refresh.</td></tr>';
      });
  }
  
  
  
  /**
   * Populate recent orders as cards
   */
  function populateRecentOrdersCards(orders) {
    const container = document.getElementById("recent-orders-container");
  
    if (!orders || orders.length === 0) {
      container.innerHTML = '<div class="col-12 text-center py-4">No orders found</div>';
      return;
    }
  
    let html = "";
    orders.forEach((order) => {
      const statusBadge = getOrderStatusBadge(order.status || order.pickup_status);
      const formattedDate = formatDate(order.order_date);
  
      html += `
        <div class="col-md-6 col-lg-4">
          <div class="card order-card bg-light shadow-sm rounded border-0"">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-start">
                <div>
                  <div class="order-number">${order.po_number}</div>
                  <div class="order-date">${formattedDate}</div>
                </div>
                <div class="order-amount">₱${Number.parseFloat(order.total_amount).toFixed(2)}</div>
              </div>
              <div class="order-status">
                ${statusBadge}
              </div>
              <div class="mt-3 d-flex justify-content-end">
                <a href="orders.html?order_id=${order.order_id}" class="btn btn-sm btn-outline-primary">View Details</a>
              </div>
            </div>
          </div>
        </div>
      `;
    });
  
    container.innerHTML = html;
  }

  function getOrderStatusBadge(status) {
    const badgeMap = {
      'order': 'bg-secondary',
      'shipped': 'bg-info',
      'delivered': 'bg-success',
      'ready-to-pickup': 'bg-warning',
      'picked up': 'bg-primary',
    };
    const badgeClass = badgeMap[status] || 'bg-secondary';
    return `<span class="badge ${badgeClass} text-uppercase">${status}</span>`;
  }
  
  function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }
  
  
  
/**
 * Populate active orders as cards
 */
function populateActiveOrdersCards(orders) {
    const container = document.getElementById("active-orders-container");
  
    if (!orders || orders.length === 0) {
      container.innerHTML = '<div class="col-12 text-center py-4">No active orders found</div>';
      return;
    }
  
    let html = "";
    orders.forEach((order) => {
      const statusBadge = getOrderStatusBadge(order.status);
      const formattedDate = formatDate(order.order_date);
  
      html += `
        <div class="col-md-6 col-lg-4">
          <div class="card order-card bg-light shadow-sm rounded border-0">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-start">
                <div>
                  <div class="order-number">${order.po_number}</div>
                  <div class="order-date">${formattedDate}</div>
                </div>
                <div class="order-amount">₱${Number.parseFloat(order.total_amount).toFixed(2)}</div>
              </div>
              <div class="order-status">
                ${statusBadge}
              </div>
              <div class="mt-3 d-flex justify-content-end">
                <a href="orders.html?order_id=${order.order_id}" class="btn btn-sm btn-outline-primary">View Details</a>
              </div>
            </div>
          </div>
        </div>
      `;
    });
  
    container.innerHTML = html;
  }
  
  
  /**
   * Populate partial payments as cards
   */
  function populatePartialPaymentsCards(orders) {
    const container = document.getElementById("partial-payments-container")
  
    if (!orders || orders.length === 0) {
      container.innerHTML = '<div class="col-12 text-center py-4">No partial payments found</div>'
      return
    }
  
    let html = ""
    orders.forEach((order) => {
      const formattedDate = formatDate(order.order_date)
      const totalAmount = Number.parseFloat(order.total_amount)
      const paidAmount = Number.parseFloat(order.paid_amount || 0)
      const remainingAmount = totalAmount - paidAmount
      const paymentPercentage = Math.round((paidAmount / totalAmount) * 100)
  
      html += `
              <div class="col-md-6 col-lg-4">
                  <div class="card order-card bg-light shadow-sm rounded border-0">
                      <div class="card-body bg-lights">
                          <div class="d-flex justify-content-between align-items-start">
                              <div>
                                  <div class="order-number">${order.po_number}</div>
                                  <div class="order-date">${formattedDate}</div>
                              </div>
                              <div class="order-amount">₱${totalAmount.toFixed(2)}</div>
                          </div>
                          <div class="mt-2">
                              <div class="d-flex justify-content-between align-items-center mb-1">
                                  <small>Payment Progress (${paymentPercentage}%)</small>
                                  <small>₱${paidAmount.toFixed(2)} / ₱${totalAmount.toFixed(2)}</small>
                              </div>
                              <div class="progress" style="height: 8px;">
                                  <div class="progress-bar bg-success" role="progressbar" style="width: ${paymentPercentage}%" 
                                       aria-valuenow="${paymentPercentage}" aria-valuemin="0" aria-valuemax="100"></div>
                              </div>
                          </div>
                          <div class="mt-2">
                              <small class="text-muted">Remaining: ₱${remainingAmount.toFixed(2)}</small>
                          </div>
                          <div class="mt-3 d-flex justify-content-end">
                              <a href="billing.html?order_id=${order.order_id}" class="btn btn-sm btn-primary">Complete Payment</a>
                              <a href="orders.html?order_id=${order.order_id}" class="btn btn-sm btn-outline-secondary ms-2">View Details</a>
                          </div>
                      </div>
                  </div>
              </div>
          `
    })
  
    container.innerHTML = html
  }
  
  /**
 * Populate my products table
 */
function populateMyProducts(products) {
  const tableBody = document.getElementById("my-products-table");

  if (!products || products.length === 0) {
    tableBody.innerHTML = '<tr><td colspan="5" class="text-center">No products found</td></tr>';
    return;
  }

  let html = "";
  products.forEach((product) => {
    const fallbackPhoto = "assets/img/placeholder.png"; // <- Update path if needed
    const productPhoto = product.product_photo && product.product_photo.trim() !== "" 
                         ? product.product_photo 
                         : fallbackPhoto;

    const price = !isNaN(parseFloat(product.price))
                  ? `₱${Number.parseFloat(product.price).toFixed(2)}`
                  : "₱0.00";

    const stockCount = parseInt(product.stocks) || 0;
    const stockStatus = getStockStatusBadge(stockCount);

    html += `
      <tr>
        <td>
          <img src="${productPhoto}" alt="${product.product_name}" 
               class="img-thumbnail" style="width: 50px; height: 50px; object-fit: cover;">
        </td>
        <td>${product.product_name}</td>
        <td>${product.category}</td>
        <td>${price}</td>
        <td>${stockStatus}</td>
      </tr>
    `;
  });

  tableBody.innerHTML = html;
}

  /**
   * Get order status badge HTML
   */
  function getOrderStatusBadge(status) {
    let badgeClass = ""
  
    switch (status.toLowerCase()) {
      case "order":
        badgeClass = "status-order"
        break
      case "confirmed":
        badgeClass = "status-confirmed"
        break
      case "shipped":
        badgeClass = "status-shipped"
        break
      case "delivered":
        badgeClass = "status-delivered"
        break
      case "ready-to-pickup":
        badgeClass = "status-ready-to-pickup"
        break
      case "picked up":
        badgeClass = "status-picked-up"
        break
      case "completed":
        badgeClass = "status-completed"
        break
      default:
        badgeClass = "bg-secondary text-white"
    }
  
    return `<span class="status-badge ${badgeClass}">${status}</span>`
  }
  
  /**
   * Get stock status badge HTML
   */
  function getStockStatusBadge(stock) {
    const stockNum = Number.parseInt(stock)
  
    if (stockNum <= 0) {
      return '<span class="status-badge payment-pending">Out of Stock</span>'
    } else if (stockNum <= 5) {
      return '<span class="status-badge payment-partial">Low Stock (' + stockNum + ")</span>"
    } else {
      return '<span class="status-badge payment-paid">In Stock (' + stockNum + ")</span>"
    }
  }
  
  /**
   * Format date to readable format
   */
  function formatDate(dateString) {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }
  