// Raw Materials Management JavaScript - Simplified Version

document.addEventListener("DOMContentLoaded", () => {
  // Initialize variables
  let allMaterials = []
  let currentView = "table" // Default view (table or card)
  let currentFilter = "all"
  let currentSort = "date-desc"
  let currentSearch = ""
  let currentPage = 1
  const itemsPerPage = 10

  // Declare bootstrap and flatpickr variables
  const bootstrap = window.bootstrap
  const flatpickr = window.flatpickr

  // DOM Elements
  const addMaterialBtn = document.getElementById("add-supply-btn")
  const addMaterialForm = document.getElementById("add-material-form")
  const materialsTableBody = document.getElementById("supplies-table-body")
  const materialsCardContainer = document.getElementById("materials-card-container")
  const searchInput = document.getElementById("supplies-search")
  const measurementTypeSelect = document.getElementById("measurement_type")
  const unitMeasurementDiv = document.getElementById("unit_measurement_div")
  const alternativeSupplierDiv = document.getElementById("alternative_supplier_div")
  const isAlternativeSupplierSelect = document.getElementById("is_alternative_supplier")
  const paginationContainer = document.getElementById("pagination-container")
  const piecesPerContainerDiv = document.getElementById("pieces_per_container_div")
  const piecesPerContainerInput = document.getElementById("pieces_per_container")

  // Initialize date pickers
  initializeDatePickers()

  // Generate and set the next material ID when opening the modal
  if (addMaterialBtn) {
    addMaterialBtn.addEventListener("click", () => {
      // Reset form
      if (addMaterialForm) addMaterialForm.reset()

      // Generate and set the next material ID
      const nextMaterialId = generateNextMaterialId()
      document.getElementById("material_id").value = nextMaterialId
      console.log("Generated material ID:", nextMaterialId)

      // Reset dependent fields
      toggleUnitMeasurementOptions("none")
      toggleAlternativeSupplierField("no")
      resetPiecesPerContainer()

      // Show the add material modal
      const addMaterialModal = new bootstrap.Modal(document.getElementById("addMaterialModal"))
      addMaterialModal.show()
    })
  }

  // Handle measurement type change
  if (measurementTypeSelect) {
    measurementTypeSelect.addEventListener("change", function () {
      const selectedType = this.value
      toggleUnitMeasurementOptions(selectedType)
      handlePiecesPerContainer(selectedType)
      updateQuantityUnit(selectedType)
    })
  }

  // Handle alternative supplier selection
  if (isAlternativeSupplierSelect) {
    isAlternativeSupplierSelect.addEventListener("change", function () {
      toggleAlternativeSupplierField(this.value)
    })
  }

  // Handle supplier selection to update alternative supplier options
  const supplierSelect = document.getElementById("supplier")
  if (supplierSelect) {
    supplierSelect.addEventListener("change", function () {
      updateAlternativeSupplierOptions(this.value)
    })
  }

  // Handle supplier selection in edit form
  const editSupplierSelect = document.getElementById("edit_supplier")
  if (editSupplierSelect) {
    editSupplierSelect.addEventListener("change", function () {
      updateEditAlternativeSupplierOptions(this.value)
    })
  }

  const editMaterialForm = document.getElementById("edit-material-form")
  if (editMaterialForm) {
    editMaterialForm.addEventListener("submit", (e) => {
      e.preventDefault()
      updateMaterial()
    })
  }

  // Handle form submission
  if (addMaterialForm) {
    addMaterialForm.addEventListener("submit", (e) => {
      e.preventDefault()
      saveMaterial()
    })
  }

  // View toggle: using dropdown
  const viewToggleDropdown = document.getElementById("view-toggle-dropdown")
  if (viewToggleDropdown) {
    viewToggleDropdown.addEventListener("change", function () {
      const selectedView = this.value
      currentView = selectedView
      if (selectedView === "table") {
        document.getElementById("table-view-container").classList.remove("d-none")
        document.getElementById("card-view-container").classList.add("d-none")
        displayMaterialsTable(allMaterials)
      } else {
        document.getElementById("table-view-container").classList.add("d-none")
        document.getElementById("card-view-container").classList.remove("d-none")
        displayMaterialsCards(allMaterials)
      }
    })
  }

  // Handle search
  if (searchInput) {
    searchInput.addEventListener("input", function () {
      currentSearch = this.value.toLowerCase()
      currentPage = 1
      fetchAndDisplayMaterials()
    })
  }

  // Handle filter dropdown
  const filterDropdown = document.getElementById("filter-dropdown")
  if (filterDropdown) {
    filterDropdown.value = currentFilter
    filterDropdown.addEventListener("change", function () {
      currentFilter = this.value
      currentPage = 1
      fetchAndDisplayMaterials()
    })
  }

  // Handle sort dropdown
  const sortDropdown = document.getElementById("sort-dropdown")
  if (sortDropdown) {
    sortDropdown.value = currentSort
    sortDropdown.addEventListener("change", function () {
      currentSort = this.value
      currentPage = 1
      fetchAndDisplayMaterials()
    })
  }

  // Initialize by fetching materials
  fetchAndDisplayMaterials()

  // Fetch suppliers for dropdown
  fetchSuppliers()

  // Add batch form submission handler
  const addBatchForm = document.getElementById("add-batch-form")
  if (addBatchForm) {
    addBatchForm.addEventListener("submit", (e) => {
      e.preventDefault()
      addBatch()
    })
  }

  // Edit batch form submission handler
  const editBatchForm = document.getElementById("edit-batch-form")
  if (editBatchForm) {
    editBatchForm.addEventListener("submit", (e) => {
      e.preventDefault()
      updateBatch()
    })
  }

  // Delete batch confirmation handler
  const confirmDeleteBatchBtn = document.getElementById("confirmDeleteBatchBtn")
  if (confirmDeleteBatchBtn) {
    confirmDeleteBatchBtn.addEventListener("click", () => {
      const batchId = document.getElementById("delete_batch_id").value
      deleteBatch(batchId)
    })
  }

  // --- Material Delete Modal Logic ---
  function openDeleteMaterialModal(materialId) {
    document.getElementById("delete_material_id").value = materialId
    const modal = new bootstrap.Modal(document.getElementById("deleteMaterialModal"))
    modal.show()
  }

  const confirmDeleteMaterialBtn = document.getElementById("confirmDeleteMaterialBtn")
  if (confirmDeleteMaterialBtn) {
    confirmDeleteMaterialBtn.addEventListener("click", () => {
      const materialId = document.getElementById("delete_material_id").value
      if (materialId) {
        deleteMaterial(materialId)
        // Hide the modal after confirming
        const modalEl = document.getElementById("deleteMaterialModal")
        const modal = bootstrap.Modal.getInstance(modalEl)
        if (modal) modal.hide()
      }
    })
  }

  // Functions

  // Function to initialize date pickers
  function initializeDatePickers() {
    if (typeof flatpickr !== "undefined") {
      flatpickr("#date_received", {
        dateFormat: "Y-m-d",
        maxDate: "today",
        defaultDate: "today",
      })

      flatpickr("#expiry_date", {
        dateFormat: "Y-m-d",
        minDate: "today",
        allowInput: true,
      })
    } else {
      console.error("flatpickr is not defined. Make sure it's included in your project.")
    }
  }

  // Function to toggle unit measurement options based on measurement type
  function toggleUnitMeasurementOptions(measurementType) {
    if (unitMeasurementDiv) {
      if (measurementType === "Unit" || measurementType === "Bulk") {
        unitMeasurementDiv.style.display = "block"
      } else {
        unitMeasurementDiv.style.display = "none"
      }
    }
  }

  // Function to handle pieces per container visibility
  function handlePiecesPerContainer(measurementType) {
    if (piecesPerContainerDiv && piecesPerContainerInput) {
      if (["Dozen", "Box", "Pack"].includes(measurementType)) {
        piecesPerContainerDiv.style.display = "block"
        if (measurementType === "Dozen") {
          piecesPerContainerInput.value = 12
          piecesPerContainerInput.readOnly = true
        } else {
          piecesPerContainerInput.value = ""
          piecesPerContainerInput.readOnly = false
        }
      } else {
        piecesPerContainerDiv.style.display = "none"
        piecesPerContainerInput.value = ""
        piecesPerContainerInput.readOnly = false
      }
    }
  }

  // Function to reset pieces per container
  function resetPiecesPerContainer() {
    if (piecesPerContainerDiv && piecesPerContainerInput) {
      piecesPerContainerDiv.style.display = "none"
      piecesPerContainerInput.value = ""
      piecesPerContainerInput.readOnly = false
    }
  }

  // Function to update quantity unit display
  function updateQuantityUnit(measurementType) {
    const quantityUnit = document.getElementById("quantity_unit")
    if (quantityUnit) {
      switch (measurementType) {
        case "Unit":
          quantityUnit.textContent = "units"
          break
        case "Pieces":
          quantityUnit.textContent = "pieces"
          break
        case "Dozen":
          quantityUnit.textContent = "dozen"
          break
        case "Pack":
          quantityUnit.textContent = "packs"
          break
        case "Box":
          quantityUnit.textContent = "boxes"
          break
        case "Bulk":
          quantityUnit.textContent = "bulk units"
          break
        default:
          quantityUnit.textContent = "units"
      }
    }
  }

  // Function to toggle alternative supplier field
  function toggleAlternativeSupplierField(isAlternative) {
    if (alternativeSupplierDiv) {
      if (isAlternative === "yes") {
        alternativeSupplierDiv.classList.remove("d-none")
      } else {
        alternativeSupplierDiv.classList.add("d-none")
      }
    }
  }

  // Function to generate the next material ID
  function generateNextMaterialId() {
    if (!allMaterials || allMaterials.length === 0) {
      console.log("No existing materials, returning default ID: M001")
      return "M001" // Default if no materials exist
    }

    // Find the highest material ID number
    let highestNum = 0

    allMaterials.forEach((material) => {
      if (material.material_id && material.material_id.startsWith("M")) {
        const numPart = Number.parseInt(material.material_id.substring(1), 10)
        if (!isNaN(numPart) && numPart > highestNum) {
          highestNum = numPart
        }
      }
    })

    // Generate the next ID by incrementing the highest number
    const nextNum = highestNum + 1
    const nextId = `M${nextNum.toString().padStart(3, "0")}`
    console.log("Generated next material ID:", nextId)
    return nextId
  }

  // Function to calculate average unit cost from previous batches
  function calculateAverageUnitCost(batches) {
    if (!batches || batches.length === 0) {
      return 0
    }

    // Calculate average unit cost from all previous batches
    const totalUnitCost = batches.reduce((sum, batch) => {
      const batchQuantity = Number.parseFloat(batch.quantity || 0)
      const batchCost = Number.parseFloat(batch.cost || 0)
      const unitCost = batchQuantity > 0 ? batchCost / batchQuantity : 0
      return sum + unitCost
    }, 0)

    const averageUnitCost = totalUnitCost / batches.length

    // Round to 4 decimal places for precision
    return Math.round(averageUnitCost * 10000) / 10000
  }

  // Function to setup quantity-based cost suggestion
  function setupQuantityBasedCostSuggestion(batches, quantityInputId, costInputId) {
    const quantityInput = document.getElementById(quantityInputId)
    const costInput = document.getElementById(costInputId)

    if (!quantityInput || !costInput) return

    // Calculate average unit cost from previous batches
    const averageUnitCost = calculateAverageUnitCost(batches)

    if (averageUnitCost <= 0) {
      console.log("No valid unit cost data from previous batches")
      return
    }

    // Remove any existing event listeners
    const newQuantityInput = quantityInput.cloneNode(true)
    quantityInput.parentNode.replaceChild(newQuantityInput, quantityInput)

    // Add event listener for quantity input
    newQuantityInput.addEventListener("input", function () {
      const quantity = Number.parseFloat(this.value || 0)

      if (quantity > 0) {
        // Calculate suggested total cost
        const suggestedTotalCost = quantity * averageUnitCost
        const roundedCost = Math.round(suggestedTotalCost * 100) / 100

        // Set the suggested cost
        costInput.value = roundedCost.toFixed(2)

        // Add visual indicators
        costInput.style.backgroundColor = "#e8f5e8"
        costInput.setAttribute(
          "title",
          `Suggested cost: ${quantity} × ₱${averageUnitCost.toFixed(4)} (avg unit cost from ${batches.length} previous batch(es)) = ₱${roundedCost.toFixed(2)}`,
        )

        // Show info message about suggested cost
        let costInfo = document.getElementById("cost-suggestion-info")
        if (!costInfo) {
          costInfo = document.createElement("div")
          costInfo.className = "form-text text-success"
          costInfo.id = "cost-suggestion-info"
          costInput.parentNode.parentNode.appendChild(costInfo)
        }

        costInfo.innerHTML = `<i class="bi bi-calculator me-1"></i>Suggested: ${quantity} × ₱${averageUnitCost.toFixed(4)} (avg unit cost) = ₱${roundedCost.toFixed(2)}`

        // Remove styling when user starts typing in cost field
        const costInputHandler = () => {
          costInput.style.backgroundColor = ""
          costInput.removeAttribute("title")
          const info = document.getElementById("cost-suggestion-info")
          if (info) {
            info.remove()
          }
          costInput.removeEventListener("input", costInputHandler)
        }

        costInput.addEventListener("input", costInputHandler, { once: true })
      } else {
        // Clear cost suggestion if quantity is 0 or empty
        costInput.value = ""
        costInput.style.backgroundColor = ""
        costInput.removeAttribute("title")
        const info = document.getElementById("cost-suggestion-info")
        if (info) {
          info.remove()
        }
      }
    })
  }

  // Function to save a new material
  function saveMaterial() {
    showLoadingModal()
    // Get form data
    const formData = new FormData(addMaterialForm)

    // Debug: Log all form data
    console.log("Form data being submitted:")
    for (const pair of formData.entries()) {
      console.log(pair[0] + ": " + pair[1])
    }

    // Ensure material ID is set
    if (!formData.get("material_id") || formData.get("material_id") === "") {
      const nextMaterialId = generateNextMaterialId()
      formData.set("material_id", nextMaterialId)
      console.log("Material ID was missing, set to:", nextMaterialId)
    }

    // Add file data
    const receiptFile = document.getElementById("receipt_upload").files[0]
    if (receiptFile) {
      formData.set("receipt_upload", receiptFile)
    }

    // Send data to server
    fetch("save_material.php", {
      method: "POST",
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          setTimeout(() => {
            hideLoadingModal()
            showSuccessModal("Raw material added successfully!")
            setTimeout(() => {
              const modalEl = document.getElementById("successModal")
              const modal = bootstrap.Modal.getInstance(modalEl)
              if (modal) modal.hide()
              // Close the add material modal
              const addMaterialModalElement = document.getElementById("addMaterialModal")
              if (addMaterialModalElement) {
                const addMaterialModal = bootstrap.Modal.getInstance(addMaterialModalElement)
                if (addMaterialModal) addMaterialModal.hide()
              }
              fetchAndDisplayMaterials()
            }, 2000)
          }, 2000)
        } else {
          hideLoadingModal()
          showErrorModal("Error: " + data.message)
        }
      })
      .catch((error) => {
        hideLoadingModal()
        console.error("Error:", error)
        showErrorModal("An error occurred while saving the material.")
      })
  }

  // Function to fetch and display materials
  function fetchAndDisplayMaterials() {
    // Show loading indicator
    if (materialsTableBody) {
      materialsTableBody.innerHTML = '<tr><td colspan="7" class="text-center">Loading materials...</td></tr>'
    }

    // Fetch materials from server
    fetch(
      `get_materials.php?page=${currentPage}&filter=${currentFilter}&sort=${currentSort}&search=${encodeURIComponent(currentSearch)}`,
    )
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          allMaterials = data.materials
          if (currentView === "card") {
            displayMaterialsCards(allMaterials)
            document.getElementById("table-view-container").classList.add("d-none")
            document.getElementById("card-view-container").classList.remove("d-none")
          } else {
            displayMaterialsTable(allMaterials)
            document.getElementById("table-view-container").classList.remove("d-none")
            document.getElementById("card-view-container").classList.add("d-none")
          }
          // Update pagination
          updatePagination(data.total_pages)
        } else {
          showResponseMessage("danger", "Error: " + data.message)
        }
      })
      .catch((error) => {
        console.error("Error:", error)
        showResponseMessage("danger", "An error occurred while fetching materials.")
      })
  }

  // Function to get status for filtering
  function getStatusForFilter(quantity) {
    if (quantity === null || quantity === undefined) return "out-of-stock"
    if (quantity <= 0) return "out-of-stock"
    if (quantity <= 10) return "low-stock" // You can adjust this threshold
    return "in-stock"
  }

  // Function to display materials in table view (with filter applied on frontend)
  function displayMaterialsTable(materials) {
    if (!materialsTableBody) return

    // Apply filter if not handled by backend
    let filteredMaterials = materials
    if (currentFilter !== "all") {
      filteredMaterials = materials.filter(
        (material) => getStatusForFilter(Number(material.quantity)) === currentFilter,
      )
    }

    if (filteredMaterials.length === 0) {
      materialsTableBody.innerHTML = '<tr><td colspan="7" class="text-center">No materials found</td></tr>'
      return
    }

    let html = ""

    filteredMaterials.forEach((material) => {
      const statusClass = getStatusClass(material.quantity)
      html += `
        <tr data-id="${material.id}">
          <td><span class="material-id">${material.material_id}</span></td>
          <td>
            <div class="d-flex align-items-center">
              <span class="material-name">${material.name}</span>
            </div>
          </td>
          <td class="material-category">${material.category}</td>
          <td><span class="stock">${material.quantity} ${material.measurement_type === "Unit" ? material.unit_measurement : material.measurement_type}</span></td>
          <td><span class="price">₱${Number.parseFloat(material.cost).toFixed(2)}</span></td>
          <td>
            <span class="status-badge ${statusClass}">${getStatusText(material.quantity)}</span>
          </td>
          <td>
            <div class="action-buttons">
              <button class="action-btn action-btn-view view-material-btn" title="View Details" data-id="${material.id}">
                <i class="bi bi-eye"></i>
              </button>
              <button class="action-btn action-btn-edit edit-material-btn" title="Edit" data-id="${material.id}">
                <i class="bi bi-pencil"></i>
              </button>
              <button class="action-btn action-btn-delete delete-material-btn" title="Delete" data-id="${material.id}">
                <i class="bi bi-trash"></i>
              </button>
            </div>
          </td>
        </tr>
      `
    })

    materialsTableBody.innerHTML = html

    // Add event listeners to action buttons
    addActionButtonListeners()
  }

  // Function to display materials in card view (with filter applied on frontend)
  function displayMaterialsCards(materials) {
    if (!materialsCardContainer) return

    // Apply filter if not handled by backend
    let filteredMaterials = materials
    if (currentFilter !== "all") {
      filteredMaterials = materials.filter(
        (material) => getStatusForFilter(Number(material.quantity)) === currentFilter,
      )
    }

    if (filteredMaterials.length === 0) {
      materialsCardContainer.innerHTML = '<div class="col-12 text-center">No materials found</div>'
      return
    }

    let html = ""

    filteredMaterials.forEach((material) => {
      const statusClass = getStatusClass(material.quantity)
      html += `
        <div class="col-md-6 col-lg-4 mb-4" data-id="${material.id}">
          <div class="card h-100">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-start mb-3">
                <h5 class="card-title mb-0">${material.name}</h5>
                <span class="status-badge ${statusClass}">${getStatusText(material.quantity)}</span>
              </div>
              <h6 class="card-subtitle mb-2 text-muted">${material.material_id}</h6>
              <div class="card-text">
                <p><strong>Category:</strong> ${material.category}</p>
                <p><strong>Stock:</strong> ${material.quantity} ${material.measurement_type === "Unit" ? material.unit_measurement : material.measurement_type}</p>
                <p><strong>Cost:</strong> ₱${Number.parseFloat(material.cost).toFixed(2)}</p>
                <p><strong>Supplier:</strong> ${material.supplier}</p>
                <p><strong>Date Received:</strong> ${material.date_received}</p>
                ${material.expiry_date ? `<p><strong>Expiry Date:</strong> ${material.expiry_date}</p>` : ""}
              </div>
            </div>
            <div class="card-footer bg-transparent">
              <div class="d-flex justify-content-between">
                <button class="btn btn-sm btn-outline-primary view-material-btn" data-id="${material.id}">
                  <i class="bi bi-eye me-1"></i> View
                </button>
                <button class="btn btn-sm btn-outline-secondary edit-material-btn" data-id="${material.id}">
                  <i class="bi bi-pencil me-1"></i> Edit
                </button>
                <button class="btn btn-sm btn-outline-danger delete-material-btn" data-id="${material.id}">
                  <i class="bi bi-trash me-1"></i> Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      `
    })

    materialsCardContainer.innerHTML = html

    // Add event listeners to action buttons
    addActionButtonListeners()
  }

  // Function to add event listeners to action buttons
  function addActionButtonListeners() {
    // View material buttons
    document.querySelectorAll(".view-material-btn").forEach((button) => {
      button.addEventListener("click", function () {
        const materialId = this.dataset.id
        viewMaterial(materialId)
      })
    })

    // Edit material buttons
    document.querySelectorAll(".edit-material-btn").forEach((button) => {
      button.addEventListener("click", function () {
        const materialId = this.dataset.id
        editMaterial(materialId)
      })
    })

    // Delete material buttons
    document.querySelectorAll(".delete-material-btn").forEach((button) => {
      button.addEventListener("click", function () {
        const materialId = this.getAttribute("data-id")
        openDeleteMaterialModal(materialId)
      })
    })
  }

  // Function to view material details
  function viewMaterial(materialId) {
    // Fetch material details
    fetch(`get_material.php?id=${materialId}`)
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          const material = data.material

          // Populate the view modal with material details
          document.getElementById("view_material_id").textContent = material.material_id
          document.getElementById("view_material_name").textContent = material.name
          document.getElementById("view_category").textContent = material.category

          // Enhanced quantity display with conversion info
          let quantityDisplay = `${material.quantity} ${material.measurement_type === "Unit" || material.measurement_type === "Bulk" ? material.unit_measurement : material.measurement_type}`

          // Add pieces per container info if applicable
          if (material.pieces_per_container && ["Dozen", "Box", "Pack"].includes(material.measurement_type)) {
            const totalPieces = material.quantity * material.pieces_per_container
            quantityDisplay += ` (${totalPieces} pieces total)`
          }

          // Add base unit conversion if different from display unit
          if (material.base_unit && material.base_unit !== material.unit_measurement) {
            quantityDisplay += ` | Base: ${material.base_unit}`
          }

          document.getElementById("view_quantity").innerHTML = quantityDisplay
          document.getElementById("view_cost").textContent = `₱${Number.parseFloat(material.cost).toFixed(2)}`

          // Calculate and display unit cost
          const unitCost = material.quantity > 0 ? (material.cost / material.quantity).toFixed(4) : "0.0000"
          document.getElementById("view_unit_cost").textContent =
            `₱${unitCost} per ${material.measurement_type === "Unit" || material.measurement_type === "Bulk" ? material.unit_measurement : material.measurement_type.toLowerCase()}`

          document.getElementById("view_supplier").textContent = material.supplier
          document.getElementById("view_date_received").textContent = material.date_received
          document.getElementById("view_expiry_date").textContent = material.expiry_date || "No Record"

          // Enhanced measurement details
          document.getElementById("view_measurement_type").textContent = material.measurement_type
          document.getElementById("view_unit_measurement").textContent = material.unit_measurement || "N/A"
          document.getElementById("view_pieces_per_container").textContent = material.pieces_per_container || "N/A"
          document.getElementById("view_base_unit").textContent = material.base_unit || "N/A"

          // Container status information
          if (material.container_status) {
            document.getElementById("view_container_status").textContent = material.container_status
            document.getElementById("view_opened_containers").textContent = material.opened_containers || "0"
            document.getElementById("view_remaining_in_container").textContent =
              material.remaining_in_container || "N/A"
          }

          // Handle receipt file
          if (material.receipt_file) {
            document.getElementById("view_receipt").innerHTML =
              `<a href="${material.receipt_file}" target="_blank">View Receipt</a>`
          } else {
            document.getElementById("view_receipt").textContent = "No receipt uploaded"
          }

          // Display notes
          document.getElementById("view_notes").textContent = material.notes || "No notes available"

          // Display batch history with enhanced information
          const batchHistoryBody = document.getElementById("batch_history_body")
          if (batchHistoryBody) {
            if (material.batches && material.batches.length > 0) {
              let batchHtml = ""
              material.batches.forEach((batch) => {
                const batchUnitCost = batch.quantity > 0 ? (batch.cost / batch.quantity).toFixed(4) : "0.0000"
                batchHtml += `
                <tr>
                  <td>${batch.batch_number}</td>
                  <td>${batch.quantity} ${material.measurement_type === "Unit" || material.measurement_type === "Bulk" ? material.unit_measurement : material.measurement_type}</td>
                  <td>₱${Number.parseFloat(batch.cost).toFixed(2)}</td>
                  <td>₱${batchUnitCost}</td>
                  <td>${batch.date_received}</td>
                  <td>${batch.expiry_date || "No Record"}</td>
                  <td>
                    <div class="action-buttons">
                      <button class="action-btn action-btn-view view-batch-btn" title="View Batch" data-batch-id="${batch.id}" data-material-id="${material.id}">
                        <i class="bi bi-eye"></i>
                      </button>
                      <button class="action-btn action-btn-edit edit-batch-btn" title="Edit Batch" data-batch-id="${batch.id}" data-material-id="${material.id}">
                        <i class="bi bi-pencil"></i>
                      </button>
                      <button class="action-btn action-btn-delete delete-batch-btn" title="Delete Batch" data-batch-id="${batch.id}" data-material-id="${material.id}">
                        <i class="bi bi-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              `
              })
              batchHistoryBody.innerHTML = batchHtml

              // Add event listeners for batch action buttons
              addBatchActionButtonListeners()
            } else {
              batchHistoryBody.innerHTML = '<tr><td colspan="7" class="text-center">No batch available</td></tr>'
            }
          }

          // Set up add batch button with quantity-based cost suggestion
          const addBatchBtn = document.getElementById("add_batch_btn")
          if (addBatchBtn) {
            addBatchBtn.onclick = () => {
              // Hide view modal
              const viewMaterialModalElement = document.getElementById("viewMaterialModal")
              if (viewMaterialModalElement) {
                const viewMaterialModal = bootstrap.Modal.getInstance(viewMaterialModalElement)
                if (viewMaterialModal) {
                  viewMaterialModal.hide()
                }
              }

              // Reset form first
              const addBatchForm = document.getElementById("add-batch-form")
              if (addBatchForm) {
                addBatchForm.reset()
              }

              // Set up batch modal
              document.getElementById("batch_material_id").value = material.id
              document.getElementById("batch_unit").textContent =
                material.measurement_type === "Unit" || material.measurement_type === "Bulk"
                  ? material.unit_measurement
                  : material.measurement_type

              // Clear any existing info messages
              const existingInfos = document.querySelectorAll("#cost-suggestion-info, #quantity-suggestion-info")
              existingInfos.forEach((info) => info.remove())

              // Setup quantity-based cost suggestion
              setupQuantityBasedCostSuggestion(material.batches, "batch_quantity", "batch_cost")

              // Initialize date pickers for batch modal
              if (typeof flatpickr !== "undefined") {
                flatpickr("#batch_date_received", {
                  dateFormat: "Y-m-d",
                  maxDate: "today",
                  defaultDate: "today",
                })

                flatpickr("#batch_expiry_date", {
                  dateFormat: "Y-m-d",
                  minDate: "today",
                  allowInput: true,
                })
              } else {
                console.error("flatpickr is not defined. Make sure it's included in your project.")
              }

              // Show batch modal
              const addBatchModalElement = document.getElementById("addBatchModal")
              if (addBatchModalElement) {
                const addBatchModal = new bootstrap.Modal(addBatchModalElement)
                addBatchModal.show()
              }
            }
          }

          // Show the view modal
          const viewMaterialModalElement = document.getElementById("viewMaterialModal")
          if (viewMaterialModalElement) {
            const viewMaterialModal = new bootstrap.Modal(viewMaterialModalElement)
            viewMaterialModal.show()
          }
        } else {
          showResponseMessage("danger", "Error: " + data.message)
        }
      })
      .catch((error) => {
        console.error("Error:", error)
        showResponseMessage("danger", "An error occurred while fetching material details.")
      })
  }

  // Function to add event listeners for batch action buttons
  function addBatchActionButtonListeners() {
    // View batch buttons
    document.querySelectorAll(".view-batch-btn").forEach((btn) => {
      btn.addEventListener("click", function () {
        const batchId = this.getAttribute("data-batch-id")
        const materialId = this.getAttribute("data-material-id")
        viewBatch(batchId, materialId)
      })
    })

    // Edit batch buttons
    document.querySelectorAll(".edit-batch-btn").forEach((btn) => {
      btn.addEventListener("click", function () {
        const batchId = this.getAttribute("data-batch-id")
        const materialId = this.getAttribute("data-material-id")
        editBatch(batchId, materialId)
      })
    })

    // Delete batch buttons
    document.querySelectorAll(".delete-batch-btn").forEach((btn) => {
      btn.addEventListener("click", function () {
        const batchId = this.getAttribute("data-batch-id")
        const materialId = this.getAttribute("data-material-id")
        openDeleteBatchModal(batchId, materialId)
      })
    })
  }

  // Function to view batch details
  function viewBatch(batchId, materialId) {
    fetch(`get_material_batch.php?id=${batchId}&material_id=${materialId}`)
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          const batch = data.batch
          const material = data.material

          // Populate view batch modal
          const viewBatchDetails = document.getElementById("view_batch_details")
          viewBatchDetails.innerHTML = `
            <div class="row">
              <div class="col-md-6">
                <h6 class="text-muted mb-3">Batch Information</h6>
                <p><strong>Batch Number:</strong> ${batch.batch_number}</p>
                <p><strong>Material:</strong> ${material.name} (${material.material_id})</p>
                <p><strong>Quantity:</strong> ${batch.quantity} ${material.measurement_type === "Unit" ? material.unit_measurement : material.measurement_type}</p>
                <p><strong>Cost:</strong> ₱${Number.parseFloat(batch.cost).toFixed(2)}</p>
                <p><strong>Unit Cost:</strong> ₱${(Number.parseFloat(batch.cost) / Number.parseFloat(batch.quantity)).toFixed(4)}</p>
              </div>
              <div class="col-md-6">
                <h6 class="text-muted mb-3">Dates & Documentation</h6>
                <p><strong>Date Received:</strong> ${batch.date_received}</p>
                <p><strong>Expiry Date:</strong> ${batch.expiry_date || "No Record"}</p>
                <p><strong>Receipt/Certificate:</strong> ${batch.receipt_file ? `<a href="${batch.receipt_file}" target="_blank">View Receipt</a>` : "No receipt uploaded"}</p>
              </div>
            </div>
            <div class="mt-4">
              <h6 class="text-muted mb-3">Notes</h6>
              <p>${batch.notes || "No notes available"}</p>
            </div>
          `

          // Show view batch modal
          const viewBatchModal = new bootstrap.Modal(document.getElementById("viewBatchModal"))
          viewBatchModal.show()
        } else {
          showResponseMessage("danger", "Error: " + data.message)
        }
      })
      .catch((error) => {
        console.error("Error:", error)
        showResponseMessage("danger", "An error occurred while fetching batch details.")
      })
  }

  // Function to open and populate the Edit Batch Modal
  function editBatch(batchId, materialId) {
    fetch(`get_material_batch.php?id=${batchId}&material_id=${materialId}`)
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          const batch = data.batch
          const material = data.material

          // Set hidden batch ID
          document.getElementById("edit_batch_id").value = batchId

          // Build dynamic fields
          const editBatchFields = document.getElementById("edit_batch_fields")
          editBatchFields.innerHTML = `
          <h6 class="text-muted">Editing Batch #${batch.batch_number} for ${material.name}</h6>

          <div class="mb-3">
            <label for="edit_batch_quantity" class="form-label">Quantity</label>
            <div class="input-group">
              <input type="number" step="0.01" class="form-control" id="edit_batch_quantity" name="quantity" value="${batch.quantity}" required min="0">
              <span class="input-group-text">${material.measurement_type === "Unit" ? material.unit_measurement : material.measurement_type}</span>
            </div>
          </div>

          <div class="mb-3">
            <label for="edit_batch_cost" class="form-label">Cost (Price of material)</label>
            <div class="input-group">
              <span class="input-group-text">₱</span>
              <input type="number" step="0.01" class="form-control" id="edit_batch_cost" name="cost" value="${batch.cost}" required min="0">
            </div>
          </div>

          <div class="mb-3">
            <label for="edit_batch_date_received" class="form-label">Date Received</label>
            <div class="input-group">
              <span class="input-group-text"><i class="bi bi-calendar"></i></span>
              <input type="date" class="form-control" id="edit_batch_date_received" name="date_received" value="${batch.date_received}" required>
            </div>
          </div>

          <div class="mb-3">
            <label for="edit_batch_expiry_date" class="form-label">Expiry Date (Optional)</label>
            <div class="input-group">
              <span class="input-group-text"><i class="bi bi-calendar"></i></span>
              <input type="date" class="form-control" id="edit_batch_expiry_date" name="expiry_date" value="${batch.expiry_date || ""}">
            </div>
          </div>

          <div class="mb-3">
            <label for="edit_batch_receipt_upload" class="form-label">Upload Receipt / Certificate (PDF or Image)</label>
            <input type="file" class="form-control" id="edit_batch_receipt_upload" name="receipt_upload" accept=".pdf,.jpg,.jpeg,.png">
            <div class="form-text">Upload documentation for receiving or quality certificates</div>
            ${batch.receipt_file ? `<div class="mt-2"><a href="${batch.receipt_file}" target="_blank">View Current Receipt</a></div>` : ""}
          </div>

          <div class="mb-3">
            <label for="edit_batch_notes" class="form-label">Notes</label>
            <textarea class="form-control" id="edit_batch_notes" name="notes" rows="3">${batch.notes || ""}</textarea>
          </div>
        `

          // Show the modal
          const editBatchModal = new bootstrap.Modal(document.getElementById("editBatchModal"))
          editBatchModal.show()
        } else {
          showResponseMessage("danger", "Error: " + data.message)
        }
      })
      .catch((error) => {
        console.error("Error:", error)
        showResponseMessage("danger", "An error occurred while fetching batch details.")
      })
  }

  // Function to open delete batch modal
  function openDeleteBatchModal(batchId, materialId) {
    document.getElementById("delete_batch_id").value = batchId

    // Show delete batch modal
    const deleteBatchModal = new bootstrap.Modal(document.getElementById("deleteBatchModal"))
    deleteBatchModal.show()
  }

  // Function to update batch
  function updateBatch() {
    showLoadingModal()
    const formData = new FormData(document.getElementById("edit-batch-form"))

    // Add batch ID to form data
    const batchId = document.getElementById("edit_batch_id").value
    formData.append("batch_id", batchId)

    fetch("update_material_batch.php", {
      method: "POST",
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          setTimeout(() => {
            hideLoadingModal()
            // Close the modal
            const editBatchModalElement = document.getElementById("editBatchModal")
            if (editBatchModalElement) {
              const editBatchModal = bootstrap.Modal.getInstance(editBatchModalElement)
              if (editBatchModal) {
                editBatchModal.hide()
              }
            }
            showSuccessModal("Batch updated successfully!")
            setTimeout(() => {
              const modalEl = document.getElementById("successModal")
              const modal = bootstrap.Modal.getInstance(modalEl)
              if (modal) modal.hide()
              // Refresh materials list
              fetchAndDisplayMaterials()
            }, 2000)
          }, 2000)
        } else {
          hideLoadingModal()
          showErrorModal("Error: " + data.message)
        }
      })
      .catch((error) => {
        hideLoadingModal()
        console.error("Error:", error)
        showErrorModal("An error occurred while updating the batch.")
      })
  }

  // Function to delete batch
  function deleteBatch(batchId) {
    showLoadingModal()
    fetch(`delete_material_batch.php?id=${batchId}`, {
      method: "DELETE",
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          setTimeout(() => {
            hideLoadingModal()
            showSuccessModal("Batch deleted successfully!")
            setTimeout(() => {
              const modalEl = document.getElementById("successModal")
              const modal = bootstrap.Modal.getInstance(modalEl)
              if (modal) modal.hide()
              fetchAndDisplayMaterials()
            }, 2000)
          }, 2000)
        } else {
          hideLoadingModal()
          showErrorModal("Error: " + data.message)
        }
      })
      .catch((error) => {
        hideLoadingModal()
        console.error("Error:", error)
        showErrorModal("An error occurred while deleting the batch.")
      })
  }

document.addEventListener("DOMContentLoaded", () => {
    const typeSelect = document.getElementById("edit_measurement_type");
    const unitDiv = document.getElementById("edit_unit_measurement_div");
    const piecesDiv = document.getElementById("edit_pieces_per_container_div");
    const piecesInput = document.getElementById("edit_pieces_per_container");

    typeSelect.addEventListener("change", () => {
      const selectedType = typeSelect.value;

      unitDiv.style.display = ["Unit", "Bulk"].includes(selectedType) ? "block" : "none";

      if (["Dozen", "Box", "Pack"].includes(selectedType)) {
        piecesDiv.style.display = "block";
        piecesInput.readOnly = selectedType === "Dozen";
        piecesInput.value = selectedType === "Dozen" ? 12 : "";
      } else {
        piecesDiv.style.display = "none";
      }
    });

    document.getElementById("edit_is_alternative_supplier").addEventListener("change", function () {
      document.getElementById("edit_alternative_supplier_div").classList.toggle("d-none", this.value !== "yes");
    });
  });

  // Function to populate and show the modal
  function editMaterial(materialId) {
    fetch(`get_material.php?id=${materialId}`)
      .then((res) => res.json())
      .then((data) => {
        if (!data.success) {
          return showResponseMessage("danger", "Error: " + data.message);
        }

        const m = data.material;
        document.getElementById("edit_id").value = m.id;
        document.getElementById("edit_material_id").value = m.material_id;
        document.getElementById("edit_material_name").value = m.name || "";
        document.getElementById("edit_category").value = m.category || "";
        document.getElementById("edit_quantity").value = m.quantity || 0;
        document.getElementById("edit_cost").value = m.cost || 0;
        document.getElementById("edit_measurement_type").value = m.measurement_type || "";
        document.getElementById("edit_unit_measurement").value = m.unit_measurement || "";
        document.getElementById("edit_pieces_per_container").value = m.pieces_per_container || "";
        document.getElementById("edit_base_unit").value = m.base_unit || "pieces";
        document.getElementById("edit_is_alternative_supplier").value = m.is_alternative_supplier || "no";
        document.getElementById("edit_supplier").value = m.supplier_id || "";
        document.getElementById("edit_notes").value = m.notes || "";

        // Alternative Supplier
        if (m.is_alternative_supplier === "yes") {
          document.getElementById("edit_alternative_supplier_div").classList.remove("d-none");
          document.getElementById("edit_alternative_supplier").value = m.alternative_supplier || "";
        } else {
          document.getElementById("edit_alternative_supplier_div").classList.add("d-none");
        }

        // Receipt link
        const receiptDiv = document.getElementById("current_receipt");
        receiptDiv.innerHTML = m.receipt_file
          ? `<a href="${m.receipt_file}" target="_blank">View Current Receipt</a>`
          : "No receipt uploaded";

        // Trigger initial measurement field visibility
        document.getElementById("edit_measurement_type").dispatchEvent(new Event("change"));

        // Show modal
        const modal = new bootstrap.Modal(document.getElementById("editMaterialModal"));
        modal.show();
      })
      .catch((err) => {
        console.error(err);
        showResponseMessage("danger", "An error occurred while loading the material.");
      });
  }

  // Function to update material
  function updateMaterial() {
    showLoadingModal();
    const form = document.getElementById("edit-material-form");
    const formData = new FormData(form);

    const file = document.getElementById("edit_receipt_upload").files[0];
    if (file) {
      formData.set("receipt_upload", file);
    }

    fetch("update_material.php", {
      method: "POST",
      body: formData,
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setTimeout(() => {
            hideLoadingModal();
            showSuccessModal("Material updated successfully.");
            setTimeout(() => {
              const modalEl = document.getElementById("successModal");
              const modal = bootstrap.Modal.getInstance(modalEl);
              if (modal) modal.hide();
              // Close the edit material modal
              const editMaterialModalElement = document.getElementById("editMaterialModal");
              if (editMaterialModalElement) {
                const editMaterialModal = bootstrap.Modal.getInstance(editMaterialModalElement);
                if (editMaterialModal) editMaterialModal.hide();
              }
              fetchAndDisplayMaterials();
            }, 2000);
          }, 2000);
        } else {
          hideLoadingModal();
          showResponseMessage("danger", data.message || "Failed to update.");
        }
      })
      .catch((err) => {
        hideLoadingModal();
        console.error("Update error:", err);
        showResponseMessage("danger", "An error occurred during update.");
      });
  }

  // Function to add a new batch
  function addBatch() {
    showLoadingModal();
    // Get form data
    const formData = new FormData(document.getElementById("add-batch-form"))

    // Debug: Log all form data
    console.log("Batch form data being submitted:")
    for (const pair of formData.entries()) {
      console.log(pair[0] + ": " + pair[1])
    }

    // Add file data
    const receiptFile = document.getElementById("batch_receipt_upload").files[0]
    if (receiptFile) {
      formData.set("receipt_upload", receiptFile)
    }

    // Send data to server
    fetch("add_batch.php", {
      method: "POST",
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          setTimeout(() => {
            hideLoadingModal();
            // Close the modal
            const addBatchModalElement = document.getElementById("addBatchModal");
            if (addBatchModalElement) {
              const addBatchModal = bootstrap.Modal.getInstance(addBatchModalElement);
              if (addBatchModal) {
                addBatchModal.hide();
              }
            }
            showSuccessModal("Batch added successfully!");
            setTimeout(() => {
              const modalEl = document.getElementById("successModal");
              const modal = bootstrap.Modal.getInstance(modalEl);
              if (modal) modal.hide();
              // Refresh materials list
              fetchAndDisplayMaterials();
            }, 2000);
          }, 2000);
        } else {
          hideLoadingModal();
          showErrorModal("Error: " + data.message);
        }
      })
      .catch((error) => {
        hideLoadingModal();
        console.error("Error:", error);
        showErrorModal("An error occurred while adding the batch.");
      });
  }

  // Function to delete material
  function deleteMaterial(materialId) {
    showLoadingModal()
    fetch(`delete_material.php?id=${materialId}`, {
      method: "DELETE",
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          setTimeout(() => {
            hideLoadingModal()
            showSuccessModal("Material deleted successfully!")
            setTimeout(() => {
              const modalEl = document.getElementById("successModal")
              const modal = bootstrap.Modal.getInstance(modalEl)
              if (modal) modal.hide()
              fetchAndDisplayMaterials()
            }, 2000)
          }, 2000)
        } else {
          hideLoadingModal()
          showErrorModal("Error: " + data.message)
        }
      })
      .catch((error) => {
        hideLoadingModal()
        console.error("Error:", error)
        showErrorModal("An error occurred while deleting the material.")
      })
  }

  // Function to update pagination
  function updatePagination(totalPages) {
    if (!paginationContainer) return

    let html = ""

    // Previous button
    html += `
      <li class="page-item ${currentPage === 1 ? "disabled" : ""}">
        <a class="page-link" href="#" data-page="${currentPage - 1}" aria-label="Previous">
          <span aria-hidden="true">&laquo;</span>
        </a>
      </li>
    `

    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
      html += `
        <li class="page-item ${currentPage === i ? "active" : ""}">
          <a class="page-link" href="#" data-page="${i}">${i}</a>
        </li>
      `
    }

    // Next button
    html += `
      <li class="page-item ${currentPage === totalPages ? "disabled" : ""}">
        <a class="page-link" href="#" data-page="${currentPage + 1}" aria-label="Next">
          <span aria-hidden="true">&raquo;</span>
        </a>
      </li>
    `

    paginationContainer.innerHTML = html

    // Add event listeners to pagination links
    document.querySelectorAll(".page-link").forEach((link) => {
      link.addEventListener("click", function (e) {
        e.preventDefault()
        const page = Number.parseInt(this.dataset.page)
        if (page && page !== currentPage) {
          currentPage = page
          fetchAndDisplayMaterials()
        }
      })
    })
  }

  // Function to fetch suppliers for dropdown
  function fetchSuppliers() {
    fetch("get_suppliers.php")
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          const suppliers = data.suppliers
          const supplierSelect = document.getElementById("supplier")
          const editSupplierSelect = document.getElementById("edit_supplier")

          // Populate regular suppliers dropdown
          if (supplierSelect) {
            let options = '<option value="" disabled selected>Select supplier</option>'
            suppliers.forEach((supplier) => {
              if (supplier.id === 'fixed-pineapple') {
                options += `<option value="${supplier.id}">${supplier.name} (Pineapple Supplier)</option>`
              } else {
                options += `<option value="${supplier.id}">${supplier.name}</option>`
              }
            })
            supplierSelect.innerHTML = options
          }

          if (editSupplierSelect) {
            let options = '<option value="" disabled selected>Select supplier</option>'
            suppliers.forEach((supplier) => {
              if (supplier.id === 'fixed-pineapple') {
                options += `<option value="${supplier.id}">${supplier.name} (Pineapple Supplier)</option>`
              } else {
                options += `<option value="${supplier.id}">${supplier.name}</option>`
              }
            })
            editSupplierSelect.innerHTML = options
          }
        }
      })
      .catch((error) => {
        console.error("Error fetching suppliers:", error)
      })
  }

  // Function to update alternative supplier options based on selected supplier
  function updateAlternativeSupplierOptions(supplierId) {
    if (!supplierId) return

    const alternativeSupplierSelect = document.getElementById("alternative_supplier")
    if (!alternativeSupplierSelect) return

    // Clear current options
    alternativeSupplierSelect.innerHTML = '<option value="" disabled selected>Select alternative supplier</option>'

    // Find alternatives for this supplier
    fetch(`get_suppliers.php?supplier_id=${supplierId}`)
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          let alternativeSuppliers = [];
          if (supplierId === 'fixed-pineapple') {
            alternativeSuppliers = data.alternative_suppliers.filter(
              (supplier) => supplier.is_fixed_pineapple == 1
            )
          } else {
            alternativeSuppliers = data.alternative_suppliers.filter(
              (supplier) => supplier.supplier_id == supplierId || !supplier.supplier_id
            )
          }

          if (alternativeSuppliers.length > 0) {
            alternativeSuppliers.forEach((supplier) => {
              const option = document.createElement("option")
              option.value = supplier.name
              option.textContent = supplier.name
              alternativeSupplierSelect.appendChild(option)
            })
          } else {
            // Add a message if no alternatives exist
            const option = document.createElement("option")
            option.value = ""
            option.textContent = "No alternatives available for this supplier"
            option.disabled = true
            alternativeSupplierSelect.appendChild(option)
          }
        }
      })
      .catch((error) => {
        console.error("Error fetching alternative suppliers:", error)
      })
  }

  // Function to update alternative supplier options in edit form
  function updateEditAlternativeSupplierOptions(supplierId) {
    if (!supplierId) return

    const editAlternativeSupplierSelect = document.getElementById("edit_alternative_supplier")
    if (!editAlternativeSupplierSelect) return

    // Clear current options
    editAlternativeSupplierSelect.innerHTML = '<option value="" disabled selected>Select alternative supplier</option>'

    // Find alternatives for this supplier
    fetch(`get_suppliers.php?supplier_id=${supplierId}`)
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          let alternativeSuppliers = [];
          if (supplierId === 'fixed-pineapple') {
            alternativeSuppliers = data.alternative_suppliers.filter(
              (supplier) => supplier.is_fixed_pineapple == 1
            )
          } else {
            alternativeSuppliers = data.alternative_suppliers.filter(
              (supplier) => supplier.supplier_id == supplierId || !supplier.supplier_id
            )
          }

          if (alternativeSuppliers.length > 0) {
            alternativeSuppliers.forEach((supplier) => {
              const option = document.createElement("option")
              option.value = supplier.name
              option.textContent = supplier.name
              editAlternativeSupplierSelect.appendChild(option)
            })
          } else {
            // Add a message if no alternatives exist
            const option = document.createElement("option")
            option.value = ""
            option.textContent = "No alternatives available for this supplier"
            option.disabled = true
            editAlternativeSupplierSelect.appendChild(option)
          }
        }
      })
      .catch((error) => {
        console.error("Error fetching alternative suppliers:", error)
      })
  }

  // Helper function to get status class based on quantity
  function getStatusClass(quantity) {
    if (quantity <= 0) {
      return "status-out-stock"
    } else if (quantity <= 10) {
      return "status-low-stock"
    } else {
      return "status-in-stock"
    }
  }

  // Helper function to get status text based on quantity
  function getStatusText(quantity) {
    if (quantity <= 0) {
      return "Out of Stock"
    } else if (quantity <= 10) {
      return "Low Stock"
    } else {
      return "In Stock"
    }
  }

  // Function to show response message
  function showResponseMessage(type, message) {
    const responseMessage = document.getElementById("response-message")
    if (!responseMessage) return

    // Set message content and type
    responseMessage.className = `alert alert-${type} alert-dismissible fade show`
    responseMessage.innerHTML = `
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `

    // Show the message
    responseMessage.style.display = "block"

    // Auto-dismiss after 5 seconds
    setTimeout(() => {
      if (responseMessage.parentNode) {
        try {
          if (typeof bootstrap !== "undefined") {
            const bsAlert = new bootstrap.Alert(responseMessage)
            bsAlert.close()
          } else {
            console.error("Bootstrap is not defined. Make sure it's included in your project.")
            responseMessage.style.display = "none"
          }
        } catch (error) {
          console.error("Bootstrap Alert error:", error)
          // Fallback to removing the element if Bootstrap Alert fails
          responseMessage.style.display = "none"
        }
      }
    }, 5000)
  }

  // Utility functions for modals
  function showLoadingModal() {
    closeAllModals()
    const modal = new bootstrap.Modal(document.getElementById("loadingModal"))
    document.getElementById("loadingModal").setAttribute("data-bs-backdrop", "static")
    document.getElementById("loadingModal").setAttribute("data-bs-keyboard", "false")
    modal.show()
  }
  function hideLoadingModal() {
    const modalEl = document.getElementById("loadingModal")
    const modal = bootstrap.Modal.getInstance(modalEl)
    if (modal) modal.hide()
  }
  function showSuccessModal(message) {
    closeAllModals()
    document.getElementById("successModalMessage").textContent = message || "Success!"
    const modal = new bootstrap.Modal(document.getElementById("successModal"))
    modal.show()
  }
  function showErrorModal(message) {
    document.getElementById("errorModalMessage").textContent = message || "An error occurred."
    const modal = new bootstrap.Modal(document.getElementById("errorModal"))
    modal.show()
  }

  // Utility: Close all open modals
  function closeAllModals() {
    const modalElements = document.querySelectorAll(".modal.show")
    modalElements.forEach((modalEl) => {
      const modal = bootstrap.Modal.getInstance(modalEl)
      if (modal) modal.hide()
    })
  }
})