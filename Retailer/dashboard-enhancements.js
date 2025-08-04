document.addEventListener("DOMContentLoaded", () => {
    // Add custom styles
    const customStyles = document.createElement("link")
    customStyles.rel = "stylesheet"
    customStyles.href = "enhanced-styles.css"
    document.head.appendChild(customStyles)
  
    // Add animation library
    const animateCSS = document.createElement("link")
    animateCSS.rel = "stylesheet"
    animateCSS.href = "https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css"
    document.head.appendChild(animateCSS)
  
    // Add AOS library for scroll animations
    const aosCSS = document.createElement("link")
    aosCSS.rel = "stylesheet"
    aosCSS.href = "https://unpkg.com/aos@next/dist/aos.css"
    document.head.appendChild(aosCSS)
  
    const aosScript = document.createElement("script")
    aosScript.src = "https://unpkg.com/aos@next/dist/aos.js"
    document.body.appendChild(aosScript)
  
    // Initialize AOS after it loads
    aosScript.onload = () => {
      if (typeof AOS !== "undefined") {
        AOS.init({
          duration: 800,
          easing: "ease-out-cubic",
          once: true,
        })
      } else {
        console.error("AOS library not loaded.")
      }
    }
  
    // Add theme toggle functionality
    const themeToggle = document.createElement("div")
    themeToggle.className = "theme-toggle"
    themeToggle.innerHTML = `
      <button id="theme-toggle-btn" class="btn btn-sm" aria-label="Toggle dark mode">
        <i class="bi bi-moon-stars"></i>
      </button>
    `
  
    const headerRight = document.querySelector(".fixed-top-header .d-flex.align-items-center")
    if (headerRight) {
      headerRight.prepend(themeToggle)
    }
  
    // Add theme toggle functionality
    const toggleThemeBtn = document.getElementById("theme-toggle-btn")
    if (toggleThemeBtn) {
      toggleThemeBtn.addEventListener("click", () => {
        document.body.classList.toggle("dark-theme")
        const isDarkTheme = document.body.classList.contains("dark-theme")
        toggleThemeBtn.innerHTML = isDarkTheme ? '<i class="bi bi-sun"></i>' : '<i class="bi bi-moon-stars"></i>'
  
        // Save preference
        localStorage.setItem("darkTheme", isDarkTheme)
      })
  
      // Check for saved theme preference
      if (localStorage.getItem("darkTheme") === "true") {
        document.body.classList.add("dark-theme")
        toggleThemeBtn.innerHTML = '<i class="bi bi-sun"></i>'
      }
    }
  
    // Add animated welcome message
    const welcomeMessage = document.createElement("div")
    welcomeMessage.className = "welcome-message animate__animated animate__fadeIn"
    welcomeMessage.innerHTML = `
      <div class="welcome-content">
        <h2>Welcome back, Retailer!</h2>
        <p>Here's your dashboard overview for today</p>
      </div>
    `
  
    const dashboardContent = document.querySelector(".dashboard-content")
    if (dashboardContent) {
      dashboardContent.prepend(welcomeMessage)
  
      // Auto-hide welcome message after 5 seconds
      setTimeout(() => {
        welcomeMessage.classList.add("animate__fadeOut")
        setTimeout(() => {
          welcomeMessage.style.display = "none"
        }, 1000)
      }, 5000)
    }
  
    // Enhance dashboard cards with animations
    const dashboardCards = document.querySelectorAll(".dashboard-card")
    dashboardCards.forEach((card, index) => {
      card.setAttribute("data-aos", "fade-up")
      card.setAttribute("data-aos-delay", (index * 100).toString())
    })
  
    // Add pulse animation to dashboard icons
    const dashboardIcons = document.querySelectorAll(".dashboard-icon")
    dashboardIcons.forEach((icon) => {
      icon.classList.add("pulse-effect")
    })
  
    // Add hover effects to order cards
    document.addEventListener(
      "mouseover",
      (e) => {
        const orderCard = e.target.closest(".order-card")
        if (orderCard) {
          orderCard.classList.add("card-hover")
        }
      },
      true,
    )
  
    document.addEventListener(
      "mouseout",
      (e) => {
        const orderCard = e.target.closest(".order-card")
        if (orderCard) {
          orderCard.classList.remove("card-hover")
        }
      },
      true,
    )
  
    // Add animation to sidebar menu items
    const sidebarItems = document.querySelectorAll(".sidebar-nav .nav-item")
    sidebarItems.forEach((item, index) => {
      item.style.animationDelay = `${index * 0.1}s`
      item.classList.add("sidebar-item-animate")
    })
  
    // Add counter animation to dashboard numbers
    function animateCounter(element, target) {
      if (!element) return
  
      const text = element.textContent
      if (text === "--" || text === "Error") return
  
      const value = Number.parseInt(text, 10)
      if (isNaN(value)) return
  
      let current = 0
      const increment = Math.max(1, Math.floor(value / 20))
      const duration = 1500 // ms
      const interval = Math.floor(duration / (value / increment))
  
      element.textContent = "0"
  
      const counter = setInterval(() => {
        current += increment
        if (current >= value) {
          element.textContent = value.toString()
          clearInterval(counter)
        } else {
          element.textContent = current.toString()
        }
      }, interval)
    }
  
    // Observe when elements come into view to trigger counter animation
    const observeCounters = () => {
      const counters = [
        document.getElementById("total-products"),
        document.getElementById("active-orders"),
        document.getElementById("pending-payments"),
        document.getElementById("low-stock"),
      ]
  
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              animateCounter(entry.target)
              observer.unobserve(entry.target)
            }
          })
        },
        { threshold: 0.5 },
      )
  
      counters.forEach((counter) => {
        if (counter) observer.observe(counter)
      })
    }
  
    // Call after data is loaded
    const originalFetchDashboardData = window.fetchDashboardData
    window.fetchDashboardData = function () {
      originalFetchDashboardData.apply(this, arguments)
  
      // Add a small delay to ensure data is populated
      setTimeout(() => {
        observeCounters()
      }, 500)
    }
  
    // Add loading animation for sections
    const enhanceLoadingIndicators = () => {
      const loadingSpinners = document.querySelectorAll(".spinner-border")
      loadingSpinners.forEach((spinner) => {
        const container = spinner.closest("div")
        if (container) {
          spinner.remove()
          container.innerHTML = `
            <div class="loading-pulse">
              <div class="pulse-dot"></div>
              <div class="pulse-dot"></div>
              <div class="pulse-dot"></div>
            </div>
            <p class="loading-text">Loading data...</p>
          `
        }
      })
    }
  
    enhanceLoadingIndicators()
  
    // Add cursor trail effect
    const cursorTrail = document.createElement("div")
    cursorTrail.className = "cursor-trail"
    document.body.appendChild(cursorTrail)
  
    document.addEventListener("mousemove", (e) => {
      const trail = document.createElement("div")
      trail.className = "trail-dot"
      trail.style.left = e.pageX + "px"
      trail.style.top = e.pageY + "px"
  
      cursorTrail.appendChild(trail)
  
      setTimeout(() => {
        trail.remove()
      }, 800)
    })
  
    // Add notification bell with animation
    const notificationBell = document.createElement("div")
    notificationBell.className = "notification-bell"
    notificationBell.innerHTML = `
      <button class="btn btn-sm notification-btn" aria-label="Notifications">
        <i class="bi bi-bell"></i>
        <span class="notification-indicator"></span>
      </button>
    `
  
    if (headerRight) {
      headerRight.prepend(notificationBell)
  
      // Add notification animation
      setTimeout(() => {
        const indicator = document.querySelector(".notification-indicator")
        if (indicator) {
          indicator.classList.add("has-notifications")
        }
      }, 3000)
    }
  })
  
  // Override the populateRecentOrdersCards function to add animations
  const originalPopulateRecentOrdersCards = window.populateRecentOrdersCards
  window.populateRecentOrdersCards = function (orders) {
    originalPopulateRecentOrdersCards.call(this, orders)
  
    // Add staggered animations to cards
    const cards = document.querySelectorAll("#recent-orders-container .order-card")
    cards.forEach((card, index) => {
      card.setAttribute("data-aos", "fade-up")
      card.setAttribute("data-aos-delay", (index * 100).toString())
    })
  }
  
  // Override the populateActiveOrdersCards function to add animations
  const originalPopulateActiveOrdersCards = window.populateActiveOrdersCards
  window.populateActiveOrdersCards = function (orders) {
    originalPopulateActiveOrdersCards.call(this, orders)
  
    // Add staggered animations to cards
    const cards = document.querySelectorAll("#active-orders-container .order-card")
    cards.forEach((card, index) => {
      card.setAttribute("data-aos", "fade-up")
      card.setAttribute("data-aos-delay", (index * 100).toString())
    })
  }
  
  // Override the populatePartialPaymentsCards function to add animations
  const originalPopulatePartialPaymentsCards = window.populatePartialPaymentsCards
  window.populatePartialPaymentsCards = function (orders) {
    originalPopulatePartialPaymentsCards.call(this, orders)
  
    // Add staggered animations to cards
    const cards = document.querySelectorAll("#partial-payments-container .order-card")
    cards.forEach((card, index) => {
      card.setAttribute("data-aos", "fade-up")
      card.setAttribute("data-aos-delay", (index * 100).toString())
    })
  }
  
  // Add a scroll-to-top button
  window.addEventListener("scroll", () => {
    const scrollBtn = document.querySelector(".scroll-to-top")
  
    if (window.scrollY > 300) {
      if (!scrollBtn) {
        const btn = document.createElement("button")
        btn.className = "scroll-to-top"
        btn.innerHTML = '<i class="bi bi-arrow-up"></i>'
        btn.addEventListener("click", () => {
          window.scrollTo({
            top: 0,
            behavior: "smooth",
          })
        })
        document.body.appendChild(btn)
  
        // Animate button appearance
        setTimeout(() => {
          btn.classList.add("visible")
        }, 10)
      }
    } else if (scrollBtn) {
      scrollBtn.classList.remove("visible")
      setTimeout(() => {
        scrollBtn.remove()
      }, 300)
    }
  })
  