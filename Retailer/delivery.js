// Global variables
let allOrders = []
let filteredOrders = []
let currentFilter = "all"
let currentDateRange = "all"
let currentSearch = ""
let currentPage = 1
let selectedOrderId = null
let currentUser = null

// Initialize the delivery management page
document.addEventListener("DOMContentLoaded", () => {
  // Fetch current user data
  fetchCurrentUser()

  // Set up event listeners
  setupEventListeners()

  // Fetch orders with initial settings
  fetchOrders()
})

// Fetch current user data
function fetchCurrentUser() {
  fetch("get_current_user.php")
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok")
      }
      return response.json()
    })
    .then((data) => {
      if (data.success) {
        currentUser = data.user
        console.log("Current user data loaded:", currentUser)
      } else {
        console.error("Failed to load user data:", data.message)
      }
    })
    .catch((error) => {
      console.error("Error fetching current user:", error)
    })
}

// Set up event listeners
function setupEventListeners() {
  // Refresh button
  const refreshBtn = document.getElementById("refresh-btn")
  if (refreshBtn) {
    refreshBtn.addEventListener("click", fetchOrders)
  }

  // Status filter
  const statusFilter = document.getElementById("status-filter")
  if (statusFilter) {
    statusFilter.addEventListener("change", function () {
      currentFilter = this.value
      currentPage = 1
      applyFilters()
    })
  }

  // Date filter
  const dateFilter = document.getElementById("date-filter")
  if (dateFilter) {
    dateFilter.addEventListener("change", function () {
      currentDateRange = this.value
      currentPage = 1
      applyFilters()
    })
  }

  // Search input
  const searchInput = document.getElementById("order-search")
  if (searchInput) {
    searchInput.addEventListener(
      "input",
      debounce(() => {
        currentSearch = searchInput.value.trim()
        currentPage = 1
        applyFilters()
      }, 500),
    )
  }

  // Confirm receive button
  const confirmReceiveBtn = document.getElementById("confirm-receive-btn")
  if (confirmReceiveBtn) {
    confirmReceiveBtn.addEventListener("click", submitReceiveOrder)
  }

  // Submit issue button
  const submitIssueBtn = document.getElementById("submit-issue-btn")
  if (submitIssueBtn) {
    submitIssueBtn.addEventListener("click", submitReportIssue)
  }

  // Set today's date as default for receive date
  const receiveDateInput = document.getElementById("receive-date")
  if (receiveDateInput) {
    receiveDateInput.valueAsDate = new Date()
  }
}

// Fetch orders from the server
function fetchOrders() {
  const ordersTableBody = document.getElementById("orders-table-body")
  if (!ordersTableBody) return

  // Show loading indicator
  ordersTableBody.innerHTML = `
    <tr>
      <td colspan="7" class="text-center py-3">
        <div class="spinner-border spinner-border-sm text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
        <span class="ms-2">Loading orders...</span>
      </td>
    </tr>
  `

  // Build query parameters
  let params = `?status=${currentFilter}&date_range=${currentDateRange}`

  if (currentSearch) {
    params += `&search=${encodeURIComponent(currentSearch)}`
  }

  // Fetch orders from server using our new endpoint
  fetch(`get_delivery_orders.php${params}`)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok")
      }
      return response.json()
    })
    .then((data) => {
      if (data.success) {
        // Store orders
        allOrders = data.orders

        // Apply filters
        applyFilters()

        // Update stats
        updateOrderStats()
      } else {
        throw new Error(data.message || "Failed to fetch orders")
      }
    })
    .catch((error) => {
      console.error("Error fetching orders:", error)
      ordersTableBody.innerHTML = `
        <tr>
          <td colspan="7" class="text-center py-3 text-danger">
            <i class="bi bi-exclamation-triangle me-2"></i>
            Error loading orders. Please try again.
          </td>
        </tr>
      `
    })
}

// Apply filters to orders
function applyFilters() {
  // Start with all orders
  let result = [...allOrders]

  // Apply status filter
  if (currentFilter !== "all") {
    result = result.filter((order) => order.status === currentFilter)
  }

  // Apply search filter
  if (currentSearch) {
    result = result.filter(
      (order) =>
        order.po_number.toLowerCase().includes(currentSearch.toLowerCase()) ||
        order.retailer_name.toLowerCase().includes(currentSearch.toLowerCase()),
    )
  }

  // Apply date filter
  if (currentDateRange !== "all") {
    const today = new Date()
    const todayStr = formatDate(today)

    if (currentDateRange === "today") {
      result = result.filter((order) => order.order_date === todayStr)
    } else if (currentDateRange === "week") {
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      result = result.filter((order) => new Date(order.order_date) >= weekAgo)
    } else if (currentDateRange === "month") {
      const monthAgo = new Date()
      monthAgo.setDate(monthAgo.getDate() - 30)
      result = result.filter((order) => new Date(order.order_date) >= monthAgo)
    }
  }

  // Store filtered orders
  filteredOrders = result

  // Render orders
  renderOrders()
}

// Format date to YYYY-MM-DD
function formatDate(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

// Render orders in the table
function renderOrders() {
  const ordersTableBody = document.getElementById("orders-table-body")
  if (!ordersTableBody) return

  if (filteredOrders.length === 0) {
    ordersTableBody.innerHTML = `
      <tr>
        <td colspan="7" class="text-center py-3">
          No orders found. ${currentSearch ? "Try a different search term." : ""}
        </td>
      </tr>
    `
    return
  }

  let html = ""

  filteredOrders.forEach((order) => {
    // Format dates
    const orderDate = formatDisplayDate(order.order_date)
    const expectedDelivery =
      order.expected_delivery && order.expected_delivery !== "0000-00-00"
        ? formatDisplayDate(order.expected_delivery)
        : order.delivery_mode === "pickup" && order.pickup_date
          ? formatDisplayDate(order.pickup_date)
          : "N/A"

    // Determine if action buttons should be enabled
    const canReceive = order.status === "shipped" || order.status === "confirmed"
    const canReportIssue = order.status === "shipped" || order.status === "delivered" || order.status === "confirmed"

    html += `
      <tr>
        <td class="font-weight-medium">${order.po_number || order.order_id}</td>
        <td>${order.retailer_name}</td>
        <td class="d-none d-md-table-cell">${orderDate}</td>
        <td class="d-none d-md-table-cell">${expectedDelivery}</td>
        <td>${getStatusBadgeHTML(order.status)}</td>
        <td class="d-none d-md-table-cell">${getDeliveryModeBadgeHTML(order.delivery_mode)}</td>
        <td>
          <div class="action-buttons">
            <button class="action-btn action-btn-view" title="View Details" onclick="viewOrderDetails('${order.order_id}')">
              <i class="bi bi-eye"></i>
            </button>
            ${
              canReceive
                ? `
              <button class="action-btn action-btn-receive" title="Mark as Received" onclick="showReceiveModal('${order.order_id}')">
                <i class="bi bi-check"></i>
              </button>
            `
                : ""
            }
            ${
              canReportIssue
                ? `
              <button class="action-btn action-btn-issue" title="Report Issue" onclick="showIssueModal('${order.order_id}')">
                <i class="bi bi-exclamation-triangle"></i>
              </button>
            `
                : ""
            }
          </div>
        </td>
      </tr>
    `
  })

  ordersTableBody.innerHTML = html
}

// Format date for display (MM/DD/YYYY)
function formatDisplayDate(dateString) {
  if (!dateString || dateString === "0000-00-00") return "N/A"

  const date = new Date(dateString)
  return date.toLocaleDateString()
}

// Get HTML for status badge
function getStatusBadgeHTML(status) {
  let badgeClass = ""
  let statusText = ""

  switch (status) {
    case "order":
      badgeClass = "status-order"
      statusText = "Order Placed"
      break
    case "processing":
      badgeClass = "status-processing"
      statusText = "Processing"
      break
    case "confirmed":
      badgeClass = "status-confirmed"
      statusText = "Confirmed"
      break
    case "shipped":
      badgeClass = "status-shipped"
      statusText = "Shipped"
      break
    case "delivered":
      badgeClass = "status-delivered"
      statusText = "Delivered"
      break
    case "issue":
      badgeClass = "status-issue"
      statusText = "Issue Reported"
      break
    case "cancelled":
      badgeClass = "status-cancelled"
      statusText = "Cancelled"
      break
    default:
      badgeClass = ""
      statusText = status.charAt(0).toUpperCase() + status.slice(1)
  }

  return `<span class="status-badge ${badgeClass}">${statusText}</span>`
}

// Get HTML for delivery mode badge
function getDeliveryModeBadgeHTML(mode) {
  if (mode === "pickup") {
    return `<span class="badge bg-warning">Pickup</span>`
  } else {
    return `<span class="badge bg-info">Delivery</span>`
  }
}

// Update order stats
function updateOrderStats() {
  // Count total orders
  document.getElementById("total-orders").textContent = allOrders.length

  // Count pending orders (status = confirmed or shipped)
  const pendingOrders = allOrders.filter((order) => order.status === "confirmed" || order.status === "shipped").length
  document.getElementById("pending-orders").textContent = pendingOrders

  // Count delivered orders
  const deliveredOrders = allOrders.filter((order) => order.status === "delivered").length
  document.getElementById("delivered-orders").textContent = deliveredOrders

  // Count issues
  const issueOrders = allOrders.filter((order) => order.status === "issue").length
  document.getElementById("issue-orders").textContent = issueOrders
}

// View order details
function viewOrderDetails(orderId) {
  // Set selected order ID
  selectedOrderId = orderId

  // Find order in allOrders
  const order = allOrders.find((o) => o.order_id == orderId)

  if (!order) {
    showResponseMessage("danger", "Order not found")
    return
  }

  // Format dates
  const orderDate = formatDisplayDate(order.order_date)
  const expectedDelivery =
    order.expected_delivery && order.expected_delivery !== "0000-00-00"
      ? formatDisplayDate(order.expected_delivery)
      : "N/A"
  const pickupDate =
    order.pickup_date && order.pickup_date !== "0000-00-00" ? formatDisplayDate(order.pickup_date) : "N/A"

  // Set order details in modal
  document.getElementById("view-order-number").textContent = order.po_number || order.order_id
  document.getElementById("view-order-date").textContent = orderDate
  document.getElementById("view-order-status").innerHTML = getStatusBadgeHTML(order.status)
  document.getElementById("view-delivery-mode").innerHTML = getDeliveryModeBadgeHTML(order.delivery_mode)

  // Set delivery/pickup details
  if (order.delivery_mode === "pickup") {
    document.getElementById("view-pickup-details").style.display = "block"
    document.getElementById("view-delivery-details").style.display = "none"
    document.getElementById("view-pickup-location").textContent = order.pickup_location || "Not specified"
    document.getElementById("view-pickup-date").textContent = pickupDate
  } else {
    document.getElementById("view-pickup-details").style.display = "none"
    document.getElementById("view-delivery-details").style.display = "block"
    document.getElementById("view-expected-delivery").textContent = expectedDelivery
    document.getElementById("view-delivery-address").textContent = order.retailer_address || "Not specified"
  }

  // Set retailer information
  document.getElementById("view-retailer-name").textContent = order.retailer_name
  document.getElementById("view-retailer-email").textContent = order.retailer_email
  document.getElementById("view-retailer-contact").textContent = order.retailer_contact || "N/A"
  document.getElementById("view-retailer-address").textContent = order.retailer_address || "N/A"
  document.getElementById("view-notes").textContent = order.notes || "No notes available"

  // Format amounts
  document.getElementById("view-subtotal").textContent = Number.parseFloat(order.subtotal).toFixed(2)
  document.getElementById("view-discount").textContent = Number.parseFloat(order.discount || 0).toFixed(2)
  document.getElementById("view-total-amount").textContent = Number.parseFloat(order.total_amount).toFixed(2)

  // Fetch order items and status history
  fetchOrderDetails(orderId)

  // Set action buttons based on order status
  const actionButtonsContainer = document.getElementById("order-action-buttons")
  if (actionButtonsContainer) {
    let buttonsHTML = ""

    // Determine which buttons to show based on status
    const canReceive = order.status === "shipped" || order.status === "confirmed"
    const canReportIssue = order.status === "shipped" || order.status === "delivered" || order.status === "confirmed"

    if (canReceive) {
      buttonsHTML += `
        <button type="button" class="btn btn-success" onclick="showReceiveModal('${orderId}')">
          <i class="bi bi-check-circle me-1"></i> Mark as Received
        </button>
      `
    }

    if (canReportIssue) {
      buttonsHTML += `
        <button type="button" class="btn btn-outline-danger ms-2" onclick="showIssueModal('${orderId}')">
          <i class="bi bi-exclamation-triangle me-1"></i> Report Issue
        </button>
      `
    }

    actionButtonsContainer.innerHTML = buttonsHTML
  }

  // Show modal
  const orderDetailsModal = new bootstrap.Modal(document.getElementById("orderDetailsModal"))
  orderDetailsModal.show()
}

// Fetch order details (items and status history)
function fetchOrderDetails(orderId) {
  fetch(`get_order_details.php?order_id=${orderId}`)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok")
      }
      return response.json()
    })
    .then((data) => {
      if (data.success) {
        // Render order items
        renderOrderItems(data.items)

        // Render status history
        renderStatusHistory(data.status_history)
      } else {
        console.error("Failed to fetch order details:", data.message)
      }
    })
    .catch((error) => {
      console.error("Error fetching order details:", error)
    })
}

// Render order items
function renderOrderItems(items) {
  const orderItemsContainer = document.getElementById("view-order-items")
  if (!orderItemsContainer) return

  if (!items || items.length === 0) {
    orderItemsContainer.innerHTML = `
      <tr>
        <td colspan="4" class="text-center py-3">No items found for this order</td>
      </tr>
    `
    return
  }

  let html = ""
  items.forEach((item) => {
    const unitPrice = Number.parseFloat(item.unit_price).toFixed(2)
    const totalPrice = Number.parseFloat(item.total_price || item.unit_price * item.quantity).toFixed(2)

    html += `
      <tr>
        <td>${item.product_name || "Unknown Product"}</td>
        <td>₱${unitPrice}</td>
        <td>${item.quantity}</td>
        <td>₱${totalPrice}</td>
      </tr>
    `
  })

  orderItemsContainer.innerHTML = html
}

// Render status history
function renderStatusHistory(history) {
  const timelineContainer = document.getElementById("status-timeline")
  if (!timelineContainer) return

  if (!history || history.length === 0) {
    // If no history, show current status
    const order = allOrders.find((o) => o.order_id == selectedOrderId)
    if (order) {
      timelineContainer.innerHTML = `
        <div class="status-timeline">
          <div class="status-timeline-item">
            <div class="status-timeline-dot"></div>
            <div class="status-timeline-content">
              <div class="status-timeline-title">${formatStatus(order.status)}</div>
              <div class="status-timeline-date">${formatDisplayDate(order.order_date)}</div>
              <div class="status-timeline-notes">Initial status</div>
            </div>
          </div>
        </div>
      `
    } else {
      timelineContainer.innerHTML = `<p class="text-muted">No status history available</p>`
    }
    return
  }

  // Sort history by date (newest first)
  const sortedHistory = [...history].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  let html = `<div class="status-timeline">`

  sortedHistory.forEach((status) => {
    const statusDate = new Date(status.created_at).toLocaleString()

    html += `
      <div class="status-timeline-item">
        <div class="status-timeline-dot"></div>
        <div class="status-timeline-content">
          <div class="status-timeline-title">${formatStatus(status.status)}</div>
          <div class="status-timeline-date">${statusDate}</div>
          ${status.notes ? `<div class="status-timeline-notes">${status.notes}</div>` : ""}
        </div>
      </div>
    `
  })

  html += `</div>`
  timelineContainer.innerHTML = html
}

// Format status text
function formatStatus(status) {
  switch (status) {
    case "order":
      return "Order Placed"
    case "processing":
      return "Processing"
    case "confirmed":
      return "Confirmed"
    case "shipped":
      return "Shipped"
    case "delivered":
      return "Delivered"
    case "issue":
      return "Issue Reported"
    case "cancelled":
      return "Cancelled"
    default:
      return status.charAt(0).toUpperCase() + status.slice(1)
  }
}

// Show receive order modal
function showReceiveModal(orderId) {
  // Set selected order ID
  selectedOrderId = orderId
  document.getElementById("receive-order-id").value = orderId

  // Set today's date as default
  document.getElementById("receive-date").valueAsDate = new Date()
  document.getElementById("receive-notes").value = ""

  // Close details modal if open
  const detailsModal = bootstrap.Modal.getInstance(document.getElementById("orderDetailsModal"))
  if (detailsModal) {
    detailsModal.hide()
  }

  // Show receive modal
  const receiveModal = new bootstrap.Modal(document.getElementById("receiveOrderModal"))
  receiveModal.show()
}

// Show report issue modal
function showIssueModal(orderId) {
  // Set selected order ID
  selectedOrderId = orderId
  document.getElementById("issue-order-id").value = orderId

  // Reset form
  document.getElementById("issue-type").value = "damaged"
  document.getElementById("issue-severity").value = "medium"
  document.getElementById("issue-description").value = ""
  document.getElementById("requested-action").value = "replacement"

  // Close details modal if open
  const detailsModal = bootstrap.Modal.getInstance(document.getElementById("orderDetailsModal"))
  if (detailsModal) {
    detailsModal.hide()
  }

  // Show issue modal
  const issueModal = new bootstrap.Modal(document.getElementById("reportIssueModal"))
  issueModal.show()
}

// Submit receive order
function submitReceiveOrder() {
  const orderId = document.getElementById("receive-order-id").value
  const receiveDate = document.getElementById("receive-date").value
  const notes = document.getElementById("receive-notes").value

  if (!orderId || !receiveDate) {
    showResponseMessage("danger", "Please fill in all required fields")
    return
  }

  // Create form data
  const formData = new FormData()
  formData.append("action", "receive_order")
  formData.append("order_id", orderId)
  formData.append("receive_date", receiveDate)
  formData.append("notes", notes)

  // Send request to server
  fetch("update_order_status.php", {
    method: "POST",
    body: formData,
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok")
      }
      return response.json()
    })
    .then((data) => {
      if (data.success) {
        // Close modal
        const receiveModal = bootstrap.Modal.getInstance(document.getElementById("receiveOrderModal"))
        receiveModal.hide()

        // Show success message
        showResponseMessage("success", "Order marked as received successfully")

        // Update order status locally
        updateOrderStatusLocally(orderId, "delivered", notes)

        // Refresh orders
        fetchOrders()
      } else {
        showResponseMessage("danger", data.message || "Failed to update order status")
      }
    })
    .catch((error) => {
      console.error("Error updating order status:", error)
      showResponseMessage("danger", "Error connecting to the server. Please try again.")
    })
}

// Submit report issue
function submitReportIssue() {
  const orderId = document.getElementById("issue-order-id").value
  const issueType = document.getElementById("issue-type").value
  const issueSeverity = document.getElementById("issue-severity").value
  const issueDescription = document.getElementById("issue-description").value
  const requestedAction = document.getElementById("requested-action").value

  if (!orderId || !issueType || !issueDescription || !requestedAction) {
    showResponseMessage("danger", "Please fill in all required fields")
    return
  }

  // Create form data
  const formData = new FormData()
  formData.append("action", "report_issue")
  formData.append("order_id", orderId)
  formData.append("issue_type", issueType)
  formData.append("issue_severity", issueSeverity)
  formData.append("issue_description", issueDescription)
  formData.append("requested_action", requestedAction)

  // Send request to server
  fetch("update_order_status.php", {
    method: "POST",
    body: formData,
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok")
      }
      return response.json()
    })
    .then((data) => {
      if (data.success) {
        // Close modal
        const issueModal = bootstrap.Modal.getInstance(document.getElementById("reportIssueModal"))
        issueModal.hide()

        // Show success message
        showResponseMessage("success", "Issue reported successfully")

        // Update order status locally
        updateOrderStatusLocally(orderId, "issue", `Issue reported: ${issueDescription}`)

        // Refresh orders
        fetchOrders()
      } else {
        showResponseMessage("danger", data.message || "Failed to report issue")
      }
    })
    .catch((error) => {
      console.error("Error reporting issue:", error)
      showResponseMessage("danger", "Error connecting to the server. Please try again.")
    })
}

// Update order status locally
function updateOrderStatusLocally(orderId, status, notes) {
  allOrders = allOrders.map((order) => {
    if (order.order_id == orderId) {
      return {
        ...order,
        status: status,
      }
    }
    return order
  })

  // Apply filters again
  applyFilters()
}

// Show response message
function showResponseMessage(type, message) {
  const responseMessage = document.getElementById("response-message")
  if (!responseMessage) return

  // Set message content and type
  responseMessage.className = `alert alert-${type} alert-dismissible fade show`
  responseMessage.innerHTML = `
    ${message}
    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
  `

  // Show the message
  responseMessage.style.display = "block"

  // Auto-dismiss after 5 seconds
  setTimeout(() => {
    if (responseMessage.parentNode) {
      try {
        // Check if bootstrap is defined
        if (typeof bootstrap !== "undefined") {
          const bsAlert = new bootstrap.Alert(responseMessage)
          bsAlert.close()
        } else {
          console.error("Bootstrap is not defined. Ensure Bootstrap is properly loaded.")
          responseMessage.style.display = "none" // Fallback if Bootstrap is not available
        }
      } catch (error) {
        console.error("Bootstrap Alert error:", error)
        // Fallback to removing the element if Bootstrap Alert fails
        responseMessage.style.display = "none"
      }
    }
  }, 5000)
}

// Debounce function for search input
function debounce(func, wait) {
  let timeout
  return function () {
    const args = arguments
    clearTimeout(timeout)
    timeout = setTimeout(() => {
      func.apply(this, args)
    }, wait)
  }
}
