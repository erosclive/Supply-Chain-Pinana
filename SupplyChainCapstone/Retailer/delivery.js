// Global variables
let currentPage = 1
const itemsPerPage = 10
let totalPages = 1
let currentDeliveries = []
let allSuppliers = {}
const currentFilters = {
  status: "all",
  supplier: "all",
  dateRange: "all",
  startDate: null,
  endDate: null,
  search: "",
}

// Initialize the page
document.addEventListener("DOMContentLoaded", () => {
  // Initialize sidebar toggle for mobile
  initSidebar()

  // Initialize date pickers
  initDatePickers()

  // Load suppliers
  loadSuppliers()

  // Load deliveries
  loadDeliveries()

  // Initialize event listeners
  initEventListeners()

  // Load upcoming deliveries
  loadUpcomingDeliveries()

  // Load recent updates
  loadRecentUpdates()
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

// Initialize date pickers
function initDatePickers() {
  try {
    // Date range pickers
    if (typeof flatpickr !== "undefined") {
      flatpickr("#dateRangeStart", {
        enableTime: false,
        dateFormat: "Y-m-d",
      })

      flatpickr("#dateRangeEnd", {
        enableTime: false,
        dateFormat: "Y-m-d",
      })

      // Receive date picker
      flatpickr("#receiveDate", {
        enableTime: false,
        dateFormat: "Y-m-d",
        defaultDate: new Date(),
        clickOpens: false,
      })
    } else {
      console.warn("flatpickr is not defined. Date pickers may not work properly.")
    }
  } catch (error) {
    console.error("Error initializing date pickers:", error)
  }
}

// Initialize event listeners
function initEventListeners() {
  // Status filter
  const statusFilters = document.querySelectorAll(".status-filter")
  statusFilters.forEach((filter) => {
    filter.addEventListener("click", function (e) {
      e.preventDefault()
      const status = this.getAttribute("data-status")
      currentFilters.status = status

      // Update active state
      statusFilters.forEach((f) => f.classList.remove("active"))
      this.classList.add("active")

      // Update dropdown button text
      document.getElementById("statusFilter").innerHTML =
        `<i class="bi bi-funnel me-1"></i> Status: ${status === "all" ? "All" : status.charAt(0).toUpperCase() + status.slice(1).replace("_", " ")}`

      // Apply filters
      applyFilters()
    })
  })

  // Supplier filter
  const supplierFilters = document.querySelectorAll(".supplier-filter")
  supplierFilters.forEach((filter) => {
    filter.addEventListener("click", function (e) {
      e.preventDefault()
      const supplier = this.getAttribute("data-supplier")
      currentFilters.supplier = supplier

      // Update active state
      supplierFilters.forEach((f) => f.classList.remove("active"))
      this.classList.add("active")

      // Update dropdown button text
      let supplierText = "All"
      if (supplier !== "all") {
        supplierText = this.textContent
      }
      document.getElementById("supplierFilter").innerHTML =
        `<i class="bi bi-building me-1"></i> Supplier: ${supplierText}`

      // Apply filters
      applyFilters()
    })
  })

  // Date filter
  const dateFilters = document.querySelectorAll(".date-filter")
  dateFilters.forEach((filter) => {
    filter.addEventListener("click", function (e) {
      e.preventDefault()
      const range = this.getAttribute("data-range")
      currentFilters.dateRange = range

      // Update active state
      dateFilters.forEach((f) => f.classList.remove("active"))
      this.classList.add("active")

      // Update button text
      let buttonText = "All Time"
      if (range === "today") buttonText = "Today"
      if (range === "week") buttonText = "Last 7 Days"
      if (range === "month") buttonText = "Last 30 Days"
      if (range === "custom") buttonText = "Custom Range"

      document.getElementById("dateFilter").innerHTML = `<i class="bi bi-calendar3 me-1"></i> Date: ${buttonText}`

      // Show/hide date range picker
      const dateRangePicker = document.querySelector(".date-range-picker")
      if (range === "custom") {
        dateRangePicker.classList.remove("d-none")
      } else {
        dateRangePicker.classList.add("d-none")
        applyFilters()
      }
    })
  })

  // Apply custom date range
  document.getElementById("applyDateRange").addEventListener("click", () => {
    const startDate = document.getElementById("dateRangeStart").value
    const endDate = document.getElementById("dateRangeEnd").value

    if (startDate && endDate) {
      currentFilters.startDate = startDate
      currentFilters.endDate = endDate
      applyFilters()
    } else {
      showAlert("warning", "Please select both start and end dates")
    }
  })

  // Search deliveries
  document.getElementById("searchBtn").addEventListener("click", () => {
    const searchTerm = document.getElementById("deliverySearch").value.trim()
    currentFilters.search = searchTerm
    applyFilters()
  })

  // Search on Enter key
  document.getElementById("deliverySearch").addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      e.preventDefault()
      document.getElementById("searchBtn").click()
    }
  })

  // Refresh button
  document.querySelectorAll(".refresh-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      // Show loading spinner
      const tableBody = document.getElementById("deliveries-table-body")
      if (tableBody) {
        tableBody.innerHTML = `
          <tr>
            <td colspan="7" class="text-center py-4">
              <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
              </div>
              <p class="mt-2">Refreshing deliveries...</p>
            </td>
          </tr>
        `
      }

      // Reload deliveries
      loadDeliveries(true)
    })
  })

  // Reset filters button
  document.getElementById("resetFiltersBtn").addEventListener("click", () => {
    resetFilters()
  })

  // Clear all filters
  document.getElementById("clearAllFilters").addEventListener("click", () => {
    resetFilters()
  })

  // Confirm receipt checkbox
  document.getElementById("confirmReceiptCheck").addEventListener("change", function () {
    document.getElementById("confirmReceiveBtn").disabled = !this.checked
  })

  // Confirm receive button
  document.getElementById("confirmReceiveBtn").addEventListener("click", () => {
    receiveDelivery()
  })

  // Submit issue button
  document.getElementById("submitIssueBtn").addEventListener("click", () => {
    submitIssue()
  })
}

// Load suppliers
function loadSuppliers() {
  // Simulate API call with setTimeout
  setTimeout(() => {
    // Mock data for demonstration
    allSuppliers = {
      "pinana-main": {
        id: "pinana-main",
        name: "Piñana Gourmet Main",
        contact: "Juan Dela Cruz",
        email: "juan@pinanagourmet.com",
        phone: "+63 912 345 6789",
        address: "123 Main St, Manila, Philippines",
      },
      "pinana-south": {
        id: "pinana-south",
        name: "Piñana Gourmet South",
        contact: "Maria Santos",
        email: "maria@pinanagourmet.com",
        phone: "+63 923 456 7890",
        address: "456 South Ave, Davao City, Philippines",
      },
      "tropical-fruits": {
        id: "tropical-fruits",
        name: "Tropical Fruits Inc.",
        contact: "Antonio Reyes",
        email: "antonio@tropicalfruits.com",
        phone: "+63 934 567 8901",
        address: "789 Fruit St, Cebu City, Philippines",
      },
      "packaging-pro": {
        id: "packaging-pro",
        name: "Packaging Pro",
        contact: "Elena Gomez",
        email: "elena@packagingpro.com",
        phone: "+63 945 678 9012",
        address: "101 Package Rd, Quezon City, Philippines",
      },
    }
  }, 500)
}

// Load deliveries with current filters
function loadDeliveries(showLoading = true) {
  if (showLoading) {
    document.getElementById("loadingState").classList.remove("d-none")
    document.getElementById("emptyState").classList.add("d-none")
    document.getElementById("deliveries-table-body").innerHTML = `
      <tr>
        <td colspan="7" class="text-center py-4">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
          <p class="mt-2">Loading deliveries...</p>
        </td>
      </tr>
    `
  }

  // Simulate API call with setTimeout
  setTimeout(() => {
    // Mock data for demonstration
    const mockDeliveries = [
      {
        tracking_number: "TRK-001",
        po_number: "PO-001",
        supplier_id: "pinana-main",
        supplier_name: "Piñana Gourmet Main",
        supplier_contact: "Juan Dela Cruz",
        supplier_email: "juan@pinanagourmet.com",
        supplier_phone: "+63 912 345 6789",
        scheduled_date: "2023-04-22",
        estimated_arrival: "2023-04-22",
        status: "delivered",
        last_update: "2023-04-22T14:30:00",
        notes: "Delivery completed successfully.",
        items: [
          {
            product_id: "1",
            product_name: "Pineapple Jam",
            quantity: 30,
            unit_price: 90.0,
          },
          {
            product_id: "2",
            product_name: "Pineapple Juice",
            quantity: 40,
            unit_price: 65.0,
          },
          {
            product_id: "5",
            product_name: "Pineapple Syrup",
            quantity: 20,
            unit_price: 140.0,
          },
        ],
        timeline: [
          { status: "scheduled", date: "2023-04-15T10:30:00", note: "Delivery scheduled" },
          { status: "in_transit", date: "2023-04-20T09:15:00", note: "Shipment in transit" },
          { status: "delivered", date: "2023-04-22T14:30:00", note: "Delivery completed" },
        ],
      },
      {
        tracking_number: "TRK-002",
        po_number: "PO-002",
        supplier_id: "packaging-pro",
        supplier_name: "Packaging Pro",
        supplier_contact: "Elena Gomez",
        supplier_email: "elena@packagingpro.com",
        supplier_phone: "+63 945 678 9012",
        scheduled_date: "2023-04-25",
        estimated_arrival: "2023-04-25",
        status: "in_transit",
        last_update: "2023-04-23T11:15:00",
        notes: "Shipment in transit, on schedule.",
        items: [
          {
            product_id: "7",
            product_name: "Glass Jars (250ml)",
            quantity: 200,
            unit_price: 15.0,
          },
          {
            product_id: "8",
            product_name: "Plastic Bottles (500ml)",
            quantity: 150,
            unit_price: 8.0,
          },
          {
            product_id: "9",
            product_name: "Cardboard Boxes (Small)",
            quantity: 100,
            unit_price: 12.0,
          },
        ],
        timeline: [
          { status: "scheduled", date: "2023-04-18T14:45:00", note: "Delivery scheduled" },
          { status: "in_transit", date: "2023-04-23T11:15:00", note: "Shipment in transit" },
        ],
      },
      {
        tracking_number: "TRK-003",
        po_number: "PO-003",
        supplier_id: "tropical-fruits",
        supplier_name: "Tropical Fruits Inc.",
        supplier_contact: "Antonio Reyes",
        supplier_email: "antonio@tropicalfruits.com",
        supplier_phone: "+63 934 567 8901",
        scheduled_date: "2023-04-27",
        estimated_arrival: "2023-04-27",
        status: "scheduled",
        last_update: "2023-04-21T14:30:00",
        notes: "Delivery scheduled, awaiting shipment.",
        items: [
          {
            product_id: "10",
            product_name: "Raw Pineapple (kg)",
            quantity: 100,
            unit_price: 45.0,
          },
        ],
        timeline: [{ status: "scheduled", date: "2023-04-21T14:30:00", note: "Delivery scheduled" }],
      },
      {
        tracking_number: "TRK-004",
        po_number: "PO-004",
        supplier_id: "pinana-south",
        supplier_name: "Piñana Gourmet South",
        supplier_contact: "Maria Santos",
        supplier_email: "maria@pinanagourmet.com",
        supplier_phone: "+63 923 456 7890",
        scheduled_date: "2023-04-28",
        estimated_arrival: "2023-04-30",
        status: "delayed",
        last_update: "2023-04-24T09:45:00",
        notes: "Delivery delayed due to transportation issues.",
        items: [
          {
            product_id: "1",
            product_name: "Pineapple Jam",
            quantity: 20,
            unit_price: 90.0,
          },
          {
            product_id: "2",
            product_name: "Pineapple Juice",
            quantity: 30,
            unit_price: 65.0,
          },
          {
            product_id: "5",
            product_name: "Pineapple Syrup",
            quantity: 15,
            unit_price: 140.0,
          },
          {
            product_id: "6",
            product_name: "Pineapple Vinegar",
            quantity: 20,
            unit_price: 75.0,
          },
        ],
        timeline: [
          { status: "scheduled", date: "2023-04-21T16:20:00", note: "Delivery scheduled" },
          { status: "delayed", date: "2023-04-24T09:45:00", note: "Delivery delayed due to transportation issues" },
        ],
      },
      {
        tracking_number: "TRK-005",
        po_number: "PO-002",
        supplier_id: "packaging-pro",
        supplier_name: "Packaging Pro",
        supplier_contact: "Elena Gomez",
        supplier_email: "elena@packagingpro.com",
        supplier_phone: "+63 945 678 9012",
        scheduled_date: "2023-04-23",
        estimated_arrival: "2023-04-23",
        status: "issue",
        last_update: "2023-04-23T15:30:00",
        notes: "Damaged items reported upon delivery.",
        items: [
          {
            product_id: "7",
            product_name: "Glass Jars (250ml)",
            quantity: 50,
            unit_price: 15.0,
          },
        ],
        timeline: [
          { status: "scheduled", date: "2023-04-20T11:05:00", note: "Delivery scheduled" },
          { status: "in_transit", date: "2023-04-22T14:30:00", note: "Shipment in transit" },
          { status: "issue", date: "2023-04-23T15:30:00", note: "Damaged items reported upon delivery" },
        ],
        issue: {
          type: "damaged",
          severity: "medium",
          description: "20% of glass jars were broken upon delivery",
          action: "replace",
        },
      },
    ]

    // Filter deliveries based on current filters
    const filteredDeliveries = mockDeliveries.filter((delivery) => {
      // Status filter
      if (currentFilters.status !== "all" && delivery.status !== currentFilters.status) {
        return false
      }

      // Supplier filter
      if (currentFilters.supplier !== "all" && delivery.supplier_id !== currentFilters.supplier) {
        return false
      }

      // Date range filter
      if (currentFilters.dateRange !== "all") {
        const deliveryDate = new Date(delivery.scheduled_date)
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        if (currentFilters.dateRange === "today") {
          const deliveryDay = new Date(deliveryDate)
          deliveryDay.setHours(0, 0, 0, 0)
          if (deliveryDay.getTime() !== today.getTime()) {
            return false
          }
        } else if (currentFilters.dateRange === "week") {
          const weekAgo = new Date(today)
          weekAgo.setDate(today.getDate() - 7)
          if (deliveryDate < weekAgo) {
            return false
          }
        } else if (currentFilters.dateRange === "month") {
          const monthAgo = new Date(today)
          monthAgo.setDate(today.getDate() - 30)
          if (deliveryDate < monthAgo) {
            return false
          }
        } else if (currentFilters.dateRange === "custom" && currentFilters.startDate && currentFilters.endDate) {
          const startDate = new Date(currentFilters.startDate)
          const endDate = new Date(currentFilters.endDate)
          endDate.setHours(23, 59, 59, 999) // End of day
          if (deliveryDate < startDate || deliveryDate > endDate) {
            return false
          }
        }
      }

      // Search filter
      if (currentFilters.search) {
        const searchTerm = currentFilters.search.toLowerCase()
        return (
          delivery.tracking_number.toLowerCase().includes(searchTerm) ||
          delivery.po_number.toLowerCase().includes(searchTerm) ||
          delivery.supplier_name.toLowerCase().includes(searchTerm)
        )
      }

      return true
    })

    // Update current deliveries
    currentDeliveries = filteredDeliveries

    // Calculate pagination
    totalPages = Math.ceil(currentDeliveries.length / itemsPerPage)
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = Math.min(startIndex + itemsPerPage, currentDeliveries.length)
    const paginatedDeliveries = currentDeliveries.slice(startIndex, endIndex)

    // Update delivery stats
    updateDeliveryStats({
      total_deliveries: mockDeliveries.length,
      in_transit: mockDeliveries.filter((d) => d.status === "in_transit").length,
      completed: mockDeliveries.filter((d) => d.status === "delivered").length,
      issues: mockDeliveries.filter((d) => d.status === "issue").length,
      growth_percentage: 15, // Mock growth percentage
    })

    // Hide loading state
    document.getElementById("loadingState").classList.add("d-none")

    // Check if there are deliveries to display
    if (paginatedDeliveries.length === 0) {
      document.getElementById("emptyState").classList.remove("d-none")
      document.getElementById("deliveryCount").textContent = `Showing 0 of ${currentDeliveries.length} deliveries`
      renderPagination()
      return
    }

    // Render deliveries
    renderDeliveries(paginatedDeliveries)

    // Update pagination
    renderPagination()

    // Update delivery count text
    document.getElementById("deliveryCount").textContent =
      `Showing ${paginatedDeliveries.length} of ${currentDeliveries.length} deliveries`
  }, 1000)
}

// Apply filters
function applyFilters() {
  // Reset to first page
  currentPage = 1

  // Update active filters display
  updateActiveFilters()

  // Load deliveries with filters
  loadDeliveries()
}

// Reset filters
function resetFilters() {
  // Reset search input
  document.getElementById("deliverySearch").value = ""

  // Reset status filter
  document.querySelectorAll(".status-filter").forEach((f) => {
    f.classList.remove("active")
    if (f.getAttribute("data-status") === "all") {
      f.classList.add("active")
    }
  })
  document.getElementById("statusFilter").innerHTML = `<i class="bi bi-funnel me-1"></i> Status: All`

  // Reset supplier filter
  document.querySelectorAll(".supplier-filter").forEach((f) => {
    f.classList.remove("active")
    if (f.getAttribute("data-supplier") === "all") {
      f.classList.add("active")
    }
  })
  document.getElementById("supplierFilter").innerHTML = `<i class="bi bi-building me-1"></i> Supplier: All`

  // Reset date filter
  document.querySelectorAll(".date-filter").forEach((f) => {
    f.classList.remove("active")
    if (f.getAttribute("data-range") === "all") {
      f.classList.add("active")
    }
  })
  document.getElementById("dateFilter").innerHTML = `<i class="bi bi-calendar3 me-1"></i> Date: All Time`

  // Hide date range picker
  document.querySelector(".date-range-picker").classList.add("d-none")

  // Reset filter object
  currentFilters.status = "all"
  currentFilters.supplier = "all"
  currentFilters.dateRange = "all"
  currentFilters.startDate = null
  currentFilters.endDate = null
  currentFilters.search = ""

  // Hide active filters
  document.getElementById("activeFilters").classList.add("d-none")

  // Apply reset filters
  loadDeliveries()
}

// Update active filters display
function updateActiveFilters() {
  const activeFiltersContainer = document.getElementById("activeFilters")
  const activeFilterTags = document.querySelector(".active-filter-tags")

  // Clear existing tags
  activeFilterTags.innerHTML = ""

  // Check if any filters are active
  let hasActiveFilters = false

  // Add search filter tag
  if (currentFilters.search) {
    hasActiveFilters = true
    const searchTag = document.createElement("span")
    searchTag.className = "badge bg-light text-dark me-2"
    searchTag.innerHTML = `Search: ${currentFilters.search} <i class="bi bi-x-circle ms-1" data-filter="search"></i>`
    activeFilterTags.appendChild(searchTag)

    // Add click event to remove this filter
    searchTag.querySelector("i").addEventListener("click", () => {
      document.getElementById("deliverySearch").value = ""
      currentFilters.search = ""
      applyFilters()
    })
  }

  // Add status filter tag
  if (currentFilters.status !== "all") {
    hasActiveFilters = true
    const statusTag = document.createElement("span")
    statusTag.className = "badge bg-light text-dark me-2"
    const statusText = currentFilters.status.charAt(0).toUpperCase() + currentFilters.status.slice(1).replace("_", " ")
    statusTag.innerHTML = `Status: ${statusText} <i class="bi bi-x-circle ms-1" data-filter="status"></i>`
    activeFilterTags.appendChild(statusTag)

    // Add click event to remove this filter
    statusTag.querySelector("i").addEventListener("click", () => {
      document.querySelectorAll(".status-filter").forEach((f) => {
        f.classList.remove("active")
        if (f.getAttribute("data-status") === "all") {
          f.classList.add("active")
        }
      })
      document.getElementById("statusFilter").innerHTML = `<i class="bi bi-funnel me-1"></i> Status: All`
      currentFilters.status = "all"
      applyFilters()
    })
  }

  // Add supplier filter tag
  if (currentFilters.supplier !== "all") {
    hasActiveFilters = true
    const supplierName = document.querySelector(
      `.supplier-filter[data-supplier="${currentFilters.supplier}"]`,
    ).textContent
    const supplierTag = document.createElement("span")
    supplierTag.className = "badge bg-light text-dark me-2"
    supplierTag.innerHTML = `Supplier: ${supplierName} <i class="bi bi-x-circle ms-1" data-filter="supplier"></i>`
    activeFilterTags.appendChild(supplierTag)

    // Add click event to remove this filter
    supplierTag.querySelector("i").addEventListener("click", () => {
      document.querySelectorAll(".supplier-filter").forEach((f) => {
        f.classList.remove("active")
        if (f.getAttribute("data-supplier") === "all") {
          f.classList.add("active")
        }
      })
      document.getElementById("supplierFilter").innerHTML = `<i class="bi bi-building me-1"></i> Supplier: All`
      currentFilters.supplier = "all"
      applyFilters()
    })
  }

  // Add date filter tag
  if (currentFilters.dateRange !== "all") {
    hasActiveFilters = true
    let dateText = ""
    if (currentFilters.dateRange === "today") dateText = "Today"
    if (currentFilters.dateRange === "week") dateText = "Last 7 Days"
    if (currentFilters.dateRange === "month") dateText = "Last 30 Days"
    if (currentFilters.dateRange === "custom") {
      dateText = `${currentFilters.startDate} to ${currentFilters.endDate}`
    }

    const dateTag = document.createElement("span")
    dateTag.className = "badge bg-light text-dark me-2"
    dateTag.innerHTML = `Date: ${dateText} <i class="bi bi-x-circle ms-1" data-filter="date"></i>`
    activeFilterTags.appendChild(dateTag)

    // Add click event to remove this filter
    dateTag.querySelector("i").addEventListener("click", () => {
      document.querySelectorAll(".date-filter").forEach((f) => {
        f.classList.remove("active")
        if (f.getAttribute("data-range") === "all") {
          f.classList.add("active")
        }
      })
      document.getElementById("dateFilter").innerHTML = `<i class="bi bi-calendar3 me-1"></i> Date: All Time`
      document.querySelector(".date-range-picker").classList.add("d-none")
      currentFilters.dateRange = "all"
      currentFilters.startDate = null
      currentFilters.endDate = null
      applyFilters()
    })
  }

  // Show or hide active filters container
  if (hasActiveFilters) {
    activeFiltersContainer.classList.remove("d-none")
  } else {
    activeFiltersContainer.classList.add("d-none")
  }
}

// Update delivery statistics
function updateDeliveryStats(stats) {
  if (!stats) return

  if (document.getElementById("totalDeliveriesCount")) {
    document.getElementById("totalDeliveriesCount").textContent = stats.total_deliveries || 0
  }

  if (document.getElementById("inTransitCount")) {
    document.getElementById("inTransitCount").textContent = stats.in_transit || 0
    const inTransitPercentage = stats.total_deliveries
      ? Math.round((stats.in_transit / stats.total_deliveries) * 100)
      : 0
    document.getElementById("inTransitPercentage").textContent = `${inTransitPercentage}%`
  }

  if (document.getElementById("completedCount")) {
    document.getElementById("completedCount").textContent = stats.completed || 0
    const completedPercentage = stats.total_deliveries
      ? Math.round((stats.completed / stats.total_deliveries) * 100)
      : 0
    document.getElementById("completedPercentage").textContent = `${completedPercentage}%`
  }

  if (document.getElementById("issuesCount")) {
    document.getElementById("issuesCount").textContent = stats.issues || 0
    const issuesPercentage = stats.total_deliveries ? Math.round((stats.issues / stats.total_deliveries) * 100) : 0
    document.getElementById("issuesPercentage").textContent = `${issuesPercentage}%`
  }

  // Growth percentage
  if (document.getElementById("totalDeliveriesGrowth")) {
    const growthElement = document.getElementById("totalDeliveriesGrowth")
    const growth = Number.parseFloat(stats.growth_percentage) || 0

    if (growth > 0) {
      growthElement.textContent = `+${growth}%`
      growthElement.parentElement.className = "text-success small"
      growthElement.parentElement.innerHTML = `<i class="bi bi-graph-up"></i> <span>+${growth}%</span>`
    } else if (growth < 0) {
      growthElement.textContent = `  <span>+${growth}%</span>`
    } else if (growth < 0) {
      growthElement.textContent = `${growth}%`
      growthElement.parentElement.className = "text-danger small"
      growthElement.parentElement.innerHTML = `<i class="bi bi-graph-down"></i> <span>${growth}%</span>`
    } else {
      growthElement.textContent = `0%`
      growthElement.parentElement.className = "text-muted small"
      growthElement.parentElement.innerHTML = `<i class="bi bi-dash"></i> <span>0%</span>`
    }
  }
}

// Render deliveries in the table
function renderDeliveries(deliveries) {
  const tableBody = document.getElementById("deliveries-table-body")

  if (!deliveries || deliveries.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="7" class="text-center py-5">
          <i class="bi bi-inbox fs-1 text-muted mb-3"></i>
          <p class="text-muted">No deliveries found</p>
        </td>
      </tr>
    `
    return
  }

  let html = ""

  deliveries.forEach((delivery) => {
    // Format date
    const scheduledDate = new Date(delivery.scheduled_date)
    const formattedDate = scheduledDate.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })

    // Format last update
    const lastUpdate = new Date(delivery.last_update)
    const formattedLastUpdate = lastUpdate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })

    // Status badge class
    let statusClass = ""
    switch (delivery.status) {
      case "scheduled":
        statusClass = "bg-secondary"
        break
      case "in_transit":
        statusClass = "bg-primary"
        break
      case "delivered":
        statusClass = "bg-success"
        break
      case "delayed":
        statusClass = "bg-warning text-dark"
        break
      case "issue":
        statusClass = "bg-danger"
        break
      default:
        statusClass = "bg-secondary"
    }

    // Format status text
    const statusText = delivery.status.charAt(0).toUpperCase() + delivery.status.slice(1).replace("_", " ")

    html += `
      <tr>
        <td>
          <span class="fw-medium">${delivery.tracking_number}</span>
        </td>
        <td>
          <span class="fw-medium">${delivery.po_number}</span>
        </td>
        <td>
          <div class="fw-medium">${delivery.supplier_name}</div>
          <div class="small text-muted">${delivery.supplier_contact || "No contact"}</div>
        </td>
        <td>
          <div>${formattedDate}</div>
          <div class="small text-muted">Est. Arrival: ${new Date(delivery.estimated_arrival).toLocaleDateString(
            "en-US",
            {
              month: "short",
              day: "numeric",
            },
          )}</div>
        </td>
        <td>
          <span class="badge ${statusClass}">${statusText}</span>
        </td>
        <td>
          <div>${formattedLastUpdate}</div>
        </td>
        <td>
          <div class="btn-group">
            <button type="button" class="btn btn-sm btn-outline-primary view-delivery-btn" data-id="${delivery.tracking_number}">
              <i class="bi bi-eye"></i>
            </button>
            ${
              delivery.status === "in_transit"
                ? `
            <button type="button" class="btn btn-sm btn-outline-success receive-delivery-btn" data-id="${delivery.tracking_number}">
              <i class="bi bi-box-seam"></i>
            </button>
            `
                : ""
            }
            ${
              delivery.status !== "issue" && delivery.status !== "delivered"
                ? `
            <button type="button" class="btn btn-sm btn-outline-warning report-issue-btn" data-id="${delivery.tracking_number}">
              <i class="bi bi-exclamation-triangle"></i>
            </button>
            `
                : ""
            }
          </div>
        </td>
      </tr>
    `
  })

  tableBody.innerHTML = html

  // Add event listeners to action buttons
  document.querySelectorAll(".view-delivery-btn").forEach((btn) => {
    btn.addEventListener("click", function () {
      const trackingNumber = this.getAttribute("data-id")
      viewDelivery(trackingNumber)
    })
  })

  document.querySelectorAll(".receive-delivery-btn").forEach((btn) => {
    btn.addEventListener("click", function () {
      const trackingNumber = this.getAttribute("data-id")
      showReceiveDeliveryModal(trackingNumber)
    })
  })

  document.querySelectorAll(".report-issue-btn").forEach((btn) => {
    btn.addEventListener("click", function () {
      const trackingNumber = this.getAttribute("data-id")
      showReportIssueModal(trackingNumber)
    })
  })
}

// Render pagination
function renderPagination() {
  const pagination = document.getElementById("deliveriesPagination")
  if (!pagination) return

  pagination.innerHTML = ""

  if (totalPages <= 1) {
    return
  }

  // Previous button
  const prevLi = document.createElement("li")
  prevLi.className = `page-item ${currentPage === 1 ? "disabled" : ""}`
  prevLi.innerHTML = `<a class="page-link" href="#" aria-label="Previous"><span aria-hidden="true">&laquo;</span></a>`
  pagination.appendChild(prevLi)

  if (currentPage > 1) {
    prevLi.addEventListener("click", (e) => {
      e.preventDefault()
      currentPage--
      loadDeliveries()
    })
  }

  // Page numbers
  const maxPages = 5 // Maximum number of page links to show
  let startPage = Math.max(1, currentPage - Math.floor(maxPages / 2))
  const endPage = Math.min(totalPages, startPage + maxPages - 1)

  if (endPage - startPage + 1 < maxPages) {
    startPage = Math.max(1, endPage - maxPages + 1)
  }

  for (let i = startPage; i <= endPage; i++) {
    const pageLi = document.createElement("li")
    pageLi.className = `page-item ${i === currentPage ? "active" : ""}`
    pageLi.innerHTML = `<a class="page-link" href="#">${i}</a>`

    pageLi.addEventListener("click", (e) => {
      e.preventDefault()
      currentPage = i
      loadDeliveries()
    })

    pagination.appendChild(pageLi)
  }

  // Next button
  const nextLi = document.createElement("li")
  nextLi.className = `page-item ${currentPage === totalPages ? "disabled" : ""}`
  nextLi.innerHTML = `<a class="page-link" href="#" aria-label="Next"><span aria-hidden="true">&raquo;</span></a>`
  pagination.appendChild(nextLi)

  if (currentPage < totalPages) {
    nextLi.addEventListener("click", (e) => {
      e.preventDefault()
      currentPage++
      loadDeliveries()
    })
  }
}

// View delivery details
function viewDelivery(trackingNumber) {
  // Find delivery
  const delivery = currentDeliveries.find((d) => d.tracking_number === trackingNumber)

  if (!delivery) {
    showAlert("danger", "Delivery not found")
    return
  }

  // Populate view modal
  document.getElementById("viewTrackingNumber").textContent = delivery.tracking_number
  document.getElementById("viewPONumber").textContent = delivery.po_number
  document.getElementById("viewScheduledDate").textContent = new Date(delivery.scheduled_date).toLocaleDateString(
    "en-US",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    },
  )
  document.getElementById("viewEstimatedArrival").textContent = new Date(delivery.estimated_arrival).toLocaleDateString(
    "en-US",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    },
  )

  // Status with badge
  let statusClass = ""
  switch (delivery.status) {
    case "scheduled":
      statusClass = "bg-secondary"
      break
    case "in_transit":
      statusClass = "bg-primary"
      break
    case "delivered":
      statusClass = "bg-success"
      break
    case "delayed":
      statusClass = "bg-warning text-dark"
      break
    case "issue":
      statusClass = "bg-danger"
      break
    default:
      statusClass = "bg-secondary"
  }

  const statusText = delivery.status.charAt(0).toUpperCase() + delivery.status.slice(1).replace("_", " ")
  document.getElementById("viewDeliveryStatus").innerHTML = `<span class="badge ${statusClass}">${statusText}</span>`

  // Supplier info
  document.getElementById("viewSupplierName").textContent = delivery.supplier_name
  document.getElementById("viewSupplierContact").textContent = delivery.supplier_contact || "N/A"
  document.getElementById("viewSupplierEmail").textContent = delivery.supplier_email || "N/A"
  document.getElementById("viewSupplierPhone").textContent = delivery.supplier_phone || "N/A"

  // Delivery items
  const itemsContainer = document.getElementById("viewDeliveryItems")
  itemsContainer.innerHTML = ""

  if (delivery.items && delivery.items.length > 0) {
    delivery.items.forEach((item) => {
      const row = document.createElement("tr")
      const itemTotal = Number.parseFloat(item.unit_price) * Number.parseInt(item.quantity)

      row.innerHTML = `
        <td>${item.product_name}</td>
        <td>${item.quantity}</td>
        <td>₱${Number.parseFloat(item.unit_price).toFixed(2)}</td>
        <td class="text-end">₱${itemTotal.toFixed(2)}</td>
      `

      itemsContainer.appendChild(row)
    })
  } else {
    itemsContainer.innerHTML = `
      <tr>
        <td colspan="4" class="text-center">No items found</td>
      </tr>
    `
  }

  // Notes
  document.getElementById("viewDeliveryNotes").textContent = delivery.notes || "No notes available."

  // Delivery timeline
  renderDeliveryTimeline(delivery)

  // Show/hide action buttons based on status
  const receiveDeliveryBtn = document.getElementById("receiveDeliveryBtn")
  const reportIssueBtn = document.getElementById("reportIssueBtn")

  if (delivery.status === "in_transit") {
    receiveDeliveryBtn.classList.remove("d-none")
    receiveDeliveryBtn.addEventListener("click", () => {
      // Close current modal
      try {
        if (typeof bootstrap !== "undefined") {
          const viewModal = bootstrap.Modal.getInstance(document.getElementById("viewDeliveryModal"))
          if (viewModal) {
            viewModal.hide()
          }
        }
      } catch (error) {
        console.error("Error hiding modal:", error)
      }

      // Show receive modal
      showReceiveDeliveryModal(trackingNumber)
    })
  } else {
    receiveDeliveryBtn.classList.add("d-none")
  }

  if (delivery.status !== "issue" && delivery.status !== "delivered") {
    reportIssueBtn.classList.remove("d-none")
    reportIssueBtn.addEventListener("click", () => {
      // Close current modal
      try {
        if (typeof bootstrap !== "undefined") {
          const viewModal = bootstrap.Modal.getInstance(document.getElementById("viewDeliveryModal"))
          if (viewModal) {
            viewModal.hide()
          }
        }
      } catch (error) {
        console.error("Error hiding modal:", error)
      }

      // Show report issue modal
      showReportIssueModal(trackingNumber)
    })
  } else {
    reportIssueBtn.classList.add("d-none")
  }

  // Show modal
  try {
    if (typeof bootstrap !== "undefined") {
      const viewDeliveryModal = new bootstrap.Modal(document.getElementById("viewDeliveryModal"))
      viewDeliveryModal.show()
    } else {
      console.warn("Bootstrap is not defined. Modal may not work properly.")
    }
  } catch (error) {
    console.error("Error showing modal:", error)
  }
}

// Render delivery timeline
function renderDeliveryTimeline(delivery) {
  const timelineContainer = document.getElementById("deliveryTimeline")
  if (!timelineContainer) return

  timelineContainer.innerHTML = ""

  // Create timeline based on status updates
  if (delivery.timeline && delivery.timeline.length > 0) {
    // Sort timeline by date
    const sortedTimeline = [...delivery.timeline].sort((a, b) => new Date(b.date) - new Date(a.date))

    sortedTimeline.forEach((update, index) => {
      const timelineItem = document.createElement("div")

      // Determine if this status is active
      let itemClass = "timeline-item"
      let iconClass = "bi bi-circle"

      if (index === 0) {
        itemClass += " active"
        iconClass = "bi bi-circle-fill"
      } else {
        itemClass += " completed"
        iconClass = "bi bi-check-circle"
      }

      // Format status text
      const statusText = update.status.charAt(0).toUpperCase() + update.status.slice(1).replace("_", " ")

      timelineItem.className = itemClass
      timelineItem.innerHTML = `
        <div class="timeline-icon">
          <i class="${iconClass}"></i>
        </div>
        <div class="timeline-content">
          <div class="fw-medium">${statusText}</div>
          <div class="small text-muted">
            ${new Date(update.date).toLocaleString()}
          </div>
          ${update.note ? `<div class="small">${update.note}</div>` : ""}
        </div>
      `

      timelineContainer.appendChild(timelineItem)
    })
  } else {
    timelineContainer.innerHTML = `<p class="text-muted">No timeline information available.</p>`
  }
}

// Show receive delivery modal
function showReceiveDeliveryModal(trackingNumber) {
  // Find delivery
  const delivery = currentDeliveries.find((d) => d.tracking_number === trackingNumber)

  if (!delivery) {
    showAlert("danger", "Delivery not found")
    return
  }

  // Set delivery info in modal
  document.getElementById("receiveTrackingNumber").textContent = delivery.tracking_number
  document.getElementById("receivePONumber").textContent = delivery.po_number
  document.getElementById("receiveSupplierName").textContent = delivery.supplier_name
  document.getElementById("receiveScheduledDate").textContent = new Date(delivery.scheduled_date).toLocaleDateString(
    "en-US",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    },
  )

  // Set current date for receive date
  try {
    if (typeof flatpickr !== "undefined") {
      flatpickr("#receiveDate", {
        enableTime: false,
        dateFormat: "Y-m-d",
        defaultDate: new Date(),
        clickOpens: false,
      })
    }
  } catch (error) {
    console.error("Error setting receive date:", error)
    document.getElementById("receiveDate").value = new Date().toISOString().split("T")[0]
  }

  // Populate items table
  const itemsContainer = document.getElementById("receiveDeliveryItems")
  itemsContainer.innerHTML = ""

  if (delivery.items && delivery.items.length > 0) {
    delivery.items.forEach((item) => {
      const row = document.createElement("tr")
      row.innerHTML = `
        <td>${item.product_name}</td>
        <td>${item.quantity}</td>
        <td>
          <input type="number" class="form-control received-quantity" 
                 data-product-id="${item.product_id}" 
                 value="${item.quantity}" min="0" max="${item.quantity}">
        </td>
        <td>
          <select class="form-select item-condition" data-product-id="${item.product_id}">
            <option value="good">Good</option>
            <option value="damaged">Damaged</option>
            <option value="missing">Missing</option>
          </select>
        </td>
        <td>
          <input type="text" class="form-control item-notes" 
                 data-product-id="${item.product_id}" 
                 placeholder="Any issues?">
        </td>
      `
      itemsContainer.appendChild(row)
    })
  }

  // Reset confirm checkbox
  document.getElementById("confirmReceiptCheck").checked = false
  document.getElementById("confirmReceiveBtn").disabled = true

  // Show modal
  try {
    if (typeof bootstrap !== "undefined") {
      const receiveDeliveryModal = new bootstrap.Modal(document.getElementById("receiveDeliveryModal"))
      receiveDeliveryModal.show()
    } else {
      console.warn("Bootstrap is not defined. Modal may not work properly.")
    }
  } catch (error) {
    console.error("Error showing modal:", error)
  }
}

// Receive delivery
function receiveDelivery() {
  const trackingNumber = document.getElementById("receiveTrackingNumber").textContent
  const receiveNotes = document.getElementById("receiveNotes").value
  const receiveDate = document.getElementById("receiveDate").value

  // Find delivery
  const deliveryIndex = currentDeliveries.findIndex((d) => d.tracking_number === trackingNumber)

  if (deliveryIndex === -1) {
    showAlert("danger", "Delivery not found")
    return
  }

  // Get received items data
  const receivedItems = []
  document.querySelectorAll("#receiveDeliveryItems tr").forEach((row) => {
    const productId = row.querySelector(".received-quantity").getAttribute("data-product-id")
    const receivedQuantity = Number.parseInt(row.querySelector(".received-quantity").value)
    const condition = row.querySelector(".item-condition").value
    const notes = row.querySelector(".item-notes").value

    receivedItems.push({
      product_id: productId,
      received_quantity: receivedQuantity,
      condition: condition,
      notes: notes,
    })
  })

  // Update delivery status
  currentDeliveries[deliveryIndex].status = "delivered"
  currentDeliveries[deliveryIndex].received_date = receiveDate
  currentDeliveries[deliveryIndex].received_notes = receiveNotes
  currentDeliveries[deliveryIndex].received_items = receivedItems

  // Add to timeline
  if (!currentDeliveries[deliveryIndex].timeline) {
    currentDeliveries[deliveryIndex].timeline = []
  }

  currentDeliveries[deliveryIndex].timeline.push({
    status: "delivered",
    date: new Date().toISOString(),
    note: "Delivery received" + (receiveNotes ? `: ${receiveNotes}` : ""),
  })

  currentDeliveries[deliveryIndex].last_update = new Date().toISOString()

  // Close modal
  try {
    if (typeof bootstrap !== "undefined") {
      const receiveDeliveryModal = bootstrap.Modal.getInstance(document.getElementById("receiveDeliveryModal"))
      if (receiveDeliveryModal) {
        receiveDeliveryModal.hide()
      }
    }
  } catch (error) {
    console.error("Error hiding modal:", error)
  }

  // Show success message
  showAlert("success", "Delivery received successfully")

  // Reload deliveries
  loadDeliveries()

  // Reload upcoming deliveries and recent updates
  loadUpcomingDeliveries()
  loadRecentUpdates()
}

// Show report issue modal
function showReportIssueModal(trackingNumber) {
  // Find delivery
  const delivery = currentDeliveries.find((d) => d.tracking_number === trackingNumber)

  if (!delivery) {
    showAlert("danger", "Delivery not found")
    return
  }

  // Set delivery info in modal
  document.getElementById("issueTrackingNumber").textContent = delivery.tracking_number
  document.getElementById("issueSupplierName").textContent = delivery.supplier_name

  // Reset form
  document.getElementById("issueType").value = ""
  document.getElementById("issueSeverity").value = "medium"
  document.getElementById("issueDescription").value = ""
  document.getElementById("issueAction").value = ""

  // Show modal
  try {
    if (typeof bootstrap !== "undefined") {
      const reportIssueModal = new bootstrap.Modal(document.getElementById("reportIssueModal"))
      reportIssueModal.show()
    } else {
      console.warn("Bootstrap is not defined. Modal may not work properly.")
    }
  } catch (error) {
    console.error("Error showing modal:", error)
  }
}

// Submit issue
function submitIssue() {
  const trackingNumber = document.getElementById("issueTrackingNumber").textContent
  const issueType = document.getElementById("issueType").value
  const issueSeverity = document.getElementById("issueSeverity").value
  const issueDescription = document.getElementById("issueDescription").value
  const issueAction = document.getElementById("issueAction").value

  // Validate form
  if (!issueType || !issueDescription || !issueAction) {
    showAlert("warning", "Please fill in all required fields")
    return
  }

  // Find delivery
  const deliveryIndex = currentDeliveries.findIndex((d) => d.tracking_number === trackingNumber)

  if (deliveryIndex === -1) {
    showAlert("danger", "Delivery not found")
    return
  }

  // Update delivery status
  currentDeliveries[deliveryIndex].status = "issue"
  currentDeliveries[deliveryIndex].issue = {
    type: issueType,
    severity: issueSeverity,
    description: issueDescription,
    action: issueAction,
    reported_date: new Date().toISOString(),
  }

  // Add to timeline
  if (!currentDeliveries[deliveryIndex].timeline) {
    currentDeliveries[deliveryIndex].timeline = []
  }

  currentDeliveries[deliveryIndex].timeline.push({
    status: "issue",
    date: new Date().toISOString(),
    note: `Issue reported: ${issueDescription}`,
  })

  currentDeliveries[deliveryIndex].last_update = new Date().toISOString()

  // Close modal
  try {
    if (typeof bootstrap !== "undefined") {
      const reportIssueModal = bootstrap.Modal.getInstance(document.getElementById("reportIssueModal"))
      if (reportIssueModal) {
        reportIssueModal.hide()
      }
    }
  } catch (error) {
    console.error("Error hiding modal:", error)
  }

  // Show success message
  showAlert("success", "Issue reported successfully")

  // Reload deliveries
  loadDeliveries()

  // Reload upcoming deliveries and recent updates
  loadUpcomingDeliveries()
  loadRecentUpdates()
}

// Load upcoming deliveries
function loadUpcomingDeliveries() {
  const upcomingContainer = document.getElementById("upcoming-deliveries")

  // Filter deliveries that are scheduled or in transit
  const upcomingDeliveries = currentDeliveries.filter(
    (d) => d.status === "scheduled" || d.status === "in_transit" || d.status === "delayed",
  )

  // Sort by scheduled date
  upcomingDeliveries.sort((a, b) => new Date(a.scheduled_date) - new Date(b.scheduled_date))

  // Take only the first 5
  const limitedUpcoming = upcomingDeliveries.slice(0, 5)

  if (limitedUpcoming.length === 0) {
    upcomingContainer.innerHTML = `
      <tr>
        <td colspan="6" class="text-center py-3">
          <p class="text-muted mb-0">No upcoming deliveries</p>
        </td>
      </tr>
    `
    return
  }

  let html = ""

  limitedUpcoming.forEach((delivery) => {
    // Format date
    const scheduledDate = new Date(delivery.scheduled_date)
    const formattedDate = scheduledDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    })

    // Status badge class
    let statusClass = ""
    switch (delivery.status) {
      case "scheduled":
        statusClass = "bg-secondary"
        break
      case "in_transit":
        statusClass = "bg-primary"
        break
      case "delayed":
        statusClass = "bg-warning text-dark"
        break
      default:
        statusClass = "bg-secondary"
    }

    // Format status text
    const statusText = delivery.status.charAt(0).toUpperCase() + delivery.status.slice(1).replace("_", " ")

    html += `
      <tr>
        <td>${delivery.tracking_number}</td>
        <td>${delivery.supplier_name}</td>
        <td>${formattedDate}</td>
        <td>${delivery.items.length} item${delivery.items.length !== 1 ? "s" : ""}</td>
        <td><span class="badge ${statusClass}">${statusText}</span></td>
        <td>
          <button type="button" class="btn btn-sm btn-outline-primary view-delivery-btn" data-id="${delivery.tracking_number}">
            <i class="bi bi-eye"></i> View
          </button>
        </td>
      </tr>
    `
  })

  upcomingContainer.innerHTML = html

  // Add event listeners
  document.querySelectorAll("#upcoming-deliveries .view-delivery-btn").forEach((btn) => {
    btn.addEventListener("click", function () {
      const trackingNumber = this.getAttribute("data-id")
      viewDelivery(trackingNumber)
    })
  })
}

// Load recent updates
function loadRecentUpdates() {
  const updatesContainer = document.getElementById("recent-updates")

  // Create a list of all timeline events from all deliveries
  const allUpdates = []

  currentDeliveries.forEach((delivery) => {
    if (delivery.timeline && delivery.timeline.length > 0) {
      delivery.timeline.forEach((update) => {
        allUpdates.push({
          tracking_number: delivery.tracking_number,
          supplier_name: delivery.supplier_name,
          status: update.status,
          date: update.date,
          note: update.note,
        })
      })
    }
  })

  // Sort by date (newest first)
  allUpdates.sort((a, b) => new Date(b.date) - new Date(a.date))

  // Take only the first 5
  const limitedUpdates = allUpdates.slice(0, 5)

  if (limitedUpdates.length === 0) {
    updatesContainer.innerHTML = `
      <div class="list-group-item text-center py-3">
        <p class="text-muted mb-0">No recent updates</p>
      </div>
    `
    return
  }

  let html = ""

  limitedUpdates.forEach((update) => {
    // Format date
    const updateDate = new Date(update.date)
    const formattedDate = updateDate.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })

    // Status badge class
    let statusClass = ""
    switch (update.status) {
      case "scheduled":
        statusClass = "bg-secondary"
        break
      case "in_transit":
        statusClass = "bg-primary"
        break
      case "delivered":
        statusClass = "bg-success"
        break
      case "delayed":
        statusClass = "bg-warning text-dark"
        break
      case "issue":
        statusClass = "bg-danger"
        break
      default:
        statusClass = "bg-secondary"
    }

    // Format status text
    const statusText = update.status.charAt(0).toUpperCase() + update.status.slice(1).replace("_", " ")

    html += `
      <a href="#" class="list-group-item list-group-item-action view-delivery-link" data-id="${update.tracking_number}">
        <div class="d-flex w-100 justify-content-between">
          <h6 class="mb-1">
            <span class="badge ${statusClass} me-2">${statusText}</span>
            ${update.tracking_number} - ${update.supplier_name}
          </h6>
          <small class="text-muted">${formattedDate}</small>
        </div>
        <p class="mb-1">${update.note || `Status updated to ${statusText}`}</p>
      </a>
    `
  })

  updatesContainer.innerHTML = html

  // Add event listeners
  document.querySelectorAll(".view-delivery-link").forEach((link) => {
    link.addEventListener("click", function (e) {
      e.preventDefault()
      const trackingNumber = this.getAttribute("data-id")
      viewDelivery(trackingNumber)
    })
  })
}

// Show alert message
function showAlert(type, message) {
  // Create alert element
  const alertDiv = document.createElement("div")
  alertDiv.className = `alert alert-${type} alert-dismissible fade show position-fixed top-0 end-0 m-3`
  alertDiv.setAttribute("role", "alert")
  alertDiv.style.zIndex = "9999"
  alertDiv.style.maxWidth = "350px"
  alertDiv.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.15)"

  // Alert content
  alertDiv.innerHTML = `
    <div class="d-flex align-items-center">
      <i class="bi ${getAlertIcon(type)} me-2"></i>
      <div>${message}</div>
    </div>
    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
  `

  // Add to document
  document.body.appendChild(alertDiv)

  // Auto-dismiss after 3 seconds
  setTimeout(() => {
    try {
      if (typeof bootstrap !== "undefined") {
        const bsAlert = new bootstrap.Alert(alertDiv)
        bsAlert.close()
      } else {
        alertDiv.remove()
      }
    } catch (error) {
      console.error("Error closing alert:", error)
      alertDiv.remove()
    }
  }, 3000)
}

// Get alert icon based on type
function getAlertIcon(type) {
  switch (type) {
    case "success":
      return "bi-check-circle-fill text-success"
    case "danger":
      return "bi-exclamation-circle-fill text-danger"
    case "warning":
      return "bi-exclamation-triangle-fill text-warning"
    case "info":
      return "bi-info-circle-fill text-info"
    default:
      return "bi-bell-fill"
  }
}
