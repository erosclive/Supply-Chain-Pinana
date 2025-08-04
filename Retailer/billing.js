// Global variables
let completedOrders = []
const inventoryProducts = []
let paidOrders = [] // New variable for paid orders
let inProcessOrders = [] // New variable for in-process orders

// Declare bootstrap variable if it's not already declared
if (typeof bootstrap === "undefined") {
  bootstrap = window.bootstrap
}

// Initialize the inventory page
document.addEventListener("DOMContentLoaded", () => {
  console.log("Initializing inventory page")

  // Set up tab change event listeners
  setupTabListeners()

  // Initialize all badge counters with loading spinners
  initializeBadgeCounters()

  // Fetch all data for all tabs immediately
  fetchAllTabData()

  // Set up event listeners
  setupEventListeners()

  // Set up payment confirmation buttons
  setupPaymentConfirmationButtons()
})

// Initialize badge counters with loading spinners
function initializeBadgeCounters() {
  const consignmentCount = document.querySelector(".consignment-count")
  const inProcessCount = document.querySelector(".in-process-count")
  const paidCount = document.querySelector(".paid-count")

  if (consignmentCount) {
    consignmentCount.innerHTML =
      '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>'
  }

  if (inProcessCount) {
    inProcessCount.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>'
  }

  if (paidCount) {
    paidCount.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>'
  }
}

// Fetch data for all tabs
function fetchAllTabData() {
  // Fetch completed orders first (since it's the active tab)
  fetchCompletedOrders()

  // Fetch other tabs data immediately as well
  fetchInProcessOrders()
  fetchPaidOrders()
}
// Set up tab change event listeners
function setupTabListeners() {
  const tabs = document.querySelectorAll('button[data-bs-toggle="tab"]')
  tabs.forEach((tab) => {
    tab.addEventListener("shown.bs.tab", (event) => {
      const targetId = event.target.getAttribute("data-bs-target")
      if (targetId === "#consignment") {
        // Refresh consignment orders when switching to consignment tab
        fetchCompletedOrders()
      } else if (targetId === "#in-process") {
        // Refresh in-process orders when switching to in-process tab
        fetchInProcessOrders()
      } else if (targetId === "#paid") {
        // Refresh paid orders when switching to paid tab
        fetchPaidOrders()
      }
    })
  })
}

// Update tab badges with counts
function updateTabBadges() {
  // Update consignment count
  const consignmentCount = document.querySelector(".consignment-count")
  if (consignmentCount) {
    consignmentCount.textContent = completedOrders.length || "0"
  }

  // Update in-process count
  const inProcessCount = document.querySelector(".in-process-count")
  if (inProcessCount) {
    inProcessCount.textContent = inProcessOrders.length || "0"
  }

  // Update paid count
  const paidCount = document.querySelector(".paid-count")
  if (paidCount) {
    paidCount.textContent = paidOrders.length || "0"
  }
}

// Fetch completed orders from the server
function fetchCompletedOrders() {
  const inventoryContainer = document.getElementById("consignment-inventory-container")
  if (!inventoryContainer) {
    console.error("Inventory container not found")
    return
  }

  // Show loading indicator
  inventoryContainer.innerHTML = `
        <div class="text-center py-5">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
            <div class="mt-3">Loading consignment inventory...</div>
        </div>
    `

  // Fetch completed orders from server
  fetch("fetch_completed_orders.php")
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.status}`)
      }
      return response.json()
    })
    .then((data) => {
      if (data.success) {
        // Store orders
        completedOrders = data.orders || []
        console.log("Number of completed orders:", completedOrders.length)

        // Render orders
        renderCompletedOrders(completedOrders)

        // Update tab badges after data is loaded
        updateTabBadges()
      } else {
        throw new Error(data.message || "Failed to fetch completed orders")
      }
    })
    .catch((error) => {
      console.error("Error fetching completed orders:", error)
      inventoryContainer.innerHTML = `
        <div class="alert alert-danger" role="alert">
          <i class="bi bi-exclamation-triangle-fill me-2"></i>
          Error loading consignment inventory: ${error.message}
          <button class="btn btn-outline-danger btn-sm ms-3" onclick="fetchCompletedOrders()">
            <i class="bi bi-arrow-clockwise me-1"></i> Try Again
          </button>
        </div>
      `

      // Set count to 0 on error
      const consignmentCount = document.querySelector(".consignment-count")
      if (consignmentCount) {
        consignmentCount.textContent = "0"
      }
    })
}

// Fetch paid orders from the server
function fetchPaidOrders() {
  const paidOrdersContainer = document.getElementById("paid-orders-container")
  if (!paidOrdersContainer) {
    console.error("Paid orders container not found")
    return
  }

  // Show loading indicator
  paidOrdersContainer.innerHTML = `
        <div class="text-center py-5">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
            <div class="mt-3">Loading paid orders...</div>
        </div>
    `

  // Fetch paid orders from server
  fetch("fetch_paid_orders.php")
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.status}`)
      }
      return response.json()
    })
    .then((data) => {
      if (data.success) {
        // Store orders
        paidOrders = data.orders || []
        console.log("Number of paid orders:", paidOrders.length)

        // Render orders
        renderPaidOrders(paidOrders)

        // Update tab badges after data is loaded
        updateTabBadges()
      } else {
        throw new Error(data.message || "Failed to fetch paid orders")
      }
    })
    .catch((error) => {
      console.error("Error fetching paid orders:", error)
      paidOrdersContainer.innerHTML = `
                <div class="alert alert-danger" role="alert">
                    <i class="bi bi-exclamation-triangle-fill me-2"></i>
                    Error loading paid orders: ${error.message}
                    <button class="btn btn-outline-danger btn-sm ms-3" onclick="fetchPaidOrders()">
                        <i class="bi bi-arrow-clockwise me-1"></i> Try Again
                    </button>
                </div>
            `

      // Set count to 0 on error
      const paidCount = document.querySelector(".paid-count")
      if (paidCount) {
        paidCount.textContent = "0"
      }
    })
}

// Fetch in-process orders from the server
function fetchInProcessOrders() {
  const inProcessOrdersContainer = document.getElementById("in-process-orders-container")
  if (!inProcessOrdersContainer) {
    console.error("In-process orders container not found")
    return
  }

  // Show loading indicator
  inProcessOrdersContainer.innerHTML = `
        <div class="text-center py-5">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
            <div class="mt-3">Loading in-process orders...</div>
        </div>
    `

  // Fetch in-process orders from server
  fetch("fetch_in_process_orders.php")
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.status}`)
      }
      return response.json()
    })
    .then((data) => {
      if (data.success) {
        // Store orders
        inProcessOrders = data.orders || []
        console.log("Number of in-process orders:", inProcessOrders.length)

        // Render orders
        renderInProcessOrders(inProcessOrders)

        // Update tab badges after data is loaded
        updateTabBadges()
      } else {
        throw new Error(data.message || "Failed to fetch in-process orders")
      }
    })
    .catch((error) => {
      console.error("Error fetching in-process orders:", error)
      inProcessOrdersContainer.innerHTML = `
                <div class="alert alert-danger" role="alert">
                    <i class="bi bi-exclamation-triangle-fill me-2"></i>
                    Error loading in-process orders: ${error.message}
                    <button class="btn btn-outline-danger btn-sm ms-3" onclick="fetchInProcessOrders()">
                        <i class="bi bi-arrow-clockwise me-1"></i> Try Again
                    </button>
                </div>
            `

      // Set count to 0 on error
      const inProcessCount = document.querySelector(".in-process-count")
      if (inProcessCount) {
        inProcessCount.textContent = "0"
      }
    })
}

// Render completed orders as horizontal cards
function renderCompletedOrders(orders) {
  const inventoryContainer = document.getElementById("consignment-inventory-container")
  if (!inventoryContainer) {
    console.error("Inventory container not found in renderCompletedOrders")
    return
  }

  // Clear the container
  inventoryContainer.innerHTML = ""

  // If no orders, show a message
  if (!orders || orders.length === 0) {
    inventoryContainer.innerHTML = `
            <div class="alert alert-info" role="alert">
                <i class="bi bi-info-circle me-2"></i>
                No completed orders found in consignment inventory.
            </div>
        `
    return
  }

  // Create a row for the cards
  const row = document.createElement("div")
  row.className = "row g-3"

  // Loop through orders and create cards
  orders.forEach((order) => {
    // Get order number (PO number or order ID)
    const orderNumber = order.po_number || order.order_id

    // Get consignment term
    const consignmentTerm = order.consignment_term || 30 // Default to 30 days if not set

    // Calculate days remaining
    const daysRemaining = order.days_remaining

    // Calculate days since start
    const daysSinceStart = order.days_since_start

    // Determine status color based on days remaining
    let statusClass = "bg-success"
    let statusText = "Active"

    if (daysRemaining < 0) {
      statusClass = "bg-danger"
      statusText = "Expired"
    } else if (daysRemaining < 7) {
      statusClass = "bg-warning"
      statusText = "Ending Soon"
    }

    // Format dates
    const startDate = new Date(order.created_at).toLocaleDateString()
    const endDate = new Date(
      new Date(order.created_at).getTime() + consignmentTerm * 24 * 60 * 60 * 1000,
    ).toLocaleDateString()

    // Determine payment status styling
    let paymentStatusClass = ""
    if (order.payment_status === "Partial") {
      paymentStatusClass = "bg-warning-subtle" // Light yellow background for partial payment
    }

    // Create the card HTML
    const cardHtml = `
            <div class="col-md-6 col-lg-4 mb-3">
                <div class="card consignment-card h-100 ${paymentStatusClass}">
                    <div class="card-header d-flex justify-content-between align-items-center">
                        <h6 class="mb-0">
                            <i class="bi bi-box me-2"></i> Order #${orderNumber}
                        </h6>
                        <span class="badge ${statusClass}">${statusText}</span>
                    </div>
                    <div class="card-body">
                        <div class="mb-3">
                            <div class="d-flex justify-content-between mb-2">
                                <span class="text-muted"><i class="bi bi-calendar-check me-1"></i> Consignment Term:</span>
                                <span class="fw-medium">${consignmentTerm} days</span>
                            </div>
                            <div class="d-flex justify-content-between mb-2">
                                <span class="text-muted"><i class="bi bi-calendar-date me-1"></i> Start Date:</span>
                                <span class="fw-medium">${startDate}</span>
                            </div>
                            <div class="d-flex justify-content-between mb-2">
                                <span class="text-muted"><i class="bi bi-calendar-date me-1"></i> End Date:</span>
                                <span class="fw-medium">${endDate}</span>
                            </div>
                            <div class="d-flex justify-content-between mb-2">
                                <span class="text-muted"><i class="bi bi-clock-history me-1"></i> Days Since Start:</span>
                                <span class="fw-medium">${daysSinceStart} days</span>
                            </div>
                            <div class="d-flex justify-content-between">
                                <span class="text-muted"><i class="bi bi-clock me-1"></i> Days Remaining:</span>
                                <span class="fw-bold ${daysRemaining < 0 ? "text-danger" : daysRemaining < 7 ? "text-warning" : "text-success"}">
                                    ${daysRemaining < 0 ? "Expired" : daysRemaining + " days"}
                                </span>
                            </div>
                        </div>
                        
                        <div class="progress mb-3" style="height: 10px;">
                            <div class="progress-bar ${statusClass}" role="progressbar" 
                                style="width: ${Math.min(100, (daysSinceStart / consignmentTerm) * 100)}%;" 
                                aria-valuenow="${daysSinceStart}" 
                                aria-valuemin="0" 
                                aria-valuemax="${consignmentTerm}">
                            </div>
                        </div>
                        
                        <div class="d-flex justify-content-between align-items-center">
                            <span class="text-muted small">Total Items: ${order.items ? order.items.length : 0}</span>
                            <span class="fw-bold">₱${Number.parseFloat(order.total_amount).toFixed(2)}</span>
                        </div>
                        <div class="d-flex justify-content-between align-items-center mt-2">
                            <span class="text-muted small">Payment Status:</span>
                            <span class="fw-bold ${order.payment_status === "Paid" ? "text-success" : order.payment_status === "Partial" ? "text-warning" : "text-danger"}">
                              ${order.payment_status || "Unpaid"}
                            </span>
                        </div>
                        ${
                          order.payment_status === "Partial"
                            ? `<div class="alert alert-warning mt-2 mb-0 py-2 small">
                              <i class="bi bi-exclamation-triangle-fill me-1"></i>
                              Contact supplier for remaining payments and return of unsold products.
                           </div>`
                            : ""
                        }
                    </div>
                    <div class="card-footer d-flex justify-content-between">
                        <button class="btn btn-primary btn-sm view-details-btn" data-id="${order.order_id}">
                            <i class="bi bi-eye me-1"></i> View Details
                        </button>
                        ${
                          order.payment_status === "pending" || !order.payment_status
                            ? `<button class="btn btn-success btn-sm pay-now-btn" data-id="${order.order_id}">
                              <i class="bi bi-cash-coin me-1"></i> Pay Now
                           </button>`
                            : ""
                        }
                    </div>
                </div>
            </div>
        `

    // Add the card to the row
    row.innerHTML += cardHtml
  })

  // Add the row to the container
  inventoryContainer.appendChild(row)

  // Set up event listeners for the view details buttons
  setupViewDetailsButtons()

  // Set up event listeners for the "Pay Now" buttons
  setupPayNowButtons()
}

// Render paid orders as horizontal cards
function renderPaidOrders(orders) {
  const paidOrdersContainer = document.getElementById("paid-orders-container")
  if (!paidOrdersContainer) {
    console.error("Paid orders container not found in renderPaidOrders")
    return
  }

  // Clear the container
  paidOrdersContainer.innerHTML = ""

  // If no orders, show a message
  if (!orders || orders.length === 0) {
    paidOrdersContainer.innerHTML = `
            <div class="alert alert-info" role="alert">
                <i class="bi bi-info-circle me-2"></i>
                No paid orders found.
            </div>
        `
    return
  }

  // Create a row for the cards
  const row = document.createElement("div")
  row.className = "row g-3"

  // Loop through orders and create cards
  orders.forEach((order) => {
    // Get order number (PO number or order ID)
    const orderNumber = order.po_number || order.order_id

    // Get consignment term
    const consignmentTerm = order.consignment_term || 30 // Default to 30 days if not set

    // Calculate days remaining
    const daysRemaining = order.days_remaining

    // Calculate days since start
    const daysSinceStart = order.days_since_start

    // Format dates
    const startDate = new Date(order.created_at).toLocaleDateString()
    const endDate = new Date(
      new Date(order.created_at).getTime() + consignmentTerm * 24 * 60 * 60 * 1000,
    ).toLocaleDateString()

    // Create the card HTML
    const cardHtml = `
            <div class="col-md-6 col-lg-4 mb-3">
                <div class="card consignment-card h-100 bg-success-subtle">
                    <div class="card-header d-flex justify-content-between align-items-center">
                        <h6 class="mb-0">
                            <i class="bi bi-box me-2"></i> Order #${orderNumber}
                        </h6>
                        <span class="badge bg-success">Paid</span>
                    </div>
                    <div class="card-body">
                        <div class="mb-3">
                            <div class="d-flex justify-content-between mb-2">
                                <span class="text-muted"><i class="bi bi-calendar-check me-1"></i> Consignment Term:</span>
                                <span class="fw-medium">${consignmentTerm} days</span>
                            </div>
                            <div class="d-flex justify-content-between mb-2">
                                <span class="text-muted"><i class="bi bi-calendar-date me-1"></i> Start Date:</span>
                                <span class="fw-medium">${startDate}</span>
                            </div>
                            <div class="d-flex justify-content-between mb-2">
                                <span class="text-muted"><i class="bi bi-calendar-date me-1"></i> End Date:</span>
                                <span class="fw-medium">${endDate}</span>
                            </div>
                            <div class="d-flex justify-content-between mb-2">
                                <span class="text-muted"><i class="bi bi-clock-history me-1"></i> Days Since Start:</span>
                                <span class="fw-medium">${daysSinceStart} days</span>
                            </div>
                        </div>
                        
                        <div class="mb-3">
                            <div class="d-flex justify-content-between mb-1">
                                <span class="text-muted"><i class="bi bi-clock me-1"></i> Consignment Status:</span>
                                <span class="fw-bold text-danger">Completed</span>
                            </div>
                            <div class="progress" style="height: 10px;">
                                <div class="progress-bar bg-danger" role="progressbar" 
                                    style="width: 100%;" 
                                    aria-valuenow="100" 
                                    aria-valuemin="0" 
                                    aria-valuemax="100">
                                </div>
                            </div>
                            <div class="d-flex justify-content-between mt-1">
                                <span class="small text-muted">Consignment period ended</span>
                                <span class="small text-muted">Payment complete</span>
                            </div>
                        </div>
                        
                        <div class="d-flex justify-content-between align-items-center">
                            <span class="text-muted small">Total Items: ${order.items ? order.items.length : 0}</span>
                            <span class="fw-bold">₱${Number.parseFloat(order.total_amount).toFixed(2)}</span>
                        </div>
                        <div class="d-flex justify-content-between align-items-center mt-2">
                            <span class="text-muted small">Payment Status:</span>
                            <span class="fw-bold text-success">Paid</span>
                        </div>
                    </div>
                    <div class="card-footer">
                        <button class="btn btn-primary btn-sm view-details-btn" data-id="${order.order_id}">
                            <i class="bi bi-eye me-1"></i> View Details
                        </button>
                    </div>
                </div>
            </div>
        `

    // Add the card to the row
    row.innerHTML += cardHtml
  })

  // Add the row to the container
  paidOrdersContainer.appendChild(row)

  // Set up event listeners for the view details buttons
  setupViewDetailsButtons()
}

// Render in-process orders as horizontal cards
function renderInProcessOrders(orders) {
  const inProcessOrdersContainer = document.getElementById("in-process-orders-container")
  if (!inProcessOrdersContainer) {
    console.error("In-process orders container not found in renderInProcessOrders")
    return
  }

  // Clear the container
  inProcessOrdersContainer.innerHTML = ""

  // If no orders, show a message
  if (!orders || orders.length === 0) {
    inProcessOrdersContainer.innerHTML = `
            <div class="alert alert-info" role="alert">
                <i class="bi bi-info-circle me-2"></i>
                No in-process orders found.
            </div>
        `
    return
  }

  // Create a row for the cards
  const row = document.createElement("div")
  row.className = "row g-3"

  // Loop through orders and create cards
  orders.forEach((order) => {
    // Get order number (PO number or order ID)
    const orderNumber = order.po_number || order.order_id

    // Get consignment term
    const consignmentTerm = order.consignment_term || 30 // Default to 30 days if not set

    // Calculate days remaining
    const daysRemaining = order.days_remaining

    // Calculate days since start
    const daysSinceStart = order.days_since_start

    // Format dates
    const startDate = new Date(order.created_at).toLocaleDateString()
    const endDate = new Date(
      new Date(order.created_at).getTime() + consignmentTerm * 24 * 60 * 60 * 1000,
    ).toLocaleDateString()

    // Create the card HTML
    const cardHtml = `
            <div class="col-md-6 col-lg-4 mb-3">
                <div class="card consignment-card h-100 bg-warning-subtle">
                    <div class="card-header d-flex justify-content-between align-items-center">
                        <h6 class="mb-0">
                            <i class="bi bi-box me-2"></i> Order #${orderNumber}
                        </h6>
                        <span class="badge bg-warning text-dark">In Process</span>
                    </div>
                    <div class="card-body">
                        <div class="mb-3">
                            <div class="d-flex justify-content-between mb-2">
                                <span class="text-muted"><i class="bi bi-calendar-check me-1"></i> Consignment Term:</span>
                                <span class="fw-medium">${consignmentTerm} days</span>
                            </div>
                            <div class="d-flex justify-content-between mb-2">
                                <span class="text-muted"><i class="bi bi-calendar-date me-1"></i> Start Date:</span>
                                <span class="fw-medium">${startDate}</span>
                            </div>
                            <div class="d-flex justify-content-between mb-2">
                                <span class="text-muted"><i class="bi bi-calendar-date me-1"></i> End Date:</span>
                                <span class="fw-medium">${endDate}</span>
                            </div>
                            <div class="d-flex justify-content-between mb-2">
                                <span class="text-muted"><i class="bi bi-clock-history me-1"></i> Days Since Start:</span>
                                <span class="fw-medium">${daysSinceStart} days</span>
                            </div>
                        </div>
                        
                        <div class="mb-3">
                            <div class="d-flex justify-content-between mb-1">
                                <span class="text-muted"><i class="bi bi-clock me-1"></i> Consignment Status:</span>
                                <span class="fw-bold text-warning">On Hold</span>
                            </div>
                            <div class="progress" style="height: 10px;">
                                <div class="progress-bar bg-warning" role="progressbar" 
                                    style="width: ${Math.min(100, (daysSinceStart / consignmentTerm) * 100)}%;" 
                                    aria-valuenow="${daysSinceStart}" 
                                    aria-valuemin="0" 
                                    aria-valuemax="${consignmentTerm}">
                                </div>
                            </div>
                            <div class="d-flex justify-content-between mt-1">
                                <span class="small text-muted">Partial payment received</span>
                                <span class="small text-muted">Awaiting completion</span>
                            </div>
                        </div>
                        
                        <div class="d-flex justify-content-between align-items-center">
                            <span class="text-muted small">Total Items: ${order.items ? order.items.length : 0}</span>
                            <span class="fw-bold">₱${Number.parseFloat(order.total_amount).toFixed(2)}</span>
                        </div>
                        <div class="d-flex justify-content-between align-items-center mt-2">
                            <span class="text-muted small">Payment Status:</span>
                            <span class="fw-bold text-warning">Partial</span>
                        </div>
                        <div class="alert alert-warning mt-2 mb-0 py-2 small">
                            <i class="bi bi-exclamation-triangle-fill me-1"></i>
                            Partial payment received. Contact supplier to complete payment.
                        </div>
                    </div>
                    <div class="card-footer">
                        <button class="btn btn-primary btn-sm view-details-btn" data-id="${order.order_id}">
                            <i class="bi bi-eye me-1"></i> View Details
                        </button>
                    </div>
                </div>
            </div>
        `

    // Add the card to the row
    row.innerHTML += cardHtml
  })

  // Add the row to the container
  inProcessOrdersContainer.appendChild(row)

  // Set up event listeners for the view details buttons
  setupViewDetailsButtons()
}

// Set up event listeners
function setupEventListeners() {
  // Add any general event listeners here

  // Example: Refresh buttons
  const refreshConsignmentBtn = document.getElementById("refresh-inventory-btn")
  if (refreshConsignmentBtn) {
    refreshConsignmentBtn.addEventListener("click", fetchCompletedOrders)
  }

  // Add refresh button for in-process orders
  const refreshInProcessBtn = document.getElementById("refresh-in-process-btn")
  if (refreshInProcessBtn) {
    refreshInProcessBtn.addEventListener("click", fetchInProcessOrders)
  }

  // Set up dynamic total price update in Pay Now modal
  document.addEventListener("input", (event) => {
    if (event.target.classList.contains("pay-quantity-input")) {
      updateTotalPrice()
    }
  })
}

// Set up view details buttons for consignment orders
function setupViewDetailsButtons() {
  const viewDetailsButtons = document.querySelectorAll(".view-details-btn")
  viewDetailsButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const orderId = this.getAttribute("data-id")
      showConsignmentDetailsModal(orderId)
    })
  })
}

// Set up event listeners for the "Pay Now" buttons
function setupPayNowButtons() {
  const payNowButtons = document.querySelectorAll(".pay-now-btn")
  payNowButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const orderId = this.getAttribute("data-id")
      showPayNowModal(orderId)
    })
  })
}

// Set up payment confirmation buttons
function setupPaymentConfirmationButtons() {
  // Cash payment confirmation
  const confirmCashPaymentBtn = document.getElementById("confirmCashPayment")
  if (confirmCashPaymentBtn) {
    confirmCashPaymentBtn.addEventListener("click", processCashPayment)
  }

  // Mobile payment confirmation
  const confirmMobilePaymentBtn = document.getElementById("confirmMobilePayment")
  if (confirmMobilePaymentBtn) {
    confirmMobilePaymentBtn.addEventListener("click", processMobilePayment)
  }
}

// Show consignment details modal
function showConsignmentDetailsModal(orderId) {
  // Find the order in completedOrders, inProcessOrders, or paidOrders
  let order = completedOrders.find((o) => o.order_id == orderId)

  // If not found in completedOrders, check inProcessOrders
  if (!order) {
    order = inProcessOrders.find((o) => o.order_id == orderId)
  }

  // If not found in inProcessOrders, check paidOrders
  if (!order) {
    order = paidOrders.find((o) => o.order_id == orderId)
  }

  if (!order) {
    showResponseMessage("danger", "Order not found")
    return
  }

  // Get order number (PO number or order ID)
  const orderNumber = order.po_number || order.order_id

  // Get consignment term
  const consignmentTerm = order.consignment_term || 30

  // Calculate days remaining
  const daysRemaining = order.days_remaining

  // Calculate days since start
  const daysSinceStart = order.days_since_start

  // Format dates
  const startDate = new Date(order.created_at).toLocaleDateString()
  const endDate = new Date(
    new Date(order.created_at).getTime() + consignmentTerm * 24 * 60 * 60 * 1000,
  ).toLocaleDateString()

  // Create modal if it doesn't exist
  let consignmentModal = document.getElementById("consignmentDetailsModal")
  if (!consignmentModal) {
    consignmentModal = document.createElement("div")
    consignmentModal.className = "modal fade"
    consignmentModal.id = "consignmentDetailsModal"
    consignmentModal.tabIndex = "-1"
    consignmentModal.setAttribute("aria-labelledby", "consignmentDetailsModalLabel")
    consignmentModal.setAttribute("aria-hidden", "true")

    consignmentModal.innerHTML = `
            <div class="modal-dialog modal-dialog-centered modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="consignmentDetailsModalLabel">
                            <i class="bi bi-box me-2"></i> Consignment Details
                        </h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body" id="consignmentDetailsModalBody">
                        <!-- Content will be dynamically inserted here -->
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                    </div>
                </div>
            </div>
        `

    document.body.appendChild(consignmentModal)
  }

  // Populate modal content
  const modalBody = document.getElementById("consignmentDetailsModalBody")

  // Determine status color based on days remaining and payment status
  let statusClass = "bg-success"
  let statusText = "Active"

  // For paid orders, always show as completed
  if (order.payment_status === "paid") {
    statusClass = "bg-danger"
    statusText = "Completed"
  } else if (order.payment_status === "Partial") {
    statusClass = "bg-warning"
    statusText = "In Process"
  } else if (daysRemaining < 0) {
    statusClass = "bg-danger"
    statusText = "Expired"
  } else if (daysRemaining < 7) {
    statusClass = "bg-warning"
    statusText = "Ending Soon"
  }

  // Create the consignment progress section based on payment status
  let progressSection = ""

  if (order.payment_status === "paid") {
    // For paid orders, show a completed progress bar
    progressSection = `
      <div class="card mb-4">
          <div class="card-header bg-light">
              <h6 class="mb-0">Consignment Progress</h6>
          </div>
          <div class="card-body">
              <div class="alert alert-success mb-3">
                  <i class="bi bi-check-circle-fill me-2"></i>
                  This consignment has been fully paid and is now complete.
              </div>
              <div class="progress mb-3" style="height: 20px;">
                  <div class="progress-bar bg-danger" role="progressbar" 
                      style="width: 100%;" 
                      aria-valuenow="100" 
                      aria-valuemin="0" 
                      aria-valuemax="100">
                      100%
                  </div>
              </div>
              <div class="d-flex justify-content-between">
                  <span class="small">${startDate}</span>
                  <span class="small">${endDate}</span>
              </div>
          </div>
      </div>
    `
  } else if (order.payment_status === "Partial") {
    // For partially paid orders, show a yellow progress bar
    progressSection = `
      <div class="card mb-4">
          <div class="card-header bg-light">
              <h6 class="mb-0">Consignment Progress</h6>
          </div>
          <div class="card-body">
              <div class="alert alert-warning mb-3">
                  <i class="bi bi-exclamation-triangle-fill me-2"></i>
                  This consignment has been partially paid and is in process.
              </div>
              <div class="progress mb-3" style="height: 20px;">
                  <div class="progress-bar bg-warning" role="progressbar" 
                      style="width: ${Math.min(100, (daysSinceStart / consignmentTerm) * 100)}%;" 
                      aria-valuenow="${daysSinceStart}" 
                      aria-valuemin="0" 
                      aria-valuemax="${consignmentTerm}">
                      ${Math.round((daysSinceStart / consignmentTerm) * 100)}%
                  </div>
              </div>
              <div class="d-flex justify-content-between">
                  <span class="small">${startDate}</span>
                  <span class="small">${endDate}</span>
              </div>
          </div>
      </div>
    `
  } else {
    // For unpaid orders, show the normal progress bar
    progressSection = `
      <div class="card mb-4">
          <div class="card-header bg-light">
              <h6 class="mb-0">Consignment Progress</h6>
          </div>
          <div class="card-body">
              <div class="progress mb-3" style="height: 20px;">
                  <div class="progress-bar ${statusClass}" role="progressbar" 
                      style="width: ${Math.min(100, (daysSinceStart / consignmentTerm) * 100)}%;" 
                      aria-valuenow="${daysSinceStart}" 
                      aria- * 100)}%;"
                      aria-valuenow="${daysSinceStart}"
                      aria-valuemin="0"
                      aria-valuemax="${consignmentTerm}">
                      ${Math.round((daysSinceStart / consignmentTerm) * 100)}%
                  </div>
              </div>
              <div class="d-flex justify-content-between">
                  <span class="small">${startDate}</span>
                  <span class="small">${endDate}</span>
              </div>
          </div>
      </div>
    `
  }

  modalBody.innerHTML = `
        <div class="row mb-4">
            <div class="col-md-6">
                <div class="card">
                    <div class="card-header bg-light">
                        <h6 class="mb-0">Consignment Information</h6>
                    </div>
                    <div class="card-body">
                        <div class="mb-2 d-flex justify-content-between">
                            <span class="text-muted">Order #:</span>
                            <span class="fw-bold">${orderNumber}</span>
                        </div>
                        <div class="mb-2 d-flex justify-content-between">
                            <span class="text-muted">Status:</span>
                            <span class="badge ${statusClass}">${statusText}</span>
                        </div>
                        <div class="mb-2 d-flex justify-content-between">
                            <span class="text-muted">Consignment Term:</span>
                            <span>${consignmentTerm} days</span>
                        </div>
                        <div class="mb-2 d-flex justify-content-between">
                            <span class="text-muted">Start Date:</span>
                            <span>${startDate}</span>
                        </div>
                        <div class="mb-2 d-flex justify-content-between">
                            <span class="text-muted">End Date:</span>
                            <span>${endDate}</span>
                        </div>
                        <div class="mb-2 d-flex justify-content-between">
                            <span class="text-muted">Days Since Start:</span>
                            <span>${daysSinceStart} days</span>
                        </div>
                        <div class="mb-2 d-flex justify-content-between">
                            <span class="text-muted">Days Remaining:</span>
                            <span class="${order.payment_status === "paid" ? "text-danger" : daysRemaining < 0 ? "text-danger" : daysRemaining < 7 ? "text-warning" : "text-success"} fw-bold">
                                ${order.payment_status === "paid" ? "Completed" : daysRemaining < 0 ? "Expired" : daysRemaining + " days"}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-md-6">
                <div class="card">
                    <div class="card-header bg-light">
                        <h6 class="mb-0">Order Information</h6>
                    </div>
                    <div class="card-body">
                        <div class="mb-2 d-flex justify-content-between">
                            <span class="text-muted">Retailer:</span>
                            <span>${order.retailer_name}</span>
                        </div>
                        <div class="mb-2 d-flex justify-content-between">
                            <span class="text-muted">Email:</span>
                            <span>${order.retailer_email}</span>
                        </div>
                        <div class="mb-2 d-flex justify-content-between">
                            <span class="text-muted">Contact:</span>
                            <span>${order.retailer_contact || "N/A"}</span>
                        </div>
                        <div class="mb-2 d-flex justify-content-between">
                            <span class="text-muted">Order Date:</span>
                            <span>${new Date(order.order_date).toLocaleDateString()}</span>
                        </div>
                        <div class="mb-2 d-flex justify-content-between">
                            <span class="text-muted">Delivery Mode:</span>
                            <span>${order.delivery_mode === "pickup" ? "Pickup" : "Delivery"}</span>
                        </div>
                        <div class="mb-2 d-flex justify-content-between">
                            <span class="text-muted">Total Amount:</span>
                            <span class="fw-bold">₱${Number.parseFloat(order.total_amount).toFixed(2)}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        ${progressSection}

        <div class="card">
            <div class="card-header bg-light">
                <h6 class="mb-0">Consigned Items</h6>
            </div>
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
                            ${
                              order.items && order.items.length > 0
                                ? order.items
                                    .map(
                                      (item, index) => `
                                    <tr>
                                        <td>${index + 1}</td>
                                        <td>${item.product_name || "Unknown Product"}</td>
                                        <td>${item.quantity}</td>
                                        <td>₱${Number.parseFloat(item.unit_price).toFixed(2)}</td>
                                        <td>₱${Number.parseFloat(item.total_price || item.quantity * item.unit_price).toFixed(2)}</td>
                                    </tr>
                                `,
                                    )
                                    .join("")
                                : '<tr><td colspan="5" class="text-center py-3">No items found for this order</td></tr>'
                            }
                        </tbody>
                        <tfoot class="table-light">
                            <tr>
                                <td colspan="4" class="text-end fw-bold">Subtotal:</td>
                                <td>₱${Number.parseFloat(order.subtotal).toFixed(2)}</td>
                            </tr>
                            <tr>
                                <td colspan="4" class="text-end">Discount:</td>
                                <td>₱${Number.parseFloat(order.discount || 0).toFixed(2)}</td>
                            </tr>
                            <tr>
                                <td colspan="4" class="text-end fw-bold">Total:</td>
                                <td class="fw-bold">₱${Number.parseFloat(order.total_amount).toFixed(2)}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
        </div>
        <div class="card mt-3">
          <div class="card-header bg-light">
            <h6 class="mb-0">Payment Status</h6>
          </div>
          <div class="card-body">
            <div class="d-flex justify-content-between">
              <span class="text-muted">Status:</span>
              <span class="fw-bold ${order.payment_status === "paid" ? "text-success" : order.payment_status === "Partial" ? "text-warning" : "text-danger"}">${order.payment_status || "Unpaid"}</span>
            </div>
            ${
              order.payment_status === "Partial"
                ? `            <div class="alert alert-warning mt-3 mb-0">
              <i class="bi bi-exclamation-triangle-fill me-2"></i>
              <strong>Note:</strong> This order has been partially paid. Please contact the supplier for:
              <ul class="mb-0 mt-2">
                <li>Arranging remaining payments</li>
                <li>Return of any unsold products</li>
                <li>Updating consignment terms if needed</li>
              </ul>
            </div>
            `
                : order.payment_status === "paid"
                  ? `
            <div class="alert alert-success mt-3 mb-0">
              <i class="bi bi-check-circle-fill me-2"></i>
              <strong>Payment Complete:</strong> This order has been fully paid.
            </div>
            `
                  : ""
            }
          </div>
        </div>
    `

  // Show the modal
  try {
    // Ensure bootstrap is available
    if (typeof bootstrap !== "undefined") {
      const bsModal = new bootstrap.Modal(consignmentModal)
      bsModal.show()
    } else {
      console.error("Bootstrap is not defined. Ensure it is properly loaded.")
      showResponseMessage("danger", "Bootstrap is not loaded. Please check your setup.")
    }
  } catch (error) {
    console.error("Bootstrap modal error:", error)
    showResponseMessage("danger", "Failed to open details modal. Please check console for errors.")
  }
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
        const bsAlert = bootstrap.Alert.getInstance(responseMessage)
        if (bsAlert) {
          bsAlert.close()
        } else {
          responseMessage.style.display = "none"
        }
      } catch (error) {
        console.error("Bootstrap Alert error:", error)
        // Fallback to removing the element if Bootstrap Alert fails
        responseMessage.style.display = "none"
      }
    }
  }, 5000)
}

// Show the "Pay Now" modal
function showPayNowModal(orderId) {
  // Find the order in completedOrders
  const order = completedOrders.find((o) => o.order_id == orderId)

  if (!order) {
    showResponseMessage("danger", "Order not found")
    return
  }

  // Create modal if it doesn't exist
  let payNowModal = document.getElementById("payNowModal")
  if (!payNowModal) {
    payNowModal = document.createElement("div")
    payNowModal.className = "modal fade"
    payNowModal.id = "payNowModal"
    payNowModal.tabIndex = "-1"
    payNowModal.setAttribute("aria-labelledby", "payNowModalLabel")
    payNowModal.setAttribute("aria-hidden", "true")

    payNowModal.innerHTML = `
      <div class="modal-dialog modal-dialog-centered modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="payNowModalLabel">
              <i class="bi bi-cash-coin me-2"></i> Pay for Order #${order.order_id}
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body" id="payNowModalBody">
            <!-- Content will be dynamically inserted here -->
          </div>
          <div class="modal-footer">
            <div class="me-auto">
              <label for="paymentMethod" class="form-label">Payment Method:</label>
              <select id="paymentMethod" class="form-select">
                <option value="cash">Cash</option>
                <option value="mobile">Mobile Payment</option>
              </select>
            </div>
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
            <button type="button" class="btn btn-success" id="proceedToPaymentBtn">Proceed to Payment</button>
          </div>
        </div>
      </div>
    `

    document.body.appendChild(payNowModal)
  }

  // Populate modal content
  const modalBody = document.getElementById("payNowModalBody")
  modalBody.innerHTML = `
    <div class="table-responsive">
      <table class="table table-hover">
        <thead class="table-light">
          <tr>
            <th>#</th>
            <th>Product</th>
            <th>Quantity</th>
            <th>Unit Price</th>
            <th>Total</th>
            <th>Pay Quantity</th>
          </tr>
        </thead>
        <tbody>
          ${order.items
            .map(
              (item, index) => `
                <tr>
                  <td>${index + 1}</td>
                  <td>${item.product_name || "Unknown Product"}</td>
                  <td>${item.quantity}</td>
                  <td>₱${Number.parseFloat(item.unit_price).toFixed(2)}</td>
                  <td>₱${Number.parseFloat(item.total_price || item.quantity * item.unit_price).toFixed(2)}</td>
                  <td>
                    <input type="number" class="form-control pay-quantity-input"
                      data-product-id="${item.product_id}"
                      data-order-id="${order.order_id}"
                      data-item-id="${item.item_id}"
                      min="0" max="${item.quantity}" value="${item.quantity}">
                  </td>
                </tr>
              `,
            )
            .join("")}
        </tbody>
        <tfoot class="table-light">
          <tr>
            <td colspan="4" class="text-end fw-bold">Total:</td>
            <td class="fw-bold">₱${Number.parseFloat(order.total_amount).toFixed(2)}</td>
            <td></td>
          </tr>
        </tfoot>
      </table>
    </div>
  `

  // Add event listener for the "Proceed to Payment" button
  const proceedToPaymentBtn = document.getElementById("proceedToPaymentBtn")
  proceedToPaymentBtn.addEventListener("click", () => {
    const paymentMethod = document.getElementById("paymentMethod").value

    // Calculate the total amount dynamically from the Pay Now modal
    const payQuantities = Array.from(document.querySelectorAll(".pay-quantity-input"))
    const totalAmount = payQuantities
      .reduce((sum, input) => {
        const productId = input.getAttribute("data-product-id")
        const quantity = Number.parseInt(input.value, 10) || 0
        const unitPrice = Number.parseFloat(
          input
            .closest("tr")
            .querySelector("td:nth-child(4)")
            .textContent.replace(/[^0-9.]/g, ""),
        )
        return sum + quantity * unitPrice
      }, 0)
      .toFixed(2)

    if (paymentMethod === "cash") {
      // Load the total amount into the Cash Payment Modal
      document.getElementById("cashTotalAmount").value = `₱${totalAmount}`

      // Show the Cash Payment Modal
      const cashPaymentModal = new bootstrap.Modal(document.getElementById("cashPaymentModal"))
      cashPaymentModal.show()
    } else if (paymentMethod === "mobile") {
      // Load the total amount into the Mobile Payment Modal
      document.getElementById("mobileTotalAmount").value = `₱${totalAmount}`

      // Show the Mobile Payment Modal
      const mobilePaymentModal = new bootstrap.Modal(document.getElementById("mobilePaymentModal"))
      mobilePaymentModal.show()
    } else {
      alert("Please select a valid payment method.")
    }
  })

  // Show the modal
  try {
    if (typeof bootstrap !== "undefined") {
      const bsModal = new bootstrap.Modal(payNowModal)
      bsModal.show()
    } else {
      console.error("Bootstrap is not defined. Ensure it is properly loaded.")
      showResponseMessage("danger", "Bootstrap is not loaded. Please check your setup.")
    }
  } catch (error) {
    console.error("Bootstrap modal error:", error)
    showResponseMessage("danger", "Failed to open Pay Now modal. Please check console for errors.")
  }
}

// Update the total price in the Pay Now modal when quantities are adjusted
function updateTotalPrice() {
  const payQuantities = Array.from(document.querySelectorAll(".pay-quantity-input"))
  const totalAmount = payQuantities
    .reduce((sum, input) => {
      const quantity = Number.parseInt(input.value, 10) || 0
      const unitPrice = Number.parseFloat(
        input
          .closest("tr")
          .querySelector("td:nth-child(4)")
          .textContent.replace(/[^0-9.]/g, ""),
      )
      return sum + quantity * unitPrice
    }, 0)
    .toFixed(2)

  const totalCell = document.querySelector("#payNowModalBody tfoot .fw-bold")
  if (totalCell) {
    totalCell.textContent = `₱${totalAmount}`
  }
}

// Process cash payment
function processCashPayment() {
  // Get the current order ID from the Pay Now modal
  const orderId = document.querySelector("#payNowModal .modal-title").textContent.match(/#(\d+)/)[1]

  // Get payment amount
  const totalAmount = document.getElementById("cashTotalAmount").value.replace(/[^0-9.]/g, "")

  // Get payment notes
  const notes = document.getElementById("cashNotes").value

  // Get pay quantities
  const payQuantities = getPayQuantities()

  // Process the payment
  processPayment(orderId, "cash", totalAmount, payQuantities, null, notes)

  // Close the Cash Payment Modal
  const cashPaymentModal = bootstrap.Modal.getInstance(document.getElementById("cashPaymentModal"))
  cashPaymentModal.hide()

  // Close the Pay Now Modal
  const payNowModal = bootstrap.Modal.getInstance(document.getElementById("payNowModal"))
  payNowModal.hide()
}

// Process mobile payment
function processMobilePayment() {
  // Get the current order ID from the Pay Now modal
  const orderId = document.querySelector("#payNowModal .modal-title").textContent.match(/#(\d+)/)[1]

  // Get payment amount
  const totalAmount = document.getElementById("mobileTotalAmount").value.replace(/[^0-9.]/g, "")

  // Get reference number
  const referenceNumber = document.getElementById("mobileReferenceNumber").value

  if (!referenceNumber) {
    alert("Please enter a reference number for the mobile payment.")
    return
  }

  // Get payment notes
  const notes = document.getElementById("mobileNotes").value

  // Get pay quantities
  const payQuantities = getPayQuantities()

  // Process the payment
  processPayment(orderId, "mobile", totalAmount, payQuantities, referenceNumber, notes)

  // Close the Mobile Payment Modal
  const mobilePaymentModal = bootstrap.Modal.getInstance(document.getElementById("mobilePaymentModal"))
  mobilePaymentModal.hide()

  // Close the Pay Now Modal
  const payNowModal = bootstrap.Modal.getInstance(document.getElementById("payNowModal"))
  payNowModal.hide()
}

// Helper function to get pay quantities from the Pay Now modal
function getPayQuantities() {
  const payQuantityInputs = document.querySelectorAll(".pay-quantity-input")
  const payQuantities = []

  payQuantityInputs.forEach((input) => {
    const productId = input.getAttribute("data-product-id")
    const itemId = input.getAttribute("data-item-id")
    const orderQuantity = Number.parseInt(input.getAttribute("max"), 10) || 0
    const payQuantity = Number.parseInt(input.value, 10) || 0
    const unsoldQuantity = orderQuantity - payQuantity

    if (payQuantity > 0) {
      payQuantities.push({
        productId: productId,
        itemId: itemId,
        quantity: payQuantity,
        unsoldQuantity: unsoldQuantity,
      })
    }
  })

  return payQuantities
}

// Process the payment and update the order status
function processPayment(
  orderId,
  paymentMethod,
  totalPaymentAmount,
  payQuantities,
  paymentReference = null,
  paymentNotes = "",
) {
  const paymentDetails = {
    orderId: orderId,
    paymentMethod: paymentMethod,
    totalPaymentAmount: totalPaymentAmount,
    payQuantities: payQuantities,
    paymentReference: paymentReference,
    paymentNotes: paymentNotes,
  }

  console.log("Sending payment details:", paymentDetails)

  // Show loading indicator
  showLoadingOverlay("Processing payment...")

  // Send payment details to the server
  fetch("process_payment.php", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(paymentDetails),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`)
      }
      return response.json()
    })
    .then((data) => {
      // Keep loading indicator visible for 2 seconds
      setTimeout(() => {
        // Hide loading indicator
        hideLoadingOverlay()

        console.log("Payment response:", data)

        if (data.success) {
          // Show success modal for 2 seconds
          showSuccessModal("Successfully requested payment")

          // Refresh the UI to show updated order status after success modal is shown
          setTimeout(() => {
            fetchCompletedOrders()
            fetchInProcessOrders()
            fetchPaidOrders()
          }, 2000)
        } else {
          showResponseMessage("danger", `Payment failed: ${data.message}`)
        }
      }, 2000)
    })
    .catch((error) => {
      // Hide loading indicator after 2 seconds even on error
      setTimeout(() => {
        hideLoadingOverlay()
        console.error("Error processing payment:", error)
        showResponseMessage("danger", "An error occurred while processing the payment. Please try again.")
      }, 2000)
    })
}

// Show loading overlay
function showLoadingOverlay(message = "Loading...") {
  // Create loading overlay if it doesn't exist
  let loadingOverlay = document.getElementById("loadingOverlay")

  if (!loadingOverlay) {
    loadingOverlay = document.createElement("div")
    loadingOverlay.id = "loadingOverlay"
    loadingOverlay.className = "loading-overlay"

    loadingOverlay.innerHTML = `
      <div class="loading-spinner-container">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
        <p id="loadingMessage" class="mt-2">${message}</p>
      </div>
    `

    document.body.appendChild(loadingOverlay)
  } else {
    document.getElementById("loadingMessage").textContent = message
    loadingOverlay.style.display = "flex"
  }
}

// Hide loading overlay
function hideLoadingOverlay() {
  const loadingOverlay = document.getElementById("loadingOverlay")
  if (loadingOverlay) {
    loadingOverlay.style.display = "none"
  }
}

// Show success modal
function showSuccessModal(message) {
  let successModal = document.getElementById("successModal")
  if (!successModal) {
    successModal = document.createElement("div")
    successModal.className = "modal fade"
    successModal.id = "successModal"
    successModal.tabIndex = "-1"
    successModal.setAttribute("aria-labelledby", "successModalLabel")
    successModal.setAttribute("aria-hidden", "true")

    successModal.innerHTML = `
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-body text-center p-4">
            <div class="mb-3">
              <i class="bi bi-check-circle-fill text-success" style="font-size: 3rem;"></i>
            </div>
            <h5 class="modal-title mb-3" id="successModalLabel">Success!</h5>
            <p class="mb-0">${message}</p>
          </div>
        </div>
      </div>
    `

    document.body.appendChild(successModal)
  } else {
    successModal.querySelector(".modal-body p").innerHTML = message
  }

  const bsModal = new bootstrap.Modal(successModal)
  bsModal.show()

  // Automatically hide the modal after 2 seconds
  setTimeout(() => {
    bsModal.hide()
  }, 2000)
}

