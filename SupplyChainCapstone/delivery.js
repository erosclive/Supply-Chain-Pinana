// Global variables
let pendingDeliveries = []
let activeDeliveries = []
let completedDeliveries = []
let deliveryIssues = []
let reportedIssues = []
let resolvedIssues = []
const availableDrivers = [{ id: "DRV001", name: "Piñana Gourmet" }]

// Initialize the page
document.addEventListener("DOMContentLoaded", () => {
  // Initialize sidebar toggle for mobile
  initSidebar()

  // Initialize date pickers
  initDatePickers()

  // Load deliveries data
  loadDeliveryData()

  // Initialize event listeners
  initEventListeners()
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
}

// Load delivery data for all tabs
function loadDeliveryData() {
  // Load pending deliveries
  loadPendingDeliveries()

  // Load active deliveries
  loadActiveDeliveries()

  // Load completed deliveries
  loadCompletedDeliveries()

  // Load delivery issues
  loadDeliveryIssues()

  // Load orders for dropdowns
  loadOrdersForDropdowns()
}

// Initialize event listeners
function initEventListeners() {
  // Mark order ready button
  const markReadyBtn = document.getElementById("mark-ready-btn")
  if (markReadyBtn) {
    markReadyBtn.addEventListener("click", () => {
      const markReadyModal = new bootstrap.Modal(document.getElementById("markReadyModal"))
      markReadyModal.show()
    })
  }

  // Schedule delivery button
  const scheduleDeliveryBtn = document.getElementById("schedule-delivery-btn")
  if (scheduleDeliveryBtn) {
    scheduleDeliveryBtn.addEventListener("click", () => {
      const scheduleModal = new bootstrap.Modal(document.getElementById("scheduleDeliveryModal"))
      scheduleModal.show()
    })
  }

  // Confirm ready button
  const confirmReadyBtn = document.getElementById("confirmReadyBtn")
  if (confirmReadyBtn) {
    confirmReadyBtn.addEventListener("click", markOrderReady)
  }

  // Confirm schedule button
  const confirmScheduleBtn = document.getElementById("confirmScheduleBtn")
  if (confirmScheduleBtn) {
    confirmScheduleBtn.addEventListener("click", scheduleDelivery)
  }

  // Remove these lines from the initEventListeners function
  // Update status button in delivery details modal
  // const updateStatusBtn = document.getElementById("updateStatusBtn")
  // if (updateStatusBtn) {
  //   updateStatusBtn.addEventListener("click", showUpdateStatusOptions)
  // }

  // Report issue button in delivery details modal
  const reportIssueBtn = document.getElementById("reportIssueBtn")
  if (reportIssueBtn) {
    reportIssueBtn.addEventListener("click", () => {
      const orderId = document.getElementById("detail-order-id").textContent
      openReportIssueModal(orderId)
    })
  }

  // Confirm report issue button
  const confirmReportIssueBtn = document.getElementById("confirmReportIssueBtn")
  if (confirmReportIssueBtn) {
    confirmReportIssueBtn.addEventListener("click", reportIssue)
  }

  // Confirm resolve issue button
  const confirmResolveIssueBtn = document.getElementById("confirmResolveIssueBtn")
  if (confirmResolveIssueBtn) {
    confirmResolveIssueBtn.addEventListener("click", resolveIssue)
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
      case "pending":
        statusClass = "bg-warning text-dark"
        break
      case "processing":
        statusClass = "bg-info text-dark"
        break
      default:
        statusClass = "bg-secondary"
    }

    // Truncate product list if too long
    const productList = delivery.product_list || "No products"
    const truncatedProducts = productList.length > 50 ? productList.substring(0, 50) + "..." : productList

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
    </td>
    <td>
      <div class="btn-group">
        <button type="button" class="btn btn-sm btn-outline-primary view-delivery-btn" data-id="${delivery.order_id}" title="View Details">
          <i class="bi bi-eye"></i>
        </button>
        <button type="button" class="btn btn-sm btn-outline-success mark-ready-btn" data-id="${delivery.order_id}" title="Mark Ready">
          <i class="bi bi-box-seam"></i>
        </button>
        <button type="button" class="btn btn-sm btn-outline-secondary schedule-btn" data-id="${delivery.order_id}" title="Schedule">
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

  document.querySelectorAll(".mark-ready-btn").forEach((btn) => {
    btn.addEventListener("click", function () {
      const orderId = this.getAttribute("data-id")
      openMarkReadyModal(orderId)
    })
  })

  document.querySelectorAll(".schedule-btn").forEach((btn) => {
    btn.addEventListener("click", function () {
      const orderId = this.getAttribute("data-id")
      openScheduleModal(orderId)
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
    // Truncate product list if too long
    const productList = delivery.product_list || "No products"
    const truncatedProducts = productList.length > 50 ? productList.substring(0, 50) + "..." : productList

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
      <div>${delivery.formatted_eta}</div>
      <div class="small text-muted">Ordered: ${delivery.formatted_date}</div>
    </td>
    <td>
      <span class="badge bg-primary">In Transit</span>
    </td>
    <td>
      <div class="btn-group">
        <button type="button" class="btn btn-sm btn-outline-primary view-delivery-btn" data-id="${delivery.order_id}" title="View Details">
          <i class="bi bi-eye"></i>
        </button>
        <button type="button" class="btn btn-sm btn-outline-success complete-delivery-btn" data-id="${delivery.order_id}" title="Mark Delivered">
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
      completeDelivery(orderId)
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
    // Generate star rating
    // let ratingStars = ""
    // const rating = Number.parseInt(delivery.rating) || 0

    // for (let i = 1; i <= 5; i++) {
    //   if (i <= rating) {
    //     ratingStars += '<i class="bi bi-star-fill text-warning"></i>'
    //   } else {
    //     ratingStars += '<i class="bi bi-star text-muted"></i>'
    //   }
    // }

    // Truncate product list if too long
    const productList = delivery.product_list || "No products"
    const truncatedProducts = productList.length > 50 ? productList.substring(0, 50) + "..." : productList

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
      <div class="small text-muted">Ordered: ${delivery.formatted_date}</div>
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
        deliveryIssues = data.issues

        // Split issues into reported and resolved
        reportedIssues = deliveryIssues.filter((issue) => issue.status !== "resolved")
        resolvedIssues = deliveryIssues.filter((issue) => issue.status === "resolved")

        // Render both tables
        renderReportedIssues(reportedIssues)
        renderResolvedIssues(resolvedIssues)

        // Update badge count - only count reported issues for notification
        const issuesBadge = document.querySelector("#issues-tab .badge")
        if (issuesBadge) {
          issuesBadge.textContent = reportedIssues.length
        }

        // Update notification badge in header - only count reported issues
        const notificationBadge = document.getElementById("notification-badge")
        if (notificationBadge) {
          notificationBadge.textContent = reportedIssues.length
        }
      } else {
        showAlert("Failed to load delivery issues: " + data.message, "danger")
        document.getElementById("reported-issues-table-body").innerHTML = `
          <tr>
            <td colspan="4" class="text-center py-4">
              <div class="text-danger">
                <i class="bi bi-exclamation-triangle-fill fs-1 mb-3"></i>
                <p>Error loading delivery issues. Please try again.</p>
              </div>
            </td>
          </tr>
        `
        document.getElementById("resolved-issues-table-body").innerHTML = `
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
      document.getElementById("reported-issues-table-body").innerHTML = `
        <tr>
          <td colspan="4" class="text-center py-4">
            <div class="text-danger">
              <i class="bi bi-exclamation-triangle-fill fs-1 mb-3"></i>
              <p>Error loading delivery issues. Please try again.</p>
            </div>
          </td>
        </tr>
      `
      document.getElementById("resolved-issues-table-body").innerHTML = `
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
        <button type="button" class="btn btn-sm btn-outline-success resolve-issue-btn" data-id="${issue.issue_id}" title="Resolve Issue">
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
      openResolveIssueModal(issueId)
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

// Load orders for dropdowns
function loadOrdersForDropdowns() {
  fetch("delivery_operations.php?action=get_orders_for_delivery")
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        const orders = data.orders

        // Populate order select in Mark Ready modal
        const orderSelect = document.getElementById("orderSelect")
        if (orderSelect) {
          orderSelect.innerHTML = "<option selected disabled>Choose an order...</option>"
          orders.forEach((order) => {
            const option = document.createElement("option")
            option.value = order.order_id
            option.textContent = `${order.order_id} - ${order.customer_name} (${order.formatted_amount})`
            orderSelect.appendChild(option)
          })
        }

        // Populate order select in Schedule Delivery modal
        const scheduleOrderSelect = document.getElementById("scheduleOrderSelect")
        if (scheduleOrderSelect) {
          scheduleOrderSelect.innerHTML = "<option selected disabled>Choose an order...</option>"
          orders.forEach((order) => {
            const option = document.createElement("option")
            option.value = order.order_id
            option.textContent = `${order.order_id} - ${order.customer_name} (${order.formatted_amount})`
            scheduleOrderSelect.appendChild(option)
          })
        }

        // Populate driver selects
        const driverSelects = document.querySelectorAll(".driver-select")
        driverSelects.forEach((select) => {
          select.innerHTML = "<option value=''>Select Driver (Optional)</option>"
          availableDrivers.forEach((driver) => {
            const option = document.createElement("option")
            option.value = driver.id
            option.textContent = driver.name
            select.appendChild(option)
          })
        })
      } else {
        showAlert("Failed to load orders: " + data.message, "warning")
      }
    })
    .catch((error) => {
      console.error("Error loading orders:", error)
      showAlert("Error loading orders. Please try again.", "warning")
    })
}

// Open Mark Ready modal with order pre-selected
function openMarkReadyModal(orderId) {
  const orderSelect = document.getElementById("orderSelect")
  if (orderSelect) {
    // Find and select the option with the matching order ID
    const option = Array.from(orderSelect.options).find((opt) => opt.value === orderId)
    if (option) {
      option.selected = true
    }
  }

  // Set default estimated time to 2 hours from now
  const estimatedTime = document.getElementById("estimatedTime")
  if (estimatedTime) {
    const now = new Date()
    now.setHours(now.getHours() + 2)
    estimatedTime.value = now.toISOString().slice(0, 16).replace("T", " ")
  }

  // Show the modal
  const markReadyModal = new bootstrap.Modal(document.getElementById("markReadyModal"))
  markReadyModal.show()
}

// Open Schedule Delivery modal with order pre-selected
function openScheduleModal(orderId) {
  const scheduleOrderSelect = document.getElementById("scheduleOrderSelect")
  if (scheduleOrderSelect) {
    // Find and select the option with the matching order ID
    const option = Array.from(scheduleOrderSelect.options).find((opt) => opt.value === orderId)
    if (option) {
      option.selected = true
    }
  }

  // Set default date to tomorrow
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)

  const deliveryDate = document.getElementById("deliveryDate")
  if (deliveryDate) {
    deliveryDate.value = tomorrow.toISOString().split("T")[0]
  }

  // Show the modal
  const scheduleModal = new bootstrap.Modal(document.getElementById("scheduleDeliveryModal"))
  scheduleModal.show()
}

// Open Report Issue modal with order pre-selected
function openReportIssueModal(orderId) {
  document.getElementById("issueOrderId").value = orderId

  // Reset form
  document.getElementById("issueType").value = ""
  document.getElementById("issueDescription").value = ""

  // Show the modal
  const reportIssueModal = new bootstrap.Modal(document.getElementById("reportIssueModal"))
  reportIssueModal.show()
}

// Open Resolve Issue modal
function openResolveIssueModal(issueId) {
  // Find the issue
  const issue = deliveryIssues.find((i) => i.issue_id == issueId)
  if (!issue) {
    showAlert("Issue not found", "danger")
    return
  }

  // Populate modal
  document.getElementById("resolveIssueId").value = issueId
  document.getElementById("resolveIssueOrderId").textContent = issue.order_id
  document.getElementById("resolveIssueType").textContent = issue.issue_type
    .replace("_", " ")
    .replace(/\b\w/g, (l) => l.toUpperCase())
  document.getElementById("resolveIssueDescription").textContent = issue.description || "No description provided"
  document.getElementById("resolveIssueResolution").value = ""

  // Show the modal
  const resolveIssueModal = new bootstrap.Modal(document.getElementById("resolveIssueModal"))
  resolveIssueModal.show()
}

// Mark order as ready for delivery
function markOrderReady() {
  const orderId = document.getElementById("orderSelect").value
  const estimatedTime = document.getElementById("estimatedTime").value
  const deliveryNotes = document.getElementById("deliveryNotes").value
  const driverId = document.getElementById("driverSelect").value
  const notifyCustomer = document.getElementById("notifyCustomer").checked ? 1 : 0

  if (!orderId) {
    showAlert("Please select an order", "warning")
    return
  }

  // Create form data
  const formData = new FormData()
  formData.append("action", "mark_order_ready")
  formData.append("order_id", orderId)
  formData.append("estimated_time", estimatedTime)
  formData.append("delivery_notes", deliveryNotes)
  formData.append("driver_id", driverId)
  formData.append("notify_customer", notifyCustomer)

  // Send request
  fetch("delivery_operations.php", {
    method: "POST",
    body: formData,
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        showAlert("Order marked as ready for delivery", "success")

        // Close modal
        const markReadyModal = bootstrap.Modal.getInstance(document.getElementById("markReadyModal"))
        markReadyModal.hide()

        // Reload data
        loadDeliveryData()
      } else {
        showAlert("Failed to mark order as ready: " + data.message, "danger")
      }
    })
    .catch((error) => {
      console.error("Error marking order as ready:", error)
      showAlert("Error marking order as ready. Please try again.", "danger")
    })
}

// Schedule delivery
function scheduleDelivery() {
  const orderId = document.getElementById("scheduleOrderSelect").value
  const deliveryDate = document.getElementById("deliveryDate").value
  const timeWindow = document.getElementById("deliveryTimeWindow").value
  const driverId = document.getElementById("scheduleDriverSelect").value
  const notes = document.getElementById("scheduleNotes").value
  const notifyCustomer = document.getElementById("scheduleNotifyCustomer").checked ? 1 : 0

  if (!orderId || !deliveryDate || !timeWindow) {
    showAlert("Please fill in all required fields", "warning")
    return
  }

  // Create form data
  const formData = new FormData()
  formData.append("action", "schedule_delivery")
  formData.append("order_id", orderId)
  formData.append("delivery_date", deliveryDate)
  formData.append("time_window", timeWindow)
  formData.append("driver_id", driverId)
  formData.append("notes", notes)
  formData.append("notify_customer", notifyCustomer)

  // Send request
  fetch("delivery_operations.php", {
    method: "POST",
    body: formData,
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        showAlert("Delivery scheduled successfully", "success")

        // Close modal
        const scheduleModal = bootstrap.Modal.getInstance(document.getElementById("scheduleDeliveryModal"))
        scheduleModal.hide()

        // Reload data
        loadDeliveryData()
      } else {
        showAlert("Failed to schedule delivery: " + data.message, "danger")
      }
    })
    .catch((error) => {
      console.error("Error scheduling delivery:", error)
      showAlert("Error scheduling delivery. Please try again.", "danger")
    })
}

// Report delivery issue
function reportIssue() {
  const orderId = document.getElementById("issueOrderId").value
  const issueType = document.getElementById("issueType").value
  const description = document.getElementById("issueDescription").value

  if (!orderId || !issueType) {
    showAlert("Please select an issue type", "warning")
    return
  }

  // Create form data
  const formData = new FormData()
  formData.append("action", "report_delivery_issue")
  formData.append("order_id", orderId)
  formData.append("issue_type", issueType)
  formData.append("description", description)

  // Send request
  fetch("delivery_operations.php", {
    method: "POST",
    body: formData,
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        showAlert("Issue reported successfully", "success")

        // Close modal
        const reportIssueModal = bootstrap.Modal.getInstance(document.getElementById("reportIssueModal"))
        reportIssueModal.hide()

        // Reload data
        loadDeliveryIssues()
      } else {
        showAlert("Failed to report issue: " + data.message, "danger")
      }
    })
    .catch((error) => {
      console.error("Error reporting issue:", error)
      showAlert("Error reporting issue. Please try again.", "danger")
    })
}

// Resolve delivery issue
function resolveIssue() {
  const issueId = document.getElementById("resolveIssueId").value
  const resolution = document.getElementById("resolveIssueResolution").value

  if (!issueId) {
    showAlert("Issue ID is missing", "warning")
    return
  }

  if (!resolution) {
    showAlert("Please provide a resolution", "warning")
    return
  }

  // Create form data
  const formData = new FormData()
  formData.append("action", "resolve_issue")
  formData.append("issue_id", issueId)
  formData.append("resolution", resolution)

  // Send request
  fetch("delivery_operations.php", {
    method: "POST",
    body: formData,
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        showAlert("Issue resolved successfully", "success")

        // Close modal
        const resolveIssueModal = bootstrap.Modal.getInstance(document.getElementById("resolveIssueModal"))
        resolveIssueModal.hide()

        // Reload data
        loadDeliveryIssues()
      } else {
        showAlert("Failed to resolve issue: " + data.message, "danger")
      }
    })
    .catch((error) => {
      console.error("Error resolving issue:", error)
      showAlert("Error resolving issue. Please try again.", "danger")
    })
}

// View delivery details
function viewDeliveryDetails(orderId) {
  fetch(`delivery_operations.php?action=get_delivery_details&order_id=${orderId}`)
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        const delivery = data.delivery

        // Populate delivery details modal
        document.getElementById("detail-order-id").textContent = delivery.order_id
        document.getElementById("detail-order-date").textContent = delivery.formatted_order_date
        document.getElementById("detail-order-amount").textContent = delivery.formatted_amount
        document.getElementById("detail-payment-method").textContent = delivery.payment_method
          .replace("_", " ")
          .replace(/\b\w/g, (l) => l.toUpperCase())

        document.getElementById("detail-customer-name").textContent = delivery.customer_name
        document.getElementById("detail-customer-phone").textContent = delivery.customer_phone || "N/A"
        document.getElementById("detail-customer-email").textContent = delivery.customer_email || "N/A"
        document.getElementById("detail-customer-address").textContent = delivery.shipping_address || "N/A"

        // Display driver info if available
        const driverInfoContainer = document.getElementById("detail-driver-info")
        if (delivery.driver_id) {
          const driver = availableDrivers.find((d) => d.id === delivery.driver_id) || { name: "Unknown Driver" }
          driverInfoContainer.innerHTML = `
            <div class="mb-3">
              <h6 class="text-muted mb-2">Driver Information</h6>
              <p class="mb-1"><strong>Driver:</strong> ${driver.name}</p>
              <p class="mb-1"><strong>ID:</strong> ${delivery.driver_id}</p>
            </div>
          `
        } else {
          driverInfoContainer.innerHTML = ""
        }

        document.getElementById("detail-delivery-notes").textContent =
          delivery.delivery_notes || "No special instructions provided."

        // Populate order items
        const itemsContainer = document.getElementById("detail-order-items")
        itemsContainer.innerHTML = ""

        if (delivery.items && delivery.items.length > 0) {
          delivery.items.forEach((item) => {
            const li = document.createElement("li")
            li.className = "list-group-item d-flex justify-content-between align-items-center"
            li.innerHTML = `
              <div>
                <span class="fw-medium">${item.product_name}</span>
                <span class="text-muted"> - ₱${Number.parseFloat(item.price).toFixed(2)}</span>
              </div>
              <span class="badge bg-primary rounded-pill">${item.quantity}x</span>
            `
            itemsContainer.appendChild(li)
          })
        } else {
          itemsContainer.innerHTML = `
            <li class="list-group-item text-center text-muted">
              No items found
            </li>
          `
        }

        // Render delivery timeline
        renderDeliveryTimeline(delivery)

        // Update modal title
        document.getElementById("deliveryDetailsModalLabel").textContent = `Delivery Details - ${delivery.order_id}`

        // Show modal
        const deliveryDetailsModal = new bootstrap.Modal(document.getElementById("deliveryDetailsModal"))
        deliveryDetailsModal.show()
      } else {
        showAlert("Failed to load delivery details: " + data.message, "danger")
      }
    })
    .catch((error) => {
      console.error("Error loading delivery details:", error)
      showAlert("Error loading delivery details. Please try again.", "danger")
    })
}

// Render delivery timeline
function renderDeliveryTimeline(delivery) {
  const timelineContainer = document.querySelector("#deliveryDetailsModal .delivery-timeline")
  timelineContainer.innerHTML = ""

  // Define all possible statuses in order
  const statuses = [
    { key: "pending", label: "Order Received", icon: "bi-inbox" },
    { key: "processing", label: "Preparing", icon: "bi-gear" },
    { key: "shipped", label: "In Transit", icon: "bi-truck" },
    { key: "delivered", label: "Delivered", icon: "bi-check-circle" },
  ]

  // Get current status index
  const currentStatusIndex = statuses.findIndex((s) => s.key === delivery.status)

  // Create timeline items
  statuses.forEach((status, index) => {
    // Find status update from history
    const statusUpdate = delivery.status_history.find((h) => h.status === status.key)

    // Determine if this status is completed, active, or upcoming
    let itemClass = "timeline-item"
    const iconClass = status.icon

    if (index < currentStatusIndex) {
      itemClass += " completed"
    } else if (index === currentStatusIndex) {
      itemClass += " active"
    }

    const timelineItem = document.createElement("div")
    timelineItem.className = itemClass

    // Format date if available
    let dateText = "Pending"
    if (statusUpdate) {
      dateText = statusUpdate.formatted_date
    } else if (index <= currentStatusIndex) {
      // If no specific update but status is current or past, use order date
      dateText = delivery.formatted_order_date
    }

    timelineItem.innerHTML = `
      <div class="timeline-icon"><i class="bi ${iconClass}"></i></div>
      <div class="timeline-content">
        <h6 class="mb-0 fw-bold">${status.label}</h6>
        <p class="small text-muted mb-0">${dateText}</p>
      </div>
    `

    timelineContainer.appendChild(timelineItem)
  })
}

// Complete delivery
function completeDelivery(orderId) {
  // Create a modal to collect delivery completion details
  const modalHtml = `
    <div class="modal fade" id="completeDeliveryModal" tabindex="-1" aria-labelledby="completeDeliveryModalLabel" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header bg-success bg-opacity-10">
            <h5 class="modal-title" id="completeDeliveryModalLabel">
              <i class="bi bi-check-circle me-2 text-success"></i>Mark as Delivered
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <form id="completeDeliveryForm">
              <div class="mb-3">
                <label for="deliveryConfirmationType" class="form-label fw-bold">Delivery Confirmation</label>
                <select class="form-select" id="deliveryConfirmationType" required>
                  <option value="delivered_to_customer">Delivered to Customer</option>
                </select>
              </div>
              
              <div class="mb-3">
                <label for="actualDeliveryTime" class="form-label fw-bold">Actual Delivery Time</label>
                <input type="datetime-local" class="form-control" id="actualDeliveryTime" required>
              </div>
              
              <div class="mb-3">
                <label for="deliveryNotes" class="form-label fw-bold">Delivery Notes</label>
                <textarea class="form-control" id="deliveryNotes" rows="3" placeholder="Any notes about the delivery..."></textarea>
              </div>
              
              <div class="form-check mb-3">
                <input class="form-check-input" type="checkbox" id="notifyCustomerDelivery" checked>
                <label class="form-check-label" for="notifyCustomerDelivery">
                  Notify customer about delivery completion
                </label>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">
              <i class="bi bi-x-lg me-1"></i> Cancel
            </button>
            <button type="button" class="btn btn-success" id="confirmCompleteDeliveryBtn">
              <i class="bi bi-check-lg me-1"></i> Confirm Delivery
            </button>
          </div>
        </div>
      </div>
    </div>
  `

  // Add modal to the DOM if it doesn't exist
  if (!document.getElementById("completeDeliveryModal")) {
    const modalContainer = document.createElement("div")
    modalContainer.innerHTML = modalHtml
    document.body.appendChild(modalContainer)
  }

  // Set current date and time as default
  const now = new Date()
  const formattedDateTime = now.toISOString().slice(0, 16)

  // Show the modal
  const completeDeliveryModal = new bootstrap.Modal(document.getElementById("completeDeliveryModal"))
  completeDeliveryModal.show()

  // Set the current date and time after modal is shown
  setTimeout(() => {
    document.getElementById("actualDeliveryTime").value = formattedDateTime
  }, 300)

  // Handle confirm button click
  document.getElementById("confirmCompleteDeliveryBtn").onclick = () => {
    const confirmationType = document.getElementById("deliveryConfirmationType").value
    const actualDeliveryTime = document.getElementById("actualDeliveryTime").value
    const notes = document.getElementById("deliveryNotes").value
    const notifyCustomer = document.getElementById("notifyCustomerDelivery").checked ? 1 : 0

    // Validate required fields
    if (!actualDeliveryTime) {
      showAlert("Please enter the actual delivery time", "warning")
      return
    }

    // Create form data
    const formData = new FormData()
    formData.append("action", "update_delivery_status")
    formData.append("order_id", orderId)
    formData.append("status", "delivered")
    formData.append("confirmation_type", confirmationType)
    formData.append("actual_delivery_time", actualDeliveryTime)
    formData.append("notes", notes)
    formData.append("notify_customer", notifyCustomer)

    // Send request
    fetch("delivery_operations.php", {
      method: "POST",
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          showAlert("Delivery marked as completed successfully", "success")

          // Close modal
          completeDeliveryModal.hide()

          // Reload data
          loadDeliveryData()
        } else {
          showAlert("Failed to complete delivery: " + data.message, "danger")
        }
      })
      .catch((error) => {
        console.error("Error completing delivery:", error)
        showAlert("Error completing delivery. Please try again.", "danger")
      })
  }
}

// View issue details
function viewIssueDetails(issueId) {
  // Find the issue
  const issue = deliveryIssues.find((i) => i.issue_id == issueId)
  if (!issue) {
    showAlert("Issue not found", "danger")
    return
  }

  // Create a modal to display issue details
  const modalHtml = `
    <div class="modal fade" id="viewIssueModal" tabindex="-1" aria-labelledby="viewIssueModalLabel" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered modal-lg">
        <div class="modal-content">
          <div class="modal-header bg-light">
            <h5 class="modal-title" id="viewIssueModalLabel">
              <i class="bi bi-exclamation-triangle me-2 text-warning"></i>Issue Details
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body p-0">
            <div class="row g-0">
              <!-- Left column - Issue Information -->
              <div class="col-md-6 border-end">
                <div class="p-4">
                  <div class="d-flex align-items-center mb-3">
                    <div class="bg-warning bg-opacity-10 p-3 rounded-circle me-3">
                      <i class="bi bi-exclamation-triangle fs-3 text-warning"></i>
                    </div>
                    <div>
                      <h6 class="mb-0 fw-bold">Issue #${issue.issue_id}</h6>
                      <p class="text-muted mb-0 small">Reported on ${issue.formatted_reported_at}</p>
                    </div>
                  </div>
                  
                  <div class="card mb-3">
                    <div class="card-header bg-light py-2">
                      <h6 class="mb-0 fw-bold"><i class="bi bi-info-circle me-2"></i>Issue Information</h6>
                    </div>
                    <div class="card-body">
                      <p class="mb-2"><strong>Type:</strong> <span class="badge bg-info">${issue.issue_type.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}</span></p>
                      <p class="mb-2"><strong>Status:</strong> <span class="badge ${issue.status === "resolved" ? "bg-success" : issue.status === "investigating" ? "bg-warning text-dark" : "bg-danger"}">${issue.status.charAt(0).toUpperCase() + issue.status.slice(1)}</span></p>
                    </div>
                  </div>
                  
                  <div class="card mb-3">
                    <div class="card-header bg-light py-2">
                      <h6 class="mb-0 fw-bold"><i class="bi bi-box me-2"></i>Order Information</h6>
                    </div>
                    <div class="card-body">
                      <p class="mb-1"><strong>Order ID:</strong> ${issue.order_id}</p>
                      <p class="mb-1"><strong>Customer:</strong> ${issue.customer_name}</p>
                      <p class="mb-1"><strong>Email:</strong> ${issue.customer_email || "N/A"}</p>
                      <p class="mb-0"><strong>Phone:</strong> ${issue.customer_phone || "N/A"}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Right column - Description and Resolution -->
              <div class="col-md-6">
                <div class="p-4">
                  <h6 class="fw-bold mb-3"><i class="bi bi-chat-left-text me-2"></i>Issue Description</h6>
                  <div class="card mb-4">
                    <div class="card-body bg-light">
                      <p class="mb-0">${issue.description || "No description provided."}</p>
                    </div>
                  </div>
                  
                  ${
                    issue.status === "resolved"
                      ? `
                    <h6 class="fw-bold mb-3"><i class="bi bi-check-circle me-2"></i>Resolution</h6>
                    <div class="card">
                      <div class="card-body bg-success bg-opacity-10">
                        <p class="mb-2">${issue.resolution || "No resolution details provided."}</p>
                        <p class="text-muted small mb-0">Resolved on: ${issue.formatted_resolved_at}</p>
                      </div>
                    </div>
                  `
                      : ""
                  }
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
            ${
              issue.status !== "resolved"
                ? `
              <button type="button" class="btn btn-success resolve-from-view-btn">Resolve Issue</button>
            `
                : ""
            }
            <button type="button" class="btn btn-primary view-order-from-issue-btn">View Order</button>
          </div>
        </div>
      </div>
    </div>
  `

  // Add modal to the DOM if it doesn't exist
  if (document.getElementById("viewIssueModal")) {
    document.getElementById("viewIssueModal").remove()
  }

  const modalContainer = document.createElement("div")
  modalContainer.innerHTML = modalHtml
  document.body.appendChild(modalContainer)

  // Show the modal
  const viewIssueModal = new bootstrap.Modal(document.getElementById("viewIssueModal"))
  viewIssueModal.show()

  // Add event listeners
  if (issue.status !== "resolved") {
    document.querySelector(".resolve-from-view-btn").addEventListener("click", () => {
      viewIssueModal.hide()
      openResolveIssueModal(issue.issue_id)
    })
  }

  document.querySelector(".view-order-from-issue-btn").addEventListener("click", () => {
    viewIssueModal.hide()
    viewDeliveryDetails(issue.order_id)
  })
}

// Update delivery status
function updateDeliveryStatus(orderId, status) {
  // Create form data
  const formData = new FormData()
  formData.append("action", "update_delivery_status")
  formData.append("order_id", orderId)
  formData.append("status", status)
  formData.append("notes", `Status updated to ${status} via delivery details`)

  // Send request
  fetch("delivery_operations.php", {
    method: "POST",
    body: formData,
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        showAlert(`Order status updated to ${status}`, "success")

        // Close modal
        const deliveryDetailsModal = bootstrap.Modal.getInstance(document.getElementById("deliveryDetailsModal"))
        deliveryDetailsModal.hide()

        // Reload data
        loadDeliveryData()
      } else {
        showAlert("Failed to update status: " + data.message, "danger")
      }
    })
    .catch((error) => {
      console.error("Error updating status:", error)
      showAlert("Error updating status. Please try again.", "danger")
    })
}

// Show alert message
function showAlert(message, type = "info") {
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
    const bsAlert = new bootstrap.Alert(alertDiv)
    bsAlert.close()
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

