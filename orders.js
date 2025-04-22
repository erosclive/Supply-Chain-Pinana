// Global variables
let currentPage = 1
let retailerCurrentPage = 1
const itemsPerPage = 10
let totalPages = 1
let retailerTotalPages = 1
let currentOrders = []
let currentRetailerOrders = []
const currentFilters = {
  status: "all",
  dateRange: "all",
  startDate: null,
  endDate: null,
  search: "",
}
const retailerFilters = {
  status: "all",
  search: "",
}

// Initialize the page
document.addEventListener("DOMContentLoaded", () => {
  // Check if required elements exist
  const requiredElements = [
    { id: "retailer-orders-table-body", name: "Retailer orders table body" },
    { id: "viewOrderModal", name: "View order modal" },
    { id: "alertContainer", name: "Alert container" },
  ]

  // Remove the check for elements we don't need anymore
  const missingElements = []
  requiredElements.forEach((element) => {
    if (!document.getElementById(element.id)) {
      missingElements.push(element.name)
      console.error(`Required element not found: ${element.id}`)
    }
  })

  if (missingElements.length > 0) {
    showAlert("warning", `Some required elements are missing: ${missingElements.join(", ")}`)
  }

  // Initialize sidebar toggle for mobile
  initSidebar()

  // Initialize date pickers
  initDatePickers()

  // Load retailer orders by default instead of customer orders
  //loadRetailerOrders()
  loadRetailerOrders()

  // Initialize event listeners
  initEventListeners()

  // Initialize tabs
  initTabs()
})

// Initialize sidebar toggle for mobile
function initSidebar() {
  const sidebarToggle = document.getElementById("sidebarToggle")
  const sidebar = document.getElementById("sidebar")

  if (sidebarToggle && sidebar) {
    sidebarToggle.addEventListener("click", () => {
      sidebar.classList.toggle("show")
    })

    // Close sidebar when clicking outside on mobile
    document.addEventListener("click", (event) => {
      if (
        window.innerWidth < 768 &&
        !sidebar.contains(event.target) &&
        !sidebarToggle.contains(event.target) &&
        sidebar.classList.contains("show")
      ) {
        sidebar.classList.remove("show")
      }
    })
  }
}

// Initialize date pickers
function initDatePickers() {
  try {
    // Date range pickers
    if (typeof flatpickr !== "undefined") {
      flatpickr("#dateRangeStart", {
        enableTime: false,
        dateFormat: "Y-m-d",
      })

      flatpickr("#dateRangeEnd", {
        enableTime: false,
        dateFormat: "Y-m-d",
      })
      flatpickr("#retailerDateRangeStart", {
        enableTime: false,
        dateFormat: "Y-m-d",
      })

      flatpickr("#retailerDateRangeEnd", {
        enableTime: false,
      })
    } else {
      console.warn("flatpickr is not defined. Date pickers may not work properly.")
    }
  } catch (error) {
    console.error("Error initializing date pickers:", error)
  }
}

// Initialize tabs
function initTabs() {
  // Add event listener for customer orders tab
  const customerOrdersTab = document.getElementById("customerOrdersTab")
  if (customerOrdersTab) {
    customerOrdersTab.addEventListener("click", () => {
      loadOrders()
    })
  }

  // Add event listener for retailer orders tab
  const retailerOrdersTab = document.getElementById("retailerOrdersTab")
  if (retailerOrdersTab) {
    retailerOrdersTab.addEventListener("click", () => {
      loadRetailerOrders()
    })
  }
}

// Initialize event listeners
function initEventListeners() {
  // Customer Orders Tab Event Listeners

  // Status filter
  const statusFilters = document.querySelectorAll(".status-filter")
  statusFilters.forEach((filter) => {
    filter.addEventListener("click", function (e) {
      e.preventDefault()
      const status = this.getAttribute("data-status")
      currentFilters.status = status
      document.getElementById("statusFilter").innerHTML =
        `<i class="bi bi-funnel me-1"></i> Status: ${status.charAt(0).toUpperCase() + status.slice(1)}`
      loadOrders()
    })
  })

  // Date filter
  const dateFilters = document.querySelectorAll(".date-filter")
  dateFilters.forEach((filter) => {
    filter.addEventListener("click", function (e) {
      e.preventDefault()
      const range = this.getAttribute("data-range")
      currentFilters.dateRange = range

      // Update button text
      let buttonText = "All Time"
      if (range === "today") buttonText = "Today"
      if (range === "week") buttonText = "Last 7 Days"
      if (range === "month") buttonText = "Last 30 Days"
      if (range === "custom") buttonText = "Custom Range"

      document.getElementById("dateFilter").innerHTML = `<i class="bi bi-calendar3 me-1"></i> Date: ${buttonText}`

      // Show/hide date range picker
      const dateRangePicker = document.querySelector(".date-range-picker")
      if (range === "custom") {
        dateRangePicker.style.display = "block"
      } else {
        dateRangePicker.style.display = "none"
        loadOrders()
      }
    })
  })

  // Apply custom date range
  document.getElementById("applyDateRange").addEventListener("click", () => {
    const startDate = document.getElementById("dateRangeStart").value
    const endDate = document.getElementById("dateRangeEnd").value

    if (startDate && endDate) {
      currentFilters.startDate = startDate
      currentFilters.endDate = endDate
      loadOrders()
    } else {
      showAlert("warning", "Please select both start and end dates")
    }
  })

  // Search orders
  document.getElementById("searchBtn").addEventListener("click", () => {
    const searchTerm = document.getElementById("orderSearch").value.trim()
    currentFilters.search = searchTerm
    loadOrders()
  })

  // Search on Enter key
  document.getElementById("orderSearch").addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      e.preventDefault()
      document.getElementById("searchBtn").click()
    }
  })

  // Refresh button
  document.querySelectorAll(".refresh-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      // Show loading spinner
      const tableBody = document.getElementById("customer-orders-table-body")
      if (tableBody) {
        tableBody.innerHTML = `
          <tr>
            <td colspan="7" class="text-center py-4">
              <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
              </div>
              <p class="mt-2">Refreshing orders...</p>
            </td>
          </tr>
        `
      }

      // Simply reload orders
      loadOrders(true)
    })
  })

  // Export orders button
  document.getElementById("exportOrdersBtn").addEventListener("click", () => {
    exportOrders()
  })

  // Create order button
  const createOrderBtn = document.getElementById("createOrderBtn")
  if (createOrderBtn) {
    createOrderBtn.addEventListener("click", () => {
      console.log("Create order button clicked")

      // Reset form
      resetOrderForm()

      // Set modal title
      const modalLabel = document.getElementById("orderModalLabel")
      if (modalLabel) {
        modalLabel.textContent = "Create New Order"
      } else {
        console.error("Modal label element not found")
      }

      // Show modal
      const orderModal = document.getElementById("orderModal")
      if (orderModal) {
        try {
          const bsModal = new bootstrap.Modal(orderModal)
          bsModal.show()
        } catch (error) {
          console.error("Error showing modal:", error)
          showAlert("danger", "Error opening order form. Please try again.")
        }
      } else {
        console.error("Order modal element not found")
        showAlert("danger", "Order form not found. Please refresh the page and try again.")
      }
    })
  } else {
    console.error("Create order button not found")
  }

  // Order form submission
  const orderForm = document.getElementById("orderForm")
  if (orderForm) {
    orderForm.addEventListener("submit", (e) => {
      e.preventDefault()
      saveOrder()
    })
  }

  // Add item button in order form
  const addItemBtn = document.getElementById("addItemBtn")
  if (addItemBtn) {
    addItemBtn.addEventListener("click", addOrderItem)
  }

  // Retailer Orders Tab Event Listeners

  // Retailer status filter
  const retailerStatusFilters = document.querySelectorAll(".retailer-status-filter")
  retailerStatusFilters.forEach((filter) => {
    filter.addEventListener("click", function (e) {
      e.preventDefault()
      const status = this.getAttribute("data-status")
      retailerFilters.status = status
      document.getElementById("retailerStatusFilter").innerHTML =
        `<i class="bi bi-funnel me-1"></i> Status: ${status.charAt(0).toUpperCase() + status.slice(1)}`
      loadRetailerOrders()
    })
  })

  // Retailer search orders
  document.getElementById("retailerSearchBtn").addEventListener("click", () => {
    const searchTerm = document.getElementById("retailerOrderSearch").value.trim()
    retailerFilters.search = searchTerm
    loadRetailerOrders()
  })

  // Retailer search on Enter key
  document.getElementById("retailerOrderSearch").addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      e.preventDefault()
      document.getElementById("retailerSearchBtn").click()
    }
  })

  // Retailer refresh button
  document.querySelectorAll(".refresh-retailer-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      // Show loading spinner
      const tableBody = document.getElementById("retailer-orders-table-body")
      if (tableBody) {
        tableBody.innerHTML = `
          <tr>
            <td colspan="8" class="text-center py-4">
              <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
              </div>
              <p class="mt-2">Refreshing retailer orders...</p>
            </td>
          </tr>
        `
      }

      // Simply reload retailer orders
      loadRetailerOrders(true)
    })
  })

  // Export retailer orders button
  document.getElementById("exportRetailerOrdersBtn").addEventListener("click", () => {
    exportRetailerOrders()
  })

  // Remove the create retailer order button event listener since we're simplifying

  // Confirm delete button
  const confirmDeleteBtn = document.getElementById("confirmDeleteBtn")
  if (confirmDeleteBtn) {
    confirmDeleteBtn.addEventListener("click", () => {
      const orderId = document.getElementById("deleteOrderId").value
      if (orderId) {
        deleteRetailerOrder(orderId)
        const deleteOrderModal = bootstrap.Modal.getInstance(document.getElementById("deleteOrderModal"))
        if (deleteOrderModal) {
          deleteOrderModal.hide()
        }
      }
    })
  }

  // Load the order status handler script
  const script = document.createElement("script")
  script.src = "order-status-handler.js"
  document.head.appendChild(script)
}

// Load customer orders with current filters
function loadOrders(showLoading = true) {
  if (showLoading) {
    document.getElementById("customer-orders-table-body").innerHTML = `
      <tr>
        <td colspan="7" class="text-center py-4">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
          <p class="mt-2">Loading orders...</p>
        </td>
      </tr>
    `
  }

  // Build query string
  let queryString = `fetch_orders.php?page=${currentPage}&limit=${itemsPerPage}&status=${currentFilters.status}&date_range=${currentFilters.dateRange}`

  if (currentFilters.search) {
    queryString += `&search=${encodeURIComponent(currentFilters.search)}`
  }

  if (currentFilters.dateRange === "custom" && currentFilters.startDate && currentFilters.endDate) {
    queryString += `&start_date=${encodeURIComponent(currentFilters.startDate)}&end_date=${encodeURIComponent(currentFilters.endDate)}`
  }

  // Fetch orders
  fetch(queryString)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`)
      }
      return response.json()
    })
    .then((data) => {
      if (data.success) {
        currentOrders = data.orders
        totalPages = Math.ceil(data.total_count / itemsPerPage)

        // Update order stats
        if (data.stats) {
          updateOrderStats(data.stats)
        }

        // Render orders
        renderOrders(data.orders)

        // Update pagination
        renderPagination()

        // Update order count text
        document.getElementById("customerOrderCount").textContent =
          `Showing ${data.orders.length} of ${data.total_count} orders`
      } else {
        showAlert("danger", "Failed to load orders: " + (data.message || "Unknown error"))
        document.getElementById("customer-orders-table-body").innerHTML = `
          <tr>
            <td colspan="7" class="text-center py-4">
              <div class="text-danger">
                <i class="bi bi-exclamation-triangle-fill fs-1 mb-3"></i>
                <p>Error loading orders. Please try again.</p>
              </div>
            </td>
          </tr>
        `
      }
    })
    .catch((error) => {
      console.error("Error loading orders:", error)
      console.log("Current filters:", currentFilters)
      console.log("Current page:", currentPage)
      showAlert("danger", "Error loading orders. Please try again.")
      document.getElementById("customer-orders-table-body").innerHTML = `
        <tr>
          <td colspan="7" class="text-center py-4">
            <div class="text-danger">
              <i class="bi bi-exclamation-triangle-fill fs-1 mb-3"></i>
              <p>Error loading orders. Please try again.</p>
              <button class="btn btn-sm btn-outline-danger mt-2" onclick="loadOrders(true)">Retry</button>
            </div>
          </td>
        </tr>
      `
    })
}

// Render customer orders in the table
function renderOrders(orders) {
  const tableBody = document.getElementById("customer-orders-table-body")

  if (!orders || orders.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="7" class="text-center py-5">
          <i class="bi bi-inbox fs-1 text-muted mb-3"></i>
          <p class="text-muted">No orders found</p>
        </td>
      </tr>
    `
    return
  }

  let html = ""

  orders.forEach((order) => {
    // Format date
    const orderDate = new Date(order.order_date)
    const formattedDate = orderDate.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })

    // Status badge class
    let statusClass = ""
    switch (order.status) {
      case "pending":
        statusClass = "bg-warning text-dark"
        break
      case "processing":
        statusClass = "bg-info"
        break
      case "shipped":
        statusClass = "bg-primary"
        break
      case "delivered":
        statusClass = "bg-success"
        break
      case "cancelled":
        statusClass = "bg-danger"
        break
      default:
        statusClass = "bg-secondary"
    }

    html += `
      <tr>
        <td>
          <span class="fw-medium">${order.order_id}</span>
        </td>
        <td>
          <div class="fw-medium">${order.customer_name}</div>
          <div class="small text-muted">${order.customer_email || "No email"}</div>
        </td>
        <td>
          <div>${formattedDate}</div>
          <div class="small text-muted">${order.expected_delivery ? `Expected: ${new Date(order.expected_delivery).toLocaleDateString()}` : ""}</div>
        </td>
        <td>${order.item_count} item${order.item_count !== 1 ? "s" : ""}</td>
        <td class="fw-bold">₱${Number.parseFloat(order.total_amount).toFixed(2)}</td>
        <td>
          <span class="badge ${statusClass}">${order.status.charAt(0).toUpperCase() + order.status.slice(1)}</span>
        </td>
        <td>
          <div class="btn-group">
            <button type="button" class="btn btn-sm btn-outline-primary view-order-btn" data-id="${order.order_id}">
              <i class="bi bi-eye"></i>
            </button>
            <button type="button" class="btn btn-sm btn-outline-secondary edit-order-btn" data-id="${order.order_id}">
              <i class="bi bi-pencil"></i>
            </button>
            <button type="button" class="btn btn-sm btn-outline-danger delete-order-btn" data-id="${order.order_id}">
              <i class="bi bi-trash"></i>
            </button>
          </div>
        </td>
      </tr>
    `
  })

  tableBody.innerHTML = html

  // Add event listeners to action buttons
  document.querySelectorAll(".view-order-btn").forEach((btn) => {
    btn.addEventListener("click", function () {
      const orderId = this.getAttribute("data-id")
      viewOrder(orderId)
    })
  })

  document.querySelectorAll(".edit-order-btn").forEach((btn) => {
    btn.addEventListener("click", function () {
      const orderId = this.getAttribute("data-id")
      editOrder(orderId)
    })
  })

  document.querySelectorAll(".delete-order-btn").forEach((btn) => {
    btn.addEventListener("click", function () {
      const orderId = this.getAttribute("data-id")
      confirmDeleteOrder(orderId)
    })
  })
}

// Update order statistics
function updateOrderStats(stats) {
  if (!stats) return

  if (document.getElementById("totalOrdersCount")) {
    document.getElementById("totalOrdersCount").textContent = stats.total_orders || 0
  }

  if (document.getElementById("pendingOrdersCount")) {
    document.getElementById("pendingOrdersCount").textContent = stats.pending_orders || 0
  }

  if (document.getElementById("deliveredOrdersCount")) {
    document.getElementById("deliveredOrdersCount").textContent = stats.delivered_orders || 0
  }

  // Format total revenue
  if (document.getElementById("totalRevenue")) {
    const totalRevenue = Number.parseFloat(stats.total_revenue) || 0
    document.getElementById("totalRevenue").textContent = `₱${totalRevenue.toFixed(2)}`
  }

  // Growth percentage
  if (document.getElementById("totalOrdersGrowth")) {
    const growthElement = document.getElementById("totalOrdersGrowth")
    const growth = Number.parseFloat(stats.growth_percentage) || 0

    if (growth > 0) {
      growthElement.textContent = `+${growth}%`
      growthElement.parentElement.className = "text-success small"
      growthElement.parentElement.innerHTML = `<i class="bi bi-graph-up"></i> <span>+${growth}%</span>`
    } else if (growth < 0) {
      growthElement.textContent = `${growth}%`
      growthElement.parentElement.className = "text-danger small"
      growthElement.parentElement.innerHTML = `<i class="bi bi-graph-down"></i> <span>${growth}%</span>`
    } else {
      growthElement.textContent = `0%`
      growthElement.parentElement.className = "text-muted small"
      growthElement.parentElement.innerHTML = `<i class="bi bi-dash"></i> <span>0%</span>`
    }
  }
}

// Render pagination
function renderPagination() {
  const pagination = document.getElementById("customerOrdersPagination")
  if (!pagination) return

  pagination.innerHTML = ""

  if (totalPages <= 1) {
    return
  }

  // Previous button
  const prevLi = document.createElement("li")
  prevLi.className = `page-item ${currentPage === 1 ? "disabled" : ""}`
  prevLi.innerHTML = `<a class="page-link" href="#" aria-label="Previous"><span aria-hidden="true">&laquo;</span></a>`
  pagination.appendChild(prevLi)

  if (currentPage > 1) {
    prevLi.addEventListener("click", (e) => {
      e.preventDefault()
      currentPage--
      loadOrders()
    })
  }

  // Page numbers
  const maxPages = 5 // Maximum number of page links to show
  let startPage = Math.max(1, currentPage - Math.floor(maxPages / 2))
  const endPage = Math.min(totalPages, startPage + maxPages - 1)

  if (endPage - startPage + 1 < maxPages) {
    startPage = Math.max(1, endPage - maxPages + 1)
  }

  for (let i = startPage; i <= endPage; i++) {
    const pageLi = document.createElement("li")
    pageLi.className = `page-item ${i === currentPage ? "active" : ""}`
    pageLi.innerHTML = `<a class="page-link" href="#">${i}</a>`

    pageLi.addEventListener("click", (e) => {
      e.preventDefault()
      currentPage = i
      loadOrders()
    })

    pagination.appendChild(pageLi)
  }

  // Next button
  const nextLi = document.createElement("li")
  nextLi.className = `page-item ${currentPage === totalPages ? "disabled" : ""}`
  nextLi.innerHTML = `<a class="page-link" href="#" aria-label="Next"><span aria-hidden="true">&raquo;</span></a>`
  pagination.appendChild(nextLi)

  if (currentPage < totalPages) {
    nextLi.addEventListener("click", (e) => {
      e.preventDefault()
      currentPage++
      loadOrders()
    })
  }
}

// Export orders to CSV
function exportOrders() {
  // Show a loading indicator
  showAlert("info", "Preparing export file...")

  // Apply current filters
  let queryString = `export_orders.php?status=${currentFilters.status}&date_range=${currentFilters.dateRange}`

  if (currentFilters.search) {
    queryString += `&search=${encodeURIComponent(currentFilters.search)}`
  }

  if (currentFilters.dateRange === "custom" && currentFilters.startDate && currentFilters.endDate) {
    queryString += `&start_date=${encodeURIComponent(currentFilters.startDate)}&end_date=${encodeURIComponent(currentFilters.endDate)}`
  }

  // Get current date for filename
  const today = new Date()
  const dateString = today.toISOString().split("T")[0] // YYYY-MM-DD format

  // Create download link with a more descriptive filename
  const downloadLink = document.createElement("a")
  downloadLink.href = queryString
  downloadLink.download = `orders_${dateString}.csv`
  document.body.appendChild(downloadLink)
  downloadLink.click()
  document.body.removeChild(downloadLink)

  // Show success message after a short delay
  setTimeout(() => {
    showAlert("success", "Export completed successfully")
  }, 1000)
}

// View order details
function viewOrder(orderId) {
  // Show loading in modal
  const viewOrderModalBody = document.querySelector("#viewOrderModal .modal-body")
  if (viewOrderModalBody) {
    viewOrderModalBody.innerHTML = `
      <div class="text-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
        <p class="mt-3">Loading order details...</p>
      </div>
    `
  }

  // Show modal
  const viewOrderModal = new bootstrap.Modal(document.getElementById("viewOrderModal"))
  viewOrderModal.show()

  // Fetch order details
  fetch(`get_order_details.php?order_id=${orderId}`)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`)
      }
      return response.json()
    })
    .then((data) => {
      if (data.success) {
        renderOrderDetails(data.order, data.items)
      } else {
        viewOrderModalBody.innerHTML = `
          <div class="text-center py-5">
            <div class="text-danger">
              <i class="bi bi-exclamation-triangle-fill fs-1 mb-3"></i>
              <p>Error loading order details. Please try again.</p>
            </div>
          </div>
        `
      }
    })
    .catch((error) => {
      console.error("Error loading order details:", error)
      viewOrderModalBody.innerHTML = `
        <div class="text-center py-5">
          <div class="text-danger">
            <i class="bi bi-exclamation-triangle-fill fs-1 mb-3"></i>
            <p>Error loading order details. Please try again.</p>
          </div>
        </div>
      `
    })
}

// Render order details in the view modal
function renderOrderDetails(order, items) {
  const viewOrderModalBody = document.querySelector("#viewOrderModal .modal-body")
  if (!viewOrderModalBody) return

  // Format date
  const orderDate = new Date(order.order_date)
  const formattedDate = orderDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  // Status badge class
  let statusClass = ""
  switch (order.status) {
    case "pending":
      statusClass = "bg-warning text-dark"
      break
    case "processing":
      statusClass = "bg-info"
      break
    case "shipped":
      statusClass = "bg-primary"
      break
    case "delivered":
      statusClass = "bg-success"
      break
    case "cancelled":
      statusClass = "bg-danger"
      break
    default:
      statusClass = "bg-secondary"
  }

  // Build items table
  let itemsHtml = ""
  items.forEach((item, index) => {
    itemsHtml += `
      <tr>
        <td>${index + 1}</td>
        <td>
          <div class="fw-medium">${item.product_name}</div>
          <div class="small text-muted">${item.product_sku || "No SKU"}</div>
        </td>
        <td>${item.quantity}</td>
        <td>₱${Number.parseFloat(item.unit_price).toFixed(2)}</td>
        <td>₱${Number.parseFloat(item.subtotal).toFixed(2)}</td>
      </tr>
    `
  })

  // Set modal title
  document.getElementById("viewOrderModalLabel").textContent = `Order #${order.order_id}`

  // Build modal content
  viewOrderModalBody.innerHTML = `
    <div class="order-details">
      <div class="row mb-4">
        <div class="col-md-6">
          <h6 class="text-muted mb-2">Order Information</h6>
          <div class="card">
            <div class="card-body">
              <div class="mb-3">
                <div class="small text-muted">Order ID</div>
                <div>${order.order_id}</div>
              </div>
              <div class="mb-3">
                <div class="small text-muted">Order Date</div>
                <div>${formattedDate}</div>
              </div>
              <div class="mb-3">
                <div class="small text-muted">Status</div>
                <div><span class="badge ${statusClass}">${order.status.charAt(0).toUpperCase() + order.status.slice(1)}</span></div>
              </div>
              <div>
                <div class="small text-muted">Payment Method</div>
                <div>${order.payment_method || "Not specified"}</div>
              </div>
            </div>
          </div>
        </div>
        <div class="col-md-6">
          <h6 class="text-muted mb-2">Customer Information</h6>
          <div class="card">
            <div class="card-body">
              <div class="mb-3">
                <div class="small text-muted">Customer Name</div>
                <div>${order.customer_name}</div>
              </div>
              <div class="mb-3">
                <div class="small text-muted">Email</div>
                <div>${order.customer_email || "Not provided"}</div>
              </div>
              <div class="mb-3">
                <div class="small text-muted">Phone</div>
                <div>${order.customer_phone || "Not provided"}</div>
              </div>
              <div>
                <div class="small text-muted">Address</div>
                <div>${order.shipping_address || "Not provided"}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <h6 class="text-muted mb-2">Order Items</h6>
      <div class="card mb-4">
        <div class="card-body p-0">
          <div class="table-responsive">
            <table class="table table-hover mb-0">
              <thead class="table-light">
                <tr>
                  <th>#</th>
                  <th>Product</th>
                  <th>Quantity</th>
                  <th>Unit Price</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div class="row">
        <div class="col-md-6">
          <h6 class="text-muted mb-2">Notes</h6>
          <div class="card">
            <div class="card-body">
              <p class="mb-0">${order.notes || "No notes for this order."}</p>
            </div>
          </div>
        </div>
        <div class="col-md-6">
          <h6 class="text-muted mb-2">Order Summary</h6>
          <div class="card">
            <div class="card-body">
              <div class="d-flex justify-content-between mb-2">
                <span>Subtotal:</span>
                <span>₱${Number.parseFloat(order.subtotal).toFixed(2)}</span>
              </div>
              <div class="d-flex justify-content-between mb-2">
                <span>Tax:</span>
                <span>₱${Number.parseFloat(order.tax).toFixed(2)}</span>
              </div>
              <div class="d-flex justify-content-between mb-2">
                <span>Shipping:</span>
                <span>₱${Number.parseFloat(order.shipping_fee).toFixed(2)}</span>
              </div>
              <div class="d-flex justify-content-between mb-2">
                <span>Discount:</span>
                <span>-₱${Number.parseFloat(order.discount).toFixed(2)}</span>
              </div>
              <hr>
              <div class="d-flex justify-content-between fw-bold">
                <span>Total:</span>
                <span>₱${Number.parseFloat(order.total_amount).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
}

// Edit order
function editOrder(orderId) {
  // Reset form
  resetOrderForm()

  // Set modal title
  document.getElementById("orderModalLabel").textContent = "Edit Order"

  // Show loading in form
  const orderFormContent = document.getElementById("orderFormContent")
  if (orderFormContent) {
    orderFormContent.innerHTML = `
      <div class="text-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
        <p class="mt-3">Loading order data...</p>
      </div>
    `
  }

  // Show modal
  const orderModal = new bootstrap.Modal(document.getElementById("orderModal"))
  orderModal.show()

  // Fetch order details
  fetch(`get_order_details.php?order_id=${orderId}`)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`)
      }
      return response.json()
    })
    .then((data) => {
      if (data.success) {
        // Populate form with order data
        populateOrderForm(data.order, data.items)
      } else {
        orderFormContent.innerHTML = `
          <div class="text-center py-5">
            <div class="text-danger">
              <i class="bi bi-exclamation-triangle-fill fs-1 mb-3"></i>
              <p>Error loading order data. Please try again.</p>
            </div>
          </div>
        `
      }
    })
    .catch((error) => {
      console.error("Error loading order data:", error)
      orderFormContent.innerHTML = `
        <div class="text-center py-5">
          <div class="text-danger">
            <i class="bi bi-exclamation-triangle-fill fs-1 mb-3"></i>
            <p>Error loading order data. Please try again.</p>
          </div>
        </div>
      `
    })
}

// Populate order form with data
function populateOrderForm(order, items) {
  // Reset form content
  resetOrderForm()

  // Set order ID in hidden field
  document.getElementById("orderId").value = order.order_id

  // Customer information
  document.getElementById("customerName").value = order.customer_name
  document.getElementById("customerEmail").value = order.customer_email || ""
  document.getElementById("customerPhone").value = order.customer_phone || ""
  document.getElementById("shippingAddress").value = order.shipping_address || ""

  // Order information
  document.getElementById("orderDate").value = order.order_date.split(" ")[0] // Get just the date part
  document.getElementById("orderStatus").value = order.status
  document.getElementById("paymentMethod").value = order.payment_method || ""
  document.getElementById("orderNotes").value = order.notes || ""

  // Order items
  const itemsContainer = document.getElementById("orderItems")
  itemsContainer.innerHTML = "" // Clear existing items

  items.forEach((item, index) => {
    addOrderItemRow(item, index)
  })

  // Calculate totals
  calculateOrderTotals()
}

// Add order item row to form
function addOrderItemRow(item = null, index = null) {
  const itemsContainer = document.getElementById("orderItems")
  const rowIndex = index !== null ? index : itemsContainer.children.length

  const row = document.createElement("div")
  row.className = "order-item-row mb-3 p-3 border rounded"
  row.dataset.index = rowIndex

  row.innerHTML = `
    <div class="row g-2">
      <div class="col-md-5">
        <label class="form-label small">Product</label>
        <select class="form-select product-select" name="items[${rowIndex}][product_id]" required>
          <option value="">Select Product</option>
          <!-- Products will be loaded dynamically -->
        </select>
      </div>
      <div class="col-md-2">
        <label class="form-label small">Quantity</label>
        <input type="number" class="form-control item-quantity" name="items[${rowIndex}][quantity]" min="1" value="${item ? item.quantity : 1}" required>
      </div>
      <div class="col-md-2">
        <label class="form-label small">Unit Price</label>
        <input type="number" class="form-control item-price" name="items[${rowIndex}][unit_price]" step="0.01" min="0" value="${item ? item.unit_price : 0}" required>
      </div>
      <div class="col-md-2">
        <label class="form-label small">Subtotal</label>
        <input type="text" class="form-control item-subtotal" value="${item ? Number.parseFloat(item.subtotal).toFixed(2) : "0.00"}" readonly>
      </div>
      <div class="col-md-1 d-flex align-items-end">
        <button type="button" class="btn btn-outline-danger remove-item-btn" data-index="${rowIndex}">
          <i class="bi bi-trash"></i>
        </button>
      </div>
    </div>
  `

  itemsContainer.appendChild(row)

  // Load products for the select dropdown
  loadProductsForSelect(row.querySelector(".product-select"), item ? item.product_id : null)

  // Add event listeners for calculations
  const quantityInput = row.querySelector(".item-quantity")
  const priceInput = row.querySelector(".item-price")

  quantityInput.addEventListener("input", () => {
    updateItemSubtotal(row)
    calculateOrderTotals()
  })

  priceInput.addEventListener("input", () => {
    updateItemSubtotal(row)
    calculateOrderTotals()
  })

  // Add event listener for remove button
  const removeBtn = row.querySelector(".remove-item-btn")
  removeBtn.addEventListener("click", () => {
    row.remove()
    calculateOrderTotals()
  })
}

// Update item subtotal
function updateItemSubtotal(row) {
  const quantity = Number.parseFloat(row.querySelector(".item-quantity").value) || 0
  const price = Number.parseFloat(row.querySelector(".item-price").value) || 0
  const subtotal = quantity * price

  row.querySelector(".item-subtotal").value = subtotal.toFixed(2)
}

// Calculate order totals
function calculateOrderTotals() {
  const itemRows = document.querySelectorAll(".order-item-row")
  let subtotal = 0

  itemRows.forEach((row) => {
    subtotal += Number.parseFloat(row.querySelector(".item-subtotal").value) || 0
  })

  // Get tax rate and shipping fee
  const taxRate = Number.parseFloat(document.getElementById("taxRate").value) || 0
  const shippingFee = Number.parseFloat(document.getElementById("shippingFee").value) || 0
  const discount = Number.parseFloat(document.getElementById("discount").value) || 0

  // Calculate tax amount
  const taxAmount = subtotal * (taxRate / 100)

  // Calculate total
  const total = subtotal + taxAmount + shippingFee - discount

  // Update form fields
  document.getElementById("subtotal").value = subtotal.toFixed(2)
  document.getElementById("taxAmount").value = taxAmount.toFixed(2)
  document.getElementById("total").value = total.toFixed(2)
}

// Load products for select dropdown
function loadProductsForSelect(selectElement, selectedProductId = null) {
  // Fetch products from server
  fetch("get_products.php")
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`)
      }
      return response.json()
    })
    .then((data) => {
      if (data.success) {
        // Clear existing options except the first one
        selectElement.innerHTML = '<option value="">Select Product</option>'

        // Add product options
        data.products.forEach((product) => {
          const option = document.createElement("option")
          option.value = product.product_id
          option.textContent = `${product.product_name} (₱${Number.parseFloat(product.price).toFixed(2)})`
          option.dataset.price = product.price

          if (selectedProductId && product.product_id == selectedProductId) {
            option.selected = true
          }

          selectElement.appendChild(option)
        })

        // Add change event listener
        selectElement.addEventListener("change", function () {
          const selectedOption = this.options[this.selectedIndex]
          const price = selectedOption.dataset.price || 0

          // Update price field
          const row = this.closest(".order-item-row")
          row.querySelector(".item-price").value = price

          // Update subtotal
          updateItemSubtotal(row)
          calculateOrderTotals()
        })
      } else {
        console.error("Failed to load products:", data.message)
      }
    })
    .catch((error) => {
      console.error("Error loading products:", error)
    })
}

// Add new order item
function addOrderItem() {
  addOrderItemRow()
}

// Reset order form
function resetOrderForm() {
  const orderForm = document.getElementById("orderForm")
  if (orderForm) {
    orderForm.reset()

    // Clear order ID
    document.getElementById("orderId").value = ""

    // Set default date to today
    const today = new Date().toISOString().split("T")[0]
    document.getElementById("orderDate").value = today

    // Clear order items
    document.getElementById("orderItems").innerHTML = ""

    // Add one empty item row
    addOrderItemRow()

    // Reset totals
    document.getElementById("subtotal").value = "0.00"
    document.getElementById("taxAmount").value = "0.00"
    document.getElementById("total").value = "0.00"

    // Reset form content
    const orderFormContent = document.getElementById("orderFormContent")
    if (orderFormContent) {
      orderFormContent.innerHTML = `
        <div class="row mb-3">
          <div class="col-md-6">
            <h6 class="mb-3">Customer Information</h6>
            <div class="mb-3">
              <label for="customerName" class="form-label">Customer Name</label>
              <input type="text" class="form-control" id="customerName" name="customer_name" required>
            </div>
            <div class="mb-3">
              <label for="customerEmail" class="form-label">Email</label>
              <input type="email" class="form-control" id="customerEmail" name="customer_email">
            </div>
            <div class="mb-3">
              <label for="customerPhone" class="form-label">Phone</label>
              <input type="text" class="form-control" id="customerPhone" name="customer_phone">
            </div>
            <div class="mb-3">
              <label for="shippingAddress" class="form-label">Shipping Address</label>
              <textarea class="form-control" id="shippingAddress" name="shipping_address" rows="3"></textarea>
            </div>
          </div>
          <div class="col-md-6">
            <h6 class="mb-3">Order Information</h6>
            <div class="mb-3">
              <label for="orderDate" class="form-label">Order Date</label>
              <input type="date" class="form-control" id="orderDate" name="order_date" required>
            </div>
            <div class="mb-3">
              <label for="orderStatus" class="form-label">Status</label>
              <select class="form-select" id="orderStatus" name="status" required>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div class="mb-3">
              <label for="paymentMethod" class="form-label">Payment Method</label>
              <select class="form-select" id="paymentMethod" name="payment_method">
                <option value="cash">Cash</option>
                <option value="credit_card">Credit Card</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="gcash">GCash</option>
                <option value="maya">Maya</option>
              </select>
            </div>
            <div class="mb-3">
              <label for="orderNotes" class="form-label">Notes</label>
              <textarea class="form-control" id="orderNotes" name="notes" rows="3"></textarea>
            </div>
          </div>
        </div>
        
        <h6 class="mb-3">Order Items</h6>
        <div id="orderItems" class="mb-3">
          <!-- Order items will be added here -->
        </div>
        
        <div class="text-end mb-3">
          <button type="button" class="btn btn-outline-primary" id="addItemBtn">
            <i class="bi bi-plus-circle me-1"></i> Add Item
          </button>
        </div>
        
        <div class="row">
          <div class="col-md-6">
            <!-- Empty column for spacing -->
          </div>
          <div class="col-md-6">
            <div class="card">
              <div class="card-body">
                <h6 class="card-title">Order Summary</h6>
                <div class="mb-3">
                  <div class="row g-2 align-items-center">
                    <div class="col-6">
                      <label for="subtotal" class="col-form-label">Subtotal:</label>
                    </div>
                    <div class="col-6">
                      <div class="input-group">
                        <span class="input-group-text">₱</span>
                        <input type="text" class="form-control text-end" id="subtotal" name="subtotal" value="0.00" readonly>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="mb-3">
                  <div class="row g-2 align-items-center">
                    <div class="col-6">
                      <label for="taxRate" class="col-form-label">Tax Rate (%):</label>
                    </div>
                    <div class="col-6">
                      <div class="input-group">
                        <input type="number" class="form-control text-end" id="taxRate" name="tax_rate" value="12" min="0" step="0.01">
                        <span class="input-group-text">%</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="mb-3">
                  <div class="row g-2 align-items-center">
                    <div class="col-6">
                      <label for="taxAmount" class="col-form-label">Tax Amount:</label>
                    </div>
                    <div class="col-6">
                      <div class="input-group">
                        <span class="input-group-text">₱</span>
                        <input type="text" class="form-control text-end" id="taxAmount" name="tax" value="0.00" readonly>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="mb-3">
                  <div class="row g-2 align-items-center">
                    <div class="col-6">
                      <label for="shippingFee" class="col-form-label">Shipping Fee:</label>
                    </div>
                    <div class="col-6">
                      <div class="input-group">
                        <span class="input-group-text">₱</span>
                        <input type="number" class="form-control text-end" id="shippingFee" name="shipping_fee" value="0" min="0" step="0.01">
                      </div>
                    </div>
                  </div>
                </div>
                <div class="mb-3">
                  <div class="row g-2 align-items-center">
                    <div class="col-6">
                      <label for="discount" class="col-form-label">Discount:</label>
                    </div>
                    <div class="col-6">
                      <div class="input-group">
                        <span class="input-group-text">₱</span>
                        <input type="number" class="form-control text-end" id="discount" name="discount" value="0" min="0" step="0.01">
                      </div>
                    </div>
                  </div>
                </div>
                <hr>
                <div class="mb-3">
                  <div class="row g-2 align-items-center">
                    <div class="col-6">
                      <label for="total" class="col-form-label fw-bold">Total:</label>
                    </div>
                    <div class="col-6">
                      <div class="input-group">
                        <span class="input-group-text">₱</span>
                        <input type="text" class="form-control text-end fw-bold" id="total" name="total_amount" value="0.00" readonly>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      `

      // Re-add event listeners
      const addItemBtn = document.getElementById("addItemBtn")
      if (addItemBtn) {
        addItemBtn.addEventListener("click", addOrderItem)
      }

      // Add event listeners for tax rate, shipping fee, and discount
      const taxRateInput = document.getElementById("taxRate")
      const shippingFeeInput = document.getElementById("shippingFee")
      const discountInput = document.getElementById("discount")

      if (taxRateInput) {
        taxRateInput.addEventListener("input", calculateOrderTotals)
      }
      if (shippingFeeInput) {
        shippingFeeInput.addEventListener("input", calculateOrderTotals)
      }
      if (discountInput) {
        discountInput.addEventListener("input", calculateOrderTotals)
      }
    }
  }
}

// Save order
function saveOrder() {
  // Show loading indicator
  const saveBtn = document.querySelector("#orderForm button[type='submit']")
  const originalBtnText = saveBtn.innerHTML
  saveBtn.disabled = true
  saveBtn.innerHTML = `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Saving...`

  // Get form data
  const formData = new FormData(document.getElementById("orderForm"))

  // Send to server
  fetch("save_order.php", {
    method: "POST",
    body: formData,
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`)
      }
      return response.json()
    })
    .then((data) => {
      if (data.success) {
        // Close modal
        const orderModalElement = document.getElementById("orderModal")
        if (orderModalElement) {
          const orderModal = bootstrap.Modal.getInstance(orderModalElement)
          if (orderModal) {
            orderModal.hide()
          } else {
            console.warn("Order modal instance not found.")
          }
        } else {
          console.warn("Order modal element not found.")
        }

        // Show success message
        showAlert("success", data.message || "Order saved successfully")

        // Reload orders
        loadOrders()
      } else {
        // Show error message
        showAlert("danger", data.message || "Failed to save order")

        // Reset button
        saveBtn.disabled = false
        saveBtn.innerHTML = originalBtnText
      }
    })
    .catch((error) => {
      console.error("Error saving order:", error)
      showAlert("danger", "Error saving order. Please try again.")

      // Reset button
      saveBtn.disabled = false
      saveBtn.innerHTML = originalBtnText
    })
}

// Confirm delete order
function confirmDeleteOrder(orderId) {
  // Set order ID in hidden field
  document.getElementById("deleteOrderId").value = orderId

  // Show confirmation modal
  const deleteOrderModal = new bootstrap.Modal(document.getElementById("deleteOrderModal"))
  deleteOrderModal.show()

  // Add event listener to delete button
  document.getElementById("confirmDeleteBtn").onclick = () => {
    deleteOrder(orderId)
    deleteOrderModal.hide()
  }
}

// Delete order
function deleteOrder(orderId) {
  // Show loading indicator
  showAlert("info", "Deleting order...")

  // Send delete request
  fetch(`delete_order.php?order_id=${orderId}`)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`)
      }
      return response.json()
    })
    .then((data) => {
      if (data.success) {
        // Show success message
        showAlert("success", data.message || "Order deleted successfully")

        // Reload orders
        loadOrders()
      } else {
        // Show error message
        showAlert("danger", data.message || "Failed to delete order")
      }
    })
    .catch((error) => {
      console.error("Error deleting order:", error)
      showAlert("danger", "Error deleting order. Please try again.")
    })
}

// Load retailer orders with current filters
function loadRetailerOrders(showLoading = true) {
  if (showLoading) {
    document.getElementById("retailer-orders-table-body").innerHTML = `
      <tr>
        <td colspan="8" class="text-center py-4">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
          <p class="mt-2">Loading retailer orders...</p>
        </td>
      </tr>
    `
  }

  // Build query string
  let queryString = `fetch_retailer_orders.php?page=${retailerCurrentPage}&limit=${itemsPerPage}&status=${retailerFilters.status}`

  if (retailerFilters.search) {
    queryString += `&search=${encodeURIComponent(retailerFilters.search)}`
  }

  console.log("Fetching retailer orders with URL:", queryString)

  // Fetch retailer orders
  fetch(queryString)
    .then((response) => {
      console.log("Response status:", response.status)
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`)
      }
      return response.json()
    })
    .then((data) => {
      console.log("Received data:", data)
      if (data.success) {
        currentRetailerOrders = data.orders
        retailerTotalPages = Math.ceil(data.total_count / itemsPerPage)

        // Render retailer orders
        renderRetailerOrders(data.orders)

        // Update pagination
        renderRetailerPagination()

        // Update retailer order count text
        document.getElementById("retailerOrderCount").textContent =
          `Showing ${data.orders.length} of ${data.total_count} retailer orders`

        // Update retailer order stats if available
        if (data.stats) {
          updateRetailerOrderStats(data.stats)
        }
      } else {
        showAlert("danger", "Failed to load retailer orders: " + (data.message || "Unknown error"))
        document.getElementById("retailer-orders-table-body").innerHTML = `
          <tr>
            <td colspan="8" class="text-center py-4">
              <div class="text-danger">
                <i class="bi bi-exclamation-triangle-fill fs-1 mb-3"></i>
                <p>Error loading retailer orders. Please try again.</p>
              </div>
            </td>
          </tr>
        `
      }
    })
    .catch((error) => {
      console.error("Error loading retailer orders:", error)
      showAlert("danger", "Error loading retailer orders. Please try again.")
      document.getElementById("retailer-orders-table-body").innerHTML = `
        <tr>
          <td colspan="8" class="text-center py-4">
            <div class="text-danger">
              <i class="bi bi-exclamation-triangle-fill fs-1 mb-3"></i>
              <p>Error loading retailer orders. Please try again.</p>
              <button class="btn btn-sm btn-outline-danger mt-2" onclick="loadRetailerOrders(true)">Retry</button>
            </div>
          </td>
        </tr>
      `
    })
}

// Function to render retailer orders in the table with delivery/pickup specific actions
function renderRetailerOrders(orders) {
  const tableBody = document.getElementById("retailer-orders-table-body")

  if (!orders || orders.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="8" class="text-center py-5">
          <i class="bi bi-inbox fs-1 text-muted mb-3"></i>
          <p class="text-muted">No retailer orders found</p>
        </td>
      </tr>
    `
    return
  }

  let html = ""

  orders.forEach((order) => {
    // Format date
    const orderDate = new Date(order.order_date)
    const formattedDate = orderDate.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })

    // Status badge class
    let statusClass = ""
    switch (order.status) {
      case "order":
        statusClass = "bg-warning text-dark"
        break
      case "confirmed":
        statusClass = "bg-success"
        break
      case "shipped":
      case "ready":
        statusClass = "bg-primary"
        break
      case "delivered":
      case "picked up":
        statusClass = "bg-info"
        break
      case "cancelled":
        statusClass = "bg-danger"
        break
      default:
        statusClass = "bg-secondary"
    }

    // Simplified action buttons - only View and Confirm Order
    const actionButtons = `
      <button type="button" class="btn btn-sm btn-outline-primary view-retailer-order-btn" data-id="${order.order_id}" title="View Order">
        <i class="bi bi-eye"></i>
      </button>
      ${
        order.status === "order"
          ? `
      <button type="button" class="btn btn-sm btn-outline-success confirm-order-btn" data-id="${order.order_id}" title="Confirm Order">
        <i class="bi bi-check-circle"></i>
      </button>
      `
          : ""
      }
    `

    html += `
      <tr>
        <td>
          <span class="fw-medium">${order.order_id}</span>
        </td>
        <td>
          <span class="fw-medium">${order.po_number || "N/A"}</span>
        </td>
        <td>
          <div class="fw-medium">${order.retailer_name}</div>
          <div class="small text-muted">${order.retailer_email || "No email"}</div>
        </td>
        <td>
          <div>${formattedDate}</div>
          <div class="small text-muted">${order.expected_delivery ? `Expected: ${new Date(order.expected_delivery).toLocaleDateString()}` : ""}</div>
        </td>
        <td>${order.item_count} item${order.item_count !== 1 ? "s" : ""}</td>
        <td class="fw-bold">₱${Number.parseFloat(order.total_amount).toFixed(2)}</td>
        <td class="status-cell" data-order-id="${order.order_id}">
          <span class="badge ${statusClass}">${order.status.charAt(0).toUpperCase() + order.status.slice(1)}</span>
          ${order.delivery_mode ? `<span class="badge bg-info ms-1">${order.delivery_mode.charAt(0).toUpperCase() + order.delivery_mode.slice(1)}</span>` : ""}
        </td>
        <td>
          <div class="btn-group">
            ${actionButtons}
          </div>
        </td>
      </tr>
    `
  })

  tableBody.innerHTML = html

  // Add event listeners to action buttons
  document.querySelectorAll(".view-retailer-order-btn").forEach((btn) => {
    btn.addEventListener("click", function () {
      const orderId = this.getAttribute("data-id")
      viewRetailerOrder(orderId)
    })
  })

  // Add event listeners for confirm order buttons
  document.querySelectorAll(".confirm-order-btn").forEach((btn) => {
    btn.addEventListener("click", function () {
      const orderId = this.getAttribute("data-id")
      confirmOrder(orderId)
    })
  })
}

// Update the confirmOrder function to use a modal instead of a browser confirm dialog
function confirmOrder(orderId) {
  // Set the order ID in the hidden field
  document.getElementById("confirmOrderId").value = orderId

  // Show the confirmation modal
  const confirmModal = new bootstrap.Modal(document.getElementById("confirmOrderModal"))
  confirmModal.show()

  // Add event listener to the confirm button
  document.getElementById("processConfirmOrderBtn").onclick = () => {
    processOrderConfirmation(orderId)
    confirmModal.hide()
  }
}

// Add a new function to process the order confirmation
function processOrderConfirmation(orderId) {
  // Show loading indicator
  showAlert("info", `Confirming order #${orderId}...`)

  // Create form data
  const formData = new FormData()
  formData.append("order_id", orderId)
  formData.append("status", "confirmed")

  // Send request to update status
  fetch("update_order_status.php", {
    method: "POST",
    body: formData,
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`)
      }
      return response.json()
    })
    .then((data) => {
      if (data.success) {
        showAlert("success", "Order confirmed successfully")

        // Update the status display in the table
        const statusCell = document.querySelector(`.status-cell[data-order-id="${orderId}"]`)
        if (statusCell) {
          statusCell.innerHTML = `<span class="badge bg-success">Confirmed</span>`
        }

        // Refresh orders list
        loadRetailerOrders()
      } else {
        showAlert("danger", data.message || "Failed to confirm order")
      }
    })
    .catch((error) => {
      console.error("Error confirming order:", error)
      showAlert("danger", "Error confirming order. Please try again.")
    })
}

// Update retailer order statistics
function updateRetailerOrderStats(stats) {
  if (!stats) return

  if (document.getElementById("totalRetailerOrdersCount")) {
    document.getElementById("totalRetailerOrdersCount").textContent = stats.total_orders || 0
  }

  if (document.getElementById("pendingRetailerOrdersCount")) {
    document.getElementById("pendingRetailerOrdersCount").textContent = stats.pending_orders || 0
  }

  if (document.getElementById("confirmedRetailerOrdersCount")) {
    document.getElementById("confirmedRetailerOrdersCount").textContent = stats.confirmed_orders || 0
  }

  // Format total revenue
  if (document.getElementById("totalRetailerRevenue")) {
    const totalRevenue = Number.parseFloat(stats.total_revenue) || 0
    document.getElementById("totalRetailerRevenue").textContent = `₱${totalRevenue.toFixed(2)}`
  }

  // Growth percentage
  if (document.getElementById("totalRetailerOrdersGrowth")) {
    const growthElement = document.getElementById("totalRetailerOrdersGrowth")
    const growth = Number.parseFloat(stats.growth_percentage) || 0

    if (growth > 0) {
      growthElement.textContent = `+${growth}%`
      growthElement.parentElement.className = "text-success small"
      growthElement.parentElement.innerHTML = `<i class="bi bi-graph-up"></i> <span>+${growth}%</span>`
    } else if (growth < 0) {
      growthElement.textContent = `${growth}%`
      growthElement.parentElement.className = "text-danger small"
      growthElement.parentElement.innerHTML = `<i class="bi bi-graph-down"></i> <span>${growth}%</span>`
    } else {
      growthElement.textContent = `0%`
      growthElement.parentElement.className = "text-muted small"
      growthElement.parentElement.innerHTML = `<i class="bi bi-dash"></i> <span>0%</span>`
    }
  }
}

// Render retailer pagination
function renderRetailerPagination() {
  const pagination = document.getElementById("retailerOrdersPagination")
  if (!pagination) return

  pagination.innerHTML = ""

  if (retailerTotalPages <= 1) {
    return
  }

  // Previous button
  const prevLi = document.createElement("li")
  prevLi.className = `page-item ${retailerCurrentPage === 1 ? "disabled" : ""}`
  prevLi.innerHTML = `<a class="page-link" href="#" aria-label="Previous"><span aria-hidden="true">&laquo;</span></a>`
  pagination.appendChild(prevLi)

  if (retailerCurrentPage > 1) {
    prevLi.addEventListener("click", (e) => {
      e.preventDefault()
      retailerCurrentPage--
      loadRetailerOrders()
    })
  }

  // Page numbers
  const maxPages = 5 // Maximum number of page links to show
  let startPage = Math.max(1, retailerCurrentPage - Math.floor(maxPages / 2))
  const endPage = Math.min(retailerTotalPages, startPage + maxPages - 1)

  if (endPage - startPage + 1 < maxPages) {
    startPage = Math.max(1, endPage - maxPages + 1)
  }

  for (let i = startPage; i <= endPage; i++) {
    const pageLi = document.createElement("li")
    pageLi.className = `page-item ${i === retailerCurrentPage ? "active" : ""}`
    pageLi.innerHTML = `<a class="page-link" href="#">${i}</a>`

    pageLi.addEventListener("click", (e) => {
      e.preventDefault()
      retailerCurrentPage = i
      loadRetailerOrders()
    })

    pagination.appendChild(pageLi)
  }

  // Next button
  const nextLi = document.createElement("li")
  nextLi.className = `page-item ${retailerCurrentPage === retailerTotalPages ? "disabled" : ""}`
  nextLi.innerHTML = `<a class="page-link" href="#" aria-label="Next"><span aria-hidden="true">&raquo;</span></a>`
  pagination.appendChild(nextLi)

  if (retailerCurrentPage < retailerTotalPages) {
    nextLi.addEventListener("click", (e) => {
      e.preventDefault()
      retailerCurrentPage++
      loadRetailerOrders()
    })
  }
}

// View retailer order details
function viewRetailerOrder(orderId) {
  // Show loading in modal
  const viewOrderModalBody = document.querySelector("#viewOrderModal .modal-body")
  if (viewOrderModalBody) {
    viewOrderModalBody.innerHTML = `
      <div class="text-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
        <p class="mt-3">Loading retailer order details...</p>
      </div>
    `
  }

  // Show modal
  const viewOrderModal = new bootstrap.Modal(document.getElementById("viewOrderModal"))
  viewOrderModal.show()

  // Fetch retailer order details
  fetch(`get_retailer_order_details.php?order_id=${orderId}`)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`)
      }
      return response.json()
    })
    .then((data) => {
      if (data.success) {
        renderRetailerOrderDetails(data.order, data.items)
      } else {
        viewOrderModalBody.innerHTML = `
          <div class="text-center py-5">
            <div class="text-danger">
              <i class="bi bi-exclamation-triangle-fill fs-1 mb-3"></i>
              <p>Error loading retailer order details. Please try again.</p>
            </div>
          </div>
        `
      }
    })
    .catch((error) => {
      console.error("Error loading retailer order details:", error)
      viewOrderModalBody.innerHTML = `
        <div class="text-center py-5">
          <div class="text-danger">
            <i class="bi bi-exclamation-triangle-fill fs-1 mb-3"></i>
            <p>Error loading retailer order details. Please try again.</p>
          </div>
        </div>
      `
    })
}

// Render retailer order details in the view modal
function renderRetailerOrderDetails(order, items) {
  const viewOrderModalBody = document.querySelector("#viewOrderModal .modal-body")
  if (!viewOrderModalBody) return

  // Format date
  const orderDate = new Date(order.order_date)
  const formattedDate = orderDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  // Status badge class
  let statusClass = ""
  switch (order.status) {
    case "order":
      statusClass = "bg-warning text-dark"
      break
    case "confirmed":
      statusClass = "bg-success"
      break
    default:
      statusClass = "bg-secondary"
  }

  // Build items table
  let itemsHtml = ""
  items.forEach((item, index) => {
    itemsHtml += `
      <tr>
        <td>${index + 1}</td>
        <td>
          <div class="fw-medium">${item.product_name}</div>
          <div class="small text-muted">${item.product_sku || "No SKU"}</div>
        </td>
        <td>${item.quantity}</td>
        <td>₱${Number.parseFloat(item.unit_price).toFixed(2)}</td>
        <td>₱${Number.parseFloat(item.subtotal).toFixed(2)}</td>
      </tr>
    `
  })

  // Set modal title
  document.getElementById("viewOrderModalLabel").textContent = `Retailer Order #${order.order_id}`

  // Build modal content
  viewOrderModalBody.innerHTML = `
    <div class="order-details">
      <div class="row mb-4">
        <div class="col-md-6">
          <h6 class="text-muted mb-2">Order Information</h6>
          <div class="card">
            <div class="card-body">
              <div class="mb-3">
                <div class="small text-muted">Order ID</div>
                <div>${order.order_id}</div>
              </div>
              <div class="mb-3">
                <div class="small text-muted">PO Number</div>
                <div>${order.po_number || "N/A"}</div>
              </div>
              <div class="mb-3">
                <div class="small text-muted">Order Date</div>
                <div>${formattedDate}</div>
              </div>
              <div class="mb-3">
                <div class="small text-muted">Status</div>
                <div><span class="badge ${statusClass}">${order.status.charAt(0).toUpperCase() + order.status.slice(1)}</span></div>
              </div>
              <div>
                <div class="small text-muted">Delivery Mode</div>
                <div>${order.delivery_mode || "Not specified"}</div>
              </div>
            </div>
          </div>
        </div>
        <div class="col-md-6">
          <h6 class="text-muted mb-2">Retailer Information</h6>
          <div class="card">
            <div class="card-body">
              <div class="mb-3">
                <div class="small text-muted">Retailer Name</div>
                <div>${order.retailer_name}</div>
              </div>
              <div class="mb-3">
                <div class="small text-muted">Email</div>
                <div>${order.retailer_email || "Not provided"}</div>
              </div>
              <div class="mb-3">
                <div class="small text-muted">Contact</div>
                <div>${order.retailer_contact || "Not provided"}</div>
              </div>
              <div>
                <div class="small text-muted">Pickup Location</div>
                <div>${order.pickup_location || "Not provided"}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <h6 class="text-muted mb-2">Order Items</h6>
      <div class="card mb-4">
        <div class="card-body p-0">
          <div class="table-responsive">
            <table class="table table-hover mb-0">
              <thead class="table-light">
                <tr>
                  <th>#</th>
                  <th>Product</th>
                  <th>Quantity</th>
                  <th>Unit Price</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div class="row">
        <div class="col-md-6">
          <h6 class="text-muted mb-2">Notes</h6>
          <div class="card">
            <div class="card-body">
              <p class="mb-0">${order.notes || "No notes for this order."}</p>
            </div>
          </div>
        </div>
        <div class="col-md-6">
          <h6 class="text-muted mb-2">Order Summary</h6>
          <div class="card">
            <div class="card-body">
              <div class="d-flex justify-content-between mb-2">
                <span>Subtotal:</span>
                <span>₱${Number.parseFloat(order.subtotal).toFixed(2)}</span>
              </div>
              <div class="d-flex justify-content-between mb-2">
                <span>Tax:</span>
                <span>₱${Number.parseFloat(order.tax).toFixed(2)}</span>
              </div>
              <div class="d-flex justify-content-between mb-2">
                <span>Discount:</span>
                <span>-₱${Number.parseFloat(order.discount).toFixed(2)}</span>
              </div>
              <hr>
              <div class="d-flex justify-content-between fw-bold">
                <span>Total:</span>
                <span>₱${Number.parseFloat(order.total_amount).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
}

// Edit retailer order
function editRetailerOrder(orderId) {
  // Reset form
  resetRetailerOrderForm()

  // Set modal title
  document.getElementById("retailerOrderModalLabel").textContent = "Edit Retailer Order"

  // Show loading in form
  const orderFormContent = document.getElementById("retailerOrderFormContent")
  if (orderFormContent) {
    orderFormContent.innerHTML = `
      <div class="text-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
        <p class="mt-3">Loading order data...</p>
      </div>
    `
  }

  // Show modal
  const orderModal = new bootstrap.Modal(document.getElementById("retailerOrderModal"))
  orderModal.show()

  // Fetch order details
  fetch(`get_retailer_order_details.php?order_id=${orderId}`)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`)
      }
      return response.json()
    })
    .then((data) => {
      if (data.success) {
        // Populate form with order data
        populateRetailerOrderForm(data.order, data.items)
      } else {
        orderFormContent.innerHTML = `
          <div class="text-center py-5">
            <div class="text-danger">
              <i class="bi bi-exclamation-triangle-fill fs-1 mb-3"></i>
              <p>Error loading order data. Please try again.</p>
            </div>
          </div>
        `
      }
    })
    .catch((error) => {
      console.error("Error loading order data:", error)
      orderFormContent.innerHTML = `
        <div class="text-center py-5">
          <div class="text-danger">
            <i class="bi bi-exclamation-triangle-fill fs-1 mb-3"></i>
            <p>Error loading order data. Please try again.</p>
          </div>
        </div>
      `
    })
}

// Populate retailer order form with data
function populateRetailerOrderForm(order, items) {
  // Reset form content
  resetRetailerOrderForm()

  // Set order ID in hidden field
  document.getElementById("retailerOrderId").value = order.order_id

  // Retailer information
  document.getElementById("retailerName").value = order.retailer_name
  document.getElementById("retailerEmail").value = order.retailer_email || ""
  document.getElementById("retailerContact").value = order.retailer_contact || ""
  document.getElementById("poNumber").value = order.po_number || ""

  // Order information
  document.getElementById("orderDate").value = order.order_date.split(" ")[0] // Get just the date part
  document.getElementById("expectedDelivery").value = order.expected_delivery
    ? order.expected_delivery.split(" ")[0]
    : ""
  document.getElementById("orderStatus").value = order.status
  document.getElementById("deliveryMode").value = order.delivery_mode || ""
  document.getElementById("pickupLocation").value = order.pickup_location || ""
  document.getElementById("orderNotes").value = order.notes || ""

  // Order items
  const itemsContainer = document.getElementById("orderItems")
  itemsContainer.innerHTML = "" // Clear existing items

  items.forEach((item, index) => {
    addOrderItemRowFunc(item, index)
  })

  // Calculate totals
  calculateOrderTotalsFunc()
}

// Add order item row to form
const addOrderItemRowFunc = (item = null, index = null) => {
  const itemsContainer = document.getElementById("orderItems")
  const rowIndex = index !== null ? index : itemsContainer.children.length

  const row = document.createElement("div")
  row.className = "order-item-row mb-3 p-3 border rounded"
  row.dataset.index = rowIndex

  row.innerHTML = `
    <div class="row g-2">
      <div class="col-md-5">
        <label class="form-label small">Product</label>
        <select class="form-select product-select" name="items[${rowIndex}][product_id]" required>
          <option value="">Select Product</option>
          <!-- Products will be loaded dynamically -->
        </select>
      </div>
      <div class="col-md-2">
        <label class="form-label small">Quantity</label>
        <input type="number" class="form-control item-quantity" name="items[${rowIndex}][quantity]" min="1" value="${item ? item.quantity : 1}" required>
      </div>
      <div class="col-md-2">
        <label class="form-label small">Unit Price</label>
        <input type="number" class="form-control item-price" name="items[${rowIndex}][unit_price]" step="0.01" min="0" value="${item ? item.unit_price : 0}" required>
      </div>
      <div class="col-md-2">
        <label class="form-label small">Subtotal</label>
        <input type="text" class="form-control item-subtotal" value="${item ? Number.parseFloat(item.subtotal).toFixed(2) : "0.00"}" readonly>
      </div>
      <div class="col-md-1 d-flex align-items-end">
        <button type="button" class="btn btn-outline-danger remove-item-btn" data-index="${rowIndex}">
          <i class="bi bi-trash"></i>
        </button>
      </div>
    </div>
  `

  itemsContainer.appendChild(row)

  // Load products for the select dropdown
  loadProductsForSelectInner(row.querySelector(".product-select"), item ? item.product_id : null)

  // Add event listeners for calculations
  const quantityInput = row.querySelector(".item-quantity")
  const priceInput = row.querySelector(".item-price")

  quantityInput.addEventListener("input", () => {
    updateItemSubtotalFunc(row)
    calculateOrderTotalsFunc()
  })

  priceInput.addEventListener("input", () => {
    updateItemSubtotalFunc(row)
    calculateOrderTotalsFunc()
  })

  // Add event listener for remove button
  const removeBtn = row.querySelector(".remove-item-btn")
  removeBtn.addEventListener("click", () => {
    row.remove()
    calculateOrderTotalsFunc()
  })
}

// Update item subtotal
const updateItemSubtotalFunc = (row) => {
  const quantity = Number.parseFloat(row.querySelector(".item-quantity").value) || 0
  const price = Number.parseFloat(row.querySelector(".item-price").value) || 0
  const subtotal = quantity * price

  row.querySelector(".item-subtotal").value = subtotal.toFixed(2)
}

// Calculate order totals
const calculateOrderTotalsFunc = () => {
  const itemRows = document.querySelectorAll(".order-item-row")
  let subtotal = 0

  itemRows.forEach((row) => {
    subtotal += Number.parseFloat(row.querySelector(".item-subtotal").value) || 0
  })

  // Get tax rate and discount
  const taxRate = Number.parseFloat(document.getElementById("taxRate").value) || 0
  const discount = Number.parseFloat(document.getElementById("discount").value) || 0

  // Calculate tax amount
  const taxAmount = subtotal * (taxRate / 100)

  // Calculate total
  const total = subtotal + taxAmount - discount

  // Update form fields
  document.getElementById("subtotal").value = subtotal.toFixed(2)
  document.getElementById("taxAmount").value = taxAmount.toFixed(2)
  document.getElementById("total").value = total.toFixed(2)
}

// Load products for select dropdown
function loadProductsForSelectInner(selectElement, selectedProductId = null) {
  // Fetch products from server
  fetch("get_products.php")
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`)
      }
      return response.json()
    })
    .then((data) => {
      if (data.success) {
        // Clear existing options except the first one
        selectElement.innerHTML = '<option value="">Select Product</option>'

        // Add product options
        data.products.forEach((product) => {
          const option = document.createElement("option")
          option.value = product.product_id
          option.textContent = `${product.product_name} (₱${Number.parseFloat(product.price).toFixed(2)})`
          option.dataset.price = product.price

          if (selectedProductId && product.product_id == selectedProductId) {
            option.selected = true
          }

          selectElement.appendChild(option)
        })

        // Add change event listener
        selectElement.addEventListener("change", function () {
          const selectedOption = this.options[this.selectedIndex]
          const price = selectedOption.dataset.price || 0

          // Update price field
          const row = this.closest(".order-item-row")
          row.querySelector(".item-price").value = price

          // Update subtotal
          updateItemSubtotalFunc(row)
          calculateOrderTotalsFunc()
        })
      } else {
        console.error("Failed to load products:", data.message)
      }
    })
    .catch((error) => {
      console.error("Error loading products:", error)
    })
}

// Reset retailer order form
function resetRetailerOrderForm() {
  const orderForm = document.getElementById("retailerOrderForm")
  if (orderForm) {
    orderForm.reset()

    // Clear order ID
    document.getElementById("retailerOrderId").value = ""

    // Set default date to today
    const today = new Date().toISOString().split("T")[0]
    document.getElementById("orderDate").value = today

    // Clear order items
    document.getElementById("orderItems").innerHTML = ""

    // Add one empty item row
    addOrderItemRowFunc()

    // Reset totals
    document.getElementById("subtotal").value = "0.00"
    document.getElementById("taxAmount").value = "0.00"
    document.getElementById("total").value = "0.00"

    // Reset form content
    const orderFormContent = document.getElementById("retailerOrderFormContent")
    if (orderFormContent) {
      orderFormContent.innerHTML = `
        <div class="row mb-3">
          <div class="col-md-6">
            <h6 class="mb-3">Retailer Information</h6>
            <div class="mb-3">
              <label for="retailerName" class="form-label">Retailer Name</label>
              <input type="text" class="form-control" id="retailerName" name="retailer_name" required>
            </div>
            <div class="mb-3">
              <label for="retailerEmail" class="form-label">Email</label>
              <input type="email" class="form-control" id="retailerEmail" name="retailer_email">
            </div>
            <div class="mb-3">
              <label for="retailerContact" class="form-label">Contact</label>
              <input type="text" class="form-control" id="retailerContact" name="retailer_contact">
            </div>
            <div class="mb-3">
              <label for="poNumber" class="form-label">PO Number</label>
              <input type="text" class="form-control" id="poNumber" name="po_number">
            </div>
          </div>
          <div class="col-md-6">
            <h6 class="mb-3">Order Information</h6>
            <div class="mb-3">
              <label for="orderDate" class="form-label">Order Date</label>
              <input type="date" class="form-control" id="orderDate" name="order_date" required>
            </div>
            <div class="mb-3">
              <label for="expectedDelivery" class="form-label">Expected Delivery</label>
              <input type="date" class="form-control" id="expectedDelivery" name="expected_delivery">
            </div>
            <div class="mb-3">
              <label for="orderStatus" class="form-label">Status</label>
              <select class="form-select" id="orderStatus" name="status" required>
                <option value="order">Order</option>
                <option value="confirmed">Confirmed</option>
              </select>
            </div>
            <div class="mb-3">
              <label for="deliveryMode" class="form-label">Delivery Mode</label>
              <select class="form-select" id="deliveryMode" name="delivery_mode">
                <option value="pickup">Pickup</option>
                <option value="delivery">Delivery</option>
              </select>
            </div>
            <div class="mb-3">
              <label for="pickupLocation" class="form-label">Pickup Location</label>
              <input type="text" class="form-control" id="pickupLocation" name="pickup_location">
            </div>
            <div class="mb-3">
              <label for="orderNotes" class="form-label">Notes</label>
              <textarea class="form-control" id="orderNotes" name="notes" rows="3"></textarea>
            </div>
          </div>
        </div>
        
        <h6 class="mb-3">Order Items</h6>
        <div id="orderItems" class="mb-3">
          <!-- Order items will be added here -->
        </div>
        
        <div class="text-end mb-3">
          <button type="button" class="btn btn-outline-primary" id="addItemBtn">
            <i class="bi bi-plus-circle me-1"></i> Add Item
          </button>
        </div>
        
        <div class="row">
          <div class="col-md-6">
            <!-- Empty column for spacing -->
          </div>
          <div class="col-md-6">
            <div class="card">
              <div class="card-body">
                <h6 class="card-title">Order Summary</h6>
                <div class="mb-3">
                  <div class="row g-2 align-items-center">
                    <div class="col-6">
                      <label for="subtotal" class="col-form-label">Subtotal:</label>
                    </div>
                    <div class="col-6">
                      <div class="input-group">
                        <span class="input-group-text">₱</span>
                        <input type="text" class="form-control text-end" id="subtotal" name="subtotal" value="0.00" readonly>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="mb-3">
                  <div class="row g-2 align-items-center">
                    <div class="col-6">
                      <label for="taxRate" class="col-form-label">Tax Rate (%):</label>
                    </div>
                    <div class="col-6">
                      <div class="input-group">
                        <input type="number" class="form-control text-end" id="taxRate" name="tax_rate" value="12" min="0" step="0.01">
                        <span class="input-group-text">%</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="mb-3">
                  <div class="row g-2 align-items-center">
                    <div class="col-6">
                      <label for="taxAmount" class="col-form-label">Tax Amount:</label>
                    </div>
                    <div class="col-6">
                      <div class="input-group">
                        <span class="input-group-text">₱</span>
                        <input type="text" class="form-control text-end" id="taxAmount" name="tax" value="0.00" readonly>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="mb-3">
                  <div class="row g-2 align-items-center">
                    <div class="col-6">
                      <label for="discount" class="col-form-label">Discount:</label>
                    </div>
                    <div class="col-6">
                      <div class="input-group">
                        <span class="input-group-text">₱</span>
                        <input type="number" class="form-control text-end" id="discount" name="discount" value="0" min="0" step="0.01">
                      </div>
                    </div>
                  </div>
                </div>
                <hr>
                <div class="mb-3">
                  <div class="row g-2 align-items-center">
                    <div class="col-6">
                      <label for="total" class="col-form-label fw-bold">Total:</label>
                    </div>
                    <div class="col-6">
                      <div class="input-group">
                        <span class="input-group-text">₱</span>
                        <input type="text" class="form-control text-end fw-bold" id="total" name="total_amount" value="0.00" readonly>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      `

      // Re-add event listeners
      const addItemBtn = document.getElementById("addItemBtn")
      if (addItemBtn) {
        addItemBtn.addEventListener("click", addOrderItemRowFunc)
      }

      // Add event listeners for tax rate and discount
      const taxRateInput = document.getElementById("taxRate")
      const discountInput = document.getElementById("discount")

      if (taxRateInput) {
        taxRateInput.addEventListener("input", calculateOrderTotalsFunc)
      }
      if (discountInput) {
        discountInput.addEventListener("input", calculateOrderTotalsFunc)
      }
    }
  }
}

// Save retailer order
function saveRetailerOrder() {
  // Show loading indicator
  const saveBtn = document.querySelector("#retailerOrderForm button[type='submit']")
  const originalBtnText = saveBtn.innerHTML
  saveBtn.disabled = true
  saveBtn.innerHTML = `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Saving...`

  // Get form data
  const formData = new FormData(document.getElementById("retailerOrderForm"))

  // Send to server
  fetch("save_retailer_order.php", {
    method: "POST",
    body: formData,
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`)
      }
      return response.json()
    })
    .then((data) => {
      if (data.success) {
        // Close modal
        const orderModalElement = document.getElementById("retailerOrderModal")
        if (orderModalElement) {
          const orderModal = bootstrap.Modal.getInstance(orderModalElement)
          if (orderModal) {
            orderModal.hide()
          } else {
            console.warn("Retailer order modal instance not found.")
          }
        } else {
          console.warn("Retailer order modal element not found.")
        }

        // Show success message
        showAlert("success", data.message || "Retailer order saved successfully")

        // Reload retailer orders
        loadRetailerOrders()
      } else {
        // Show error message
        showAlert("danger", data.message || "Failed to save retailer order")

        // Reset button
        saveBtn.disabled = false
        saveBtn.innerHTML = originalBtnText
      }
    })
    .catch((error) => {
      console.error("Error saving retailer order:", error)
      showAlert("danger", "Error saving retailer order. Please try again.")

      // Reset button
      saveBtn.disabled = false
      saveBtn.innerHTML = originalBtnText
    })
}

// Confirm delete retailer order
function confirmDeleteRetailerOrder(orderId) {
  // Set order ID in hidden field
  document.getElementById("deleteOrderId").value = orderId

  // Show confirmation modal
  const deleteOrderModal = new bootstrap.Modal(document.getElementById("deleteOrderModal"))
  deleteOrderModal.show()
}

// Delete retailer order
function deleteRetailerOrder(orderId) {
  // Show loading indicator
  showAlert("info", "Deleting retailer order...")

  // Send delete request
  fetch(`delete_retailer_order.php?order_id=${orderId}`)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`)
      }
      return response.json()
    })
    .then((data) => {
      if (data.success) {
        // Show success message
        showAlert("success", data.message || "Retailer order deleted successfully")

        // Reload retailer orders
        loadRetailerOrders()
      } else {
        // Show error message
        showAlert("danger", data.message || "Failed to delete retailer order")
      }
    })
    .catch((error) => {
      console.error("Error deleting retailer order:", error)
      showAlert("danger", "Error deleting retailer order. Please try again.")
    })
}

// Export retailer orders to CSV
function exportRetailerOrders() {
  // Show a loading indicator
  showAlert("info", "Preparing export file...")

  // Apply current filters
  let queryString = `export_retailer_orders.php?status=${retailerFilters.status}`

  if (retailerFilters.search) {
    queryString += `&search=${encodeURIComponent(retailerFilters.search)}`
  }

  // Get current date for filename
  const today = new Date()
  const dateString = today.toISOString().split("T")[0] // YYYY-MM-DD format

  // Create download link with a more descriptive filename
  const downloadLink = document.createElement("a")
  downloadLink.href = queryString
  downloadLink.download = `retailer_orders_${dateString}.csv`
  document.body.appendChild(downloadLink)
  downloadLink.click()
  document.body.removeChild(downloadLink)

  // Show success message after a short delay
  setTimeout(() => {
    showAlert("success", "Export completed successfully")
  }, 1000)
}

// Function to display alerts
function showAlert(type, message) {
  const alertContainer = document.getElementById("alertContainer")
  if (!alertContainer) {
    console.warn("Alert container not found")
    return
  }

  const alertDiv = document.createElement("div")
  alertDiv.className = `alert alert-${type} alert-dismissible fade show`
  alertDiv.setAttribute("role", "alert")
  alertDiv.textContent = message

  const closeButton = document.createElement("button")
  closeButton.setAttribute("type", "button")
  closeButton.className = "btn-close"
  closeButton.setAttribute("data-bs-dismiss", "alert")
  closeButton.setAttribute("aria-label", "Close")

  alertDiv.appendChild(closeButton)
  alertContainer.appendChild(alertDiv)
}

// Make sure the showAlert function is properly defined and accessible
// Add this at the end of the file if it's not already defined elsewhere
window.showAlert = showAlert
window.loadRetailerOrders = loadRetailerOrders
