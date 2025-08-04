// Global variables
let currentRetailers = {
  approved: [],
  pending: [],
  rejected: [],
}
let allRetailers = []
let isFiltered = false
let currentRetailerForApproval = null // Store current retailer data for approval
let currentRetailerForRejection = null // Store current retailer data for rejection
let currentRetailerInModal = null // Store current retailer data in modal
const bootstrap = window.bootstrap // Declare the bootstrap variable

// Initialize the page
document.addEventListener("DOMContentLoaded", () => {
  // Initialize sidebar toggle for mobile
  initSidebar()

  // Load retailers
  loadRetailers()

  // Initialize event listeners
  initEventListeners()

  // Initialize approval modal event listeners
initApprovalModalListeners()

  // Initialize rejection modal event listeners
  initRejectionModalListeners()
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

// Initialize event listeners
function initEventListeners() {
  // Refresh retailers button
  const refreshBtn = document.getElementById("refreshRetailers")
  if (refreshBtn) {
    refreshBtn.addEventListener("click", () => {
      loadRetailers(true)
    })
  }

  // Search button
  const searchBtn = document.getElementById("retailerSearchBtn")
  if (searchBtn) {
    searchBtn.addEventListener("click", () => {
      const searchTerm = document.getElementById("retailerSearch").value.trim()
      if (searchTerm) {
        searchRetailers(searchTerm)
      } else {
        loadRetailers()
      }
    })
  }

  // Search on Enter key
  const searchInput = document.getElementById("retailerSearch")
  if (searchInput) {
    searchInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        e.preventDefault()
        document.getElementById("retailerSearchBtn").click()
      }
    })

    // Clear search
    searchInput.addEventListener("input", (e) => {
      if (e.target.value === "") {
        loadRetailers()
      }
    })
  }

  // Approved retailers filter dropdown
  const approvedFilter = document.getElementById("approvedRetailersFilter")
  if (approvedFilter) {
    approvedFilter.addEventListener("change", (e) => {
      filterApprovedRetailers(e.target.value)
    })
  }
}



// Initialize approval modal event listeners
function initApprovalModalListeners() {
  // Send approval email button
  const sendApprovalBtn = document.getElementById("sendApprovalEmail")
  if (sendApprovalBtn) {
    sendApprovalBtn.addEventListener("click", handleSendApprovalEmail)
  }

  // Auto-populate default approval message when modal opens
  const approvalModal = document.getElementById("approvalModal")
  if (approvalModal) {
    approvalModal.addEventListener("show.bs.modal", () => {
      const messageArea = document.getElementById("approvalMessage")
      if (messageArea && currentRetailerForApproval) {
        messageArea.value = `Dear ${currentRetailerForApproval.first_name || "Applicant"},

Congratulations! We are pleased to inform you that your retailer application with Pinana Gourmet has been approved.

Welcome to the Pinana Gourmet family! You can now access your retailer account and start placing orders.

**Next Steps:**
1. Log in to your account using your registered credentials.
2. Get started with managing your inventory, orders, and billing.
3. Contact our support team if you need any assistance.

We look forward to a successful partnership with you.

Best regards,
Pinana Gourmet Team`
      }
    })
  }
}

// Show approval modal with retailer details
function showApprovalModal(retailer) {
  currentRetailerForApproval = retailer

  // Populate email fields
  document.getElementById("approvalToEmail").value = retailer.email || ""
  document.getElementById("approvalFromEmail").value = "wantargaryen@gmail.com"
  document.getElementById("approvalSubject").value = `Congratulations! Your Retailer Application has been Approved - Pinana Gourmet`

  // Show the modal
  const approvalModal = new bootstrap.Modal(document.getElementById("approvalModal"))
  approvalModal.show()
}

// Handle sending approval email
function handleSendApprovalEmail() {
  const toEmail = document.getElementById("approvalToEmail").value
  const fromEmail = document.getElementById("approvalFromEmail").value
  const subject = document.getElementById("approvalSubject").value
  const message = document.getElementById("approvalMessage").value

  // Validate fields
  if (!toEmail || !fromEmail || !subject || !message.trim()) {
    showAlert("warning", "Please fill in all fields before sending the email.")
    return
  }

  if (!currentRetailerForApproval) {
    showAlert("danger", "Error: No retailer selected for approval.")
    return
  }

  // Disable send button and show loading
  const sendBtn = document.getElementById("sendApprovalEmail")
  const originalText = sendBtn.innerHTML
  sendBtn.disabled = true
  sendBtn.innerHTML = '<i class="bi bi-hourglass-split me-1"></i>Sending...'

  // Prepare email data
  const emailData = {
    user_id: currentRetailerForApproval.user_id,
    to_email: toEmail,
    from_email: fromEmail,
    subject: subject,
    message: message,
    retailer_name:
      `${currentRetailerForApproval.first_name || ""} ${currentRetailerForApproval.last_name || ""}`.trim(),
  }

  // Send email and update status
  fetch("send_approved_email.php", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(emailData),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        // Close approval modal
        const approvalModal = bootstrap.Modal.getInstance(document.getElementById("approvalModal"))
        approvalModal.hide()

        // Close retailer details modal if open
        const retailerDetailsModal = bootstrap.Modal.getInstance(document.getElementById("retailerDetailsModal"))
        if (retailerDetailsModal) {
          retailerDetailsModal.hide()
        }

        // Show success message
        showAlert("success", "Approval email sent successfully and retailer status updated to approved.")

        // Reload retailers to reflect changes
        loadRetailers()

        // Reset current retailer
        currentRetailerForApproval = null
        currentRetailerInModal = null
      } else {
        showAlert("danger", "Failed to send approval email: " + (data.message || "Unknown error"))
      }
    })
    .catch((error) => {
      console.error("Detailed fetch error:", error)
      let errorMessage = "Error sending approval email. Please try again."
      if (error instanceof TypeError) {
        errorMessage = "Network error or server unreachable. Please check your internet connection and server status."
      } else if (error.message) {
        errorMessage = `Error: ${error.message}. Please check server logs for more details.`
      }
      showAlert("danger", errorMessage)
    })
    .finally(() => {
      // Re-enable send button
      sendBtn.disabled = false
      sendBtn.innerHTML = originalText
    })
}







// Initialize rejection modal event listeners
function initRejectionModalListeners() {
  // Send rejection email button
  const sendRejectionBtn = document.getElementById("sendRejectionEmail")
  if (sendRejectionBtn) {
    sendRejectionBtn.addEventListener("click", handleSendRejectionEmail)
  }

  // Auto-populate default rejection message when modal opens
  const rejectionModal = document.getElementById("rejectionModal")
  if (rejectionModal) {
    rejectionModal.addEventListener("show.bs.modal", () => {
      const messageArea = document.getElementById("rejectionMessage")
      if (messageArea && currentRetailerForRejection) {
        messageArea.value = `Dear ${currentRetailerForRejection.first_name || "Applicant"},

Thank you for your interest in becoming a retailer partner with Pinana Gourmet.

After careful review of your application, we regret to inform you that we are unable to approve your retailer application at this time.

**[Please specify your reason here]**

If you are able to address the concerns mentioned above, you are welcome to submit a new application.

We appreciate your interest in our products and wish you success in your business endeavors.

Best regards,
Pinana Gourmet Team`
      }
    })
  }
}

// Show rejection modal with retailer details
function showRejectionModal(retailer) {
  currentRetailerForRejection = retailer

  // Populate email fields
  document.getElementById("rejectionToEmail").value = retailer.email || ""
  document.getElementById("rejectionFromEmail").value = "wantargaryen@gmail.com"
  document.getElementById("rejectionSubject").value = `Application Status Update - Pinana Gourmet`

  // Show the modal
  const rejectionModal = new bootstrap.Modal(document.getElementById("rejectionModal"))
  rejectionModal.show()
}

// Handle sending rejection email
function handleSendRejectionEmail() {
  const toEmail = document.getElementById("rejectionToEmail").value
  const fromEmail = document.getElementById("rejectionFromEmail").value
  const subject = document.getElementById("rejectionSubject").value
  const message = document.getElementById("rejectionMessage").value

  // Validate fields
  if (!toEmail || !fromEmail || !subject || !message.trim()) {
    showAlert("warning", "Please fill in all fields before sending the email.")
    return
  }

  if (!currentRetailerForRejection) {
    showAlert("danger", "Error: No retailer selected for rejection.")
    return
  }

  // Disable send button and show loading
  const sendBtn = document.getElementById("sendRejectionEmail")
  const originalText = sendBtn.innerHTML
  sendBtn.disabled = true
  sendBtn.innerHTML = '<i class="bi bi-hourglass-split me-1"></i>Sending...'

  // Prepare email data
  const emailData = {
    user_id: currentRetailerForRejection.user_id,
    to_email: toEmail,
    from_email: fromEmail,
    subject: subject,
    message: message,
    retailer_name:
      `${currentRetailerForRejection.first_name || ""} ${currentRetailerForRejection.last_name || ""}`.trim(),
  }

  // Send email and update status
  fetch("send_rejection_email.php", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(emailData),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        // Close rejection modal
        const rejectionModal = bootstrap.Modal.getInstance(document.getElementById("rejectionModal"))
        rejectionModal.hide()

        // Close retailer details modal if open
        const retailerDetailsModal = bootstrap.Modal.getInstance(document.getElementById("retailerDetailsModal"))
        if (retailerDetailsModal) {
          retailerDetailsModal.hide()
        }

        // Show success message
        showAlert("success", "Rejection email sent successfully and retailer status updated to rejected.")

        // Reload retailers to reflect changes
        loadRetailers()

        // Reset current retailer
        currentRetailerForRejection = null
        currentRetailerInModal = null
      } else {
        showAlert("danger", "Failed to send rejection email: " + (data.message || "Unknown error"))
      }
    })
    .catch((error) => {
      console.error("Detailed fetch error:", error) // Log the full error object for debugging
      let errorMessage = "Error sending rejection email. Please try again."
      if (error instanceof TypeError) {
        errorMessage = "Network error or server unreachable. Please check your internet connection and server status."
      } else if (error.message) {
        errorMessage = `Error: ${error.message}. Please check server logs for more details.`
      }
      showAlert("danger", errorMessage)
    })
    .finally(() => {
      // Re-enable send button
      sendBtn.disabled = false
      sendBtn.innerHTML = originalText
    })
}

// Filter approved retailers based on selected criteria
function filterApprovedRetailers(filterType) {
  const filteredRetailers = [...currentRetailers.approved]

  switch (filterType) {
    case "recent":
      filteredRetailers.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      break
    case "completed_orders_desc":
      filteredRetailers.sort((a, b) => (Number(b.completed_orders) || 0) - (Number(a.completed_orders) || 0))
      break
    case "completed_orders_asc":
      filteredRetailers.sort((a, b) => (Number(a.completed_orders) || 0) - (Number(b.completed_orders) || 0))
      break
    case "revenue_desc":
      filteredRetailers.sort((a, b) => (Number(b.total_revenue) || 0) - (Number(a.total_revenue) || 0))
      break
    case "revenue_asc":
      filteredRetailers.sort((a, b) => (Number(a.total_revenue) || 0) - (Number(b.total_revenue) || 0))
      break
    default:
      filteredRetailers.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
  }

  // Re-render the approved retailers section with filtered data
  renderRetailerSection("approved", filteredRetailers)

  // Show filter notification
  const filterLabels = {
    recent: "Most Recent",
    completed_orders_desc: "Completed Orders (High to Low)",
    completed_orders_asc: "Completed Orders (Low to High)",
    revenue_desc: "Total Revenue (High to Low)",
    revenue_asc: "Total Revenue (Low to High)",
  }

  showAlert("info", `Approved retailers sorted by: ${filterLabels[filterType]}`)
}

// Load retailers
function loadRetailers(showLoading = true) {
  if (showLoading) {
    showLoadingState()
  }

  isFiltered = false

  // Fetch retailers with completed orders data
  fetch("fetch_retailers.php")
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`)
      }
      return response.json()
    })
    .then((data) => {
      if (data.success) {
        allRetailers = data.retailers

        console.log("Retailers fetched from fetch_retailers.php:", data.retailers);


        // Group retailers by approval status and sort by most recent
        currentRetailers = {
          approved: data.retailers
            .filter((r) => r.approval_status === "approved")
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at)),
          pending: data.retailers
            .filter((r) => r.approval_status === "pending" || !r.approval_status)
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at)),
          rejected: data.retailers
            .filter((r) => r.approval_status === "rejected")
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at)),
        }

        // Render all sections
        renderRetailerSection("approved", currentRetailers.approved)
        renderRetailerSection("pending", currentRetailers.pending)
        renderRetailerSection("rejected", currentRetailers.rejected)

        // Update counts
        updateCounts()
        updateStats()

        // Reset filter dropdown to default
        const approvedFilter = document.getElementById("approvedRetailersFilter")
        if (approvedFilter) {
          approvedFilter.value = "recent"
        }
      } else {
        showAlert("danger", "Failed to load retailers: " + (data.message || "Unknown error"))
        showErrorState()
      }
    })
    .catch((error) => {
      console.error("Error loading retailers:", error)
      showAlert("danger", "Error loading retailers. Please try again.")
      showErrorState()
    })
}

// Show loading state for all sections
function showLoadingState() {
  const sections = ["approved", "pending", "rejected"]
  sections.forEach((section) => {
    const container = document.getElementById(`${section}-retailers`)
    if (container) {
      container.innerHTML = `
      <div class="col-12">
        <div class="loading-section">
          <div class="loading-spinner"></div>
          <h5>Loading ${section} retailers...</h5>
          <p>Please wait while we fetch the data</p>
        </div>
      </div>
    `
    }
  })
}

// Show error state for all sections
function showErrorState() {
  const sections = ["approved", "pending", "rejected"]
  sections.forEach((section) => {
    const container = document.getElementById(`${section}-retailers`)
    if (container) {
      container.innerHTML = `
      <div class="col-12">
        <div class="empty-section">
          <i class="bi bi-exclamation-triangle-fill text-danger"></i>
          <h5>Error Loading Data</h5>
          <p>Unable to load ${section} retailers. Please try again.</p>
          <button class="btn btn-outline-danger btn-sm" onclick="loadRetailers(true)">
            <i class="bi bi-arrow-clockwise me-1"></i>Retry
          </button>
        </div>
      </div>
    `
    }
  })
}

// Helper function to determine if retailer should be active
function isRetailerActive(retailer) {
  // Only approved retailers should be active
  return retailer.approval_status === "approved"
}

// Render retailers in a specific section
function renderRetailerSection(status, retailers) {
  const container = document.getElementById(`${status}-retailers`)

  if (!container) return

  if (!retailers || retailers.length === 0) {
    container.innerHTML = `
    <div class="col-12">
      <div class="empty-section">
        <i class="bi bi-inbox"></i>
        <h5>No ${status} retailers</h5>
        <p>There are currently no retailers in this category.</p>
      </div>
    </div>
  `
    return
  }

  // Create scrollable container
  let html = `
  <div class="col-12">
    <div class="retailer-cards-container" style="position: relative;">
      <div class="retailer-cards-scroll" style="display: flex; overflow-x: auto; gap: 1rem; padding-bottom: 1rem; scroll-behavior: smooth;">
`

  // Show only first 5 retailers initially
  const displayRetailers = retailers.slice(0, 5)

  displayRetailers.forEach((retailer) => {
    const statusBadge = getStatusBadge(retailer.approval_status)
    // Use the helper function to determine activity status
    const activityBadge = isRetailerActive(retailer) ? "active" : "inactive"

    html += `
    <div class="retailer-card-wrapper" style="min-width: 320px; flex-shrink: 0;">
      <div class="retailer-card" onclick="viewRetailerDetails(${retailer.user_id})">
        <div class="d-flex align-items-start mb-3">
          ${
            retailer.profile_image
              ? `<img src="${retailer.profile_image}" alt="${retailer.first_name}" class="retailer-avatar me-3">`
              : `<div class="retailer-avatar-placeholder me-3">
                  <i class="bi bi-person"></i>
                </div>`
          }
          <div class="flex-grow-1">
            <h6 class="retailer-name">${retailer.first_name || "N/A"} ${retailer.last_name || ""}</h6>
            <div class="retailer-email">${retailer.email || "No email provided"}</div>
            ${statusBadge}
          </div>
        </div>
        
        <div class="retailer-business">
          <i class="bi bi-shop me-2"></i>
          <strong>Business:</strong> ${retailer.business_name || "Not provided"}
        </div>
        
        <!-- Completed Orders Statistics -->
        <div class="order-stats-section mt-3 p-3 bg-light rounded">
          <div class="text-center">
            <div class="row">
              <div class="col-6">
                <div class="stat-number text-success fw-bold h4 mb-1">${retailer.completed_orders || 0}</div>
                <div class="stat-label small text-muted">Completed Orders</div>
              </div>
              <div class="col-6">
                <div class="stat-number text-primary fw-bold h5 mb-1">₱${Number(retailer.total_revenue || 0).toLocaleString()}</div>
                <div class="stat-label small text-muted">Total Revenue (Paid)</div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="retailer-meta">
          <div class="d-flex align-items-center">
            <span class="activity-badge ${activityBadge}">
              <i class="bi bi-circle-fill me-1" style="font-size: 0.6rem;"></i>
              ${activityBadge === "active" ? "Active" : "Inactive"}
            </span>
          </div>
          <div class="text-muted small">
            <i class="bi bi-calendar me-1"></i>
            ${new Date(retailer.created_at).toLocaleDateString()}
          </div>
        </div>
      </div>
    </div>
  `
  })

  html += `
      </div>
      ${
        retailers.length > 5
          ? `
        <div class="d-flex justify-content-between align-items-center mt-3">
          <span class="text-muted small">Showing 5 of ${retailers.length} retailers</span>
          <button class="btn btn-outline-primary btn-sm" onclick="showAllRetailers('${status}', ${JSON.stringify(retailers).replace(/"/g, "&quot;")})">
            <i class="bi bi-eye me-1"></i>View All (${retailers.length})
          </button>
        </div>
      `
          : ""
      }
    </div>
  </div>
`

  container.innerHTML = html
}

// Show all retailers in a section
function showAllRetailers(status, retailers) {
  const container = document.getElementById(`${status}-retailers`)
  if (!container) return

  let html = `
  <div class="col-12">
    <div class="retailer-cards-container">
      <div class="row">
`

  retailers.forEach((retailer) => {
    const statusBadge = getStatusBadge(retailer.approval_status)
    // Use the helper function to determine activity status
    const activityBadge = isRetailerActive(retailer) ? "active" : "inactive"

    html += `
    <div class="col-lg-4 col-md-6 mb-4">
      <div class="retailer-card" onclick="viewRetailerDetails(${retailer.user_id})">
        <div class="d-flex align-items-start mb-3">
          ${
            retailer.profile_image
              ? `<img src="${retailer.profile_image}" alt="${retailer.first_name}" class="retailer-avatar me-3">`
              : `<div class="retailer-avatar-placeholder me-3">
                  <i class="bi bi-person"></i>
                </div>`
          }
          <div class="flex-grow-1">
            <h6 class="retailer-name">${retailer.first_name || "N/A"} ${retailer.last_name || ""}</h6>
            <div class="retailer-email">${retailer.email || "No email provided"}</div>
            ${statusBadge}
          </div>
        </div>
        
        <div class="retailer-business">
          <i class="bi bi-shop me-2"></i>
          <strong>Business:</strong> ${retailer.business_name || "Not provided"}
        </div>
        
        <!-- Completed Orders Statistics -->
        <div class="order-stats-section mt-3 p-3 bg-light rounded">
          <div class="text-center">
            <div class="row">
              <div class="col-6">
                <div class="stat-number text-success fw-bold h4 mb-1">${retailer.completed_orders || 0}</div>
                <div class="stat-label small text-muted">Completed Orders</div>
              </div>
              <div class="col-6">
                <div class="stat-number text-primary fw-bold h5 mb-1">₱${Number(retailer.total_revenue || 0).toLocaleString()}</div>
                <div class="stat-label small text-muted">Total Revenue (Paid)</div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="retailer-meta">
          <div class="d-flex align-items-center">
            <span class="activity-badge ${activityBadge}">
              <i class="bi bi-circle-fill me-1" style="font-size: 0.6rem;"></i>
              ${activityBadge === "active" ? "Active" : "Inactive"}
            </span>
          </div>
          <div class="text-muted small">
            <i class="bi bi-calendar me-1"></i>
            ${new Date(retailer.created_at).toLocaleDateString()}
          </div>
        </div>
      </div>
    </div>
  `
  })

  html += `
      </div>
      <div class="d-flex justify-content-center mt-3">
        <button class="btn btn-outline-secondary btn-sm" onclick="renderRetailerSection('${status}', ${JSON.stringify(retailers).replace(/"/g, "&quot;")})">
          <i class="bi bi-eye-slash me-1"></i>Show Less
        </button>
      </div>
    </div>
  </div>
`

  container.innerHTML = html
}

// Get status badge based on approval status
function getStatusBadge(status) {
  switch (status) {
    case "approved":
      return '<span class="status-badge approved">Approved</span>'
    case "pending":
      return '<span class="status-badge pending">Pending</span>'
    case "rejected":
      return '<span class="status-badge rejected">Rejected</span>'
    default:
      return '<span class="status-badge pending">Pending</span>'
  }
}

// Update counts for each section
function updateCounts() {
  document.getElementById("approved-count").textContent = currentRetailers.approved.length
  document.getElementById("pending-count").textContent = currentRetailers.pending.length
  document.getElementById("rejected-count").textContent = currentRetailers.rejected.length
}

// Update statistics cards
function updateStats() {
  document.getElementById("approved-stats").textContent = currentRetailers.approved.length
  document.getElementById("pending-stats").textContent = currentRetailers.pending.length
  document.getElementById("rejected-stats").textContent = currentRetailers.rejected.length
}

// View retailer details
function viewRetailerDetails(retailerId) {
  // Show loading in modal
  const retailerDetailsContent = document.getElementById("retailerDetailsContent")
  const retailerActions = document.getElementById("retailer-actions")

  if (retailerDetailsContent) {
    retailerDetailsContent.innerHTML = `
    <div class="text-center py-5">
      <div class="loading-spinner"></div>
      <h5>Loading retailer details...</h5>
      <p>Please wait while we fetch the information</p>
    </div>
  `
  }

  // Clear actions
  if (retailerActions) {
    retailerActions.innerHTML = ""
  }

  // Show modal
  const retailerDetailsModal = new bootstrap.Modal(document.getElementById("retailerDetailsModal"))
  retailerDetailsModal.show()

  // Fetch retailer details with cache busting
  const timestamp = new Date().getTime()
  fetch(`get_retailer_details.php?user_id=${retailerId}&_t=${timestamp}`)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`)
      }
      return response.json()
    })
    .then((data) => {
      if (data.success) {
        currentRetailerInModal = data.retailer
        renderRetailerDetails(data.retailer)
        renderRetailerActions(data.retailer)
      } else {
        retailerDetailsContent.innerHTML = `
        <div class="text-center py-5">
          <div class="text-danger">
            <i class="bi bi-exclamation-triangle-fill fs-1 mb-3"></i>
            <h5>Error Loading Details</h5>
            <p>Unable to load retailer details. Please try again.</p>
          </div>
        </div>
      `
      }
    })
    .catch((error) => {
      console.error("Error loading retailer details:", error)
      retailerDetailsContent.innerHTML = `
      <div class="text-center py-5">
        <div class="text-danger">
          <i class="bi bi-exclamation-triangle-fill fs-1 mb-3"></i>
          <h5>Connection Error</h5>
          <p>Unable to connect to the server. Please check your connection and try again.</p>
        </div>
      </div>
    `
    })
}

function renderRetailerActions(retailer) {
  const retailerActions = document.getElementById("retailer-actions")
  if (!retailerActions) return

  retailerActions.style.display = "flex"
  retailerActions.style.gap = "0.5rem"
  retailerActions.style.flexWrap = "nowrap"

  let actionsHtml = ""
  const approvalStatus = retailer.approval_status || "pending"

  switch (approvalStatus) {
    case "pending":
      actionsHtml = `
      <button type="button" class="btn btn-approve btn-action" onclick="showApprovalModal(${JSON.stringify(retailer).replace(/"/g, "&quot;")})">
        <i class="bi bi-check-circle me-1"></i>Approve Retailer
      </button>
      <button type="button" class="btn btn-reject btn-action" onclick="showRejectionModal(${JSON.stringify(retailer).replace(/"/g, "&quot;")})">
        <i class="bi bi-x-circle me-1"></i>Reject Application
      </button>
    `
      break
    case "approved":
      actionsHtml = `
      <button type="button" class="btn btn-pending btn-action" onclick="updateRetailerStatus(${retailer.user_id}, 'pending')">
        <i class="bi bi-clock me-1"></i>Move to Pending
      </button>
      <button type="button" class="btn btn-reject btn-action" onclick="showRejectionModal(${JSON.stringify(retailer).replace(/"/g, "&quot;")})">
        <i class="bi bi-x-circle me-1"></i>Reject Retailer
      </button>
    `
      break
    case "rejected":
      actionsHtml = `
      <button type="button" class="btn btn-pending btn-action" onclick="updateRetailerStatus(${retailer.user_id}, 'pending')">
        <i class="bi bi-clock me-1"></i>Move to Pending
      </button>
    `
      break
  }

  retailerActions.innerHTML = actionsHtml
}

// Update retailer status (for approve and pending actions)
function updateRetailerStatus(retailerId, newStatus) {
  // Show loading
  const retailerActions = document.getElementById("retailer-actions")
  if (retailerActions) {
    retailerActions.innerHTML = `
    <div class="d-flex align-items-center">
      <div class="spinner-border spinner-border-sm text-primary me-2" role="status">
        <span class="visually-hidden">Updating...</span>
      </div>
      <span>Updating retailer status...</span>
    </div>
  `
  }

  // Update status via API
  fetch("update_retailer_status.php", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      user_id: retailerId,
      approval_status: newStatus,
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        showAlert("success", `Retailer status successfully updated to ${newStatus}`)

        // Update the current retailer in modal with new status
        if (currentRetailerInModal) {
          currentRetailerInModal.approval_status = newStatus
          // Update the status-dependent fields based on approval status
          if (newStatus === "approved") {
            currentRetailerInModal.email_verified = 1
            currentRetailerInModal.is_active = 1
          } else {
            // For pending and rejected, set as inactive
            currentRetailerInModal.email_verified = 0
            currentRetailerInModal.is_active = 0
          }

          // Re-render the actions with updated status
          renderRetailerActions(currentRetailerInModal)
        }

        // Reload retailers list to reflect changes
        loadRetailers()
      } else {
        showAlert("danger", "Failed to update retailer status: " + (data.message || "Unknown error"))
        // Re-render actions with original status
        if (currentRetailerInModal) {
          renderRetailerActions(currentRetailerInModal)
        }
      }
    })
    .catch((error) => {
      console.error("Error updating retailer status:", error)
      showAlert("danger", "Error updating retailer status. Please try again.")
      // Re-render actions with original status
      if (currentRetailerInModal) {
        renderRetailerActions(currentRetailerInModal)
      }
    })
}

// Render retailer details in the modal
function renderRetailerDetails(retailer) {
  const retailerDetailsContent = document.getElementById("retailerDetailsContent")

  // Update modal title
  document.getElementById("retailerDetailsModalLabel").innerHTML =
    `<i class="bi bi-person-circle me-2"></i>${retailer.first_name || "N/A"} ${retailer.last_name || ""}`

  // Format address
  const address = [retailer.house_number, retailer.barangay, retailer.city, retailer.province]
    .filter(Boolean)
    .join(", ")

  // Format birthday
  let formattedBirthday = "Not provided"
  if (retailer.birthday) {
    const birthDate = new Date(retailer.birthday)
    formattedBirthday = birthDate.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  // Format registration date
  let formattedRegistrationDate = "Unknown"
  if (retailer.created_at) {
    const regDate = new Date(retailer.created_at)
    formattedRegistrationDate = regDate.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  // Build social media display (show usernames instead of links)
  let socialMediaDisplay = ""
  if (retailer.facebook || retailer.instagram || retailer.tiktok) {
    socialMediaDisplay = `
  <div class="card mb-4">
    <div class="card-header">
      <h6 class="mb-0"><i class="bi bi-share me-2"></i>Social Media</h6>
    </div>
    <div class="card-body">
      <div class="d-flex flex-column gap-2">
        ${
          retailer.facebook
            ? `
          <div class="d-flex align-items-center">
            <i class="bi bi-facebook text-primary me-2"></i>
            <span class="fw-medium">${retailer.facebook}</span>
          </div>
        `
            : ""
        }
        ${
          retailer.instagram
            ? `
          <div class="d-flex align-items-center">
            <i class="bi bi-instagram text-danger me-2"></i>
            <span class="fw-medium">${retailer.instagram}</span>
          </div>
        `
            : ""
        }
        ${
          retailer.tiktok
            ? `
          <div class="d-flex align-items-center">
            <i class="bi bi-tiktok text-dark me-2"></i>
            <span class="fw-medium">${retailer.tiktok}</span>
          </div>
        `
            : ""
        }
      </div>
    </div>
  </div>
`
  }

  // Approval status
  const approvalStatusBadge = getStatusBadge(retailer.approval_status || "pending")
  // Use the helper function to determine activity status
  const activityStatus = isRetailerActive(retailer)
    ? '<span class="badge bg-success"><i class="bi bi-check-circle me-1"></i>Active</span>'
    : '<span class="badge bg-secondary"><i class="bi bi-x-circle me-1"></i>Inactive</span>'

  // Completed orders section
  let completedOrdersSection = ""
  if (retailer.completed_orders_list && retailer.completed_orders_list.length > 0) {
    completedOrdersSection = `
  <div class="mt-4"></div>
  <div class="card mb-4">
    <div class="card-header">
      <h6 class="mb-0"><i class="bi bi-check-circle me-2"></i>Order History</h6>
    </div>
    <div class="card-body">
      <div class="table-responsive" style="max-height: 400px; overflow-y: auto;">
        <table class="table table-sm mb-0">
          <thead class="sticky-top bg-white">
            <tr>
              <th>Order ID</th>
              <th>Date</th>
              <th>Amount</th>
              <th>Payment</th>
            </tr>
          </thead>
          <tbody>
            ${retailer.completed_orders_list
              .map(
                (order) => `
                <tr>
                  <td><small>${order.po_number}</small></td>
                  <td><small>${new Date(order.order_date).toLocaleDateString()}</small></td>
                  <td><small class="${order.payment_status === "paid" ? "text-success fw-bold" : "text-muted"}">₱${Number(order.total_amount).toLocaleString()}</small></td>
                  <td><span class="badge ${order.payment_status === "paid" ? "bg-success" : order.payment_status === "partial" ? "bg-warning" : "bg-secondary"}">${order.payment_status}</span></td>
                </tr>
              `,
              )
              .join("")}
          </tbody>
        </table>
      </div>
      <div class="mt-2 text-center">
        <small class="text-muted">Note: Revenue calculation includes only orders with "paid" status</small>
      </div>
    </div>
  </div>
`
  }

  retailerDetailsContent.innerHTML = `
  <div class="row">
    <div class="col-md-4">
      <div class="text-center mb-4">
        ${
          retailer.profile_image
            ? `<img src="${retailer.profile_image}" alt="${retailer.first_name}" class="img-fluid rounded-circle mb-3" style="width: 150px; height: 150px; object-fit: cover; border: 4px solid #f8f9fa;">`
            : `<div class="bg-light rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center" style="width: 150px; height: 150px; border: 4px solid #f8f9fa;">
              <i class="bi bi-person text-secondary" style="font-size: 4rem;"></i>
            </div>`
        }
        <h5 class="mb-1">${retailer.first_name || "N/A"} ${retailer.last_name || ""}</h5>
        <p class="text-muted mb-3">${retailer.email || "No email provided"}</p>
        <div class="mb-3">
          ${approvalStatusBadge}
          <div class="mt-2">${activityStatus}</div>
        </div>
      </div>
      
      ${socialMediaDisplay}
      
      <div class="card">
        <div class="card-header">
          <h6 class="mb-0"><i class="bi bi-graph-up me-2"></i>Completed Orders Summary</h6>
        </div>
        <div class="card-body text-center">
          <div class="mb-3">
            <div class="h2 text-success mb-1">${retailer.completed_orders || 0}</div>
            <small class="text-muted">Completed Orders</small>
          </div>
          <hr>
          <div>
            <div class="h4 text-primary mb-1">₱${Number(retailer.total_revenue || 0).toLocaleString()}</div>
            <small class="text-muted">Total Revenue (Paid)</small>
          </div>
        </div>
      </div>
    </div>
    
    <div class="col-md-8">
      <div class="row">
        <div class="col-md-6 mb-4">
          <div class="card h-100">
            <div class="card-header">
              <h6 class="mb-0"><i class="bi bi-person me-2"></i>Personal Information</h6>
            </div>
            <div class="card-body">
              <div class="mb-3">
                <label class="form-label text-muted small">Full Name</label>
                <div class="fw-medium">${retailer.first_name || "N/A"} ${retailer.last_name || ""}</div>
              </div>
              <div class="mb-3">
                <label class="form-label text-muted small">Email Address</label>
                <div class="fw-medium">${retailer.email || "Not provided"}</div>
              </div>
              <div class="mb-3">
                <label class="form-label text-muted small">Phone Number</label>
                <div class="fw-medium">${retailer.phone || "Not provided"}</div>
              </div>
              <div class="mb-3">
                <label class="form-label text-muted small">Date of Birth</label>
                <div class="fw-medium">${formattedBirthday}</div>
              </div>
              <div class="mb-3">
                <label class="form-label text-muted small">Age</label>
                <div class="fw-medium">${retailer.age || "Not provided"}</div>
              </div>
              
              <!-- Government ID -->
      <div class="mb-3">
        <label class="form-label text-muted small">Government ID Type</label>
        <div class="fw-medium">${retailer.gov_id_type || "Not provided"}</div>
      </div>
      <div class="mb-3">
        <label class="form-label text-muted small">Uploaded Government ID</label>
        ${
          retailer.gov_id_file_path
            ? `<a href="#" class="btn btn-sm btn-outline-primary view-id-btn" data-image="${retailer.gov_id_file_path}">
  <i class="bi bi-eye me-2"></i> View ID
</a>
`
            : `<div class="fw-medium text-muted">No file uploaded</div>`
        }
      </div>
            </div>
          </div>
        </div>
        
        <div class="col-md-6 mb-4">
          <div class="card h-100">
            <div class="card-header">
              <h6 class="mb-0"><i class="bi bi-shop me-2"></i>Business Information</h6>
            </div>
            <div class="card-body">
              <div class="mb-3">
                <label class="form-label text-muted small">Business Name</label>
                <div class="fw-medium">${retailer.business_name || "Not provided"}</div>
              </div>
              <div class="mb-3">
                <label class="form-label text-muted small">Business Type</label>
                <div class="fw-medium">${retailer.business_type || "Not provided"}</div>
              </div>
              <div class="mb-3">
                <label class="form-label text-muted small">Business Address</label>
                <div class="fw-medium">${address || "Not provided"}</div>
              </div>
              <div class="mb-3">
                <label class="form-label text-muted small">Additional Notes</label>
                <div class="fw-medium">${retailer.address_notes || "No additional notes"}</div>
              </div>


      <!-- Business Document -->
      <div class="mb-3">
        <label class="form-label text-muted small">Business Document Type</label>
        <div class="fw-medium">${retailer.business_doc_type || "Not provided"}</div>
      </div>
      <div class="mb-0">
        <label class="form-label text-muted small">Uploaded Business Document</label>
        ${
          retailer.business_doc_file_path
            ? `<a href="#" class="btn btn-sm btn-outline-primary view-doc-btn" data-image="${retailer.business_doc_file_path}">
  <i class="bi bi-eye"></i> View Document
</a>
`
            : `<div class="fw-medium text-muted">No file uploaded</div>`
        }
      </div>

            </div>
          </div>
        </div>
        
        <div class="col-12">
          <div class="card">
            <div class="card-header">
              <h6 class="mb-0"><i class="bi bi-gear me-2"></i>Account Information</h6>
            </div>
            <div class="card-body">
              <div class="row">
                <div class="col-md-6">
                  <div class="mb-3">
                    <label class="form-label text-muted small">Username</label>
                    <div class="fw-medium">${retailer.username || "Not available"}</div>
                  </div>
                  <div class="mb-3">
                    <label class="form-label text-muted small">Registration Date</label>
                    <div class="fw-medium">${formattedRegistrationDate}</div>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="mb-3">
                    <label class="form-label text-muted small">Approval Status</label>
                    <div>${approvalStatusBadge}</div>
                  </div>
                  <div class="mb-3">
                    <label class="form-label text-muted small">Account Status</label>
                    <div>${activityStatus}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        ${completedOrdersSection}
      </div>
    </div>
  </div>
`

// Inject modal if not already present
if (!document.getElementById('govIdModal')) {
  const modalHTML = `
    <div class="modal fade" id="govIdModal" tabindex="-1" aria-labelledby="govIdModalLabel" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered" style="max-height: 80vh;">
        <div class="modal-content border-0 shadow-lg">
          <div class="modal-header border-0">
            <h5 class="modal-title" id="govIdModalLabel">Government ID Preview</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body text-center" style="max-height: 70vh; overflow-y: auto;">
            <img id="govIdModalImg" src="" alt="Government ID" class="img-fluid rounded w-100" style="max-height: 50vh; object-fit: contain;">
          </div>
        </div>
      </div>
    </div>
  `;
  const modalContainer = document.createElement('div');
  modalContainer.innerHTML = modalHTML;
  document.body.appendChild(modalContainer);
}

document.querySelectorAll('.view-id-btn').forEach(btn => {
  btn.addEventListener('click', function (e) {
    e.preventDefault();
    const imgSrc = this.getAttribute('data-image');
    const imgEl = document.getElementById('govIdModalImg');

    if (imgEl && imgSrc) {
      imgEl.src = imgSrc;
      const modalEl = document.getElementById('govIdModal');
      const modal = new bootstrap.Modal(modalEl);
      modal.show();
    }
  });
});

// Inject Business Doc modal if not already added
if (!document.getElementById('businessDocModal')) {
  const modalHTML = `
    <div class="modal fade" id="businessDocModal" tabindex="-1" aria-labelledby="businessDocModalLabel" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered" style="max-height: 80vh;">
        <div class="modal-content border-0 shadow-lg">
          <div class="modal-header border-0">
            <h5 class="modal-title" id="businessDocModalLabel">Business Document Preview</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body text-center" style="max-height: 70vh; overflow-y: auto;">
            <img id="businessDocModalImg" src="" alt="Business Document" class="img-fluid rounded w-100" style="max-height: 50vh; object-fit: contain;">
          </div>
        </div>
      </div>
    </div>
  `;
  const modalContainer = document.createElement('div');
  modalContainer.innerHTML = modalHTML;
  document.body.appendChild(modalContainer);
}


document.querySelectorAll('.view-doc-btn').forEach(btn => {
  btn.addEventListener('click', function (e) {
    e.preventDefault();
    const imgSrc = this.getAttribute('data-image');
    const imgEl = document.getElementById('businessDocModalImg');

    if (imgEl && imgSrc) {
      imgEl.src = imgSrc;
      const modalEl = document.getElementById('businessDocModal');
      const modal = new bootstrap.Modal(modalEl);
      modal.show();
    }
  });
});



}

// Search retailers
function searchRetailers(searchTerm) {
  if (!searchTerm) {
    loadRetailers()
    return
  }

  showLoadingState()

  // Fetch search results
  fetch(`search_retailers.php?search=${encodeURIComponent(searchTerm)}`)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`)
      }
      return response.json()
    })
    .then((data) => {
      if (data.success) {
        // Group search results by their ACTUAL approval status
        const searchResults = {
          approved: [],
          pending: [],
          rejected: [],
        }

        // Properly categorize each retailer based on their actual approval_status
        data.retailers.forEach((retailer) => {
          const status = retailer.approval_status || "pending"
          if (status === "approved") {
            searchResults.approved.push(retailer)
          } else if (status === "rejected") {
            searchResults.rejected.push(retailer)
          } else {
            // Default to pending for null, undefined, or 'pending' status
            searchResults.pending.push(retailer)
          }
        })

        // Sort each group by most recent
        searchResults.approved.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        searchResults.pending.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        searchResults.rejected.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))

        // Update current retailers with search results
        currentRetailers = searchResults

        // Render all sections with search results
        renderRetailerSection("approved", searchResults.approved)
        renderRetailerSection("pending", searchResults.pending)
        renderRetailerSection("rejected", searchResults.rejected)

        // Update counts
        updateCounts()
        updateStats()

        // Show search results message
        if (data.retailers.length === 0) {
          showAlert("info", `No retailers found matching "${searchTerm}"`)
        } else {
          showAlert(
            "success",
            `Found ${data.retailers.length} retailer(s) matching "${searchTerm}" - Approved: ${searchResults.approved.length}, Pending: ${searchResults.pending.length}, Rejected: ${searchResults.rejected.length}`,
          )
        }
      } else {
        showAlert("danger", "Failed to search retailers: " + (data.message || "Unknown error"))
        showErrorState()
      }
    })
    .catch((error) => {
      console.error("Error searching retailers:", error)
      showAlert("danger", "Error searching retailers. Please try again.")
      showErrorState()
    })
}

// Function to display alerts
function showAlert(type, message) {
  // Remove existing alerts
  const existingAlerts = document.querySelectorAll(".alert-notification")
  existingAlerts.forEach((alert) => alert.remove())

  const alertContainer = document.createElement("div")
  alertContainer.className = `alert alert-${type} alert-dismissible fade show alert-notification position-fixed`
  alertContainer.style.cssText = `
  top: 20px;
  right: 20px;
  z-index: 1060;
  min-width: 300px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.2);
  border: none;
  border-radius: 10px;
`
  alertContainer.setAttribute("role", "alert")
  alertContainer.innerHTML = `
  <div class="d-flex align-items-center">
    <i class="bi bi-${type === "success" ? "check-circle" : type === "danger" ? "exclamation-triangle" : "info-circle"} me-2"></i>
    <div>${message}</div>
  </div>
  <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
`

  document.body.appendChild(alertContainer)

  // Auto-dismiss after 5 seconds
  setTimeout(() => {
    if (alertContainer.parentNode) {
      alertContainer.remove()
    }
  }, 5000)
}