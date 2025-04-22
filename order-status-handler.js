/**
 * Order Status Handler
 * This file contains functions for updating and displaying order statuses
 * for both delivery and pickup orders.
 */

// Global variables
let statusUpdateInProgress = false

// Declare showAlert and loadRetailerOrders (assuming they are globally available or imported elsewhere)
// You might need to adjust the actual import/declaration based on your project setup
// For example:
// import { showAlert } from './alert-module';
// import { loadRetailerOrders } from './order-module';
// Or, if they are defined in the global scope:
/* global showAlert, loadRetailerOrders */

/**
 * Initialize status update functionality
 */
document.addEventListener("DOMContentLoaded", () => {
  // Add event listeners for status update dropdowns
  initStatusDropdowns()
})

/**
 * Initialize status dropdowns in the order table
 */
function initStatusDropdowns() {
  // Find all status dropdowns in the table
  document.querySelectorAll(".status-dropdown").forEach((dropdown) => {
    dropdown.addEventListener("change", function () {
      const orderId = this.getAttribute("data-order-id")
      const newStatus = this.value
      const deliveryMode = this.getAttribute("data-delivery-mode")

      updateOrderStatus(orderId, newStatus, deliveryMode)
    })
  })
}

/**
 * Update order status
 * @param {number} orderId - The order ID
 * @param {string} status - The new status
 * @param {string} deliveryMode - The delivery mode (delivery or pickup)
 */
function updateOrderStatus(orderId, status, deliveryMode) {
  if (statusUpdateInProgress) {
    showAlert("warning", "A status update is already in progress. Please wait...")
    return
  }

  statusUpdateInProgress = true

  // Show loading indicator
  showAlert("info", `Updating order #${orderId} status to ${status}...`)

  // Create form data
  const formData = new FormData()
  formData.append("order_id", orderId)
  formData.append("status", status)
  formData.append("delivery_mode", deliveryMode)

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
      statusUpdateInProgress = false

      if (data.success) {
        showAlert("success", data.message || "Order status updated successfully")

        // Update order history
        updateOrderHistory(orderId, status, data.timestamp)

        // Refresh orders list
        loadRetailerOrders()
      } else {
        showAlert("danger", data.message || "Failed to update order status")
      }
    })
    .catch((error) => {
      statusUpdateInProgress = false
      console.error("Error updating order status:", error)
      showAlert("danger", "Error updating order status. Please try again.")
    })
}

/**
 * Update order history display
 * @param {number} orderId - The order ID
 * @param {string} status - The new status
 * @param {string} timestamp - The timestamp of the update
 */
function updateOrderHistory(orderId, status, timestamp) {
  const historyContainer = document.querySelector(`.order-history[data-order-id="${orderId}"]`)

  if (historyContainer) {
    const formattedDate = new Date(timestamp).toLocaleString()
    const statusClass = getStatusClass(status)

    const historyItem = document.createElement("div")
    historyItem.className = "history-item"
    historyItem.innerHTML = `
      <span class="history-time">${formattedDate}</span>
      <span class="history-status">
        <span class="badge ${statusClass}">${capitalizeFirstLetter(status)}</span>
      </span>
    `

    historyContainer.prepend(historyItem)
  }
}

/**
 * Get the appropriate CSS class for a status badge
 * @param {string} status - The order status
 * @returns {string} The CSS class for the badge
 */
function getStatusClass(status) {
  switch (status) {
    case "order":
      return "bg-warning text-dark"
    case "confirmed":
      return "bg-success"
    case "shipped":
      return "bg-primary"
    case "delivered":
      return "bg-info"
    case "cancelled":
      return "bg-danger"
    default:
      return "bg-secondary"
  }
}

/**
 * Capitalize the first letter of a string
 * @param {string} string - The input string
 * @returns {string} The string with the first letter capitalized
 */
function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1)
}

/**
 * Render status dropdown for an order
 * @param {number} orderId - The order ID
 * @param {string} currentStatus - The current status
 * @param {string} deliveryMode - The delivery mode (delivery or pickup)
 * @returns {string} HTML for the status dropdown
 */
function renderStatusDropdown(orderId, currentStatus, deliveryMode) {
  // Define available statuses based on delivery mode
  let statuses = ["order", "confirmed"]

  if (deliveryMode === "delivery") {
    statuses = statuses.concat(["shipped", "delivered", "cancelled"])
  } else if (deliveryMode === "pickup") {
    statuses = statuses.concat(["ready", "picked up", "cancelled"])
  }

  // Create options HTML
  const options = statuses
    .map((status) => {
      const selected = status === currentStatus ? "selected" : ""
      return `<option value="${status}" ${selected}>${capitalizeFirstLetter(status)}</option>`
    })
    .join("")

  // Return the complete dropdown HTML
  return `
    <select class="form-select form-select-sm status-dropdown" 
            data-order-id="${orderId}" 
            data-delivery-mode="${deliveryMode}">
      ${options}
    </select>
  `
}

/**
 * Update the UI to display the current status
 * @param {number} orderId - The order ID
 * @param {string} status - The current status
 */
function displayOrderStatus(orderId, status) {
  const statusCell = document.querySelector(`.status-cell[data-order-id="${orderId}"]`)

  if (statusCell) {
    const statusClass = getStatusClass(status)
    statusCell.innerHTML = `<span class="badge ${statusClass}">${capitalizeFirstLetter(status)}</span>`
  }
}

// Export functions for use in other files
window.OrderStatusHandler = {
  updateOrderStatus,
  renderStatusDropdown,
  displayOrderStatus,
  initStatusDropdowns,
}
