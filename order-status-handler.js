// Order Status Handler

// Define status mappings for all order types
const statusMappings = {
  // Common statuses (same for both modes)
  order: {
    label: "Order Placed",
    badge: "bg-warning text-dark",
    icon: "bi-file-earmark-text",
  },
  confirmed: {
    label: "Confirmed",
    badge: "bg-success",
    icon: "bi-check-circle",
  },
  cancelled: {
    label: "Cancelled",
    badge: "bg-danger",
    icon: "bi-x-circle",
  },

  // Delivery-specific statuses
  shipped: {
    label: "Shipped",
    badge: "bg-primary",
    icon: "bi-truck",
  },
  delivered: {
    label: "Delivered",
    badge: "bg-success",
    icon: "bi-house-check",
  },

  // Pickup-specific statuses
  "ready-to-pickup": {
    label: "Ready for Pickup",
    badge: "bg-primary",
    icon: "bi-bag-check",
  },
  ready_for_pickup: {
    label: "Ready for Pickup",
    badge: "bg-primary",
    icon: "bi-bag-check",
  },
  "picked-up": {
    label: "Picked Up",
    badge: "bg-success",
    icon: "bi-check2-all",
  },
  picked_up: {
    label: "Picked Up",
    badge: "bg-success",
    icon: "bi-check2-all",
  },

  completed: {
    label: "Completed",
    badge: "bg-secondary",
    icon: "bi-check-all",
  },
  
  // Return request status
  "return_requested": {
    label: "Return Requested",
    badge: "bg-warning text-dark",
    icon: "bi-arrow-return-left",
  },
}

// Add "picked up" (with space) to the status mappings
statusMappings["picked up"] = {
  label: "Picked Up",
  badge: "bg-success",
  icon: "bi-check2-all",
}

// Function to get status display information
function getStatusDisplay(status, deliveryMode) {
  // Normalize status to handle different formats
  const normalizedStatus = normalizeStatus(status, deliveryMode)

  // Get status info from mappings
  let statusInfo = statusMappings[normalizedStatus]

  // If status not found, use a default
  if (!statusInfo) {
    statusInfo = {
      label: status ? status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, " ") : "Unknown",
      badge: "bg-secondary",
      icon: "bi-question-circle",
    }
  }

  return statusInfo
}

// Update the normalizeStatus function to handle "picked up" with space
function normalizeStatus(status, deliveryMode) {
  if (!status) return ""

  const statusLower = status.toLowerCase()

  // Handle pickup status variations
  if (deliveryMode === "pickup") {
    if (statusLower === "ready_for_pickup" || statusLower === "ready for pickup") {
      return "ready-to-pickup"
    }

    if (statusLower === "picked_up" || statusLower === "picked-up" || statusLower === "picked up") {
      return "picked-up" // Normalize to "picked-up" for mapping lookup
    }
  }

  return statusLower
}

// Update the renderStatusBadge function to handle "picked up" with space
function renderStatusBadge(status, deliveryMode, pickupStatus) {
  // For pickup orders, prioritize pickup_status if available
  if (deliveryMode === "pickup") {
    if (pickupStatus && pickupStatus !== "") {
      status = pickupStatus
    }
  }

  // Normalize status to handle different formats
  const normalizedStatus = normalizeStatus(status, deliveryMode)

  // Get status info from mappings
  let statusInfo = statusMappings[normalizedStatus]

  // If status not found, use a default
  if (!statusInfo) {
    console.log("Status not found in mappings:", normalizedStatus, "Original status:", status)

    // Special handling for picked up status with space
    if (status === "picked_up" || status === "picked-up" || status === "picked up") {
      statusInfo = {
        label: "Picked Up",
        badge: "bg-success",
        icon: "bi-check2-all",
      }
    } else {
      statusInfo = {
        label: status ? status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, " ") : "Unknown",
        badge: "bg-secondary",
        icon: "bi-question-circle",
      }
    }
  }

  return `
    <span class="badge ${statusInfo.badge}">
      <i class="bi ${statusInfo.icon} me-1"></i>
      ${statusInfo.label}
    </span>
  `
}

// Export functions for use in other scripts
window.orderStatus = {
  getStatusDisplay,
  renderStatusBadge,
  normalizeStatus,
}