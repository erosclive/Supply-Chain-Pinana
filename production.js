// Complete Production Management JavaScript - Enhanced with Working Status Updates and Quality Check

// --- Enhanced photo handling for production management ---
document.addEventListener("DOMContentLoaded", () => {
  // Photo preview functionality for new production modal
  const productPhotoInput = document.getElementById("new-product-photo")
  if (productPhotoInput) {
    productPhotoInput.addEventListener("change", handlePhotoPreview)
  }

  // Photo preview functionality for completion modal
  const completionPhotoInput = document.getElementById("completion-product-photo")
  if (completionPhotoInput) {
    completionPhotoInput.addEventListener("change", handleCompletionPhotoPreview)
  }
});

function handlePhotoPreview(event) {
  const file = event.target.files[0]
  let previewContainer = document.getElementById("photo-preview-container")

  if (!previewContainer) {
    // Create preview container if it doesn't exist
    const container = document.createElement("div")
    container.id = "photo-preview-container"
    container.className = "mt-3"
    event.target.parentNode.appendChild(container)
    previewContainer = container
  }

  if (file) {
    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"]
    if (!allowedTypes.includes(file.type)) {
      showPhotoError("Invalid file type. Please select a JPG, PNG, GIF, or WebP image.")
      return
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      showPhotoError("File size too large. Maximum size is 5MB.")
      return
    }

    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      previewContainer.innerHTML = `
        <div class="card" style="max-width: 300px;">
          <img src="${e.target.result}" class="card-img-top" alt="Product Photo Preview" style="height: 200px; object-fit: cover;">
          <div class="card-body">
            <small class="text-muted">Preview: ${file.name}</small>
            <button type="button" class="btn btn-sm btn-outline-danger float-end" onclick="clearPhotoPreview()">
              <i class="bi bi-trash"></i> Remove
            </button>
          </div>
        </div>
      `
    }
    reader.readAsDataURL(file)
  } else {
    clearPhotoPreview()
  }
}

function handleCompletionPhotoPreview(event) {
  const file = event.target.files[0]
  let previewContainer = document.getElementById("completion-photo-preview-container")

  if (!previewContainer) {
    // Create preview container if it doesn't exist
    const container = document.createElement("div")
    container.id = "completion-photo-preview-container"
    container.className = "mt-3"
    event.target.parentNode.appendChild(container)
    previewContainer = container
  }

  if (file) {
    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"]
    if (!allowedTypes.includes(file.type)) {
      showPhotoError("Invalid file type. Please select a JPG, PNG, GIF, or WebP image.", "completion")
      return
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      showPhotoError("File size too large. Maximum size is 5MB.", "completion")
      return
    }

    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      previewContainer.innerHTML = `
        <div class="card" style="max-width: 300px;">
          <img src="${e.target.result}" class="card-img-top" alt="Product Photo Preview" style="height: 200px; object-fit: cover;">
          <div class="card-body">
            <small class="text-muted">Updated Preview: ${file.name}</small>
            <button type="button" class="btn btn-sm btn-outline-danger float-end" onclick="clearCompletionPhotoPreview()">
              <i class="bi bi-trash"></i> Remove
            </button>
          </div>
        </div>
      `
    }
    reader.readAsDataURL(file)
  } else {
    clearCompletionPhotoPreview()
  }
}

function clearPhotoPreview() {
  const preview = document.getElementById("photo-preview-container")
  const input = document.getElementById("new-product-photo")

  if (preview) preview.innerHTML = ""
  if (input) input.value = ""
}

function clearCompletionPhotoPreview() {
  const preview = document.getElementById("completion-photo-preview-container")
  const input = document.getElementById("completion-product-photo")

  if (preview) preview.innerHTML = ""
  if (input) input.value = ""
}

function showPhotoError(message, type = "new") {
  const alertClass = "alert alert-danger alert-dismissible fade show mt-2"
  const alertHtml = `
    <div class="${alertClass}" role="alert">
      <i class="bi bi-exclamation-triangle me-2"></i>
      <strong>Photo Error:</strong> ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    </div>
  `

  const targetInput =
    type === "completion"
      ? document.getElementById("completion-product-photo")
      : document.getElementById("new-product-photo")

  if (targetInput) {
    const alertContainer = document.createElement("div")
    alertContainer.innerHTML = alertHtml
    targetInput.parentNode.appendChild(alertContainer.firstElementChild)

    // Clear the input
    targetInput.value = ""

    // Auto-remove alert after 5 seconds
    setTimeout(() => {
      const alert = targetInput.parentNode.querySelector(".alert")
      if (alert) alert.remove()
    }, 5000)
  }
}

// Enhanced form submission to include photo data
function enhanceFormSubmission() {
  // Override the existing startProduction function to handle photos
  const originalStartProduction = window.startProduction

  window.startProduction = function () {
    const formData = new FormData()

    // Add photo file if selected
    const photoInput = document.getElementById("new-product-photo")
    if (photoInput && photoInput.files[0]) {
      formData.append("product_photo", photoInput.files[0])
    }

    // Add all other form data
    const form = document.getElementById("new-product-production-form")
    if (form) {
      const formElements = new FormData(form)
      for (const [key, value] of formElements.entries()) {
        formData.append(key, value)
      }
    }

    // Call original function with enhanced form data
    if (originalStartProduction) {
      originalStartProduction.call(this, formData)
    }
  }

  // Override the existing submitProductionCompletion function to handle photos
  const originalSubmitCompletion = window.submitProductionCompletion

  window.submitProductionCompletion = function () {
    const formData = new FormData()

    // Add photo file if selected
    const photoInput = document.getElementById("completion-product-photo")
    if (photoInput && photoInput.files[0]) {
      formData.append("product_photo", photoInput.files[0])
    }

    // Add all other form data
    const form = document.getElementById("completeProductionForm")
    if (form) {
      const formElements = new FormData(form)
      for (const [key, value] of formElements.entries()) {
        formData.append(key, value)
      }
    }

    // Call original function with enhanced form data
    if (originalSubmitCompletion) {
      originalSubmitCompletion.call(this, formData)
    }
  }
}

// Initialize enhanced form handling when DOM is ready
document.addEventListener("DOMContentLoaded", enhanceFormSubmission)

// Utility function to display product photos in production cards
function displayProductPhoto(photoPath, containerId) {
  const container = document.getElementById(containerId)
  if (!container || !photoPath) return

  const img = document.createElement("img")
  img.src = photoPath
  img.alt = "Product Photo"
  img.className = "img-fluid rounded"
  img.style.maxHeight = "150px"
  img.style.objectFit = "cover"

  container.innerHTML = ""
  container.appendChild(img)
}

// Function to show existing photo from production in completion modal
function showExistingProductPhoto(productionId) {
  fetch(`get_production_photo.php?id=${productionId}`)
    .then((response) => response.json())
    .then((data) => {
      if (data.success && data.photo_path) {
        const existingPhotoContainer = document.getElementById("existing-photo-container")
        if (existingPhotoContainer) {
          existingPhotoContainer.innerHTML = `
            <div class="card mb-3" style="max-width: 300px;">
              <img src="${data.photo_path}" class="card-img-top" alt="Current Product Photo" style="height: 200px; object-fit: cover;">
              <div class="card-body">
                <small class="text-muted">Current Photo</small>
              </div>
            </div>
          `
        }
      }
    })
    .catch((error) => {
      console.error("Error loading existing photo:", error)
    })
}

// ...existing code...
document.addEventListener("DOMContentLoaded", () => {
  // Initialize variables
  let allProductions = []
  let allCompletedProductions = [] // Add separate array for completed productions
  let allProducts = []
  let allMaterials = []
  let selectedProductionType = null
  let selectedTrackingType = null
  let selectedProductData = null
  let productionUpdateInterval = null
  let currentProductionId = null

  // Enhanced filtering variables
  let currentStatusFilter = "all"
  let currentDateFilter = "all"
  let customStartDate = null
  let customEndDate = null
  let searchQuery = ""

  // Wizard state management
  let currentStep = 1
  const totalSteps = 5
  let wizardData = {}

  // Enhanced cost tracking variables
  let totalMaterialCost = 0
  let totalOperationalCost = 0
  let totalProductionCost = 0
  let totalBatchQuantity = 0
  let totalRevenue = 0
  let totalProfit = 0

  // DOM Elements
  const produceProductBtn = document.getElementById("produce-product-btn")
  const startFirstProductionBtn = document.getElementById("start-first-production")
  const produceProductModal = document.getElementById("produceProductModal")
  const categorySelect = document.getElementById("new-product-category")
  const productIdInput = document.getElementById("new-product-id")
  const productionDetailsModal = document.getElementById("productionDetailsModal")
  const completeProductionModal = document.getElementById("completeProductionModal")
  const qualityCheckModal = document.getElementById("qualityCheckModal")
  const ongoingProductionsContainer = document.getElementById("ongoing-productions")
  const emptyStateContainer = document.getElementById("empty-state")
  const productionHistoryBody = document.getElementById("production-history-body")

  // Enhanced UI elements
  const statusCards = document.querySelectorAll(".status-card")
  const dateFilterButtons = document.querySelectorAll(".date-filter-btn")
  const customDateRange = document.getElementById("custom-date-range")
  const productionSearch = document.getElementById("production-search")
  const activeProductionsBadge = document.getElementById("active-productions-badge")
  const historyCountBadge = document.getElementById("history-count-badge")

  // Wizard elements
  const wizardNextBtn = document.getElementById("wizard-next-btn")
  const wizardPrevBtn = document.getElementById("wizard-prev-btn")
  const wizardFinishBtn = document.getElementById("wizard-finish-btn")
  const wizardProgressLine = document.getElementById("wizard-progress-line")
  const wizardSteps = document.querySelectorAll(".wizard-step")

  // Production option cards
  const productionOptionCards = document.querySelectorAll(".production-option-card")
  const trackingTypeCards = document.querySelectorAll(".tracking-type-card")

  // Form elements
  const newProductProductionForm = document.getElementById("new-product-production-form")
  const existingProductProductionForm = document.getElementById("existing-product-production-form")
  const addMaterialBtn = document.getElementById("add-material-btn")
  const recipeMaterials = document.getElementById("recipe-materials")

  // Cost calculation elements
  const calculateLaborBtn = document.getElementById("calculate-labor-btn")
  const operationalCostInputs = document.querySelectorAll(".operational-cost")

  // Tracking type specific elements
  const normalTrackFields = document.getElementById("normal-track-fields")
  const batchTrackFields = document.getElementById("batch-track-fields")
  const customDurationFields = document.getElementById("custom-duration-fields")

  // Completion form elements
  const completeProductionForm = document.getElementById("completeProductionForm")
  const submitCompletionBtn = document.getElementById("submit-completion-btn")

  // --- Add validation for quantity passed not exceeding quantity produced in completion modal ---
  const quantityProducedInput = document.getElementById("quantity_produced")
  const quantityPassedInput = document.getElementById("quantity_passed_qc")
  if (quantityProducedInput && quantityPassedInput) {
    quantityPassedInput.addEventListener("input", () => {
      const produced = Number.parseInt(quantityProducedInput.value) || 0
      const passed = Number.parseInt(quantityPassedInput.value) || 0
      if (passed > produced) {
        quantityPassedInput.value = produced
      }
      // Update failed quantity automatically
      const failedInput = document.getElementById("quantity_failed_qc")
      if (failedInput) {
        failedInput.value = Math.max(0, produced - (Number.parseInt(quantityPassedInput.value) || 0))
      }
    })
    quantityProducedInput.addEventListener("input", () => {
      const produced = Number.parseInt(quantityProducedInput.value) || 0
      const passed = Number.parseInt(quantityPassedInput.value) || 0
      if (passed > produced) {
        quantityPassedInput.value = produced
      }
      // Update failed quantity automatically
      const failedInput = document.getElementById("quantity_failed_qc")
      if (failedInput) {
        failedInput.value = Math.max(0, produced - (Number.parseInt(quantityPassedInput.value) || 0))
      }
    })
  }

  // Quality Check elements
  const confirmQualityCheckBtn = document.getElementById("confirm-quality-check")

  // Size option elements
  const sizeOptionInput = document.getElementById("size-option")
  const sizeTypeGroup = document.getElementById("size-type-group")
  const sizeTypeSelect = document.getElementById("size-type")
  const sizePriceGroup = document.getElementById("size-price-group")
  const sizesContainer = document.getElementById("sizes-container")
  const singleQuantityGroup = document.getElementById("single-quantity-group")
  const productPriceInput = document.getElementById("new-product-price")

  // Existing product size elements
  const existingSizeOptionInput = document.getElementById("existing-size-option")
  const existingSizeTypeGroup = document.getElementById("existing-size-type-group")
  const existingSizeTypeSelect = document.getElementById("existing-size-type")
  const existingSizeBatchGroup = document.getElementById("existing-size-batch-group")
  const existingSizesContainer = document.getElementById("existing-sizes-container")
  const existingSingleBatchGroup = document.getElementById("existing-single-batch-group")

  // Bootstrap modal instances
  let produceProductModalInstance = null
  let productionDetailsModalInstance = null
  let completeProductionModalInstance = null
  let qualityCheckModalInstance = null
  let loadingModalInstance = null
  let successModalInstance = null
  let errorModalInstance = null

  // Size options configuration
  const sizeOptions = {
    sml: ["Small", "Medium", "Large"],
    ml: ["250ml", "500ml", "1L"],
    g: ["100g", "200g", "500g"],
    unit: ["1 pc", "2 pcs", "5 pcs"],
  }

  // Initialize the production management system
  function initializeProduction() {
    initializeModals()
    loadMaterials()
    loadProducts()
    loadOngoingProductions()
    loadProductionHistory()
    setupEventListeners()
    setupEnhancedEventListeners()
    updateEmptyState()
    setupProductionUpdateInterval()
    updateStatusCards()
    updateProductionCounts()
  }

  function initializeModals() {
    if (typeof bootstrap !== "undefined") {
      produceProductModalInstance = new bootstrap.Modal(document.getElementById("produceProductModal"))
      productionDetailsModalInstance = new bootstrap.Modal(document.getElementById("productionDetailsModal"))
      completeProductionModalInstance = new bootstrap.Modal(document.getElementById("completeProductionModal"))
      qualityCheckModalInstance = new bootstrap.Modal(document.getElementById("qualityCheckModal"))
      loadingModalInstance = new bootstrap.Modal(document.getElementById("loadingModal"))
      successModalInstance = new bootstrap.Modal(document.getElementById("successModal"))
      errorModalInstance = new bootstrap.Modal(document.getElementById("errorModal"))

      if (produceProductModal) {
        produceProductModal.addEventListener("hidden.bs.modal", resetWizard)
      }
    }
  }

  // Enhanced event listeners for new UI components
  function setupEnhancedEventListeners() {
    console.log("Setting up enhanced event listeners...")

    // Status card filtering
    statusCards.forEach((card) => {
      card.addEventListener("click", function () {
        const status = this.dataset.status
        filterByStatus(status)
        updateActiveStatusCard(this)
      })
    })

    // Date filter dropdown options
    const dateFilterOptions = document.querySelectorAll(".date-filter-option")
    console.log("Found date filter options:", dateFilterOptions.length)
    dateFilterOptions.forEach((option) => {
      console.log(
        "Setting up event listener for option:",
        option.textContent.trim(),
        "with range:",
        option.dataset.range,
      )
      option.addEventListener("click", function (e) {
        e.preventDefault()
        const range = this.dataset.range
        console.log("Date filter clicked:", range)
        filterByDateRange(range)
        updateActiveDateFilterOption(this)
        updateDropdownButtonText(this)
      })
    })

    // Date filter buttons (for backward compatibility)
    dateFilterButtons.forEach((button) => {
      button.addEventListener("click", function () {
        const range = this.dataset.range
        filterByDateRange(range)
        updateActiveDateFilter(this)
      })
    })

    // Custom date range application
    const applyCustomRangeBtn = document.getElementById("apply-custom-range")
    if (applyCustomRangeBtn) {
      applyCustomRangeBtn.addEventListener("click", applyCustomDateRange)
    }

    // Production search
    if (productionSearch) {
      productionSearch.addEventListener("input", debounce(handleSearchInput, 300))
    }
  }

  // Status filtering function
  function filterByStatus(status) {
    currentStatusFilter = status
    applyFilters()
  }

  // Date range filtering function
  function filterByDateRange(range) {
    console.log("filterByDateRange called with:", range)
    currentDateFilter = range

    if (range === "custom") {
      // Show the custom date range section
      const dateFilterSection = document.getElementById("date-filter-section")
      if (dateFilterSection) {
        dateFilterSection.classList.remove("d-none")
      }
      customDateRange.classList.add("show")
    } else {
      // Hide the custom date range section
      const dateFilterSection = document.getElementById("date-filter-section")
      if (dateFilterSection) {
        dateFilterSection.classList.add("d-none")
      }
      customDateRange.classList.remove("show")
      applyFilters()
    }
  }

  // Apply custom date range
  function applyCustomDateRange() {
    const startDate = document.getElementById("custom-start-date").value
    const endDate = document.getElementById("custom-end-date").value

    if (!startDate || !endDate) {
      showResponseMessage("warning", "Please select both start and end dates")
      return
    }

    if (new Date(startDate) > new Date(endDate)) {
      showResponseMessage("warning", "Start date cannot be after end date")
      return
    }

    customStartDate = startDate
    customEndDate = endDate
    applyFilters()
  }

  // Search input handler
  function handleSearchInput(event) {
    searchQuery = event.target.value.toLowerCase().trim()
    applyFilters()
  }

  // Apply all filters
  function applyFilters() {
    console.log(
      "applyFilters called - currentDateFilter:",
      currentDateFilter,
      "currentStatusFilter:",
      currentStatusFilter,
    )
    let filteredProductions = [...allProductions]
    let filteredHistory = [...allCompletedProductions]

    // Apply status filter
    if (currentStatusFilter !== "all") {
      filteredProductions = filteredProductions.filter((p) => p.status === currentStatusFilter)
      filteredHistory = filteredHistory.filter((p) => p.status === currentStatusFilter)
    }

    // Apply date filter
    filteredProductions = applyDateFilter(filteredProductions)
    filteredHistory = applyDateFilter(filteredHistory)

    // Apply search filter
    if (searchQuery) {
      filteredProductions = filteredProductions.filter(
        (p) =>
          p.product_name.toLowerCase().includes(searchQuery) ||
          p.production_id.toLowerCase().includes(searchQuery) ||
          p.status.toLowerCase().includes(searchQuery) ||
          p.id.toString().includes(searchQuery),
      )

      filteredHistory = filteredHistory.filter(
        (p) =>
          p.product_name.toLowerCase().includes(searchQuery) ||
          p.production_id.toLowerCase().includes(searchQuery) ||
          p.status.toLowerCase().includes(searchQuery) ||
          p.id.toString().includes(searchQuery),
      )
    }

    console.log(
      "Filtered productions count:",
      filteredProductions.length,
      "Filtered history count:",
      filteredHistory.length,
    )

    // Render filtered results
    renderFilteredProductions(filteredProductions)
    renderProductionHistory(filteredHistory)
    updateProductionCounts(filteredProductions, filteredHistory)
  }

  // Apply date filter to productions
  function applyDateFilter(productions) {
    console.log("applyDateFilter called with filter:", currentDateFilter, "productions count:", productions.length)

    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000)

    switch (currentDateFilter) {
      case "today":
        const todayFiltered = productions.filter((p) => {
          const prodDate = new Date(p.start_date)
          return prodDate >= today
        })
        console.log("Today filter - original:", productions.length, "filtered:", todayFiltered.length)
        return todayFiltered

      case "yesterday":
        const yesterdayFiltered = productions.filter((p) => {
          const prodDate = new Date(p.start_date)
          return prodDate >= yesterday && prodDate < today
        })
        console.log("Yesterday filter - original:", productions.length, "filtered:", yesterdayFiltered.length)
        return yesterdayFiltered

      case "this-week":
        const startOfWeek = new Date(today)
        startOfWeek.setDate(today.getDate() - today.getDay())
        const thisWeekFiltered = productions.filter((p) => {
          const prodDate = new Date(p.start_date)
          return prodDate >= startOfWeek
        })
        console.log("This week filter - original:", productions.length, "filtered:", thisWeekFiltered.length)
        return thisWeekFiltered

      case "last-week":
        const startOfLastWeek = new Date(today)
        startOfLastWeek.setDate(today.getDate() - today.getDay() - 7)
        const endOfLastWeek = new Date(startOfLastWeek)
        endOfLastWeek.setDate(startOfLastWeek.getDate() + 6)
        const lastWeekFiltered = productions.filter((p) => {
          const prodDate = new Date(p.start_date)
          return prodDate >= startOfLastWeek && prodDate <= endOfLastWeek
        })
        console.log("Last week filter - original:", productions.length, "filtered:", lastWeekFiltered.length)
        return lastWeekFiltered

      case "this-month":
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
        const thisMonthFiltered = productions.filter((p) => {
          const prodDate = new Date(p.start_date)
          return prodDate >= startOfMonth
        })
        console.log("This month filter - original:", productions.length, "filtered:", thisMonthFiltered.length)
        return thisMonthFiltered

      case "last-month":
        const startOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1)
        const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0)
        const lastMonthFiltered = productions.filter((p) => {
          const prodDate = new Date(p.start_date)
          return prodDate >= startOfLastMonth && prodDate <= endOfLastMonth
        })
        console.log("Last month filter - original:", productions.length, "filtered:", lastMonthFiltered.length)
        return lastMonthFiltered

      case "custom":
        if (customStartDate && customEndDate) {
          const start = new Date(customStartDate)
          const end = new Date(customEndDate)
          end.setHours(23, 59, 59, 999) // Include the entire end date
          const customFiltered = productions.filter((p) => {
            const prodDate = new Date(p.start_date)
            return prodDate >= start && prodDate <= end
          })
          console.log("Custom filter - original:", productions.length, "filtered:", customFiltered.length)
          return customFiltered
        }
        console.log("Custom filter - no dates set, returning all")
        return productions

      default:
        console.log("Default filter - returning all productions")
        return productions
    }
  }

  // Update active status card
  function updateActiveStatusCard(activeCard) {
    statusCards.forEach((card) => card.classList.remove("active"))
    activeCard.classList.add("active")
  }

  // Update active date filter
  function updateActiveDateFilter(activeButton) {
    dateFilterButtons.forEach((btn) => btn.classList.remove("active"))
    activeButton.classList.add("active")
  }

  // Update active date filter option in dropdown
  function updateActiveDateFilterOption(activeOption) {
    const dateFilterOptions = document.querySelectorAll(".date-filter-option")
    dateFilterOptions.forEach((option) => {
      option.classList.remove("active")
    })
    activeOption.classList.add("active")
  }

  // Update dropdown button text
  function updateDropdownButtonText(selectedOption) {
    const dropdownButton = document.getElementById("dateFilterDropdown")
    const optionText = selectedOption.textContent.trim()

    if (dropdownButton) {
      dropdownButton.innerHTML = `<i class="bi bi-calendar-range me-2"></i>${optionText}`
    }
  }

  // Update status cards with counts
  function updateStatusCards() {
    const statusCounts = {
      "in-progress": 0,
      completed: 0,
      pending: 0,
      "quality-check": 0,
      cancelled: 0,
      total: 0,
    }

    // Count ongoing productions
    allProductions.forEach((production) => {
      statusCounts[production.status] = (statusCounts[production.status] || 0) + 1
      statusCounts.total++
    })

    // Count completed productions
    allCompletedProductions.forEach((production) => {
      statusCounts[production.status] = (statusCounts[production.status] || 0) + 1
      statusCounts.total++
    })

    // Update the DOM
    document.getElementById("in-progress-count").textContent = statusCounts["in-progress"] || 0
    document.getElementById("completed-count").textContent = statusCounts["completed"] || 0
    document.getElementById("pending-count").textContent = statusCounts["pending"] || 0
    document.getElementById("quality-check-count").textContent = statusCounts["quality-check"] || 0
    document.getElementById("cancelled-count").textContent = statusCounts["cancelled"] || 0
    document.getElementById("total-count").textContent = statusCounts.total
  }

  // Update production counts in badges
  function updateProductionCounts(filteredProductions = allProductions, filteredHistory = allCompletedProductions) {
    if (activeProductionsBadge) {
      activeProductionsBadge.textContent = filteredProductions.length
    }
    if (historyCountBadge) {
      historyCountBadge.textContent = filteredHistory.length
    }
  }

  // Render filtered productions
  function renderFilteredProductions(productions) {
    if (!ongoingProductionsContainer) return

    ongoingProductionsContainer.innerHTML = ""

    if (productions.length === 0) {
      // Show appropriate empty state message
      let emptyMessage = "No productions found"
      if (currentStatusFilter !== "all") {
        emptyMessage = `No ${currentStatusFilter.replace("-", " ")} productions found`
      }
      if (searchQuery) {
        emptyMessage += ` matching "${searchQuery}"`
      }

      const emptyDiv = document.createElement("div")
      emptyDiv.className = "col-12"
      emptyDiv.innerHTML = `
        <div class="empty-state fade-in-up">
          <div class="empty-state-icon">
            <i class="bi bi-search"></i>
          </div>
          <h4>${emptyMessage}</h4>
          <p>Try adjusting your filters or search terms to find what you're looking for.</p>
          <button type="button" class="btn btn-outline-secondary" onclick="clearAllFilters()">
            <i class="bi bi-arrow-clockwise me-2"></i>Clear Filters
          </button>
        </div>
      `
      ongoingProductionsContainer.appendChild(emptyDiv)
      return
    }

    productions.forEach((production) => {
      const card = createProductionCard(production)
      ongoingProductionsContainer.appendChild(card)
    })

    updateEmptyState()
  }

  // Clear all filters function (make it global)
  window.clearAllFilters = () => {
    currentStatusFilter = "all"
    currentDateFilter = "all"
    searchQuery = ""
    customStartDate = null
    customEndDate = null

    // Reset UI
    statusCards.forEach((card) => card.classList.remove("active"))
    statusCards[statusCards.length - 1].classList.add("active") // Activate "Total" card

    // Reset date filter buttons
    dateFilterButtons.forEach((btn) => btn.classList.remove("active"))
    dateFilterButtons[0].classList.add("active") // Activate "All Time" button

    // Reset dropdown options
    const dateFilterOptions = document.querySelectorAll(".date-filter-option")
    dateFilterOptions.forEach((option) => option.classList.remove("active"))
    const allTimeOption = document.querySelector('.date-filter-option[data-range="all"]')
    if (allTimeOption) allTimeOption.classList.add("active")

    // Reset dropdown button text
    const dropdownButton = document.getElementById("dateFilterDropdown")
    if (dropdownButton) {
      dropdownButton.innerHTML = `<i class="bi bi-calendar-range me-2"></i>All Time`
    }

    if (productionSearch) productionSearch.value = ""
    if (customDateRange) customDateRange.classList.remove("show")

    // Hide the date filter section
    const dateFilterSection = document.getElementById("date-filter-section")
    if (dateFilterSection) {
      dateFilterSection.classList.add("d-none")
    }

    // Reapply filters (which will show all data)
    applyFilters()
  }

  function validateProductName(productName) {
  if (!productName || productName.trim() === "") {
    showErrorModal("Product name is required. Please enter a valid product name.");
    return false;
  }
  return true;
}

function showErrorModal(message) {
  const modal = new bootstrap.Modal(document.getElementById("errorModal"));
  document.getElementById("errorMessage").textContent = message;
  modal.show();
}


  function setupEventListeners() {
    // Main action buttons
    if (produceProductBtn) {
      produceProductBtn.addEventListener("click", openProduceProductModal)
    }

    if (startFirstProductionBtn) {
      startFirstProductionBtn.addEventListener("click", openProduceProductModal)
    }

    // Wizard navigation buttons
    if (wizardNextBtn) {
      wizardNextBtn.addEventListener("click", nextStep)
    }

    if (wizardPrevBtn) {
      wizardPrevBtn.addEventListener("click", previousStep)
    }

    if (wizardFinishBtn) {
      wizardFinishBtn.addEventListener("click", startProduction)
    }

    // Production option cards
    productionOptionCards.forEach((card) => {
      card.addEventListener("click", function () {
        selectProductionType(this.dataset.option)
      })
    })

    // Tracking type cards
    trackingTypeCards.forEach((card) => {
      card.addEventListener("click", function () {
        selectTrackingType(this.dataset.tracking)
      })
    })

    // Size option event listeners for NEW PRODUCT
    if (sizeOptionInput) {
      sizeOptionInput.addEventListener("change", handleSizeOptionChange)
    }

    if (sizeTypeSelect) {
      sizeTypeSelect.addEventListener("change", () => {
        sizesContainer.innerHTML = ""
        addSizeRow()
      })
    }

    // New product quantity listener
    const newProductQuantity = document.getElementById("new-product-quantity")
    if (newProductQuantity) {
      newProductQuantity.addEventListener("input", () => {
        updateMaterialCosts()
      })
    }

    // New product price listener
    if (productPriceInput) {
      productPriceInput.addEventListener("input", () => {
        updateMaterialCosts()
      })
    }

    // Existing product size options with proper event listeners
    if (existingSizeOptionInput) {
      existingSizeOptionInput.addEventListener("change", handleExistingSizeOptionChange)
    }

    if (existingSizeTypeSelect) {
      existingSizeTypeSelect.addEventListener("change", () => {
        existingSizesContainer.innerHTML = ""
        addExistingSizeRow()
        setTimeout(() => {
          const unitHeader = document.querySelector("#existing-size-batch-group .row.mb-2 > .col-md-2")
          if (existingSizeTypeSelect.value === "sml") {
            if (unitHeader) unitHeader.style.display = "none"
          } else {
            if (unitHeader) unitHeader.style.display = ""
          }
        }, 100)
      })
    }

    // Material management
    if (addMaterialBtn) {
      addMaterialBtn.addEventListener("click", addMaterialRow)
    }

    // Labor cost calculator
    if (calculateLaborBtn) {
      calculateLaborBtn.addEventListener("click", calculateLaborCost)
    }

    // Operational cost listeners
    operationalCostInputs.forEach((input) => {
      input.addEventListener("input", updateOperationalCosts)
    })

    // Expiration duration handling
    const expirationDuration = document.getElementById("expiration-duration")
    if (expirationDuration) {
      expirationDuration.addEventListener("change", handleExpirationDurationChange)
    }

    // Custom duration fields
    const customDurationValue = document.getElementById("custom-duration-value")
    const customDurationUnit = document.getElementById("custom-duration-unit")
    if (customDurationValue && customDurationUnit) {
      customDurationValue.addEventListener("input", calculateExpirationDate)
      customDurationUnit.addEventListener("change", calculateExpirationDate)
    }

    // Manufacturing date handling
    const batchManufacturingDate = document.getElementById("batch-manufacturing-date")
    if (batchManufacturingDate) {
      batchManufacturingDate.addEventListener("change", calculateExpirationDate)
    }

    // Existing product selection with proper material cost updates
    const existingProductSelect = document.getElementById("existing-product-select")
    if (existingProductSelect) {
      existingProductSelect.addEventListener("change", () => {
        loadProductDetails()
        
        // Load recipes for the selected product
        const selectedProductId = existingProductSelect.value
        if (selectedProductId) {
          const selectedProduct = allProducts.find(p => p.product_id === selectedProductId)
          if (selectedProduct) {
            selectedProductData = selectedProduct
            console.log("📋 Selected product:", selectedProduct)
            loadProductRecipes(selectedProductId)
          }
        }
        
        // Trigger material cost recalculation when product changes
        setTimeout(() => {
          updateExistingProductBatchQuantity()
          updateMaterialCosts()
        }, 100)
      })
    }

    // Add listeners for existing product batch size changes
    const existingBatchSize = document.getElementById("existing-batch-size")
    if (existingBatchSize) {
      existingBatchSize.addEventListener("input", () => {
        updateExistingProductBatchQuantity()
        updateMaterialCosts()
      })
    }

    // Completion form
    if (submitCompletionBtn) {
      submitCompletionBtn.addEventListener("click", submitProductionCompletion)
    }

    // QC quantity validation
    const quantityProduced = document.getElementById("quantity_produced")
    const quantityPassedQC = document.getElementById("quantity_passed_qc")
    const quantityFailedQC = document.getElementById("quantity_failed_qc")

    if (quantityProduced && quantityPassedQC && quantityFailedQC) {
      quantityProduced.addEventListener("input", updateFailedQCQuantity)
      quantityPassedQC.addEventListener("input", updateFailedQCQuantity)
    }

    // Update status button
    const updateStatusBtn = document.getElementById("update-production-status")
    if (updateStatusBtn) {
      updateStatusBtn.addEventListener("click", () => {
        if (currentProductionId) {
          updateProductionStatus(currentProductionId)
        }
      })
    }

    // Complete production button
    const completeProductionBtn = document.getElementById("complete-production-btn")
    if (completeProductionBtn) {
      completeProductionBtn.addEventListener("click", () => {
        if (currentProductionId) {
          openCompleteProductionModal(currentProductionId)
        }
      })
    }
    setupQualityCheckEventListeners()
  }

  // Quality Check Event Listeners
  function setupQualityCheckEventListeners() {
    // Quality check form calculations
    const qcQuantityProduced = document.getElementById("qc-estimated-quantity")
    const qcQuantityPassed = document.getElementById("qc-estimated-passed")
    const qcQuantityFailed = document.getElementById("qc-estimated-failed")
    const qcQualityScore = document.getElementById("qc-estimated-quality-score")

    if (qcQuantityProduced && qcQuantityPassed && qcQuantityFailed) {
      qcQuantityProduced.addEventListener("input", updateQualityCheckCalculations)
      qcQuantityPassed.addEventListener("input", updateQualityCheckCalculations)
    }

    // Confirm quality check button
    if (confirmQualityCheckBtn) {
      confirmQualityCheckBtn.addEventListener("click", submitQualityCheck)
    }

    // Set current date and time for quality check
    const qcCheckedAt = document.getElementById("qc-checked-at")
    if (qcCheckedAt) {
      const now = new Date()
      const dateTimeString = now.toISOString().slice(0, 16)
      qcCheckedAt.value = dateTimeString
    }

    // Set default inspector name
    const qcCheckedBy = document.getElementById("qc-checked-by")
    if (qcCheckedBy && !qcCheckedBy.value) {
      qcCheckedBy.value = "Quality Inspector"
    }
  }

  function updateQualityCheckCalculations() {
    const qcQuantityProduced = document.getElementById("qc-estimated-quantity")
    const qcQuantityPassed = document.getElementById("qc-estimated-passed")
    const qcQuantityFailed = document.getElementById("qc-estimated-failed")
    const qcQualityScore = document.getElementById("qc-estimated-quality-score")
    const qcQualityStatus = document.getElementById("qc-quality-status")

    const produced = Number.parseInt(qcQuantityProduced.value) || 0
    const passed = Number.parseInt(qcQuantityPassed.value) || 0

    // Validate inputs
    if (passed > produced) {
      qcQuantityPassed.value = produced
      return updateQualityCheckCalculations()
    }

    // Calculate failed quantity
    const failed = produced - passed
    qcQuantityFailed.value = failed

    // Calculate quality score
    const qualityScore = produced > 0 ? Math.round((passed / produced) * 100) : 0
    qcQualityScore.value = qualityScore

    // Update quality status based on score
    if (qualityScore >= 95) {
      qcQualityStatus.value = "excellent"
    } else if (qualityScore >= 85) {
      qcQualityStatus.value = "good"
    } else if (qualityScore >= 70) {
      qcQualityStatus.value = "acceptable"
    } else if (qualityScore > 0) {
      qcQualityStatus.value = "needs_improvement"
    } else {
      qcQualityStatus.value = "failed"
    }
  }

  function openQualityCheckModal(productionId) {
    currentProductionId = productionId

    // Get production details
    const production = allProductions.find((p) => p.id == productionId)
    if (!production) {
      showResponseMessage("error", "Production not found")
      return
    }

    // Populate modal with production details
    document.getElementById("qc-production-id").textContent = production.production_id || production.id
    document.getElementById("qc-product-name").textContent = production.product_name
    document.getElementById("qc-batch-size").textContent = production.batch_size
    document.getElementById("qc-start-date").textContent = new Date(production.start_date).toLocaleDateString()

    // Set default values for quality check
    document.getElementById("qc-estimated-quantity").value = production.batch_size
    document.getElementById("qc-estimated-passed").value = production.batch_size
    updateQualityCheckCalculations()

    // Show the modal
    qualityCheckModalInstance.show()
  }

  function submitQualityCheck() {
    const formData = new FormData()
    formData.append("production_id", currentProductionId)
    formData.append("quantity_produced", document.getElementById("qc-estimated-quantity").value)
    formData.append("quantity_passed_qc", document.getElementById("qc-estimated-passed").value)
    formData.append("quantity_failed_qc", document.getElementById("qc-estimated-failed").value)
    formData.append("quality_score", document.getElementById("qc-estimated-quality-score").value)
    formData.append("quality_status", document.getElementById("qc-quality-status").value)
    formData.append("quality_checked_by", document.getElementById("qc-checked-by").value)
    formData.append("quality_checked_at", document.getElementById("qc-checked-at").value)
    formData.append("quality_notes", document.getElementById("qc-quality-notes").value)

    loadingModalInstance.show()

    fetch("submit_quality_check.php", {
      method: "POST",
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        loadingModalInstance.hide()

        if (data.success) {
          qualityCheckModalInstance.hide()
          showResponseMessage("success", "Quality check submitted successfully")

          // Immediately complete production and save to production_output/products
          completeProductionAfterQualityCheck(currentProductionId)
        } else {
          showResponseMessage("error", "Failed to submit quality check: " + data.message)
        }
      })
      .catch((error) => {
        loadingModalInstance.hide()
        showResponseMessage("error", "Error submitting quality check. Please try again.")
      })
  }

  function completeProductionAfterQualityCheck(productionId) {
    // You may need to fetch or already have the necessary data for completion
    // Example: fetch production details from backend, then send to complete_production.php

    // For simplicity, let's assume you have all needed data in JS variables or can fetch them
    const formData = new FormData()
    formData.append("production_id", productionId)
    // Add all other required fields for complete_production.php here
    // e.g. formData.append("quantity_produced", ...), etc.

    loadingModalInstance.show()

    fetch("complete_production.php", {
      method: "POST",
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        loadingModalInstance.hide()
        if (data.success) {
          showResponseMessage("success", "Production and product saved successfully")
          loadOngoingProductions()
          loadProductionHistory()
          updateStatusCards()
        } else {
          showResponseMessage("error", "Failed to complete production: " + data.message)
        }
      })
      .catch((error) => {
        loadingModalInstance.hide()
        showResponseMessage("error", "Error completing production. Please try again.")
      })
  }

  function updateFailedQCQuantity() {
    const produced = Number.parseInt(document.getElementById("quantity_produced").value) || 0
    const passed = Number.parseInt(document.getElementById("quantity_passed_qc").value) || 0
    const failed = Math.max(0, produced - passed)

    document.getElementById("quantity_failed_qc").value = failed
  }

  function setupProductionUpdateInterval() {
    productionUpdateInterval = setInterval(() => {
      updateProductionProgress()
    }, 30000)
  }

  function updateProductionProgress() {
    const productionCards = document.querySelectorAll(".production-card")

    productionCards.forEach((card) => {
      const productionId = card.dataset.productionId
      const production = allProductions.find((p) => p.id == productionId)

      if (production) {
        // Parse start_date and estimated_completion
        let startDate = production.start_date ? new Date(production.start_date) : null;
        let estimatedCompletion = production.estimated_completion ? new Date(production.estimated_completion) : null;
        const now = new Date()

        // Progress calculation
        let progress = 0;
        if (production.status === 'pending') {
          progress = 0;
        } else if (production.status === 'in-progress' && startDate && estimatedCompletion && !isNaN(startDate.getTime()) && !isNaN(estimatedCompletion.getTime())) {
          const totalDuration = estimatedCompletion - startDate;
          const elapsedTime = now - startDate;
          if (totalDuration > 0 && elapsedTime > 0) {
            // Progress moves from 10% to 90% over the estimated duration
            const percent = Math.min(1, elapsedTime / totalDuration);
            progress = 10 + percent * 80; // 10% to 90%
            if (progress > 90) progress = 90;
          } else {
            progress = 10;
          }
        } else if (production.status === 'quality-check') {
          progress = 90;
        } else if (production.status === 'completed') {
          progress = 100;
        }
        progress = Math.max(0, Math.min(100, Math.round(progress)));
        production.progress = progress

        // Progress bar update
        const progressRing = card.querySelector(".progress-ring .progress")
        const progressPercentage = card.querySelector(".progress-percentage")
        if (progressRing && progressPercentage) {
          const circumference = 188.5
          const offset = circumference - (progress / 100) * circumference
          progressRing.style.strokeDashoffset = offset
          progressPercentage.textContent = `${Math.round(progress)}%`
        }

        // Time remaining update
        let timeRemainingText = "N/A"
        if (production.status === 'pending' && startDate && estimatedCompletion) {
          // Show full estimated duration as time remaining
          const totalDuration = estimatedCompletion - startDate
          if (totalDuration > 0) {
            const hoursRemaining = Math.floor(totalDuration / (1000 * 60 * 60))
            const minutesRemaining = Math.floor((totalDuration % (1000 * 60 * 60)) / (1000 * 60))
            if (hoursRemaining > 24) {
              const days = Math.floor(hoursRemaining / 24)
              const remainingHours = hoursRemaining % 24
              timeRemainingText = `${days}d ${remainingHours}h ${minutesRemaining}m`
            } else {
              timeRemainingText = `${hoursRemaining}h ${minutesRemaining}m`
            }
          }
        } else if ((production.status === 'in-progress' || production.status === 'quality-check') && estimatedCompletion) {
          const timeRemaining = estimatedCompletion - now
          if (timeRemaining > 0) {
            const hoursRemaining = Math.floor(timeRemaining / (1000 * 60 * 60))
            const minutesRemaining = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60))
            if (hoursRemaining > 24) {
              const days = Math.floor(hoursRemaining / 24)
              const remainingHours = hoursRemaining % 24
              timeRemainingText = `${days}d ${remainingHours}h ${minutesRemaining}m`
            } else {
              timeRemainingText = `${hoursRemaining}h ${minutesRemaining}m`
            }
          } else {
            timeRemainingText = "Overdue"
          }
        } else if (production.status === 'completed') {
          timeRemainingText = 'Completed'
        }
        // --- FIX: Replace invalid :contains selector ---
        let timeRemainingElem = null;
        const timelineTitles = card.querySelectorAll('.timeline-title');
        timelineTitles.forEach(title => {
          if (title.textContent.trim() === "Time Remaining") {
            timeRemainingElem = title.parentElement.querySelector('.timeline-time');
          }
        });
        if (timeRemainingElem) {
          timeRemainingElem.textContent = timeRemainingText
          if (timeRemainingText === 'Overdue') {
            timeRemainingElem.classList.add('text-danger', 'fw-bold')
          } else {
            timeRemainingElem.classList.remove('text-danger', 'fw-bold')
          }
        }
      }
    })
  }

  // DATA LOADING FUNCTIONS

  // Load materials from database
  function loadMaterials() {
    console.log("Loading materials from database...")

    fetch("get_materials.php")
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          allMaterials = data.materials || []
          updateMaterialDropdowns()
          console.log("✅ Materials loaded from database:", allMaterials.length)
        } else {
          console.error("❌ Failed to load materials:", data.message)
          showResponseMessage("error", "Failed to load materials: " + (data.message || "Unknown error"))
          allMaterials = []
          updateMaterialDropdowns()
        }
      })
      .catch((error) => {
        console.error("❌ Error fetching materials:", error)
        showResponseMessage("error", "Error loading materials. Please check your connection.")
        allMaterials = []
        updateMaterialDropdowns()
      })
  }

  // Enhanced product loading using get_products_track.php
  function loadProducts() {
    console.log("Loading products from database...")

    fetch("get_products_track.php")
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          allProducts = data.products || []
          populateProductDropdown()
          console.log("✅ Products loaded from database:", allProducts.length)
        } else {
          console.error("❌ Failed to load products:", data.message)
          showResponseMessage("error", "Failed to load products: " + (data.message || "Unknown error"))

          // Fallback to empty array since we don't want mock data for real implementation
          allProducts = []
          populateProductDropdown()
        }
      })
      .catch((error) => {
        console.error("❌ Error fetching products:", error)
        showResponseMessage("error", "Error connecting to database. Please check your connection.")

        // Fallback to empty array
        allProducts = []
        populateProductDropdown()
      })
  }

  // Enhanced product dropdown population
  function populateProductDropdown() {
    const existingProductSelect = document.getElementById("existing-product-select")
    if (!existingProductSelect) return

    // Clear existing options
    existingProductSelect.innerHTML = '<option value="">Select existing product</option>'

    if (allProducts.length === 0) {
      const option = document.createElement("option")
      option.value = ""
      option.textContent = "No products available"
      option.disabled = true
      existingProductSelect.appendChild(option)
      return
    }

    allProducts.forEach((product) => {
      const option = document.createElement("option")
      option.value = product.product_id

      // Enhanced display with comprehensive product information
      const stockStatus = getStockStatusText(product.stocks, product.status)
      const stockIcon = getStockStatusIcon(product.stocks, product.status)
      const batchInfo = product.batch_tracking === 1 ? " 📦" : ""

      option.textContent = `${stockIcon} ${product.name} (${product.category}) - ${stockStatus} - ₱${Number.parseFloat(product.price).toFixed(2)}${batchInfo}`

      // Store complete product data for later use
      option.dataset.productData = JSON.stringify({
        id: product.id,
        product_id: product.product_id,
        name: product.name,
        product_name: product.name, // For compatibility
        category: product.category,
        stocks: product.stocks,
        price: product.price,
        batch_tracking: product.batch_tracking,
        status: product.status,
        product_photo: product.product_photo,
        expiration_date: product.expiration_date,
        created_at: product.created_at,
        updated_at: product.updated_at,
        latest_batch: product.latest_batch,
      })

      // Style options based on stock status and batch tracking
      if (product.status === "Out of Stock" || product.stocks <= 0) {
        option.style.color = "#dc3545"
        option.disabled = true
      } else if (product.status === "Low Stock" || product.stocks <= 5) {
        option.style.color = "#fd7e14"
      } else {
        option.style.color = "#198754"
      }

      // Highlight batch-tracked products
      if (product.batch_tracking === 1) {
        option.style.fontWeight = "500"
      }

      existingProductSelect.appendChild(option)
    })

    console.log(`📋 Populated dropdown with ${allProducts.length} products`)
  }

  // Helper functions for product display
  function getStockStatusText(stocks, status) {
    if (status === "Out of Stock" || stocks <= 0) return "Out of Stock"
    if (status === "Low Stock" || stocks <= 5) return `Low Stock (${stocks})`
    return `In Stock (${stocks})`
  }

  function getStockStatusIcon(stocks, status) {
    if (status === "Out of Stock" || stocks <= 0) return "🔴"
    if (status === "Low Stock" || stocks <= 5) return "🟡"
    return "🟢"
  }

  // Load productions from database - FIXED to only get active productions
  function loadOngoingProductions() {
    console.log("Loading active productions from database...")

    fetch("get_productions.php")
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          allProductions = data.productions || []
          console.log("✅ Active productions loaded from database:", allProductions.length)
          if (allProductions.length > 0) {
            console.log("Sample production data:", allProductions[0])
            console.log("Sample production start_date:", allProductions[0].start_date)
          }
          renderOngoingProductions()
          updateStatusCards()
          updateProductionCounts()
        } else {
          console.error("❌ Failed to load productions:", data.message)
          showResponseMessage("error", "Failed to load productions: " + (data.message || "Unknown error"))

          // Fallback to empty array instead of mock data for real implementation
          allProductions = []
          renderOngoingProductions()
          updateStatusCards()
          updateProductionCounts()
        }
      })
      .catch((error) => {
        console.error("❌ Error fetching productions:", error)
        showResponseMessage("error", "Error connecting to database. Please check your connection.")

        // Fallback to empty array
        allProductions = []
        renderOngoingProductions()
        updateStatusCards()
        updateProductionCounts()
      })
  }

  // FIXED: Load production history from database - separate call for completed productions
  function loadProductionHistory() {
    console.log("Loading production history from database...")

    // Make a separate call to get completed productions
    fetch("get_production_history.php")
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          allCompletedProductions = data.history || []
          renderProductionHistory(allCompletedProductions)
          updateStatusCards()
          updateProductionCounts()
          console.log("✅ Production history loaded:", allCompletedProductions.length)
        } else {
          console.error("❌ Failed to load production history:", data.message)
          // Try fallback method using the existing endpoint with parameter
          loadProductionHistoryFallback()
        }
      })
      .catch((error) => {
        console.error("❌ Error fetching production history:", error)
        // Try fallback method
        loadProductionHistoryFallback()
      })
  }

  // Fallback method for loading production history
  function loadProductionHistoryFallback() {
    console.log("Using fallback method for production history...")

    fetch("get_productions.php?include_completed=true")
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          // Filter completed productions for history
          const completedProductions = (data.productions || []).filter(
            (p) => p.status === "completed" || p.status === "cancelled",
          )
          allCompletedProductions = completedProductions
          renderProductionHistory(allCompletedProductions)
          updateStatusCards()
          updateProductionCounts()
          console.log("✅ Production history loaded (fallback):", allCompletedProductions.length)
        } else {
          console.error("❌ Failed to load production history (fallback):", data.message)
          allCompletedProductions = []
          renderProductionHistory([])
        }
      })
      .catch((error) => {
        console.error("❌ Error fetching production history (fallback):", error)
        allCompletedProductions = []
        renderProductionHistory([])
      })
  }

  function updateMaterialDropdowns() {
    const materialSelects = document.querySelectorAll(".material-select")
    // Gather all selected material values (except for the current select)
    const selectedValues = Array.from(materialSelects)
      .map((select) => select.value)
      .filter((val) => val)

    materialSelects.forEach((select) => {
      const currentValue = select.value
      select.innerHTML = '<option value="">Select material</option>'

      allMaterials.forEach((material) => {
        const value = material.id // Always use the database primary key
        const option = document.createElement("option")
        option.value = value
        const optionText = material.material_name || material.name
        let stockInfo = ""
        if (material.quantity !== undefined) {
          const quantity = Number.parseFloat(material.quantity) || 0
          const unit = material.measurement_type || material.unit || ""
          if (quantity > 0) {
            stockInfo = ` (Stock: ${quantity} ${unit})`
          } else {
            stockInfo = " (Out of Stock)"
          }
        }
        option.textContent = optionText + stockInfo
        option.dataset.materialData = JSON.stringify(material)
        if (material.quantity !== undefined) {
          const quantity = Number.parseFloat(material.quantity) || 0
          if (quantity <= 0) {
            option.style.color = "#dc3545"
            option.disabled = true
          } else if (quantity <= 5) {
            option.style.color = "#fd7e14"
          }
        }
        // Disable if selected in another dropdown (but not in this one)
        if (selectedValues.includes(String(value)) && String(value) !== String(currentValue)) {
          option.disabled = true
          option.style.display = "none"
        }
        select.appendChild(option)
      })
      if (currentValue) {
        select.value = currentValue
      }
    })
  }

  // RENDERING FUNCTIONS

  function renderOngoingProductions() {
    if (!ongoingProductionsContainer) return

    ongoingProductionsContainer.innerHTML = ""

    allProductions.forEach((production) => {
      const card = createProductionCard(production)
      ongoingProductionsContainer.appendChild(card)
    })

    updateEmptyState()
    updateProductionCounts()
  }

  function createProductionCard(production) {
    const col = document.createElement("div")
    col.className = "col-md-6 col-lg-4"

    // Format dates with error handling
    const startDate = production.start_date ? new Date(production.start_date) : new Date()
    let estimatedCompletionFormatted = "N/A";
    if (production.production_type === "existing-batch") {
      let estimatedCompletion = null;
      if (production.start_date && production.estimated_duration_hours && !isNaN(new Date(production.start_date).getTime())) {
        // Calculate estimated completion from start_date + estimated_duration_hours
        estimatedCompletion = new Date(production.start_date);
        estimatedCompletion.setHours(estimatedCompletion.getHours() + Number(production.estimated_duration_hours));
      } else if (production.estimated_completion && !isNaN(new Date(production.estimated_completion).getTime())) {
        estimatedCompletion = new Date(production.estimated_completion);
      }
      if (estimatedCompletion && !isNaN(estimatedCompletion.getTime())) {
        estimatedCompletionFormatted = estimatedCompletion.toLocaleDateString() + " " + estimatedCompletion.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      } else {
        estimatedCompletionFormatted = "N/A";
      }
    } else {
      const estimatedCompletion = production.estimated_completion ? new Date(production.estimated_completion) : null;
      estimatedCompletionFormatted = estimatedCompletion && !isNaN(estimatedCompletion.getTime())
        ? estimatedCompletion.toLocaleDateString() + " " + estimatedCompletion.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        : "N/A";
    }
    const startDateFormatted = startDate && !isNaN(startDate.getTime()) 
      ? startDate.toLocaleDateString() 
      : "N/A"

    let statusClass = ""
    switch (production.status) {
      case "in-progress":
        statusClass = "status-in-progress"
        break
      case "completed":
        statusClass = "status-completed"
        break
      case "pending":
        statusClass = "status-pending"
        break
      case "quality-check":
        statusClass = "status-quality-check"
        break
    }

    let statusIcon = ""
    switch (production.status) {
      case "in-progress":
        statusIcon = "bi-gear-fill"
        break
      case "completed":
        statusIcon = "bi-check-circle-fill"
        break
      case "pending":
        statusIcon = "bi-clock-fill"
        break
      case "quality-check":
        statusIcon = "bi-shield-check"
        break
    }

    let priorityBadge = ""
    switch (production.priority) {
      case "high":
        priorityBadge = '<span class="badge bg-danger ms-2">High Priority</span>'
        break
      case "urgent":
        priorityBadge = '<span class="badge bg-danger ms-2">URGENT</span>'
        break
    }

    // Determine action buttons based on status
    let actionButtons = `
      <button type="button" class="btn btn-outline-enhanced btn-enhanced view-production-btn" data-production-id="${production.id}">
        <i class="bi bi-eye me-1"></i>View Details
      </button>
    `

    if (production.status === "pending") {
      actionButtons += `
        <button type="button" class="btn btn-primary-enhanced btn-enhanced start-production-btn" data-production-id="${production.id}">
          <i class="bi bi-play-circle me-1"></i>Start
        </button>
      `
    } else if (production.status === "in-progress") {
      actionButtons += `
        <button type="button" class="btn btn-warning btn-enhanced finish-production-btn" data-production-id="${production.id}">
          <i class="bi bi-flag-checkered me-1"></i>Finish
        </button>
      `
    } else if (production.status === "quality-check") {
      actionButtons += `
        <button type="button" class="btn btn-success btn-enhanced complete-production-btn" data-production-id="${production.id}">
          <i class="bi bi-check-circle me-1"></i>Complete Production
        </button>
      `
    } else if (production.status === "completed") {
      actionButtons += `
        <button type="button" class="btn btn-success btn-enhanced" disabled>
          <i class="bi bi-check-circle me-1"></i>Completed
        </button>
      `
    }

    col.innerHTML = `
      <div class="production-card" data-production-id="${production.id}">
        <div class="production-card-header">
          <div class="production-info">
            <h6>${production.product_name}</h6>
            <div class="production-meta">
              <span>Batch Size: ${production.batch_size} units</span>
              <span class="ms-2">ID: ${production.production_id || production.id}</span>
            </div>
            <div class="production-status ${statusClass}">
              <i class="bi ${statusIcon}"></i>
              ${production.status.replace("-", " ").toUpperCase()}
              ${priorityBadge}
            </div>
          </div>
        </div>
        
        <div class="production-timeline">
          <div class="timeline-item">
            <div class="timeline-icon">
              <i class="bi bi-calendar-check"></i>
            </div>
            <div class="timeline-content">
              <div class="timeline-title">Started</div>
              <div class="timeline-time">${startDateFormatted}</div>
            </div>
          </div>
          
          <div class="timeline-item">
            <div class="timeline-icon">
              <i class="bi bi-flag"></i>
            </div>
            <div class="timeline-content">
              <div class="timeline-title">Estimated Completion</div>
              <div class="timeline-time">${estimatedCompletionFormatted}</div>
            </div>
          </div>
        </div>
        
        <div class="action-buttons">
          ${actionButtons}
        </div>
      </div>
    `

    // Set up event listeners after DOM insertion
    setTimeout(() => {
      const viewBtn = col.querySelector(".view-production-btn")
      const startBtn = col.querySelector(".start-production-btn")
      const finishBtn = col.querySelector(".finish-production-btn")
      const completeBtn = col.querySelector(".complete-production-btn")

      if (viewBtn) {
        viewBtn.addEventListener("click", () => viewProductionDetails(production.id))
      }
      if (startBtn) {
        startBtn.addEventListener("click", () => updateProductionStatus(production.id, "in-progress"))
      }
      if (finishBtn) {
        finishBtn.addEventListener("click", () => updateProductionStatus(production.id, "quality-check"))
      }
      if (completeBtn) {
        completeBtn.addEventListener("click", () => openCompleteProductionModal(production.id))
      }
    }, 0)

    return col
  }

  function renderProductionHistory(history) {
    if (!productionHistoryBody) return

    productionHistoryBody.innerHTML = ""

    if (history.length === 0) {
      const row = document.createElement("tr")
      row.innerHTML = `
        <td colspan="7" class="text-center py-4">
          <div class="text-muted">No production history available</div>
        </td>
      `
      productionHistoryBody.appendChild(row)
      return
    }

    history.forEach((production) => {
      const row = document.createElement("tr")

      const startDate = new Date(production.start_date).toLocaleDateString()
      const completionDate = production.actual_completion
        ? new Date(production.actual_completion).toLocaleDateString()
        : "-"

      let statusBadge = ""
      switch (production.status) {
        case "completed":
          statusBadge = '<span class="badge bg-success">Completed</span>'
          break
        case "cancelled":
          statusBadge = '<span class="badge bg-danger">Cancelled</span>'
          break
        default:
          statusBadge = `<span class="badge bg-secondary">${production.status}</span>`
      }

      row.innerHTML = `
        <td>${production.production_id || production.id}</td>
        <td>${production.product_name}</td>
        <td>${production.batch_size} units</td>
        <td>${startDate}</td>
        <td>${completionDate}</td>
        <td>${statusBadge}</td>
        <td>
          <button type="button" class="btn btn-sm btn-outline-primary view-history-btn" data-production-id="${production.id}">
            <i class="bi bi-eye"></i>
          </button>
        </td>
      `

      productionHistoryBody.appendChild(row)

      const viewBtn = row.querySelector(".view-history-btn")
      if (viewBtn) {
        viewBtn.addEventListener("click", () => viewProductionDetails(production.id, true))
      }
    })
  }

  function updateEmptyState() {
    if (!ongoingProductionsContainer || !emptyStateContainer) return

    if (allProductions.length === 0) {
      ongoingProductionsContainer.classList.add("d-none")
      emptyStateContainer.classList.remove("d-none")
    } else {
      ongoingProductionsContainer.classList.remove("d-none")
      emptyStateContainer.classList.add("d-none")
    }
  }

  // Utility function for debouncing
  function debounce(func, wait) {
    let timeout
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout)
        func(...args)
      }
      clearTimeout(timeout)
      timeout = setTimeout(later, wait)
    }
  }

  // WIZARD MANAGEMENT FUNCTIONS

  async function nextStep() {
    if (!validateCurrentStep()) {
      showValidationError()
      return
    }
    saveCurrentStepData()
    if (currentStep < totalSteps) {
      currentStep++
      await showStep(currentStep)
      updateWizardProgress()
      updateWizardButtons()
    }
  }

  async function previousStep() {
    if (currentStep > 1) {
      currentStep--
      await showStep(currentStep)
      updateWizardProgress()
      updateWizardButtons()
    }
  }

  async function resetWizard() {
    currentStep = 1
    selectedProductionType = null
    selectedTrackingType = null
    selectedProductData = null
    wizardData = {}

    document.querySelectorAll(".production-option-card").forEach((card) => {
      card.classList.remove("selected")
    })

    document.querySelectorAll(".tracking-type-card").forEach((card) => {
      card.classList.remove("selected")
    })

    if (newProductProductionForm) newProductProductionForm.reset()
    if (existingProductProductionForm) newProductProductionForm.reset()

    if (recipeMaterials) {
      recipeMaterials.innerHTML = ""
      addMaterialRow()
    }

    totalMaterialCost = 0
    totalOperationalCost = 0
    totalProductionCost = 0
    totalBatchQuantity = 0
    totalRevenue = 0
    totalProfit = 0

    document.getElementById("new-product-step-content").classList.add("d-none")
    document.getElementById("existing-product-step-content").classList.add("d-none")
    if (normalTrackFields) normalTrackFields.classList.add("d-none")
    if (batchTrackFields) batchTrackFields.classList.add("d-none")

    await showStep(1)
    updateWizardProgress()
    updateWizardButtons()
  }

  function openProduceProductModal() {
    resetWizard()
    // Pre-fill the start date with today every time the modal opens
    const scheduleStartDate = document.getElementById('schedule-start-date');
    if (scheduleStartDate) {
      const today = new Date().toISOString().split('T')[0];
      scheduleStartDate.value = today;
    }
    // Pre-fill the manufacturing date with today every time the modal opens
    const batchManufacturingDate = document.getElementById('batch-manufacturing-date');
    if (batchManufacturingDate) {
      const today = new Date().toISOString().split('T')[0];
      batchManufacturingDate.value = today;
    }
    // Reset category dropdown to default (all options)
    updateCategoryDropdownForTrackingType(null);
    if (produceProductModalInstance) {
      produceProductModalInstance.show();
    }
  }

  function selectProductionType(option) {
    selectedProductionType = option

    document.querySelectorAll(".production-option-card").forEach((card) => {
      card.classList.toggle("selected", card.dataset.option === option)
    })

    wizardData.productionType = option
  }

  function selectTrackingType(tracking) {
    selectedTrackingType = tracking
    document.querySelectorAll(".tracking-type-card").forEach((card) => {
      card.classList.toggle("selected", card.dataset.tracking === tracking)
    });
    if (tracking === "normal") {
      if (normalTrackFields) normalTrackFields.classList.remove("d-none");
      if (batchTrackFields) batchTrackFields.classList.add("d-none");
    } else if (tracking === "batch") {
      if (normalTrackFields) normalTrackFields.classList.add("d-none");
      if (batchTrackFields) batchTrackFields.classList.remove("d-none");
      generateBatchCode();
    }
    const trackingTypeInput = document.getElementById("tracking-type");
    if (trackingTypeInput) trackingTypeInput.value = tracking;
    wizardData.trackingType = tracking;
    // Update category dropdown
    updateCategoryDropdownForTrackingType(tracking);
  }

  async function showStep(step) {
    document.querySelectorAll(".wizard-step-content").forEach((content) => {
      content.classList.remove("active")
    })

    const stepContent = document.getElementById(`step-${step}`)
    if (stepContent) {
      stepContent.classList.add("active")
    }

    document.querySelectorAll(".wizard-step").forEach((stepEl, index) => {
      stepEl.classList.remove("active", "completed")
      if (index + 1 < step) {
        stepEl.classList.add("completed")
      } else if (index + 1 === step) {
        stepEl.classList.add("active")
      }
    })

    await handleStepSpecificLogic(step)
  }

  async function handleStepSpecificLogic(step) {
    switch (step) {
      case 2:
        if (selectedProductionType === "new-product") {
          const newProductStepContent = document.getElementById("new-product-step-content");
          const existingProductStepContent = document.getElementById("existing-product-step-content");
          if (newProductStepContent) newProductStepContent.classList.remove("d-none");
          if (existingProductStepContent) existingProductStepContent.classList.add("d-none");
        } else if (selectedProductionType === "existing-batch") {
          const newProductStepContent = document.getElementById("new-product-step-content");
          const existingProductStepContent = document.getElementById("existing-product-step-content");
          if (newProductStepContent) newProductStepContent.classList.add("d-none");
          if (existingProductStepContent) existingProductStepContent.classList.remove("d-none");
        }
        break
      case 3:
        if (allMaterials.length === 0) {
          loadMaterials()
        }
        // Always show manual material section
        const materialSection = document.getElementById("material-section")
        if (materialSection) materialSection.style.display = "block"
        const recipeMaterials = document.getElementById("recipe-materials")
        if (recipeMaterials) recipeMaterials.style.display = "block"
        const recipeMaterialsSection = document.getElementById("recipe-materials-section")
        if (recipeMaterialsSection) recipeMaterialsSection.style.display = "none"
        // If in 'existing-batch', auto-populate materials from recipe
        if (selectedProductionType === "existing-batch") {
          autoPopulateRecipeMaterialsForExistingBatch()
        } else {
          if (recipeMaterials && recipeMaterials.children.length === 0) {
            addMaterialRow()
          }
        }
        break
      case 4:
        // Pre-fill the start date with today
        const scheduleStartDate = document.getElementById('schedule-start-date');
        if (scheduleStartDate) {
          const today = new Date().toISOString().split('T')[0];
          scheduleStartDate.value = today;
        }
        break;
      case 5:
        await populateReviewContent();
        break
    }
  }

  function updateWizardProgress() {
    const progressPercentage = ((currentStep - 1) / (totalSteps - 1)) * 100
    if (wizardProgressLine) wizardProgressLine.style.width = `${progressPercentage}%`
  }

  function updateWizardButtons() {
    if (currentStep === 1) {
      if (wizardPrevBtn) wizardPrevBtn.style.display = "none"
    } else {
      if (wizardPrevBtn) wizardPrevBtn.style.display = "inline-block"
    }

    if (currentStep === totalSteps) {
      if (wizardNextBtn) wizardNextBtn.style.display = "none"
      if (wizardFinishBtn) wizardFinishBtn.style.display = "inline-block"
    } else {
      if (wizardNextBtn) wizardNextBtn.style.display = "inline-block"
      if (wizardFinishBtn) wizardFinishBtn.style.display = "none"
    }

    if (currentStep === totalSteps - 1) {
      if (wizardNextBtn) wizardNextBtn.innerHTML = 'Review<i class="bi bi-arrow-right ms-1"></i>'
    } else {
      if (wizardNextBtn) wizardNextBtn.innerHTML = 'Next<i class="bi bi-arrow-right ms-1"></i>'
    }
  }

  function validateCurrentStep() {
    switch (currentStep) {
      case 1:
        return selectedProductionType !== null
      case 2:
        if (selectedProductionType === "new-product") {
          const name = document.getElementById("new-product-name").value.trim()
          const category = document.getElementById("new-product-category").value
          const price = document.getElementById("new-product-price").value
          const quantity = document.getElementById("new-product-quantity").value
        if (selectedTrackingType === null) {
          showValidationError("Please select a tracking type.");
          return false;
        }
        if (name === "") {
          showValidationError("Product name is required. Please enter a valid product name.");
          return false;
        }
        if (category === "") {
          showValidationError("Please select a product category.");
          return false;
        }
        if (price === "" || Number(price) <= 0) {
          showValidationError("Please enter a valid price greater than 0.");
          return false;
        }
        if (quantity === "" || Number(quantity) <= 0) {
          showValidationError("Please enter a valid quantity greater than 0.");
          return false;
        }
        return true;
        } else {
          const productSelected = document.getElementById("existing-product-select").value
          const batchSize = document.getElementById("existing-batch-size")?.value
          if (productSelected === "" || (batchSize !== undefined && (batchSize === "" || Number(batchSize) <= 0))) {
            showValidationError("Please select a product and enter a valid batch size (must be greater than 0).")
            return false
          }
          return true
        }
      case 3:
        const materialSelects = document.querySelectorAll(".material-select")
        const hasValidMaterials = Array.from(materialSelects).some((select) => {
          const row = select.closest(".recipe-item")
          const quantityInput = row?.querySelector(".quantity-input")
          return select.value !== "" && quantityInput?.value && Number.parseFloat(quantityInput.value) > 0
        })
        if (!hasValidMaterials) {
          showValidationError("Please add at least one material with a valid quantity.")
          return false
        }
        // NEW: Block if any material is insufficient
        const insufficientInputs = document.querySelectorAll(".quantity-input.is-invalid");
        if (insufficientInputs.length > 0) {
          const modal = new bootstrap.Modal(document.getElementById('insufficientMaterialsModal'));
          modal.show();
          return false;
        }
        return true
      case 4:
        const startDate = document.getElementById("schedule-start-date")?.value.trim()
        const startTime = document.getElementById("schedule-start-time")?.value.trim()
        const estimatedDuration = document.getElementById("schedule-estimated-duration")?.value.trim()
        const assignedTo = document.getElementById("schedule-assigned-to")?.value.trim()
        const priority = document.getElementById("schedule-priority")?.value.trim()
        // Notes can be optional
        if (!startDate || !startTime || !estimatedDuration || !assignedTo || !priority) {
          showValidationError("Please complete all required fields in the Production Schedule.")
          return false
        }
        return true
      case 5:
        return true
      default:
        return true
    }
  }

  function saveCurrentStepData() {
    switch (currentStep) {
      case 1:
        wizardData.productionType = selectedProductionType;
        break;
      case 2:
        if (selectedProductionType === "new-product") {
          wizardData.trackingType = selectedTrackingType;
          wizardData.productInfo = {
            name: document.getElementById("new-product-name")?.value || "",
            category: document.getElementById("new-product-category")?.value || "",
            price: document.getElementById("new-product-price")?.value || "0",
            quantity: document.getElementById("new-product-quantity")?.value || "0",
          };
        } else {
          wizardData.existingProduct = {
            productId: document.getElementById("existing-product-select")?.value || "",
            batchSize: document.getElementById("existing-batch-size")?.value || "0",
          };
        }
        break;
      case 3:
        wizardData.materials = collectMaterialData();
        break;
      case 4:
        wizardData.schedule = {
          startDate: document.getElementById("schedule-start-date")?.value || "",
          startTime: document.getElementById("schedule-start-time")?.value || "08:00",
          estimatedDuration: document.getElementById("schedule-estimated-duration")?.value || "8",
          assignedTo: document.getElementById("schedule-assigned-to")?.value || "admin",
          priority: document.getElementById("schedule-priority")?.value || "normal",
          notes: document.getElementById("schedule-production-notes")?.value || "",
        };
        break;
      case 5:
        wizardData.operationalCosts = {
          electricity: document.getElementById("electricity-cost")?.value || "0",
          gas: document.getElementById("gas-cost")?.value || "0",
          labor: document.getElementById("labor-cost")?.value || "0",
        };
        break;
    }
    console.log(`Step ${currentStep} data saved:`, wizardData);
  }

  function collectMaterialData() {
    const materials = []
    
    // Check if we're using recipe materials (new format)
    const recipeMaterialRows = document.querySelectorAll(".recipe-material-row")
    if (recipeMaterialRows.length > 0) {
      console.log(`🔍 Collecting recipe material data from ${recipeMaterialRows.length} rows`)
      
      recipeMaterialRows.forEach((row, index) => {
        const materialId = row.dataset.materialId
        const quantityInput = row.querySelector(".recipe-quantity-input")
        
        if (materialId && quantityInput) {
          const quantity = quantityInput.value
          const materialName = row.querySelector('.form-control-plaintext').textContent || "Unknown Material"
          
          console.log(`Recipe Material ${index + 1}:`, { materialId, quantity, materialName })
          
          if (quantity && Number.parseFloat(quantity) > 0) {
            materials.push({
              materialId: materialId,
              quantity: Number.parseFloat(quantity),
              materialName: materialName,
            })
          }
        }
      })
    } else {
      // Fallback to old format
      const materialRows = document.querySelectorAll(".recipe-item")
      console.log(`🔍 Collecting material data from ${materialRows.length} rows (old format)`)

      materialRows.forEach((row, index) => {
        const materialSelect = row.querySelector(".material-select")
        const quantityInput = row.querySelector(".quantity-input")

        if (materialSelect && quantityInput) {
          const materialId = materialSelect.value
          const quantity = quantityInput.value
          const materialName = materialSelect.options[materialSelect.selectedIndex]?.text || "Unknown Material"

          console.log(`Material ${index + 1}:`, { materialId, quantity, materialName })

          if (materialId && quantity && Number.parseFloat(quantity) > 0) {
            materials.push({
              materialId: materialId,
              quantity: Number.parseFloat(quantity),
              materialName: materialName.replace(/\s*$$[^)]*$$\s*/g, ""), // Remove stock info from name
            })
          }
        }
      })
    }

    console.log(`✅ Collected ${materials.length} valid materials:`, materials)
    return materials
  }

  async function populateReviewContent() {
    try {
      const reviewContent = document.getElementById("review-content")
      if (!reviewContent) {
        console.error("review-content element not found in DOM")
        return
      }
      let html = ""
      // Ensure allProducts and allMaterials are loaded before rendering
      if (!allProducts || allProducts.length === 0) {
        await loadProducts()
      }
      if (!allMaterials || allMaterials.length === 0) {
        await loadMaterials()
      }
      // Ensure material costs and batch quantity are up-to-date
      updateMaterialCosts();
      updateBatchQuantityForCurrentType();
      // --- COST PER UNIT CALCULATION (FIXED: use global values) ---
      let materialCost = typeof totalMaterialCost !== 'undefined' ? totalMaterialCost : 0;
      let batchQuantity = typeof totalBatchQuantity !== 'undefined' && totalBatchQuantity > 0 ? totalBatchQuantity : 1;
      let costPerUnit = materialCost / batchQuantity;
      // --- END COST PER UNIT CALCULATION ---

      html += `
        <div class="row mb-4">
          <div class="col-md-6">
            <div class="card">
              <div class="card-header bg-light">
                <h6 class="mb-0"><i class="bi bi-gear me-2"></i>Production Type</h6>
              </div>
              <div class="card-body">
                <p class="mb-0">${selectedProductionType === "new-product" ? "New Product" : "Existing Product Batch"}</p>
              </div>
            </div>
          </div>
          <div class="col-md-6">
            <div class="card">
              <div class="card-header bg-light">
                <h6 class="mb-0"><i class="bi bi-info-circle me-2"></i>Product Details</h6>
              </div>
              <div class="card-body">
      `

      if (selectedProductionType === "new-product") {
        const producedQuantity = wizardData.productInfo?.quantity || 0;
        const stockStatus = getStockStatusText(producedQuantity, producedQuantity > 20 ? "In Stock" : (producedQuantity > 0 ? "Low Stock" : "Out of Stock"));
        html += `
          <p><strong>Name:</strong> ${wizardData.productInfo?.name || "N/A"}</p>
          <p><strong>Category:</strong> ${wizardData.productInfo?.category || "N/A"}</p>
          <p><strong>Price:</strong> ₱${Number(wizardData.productInfo?.price || 0).toFixed(2)}</p>
          <p><strong>Tracking:</strong> ${selectedTrackingType === "batch" ? "Batch Tracking" : "Normal Tracking"}</p>
          <p><strong>Quantity:</strong> ${wizardData.productInfo?.quantity || 0} units</p>
          <p><strong>Stock Status:</strong> ${stockStatus}</p>
        `
      } else {
        const selectedProduct = allProducts.find((p) => p.product_id === wizardData.existingProduct?.productId)
        html += `
          <p><strong>Product:</strong> ${selectedProduct?.name || "N/A"}</p>
          <p><strong>Category:</strong> ${selectedProduct?.category || "N/A"}</p>
          <p><strong>Price:</strong> ₱${Number(selectedProduct?.price || 0).toFixed(2)}</p>
          <p><strong>Batch Size:</strong> ${wizardData.existingProduct?.batchSize || 0} units</p>
        `
      }

      html += `
              </div>
            </div>
          </div>
        </div>
      `

      // Add a summary of materials, costs, and schedule if available
      if (wizardData.materials && wizardData.materials.length > 0) {
        html += `
          <div class="card mb-4">
            <div class="card-header bg-light">
              <h6 class="mb-0"><i class="bi bi-list-ul me-2"></i>Materials (${wizardData.materials.length})</h6>
            </div>
            <div class="card-body">
              <div class="table-responsive">
                <table class="table table-sm">
                  <thead>
                    <tr>
                      <th>Material</th>
                      <th>Quantity</th>
                    </tr>
                  </thead>
                  <tbody>
        `
        wizardData.materials.forEach((material) => {
          html += `
            <tr>
              <td>${material.materialName || material.material_id || "N/A"}</td>
              <td>${material.quantity}</td>
            </tr>
          `
        })
        html += `
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        `
      }

      html += `
        <div class="row mb-4">
          <div class="col-md-6">
            <div class="card">
              <div class="card-header bg-light">
                <h6 class="mb-0"><i class="bi bi-calculator me-2"></i>Cost Summary</h6>
              </div>
              <div class="card-body">
                <p><strong>Material Cost:</strong> ₱${totalMaterialCost.toFixed(2)}</p>
                <p><strong>Cost per Unit:</strong> ₱${costPerUnit.toFixed(2)}</p>
                <p><strong>Total Cost:</strong> ₱${totalProductionCost.toFixed(2)}</p>
              </div>
            </div>
          </div>
          <div class="col-md-6">
            <div class="card">
              <div class="card-header bg-light">
                <h6 class="mb-0"><i class="bi bi-clock me-2"></i>Schedule</h6>
              </div>
              <div class="card-body">
                <p><strong>Start Date:</strong> ${wizardData.schedule?.startDate || "N/A"}</p>
                <p><strong>Start Time:</strong> ${wizardData.schedule?.startTime || "N/A"}</p>
                <p><strong>Priority:</strong> ${wizardData.schedule?.priority || "Normal"}</p>
                <p><strong>Operator:</strong> ${wizardData.schedule?.assignedTo || "N/A"}</p>
              </div>
            </div>
          </div>
        </div>
      `

      reviewContent.innerHTML = html
    } catch (err) {
      console.error("Error in populateReviewContent:", err)
    }
  }

  

  function showValidationError(message = "Please complete all required fields before proceeding.") {
    // Show the notice modal with the message
    const noticeModalMessage = document.getElementById("noticeModalMessage")
    if (noticeModalMessage) noticeModalMessage.textContent = message
    const noticeModal = new bootstrap.Modal(document.getElementById("noticeModal"))
    noticeModal.show()
  }

    function generateProductId() {
    const category = categorySelect.value; // Get selected category
    if (!category) {
      productIdInput.value = ""; // Clear product ID if no category selected
      return;
    }

    const timestamp = Date.now(); // Get current timestamp
    const productId = `${category.substring(0, 2).toUpperCase()}${timestamp}`; // Generate product ID
    productIdInput.value = productId; // Set the product ID in the input field
  }

  // Add event listener for category change to regenerate the product ID
  categorySelect.addEventListener("change", generateProductId);

  // Ensure the product ID is generated when the modal is opened
  if (produceProductModal) {
    produceProductModal.addEventListener("show.bs.modal", function () {
      generateProductId(); // Generate ID when modal is opened
    });
  }


  // MATERIAL MANAGEMENT FUNCTIONS

  function addMaterialRow() {
    const materialRow = document.createElement("div")
    materialRow.className = "recipe-item"
    materialRow.innerHTML = `
      <div class="row">
        <div class="col-md-4 mb-3">
          <label class="form-label">Material *</label>
          <select class="form-select material-select" name="materials[]" required>
            <option value="">Select material</option>
            ${allMaterials.map((material) => `<option value="${material.id}">${material.name}</option>`).join("")}
          </select>
        </div>
        <div class="col-md-2 mb-3">
          <label class="form-label">Quantity</label>
          <input type="number" class="form-control quantity-input" name="quantities[]" step="0.01" required min="0" placeholder="0.00" style="min-width: 5rem;">
        </div>
        <div class="col-md-2 mb-3">
          <label class="form-label">Unit</label>
          <div class="material-unit">-</div>
        </div>
        <div class="col-md-2 mb-3">
          <label class="form-label">Unit Cost (₱)</label>
          <div class="material-cost">0.00</div>
        </div>
        <div class="col-md-2 mb-3">
          <label class="form-label">Total Cost (₱)</label>
          <input type="number" class="form-control material-total-cost" name="material_costs[]" step="0.01" readonly placeholder="0.00">
        </div>
        <div class="col-md-1 mb-3">
          <label class="form-label">Stock</label>
          <div class="stock-indicator">
            <span class="stock-status"></span>
          </div>
        </div>
        <div class="col-md-1 mb-3" style="margin-left: 5rem;">
          <label class="form-label">&nbsp;</label>
          <button type="button" class="btn btn-outline-danger remove-material w-100">
            <i class="bi bi-trash"></i>
          </button>
        </div>
      </div>
    `
    recipeMaterials.appendChild(materialRow)
    const materialSelect = materialRow.querySelector(".material-select")
    const quantityInput = materialRow.querySelector(".quantity-input")
    const removeButton = materialRow.querySelector(".remove-material")
    materialSelect.addEventListener("change", () => {
      updateMaterialDetails(materialRow)
      updateMaterialCosts()
      updateMaterialDropdowns()
    })
    quantityInput.addEventListener("input", () => {
      updateMaterialDetails(materialRow)
      updateStockStatus(materialRow)
    })
    removeButton.addEventListener("click", () => {
      materialRow.remove()
      updateMaterialCosts()
      updateMaterialDropdowns()
    })
    updateMaterialDropdowns()
  }

  function updateMaterialDetails(materialRow) {
    const materialSelect = materialRow.querySelector(".material-select")
    const materialUnitDisplay = materialRow.querySelector(".material-unit")
    const materialCostDisplay = materialRow.querySelector(".material-cost")
    const totalCostInput = materialRow.querySelector(".material-total-cost")

    let unitCost = 0
    let totalCost = 0

    if (materialSelect.value) {
      const selectedOption = materialSelect.options[materialSelect.selectedIndex]
      let material = null
      try {
        material = JSON.parse(selectedOption.dataset.materialData)
      } catch (e) {
        material = allMaterials.find((m) => (m.material_id || m.id) == materialSelect.value)
      }
      if (material) {
        const measurementType = material.measurement_type || material.unit || ""
        let unitText = measurementType
        if (measurementType === "pack" && material.pieces_per_container) {
          unitText = `${measurementType} (${material.pieces_per_container} pcs)`
        }
        materialUnitDisplay.textContent = unitText
        // Calculate unit cost and total cost
        if (material.unit_cost) {
          unitCost = Number.parseFloat(material.unit_cost)
        } else if (material.cost && material.quantity) {
          const totalMaterialCost = Number.parseFloat(material.cost)
          const totalMaterialQuantity = Number.parseFloat(material.quantity)
          if (totalMaterialQuantity > 0) {
            if (measurementType === "pack" && material.pieces_per_container) {
              const totalPieces = totalMaterialQuantity * Number.parseFloat(material.pieces_per_container)
              unitCost = totalMaterialCost / totalPieces
            } else {
              unitCost = totalMaterialCost / totalMaterialQuantity
            }
          }
        }
        const quantityInput = materialRow.querySelector(".quantity-input")
        const usedQuantity = Number.parseFloat(quantityInput?.value) || 0
        totalCost = usedQuantity * unitCost
        materialCostDisplay.textContent = `₱${unitCost.toFixed(2)}`
        if (totalCostInput) {
          totalCostInput.value = totalCost.toFixed(2)
          totalCostInput.style.display = "" // Ensure it's visible
        }
        updateStockStatus(materialRow)
      } else {
        materialUnitDisplay.textContent = "-"
        materialCostDisplay.textContent = "₱0.00"
        if (totalCostInput) {
          totalCostInput.value = "0.00"
          totalCostInput.style.display = ""
        }
      }
    } else {
      materialUnitDisplay.textContent = "-"
      materialCostDisplay.textContent = "₱0.00"
      if (totalCostInput) {
        totalCostInput.value = "0.00"
        totalCostInput.style.display = ""
      }
    }
    // Always update costs after any change
    updateMaterialCosts()
  }

  // COST CALCULATION FUNCTIONS

  function calculateAccurateMaterialCost(material, quantityUsed) {
    const usedQuantity = Number.parseFloat(quantityUsed) || 0

    if (usedQuantity <= 0) {
      return {
        totalCost: 0,
        unitCost: 0,
        usedQuantity: 0,
        calculationMethod: "zero_quantity",
        materialId: material.id,
        materialName: material.name,
        availableQuantity: Number.parseFloat(material.quantity || 0),
        measurementType: material.measurement_type,
      }
    }

    let totalCost = 0
    let unitCost = 0
    let calculationMethod = ""
    let calculationDetails = ""

    switch (material.measurement_type?.toLowerCase()) {
      case "kg":
      case "g":
      case "ml":
      case "l":
      case "unit":
        const totalMaterialCost = Number.parseFloat(material.cost || 0)
        const totalMaterialQuantity = Number.parseFloat(material.quantity || 0)

        if (totalMaterialQuantity > 0) {
          unitCost = totalMaterialCost / totalMaterialQuantity
          totalCost = usedQuantity * unitCost
          calculationMethod = "proportional_by_weight_volume"
          calculationDetails = `₱${totalMaterialCost.toFixed(2)} ÷ ${totalMaterialQuantity}${material.measurement_type} × ${usedQuantity}${material.measurement_type} = ₱${totalCost.toFixed(2)}`
        }
        break

      case "pack":
      case "container":
      case "box":
        const numberOfPacks = Number.parseFloat(material.quantity || 0)
        const piecesPerContainer = Number.parseFloat(material.pieces_per_container || 1)
        const materialCost = Number.parseFloat(material.cost || 0)

        if (piecesPerContainer > 0 && numberOfPacks > 0) {
          const totalPiecesAvailable = numberOfPacks * piecesPerContainer
          const costPerPiece = materialCost / totalPiecesAvailable

          unitCost = costPerPiece
          totalCost = usedQuantity * costPerPiece
          calculationMethod = "per_pack_with_pieces"
          calculationDetails = `₱${materialCost.toFixed(2)} ÷ (${numberOfPacks} packs × ${piecesPerContainer} pcs) = ₱${costPerPiece.toFixed(4)} per piece × ${usedQuantity} pcs = ₱${totalCost.toFixed(2)}`
        }
        break

      case "pieces":
        unitCost = Number.parseFloat(material.unit_cost || material.cost || 0)
        totalCost = usedQuantity * unitCost
        calculationMethod = "direct_pieces"
        calculationDetails = `₱${unitCost.toFixed(2)} per piece × ${usedQuantity} pieces = ₱${totalCost.toFixed(2)}`
        break

      default:
        unitCost = Number.parseFloat(material.cost || 0)
        totalCost = usedQuantity * unitCost
        calculationMethod = "fallback_simple"
        calculationDetails = `₱${unitCost.toFixed(2)} × ${usedQuantity} = ₱${totalCost.toFixed(2)}`
        break
    }

    return {
      totalCost: totalCost,
      unitCost: unitCost,
      usedQuantity: usedQuantity,
      calculationMethod: calculationMethod,
      calculationDetails: calculationDetails,
      materialId: material.id,
      materialName: material.name,
      availableQuantity: Number.parseFloat(material.quantity || 0),
      totalPiecesAvailable: ["pack", "container", "box"].includes(material.measurement_type?.toLowerCase())
        ? Number.parseFloat(material.quantity || 0) * Number.parseFloat(material.pieces_per_container || 1)
        : Number.parseFloat(material.quantity || 0),
      measurementType: material.measurement_type,
      piecesPerContainer: material.pieces_per_container,
      containerType: material.container_type,
    }
  }

  // Enhanced material cost calculation
  function updateMaterialCosts() {
    totalMaterialCost = 0
    const materialRows = document.querySelectorAll(".recipe-item")
    const materialUsageDetails = []

    materialRows.forEach((row) => {
      const materialSelect = row.querySelector(".material-select")
      const quantityInput = row.querySelector(".quantity-input")
      const totalCostInput = row.querySelector(".material-total-cost")
      const materialCostDisplay = row.querySelector(".material-cost")

      if (materialSelect.value && quantityInput.value) {
        const material = allMaterials.find((m) => m.id == materialSelect.value)
        const quantity = Number.parseFloat(quantityInput.value) || 0
        if (material) {
          const costCalculation = calculateAccurateMaterialCost(material, quantity)
          materialUsageDetails.push(costCalculation)
          // Only update if not already set by updateMaterialDetails
          if (materialCostDisplay && materialCostDisplay.textContent === "0.00") {
            materialCostDisplay.textContent = `₱${costCalculation.unitCost.toFixed(2)}`
          }
          if (totalCostInput && (totalCostInput.value === "" || totalCostInput.value === "0.00")) {
            totalCostInput.value = costCalculation.totalCost.toFixed(2)
          }
          totalMaterialCost += costCalculation.totalCost
          const unitDisplay = row.querySelector(".material-unit")
          if (unitDisplay) {
            let unitText = material.measurement_type
            if (material.measurement_type === "pack" && material.pieces_per_container) {
              unitText = `${material.measurement_type} (${material.pieces_per_container} pcs)`
            }
            unitDisplay.textContent = unitText
          }
        }
      }
    })
    window.currentMaterialUsage = materialUsageDetails
    updateBatchQuantityForCurrentType()
    updateMaterialCostSummary()
    updateTotalProductionCost()
    updateProfitCalculations()
  }

  // New function to update batch quantity based on current production type
  function updateBatchQuantityForCurrentType() {
    if (selectedProductionType === "existing-batch") {
      updateExistingProductBatchQuantity()
    } else {
      calculateTotalBatchQuantity()
    }
  }

  // Enhanced material cost summary with proper batch quantity calculation
  function updateMaterialCostSummary() {
    // Ensure we have the latest batch quantity
    const batchQuantity = totalBatchQuantity || 1 // Prevent division by zero
    // Only material cost per unit (no operational cost)
    const materialCostPerUnit = batchQuantity > 0 ? totalMaterialCost / batchQuantity : 0

    // Update all material cost summary displays
    const totalMaterialCostEl = document.getElementById("total-material-cost")
    const materialCostPerUnitEl = document.getElementById("material-cost-per-unit")
    const finalMaterialCostEl = document.getElementById("final-material-cost")

    if (totalMaterialCostEl) totalMaterialCostEl.textContent = `₱${totalMaterialCost.toFixed(2)}`
    if (materialCostPerUnitEl) materialCostPerUnitEl.textContent = `₱${materialCostPerUnit.toFixed(2)}`
    if (finalMaterialCostEl) finalMaterialCostEl.textContent = `₱${totalMaterialCost.toFixed(2)}`

    // Optionally, log for debugging
    console.log(`Material Cost Summary Updated:`, {
      totalMaterialCost: totalMaterialCost,
      batchQuantity: batchQuantity,
      materialCostPerUnit: materialCostPerUnit,
      selectedProductionType: selectedProductionType,
    })
  }

  function calculateLaborCost() {
    const workers = Number.parseInt(document.getElementById("worker-count").value) || 1
    const hours = Number.parseFloat(document.getElementById("work-hours").value) || 8
    const rate = Number.parseFloat(document.getElementById("hourly-rate").value) || 75

    const totalLaborCost = workers * hours * rate
    document.getElementById("labor-cost").value = totalLaborCost.toFixed(2)

    updateOperationalCosts()
  }

  function updateOperationalCosts() {
    calculateTotalBatchQuantity(); // Ensure batch quantity is always up-to-date
    const electricityCost = Number.parseFloat(document.getElementById("electricity-cost").value) || 0
    const gasCost = Number.parseFloat(document.getElementById("gas-cost").value) || 0
    const laborCost = Number.parseFloat(document.getElementById("labor-cost").value) || 0

    totalOperationalCost = electricityCost + gasCost + laborCost

    document.getElementById("electricity-cost-display").textContent = `₱${electricityCost.toFixed(2)}`
    document.getElementById("gas-cost-display").textContent = `₱${gasCost.toFixed(2)}`
    document.getElementById("labor-cost-display").textContent = `₱${laborCost.toFixed(2)}`
    document.getElementById("total-operational-cost").textContent = `₱${totalOperationalCost.toFixed(2)}`
    document.getElementById("final-operational-cost").textContent = `₱${totalOperationalCost.toFixed(2)}`

    updateTotalProductionCost()
    updateProfitCalculations()
  }

  function updateTotalProductionCost() {
    // In Complete Production modal, use the value from quantity_produced as batch quantity
    let batchQuantity = 1;
    const qpInput = document.getElementById('quantity_produced');
    if (qpInput && qpInput.value) {
      batchQuantity = Number.parseInt(qpInput.value) || 1;
    } else if (typeof totalBatchQuantity !== 'undefined' && totalBatchQuantity > 0) {
      batchQuantity = totalBatchQuantity;
    }
    totalProductionCost = totalMaterialCost + totalOperationalCost;
    const costPerUnit = batchQuantity > 0 ? totalProductionCost / batchQuantity : 0;
    document.getElementById("total-production-cost").textContent = `₱${totalProductionCost.toFixed(2)}`;
    document.getElementById("final-cost-per-unit").textContent = `₱${costPerUnit.toFixed(2)}`;
  }

  function updateProfitCalculations() {
    // In Complete Production modal, use the value from quantity_produced as batch quantity
    let batchQuantity = 1;
    const qpInput = document.getElementById('quantity_produced');
    if (qpInput && qpInput.value) {
      batchQuantity = Number.parseInt(qpInput.value) || 1;
    } else if (typeof totalBatchQuantity !== 'undefined' && totalBatchQuantity > 0) {
      batchQuantity = totalBatchQuantity;
    }
    
    let price = 0;
    const priceInput = document.getElementById('new-product-price-completion');
    if (priceInput) {
      price = Number.parseFloat(priceInput.value) || 0;
    }
    
    // For existing batch productions, fetch price from database if not available
    if (price === 0 && selectedProductionType === "existing-batch") {
      const productId = document.getElementById('completion-product-select')?.value || 
                       document.getElementById('existing-product-select')?.value;
      
      if (productId) {
        // Try to get price from loaded products first
        const product = allProducts.find((p) => p.product_id === productId);
        if (product && product.price) {
          price = Number.parseFloat(product.price) || 0;
        } else {
          // Fetch from database if not in loaded products
          fetchExistingProductPrice(productId).then(fetchedPrice => {
            price = fetchedPrice;
            updateProfitCalculationsDisplay(batchQuantity, price);
          }).catch(error => {
            console.error('Error fetching product price:', error);
            updateProfitCalculationsDisplay(batchQuantity, 0);
          });
          return; // Exit early, will be updated by the async call
        }
      }
    }
    
    updateProfitCalculationsDisplay(batchQuantity, price);
  }

  // Helper function to fetch existing product price from database
  async function fetchExistingProductPrice(productId) {
    try {
      const response = await fetch(`get_product.php?id=${encodeURIComponent(productId)}`);
      const data = await response.json();
      
      if (data.success && data.product) {
        return Number.parseFloat(data.product.price) || 0;
      } else {
        console.error('Failed to fetch product price:', data.error || 'Unknown error');
        return 0;
      }
    } catch (error) {
      console.error('Error fetching product price:', error);
      return 0;
    }
  }

  // Helper function to update profit calculations display
  function updateProfitCalculationsDisplay(batchQuantity, price) {
    totalRevenue = price * batchQuantity;
    totalProfit = totalRevenue - totalProductionCost;
    const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;
    const costPerUnit = batchQuantity > 0 ? totalProductionCost / batchQuantity : 0;
    
    // Update display elements
    const revenuePerUnitEl = document.getElementById("revenue-per-unit");
    const profitPerUnitEl = document.getElementById("profit-per-unit");
    const totalRevenueEl = document.getElementById("total-revenue");
    const totalProfitEl = document.getElementById("total-profit");
    const profitMarginEl = document.getElementById("profit-margin");
    
    if (revenuePerUnitEl) revenuePerUnitEl.textContent = `₱${price.toFixed(2)}`;
    if (profitPerUnitEl) profitPerUnitEl.textContent = `₱${(price - costPerUnit).toFixed(2)}`;
    if (totalRevenueEl) totalRevenueEl.textContent = `₱${totalRevenue.toFixed(2)}`;
    if (totalProfitEl) totalProfitEl.textContent = `₱${totalProfit.toFixed(2)}`;
    if (profitMarginEl) profitMarginEl.textContent = `${profitMargin.toFixed(1)}%`;
    
    console.log('[DEBUG] Profit calculations updated:', {
      batchQuantity,
      price,
      totalRevenue,
      totalProductionCost,
      totalProfit,
      profitMargin
    });
  }

  // SIZE AND PRICING FUNCTIONS

  function handleSizeOptionChange() {
    const selected = sizeOptionInput.value
    if (selected === "multiple") {
      sizeTypeGroup.style.display = "block"
      sizePriceGroup.style.display = "block"
      singleQuantityGroup.style.display = "none"
      productPriceInput.closest(".col-md-6").style.display = "none"
      sizesContainer.innerHTML = ""

      if (sizeTypeSelect.value) {
        addSizeRow()
      }
    } else {
      sizeTypeGroup.style.display = "none"
      sizePriceGroup.style.display = "none"
      singleQuantityGroup.style.display = "block"
      productPriceInput.closest(".col-md-6").style.display = "block"
      sizesContainer.innerHTML = ""
    }

    // Hide/show Unit header based on size type
    setTimeout(() => {
      const unitHeader = document.querySelector("#size-price-group .row.mb-2 > .col-md-2")
      if (sizeTypeSelect.value === "sml") {
        if (unitHeader) unitHeader.style.display = "none"
      } else {
        if (unitHeader) unitHeader.style.display = ""
      }
      updateMaterialCosts()
    }, 100)
  }

  // Existing product size option handling
  function handleExistingSizeOptionChange() {
    const selected = existingSizeOptionInput.value
    if (selected === "multiple") {
      existingSizeTypeGroup.style.display = "block"
      existingSizeBatchGroup.style.display = "block"
      existingSingleBatchGroup.style.display = "none"
      existingSizesContainer.innerHTML = ""

      if (existingSizeTypeSelect.value) {
        addExistingSizeRow()
      }
    } else {
      existingSizeTypeGroup.style.display = "none"
      existingSizeBatchGroup.style.display = "none"
      existingSingleBatchGroup.style.display = "block"
      existingSizesContainer.innerHTML = ""
    }

    // Update batch quantity calculation when size option changes
    setTimeout(() => {
      updateExistingProductBatchQuantity()
      updateMaterialCosts()
    }, 100)
  }

  // Ensure addSizeRow is globally accessible for the add size button
  window.addSizeRow = addSizeRow

  function addSizeRow() {
    const type = sizeTypeSelect.value
    const row = document.createElement("div")
    row.classList.add("row", "mb-2")

    // Create either dropdown or input based on size type
    let sizeElement
    if (type === "sml") {
      // Collect already selected sizes
      const selectedSizes = Array.from(document.querySelectorAll('select[name="size[]"]')).map((sel) => sel.value)
      // Use dropdown for Small, Medium, Large
      sizeElement = document.createElement("select")
      sizeElement.name = "size[]"
      sizeElement.className = "form-select"
      sizeElement.required = true

      const defaultOpt = document.createElement("option")
      defaultOpt.value = ""
      defaultOpt.textContent = "Select size"
      sizeElement.appendChild(defaultOpt)

      if (sizeOptions[type]) {
        sizeOptions[type].forEach((optText) => {
          if (!selectedSizes.includes(optText)) {
            const opt = document.createElement("option")
            opt.value = optText
            opt.textContent = optText
            sizeElement.appendChild(opt)
          }
        })
      }

      // For SML, do NOT render the unit column at all
      row.innerHTML = `
        <div class="col-md-3"></div>
        <div class="col-md-3">
          <input type="number" class="form-control size-quantity-input" name="size_quantity[]" placeholder="Quantity" min="1" required>
        </div>
        <div class="col-md-3">
          <input type="number" class="form-control size-price-input" name="size_price[]" placeholder="Price (₱)" min="0" step="0.01" required>
        </div>
        <div class="col-md-1 d-flex align-items-center">
          <button type="button" class="btn btn-danger btn-sm remove-size-row-btn" >×</button>
        </div>
      `
    } else {
      // Use manual input for other types (ml, g, unit)
      sizeElement = document.createElement("input")
      sizeElement.type = "text"
      sizeElement.name = "size[]"
      sizeElement.className = "form-control"
      sizeElement.placeholder =
        type === "ml"
          ? "Enter size (e.g., 250, 500)"
          : type === "g"
            ? "Enter weight (e.g., 100, 250)"
            : "Enter quantity (e.g., 1, 2, 5)"
      sizeElement.required = true

      // For other types, keep the unit dropdown
      row.innerHTML = `
        <div class="col-md-3"></div>
        <div class="col-md-2">
          <select class="form-select" name="size_unit[]">
            <option value="">Unit</option>
            <option value="ml">ml</option>
            <option value="g">g</option>
            <option value="pcs">pcs</option>
            <option value="L">L</option>
            <option value="kg">kg</option>
            <option value="oz">oz</option>
            <option value="lb">lb</option>
          </select>
        </div>
        <div class="col-md-3">
          <input type="number" class="form-control size-quantity-input" name="size_quantity[]" placeholder="Quantity" min="1" required>
        </div>
        <div class="col-md-3">
          <input type="number" class="form-control size-price-input" name="size_price[]" placeholder="Price (₱)" min="0" step="0.01" required>
        </div>
        <div class="col-md-1 d-flex align-items-center">
          <button type="button" class="btn btn-danger btn-sm remove-size-row-btn" >×</button>
        </div>
      `
    }
    row.children[0].appendChild(sizeElement)
    sizesContainer.appendChild(row)

    // Add event listeners to update costs when size quantities or prices change
    const quantityInput = row.querySelector(".size-quantity-input")
    const priceInput = row.querySelector(".size-price-input")
    const removeBtn = row.querySelector(".remove-size-row-btn")

    if (quantityInput) {
      quantityInput.addEventListener("input", () => {
        updateMaterialCosts()
        updateTotalProductionCost()
        updateProfitCalculations()
      })
    }

    if (priceInput) {
      priceInput.addEventListener("input", () => {
        updateMaterialCosts()
        updateTotalProductionCost()
        updateProfitCalculations()
      })
    }

    // Add listener for size changes (both dropdown and input)
    if (sizeElement) {
      sizeElement.addEventListener("change", () => {
        updateMaterialCosts()
        updateTotalProductionCost()
        updateProfitCalculations()
        // When a size is selected, update all SML dropdowns to remove already selected options
        if (type === "sml") {
          updateSMLDropdownOptions()
        }
      })
      sizeElement.addEventListener("input", () => {
        updateMaterialCosts()
        updateTotalProductionCost()
        updateProfitCalculations()
      })
    }

    // Remove row and update SML dropdowns
    if (removeBtn) {
      removeBtn.addEventListener("click", () => {
        row.remove()
        updateMaterialCosts()
        updateTotalProductionCost()
        updateProfitCalculations()
        if (type === "sml") {
          updateSMLDropdownOptions()
        }
      })
    }
  }

  // Helper to update SML dropdowns to prevent duplicate selection
  function updateSMLDropdownOptions() {
    const type = sizeTypeSelect.value
    if (type !== "sml") return
    const allDropdowns = Array.from(document.querySelectorAll('select[name="size[]"]'))
    const selectedSizes = allDropdowns.map((sel) => sel.value)
    allDropdowns.forEach((dropdown) => {
      const currentValue = dropdown.value
      // Remove all options except default and current value
      Array.from(dropdown.options).forEach((opt) => {
        if (opt.value !== "" && opt.value !== currentValue) {
          dropdown.removeChild(opt)
        }
      })
      // Add back only unselected options
      if (sizeOptions[type]) {
        sizeOptions[type].forEach((optText) => {
          if (!selectedSizes.includes(optText) || optText === currentValue) {
            if (![...dropdown.options].some((o) => o.value === optText)) {
              const opt = document.createElement("option")
              opt.value = optText
              opt.textContent = optText
              dropdown.appendChild(opt)
            }
          }
        })
      }
    })
  }

  // Improved existing size row function with proper event listeners
  function addExistingSizeRow() {
    const type = existingSizeTypeSelect.value
    const row = document.createElement("div")
    row.classList.add("row", "mb-2")

    // Create either dropdown or input based on size type
    let sizeElement
    if (type === "sml") {
      // Collect already selected sizes for existing product
      const selectedSizes = Array.from(document.querySelectorAll("select.existing-size-select")).map((sel) => sel.value)
      // Use dropdown for Small, Medium, Large
      sizeElement = document.createElement("select")
      sizeElement.name = "existing_size[]"
      sizeElement.className = "form-select existing-size-select"
      sizeElement.required = true

      const defaultOpt = document.createElement("option")
      defaultOpt.value = ""
      defaultOpt.textContent = "Select size"
      sizeElement.appendChild(defaultOpt)

      if (sizeOptions[type]) {
        sizeOptions[type].forEach((optText) => {
          if (!selectedSizes.includes(optText)) {
            const opt = document.createElement("option")
            opt.value = optText
            opt.textContent = optText
            sizeElement.appendChild(opt)
          }
        })
      }

      // For SML, do NOT render the unit column at all
      row.innerHTML = `
      <div class="col-md-3"></div>
      <div class="col-md-6">
        <input type="number" class="form-control existing-size-batch-quantity" name="existing_size_batch_quantity[]" placeholder="Batch Quantity" min="1" required>
      </div>
      <div class="col-md-1 d-flex align-items-center">
        <button type="button" class="btn btn-danger btn-sm remove-existing-size-btn">×</button>
      </div>
    `
    } else {
      // Use manual input for other types (ml, g, unit)
      sizeElement = document.createElement("input")
      sizeElement.type = "text"
      sizeElement.name = "existing_size[]"
      sizeElement.className = "form-control existing-size-input"
      sizeElement.placeholder =
        type === "ml"
          ? "Enter size (e.g., 250, 500)"
          : type === "g"
            ? "Enter weight (e.g., 100, 250)"
            : "Enter quantity (e.g., 1, 2, 5)"
      sizeElement.required = true

      row.innerHTML = `
      <div class="col-md-3"></div>
      <div class="col-md-2">
        <select class="form-select existing-size-unit" name="existing_size_unit[]">
          <option value="">Unit</option>
          <option value="ml">ml</option>
          <option value="g">g</option>
          <option value="pcs">pcs</option>
          <option value="L">L</option>
          <option value="kg">kg</option>
          <option value="oz">oz</option>
          <option value="lb">lb</option>
        </select>
      </div>
      <div class="col-md-6">
        <input type="number" class="form-control existing-size-batch-quantity" name="existing_size_batch_quantity[]" placeholder="Batch Quantity" min="1" required>
      </div>
      <div class="col-md-1 d-flex align-items-center">
        <button type="button" class="btn btn-danger btn-sm remove-existing-size-btn">×</button>
      </div>
    `
    }
    row.children[0].appendChild(sizeElement)
    existingSizesContainer.appendChild(row)

    // Add event listeners to update batch quantity and costs when values change
    const batchQuantityInput = row.querySelector(".existing-size-batch-quantity")
    const sizeUnitSelect = row.querySelector(".existing-size-unit")
    const removeBtn = row.querySelector(".remove-existing-size-btn")

    if (batchQuantityInput) {
      batchQuantityInput.addEventListener("input", () => {
        updateExistingProductBatchQuantity()
        updateMaterialCosts()
      })
    }

    if (sizeUnitSelect) {
      sizeUnitSelect.addEventListener("change", () => {
        updateExistingProductBatchQuantity()
        updateMaterialCosts()
      })
    }

    // Add listeners for size changes (both dropdown and input)
    if (sizeElement) {
      sizeElement.addEventListener("change", () => {
        updateExistingProductBatchQuantity()
        updateMaterialCosts()
        // When a size is selected, update all SML dropdowns to remove already selected options
        if (type === "sml") {
          updateExistingSMLDropdownOptions()
        }
      })
      sizeElement.addEventListener("input", () => {
        updateExistingProductBatchQuantity()
        updateMaterialCosts()
      })
    }

    // Remove row and update SML dropdowns
    if (removeBtn) {
      removeBtn.addEventListener("click", () => {
        row.remove()
        updateExistingProductBatchQuantity()
        updateMaterialCosts()
        if (type === "sml") {
          updateExistingSMLDropdownOptions()
        }
      })
    }
  }

  // Helper to update SML dropdowns to prevent duplicate selection in Another Batch
  function updateExistingSMLDropdownOptions() {
    const type = existingSizeTypeSelect.value
    if (type !== "sml") return
    const allDropdowns = Array.from(document.querySelectorAll("select.existing-size-select"))
    const selectedSizes = allDropdowns.map((sel) => sel.value)
    allDropdowns.forEach((dropdown) => {
      const currentValue = dropdown.value
      // Remove all options except default and current value
      Array.from(dropdown.options).forEach((opt) => {
        if (opt.value !== "" && opt.value !== currentValue) {
          dropdown.removeChild(opt)
        }
      })
      // Add back only unselected options
      if (sizeOptions[type]) {
        sizeOptions[type].forEach((optText) => {
          if (!selectedSizes.includes(optText) || optText === currentValue) {
            if (![...dropdown.options].some((o) => o.value === optText)) {
              const opt = document.createElement("option")
              opt.value = optText
              opt.textContent = optText
              dropdown.appendChild(opt)
            }
          }
        })
      }
    })
  }

  // Calculate total batch quantity for existing product with multiple sizes
  function updateExistingProductBatchQuantity() {
    if (selectedProductionType !== "existing-batch") return 0

    const sizeOption = document.getElementById("existing-size-option")?.value
    let totalQuantity = 0

    if (sizeOption === "multiple") {
      // Calculate total from multiple sizes
      const sizeBatchQuantities = document.querySelectorAll(".existing-size-batch-quantity")
      sizeBatchQuantities.forEach((input) => {
        const quantity = Number.parseInt(input.value) || 0
        totalQuantity += quantity
      })
    } else {
      // Single size quantity
      const singleBatchSize = document.getElementById("existing-batch-size")?.value
      totalQuantity = Number.parseInt(singleBatchSize) || 0
    }

    // Update the global total batch quantity
    totalBatchQuantity = totalQuantity

    console.log(`Existing Product Batch Quantity Updated:`, {
      sizeOption: sizeOption,
      totalQuantity: totalQuantity,
      totalBatchQuantity: totalBatchQuantity,
    })

    return totalQuantity
  }

  function calculateTotalBatchQuantity() {
    if (selectedProductionType === "existing-batch") {
      return updateExistingProductBatchQuantity()
    }

    const sizeOption = document.getElementById("size-option")?.value
    let totalQuantity = 0

    if (sizeOption === "multiple") {
      const sizeQuantities = document.querySelectorAll('input[name="size_quantity[]"]')
      sizeQuantities.forEach((input) => {
        const quantity = Number.parseInt(input.value) || 0
        totalQuantity += quantity
      })
    } else {
      const singleQuantity = document.getElementById("new-product-quantity")?.value
      totalQuantity = Number.parseInt(singleQuantity) || 0
    }

    totalBatchQuantity = totalQuantity
    return totalQuantity
  }

  // Calculate total revenue considering both new and existing products
  function calculateTotalRevenue() {
    if (selectedProductionType === "existing-batch") {
      return calculateExistingProductRevenue()
    }

    const sizeOption = document.getElementById("size-option")?.value
    let revenue = 0

    if (sizeOption === "multiple") {
      const sizeQuantities = document.querySelectorAll('input[name="size_quantity[]"]')
      const sizePrices = document.querySelectorAll('input[name="size_price[]"]')

      sizeQuantities.forEach((quantityInput, index) => {
        const quantity = Number.parseInt(quantityInput.value) || 0
        const price = Number.parseFloat(sizePrices[index]?.value) || 0
        revenue += quantity * price
      })
    } else {
      const quantity = Number.parseInt(document.getElementById("new-product-quantity")?.value) || 0
      const price = Number.parseFloat(document.getElementById("new-product-price")?.value) || 0
      revenue = quantity * price
    }

    totalRevenue = revenue
    return revenue
  }

  function calculateExistingProductRevenue() {
    // Check for product ID in both Start Production and Complete Production modals
    const productId = document.getElementById("existing-product-select")?.value || 
                     document.getElementById("completion-product-select")?.value;
    
    if (!productId) {
      console.log('[DEBUG] Revenue calculation: No productId found');
      return 0;
    }

    // Try to get product from loaded products first
    let product = allProducts.find((p) => p.product_id === productId);
    
    // If product not found in loaded products, fetch from database
    if (!product) {
      console.log('[DEBUG] Product not found in loaded products, fetching from database...');
      return fetchExistingProductPrice(productId).then(price => {
        // For Complete Production modal, use quantity_produced
        const quantity = Number.parseInt(document.getElementById('quantity_produced')?.value) || 0;
        const revenue = quantity * price;
        console.log('[DEBUG] Revenue calculation (from DB):', 'productId:', productId, 'quantity:', quantity, 'price:', price, 'revenue:', revenue);
        totalRevenue = revenue;
        return revenue;
      }).catch(error => {
        console.error('Error fetching product for revenue calculation:', error);
        return 0;
      });
    }

    // Check if we're in Complete Production modal or Start Production modal
    const isCompleteModal = document.getElementById('completeProductionModal')?.classList.contains('show');
    
    if (isCompleteModal) {
      // Complete Production modal - use quantity_produced and product price
      const quantity = Number.parseInt(document.getElementById('quantity_produced')?.value) || 0;
      const price = Number.parseFloat(product.price || 0);
      const revenue = quantity * price;
      console.log('[DEBUG] Revenue calculation (Complete modal):', 'productId:', productId, 'quantity:', quantity, 'price:', price, 'revenue:', revenue);
      totalRevenue = revenue;
      return revenue;
    } else {
      // Start Production modal - use existing logic
      const sizeOption = document.getElementById("existing-size-option")?.value;
      let revenue = 0;

      if (sizeOption === "multiple") {
        // Get product sizes if available
        let productSizes = [];
        try {
          if (product.sizes) {
            productSizes = JSON.parse(product.sizes);
          }
        } catch (e) {
          console.error("Error parsing product sizes:", e);
        }

        // Calculate revenue from multiple sizes (both dropdown and input)
        const sizeElements = document.querySelectorAll(".existing-size-select, .existing-size-input");
        const sizeQuantities = document.querySelectorAll(".existing-size-batch-quantity");

        sizeElements.forEach((sizeElement, index) => {
          const enteredSize = sizeElement.value.trim();
          const quantity = Number.parseInt(sizeQuantities[index]?.value) || 0;

          if (enteredSize && quantity > 0) {
            // Try to find matching size in product sizes (case-insensitive)
            const sizeInfo = productSizes.find((s) => s.size.toLowerCase() === enteredSize.toLowerCase());

            // Use matched price or default product price
            const price = sizeInfo ? Number.parseFloat(sizeInfo.price) : Number.parseFloat(product.price || 0);
            revenue += quantity * price;
          }
        });
      } else {
        // Single size revenue
        const quantity = Number.parseInt(document.getElementById("existing-batch-size")?.value) || 0;
        const price = Number.parseFloat(product.price || 0);
        revenue = quantity * price;
      }

      totalRevenue = revenue;
      return revenue;
    }
  }

  // Enhanced Cost Per Unit Calculation
  function calculateCostPerUnit() {
    if (selectedProductionType === "existing-batch") {
      return calculateExistingProductCostPerUnit()
    }

    const sizeOption = document.getElementById("size-option")?.value
    const batchQuantity = totalBatchQuantity || 1

    if (sizeOption === "multiple") {
      const sizeQuantities = document.querySelectorAll('input[name="size_quantity[]"]')
      const sizePrices = document.querySelectorAll('input[name="size_price[]"]')
      const costBreakdown = []

      let totalWeightedCost = 0
      let totalQuantity = 0

      sizeQuantities.forEach((quantityInput, index) => {
        const quantity = Number.parseInt(quantityInput.value) || 0
        const price = Number.parseFloat(sizePrices[index]?.value) || 0

        if (quantity > 0) {
          const proportionOfBatch = quantity / batchQuantity
          const allocatedMaterialCost = totalMaterialCost * proportionOfBatch
          const allocatedOperationalCost = totalOperationalCost * proportionOfBatch
          const totalAllocatedCost = allocatedMaterialCost + allocatedOperationalCost
          const costPerUnit = totalAllocatedCost / quantity

          costBreakdown.push({
            size: `Size ${index + 1}`,
            quantity: quantity,
            proportion: proportionOfBatch,
            materialCost: allocatedMaterialCost,
            operationalCost: allocatedOperationalCost,
            totalCost: totalAllocatedCost,
            costPerUnit: costPerUnit,
            sellingPrice: price,
            profitPerUnit: price - costPerUnit,
          })

          totalWeightedCost += totalAllocatedCost
          totalQuantity += quantity
        }
      })

      return {
        overallCostPerUnit: totalQuantity > 0 ? totalWeightedCost / totalQuantity : 0,
        breakdown: costBreakdown,
        calculationMethod: "weighted_by_size",
      }
    } else {
      const overallCostPerUnit = batchQuantity > 0 ? totalProductionCost / batchQuantity : 0
      return {
        overallCostPerUnit: overallCostPerUnit,
        breakdown: [
          {
            size: "Single Size",
            quantity: batchQuantity,
            proportion: 1,
            materialCost: totalMaterialCost,
            operationalCost: totalOperationalCost,
            totalCost: totalProductionCost,
            costPerUnit: overallCostPerUnit,
            sellingPrice: Number.parseFloat(document.getElementById("new-product-price")?.value) || 0,
            profitPerUnit:
              (Number.parseFloat(document.getElementById("new-product-price")?.value) || 0) - overallCostPerUnit,
          },
        ],
        calculationMethod: "simple_division",
      }
    }
  }

  function calculateExistingProductCostPerUnit() {
    const batchQuantity = totalBatchQuantity || 1
    const sizeOption = document.getElementById("existing-size-option")?.value

    if (sizeOption === "multiple") {
      const sizeQuantities = document.querySelectorAll(".existing-size-batch-quantity")
      const costBreakdown = []

      let totalWeightedCost = 0
      let totalQuantity = 0

      sizeQuantities.forEach((quantityInput, index) => {
        const quantity = Number.parseInt(quantityInput.value) || 0

        if (quantity > 0) {
          const proportionOfBatch = quantity / batchQuantity
          const allocatedMaterialCost = totalMaterialCost * proportionOfBatch
          const allocatedOperationalCost = totalOperationalCost * proportionOfBatch
          const totalAllocatedCost = allocatedMaterialCost + allocatedOperationalCost
          const costPerUnit = totalAllocatedCost / quantity

          costBreakdown.push({
            size: `Size ${index + 1}`,
            quantity: quantity,
            proportion: proportionOfBatch,
            materialCost: allocatedMaterialCost,
            operationalCost: allocatedOperationalCost,
            totalCost: totalAllocatedCost,
            costPerUnit: costPerUnit,
          })

          totalWeightedCost += totalAllocatedCost
          totalQuantity += quantity
        }
      })

      return {
        overallCostPerUnit: totalQuantity > 0 ? totalWeightedCost / totalQuantity : 0,
        breakdown: costBreakdown,
        calculationMethod: "weighted_by_existing_size",
      }
    } else {
      const overallCostPerUnit = batchQuantity > 0 ? totalProductionCost / batchQuantity : 0
      return {
        overallCostPerUnit: overallCostPerUnit,
        breakdown: [
          {
            size: "Single Size",
            quantity: batchQuantity,
            proportion: 1,
            materialCost: totalMaterialCost,
            operationalCost: totalOperationalCost,
            totalCost: totalProductionCost,
            costPerUnit: overallCostPerUnit,
          },
        ],
        calculationMethod: "simple_existing_division",
      }
    }
  }

  async function updateStockStatus(materialRow) {
    const materialSelect = materialRow.querySelector(".material-select")
    const quantityInput = materialRow.querySelector(".quantity-input")
    const stockIndicator = materialRow.querySelector(".stock-status")

    if (materialSelect.value && quantityInput.value) {
      // Fetch latest stock from backend
      try {
        const response = await fetch(`get_material.php?id=${encodeURIComponent(materialSelect.value)}`)
        const data = await response.json()
        if (data.success && data.material) {
          const availableQuantity = Number.parseFloat(data.material.quantity) || 0
          const requiredQuantity = Number.parseFloat(quantityInput.value) || 0
          if (availableQuantity >= requiredQuantity && requiredQuantity > 0) {
            stockIndicator.textContent = "Available"
            stockIndicator.className = "stock-status stock-available"
            quantityInput.classList.remove("is-invalid")
          } else if (availableQuantity > 0 && requiredQuantity > 0) {
            stockIndicator.textContent = "Insufficient"
            stockIndicator.className = "stock-status stock-warning"
            quantityInput.classList.add("is-invalid")
          } else if (availableQuantity === 0) {
            stockIndicator.textContent = "Out of Stock"
            stockIndicator.className = "stock-status stock-insufficient"
            quantityInput.classList.add("is-invalid")
          } else {
            stockIndicator.textContent = ""
            stockIndicator.className = "stock-status"
            quantityInput.classList.remove("is-invalid")
          }
        } else {
          stockIndicator.textContent = "Error"
          stockIndicator.className = "stock-status stock-insufficient"
          quantityInput.classList.add("is-invalid")
        }
      } catch (e) {
        stockIndicator.textContent = "Error"
        stockIndicator.className = "stock-status stock-insufficient"
        quantityInput.classList.add("is-invalid")
      }
    } else {
      stockIndicator.textContent = ""
      stockIndicator.className = "stock-status"
      quantityInput.classList.remove("is-invalid")
    }
  }

  // PRODUCT DETAILS FUNCTIONS

  function loadProductDetails() {
    const productSelect = document.getElementById("existing-product-select")
    const productDetailsContainer = document.getElementById("existing-product-details")

    if (!productSelect.value) {
      productDetailsContainer.innerHTML = `
        <div class="text-muted text-center py-3">
          <i class="bi bi-arrow-up me-2"></i>Select a product above to view details
        </div>
      `
      return
    }

    try {
      const selectedOption = productSelect.options[productSelect.selectedIndex]
      const productData = JSON.parse(selectedOption.dataset.productData)

      selectedProductData = productData

      let detailsHtml = `
        <div class="row">
          <div class="col-md-6">
            <div class="card">
              <div class="card-header bg-light">
                <h6 class="mb-0"><i class="bi bi-info-circle me-2"></i>Product Information</h6>
              </div>
              <div class="card-body">
                <p><strong>Product ID:</strong> ${productData.product_id}</p>
                <p><strong>Name:</strong> ${productData.name}</p>
                <p><strong>Category:</strong> ${productData.category}</p>
                <p><strong>Price:</strong> ₱${Number.parseFloat(productData.price).toFixed(2)}</p>
                <p><strong>Current Stock:</strong> ${productData.stocks} units</p>
                <p class="mb-0"><strong>Batch Tracking:</strong> ${productData.batch_tracking === 1 ? "Yes" : "No"}</p>
              </div>
            </div>
          </div>
          ${selectedProductionType !== 'existing-batch' ? `
          <div class="col-md-6">
            <div class="card">
              <div class="card-header bg-light">
                <h6 class="mb-0"><i class="bi bi-clock-history me-2"></i>Additional Details</h6>
              </div>
              <div class="card-body">
                <p><strong>Status:</strong> <span class="badge ${getStatusBadgeClass(productData.status)}">${formatDate(productData.status)}</span></p>
                <p><strong>Created:</strong> ${formatDate(productData.created_at)}</p>
                <p><strong>Last Updated:</strong> ${formatDate(productData.updated_at)}</p>
              </div>
            </div>
          </div>
          ` : ''}
        </div>
      `

      productDetailsContainer.innerHTML = detailsHtml
    } catch (error) {
      console.error("Error loading product details:", error)
      productDetailsContainer.innerHTML = `
        <div class="alert alert-danger">
          <i class="bi bi-exclamation-triangle me-2"></i>
          Error loading product details. Please try selecting the product again.
        </div>
      `
    }
  }

  function getStatusBadgeClass(status) {
    switch (status) {
      case "In Stock":
        return "bg-success"
      case "Low Stock":
        return "bg-warning"
      case "Out of Stock":
        return "bg-danger"
      default:
        return "bg-secondary"
    }
  }

  function formatDate(dateString) {
    if (!dateString) return "N/A"
    try {
      return new Date(dateString).toLocaleDateString()
    } catch (error) {
      return "Invalid Date"
    }
  }

  // BATCH CODE AND DATE FUNCTIONS

  function generateBatchCode() {
    const today = new Date()
    const year = today.getFullYear().toString().slice(-2)
    const month = (today.getMonth() + 1).toString().padStart(2, "0")
    const day = today.getDate().toString().padStart(2, "0")
    const random = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0")

    const batchCode = `B${year}${month}${day}${random}`
    const batchCodeInput = document.getElementById("batch-code")
    if (batchCodeInput) batchCodeInput.value = batchCode
  }

  function generateProductId() {
    const category = document.getElementById("new-product-category").value
    if (!category) return

    let prefix = ""
    switch (category) {
      case "Preserves":
        prefix = "PR"
        break
      case "Beverages":
        prefix = "BV"
        break
      case "Snacks":
        prefix = "SN"
        break
      case "Detergent":
        prefix = "DT"
        break
      default:
        prefix = "PD"
    }

    const timestamp = Date.now().toString().slice(-6)
    const productId = `${prefix}${timestamp}`
    const productIdInput = document.getElementById("new-product-id")
    if (productIdInput) productIdInput.value = productId
  }

  function handleExpirationDurationChange() {
    const duration = document.getElementById("expiration-duration").value

    if (duration === "custom") {
      if (customDurationFields) customDurationFields.style.display = "block"
    } else {
      if (customDurationFields) customDurationFields.style.display = "none"
      calculateExpirationDate()
    }
  }

  function calculateExpirationDate() {
    const manufacturingDateInput = document.getElementById("batch-manufacturing-date")
    const expirationDurationSelect = document.getElementById("expiration-duration")
    const customDurationValue = document.getElementById("custom-duration-value")
    const customDurationUnit = document.getElementById("custom-duration-unit")
    const calculatedExpirationDate = document.getElementById("calculated-expiration-date")

    // If manufacturing date input is missing, use today's date
    let manufacturingDate
    if (manufacturingDateInput && manufacturingDateInput.value) {
      manufacturingDate = new Date(manufacturingDateInput.value)
    } else {
      manufacturingDate = new Date()
    }
    const expirationDate = new Date(manufacturingDate)

    const duration = expirationDurationSelect.value

    if (duration === "custom") {
      const value = Number.parseInt(customDurationValue.value) || 0
      const unit = customDurationUnit.value
      switch (unit) {
        case "days":
          expirationDate.setDate(expirationDate.getDate() + value)
          break
        case "months":
          expirationDate.setMonth(expirationDate.getMonth() + value)
          break
        case "years":
          expirationDate.setFullYear(expirationDate.getFullYear() + value)
          break
      }
    } else {
      switch (duration) {
        case "2_weeks":
          expirationDate.setDate(expirationDate.getDate() + 14)
          break
        case "5_months":
          expirationDate.setMonth(expirationDate.getMonth() + 5)
          break
        case "8_months":
          expirationDate.setMonth(expirationDate.getMonth() + 8)
          break
        case "1_year":
          expirationDate.setFullYear(expirationDate.getFullYear() + 1)
          break
      }
    }

    if (calculatedExpirationDate) {
      calculatedExpirationDate.value = expirationDate.toISOString().split("T")[0]
    }
  }

  // ENHANCED STATUS UPDATE FUNCTIONS

  // Update production status with proper database integration
  function updateProductionStatus(productionId, targetStatus = null) {
    console.log(`🔄 Updating production ${productionId} status`)

    if (!productionId) {
      showResponseMessage("error", "Production ID is required")
      return
    }

    // Show loading
    showResponseMessage("info", "Updating production status...")

    const formData = new FormData()
    formData.append("production_id", productionId)
    formData.append("action", "advance_status")

    if (targetStatus) {
      formData.append("target_status", targetStatus)
    }

    fetch("update_production_status.php", {
      method: "POST",
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          console.log("✅ Production status updated successfully")

          // Reload productions from database to get updated data
          loadOngoingProductions()
          loadProductionHistory()
          updateStatusCards()

          // --- FIX: Immediately update progress bar and time remaining ---
          updateProductionProgress();

          const newStatus = data.new_status || targetStatus || "updated"
          showResponseMessage("success", `Production status updated to ${formatProductionStatus(newStatus)}`)

          // Close details modal if open
          if (productionDetailsModalInstance && productionDetailsModalInstance._isShown) {
            productionDetailsModalInstance.hide()
          }

          // If moved to quality-check, open complete production modal
          if (data.new_status === "quality-check" || newStatus === "quality-check") {
            setTimeout(() => {
              openCompleteProductionModal(productionId)
            }, 500)
          }
        } else {
          console.error("❌ Failed to update production status:", data.message)
          showResponseMessage("error", "Failed to update production status: " + data.message)
        }
      })
      .catch((error) => {
        console.error("❌ Error updating production status:", error)
        showResponseMessage("error", "Error updating production status. Please try again.")
      })
  }

  // FIXED: Start production function - properly save to database
  function startProduction() {
    if (!validateCurrentStep()) {
      showValidationError()
      return
    }

    saveCurrentStepData()
    if (produceProductModalInstance) produceProductModalInstance.hide()

    setTimeout(() => {
      if (loadingModalInstance) loadingModalInstance.show()

      // Enhanced form data collection with validation
      const form = document.getElementById("new-product-production-form");
      const formData = new FormData(form);

      // Always append the product_photo file if selected
      const photoInput = document.getElementById("new-product-photo");
      if (photoInput && photoInput.files[0]) {
        formData.set("product_photo", photoInput.files[0]);
      }

      try {
        // REQUIRED FIELDS - ensure these are always set
        formData.append("production_type", selectedProductionType || "new-product")

        if (selectedProductionType === "new-product") {
          let productName = document.getElementById("new-product-name")?.value || wizardData.productInfo?.name || ""
          productName = productName.trim()
          if (!productName && wizardData.productInfo?.name) {
            productName = wizardData.productInfo.name.trim()
          }

          if (!productName) {
            throw new Error("Product name is required for new product")
          }

          const category =
            document.getElementById("new-product-category")?.value || wizardData.productInfo?.category || ""
          if (!category) {
            throw new Error("Category is required for new product")
          }

          const batchSize = calculateTotalBatchQuantity() || wizardData.productInfo?.quantity || 0
          if (batchSize <= 0) {
            throw new Error("Batch size must be greater than 0")
          }

          formData.append("product_name", productName)
          formData.append("category", category)
          formData.append("batch_size", batchSize.toString())

          // Add price from modal
          formData.append(
            "price",
            document.getElementById("new-product-price")?.value || wizardData.productInfo?.price || "0",
          )
          formData.append("tracking_type", selectedTrackingType || "normal")

          // Batch tracking fields
          if (selectedTrackingType === "batch") {
            formData.append("batch_code", document.getElementById("batch-code")?.value || "")
            formData.append("manufacturing_date", document.getElementById("batch-manufacturing-date")?.value || "")
            formData.append("expiration_date", document.getElementById("calculated-expiration-date")?.value || "")
          }

          // --- FIX: Always send batch_tracking flag ---
          formData.append("batch_tracking", selectedTrackingType === "batch" ? "1" : "0")
        } else if (selectedProductionType === "existing-batch") {
          const selectedProductId =
            document.getElementById("existing-product-select")?.value || wizardData.existingProduct?.productId || ""
          if (!selectedProductId) {
            throw new Error("Product selection is required for existing batch")
          }

          const selectedProduct = allProducts.find((p) => p.product_id === selectedProductId)
          if (!selectedProduct) {
            throw new Error("Selected product not found")
          }

          // Always set product_name to the selected product's name
          const productName = selectedProduct?.name || "Unknown Product"
          // Send the product_id (not the database id) for existing products
          formData.append("product_id", selectedProduct.product_id)
          formData.append("product_name", productName)
          formData.append("category", selectedProduct?.category || "Unknown")

          const batchSize = updateExistingProductBatchQuantity() || wizardData.existingProduct?.batchSize || 0
          if (batchSize <= 0) {
            throw new Error("Batch size must be greater than 0")
          }
          formData.append("batch_size", batchSize.toString())
        }

        // Schedule information with validation
        const startDate = wizardData.schedule?.startDate || new Date().toISOString().split("T")[0]
        const startTime = wizardData.schedule?.startTime || "08:00"
        const priority = wizardData.schedule?.priority || "normal"
        const assignedTo = wizardData.schedule?.assignedTo || "Admin User"
        const notes = wizardData.schedule?.notes || ""

        formData.append("start_date", startDate)
        formData.append("start_time", startTime)
        formData.append("priority", priority)
        formData.append("assigned_to", assignedTo)
        formData.append("notes", notes)
        const estimatedDuration = wizardData.schedule?.estimatedDuration || document.getElementById("schedule-estimated-duration")?.value || "8"
        formData.append("estimated_duration", estimatedDuration)

        // Materials/Recipe data
        const currentMaterials = collectMaterialData()
        if (currentMaterials && currentMaterials.length > 0) {
          formData.append("recipe", JSON.stringify(currentMaterials))
        }

        // Cost information
        formData.append("total_material_cost", totalMaterialCost.toString())
        formData.append("total_operational_cost", totalOperationalCost.toString())
        formData.append("total_production_cost", totalProductionCost.toString())

        // Debug: Log all form data
        console.log("📋 FormData being sent:")
        for (const [key, value] of formData.entries()) {
          console.log(`${key}: ${value}`)
        }

        // Enhanced fetch with better error handling
        fetch("start_production.php", {
          method: "POST",
          body: formData,
        })
          .then(async (response) => {
            const contentType = response.headers.get("content-type")
            if (!contentType || !contentType.includes("application/json")) {
              const text = await response.text()
              console.error("Non-JSON response:", text)
              throw new Error("Server returned invalid response format")
            }
            return response.json()
          })
          .then((data) => {
            setTimeout(() => {
              if (loadingModalInstance) loadingModalInstance.hide()

              console.log("Server response:", data)

              if (data.success) {
                // Recipe is already saved in the backend for new products
                console.log("✅ Production started successfully:", data)
                if (data.recipe_saved) {
                  console.log("✅ Recipe saved with ID:", data.recipe_id)
                }

                document.getElementById("successModalMessage").textContent =
                  data.message || "Production started successfully!"
                if (successModalInstance) successModalInstance.show()
                setTimeout(() => {
                  if (successModalInstance) successModalInstance.hide()
                  loadOngoingProductions()
                  updateStatusCards()
                  showResponseMessage(
                    "success",
                    `Production ${data.production_id || data.production_db_id} started successfully!`,
                  )
                }, 2000)
              } else {
                console.error("Server error:", data)
                let errorMessage = data.message || "Failed to start production"
                if (data.debug_info) {
                  console.error("Debug info:", data.debug_info)
                  if (data.debug_info.mysql_error) {
                    errorMessage += "\nDatabase Error: " + data.debug_info.mysql_error
                  }
                }
                document.getElementById("errorModalMessage").textContent = errorMessage
                if (errorModalInstance) errorModalInstance.show()
              }
            }, 2000)
          })
          .catch((error) => {
            console.error("Fetch error:", error)
            setTimeout(() => {
              if (loadingModalInstance) loadingModalInstance.hide()
              document.getElementById("errorModalMessage").textContent =
                "Network error: " + error.message + ". Please check your connection and try again."
              if (errorModalInstance) errorModalInstance.show()
            }, 2000)
          })
      } catch (error) {
        console.error("Form validation error:", error)
        if (loadingModalInstance) loadingModalInstance.hide()
        showResponseMessage("error", error.message)
      }
    }, 300)
  }

  // Enhanced error display function
  function showResponseMessage(type, message) {
    const alertClass = type === "success" ? "alert-success" : type === "error" ? "alert-danger" : "alert-warning"

    const alertHtml = `
      <div class="alert ${alertClass} alert-dismissible fade show position-fixed" role="alert" style="top: 20px; right: 20px; z-index: 9999; max-width: 400px;">
        <i class="bi ${type === "success" ? "bi-check-circle" : type === "error" ? "bi-exclamation-triangle" : "bi-info-circle"} me-2"></i>
        <strong>${type.charAt(0).toUpperCase() + type.slice(1)}:</strong> ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
      </div>
    `

    const alertContainer = document.getElementById("alert-container") || document.body
    const alertElement = document.createElement("div")
    alertElement.innerHTML = alertHtml
    alertContainer.insertBefore(alertElement.firstElementChild, alertContainer.firstChild)

    setTimeout(() => {
      const alert = alertContainer.querySelector(".alert")
      if (alert) {
        alert.remove()
      }
    }, 8000)
  }

  // Helper function to calculate days between dates
  function calculateDaysBetween(startDate, endDate) {
    const start = new Date(startDate)
    const end = new Date(endDate)
    const diffTime = Math.abs(end - start)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  // View production details function
  function viewProductionDetails(productionId, isHistory = false) {
    console.log(`👁️ Viewing production details for ID: ${productionId}`)

    fetch(`get_production_details.php?id=${productionId}`)
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          console.log("✅ Production details loaded:", data)

          const production = data.production
          currentProductionId = productionId

          const detailsContent = document.getElementById("production-details-content")
          // Remove old button logic for update-production-status and complete-production-btn
          // Render detailed production information
          const detailsHtml = renderProductionDetailsHTML(production, data.materials, data.steps, data.material_usage)
          detailsContent.innerHTML = detailsHtml

          // Show/hide new modal action buttons based on status
          const startBtn = document.getElementById('start-production-modal-btn');
          const finishBtn = document.getElementById('finish-production-modal-btn');
          const completeBtn = document.getElementById('complete-production-modal-btn');
          if (startBtn) startBtn.style.display = 'none';
          if (finishBtn) finishBtn.style.display = 'none';
          if (completeBtn) completeBtn.style.display = 'none';
          if (!isHistory && production.status !== 'completed' && production.status !== 'cancelled') {
            if (production.status === 'pending') {
              if (startBtn) {
                startBtn.style.display = '';
                startBtn.onclick = function() {
                  updateProductionStatus(productionId, 'in-progress');
                };
              }
            } else if (production.status === 'in-progress') {
              if (finishBtn) {
                finishBtn.style.display = '';
                finishBtn.onclick = function() {
                  updateProductionStatus(productionId, 'quality-check');
                };
              }
            } else if (production.status === 'quality-check') {
              if (completeBtn) {
                completeBtn.style.display = '';
                completeBtn.onclick = function() {
                  openCompleteProductionModal(productionId);
                };
              }
            }
          }

          // Show the modal
          if (typeof bootstrap !== "undefined") {
            if (!window.productionDetailsModalInstance) {
              window.productionDetailsModalInstance = new bootstrap.Modal(document.getElementById("productionDetailsModal"))
            }
            window.productionDetailsModalInstance.show()
          }
        }
      })
  }

  // Add this function to get production details including product_id
  function getProductionDetails(productionId) {
    return fetch('get_production_details.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `production_id=${productionId}`
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            return data.production;
        } else {
            throw new Error(data.message || 'Failed to get production details');
        }
    });
  }

  // Update the complete production function
  function completeProduction(productionId) {
    // First get the production details to get the product_id
    getProductionDetails(productionId)
        .then(production => {
            // Show the completion modal with pre-filled data
            showCompletionModal(production);
        })
        .catch(error => {
            console.error('Error getting production details:', error);
            alert('Error loading production details: ' + error.message);
        });
  }

  function showCompletionModal(production) {
    // Create and show modal with production data
    const modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.id = 'completeProductionModal';
    modal.innerHTML = `
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Complete Production</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <form id="completeProductionForm">
                        <input type="hidden" name="production_id" value="${production.id}">
                        <input type="hidden" name="product_id" value="${production.product_id || ''}">
                        <input type="hidden" name="product_name" value="${production.product_name || ''}">
                        <input type="hidden" name="category" value="${production.category || ''}">
                        <input type="hidden" name="price" value="${production.price || 0}">
                        <input type="hidden" name="production_type" value="${production.production_type || ''}">
                        
                        <div class="row">
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label class="form-label">Production ID</label>
                                    <input type="text" class="form-control" value="${production.production_id}" readonly>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label class="form-label">Product Name</label>
                                    <input type="text" class="form-control" value="${production.product_name}" readonly>
                                </div>
                            </div>
                        </div>
                        
                        <div class="row">
                            <div class="col-md-4">
                                <div class="mb-3">
                                    <label class="form-label">Quantity Produced *</label>
                                    <input type="number" class="form-control" name="quantity_produced" required min="1">
                                </div>
                            </div>
                            <div class="col-md-4">
                                <div class="mb-3">
                                    <label class="form-label">Quantity Passed QC *</label>
                                    <input type="number" class="form-control" name="quantity_passed_qc" required min="0">
                                </div>
                            </div>
                            <div class="col-md-4">
                                <div class="mb-3">
                                    <label class="form-label">Quality Score (1-10)</label>
                                    <input type="number" class="form-control" name="quality_score" min="1" max="10" step="0.1">
                                </div>
                            </div>
                        </div>
                        
                        <div class="row">
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label class="form-label">Manufacturing Date</label>
                                    <input type="date" class="form-control" name="manufacturing_date" value="${new Date().toISOString().split('T')[0]}">
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label class="form-label">Expiration Date</label>
                                    <input type="date" class="form-control" name="expiration_date">
                                </div>
                            </div>
                        </div>
                        
                        <div class="mb-3">
                            <label class="form-label">Notes</label>
                            <textarea class="form-control" name="notes" rows="3"></textarea>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                    <button type="button" class="btn btn-success" onclick="submitCompletion()">Complete Production</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    const modalInstance = new window.bootstrap.Modal(modal);
    modalInstance.show();
    
    // Clean up modal when hidden
    modal.addEventListener('hidden.bs.modal', function() {
        document.body.removeChild(modal);
    });
  }

  function submitCompletion() {
    const form = document.getElementById('completeProductionForm');
    const formData = new FormData(form);
    
    // Validate required fields
    const quantityProduced = parseInt(formData.get('quantity_produced'));
    const quantityPassedQC = parseInt(formData.get('quantity_passed_qc'));
    
    if (!quantityProduced || quantityProduced <= 0) {
        alert('Please enter a valid quantity produced');
        return;
    }
    
    if (quantityPassedQC > quantityProduced) {
        alert('Quantity passed QC cannot exceed quantity produced');
        return;
    }
    
    // Show loading state
    const submitBtn = event.target;
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Processing...';
    submitBtn.disabled = true;
    
    fetch('complete_production.php', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Production completed successfully!');
            // Close modal
            const modal = window.bootstrap.Modal.getInstance(document.getElementById('completeProductionModal'));
            modal.hide();
            // Refresh the production list
            loadProductions();
        } else {
            alert('Error completing production: ' + data.message);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error completing production: ' + error.message);
    })
    .finally(() => {
        // Reset button state
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    });
  }

  // Declare the bootstrap variable
  const bootstrap = window.bootstrap;

  // Declare the loadProductions function
  function loadProductions() {
    // Implementation for loading productions
    console.log('Loading productions...');
  }

  // Helper function to render production details HTML
  function renderProductionDetailsHTML(production, materials, steps, material_usage) {
    // Enhanced date formatting function
    function formatDateDisplay(dateString) {
      if (!dateString) return "N/A"
      try {
        const date = new Date(dateString)
        if (isNaN(date.getTime())) return "Invalid Date"
        return date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      } catch (error) {
        return "Invalid Date"
      }
    }

    // Enhanced number formatting
    function formatCurrency(amount) {
      if (amount === null || amount === undefined || amount === '') return "₱0.00"
      const num = parseFloat(amount)
      return isNaN(num) ? "₱0.00" : `₱${num.toFixed(2)}`
    }

    function formatNumber(value) {
      if (value === null || value === undefined || value === '') return "0"
      const num = parseFloat(value)
      return isNaN(num) ? "0" : num.toString()
    }

    // Calculate stock status for the product (use quantity_produced or stocks)
    const producedQuantity = production.quantity_produced || production.stocks || production.batch_size || 0;
    const stockStatus = getStockStatusText(producedQuantity, producedQuantity <= 0 ? "Out of Stock" : (producedQuantity <= 5 ? "Low Stock" : "In Stock"));

    let html = `
      <div class="row mb-4">
        <div class="col-md-6">
          <div class="card">
            <div class="card-header bg-light">
              <h6 class="mb-0"><i class="bi bi-info-circle me-2"></i>Production Information</h6>
            </div>
            <div class="card-body">
              <p><strong>Production ID:</strong> ${production.production_id || production.id || "N/A"}</p>
              <p><strong>Product:</strong> ${production.product_name || production.created_product_name || "N/A"}</p>
              <p><strong>Category:</strong> ${production.category || "N/A"}</p>
              <p><strong>Batch Size:</strong> ${formatNumber(production.batch_size)} units</p>
              <p><strong>Status:</strong> <span class="badge ${getProductionStatusBadgeClass(production.status)}">${formatProductionStatus(production.status)}</span></p>
              <p class="mb-0"><strong>Priority:</strong> <span class="badge ${getPriorityBadgeClass(production.priority)}">${production.priority || "Normal"}</span></p>
              <p><strong>Stock Status:</strong> ${stockStatus}</p>
            </div>
          </div>
        </div>
        <div class="col-md-6">
          <div class="card">
            <div class="card-header bg-light">
              <h6 class="mb-0"><i class="bi bi-clock me-2"></i>Timeline</h6>
            </div>
            <div class="card-body">
              <p><strong>Start Date:</strong> ${formatDateDisplay(production.start_date)}</p>
              <p><strong>Estimated Completion:</strong> ${formatDateDisplay(production.estimated_completion)}</p>
    `;

    if (production.actual_completion) {
      html += `<p><strong>Actual Completion:</strong> ${formatDateDisplay(production.actual_completion)}</p>`;
    }

    if (production.assigned_to) {
      html += `<p><strong>Assigned To:</strong> ${production.assigned_to}</p>`;
    }

    html += `
            </div>
          </div>
        </div>
      </div>
    `;

    // --- FIXED COST BREAKDOWN CALCULATION ---
    // Always recalculate using latest values
    const materialCost = parseFloat(production.total_material_cost || production.material_cost || 0);
    // Sum labor, electricity, gas, overhead if available
    let operationalCost = 0;
    if (production.total_operational_cost) {
      operationalCost = parseFloat(production.total_operational_cost);
    } else {
      // Try to sum labor, overhead, electricity, gas if present
      ["labor_cost", "overhead_cost", "electricity_cost", "gas_cost"].forEach(key => {
        if (production[key]) operationalCost += parseFloat(production[key]) || 0;
      });
    }
    const totalCost = materialCost + operationalCost;
    // Prefer quantity_passed_qc, else quantity_produced, else batch_size
    const denom = (production.quantity_passed_qc && production.quantity_passed_qc > 0)
      ? production.quantity_passed_qc
      : (production.quantity_produced && production.quantity_produced > 0)
        ? production.quantity_produced
        : (production.batch_size && production.batch_size > 0)
          ? production.batch_size
          : 0;
    let costPerUnit = 0;
    if (denom > 0) {
      costPerUnit = totalCost / denom;
    }

    html += `
      <div class="card mb-4">
        <div class="card-header bg-light">
          <h6 class="mb-0"><i class="bi bi-calculator me-2"></i>Cost Breakdown</h6>
        </div>
        <div class="card-body">
          <div class="row">
            <div class="col-md-3">
              <p><strong>Material Cost:</strong><br>${formatCurrency(materialCost)}</p>
            </div>
            <div class="col-md-3">
              <p><strong>Operational Cost:</strong><br>${formatCurrency(operationalCost)}</p>
            </div>
            <div class="col-md-3">
              <p><strong>Total Cost:</strong><br>${formatCurrency(totalCost)}</p>
            </div>
            <div class="col-md-3">
              <p><strong>Cost per Unit:</strong><br>${denom > 0 ? formatCurrency(costPerUnit) : '<span class="text-danger">N/A (No output)</span>'}</p>
            </div>
          </div>
          ${denom === 0 ? '<div class="alert alert-warning mt-2 mb-0">Cannot compute cost per unit: No valid output quantity (Passed QC, Produced, or Batch Size is zero).</div>' : ''}
        </div>
      </div>
    `;

    // --- MATERIALS USED SECTION ---
    // Prefer material_usage if available, else fallback to materials
    let materialsToDisplay = (material_usage && material_usage.length > 0) ? material_usage : materials;
    if (materialsToDisplay && materialsToDisplay.length > 0) {
      html += `
        <div class="card mb-4">
          <div class="card-header bg-light">
            <h6 class="mb-0"><i class="bi bi-list-ul me-2"></i>Materials Used</h6>
          </div>
          <div class="card-body">
            <div class="table-responsive">
              <table class="table table-sm">
                <thead>
                  <tr>
                    <th>Material</th>
                    <th>Quantity</th>
                    <th>Unit</th>

                    <th>Consumption Date</th>
                    <th>Total Cost</th>
                  </tr>
                </thead>
                <tbody>
      `;
      materialsToDisplay.forEach((material) => {
        let materialName, quantity, unit, consumptionDate, totalCost;
        if (material_usage && material_usage.length > 0) {
          materialName = material.material_name || "Unknown Material";
          quantity = (material.quantity_used !== undefined && material.quantity_used !== null) ? material.quantity_used : 0;
          unit = material.unit_used || material.unit_measurement || "-";
          consumptionDate = material.usage_date ? formatDateDisplay(material.usage_date) : "-";
          totalCost = (material.total_cost !== undefined && material.total_cost !== null) ? material.total_cost : 0;
        } else {
          materialName = material.material_name || "Unknown Material";
          quantity = (material.consumed_quantity !== undefined && material.consumed_quantity !== null && material.consumed_quantity > 0) ? material.consumed_quantity : (material.required_quantity !== undefined ? material.required_quantity : 0);
          unit = material.consumed_unit || material.required_unit || material.unit_measurement || "-";
          consumptionDate = material.consumption_date ? formatDateDisplay(material.consumption_date) : "-";
          totalCost = (material.actual_cost !== undefined && material.actual_cost !== null && material.actual_cost > 0) ? material.actual_cost : (material.estimated_cost !== undefined ? material.estimated_cost : 0);
        }
        html += `
          <tr>
            <td>${materialName}</td>
            <td>${Number(quantity).toFixed(4)}</td>
            <td>${unit}</td>
            <td>${consumptionDate}</td>
            <td>₱${Number(totalCost).toFixed(2)}</td>
          </tr>
        `;
      });
      html += `
                </tbody>
              </table>
            </div>
          </div>
        </div>
      `;
    }

    // --- QUALITY CHECK SECTION ---
    const qualityScore = production.quality_score;
    const qualityStatus = production.quality_status;
    const quantityProduced = production.quantity_produced;
    const quantityPassed = production.quantity_passed_qc;
    const quantityFailed = production.quantity_failed_qc;
    const qualityCheckedBy = production.quality_checked_by || production.quality_checked_by_name || "-";
    const qualityCheckedAt = production.quality_checked_at ? formatDateDisplay(production.quality_checked_at) : "-";
    const qualityNotes = production.quality_notes || "-";

    if (qualityScore || qualityStatus || quantityProduced || quantityPassed || quantityFailed) {
      html += `
        <div class="card mb-4">
          <div class="card-header bg-light">
            <h6 class="mb-0"><i class="bi bi-shield-check me-2"></i>Quality Check</h6>
          </div>
          <div class="card-body">
            <div class="row">
              <div class="col-md-3">
                <p><strong>Produced:</strong><br>${quantityProduced || "-"}</p>
              </div>
              <div class="col-md-3">
                <p><strong>Passed QC:</strong><br>${quantityPassed || "-"}</p>
              </div>
              <div class="col-md-3">
                <p><strong>Failed QC:</strong><br>${quantityFailed || "-"}</p>
              </div>
              <div class="col-md-3">
                <p><strong>Quality Score:</strong><br>${qualityScore ? `${qualityScore}%` : "-"}</p>
              </div>
            </div>
            <div class="row">
              <div class="col-md-12">
                <p><strong>Notes:</strong><br>${qualityNotes}</p>
              </div>
            </div>
          </div>
        </div>
      `;
    }

    // Enhanced production steps/progress
    if (steps && steps.length > 0) {
      html += `
        <div class="card mb-4">
          <div class="card-header bg-light">
            <h6 class="mb-0"><i class="bi bi-list-check me-2"></i>Production Steps</h6>
          </div>
          <div class="card-body">
            <div class="timeline">
      `

      steps.forEach((step, index) => {
        const isCompleted = step.status === "completed"
        const isCurrent = step.status === "in-progress"

        html += `
          <div class="timeline-item ${isCompleted ? "completed" : ""} ${isCurrent ? "current" : ""}">
            <div class="timeline-marker">
              ${isCompleted ? '<i class="bi bi-check-circle-fill text-success"></i>' : isCurrent ? '<i class="bi bi-play-circle-fill text-primary"></i>' : '<i class="bi bi-circle text-muted"></i>'}
            </div>
            <div class="timeline-content">
              <h6>${step.step_name || `Step ${step.step_number || index + 1}`}</h6>
              <p class="mb-1">${step.description || "No description available"}</p>
              ${step.completed_at ? `<small class="text-muted">Completed: ${formatDateDisplay(step.completed_at)}</small>` : ""}
            </div>
          </div>
        `
      })

      html += `
            </div>
          </div>
        </div>
      `
    }

    // Enhanced material usage log
    if (material_usage && material_usage.length > 0) {
      html += `
        <div class="card mb-4">
          <div class="card-header bg-light">
            <h6 class="mb-0"><i class="bi bi-clock-history me-2"></i>Material Usage Log</h6>
          </div>
          <div class="card-body">
            <div class="table-responsive">
              <table class="table table-sm">
                <thead>
                  <tr>
                    <th>Material</th>
                    <th>Quantity Used</th>
                    <th>Usage Date</th>
                    <th>Notes</th>
                  </tr>
                </thead>
                <tbody>
      `

      material_usage.forEach((usage) => {
        html += `
          <tr>
            <td>${usage.material_name || "Unknown Material"}</td>
            <td>${formatNumber(usage.quantity_used)} ${usage.unit || "units"}</td>
            <td>${formatDateDisplay(usage.usage_date)}</td>
            <td>${usage.notes || "N/A"}</td>
          </tr>
        `
      })

      html += `
                </tbody>
              </table>
            </div>
          </div>
        </div>
      `
    }

    // Enhanced output information
    if (production.quantity_produced || production.output_batch_code || production.created_product_id || production.created_batch_id) {
      html += `
        <div class="card mb-4">
          <div class="card-header bg-light">
            <h6 class="mb-0"><i class="bi bi-box-seam me-2"></i>Production Output</h6>
          </div>
          <div class="card-body">
            <div class="row">
              ${production.quantity_produced ? `<div class="col-md-3"><p><strong>Quantity Produced:</strong><br>${formatNumber(production.quantity_produced)} units</p></div>` : ""}
              ${production.output_batch_code ? `<div class="col-md-3"><p><strong>Batch Code:</strong><br>${production.output_batch_code}</p></div>` : ""}
              ${production.created_product_id ? `<div class="col-md-3"><p><strong>Product ID:</strong><br>${production.created_product_id}</p></div>` : ""}
              ${production.created_batch_id ? `<div class="col-md-3"><p><strong>Batch ID:</strong><br>${production.created_batch_id}</p></div>` : ""}
            </div>
          </div>
        </div>
      `
    }

    // Notes
    if (production.notes) {
      html += `
        <div class="card">
          <div class="card-header bg-light">
            <h6 class="mb-0"><i class="bi bi-sticky me-2"></i>Notes</h6>
          </div>
          <div class="card-body">
            <p class="mb-0">${production.notes}</p>
          </div>
        </div>
      `
    }

    return html
  }

  // Helper functions for status formatting
  function getProductionStatusBadgeClass(status) {
    switch (status) {
      case "pending":
        return "bg-warning"
      case "in-progress":
        return "bg-primary"
      case "quality-check":
        return "bg-info"
      case "completed":
        return "bg-success"
      case "cancelled":
        return "bg-danger"
      default:
        return "bg-secondary"
    }
  }

  function formatProductionStatus(status) {
    return status
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  }

  function getPriorityBadgeClass(priority) {
    switch (priority) {
      case "high":
        return "bg-warning"
      case "urgent":
        return "bg-danger"
      default:
        return "bg-secondary"
    }
  }

  function getQualityStatusBadgeClass(status) {
    switch (status) {
      case "excellent":
        return "bg-success"
      case "good":
        return "bg-primary"
      case "acceptable":
        return "bg-warning"
      case "needs_improvement":
        return "bg-warning"
      case "failed":
        return "bg-danger"
      default:
        return "bg-secondary"
    }
  }

  function formatQualityStatus(status) {
    return status
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  }

  function formatDateTime(dateTimeString) {
    if (!dateTimeString) return "N/A"
    try {
      const date = new Date(dateTimeString)
      if (isNaN(date.getTime())) return "Invalid Date"
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch (error) {
      return "Invalid Date"
    }
  }

  // Complete production modal functions
  function openCompleteProductionModal(productionId) {
    currentProductionId = productionId

    // Get production details
    const production = allProductions.find((p) => p.id == productionId)
    if (!production) {
      showResponseMessage("error", "Production not found")
      return
    }

    if (production.production_type === "new-product") {
      const priceInput = document.getElementById('new-product-price-completion');
      if (priceInput) {
        priceInput.value = production.price || production.target_price || "";
      }
    }

    // Populate modal with production details
    const completionProductionId = document.getElementById("completion-production-id")
    const completionProductName = document.getElementById("completion-product-name")
    const completionBatchSize = document.getElementById("completion-batch-size")

    if (completionProductionId) completionProductionId.textContent = production.production_id || production.id
    if (completionProductName) completionProductName.textContent = production.product_name
    if (completionBatchSize) completionBatchSize.textContent = production.batch_size

    // --- PATCH: Pre-fill ALL possible batch code and expiration date fields ---
    let batchCode = production.batch_code || production.batchCode || "";
    if (!batchCode) {
      batchCode = "B" + Date.now();
      production.batch_code = batchCode;
    }
    const batchCodeInput1 = document.getElementById("batch-code");
    const batchCodeInput2 = document.getElementById("batchCode");
    if (batchCodeInput1) batchCodeInput1.value = batchCode;
    if (batchCodeInput2) batchCodeInput2.value = batchCode;

    let expirationDate = production.expiration_date || production.expirationDate || "";
    if (!expirationDate) {
      // Calculate 2 months from manufacturing date (or today)
      let mfgDate = production.manufacturing_date || production.start_date || new Date().toISOString().slice(0, 10);
      let dateObj = new Date(mfgDate);
      if (isNaN(dateObj.getTime())) dateObj = new Date();
      dateObj.setMonth(dateObj.getMonth() + 2);
      expirationDate = dateObj.toISOString().slice(0, 10);
      production.expiration_date = expirationDate;
    }
    const expirationDateInput1 = document.getElementById("calculated-expiration-date");
    const expirationDateInput2 = document.getElementById("batch-expiration-date");
    if (expirationDateInput1) expirationDateInput1.value = expirationDate;
    if (expirationDateInput2) expirationDateInput2.value = expirationDate;

    // Check if this is an existing batch production with missing product_id
    const productSelectionSection = document.getElementById("product-selection-section")
    const completionProductSelect = document.getElementById("completion-product-select")
    
    if (production.production_type === "existing-batch" && (!production.product_id || production.product_id === "")) {
      // Show product selection section
      if (productSelectionSection) {
        productSelectionSection.style.display = "block"
      }
      
      // Populate product dropdown with all existing products (not just batch-tracked ones)
      if (completionProductSelect && allProducts) {
        completionProductSelect.innerHTML = '<option value="">-- Select Product --</option>'
        
        // Show all products, with batch tracking status indicated
        allProducts.forEach(product => {
          const option = document.createElement('option')
          option.value = product.product_id
          const batchStatus = product.batch_tracking == 1 ? ' (Batch Tracked)' : ' (No Batch Tracking)'
          option.textContent = `${product.name} (${product.product_id}) - Stock: ${product.stocks}${batchStatus}`
          option.dataset.productName = product.name
          option.dataset.productCategory = product.category
          option.dataset.batchTracking = product.batch_tracking
          completionProductSelect.appendChild(option)
        })
        
        // Add event listener for product selection
        completionProductSelect.addEventListener('change', function() {
          const selectedOption = this.options[this.selectedIndex]
          if (selectedOption && selectedOption.value) {
            // Update the production data with selected product info
            production.product_name = selectedOption.dataset.productName
            production.category = selectedOption.dataset.productCategory
            console.log("Updated production data:", production)
            
            // Trigger cost calculations when product is selected
            setTimeout(() => {
              calculateTotalBatchQuantity();
              updateTotalProductionCost();
              updateProfitCalculations();
            }, 100);
          }
        })
      }
    } else {
      // Hide product selection section
      if (productSelectionSection) {
        productSelectionSection.style.display = "none"
      }
      
      // If production already has a product_id, trigger cost calculations
      if (production.product_id) {
        setTimeout(() => {
          calculateTotalBatchQuantity();
          updateTotalProductionCost();
          updateProfitCalculations();
        }, 100);
      }
    }

    // Set default values
    document.getElementById("quantity_produced").value = production.batch_size
    document.getElementById("quantity_passed_qc").value = production.batch_size
    updateFailedQCQuantity()

    // Set current date and time
    const now = new Date()
    const dateTimeString = now.toISOString().slice(0, 16)
    const actualCompletionDate = document.getElementById("actual_completion_date")
    if (actualCompletionDate) actualCompletionDate.value = dateTimeString

    if (completeProductionModalInstance) completeProductionModalInstance.show()

    // --- PATCH: Ensure profit/revenue fields are recalculated for Another Batch ---
    if (production.production_type === "existing-batch") {
      setTimeout(() => {
        calculateTotalBatchQuantity();
        updateTotalProductionCost();
        updateProfitCalculations();
        // Remove previous event listener if any
        const quantityProducedInput = document.getElementById("quantity_produced");
        if (quantityProducedInput) {
          quantityProducedInput.oninput = null;
          quantityProducedInput.addEventListener("input", () => {
            console.log('[UI DEBUG] quantity_produced input event fired');
            calculateTotalBatchQuantity();
            updateTotalProductionCost();
            updateProfitCalculations();
          });
        }
      }, 100);
      // ... existing listeners for batch size, product select, etc. ...
    }
    // --- PATCH: Ensure profit/revenue fields are recalculated for New Product as well as Another Batch ---
    if (production.production_type === "existing-batch" || production.production_type === "new-product") {
      setTimeout(() => {
        // Always use the price from the production object for New Product
        let price = 0;
        if (production.production_type === "new-product") {
          price = Number.parseFloat(production.price || 0); // <-- Use backend price only
          let priceInput = document.getElementById('new-product-price-completion');
          if (!priceInput) {
            priceInput = document.createElement('input');
            priceInput.type = 'hidden';
            priceInput.id = 'new-product-price-completion';
            document.getElementById('completeProductionForm').appendChild(priceInput);
          }
          priceInput.value = price;
        }
        calculateTotalBatchQuantity();
        updateTotalProductionCost();
        updateProfitCalculations();
        // Remove previous event listener if any
        const quantityProducedInput = document.getElementById("quantity_produced");
        if (quantityProducedInput) {
          quantityProducedInput.oninput = null;
          quantityProducedInput.addEventListener("input", () => {
            calculateTotalBatchQuantity();
            updateTotalProductionCost();
            updateProfitCalculations();
          });
        }
        // Add listeners for operational cost fields
        ["electricity-cost", "gas-cost", "labor-cost"].forEach(id => {
          const el = document.getElementById(id);
          if (el) {
            el.oninput = null;
            el.addEventListener("input", () => {
              updateOperationalCosts();
              updateTotalProductionCost();
              updateProfitCalculations();
            });
          }
        });
        // For New Product, recalc on price change in Start modal (if possible)
        if (production.production_type === "new-product") {
          const priceInput = document.getElementById('new-product-price-completion');
          if (priceInput) {
            priceInput.oninput = null;
            priceInput.addEventListener('input', () => {
              updateTotalProductionCost();
              updateProfitCalculations();
            });
          }
        }
      }, 100);
    }
   
  }

  function submitProductionCompletion() {
    // Get production details for additional data
    const production = allProductions.find((p) => p.id == currentProductionId)
    if (!production) {
      showResponseMessage("error", "Production not found")
      return
    }

    // Debug: Log production data to see available fields
    console.log("Production data for completion:", production)

    const formData = new FormData()

    // Always include the price from the Complete Production modal for new product completion
    if (production.production_type === "new-product") {
      const price = document.getElementById("new-product-price-completion")?.value || production.price || production.target_price || "0";
      formData.set("price", price);
      // --- Slug generation for new product ---
      let productName = document.getElementById("new-product-name")?.value || production.product_name || "";
      let slug = "pina"; // Default slug
      if (productName) {
        let words = productName.trim().toLowerCase().split(/\s+/);
        if (words.length === 1) {
          slug = `pina-${words[0]}`;
        } else if (words.length >= 2 && words[1]) {
          slug = `pina-${words[1]}`;
        }
      }
      formData.set("slug", slug);

    }


        
    // Helper to safely get input value
    function getInputValue(id, fallback = "") {
      const el = document.getElementById(id);
      return el ? el.value : fallback;
    }
    
    let batchCodeValue = "";
    let expirationDateValue = "";
    let manufacturingDateValue = getInputValue("batch-manufacturing-date", production.manufacturing_date || production.start_date || new Date().toISOString().slice(0, 10));

    if (production.production_type === "new-product") {
      batchCodeValue = getInputValue("batch-code", "");
      expirationDateValue = getInputValue("calculated-expiration-date", "");
    } else if (production.production_type === "existing-batch") {
      batchCodeValue = "B" + Date.now();
      let selectedProduct = allProducts.find(p => p.product_id === production.product_id);
      let expDuration = 2;
      let expUnit = "months";
      if (selectedProduct) {
        if (selectedProduct.expiration_duration) {
          expDuration = parseInt(selectedProduct.expiration_duration) || 2;
        }
        if (selectedProduct.expiration_unit) {
          expUnit = selectedProduct.expiration_unit;
        }
      }
      let mfgDate = new Date(manufacturingDateValue);
      if (isNaN(mfgDate.getTime())) mfgDate = new Date();
      if (expUnit === "months") {
        mfgDate.setMonth(mfgDate.getMonth() + expDuration);
      } else if (expUnit === "days") {
        mfgDate.setDate(mfgDate.getDate() + expDuration);
      } else if (expUnit === "years") {
        mfgDate.setFullYear(mfgDate.getFullYear() + expDuration);
      }
      expirationDateValue = mfgDate.toISOString().slice(0, 10);
    }
    // Fallbacks if still empty
    if (!batchCodeValue) batchCodeValue = "B" + Date.now();
    if (!expirationDateValue) {
      let mfgDate = new Date(manufacturingDateValue);
      if (isNaN(mfgDate.getTime())) mfgDate = new Date();
      mfgDate.setMonth(mfgDate.getMonth() + 2);
      expirationDateValue = mfgDate.toISOString().slice(0, 10);
    }
    formData.set("batch_code", batchCodeValue);
    formData.set("expiration_date", expirationDateValue);
    formData.set("manufacturing_date", manufacturingDateValue);
        
    // Production completion data
    formData.append("production_id", currentProductionId)
    formData.append("quantity_produced", getInputValue("quantity_produced"))
    formData.append("quantity_passed_qc", getInputValue("quantity_passed_qc"))
    formData.append("quantity_failed_qc", getInputValue("quantity_failed_qc"))
    formData.append("quality_score", getInputValue("quality_score", "95"))
    formData.append("target_price", getInputValue("target_price", "0"))
    formData.append("notes", getInputValue("completion_notes", ""))
    
    // Calculate additional fields
    const quantityProduced = parseInt(getInputValue("quantity_produced", "0")) || 0
    const quantityPassedQC = parseInt(getInputValue("quantity_passed_qc", "0")) || 0
    const quantityFailedQC = parseInt(getInputValue("quantity_failed_qc", "0")) || 0
    const qualityScore = parseFloat(getInputValue("quality_score", "95")) || 95
    
    // Calculate yield percentage and defect rate
    const yieldPercentage = quantityProduced > 0 ? (quantityPassedQC / quantityProduced) * 100 : 0
    const defectRate = quantityProduced > 0 ? (quantityFailedQC / quantityProduced) * 100 : 0
    
    // Calculate operational costs from modal fields
    const electricityCost = parseFloat(document.getElementById("electricity-cost")?.value) || 0;
    const gasCost = parseFloat(document.getElementById("gas-cost")?.value) || 0;
    const laborCost = parseFloat(document.getElementById("labor-cost")?.value) || 0;
    const totalOperationalCost = electricityCost + gasCost + laborCost;
    
    // Production details from existing data
    // For existing batch productions, use the existing product_id or selected product_id
    let productId = production.product_id || ""
    
    // For new product, generate product_id if missing
    if (!productId && production.production_type === "new-product") {
      const category = production.category || "General"
      const timestamp = Date.now().toString().slice(-6)
      productId = `${category.substring(0, 2).toUpperCase()}${timestamp}`
    }
    // For existing batch, check if user selected a product from the dropdown
    if (production.production_type === "existing-batch" && !productId) {
      const selectedProductId = getInputValue("completion-product-select", "")
      if (selectedProductId) {
        productId = selectedProductId
        console.log("Using selected product ID:", productId)
      } else {
        console.error("Product ID is missing for existing batch production:", production)
        showResponseMessage("error", "Please select an existing product for this batch production.")
        return
      }
    }
    // Verify that the product exists in the database for existing batch
    if (production.production_type === "existing-batch") {
      const productExists = allProducts.some(p => p.product_id === productId)
      if (!productExists) {
        console.error("Product not found in allProducts:", productId)
        showResponseMessage("error", "Selected product not found. Please select a valid product.")
        return
      }
    }
    // Ensure we have required fields
    if (!production.product_name) {
      showResponseMessage("error", "Product name is missing from production data")
      return
    }
    if (!production.category) {
      showResponseMessage("error", "Product category is missing from production data")
      return
    }
    formData.append("product_id", productId)
    formData.append("product_name", production.product_name)
    formData.append("category", production.category)
    formData.append("batch_size", production.batch_size || quantityProduced)
    formData.append("priority", production.priority || "normal")
    formData.append("status", "completed")
    formData.append("progress", "100")
    formData.append("actual_completion", new Date().toISOString().slice(0, 19).replace('T', ' '))
    formData.append("actual_duration_hours", production.estimated_duration_hours || 8)
    formData.append("production_type", production.production_type || "new-product")
    formData.append("recipe_data", production.recipe_data || "")
    // For existing batch productions, don't auto-create product
    const autoCreateProduct = production.production_type === "existing-batch" ? "0" : "1"
    formData.append("auto_create_product", autoCreateProduct)
    formData.append("target_expiration_days", production.target_expiration_days || 30)
    formData.append("total_material_cost", production.total_material_cost || 0)
    formData.append("total_operational_cost", totalOperationalCost.toString())
    formData.append("total_production_cost", production.total_production_cost || 0)
    formData.append("cost_per_unit", production.cost_per_unit || 0)
    formData.append("quality_status", qualityScore >= 95 ? "excellent" : qualityScore >= 85 ? "good" : qualityScore >= 70 ? "acceptable" : "needs_improvement")
    formData.append("quality_notes", getInputValue("completion_notes", ""))
    formData.append("quality_checked_by", "Production Manager")
    formData.append("quality_checked_at", new Date().toISOString().slice(0, 19).replace('T', ' '))
    formData.append("assigned_to", production.assigned_to || "Admin")
    formData.append("created_by", production.created_by || "admin")
    formData.append("updated_at", new Date().toISOString().slice(0, 19).replace('T', ' '))
    // Additional calculated fields
    formData.append("yield_percentage", yieldPercentage.toString())
    formData.append("defect_rate", defectRate.toString())
    formData.append("quality_grade", qualityScore >= 95 ? "A" : qualityScore >= 85 ? "B" : qualityScore >= 70 ? "C" : "D")
    formData.append("quantity_rework", "0") // Default to 0 for now
    formData.append("output_batch_code", "OUT" + new Date().getFullYear().toString().slice(-2) + (new Date().getMonth() + 1).toString().padStart(2, '0') + new Date().getDate().toString().padStart(2, '0') + currentProductionId.toString().padStart(4, '0'))
    formData.append("expiration_date", production.expiration_date || "")
    formData.append("shelf_life_days", production.target_expiration_days || 30)
    formData.append("manufacturing_date", production.start_date || new Date().toISOString().slice(0, 10))
    formData.append("material_cost", production.total_material_cost || 0)
    formData.append("labor_cost", production.total_operational_cost || 0)
    formData.append("overhead_cost", "0")
    formData.append("total_cost", production.total_production_cost || 0)
    formData.append("cost_per_unit", production.cost_per_unit || 0)
    formData.append("packaging_type", "")
    formData.append("packaging_date", "")
    formData.append("storage_location", "")
    formData.append("stocks", quantityPassedQC.toString())
    formData.append("price", getInputValue("target_price", "0"))
    formData.append("product_expiration_date", production.expiration_date || "")
    // For existing batch productions, batch tracking should be enabled
    if (production.production_type === "new-product") {
      // Try to get batch tracking from production, fallback to wizardData, fallback to DOM
      let isBatchTracked = false;
      if (production.batch_tracking === 1 || production.batch_tracking === "1") {
        isBatchTracked = true;
      } else if (production.tracking_type === "batch") {
        isBatchTracked = true;
      } else if (wizardData && wizardData.trackingType === "batch") {
        isBatchTracked = true;
      } else {
        // Try to get from DOM (for new product modal)
        const trackingTypeInput = document.getElementById("tracking-type");
        if (trackingTypeInput && trackingTypeInput.value === "batch") {
          isBatchTracked = true;
        }
      }
      formData.append("batch_tracking", isBatchTracked ? "1" : "0");
      // --- Always send batch info if batch tracked ---
      if (isBatchTracked) {
        const batchCode = production.batch_code || getInputValue("batch-code", "B" + Date.now());
        const manufacturingDate = production.start_date || getInputValue("batch-manufacturing-date", new Date().toISOString().slice(0, 10));
        const expirationDate = production.expiration_date || getInputValue("calculated-expiration-date", "");
        formData.append("batch_code", batchCode);
        formData.append("manufacturing_date", manufacturingDate);
        formData.append("expiration_date", expirationDate);
        formData.append("quantity_passed_qc", getInputValue("quantity_passed_qc", "0"));
        formData.append("product_id", productId);
        // Debug log
        console.log("[BATCH DEBUG] batch_code:", batchCode, "manufacturing_date:", manufacturingDate, "expiration_date:", expirationDate, "quantity_passed_qc:", getInputValue("quantity_passed_qc", "0"), "product_id:", productId);
      }
    } else if (production.production_type === "existing-batch") {
      formData.append("batch_tracking", "1");
      // --- Always send batch info for existing batch ---
      const batchCode = production.batch_code || getInputValue("batch-code", "B" + Date.now());
      const manufacturingDate = production.start_date || getInputValue("batch-manufacturing-date", new Date().toISOString().slice(0, 10));
      const expirationDate = production.expiration_date || getInputValue("calculated-expiration-date", "");
      formData.append("batch_code", batchCode);
      formData.append("manufacturing_date", manufacturingDate);
      formData.append("expiration_date", expirationDate);
      formData.append("quantity_passed_qc", getInputValue("quantity_passed_qc", "0"));
      formData.append("product_id", productId);
      // Debug log
      console.log("[BATCH DEBUG] batch_code:", batchCode, "manufacturing_date:", manufacturingDate, "expiration_date:", expirationDate, "quantity_passed_qc:", getInputValue("quantity_passed_qc", "0"), "product_id:", productId);
    } else {
      formData.append("batch_tracking", production.batch_tracking === 1 || production.batch_tracking === "1" ? "1" : "0");
    }
    formData.append("created_by", "admin")

    // Debug: Log what we're sending
    console.log("FormData being sent:")
    for (const [key, value] of formData.entries()) {
      console.log(`${key}: ${value}`)
    }

    if (loadingModalInstance) loadingModalInstance.show()

    console.log("Sending request to complete_production.php...")
    
    fetch("complete_production.php", {
      method: "POST",
      body: formData,
    })
      .then((response) => {
        console.log("Response status:", response.status)
        console.log("Response headers:", response.headers)
        return response.json()
      })
      .then((data) => {
        console.log("Response data:", data)
        // Always show loading modal for 2 seconds
        setTimeout(() => {
          if (loadingModalInstance) loadingModalInstance.hide()

          if (data.success) {
            if (completeProductionModalInstance) completeProductionModalInstance.hide()
            // Show success modal for 2 seconds
            if (successModalInstance) successModalInstance.show()
            setTimeout(() => {
              if (successModalInstance) successModalInstance.hide()
              // Reload both active and completed productions
              loadOngoingProductions()
              loadProductionHistory()
              updateStatusCards()
              // Reload inventory table to show batch icon and Manage Batches button
              if (typeof loadProducts === 'function') loadProducts();
            }, 2000)
          } else {
            showResponseMessage("error", "Failed to complete production: " + data.message)
          }
        }, 2000)
      })
      .catch((error) => {
        if (loadingModalInstance) loadingModalInstance.hide()
        console.error("Fetch error details:", error)
        showResponseMessage("error", "Error completing production: " + error.message)
      })
  }

  // Helper functions for size data collection
  function collectSizeData() {
    const sizeData = []
    const sizeElements = document.querySelectorAll('input[name="size[]"], select[name="size[]"]')
    const sizeUnits = document.querySelectorAll('select[name="size_unit[]"]')
    const sizeQuantities = document.querySelectorAll('input[name="size_quantity[]"]')
    const sizePrices = document.querySelectorAll('input[name="size_price[]"]')

    sizeElements.forEach((element, index) => {
      const size = element.value
      const unit = sizeUnits[index]?.value || ""
      const quantity = Number.parseInt(sizeQuantities[index]?.value) || 0
      const price = Number.parseFloat(sizePrices[index]?.value) || 0

      if (size && quantity > 0) {
        sizeData.push({
          size: size,
          unit: unit,
          quantity: quantity,
          price: price,
        })
      }
    })

    return sizeData
  }

  function collectExistingSizeData() {
    const sizeData = []
    const sizeElements = document.querySelectorAll(".existing-size-select, .existing-size-input")
    const sizeUnits = document.querySelectorAll(".existing-size-unit")
    const sizeBatchQuantities = document.querySelectorAll(".existing-size-batch-quantity")

    sizeElements.forEach((element, index) => {
      const size = element.value
      const unit = sizeUnits[index]?.value || ""
      const batchQuantity = Number.parseInt(sizeBatchQuantities[index]?.value) || 0

      if (size && batchQuantity > 0) {
        sizeData.push({
          size: size,
          unit: unit,
          batch_quantity: batchQuantity,
        })
      }
    })

    return sizeData
  }

  // UTILITY FUNCTIONS

  // Initialize the production management system when DOM is loaded
  console.log("Initializing production management system...")
  initializeProduction()
  console.log("Production management system initialized")

  // Also update on size type change
  sizeTypeSelect.addEventListener("change", () => {
    sizesContainer.innerHTML = ""
    addSizeRow()
    // Hide/show Unit header based on size type
    setTimeout(() => {
      const unitHeader = document.querySelector("#size-price-group .row.mb-2 > .col-md-2")
      if (sizeTypeSelect.value === "sml") {
        if (unitHeader) unitHeader.style.display = "none"
      } else {
        if (unitHeader) unitHeader.style.display = ""
      }
    }, 100)
  })

  window.addExistingSizeRow = addExistingSizeRow
  
  // Recipe system functions
  window.saveRecipeForNewProduct = function(productId, materialsData) {
    console.log("📝 Saving recipe for new product:", productId)
    
    const recipeData = {
      product_id: productId,
      recipe_name: document.getElementById("new-product-name")?.value + " Recipe",
      recipe_description: document.getElementById("new-product-description")?.value || "Standard recipe for " + document.getElementById("new-product-name")?.value,
      materials: materialsData.map(material => ({
        material_id: material.material_id,
        quantity: material.quantity,
        unit: material.unit,
        unit_cost: material.unit_cost,
        total_cost: material.total_cost,
        notes: material.notes || ""
      })),
      total_cost: totalMaterialCost
    }

    fetch("save_recipe.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(recipeData)
    })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        console.log("✅ Recipe saved successfully:", data)
      } else {
        console.error("❌ Failed to save recipe:", data.message)
      }
    })
    .catch(error => {
      console.error("❌ Error saving recipe:", error)
    })
  }

  // Patch: Enhanced loadProductRecipes to use all_materials_used for Another Batch
  window.loadProductRecipes = function(productId) {
    console.log("📋 Loading recipes for product:", productId)
    fetch(`get_product_recipes.php?product_id=${productId}`)
      .then(response => response.json())
      .then(data => {
        console.log("📋 API Response:", data)
        // --- PATCH: For Another Batch, use all_materials_used to populate the Recipe & Materials section ---
        if (selectedProductionType === "existing-batch" && data.all_materials_used && data.all_materials_used.length > 0) {
          displayAllMaterialsUsedForExistingBatch(data.all_materials_used)
          showResponseMessage("success", `All materials ever used for this product are loaded. Please input quantities as needed.`)
        } else if (data.success && data.recipes && data.recipes.length > 0) {
          // Fallback: load first recipe's materials (for new product or if no all_materials_used)
          const firstRecipe = data.recipes[0]
          if (firstRecipe && firstRecipe.materials && firstRecipe.materials.length > 0) {
            displayRecipeMaterials(firstRecipe.materials)
            showResponseMessage("success", `Materials loaded from recipe: ${firstRecipe.recipe_name}`)
          } else {
            showManualMaterialEntry()
          }
        } else {
          showManualMaterialEntry()
        }
      })
      .catch(error => {
        console.error("❌ Error loading recipes:", error)
        showManualMaterialEntry()
      })
  }

  // New: Display all materials ever used for this product (Another Batch)
  window.displayAllMaterialsUsedForExistingBatch = function(materials) {
    const recipeMaterialsSection = document.getElementById("recipe-materials-section")
    const recipeMaterialsDisplay = document.getElementById("recipe-materials-display")
    const materialSection = document.getElementById("material-section")
    const recipeMaterials = document.getElementById("recipe-materials")

    if (recipeMaterialsSection && recipeMaterialsDisplay) {
      recipeMaterialsSection.style.display = "block"
      // Clear existing content
      recipeMaterialsDisplay.innerHTML = ""
      // Create materials display
      let html = `
        <div class="row mb-3">
          <div class="col-md-4"><strong>Material</strong></div>
          <div class="col-md-2"><strong>Unit</strong></div>
          <div class="col-md-2"><strong>Unit Cost</strong></div>
          <div class="col-md-2"><strong>Quantity</strong></div>
          <div class="col-md-2"><strong>Total Cost</strong></div>
        </div>
      `
      materials.forEach((material, index) => {
        const unit = material.measurement_type || material.unit_measurement || "-"
        const unitCost = material.cost || 0
        // Always leave quantity blank for user input
        const quantity = ""
        html += `
          <div class="row mb-3 recipe-material-row" data-material-id="${material.material_id}">
            <div class="col-md-4">
              <div class="form-control-plaintext">${material.material_name}</div>
            </div>
            <div class="col-md-2">
              <div class="form-control-plaintext">${unit}</div>
            </div>
            <div class="col-md-2">
              <div class="form-control-plaintext">₱${parseFloat(unitCost).toFixed(2)}</div>
            </div>
            <div class="col-md-2">
              <input type="number" class="form-control recipe-quantity-input" value="" step="0.01" min="0" data-unit-cost="${unitCost}" onchange="updateRecipeMaterialCost(this)">
            </div>
            <div class="col-md-2">
              <div class="form-control-plaintext recipe-total-cost">₱0.00</div>
            </div>
          </div>
        `
      })
      // Add total cost summary
      html += `
        <div class="cost-summary mt-4">
          <div class="cost-summary-title">
            <i class="bi bi-calculator"></i>
            All Materials Cost Summary
          </div>
          <div class="cost-item">
            <span>Total Material Cost:</span>
            <span id="recipe-total-material-cost">₱${window.calculateRecipeTotalCost(materials)}</span>
          </div>
        </div>
      `
      recipeMaterialsDisplay.innerHTML = html
      // Hide the manual material entry section
      if (materialSection) materialSection.style.display = "none"
      if (recipeMaterials) recipeMaterials.style.display = "none"
    } else {
      showManualMaterialEntry()
    }
  }

  window.displayRecipeSelection = function(recipes) {
    const recipeSelectionSection = document.getElementById("recipe-selection-section")
    if (!recipeSelectionSection) return

    let html = `
      <div class="form-section">
        <div class="form-section-title">
          <i class="bi bi-list-check me-2"></i>Recipe Selection
        </div>
        <div class="alert alert-info">
          <i class="bi bi-info-circle me-2"></i>
          <strong>Found ${recipes.length} recipe(s) for this product.</strong> Select a recipe to automatically load materials, or add materials manually.
        </div>
        <div class="recipe-options mb-3">
    `

    recipes.forEach((recipe, index) => {
      html += `
        <div class="recipe-option-card" data-recipe-id="${recipe.id}">
          <div class="recipe-option-header">
            <h6 class="recipe-name">${recipe.recipe_name}</h6>
            <span class="badge bg-primary">${recipe.material_count} materials</span>
          </div>
          <div class="recipe-option-details">
            <p class="recipe-description">${recipe.recipe_description || "No description"}</p>
            <div class="recipe-costs">
              <small class="text-muted">Total Cost: ₱${parseFloat(recipe.total_cost || 0).toFixed(2)}</small>
            </div>
          </div>
          <div class="recipe-option-actions">
            <button type="button" class="btn btn-sm btn-primary" onclick="loadRecipeMaterials(${recipe.id})">
              <i class="bi bi-arrow-down-circle me-1"></i>Use This Recipe
            </button>
          </div>
        </div>
      `
    })

    html += `
        </div>
        <div class="text-center">
          <button type="button" class="btn btn-outline-secondary" onclick="showManualMaterialEntry()">
            <i class="bi bi-plus-circle me-1"></i>Add Materials Manually
          </button>
        </div>
      </div>
    `

    recipeSelectionSection.innerHTML = html
    recipeSelectionSection.style.display = "block"
  }

  window.loadRecipeMaterials = function(recipeId) {
    console.log("📋 Loading materials for recipe:", recipeId)
    
    // Get the selected product ID from the dropdown
    const existingProductSelect = document.getElementById("existing-product-select")
    const selectedProductId = existingProductSelect ? existingProductSelect.value : selectedProductData.product_id
    
    fetch(`get_product_recipes.php?product_id=${selectedProductId}`)
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        const recipe = data.recipes.find(r => r.id == recipeId)
        if (recipe) {
          console.log("✅ Recipe materials loaded:", recipe.materials)
          populateMaterialsFromRecipe(recipe.materials)
          hideRecipeSelection()
        }
      }
    })
    .catch(error => {
      console.error("❌ Error loading recipe materials:", error)
      showResponseMessage("error", "Error loading recipe materials")
    })
  }

  window.displayRecipeMaterials = function(materials) {
    console.log("📋 Displaying recipe materials:", materials)
    
    // Show the recipe materials section
    const recipeMaterialsSection = document.getElementById("recipe-materials-section")
    const recipeMaterialsDisplay = document.getElementById("recipe-materials-display")
    
    if (recipeMaterialsSection && recipeMaterialsDisplay) {
      recipeMaterialsSection.style.display = "block"
      
      // Clear existing content
      recipeMaterialsDisplay.innerHTML = ""
      
      // Create materials display
      let html = `
        <div class="row mb-3">
          <div class="col-md-3"><strong>Material</strong></div>
          <div class="col-md-2"><strong>Original Qty</strong></div>
          <div class="col-md-2"><strong>Unit</strong></div>
          <div class="col-md-2"><strong>Unit Cost</strong></div>
          <div class="col-md-2"><strong>New Qty</strong></div>
          <div class="col-md-1"><strong>Total Cost</strong></div>
        </div>
      `
      
      materials.forEach((material, index) => {
        const materialId = material.material_id
        const materialName = material.material_name || `Material ${index + 1}`
        const originalQty = material.quantity
        const unit = material.unit
        const unitCost = material.unit_cost || 0
        const originalTotalCost = material.total_cost || (originalQty * unitCost)
        
        html += `
          <div class="row mb-3 recipe-material-row" data-material-id="${materialId}">
            <div class="col-md-3">
              <div class="form-control-plaintext">${materialName}</div>
            </div>
            <div class="col-md-2">
              <div class="form-control-plaintext">${originalQty} ${unit}</div>
            </div>
            <div class="col-md-2">
              <div class="form-control-plaintext">${unit}</div>
            </div>
            <div class="col-md-2">
              <div class="form-control-plaintext">₱${parseFloat(unitCost).toFixed(2)}</div>
            </div>
            <div class="col-md-2">
              <input type="number" class="form-control recipe-quantity-input" 
                     value="${originalQty}" step="0.01" min="0" 
                     data-original-qty="${originalQty}" 
                     data-unit-cost="${unitCost}"
                     onchange="updateRecipeMaterialCost(this)">
            </div>
            <div class="col-md-1">
              <div class="form-control-plaintext recipe-total-cost">₱${parseFloat(originalTotalCost).toFixed(2)}</div>
            </div>
          </div>
        `
      })
      
      // Add total cost summary
      html += `
        <div class="cost-summary mt-4">
          <div class="cost-summary-title">
            <i class="bi bi-calculator"></i>
            Recipe Material Cost Summary
          </div>
          <div class="cost-item">
            <span>Total Material Cost:</span>
            <span id="recipe-total-material-cost">₱${calculateRecipeTotalCost(materials)}</span>
          </div>
        </div>
      `
      
      recipeMaterialsDisplay.innerHTML = html
      
      // Hide the manual material entry section
      const materialSection = document.getElementById("material-section")
      if (materialSection) {
        materialSection.style.display = "none"
      }
      
      console.log("✅ Recipe materials displayed successfully")
    } else {
      console.error("❌ Recipe materials section not found")
      showManualMaterialEntry()
    }
  }

  window.showManualMaterialEntry = function() {
    // Hide recipe materials section
    const recipeMaterialsSection = document.getElementById("recipe-materials-section")
    if (recipeMaterialsSection) {
      recipeMaterialsSection.style.display = "none"
    }
    
    // Show the existing material entry section
    const materialSection = document.getElementById("material-section")
    if (materialSection) {
      materialSection.style.display = "block"
    }
    
    // Ensure recipe materials container is visible
    const recipeMaterials = document.getElementById("recipe-materials")
    if (recipeMaterials) {
      recipeMaterials.style.display = "block"
    }
    
    // Add a default material row if none exists
    if (recipeMaterials && recipeMaterials.children.length === 0) {
      addMaterialRow()
    }
  }

  window.updateRecipeMaterialCost = function(input) {
    const newQty = parseFloat(input.value) || 0
    const unitCost = parseFloat(input.dataset.unitCost) || 0
    const totalCost = newQty * unitCost
    
    // Update the total cost display for this material
    const row = input.closest('.recipe-material-row')
    const totalCostElement = row.querySelector('.recipe-total-cost')
    if (totalCostElement) {
      totalCostElement.textContent = `₱${totalCost.toFixed(2)}`
    }
    
    // Update the overall total
    updateRecipeTotalCost()
  }
  
  window.calculateRecipeTotalCost = function(materials) {
    let total = 0
    materials.forEach(material => {
      const qty = parseFloat(material.quantity) || 0
      const unitCost = parseFloat(material.unit_cost) || 0
      total += qty * unitCost
    })
    return total.toFixed(2)
  }
  
  window.updateRecipeTotalCost = function() {
    const quantityInputs = document.querySelectorAll('.recipe-quantity-input')
    let total = 0
    
    quantityInputs.forEach(input => {
      const qty = parseFloat(input.value) || 0
      const unitCost = parseFloat(input.dataset.unitCost) || 0
      total += qty * unitCost
    })
    
    const totalCostElement = document.getElementById('recipe-total-material-cost')
    if (totalCostElement) {
      totalCostElement.textContent = `₱${total.toFixed(2)}`
    }
  }
  
  window.hideRecipeSelection = function() {
    const recipeSelectionSection = document.getElementById("recipe-selection-section")
    if (recipeSelectionSection) {
      recipeSelectionSection.style.display = "none"
    }
  }
  
  // Test function to check server connectivity
  window.testServerConnection = function() {
    console.log("Testing server connection...")
    
    // Test 1: Check if test file is accessible
    fetch("test_complete_production.php")
      .then(response => response.json())
      .then(data => {
        console.log("Test file response:", data)
      })
      .catch(error => {
        console.error("Test file error:", error)
      })
    
    // Test 2: Check database connection
    fetch("test_db_connection.php")
      .then(response => response.json())
      .then(data => {
        console.log("Database test response:", data)
      })
      .catch(error => {
        console.error("Database test error:", error)
      })
  }

  // --- Helper to auto-populate materials for existing batch ---
  function autoPopulateRecipeMaterialsForExistingBatch() {
    const recipeMaterials = document.getElementById("recipe-materials");
    if (!recipeMaterials) return;
    recipeMaterials.innerHTML = "";
    const existingProductSelect = document.getElementById("existing-product-select");
    const productId = existingProductSelect ? existingProductSelect.value : null;
    if (!productId) return;

    // 1. Try to fetch latest completed production's recipe_data
    fetch(`api/fetch_latest_production.php?product_id=${productId}`)
      .then(response => response.json())
      .then(data => {
        if (data.success && data.production && Array.isArray(data.production.recipe_data) && data.production.recipe_data.length > 0) {
          console.log('[DEBUG] Populating materials from latest production recipe_data:', data.production.recipe_data);
          data.production.recipe_data.forEach((material, idx) => {
            addMaterialRow();
            const lastRow = recipeMaterials.lastElementChild;
            if (lastRow) {
              const materialSelect = lastRow.querySelector(".material-select");
              const quantityInput = lastRow.querySelector(".quantity-input");
              setTimeout(() => {
                if (materialSelect) {
                  materialSelect.value = material.materialId || material.material_id;
                  materialSelect.dispatchEvent(new Event('change'));
                }
                if (quantityInput) {
                  quantityInput.value = material.quantity;
                  quantityInput.readOnly = false;
                }
                console.log(`[DEBUG] Added material row from recipe_data #${idx+1}:`, material.materialId || material.material_id, material.quantity);
                console.log('[DEBUG] Total material rows:', recipeMaterials.children.length);
              }, 100);
            }
          });
        } else {
          // Fallback to recipe table
          fetch(`get_product_recipes.php?product_id=${productId}`)
            .then(response => response.json())
            .then(data => {
              if (data.success && data.recipes.length > 0) {
                const firstRecipe = data.recipes[0];
                if (firstRecipe && Array.isArray(firstRecipe.materials) && firstRecipe.materials.length > 0) {
                  console.log('[DEBUG] Populating materials for Another batch from recipe table:', firstRecipe.materials);
                  firstRecipe.materials.forEach((material, idx) => {
                    addMaterialRow();
                    const lastRow = recipeMaterials.lastElementChild;
                    if (lastRow) {
                      const materialSelect = lastRow.querySelector(".material-select");
                      const quantityInput = lastRow.querySelector(".quantity-input");
                      setTimeout(() => {
                        if (materialSelect) {
                          materialSelect.value = material.material_id;
                          materialSelect.dispatchEvent(new Event('change'));
                        }
                        if (quantityInput) {
                          quantityInput.value = material.quantity;
                          quantityInput.readOnly = false;
                        }
                        console.log(`[DEBUG] Added material row from recipe table #${idx+1}:`, material.material_id, material.quantity);
                        console.log('[DEBUG] Total material rows:', recipeMaterials.children.length);
                      }, 100);
                    }
                  });
                } else {
                  addMaterialRow();
                  console.log('[DEBUG] No recipe materials found, added blank row.');
                }
              } else {
                addMaterialRow();
                console.log('[DEBUG] No recipe found, added blank row.');
              }
            });
        }
      });
  }

  // Before submitting production completion, force update wizardData.productInfo.name from DOM
  if (wizardData && wizardData.productInfo) {
    wizardData.productInfo.name = document.getElementById("new-product-name")?.value || wizardData.productInfo.name || "";
  }

  // Utility to show/hide Target Price input in Complete Production modal
  function updateTargetPriceVisibilityForCompletionModal(productionType) {
    const targetPriceGroup = document.getElementById('target-price-group');
    if (!targetPriceGroup) return;
    if (productionType === 'existing-batch' || productionType === 'Another Batch') {
      targetPriceGroup.style.display = 'none';
    } else {
      targetPriceGroup.style.display = '';
    }
  }

  // --- Unified patch for openCompleteProductionModal ---
  const originalOpenCompleteProductionModalUnified = openCompleteProductionModal;
  openCompleteProductionModal = function(productionId) {
    setTimeout(() => {
      // 0. Set selectedProductionType for modal context
      const production = allProductions.find((p) => p.id == productionId);
      if (production && production.production_type === 'existing-batch') {
        selectedProductionType = 'existing-batch';
      }
      // 1. Update Target Price visibility
      if (production) {
        updateTargetPriceVisibilityForCompletionModal(production.production_type);
      }
      // 2. Log all input fields in the modal
      const modal = document.getElementById('completeProductionModal');
      if (modal) {
        const inputs = modal.querySelectorAll('input');
        console.log('[UI DEBUG] Inputs in Complete Production modal:');
        inputs.forEach(input => {
          console.log('  id:', input.id, 'name:', input.name, 'value:', input.value);
        });
      } else {
        console.log('[UI DEBUG] completeProductionModal not found');
      }
      // 3. Attach direct event listener to quantity_produced
      const qp = document.getElementById('quantity_produced');
      if (qp) {
        console.log('[UI DEBUG] Attaching direct input event listener to quantity_produced');
        qp.oninput = null;
        qp.addEventListener('input', function() {
          console.log('[UI DEBUG] (DIRECT) quantity_produced input event fired');
          calculateTotalBatchQuantity();
          updateTotalProductionCost();
          updateProfitCalculations();
        });
      } else {
        console.log('[UI DEBUG] quantity_produced field NOT FOUND in modal');
      }
      // 4. Immediately compute and display cost analysis based on pre-filled inputs
      calculateTotalBatchQuantity();
      updateTotalProductionCost();
      updateProfitCalculations();
    }, 300);
    if (typeof originalOpenCompleteProductionModalUnified === 'function') {
      originalOpenCompleteProductionModalUnified.apply(this, arguments);
    }
  };

  // Patch cost analysis to use default price for existing product
  function getExistingProductDefaultPrice() {
    // Try both selects for product ID
    const productId = document.getElementById('completion-product-select')?.value || document.getElementById('existing-product-select')?.value;
    if (!productId) return 0;
    const product = allProducts.find((p) => p.product_id === productId);
    return product ? Number.parseFloat(product.price) || 0 : 0;
  }

  // Patch calculateExistingProductRevenue to use modal fields in Complete Production modal
  const originalCalculateExistingProductRevenue = calculateExistingProductRevenue;
  calculateExistingProductRevenue = function() {
    // Use the correct select and quantity fields from the Complete Production modal if present
    const productId = document.getElementById('completion-product-select')?.value || document.getElementById('existing-product-select')?.value;
    if (!productId) {
      console.log('[DEBUG] Revenue calculation: No productId found');
      return 0;
    }
    const product = allProducts.find((p) => p.product_id === productId);
    if (!product) {
      console.log('[DEBUG] Revenue calculation: No product found for productId', productId);
      return 0;
    }
    // Use the quantity from the Complete Production modal if present
    const modalQuantity = document.getElementById('quantity_produced')?.value;
    const quantity = Number.parseInt(modalQuantity) || 0;
    const price = getExistingProductDefaultPrice();
    const revenue = quantity * price;
    console.log('[DEBUG] Revenue calculation:', 'productId:', productId, 'quantity:', quantity, 'price:', price, 'revenue:', revenue);
    totalRevenue = revenue;
    return revenue;
  };

  // Utility to update category dropdown based on tracking type
  function updateCategoryDropdownForTrackingType(trackingType) {
    const categorySelect = document.getElementById("new-product-category");
    if (!categorySelect) return;
    let options = [];
    if (trackingType === "normal") {
      options = [
        { value: "", text: "Select category" },
        { value: "Detergent", text: "Detergent" },
        { value: "Others", text: "Others" },
      ];
    } else if (trackingType === "batch") {
      options = [
        { value: "", text: "Select category" },
        { value: "Preserves", text: "Preserves" },
        { value: "Beverages", text: "Beverages" },
        { value: "Snacks", text: "Snacks" },
      ];
    } else {
      // Default: show all
      options = [
        { value: "", text: "Select category" },
        { value: "Preserves", text: "Preserves" },
        { value: "Beverages", text: "Beverages" },
        { value: "Snacks", text: "Snacks" },
        { value: "Detergent", text: "Detergent" },
        { value: "Others", text: "Others" },
      ];
    }
    categorySelect.innerHTML = "";
    options.forEach(opt => {
      const option = document.createElement("option");
      option.value = opt.value;
      option.textContent = opt.text;
      categorySelect.appendChild(option);
    });
  }
})

// Add a debug log when the Complete Production modal opens to confirm the field exists
const originalOpenCompleteProductionModalForDebug = openCompleteProductionModal;
openCompleteProductionModal = function(productionId) {
  setTimeout(() => {
    const qp = document.getElementById('quantity_produced');
    if (qp) {
      console.log('[UI DEBUG] quantity_produced field exists in modal');
    } else {
      console.log('[UI DEBUG] quantity_produced field NOT FOUND in modal');
    }
  }, 200);
  if (typeof originalOpenCompleteProductionModalForDebug === 'function') {
    originalOpenCompleteProductionModalForDebug.apply(this, arguments);
  }
};

// ... existing code ...
const originalOpenCompleteProductionModalForDebug2 = openCompleteProductionModal;
openCompleteProductionModal = function(productionId) {
  setTimeout(() => {
    const modal = document.getElementById('completeProductionModal');
    if (modal) {
      const inputs = modal.querySelectorAll('input');
      console.log('[UI DEBUG] Inputs in Complete Production modal:');
      inputs.forEach(input => {
        console.log('  id:', input.id, 'name:', input.name, 'value:', input.value);
      });
    } else {
      console.log('[UI DEBUG] completeProductionModal not found');
    }
    const qp = document.getElementById('quantity_produced');
    if (qp) {
      console.log('[UI DEBUG] quantity_produced field exists in modal');
    } else {
      console.log('[UI DEBUG] quantity_produced field NOT FOUND in modal');
    }
  }, 200);
  if (typeof originalOpenCompleteProductionModalForDebug2 === 'function') {
    originalOpenCompleteProductionModalForDebug2.apply(this, arguments);
  }
};
// ... existing code ...

// ... existing code ...
const originalOpenCompleteProductionModalForFix = openCompleteProductionModal;
openCompleteProductionModal = function(productionId) {
  setTimeout(() => {
    const qp = document.getElementById('quantity_produced');
    if (qp) {
      console.log('[UI DEBUG] Attaching direct input event listener to quantity_produced');
      qp.oninput = null;
      qp.addEventListener('input', function() {
        console.log('[UI DEBUG] (DIRECT) quantity_produced input event fired');
        calculateTotalBatchQuantity();
        updateTotalProductionCost();
        updateProfitCalculations();
      });
    } else {
      console.log('[UI DEBUG] quantity_produced field NOT FOUND in modal');
    }
  }, 300);
  if (typeof originalOpenCompleteProductionModalForFix === 'function') {
    originalOpenCompleteProductionModalForFix.apply(this, arguments);
  }
};

function enhanceFormSubmission() {
  // Override the existing startProduction function to handle photos and product_id
  const originalStartProduction = window.startProduction;

  window.startProduction = function () {
    const formData = new FormData();

    // Add product_id from the input field
    const productIdInput = document.getElementById("new-product-id");
    if (productIdInput) {
      formData.append("product_id", productIdInput.value); // Send product_id
    }

    // Add photo file if selected
    const photoInput = document.getElementById("new-product-photo");
    if (photoInput && photoInput.files[0]) {
      formData.append("product_photo", photoInput.files[0]);
    }

    // Add all other form data
    const form = document.getElementById("new-product-production-form");
    if (form) {
      const formElements = new FormData(form);
      for (const [key, value] of formElements.entries()) {
        formData.append(key, value);
      }
    }

    // Call original function with enhanced form data
    if (originalStartProduction) {
      originalStartProduction.call(this, formData);
    }
  };
}



// ... existing code ...


