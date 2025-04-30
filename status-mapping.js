/**
 * Status Mapping Utility
 *
 * This file provides mapping between delivery and pickup statuses
 * for consistent reporting and filtering.
 */

// Define the status mapping between delivery and pickup modes
const STATUS_MAPPING = {
    // Delivery mode statuses
    order: "order",
    confirmed: "confirmed",
    shipped: "shipped",
    delivered: "delivered",
    cancelled: "cancelled",
  
    // Pickup mode statuses with their delivery equivalents
    ready: "shipped", // Equivalent to "shipped" in delivery flow
    "picked up": "delivered", // Equivalent to "delivered" in delivery flow
  }
  
  // Define pickup status options
  const PICKUP_STATUS_OPTIONS = ["order", "confirmed", "ready", "picked up", "cancelled"]
  
  // Function to get the equivalent status for reporting/filtering
  function getEquivalentStatus(status, deliveryMode, pickupStatus) {
    // If it's a pickup order, use the pickup status for mapping
    if (deliveryMode === "pickup" && pickupStatus && STATUS_MAPPING[pickupStatus.toLowerCase()]) {
      return STATUS_MAPPING[pickupStatus.toLowerCase()]
    }
  
    // Otherwise return the original status
    return status
  }
  
  // Function to get the display label for a status
  function getStatusLabel(status) {
    const labels = {
      order: "Order Placed",
      confirmed: "Confirmed",
      shipped: "Shipped",
      delivered: "Delivered",
      ready: "Ready for Pickup",
      "picked up": "Picked Up",
      cancelled: "Cancelled",
    }
  
    return labels[status.toLowerCase()] || status.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
  }
  
  // Export the functions for use in other modules
  export { getEquivalentStatus, getStatusLabel, STATUS_MAPPING, PICKUP_STATUS_OPTIONS }
  