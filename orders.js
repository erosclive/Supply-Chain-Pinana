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
// Add delivery mode to retailer filters
const retailerFilters = {
  status: "all",
  deliveryMode: "all",
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

// Update the function that handles the "Mark as Ready for Pickup" button
function markAsReadyForPickup(orderId) {
  if (!orderId) return

  // Show confirmation dialog
  if (!confirm("Are you sure you want to mark this order as ready for pickup?")) {
    return
  }

  // Show loading indicator
  showLoadingOverlay("Updating order status...")

  // Create form data
  const formData = new FormData()
  formData.append("order_id", orderId)
  formData.append("status", "ready_for_pickup") // Use consistent status format
  formData.append("notes", "Order is ready for pickup")

  // Send request to update status
  fetch("update_order_status.php", {
    method: "POST",
    body: formData,
  })
    .then((response) => response.json())
    .then((data) => {
      hideLoadingOverlay()

      if (data.success) {
        showAlert("success", "Order marked as ready for pickup successfully")

        // Refresh orders list
        loadRetailerOrders()

        // If we're in order details view, refresh that too
        if (typeof refreshOrderDetails === "function" && currentViewingOrderId === orderId) {
          refreshOrderDetails()
        }
      } else {
        showAlert("danger", "Failed to update order status: " + (data.message || "Unknown error"))
      }
    })
    .catch((error) => {
      hideLoadingOverlay()
      console.error("Error updating order status:", error)
      showAlert("danger", "Error updating order status. Please try again.")
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
                <div>${orderStatus.renderStatusBadge(order.status, order.delivery_mode, order.pickup_status)}</div>

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

// Add this function - it's the main one that was missing
function confirmOrder(orderId) {
  // Set the order ID in the hidden field
  document.getElementById("confirmOrderId").value = orderId

  // Show the confirmation modal
  const confirmModal = new bootstrap.Modal(document.getElementById("confirmOrderModal"))
  confirmModal.show()

  // Remove any existing event listeners to prevent duplicates
  const confirmBtn = document.getElementById("processConfirmOrderBtn")
  const newConfirmBtn = confirmBtn.cloneNode(true)
  confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn)

  // Add event listener to the confirm button
  newConfirmBtn.addEventListener("click", () => {
    processOrderConfirmation(orderId)
    confirmModal.hide()
  })
}

// Add this function for printing
function printInvoice() {
  const printContent = document.getElementById("invoicePrintContent")
  if (!printContent) {
    console.error("Print content not found")
    return
  }

  // Create a new window with just the invoice content
  const printWindow = window.open("", "_blank")
  printWindow.document.write(`
    <html>
      <head>
        <title>Invoice - Piñana Gourmet</title>
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/css/bootstrap.min.css" rel="stylesheet">
        <style>
          body { padding: 20px; }
          @media print {
            body { padding: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        ${printContent.innerHTML}
        <div class="text-center mt-4 no-print">
          <button class="btn btn-primary" onclick="window.print()">Print Invoice</button>
          <button class="btn btn-secondary ms-2" onclick="window.close()">Close</button>
        </div>
      </body>
    </html>
  `)

  printWindow.document.close()
}

// Function to process ready for pickup orders
function processReadyForPickupOrder(orderId, notifyByEmail, notifyBySMS) {
  // Show loading indicator
  showAlert("info", `Marking order #${orderId} as ready for pickup...`)

  // Create form data
  const formData = new FormData()
  formData.append("order_id", orderId)
  formData.append("status", "ready_for_pickup")
  formData.append("notes", "Order is ready for pickup")
  formData.append("notify_email", notifyByEmail ? "1" : "0")
  formData.append("notify_sms", notifyBySMS ? "1" : "0")

  // Send request to update status
  fetch("update_order_status.php", {
    method: "POST",
    body: formData,
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        showAlert("success", "Order marked as ready for pickup successfully")

        // Refresh orders list
        loadRetailerOrders()
      } else {
        showAlert("danger", "Failed to update order status: " + (data.message || "Unknown error"))
      }
    })
    .catch((error) => {
      console.error("Error updating order status:", error)
      showAlert("danger", "Error updating order status. Please try again.")
    })
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

// Update the loadRetailerOrders function to include pickup_status in the query
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

  // Add delivery mode filter
  if (retailerFilters.deliveryMode !== "all") {
    queryString += `&delivery_mode=${encodeURIComponent(retailerFilters.deliveryMode)}`
  }

  // Add ongoing/completed filters if set
  if (retailerFilters.ongoing) {
    queryString += `&ongoing=true`
  }

  if (retailerFilters.completed) {
    queryString += `&completed=true`
  }

  if (retailerFilters.search) {
    queryString += `&search=${encodeURIComponent(retailerFilters.search)}`
  }

  console.log("Fetching retailer orders with URL:", queryString)

  // Fetch retailer orders
  fetch(queryString)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`)
      }
      return response.json()
    })
    .then((data) => {
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

// Complete renderRetailerOrders function with modal integration
function renderRetailerOrders(orders) {
  const tableBody = document.getElementById("retailer-orders-table-body")
  if (!tableBody) return

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

    // Get status badge based on delivery mode and status
    let statusBadge = ""
    if (window.orderStatus) {
      statusBadge = window.orderStatus.renderStatusBadge(order.status, order.delivery_mode, order.pickup_status)
    } else {
      // Fallback if orderStatus handler is not available
      let statusClass = ""
      switch (order.status) {
        case "order":
          statusClass = "bg-warning text-dark"
          break
        case "confirmed":
          statusClass = "bg-success"
          break
        case "shipped":
          statusClass = "bg-primary"
          break
        case "ready_for_pickup":
        case "ready-to-pickup":
        case "ready for pickup":
          statusClass = "bg-primary"
          break
        case "delivered":
        case "picked_up":
        case "picked up":
          statusClass = "bg-info"
          break
        case "cancelled":
          statusClass = "bg-danger"
          break
        default:
          statusClass = "bg-secondary"
      }

      statusBadge = `<span class="badge ${statusClass}">${order.status.charAt(0).toUpperCase() + order.status.slice(1).replace(/_/g, " ")}</span>`
    }

    // Action buttons based on current status and delivery mode
    let actionButtons = `
      <button type="button" class="btn btn-sm btn-outline-primary view-retailer-order-btn" data-id="${order.order_id}" title="View Order">
        <i class="bi bi-eye"></i>
      </button>
    `

    // Add status-specific action buttons
    if (order.status === "order") {
      actionButtons += `
      <button type="button" class="btn btn-sm btn-outline-success confirm-order-btn" data-id="${order.order_id}" title="Confirm Order">
        <i class="bi bi-check-circle"></i>
      </button>
      `
    } else if (order.status === "confirmed") {
      if (order.delivery_mode === "delivery") {
        actionButtons += `
        <button type="button" class="btn btn-sm btn-outline-primary ship-order-btn" data-id="${order.order_id}" title="Mark as Shipped">
          <i class="bi bi-truck"></i>
        </button>
        `
      } else if (order.delivery_mode === "pickup") {
        actionButtons += `
        <button type="button" class="btn btn-sm btn-outline-primary ready-for-pickup-btn" data-id="${order.order_id}" title="Mark as Ready for Pickup">
          <i class="bi bi-bag-check"></i>
        </button>
        `
      }
    } else if (
      order.status === "shipped" ||
      order.status === "ready_for_pickup" ||
      order.status === "ready-to-pickup" ||
      order.status === "ready for pickup"
    ) {
      if (order.delivery_mode === "delivery") {
        actionButtons += `
        <button type="button" class="btn btn-sm btn-outline-info deliver-order-btn" data-id="${order.order_id}" title="Mark as Delivered">
          <i class="bi bi-check2-all"></i>
        </button>
        `
      } else if (order.delivery_mode === "pickup") {
        actionButtons += `
        <button type="button" class="btn btn-sm btn-outline-info pickup-complete-btn" data-id="${order.order_id}" title="Mark as Picked Up">
          <i class="bi bi-check2-all"></i>
        </button>
        `
      }
    }

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
          <div class="small text-muted">
            ${
              order.delivery_mode === "pickup"
                ? `Pickup: ${order.pickup_date ? new Date(order.pickup_date).toLocaleDateString() : "Not set"}`
                : `Expected: ${order.expected_delivery ? new Date(order.expected_delivery).toLocaleDateString() : "Not set"}`
            }
          </div>
        </td>
        <td>${order.item_count} item${order.item_count !== 1 ? "s" : ""}</td>
        <td class="fw-bold">₱${Number.parseFloat(order.total_amount).toFixed(2)}</td>
        <td class="status-cell" data-status="${order.status}" data-delivery-mode="${order.delivery_mode}" data-pickup-status="${order.pickup_status || ""}" data-order-id="${order.order_id}">
          ${statusBadge}
          <span class="badge bg-info ms-1">${order.delivery_mode ? order.delivery_mode.charAt(0).toUpperCase() + order.delivery_mode.slice(1) : "N/A"}</span>
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
      viewRetailerOrderFunc(orderId)
    })
  })

  // Add event listeners for confirm order buttons
  document.querySelectorAll(".confirm-order-btn").forEach((btn) => {
    btn.addEventListener("click", function () {
      const orderId = this.getAttribute("data-id")
      confirmOrder(orderId)
    })
  })

  // Add event listeners for ship order buttons
  document.querySelectorAll(".ship-order-btn").forEach((btn) => {
    btn.addEventListener("click", function () {
      const orderId = this.getAttribute("data-id")
      showShippedModal(orderId)
    })
  })

  // Add event listeners for ready for pickup buttons
  document.querySelectorAll(".ready-for-pickup-btn").forEach((btn) => {
    btn.addEventListener("click", function () {
      const orderId = this.getAttribute("data-id")
      showReadyForPickupModal(orderId)
    })
  })

  // Add event listeners for deliver order buttons
  document.querySelectorAll(".deliver-order-btn").forEach((btn) => {
    btn.addEventListener("click", function () {
      const orderId = this.getAttribute("data-id")
      showDeliveredModal(orderId)
    })
  })

  // Add event listeners for pickup complete buttons
  document.querySelectorAll(".pickup-complete-btn").forEach((btn) => {
    btn.addEventListener("click", function () {
      const orderId = this.getAttribute("data-id")
      showPickedUpModal(orderId)
    })
  })
}

// Function to show the Shipped modal
function showShippedModal(orderId) {
  // Set the order ID in the hidden field
  document.getElementById("shippedOrderId").value = orderId

  // Set default delivery hours to Morning
  document.getElementById("morningDelivery").checked = true

  // Set default notification preferences
  document.getElementById("notifyEmailShipped").checked = true
  document.getElementById("notifySMSShipped").checked = false

  // Show the modal
  const shippedModal = new bootstrap.Modal(document.getElementById("shippedModal"))
  shippedModal.show()
}

// Function to show the Ready for Pickup modal
function showReadyForPickupModal(orderId) {
  // Set the order ID in the hidden field
  document.getElementById("pickupOrderId").value = orderId

  // Set default notification preferences
  document.getElementById("notifyEmailPickup").checked = true

  // Set default notification preferences
  document.getElementById("notifySMSPickup").checked = false

  // Show the modal
  const readyForPickupModal = new bootstrap.Modal(document.getElementById("readyForPickupModal"))
  readyForPickupModal.show()
}

// Function to process the shipped order with delivery hours
function processShippedOrder(orderId, deliveryHours, notifyByEmail, notifyBySMS) {
  // Show loading indicator
  showAlert("info", `Marking order #${orderId} as shipped...`)

  // Create form data
  const formData = new FormData()
  formData.append("order_id", orderId)
  formData.append("status", "shipped")
  formData.append("delivery_hours", deliveryHours)
  formData.append("notes", `Order has been shipped. Delivery: ${deliveryHours}`)
  formData.append("notify_email", notifyByEmail ? "1" : "0")
  formData.append("notify_sms", notifyBySMS ? "1" : "0")

  // Send request to update status
  fetch("update_order_status.php", {
    method: "POST",
    body: formData,
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        showAlert("success", "Order marked as shipped successfully")

        // Refresh orders list
        loadRetailerOrders()
      } else {
        showAlert("danger", "Failed to update order status: " + (data.message || "Unknown error"))
      }
    })
    .catch((error) => {
      console.error("Error updating order status:", error)
      showAlert("danger", "Error updating order status. Please try again.")
    })
}

// Update event listeners for the confirm buttons in the modals
document.addEventListener("DOMContentLoaded", () => {
  // Confirm Shipped button
  document.getElementById("confirmShippedBtn").addEventListener("click", () => {
    const orderId = document.getElementById("shippedOrderId").value

    // Get selected delivery hours
    let deliveryHours = "Morning (7-12 am)" // Default
    if (document.getElementById("afternoonDelivery").checked) {
      deliveryHours = "Afternoon (12-6 pm)"
    } else if (document.getElementById("eveningDelivery").checked) {
      deliveryHours = "Evening (6-8 pm)"
    }

    const notifyByEmail = document.getElementById("notifyEmailShipped").checked
    const notifyBySMS = document.getElementById("notifySMSShipped").checked

    // Process the shipping
    processShippedOrder(orderId, deliveryHours, notifyByEmail, notifyBySMS)

    // Hide the modal
    const shippedModal = bootstrap.Modal.getInstance(document.getElementById("shippedModal"))
    shippedModal.hide()
  })

  // Confirm Ready for Pickup button
  document.getElementById("confirmPickupBtn").addEventListener("click", () => {
    const orderId = document.getElementById("pickupOrderId").value
    const notifyByEmail = document.getElementById("notifyEmailPickup").checked
    const notifyBySMS = document.getElementById("notifySMSPickup").checked

    // Process the ready for pickup
    processReadyForPickupOrder(orderId, notifyByEmail, notifyBySMS)

    // Hide the modal
    const readyForPickupModal = bootstrap.Modal.getInstance(document.getElementById("readyForPickupModal"))
    readyForPickupModal.hide()
  })

  // Confirm Delivered button
  document.getElementById("confirmDeliveredBtn").addEventListener("click", () => {
    processDeliveredOrder()
  })

  // Confirm Picked Up button
  document.getElementById("confirmPickedUpBtn").addEventListener("click", () => {
    processPickedUpOrder()
  })
})

// Mock functions to resolve undeclared variable errors.  These should be replaced with actual implementations.
function viewRetailerOrderFunc(orderId) {
  console.log("View retailer order:", orderId)
}

function updateOrderStatus(orderId, status, message) {
  console.log("Update order status:", orderId, status, message)
}

// Update the updateOrderStatus function to handle different order types
function updateOrderStatusFunc(orderId, status, notes = "") {
  // Get the delivery mode from the status cell
  const statusCell = document.querySelector(`.status-cell[data-order-id="${orderId}"]`)
  const deliveryMode = statusCell ? statusCell.getAttribute("data-delivery-mode") : "delivery"

  // Get a user-friendly status label (without showing it in a confirmation)
  const statusLabel = getStatusLabel(status, deliveryMode)

  // Show loading indicator
  showAlert("info", `Updating order #${orderId} status...`)

  // Create form data
  const formData = new FormData()
  formData.append("order_id", orderId)
  formData.append("status", status)
  formData.append("notes", notes)

  // For pickup orders being marked as picked up, explicitly set pickup_status
  if (deliveryMode === "pickup" && (status === "picked_up" || status === "picked-up")) {
    formData.append("pickup_status", "picked-up")
  }

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
        showAlert("success", `Order status updated to ${statusLabel}`)

        // Update the status cell immediately to avoid showing "Unknown"
        if (statusCell && deliveryMode === "pickup" && (status === "picked_up" || status === "picked-up")) {
          statusCell.innerHTML = `
          <span class="badge bg-success">
            <i class="bi bi-check2-all me-1"></i>
            Picked Up
          </span>
          <span class="badge bg-info ms-1">Pickup</span>
        `
          statusCell.setAttribute("data-pickup-status", "picked-up")
        }

        // Refresh orders list
        setTimeout(() => {
          loadRetailerOrders()
        }, 1000)
      } else {
        showAlert("danger", data.message || "Failed to update order status")
      }
    })
    .catch((error) => {
      console.error("Error updating order status:", error)
      showAlert("danger", "Error updating order status. Please try again.")
    })
}

// Helper function to get a user-friendly status label
function getStatusLabel(status, deliveryMode) {
  if (deliveryMode === "pickup") {
    switch (status) {
      case "ready_for_pickup":
      case "ready-to-pickup":
        return "Ready for Pickup"
      case "picked_up":
      case "picked-up":
        return "Picked Up"
      default:
        return status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, " ")
    }
  } else {
    switch (status) {
      case "shipped":
        return "Shipped"
      case "delivered":
        return "Delivered"
      default:
        return status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, " ")
    }
  }
}

// Replace the markAsPickedUp function with this updated version
function markAsPickedUp(orderId) {
  if (!orderId) return

  // Show confirmation dialog
  if (!confirm("Are you sure you want to mark this order as picked up?")) {
    return
  }

  // Show loading indicator
  showAlert("info", `Updating order #${orderId} status...`)

  // Create form data
  const formData = new FormData()
  formData.append("order_id", orderId)
  formData.append("status", "picked_up") // Will be converted to "delivered" on the server
  formData.append("pickup_status", "picked up") // Using "picked up" with space as requested
  formData.append("notes", "Order has been picked up")

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
        showAlert("success", "Order marked as picked up successfully")

        // Update the status cell immediately with the correct status
        const statusCell = document.querySelector(`.status-cell[data-order-id="${orderId}"]`)
        if (statusCell) {
          // Use the orderStatus handler to render the badge correctly
          if (window.orderStatus) {
            statusCell.innerHTML = window.orderStatus.renderStatusBadge("delivered", "pickup", "picked up")
            statusCell.innerHTML += `<span class="badge bg-info ms-1">Pickup</span>`
          } else {
            // Fallback if orderStatus handler is not available
            statusCell.innerHTML = `
              <span class="badge bg-success">
                <i class="bi bi-check2-all me-1"></i>
                Picked Up
              </span>
              <span class="badge bg-info ms-1">Pickup</span>
            `
          }

          // Update data attributes
          statusCell.setAttribute("data-pickup-status", "picked up")
          statusCell.setAttribute("data-status", "delivered") // Set status to delivered for pickup orders
        }

        // Refresh orders list
        setTimeout(() => {
          loadRetailerOrders()
        }, 1000)
      } else {
        showAlert("danger", data.message || "Failed to update order status")
      }
    })
    .catch((error) => {
      console.error("Error updating order status:", error)
      showAlert("danger", "Error updating order status. Please try again.")
    })
}

// Event listener for Mark as Picked Up
document.addEventListener("DOMContentLoaded", () => {
  document.body.addEventListener("click", (e) => {
    if (e.target && e.target.closest(".picked-up-btn")) {
      const btn = e.target.closest(".picked-up-btn")
      const orderId = btn.getAttribute("data-id")
      markAsPickedUp(orderId)
    }
  })
})

function markAsShipped(orderId) {
  updateOrderStatusFunc(orderId, "shipped", "Order has been shipped")
}

function markAsDelivered(orderId) {
  updateOrderStatusFunc(orderId, "delivered", "Order has been delivered")
}

// Function to show the Delivered modal
function showDeliveredModal(orderId) {
  // Set the order ID in the hidden field
  document.getElementById("deliveredOrderId").value = orderId

  // Reset form
  document.getElementById("deliveredForm").reset()

  // Show the modal
  const deliveredModal = new bootstrap.Modal(document.getElementById("deliveredModal"))
  deliveredModal.show()
}

// Function to show the Picked Up modal
function showPickedUpModal(orderId) {
  // Set the order ID in the hidden field
  document.getElementById("pickedUpOrderId").value = orderId

  // Reset form
  document.getElementById("pickedUpForm").reset()

  // Show the modal
  const pickedUpModal = new bootstrap.Modal(document.getElementById("pickedUpModal"))
  pickedUpModal.show()
}

// Function to process the delivered order with photo proof
function processDeliveredOrder() {
  const orderId = document.getElementById("deliveredOrderId").value
  const deliveryNotes = document.getElementById("deliveryNotes").value
  const notifyByEmail = document.getElementById("notifyEmailDelivered").checked
  const photoInput = document.getElementById("deliveryProofPhoto")

  // Validate photo input
  if (!photoInput.files || photoInput.files.length === 0) {
    showAlert("warning", "Please upload a delivery proof photo")
    return
  }

  // Show loading indicator
  showAlert("info", `Marking order #${orderId} as delivered...`)

  // Create form data
  const formData = new FormData(document.getElementById("deliveredForm"))
  formData.append("status", "delivered")
  formData.append("notes", deliveryNotes || "Order has been delivered")
  formData.append("notify_email", notifyByEmail ? "1" : "0")

  // Send request to update status
  fetch("update_order_status_with_photo.php", {
    method: "POST",
    body: formData,
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        showAlert("success", "Order marked as delivered successfully")

        // Hide the modal
        const deliveredModal = bootstrap.Modal.getInstance(document.getElementById("deliveredModal"))
        deliveredModal.hide()

        // Refresh orders list
        loadRetailerOrders()
      } else {
        showAlert("danger", "Failed to update order status: " + (data.message || "Unknown error"))
      }
    })
    .catch((error) => {
      console.error("Error updating order status:", error)
      showAlert("danger", "Error updating order status. Please try again.")
    })
}

// Function to process the picked up order
function processPickedUpOrder() {
  const orderId = document.getElementById("pickedUpOrderId").value
  const pickupPersonName = document.getElementById("pickupPersonName").value
  const pickupIdVerified = document.getElementById("pickupIdVerified").checked
  const pickupNotes = document.getElementById("pickupNotes").value
  const notifyByEmail = document.getElementById("notifyEmailPickedUp").checked

  // Validate person name
  if (!pickupPersonName.trim()) {
    showAlert("warning", "Please enter the name of the person who picked up the order")
    return
  }

  // Validate ID verification
  if (!pickupIdVerified) {
    showAlert("warning", "ID verification is required before confirming pickup")
    return
  }

  // Show loading indicator
  showAlert("info", `Marking order #${orderId} as picked up...`)

  // Create form data
  const formData = new FormData(document.getElementById("pickedUpForm"))
  formData.append("status", "picked_up")
  formData.append("pickup_status", "picked-up")
  formData.append("notes", pickupNotes || `Order picked up by ${pickupPersonName}`)
  formData.append("notify_email", notifyByEmail ? "1" : "0")

  // Send request to update status
  fetch("update_order_status_with_pickup.php", {
    method: "POST",
    body: formData,
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        showAlert("success", "Order marked as picked up successfully")

        // Hide the modal
        const pickedUpModal = bootstrap.Modal.getInstance(document.getElementById("pickedUpModal"))
        pickedUpModal.hide()

        // Refresh orders list
        loadRetailerOrders()
      } else {
        showAlert("danger", "Failed to update order status: " + (data.message || "Unknown error"))
      }
    })
    .catch((error) => {
      console.error("Error updating order status:", error)
      showAlert("danger", "Error updating order status. Please try again.")
    })
}

// Modify the processOrderConfirmation function to show modal and print
function processOrderConfirmation(orderId) {
  // Show loading indicator
  showAlert("info", `Confirming order #${orderId}...`)

  // Create form data
  const formData = new FormData()
  formData.append("order_id", orderId)
  formData.append("status", "confirmed")
  formData.append("notes", "Your order is confirmed and will be prepared shortly. Thank you for your order!")

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
          const deliveryMode = statusCell.getAttribute("data-delivery-mode")
          statusCell.innerHTML = `
            <span class="badge bg-success">
              <i class="bi bi-check-circle me-1"></i>
              Confirmed
            </span>
            ${deliveryMode ? `<span class="badge bg-info ms-1">${deliveryMode.charAt(0).toUpperCase() + deliveryMode.slice(1)}</span>` : ""}
          `
        }

        // Fetch order details and show print modal
        fetch(`get_retailer_order_details.php?order_id=${orderId}`)
          .then((response) => response.json())
          .then((orderData) => {
            if (orderData.success) {
              // Populate and show the print modal
              populatePrintInvoiceModal(orderData.order, orderData.items)
              const printInvoiceModal = new bootstrap.Modal(document.getElementById("printInvoiceModal"))
              printInvoiceModal.show()

              // Automatically trigger print after a short delay
              setTimeout(() => {
                printInvoiceFunc()
              }, 500) // Short delay to ensure modal is fully rendered
            } else {
              showAlert("danger", "Failed to load order details for printing")
            }
          })
          .catch((error) => {
            console.error("Error loading order details for printing:", error)
            showAlert("danger", "Error loading order details for printing")
          })

        // Refresh orders list after a delay
        setTimeout(() => {
          loadRetailerOrders()
        }, 1500)
      } else {
        showAlert("danger", data.message || "Failed to confirm order")
      }
    })
    .catch((error) => {
      console.error("Error confirming order:", error)
      showAlert("danger", "Error confirming order. Please try again.")
    })
}

// Add the function to show the print invoice modal
function showPrintInvoiceModal(orderId) {
  // Fetch order details for printing
  fetch(`get_retailer_order_details.php?order_id=${orderId}`)
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        // Populate the print modal with order data
        populatePrintInvoiceModal(data.order, data.items)

        // Show the print modal
        const printInvoiceModal = new bootstrap.Modal(document.getElementById("printInvoiceModal"))
        printInvoiceModal.show()
      } else {
        showAlert("danger", "Failed to load order details for printing")
      }
    })
    .catch((error) => {
      console.error("Error loading order details for printing:", error)
      showAlert("danger", "Error loading order details for printing")
    })
}

// Add the function to populate the print invoice modal
function populatePrintInvoiceModal(order, items) {
  const modalBody = document.querySelector("#printInvoiceModal .modal-body")

  // Format dates
  const orderDate = new Date(order.order_date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  // Build items table HTML
  let itemsHtml = ""
  let subtotal = 0

  items.forEach((item, index) => {
    const itemTotal = Number.parseFloat(item.unit_price) * Number.parseInt(item.quantity)
    subtotal += itemTotal

    itemsHtml += `
      <tr>
        <td>${index + 1}</td>
        <td>${item.product_name || "Unknown Product"}</td>
        <td>${item.quantity}</td>
        <td class="text-end">₱${Number.parseFloat(item.unit_price).toFixed(2)}</td>
        <td class="text-end">₱${itemTotal.toFixed(2)}</td>
      </tr>
    `
  })

  // Calculate totals
  const tax = Number.parseFloat(order.tax) || 0
  const discount = Number.parseFloat(order.discount) || 0
  const total = Number.parseFloat(order.total_amount) || 0

  // Populate the modal with invoice content
  modalBody.innerHTML = `
    <div id="invoicePrintContent">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 class="mb-1">Piñana Gourmet</h4>
          <p class="mb-0">Invoice #${order.po_number || order.order_id}</p>
          <p class="mb-0">Date: ${orderDate}</p>
        </div>
        <div class="text-end">
          <img src="images/final-light.png" alt="Piñana Gourmet Logo" height="60">
        </div>
      </div>
      
      <div class="row mb-4">
        <div class="col-md-6">
          <h6 class="mb-2">Bill To:</h6>
          <p class="mb-0"><strong>${order.retailer_name}</strong></p>
          <p class="mb-0">${order.retailer_email || ""}</p>
          <p class="mb-0">${order.retailer_contact || ""}</p>
        </div>
        <div class="col-md-6 text-md-end">
          <h6 class="mb-2">Order Details:</h6>
          <p class="mb-0"><strong>Order ID:</strong> ${order.order_id}</p>
          <p class="mb-0"><strong>PO Number:</strong> ${order.po_number || "N/A"}</p>
          <p class="mb-0"><strong>Delivery Mode:</strong> ${capitalizeFirstLetter(order.delivery_mode || "Not specified")}</p>
          <p class="mb-0"><strong>Consignment Term:</strong> ${order.consignment_term || "N/A"} days</p>
        </div>
      </div>
      
      <div class="table-responsive mb-4">
        <table class="table table-bordered">
          <thead class="table-light">
            <tr>
              <th>#</th>
              <th>Product</th>
              <th>Quantity</th>
              <th class="text-end">Unit Price</th>
              <th class="text-end">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="4" class="text-end"><strong>Subtotal:</strong></td>
              <td class="text-end">₱${subtotal.toFixed(2)}</td>
            </tr>
            ${
              tax > 0
                ? `
            <tr>
              <td colspan="4" class="text-end">Tax:</td>
              <td class="text-end">₱${tax.toFixed(2)}</td>
            </tr>`
                : ""
            }
            ${
              discount > 0
                ? `
            <tr>
              <td colspan="4" class="text-end">Discount:</td>
              <td class="text-end">-₱${discount.toFixed(2)}</td>
            </tr>`
                : ""
            }
            <tr>
              <td colspan="4" class="text-end"><strong>Total:</strong></td>
              <td class="text-end"><strong>₱${total.toFixed(2)}</strong></td>
            </tr>
          </tfoot>
        </table>
      </div>
      
      <div class="row">
        <div class="col-md-8">
          <h6 class="mb-2">Notes:</h6>
          <p>${order.notes || "No notes"}</p>
        </div>
        <div class="col-md-4 text-end">
          <p class="mb-0"><strong>Thank you for your business!</strong></p>
          <p class="mb-0">Piñana Gourmet Calauan</p>
        </div>
      </div>
    </div>
  `
}

// Add function to print the invoice
function printInvoiceFunc() {
  const printContent = document.getElementById("invoicePrintContent")
  const originalContents = document.body.innerHTML

  // Create a new window with just the invoice content
  const printWindow = window.open("", "_blank")
  printWindow.document.write(`
    <html>
      <head>
        <title>Invoice - Piñana Gourmet</title>
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/css/bootstrap.min.css" rel="stylesheet">
        <style>
          body { padding: 20px; }
          @media print {
            body { padding: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        ${printContent.innerHTML}
        <div class="text-center mt-4 no-print">
          <button class="btn btn-primary" onclick="window.print()">Print Invoice</button>
          <button class="btn btn-secondary ms-2" onclick="window.close()">Close</button>
        </div>
      </body>
    </html>
  `)

  printWindow.document.close()
}

// Helper function to capitalize first letter
function capitalizeFirstLetter(string) {
  if (!string) return ""
  return string.charAt(0).toUpperCase() + string.slice(1).replace("_", " ")
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

// Update the viewRetailerOrderFunc to properly display pickup information
function viewRetailerOrderFunc(orderId) {
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
        renderRetailerOrderDetailsFunc(data.order, data.items, data.statusHistory)
      } else {
        viewOrderModalBody.innerHTML = `
          <div class="text-center py-5">
            <div class="text-danger">
              <i class="bi bi-exclamation-triangle-fill fs-1 mb-3"></i>
              <p>Error loading retailer order details. Please try again.</p>
              <p class="small text-muted">${data.message || ""}</p>
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
            <p class="small text-muted">${error.message}</p>
          </div>
        </div>
      `
    })
}

// Complete modified renderRetailerOrderDetailsFunc function
function renderRetailerOrderDetailsFunc(order, items, statusHistory) {
  const viewOrderModalBody = document.querySelector("#viewOrderModal .modal-body")
  if (!viewOrderModalBody) return

  // Format dates
  const orderDate = new Date(order.order_date)
  const formattedOrderDate = orderDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  const expectedDelivery =
    order.expected_delivery && order.expected_delivery !== "0000-00-00"
      ? new Date(order.expected_delivery).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : "N/A"

  const pickupDate =
    order.pickup_date && order.pickup_date !== "0000-00-00"
      ? new Date(order.pickup_date).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : "N/A"

  // Status badge class
  let statusClass = ""
  switch (order.status.toLowerCase()) {
    case "order":
      statusClass = "bg-warning text-dark"
      break
    case "confirmed":
      statusClass = "bg-success"
      break
    case "shipped":
      statusClass = "bg-primary"
      break
    case "delivered":
    case "picked_up":
      statusClass = "bg-info"
      break
    case "cancelled":
      statusClass = "bg-danger"
      break
    default:
      statusClass = "bg-secondary"
  }

  // Build items table
  let itemsHtml = ""
  if (items && items.length > 0) {
    items.forEach((item, index) => {
      const createdAt = new Date(item.created_at).toLocaleString()
      itemsHtml += `
        <tr>
          <td>${index + 1}</td>
          <td>
            <div class="fw-medium">${item.product_name || "Unknown Product"}</div>
            <div class="small text-muted">Product ID: ${item.product_id}</div>
            <div class="small text-muted">Added: ${createdAt}</div>
          </td>
          <td>${item.quantity}</td>
          <td>₱${Number.parseFloat(item.unit_price).toFixed(2)}</td>
          <td>₱${Number.parseFloat(item.total_price).toFixed(2)}</td>
        </tr>
      `
    })
  } else {
    itemsHtml = `
      <tr>
        <td colspan="5" class="text-center">No items found for this order</td>
      </tr>
    `
  }

  // Build status history
  let historyHtml = ""
  if (statusHistory && statusHistory.length > 0) {
    statusHistory.forEach((history) => {
      const historyDate = new Date(history.created_at).toLocaleString()
      historyHtml += `
        <div class="timeline-item mb-3">
          <div class="timeline-marker bg-${getStatusColor(history.status)}"></div>
          <div class="timeline-content">
            <div class="d-flex justify-content-between">
              <h6 class="fw-bold mb-1">${capitalizeFirstLetter(history.status)}</h6>
              <span class="text-muted small">${historyDate}</span>
            </div>
            <p class="mb-0">${history.notes || "No notes"}</p>
          </div>
        </div>
      `
    })
  } else {
    historyHtml = `<p class="text-center text-muted">No status history available</p>`
  }

  // Set modal title
  document.getElementById("viewOrderModalLabel").textContent = `Order #${order.po_number || order.order_id}`

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
                <div>${formattedOrderDate}</div>
              </div>
              <div class="mb-3">
                <div class="small text-muted">Status</div>
                <div><span class="badge ${statusClass}">${capitalizeFirstLetter(order.status)}</span></div>
              </div>
              <div class="mb-3">
                <div class="small text-muted">Delivery Mode</div>
                <div>${capitalizeFirstLetter(order.delivery_mode || "Not specified")}</div>
              </div>
              <div class="mb-3">
                <div class="small text-muted">Consignment Term</div>
                <div>${order.consignment_term || "N/A"} days</div>
              </div>
              ${
                order.delivery_mode === "delivery"
                  ? `
                <div>
                  <div class="small text-muted">Expected Delivery</div>
                  <div>${expectedDelivery}</div>
                </div>
              `
                  : `
                <div>
                  <div class="small text-muted">Pickup Location</div>
                  <div>${order.pickup_location || "Not specified"}</div>
                </div>
                <div class="mt-2">
                  <div class="small text-muted">Pickup Date</div>
                  <div>${pickupDate}</div>
                </div>
              `
              }
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
              ${
                order.notes
                  ? `
                <div>
                  <div class="small text-muted">Notes</div>
                  <div>${order.notes}</div>
                </div>
              `
                  : ""
              }
            </div>
          </div>
        </div>
      </div>

      <div class="row">
        <div class="col-md-7">
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
                  <tfoot class="table-light">
                    <tr>
                      <td colspan="3"></td>
                      <td class="fw-bold">Subtotal:</td>
                      <td class="fw-bold">₱${Number.parseFloat(order.subtotal).toFixed(2)}</td>
                    </tr>
                    ${
                      Number.parseFloat(order.tax) > 0
                        ? `
                      <tr>
                        <td colspan="3"></td>
                        <td>Tax:</td>
                        <td>₱${Number.parseFloat(order.tax).toFixed(2)}</td>
                      </tr>
                    `
                        : ""
                    }
                    ${
                      Number.parseFloat(order.discount) > 0
                        ? `
                      <tr>
                        <td colspan="3"></td>
                        <td>Discount:</td>
                        <td>-₱${Number.parseFloat(order.discount).toFixed(2)}</td>
                      </tr>
                    `
                        : ""
                    }
                    <tr>
                      <td colspan="3"></td>
                      <td class="fw-bold">Total:</td>
                      <td class="fw-bold">₱${Number.parseFloat(order.total_amount).toFixed(2)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>
        </div>
        
        <div class="col-md-5">
          <h6 class="text-muted mb-2">Order Status History</h6>
          <div class="card">
            <div class="card-body">
              <div class="timeline">
                ${historyHtml}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
}

// Helper function to get status color for timeline
function getStatusColor(status) {
  switch (status.toLowerCase()) {
    case "order":
      return "warning"
    case "confirmed":
      return "success"
    case "shipped":
      return "primary"
    case "delivered":
    case "picked_up":
      return "info"
    case "cancelled":
      return "danger"
    default:
      return "secondary"
  }
}

// Helper function to capitalize first letter
function capitalizeFirstLetter(string) {
  if (!string) return ""
  return string.charAt(0).toUpperCase() + string.slice(1).replace("_", " ")
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

// Dummy deleteRetailerOrder function
function deleteRetailerOrder(orderId) {
  console.log(`Deleting retailer order with ID: ${orderId}`)
  // Add your actual delete logic here
}

// Add these functions to handle ongoing and completed orders
function loadOngoingOrders() {
  retailerFilters.status = "all"
  retailerFilters.ongoing = true
  retailerFilters.completed = false
  loadRetailerOrders()
}

function loadCompletedOrders() {
  retailerFilters.status = "all"
  retailerFilters.ongoing = false
  retailerFilters.completed = true
  loadRetailerOrders()
}

document.addEventListener("DOMContentLoaded", () => {
  retailerFilters.status = "all"
  retailerFilters.deliveryMode = "all"
  retailerFilters.search = ""
  retailerFilters.ongoing = false
  retailerFilters.completed = false
  // Add this code after the existing initialization code

  // Update the retailer status filter dropdown
  const retailerStatusFilterDropdown = document.getElementById("retailerStatusFilter")
  if (retailerStatusFilterDropdown) {
    const dropdownMenu = retailerStatusFilterDropdown.nextElementSibling
    if (dropdownMenu && dropdownMenu.classList.contains("dropdown-menu")) {
      dropdownMenu.innerHTML = `
        <li><a class="dropdown-item retailer-status-filter" href="#" data-status="all">All Orders</a></li>
        <li><a class="dropdown-item retailer-status-filter" href="#" data-status="order">Order</a></li>
        <li><a class="dropdown-item retailer-status-filter" href="#" data-status="confirmed">Confirmed</a></li>
        <li><a class="dropdown-item retailer-status-filter" href="#" data-status="shipped">Shipped</a></li>
        <li><a class="dropdown-item retailer-status-filter" href="#" data-status="delivered">Delivered</a></li>
        <li><a class="dropdown-item retailer-status-filter" href="#" data-status="cancelled">Cancelled</a></li>
      `
    }
  }

  // Add delivery mode filter dropdown
  const filterContainer = document.querySelector(".d-flex.flex-wrap.mb-2.mb-md-0")
  if (filterContainer) {
    const deliveryModeFilter = document.createElement("div")
    deliveryModeFilter.className = "dropdown me-2 mb-2 mb-md-0"
    deliveryModeFilter.innerHTML = `
      <button class="btn btn-outline-secondary dropdown-toggle" type="button" id="deliveryModeFilter" data-bs-toggle="dropdown" aria-expanded="false">
        <i class="bi bi-truck me-1"></i> Delivery Mode: All
      </button>
      <ul class="dropdown-menu" aria-labelledby="deliveryModeFilter">
        <li><a class="dropdown-item delivery-mode-filter" href="#" data-mode="all">All Modes</a></li>
        <li><a class="dropdown-item delivery-mode-filter" href="#" data-mode="pickup">Pickup</a></li>
        <li><a class="dropdown-item delivery-mode-filter" href="#" data-mode="delivery">Delivery</a></li>
      </ul>
    `
    filterContainer.appendChild(deliveryModeFilter)

    // Add event listeners for delivery mode filter
    document.querySelectorAll(".delivery-mode-filter").forEach((filter) => {
      filter.addEventListener("click", function (e) {
        e.preventDefault()
        const mode = this.getAttribute("data-mode")
        retailerFilters.deliveryMode = mode
        document.getElementById("deliveryModeFilter").innerHTML =
          `<i class="bi bi-truck me-1"></i> Delivery Mode: ${mode.charAt(0).toUpperCase() + mode.slice(1)}`
        loadRetailerOrders()
      })
    })
  }

  // Add order stage tabs
  const tabsContainer = document.querySelector(".row.mb-4")
  if (tabsContainer && tabsContainer.nextElementSibling) {
    const tabsRow = document.createElement("div")
    tabsRow.className = "row mb-3"
    tabsRow.innerHTML = `
      <div class="col-12">
        <ul class="nav nav-tabs" id="orderStageTabs">
          <li class="nav-item">
            <a class="nav-link active" id="all-orders-tab" data-bs-toggle="tab" href="#" role="tab" aria-selected="true">All Orders</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" id="place-order-tab" data-bs-toggle="tab" href="#" role="tab" aria-selected="false">Place Order</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" id="ongoing-order-tab" data-bs-toggle="tab" href="#" role="tab" aria-selected="false">Ongoing Order</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" id="completed-order-tab" data-bs-toggle="tab" href="#" role="tab" aria-selected="false">Completed Order</a>
          </li>
        </ul>
      </div>
    `
    tabsContainer.parentNode.insertBefore(tabsRow, tabsContainer.nextElementSibling)

    // Add event listeners for tabs
    document.getElementById("all-orders-tab").addEventListener("click", function (e) {
      e.preventDefault()
      setActiveTab(this)
      retailerFilters.status = "all"
      loadRetailerOrders()
    })

    document.getElementById("place-order-tab").addEventListener("click", function (e) {
      e.preventDefault()
      setActiveTab(this)
      retailerFilters.status = "order"
      loadRetailerOrders()
    })

    document.getElementById("ongoing-order-tab").addEventListener("click", function (e) {
      e.preventDefault()
      setActiveTab(this)
      // Set a special flag for ongoing orders (confirmed or shipped)
      retailerFilters.status = "ongoing"
      loadRetailerOrders()
    })

    document.getElementById("completed-order-tab").addEventListener("click", function (e) {
      e.preventDefault()
      setActiveTab(this)
      // Set a special flag for completed orders (delivered)
      retailerFilters.status = "completed"
      loadRetailerOrders()
    })
  }

  // Helper function to set active tab
  function setActiveTab(tab) {
    document.querySelectorAll("#orderStageTabs .nav-link").forEach((t) => {
      t.classList.remove("active")
      t.setAttribute("aria-selected", "false")
    })
    tab.classList.add("active")
    tab.setAttribute("aria-selected", "true")
  }
})

// Define showLoadingOverlay and hideLoadingOverlay functions
function showLoadingOverlay(message = "Loading...") {
  // Implement your loading overlay logic here
  console.log("Showing loading overlay:", message)
}

function hideLoadingOverlay() {
  // Implement your loading overlay hiding logic here
  console.log("Hiding loading overlay")
}

// Declare the variables
let refreshOrderDetails
let currentViewingOrderId
const orderStatus = {
  renderStatusBadge: (status, deliveryMode, pickupStatus) => {
    let statusClass = ""
    let statusText = ""

    if (deliveryMode === "pickup") {
      switch (pickupStatus) {
        case "ready-to-pickup":
          statusClass = "bg-primary"
          statusText = "Ready for Pickup"
          break
        case "picked-up":
          statusClass = "bg-success"
          statusText = "Picked Up"
          break
        default:
          switch (status) {
            case "order":
              statusClass = "bg-warning text-dark"
              statusText = "Order"
              break
            case "confirmed":
              statusClass = "bg-success"
              statusText = "Confirmed"
              break
            case "cancelled":
              statusClass = "bg-danger"
              statusText = "Cancelled"
              break
            default:
              statusClass = "bg-secondary"
              statusText = "Unknown"
          }
      }
    } else {
      switch (status) {
        case "order":
          statusClass = "bg-warning text-dark"
          statusText = "Order"
          break
        case "confirmed":
          statusClass = "bg-success"
          statusText = "Confirmed"
          break
        case "shipped":
          statusClass = "bg-primary"
          statusText = "Shipped"
          break
        case "delivered":
          statusClass = "bg-info"
          statusText = "Delivered"
          break
        case "cancelled":
          statusClass = "bg-danger"
          statusText = "Cancelled"
          break
        default:
          statusClass = "bg-secondary"
          statusText = "Unknown"
      }
    }

    return `<span class="badge ${statusClass}">${statusText}</span>`
  },
}
