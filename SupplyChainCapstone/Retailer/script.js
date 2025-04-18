// Wait for the DOM to be fully loaded
document.addEventListener("DOMContentLoaded", () => {
    // Initialize sidebar toggle for mobile
    initSidebar()
  
    // Initialize navigation
    initNavigation()
  
    // Initialize tooltips
    initTooltips()
  
    // Initialize logout functionality
    initLogout()
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
          sidebar.classList.contains("show") &&
          !sidebar.contains(event.target) &&
          !sidebarToggle.contains(event.target)
        ) {
          sidebar.classList.remove("show")
        }
      })
    }
  }
  
  // Initialize navigation
  function initNavigation() {
    const navLinks = document.querySelectorAll(".nav-link[data-page]")
    const pageTitle = document.getElementById("pageTitle")
    const contentSections = document.querySelectorAll(".content-section")
  
    navLinks.forEach((link) => {
      link.addEventListener("click", function (e) {
        e.preventDefault()
  
        // Get the page name from data attribute
        const pageName = this.getAttribute("data-page")
  
        // Update active link
        navLinks.forEach((navLink) => {
          navLink.classList.remove("active")
        })
        this.classList.add("active")
  
        // Update page title
        if (pageTitle) {
          pageTitle.textContent = pageName.charAt(0).toUpperCase() + pageName.slice(1)
        }
  
        // Show the corresponding content section
        contentSections.forEach((section) => {
          section.classList.remove("active")
        })
  
        const targetSection = document.getElementById(pageName + "Content")
        if (targetSection) {
          targetSection.classList.add("active")
        }
      })
    })
  }
  
  // Initialize tooltips
  function initTooltips() {
    // Check if Bootstrap's tooltip plugin is available
    if (typeof bootstrap !== "undefined" && typeof bootstrap.Tooltip !== "undefined") {
      const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
      tooltipTriggerList.map((tooltipTriggerEl) => new bootstrap.Tooltip(tooltipTriggerEl))
    }
  }
  
  // Initialize logout functionality
  function initLogout() {
    const logoutButton = document.getElementById("logoutButton")
    const confirmLogout = document.getElementById("confirmLogout")
  
    if (logoutButton) {
      logoutButton.addEventListener("click", (e) => {
        e.preventDefault()
  
        // Show logout confirmation modal
        if (typeof bootstrap !== "undefined" && typeof bootstrap.Modal !== "undefined") {
          const logoutModal = new bootstrap.Modal(document.getElementById("logoutModal"))
          logoutModal.show()
        }
      })
    }
  
    if (confirmLogout) {
      confirmLogout.addEventListener("click", () => {
        // Perform logout action
        window.location.href = "logout.php"
      })
    }
  }
  