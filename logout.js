// Logout functionality
document.addEventListener("DOMContentLoaded", () => {
    // Get the logout button and modal elements
    const logoutButton = document.getElementById("logoutButton")
    const logoutModalElement = document.getElementById("logoutModal")
    const logoutModal = new bootstrap.Modal(logoutModalElement)
    const confirmLogoutButton = document.getElementById("confirmLogout")
  
    // Add click event to logout button
    if (logoutButton) {
      logoutButton.addEventListener("click", (e) => {
        e.preventDefault()
        logoutModal.show()
      })
    }
  
    // Add click event to confirm logout button
    if (confirmLogoutButton) {
      confirmLogoutButton.addEventListener("click", () => {
        // Perform logout action
        window.location.href = "logout.php"
      })
    }
  })
  
  