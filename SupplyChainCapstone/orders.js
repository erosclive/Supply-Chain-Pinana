// Global variables
let currentPage = 1
const itemsPerPage = 10
let totalPages = 1
let currentOrders = []
let allProducts = []
const deliveredOrders = [] // Add this line
const currentFilters = {
  status: "all",
  dateRange: "all",
  startDate: null,
  endDate: null,
  search: "",
}

// Initialize the page
document.addEventListener("DOMContentLoaded", () => {
  // Initialize sidebar toggle for mobile
  initSidebar()

  // Initialize date pickers
  initDatePickers()

  // Load products for order form
  loadProducts()

  // Load orders
  loadOrders()

  // Initialize event listeners
  initEventListeners()

  // Initialize order form
  initOrderForm()
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
    // Order date picker in form
    if (typeof flatpickr !== "undefined") {
      flatpickr("#orderDate", {
        enableTime: false,
        dateFormat: "Y-m-d",
        defaultDate: new Date(),
        clickOpens: false, // Prevent the calendar from opening when clicked
        disableMobile: true, // Disable mobile input
      })

      // Date range pickers
      flatpickr("#dateRangeStart", {
        enableTime: false,
        dateFormat: "Y-m-d",
      })

      flatpickr("#dateRangeEnd", {
        enableTime: false,
        dateFormat: "Y-m-d",
      })
    } else {
      console.warn("flatpickr is not defined. Date pickers may not work properly.")
    }
  } catch (error) {
    console.error("Error initializing date pickers:", error)
  }
}

// Initialize event listeners
function initEventListeners() {
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

  // Refresh button - Simplified implementation
  document.querySelectorAll(".refresh-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      // Show loading spinner
      const tableBody = document.getElementById("orders-table-body")
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
  document.getElementById("createOrderBtn").addEventListener("click", () => {
    resetOrderForm()
    document.getElementById("orderModalLabel").textContent = "Create New Order"
  })

  // Save order button
  document.getElementById("saveOrderBtn").addEventListener("click", () => {
    saveOrder()
  })

  // Edit order button in view modal
  document.getElementById("editOrderBtn").addEventListener("click", () => {
    const orderId = document.getElementById("viewOrderId").textContent

    try {
      const viewOrderModal = document.getElementById("viewOrderModal")
      if (viewOrderModal && typeof bootstrap !== "undefined") {
        const modal = bootstrap.Modal.getInstance(viewOrderModal)
        if (modal) {
          modal.hide()
        }
      }

      // Find the order and populate the form
      const order = currentOrders.find((o) => o.order_id === orderId)
      if (order) {
        populateOrderForm(order)
        document.getElementById("orderModalLabel").textContent = "Edit Order"

        const orderModal = document.getElementById("orderModal")
        if (orderModal && typeof bootstrap !== "undefined") {
          const modal = new bootstrap.Modal(orderModal)
          modal.show()
        }
      }
    } catch (error) {
      console.error("Error handling edit order:", error)
      showAlert("danger", "Error opening edit form. Please try again.")
    }
  })

  // Print order button
  document.getElementById("printOrderBtn").addEventListener("click", () => {
    printOrder()
  })

  // Confirm delete button
  document.getElementById("confirmDeleteBtn").addEventListener("click", () => {
    const orderId = document.getElementById("deleteOrderId").textContent
    deleteOrder(orderId)
  })

  // Add event listener to clear form when modal is closed
  const orderModal = document.getElementById("orderModal")
  if (orderModal) {
    orderModal.addEventListener("hidden.bs.modal", () => {
      resetOrderForm()
    })

    // Also add event listener to the cancel button
    const cancelBtn = orderModal.querySelector('button[data-bs-dismiss="modal"]')
    if (cancelBtn) {
      cancelBtn.addEventListener("click", () => {
        resetOrderForm()
      })
    }
  }
}

// Initialize order form
function initOrderForm() {
  // Add item button
  document.getElementById("addItemBtn").addEventListener("click", () => {
    addOrderItemRow()
  })

  // Initial order item row event listeners
  const initialRow = document.querySelector(".order-item-row")
  if (initialRow) {
    setupOrderItemRowListeners(initialRow)
  }

  // Order discount input
  document.getElementById("orderDiscount").addEventListener("input", () => {
    calculateOrderTotals()
  })

  // Add validation for customer name field
  const customerNameInput = document.getElementById("customerName")
  if (customerNameInput) {
    customerNameInput.addEventListener("input", function () {
      validateCustomerName(this)
    })

    customerNameInput.addEventListener("invalid", function () {
      if (!this.value.trim()) {
        this.setCustomValidity("Customer name cannot be empty or contain only spaces")
      } else if (!/^[A-Za-z0-9\s\-',.()]+$/.test(this.value)) {
        this.setCustomValidity("Customer name cannot contain special characters")
      }
    })
  }

  // Add validation for customer email field
  const customerEmailInput = document.getElementById("customerEmail")
  if (customerEmailInput) {
    customerEmailInput.addEventListener("input", function () {
      this.setCustomValidity("")
    })
  }

  // Add validation for customer phone field
  const customerPhoneInput = document.getElementById("customerPhone")
  if (customerPhoneInput) {
    customerPhoneInput.addEventListener("input", function () {
      this.setCustomValidity("")

      // Basic phone validation - allow numbers, +, -, and spaces
      if (this.value.trim() && !/^[0-9+\-\s()]+$/.test(this.value)) {
        this.setCustomValidity("Phone number can only contain numbers, +, -, spaces, and parentheses")
      }
    })
  }

  // Add validation for shipping address field
  const shippingAddressInput = document.getElementById("shippingAddress")
  if (shippingAddressInput) {
    shippingAddressInput.addEventListener("input", function () {
      // Check if input contains only whitespace
      if (!this.value.trim()) {
        this.setCustomValidity("Shipping address cannot be empty or contain only spaces")
      }
      // Check for special characters - only allow letters, numbers, spaces, hyphens, apostrophes, commas, periods, and parentheses
      else if (!/^[A-Za-z0-9\s\-',.()]+$/.test(this.value)) {
        this.setCustomValidity("Shipping address cannot contain special characters")
      } else {
        this.setCustomValidity("")
      }
    })

    shippingAddressInput.addEventListener("invalid", function () {
      if (!this.value.trim()) {
        this.setCustomValidity("Shipping address cannot be empty or contain only spaces")
      } else if (!/^[A-Za-z0-9\s\-',.()]+$/.test(this.value)) {
        this.setCustomValidity("Shipping address cannot contain special characters")
      }
    })
  }
}

// Validate customer name
function validateCustomerName(input) {
  // Check if input contains only whitespace
  if (!input.value.trim()) {
    input.setCustomValidity("Customer name cannot be empty or contain only spaces")
    return false
  }

  // Check for special characters - only allow letters, numbers, spaces, hyphens, apostrophes, commas, periods, and parentheses
  const pattern = /^[A-Za-z0-9\s\-',.()]+$/
  if (!pattern.test(input.value)) {
    input.setCustomValidity("Customer name cannot contain special characters")
    return false
  } else {
    input.setCustomValidity("")
    return true
  }
}

// Setup event listeners for order item row
function setupOrderItemRowListeners(row) {
  // Product select change
  const productSelect = row.querySelector(".product-select")
  productSelect.addEventListener("change", function () {
    const productId = this.value
    const product = allProducts.find((p) => p.product_id === productId)

    if (product) {
      const priceInput = row.querySelector(".item-price")
      priceInput.value = Number.parseFloat(product.price).toFixed(2)

      // Update quantity max based on stock
      const quantityInput = row.querySelector(".item-quantity")
      quantityInput.max = product.stocks

      // Calculate row total
      calculateRowTotal(row)
    }
  })

  // Quantity change
  const quantityInput = row.querySelector(".item-quantity")
  quantityInput.addEventListener("input", () => {
    calculateRowTotal(row)
  })

  // Remove item button
  const removeBtn = row.querySelector(".remove-item")
  removeBtn.addEventListener("click", () => {
    // Don't remove if it's the only row
    const rows = document.querySelectorAll(".order-item-row")
    if (rows.length > 1) {
      row.remove()
      calculateOrderTotals()
    } else {
      showAlert("warning", "Order must have at least one item")
    }
  })
}

// Add a new order item row
function addOrderItemRow() {
  const orderItemsBody = document.getElementById("orderItemsBody")
  const newRow = document.createElement("tr")
  newRow.className = "order-item-row"

  // Create row HTML
  newRow.innerHTML = `
        <td>
            <select class="form-select product-select" name="products[]" required>
                <option value="">Select Product</option>
                ${allProducts.map((p) => `<option value="${p.product_id}">${p.product_name}</option>`).join("")}
            </select>
        </td>
        <td>
            <input type="number" class="form-control item-quantity" name="quantities[]" min="1" value="1" required>
        </td>
        <td>
            <input type="number" class="form-control item-price" name="prices[]" step="0.01" min="0" value="0.00" required readonly>
        </td>
        <td>
            <input type="number" class="form-control item-total" step="0.01" min="0" value="0.00" readonly>
        </td>
        <td>
            <button type="button" class="btn btn-sm btn-outline-danger remove-item">
                <i class="bi bi-trash"></i>
            </button>
        </td>
    `

  orderItemsBody.appendChild(newRow)
  setupOrderItemRowListeners(newRow)
}

// Calculate row total
function calculateRowTotal(row) {
  const quantity = Number.parseFloat(row.querySelector(".item-quantity").value) || 0
  const price = Number.parseFloat(row.querySelector(".item-price").value) || 0
  const total = quantity * price

  row.querySelector(".item-total").value = total.toFixed(2)
  calculateOrderTotals()
}

// Update the calculateOrderTotals function to use percentage discount
function calculateOrderTotals() {
  let subtotal = 0

  // Sum all item totals
  document.querySelectorAll(".item-total").forEach((input) => {
    subtotal += Number.parseFloat(input.value) || 0
  })

  // Calculate discount as a percentage of subtotal
  const discountPercentage = Number.parseFloat(document.getElementById("orderDiscount").value) || 0
  const discountAmount = (subtotal * discountPercentage) / 100
  const total = subtotal - discountAmount

  // Update summary
  document.getElementById("orderSubtotal").textContent = `₱${subtotal.toFixed(2)}`
  document.getElementById("orderDiscountAmount").textContent = `₱${discountAmount.toFixed(2)}`
  document.getElementById("orderTotal").textContent = `₱${total.toFixed(2)}`
}

// Reset order form
function resetOrderForm() {
  const form = document.getElementById("orderForm")
  if (form) {
    form.reset()
  }

  document.getElementById("orderId").value = ""

  // Reset order items to just one row
  const orderItemsBody = document.getElementById("orderItemsBody")
  if (orderItemsBody) {
    orderItemsBody.innerHTML = ""

    // Add a fresh row
    addOrderItemRow()
  }

  // Reset totals
  calculateOrderTotals()

  // Set current date
  const orderDateInput = document.getElementById("orderDate")
  if (orderDateInput) {
    try {
      // Get today's date in YYYY-MM-DD format
      const today = new Date().toISOString().split("T")[0]

      // Set the value directly first to ensure it's visible
      orderDateInput.value = today

      if (typeof flatpickr !== "undefined") {
        // Initialize flatpickr with today's date
        const fp = flatpickr("#orderDate", {
          enableTime: false,
          dateFormat: "Y-m-d",
          defaultDate: today,
          clickOpens: true,
          disableMobile: true,
        })
      }
    } catch (error) {
      console.error("Error setting date:", error)
      // Fallback if flatpickr fails
      orderDateInput.value = new Date().toISOString().split("T")[0]
    }
  }

  // Clear any validation messages
  const inputs = form.querySelectorAll("input, select, textarea")
  inputs.forEach((input) => {
    input.setCustomValidity("")
  })
}

// Populate order form with order data
function populateOrderForm(order) {
  // Reset form first
  resetOrderForm()

  // Set basic order info
  document.getElementById("orderId").value = order.order_id
  document.getElementById("customerName").value = order.customer_name
  document.getElementById("customerEmail").value = order.customer_email || ""
  document.getElementById("customerPhone").value = order.customer_phone || ""

  // Set order date
  if (document.getElementById("orderDate") && order.order_date) {
    try {
      if (typeof flatpickr !== "undefined") {
        // For existing orders, show their original date but still allow editing
        const fp = flatpickr("#orderDate", {
          enableTime: false,
          dateFormat: "Y-m-d",
          defaultDate: order.order_date,
          // Allow the calendar to open when clicked for existing orders too
          clickOpens: true,
          disableMobile: true,
        })

        // Make sure the date is set
        document.getElementById("orderDate").value = order.order_date
      } else {
        document.getElementById("orderDate").value = order.order_date
      }
    } catch (error) {
      console.error("Error setting date:", error)
      document.getElementById("orderDate").value = order.order_date
    }
  }

  document.getElementById("shippingAddress").value = order.shipping_address || ""
  document.getElementById("orderStatus").value = order.status
  document.getElementById("paymentMethod").value = order.payment_method
  // Update the populateOrderForm function to handle percentage discount
  // Find this section in the populateOrderForm function and replace it:
  document.getElementById("orderDiscount").value = Number.parseFloat(order.discount_percentage || 0).toFixed(2)
  document.getElementById("orderNotes").value = order.notes || ""

  // Clear existing items
  const orderItemsBody = document.getElementById("orderItemsBody")
  orderItemsBody.innerHTML = ""

  // Add order items
  if (order.items && order.items.length > 0) {
    order.items.forEach((item) => {
      const newRow = document.createElement("tr")
      newRow.className = "order-item-row"

      // Create the row HTML
      newRow.innerHTML = `
        <td>
          <select class="form-select product-select" name="products[]" required>
            <option value="">Select Product</option>
            ${allProducts.map((p) => `<option value="${p.product_id}" ${p.product_id === item.product_id ? "selected" : ""}>${p.product_name}</option>`).join("")}
          </select>
        </td>
        <td>
          <input type="number" class="form-control item-quantity" name="quantities[]" min="1" value="${item.quantity}" required>
        </td>
        <td>
          <input type="number" class="form-control item-price" name="prices[]" step="0.01" min="0" value="${Number.parseFloat(item.price).toFixed(2)}" required readonly>
        </td>
        <td>
          <input type="number" class="form-control item-total" step="0.01" min="0" value="${(Number.parseFloat(item.price) * Number.parseInt(item.quantity)).toFixed(2)}" readonly>
        </td>
        <td>
          <button type="button" class="btn btn-sm btn-outline-danger remove-item">
            <i class="bi bi-trash"></i>
          </button>
        </td>
      `

      orderItemsBody.appendChild(newRow)
      setupOrderItemRowListeners(newRow)

      // Ensure the product is properly selected by setting it directly
      const productSelect = newRow.querySelector(".product-select")
      if (productSelect) {
        productSelect.value = item.product_id

        // Trigger change event to update price and calculations
        const changeEvent = new Event("change", { bubbles: true })
        productSelect.dispatchEvent(changeEvent)
      }
    })
  } else {
    // Add a fresh row if no items
    addOrderItemRow()
  }

  // Calculate totals
  calculateOrderTotals()
}

// Load products for order form
function loadProducts() {
  fetch("order_operations.php?action=get_products")
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`)
      }
      return response.json()
    })
    .then((data) => {
      if (data.success) {
        allProducts = data.products

        // Populate product dropdowns
        const productSelects = document.querySelectorAll(".product-select")
        productSelects.forEach((select) => {
          select.innerHTML = '<option value="">Select Product</option>'
          allProducts.forEach((product) => {
            const option = document.createElement("option")
            option.value = product.product_id
            option.textContent = product.product_name
            select.appendChild(option)
          })
        })
      } else {
        showAlert("danger", "Failed to load products: " + data.message)
      }
    })
    .catch((error) => {
      console.error("Error loading products:", error)
      showAlert("danger", "Error loading products. Please try again.")
    })
}

// Load orders with current filters
function loadOrders(showLoading = true) {
  if (showLoading) {
    document.getElementById("orders-table-body").innerHTML = `
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

  // Build query string directly
  let queryString = `order_operations.php?action=get_orders&page=${currentPage}&limit=${itemsPerPage}&status=${currentFilters.status}&date_range=${currentFilters.dateRange}&exclude_tax=true`

  if (currentFilters.search) {
    queryString += `&search=${encodeURIComponent(currentFilters.search)}`
  }

  if (currentFilters.dateRange === "custom" && currentFilters.startDate && currentFilters.endDate) {
    queryString += `&start_date=${encodeURIComponent(currentFilters.startDate)}&end_date=${encodeURIComponent(currentFilters.endDate)}`
  }

  // Add a filter to exclude delivered orders
  queryString += "&exclude_delivered=true"

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
        document.getElementById("orderCount").textContent =
          `Showing ${data.orders.length} of ${data.total_count} orders`
      } else {
        showAlert("danger", "Failed to load orders: " + (data.message || "Unknown error"))
        document.getElementById("orders-table-body").innerHTML = `
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
      showAlert("danger", "Error loading orders. Please try again.")
      document.getElementById("orders-table-body").innerHTML = `
                <tr>
                    <td colspan="7" class="text-center py-4">
                        <div class="text-danger">
                            <i class="bi bi-exclamation-triangle-fill fs-1 mb-3"></i>
                            <p>Error loading orders. Please try again.</p>
                        </div>
                    </td>
                </tr>
            `
    })
}

// Render orders in the table
function renderOrders(orders) {
  const tableBody = document.getElementById("orders-table-body")

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
        statusClass = "bg-info text-dark"
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
                    <div class="small text-muted">${order.order_time || ""}</div>
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
  const pagination = document.getElementById("ordersPagination")
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

// View order details
function viewOrder(orderId) {
  fetch(`order_operations.php?action=get_order_details&order_id=${orderId}&exclude_tax=true`)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`)
      }
      return response.json()
    })
    .then((data) => {
      if (data.success) {
        const order = data.order

        // Store the complete order in currentOrders for easier editing later
        const existingOrderIndex = currentOrders.findIndex((o) => o.order_id === order.order_id)
        if (existingOrderIndex >= 0) {
          // Update existing order with complete data including items
          currentOrders[existingOrderIndex] = order
        } else {
          // Add to currentOrders if not already there
          currentOrders.push(order)
        }

        // Populate view modal
        document.getElementById("viewOrderId").textContent = order.order_id
        document.getElementById("viewOrderDate").textContent = new Date(order.order_date).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })

        // Status with badge
        let statusClass = ""
        switch (order.status) {
          case "pending":
            statusClass = "bg-warning text-dark"
            break
          case "processing":
            statusClass = "bg-info text-dark"
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

        document.getElementById("viewOrderStatus").innerHTML =
          `<span class="badge ${statusClass}">${order.status.charAt(0).toUpperCase() + order.status.slice(1)}</span>`

        // Payment method
        document.getElementById("viewPaymentMethod").textContent = order.payment_method
          .replace("_", " ")
          .replace(/\b\w/g, (l) => l.toUpperCase())

        // Customer info
        document.getElementById("viewCustomerName").textContent = order.customer_name
        document.getElementById("viewCustomerEmail").textContent = order.customer_email || "N/A"
        document.getElementById("viewCustomerPhone").textContent = order.customer_phone || "N/A"
        document.getElementById("viewShippingAddress").textContent = order.shipping_address || "N/A"

        // Order items
        const itemsContainer = document.getElementById("viewOrderItems")
        itemsContainer.innerHTML = ""

        if (order.items && order.items.length > 0) {
          order.items.forEach((item) => {
            const row = document.createElement("tr")
            const itemTotal = Number.parseFloat(item.price) * Number.parseInt(item.quantity)

            row.innerHTML = `
                            <td>${item.product_name}</td>
                            <td>${item.quantity}</td>
                            <td>₱${Number.parseFloat(item.price).toFixed(2)}</td>
                            <td class="text-end">₱${itemTotal.toFixed(2)}</td>
                        `

            itemsContainer.appendChild(row)
          })
        } else {
          itemsContainer.innerHTML = `
                        <tr>
                            <td colspan="4" class="text-center">No items found</td>
                        </tr>
                    `
        }

        // Order totals
        document.getElementById("viewOrderSubtotal").textContent = `₱${Number.parseFloat(order.subtotal).toFixed(2)}`
        document.getElementById("viewOrderDiscount").textContent = `₱${Number.parseFloat(order.discount).toFixed(2)}`
        document.getElementById("viewOrderTotal").textContent = `₱${Number.parseFloat(order.total_amount).toFixed(2)}`

        // Notes
        document.getElementById("viewOrderNotes").textContent = order.notes || "No notes available."

        // Order timeline
        renderOrderTimeline(order)

        // Show modal
        try {
          if (typeof bootstrap !== "undefined") {
            const viewOrderModal = new bootstrap.Modal(document.getElementById("viewOrderModal"))
            viewOrderModal.show()
          } else {
            console.warn("Bootstrap is not defined. Modal may not work properly.")
          }
        } catch (error) {
          console.error("Error showing modal:", error)
        }
      } else {
        showAlert("danger", "Failed to load order details: " + (data.message || "Unknown error"))
      }
    })
    .catch((error) => {
      console.error("Error loading order details:", error)
      showAlert("danger", "Error loading order details. Please try again.")
    })
}

// Render order timeline
function renderOrderTimeline(order) {
  const timelineContainer = document.getElementById("orderTimeline")
  if (!timelineContainer) return

  timelineContainer.innerHTML = ""

  // Create timeline based on status
  const statuses = ["pending", "processing", "shipped", "delivered"]
  const statusLabels = {
    pending: "Order Placed",
    processing: "Processing",
    shipped: "Shipped",
    cancelled: "Cancelled",
    delivered: "Delivered",
  }

  // If order is cancelled, show different timeline
  if (order.status === "cancelled") {
    const cancelledItem = document.createElement("div")
    cancelledItem.className = "timeline-item active"
    cancelledItem.innerHTML = `
            <div class="timeline-icon">
                <i class="bi bi-x-circle"></i>
            </div>
            <div class="timeline-content">
                <div class="fw-medium">Order Cancelled</div>
                <div class="small text-muted">${new Date(order.updated_at || order.order_date).toLocaleString()}</div>
            </div>
        `
    timelineContainer.appendChild(cancelledItem)

    const placedItem = document.createElement("div")
    placedItem.className = "timeline-item completed"
    placedItem.innerHTML = `
            <div class="timeline-icon">
                <i class="bi bi-check-circle"></i>
            </div>
            <div class="timeline-content">
                <div class="fw-medium">Order Placed</div>
                <div class="small text-muted">${new Date(order.order_date).toLocaleString()}</div>
            </div>
        `
    timelineContainer.appendChild(placedItem)

    return
  }

  // Regular order timeline
  const currentStatusIndex = statuses.indexOf(order.status)

  statuses.forEach((status, index) => {
    const timelineItem = document.createElement("div")

    // Determine if this status is completed, active, or upcoming
    let itemClass = "timeline-item"
    let iconClass = "bi bi-circle"

    if (index < currentStatusIndex) {
      itemClass += " completed"
      iconClass = "bi bi-check-circle"
    } else if (index === currentStatusIndex) {
      itemClass += " active"
      iconClass = "bi bi-circle-fill"
    }

    timelineItem.className = itemClass
    timelineItem.innerHTML = `
            <div class="timeline-icon">
                <i class="${iconClass}"></i>
            </div>
            <div class="timeline-content">
                <div class="fw-medium">${statusLabels[status]}</div>
                <div class="small text-muted">
                    ${index <= currentStatusIndex ? new Date(order.status_updates?.[status]?.date || order.order_date).toLocaleString() : "Pending"}
                </div>
            </div>
        `

    timelineContainer.appendChild(timelineItem)
  })
}

// Enhance the editOrder function to ensure we get complete order data when editing

// Replace the existing editOrder function with this improved version:

// Edit order
function editOrder(orderId) {
  // Show loading in the modal
  document.getElementById("orderModalLabel").textContent = "Edit Order"
  resetOrderForm()

  // First check if we already have the order in our current list
  const order = currentOrders.find((o) => o.order_id === orderId)

  if (order && order.items) {
    // If we have the complete order with items, use it directly
    populateOrderForm(order)

    try {
      if (typeof bootstrap !== "undefined") {
        const orderModal = new bootstrap.Modal(document.getElementById("orderModal"))
        orderModal.show()
      } else {
        console.warn("Bootstrap is not defined. Modal may not work properly.")
      }
    } catch (error) {
      console.error("Error showing modal:", error)
    }
  } else {
    // If order not in current list or doesn't have items, fetch it
    // Show loading indicator in the form
    const orderItemsBody = document.getElementById("orderItemsBody")
    if (orderItemsBody) {
      orderItemsBody.innerHTML = `
        <tr>
          <td colspan="5" class="text-center py-3">
            <div class="spinner-border spinner-border-sm text-primary" role="status">
              <span class="visually-hidden">Loading...</span>
            </div>
            <span class="ms-2">Loading order details...</span>
          </td>
        </tr>
      `
    }

    // Show the modal while loading
    try {
      if (typeof bootstrap !== "undefined") {
        const orderModal = new bootstrap.Modal(document.getElementById("orderModal"))
        orderModal.show()
      }
    } catch (error) {
      console.error("Error showing modal:", error)
    }

    // Fetch complete order details
    fetch(`order_operations.php?action=get_order_details&order_id=${orderId}&exclude_tax=true`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`)
        }
        return response.json()
      })
      .then((data) => {
        if (data.success) {
          // Populate the form with the fetched order data
          populateOrderForm(data.order)
        } else {
          showAlert("danger", "Failed to load order details: " + (data.message || "Unknown error"))
          // Reset the form if there was an error
          resetOrderForm()
        }
      })
      .catch((error) => {
        console.error("Error loading order details:", error)
        showAlert("danger", "Error loading order details. Please try again.")
        // Reset the form if there was an error
        resetOrderForm()
      })
  }
}

// Confirm delete order
function confirmDeleteOrder(orderId) {
  document.getElementById("deleteOrderId").textContent = orderId
  try {
    if (typeof bootstrap !== "undefined") {
      const deleteModal = new bootstrap.Modal(document.getElementById("deleteOrderModal"))
      deleteModal.show()
    } else {
      console.warn("Bootstrap is not defined. Modal may not work properly.")
    }
  } catch (error) {
    console.error("Error showing modal:", error)
  }
}

// Delete order
function deleteOrder(orderId) {
  fetch("order_operations.php", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: `action=delete_order&order_id=${orderId}`,
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`)
      }
      return response.json()
    })
    .then((data) => {
      if (data.success) {
        showAlert("success", "Order deleted successfully")

        // Close modal
        try {
          if (typeof bootstrap !== "undefined") {
            const deleteModal = bootstrap.Modal.getInstance(document.getElementById("deleteOrderModal"))
            if (deleteModal) {
              deleteModal.hide()
            }
          }
        } catch (error) {
          console.error("Error hiding modal:", error)
        }

        // Reload orders
        loadOrders()
      } else {
        showAlert("danger", "Failed to delete order: " + (data.message || "Unknown error"))
      }
    })
    .catch((error) => {
      console.error("Error deleting order:", error)
      showAlert("danger", "Error deleting order. Please try again.")
    })
}

// Save order (create or update)
function saveOrder() {
  // Validate form
  const form = document.getElementById("orderForm")
  if (!form.checkValidity()) {
    form.reportValidity()
    return
  }

  // Get form data
  const formData = new FormData(form)
  const orderId = document.getElementById("orderId").value

  // Add action
  formData.append("action", orderId ? "update_order" : "create_order")

  // Send request
  fetch("order_operations.php", {
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
        showAlert("success", orderId ? "Order updated successfully" : "Order created successfully")

        // Close modal
        try {
          if (typeof bootstrap !== "undefined") {
            const orderModal = bootstrap.Modal.getInstance(document.getElementById("orderModal"))
            if (orderModal) {
              orderModal.hide()
            }
          }
        } catch (error) {
          console.error("Error hiding modal:", error)
        }

        // Reload orders
        loadOrders()
      } else {
        showAlert("danger", "Failed to save order: " + (data.message || "Unknown error"))
      }
    })
    .catch((error) => {
      console.error("Error saving order:", error)
      showAlert("danger", "Error saving order. Please try again.")
    })
}

// Print order
function printOrder() {
  const printWindow = window.open("", "_blank")
  const orderId = document.getElementById("viewOrderId").textContent
  const orderDate = document.getElementById("viewOrderDate").textContent
  const customerName = document.getElementById("viewCustomerName").textContent
  const orderStatus = document
    .getElementById("viewOrderStatus")
    .textContent.replace(/<[^>]*>/g, "")
    .trim()
  const orderItems = document.getElementById("viewOrderItems").innerHTML
  const subtotal = document.getElementById("viewOrderSubtotal").textContent
  const discount = document.getElementById("viewOrderDiscount").textContent
  const total = document.getElementById("viewOrderTotal").textContent

  printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Order #${orderId} - Piñana Gourmet</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    margin: 0;
                    padding: 20px;
                    color: #333;
                }
                .header {
                    text-align: center;
                    margin-bottom: 20px;
                    padding-bottom: 10px;
                    border-bottom: 1px solid #ddd;
                }
                .logo {
                    max-width: 150px;
                    margin-bottom: 10px;
                }
                .order-info {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 20px;
                }
                .order-info div {
                    flex: 1;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-bottom: 20px;
                }
                th, td {
                    padding: 10px;
                    text-align: left;
                    border-bottom: 1px solid #ddd;
                }
                th {
                    background-color: #f5f5f5;
                }
                .text-end {
                    text-align: right;
                }
                .totals {
                    width: 300px;
                    margin-left: auto;
                }
                .totals div {
                    display: flex;
                    justify-content: space-between;
                    padding: 5px 0;
                }
                .totals .total {
                    font-weight: bold;
                    border-top: 1px solid #ddd;
                    padding-top: 10px;
                    margin-top: 5px;
                }
                .footer {
                    margin-top: 40px;
                    text-align: center;
                    font-size: 12px;
                    color: #777;
                }
                @media print {
                    body {
                        print-color-adjust: exact;
                        -webkit-print-color-adjust: exact;
                    }
                }
            </style>
        </head>
        <body>
            <div class="header">
                <img src="images/final-dark.png" alt="Piñana Gourmet" class="logo">
                <h2>Order Receipt</h2>
            </div>
            
            <div class="order-info">
                <div>
                    <p><strong>Order ID:</strong> ${orderId}</p>
                    <p><strong>Date:</strong> ${orderDate}</p>
                    <p><strong>Status:</strong> ${orderStatus}</p>
                </div>
                <div>
                    <p><strong>Customer:</strong> ${customerName}</p>
                    <p><strong>Shipping Address:</strong> ${document.getElementById("viewShippingAddress").textContent}</p>
                </div>
            </div>
            
            <h3>Order Items</h3>
            <table>
                <thead>
                    <tr>
                        <th>Product</th>
                        <th>Quantity</th>
                        <th>Price</th>
                        <th class="text-end">Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${orderItems}
                </tbody>
            </table>
            
            <div class="totals">
                <div>
                    <span>Subtotal:</span>
                    <span>${subtotal}</span>
                </div>
                <div>
                    <span>Discount:</span>
                    <span>${discount}</span>
                </div>
                <div class="total">
                    <span>Total:</span>
                    <span>${total}</span>
                </div>
            </div>
            
            <div class="footer">
                <p>Thank you for your order!</p>
                <p>Piñana Gourmet - Premium Pineapple Products</p>
            </div>
            
            <script>
                window.onload = function() {
                    window.print();
                    setTimeout(function() {
                        window.close();
                    }, 500);
                };
            </script>
        </body>
        </html>
    `)

  printWindow.document.close()
}

// Export orders to CSV
function exportOrders() {
  // Show a loading indicator
  showAlert("info", "Preparing export file...")

  // Apply current filters
  let queryString = `order_operations.php?action=export_orders&status=${currentFilters.status}&date_range=${currentFilters.dateRange}&export=csv&exclude_tax=true`

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
  downloadLink.download = `pinana_gourmet_orders_${dateString}.csv`
  document.body.appendChild(downloadLink)
  downloadLink.click()
  document.body.removeChild(downloadLink)

  // Show success message after a short delay
  setTimeout(() => {
    showAlert("success", "Export completed successfully")
  }, 1000)
}

// Show alert message
function showAlert(type, message) {
  // Create alert element
  const alertDiv = document.createElement("div")
  alertDiv.className = `alert alert-${type} alert-dismissible fade show position-fixed top-0 end-0 m-3`
  alertDiv.setAttribute("role", "alert")
  alertDiv.style.zIndex = "9999"
  alertDiv.style.maxWidth = "350px"
  alertDiv.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.15)"

  // Alert content
  alertDiv.innerHTML = `
        <div class="d-flex align-items-center">
            <i class="bi ${getAlertIcon(type)} me-2"></i>
            <div>${message}</div>
        </div>
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `

  // Add to document
  document.body.appendChild(alertDiv)

  // Auto-dismiss after 3 seconds
  setTimeout(() => {
    try {
      if (typeof bootstrap !== "undefined") {
        const bsAlert = new bootstrap.Alert(alertDiv)
        bsAlert.close()
      } else {
        alertDiv.remove()
      }
    } catch (error) {
      console.error("Error closing alert:", error)
      alertDiv.remove()
    }
  }, 3000)
}

// Get alert icon based on type
function getAlertIcon(type) {
  switch (type) {
    case "success":
      return "bi-check-circle-fill text-success"
    case "danger":
      return "bi-exclamation-circle-fill text-danger"
    case "warning":
      return "bi-exclamation-triangle-fill text-warning"
    case "info":
      return "bi-info-circle-fill text-info"
    default:
      return "bi-bell-fill"
  }
}

// Reset order form
function resetOrderFormLocal() {
  const form = document.getElementById("orderForm")
  if (form) {
    form.reset()
  }

  // Clear order items
  const orderItemsBody = document.getElementById("orderItemsBody")
  if (orderItemsBody) {
    orderItemsBody.innerHTML = ""
  }

  // Clear order ID
  document.getElementById("orderId").value = ""

  // Hide delete button
  const deleteButton = document.getElementById("deleteOrderButton")
  if (deleteButton) {
    deleteButton.style.display = "none"
  }
}

// Update the viewOrder function to display discount percentage
// Find the section where order totals are set in the viewOrder function and add:
document.getElementById("viewOrderDiscountPercentage").textContent =
  `${Number.parseFloat(order.discount_percentage || 0).toFixed(2)}%`

// Update the printOrder function to include discount percentage
// Find the section in printOrder function where totals are added to the print template and add:
const discountPercentage = document.getElementById("viewOrderDiscountPercentage").textContent

// Then in the HTML template section of printOrder, add this line before the discount amount:
//div>
//spanDiscount Rate:/span
//span$
//{
//discountPercentage
//}
//span/span
//div
