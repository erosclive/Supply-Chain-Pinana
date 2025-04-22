/**
* Piñana Gourmet - Delivery Management JavaScript
* This file handles all the functionality for the delivery management interface
* including modals, data fetching, and status updates.
*/

// Global variables and state management
let pendingDeliveries = []
let activeDeliveries = []
let completedDeliveries = []
let reportedIssues = []
let resolvedIssues = []
let bootstrap // Will be initialized by Bootstrap's JS
let flatpickr // Will be initialized by Flatpickr's JS

// Initialize the page
document.addEventListener("DOMContentLoaded", () => {
  // Initialize bootstrap
  initBootstrap()
  
  // Initialize sidebar toggle for mobile
  initSidebar()

  // Load deliveries data
  loadDeliveryData()

  // Initialize event listeners
  initEventListeners()

  // Add a global alert container if it doesn't exist
  if (!document.getElementById("alert-container")) {
    const alertContainer = document.createElement("div")
    alertContainer.id = "alert-container"
    alertContainer.className = "position-fixed top-0 end-0 p-3"
    alertContainer.style.zIndex = "1050"
    document.body.appendChild(alertContainer)
  }
})

// Initialize Bootstrap components
function initBootstrap() {
  // Define global bootstrap variable if not already defined
  if (!window.bootstrap) {
    window.bootstrap = {
      Modal: class {
        constructor(element) {
          this.element = element
          this.options = {
            backdrop: true,
            keyboard: true,
            focus: true,
          }
          this.init()
        }

        init() {
          // Add event listeners for close buttons
          const closeButtons = this.element.querySelectorAll('[data-bs-dismiss="modal"]')
          closeButtons.forEach((button) => {
            button.addEventListener("click", () => this.hide())
          })

          // Add backdrop if enabled
          if (this.options.backdrop) {
            this.backdrop = document.createElement("div")
            this.backdrop.className = "modal-backdrop fade show"
            document.body.appendChild(this.backdrop)
          }

          // Show the modal
          this.element.classList.add("show")
          this.element.style.display = "block"
          document.body.classList.add("modal-open")

          // Focus the modal
          if (this.options.focus) {
            this.element.focus()
          }
        }

        hide() {
          // Hide the modal
          this.element.classList.remove("show")
          this.element.style.display = "none"

          // Remove backdrop
          if (this.backdrop) {
            document.body.removeChild(this.backdrop)
          }

          document.body.classList.remove("modal-open")
        }

        static getInstance(element) {
          return new Modal(element)
        }
      },

      Alert: class {
        constructor(element) {
          this.element = element
        }

        close() {
          // Fade out and remove the alert
          this.element.classList.remove("show")
          setTimeout(() => {
            if (this.element.parentNode) {
              this.element.parentNode.removeChild(this.element)
            }
          }, 150)
        }
      },
    }
    bootstrap = window.bootstrap
  }
}

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
  // Initialize flatpickr if not already defined
  if (!window.flatpickr) {
    window.flatpickr = (selector, config) => {
      const element = document.querySelector(selector)
      if (element) {
        // Simple date picker implementation
        element.type = "datetime-local"
        if (config.minDate === "today") {
          const today = new Date()
          const year = today.getFullYear()
          const month = String(today.getMonth() + 1).padStart(2, "0")
          const day = String(today.getDate()).padStart(2, "0")
          element.min = `${year}-${month}-${day}T00:00`
        }
        if (config.defaultDate) {
          const defaultDate = new Date(config.defaultDate)
          const year = defaultDate.getFullYear()
          const month = String(defaultDate.getMonth() + 1).padStart(2, "0")
          const day = String(defaultDate.getDate()).padStart(2, "0")
          const hours = String(defaultDate.getHours()).padStart(2, "0")
          const minutes = String(defaultDate.getMinutes()).padStart(2, "0")
          element.value = `${year}-${month}-${day}T${hours}:${minutes}`
        }
      }
      return {
        destroy: () => {},
      }
    }
    flatpickr = window.flatpickr
  }

  // Delivery date picker
  if (document.getElementById("deliveryDate")) {
    flatpickr("#deliveryDate", {
      enableTime: false,
      dateFormat: "Y-m-d",
      minDate: "today",
    })
  }

  // Estimated time picker
  if (document.getElementById("estimatedTime")) {
    flatpickr("#estimatedTime", {
      enableTime: true,
      dateFormat: "Y-m-d H:i",
      minDate: "today",
    })
  }

  // Schedule date picker
  if (document.getElementById("scheduleDate")) {
    flatpickr("#scheduleDate", {
      enableTime: false,
      dateFormat: "Y-m-d",
      minDate: "today",
    })
  }

  // Complete time picker
  if (document.getElementById("completeTime")) {
    flatpickr("#completeTime", {
      enableTime: true,
      dateFormat: "Y-m-d H:i",
      defaultDate: new Date(),
    })
  }
}

// Load delivery data for all tabs
function loadDeliveryData() {
  loadPendingDeliveries()
  loadActiveDeliveries()
  loadCompletedDeliveries()
  loadDeliveryIssues()
}

// Initialize event listeners
function initEventListeners() {
  // Mark order ready button
  const markReadyBtn = document.getElementById("mark-ready-btn")
  if (markReadyBtn) {
    markReadyBtn.addEventListener("click", () => {
      showOrderSelectionModal("ready")
    })
  }

  // Schedule delivery button
  const scheduleDeliveryBtn = document.getElementById("schedule-delivery-btn")
  if (scheduleDeliveryBtn) {
    scheduleDeliveryBtn.addEventListener("click", () => {
      showOrderSelectionModal("schedule")
    })
  }

  // Tab change event to refresh data
  const deliveryTabs = document.querySelectorAll('button[data-bs-toggle="tab"]')
  deliveryTabs.forEach((tab) => {
    tab.addEventListener("shown.bs.tab", (event) => {
      const targetId = event.target.getAttribute("data-bs-target")

      if (targetId === "#pending-deliveries") {
        loadPendingDeliveries()
      } else if (targetId === "#active-deliveries") {
        loadActiveDeliveries()
      } else if (targetId === "#completed-deliveries") {
        loadCompletedDeliveries()
      } else if (targetId === "#delivery-issues") {
        loadDeliveryIssues()
      }
    })
  })

  // Refresh buttons
  document.querySelectorAll(".refresh-btn").forEach((btn) => {
    btn.addEventListener("click", function () {
      const tabId = this.getAttribute("data-tab")
      if (tabId === "pending") {
        loadPendingDeliveries()
      } else if (tabId === "active") {
        loadActiveDeliveries()
      } else if (tabId === "completed") {
        loadCompletedDeliveries()
      } else if (tabId === "issues") {
        loadDeliveryIssues()
      }
    })
  })

  // Search inputs
  document.querySelectorAll(".delivery-search").forEach((input) => {
    input.addEventListener("keyup", function (e) {
      if (e.key === "Enter") {
        const tabId = this.getAttribute("data-tab")
        const searchTerm = this.value.toLowerCase()

        if (tabId === "pending") {
          filterDeliveries("pending-delivery-table-body", pendingDeliveries, searchTerm)
        } else if (tabId === "active") {
          filterDeliveries("active-delivery-table-body", activeDeliveries, searchTerm)
        } else if (tabId === "completed") {
          filterDeliveries("completed-delivery-table-body", completedDeliveries, searchTerm)
        } else if (tabId === "issues") {
          filterIssues(searchTerm)
        }
      }
    })
  })
}

// Filter deliveries based on search term
function filterDeliveries(tableBodyId, deliveries, searchTerm) {
  const tableBody = document.getElementById(tableBodyId)
  if (!tableBody) return

  if (!searchTerm) {
    // If search term is empty, render all deliveries
    if (tableBodyId === "pending-delivery-table-body") {
      renderPendingDeliveries()
    } else if (tableBodyId === "active-delivery-table-body") {
      renderActiveDeliveries()
    } else if (tableBodyId === "completed-delivery-table-body") {
      renderCompletedDeliveries()
    }
    return
  }

  // Filter deliveries
  const filteredDeliveries = deliveries.filter((delivery) => {
    return (
      delivery.order_id.toLowerCase().includes(searchTerm) ||
      delivery.customer_name.toLowerCase().includes(searchTerm) ||
      (delivery.shipping_address && delivery.shipping_address.toLowerCase().includes(searchTerm)) ||
      (delivery.product_list && delivery.product_list.toLowerCase().includes(searchTerm))
    )
  })

  // Render filtered deliveries
  if (tableBodyId === "pending-delivery-table-body") {
    renderPendingDeliveriesFiltered(filteredDeliveries)
  } else if (tableBodyId === "active-delivery-table-body") {
    renderActiveDeliveriesFiltered(filteredDeliveries)
  } else if (tableBodyId === "completed-delivery-table-body") {
    renderCompletedDeliveriesFiltered(filteredDeliveries)
  }
}

// Filter issues based on search term
function filterIssues(searchTerm) {
  if (!searchTerm) {
    renderReportedIssues(reportedIssues)
    renderResolvedIssues(resolvedIssues)
    return
  }

  // Filter reported issues
  const filteredReportedIssues = reportedIssues.filter((issue) => {
    return (
      issue.order_id.toLowerCase().includes(searchTerm) ||
      issue.customer_name.toLowerCase().includes(searchTerm) ||
      issue.issue_type.toLowerCase().includes(searchTerm) ||
      (issue.description && issue.description.toLowerCase().includes(searchTerm))
    )
  })

  // Filter resolved issues
  const filteredResolvedIssues = resolvedIssues.filter((issue) => {
    return (
      issue.order_id.toLowerCase().includes(searchTerm) ||
      issue.customer_name.toLowerCase().includes(searchTerm) ||
      issue.issue_type.toLowerCase().includes(searchTerm) ||
      (issue.description && issue.description.toLowerCase().includes(searchTerm)) ||
      (issue.resolution && issue.resolution.toLowerCase().includes(searchTerm))
    )
  })

  renderReportedIssues(filteredReportedIssues)
  renderResolvedIssues(filteredResolvedIssues)
}

// Load pending deliveries
function loadPendingDeliveries() {
  const tableBody = document.getElementById("pending-delivery-table-body")
  if (!tableBody) return

  // Show loading indicator
  tableBody.innerHTML = `
    <tr>
      <td colspan="5" class="text-center py-4">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
        <p class="mt-2">Loading pending deliveries...</p>
      </td>
    </tr>
  `

  // Fetch pending deliveries
  fetch("delivery_operations.php?action=get_pending_deliveries")
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        pendingDeliveries = data.deliveries
        renderPendingDeliveries()

        // Update badge count
        const pendingBadge = document.querySelector("#pending-tab .badge")
        if (pendingBadge) {
          pendingBadge.textContent = pendingDeliveries.length
        }
      } else {
        showAlert("Failed to load pending deliveries: " + data.message, "danger")
        tableBody.innerHTML = `
          <tr>
            <td colspan="5" class="text-center py-4">
              <div class="text-danger">
                <i class="bi bi-exclamation-triangle-fill fs-1 mb-3"></i>
                <p>Error loading deliveries. Please try again.</p>
              </div>
            </td>
          </tr>
        `
      }
    })
    .catch((error) => {
      console.error("Error loading pending deliveries:", error)
      showAlert("Error loading pending deliveries. Please try again.", "danger")
      tableBody.innerHTML = `
        <tr>
          <td colspan="5" class="text-center py-4">
            <div class="text-danger">
              <i class="bi bi-exclamation-triangle-fill fs-1 mb-3"></i>
              <p>Error loading deliveries. Please try again.</p>
            </div>
          </td>
        </tr>
      `
    })
}

// Render pending deliveries
function renderPendingDeliveries() {
  renderPendingDeliveriesFiltered(pendingDeliveries)
}

// Render filtered pending deliveries
function renderPendingDeliveriesFiltered(deliveries) {
  const tableBody = document.getElementById("pending-delivery-table-body")
  if (!tableBody) return

  if (deliveries.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="5" class="text-center py-5">
          <i class="bi bi-inbox fs-1 text-muted mb-3"></i>
          <p class="text-muted">No pending deliveries found</p>
        </td>
      </tr>
    `
    return
  }

  let html = ""

  deliveries.forEach((delivery) => {
    // Status badge class
    let statusClass = ""
    switch (delivery.status) {
      case "confirmed":
        statusClass = "bg-success"
        break
      default:
        statusClass = "bg-secondary"
    }

    // Delivery mode badge
    const deliveryModeClass = delivery.delivery_mode === "pickup" ? "bg-info" : "bg-primary"
    const deliveryModeText = delivery.delivery_mode === "pickup" ? "Pickup" : "Delivery"

    html += `
      <tr>
        <td>
          <span class="fw-medium">${delivery.order_id}</span>
        </td>
        <td>
          <div class="fw-medium">${delivery.customer_name}</div>
          <div class="small text-muted">${delivery.customer_email || "No email"}</div>
        </td>
        <td>
          <div>${delivery.formatted_date}</div>
        </td>
        <td>
          <span class="badge ${statusClass}">${delivery.status.charAt(0).toUpperCase() + delivery.status.slice(1)}</span>
          <span class="badge ${deliveryModeClass}">${deliveryModeText}</span>
        </td>
        <td>
          <div class="btn-group">
            <button type="button" class="btn btn-sm btn-outline-primary view-delivery-btn" data-id="${delivery.order_id}" title="View Details">
              <i class="bi bi-eye"></i>
            </button>
            <button type="button" class="btn btn-sm btn-outline-success update-status-btn" data-id="${delivery.order_id}" data-mode="${delivery.delivery_mode}" title="Update Status">
              <i class="bi bi-arrow-up-circle"></i>
            </button>
            <button type="button" class="btn btn-sm btn-outline-secondary schedule-btn" data-id="${delivery.order_id}" data-mode="${delivery.delivery_mode}" title="Schedule">
              <i class="bi bi-calendar"></i>
            </button>
          </div>
        </td>
      </tr>
    `
  })

  tableBody.innerHTML = html

  // Add event listeners to action buttons
  document.querySelectorAll(".view-delivery-btn").forEach((btn) => {
    btn.addEventListener("click", function () {
      const orderId = this.getAttribute("data-id")
      viewDeliveryDetails(orderId)
    })
  })

  document.querySelectorAll(".update-status-btn").forEach((btn) => {
    btn.addEventListener("click", function () {
      const orderId = this.getAttribute("data-id")
      const deliveryMode = this.getAttribute("data-mode")
      openUpdateStatusModal(orderId, deliveryMode)
    })
  })

  document.querySelectorAll(".schedule-btn").forEach((btn) => {
    btn.addEventListener("click", function () {
      const orderId = this.getAttribute("data-id")
      const deliveryMode = this.getAttribute("data-mode")
      openEnhancedScheduleModal(orderId, deliveryMode)
    })
  })
}

// Load active deliveries
function loadActiveDeliveries() {
  const tableBody = document.getElementById("active-delivery-table-body")
  if (!tableBody) return

  // Show loading indicator
  tableBody.innerHTML = `
    <tr>
      <td colspan="5" class="text-center py-4">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
        <p class="mt-2">Loading active deliveries...</p>
      </td>
    </tr>
  `

  // Fetch active deliveries
  fetch("delivery_operations.php?action=get_active_deliveries")
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        activeDeliveries = data.deliveries
        renderActiveDeliveries()

        // Update badge count
        const activeBadge = document.querySelector("#active-tab .badge")
        if (activeBadge) {
          activeBadge.textContent = activeDeliveries.length
        }
      } else {
        showAlert("Failed to load active deliveries: " + data.message, "danger")
        tableBody.innerHTML = `
          <tr>
            <td colspan="5" class="text-center py-4">
              <div class="text-danger">
                <i class="bi bi-exclamation-triangle-fill fs-1 mb-3"></i>
                <p>Error loading deliveries. Please try again.</p>
              </div>
            </td>
          </tr>
        `
      }
    })
    .catch((error) => {
      console.error("Error loading active deliveries:", error)
      showAlert("Error loading active deliveries. Please try again.", "danger")
      tableBody.innerHTML = `
        <tr>
          <td colspan="5" class="text-center py-4">
            <div class="text-danger">
              <i class="bi bi-exclamation-triangle-fill fs-1 mb-3"></i>
              <p>Error loading deliveries. Please try again.</p>
            </div>
          </td>
        </tr>
      `
    })
}

// Render active deliveries
function renderActiveDeliveries() {
  renderActiveDeliveriesFiltered(activeDeliveries)
}

// Render filtered active deliveries
function renderActiveDeliveriesFiltered(deliveries) {
  const tableBody = document.getElementById("active-delivery-table-body")
  if (!tableBody) return

  if (deliveries.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="5" class="text-center py-5">
          <i class="bi bi-inbox fs-1 text-muted mb-3"></i>
          <p class="text-muted">No active deliveries found</p>
        </td>
      </tr>
    `
    return
  }

  let html = ""

  deliveries.forEach((delivery) => {
    // Determine status badge class and text
    let statusClass = ""
    let statusText = ""

    if (delivery.delivery_mode === "pickup") {
      statusClass = "bg-primary"
      statusText = "Ready for Pickup"
    } else {
      statusClass = "bg-primary"
      statusText = "In Transit"
    }

    // Delivery mode badge
    const deliveryModeClass = delivery.delivery_mode === "pickup" ? "bg-info" : "bg-primary"
    const deliveryModeText = delivery.delivery_mode === "pickup" ? "Pickup" : "Delivery"

    html += `
      <tr>
        <td>
          <span class="fw-medium">${delivery.order_id}</span>
        </td>
        <td>
          <div class="fw-medium">${delivery.customer_name}</div>
          <div class="small text-muted">${delivery.customer_email || "No email"}</div>
        </td>
        <td>
          <div>${delivery.formatted_eta || "Not specified"}</div>
          <div class="small text-muted">Ordered: ${delivery.formatted_date}</div>
        </td>
        <td>
          <span class="badge ${statusClass}">${statusText}</span>
          <span class="badge ${deliveryModeClass}">${deliveryModeText}</span>
        </td>
        <td>
          <div class="btn-group">
            <button type="button" class="btn btn-sm btn-outline-primary view-delivery-btn" data-id="${delivery.order_id}" title="View Details">
              <i class="bi bi-eye"></i>
            </button>
            <button type="button" class="btn btn-sm btn-outline-success complete-delivery-btn" data-id="${delivery.order_id}" data-mode="${delivery.delivery_mode}" title="Mark ${delivery.delivery_mode === "pickup" ? "Picked Up" : "Delivered"}">
              <i class="bi bi-check-circle"></i>
            </button>
            <button type="button" class="btn btn-sm btn-outline-danger report-issue-btn" data-id="${delivery.order_id}" title="Report Issue">
              <i class="bi bi-exclamation-triangle"></i>
            </button>
          </div>
        </td>
      </tr>
    `
  })

  tableBody.innerHTML = html

  // Add event listeners to action buttons
  document.querySelectorAll(".view-delivery-btn").forEach((btn) => {
    btn.addEventListener("click", function () {
      const orderId = this.getAttribute("data-id")
      viewDeliveryDetails(orderId)
    })
  })

  document.querySelectorAll(".complete-delivery-btn").forEach((btn) => {
    btn.addEventListener("click", function () {
      const orderId = this.getAttribute("data-id")
      const deliveryMode = this.getAttribute("data-mode")
      openCompleteDeliveryModal(orderId, deliveryMode)
    })
  })

  document.querySelectorAll(".report-issue-btn").forEach((btn) => {
    btn.addEventListener("click", function () {
      const orderId = this.getAttribute("data-id")
      openReportIssueModal(orderId)
    })
  })
}

// Load completed deliveries
function loadCompletedDeliveries() {
  const tableBody = document.getElementById("completed-delivery-table-body")
  if (!tableBody) return

  // Show loading indicator
  tableBody.innerHTML = `
    <tr>
      <td colspan="4" class="text-center py-4">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
        <p class="mt-2">Loading completed deliveries...</p>
      </td>
    </tr>
  `

  // Fetch completed deliveries
  fetch("delivery_operations.php?action=get_completed_deliveries")
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        completedDeliveries = data.deliveries
        renderCompletedDeliveries()

        // Update badge count
        const completedBadge = document.querySelector("#completed-tab .badge")
        if (completedBadge) {
          completedBadge.textContent = completedDeliveries.length
        }
      } else {
        showAlert("Failed to load completed deliveries: " + data.message, "danger")
        tableBody.innerHTML = `
          <tr>
            <td colspan="4" class="text-center py-4">
              <div class="text-danger">
                <i class="bi bi-exclamation-triangle-fill fs-1 mb-3"></i>
                <p>Error loading deliveries. Please try again.</p>
              </div>
            </td>
          </tr>
        `
      }
    })
    .catch((error) => {
      console.error("Error loading completed deliveries:", error)
      showAlert("Error loading completed deliveries. Please try again.", "danger")
      tableBody.innerHTML = `
        <tr>
          <td colspan="4" class="text-center py-4">
            <div class="text-danger">
              <i class="bi bi-exclamation-triangle-fill fs-1 mb-3"></i>
              <p>Error loading deliveries. Please try again.</p>
            </div>
          </td>
        </tr>
      `
    })
}

// Render completed deliveries
function renderCompletedDeliveries() {
  renderCompletedDeliveriesFiltered(completedDeliveries)
}

// Render filtered completed deliveries
function renderCompletedDeliveriesFiltered(deliveries) {
  const tableBody = document.getElementById("completed-delivery-table-body")
  if (!tableBody) return

  if (deliveries.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="4" class="text-center py-5">
          <i class="bi bi-inbox fs-1 text-muted mb-3"></i>
          <p class="text-muted">No completed deliveries found</p>
        </td>
      </tr>
    `
    return
  }

  let html = ""

  deliveries.forEach((delivery) => {
    // Delivery mode badge
    const deliveryModeClass = delivery.delivery_mode === "pickup" ? "bg-info" : "bg-primary"
    const deliveryModeText = delivery.delivery_mode === "pickup" ? "Pickup" : "Delivery"

    // Status badge
    const statusClass = delivery.delivery_mode === "pickup" ? "bg-success" : "bg-success"
    const statusText = delivery.delivery_mode === "pickup" ? "Picked Up" : "Delivered"

    html += `
      <tr>
        <td>
          <span class="fw-medium">${delivery.order_id}</span>
        </td>
        <td>
          <div class="fw-medium">${delivery.customer_name}</div>
          <div class="small text-muted">${delivery.customer_email || "No email"}</div>
        </td>
        <td>
          <div>${delivery.formatted_delivery_time}</div>
          <div class="small text-muted">
            <span class="badge ${statusClass}">${statusText}</span>
            <span class="badge ${deliveryModeClass}">${deliveryModeText}</span>
          </div>
        </td>
        <td>
          <div class="btn-group">
            <button type="button" class="btn btn-sm btn-outline-primary view-delivery-btn" data-id="${delivery.order_id}" title="View Details">
              <i class="bi bi-eye"></i>
            </button>
          </div>
        </td>
      </tr>
    `
  })

  tableBody.innerHTML = html

  // Add event listeners to view buttons
  document.querySelectorAll(".view-delivery-btn").forEach((btn) => {
    btn.addEventListener("click", function () {
      const orderId = this.getAttribute("data-id")
      viewDeliveryDetails(orderId)
    })
  })
}

// Load delivery issues
function loadDeliveryIssues() {
  const reportedTableBody = document.getElementById("reported-issues-table-body")
  const resolvedTableBody = document.getElementById("resolved-issues-table-body")

  if (!reportedTableBody || !resolvedTableBody) return

  // Show loading indicators
  reportedTableBody.innerHTML = `
    <tr>
      <td colspan="4" class="text-center py-4">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
        <p class="mt-2">Loading reported issues...</p>
      </td>
    </tr>
  `

  resolvedTableBody.innerHTML = `
    <tr>
      <td colspan="4" class="text-center py-4">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
        <p class="mt-2">Loading resolved issues...</p>
      </td>
    </tr>
  `

  // Fetch delivery issues
  fetch("delivery_operations.php?action=get_delivery_issues")
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        // Split issues into reported and resolved
        reportedIssues = data.issues.filter((issue) => issue.status !== "resolved")
        resolvedIssues = data.issues.filter((issue) => issue.status === "resolved")

        // Render both tables
        renderReportedIssues(reportedIssues)
        renderResolvedIssues(resolvedIssues)

        // Update badge count - only count reported issues for notification
        const issuesBadge = document.querySelector("#issues-tab .badge")
        if (issuesBadge) {
          issuesBadge.textContent = reportedIssues.length
        }
      } else {
        showAlert("Failed to load delivery issues: " + data.message, "danger")
        reportedTableBody.innerHTML = `
          <tr>
            <td colspan="4" class="text-center py-4">
              <div class="text-danger">
                <i class="bi bi-exclamation-triangle-fill fs-1 mb-3"></i>
                <p>Error loading delivery issues. Please try again.</p>
              </div>
            </td>
          </tr>
        `
        resolvedTableBody.innerHTML = `
          <tr>
            <td colspan="4" class="text-center py-4">
              <div class="text-danger">
                <i class="bi bi-exclamation-triangle-fill fs-1 mb-3"></i>
                <p>Error loading delivery issues. Please try again.</p>
              </div>
            </td>
          </tr>
        `
      }
    })
    .catch((error) => {
      console.error("Error loading delivery issues:", error)
      showAlert("Error loading delivery issues. Please try again.", "danger")
      reportedTableBody.innerHTML = `
        <tr>
          <td colspan="4" class="text-center py-4">
            <div class="text-danger">
              <i class="bi bi-exclamation-triangle-fill fs-1 mb-3"></i>
              <p>Error loading delivery issues. Please try again.</p>
            </div>
          </td>
        </tr>
      `
      resolvedTableBody.innerHTML = `
        <tr>
          <td colspan="4" class="text-center py-4">
            <div class="text-danger">
              <i class="bi bi-exclamation-triangle-fill fs-1 mb-3"></i>
              <p>Error loading delivery issues. Please try again.</p>
            </div>
          </td>
        </tr>
      `
    })
}

// Render reported issues
function renderReportedIssues(issues) {
  const tableBody = document.getElementById("reported-issues-table-body")
  if (!tableBody) return

  if (issues.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="4" class="text-center py-5">
          <i class="bi bi-inbox fs-1 text-muted mb-3"></i>
          <p class="text-muted">No reported issues found</p>
        </td>
      </tr>
    `
    return
  }

  let html = ""

  issues.forEach((issue) => {
    // Status badge class
    let statusClass = ""
    switch (issue.status) {
      case "reported":
        statusClass = "bg-danger"
        break
      case "investigating":
        statusClass = "bg-warning text-dark"
        break
      default:
        statusClass = "bg-secondary"
    }

    // Format issue type
    const issueType = issue.issue_type.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())

    html += `
      <tr>
        <td>
          <span class="fw-medium">${issue.order_id}</span>
          <div class="small text-muted">${issue.customer_name}</div>
        </td>
        <td>
          <span class="badge bg-info text-dark">${issueType}</span>
          <div class="small text-muted">${issue.formatted_reported_at}</div>
        </td>
        <td>
          <span class="badge ${statusClass}">${issue.status.charAt(0).toUpperCase() + issue.status.slice(1)}</span>
        </td>
        <td>
          <div class="btn-group">
            <button type="button" class="btn btn-sm btn-outline-primary view-issue-btn" data-id="${issue.issue_id}" title="View Issue">
              <i class="bi bi-eye"></i>
            </button>
            <button type="button" class="btn btn-sm btn-outline-success resolve-issue-btn" data-id="${issue.issue_id}" data-order-id="${issue.order_id}" data-issue-type="${issueType}" data-description="${issue.description || ""}" title="Resolve Issue">
              <i class="bi bi-check-circle"></i>
            </button>
            <button type="button" class="btn btn-sm btn-outline-secondary view-order-btn" data-id="${issue.order_id}" title="View Order">
              <i class="bi bi-box"></i>
            </button>
          </div>
        </td>
      </tr>
    `
  })

  tableBody.innerHTML = html

  // Add event listeners to action buttons
  document.querySelectorAll(".view-issue-btn").forEach((btn) => {
    btn.addEventListener("click", function () {
      const issueId = this.getAttribute("data-id")
      viewIssueDetails(issueId)
    })
  })

  document.querySelectorAll(".resolve-issue-btn").forEach((btn) => {
    btn.addEventListener("click", function () {
      const issueId = this.getAttribute("data-id")
      const orderId = this.getAttribute("data-order-id")
      const issueType = this.getAttribute("data-issue-type")
      const description = this.getAttribute("data-description")
      openResolveIssueModal(issueId, orderId, issueType, description)
    })
  })

  document.querySelectorAll(".view-order-btn").forEach((btn) => {
    btn.addEventListener("click", function () {
      const orderId = this.getAttribute("data-id")
      viewDeliveryDetails(orderId)
    })
  })
}

// Render resolved issues
function renderResolvedIssues(issues) {
  const tableBody = document.getElementById("resolved-issues-table-body")
  if (!tableBody) return

  if (issues.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="4" class="text-center py-5">
          <i class="bi bi-inbox fs-1 text-muted mb-3"></i>
          <p class="text-muted">No resolved issues found</p>
        </td>
      </tr>
    `
    return
  }

  let html = ""

  issues.forEach((issue) => {
    // Format issue type
    const issueType = issue.issue_type.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())

    html += `
      <tr>
        <td>
          <span class="fw-medium">${issue.order_id}</span>
          <div class="small text-muted">${issue.customer_name}</div>
        </td>
        <td>
          <span class="badge bg-info text-dark">${issueType}</span>
        </td>
        <td>
          <div>${issue.formatted_resolved_at}</div>
          <div class="small text-muted">Reported: ${issue.formatted_reported_at}</div>
        </td>
        <td>
          <div class="btn-group">
            <button type="button" class="btn btn-sm btn-outline-primary view-issue-btn" data-id="${issue.issue_id}" title="View Issue">
              <i class="bi bi-eye"></i>
            </button>
            <button type="button" class="btn btn-sm btn-outline-secondary view-order-btn" data-id="${issue.order_id}" title="View Order">
              <i class="bi bi-box"></i>
            </button>
          </div>
        </td>
      </tr>
    `
  })

  tableBody.innerHTML = html

  // Add event listeners to action buttons
  document.querySelectorAll(".view-issue-btn").forEach((btn) => {
    btn.addEventListener("click", function () {
      const issueId = this.getAttribute("data-id")
      viewIssueDetails(issueId)
    })
  })

  document.querySelectorAll(".view-order-btn").forEach((btn) => {
    btn.addEventListener("click", function () {
      const orderId = this.getAttribute("data-id")
      viewDeliveryDetails(orderId)
    })
  })
}

// View delivery details
function viewDeliveryDetails(orderId) {
  // Fetch delivery details
  fetch(`delivery_operations.php?action=get_delivery_details&order_id=${orderId}`)
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        const delivery = data.delivery

        // Create modal HTML with fetched data
        const modalHtml = `
          <div class="modal fade" id="deliveryDetailsModal" tabindex="-1" aria-labelledby="deliveryDetailsModalLabel" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered modal-lg">
              <div class="modal-content">
                <div class="modal-header bg-light">
                  <h5 class="modal-title" id="deliveryDetailsModalLabel">
                    <i class="bi bi-info-circle me-2 text-primary"></i>${delivery.delivery_mode === "pickup" ? "Pickup" : "Delivery"} Details - Order #${delivery.order_id}
                  </h5>
                  <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                  <div class="row">
                    <div class="col-md-6">
                      <div class="card mb-3">
                        <div class="card-header bg-light">
                          <h6 class="mb-0"><i class="bi bi-box me-2"></i>Order Information</h6>
                        </div>
                        <div class="card-body">
                          <p class="mb-1"><strong>Order ID:</strong> ${delivery.order_id}</p>
                          <p class="mb-1"><strong>Order Date:</strong> ${delivery.formatted_order_date}</p>
                          <p class="mb-1"><strong>Status:</strong> <span class="badge ${getStatusBadgeClass(delivery.status)}">${capitalizeFirstLetter(delivery.status)}</span></p>
                          <p class="mb-1"><strong>Mode:</strong> <span class="badge ${delivery.delivery_mode === "pickup" ? "bg-info" : "bg-primary"}">${capitalizeFirstLetter(delivery.delivery_mode)}</span></p>
                          <p class="mb-0"><strong>Total Amount:</strong> ${delivery.formatted_amount}</p>
                        </div>
                      </div>
                      
                      <div class="card mb-3">
                        <div class="card-header bg-light">
                          <h6 class="mb-0"><i class="bi bi-person me-2"></i>Customer Information</h6>
                        </div>
                        <div class="card-body">
                          <p class="mb-1"><strong>Name:</strong> ${delivery.customer_name}</p>
                          <p class="mb-1"><strong>Email:</strong> ${delivery.customer_email || "N/A"}</p>
                          <p class="mb-1"><strong>Phone:</strong> ${delivery.customer_phone || "N/A"}</p>
                          <p class="mb-0"><strong>${delivery.delivery_mode === "pickup" ? "Pickup Location" : "Shipping Address"}:</strong> ${delivery.shipping_address || "N/A"}</p>
                        </div>
                      </div>
                      
                      <!-- Tracking Information Card -->
                      <div class="card mb-3">
                        <div class="card-header bg-light">
                          <h6 class="mb-0"><i class="bi bi-geo-alt me-2"></i>${delivery.delivery_mode === "pickup" ? "Pickup" : "Delivery"} Tracking</h6>
                        </div>
                        <div class="card-body">
                          ${
                            delivery.delivery_mode === "pickup"
                              ? `
                              <p class="mb-1"><strong>Pickup Location:</strong> ${delivery.shipping_address || "Shop"}</p>
                              <p class="mb-1"><strong>Pickup Date:</strong> ${delivery.pickup_date || "Not specified"}</p>
                              <p class="mb-1"><strong>Ready Status:</strong> 
                                <span class="badge ${delivery.status === "ready" ? "bg-success" : "bg-warning"}">
                                  ${delivery.status === "ready" ? "Ready for pickup" : "Being prepared"}
                                </span>
                              </p>
                              <p class="mb-0"><strong>Notes:</strong> ${delivery.notes || "No special instructions"}</p>
                            `
                              : `
                              <p class="mb-1"><strong>Expected Delivery:</strong> ${delivery.formatted_eta || "Not specified"}</p>
                              <p class="mb-1"><strong>Delivery Address:</strong> ${delivery.shipping_address || "Not specified"}</p>
                              <p class="mb-1"><strong>Driver:</strong> ${delivery.driver_id || "Not assigned"}</p>
                              <div class="progress mt-2 mb-2" style="height: 10px;">
                                <div class="progress-bar progress-bar-striped progress-bar-animated" role="progressbar" 
                                  style="width: ${getDeliveryProgressPercentage(delivery.status)}%" 
                                  aria-valuenow="${getDeliveryProgressPercentage(delivery.status)}" 
                                  aria-valuemin="0" 
                                  aria-valuemax="100">
                                </div>
                              </div>
                              <div class="d-flex justify-content-between small text-muted">
                                <span>Order Placed</span>
                                <span>Processing</span>
                                <span>Shipped</span>
                                <span>Delivered</span>
                              </div>
                            `
                          }
                        </div>
                      </div>
                    </div>
                    
                    <div class="col-md-6">
                      <div class="card mb-3">
                        <div class="card-header bg-light">
                          <h6 class="mb-0"><i class="bi bi-clock me-2"></i>${delivery.delivery_mode === "pickup" ? "Pickup" : "Delivery"} Schedule</h6>
                        </div>
                        <div class="card-body">
                          <p class="mb-1"><strong>Estimated Time:</strong> ${delivery.formatted_eta || "Not specified"}</p>
                          <p class="mb-0"><strong>Actual Time:</strong> ${delivery.formatted_delivery_time || "Not completed yet"}</p>
                        </div>
                      </div>
                      
                      <div class="card mb-3">
                        <div class="card-header bg-light">
                          <h6 class="mb-0"><i class="bi bi-list-check me-2"></i>Status History</h6>
                        </div>
                        <div class="card-body p-0">
                          <ul class="list-group list-group-flush status-history">
                            ${
                              delivery.status_history
                                ? delivery.status_history
                                    .map(
                                      (history) => `
                              <li class="list-group-item">
                                <div class="d-flex justify-content-between">
                                  <span class="badge ${getStatusBadgeClass(history.status)}">${capitalizeFirstLetter(history.status)}</span>
                                  <small class="text-muted">${history.formatted_date}</small>
                                </div>
                                ${history.notes ? `<small class="text-muted">${history.notes}</small>` : ""}
                              </li>
                            `,
                                    )
                                    .join("")
                                : "<li class='list-group-item text-center'>No status history available</li>"
                            }
                          </ul>
                        </div>
                      </div>
                      
                      <div class="card">
                        <div class="card-header bg-light">
                          <h6 class="mb-0"><i class="bi bi-cart me-2"></i>Order Items</h6>
                        </div>
                        <div class="card-body p-0">
                          <ul class="list-group list-group-flush">
                            ${
                              delivery.items && delivery.items.length > 0
                                ? delivery.items
                                    .map(
                                      (item) => `
                                <li class="list-group-item d-flex justify-content-between align-items-center">
                                  <div>
                                    <span class="fw-medium">${item.product_name}</span>
                                    <span class="text-muted"> - ₱${Number(item.price).toFixed(2)}</span>
                                  </div>
                                  <span class="badge bg-primary rounded-pill">${item.quantity}x</span>
                                </li>
                              `,
                                    )
                                    .join("")
                                : `<li class="list-group-item text-center text-muted">No items found</li>`
                            }
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="modal-footer">
                  <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                  
                  ${
                    delivery.status === "confirmed"
                      ? `
                    <button type="button" class="btn btn-primary update-status-btn-modal" data-id="${delivery.order_id}" data-mode="${delivery.delivery_mode}">
                      <i class="bi bi-arrow-up-circle me-1"></i> Update Status
                    </button>
                  `
                      : ""
                  }
                  
                  ${
                    delivery.status === "shipped" || delivery.status === "ready"
                      ? `
                    <button type="button" class="btn btn-success complete-delivery-btn-modal" data-id="${delivery.order_id}" data-mode="${delivery.delivery_mode}">
                      <i class="bi bi-check-circle me-1"></i> Mark as ${delivery.delivery_mode === "pickup" ? "Picked Up" : "Delivered"}
                    </button>
                  `
                      : ""
                  }
                  
                  <button type="button" class="btn btn-danger report-issue-btn-modal" data-id="${delivery.order_id}">
                    <i class="bi bi-exclamation-triangle me-1"></i> Report Issue
                  </button>
                </div>
              </div>
            </div>
          </div>
        `

        // Add modal to DOM and show it
        if (document.getElementById("deliveryDetailsModal")) {
          document.getElementById("deliveryDetailsModal").remove()
        }
        document.body.insertAdjacentHTML("beforeend", modalHtml)

        const deliveryDetailsModal = new bootstrap.Modal(document.getElementById("deliveryDetailsModal"))
        deliveryDetailsModal.show()

        // Add event listeners to action buttons
        const updateStatusBtnModal = document.querySelector(".update-status-btn-modal")
        if (updateStatusBtnModal) {
          updateStatusBtnModal.addEventListener("click", function () {
            deliveryDetailsModal.hide()
            const orderId = this.getAttribute("data-id")
            const deliveryMode = this.getAttribute("data-mode")
            openUpdateStatusModal(orderId, deliveryMode)
          })
        }

        const completeDeliveryBtnModal = document.querySelector(".complete-delivery-btn-modal")
        if (completeDeliveryBtnModal) {
          completeDeliveryBtnModal.addEventListener("click", function () {
            deliveryDetailsModal.hide()
            const orderId = this.getAttribute("data-id")
            const deliveryMode = this.getAttribute("data-mode")
            openCompleteDeliveryModal(orderId, deliveryMode)
          })
        }

        const reportIssueBtnModal = document.querySelector(".report-issue-btn-modal")
        if (reportIssueBtnModal) {
          reportIssueBtnModal.addEventListener("click", function () {
            deliveryDetailsModal.hide()
            const orderId = this.getAttribute("data-id")
            openReportIssueModal(orderId)
          })
        }
      } else {
        showAlert("Failed to load delivery details: " + data.message, "danger")
      }
    })
    .catch((error) => {
      console.error("Error loading delivery details:", error)
      showAlert("Error loading delivery details. Please try again.", "danger")
    })
}

// Helper function to calculate delivery progress percentage based on status
function getDeliveryProgressPercentage(status) {
  switch (status) {
    case "order":
      return 10
    case "confirmed":
      return 35
    case "shipped":
    case "ready":
      return 70
    case "delivered":
    case "picked up":
      return 100
    case "cancelled":
      return 0
    default:
      return 25
  }
}

// Helper function to get status badge class
function getStatusBadgeClass(status) {
  switch (status) {
    case "confirmed":
      return "bg-info"
    case "shipped":
    case "ready":
      return "bg-primary"
    case "delivered":
    case "picked up":
      return "bg-success"
    case "cancelled":
      return "bg-danger"
    default:
      return "bg-secondary"
  }
}

// Helper function to capitalize the first letter of a string
function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1)
}

// Show alert function
function showAlert(message, type = "info") {
  const alertContainer = document.getElementById("alert-container")
  if (!alertContainer) {
    console.error("Alert container not found")
    return
  }

  const alertId = `alert-${Date.now()}`
  const alertHtml = `
    <div id="${alertId}" class="alert alert-${type} alert-dismissible fade show" role="alert">
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    </div>
  `

  alertContainer.insertAdjacentHTML("beforeend", alertHtml)

  // Auto-dismiss after 5 seconds
  setTimeout(() => {
    const alertElement = document.getElementById(alertId)
    if (alertElement) {
      const bsAlert = new bootstrap.Alert(alertElement)
      bsAlert.close()
    }
  }, 5000)
}

// Show order selection modal
function showOrderSelectionModal(type) {
  // Create modal HTML
  const modalTitle = type === "ready" ? "Mark Order Ready" : "Schedule Delivery/Pickup"
  const modalIcon = type === "ready" ? "box-seam" : "calendar"
  const confirmBtnText = type === "ready" ? "Mark as Ready" : "Schedule"
  const confirmBtnAction = type === "ready" ? "markOrderReady()" : "scheduleDelivery()"

  const modalHtml = `
    <div class="modal fade" id="orderSelectionModal" tabindex="-1" aria-labelledby="orderSelectionModalLabel" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="orderSelectionModalLabel">
              <i class="bi bi-${modalIcon} me-2"></i>${modalTitle}
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <form id="orderSelectionForm">
              <div class="mb-3">
                <label for="orderSelect" class="form-label">Select Order</label>
                <select class="form-select" id="orderSelect" required>
                  <option value="" selected disabled>Select an order...</option>
                  ${pendingDeliveries
                    .map(
                      (delivery) =>
                        `<option value="${delivery.order_id}" data-mode="${delivery.delivery_mode}">${delivery.order_id} - ${delivery.customer_name}</option>`,
                    )
                    .join("")}
                </select>
              </div>
              
              ${
                type === "ready"
                  ? `
                <div class="mb-3">
                  <label for="estimatedTime" class="form-label">Estimated Time</label>
                  <input type="text" class="form-control" id="estimatedTime" placeholder="Select date and time">
                </div>
                
                <div class="mb-3">
                  <label for="driverId" class="form-label">Driver (for delivery only)</label>
                  <select class="form-select" id="driverId">
                    <option value="">No driver assigned</option>
                    <option value="D001">Driver 1</option>
                    <option value="D002">Driver 2</option>
                    <option value="D003">Driver 3</option>
                  </select>
                </div>
              `
                  : `
                <div class="mb-3">
                  <label for="deliveryDate" class="form-label">Delivery/Pickup Date</label>
                  <input type="text" class="form-control" id="deliveryDate" placeholder="Select date">
                </div>
                
                <div class="mb-3">
                  <label for="timeWindow" class="form-label">Time Window</label>
                  <select class="form-select" id="timeWindow" required>
                    <option value="" selected disabled>Select time window...</option>
                    <option value="morning">Morning (8:00 AM - 12:00 PM)</option>
                    <option value="afternoon">Afternoon (12:00 PM - 4:00 PM)</option>
                    <option value="evening">Evening (4:00 PM - 8:00 PM)</option>
                  </select>
                </div>
                
                <div class="mb-3">
                  <label for="driverId" class="form-label">Driver (for delivery only)</label>
                  <select class="form-select" id="driverId">
                    <option value="">No driver assigned</option>
                    <option value="D001">Driver 1</option>
                    <option value="D002">Driver 2</option>
                    <option value="D003">Driver 3</option>
                  </select>
                </div>
              `
              }
              
              <div class="mb-3">
                <label for="notes" class="form-label">Notes</label>
                <textarea class="form-control" id="notes" rows="3" placeholder="Add notes..."></textarea>
              </div>
              
              <div class="form-check mb-3">
                <input class="form-check-input" type="checkbox" id="notifyCustomer" checked>
                <label class="form-check-label" for="notifyCustomer">
                  Notify customer via email
                </label>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
            <button type="button" class="btn btn-primary" id="confirmOrderSelectionBtn" onclick="${confirmBtnAction}">
              ${confirmBtnText}
            </button>
          </div>
        </div>
      </div>
    </div>
  `

  // Remove existing modal if it exists
  if (document.getElementById("orderSelectionModal")) {
    document.getElementById("orderSelectionModal").remove()
  }

  // Add modal to DOM
  document.body.insertAdjacentHTML("beforeend", modalHtml)

  // Initialize date pickers
  initDatePickers()

  // Show the modal
  const modal = new bootstrap.Modal(document.getElementById("orderSelectionModal"))
  modal.show()
}

// Mark order as ready
function markOrderReady() {
  const orderId = document.getElementById("orderSelect").value
  const estimatedTime = document.getElementById("estimatedTime").value
  const driverId = document.getElementById("driverId").value
  const notes = document.getElementById("notes").value
  const notifyCustomer = document.getElementById("notifyCustomer").checked ? 1 : 0

  if (!orderId) {
    showAlert("Please select an order", "warning")
    return
  }

  // Show loading state
  const confirmBtn = document.getElementById("confirmOrderSelectionBtn")
  const originalBtnHtml = confirmBtn.innerHTML
  confirmBtn.innerHTML =
    '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Processing...'
  confirmBtn.disabled = true

  // Create form data
  const formData = new FormData()
  formData.append("action", "mark_order_ready")
  formData.append("order_id", orderId)
  formData.append("estimated_time", estimatedTime)
  formData.append("driver_id", driverId)
  formData.append("delivery_notes", notes)
  formData.append("notify_customer", notifyCustomer)

  // Send request to the server
  fetch("delivery_operations.php", {
    method: "POST",
    body: formData,
  })
    .then((response) => response.json())
    .then((data) => {
      // Reset button state
      confirmBtn.innerHTML = originalBtnHtml
      confirmBtn.disabled = false

      if (data.success) {
        // Close the modal
        bootstrap.Modal.getInstance(document.getElementById("orderSelectionModal")).hide()

        // Show success message
        showAlert(data.message, "success")

        // Refresh data
        loadDeliveryData()
      } else {
        showAlert(data.message, "danger")
      }
    })
    .catch((error) => {
      console.error("Error:", error)

      // Reset button state
      confirmBtn.innerHTML = originalBtnHtml
      confirmBtn.disabled = false

      showAlert("Error marking order as ready", "danger")
    })
}

// Schedule delivery
function scheduleDelivery() {
  const orderId = document.getElementById("orderSelect").value
  const deliveryDate = document.getElementById("deliveryDate").value
  const timeWindow = document.getElementById("timeWindow").value
  const driverId = document.getElementById("driverId").value
  const notes = document.getElementById("notes").value
  const notifyCustomer = document.getElementById("notifyCustomer").checked ? 1 : 0

  if (!orderId || !deliveryDate || !timeWindow) {
    showAlert("Please fill in all required fields", "warning")
    return
  }

  // Show loading state
  const confirmBtn = document.getElementById("confirmOrderSelectionBtn")
  const originalBtnHtml = confirmBtn.innerHTML
  confirmBtn.innerHTML =
    '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Processing...'
  confirmBtn.disabled = true

  // Create form data
  const formData = new FormData()
  formData.append("action", "schedule_delivery")
  formData.append("order_id", orderId)
  formData.append("delivery_date", deliveryDate)
  formData.append("time_window", timeWindow)
  formData.append("driver_id", driverId)
  formData.append("notes", notes)
  formData.append("notify_customer", notifyCustomer)

  // Send request to the server
  fetch("delivery_operations.php", {
    method: "POST",
    body: formData,
  })
    .then((response) => response.json())
    .then((data) => {
      // Reset button state
      confirmBtn.innerHTML = originalBtnHtml
      confirmBtn.disabled = false

      if (data.success) {
        // Close the modal
        bootstrap.Modal.getInstance(document.getElementById("orderSelectionModal")).hide()

        // Show success message
        showAlert(data.message, "success")

        // Refresh data
        loadDeliveryData()
      } else {
        showAlert(data.message, "danger")
      }
    })
    .catch((error) => {
      console.error("Error:", error)

      // Reset button state
      confirmBtn.innerHTML = originalBtnHtml
      confirmBtn.disabled = false

      showAlert("Error scheduling delivery", "danger")
    })
}

// Open update status modal
function openUpdateStatusModal(orderId, deliveryMode) {
  // Create modal HTML
  const modalTitle = deliveryMode === "pickup" ? "Update Pickup Status" : "Update Delivery Status"
  const modalIcon = deliveryMode === "pickup" ? "box-seam" : "truck"

  const modalHtml = `
    <div class="modal fade" id="updateStatusModal" tabindex="-1" aria-labelledby="updateStatusModalLabel" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="updateStatusModalLabel">
              <i class="bi bi-${modalIcon} me-2"></i>${modalTitle}
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <form id="updateStatusForm">
              <input type="hidden" id="updateOrderId" value="${orderId}">
              <input type="hidden" id="updateDeliveryMode" value="${deliveryMode}">
              
              <div class="mb-3">
                <label for="statusSelect" class="form-label">Status</label>
                <select class="form-select" id="statusSelect" required>
                  <option value="" selected disabled>Select status...</option>
                  ${
                    deliveryMode === "pickup"
                      ? `
                    <option value="confirmed">Confirmed</option>
                    <option value="ready">Ready for Pickup</option>
                    <option value="picked up">Picked Up</option>
                    <option value="cancelled">Cancelled</option>
                  `
                      : `
                    <option value="confirmed">Confirmed</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  `
                  }
                </select>
              </div>
              
              <div class="mb-3">
                <label for="statusNotes" class="form-label">Notes</label>
                <textarea class="form-control" id="statusNotes" rows="3" placeholder="Add notes about this status change..."></textarea>
              </div>
              
              <div class="form-check mb-3">
                <input class="form-check-input" type="checkbox" id="statusNotifyCustomer" checked>
                <label class="form-check-label" for="statusNotifyCustomer">
                  Notify customer via email
                </label>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
            <button type="button" class="btn btn-primary" id="confirmUpdateStatusBtn" onclick="updateDeliveryStatus()">
              Update Status
            </button>
          </div>
        </div>
      </div>
    </div>
  `

  // Remove existing modal if it exists
  if (document.getElementById("updateStatusModal")) {
    document.getElementById("updateStatusModal").remove()
  }

  // Add modal to DOM
  document.body.insertAdjacentHTML("beforeend", modalHtml)

  // Show the modal
  const modal = new bootstrap.Modal(document.getElementById("updateStatusModal"))
  modal.show()
}

// Update delivery status
function updateDeliveryStatus() {
  const orderId = document.getElementById("updateOrderId").value
  const deliveryMode = document.getElementById("updateDeliveryMode").value
  const status = document.getElementById("statusSelect").value
  const notes = document.getElementById("statusNotes").value
  const notifyCustomer = document.getElementById("statusNotifyCustomer").checked ? 1 : 0

  if (!orderId || !status) {
    showAlert("Please select a status", "warning")
    return
  }

  // Show loading state
  const confirmBtn = document.getElementById("confirmUpdateStatusBtn")
  const originalBtnHtml = confirmBtn.innerHTML
  confirmBtn.innerHTML =
    '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Processing...'
  confirmBtn.disabled = true

  // Create form data
  const formData = new FormData()
  formData.append("action", "update_delivery_status")
  formData.append("order_id", orderId)
  formData.append("status", status)
  formData.append("notes", notes)
  formData.append("confirmation_type", deliveryMode)
  formData.append("notify_customer", notifyCustomer)

  // Send request to the server
  fetch("delivery_operations.php", {
    method: "POST",
    body: formData,
  })
    .then((response) => response.json())
    .then((data) => {
      // Reset button state
      confirmBtn.innerHTML = originalBtnHtml
      confirmBtn.disabled = false

      if (data.success) {
        // Close the modal
        bootstrap.Modal.getInstance(document.getElementById("updateStatusModal")).hide()

        // Show success message
        showAlert(data.message, "success")

        // Refresh data
        loadDeliveryData()
      } else {
        showAlert(data.message, "danger")
      }
    })
    .catch((error) => {
      console.error("Error:", error)

      // Reset button state
      confirmBtn.innerHTML = originalBtnHtml
      confirmBtn.disabled = false

      showAlert("Error updating status", "danger")
    })
}

// Open enhanced schedule modal
function openEnhancedScheduleModal(orderId, deliveryMode) {
  // Find the delivery in the pending deliveries
  const delivery = pendingDeliveries.find((d) => d.order_id === orderId)

  if (!delivery) {
    showAlert("Delivery not found", "danger")
    return
  }

  // Create modal HTML
  const modalTitle = deliveryMode === "pickup" ? "Schedule Pickup" : "Schedule Delivery"
  const modalIcon = deliveryMode === "pickup" ? "box-seam" : "truck"

  const modalHtml = `
    <div class="modal fade" id="scheduleModal" tabindex="-1" aria-labelledby="scheduleModalLabel" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="scheduleModalLabel">
              <i class="bi bi-${modalIcon} me-2"></i>${modalTitle}
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <div class="alert alert-info">
              <i class="bi bi-info-circle me-2"></i>
              Scheduling for: <strong>${delivery.customer_name}</strong> (Order #${delivery.order_id})
            </div>
            
            <form id="scheduleForm">
              <input type="hidden" id="scheduleOrderId" value="${orderId}">
              <input type="hidden" id="scheduleDeliveryMode" value="${deliveryMode}">
              
              <div class="mb-3">
                <label for="scheduleDate" class="form-label">Date</label>
                <input type="text" class="form-control" id="scheduleDate" placeholder="Select date">
              </div>
              
              <div class="mb-3">
                <label for="scheduleTimeWindow" class="form-label">Time Window</label>
                <select class="form-select" id="scheduleTimeWindow" required>
                  <option value="" selected disabled>Select time window...</option>
                  <option value="morning">Morning (8:00 AM - 12:00 PM)</option>
                  <option value="afternoon">Afternoon (12:00 PM - 4:00 PM)</option>
                  <option value="evening">Evening (4:00 PM - 8:00 PM)</option>
                </select>
              </div>
              
              ${
                deliveryMode === "delivery"
                  ? `
                <div class="mb-3">
                  <label for="scheduleDriverId" class="form-label">Driver</label>
                  <select class="form-select" id="scheduleDriverId">
                    <option value="">No driver assigned</option>
                    <option value="D001">Driver 1</option>
                    <option value="D002">Driver 2</option>
                    <option value="D003">Driver 3</option>
                  </select>
                </div>
              `
                  : ""
              }
              
              <div class="mb-3">
                <label for="scheduleNotes" class="form-label">Notes</label>
                <textarea class="form-control" id="scheduleNotes" rows="3" placeholder="Add notes..."></textarea>
              </div>
              
              <div class="form-check mb-3">
                <input class="form-check-input" type="checkbox" id="scheduleNotifyCustomer" checked>
                <label class="form-check-label" for="scheduleNotifyCustomer">
                  Notify customer via email
                </label>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
            <button type="button" class="btn btn-primary" id="confirmScheduleBtn" onclick="confirmSchedule()">
              Schedule
            </button>
          </div>
        </div>
      </div>
    </div>
  `

  // Remove existing modal if it exists
  if (document.getElementById("scheduleModal")) {
    document.getElementById("scheduleModal").remove()
  }

  // Add modal to DOM
  document.body.insertAdjacentHTML("beforeend", modalHtml)

  // Initialize date picker
  if (document.getElementById("scheduleDate")) {
    flatpickr("#scheduleDate", {
      enableTime: false,
      dateFormat: "Y-m-d",
      minDate: "today",
    })
  }

  // Show the modal
  const modal = new bootstrap.Modal(document.getElementById("scheduleModal"))
  modal.show()
}

// Confirm schedule
function confirmSchedule() {
  const orderId = document.getElementById("scheduleOrderId").value
  const deliveryDate = document.getElementById("scheduleDate").value
  const timeWindow = document.getElementById("scheduleTimeWindow").value
  const driverId = document.getElementById("scheduleDriverId") ? document.getElementById("scheduleDriverId").value : ""
  const notes = document.getElementById("scheduleNotes").value
  const notifyCustomer = document.getElementById("scheduleNotifyCustomer").checked ? 1 : 0

  if (!orderId || !deliveryDate || !timeWindow) {
    showAlert("Please fill in all required fields", "warning")
    return
  }

  // Show loading state
  const confirmBtn = document.getElementById("confirmScheduleBtn")
  const originalBtnHtml = confirmBtn.innerHTML
  confirmBtn.innerHTML =
    '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Processing...'
  confirmBtn.disabled = true

  // Create form data
  const formData = new FormData()
  formData.append("action", "schedule_delivery")
  formData.append("order_id", orderId)
  formData.append("delivery_date", deliveryDate)
  formData.append("time_window", timeWindow)
  formData.append("driver_id", driverId)
  formData.append("notes", notes)
  formData.append("notify_customer", notifyCustomer)

  // Send request to the server
  fetch("delivery_operations.php", {
    method: "POST",
    body: formData,
  })
    .then((response) => response.json())
    .then((data) => {
      // Reset button state
      confirmBtn.innerHTML = originalBtnHtml
      confirmBtn.disabled = false

      if (data.success) {
        // Close the modal
        bootstrap.Modal.getInstance(document.getElementById("scheduleModal")).hide()

        // Show success message
        showAlert(data.message, "success")

        // Refresh data
        loadDeliveryData()
      } else {
        showAlert(data.message, "danger")
      }
    })
    .catch((error) => {
      console.error("Error:", error)

      // Reset button state
      confirmBtn.innerHTML = originalBtnHtml
      confirmBtn.disabled = false

      showAlert("Error scheduling delivery", "danger")
    })
}

// Open complete delivery modal
function openCompleteDeliveryModal(orderId, deliveryMode) {
  // Create modal HTML
  const modalTitle = deliveryMode === "pickup" ? "Mark as Picked Up" : "Mark as Delivered"
  const modalIcon = deliveryMode === "pickup" ? "bag-check" : "truck-check"

  const modalHtml = `
    <div class="modal fade" id="completeDeliveryModal" tabindex="-1" aria-labelledby="completeDeliveryModalLabel" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="completeDeliveryModalLabel">
              <i class="bi bi-${modalIcon} me-2"></i>${modalTitle}
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <form id="completeDeliveryForm">
              <input type="hidden" id="completeOrderId" value="${orderId}">
              <input type="hidden" id="completeDeliveryMode" value="${deliveryMode}">
              
              <div class="mb-3">
                <label for="completeTime" class="form-label">Completion Time</label>
                <input type="text" class="form-control" id="completeTime" placeholder="Select date and time">
              </div>
              
              <div class="mb-3">
                <label for="completeNotes" class="form-label">Notes</label>
                <textarea class="form-control" id="completeNotes" rows="3" placeholder="Add notes..."></textarea>
              </div>
              
              <div class="form-check mb-3">
                <input class="form-check-input" type="checkbox" id="completeNotifyCustomer" checked>
                <label class="form-check-label" for="completeNotifyCustomer">
                  Notify customer via email
                </label>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
            <button type="button" class="btn btn-success" id="confirmCompleteBtn" onclick="completeDelivery()">
              Confirm
            </button>
          </div>
        </div>
      </div>
    </div>
  `

  // Remove existing modal if it exists
  if (document.getElementById("completeDeliveryModal")) {
    document.getElementById("completeDeliveryModal").remove()
  }

  // Add modal to DOM
  document.body.insertAdjacentHTML("beforeend", modalHtml)

  // Initialize date picker
  if (document.getElementById("completeTime")) {
    flatpickr("#completeTime", {
      enableTime: true,
      dateFormat: "Y-m-d H:i",
      defaultDate: new Date(),
    })
  }

  // Show the modal
  const modal = new bootstrap.Modal(document.getElementById("completeDeliveryModal"))
  modal.show()
}

// Complete delivery
function completeDelivery() {
  const orderId = document.getElementById("completeOrderId").value
  const deliveryMode = document.getElementById("completeDeliveryMode").value
  const actualDeliveryTime = document.getElementById("completeTime").value
  const notes = document.getElementById("completeNotes").value
  const notifyCustomer = document.getElementById("completeNotifyCustomer").checked ? 1 : 0

  if (!orderId) {
    showAlert("Order ID is required", "warning")
    return
  }

  // Show loading state
  const confirmBtn = document.getElementById("confirmCompleteBtn")
  const originalBtnHtml = confirmBtn.innerHTML
  confirmBtn.innerHTML =
    '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Processing...'
  confirmBtn.disabled = true

  // Create form data
  const formData = new FormData()
  formData.append("action", "update_delivery_status")
  formData.append("order_id", orderId)
  formData.append("status", deliveryMode === "pickup" ? "picked up" : "delivered")
  formData.append("notes", notes)
  formData.append("confirmation_type", deliveryMode)
  formData.append("actual_delivery_time", actualDeliveryTime)
  formData.append("notify_customer", notifyCustomer)

  // Send request to the server
  fetch("delivery_operations.php", {
    method: "POST",
    body: formData,
  })
    .then((response) => response.json())
    .then((data) => {
      // Reset button state
      confirmBtn.innerHTML = originalBtnHtml
      confirmBtn.disabled = false

      if (data.success) {
        // Close the modal
        bootstrap.Modal.getInstance(document.getElementById("completeDeliveryModal")).hide()

        // Show success message
        showAlert(data.message, "success")

        // Refresh data
        loadDeliveryData()
      } else {
        showAlert(data.message, "danger")
      }
    })
    .catch((error) => {
      console.error("Error:", error)

      // Reset button state
      confirmBtn.innerHTML = originalBtnHtml
      confirmBtn.disabled = false

      showAlert("Error completing delivery", "danger")
    })
}

// Open report issue modal
function openReportIssueModal(orderId) {
  // Create modal HTML
  const modalHtml = `
    <div class="modal fade" id="reportIssueModal" tabindex="-1" aria-labelledby="reportIssueModalLabel" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="reportIssueModalLabel">
              <i class="bi bi-exclamation-triangle me-2"></i>Report Delivery Issue
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <form id="reportIssueForm">
              <input type="hidden" id="reportIssueOrderId" value="${orderId}">
              
              <div class="mb-3">
                <label for="issueType" class="form-label">Issue Type</label>
                <select class="form-select" id="issueType" required>
                  <option value="" selected disabled>Select issue type...</option>
                  <option value="delay">Delivery Delay</option>
                  <option value="damage">Damaged Items</option>
                  <option value="wrong_item">Wrong Items</option>
                  <option value="missing_item">Missing Items</option>
                  <option value="other">Other Issue</option>
                </select>
              </div>
              
              <div class="mb-3">
                <label for="issueDescription" class="form-label">Description</label>
                <textarea class="form-control" id="issueDescription" rows="4" placeholder="Describe the issue in detail..."></textarea>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
            <button type="button" class="btn btn-danger" id="confirmReportIssueBtn" onclick="reportIssue()">
              Report Issue
            </button>
          </div>
        </div>
      </div>
    </div>
  `

  // Remove existing modal if it exists
  if (document.getElementById("reportIssueModal")) {
    document.getElementById("reportIssueModal").remove()
  }

  // Add modal to DOM
  document.body.insertAdjacentHTML("beforeend", modalHtml)

  // Show the modal
  const modal = new bootstrap.Modal(document.getElementById("reportIssueModal"))
  modal.show()
}

// Report issue
function reportIssue() {
  const orderId = document.getElementById("reportIssueOrderId").value
  const issueType = document.getElementById("issueType").value
  const description = document.getElementById("issueDescription").value

  if (!orderId || !issueType) {
    showAlert("Please select an issue type", "warning")
    return
  }

  // Show loading state
  const confirmBtn = document.getElementById("confirmReportIssueBtn")
  const originalBtnHtml = confirmBtn.innerHTML
  confirmBtn.innerHTML =
    '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Processing...'
  confirmBtn.disabled = true

  // Create form data
  const formData = new FormData()
  formData.append("action", "report_delivery_issue")
  formData.append("order_id", orderId)
  formData.append("issue_type", issueType)
  formData.append("description", description)

  // Send request to the server
  fetch("delivery_operations.php", {
    method: "POST",
    body: formData,
  })
    .then((response) => response.json())
    .then((data) => {
      // Reset button state
      confirmBtn.innerHTML = originalBtnHtml
      confirmBtn.disabled = false

      if (data.success) {
        // Close the modal
        bootstrap.Modal.getInstance(document.getElementById("reportIssueModal")).hide()

        // Show success message
        showAlert(data.message, "success")

        // Refresh data
        loadDeliveryIssues()
      } else {
        showAlert(data.message, "danger")
      }
    })
    .catch((error) => {
      console.error("Error:", error)

      // Reset button state
      confirmBtn.innerHTML = originalBtnHtml
      confirmBtn.disabled = false

      showAlert("Error reporting issue", "danger")
    })
}

// View issue details
function viewIssueDetails(issueId) {
  // Find the issue in the reported or resolved issues
  const issue = [...reportedIssues, ...resolvedIssues].find((i) => i.issue_id === issueId)

  if (!issue) {
    showAlert("Issue not found", "danger")
    return
  }

  // Create modal HTML
  const modalHtml = `
    <div class="modal fade" id="issueDetailsModal" tabindex="-1" aria-labelledby="issueDetailsModalLabel" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="issueDetailsModalLabel">
              <i class="bi bi-exclamation-triangle me-2"></i>Issue Details
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <div class="card mb-3">
              <div class="card-header bg-light">
                <h6 class="mb-0"><i class="bi bi-info-circle me-2"></i>Issue Information</h6>
              </div>
              <div class="card-body">
                <p class="mb-1"><strong>Order ID:</strong> ${issue.order_id}</p>
                <p class="mb-1"><strong>Customer:</strong> ${issue.customer_name}</p>
                <p class="mb-1"><strong>Issue Type:</strong> <span class="badge bg-info text-dark">${formatIssueType(issue.issue_type)}</span></p>
                <p class="mb-1"><strong>Status:</strong> <span class="badge ${getIssueStatusBadgeClass(issue.status)}">${capitalizeFirstLetter(issue.status)}</span></p>
                <p class="mb-1"><strong>Reported:</strong> ${issue.formatted_reported_at}</p>
                ${issue.status === "resolved" ? `<p class="mb-0"><strong>Resolved:</strong> ${issue.formatted_resolved_at}</p>` : ""}
              </div>
            </div>
            
            <div class="card mb-3">
              <div class="card-header bg-light">
                <h6 class="mb-0"><i class="bi bi-chat-text me-2"></i>Description</h6>
              </div>
              <div class="card-body">
                <p class="mb-0">${issue.description || "No description provided"}</p>
              </div>
            </div>
            
            ${
              issue.status === "resolved"
                ? `
              <div class="card">
                <div class="card-header bg-light">
                  <h6 class="mb-0"><i class="bi bi-check-circle me-2"></i>Resolution</h6>
                </div>
                <div class="card-body">
                  <p class="mb-0">${issue.resolution || "No resolution details provided"}</p>
                </div>
              </div>
            `
                : ""
            }
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
            ${
              issue.status !== "resolved"
                ? `
              <button type="button" class="btn btn-success resolve-issue-btn-modal" data-id="${issue.issue_id}" data-order-id="${issue.order_id}" data-issue-type="${formatIssueType(issue.issue_type)}" data-description="${issue.description || ""}">
                <i class="bi bi-check-circle me-1"></i> Resolve Issue
              </button>
            `
                : ""
            }
            <button type="button" class="btn btn-primary view-order-btn-modal" data-id="${issue.order_id}">
              <i class="bi bi-box me-1"></i> View Order
            </button>
          </div>
        </div>
      </div>
    </div>
  `

  // Remove existing modal if it exists
  if (document.getElementById("issueDetailsModal")) {
    document.getElementById("issueDetailsModal").remove()
  }

  // Add modal to DOM
  document.body.insertAdjacentHTML("beforeend", modalHtml)

  // Show the modal
  const modal = new bootstrap.Modal(document.getElementById("issueDetailsModal"))
  modal.show()

  // Add event listeners to action buttons
  const resolveIssueBtnModal = document.querySelector(".resolve-issue-btn-modal")
  if (resolveIssueBtnModal) {
    resolveIssueBtnModal.addEventListener("click", function () {
      modal.hide()
      const issueId = this.getAttribute("data-id")
      const orderId = this.getAttribute("data-order-id")
      const issueType = this.getAttribute("data-issue-type")
      const description = this.getAttribute("data-description")
      openResolveIssueModal(issueId, orderId, issueType, description)
    })
  }

  const viewOrderBtnModal = document.querySelector(".view-order-btn-modal")
  if (viewOrderBtnModal) {
    viewOrderBtnModal.addEventListener("click", function () {
      modal.hide()
      const orderId = this.getAttribute("data-id")
      viewDeliveryDetails(orderId)
    })
  }
}

// Format issue type
function formatIssueType(issueType) {
  switch (issueType) {
    case "delay":
      return "Delivery Delay"
    case "damage":
      return "Damaged Items"
    case "wrong_item":
      return "Wrong Items"
    case "missing_item":
      return "Missing Items"
    case "other":
      return "Other Issue"
    default:
      return issueType.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())
  }
}

// Get issue status badge class
function getIssueStatusBadgeClass(status) {
  switch (status) {
    case "reported":
      return "bg-danger"
    case "investigating":
      return "bg-warning text-dark"
    case "resolved":
      return "bg-success"
    default:
      return "bg-secondary"
  }
}

// Open resolve issue modal
function openResolveIssueModal(issueId, orderId, issueType, description) {
  // Create modal HTML
  const modalHtml = `
    <div class="modal fade" id="resolveIssueModal" tabindex="-1" aria-labelledby="resolveIssueModalLabel" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="resolveIssueModalLabel">
              <i class="bi bi-check-circle me-2"></i>Resolve Issue
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <div class="alert alert-info">
              <i class="bi bi-info-circle me-2"></i>
              Resolving issue for Order #${orderId}
            </div>
            
            <div class="card mb-3">
              <div class="card-header bg-light">
                <h6 class="mb-0"><i class="bi bi-exclamation-triangle me-2"></i>Issue: ${issueType}</h6>
              </div>
              <div class="card-body">
                <p class="mb-0">${description || "No description provided"}</p>
              </div>
            </div>
            
            <form id="resolveIssueForm">
              <input type="hidden" id="resolveIssueId" value="${issueId}">
              
              <div class="mb-3">
                <label for="resolution" class="form-label">Resolution</label>
                <textarea class="form-control" id="resolution" rows="4" placeholder="Describe how the issue was resolved..." required></textarea>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
            <button type="button" class="btn btn-success" id="confirmResolveIssueBtn" onclick="resolveIssue()">
              Mark as Resolved
            </button>
          </div>
        </div>
      </div>
    </div>
  `

  // Remove existing modal if it exists
  if (document.getElementById("resolveIssueModal")) {
    document.getElementById("resolveIssueModal").remove()
  }

  // Add modal to DOM
  document.body.insertAdjacentHTML("beforeend", modalHtml)

  // Show the modal
  const modal = new bootstrap.Modal(document.getElementById("resolveIssueModal"))
  modal.show()
}

// Resolve issue
function resolveIssue() {
  const issueId = document.getElementById("resolveIssueId").value
  const resolution = document.getElementById("resolution").value

  if (!issueId || !resolution) {
    showAlert("Please provide a resolution", "warning")
    return
  }

  // Show loading state
  const confirmBtn = document.getElementById("confirmResolveIssueBtn")
  const originalBtnHtml = confirmBtn.innerHTML
  confirmBtn.innerHTML =
    '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Processing...'
  confirmBtn.disabled = true

  // Create form data
  const formData = new FormData()
  formData.append("action", "resolve_issue")
  formData.append("issue_id", issueId)
  formData.append("resolution", resolution)

  // Send request to the server
  fetch("delivery_operations.php", {
    method: "POST",
    body: formData,
  })
    .then((response) => response.json())
    .then((data) => {
      // Reset button state
      confirmBtn.innerHTML = originalBtnHtml
      confirmBtn.disabled = false

      if (data.success) {
        // Close the modal
        bootstrap.Modal.getInstance(document.getElementById("resolveIssueModal")).hide()

        // Show success message
        showAlert(data.message, "success")

        // Refresh data
        loadDeliveryIssues()
      } else {
        showAlert(data.message, "danger")
      }
    })
    .catch((error) => {
      console.error("Error:", error)

      // Reset button state
      confirmBtn.innerHTML = originalBtnHtml
      confirmBtn.disabled = false

      showAlert("Error resolving issue", "danger")
    })
}
