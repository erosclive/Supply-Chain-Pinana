// Set active navigation based on current page
function setActiveNavigation() {
  // Get current page from URL
  let path = window.location.pathname.split("/").pop().toLowerCase()

  // Handle default cases (root or empty URL)
  if (path === "" || path === "index.html") {
    path = "index"
  } else {
    path = path.replace(".html", "")
  }

  console.log("Current page:", path) // Debugging log

  // Remove all active classes first
  const navLinks = document.querySelectorAll(".sidebar .nav-link")
  navLinks.forEach((link) => link.classList.remove("active"))

  // Find the matching nav link using data-page attribute
  navLinks.forEach((link) => {
    if (link.getAttribute("data-page") === path) {
      link.classList.add("active")
    }
  })
}

// Sidebar toggle for mobile view
function setupSidebarToggle() {
  const sidebar = document.getElementById("sidebar")
  const sidebarToggle = document.getElementById("sidebarToggle")

  if (sidebarToggle && sidebar) {
    sidebarToggle.addEventListener("click", () => {
      sidebar.classList.toggle("d-md-block")
    })
  }
}

// Notifications system
const notifications = []
const lastCheckedTimestamp = localStorage.getItem("lastCheckedTimestamp") || new Date().toISOString()

// Function to fetch notifications from the database
async function fetchNotifications() {
  try {
    const response = await fetch("../api/get_notifications.php?unread_only=true")

    if (!response.ok) {
      throw new Error("Failed to fetch notifications")
    }

    const result = await response.json()

    if (result.status === "success") {
      // Clear existing notifications
      notifications.length = 0

      // Add fetched notifications
      result.data.forEach((notification) => {
        notifications.push({
          id: notification.notification_id,
          message: notification.message,
          timestamp: notification.created_at,
          read: notification.is_read === 1,
          data: {
            related_id: notification.related_id,
            type: notification.type,
          },
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
  } else {
    badge.style.display = "none"
  }

  // Clear container
  container.innerHTML = ""

  // Show message if no notifications
  if (notifications.length === 0) {
    noNotificationsMessage.style.display = "block"
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
    notificationElement.className = `notification-item p-2 ${notification.read ? "text-muted" : "fw-bold"}`
    notificationElement.style.borderBottom = "1px solid #eee"
    notificationElement.style.cursor = "pointer"

    // Format the timestamp
    const timestamp = new Date(notification.timestamp)
    const formattedTime = timestamp.toLocaleString()

    notificationElement.innerHTML = `
            <div>${notification.message}</div>
            <small class="text-muted">${formattedTime}</small>
        `

    // Add click event to mark as read
    notificationElement.addEventListener("click", () => {
      markNotificationAsRead(notification.id)
    })

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

// Function to check for new notifications periodically
function startNotificationPolling() {
  // Initial check
  fetchNotifications()

  // Check every minute
  setInterval(fetchNotifications, 60000)
}

// Function to create a test notification (for development/testing)
async function createTestNotification() {
  try {
    const response = await fetch("/api/test-notification.php")
    if (!response.ok) {
      throw new Error("Failed to create test notification")
    }

    const result = await response.json()
    if (result.status === "success") {
      console.log("Test notification created:", result.notification)
      // Refresh notifications
      fetchNotifications()
    } else {
      console.error("Error creating test notification:", result.message)
    }
  } catch (error) {
    console.error("Error creating test notification:", error)
  }
}

document.addEventListener("DOMContentLoaded", () => {
  setActiveNavigation()
  setupSidebarToggle()

  // Initialize notifications system
  updateNotificationsUI()
  startNotificationPolling()

  // Test button has been removed
})

