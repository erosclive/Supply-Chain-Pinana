// Complete Production Management JavaScript - Enhanced with Working Status Updates and Quality Check

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
  const totalSteps = 6
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
    // Status card filtering
    statusCards.forEach((card) => {
      card.addEventListener("click", function () {
        const status = this.dataset.status
        filterByStatus(status)
        updateActiveStatusCard(this)
      })
    })

    // Date filter buttons
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
    currentDateFilter = range

    if (range === "custom") {
      customDateRange.classList.add("show")
    } else {
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

    // Render filtered results
    renderFilteredProductions(filteredProductions)
    renderProductionHistory(filteredHistory)
    updateProductionCounts(filteredProductions, filteredHistory)
  }

  // Apply date filter to productions
  function applyDateFilter(productions) {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000)

    switch (currentDateFilter) {
      case "today":
        return productions.filter((p) => {
          const prodDate = new Date(p.start_date)
          return prodDate >= today
        })

      case "yesterday":
        return productions.filter((p) => {
          const prodDate = new Date(p.start_date)
          return prodDate >= yesterday && prodDate < today
        })

      case "this-week":
        const startOfWeek = new Date(today)
        startOfWeek.setDate(today.getDate() - today.getDay())
        return productions.filter((p) => {
          const prodDate = new Date(p.start_date)
          return prodDate >= startOfWeek
        })

      case "last-week":
        const startOfLastWeek = new Date(today)
        startOfLastWeek.setDate(today.getDate() - today.getDay() - 7)
        const endOfLastWeek = new Date(startOfLastWeek)
        endOfLastWeek.setDate(startOfLastWeek.getDate() + 6)
        return productions.filter((p) => {
          const prodDate = new Date(p.start_date)
          return prodDate >= startOfLastWeek && prodDate <= endOfLastWeek
        })

      case "this-month":
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
        return productions.filter((p) => {
          const prodDate = new Date(p.start_date)
          return prodDate >= startOfMonth
        })

      case "last-month":
        const startOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1)
        const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0)
        return productions.filter((p) => {
          const prodDate = new Date(p.start_date)
          return prodDate >= startOfLastMonth && prodDate <= endOfLastMonth
        })

      case "custom":
        if (customStartDate && customEndDate) {
          const start = new Date(customStartDate)
          const end = new Date(customEndDate)
          end.setHours(23, 59, 59, 999) // Include the entire end date
          return productions.filter((p) => {
            const prodDate = new Date(p.start_date)
            return prodDate >= start && prodDate <= end
          })
        }
        return productions

      default:
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

    dateFilterButtons.forEach((btn) => btn.classList.remove("active"))
    dateFilterButtons[0].classList.add("active") // Activate "All Time" button

    if (productionSearch) productionSearch.value = ""
    if (customDateRange) customDateRange.classList.remove("show")

    // Reapply filters (which will show all data)
    applyFilters()
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
          // Hide quality check modal
          qualityCheckModalInstance.hide()

          // Show success message
          showResponseMessage("success", "Quality check submitted successfully")

          // Reload both active and completed productions
          loadOngoingProductions()
          loadProductionHistory()
          updateStatusCards()

          // Close any open details modal
          if (productionDetailsModalInstance && productionDetailsModalInstance._isShown) {
            productionDetailsModalInstance.hide()
          }
        } else {
          showResponseMessage("error", "Failed to submit quality check: " + data.message)
        }
      })
      .catch((error) => {
        loadingModalInstance.hide()
        showResponseMessage("error", "Error submitting quality check. Please try again.")
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

      if (production && production.status === "in-progress") {
        const startDate = new Date(production.start_date)
        const estimatedCompletion = new Date(production.estimated_completion)
        const now = new Date()

        const totalDuration = estimatedCompletion - startDate
        const elapsed = now - startDate

        const progress = Math.min(Math.floor((elapsed / totalDuration) * 100), 99)

        production.progress = progress

        const progressRing = card.querySelector(".progress-ring .progress")
        const progressPercentage = card.querySelector(".progress-percentage")

        if (progressRing && progressPercentage) {
          const circumference = 188.5
          const offset = circumference - (progress / 100) * circumference
          progressRing.style.strokeDashoffset = offset
          progressPercentage.textContent = `${progress}%`
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
          renderOngoingProductions()
          updateStatusCards()
          updateProductionCounts()
          console.log("✅ Active productions loaded from database:", allProductions.length)

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

    materialSelects.forEach((select) => {
      const currentValue = select.value
      select.innerHTML = '<option value="">Select material</option>'

      allMaterials.forEach((material) => {
        const option = document.createElement("option")
        option.value = material.material_id || material.id

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

    const startDate = new Date(production.start_date)
    const estimatedCompletion = new Date(production.estimated_completion)

    const now = new Date()
    const timeRemaining = estimatedCompletion - now
    const hoursRemaining = Math.max(0, Math.floor(timeRemaining / (1000 * 60 * 60)))
    const minutesRemaining = Math.max(0, Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60)))

    const startDateFormatted = startDate.toLocaleDateString()
    const estimatedCompletionFormatted =
      estimatedCompletion.toLocaleDateString() +
      " " +
      estimatedCompletion.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })

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

    const progress = production.progress || 0
    const circumference = 188.5
    const offset = circumference - (progress / 100) * circumference

    // Determine action buttons based on status
    let actionButtons = `
      <button type="button" class="btn btn-outline-enhanced btn-enhanced view-production-btn" data-production-id="${production.id}">
        <i class="bi bi-eye me-1"></i>View Details
      </button>
    `

    if (production.status === "pending" || production.status === "in-progress") {
      actionButtons += `
        <button type="button" class="btn btn-primary-enhanced btn-enhanced update-status-btn" data-production-id="${production.id}">
          <i class="bi bi-arrow-right me-1"></i>Update Status
        </button>
      `
    } else if (production.status === "quality-check") {
      actionButtons += `
        <button type="button" class="btn btn-warning btn-enhanced quality-check-btn" data-production-id="${production.id}">
          <i class="bi bi-shield-check me-1"></i>Quality Check
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
          <div class="progress-ring-container">
            <div class="progress-ring">
              <svg viewBox="0 0 68 68">
                <circle class="bg" cx="34" cy="34" r="30" />
                <circle class="progress" cx="34" cy="34" r="30" style="stroke-dashoffset: ${offset}px" />
              </svg>
              <div class="progress-percentage">${progress}%</div>
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
              <i class="bi bi-hourglass-split"></i>
            </div>
            <div class="timeline-content">
              <div class="timeline-title">Time Remaining</div>
              <div class="timeline-time">${hoursRemaining}h ${minutesRemaining}m</div>
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
      const updateBtn = col.querySelector(".update-status-btn")
      const qualityBtn = col.querySelector(".quality-check-btn")

      if (viewBtn) {
        viewBtn.addEventListener("click", () => viewProductionDetails(production.id))
      }

      if (updateBtn) {
        updateBtn.addEventListener("click", () => updateProductionStatus(production.id))
      }

      if (qualityBtn) {
        qualityBtn.addEventListener("click", () => openQualityCheckModal(production.id))
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

  function resetWizard() {
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
    if (existingProductProductionForm) existingProductProductionForm.reset()

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

    showStep(1)
    updateWizardProgress()
    updateWizardButtons()
  }

  function openProduceProductModal() {
    resetWizard()
    if (produceProductModalInstance) {
      produceProductModalInstance.show()
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
    })

    if (tracking === "normal") {
      if (normalTrackFields) normalTrackFields.classList.remove("d-none")
      if (batchTrackFields) batchTrackFields.classList.add("d-none")
    } else if (tracking === "batch") {
      if (normalTrackFields) normalTrackFields.classList.add("d-none")
      if (batchTrackFields) batchTrackFields.classList.remove("d-none")
      generateBatchCode()
    }

    const trackingTypeInput = document.getElementById("tracking-type")
    if (trackingTypeInput) trackingTypeInput.value = tracking
    wizardData.trackingType = tracking
  }

  function showStep(step) {
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

    handleStepSpecificLogic(step)
  }

  function handleStepSpecificLogic(step) {
    switch (step) {
      case 2:
        if (selectedProductionType === "new-product") {
          document.getElementById("new-product-step-content").classList.remove("d-none")
          document.getElementById("existing-product-step-content").classList.add("d-none")
        } else if (selectedProductionType === "existing-batch") {
          document.getElementById("new-product-step-content").classList.add("d-none")
          document.getElementById("existing-product-step-content").classList.remove("d-none")
        }
        break
      case 3:
        if (allMaterials.length === 0) {
          loadMaterials()
        }

        if (recipeMaterials && recipeMaterials.children.length === 0) {
          addMaterialRow()
        }
        break
      case 5:
        if (selectedProductionType === "existing-batch") {
          document.getElementById("existing-schedule-section").classList.remove("d-none")
        } else {
          document.getElementById("existing-schedule-section").classList.add("d-none")
        }

        const today = new Date().toISOString().split("T")[0]
        if (document.getElementById("new-start-date")) {
          document.getElementById("new-start-date").value = today
        }
        if (document.getElementById("existing-start-date")) {
          document.getElementById("existing-start-date").value = today
        }
        break
      case 6:
        populateReviewContent()
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
          return (
            selectedTrackingType !== null &&
            document.getElementById("new-product-name").value.trim() !== "" &&
            document.getElementById("new-product-category").value !== ""
          )
        } else {
          return document.getElementById("existing-product-select").value !== ""
        }
      case 3:
        const materialSelects = document.querySelectorAll(".material-select")
        const hasValidMaterials = Array.from(materialSelects).some((select) => {
          const row = select.closest(".recipe-item")
          const quantityInput = row?.querySelector(".quantity-input")
          return select.value !== "" && quantityInput?.value && Number.parseFloat(quantityInput.value) > 0
        })

        if (!hasValidMaterials) {
          showResponseMessage("error", "Please add at least one material with a valid quantity for the recipe.")
        }

        return hasValidMaterials
      case 4:
        return true
      case 5:
        if (selectedProductionType === "new-product") {
          return document.getElementById("new-start-date").value !== ""
        } else {
          return document.getElementById("existing-start-date").value !== ""
        }
      case 6:
        return true
      default:
        return true
    }
  }

  function nextStep() {
    if (!validateCurrentStep()) {
      showValidationError()
      return
    }

    saveCurrentStepData()

    if (currentStep < totalSteps) {
      currentStep++
      showStep(currentStep)
      updateWizardProgress()
      updateWizardButtons()
    }
  }

  function previousStep() {
    if (currentStep > 1) {
      currentStep--
      showStep(currentStep)
      updateWizardProgress()
      updateWizardButtons()
    }
  }

  function saveCurrentStepData() {
    switch (currentStep) {
      case 1:
        wizardData.productionType = selectedProductionType
        break
      case 2:
        if (selectedProductionType === "new-product") {
          wizardData.trackingType = selectedTrackingType
          wizardData.productInfo = {
            name: document.getElementById("new-product-name")?.value || "",
            category: document.getElementById("new-product-category")?.value || "",
            price: document.getElementById("new-product-price")?.value || "0",
            quantity: document.getElementById("new-product-quantity")?.value || "0",
          }
        } else {
          wizardData.existingProduct = {
            productId: document.getElementById("existing-product-select")?.value || "",
            batchSize: document.getElementById("existing-batch-size")?.value || "0",
          }
        }
      case 3:
        wizardData.materials = collectMaterialData()
        break
      case 4:
        wizardData.operationalCosts = {
          electricity: document.getElementById("electricity-cost")?.value || "0",
          gas: document.getElementById("gas-cost")?.value || "0",
          labor: document.getElementById("labor-cost")?.value || "0",
        }
        break
      case 5:
        if (selectedProductionType === "new-product") {
          wizardData.schedule = {
            startDate: document.getElementById("new-start-date")?.value || "",
            startTime: document.getElementById("new-start-time")?.value || "08:00",
            priority: document.getElementById("new-priority")?.value || "normal",
            assignedTo: document.getElementById("new-assigned-to")?.value || "",
            notes: document.getElementById("new-production-notes")?.value || "",
          }
        } else {
          wizardData.schedule = {
            startDate: document.getElementById("existing-start-date")?.value || "",
            startTime: document.getElementById("existing-start-time")?.value || "08:00",
            priority: document.getElementById("existing-priority")?.value || "normal",
            assignedTo: document.getElementById("existing-assigned-to")?.value || "",
            notes: document.getElementById("existing-production-notes")?.value || "",
          }
        }
        break
    }

    console.log(`Step ${currentStep} data saved:`, wizardData)
  }

  function collectMaterialData() {
    const materials = []
    const materialRows = document.querySelectorAll(".recipe-item")

    console.log(`🔍 Collecting material data from ${materialRows.length} rows`)

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

    console.log(`✅ Collected ${materials.length} valid materials:`, materials)
    return materials
  }

  function populateReviewContent() {
    const reviewContent = document.getElementById("review-content")
    let html = ""

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
      html += `
        <p><strong>Name:</strong> ${wizardData.productInfo?.name || "N/A"}</p>
        <p><strong>Category:</strong> ${wizardData.productInfo?.category || "N/A"}</p>
        <p><strong>Tracking:</strong> ${selectedTrackingType === "batch" ? "Batch Tracking" : "Normal Tracking"}</p>
        <p class="mb-0"><strong>Quantity:</strong> ${wizardData.productInfo?.quantity || 0} units</p>
      `
    } else {
      const selectedProduct = allProducts.find((p) => p.product_id === wizardData.existingProduct?.productId)
      html += `
        <p><strong>Product:</strong> ${selectedProduct?.name || "N/A"}</p>
        <p><strong>Category:</strong> ${selectedProduct?.category || "N/A"}</p>
        <p class="mb-0"><strong>Batch Size:</strong> ${wizardData.existingProduct?.batchSize || 0} units</p>
      `
    }

    html += `
            </div>
          </div>
        </div>
      </div>
    `

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
                    <th>Cost</th>
                  </tr>
                </thead>
                <tbody>
      `

      wizardData.materials.forEach((material) => {
        const materialObj = allMaterials.find((m) => m.id == material.materialId)
        const cost = materialObj ? (materialObj.unit_cost * material.quantity).toFixed(2) : "0.00"
        html += `
          <tr>
            <td>${material.materialName}</td>
            <td>${material.quantity} ${materialObj?.measurement_type || ""}</td>
            <td>₱${cost}</td>
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
              <p><strong>Operational Cost:</strong> ₱${totalOperationalCost.toFixed(2)}</p>
              <p class="mb-0"><strong>Total Cost:</strong> ₱${totalProductionCost.toFixed(2)}</p>
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
              <p class="mb-0"><strong>Operator:</strong> ${wizardData.schedule?.assignedTo || "N/A"}</p>
            </div>
          </div>
        </div>
      </div>
    `

    reviewContent.innerHTML = html
  }

  function showValidationError() {
    let message = "Please complete all required fields before proceeding."

    switch (currentStep) {
      case 1:
        message = "Please select a production type."
        break
      case 2:
        if (selectedProductionType === "new-product") {
          message = "Please select a tracking type and fill in product information."
        } else {
          message = "Please select an existing product."
        }
        break
      case 3:
        message = "Please add at least one material to the recipe."
        break
      case 5:
        message = "Please set a start date for the production."
        break
    }

    showResponseMessage("warning", message)
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
    })

    quantityInput.addEventListener("input", () => {
      updateMaterialCosts()
      updateStockStatus(materialRow)
    })

    removeButton.addEventListener("click", () => {
      materialRow.remove()
      updateMaterialCosts()
    })
  }

  function updateMaterialDetails(materialRow) {
    const materialSelect = materialRow.querySelector(".material-select")
    const materialUnitDisplay = materialRow.querySelector(".material-unit")
    const materialCostDisplay = materialRow.querySelector(".material-cost")

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

        let unitCost = 0

        if (material.unit_cost) {
          unitCost = Number.parseFloat(material.unit_cost)
        } else if (material.cost && material.quantity) {
          const totalCost = Number.parseFloat(material.cost)
          const totalQuantity = Number.parseFloat(material.quantity)

          if (totalQuantity > 0) {
            if (measurementType === "pack" && material.pieces_per_container) {
              const totalPieces = totalQuantity * Number.parseFloat(material.pieces_per_container)
              unitCost = totalCost / totalPieces
            } else {
              unitCost = totalCost / totalQuantity
            }
          }
        }

        materialCostDisplay.textContent = `₱${unitCost.toFixed(2)}`
        updateStockStatus(materialRow)
      }
    } else {
      materialUnitDisplay.textContent = "-"
      materialCostDisplay.textContent = "0.00"
    }
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

          materialCostDisplay.textContent = `₱${costCalculation.unitCost.toFixed(2)}`
          if (totalCostInput) totalCostInput.value = costCalculation.totalCost.toFixed(2)

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

    // Always update batch quantity first, then update costs
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
    const materialCostPerUnit = batchQuantity > 0 ? totalMaterialCost / batchQuantity : 0

    // Update all material cost summary displays
    const totalMaterialCostEl = document.getElementById("total-material-cost")
    const materialCostPerUnitEl = document.getElementById("material-cost-per-unit")
    const finalMaterialCostEl = document.getElementById("final-material-cost")

    if (totalMaterialCostEl) totalMaterialCostEl.textContent = `₱${totalMaterialCost.toFixed(2)}`
    if (materialCostPerUnitEl) materialCostPerUnitEl.textContent = `₱${materialCostPerUnit.toFixed(2)}`
    if (finalMaterialCostEl) finalMaterialCostEl.textContent = `₱${totalMaterialCost.toFixed(2)}`

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
    totalProductionCost = totalMaterialCost + totalOperationalCost

    const costAnalysis = calculateCostPerUnit()

    document.getElementById("total-production-cost").textContent = `₱${totalProductionCost.toFixed(2)}`
    document.getElementById("final-cost-per-unit").textContent = `₱${costAnalysis.overallCostPerUnit.toFixed(2)}`
  }

  function updateProfitCalculations() {
    totalRevenue = calculateTotalRevenue()
    totalProfit = totalRevenue - totalProductionCost

    const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0
    const batchQuantity = totalBatchQuantity || 1

    document.getElementById("revenue-per-unit").textContent = `₱${(totalRevenue / batchQuantity).toFixed(2)}`
    document.getElementById("profit-per-unit").textContent = `₱${(totalProfit / batchQuantity).toFixed(2)}`
    document.getElementById("total-revenue").textContent = `₱${totalRevenue.toFixed(2)}`
    document.getElementById("total-profit").textContent = `₱${totalProfit.toFixed(2)}`
    document.getElementById("profit-margin").textContent = `${profitMargin.toFixed(1)}%`
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

    // Update costs when size option changes
    setTimeout(() => {
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

  function addSizeRow() {
    const type = sizeTypeSelect.value
    const row = document.createElement("div")
    row.classList.add("row", "mb-2")

    // Create either dropdown or input based on size type
    let sizeElement
    if (type === "sml") {
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
          const opt = document.createElement("option")
          opt.value = optText
          opt.textContent = optText
          sizeElement.appendChild(opt)
        })
      }
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
    }

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
        <button type="button" class="btn btn-danger btn-sm" onclick="this.closest('.row').remove(); updateMaterialCosts();">×</button>
      </div>
    `
    row.children[0].appendChild(sizeElement)
    sizesContainer.appendChild(row)

    // Add event listeners to update costs when size quantities or prices change
    const quantityInput = row.querySelector(".size-quantity-input")
    const priceInput = row.querySelector(".size-price-input")

    if (quantityInput) {
      quantityInput.addEventListener("input", () => {
        updateMaterialCosts()
      })
    }

    if (priceInput) {
      priceInput.addEventListener("input", () => {
        updateMaterialCosts()
      })
    }

    // Add listener for size changes (both dropdown and input)
    if (sizeElement) {
      sizeElement.addEventListener("change", () => {
        updateMaterialCosts()
      })
      sizeElement.addEventListener("input", () => {
        updateMaterialCosts()
      })
    }
  }

  // Improved existing size row function with proper event listeners
  function addExistingSizeRow() {
    const type = existingSizeTypeSelect.value
    const row = document.createElement("div")
    row.classList.add("row", "mb-2")

    // Create either dropdown or input based on size type
    let sizeElement
    if (type === "sml") {
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
          const opt = document.createElement("option")
          opt.value = optText
          opt.textContent = optText
          sizeElement.appendChild(opt)
        })
      }
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
    }

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
      })
      sizeElement.addEventListener("input", () => {
        updateExistingProductBatchQuantity()
        updateMaterialCosts()
      })
    }

    if (removeBtn) {
      removeBtn.addEventListener("click", () => {
        row.remove()
        updateExistingProductBatchQuantity()
        updateMaterialCosts()
      })
    }
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
    const productId = document.getElementById("existing-product-select")?.value
    if (!productId) return 0

    const product = allProducts.find((p) => p.product_id === productId)
    if (!product) return 0

    const sizeOption = document.getElementById("existing-size-option")?.value
    let revenue = 0

    if (sizeOption === "multiple") {
      // Get product sizes if available
      let productSizes = []
      try {
        if (product.sizes) {
          productSizes = JSON.parse(product.sizes)
        }
      } catch (e) {
        console.error("Error parsing product sizes:", e)
      }

      // Calculate revenue from multiple sizes (both dropdown and input)
      const sizeElements = document.querySelectorAll(".existing-size-select, .existing-size-input")
      const sizeQuantities = document.querySelectorAll(".existing-size-batch-quantity")

      sizeElements.forEach((sizeElement, index) => {
        const enteredSize = sizeElement.value.trim()
        const quantity = Number.parseInt(sizeQuantities[index]?.value) || 0

        if (enteredSize && quantity > 0) {
          // Try to find matching size in product sizes (case-insensitive)
          const sizeInfo = productSizes.find((s) => s.size.toLowerCase() === enteredSize.toLowerCase())

          // Use matched price or default product price
          const price = sizeInfo ? Number.parseFloat(sizeInfo.price) : Number.parseFloat(product.price || 0)
          revenue += quantity * price
        }
      })
    } else {
      // Single size revenue
      const quantity = Number.parseInt(document.getElementById("existing-batch-size")?.value) || 0
      const price = Number.parseFloat(product.price || 0)
      revenue = quantity * price
    }

    totalRevenue = revenue
    return revenue
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

  function updateStockStatus(materialRow) {
    const materialSelect = materialRow.querySelector(".material-select")
    const quantityInput = materialRow.querySelector(".quantity-input")
    const stockIndicator = materialRow.querySelector(".stock-status")

    if (materialSelect.value && quantityInput.value) {
      const material = allMaterials.find((m) => m.id == materialSelect.value)
      const requiredQuantity = Number.parseFloat(quantityInput.value) || 0

      if (material) {
        const availableQuantity = Number.parseFloat(material.quantity) || 0

        if (availableQuantity >= requiredQuantity) {
          stockIndicator.textContent = "Available"
          stockIndicator.className = "stock-status stock-available"
        } else if (availableQuantity > 0) {
          stockIndicator.textContent = "Insufficient"
          stockIndicator.className = "stock-status stock-warning"
        } else {
          stockIndicator.textContent = "Out of Stock"
          stockIndicator.className = "stock-status stock-insufficient"
        }
      }
    } else {
      stockIndicator.textContent = ""
      stockIndicator.className = "stock-status"
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
          <div class="col-md-6">
            <div class="card">
              <div class="card-header bg-light">
                <h6 class="mb-0"><i class="bi bi-clock-history me-2"></i>Additional Details</h6>
              </div>
              <div class="card-body">
                <p><strong>Status:</strong> <span class="badge ${getStatusBadgeClass(productData.status)}">${formatDate(productData.status)}</span></p>
                <p><strong>Created:</strong> ${formatDate(productData.created_at)}</p>
                <p><strong>Last Updated:</strong> ${formatDate(productData.updated_at)}</p>
      `

      if (productData.expiration_date) {
        detailsHtml += `<p><strong>Expiration:</strong> ${formatDate(productData.expiration_date)}</p>`
      }

      if (productData.latest_batch) {
        detailsHtml += `<p class="mb-0"><strong>Latest Batch:</strong> ${productData.latest_batch}</p>`
      }

      detailsHtml += `
              </div>
            </div>
          </div>
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

    if (!manufacturingDateInput || !manufacturingDateInput.value) {
      if (calculatedExpirationDate) calculatedExpirationDate.value = ""
      return
    }

    const manufacturingDate = new Date(manufacturingDateInput.value)
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

          const newStatus = data.new_status || targetStatus || "updated"
          showResponseMessage("success", `Production status updated to ${formatProductionStatus(newStatus)}`)

          // Close details modal if open
          if (productionDetailsModalInstance && productionDetailsModalInstance._isShown) {
            productionDetailsModalInstance.hide()
          }

          // If moved to quality-check, open quality check confirmation modal
          if (data.new_status === "quality-check" || newStatus === "quality-check") {
            setTimeout(() => {
              openQualityCheckModal(productionId)
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
    if (loadingModalInstance) loadingModalInstance.show()

    console.log("🚀 Starting production with wizard data:", wizardData)

    // Create FormData for proper PHP handling
    const formData = new FormData()

    // REQUIRED FIELDS - Always add these
    formData.append("production_type", selectedProductionType || "new-product")

    if (selectedProductionType === "new-product") {
      // Get product name from form
      const productName = document.getElementById("new-product-name")?.value || wizardData.productInfo?.name || ""
      const category = document.getElementById("new-product-category")?.value || wizardData.productInfo?.category || ""
      const batchSize = calculateTotalBatchQuantity() || wizardData.productInfo?.quantity || 0

      formData.append("product_name", productName)
      formData.append("category", category)
      formData.append("batch_size", batchSize.toString())
      formData.append("auto_create_product", "1") // Flag to create new product

      // Additional new product fields
      const productPrice = document.getElementById("new-product-price")?.value || wizardData.productInfo?.price || 0
      const productId = document.getElementById("new-product-id")?.value || ""

      formData.append("target_price", productPrice)
      formData.append("new_product_id", productId)

      console.log("New Product Data:", {
        productName,
        category,
        batchSize,
        productPrice,
        productId,
      })
    } else if (selectedProductionType === "existing-batch") {
      // Existing product data
      const selectedProductId =
        document.getElementById("existing-product-select")?.value || wizardData.existingProduct?.productId || ""
      const selectedProduct = allProducts.find((p) => p.product_id === selectedProductId)
      const batchSize = updateExistingProductBatchQuantity() || wizardData.existingProduct?.batchSize || 0

      if (!selectedProduct) {
        if (loadingModalInstance) loadingModalInstance.hide()
        showResponseMessage("error", "Please select a valid existing product")
        return
      }

      formData.append("product_id", selectedProduct.id.toString())
      formData.append("product_name", selectedProduct.name)
      formData.append("category", selectedProduct.category || "")
      formData.append("batch_size", batchSize.toString())

      console.log("Existing Product Data:", {
        productId: selectedProduct.id,
        productName: selectedProduct.name,
        category: selectedProduct.category,
        batchSize,
      })
    }

    // Schedule and priority data
    const startDate = wizardData.schedule?.startDate || new Date().toISOString().split("T")[0]
    const startTime = wizardData.schedule?.startTime || "08:00"
    const priority = wizardData.schedule?.priority || "normal"
    const assignedTo = wizardData.schedule?.assignedTo || ""
    const notes = wizardData.schedule?.notes || ""

    formData.append("start_date", startDate)
    formData.append("start_time", startTime)
    formData.append("priority", priority)
    formData.append("assigned_to", assignedTo)
    formData.append("notes", notes)
    formData.append("estimated_duration_hours", "8") // Default 8 hours

    // Calculate estimated completion
    const startDateTime = new Date(`${startDate}T${startTime}`)
    const estimatedCompletion = new Date(startDateTime.getTime() + 8 * 60 * 60 * 1000) // Add 8 hours
    formData.append("estimated_completion", estimatedCompletion.toISOString().slice(0, 19).replace("T", " "))

    // Cost data
    formData.append("total_material_cost", totalMaterialCost.toFixed(2))
    formData.append("total_operational_cost", totalOperationalCost.toFixed(2))
    formData.append("total_production_cost", totalProductionCost.toFixed(2))
    formData.append(
      "cost_per_unit",
      totalBatchQuantity > 0 ? (totalProductionCost / totalBatchQuantity).toFixed(2) : "0",
    )

    // Recipe/Materials data - FIXED: Use "recipe_data" to match your database structure
    if (selectedProductionType === "new-product") {
      // For new products, we MUST have recipe data
      const currentMaterials = collectMaterialData()

      if (!currentMaterials || currentMaterials.length === 0) {
        if (loadingModalInstance) loadingModalInstance.hide()
        showResponseMessage("error", "Recipe data is required for new products. Please add at least one material.")
        return
      }

      const recipeData = currentMaterials.map((material) => ({
        material_id: material.materialId,
        material_name: material.materialName,
        quantity: Number.parseFloat(material.quantity) || 0,
        unit: "pieces", // Default unit, will be updated based on material
        unit_cost: 0, // Will be calculated on server side
        total_cost: 0, // Will be calculated on server side
      }))

      // Use "recipe" to match what PHP expects
      formData.append("recipe", JSON.stringify(recipeData))
      console.log("📋 Recipe data for new product:", recipeData)
    } else if (selectedProductionType === "existing-batch") {
      // For existing products, recipe data is optional (may use existing recipe)
      const currentMaterials = collectMaterialData()

      if (currentMaterials && currentMaterials.length > 0) {
        const recipeData = currentMaterials.map((material) => ({
          material_id: material.materialId,
          material_name: material.materialName,
          quantity: Number.parseFloat(material.quantity) || 0,
          unit: "pieces",
          unit_cost: 0,
          total_cost: 0,
        }))

        // Use "recipe" to match what PHP expects
        formData.append("recipe", JSON.stringify(recipeData))
        console.log("📋 Recipe data for existing product batch:", recipeData)
      }
    }

    // Additional fields to match your database structure
    formData.append("auto_create_product", selectedProductionType === "new-product" ? "1" : "0")
    formData.append("target_expiration_days", "365") // Default 1 year
    formData.append("quality_status", "pending")
    formData.append("created_by", "Admin User") // You can get this from your session

    // Generate a proper production ID
    const now = new Date()
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, "")
    const randomNum = Math.floor(Math.random() * 10000)
    const productionId = `PROD${dateStr}-${randomNum}`
    formData.append("production_id", productionId)

    // Batch tracking data (if applicable)
    if (selectedTrackingType === "batch") {
      const batchCode = document.getElementById("batch-code")?.value || ""
      const manufacturingDate = document.getElementById("batch-manufacturing-date")?.value || startDate
      const expirationDate = document.getElementById("calculated-expiration-date")?.value || ""

      formData.append("batch_code", batchCode)
      formData.append("manufacturing_date", manufacturingDate)
      if (expirationDate) {
        formData.append("target_expiration_days", calculateDaysBetween(manufacturingDate, expirationDate).toString())
      }
    }

    // Size data (if multiple sizes)
    const sizeOption =
      selectedProductionType === "new-product"
        ? document.getElementById("size-option")?.value
        : document.getElementById("existing-size-option")?.value

    if (sizeOption === "multiple") {
      const sizeData = selectedProductionType === "new-product" ? collectSizeData() : collectExistingSizeData()

      if (sizeData.length > 0) {
        formData.append("size_data", JSON.stringify(sizeData))
      }
    }

    // Debug: Log all form data
    console.log("📋 Form data being sent:")
    for (const [key, value] of formData.entries()) {
      console.log(`${key}: ${value}`)
    }

    // Save to database
    fetch("start_production.php", {
      method: "POST",
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        if (loadingModalInstance) loadingModalInstance.hide()

        if (data.success) {
          console.log("✅ Production started successfully:", data)

          document.getElementById("successModalMessage").textContent =
            data.message || "Production started successfully!"
          if (successModalInstance) successModalInstance.show()

          setTimeout(() => {
            if (successModalInstance) successModalInstance.hide()
            if (produceProductModalInstance) produceProductModalInstance.hide()

            // Reload productions from database to show the new production
            loadOngoingProductions()
            updateStatusCards()

            showResponseMessage("success", `Production ${data.production_id || data.id} started successfully!`)
          }, 2000)
        } else {
          console.error("❌ Failed to start production:", data.message)
          document.getElementById("errorModalMessage").textContent = data.message || "Failed to start production"
          if (errorModalInstance) errorModalInstance.show()
        }
      })
      .catch((error) => {
        if (loadingModalInstance) loadingModalInstance.hide()
        console.error("❌ Error starting production:", error)

        document.getElementById("errorModalMessage").textContent =
          "Error connecting to database. Please check your connection and try again."
        if (errorModalInstance) errorModalInstance.show()
      })
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
          const updateStatusBtn = document.getElementById("update-production-status")
          const completeProductionBtn = document.getElementById("complete-production-btn")

          // Render detailed production information
          const detailsHtml = renderProductionDetailsHTML(production, data.materials, data.steps, data.material_usage)
          detailsContent.innerHTML = detailsHtml

          // Show/hide action buttons based on status
          if (isHistory || production.status === "completed" || production.status === "cancelled") {
            if (updateStatusBtn) updateStatusBtn.style.display = "none"
            if (completeProductionBtn) completeProductionBtn.style.display = "none"
          } else {
            if (updateStatusBtn) updateStatusBtn.style.display = "inline-block"
            if (production.status === "quality-check") {
              if (completeProductionBtn) completeProductionBtn.style.display = "inline-block"
              if (updateStatusBtn) updateStatusBtn.style.display = "none"
            } else {
              if (completeProductionBtn) completeProductionBtn.style.display = "none"
            }
          }

          if (productionDetailsModalInstance) productionDetailsModalInstance.show()
        } else {
          console.error("❌ Failed to load production details:", data.message)
          showResponseMessage("error", "Failed to load production details: " + data.message)
        }
      })
      .catch((error) => {
        console.error("❌ Error fetching production details:", error)
        showResponseMessage("error", "Error loading production details. Please try again.")
      })
  }

  // Helper function to render production details HTML
  function renderProductionDetailsHTML(production, materials, steps, materialUsage) {
    let html = `
      <div class="row mb-4">
        <div class="col-md-6">
          <div class="card">
            <div class="card-header bg-light">
              <h6 class="mb-0"><i class="bi bi-info-circle me-2"></i>Production Information</h6>
            </div>
            <div class="card-body">
              <p><strong>Production ID:</strong> ${production.production_id || production.id}</p>
              <p><strong>Product:</strong> ${production.product_name}</p>
              <p><strong>Category:</strong> ${production.category || "N/A"}</p>
              <p><strong>Batch Size:</strong> ${production.batch_size} units</p>
              <p><strong>Status:</strong> <span class="badge ${getProductionStatusBadgeClass(production.status)}">${formatProductionStatus(production.status)}</span></p>
              <p class="mb-0"><strong>Priority:</strong> <span class="badge ${getPriorityBadgeClass(production.priority)}">${production.priority || "Normal"}</span></p>
            </div>
          </div>
        </div>
        <div class="col-md-6">
          <div class="card">
            <div class="card-header bg-light">
              <h6 class="mb-0"><i class="bi bi-clock me-2"></i>Timeline</h6>
            </div>
            <div class="card-body">
              <p><strong>Start Date:</strong> ${formatDateTime(production.start_date)}</p>
              <p><strong>Estimated Completion:</strong> ${formatDateTime(production.estimated_completion)}</p>
    `

    if (production.actual_completion) {
      html += `<p><strong>Actual Completion:</strong> ${formatDateTime(production.actual_completion)}</p>`
    }

    if (production.assigned_to) {
      html += `<p><strong>Assigned To:</strong> ${production.assigned_to}</p>`
    }

    html += `
            </div>
          </div>
        </div>
      </div>
    `

    // Cost information
    if (production.total_material_cost || production.total_operational_cost) {
      html += `
        <div class="card mb-4">
          <div class="card-header bg-light">
            <h6 class="mb-0"><i class="bi bi-calculator me-2"></i>Cost Breakdown</h6>
          </div>
          <div class="card-body">
            <div class="row">
              <div class="col-md-3">
                <p><strong>Material Cost:</strong><br>₱${Number.parseFloat(production.total_material_cost || 0).toFixed(2)}</p>
              </div>
              <div class="col-md-3">
                <p><strong>Operational Cost:</strong><br>₱${Number.parseFloat(production.total_operational_cost || 0).toFixed(2)}</p>
              </div>
              <div class="col-md-3">
                <p><strong>Total Cost:</strong><br>₱${Number.parseFloat(production.total_production_cost || 0).toFixed(2)}</p>
              </div>
              <div class="col-md-3">
                <p><strong>Cost per Unit:</strong><br>₱${Number.parseFloat(production.cost_per_unit || 0).toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>
      `
    }

    // Materials used
    if (materials && materials.length > 0) {
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
                    <th>Unit Cost</th>
                    <th>Total Cost</th>
                  </tr>
                </thead>
                <tbody>
      `

      materials.forEach((material) => {
        html += `
          <tr>
            <td>${material.material_name}</td>
            <td>${material.quantity}</td>
            <td>${material.unit || "units"}</td>
            <td>₱${Number.parseFloat(material.unit_cost || 0).toFixed(2)}</td>
            <td>₱${Number.parseFloat(material.total_cost || 0).toFixed(2)}</td>
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

    // Production steps/progress
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
              ${isCompleted ? '<i class="bi bi-check-circle-fill"></i>' : isCurrent ? '<i class="bi bi-play-circle-fill"></i>' : '<i class="bi bi-circle"></i>'}
            </div>
            <div class="timeline-content">
              <h6>${step.step_name}</h6>
              <p class="mb-1">${step.description || ""}</p>
              ${step.completed_at ? `<small class="text-muted">Completed: ${formatDateTime(step.completed_at)}</small>` : ""}
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

    // Quality check information (if available)
    if (production.quality_score || production.quality_status) {
      html += `
        <div class="card mb-4">
          <div class="card-header bg-light">
            <h6 class="mb-0"><i class="bi bi-shield-check me-2"></i>Quality Check</h6>
          </div>
          <div class="card-body">
            <div class="row">
              <div class="col-md-3">
                <p><strong>Quality Score:</strong><br>${production.quality_score || "N/A"}%</p>
              </div>
              <div class="col-md-3">
                <p><strong>Quality Status:</strong><br><span class="badge ${getQualityStatusBadgeClass(production.quality_status)}">${formatQualityStatus(production.quality_status)}</span></p>
              </div>
              <div class="col-md-3">
                <p><strong>Quantity Passed:</strong><br>${production.quantity_passed_qc || "N/A"} units</p>
              </div>
              <div class="col-md-3">
                <p><strong>Quantity Failed:</strong><br>${production.quantity_failed_qc || "N/A"} units</p>
              </div>
            </div>
            ${production.quality_checked_by ? `<p><strong>Checked By:</strong> ${production.quality_checked_by}</p>` : ""}
            ${production.quality_checked_at ? `<p><strong>Checked At:</strong> ${formatDateTime(production.quality_checked_at)}</p>` : ""}
            ${production.quality_notes ? `<p><strong>Notes:</strong> ${production.quality_notes}</p>` : ""}
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
      return date.toLocaleDateString() + " " + date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
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

    // Populate modal with production details
    const completionProductionId = document.getElementById("completion-production-id")
    const completionProductName = document.getElementById("completion-product-name")
    const completionBatchSize = document.getElementById("completion-batch-size")

    if (completionProductionId) completionProductionId.textContent = production.production_id || production.id
    if (completionProductName) completionProductName.textContent = production.product_name
    if (completionBatchSize) completionBatchSize.textContent = production.batch_size

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
  }

  function submitProductionCompletion() {
    const formData = new FormData()
    formData.append("production_id", currentProductionId)
    formData.append("quantity_produced", document.getElementById("quantity_produced").value)
    formData.append("quantity_passed_qc", document.getElementById("quantity_passed_qc").value)
    formData.append("quantity_failed_qc", document.getElementById("quantity_failed_qc").value)
    formData.append("quality_score", document.getElementById("quality_score").value || "95")
    formData.append("target_price", document.getElementById("target_price").value || "0")
    formData.append("notes", document.getElementById("completion_notes").value || "")

    if (loadingModalInstance) loadingModalInstance.show()

    fetch("complete_production.php", {
      method: "POST",
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        if (loadingModalInstance) loadingModalInstance.hide()

        if (data.success) {
          if (completeProductionModalInstance) completeProductionModalInstance.hide()
          showResponseMessage("success", "Production completed successfully")

          // Reload both active and completed productions
          loadOngoingProductions()
          loadProductionHistory()
          updateStatusCards()
        } else {
          showResponseMessage("error", "Failed to complete production: " + data.message)
        }
      })
      .catch((error) => {
        if (loadingModalInstance) loadingModalInstance.hide()
        showResponseMessage("error", "Error completing production. Please try again.")
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

  function showResponseMessage(type, message) {
    const alertClass = type === "success" ? "alert-success" : type === "error" ? "alert-danger" : "alert-warning"

    const alertHtml = `
      <div class="alert ${alertClass} alert-dismissible fade show" role="alert">
        <i class="bi ${type === "success" ? "bi-check-circle" : type === "error" ? "bi-exclamation-triangle" : "bi-info-circle"} me-2"></i>
        ${message}
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
    }, 5000)
  }

  // Initialize the production management system when DOM is loaded
  initializeProduction()
})
