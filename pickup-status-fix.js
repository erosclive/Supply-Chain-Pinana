/**
 * This script fixes issues with pickup status updates in the order management system.
 * It ensures that all pickup status variants are properly recognized and handled.
 */

// Assuming updateOrderStatus is defined elsewhere, possibly in a shared module
// For example:
// import { updateOrderStatus } from './order-utils';
// Or:
// window.updateOrderStatus = function(orderId, status, message) { ... };

document.addEventListener("DOMContentLoaded", () => {
    // Listen for the ordersUpdated event
    document.addEventListener("ordersUpdated", () => {
      console.log("Orders updated, refreshing status displays")
      updateStatusDisplay()
    })
  
    // Initial update of status displays
    updateStatusDisplay()
  
    // Add event listener for ready-for-pickup buttons
    document.addEventListener("click", (e) => {
      if (e.target.closest(".ready-for-pickup-btn")) {
        const btn = e.target.closest(".ready-for-pickup-btn")
        const orderId = btn.getAttribute("data-id")
  
        // Use the consistent status format
        if (typeof updateOrderStatus === "function") {
          updateOrderStatus(orderId, "ready_for_pickup", "Order is ready for pickup")
        } else {
          console.error("updateOrderStatus function is not defined.")
        }
      }
    })
  
    // Add event listener for pickup-complete buttons
    document.addEventListener("click", (e) => {
      if (e.target.closest(".pickup-complete-btn")) {
        const btn = e.target.closest(".pickup-complete-btn")
        const orderId = btn.getAttribute("data-id")
  
        // Use the consistent status format
        if (typeof updateOrderStatus === "function") {
          updateOrderStatus(orderId, "picked_up", "Order has been picked up")
        } else {
          console.error("updateOrderStatus function is not defined.")
        }
      }
    })
  })
  
  /**
   * Updates the status display for all status cells in the table
   */
  function updateStatusDisplay() {
    // Find all status cells in the table
    const statusCells = document.querySelectorAll(".status-cell")
  
    statusCells.forEach((cell) => {
      const status = cell.getAttribute("data-status")
      const deliveryMode = cell.getAttribute("data-delivery-mode")
      const pickupStatus = cell.getAttribute("data-pickup-status")
  
      if (status && deliveryMode) {
        // Get the badge HTML using the orderStatus helper if available
        let badgeHtml = ""
        if (window.orderStatus && window.orderStatus.renderStatusBadge) {
          badgeHtml = window.orderStatus.renderStatusBadge(status, deliveryMode, pickupStatus)
        } else {
          // Fallback if orderStatus is not available
          const statusLabel = status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, " ")
          badgeHtml = `<span class="badge bg-secondary">${statusLabel}</span>`
        }
  
        // Get the delivery mode badge
        const deliveryModeBadge = deliveryMode
          ? `<span class="badge bg-info ms-1">${deliveryMode.charAt(0).toUpperCase() + deliveryMode.slice(1)}</span>`
          : ""
  
        // Update the cell content
        cell.innerHTML = badgeHtml + deliveryModeBadge
      }
    })
  
    console.log("Status display updated")
  }
  