// Suppliers Management System

// Supplier data structure (will be loaded from database)
let suppliers = []

// Fixed Pineapple Supplier data (will be loaded from database)
let fixedPineappleSupplier = {
  id: "fixed-pineapple",
  name: "",
  contactInfo: "",
  deliveryInfo: "",
  communicationMode: "",
  notes: "",
  harvestSeason: "",
  plantingCycle: "",
  variety: "",
  shelfLife: "",
  alternatives: [],
}

// Current view mode (table or card)
let currentViewMode = "table"

// Initialize the page when DOM is loaded
document.addEventListener("DOMContentLoaded", async () => {
  await initializeSuppliersPage()
})

// Initialize suppliers page
async function initializeSuppliersPage() {
  try {
    // Set default fixed pineapple supplier data in case database fetch fails
    fixedPineappleSupplier = {
      id: "fixed-pineapple",
      name: "Premium Pineapple Farm",
      contactInfo: "+1 (555) 789-0123",
      deliveryInfo: "Business Driver",
      communicationMode: "Call",
      notes: "Our primary pineapple supplier with premium quality",
      harvestSeason: "Year-round with peak in summer",
      plantingCycle: "12-18 months",
      variety: "MD-2 Sweet Gold",
      shelfLife: "5-7 days at room temperature, 10-14 days refrigerated",
      alternatives: [],
    }

    // Try to load fixed pineapple supplier from database
    try {
      await loadFixedPineappleSupplier()
    } catch (error) {
      console.error("Error loading fixed pineapple supplier:", error)
      // Continue with default data already set above
    }

    // Update the fixed pineapple supplier section with current data
    updateFixedPineappleSupplierSection()

    // Set default suppliers data in case database fetch fails
    suppliers = []

    // Try to load suppliers from database
    try {
      await loadSuppliers()
    } catch (error) {
      console.error("Error loading suppliers:", error)
      // If no suppliers were loaded, display empty state
      displaySuppliers()
    }

    // Initialize event listeners
    initializeEventListeners()
  } catch (error) {
    console.error("Error initializing suppliers page:", error)
    showErrorModal("Failed to initialize suppliers page: " + error.message)
  }
}

// Update the fixed pineapple supplier section with current data (farm location still removed from main supplier)
function updateFixedPineappleSupplierSection() {
  const fixedSupplierSection = document.querySelector(".fixed-pineapple-card")
  if (fixedSupplierSection) {
    // Update supplier name
    const nameElement = fixedSupplierSection.querySelector("h6")
    if (nameElement) nameElement.textContent = fixedPineappleSupplier.name

    // Update contact information - target the correct element
    const contactElement = fixedSupplierSection.querySelector(".text-muted small")
    if (contactElement && contactElement.querySelector("i.bi-telephone"))
      contactElement.innerHTML = `<i class="bi bi-telephone me-1"></i>${fixedPineappleSupplier.contactInfo || "Contact info not available"}`

    // Update alternatives count badge
    const badge = fixedSupplierSection.querySelector(".badge")
    if (badge)
      badge.textContent = `${fixedPineappleSupplier.alternatives ? fixedPineappleSupplier.alternatives.length : 0} Alternatives`
  }
}

// Create the fixed pineapple supplier section
function createFixedPineappleSupplierSection() {
  const section = document.createElement("div")
  section.className = "card shadow-sm mb-4 fixed-pineapple-card"
  section.style.cursor = "pointer"

  // Create card header
  const cardHeader = document.createElement("div")
  cardHeader.className = "card-header bg-warning bg-opacity-10 d-flex justify-content-between align-items-center"
  cardHeader.innerHTML = `
    <h5 class="mb-0">Pineapple Supplier</h5>
    <div>
      <button class="btn btn-sm btn-outline-primary edit-fixed-supplier-btn me-2">
        <i class="bi bi-pencil me-1"></i>Edit
      </button>
      <button class="btn btn-sm btn-outline-success add-alternative-btn" data-supplier-id="${fixedPineappleSupplier.id}">
        <i class="bi bi-plus-circle me-1"></i>Add Alternative
      </button>
    </div>
  `

  // Create simplified card body (farm location still removed from main supplier)
  const cardBody = document.createElement("div")
  cardBody.className = "card-body"

  // Create simplified content
  cardBody.innerHTML = `
  <div class="d-flex align-items-center">
    <div class="flex-grow-1">
      <h6 class="mb-1">${fixedPineappleSupplier.name}</h6>
      <p class="mb-0 text-muted small"><i class="bi bi-telephone me-1"></i>${fixedPineappleSupplier.contactInfo || "Contact info not available"}</p>
    </div>
    <div>
      <span class="badge bg-warning text-dark">${fixedPineappleSupplier.alternatives ? fixedPineappleSupplier.alternatives.length : 0} Alternatives</span>
    </div>
  </div>
  <div class="mt-2 text-end">
    <small class="text-muted">Click to view details</small>
  </div>
`

  // Assemble the card
  section.appendChild(cardHeader)
  section.appendChild(cardBody)

  // Add click event to show modal with details
  section.addEventListener("click", (e) => {
    // Don't trigger modal if clicking on the Add Alternative button
    if (e.target.closest(".add-alternative-btn") || e.target.closest(".edit-fixed-supplier-btn")) {
      return
    }
    showFixedPineappleDetailsModal()
  })

  return section
}

// Show fixed pineapple details modal (farm location still removed from main supplier)
function showFixedPineappleDetailsModal() {
  console.log("Showing fixed pineapple details modal")

  // Create modal if it doesn't exist
  let detailsModal = document.getElementById("fixedPineappleDetailsModal")

  if (!detailsModal) {
    console.log("Creating new fixed pineapple details modal")
    detailsModal = document.createElement("div")
    detailsModal.className = "modal fade"
    detailsModal.id = "fixedPineappleDetailsModal"
    detailsModal.setAttribute("tabindex", "-1")
    detailsModal.setAttribute("aria-labelledby", "fixedPineappleDetailsModalLabel")
    detailsModal.setAttribute("aria-hidden", "true")

    detailsModal.innerHTML = `
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header bg-warning bg-opacity-10">
            <h5 class="modal-title" id="fixedPineappleDetailsModalLabel">Pineapple Supplier Details</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <div class="row">
              <div class="col-md-6">
                <div class="card mb-3">
                  <div class="card-header">
                    <h6 class="mb-0">Supplier Information</h6>
                  </div>
                  <div class="card-body">
                    <p><strong>Name:</strong> <span id="modal-supplier-name">${fixedPineappleSupplier.name}</span></p>
                    <p><strong>Contact Info:</strong> <span id="modal-supplier-contact">${fixedPineappleSupplier.contactInfo || "Not available"}</span></p>
                    <p><strong>Delivery Method:</strong> <span id="modal-supplier-delivery">${fixedPineappleSupplier.deliveryInfo || "Not specified"}</span></p>
                    <p><strong>Communication:</strong> <span id="modal-supplier-communication">${fixedPineappleSupplier.communicationMode || "Not specified"}</span></p>
                    <p><strong>Notes:</strong> <span id="modal-supplier-notes">${fixedPineappleSupplier.notes || "No notes available"}</span></p>
                  </div>
                </div>
              </div>
              <div class="col-md-6">
                <div class="card mb-3">
                  <div class="card-header">
                    <h6 class="mb-0">Pineapple Details</h6>
                  </div>
                  <div class="card-body">
                    <p><strong>Variety:</strong> <span id="modal-pineapple-variety">${fixedPineappleSupplier.variety || "Not specified"}</span></p>
                    <p><strong>Harvest Season:</strong> <span id="modal-pineapple-harvest">${fixedPineappleSupplier.harvestSeason || "Not specified"}</span></p>
                    <p><strong>Planting Cycle:</strong> <span id="modal-pineapple-planting">${fixedPineappleSupplier.plantingCycle || "Not specified"}</span></p>
                    <p><strong>Shelf Life:</strong> <span id="modal-pineapple-shelf">${fixedPineappleSupplier.shelfLife || "Not specified"}</span></p>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="card mb-3">
              <div class="card-header">
                <h6 class="mb-0">Record Information</h6>
              </div>
              <div class="card-body">
                <p><strong>Created:</strong> <span id="modal-pineapple-created">${formatDateTime(fixedPineappleSupplier.created_at) || "Not available"}</span></p>
                <p><strong>Last Updated:</strong> <span id="modal-pineapple-updated">${formatDateTime(fixedPineappleSupplier.updated_at) || "Not available"}</span></p>
              </div>
            </div>
            
            <div class="card">
              <div class="card-header d-flex justify-content-between align-items-center">
                <h6 class="mb-0">Alternative Suppliers</h6>
                <button class="btn btn-sm btn-outline-success add-alternative-btn" data-supplier-id="${fixedPineappleSupplier.id}" data-bs-dismiss="modal">
                  <i class="bi bi-plus-circle me-1"></i>Add Alternative
                </button>
              </div>
              <div class="card-body">
                <div id="modal-fixed-alternatives-container">
                  <p class="text-muted">No alternative suppliers found.</p>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-outline-primary edit-fixed-supplier-btn">
              <i class="bi bi-pencil me-1"></i>Edit
            </button>
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
          </div>
        </div>
      </div>
    `

    document.body.appendChild(detailsModal)
  } else {
    console.log("Updating existing fixed pineapple details modal")
    // Update modal content with current data (farm location still removed from main supplier)
    const modalSupplierName = document.getElementById("modal-supplier-name")
    const modalSupplierContact = document.getElementById("modal-supplier-contact")
    const modalSupplierDelivery = document.getElementById("modal-supplier-delivery")
    const modalSupplierCommunication = document.getElementById("modal-supplier-communication")
    const modalSupplierNotes = document.getElementById("modal-supplier-notes")
    const modalPineappleVariety = document.getElementById("modal-pineapple-variety")
    const modalPineappleHarvest = document.getElementById("modal-pineapple-harvest")
    const modalPineapplePlanting = document.getElementById("modal-pineapple-planting")
    const modalPineappleShelf = document.getElementById("modal-pineapple-shelf")
    const modalPineappleCreated = document.getElementById("modal-pineapple-created")
    const modalPineappleUpdated = document.getElementById("modal-pineapple-updated")

    if (modalSupplierName) modalSupplierName.textContent = fixedPineappleSupplier.name
    if (modalSupplierContact) modalSupplierContact.textContent = fixedPineappleSupplier.contactInfo || "Not available"
    if (modalSupplierDelivery)
      modalSupplierDelivery.textContent = fixedPineappleSupplier.deliveryInfo || "Not specified"
    if (modalSupplierCommunication)
      modalSupplierCommunication.textContent = fixedPineappleSupplier.communicationMode || "Not specified"
    if (modalSupplierNotes) modalSupplierNotes.textContent = fixedPineappleSupplier.notes || "No notes available"
    if (modalPineappleVariety) modalPineappleVariety.textContent = fixedPineappleSupplier.variety || "Not specified"
    if (modalPineappleHarvest)
      modalPineappleHarvest.textContent = fixedPineappleSupplier.harvestSeason || "Not specified"
    if (modalPineapplePlanting)
      modalPineapplePlanting.textContent = fixedPineappleSupplier.plantingCycle || "Not specified"
    if (modalPineappleShelf) modalPineappleShelf.textContent = fixedPineappleSupplier.shelfLife || "Not specified"

    // Update timestamps
    if (modalPineappleCreated)
      modalPineappleCreated.textContent = formatDateTime(fixedPineappleSupplier.created_at) || "Not available"
    if (modalPineappleUpdated)
      modalPineappleUpdated.textContent = formatDateTime(fixedPineappleSupplier.updated_at) || "Not available"
  }

  // Update alternatives in the modal
  updateModalFixedAlternativesDisplay()

  // Show the modal
  try {
    const modal = new bootstrap.Modal(detailsModal)
    modal.show()
    console.log("Fixed pineapple details modal shown successfully")
  } catch (error) {
    console.error("Error showing fixed pineapple details modal:", error)
  }
}

// Create and show fixed pineapple supplier edit modal (farm location still removed from main supplier)
function showFixedPineappleEditModal() {
  console.log("Showing fixed pineapple edit modal")

  const editModal = document.getElementById("editFixedPineappleModal")

  if (!editModal) {
    console.error("Edit fixed pineapple modal not found in DOM")
    return
  }

  // Update form values with current data
  const editFixedName = document.getElementById("edit-fixed-name")
  if (editFixedName) {
    editFixedName.value = fixedPineappleSupplier.name
  }

  // Initialize enhanced inputs
  // Contact Information
  const contactInfoField = document.querySelector("#edit-fixed-modal .full-contact-info")
  if (contactInfoField) {
    contactInfoField.value = fixedPineappleSupplier.contactInfo || ""
    // If there's a phone input field, try to extract and set the phone number
    const phoneInput = document.querySelector("#edit-fixed-modal .phone-input")
    if (phoneInput && fixedPineappleSupplier.contactInfo) {
      // Extract phone number without country code if possible
      const phoneMatch = fixedPineappleSupplier.contactInfo.match(/\+\d+\s*(.*)/)
      if (phoneMatch && phoneMatch[1]) {
        phoneInput.value = phoneMatch[1].trim()
      } else {
        phoneInput.value = fixedPineappleSupplier.contactInfo
      }
    }

    // If there's a country code dropdown, try to set it
    const countryCodeBtn = document.querySelector("#edit-fixed-modal .country-code-btn")
    if (countryCodeBtn && fixedPineappleSupplier.contactInfo) {
      // Try to extract country code
      const codeMatch = fixedPineappleSupplier.contactInfo.match(/(\+\d+)/)
      if (codeMatch && codeMatch[1]) {
        countryCodeBtn.textContent = codeMatch[1]
      }
    }
  } else {
    // Fallback to old input if enhanced input doesn't exist
    const editFixedContact = document.getElementById("edit-fixed-contact")
    if (editFixedContact) {
      editFixedContact.value = fixedPineappleSupplier.contactInfo || ""
    }
  }

  // Set delivery method
  const deliverySelect = document.getElementById("edit-fixed-delivery")
  if (deliverySelect) {
    if (["3rd Party", "Business Driver", "Pick Up"].includes(fixedPineappleSupplier.deliveryInfo)) {
      deliverySelect.value = fixedPineappleSupplier.deliveryInfo
      const otherDeliveryContainer = document.getElementById("edit-fixed-other-delivery-container")
      if (otherDeliveryContainer) otherDeliveryContainer.style.display = "none"
    } else if (fixedPineappleSupplier.deliveryInfo) {
      deliverySelect.value = "Other"
      const otherDeliveryContainer = document.getElementById("edit-fixed-other-delivery-container")
      const otherDeliveryInput = document.getElementById("edit-fixed-other-delivery")
      if (otherDeliveryContainer) otherDeliveryContainer.style.display = "block"
      if (otherDeliveryInput) otherDeliveryInput.value = fixedPineappleSupplier.deliveryInfo
    } else {
      deliverySelect.value = ""
      const otherDeliveryContainer = document.getElementById("edit-fixed-other-delivery-container")
      if (otherDeliveryContainer) otherDeliveryContainer.style.display = "none"
    }
  }

  // Set communication mode
  const communicationSelect = document.getElementById("edit-fixed-communication")
  if (communicationSelect) {
    if (["Text", "Call", "WhatsApp", "Telegram", "Viber"].includes(fixedPineappleSupplier.communicationMode)) {
      communicationSelect.value = fixedPineappleSupplier.communicationMode
      const otherCommunicationContainer = document.getElementById("edit-fixed-other-communication-container")
      if (otherCommunicationContainer) otherCommunicationContainer.style.display = "none"
    } else if (fixedPineappleSupplier.communicationMode) {
      communicationSelect.value = "Other"
      const otherCommunicationContainer = document.getElementById("edit-fixed-other-communication-container")
      const otherCommunicationInput = document.getElementById("edit-fixed-other-communication")
      if (otherCommunicationContainer) otherCommunicationContainer.style.display = "block"
      if (otherCommunicationInput) otherCommunicationInput.value = fixedPineappleSupplier.communicationMode
    } else {
      communicationSelect.value = ""
      const otherCommunicationContainer = document.getElementById("edit-fixed-other-communication-container")
      if (otherCommunicationContainer) otherCommunicationContainer.style.display = "none"
    }
  }

  // Harvest Season
  const harvestSeasonSelect = document.querySelector("#edit-fixed-modal .harvest-season-select")
  if (harvestSeasonSelect) {
    // Try to match the harvest season to one of the predefined options
    const predefinedSeasons = [
      "Year-round",
      "Year-round with peak in summer",
      "January-April",
      "May-August",
      "September-December",
    ]
    if (predefinedSeasons.includes(fixedPineappleSupplier.harvestSeason)) {
      harvestSeasonSelect.value = fixedPineappleSupplier.harvestSeason
      const customContainer = document.querySelector("#edit-fixed-modal .harvest-season-custom")
      if (customContainer) customContainer.style.display = "none"
    } else if (fixedPineappleSupplier.harvestSeason) {
      // If it doesn't match any predefined option, set it as custom
      harvestSeasonSelect.value = "custom"
      const customContainer = document.querySelector("#edit-fixed-modal .harvest-season-custom")
      if (customContainer) customContainer.style.display = "block"

      // Try to parse the custom range if possible
      const monthRange = fixedPineappleSupplier.harvestSeason.match(/(\w+)\s*(?:to|-)\s*(\w+)/)
      if (monthRange && monthRange[1] && monthRange[2]) {
        const fromMonth = document.querySelector("#edit-fixed-modal .harvest-from-month")
        const toMonth = document.querySelector("#edit-fixed-modal .harvest-to-month")
        if (fromMonth && toMonth) {
          fromMonth.value = monthRange[1]
          toMonth.value = monthRange[2]
        }
      }
    } else {
      harvestSeasonSelect.value = ""
      const customContainer = document.querySelector("#edit-fixed-modal .harvest-season-custom")
      if (customContainer) customContainer.style.display = "none"
    }

    // Set the hidden field
    const hiddenField = document.querySelector("#edit-fixed-modal .full-harvest-season")
    if (hiddenField) hiddenField.value = fixedPineappleSupplier.harvestSeason || ""
  } else {
    // Fallback to old input
    const editFixedHarvest = document.getElementById("edit-fixed-harvest")
    if (editFixedHarvest) editFixedHarvest.value = fixedPineappleSupplier.harvestSeason || ""
  }

  // Planting Cycle
  const plantingCycleSelect = document.querySelector("#edit-fixed-modal .planting-cycle-select")
  if (plantingCycleSelect) {
    // Try to match the planting cycle to one of the predefined options
    const predefinedCycles = ["12-18 months", "15-20 months", "18-24 months", "Plant crop", "Ratoon crop"]
    if (predefinedCycles.includes(fixedPineappleSupplier.plantingCycle)) {
      plantingCycleSelect.value = fixedPineappleSupplier.plantingCycle
      const customContainer = document.querySelector("#edit-fixed-modal .planting-cycle-custom")
      if (customContainer) customContainer.style.display = "none"
    } else if (fixedPineappleSupplier.plantingCycle) {
      // If it doesn't match any predefined option, set it as custom
      plantingCycleSelect.value = "custom"
      const customContainer = document.querySelector("#edit-fixed-modal .planting-cycle-custom")
      if (customContainer) customContainer.style.display = "block"

      // Try to parse the custom range if possible
      const monthRange = fixedPineappleSupplier.plantingCycle.match(/(\d+)\s*(?:to|-)\s*(\d+)/)
      if (monthRange && monthRange[1] && monthRange[2]) {
        const minMonths = document.querySelector("#edit-fixed-modal .planting-cycle-min")
        const maxMonths = document.querySelector("#edit-fixed-modal .planting-cycle-max")
        if (minMonths && maxMonths) {
          minMonths.value = monthRange[1]
          maxMonths.value = monthRange[2]
        }
      }
    } else {
      plantingCycleSelect.value = ""
      const customContainer = document.querySelector("#edit-fixed-modal .planting-cycle-custom")
      if (customContainer) customContainer.style.display = "none"
    }

    // Set the hidden field
    const hiddenField = document.querySelector("#edit-fixed-modal .full-planting-cycle")
    if (hiddenField) hiddenField.value = fixedPineappleSupplier.plantingCycle || ""
  } else {
    // Fallback to old input
    const editFixedPlanting = document.getElementById("edit-fixed-planting")
    if (editFixedPlanting) editFixedPlanting.value = fixedPineappleSupplier.plantingCycle || ""
  }

  // Variety
  const varietySelect = document.querySelector("#edit-fixed-modal .variety-select")
  if (varietySelect) {
    // Try to match the variety to one of the predefined options
    const predefinedVarieties = ["MD-2 Sweet Gold", "Smooth Cayenne", "Queen", "Red Spanish", "Abacaxi", "Sugarloaf"]
    if (predefinedVarieties.includes(fixedPineappleSupplier.variety)) {
      varietySelect.value = fixedPineappleSupplier.variety
      const customContainer = document.querySelector("#edit-fixed-modal .variety-custom")
      if (customContainer) customContainer.style.display = "none"
    } else if (fixedPineappleSupplier.variety) {
      // If it doesn't match any predefined option, set it as custom
      varietySelect.value = "custom"
      const customContainer = document.querySelector("#edit-fixed-modal .variety-custom")
      const customInput = document.querySelector("#edit-fixed-modal .variety-custom-input")
      if (customContainer) customContainer.style.display = "block"
      if (customInput) customInput.value = fixedPineappleSupplier.variety
    } else {
      varietySelect.value = ""
      const customContainer = document.querySelector("#edit-fixed-modal .variety-custom")
      if (customContainer) customContainer.style.display = "none"
    }

    // Set the hidden field
    const hiddenField = document.querySelector("#edit-fixed-modal .full-variety")
    if (hiddenField) hiddenField.value = fixedPineappleSupplier.variety || ""
  } else {
    // Fallback to old input
    const editFixedVariety = document.getElementById("edit-fixed-variety")
    if (editFixedVariety) editFixedVariety.value = fixedPineappleSupplier.variety || ""
  }

  // Shelf Life
  const shelfLifeSelect = document.querySelector("#edit-fixed-modal .shelf-life-select")
  if (shelfLifeSelect) {
    // Try to match the shelf life to one of the predefined options
    const predefinedShelfLives = [
      "5-7 days at room temperature, 10-14 days refrigerated",
      "3-5 days at room temperature",
      "7-10 days at room temperature",
      "10-14 days refrigerated",
      "14-21 days refrigerated",
    ]

    if (predefinedShelfLives.includes(fixedPineappleSupplier.shelfLife)) {
      shelfLifeSelect.value = fixedPineappleSupplier.shelfLife
      const customContainer = document.querySelector("#edit-fixed-modal .shelf-life-custom")
      if (customContainer) customContainer.style.display = "none"
    } else if (fixedPineappleSupplier.shelfLife) {
      // If it doesn't match any predefined option, set it as custom
      shelfLifeSelect.value = "custom"
      const customContainer = document.querySelector("#edit-fixed-modal .shelf-life-custom")
      if (customContainer) customContainer.style.display = "block"

      // Try to parse the custom ranges if possible
      const roomTempMatch = fixedPineappleSupplier.shelfLife.match(/(\d+)\s*(?:to|-)\s*(\d+)\s*days\s*at\s*room/)
      const refrigMatch = fixedPineappleSupplier.shelfLife.match(/(\d+)\s*(?:to|-)\s*(\d+)\s*days\s*refrigerated/)

      if (roomTempMatch && roomTempMatch[1] && roomTempMatch[2]) {
        const roomMin = document.querySelector("#edit-fixed-modal .shelf-life-room-min")
        const roomMax = document.querySelector("#edit-fixed-modal .shelf-life-room-max")
        if (roomMin) roomMin.value = roomTempMatch[1]
        if (roomMax) roomMax.value = roomTempMatch[2]
      }

      if (refrigMatch && refrigMatch[1] && refrigMatch[2]) {
        const refrigMin = document.querySelector("#edit-fixed-modal .shelf-life-refrig-min")
        const refrigMax = document.querySelector("#edit-fixed-modal .shelf-life-refrig-max")
        if (refrigMin) refrigMin.value = refrigMatch[1]
        if (refrigMax) refrigMax.value = refrigMatch[2]
      }
    } else {
      shelfLifeSelect.value = ""
      const customContainer = document.querySelector("#edit-fixed-modal .shelf-life-custom")
      if (customContainer) customContainer.style.display = "none"
    }

    // Set the hidden field
    const hiddenField = document.querySelector("#edit-fixed-modal .full-shelf-life")
    if (hiddenField) hiddenField.value = fixedPineappleSupplier.shelfLife || ""
  } else {
    // Fallback to old input
    const editFixedShelf = document.getElementById("edit-fixed-shelf")
    if (editFixedShelf) editFixedShelf.value = fixedPineappleSupplier.shelfLife || ""
  }

  // Notes
  const editFixedNotes = document.getElementById("edit-fixed-notes")
  if (editFixedNotes) {
    editFixedNotes.value = fixedPineappleSupplier.notes || ""
  }

  // Show the modal
  try {
    const modal = new bootstrap.Modal(editModal)
    modal.show()
    console.log("Fixed pineapple edit modal shown successfully")
  } catch (error) {
    console.error("Error showing fixed pineapple edit modal:", error)
  }
}

// Update fixed pineapple supplier (farm location still removed from main supplier)
async function updateFixedPineappleSupplier() {
  // Get form values
  const name = document.getElementById("edit-fixed-name").value

  // Validate required fields
  if (!name) {
    alert("Supplier name is required.")
    return
  }

  // Get contact info from enhanced input if available, otherwise use the regular input
  let contactInfo = ""
  const contactInfoField = document.querySelector("#edit-fixed-modal .full-contact-info")
  if (contactInfoField && contactInfoField.value) {
    contactInfo = contactInfoField.value
  } else {
    contactInfo = document.getElementById("edit-fixed-contact").value
  }

  // Farm location is still removed from main supplier

  // Handle delivery info
  let deliveryInfo = document.getElementById("edit-fixed-delivery").value
  if (deliveryInfo === "Other") {
    deliveryInfo = document.getElementById("edit-fixed-other-delivery").value
  }

  // Handle communication mode
  const communicationModeValue = document.getElementById("edit-fixed-communication").value
  let communicationMode
  if (communicationModeValue === "Other") {
    communicationMode = document.getElementById("edit-fixed-other-communication").value
  } else {
    communicationMode = communicationModeValue
  }

  // Get harvest season from enhanced input if available, otherwise use the regular input
  let harvestSeason = ""
  const harvestSeasonField = document.querySelector("#edit-fixed-modal .full-harvest-season")
  if (harvestSeasonField && harvestSeasonField.value) {
    harvestSeason = harvestSeasonField.value
  } else {
    harvestSeason = document.getElementById("edit-fixed-harvest").value
  }

  // Get planting cycle from enhanced input if available, otherwise use the regular input
  let plantingCycle = ""
  const plantingCycleField = document.querySelector("#edit-fixed-modal .full-planting-cycle")
  if (plantingCycleField && plantingCycleField.value) {
    plantingCycle = plantingCycleField.value
  } else {
    plantingCycle = document.getElementById("edit-fixed-planting").value
  }

  // Get variety from enhanced input if available, otherwise use the regular input
  let variety = ""
  const varietyField = document.querySelector("#edit-fixed-modal .full-variety")
  if (varietyField && varietyField.value) {
    variety = varietyField.value
  } else {
    variety = document.getElementById("edit-fixed-variety").value
  }

  // Get shelf life from enhanced input if available, otherwise use the regular input
  let shelfLife = ""
  const shelfLifeField = document.querySelector("#edit-fixed-modal .full-shelf-life")
  if (shelfLifeField && shelfLifeField.value) {
    shelfLife = shelfLifeField.value
  } else {
    shelfLife = document.getElementById("edit-fixed-shelf").value
  }

  const notes = document.getElementById("edit-fixed-notes").value

  // Create data object (farm location still removed from main supplier)
  const supplierData = {
    id: "fixed-pineapple", // Use the fixed-pineapple ID for API routing
    name,
    contactInfo,
    deliveryInfo,
    communicationMode,
    harvestSeason,
    plantingCycle,
    variety,
    shelfLife,
    notes,
  }

  try {
    // Use modal handler for loading and success states
    await modalHandler.editFixedPineapple(async () => {
      console.log("Sending update request with data:", supplierData)

      // Send data to server
      const response = await fetch("supplier.php", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(supplierData),
      })

      // Get the response text for debugging
      const responseText = await response.text()
      console.log("Server response:", responseText)

      // Try to parse the response as JSON
      let result
      try {
        result = JSON.parse(responseText)
      } catch (e) {
        throw new Error(`Invalid JSON response: ${responseText}`)
      }

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}: ${response.statusText}`)
      }

      if (result.status !== "success") {
        throw new Error(result.message || "Unknown error")
      }

      // Close the modal
      const modal = bootstrap.Modal.getInstance(document.getElementById("editFixedPineappleModal"))
      modal.hide()

      // Update local data (farm location still removed from main supplier)
      fixedPineappleSupplier = {
        ...fixedPineappleSupplier,
        name,
        contactInfo,
        deliveryInfo,
        communicationMode,
        harvestSeason,
        plantingCycle,
        variety,
        shelfLife,
        notes,
        updated_at: new Date().toISOString(),
      }

      // Update the fixed pineapple supplier section
      updateFixedPineappleSupplierSection()

      // Reload fixed pineapple supplier data to ensure we have the latest data
      await loadFixedPineappleSupplier()
      
      return result
    })
  } catch (error) {
    console.error("Error updating fixed pineapple supplier:", error)
    // Error modal is handled by the modal handler
  }
}

// Create supplier details modal
function createSupplierDetailsModal() {
  const modal = document.createElement("div")
  modal.className = "modal fade"
  modal.id = "supplierDetailsModal"
  modal.tabIndex = -1
  modal.setAttribute("aria-labelledby", "supplierDetailsModalLabel")
  modal.setAttribute("aria-hidden", "true")

  modal.innerHTML = `
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="supplierDetailsModalLabel">Supplier Details</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <!-- Physical supplier details -->
          <div id="physical-supplier-details">
            <div class="row">
              <div class="col-md-6">
                <div class="card mb-3">
                  <div class="card-header bg-primary bg-opacity-10">
                    <h6 class="mb-0">Basic Information</h6>
                  </div>
                  <div class="card-body">
                    <p><strong>Name:</strong> <span id="physical-name"></span></p>
                    <p><strong>Address:</strong> <span id="physical-address"></span></p>
                    <p><strong>Opening Hours:</strong> <span id="physical-hours"></span></p>
                  </div>
                </div>
              </div>
              <div class="col-md-6">
                <div class="card mb-3">
                  <div class="card-header bg-primary bg-opacity-10">
                    <h6 class="mb-0">Contact Information</h6>
                  </div>
                  <div class="card-body">
                    <p><strong>Contact Person:</strong> <span id="physical-contact"></span></p>
                    <p><strong>Phone:</strong> <span id="physical-phone"></span></p>
                    <p><strong>Email:</strong> <span id="physical-email"></span></p>
                  </div>
                </div>
              </div>
            </div>
            <div class="card mb-3">
              <div class="card-header bg-primary bg-opacity-10">
                <h6 class="mb-0">Delivery & Communication</h6>
              </div>
              <div class="card-body">
                <p><strong>Delivery Method:</strong> <span id="physical-delivery"></span></p>
                <p><strong>Communication Mode:</strong> <span id="physical-communication"></span></p>
                <p><strong>Notes:</strong> <span id="physical-notes"></span></p>
              </div>
            </div>
            <div class="card mb-3">
              <div class="card-header bg-primary bg-opacity-10">
                <h6 class="mb-0">Record Information</h6>
              </div>
              <div class="card-body">
                <p><strong>Created:</strong> <span id="physical-created"></span></p>
                <p><strong>Last Updated:</strong> <span id="physical-updated"></span></p>
              </div>
            </div>
          </div>

          <!-- Online supplier details -->
          <div id="online-supplier-details">
            <div class="row">
              <div class="col-md-6">
                <div class="card mb-3">
                  <div class="card-header bg-success bg-opacity-10">
                    <h6 class="mb-0">Basic Information</h6>
                  </div>
                  <div class="card-body">
                    <p><strong>Name:</strong> <span id="online-name"></span></p>
                    <p><strong>Platform:</strong> <span id="online-platform"></span></p>
                    <p><strong>Link:</strong> <a id="online-link" href="#" target="_blank"></a></p>
                  </div>
                </div>
              </div>
              <div class="col-md-6">
                <div class="card mb-3">
                  <div class="card-header bg-success bg-opacity-10">
                    <h6 class="mb-0">Delivery Information</h6>
                  </div>
                  <div class="card-body">
                    <p><strong>Delivery Method:</strong> <span id="online-delivery"></span></p>
                    <p><strong>Notes:</strong> <span id="online-notes"></span></p>
                  </div>
                </div>
              </div>
            </div>
            <div class="card mb-3">
              <div class="card-header bg-success bg-opacity-10">
                <h6 class="mb-0">Record Information</h6>
              </div>
              <div class="card-body">
                <p><strong>Created:</strong> <span id="online-created"></span></p>
                <p><strong>Last Updated:</strong> <span id="online-updated"></span></p>
              </div>
            </div>
          </div>

          <!-- Alternatives section -->
          <div class="card">
            <div class="card-header d-flex justify-content-between align-items-center">
              <h6 class="mb-0">Alternative Suppliers</h6>
              <button class="btn btn-sm btn-outline-success" id="modal-add-alternative-btn">
                <i class="bi bi-plus-circle me-1"></i>Add Alternative
              </button>
            </div>
            <div class="card-body">
              <div id="modal-alternatives-container">
                <p class="text-muted">No alternative suppliers found.</p>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
        </div>
      </div>
    </div>
  `

  document.body.appendChild(modal)
}

// Display suppliers based on current view mode
function displaySuppliers() {
  const container = document.getElementById("suppliers-container")
  const cardBody = container.querySelector(".card-body")

  if (!cardBody) return

  cardBody.innerHTML = ""

  // Add the appropriate view to the card body
  if (currentViewMode === "table") {
    cardBody.appendChild(createTableView())
  } else {
    cardBody.appendChild(createCardView())
  }
}

// Create table view of suppliers
function createTableView() {
  const tableContainer = document.createElement("div")
  tableContainer.className = "table-responsive"

  const table = document.createElement("table")
  table.className = "table table-hover align-middle mb-0"

  // Table header
  const thead = document.createElement("thead")
  thead.innerHTML = `
    <tr>
      <th>Name</th>
      <th>Type</th>
      <th>Contact</th>
      <th>Delivery</th>
      <th>Alternatives</th>
      <th>Actions</th>
    </tr>
  `

  // Table body
  const tbody = document.createElement("tbody")

  if (suppliers.length === 0) {
    // Display empty state
    const tr = document.createElement("tr")
    tr.innerHTML = `
      <td colspan="6" class="text-center py-4">
        <p class="text-muted mb-0">No suppliers found. Add your first supplier to get started.</p>
      </td>
    `
    tbody.appendChild(tr)
  } else {
    suppliers.forEach((supplier) => {
      const tr = document.createElement("tr")
      tr.style.cursor = "pointer"
      tr.setAttribute("data-supplier-id", supplier.id)

      // Add click event to show supplier details
      tr.addEventListener("click", (e) => {
        // Don't trigger if clicking on action buttons
        if (e.target.closest(".btn") || e.target.closest(".btn-group")) {
          return
        }
        showSupplierDetailsModal(supplier.id)
      })

      // Get badge color based on type
      const badgeClass = supplier.type === "physical" ? "bg-primary" : "bg-success"
      const typeLabel = supplier.type === "physical" ? "Physical/Market" : "Online Shop"

      // Determine contact info based on supplier type
      let contactInfo = ""
      const deliveryInfo = supplier.deliveryInfo || "Not specified"

      if (supplier.type === "physical") {
        contactInfo = supplier.contactName || "Not specified"
      } else if (supplier.type === "online") {
        contactInfo = supplier.platform || "Not specified"
      }

      tr.innerHTML = `
<td>${supplier.name}</td>
<td><span class="badge ${badgeClass}">${typeLabel}</span></td>
<td>${contactInfo}</td>
<td>${deliveryInfo}</td>
<td>
  <span class="badge bg-secondary">${supplier.alternatives ? supplier.alternatives.length : 0} Alternatives</span>
</td>
<td>
  <div class="btn-group btn-group-sm">
    <button type="button" class="btn btn-outline-success add-alternative-btn" data-supplier-id="${supplier.id}">
      <i class="bi bi-plus-circle"></i>
    </button>
    <button type="button" class="btn btn-outline-danger delete-supplier-btn" data-supplier-id="${supplier.id}">
      <i class="bi bi-trash"></i>
    </button>
  </div>
</td>
`

      tbody.appendChild(tr)
    })
  }

  table.appendChild(thead)
  table.appendChild(tbody)
  tableContainer.appendChild(table)

  return tableContainer
}

// Create card view of suppliers
function createCardView() {
  const cardContainer = document.createElement("div")
  cardContainer.className = "row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4 mb-0"

  if (suppliers.length === 0) {
    // Display empty state
    const emptyState = document.createElement("div")
    emptyState.className = "col-12 text-center py-5"
    emptyState.innerHTML = `
      <div class="py-5">
        <i class="bi bi-box text-muted" style="font-size: 3rem;"></i>
        <h5 class="mt-3">No Suppliers Found</h5>
        <p class="text-muted">Add your first supplier to get started.</p>
        <button class="btn btn-success mt-2" data-bs-toggle="modal" data-bs-target="#addSupplierModal">
          <i class="bi bi-plus-circle me-2"></i>Add New Supplier
        </button>
      </div>
    `
    cardContainer.appendChild(emptyState)
    return cardContainer
  }

  suppliers.forEach((supplier) => {
    const col = document.createElement("div")
    col.className = "col"

    const card = document.createElement("div")
    card.className = "card h-100 supplier-card"
    card.style.cursor = "pointer"
    card.setAttribute("data-supplier-id", supplier.id)

    // Add click event to show supplier details
    card.addEventListener("click", (e) => {
      // Don't trigger if clicking on action buttons
      if (e.target.closest(".btn-group") || e.target.closest(".btn")) {
        return
      }
      showSupplierDetailsModal(supplier.id)
    })

    // Get badge color and icon based on type
    const badgeClass = supplier.type === "physical" ? "bg-primary" : "bg-success"
    const typeLabel = supplier.type === "physical" ? "Physical/Market" : "Online Shop"
    const typeIcon = supplier.type === "physical" ? "bi-shop" : "bi-globe"

    const cardHeader = document.createElement("div")
    cardHeader.className = "card-header d-flex justify-content-between align-items-center"
    cardHeader.innerHTML = `
  <div>
    <span class="badge ${badgeClass}"><i class="bi ${typeIcon} me-1"></i>${typeLabel}</span>
  </div>
  <div class="btn-group">
    <button type="button" class="btn btn-sm btn-outline-success add-alternative-btn" data-supplier-id="${supplier.id}">
      <i class="bi bi-plus-circle"></i>
    </button>
    <button type="button" class="btn btn-sm btn-outline-danger delete-supplier-btn" data-supplier-id="${supplier.id}">
      <i class="bi bi-trash"></i>
    </button>
  </div>
`

    const cardBody = document.createElement("div")
    cardBody.className = "card-body"

    // Create simplified content based on supplier type
    let cardContent = `<h5 class="card-title mb-3">${supplier.name}</h5>`

    if (supplier.type === "physical") {
      cardContent += `
        <p class="card-text mb-1"><i class="bi bi-person me-2"></i>${supplier.contactName || "Not specified"}</p>
        <p class="card-text mb-1"><i class="bi bi-geo-alt me-2"></i>${supplier.address || "Not specified"}</p>
        <p class="card-text mb-1"><i class="bi bi-truck me-2"></i>${supplier.deliveryInfo || "Not specified"}</p>
      `
    } else if (supplier.type === "online") {
      cardContent += `
        <p class="card-text mb-1"><i class="bi bi-shop me-2"></i>${supplier.platform || "Not specified"}</p>
        <p class="card-text mb-1"><i class="bi bi-link-45deg me-2"></i>${supplier.link ? `<a href="${supplier.link}" target="_blank" onclick="event.stopPropagation()">${supplier.link}</a>` : "Not specified"}</p>
        <p class="card-text mb-1"><i class="bi bi-truck me-2"></i>${supplier.deliveryInfo || "Not specified"}</p>
      `
    }

    cardBody.innerHTML = cardContent

    const cardFooter = document.createElement("div")
    cardFooter.className = "card-footer d-flex justify-content-between align-items-center"
    cardFooter.innerHTML = `
      <small class="text-muted">Click to view details</small>
      <span class="badge bg-secondary">${supplier.alternatives ? supplier.alternatives.length : 0} Alternatives</span>
    `

    card.appendChild(cardHeader)
    card.appendChild(cardBody)
    card.appendChild(cardFooter)
    col.appendChild(card)

    cardContainer.appendChild(col)
  })

  return cardContainer
}

// Initialize event listeners
function initializeEventListeners() {
  // View toggle buttons
  document.getElementById("table-view-btn").addEventListener("click", () => {
    if (currentViewMode !== "table") {
      currentViewMode = "table"
      updateViewToggleButtons()
      displaySuppliers()
    }
  })

  document.getElementById("card-view-btn").addEventListener("click", () => {
    if (currentViewMode !== "card") {
      currentViewMode = "card"
      updateViewToggleButtons()
      displaySuppliers()
    }
  })

  // Supplier type change in add modal
  document.getElementById("supplier-type").addEventListener("change", function () {
    const type = this.value
    document.getElementById("physical-fields").style.display = type === "physical" ? "block" : "none"
    document.getElementById("online-fields").style.display = type === "online" ? "block" : "none"
  })

  // Add event listener for platform selection
  document.getElementById("platform").addEventListener("change", function () {
    const platform = this.value
    document.getElementById("other-platform-container").style.display = platform === "Other" ? "block" : "none"
  })

  // Add event listener for delivery info selection in physical supplier form
  document.getElementById("delivery-info").addEventListener("change", function () {
    const deliveryInfo = this.value
    document.getElementById("other-delivery-container").style.display = deliveryInfo === "Other" ? "block" : "none"
  })

  // Add event listener for communication mode selection
  document.getElementById("communication-mode").addEventListener("change", function () {
    const communicationMode = this.value
    document.getElementById("other-communication-container").style.display =
      communicationMode === "Other" ? "block" : "none"
  })

  // Add event listener for online delivery info selection
  document.getElementById("online-delivery-info").addEventListener("change", function () {
    const onlineDeliveryInfo = this.value
    document.getElementById("other-online-delivery-container").style.display =
      onlineDeliveryInfo === "Other" ? "block" : "none"
  })

  // Add event listeners for edit modal "Other" options
  document.getElementById("edit-delivery-info").addEventListener("change", function () {
    const deliveryInfo = this.value
    document.getElementById("edit-other-delivery-container").style.display = deliveryInfo === "Other" ? "block" : "none"
  })

  document.getElementById("edit-communication-mode").addEventListener("change", function () {
    const communicationMode = this.value
    document.getElementById("edit-other-communication-container").style.display =
      communicationMode === "Other" ? "block" : "none"
  })

  document.getElementById("edit-platform").addEventListener("change", function () {
    const platform = this.value
    document.getElementById("edit-other-platform-container").style.display = platform === "Other" ? "block" : "none"
  })

  document.getElementById("edit-online-delivery-info").addEventListener("change", function () {
    const onlineDeliveryInfo = this.value
    document.getElementById("edit-other-online-delivery-container").style.display =
      onlineDeliveryInfo === "Other" ? "block" : "none"
  })

  // Add event listeners for alternative modal "Other" options
  document.getElementById("alternative-delivery").addEventListener("change", function () {
    const deliveryInfo = this.value
    document.getElementById("alternative-other-delivery-container").style.display =
      deliveryInfo === "Other" ? "block" : "none"
  })

  document.getElementById("alternative-communication").addEventListener("change", function () {
    const communicationMode = this.value
    document.getElementById("alternative-other-communication-container").style.display =
      communicationMode === "Other" ? "block" : "none"
  })

  // Save supplier button
  document.getElementById("save-supplier-btn").addEventListener("click", saveSupplier)

  // Update supplier button
  document.getElementById("update-supplier-btn").addEventListener("click", updateSupplier)

  // Confirm delete button
  document.getElementById("confirm-delete-btn").addEventListener("click", deleteSupplier)

  // Save alternative button
  document.getElementById("save-alternative-btn").addEventListener("click", saveAlternative)

  // Search input
  document.getElementById("supplier-search").addEventListener("input", () => {
    // Implement search functionality
    const searchTerm = document.getElementById("supplier-search").value.toLowerCase()
    if (searchTerm.length > 0) {
      // Filter suppliers based on search term
      const filteredSuppliers = suppliers.filter(
        (supplier) =>
          supplier.name.toLowerCase().includes(searchTerm) ||
          (supplier.contactName && supplier.contactName.toLowerCase().includes(searchTerm)) ||
          (supplier.email && supplier.email.toLowerCase().includes(searchTerm)) ||
          (supplier.platform && supplier.platform.toLowerCase().includes(searchTerm)),
      )

      // Create a temporary array for display
      const originalSuppliers = [...suppliers]
      suppliers = filteredSuppliers
      displaySuppliers()
      // Restore original array
      suppliers = originalSuppliers
    } else {
      // Show all suppliers
      displaySuppliers()
    }
  })

  // Add event listener to reset form when modal is hidden
  const addSupplierModal = document.getElementById("addSupplierModal")
  addSupplierModal.addEventListener("hidden.bs.modal", () => {
    document.getElementById("add-supplier-form").reset()
    document.getElementById("physical-fields").style.display = "none"
    document.getElementById("online-fields").style.display = "none"
    document.getElementById("other-platform-container").style.display = "none"
    document.getElementById("other-delivery-container").style.display = "none"
    document.getElementById("other-communication-container").style.display = "none"
    document.getElementById("other-online-delivery-container").style.display = "none"
  })

  // Update fixed supplier button
  const updateFixedSupplierBtn = document.getElementById("update-fixed-supplier-btn")
  if (updateFixedSupplierBtn) {
    updateFixedSupplierBtn.addEventListener("click", updateFixedPineappleSupplier)
  }

  // Fixed pineapple edit modal delivery change
  const editFixedDelivery = document.getElementById("edit-fixed-delivery")
  if (editFixedDelivery) {
    editFixedDelivery.addEventListener("change", function () {
      const deliveryInfo = this.value
      const container = document.getElementById("edit-fixed-other-delivery-container")
      if (container) {
        container.style.display = deliveryInfo === "Other" ? "block" : "none"
      }
    })
  }

  // Fixed pineapple edit modal communication change
  const editFixedCommunication = document.getElementById("edit-fixed-communication")
  if (editFixedCommunication) {
    editFixedCommunication.addEventListener("change", function () {
      const communicationModeValue = this.value
      const container = document.getElementById("edit-fixed-other-communication-container")
      if (container) {
        container.style.display = communicationModeValue === "Other" ? "block" : "none"
      }
    })
  }

  // Dynamic event listeners for buttons that are added to the DOM after page load
  document.addEventListener("click", (e) => {
    // Fixed pineapple card click
    if (e.target.closest(".fixed-pineapple-card") && !e.target.closest(".btn")) {
      console.log("Fixed pineapple card clicked")
      showFixedPineappleDetailsModal()
      e.stopPropagation()
    }

    // Edit fixed supplier button
    if (e.target.closest(".edit-fixed-supplier-btn")) {
      console.log("Edit fixed supplier button clicked")
      showFixedPineappleEditModal()
      e.stopPropagation()
    }

    // Edit supplier button
    if (e.target.closest(".edit-supplier-btn")) {
      const supplierId = e.target.closest(".edit-supplier-btn").getAttribute("data-supplier-id")
      openEditSupplierModal(supplierId)
      e.stopPropagation() // Prevent event bubbling
    }

    // Delete supplier button
    if (e.target.closest(".delete-supplier-btn")) {
      const supplierId = e.target.closest(".delete-supplier-btn").getAttribute("data-supplier-id")
      openDeleteConfirmationModal(supplierId)
      e.stopPropagation() // Prevent event bubbling
    }

    // Add alternative button
    if (e.target.closest(".add-alternative-btn")) {
      const supplierId = e.target.closest(".add-alternative-btn").getAttribute("data-supplier-id")
      openAddAlternativeModal(supplierId)
      e.stopPropagation() // Prevent event bubbling
    }

    // View alternatives button
    if (e.target.closest(".view-alternatives-btn")) {
      const supplierId = e.target.closest(".view-alternatives-btn").getAttribute("data-supplier-i")
      openViewAlternativesModal(supplierId)
      e.stopPropagation() // Prevent event bubbling
    }

    // Delete fixed alternative button
    if (e.target.closest(".delete-fixed-alternative-btn")) {
      const alternativeId = e.target.closest(".delete-fixed-alternative-btn").getAttribute("data-alternative-id")
      deleteFixedAlternative(alternativeId)
      e.stopPropagation() // Prevent event bubbling
    }

    // Modal add alternative button
    if (e.target.closest("#modal-add-alternative-btn")) {
      const supplierId = e.target.closest("#modal-add-alternative-btn").getAttribute("data-supplier-id")
      
      // Close the Supplier Details modal first
      const supplierDetailsModal = bootstrap.Modal.getInstance(document.getElementById("supplierDetailsModal"))
      if (supplierDetailsModal) {
        supplierDetailsModal.hide()
      }
      
      openAddAlternativeModal(supplierId)
      e.stopPropagation() // Prevent event bubbling
    }
  })

  // Add event listener for alternative supplier type selection
  document.getElementById("alternative-supplier-type").addEventListener("change", function () {
    const type = this.value
    document.getElementById("alternative-physical-fields").style.display = type === "physical" ? "block" : "none"
    document.getElementById("alternative-online-fields").style.display = type === "online" ? "block" : "none"
  })

  // Add event listener for alternative platform selection
  document.getElementById("alternative-platform").addEventListener("change", function () {
    const platform = this.value
    document.getElementById("alternative-other-platform-container").style.display =
      platform === "Other" ? "block" : "none"
  })

  // Add event listener for alternative delivery info selection
  document.getElementById("alternative-delivery-info").addEventListener("change", function () {
    const deliveryInfo = this.value
    document.getElementById("alternative-other-delivery-container").style.display =
      deliveryInfo === "Other" ? "block" : "none"
  })

  // Add event listener for alternative communication mode selection
  document.getElementById("alternative-communication-mode").addEventListener("change", function () {
    const communicationMode = this.value
    document.getElementById("alternative-other-communication-container").style.display =
      communicationMode === "Other" ? "block" : "none"
  })

  // Add event listener for alternative online delivery info selection
  document.getElementById("alternative-online-delivery-info").addEventListener("change", function () {
    const onlineDeliveryInfo = this.value
    document.getElementById("alternative-other-online-delivery-container").style.display =
      onlineDeliveryInfo === "Other" ? "block" : "none"
  })

  // Initialize the edit fixed pineapple modal events when the modal is shown
  const editFixedPineappleModal = document.getElementById("editFixedPineappleModal")
  if (editFixedPineappleModal) {
    editFixedPineappleModal.addEventListener("shown.bs.modal", () => {
      // The external library will handle initialization of enhanced fields
      // We just need to make sure any specific functionality not covered by the library is initialized
      initializeEditFixedPineappleModalEvents()

      // Populate enhanced fields from existing values
      const form = document.getElementById("edit-fixed-supplier-form")
      if (typeof populateEnhancedFields === "function") {
        populateEnhancedFields(form, "edit-fixed-")
      }
    })
  }

  // Initialize edit supplier modal events
  const editSupplierModal = document.getElementById("editSupplierModal")
  if (editSupplierModal) {
    editSupplierModal.addEventListener("hidden.bs.modal", () => {
      // When edit modal is closed, ensure supplier details modal is still visible if it was open
      const supplierDetailsModal = document.getElementById("supplierDetailsModal")
      if (supplierDetailsModal && supplierDetailsModal.classList.contains("show")) {
        // The supplier details modal should still be visible
        // The z-index CSS will handle the proper stacking
      }
    })
  }

  // Add event listener for delete alternative button (regular alternatives)
  document.addEventListener("click", (e) => {
    if (e.target.closest(".delete-alternative-btn")) {
      const btn = e.target.closest(".delete-alternative-btn");
      const alternativeId = btn.getAttribute("data-alternative-id");
      const supplierId = btn.getAttribute("data-supplier-id");
      // Find the alternative data for display
      const supplier = suppliers.find(s => s.id == supplierId);
      const alt = supplier && supplier.alternatives ? supplier.alternatives.find(a => a.id == alternativeId) : null;
      if (alt) {
        // Fill confirmation modal fields
        document.getElementById("delete-regular-alternative-id").value = alt.id;
        document.getElementById("delete-regular-alternative-supplier-id").value = supplierId;
        document.getElementById("delete-regular-alternative-name").textContent = alt.name || "-";
        document.getElementById("delete-regular-alternative-contact").textContent = alt.contactInfo || "-";
        document.getElementById("delete-regular-alternative-website").textContent = alt.link || "-";
        document.getElementById("delete-regular-alternative-parent").textContent = supplier ? supplier.name : "-";
        // Show confirmation modal
        const modal = new bootstrap.Modal(document.getElementById("deleteRegularAlternativeModal"));
        modal.show();
      }
      e.stopPropagation();
    }
  });

  // Confirm delete alternative (regular)
  document.getElementById("confirm-delete-regular-alternative-btn").addEventListener("click", async function() {
    const altId = document.getElementById("delete-regular-alternative-id").value;
    const supplierId = document.getElementById("delete-regular-alternative-supplier-id").value;
    // Show loading modal
    const loadingModal = new bootstrap.Modal(document.getElementById("deleteAlternativeLoadingModal"));
    loadingModal.show();
    const start = Date.now();
    try {
      const response = await fetch(`supplier.php?id=${altId}&type=alternative&fixed=false`, { method: "DELETE" });
      const result = await response.json();
      // Ensure loading modal is visible for at least 2 seconds
      const elapsed = Date.now() - start;
      const minDelay = 2000;
      if (elapsed < minDelay) {
        await new Promise(res => setTimeout(res, minDelay - elapsed));
      }
      loadingModal.hide();
      if (result.status === "success") {
        // Hide confirmation modal
        const confirmModal = bootstrap.Modal.getInstance(document.getElementById("deleteRegularAlternativeModal"));
        if (confirmModal) confirmModal.hide();
        // Remove the alternative from the UI immediately
        const supplier = suppliers.find(s => s.id == supplierId);
        if (supplier && supplier.alternatives) {
          supplier.alternatives = supplier.alternatives.filter(a => a.id != altId);
          updateModalAlternativesDisplay(supplier);
        }
        // Show success modal for 2 seconds
        const successModalEl = document.getElementById("deleteAlternativeSuccessModal");
        const successModal = new bootstrap.Modal(successModalEl);
        successModal.show();
        setTimeout(async () => {
          successModal.hide();
          await loadSuppliers();
        }, 2000);
      } else {
        // Show error modal
        document.getElementById("deleteAlternativeErrorMessage").textContent = result.message || "An error occurred while deleting the alternative supplier.";
        const errorModal = new bootstrap.Modal(document.getElementById("deleteAlternativeErrorModal"));
        errorModal.show();
      }
    } catch (error) {
      loadingModal.hide();
      document.getElementById("deleteAlternativeErrorMessage").textContent = error.message || "An error occurred while deleting the alternative supplier.";
      const errorModal = new bootstrap.Modal(document.getElementById("deleteAlternativeErrorModal"));
      errorModal.show();
    }
  });
}

// Update view toggle buttons
function updateViewToggleButtons() {
  const tableBtn = document.getElementById("table-view-btn")
  const cardBtn = document.getElementById("card-view-btn")

  if (currentViewMode === "table") {
    tableBtn.classList.add("active")
    cardBtn.classList.remove("active")
  } else {
    tableBtn.classList.remove("active")
    cardBtn.classList.add("active")
  }
}

// Show supplier details modal
function showSupplierDetailsModal(supplierId) {
  console.log("Opening supplier details modal for ID:", supplierId)

  const supplier = suppliers.find((s) => s.id == supplierId)
  if (!supplier) {
    console.error("Supplier not found with ID:", supplierId)
    return
  }

  // Make sure the modal exists
  let modal = document.getElementById("supplierDetailsModal")
  if (!modal) {
    console.log("Creating supplier details modal")
    createSupplierDetailsModal()
    modal = document.getElementById("supplierDetailsModal")
  }

  const modalTitle = modal.querySelector(".modal-title")
  const physicalDetails = document.getElementById("physical-supplier-details")
  const onlineDetails = document.getElementById("online-supplier-details")
  const editBtn = modal.querySelector(".edit-supplier-btn")
  const addAlternativeBtn = document.getElementById("modal-add-alternative-btn")

  // Set supplier ID for the edit button
  editBtn.setAttribute("data-supplier-id", supplier.id)
  addAlternativeBtn.setAttribute("data-supplier-id", supplier.id)

  // Set modal title based on supplier type
  modalTitle.textContent = supplier.type === "physical" ? "Physical Supplier Details" : "Online Shop Details"

  // Show/hide appropriate details section
  physicalDetails.style.display = supplier.type === "physical" ? "block" : "none"
  onlineDetails.style.display = supplier.type === "online" ? "block" : "none"

  // Fill in the details based on supplier type
  if (supplier.type === "physical") {
    document.getElementById("physical-name").textContent = supplier.name || "Not specified"
    document.getElementById("physical-address").textContent = supplier.address || "Not specified"
    document.getElementById("physical-hours").textContent = supplier.openingHours || "Not specified"
    document.getElementById("physical-contact").textContent = supplier.contactName || "Not specified"
    document.getElementById("physical-phone").textContent = supplier.contactNumber || "Not specified"
    document.getElementById("physical-email").textContent = supplier.email || "Not specified"
    document.getElementById("physical-delivery").textContent = supplier.deliveryInfo || "Not specified"
    document.getElementById("physical-communication").textContent = supplier.communicationMode || "Not specified"
    document.getElementById("physical-notes").textContent = supplier.notes || "No notes available"

    // Add created/updated timestamps
    document.getElementById("physical-created").textContent = formatDateTime(supplier.created_at) || "Not available"
    document.getElementById("physical-updated").textContent = formatDateTime(supplier.updated_at) || "Not available"
  } else if (supplier.type === "online") {
    document.getElementById("online-name").textContent = supplier.name || "Not specified"
    document.getElementById("online-platform").textContent = supplier.platform || "Not specified"

    const linkElement = document.getElementById("online-link")
    if (supplier.link) {
      linkElement.href = supplier.link
      linkElement.textContent = supplier.link
    } else {
      linkElement.href = "#"
      linkElement.textContent = "Not available"
    }

    document.getElementById("online-delivery").textContent = supplier.deliveryInfo || "Not specified"
    document.getElementById("online-notes").textContent = supplier.notes || "No notes available"

    // Add created/updated timestamps
    document.getElementById("online-created").textContent = formatDateTime(supplier.created_at) || "Not available"
    document.getElementById("online-updated").textContent = formatDateTime(supplier.updated_at) || "Not available"
  }

  // Update alternatives in the modal
  updateModalAlternativesDisplay(supplier)

  // Show the modal using Bootstrap Modal API
  try {
    // Check if modal is already shown
    const existingModal = bootstrap.Modal.getInstance(modal)
    if (existingModal) {
      existingModal.show()
    } else {
      const bsModal = new bootstrap.Modal(modal, {
        backdrop: true,
        keyboard: true,
        focus: true
      })
      bsModal.show()
    }
  } catch (error) {
    console.error("Error showing modal:", error)
    // Fallback method if bootstrap.Modal fails
    modal.classList.add("show")
    modal.style.display = "block"
    modal.setAttribute("aria-hidden", "false")
    document.body.classList.add("modal-open")
    
    // Create backdrop if it doesn't exist
    let backdrop = document.querySelector(".modal-backdrop")
    if (!backdrop) {
      backdrop = document.createElement("div")
      backdrop.className = "modal-backdrop fade show"
      document.body.appendChild(backdrop)
    }
  }
}

// Update modal fixed alternatives display (NOW INCLUDING farm_location)
function updateModalFixedAlternativesDisplay() {
  const container = document.getElementById("modal-fixed-alternatives-container")
  if (!container) return

  if (!fixedPineappleSupplier.alternatives || fixedPineappleSupplier.alternatives.length === 0) {
    container.innerHTML = `<p class="text-muted">No alternative suppliers found.</p>`
  } else {
    const table = document.createElement("table")
    table.className = "table table-striped table-hover"

    // Table header (NOW INCLUDING farm_location)
    const thead = document.createElement("thead")
    thead.innerHTML = `
      <tr>
        <th>Name</th>
        <th>Contact Info</th>
        <th>Farm Location</th>
        <th>Actions</th>
      </tr>
    `

    // Table body
    const tbody = document.createElement("tbody")

    fixedPineappleSupplier.alternatives.forEach((alt) => {
      const tr = document.createElement("tr")
      tr.style.cursor = "pointer"
      tr.classList.add("alternative-row")
      tr.setAttribute("data-alternative-id", alt.id)
      tr.setAttribute("data-is-fixed-pineapple", "true")

      // NOW INCLUDING farm_location column
      tr.innerHTML = `
        <td>${alt.name}</td>
        <td>${alt.contactInfo || "-"}</td>
        <td>${alt.farmLocation || "-"}</td>
        <td>
          <button class="btn btn-sm btn-outline-danger delete-fixed-alternative-btn" data-alternative-id="${alt.id}">
            <i class="bi bi-trash"></i>
          </button>
        </td>
      `

      // Add click event to show alternative details
      tr.addEventListener("click", (e) => {
        // Don't trigger if clicking on the delete button
        if (e.target.closest(".delete-fixed-alternative-btn")) {
          return
        }
        showAlternativeDetailsModal(alt, true)
      })

      tbody.appendChild(tr)
    })

    table.appendChild(thead)
    table.appendChild(tbody)
    container.innerHTML = ""
    container.appendChild(table)
  }
}

// Update alternatives display in the modal
function updateModalAlternativesDisplay(supplier) {
  const container = document.getElementById("modal-alternatives-container")
  if (!container) return

  if (!supplier.alternatives || supplier.alternatives.length === 0) {
    container.innerHTML = `<p class="text-muted">No alternative suppliers found.</p>`
  } else {
    const table = document.createElement("table")
    table.className = "table table-striped table-hover"

    // Table header
    const thead = document.createElement("thead")
    thead.innerHTML = `
      <tr>
        <th>Name</th>
        <th>Contact Info</th>
        <th>Website</th>
        <th>Actions</th>
      </tr>
    `

    // Table body
    const tbody = document.createElement("tbody")

    supplier.alternatives.forEach((alt) => {
      const tr = document.createElement("tr")
      tr.style.cursor = "pointer"
      tr.classList.add("alternative-row")
      tr.setAttribute("data-alternative-id", alt.id)
      tr.setAttribute("data-supplier-id", supplier.id)
      tr.setAttribute("data-is-fixed-pineapple", "false")

      tr.innerHTML = `
        <td>${alt.name}</td>
        <td>${alt.contactInfo || "-"}</td>
        <td>${alt.link ? `<a href="${alt.link}" target="_blank" onclick="event.stopPropagation()">${alt.link}</a>` : "-"}</td>
        <td>
          <button class="btn btn-sm btn-outline-danger delete-alternative-btn" data-supplier-id="${supplier.id}" data-alternative-id="${alt.id}">
            <i class="bi bi-trash"></i>
          </button>
        </td>
      `

      // Add click event to show alternative details
      tr.addEventListener("click", (e) => {
        // Don't trigger if clicking on the delete button or link
        if (e.target.closest(".delete-alternative-btn") || e.target.tagName === "A") {
          return
        }
        showAlternativeDetailsModal(alt, false, supplier)
      })

      tbody.appendChild(tr)
    })

    table.appendChild(thead)
    table.appendChild(tbody)
    container.innerHTML = ""
    container.appendChild(table)
  }
}

// Show alternative details modal (NOW INCLUDING farm_location for pineapple alternatives)
function showAlternativeDetailsModal(alternative, isFixedPineapple, parentSupplier = null) {
  let modal = document.getElementById("alternativeDetailsModal")

  if (!modal) {
    // Create the modal if it doesn't exist
    modal = document.createElement("div")
    modal.className = "modal fade"
    modal.id = "alternativeDetailsModal"
    modal.setAttribute("tabindex", "-1")
    modal.setAttribute("aria-labelledby", "alternativeDetailsModalLabel")
    modal.setAttribute("aria-hidden", "true")

    modal.innerHTML = `
      <div class="modal-dialog modal-xl">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="alternativeDetailsModalLabel">Alternative Supplier Details</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <div class="row">
              <div class="col-md-6" id="alternative-main-details">
                <!-- Main details will be inserted here -->
              </div>
              <div class="col-md-6" id="alternative-additional-details">
                <!-- Additional details will be inserted here -->
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
          </div>
        </div>
      </div>
    `

    document.body.appendChild(modal)
  }

  // Update modal content
  const mainDetails = document.getElementById("alternative-main-details")
  const additionalDetails = document.getElementById("alternative-additional-details")

  // Main details card (NOW INCLUDING farm_location for pineapple alternatives)
  mainDetails.innerHTML = `
    <div class="card mb-3">
      <div class="card-header ${isFixedPineapple ? "bg-warning bg-opacity-10" : "bg-primary bg-opacity-10"}">
        <h6 class="mb-0">Basic Information</h6>
      </div>
      <div class="card-body">
        <p><strong>Name:</strong> ${alternative.name}</p>
        <p><strong>Contact Info:</strong> ${alternative.contactInfo || "Not available"}</p>
        ${isFixedPineapple && alternative.farmLocation ? `<p><strong>Farm Location:</strong> ${alternative.farmLocation}</p>` : ""}
        ${alternative.link ? `<p><strong>Website:</strong> <a href="${alternative.link}" target="_blank">${alternative.link}</a></p>` : ""}
        ${alternative.deliveryInfo ? `<p><strong>Delivery Method:</strong> ${alternative.deliveryInfo}</p>` : ""}
        ${alternative.communicationMode ? `<p><strong>Communication Mode:</strong> ${alternative.communicationMode}</p>` : ""}
      </div>
    </div>
  `

  // Additional details card
  let additionalContent = ""

  if (isFixedPineapple) {
    // For fixed pineapple alternatives, show pineapple-specific details
    additionalContent = `
      <div class="card mb-3">
        <div class="card-header bg-warning bg-opacity-10">
          <h6 class="mb-0">Pineapple Details</h6>
        </div>
        <div class="card-body">
          ${alternative.variety ? `<p><strong>Variety:</strong> ${alternative.variety}</p>` : ""}
          ${alternative.harvestSeason ? `<p><strong>Harvest Season:</strong> ${alternative.harvestSeason}</p>` : ""}
          ${alternative.plantingCycle ? `<p><strong>Planting Cycle:</strong> ${alternative.plantingCycle}</p>` : ""}
          ${alternative.shelfLife ? `<p><strong>Shelf Life:</strong> ${alternative.shelfLife}</p>` : ""}
          ${alternative.notes ? `<p><strong>Notes:</strong> ${alternative.notes}</p>` : ""}
        </div>
      </div>
    `
  } else {
    // For regular alternatives, show supplier-specific details
    additionalContent = `
      <div class="card mb-3">
        <div class="card-header bg-primary bg-opacity-10">
          <h6 class="mb-0">Supplier Details</h6>
        </div>
        <div class="card-body">
          ${alternative.address ? `<p><strong>Address:</strong> ${alternative.address}</p>` : ""}
          ${alternative.contactName ? `<p><strong>Contact Name:</strong> ${alternative.contactName}</p>` : ""}
          ${alternative.contactNumber ? `<p><strong>Contact Number:</strong> ${alternative.contactNumber}</p>` : ""}
          ${alternative.email ? `<p><strong>Email:</strong> ${alternative.email}</p>` : ""}
          ${alternative.openingHours ? `<p><strong>Opening Hours:</strong> ${alternative.openingHours}</p>` : ""}
          ${alternative.notes ? `<p><strong>Notes:</strong> ${alternative.notes}</p>` : ""}
        </div>
      </div>
    `

    if (parentSupplier) {
      additionalContent += `
        <div class="card mb-3">
          <div class="card-header bg-secondary bg-opacity-10">
            <h6 class="mb-0">Parent Supplier</h6>
          </div>
          <div class="card-body">
            <p><strong>Name:</strong> ${parentSupplier.name}</p>
            <p><strong>Type:</strong> ${parentSupplier.type === "physical" ? "Physical/Market" : "Online Shop"}</p>
          </div>
        </div>
      `
    }
  }

  // Record information card
  additionalContent += `
    <div class="card">
      <div class="card-header bg-info bg-opacity-10">
        <h6 class="mb-0">Record Information</h6>
      </div>
      <div class="card-body">
        <p><strong>Created:</strong> ${formatDateTime(alternative.created_at) || "Not available"}</p>
        <p><strong>Last Updated:</strong> ${formatDateTime(alternative.updated_at) || "Not available"}</p>
      </div>
    </div>
  `

  additionalDetails.innerHTML = additionalContent

  // Show the modal
  const bsModal = new bootstrap.Modal(modal)
  bsModal.show()
}

// Open edit supplier modal
function openEditSupplierModal(supplierId) {
  const supplier = suppliers.find((s) => s.id == supplierId)
  if (!supplier) {
    console.error("Supplier not found with ID:", supplierId)
    return
  }

  // Set the supplier ID and type in hidden fields
  document.getElementById("edit-supplier-id").value = supplier.id
  document.getElementById("edit-supplier-type").value = supplier.type

  // Set the supplier type display (readonly)
  const typeDisplay = supplier.type === "physical" ? "Physical/Market Supplier" : "Online Shop Supplier"
  document.getElementById("edit-supplier-type-display").value = typeDisplay

  // Set the supplier name
  document.getElementById("edit-supplier-name").value = supplier.name

  // Show/hide appropriate fields based on supplier type
  const physicalFields = document.getElementById("edit-physical-fields")
  const onlineFields = document.getElementById("edit-online-fields")

  if (supplier.type === "physical") {
    physicalFields.style.display = "block"
    onlineFields.style.display = "none"

    // Fill physical supplier fields
    document.getElementById("edit-address").value = supplier.address || ""
    document.getElementById("edit-contact-name").value = supplier.contactName || ""
    document.getElementById("edit-contact-number").value = supplier.contactNumber || ""
    document.getElementById("edit-email").value = supplier.email || ""
    // Parse opening hours string into start/end for manual time pickers
    if (supplier.openingHours && supplier.openingHours.includes("-")) {
      const [start, end] = supplier.openingHours.split("-").map(s => s.trim());
      document.getElementById("edit-opening-hours-start").value = start || "";
      document.getElementById("edit-opening-hours-end").value = end || "";
    } else {
      document.getElementById("edit-opening-hours-start").value = "";
      document.getElementById("edit-opening-hours-end").value = "";
    }

    // Handle delivery info
    if (["3rd Party", "Business Driver", "Pick Up"].includes(supplier.deliveryInfo)) {
      document.getElementById("edit-delivery-info").value = supplier.deliveryInfo
      document.getElementById("edit-other-delivery-container").style.display = "none"
    } else if (supplier.deliveryInfo) {
      document.getElementById("edit-delivery-info").value = "Other"
      document.getElementById("edit-other-delivery-container").style.display = "block"
      document.getElementById("edit-other-delivery").value = supplier.deliveryInfo
    } else {
      document.getElementById("edit-delivery-info").value = ""
      document.getElementById("edit-other-delivery-container").style.display = "none"
    }

    // Handle communication mode
    if (["Text", "Call", "WhatsApp", "Telegram", "Viber"].includes(supplier.communicationMode)) {
      document.getElementById("edit-communication-mode").value = supplier.communicationMode
      document.getElementById("edit-other-communication-container").style.display = "none"
    } else if (supplier.communicationMode) {
      document.getElementById("edit-communication-mode").value = "Other"
      document.getElementById("edit-other-communication-container").style.display = "block"
      document.getElementById("edit-other-communication").value = supplier.communicationMode
    } else {
      document.getElementById("edit-communication-mode").value = ""
      document.getElementById("edit-other-communication-container").style.display = "none"
    }
  } else if (supplier.type === "online") {
    physicalFields.style.display = "none"
    onlineFields.style.display = "block"

    // Fill online supplier fields
    document.getElementById("edit-link").value = supplier.link || ""

    // Handle platform
    if (["Shopee", "Lazada", "Tiktok Shop"].includes(supplier.platform)) {
      document.getElementById("edit-platform").value = supplier.platform
      document.getElementById("edit-other-platform-container").style.display = "none"
    } else if (supplier.platform) {
      document.getElementById("edit-platform").value = "Other"
      document.getElementById("edit-other-platform-container").style.display = "block"
      document.getElementById("edit-other-platform").value = supplier.platform
    } else {
      document.getElementById("edit-platform").value = ""
      document.getElementById("edit-other-platform-container").style.display = "none"
    }

    // Handle online delivery info
    if (["3rd Party", "Business Driver", "Pick Up"].includes(supplier.deliveryInfo)) {
      document.getElementById("edit-online-delivery-info").value = supplier.deliveryInfo
      document.getElementById("edit-other-online-delivery-container").style.display = "none"
    } else if (supplier.deliveryInfo) {
      document.getElementById("edit-online-delivery-info").value = "Other"
      document.getElementById("edit-other-online-delivery-container").style.display = "block"
      document.getElementById("edit-other-online-delivery").value = supplier.deliveryInfo
    } else {
      document.getElementById("edit-online-delivery-info").value = ""
      document.getElementById("edit-other-online-delivery-container").style.display = "none"
    }
  }

  // Set notes
  document.getElementById("edit-notes").value = supplier.notes || ""

  // Show the modal - same approach as pineapple edit modal
  try {
    const editModal = document.getElementById("editSupplierModal")
    const modal = new bootstrap.Modal(editModal)
    modal.show()
    console.log("Edit supplier modal shown successfully")
  } catch (error) {
    console.error("Error showing edit supplier modal:", error)
  }
}

// Open delete confirmation modal
function openDeleteConfirmationModal(supplierId) {
  document.getElementById("delete-supplier-id").value = supplierId
  const modal = new bootstrap.Modal(document.getElementById("deleteSupplierModal"))
  modal.show()
}

// Open add alternative modal
function openAddAlternativeModal(supplierId) {
  console.log("Opening add alternative modal for supplier ID:", supplierId)

  // Set the parent supplier ID
  document.getElementById("parent-supplier-id").value = supplierId

  // Check if this is for the fixed pineapple supplier
  const isFixedPineapple = supplierId === "fixed-pineapple"

  // Show/hide appropriate fields based on supplier type
  const supplierTypeContainer = document.getElementById("alternative-supplier-type-container")
  const supplierNameContainer = document.getElementById("alternative-supplier-name-container")
  const pineappleFields = document.getElementById("alternative-pineapple-fields")
  const physicalFields = document.getElementById("alternative-physical-fields")
  const onlineFields = document.getElementById("alternative-online-fields")

  if (isFixedPineapple) {
    // For fixed pineapple supplier, show pineapple-specific fields
    supplierTypeContainer.style.display = "none"
    supplierNameContainer.style.display = "none"
    pineappleFields.style.display = "block"
    physicalFields.style.display = "none"
    onlineFields.style.display = "none"

    // Update modal title
    document.getElementById("addAlternativeModalLabel").textContent = "Add Pineapple Alternative Supplier"
  } else {
    // For regular suppliers, show supplier type selection
    supplierTypeContainer.style.display = "block"
    supplierNameContainer.style.display = "block"
    pineappleFields.style.display = "none"
    physicalFields.style.display = "none"
    onlineFields.style.display = "none"

    // Update modal title
    document.getElementById("addAlternativeModalLabel").textContent = "Add Alternative Supplier"

    // Reset supplier type selection
    document.getElementById("alternative-supplier-type").value = ""
  }

  // Show the modal
  const modal = new bootstrap.Modal(document.getElementById("addAlternativeModal"))
  modal.show()
}

// Save supplier
async function saveSupplier() {
  const form = document.getElementById("add-supplier-form")
  const formData = new FormData(form)

  // Get form values
  const supplierType = document.getElementById("supplier-type").value
  const supplierName = document.getElementById("supplier-name").value

  // Validate required fields
  if (!supplierType || !supplierName) {
    alert("Please fill in all required fields.")
    return
  }

  // Create supplier data object
  const supplierData = {
    name: supplierName,
    type: supplierType,
  }

  // Add type-specific fields
  if (supplierType === "physical") {
    supplierData.address = document.getElementById("address").value;
    // Set contact name and number separately to match database columns
    supplierData.contactName = document.getElementById("contact-name")?.value || "";
    
    // Get the contact number from the input field and country code
    const contactNumberInput = document.querySelector("#physical-fields .phone-input");
    const countryCodeBtn = document.querySelector("#physical-fields .country-code-btn");
    const contactNumber = contactNumberInput?.value || "";
    const countryCode = countryCodeBtn?.textContent || "+63";
    supplierData.contactNumber = contactNumber ? `${countryCode}${contactNumber}` : "";
    
    supplierData.email = document.getElementById("email")?.value || "";
    // Compose opening hours from manual time pickers
    const start = document.getElementById("opening-hours-start").value;
    const end = document.getElementById("opening-hours-end").value;
    supplierData.openingHours = start && end ? `${start} - ${end}` : "";

    // Handle delivery info
    let deliveryInfo = document.getElementById("delivery-info").value;
    if (deliveryInfo === "Other") {
      deliveryInfo = document.getElementById("other-delivery").value;
    }
    supplierData.deliveryInfo = deliveryInfo;

    // Handle communication mode
    let communicationMode = document.getElementById("communication-mode").value;
    if (communicationMode === "Other") {
      communicationMode = document.getElementById("other-communication").value;
    }
    supplierData.communicationMode = communicationMode;

    supplierData.notes = document.getElementById("notes").value;
  } else if (supplierType === "online") {
    supplierData.link = document.getElementById("link").value

    // Handle platform
    let platform = document.getElementById("platform").value
    if (platform === "Other") {
      platform = document.getElementById("other-platform").value
    }
    supplierData.platform = platform

    // Handle online delivery info
    let onlineDeliveryInfo = document.getElementById("online-delivery-info").value
    if (onlineDeliveryInfo === "Other") {
      onlineDeliveryInfo = document.getElementById("other-online-delivery").value
    }
    supplierData.deliveryInfo = onlineDeliveryInfo

    supplierData.notes = document.getElementById("online-notes").value
  }

  try {
    // Use modal handler for loading and success states
    await modalHandler.addSupplier(async () => {
      const response = await fetch("supplier.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(supplierData),
      })

      const result = await response.json()

      if (result.status === "success") {
        // Close the modal
        const modal = bootstrap.Modal.getInstance(document.getElementById("addSupplierModal"))
        modal.hide()

        // Reload suppliers
        await loadSuppliers()
        
        // Reset form
        form.reset()
        
        return result
      } else {
        throw new Error(result.message || "Failed to add supplier")
      }
    })
  } catch (error) {
    console.error("Error adding supplier:", error)
    // Error modal is handled by the modal handler
  }
}

// Update supplier
async function updateSupplier() {
  const supplierId = document.getElementById("edit-supplier-id").value
  const supplierType = document.getElementById("edit-supplier-type").value
  const supplierName = document.getElementById("edit-supplier-name").value

  // Validate required fields
  if (!supplierName) {
    alert("Supplier name is required.")
    return
  }

  // Create supplier data object
  const supplierData = {
    id: supplierId,
    name: supplierName,
    type: supplierType,
  }

  // Add type-specific fields
  if (supplierType === "physical") {
    supplierData.address = document.getElementById("edit-address").value;
    supplierData.contactName = document.getElementById("edit-contact-name").value;
    // Get the contact number from input field and country code
    const contactNumberInput = document.querySelector("#edit-physical-fields .phone-input");
    const countryCodeBtn = document.querySelector("#edit-physical-fields .country-code-btn");
    const contactNumber = contactNumberInput?.value || "";
    const countryCode = countryCodeBtn?.textContent || "+63";
    supplierData.contactNumber = contactNumber ? `${countryCode}${contactNumber}` : "";
    supplierData.email = document.getElementById("edit-email").value;
    // Compose opening hours from manual time pickers
    const start = document.getElementById("edit-opening-hours-start").value;
    const end = document.getElementById("edit-opening-hours-end").value;
    supplierData.openingHours = start && end ? `${start} - ${end}` : "";

    // Handle delivery info
    let deliveryInfo = document.getElementById("edit-delivery-info").value;
    if (deliveryInfo === "Other") {
      deliveryInfo = document.getElementById("edit-other-delivery").value;
    }
    supplierData.deliveryInfo = deliveryInfo;

    // Handle communication mode
    let communicationMode = document.getElementById("edit-communication-mode").value;
    if (communicationMode === "Other") {
      communicationMode = document.getElementById("edit-other-communication").value;
    }
    supplierData.communicationMode = communicationMode;
  } else if (supplierType === "online") {
    supplierData.link = document.getElementById("edit-link").value

    // Handle platform
    let platform = document.getElementById("edit-platform").value
    if (platform === "Other") {
      platform = document.getElementById("edit-other-platform").value
    }
    supplierData.platform = platform

    // Handle online delivery info
    let onlineDeliveryInfo = document.getElementById("edit-online-delivery-info").value
    if (onlineDeliveryInfo === "Other") {
      onlineDeliveryInfo = document.getElementById("edit-other-online-delivery").value
    }
    supplierData.deliveryInfo = onlineDeliveryInfo
  }

  supplierData.notes = document.getElementById("edit-notes").value

  try {
    // Use modal handler for loading and success states
    await modalHandler.editSupplier(async () => {
      const response = await fetch("supplier.php", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(supplierData),
      })

      const result = await response.json()

      if (result.status === "success") {
        // Close the modal
        const modal = bootstrap.Modal.getInstance(document.getElementById("editSupplierModal"))
        modal.hide()

        // Reload suppliers
        await loadSuppliers()
        
        return result
      } else {
        throw new Error(result.message || "Failed to update supplier")
      }
    })
  } catch (error) {
    console.error("Error updating supplier:", error)
    // Error modal is handled by the modal handler
  }
}

// Delete supplier
async function deleteSupplier() {
  const supplierId = document.getElementById("delete-supplier-id").value

  try {
    // Use modal handler for loading and success states
    await modalHandler.deleteSupplier(async () => {
      const response = await fetch(`supplier.php?id=${supplierId}`, {
        method: "DELETE",
      })

      const result = await response.json()

      if (result.status === "success") {
        // Close the modal
        const modal = bootstrap.Modal.getInstance(document.getElementById("deleteSupplierModal"))
        modal.hide()

        // Reload suppliers
        await loadSuppliers()
        
        return result
      } else {
        throw new Error(result.message || "Failed to delete supplier")
      }
    })
  } catch (error) {
    console.error("Error deleting supplier:", error)
    // Error modal is handled by the modal handler
  }
}

// Save alternative supplier (NOW INCLUDING farm_location for pineapple alternatives)
async function saveAlternative() {
  const parentSupplierId = document.getElementById("parent-supplier-id").value
  const isFixedPineapple = parentSupplierId === "fixed-pineapple"

  let alternativeData = {
    is_alternative: true,
    isFixedPineapple: isFixedPineapple,
  }

  if (isFixedPineapple) {
    // For fixed pineapple alternatives
    const name = document.getElementById("alternative-name").value

    if (!name) {
      alert("Supplier name is required.")
      return
    }

    // Get contact info from enhanced input if available, otherwise use the regular input
    let contactInfo = ""
    const contactInfoField = document.querySelector("#addAlternativeModal .full-contact-info")
    if (contactInfoField && contactInfoField.value) {
      contactInfo = contactInfoField.value
    } else {
      contactInfo = document.getElementById("contact-info-field").value
    }

    // Get farm location from location picker (RESTORED)
    let farmLocation = ""
    const farmLocationField = document.querySelector("#addAlternativeModal .full-location")
    if (farmLocationField && farmLocationField.value) {
      farmLocation = farmLocationField.value
    } else {
      farmLocation = document.getElementById("farm-location-field").value
    }

    // Handle delivery info
    let deliveryInfo = document.getElementById("alternative-delivery").value
    if (deliveryInfo === "Other") {
      deliveryInfo = document.getElementById("alternative-other-delivery").value
    }

    // Handle communication mode
    let communicationMode = document.getElementById("alternative-communication").value
    if (communicationMode === "Other") {
      communicationMode = document.getElementById("alternative-other-communication").value
    }

    // For pineapple alternatives, match database columns
    alternativeData = {
      ...alternativeData,
      name,
      contact_name: document.getElementById("alternative-contact-name").value,
      contact_number: document.getElementById("alternative-contact-number").value,
      farm_location: farmLocation, // database column name is farm_location
      delivery_info: deliveryInfo, // match database column name
      communication_mode: communicationMode, // match database column name
      notes: document.getElementById("alternative-notes").value,
      // Additional pineapple-specific fields
      variety: document.getElementById("variety-field").value,
      harvest_season: document.getElementById("harvest-season-field").value,
      planting_cycle: document.getElementById("planting-cycle-field").value,
      shelf_life: document.getElementById("shelf-life-field").value,
      is_fixed_pineapple: true
    }
  } else {
    // For regular supplier alternatives
    const supplierType = document.getElementById("alternative-supplier-type").value
    const supplierName = document.getElementById("alternative-supplier-name").value

    if (!supplierType || !supplierName) {
      alert("Please fill in all required fields.")
      return
    }

    alternativeData = {
      ...alternativeData,
      supplierId: parentSupplierId,
      name: supplierName,
    }

    // Add type-specific fields
    if (supplierType === "physical") {
      alternativeData.address = document.getElementById("alternative-address").value;
      // Set contact fields to match database columns
      alternativeData.contactName = document.getElementById("alternative-contact-name").value;
      // Compose contact number with country code
      const contactNumber = document.getElementById("alternative-contact-number").value;
      const countryCode = document.querySelector("#alternative-physical-fields .country-code-btn").textContent;
      alternativeData.contactNumber = contactNumber ? `${countryCode}${contactNumber}` : "";
      alternativeData.email = document.getElementById("alternative-email").value;
      // Compose opening hours to match database format
      const start = document.getElementById("alternative-opening-hours-start").value;
      const end = document.getElementById("alternative-opening-hours-end").value;
      alternativeData.opening_hours = start && end ? `${start} - ${end}` : "";

      // Handle delivery info to match database column
      let deliveryInfo = document.getElementById("alternative-delivery-info").value;
      if (deliveryInfo === "Other") {
        deliveryInfo = document.getElementById("alternative-other-delivery").value;
      }
      alternativeData.delivery_info = deliveryInfo;

      // Handle communication mode to match database column
      let communicationMode = document.getElementById("alternative-communication-mode").value;
      if (communicationMode === "Other") {
        communicationMode = document.getElementById("alternative-other-communication").value;
      }
      alternativeData.communication_mode = communicationMode;

      alternativeData.notes = document.getElementById("alternative-physical-notes").value;
      // Set supplier_id for the relationship
      alternativeData.supplier_id = parentSupplierId;
    } else if (supplierType === "online") {
      alternativeData.link = document.getElementById("alternative-link").value

      // Handle platform
      let platform = document.getElementById("alternative-platform").value
      if (platform === "Other") {
        platform = document.getElementById("alternative-other-platform").value
      }
      alternativeData.platform = platform

      // Handle online delivery info
      let onlineDeliveryInfo = document.getElementById("alternative-online-delivery-info").value
      if (onlineDeliveryInfo === "Other") {
        onlineDeliveryInfo = document.getElementById("alternative-other-online-delivery").value
      }
      alternativeData.deliveryInfo = onlineDeliveryInfo

      alternativeData.notes = document.getElementById("alternative-online-notes").value
      alternativeData.contactInfo = alternativeData.platform
    }
  }

  try {
    // Use modal handler for loading and success states
    await modalHandler.addAlternative(async () => {
      const response = await fetch("supplier.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(alternativeData),
      })

      const result = await response.json()

      if (result.status === "success") {
        // Close the modal
        const modal = bootstrap.Modal.getInstance(document.getElementById("addAlternativeModal"))
        modal.hide()

        // Reload data
        if (isFixedPineapple) {
          await loadFixedPineappleSupplier()
        } else {
          await loadSuppliers()
        }
        
        return result
      } else {
        throw new Error(result.message || "Failed to add alternative supplier")
      }
    })
  } catch (error) {
    console.error("Error adding alternative supplier:", error)
    // Error modal is handled by the modal handler
  }
}

// Delete fixed alternative
async function deleteFixedAlternative(alternativeId) {
  // Find the alternative for display
  const alt = fixedPineappleSupplier && fixedPineappleSupplier.alternatives ? fixedPineappleSupplier.alternatives.find(a => a.id == alternativeId) : null;
  if (!alt) return;
  // Fill confirmation modal fields (reuse regular alternative modal)
  document.getElementById("delete-regular-alternative-id").value = alt.id;
  document.getElementById("delete-regular-alternative-supplier-id").value = "fixed-pineapple";
  document.getElementById("delete-regular-alternative-name").textContent = alt.name || "-";
  document.getElementById("delete-regular-alternative-contact").textContent = alt.contactInfo || "-";
  document.getElementById("delete-regular-alternative-website").textContent = alt.link || "-";
  document.getElementById("delete-regular-alternative-parent").textContent = fixedPineappleSupplier.name || "-";
  // Show confirmation modal
  const confirmModal = new bootstrap.Modal(document.getElementById("deleteRegularAlternativeModal"));
  confirmModal.show();

  // Handler for confirm button (one-time)
  const confirmBtn = document.getElementById("confirm-delete-regular-alternative-btn");
  const handler = async function() {
    confirmBtn.removeEventListener("click", handler);
    confirmModal.hide();
    // Show loading modal
    const loadingModal = new bootstrap.Modal(document.getElementById("deleteAlternativeLoadingModal"));
    loadingModal.show();
    const start = Date.now();
    try {
      const response = await fetch(`supplier.php?id=${alternativeId}&type=alternative&fixed=true`, { method: "DELETE" });
      const result = await response.json();
      // Ensure loading modal is visible for at least 2 seconds
      const elapsed = Date.now() - start;
      const minDelay = 2000;
      if (elapsed < minDelay) {
        await new Promise(res => setTimeout(res, minDelay - elapsed));
      }
      loadingModal.hide();
      if (result.status === "success") {
        // Remove the alternative from the UI immediately
        if (fixedPineappleSupplier && fixedPineappleSupplier.alternatives) {
          fixedPineappleSupplier.alternatives = fixedPineappleSupplier.alternatives.filter(a => a.id != alternativeId);
          updateModalFixedAlternativesDisplay();
        }
        // Show success modal for 2 seconds
        const successModalEl = document.getElementById("deleteAlternativeSuccessModal");
        const successModal = new bootstrap.Modal(successModalEl);
        successModal.show();
        setTimeout(async () => {
          successModal.hide();
          await loadFixedPineappleSupplier();
        }, 2000);
      } else {
        document.getElementById("deleteAlternativeErrorMessage").textContent = result.message || "Failed to delete alternative supplier";
        const errorModal = new bootstrap.Modal(document.getElementById("deleteAlternativeErrorModal"));
        errorModal.show();
      }
    } catch (error) {
      loadingModal.hide();
      document.getElementById("deleteAlternativeErrorMessage").textContent = error.message || "Error deleting alternative supplier.";
      const errorModal = new bootstrap.Modal(document.getElementById("deleteAlternativeErrorModal"));
      errorModal.show();
    }
  };
  confirmBtn.addEventListener("click", handler);
}

// Load suppliers from database
async function loadSuppliers() {
  try {
    const response = await fetch("supplier.php?type=all")
    const result = await response.json()

    if (result.status === "success") {
      suppliers = result.data || []
      displaySuppliers()
    } else {
      console.error("Failed to load suppliers:", result.message)
      suppliers = []
      displaySuppliers()
    }
  } catch (error) {
    console.error("Error loading suppliers:", error)
    suppliers = []
    displaySuppliers()
  }
}

// Load fixed pineapple supplier from database
async function loadFixedPineappleSupplier() {
  try {
    const response = await fetch("supplier.php?id=fixed-pineapple")
    const result = await response.json()

    if (result.status === "success" && result.data) {
      fixedPineappleSupplier = result.data
      updateFixedPineappleSupplierSection()
    } else {
      console.error("Failed to load fixed pineapple supplier:", result.message)
      // Keep the default data that was set during initialization
    }
  } catch (error) {
    console.error("Error loading fixed pineapple supplier:", error)
    // Keep the default data that was set during initialization
  }
}

// Utility function to format date and time
function formatDateTime(dateString) {
  if (!dateString) return null

  try {
    const date = new Date(dateString)
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  } catch (error) {
    console.error("Error formatting date:", error)
    return dateString
  }
}

// Show success modal
function showSuccessModal(message) {
  document.getElementById("success-message").textContent = message
  const modal = new bootstrap.Modal(document.getElementById("successModal"))
  modal.show()
}

// Show error modal
function showErrorModal(message) {
  document.getElementById("error-message").textContent = message
  const modal = new bootstrap.Modal(document.getElementById("errorModal"))
  modal.show()
}

// Show loading modal (if you have one)
function showLoadingModal(message) {
  // Implementation depends on your loading modal structure
  console.log("Loading:", message)
}

// Hide loading modal (if you have one)
function hideLoadingModal() {
  // Implementation depends on your loading modal structure
  console.log("Loading complete")
}

// Initialize edit fixed pineapple modal events
function initializeEditFixedPineappleModalEvents() {
  // This function can be used to initialize any specific events for the edit fixed pineapple modal
  // that are not covered by the external library
  console.log("Initializing edit fixed pineapple modal events")
}

// Placeholder function for openViewAlternativesModal
function openViewAlternativesModal(supplierId) {
  console.log("Opening view alternatives modal for supplier ID:", supplierId)
  // Add your implementation here
}

// Placeholder function for populateEnhancedFields
function populateEnhancedFields(form, prefix) {
  console.log("Populating enhanced fields for form:", form, "with prefix:", prefix)
  // Add your implementation here
}

// Enhanced Suppliers Management System with Fixed Location Handling

// Extend the existing suppliers.js functionality
document.addEventListener("DOMContentLoaded", () => {
  // Initialize enhanced location handling
  initializeEnhancedLocationHandling()
})

function initializeEnhancedLocationHandling() {
  // Override the existing openAddAlternativeModal function to ensure proper initialization
  const originalOpenAddAlternativeModal = window.openAddAlternativeModal

  window.openAddAlternativeModal = (supplierId) => {
    console.log("Enhanced: Opening add alternative modal for supplier ID:", supplierId)

    // Call the original function
    if (originalOpenAddAlternativeModal) {
      originalOpenAddAlternativeModal(supplierId)
    }

    // Add enhanced initialization after modal is shown
    const modal = document.getElementById("addAlternativeModal")
    if (modal) {
      modal.addEventListener(
        "shown.bs.modal",
        () => {
          initializeModalLocationDropdowns()
        },
        { once: true },
      )
    }
  }

  // Enhanced save alternative function
  const originalSaveAlternative = window.saveAlternative

  window.saveAlternative = async () => {
    console.log("Enhanced: Saving alternative with location data")

    const parentSupplierId = document.getElementById("parent-supplier-id").value
    const isFixedPineapple = parentSupplierId === "fixed-pineapple"

    let alternativeData = {
      is_alternative: true,
      isFixedPineapple: isFixedPineapple,
    }

    if (isFixedPineapple) {
      // For fixed pineapple alternatives
      const name = document.getElementById("alternative-name").value

      if (!name) {
        alert("Supplier name is required.")
        return
      }

      // Get contact info from enhanced input
      let contactInfo = ""
      const contactInfoField = document.querySelector("#addAlternativeModal .full-contact-info")
      if (contactInfoField && contactInfoField.value) {
        contactInfo = contactInfoField.value
      }

      // Get farm location from location picker - ENHANCED
      let farmLocation = ""
      const farmLocationField = document.querySelector("#addAlternativeModal .full-location")
      if (farmLocationField && farmLocationField.value) {
        farmLocation = farmLocationField.value
      } else {
        // Fallback: construct from individual dropdowns
        farmLocation = constructLocationFromDropdowns()
      }

      console.log("Farm location being sent:", farmLocation)

      // Handle delivery info
      let deliveryInfo = document.getElementById("alternative-delivery").value
      if (deliveryInfo === "Other") {
        deliveryInfo = document.getElementById("alternative-other-delivery").value
      }

      // Handle communication mode
      let communicationMode = document.getElementById("alternative-communication").value
      if (communicationMode === "Other") {
        communicationMode = document.getElementById("alternative-other-communication").value
      }

      // Get enhanced field values
      const harvestSeason = getEnhancedFieldValue("harvest-season")
      const plantingCycle = getEnhancedFieldValue("planting-cycle")
      const variety = getEnhancedFieldValue("variety")
      const shelfLife = getEnhancedFieldValue("shelf-life")

      alternativeData = {
        ...alternativeData,
        name,
        contactInfo,
        farmLocation, // This is the key field that was missing
        deliveryInfo,
        communicationMode,
        harvestSeason,
        plantingCycle,
        variety,
        shelfLife,
        notes: document.getElementById("alternative-notes").value,
      }
    } else {
      // For regular supplier alternatives - use original logic
      if (originalSaveAlternative) {
        return originalSaveAlternative()
      }
    }

    try {
      // Use modal handler for loading and success states
      await modalHandler.addAlternative(async () => {
        console.log("Sending enhanced alternative data:", alternativeData)

        const response = await fetch("supplier.php", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(alternativeData),
        })

        const responseText = await response.text()
        console.log("Server response:", responseText)

        let result
        try {
          result = JSON.parse(responseText)
        } catch (e) {
          throw new Error(`Invalid JSON response: ${responseText}`)
        }

        if (result.status === "success") {
          // Close the modal
          const modal = bootstrap.Modal.getInstance(document.getElementById("addAlternativeModal"))
          modal.hide()

          // Reload data
          if (isFixedPineapple) {
            await loadFixedPineappleSupplier()
          } else {
            await loadSuppliers()
          }
          
          return result
        } else {
          throw new Error(result.message || "Failed to add alternative supplier")
        }
      })
    } catch (error) {
      console.error("Error adding alternative supplier:", error)
      // Error modal is handled by the modal handler
    }
  }
}

function initializeModalLocationDropdowns() {
  console.log("Initializing modal location dropdowns")

  // Find location dropdowns in the modal
  const modal = document.getElementById("addAlternativeModal")
  if (!modal) return

  const regionSelect = modal.querySelector("#location-region")
  const provinceSelect = modal.querySelector("#location-province")
  const citySelect = modal.querySelector("#location-city")
  const barangaySelect = modal.querySelector("#location-barangay")
  const hiddenLocationField = modal.querySelector("#farm-location-field")

  if (!regionSelect || !provinceSelect || !citySelect || !barangaySelect) {
    console.log("Location dropdowns not found in modal")
    return
  }

  // Initialize dropdowns
  populateRegions(regionSelect)

  // Set up event listeners
  setupLocationEventListeners(regionSelect, provinceSelect, citySelect, barangaySelect, hiddenLocationField)

  console.log("Modal location dropdowns initialized successfully")
}

function constructLocationFromDropdowns() {
  const modal = document.getElementById("addAlternativeModal")
  if (!modal) return ""

  const region = modal.querySelector("#location-region")?.value || ""
  const province = modal.querySelector("#location-province")?.value || ""
  const city = modal.querySelector("#location-city")?.value || ""
  const barangay = modal.querySelector("#location-barangay")?.value || ""

  // Build full address
  let fullAddress = ""
  if (barangay) fullAddress += barangay
  if (city) fullAddress += (fullAddress ? ", " : "") + city
  if (province) fullAddress += (fullAddress ? ", " : "") + province
  if (region) fullAddress += (fullAddress ? ", " : "") + region

  console.log("Constructed location:", fullAddress)
  return fullAddress
}

function getEnhancedFieldValue(fieldType) {
  const modal = document.getElementById("addAlternativeModal")
  if (!modal) return ""

  const hiddenField = modal.querySelector(`.full-${fieldType}`)
  if (hiddenField && hiddenField.value) {
    return hiddenField.value
  }

  // Fallback to direct field access
  const directField = modal.querySelector(`#${fieldType}-field`)
  return directField ? directField.value : ""
}

// Enhanced location handling functions
function populateRegions(regionSelect) {
  if (!regionSelect) return

  // Clear existing options except the first one
  regionSelect.innerHTML = '<option value="">Select Region</option>'

  // Use the philippineLocations from location-handler.js
  if (window.LocationHandler && window.LocationHandler.philippineLocations) {
    const locations = window.LocationHandler.philippineLocations
    Object.keys(locations).forEach((region) => {
      const option = document.createElement("option")
      option.value = region
      option.textContent = region
      regionSelect.appendChild(option)
    })
  }

  regionSelect.disabled = false
}

function setupLocationEventListeners(regionSelect, provinceSelect, citySelect, barangaySelect, hiddenLocationField) {
  if (!regionSelect || !provinceSelect || !citySelect || !barangaySelect) return

  // Region change event
  regionSelect.addEventListener("change", function () {
    const selectedRegion = this.value

    // Reset dependent dropdowns
    resetDropdown(provinceSelect, "Select Province")
    resetDropdown(citySelect, "Select City/Municipality")
    resetDropdown(barangaySelect, "Select Barangay")

    if (selectedRegion && window.LocationHandler && window.LocationHandler.philippineLocations[selectedRegion]) {
      // Enable and populate province dropdown
      provinceSelect.disabled = false
      populateProvinces(provinceSelect, selectedRegion)
    } else {
      provinceSelect.disabled = true
      citySelect.disabled = true
      barangaySelect.disabled = true
    }

    updateHiddenLocationField(regionSelect, provinceSelect, citySelect, barangaySelect, hiddenLocationField)
  })

  // Province change event
  provinceSelect.addEventListener("change", function () {
    const selectedRegion = regionSelect.value
    const selectedProvince = this.value

    // Reset dependent dropdowns
    resetDropdown(citySelect, "Select City/Municipality")
    resetDropdown(barangaySelect, "Select Barangay")

    if (
      selectedRegion &&
      selectedProvince &&
      window.LocationHandler &&
      window.LocationHandler.philippineLocations[selectedRegion][selectedProvince]
    ) {
      // Enable and populate city dropdown
      citySelect.disabled = false
      populateCities(citySelect, selectedRegion, selectedProvince)
    } else {
      citySelect.disabled = true
      barangaySelect.disabled = true
    }

    updateHiddenLocationField(regionSelect, provinceSelect, citySelect, barangaySelect, hiddenLocationField)
  })

  // City change event
  citySelect.addEventListener("change", function () {
    const selectedRegion = regionSelect.value
    const selectedProvince = provinceSelect.value
    const selectedCity = this.value

    // Reset barangay dropdown
    resetDropdown(barangaySelect, "Select Barangay")

    if (
      selectedRegion &&
      selectedProvince &&
      selectedCity &&
      window.LocationHandler &&
      window.LocationHandler.philippineLocations[selectedRegion][selectedProvince][selectedCity]
    ) {
      // Enable and populate barangay dropdown
      barangaySelect.disabled = false
      populateBarangays(barangaySelect, selectedRegion, selectedProvince, selectedCity)
    } else {
      barangaySelect.disabled = true
    }

    updateHiddenLocationField(regionSelect, provinceSelect, citySelect, barangaySelect, hiddenLocationField)
  })

  // Barangay change event
  barangaySelect.addEventListener("change", () => {
    updateHiddenLocationField(regionSelect, provinceSelect, citySelect, barangaySelect, hiddenLocationField)
  })
}

function populateProvinces(provinceSelect, region) {
  if (!window.LocationHandler || !window.LocationHandler.philippineLocations[region]) return

  const provinces = Object.keys(window.LocationHandler.philippineLocations[region])

  provinces.forEach((province) => {
    const option = document.createElement("option")
    option.value = province
    option.textContent = province
    provinceSelect.appendChild(option)
  })
}

function populateCities(citySelect, region, province) {
  if (!window.LocationHandler || !window.LocationHandler.philippineLocations[region][province]) return

  const cities = Object.keys(window.LocationHandler.philippineLocations[region][province])

  cities.forEach((city) => {
    const option = document.createElement("option")
    option.value = city
    option.textContent = city
    citySelect.appendChild(option)
  })
}

function populateBarangays(barangaySelect, region, province, city) {
  if (!window.LocationHandler || !window.LocationHandler.philippineLocations[region][province][city]) return

  const barangays = window.LocationHandler.philippineLocations[region][province][city]

  barangays.forEach((barangay) => {
    const option = document.createElement("option")
    option.value = barangay
    option.textContent = barangay
    barangaySelect.appendChild(option)
  })
}

function resetDropdown(selectElement, placeholder) {
  if (!selectElement) return

  selectElement.innerHTML = `<option value="">${placeholder}</option>`
  selectElement.disabled = true
}

function updateHiddenLocationField(regionSelect, provinceSelect, citySelect, barangaySelect, hiddenLocationField) {
  if (!hiddenLocationField) return

  const region = regionSelect.value
  const province = provinceSelect.value
  const city = citySelect.value
  const barangay = barangaySelect.value

  // Build full address
  let fullAddress = ""
  if (barangay) fullAddress += barangay
  if (city) fullAddress += (fullAddress ? ", " : "") + city
  if (province) fullAddress += (fullAddress ? ", " : "") + province
  if (region) fullAddress += (fullAddress ? ", " : "") + region

  hiddenLocationField.value = fullAddress
  console.log("Updated hidden location field:", fullAddress)
}

// Utility functions that might be missing
function showSuccessModal(message) {
  if (window.showSuccessModal) {
    window.showSuccessModal(message)
  } else {
    document.getElementById("success-message").textContent = message
    const modal = new bootstrap.Modal(document.getElementById("successModal"))
    modal.show()
  }
}

function showErrorModal(message) {
  if (window.showErrorModal) {
    window.showErrorModal(message)
  } else {
    document.getElementById("error-message").textContent = message
    const modal = new bootstrap.Modal(document.getElementById("errorModal"))
    modal.show()
  }
}

async function loadFixedPineappleSupplier() {
  try {
    const response = await fetch("supplier.php?id=fixed-pineapple")
    const result = await response.json()

    if (result.status === "success" && result.data) {
      fixedPineappleSupplier = result.data
      updateFixedPineappleSupplierSection()
    } else {
      console.error("Failed to load fixed pineapple supplier:", result.message)
      // Keep the default data that was set during initialization
    }
  } catch (error) {
    console.error("Error loading fixed pineapple supplier:", error)
    // Keep the default data that was set during initialization
  }
}

async function loadSuppliers() {
  try {
    const response = await fetch("supplier.php?type=all")
    const result = await response.json()

    if (result.status === "success") {
      suppliers = result.data || []
      displaySuppliers()
    } else {
      console.error("Failed to load suppliers:", result.message)
      suppliers = []
      displaySuppliers()
    }
  } catch (error) {
    console.error("Error loading suppliers:", error)
    suppliers = []
    displaySuppliers()
  }
}

// Initialize location dropdowns for Add New Supplier modal
function initializeAddSupplierLocationDropdowns() {
  const regionSelect = document.getElementById('add-supplier-location-region');
  const provinceSelect = document.getElementById('add-supplier-location-province');
  const citySelect = document.getElementById('add-supplier-location-city');
  const barangaySelect = document.getElementById('add-supplier-location-barangay');
  const hiddenLocationField = document.getElementById('address');

  if (regionSelect && provinceSelect && citySelect && barangaySelect && hiddenLocationField) {
    // Populate regions
    populateRegions(regionSelect);
    
    // Setup event listeners
    setupLocationEventListeners(regionSelect, provinceSelect, citySelect, barangaySelect, hiddenLocationField);
  }
}

// Event listeners for modals
document.getElementById("confirm-delete-btn").addEventListener("click", deleteSupplier)

// Initialize location dropdowns when Add New Supplier modal is opened
document.addEventListener('DOMContentLoaded', function() {
  const addSupplierModal = document.getElementById('addSupplierModal');
  if (addSupplierModal) {
    addSupplierModal.addEventListener('shown.bs.modal', function() {
      initializeAddSupplierLocationDropdowns();
    });
  }
  
  // Initialize location dropdowns when Add Alternative modal is opened
  const addAlternativeModal = document.getElementById('addAlternativeModal');
  if (addAlternativeModal) {
    addAlternativeModal.addEventListener('shown.bs.modal', function() {
      initializeAlternativeLocationDropdowns();
    });
  }
});

// Initialize location dropdowns for Add Alternative Supplier modal
function initializeAlternativeLocationDropdowns() {
  const regionSelect = document.getElementById('alternative-location-region');
  const provinceSelect = document.getElementById('alternative-location-province');
  const citySelect = document.getElementById('alternative-location-city');
  const barangaySelect = document.getElementById('alternative-location-barangay');
  const hiddenLocationField = document.getElementById('alternative-address');

  if (regionSelect && provinceSelect && citySelect && barangaySelect && hiddenLocationField) {
    // Populate regions
    populateRegions(regionSelect);
    
    // Setup event listeners
    setupLocationEventListeners(regionSelect, provinceSelect, citySelect, barangaySelect, hiddenLocationField);
  }
}

// --- ENHANCED: Opening Hours Time Picker & Country Code Dropdown ---

function initializeOpeningHoursPickers() {
    // Initialize time pickers for all modals
    const modals = ['addSupplierModal', 'editSupplierModal', 'addAlternativeModal', 'editAlternativeModal'];
    
    modals.forEach(modalId => {
        const modal = document.getElementById(modalId);
        if (modal) {
            const startPicker = modal.querySelector('[id$="opening-hours-start"]');
            const endPicker = modal.querySelector('[id$="opening-hours-end"]');
            
            if (startPicker && endPicker) {
                // Set default values if empty
                if (!startPicker.value) startPicker.value = '09:00';
                if (!endPicker.value) endPicker.value = '17:00';
                
                // Add change listeners to ensure end time is after start time
                startPicker.addEventListener('change', () => {
                    if (endPicker.value && startPicker.value > endPicker.value) {
                        endPicker.value = startPicker.value;
                    }
                });
                
                endPicker.addEventListener('change', () => {
                    if (startPicker.value && endPicker.value < startPicker.value) {
                        startPicker.value = endPicker.value;
                    }
                });
            }
        }
    });
}

function initializeCountryCodeDropdowns() {
  document.querySelectorAll('.country-code-btn').forEach(btn => {
    const inputGroup = btn.closest('.input-group');
    if (!inputGroup) return;
    const phoneInput = inputGroup.querySelector('.phone-input');
    const hiddenInput = inputGroup.querySelector('.full-contact-info');
    // Set default country code if not set
    if (!btn.textContent.trim()) btn.textContent = '+63';
    // Dropdown click
    inputGroup.querySelectorAll('.country-code-dropdown .dropdown-item').forEach(item => {
      item.addEventListener('click', function(e) {
        e.preventDefault();
        btn.textContent = this.getAttribute('data-code');
        // Update hidden input if phone is filled
        if (phoneInput && hiddenInput) {
          hiddenInput.value = btn.textContent + ' ' + phoneInput.value;
        }
      });
    });
    // Update hidden input on phone input change
    if (phoneInput && hiddenInput) {
      phoneInput.addEventListener('input', function() {
        hiddenInput.value = btn.textContent + ' ' + phoneInput.value;
      });
    }
  });
}

// Call these on modal show
function initializeEnhancedSupplierFields() {
  initializeOpeningHoursPickers();
  initializeCountryCodeDropdowns();
}

// Hook into modal show events for Add/Edit Supplier and Alternative modals
['addSupplierModal', 'editSupplierModal', 'addAlternativeModal', 'editAlternativeModal'].forEach(modalId => {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.addEventListener('shown.bs.modal', initializeEnhancedSupplierFields);
  }
});


