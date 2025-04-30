// Notifications system
let notifications = []
const lastCheckedTimestamp = localStorage.getItem("lastCheckedTimestamp") || new Date().toISOString()

// Function to fetch notifications from the server
async function fetchNotifications() {
  try {
    const response = await fetch("/api/get_notifications.php?unread_only=true")

    if (!response.ok) {
      throw new Error("Failed to fetch notifications")
    }

    const result = await response.json()

    if (result.status === "success") {
      // Clear existing notifications
      notifications = []

      // Add fetched notifications
      result.data.forEach((notification) => {
        notifications.push({
          id: notification.notification_id,
          relatedId: notification.related_id,
          type: notification.type,
          message: notification.message,
          timestamp: notification.created_at,
          read: notification.is_read === 1,
          poNumber: notification.po_number,
          retailerName: notification.retailer_name,
          expectedDelivery: notification.expected_delivery,
          deliveryMode: notification.delivery_mode,
          pickupDate: notification.pickup_date,
          pickupLocation: notification.pickup_location,
          status: notification.status,
        })
      })

      // Update the UI
      updateNotificationsUI()
    }
  } catch (error) {
    console.error("Error fetching notifications:", error)
  }
}

// Function to update the notifications UI
function updateNotificationsUI() {
  const badge = document.getElementById("notification-badge")
  const container = document.getElementById("notifications-container")
  const noNotificationsMessage = document.getElementById("no-notifications-message")

  // Count unread notifications
  const unreadCount = notifications.filter((n) => !n.read).length

  // Update badge
  if (unreadCount > 0) {
    badge.textContent = unreadCount
    badge.style.display = "block"
    badge.classList.add("pulse")
  } else {
    badge.style.display = "none"
    badge.classList.remove("pulse")
  }

  // Clear container
  container.innerHTML = ""

  // Show message if no notifications
  if (notifications.length === 0) {
    container.appendChild(noNotificationsMessage)
    return
  } else {
    if (container.contains(noNotificationsMessage)) {
      container.removeChild(noNotificationsMessage)
    }
  }

  // Sort notifications by timestamp (newest first)
  const sortedNotifications = [...notifications].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))

  // Add notifications to container
  sortedNotifications.forEach((notification) => {
    const notificationElement = document.createElement("div")
    notificationElement.className = `notification-item ${notification.read ? "" : "unread"}`
    notificationElement.dataset.id = notification.id

    // Format the timestamp
    const timestamp = new Date(notification.timestamp)
    const formattedTime = formatTimeAgo(timestamp)

    // Format delivery info
    let deliveryInfo = ""
    if (notification.deliveryMode === "pickup") {
      const pickupDate = notification.pickupDate ? new Date(notification.pickupDate) : null
      deliveryInfo = pickupDate
        ? `Pickup on ${formatDate(pickupDate)} at ${notification.pickupLocation || "store"}`
        : "Pickup (date not specified)"
    } else {
      const expectedDelivery = notification.expectedDelivery ? new Date(notification.expectedDelivery) : null
      deliveryInfo = expectedDelivery
        ? `Delivery expected on ${formatDate(expectedDelivery)}`
        : "Delivery (date not specified)"
    }

    // Create notification content
    notificationElement.innerHTML = `
      <div class="notification-title">
        ${notification.type === "new_order" ? '<i class="bi bi-cart-plus text-success me-1"></i>' : ""}
        ${notification.poNumber ? `Order #${notification.poNumber}` : "New Order"}
      </div>
      <div class="notification-meta">
        <span class="notification-from">${notification.retailerName || "Unknown retailer"}</span>
        <span class="notification-time">${formattedTime}</span>
      </div>
      <div class="notification-details">
        ${deliveryInfo}
      </div>
      <div class="notification-actions">
        <button class="btn btn-sm btn-outline-primary view-order-btn" data-id="${notification.relatedId}">
          View Order
        </button>
      </div>
    `

    // Add click event to mark as read
    notificationElement.addEventListener("click", (e) => {
      // Don't mark as read if clicking the view order button
      if (!e.target.classList.contains("view-order-btn")) {
        markNotificationAsRead(notification.id)
      }
    })

    // Add click event to view order button
    const viewOrderBtn = notificationElement.querySelector(".view-order-btn")
    if (viewOrderBtn) {
      viewOrderBtn.addEventListener("click", (e) => {
        e.stopPropagation() // Prevent the notification click event
        viewOrder(notification.relatedId)
        markNotificationAsRead(notification.id)
      })
    }

    container.appendChild(notificationElement)
  })
}

// Function to mark a notification as read
async function markNotificationAsRead(notificationId) {
  try {
    // Update local state
    const index = notifications.findIndex((n) => n.id === notificationId)
    if (index !== -1) {
      notifications[index].read = true
      updateNotificationsUI()
    }

    // Call the API to update the database
    const response = await fetch("/api/mark_notification_read.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        notification_id: notificationId,
      }),
    })

    if (!response.ok) {
      throw new Error("Failed to mark notification as read")
    }

    const result = await response.json()
    if (result.status !== "success") {
      console.error("Error marking notification as read:", result.message)
    }
  } catch (error) {
    console.error("Error marking notification as read:", error)
  }
}

// Function to mark all notifications as read
async function markAllNotificationsAsRead() {
  try {
    // Update local state
    notifications.forEach((notification) => {
      notification.read = true
    })
    updateNotificationsUI()

    // Call the API to update the database
    const response = await fetch("/api/mark_all_read.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error("Failed to mark all notifications as read")
    }

    const result = await response.json()
    if (result.status !== "success") {
      console.error("Error marking all notifications as read:", result.message)
    }
  } catch (error) {
    console.error("Error marking all notifications as read:", error)
  }
}

// Function to view order details
let showOrderDetails // Declare showOrderDetails

function viewOrder(orderId) {
  // Redirect to order details page or open modal
  if (window.location.pathname.includes("orders.html")) {
    // If already on orders page, trigger view for this specific order
    if (typeof showOrderDetails === "function") {
      showOrderDetails(orderId)
    }
  } else {
    // Otherwise, redirect to orders page with this order ID
    window.location.href = `orders.html?view=${orderId}`
  }
}

// Function to format date
function formatDate(date) {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

// Function to format time ago
function formatTimeAgo(date) {
  const now = new Date()
  const diffInSeconds = Math.floor((now - date) / 1000)

  if (diffInSeconds < 60) {
    return "just now"
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60)
  if (diffInMinutes < 60) {
    return `${diffInMinutes} min${diffInMinutes > 1 ? "s" : ""} ago`
  }

  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`
  }

  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 7) {
    return `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`
  }

  return formatDate(date)
}

// Function to check for new notifications periodically
function startNotificationPolling() {
  // Initial check
  fetchNotifications()

  // Check every minute
  setInterval(fetchNotifications, 60000)
}

// Initialize the notifications system
document.addEventListener("DOMContentLoaded", () => {
  // Set up event listeners
  const markAllReadBtn = document.getElementById("mark-all-read")
  if (markAllReadBtn) {
    markAllReadBtn.addEventListener("click", markAllNotificationsAsRead)
  }

  // Start polling for notifications
  startNotificationPolling()
})
