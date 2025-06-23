// Suppliers Management System

// Supplier data structure (will be loaded from database)
let suppliers = []

// Fixed Pineapple Supplier data (will be loaded from database)
let fixedPineappleSupplier = {
  id: "fixed-pineapple",
  name: "",
  contactInfo: "",
  farmLocation: "",
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
      farmLocation: "Tropical Valley, Hawaii",
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

// Update the fixed pineapple supplier section with current data
function updateFixedPineappleSupplierSection() {
  const fixedSupplierSection = document.querySelector(".fixed-pineapple-card")
  if (fixedSupplierSection) {
    // Update supplier name
    const nameElement = fixedSupplierSection.querySelector("h6")
    if (nameElement) nameElement.textContent = fixedPineappleSupplier.name

    // Update farm location
    const locationElement = fixedSupplierSection.querySelector(".text-muted small:nth-of-type(1)")
    if (locationElement)
      locationElement.innerHTML = `<i class="bi bi-geo-alt me-1"></i>${fixedPineappleSupplier.farmLocation || "Location not specified"}`

    // Update contact information
    const contactElement = fixedSupplierSection.querySelector(".text-muted small:nth-of-type(2)")
    if (contactElement)
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

  // Create simplified card body
  const cardBody = document.createElement("div")
  cardBody.className = "card-body"

  // Create simplified content
  cardBody.innerHTML = `
    <div class="d-flex align-items-center">
      <div class="flex-grow-1">
        <h6 class="mb-1">${fixedPineappleSupplier.name}</h6>
        <p class="mb-1 text-muted small"><i class="bi bi-geo-alt me-1"></i>${fixedPineappleSupplier.farmLocation || "Location not specified"}</p>
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

// Show fixed pineapple details modal
function showFixedPineappleDetailsModal() {
  // Create modal if it doesn't exist
  let detailsModal = document.getElementById("fixedPineappleDetailsModal")

  if (!detailsModal) {
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
            <h5 class="modal-title" id="fixedPineappleDetailsModalLabel">Fixed Pineapple Supplier Details</h5>
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
                    <p><strong>Farm Location:</strong> <span id="modal-supplier-location">${fixedPineappleSupplier.farmLocation || "Not specified"}</span></p>
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
    // Update modal content with current data
    document.getElementById("modal-supplier-name").textContent = fixedPineappleSupplier.name
    document.getElementById("modal-supplier-contact").textContent =
      fixedPineappleSupplier.contactInfo || "Not available"
    document.getElementById("modal-supplier-location").textContent =
      fixedPineappleSupplier.farmLocation || "Not specified"
    document.getElementById("modal-supplier-delivery").textContent =
      fixedPineappleSupplier.deliveryInfo || "Not specified"
    document.getElementById("modal-supplier-communication").textContent =
      fixedPineappleSupplier.communicationMode || "Not specified"
    document.getElementById("modal-supplier-notes").textContent = fixedPineappleSupplier.notes || "No notes available"

    document.getElementById("modal-pineapple-variety").textContent = fixedPineappleSupplier.variety || "Not specified"
    document.getElementById("modal-pineapple-harvest").textContent =
      fixedPineappleSupplier.harvestSeason || "Not specified"
    document.getElementById("modal-pineapple-planting").textContent =
      fixedPineappleSupplier.plantingCycle || "Not specified"
    document.getElementById("modal-pineapple-shelf").textContent = fixedPineappleSupplier.shelfLife || "Not specified"

    // Update timestamps
    document.getElementById("modal-pineapple-created").textContent =
      formatDateTime(fixedPineappleSupplier.created_at) || "Not available"
    document.getElementById("modal-pineapple-updated").textContent =
      formatDateTime(fixedPineappleSupplier.updated_at) || "Not available"
  }

  // Update alternatives in the modal
  updateModalFixedAlternativesDisplay()

  // Show the modal
  const modal = new bootstrap.Modal(detailsModal)
  modal.show()
}

// Create and show fixed pineapple supplier edit modal
function showFixedPineappleEditModal() {
  const editModal = document.getElementById("editFixedPineappleModal")

  if (editModal) {
    // Update form values with current data
    document.getElementById("edit-fixed-name").value = fixedPineappleSupplier.name

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
      document.getElementById("edit-fixed-contact").value = fixedPineappleSupplier.contactInfo || ""
    }

    // Farm Location
    const locationField = document.querySelector("#edit-fixed-modal .full-location")
    if (locationField) {
      locationField.value = fixedPineappleSupplier.farmLocation || ""
      // We can't easily set the individual location dropdowns without knowing the exact structure
      // So we'll just set the hidden field and display the full location
    } else {
      // Fallback to old input
      document.getElementById("edit-fixed-location").value = fixedPineappleSupplier.farmLocation || ""
    }

    // Set delivery method
    const deliverySelect = document.getElementById("edit-fixed-delivery")
    if (["3rd Party", "Business Driver", "Pick Up"].includes(fixedPineappleSupplier.deliveryInfo)) {
      deliverySelect.value = fixedPineappleSupplier.deliveryInfo
      document.getElementById("edit-fixed-other-delivery-container").style.display = "none"
    } else if (fixedPineappleSupplier.deliveryInfo) {
      deliverySelect.value = "Other"
      document.getElementById("edit-fixed-other-delivery-container").style.display = "block"
      document.getElementById("edit-fixed-other-delivery").value = fixedPineappleSupplier.deliveryInfo
    } else {
      deliverySelect.value = ""
      document.getElementById("edit-fixed-other-delivery-container").style.display = "none"
    }

    // Set communication mode
    const communicationSelect = document.getElementById("edit-fixed-communication")
    if (["Text", "Call", "WhatsApp", "Telegram", "Viber"].includes(fixedPineappleSupplier.communicationMode)) {
      communicationSelect.value = fixedPineappleSupplier.communicationMode
      document.getElementById("edit-fixed-other-communication-container").style.display = "none"
    } else if (fixedPineappleSupplier.communicationMode) {
      communicationSelect.value = "Other"
      document.getElementById("edit-fixed-other-communication-container").style.display = "block"
      document.getElementById("edit-fixed-other-communication").value = fixedPineappleSupplier.communicationMode
    } else {
      communicationSelect.value = ""
      document.getElementById("edit-fixed-other-communication-container").style.display = "none"
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
        document.querySelector("#edit-fixed-modal .harvest-season-custom").style.display = "none"
      } else if (fixedPineappleSupplier.harvestSeason) {
        // If it doesn't match any predefined option, set it as custom
        harvestSeasonSelect.value = "custom"
        document.querySelector("#edit-fixed-modal .harvest-season-custom").style.display = "block"

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
        document.querySelector("#edit-fixed-modal .harvest-season-custom").style.display = "none"
      }

      // Set the hidden field
      document.querySelector("#edit-fixed-modal .full-harvest-season").value =
        fixedPineappleSupplier.harvestSeason || ""
    } else {
      // Fallback to old input
      document.getElementById("edit-fixed-harvest").value = fixedPineappleSupplier.harvestSeason || ""
    }

    // Planting Cycle
    const plantingCycleSelect = document.querySelector("#edit-fixed-modal .planting-cycle-select")
    if (plantingCycleSelect) {
      // Try to match the planting cycle to one of the predefined options
      const predefinedCycles = ["12-18 months", "15-20 months", "18-24 months", "Plant crop", "Ratoon crop"]
      if (predefinedCycles.includes(fixedPineappleSupplier.plantingCycle)) {
        plantingCycleSelect.value = fixedPineappleSupplier.plantingCycle
        document.querySelector("#edit-fixed-modal .planting-cycle-custom").style.display = "none"
      } else if (fixedPineappleSupplier.plantingCycle) {
        // If it doesn't match any predefined option, set it as custom
        plantingCycleSelect.value = "custom"
        document.querySelector("#edit-fixed-modal .planting-cycle-custom").style.display = "block"

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
        document.querySelector("#edit-fixed-modal .planting-cycle-custom").style.display = "none"
      }

      // Set the hidden field
      document.querySelector("#edit-fixed-modal .full-planting-cycle").value =
        fixedPineappleSupplier.plantingCycle || ""
    } else {
      // Fallback to old input
      document.getElementById("edit-fixed-planting").value = fixedPineappleSupplier.plantingCycle || ""
    }

    // Variety
    const varietySelect = document.querySelector("#edit-fixed-modal .variety-select")
    if (varietySelect) {
      // Try to match the variety to one of the predefined options
      const predefinedVarieties = ["MD-2 Sweet Gold", "Smooth Cayenne", "Queen", "Red Spanish", "Abacaxi", "Sugarloaf"]
      if (predefinedVarieties.includes(fixedPineappleSupplier.variety)) {
        varietySelect.value = fixedPineappleSupplier.variety
        document.querySelector("#edit-fixed-modal .variety-custom").style.display = "none"
      } else if (fixedPineappleSupplier.variety) {
        // If it doesn't match any predefined option, set it as custom
        varietySelect.value = "custom"
        document.querySelector("#edit-fixed-modal .variety-custom").style.display = "block"
        document.querySelector("#edit-fixed-modal .variety-custom-input").value = fixedPineappleSupplier.variety
      } else {
        varietySelect.value = ""
        document.querySelector("#edit-fixed-modal .variety-custom").style.display = "none"
      }

      // Set the hidden field
      document.querySelector("#edit-fixed-modal .full-variety").value = fixedPineappleSupplier.variety || ""
    } else {
      // Fallback to old input
      document.getElementById("edit-fixed-variety").value = fixedPineappleSupplier.variety || ""
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
        document.querySelector("#edit-fixed-modal .shelf-life-custom").style.display = "none"
      } else if (fixedPineappleSupplier.shelfLife) {
        // If it doesn't match any predefined option, set it as custom
        shelfLifeSelect.value = "custom"
        document.querySelector("#edit-fixed-modal .shelf-life-custom").style.display = "block"

        // Try to parse the custom ranges if possible
        const roomTempMatch = fixedPineappleSupplier.shelfLife.match(/(\d+)\s*(?:to|-)\s*(\d+)\s*days\s*at\s*room/)
        const refrigMatch = fixedPineappleSupplier.shelfLife.match(/(\d+)\s*(?:to|-)\s*(\d+)\s*days\s*refrigerated/)

        if (roomTempMatch && roomTempMatch[1] && roomTempMatch[2]) {
          document.querySelector("#edit-fixed-modal .shelf-life-room-min").value = roomTempMatch[1]
          document.querySelector("#edit-fixed-modal .shelf-life-room-max").value = roomTempMatch[2]
        }

        if (refrigMatch && refrigMatch[1] && refrigMatch[2]) {
          document.querySelector("#edit-fixed-modal .shelf-life-refrig-min").value = refrigMatch[1]
          document.querySelector("#edit-fixed-modal .shelf-life-refrig-max").value = refrigMatch[2]
        }
      } else {
        shelfLifeSelect.value = ""
        document.querySelector("#edit-fixed-modal .shelf-life-custom").style.display = "none"
      }

      // Set the hidden field
      document.querySelector("#edit-fixed-modal .full-shelf-life").value = fixedPineappleSupplier.shelfLife || ""
    } else {
      // Fallback to old input
      document.getElementById("edit-fixed-shelf").value = fixedPineappleSupplier.shelfLife || ""
    }

    // Notes
    document.getElementById("edit-fixed-notes").value = fixedPineappleSupplier.notes || ""
  }

  // Show the modal
  const modal = new bootstrap.Modal(editModal)
  modal.show()
}

// Update fixed pineapple supplier
function updateFixedPineappleSupplier() {
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

  // Get farm location from enhanced input if available, otherwise use the regular input
  let farmLocation = ""
  const locationField = document.querySelector("#edit-fixed-modal .full-location")
  if (locationField && locationField.value) {
    farmLocation = locationField.value
  } else {
    farmLocation = document.getElementById("edit-fixed-location").value
  }

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

  // Create data object
  const supplierData = {
    id: "fixed-pineapple", // Use the fixed-pineapple ID for API routing
    name,
    contactInfo,
    farmLocation,
    deliveryInfo,
    communicationMode,
    harvestSeason,
    plantingCycle,
    variety,
    shelfLife,
    notes,
  }

  try {
    // Show loading modal
    showLoadingModal("Updating pineapple supplier...")

    console.log("Sending update request with data:", supplierData)

    // Send data to server
    const response = fetch("supplier.php", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(supplierData),
    })
      .then((response) => {
        // Hide loading modal
        hideLoadingModal()

        // Get the response text for debugging
        return response.text().then((responseText) => {
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

          // Update local data
          fixedPineappleSupplier = {
            ...fixedPineappleSupplier,
            name,
            contactInfo,
            farmLocation,
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
          return loadFixedPineappleSupplier().then(() => {
            // Show success message
            showSuccessModal("Pineapple supplier updated successfully!")
          })
        })
      })
      .catch((error) => {
        console.error("Error updating fixed pineapple supplier:", error)
        showErrorModal("Failed to update pineapple supplier: " + error.message)

        // Try to reload fixed pineapple supplier data anyway
        try {
          loadFixedPineappleSupplier()
        } catch (loadError) {
          console.error("Error reloading fixed pineapple supplier:", loadError)
        }
      })
  } catch (error) {
    // Hide loading modal
    hideLoadingModal()

    console.error("Error updating fixed pineapple supplier:", error)
    showErrorModal("Failed to update pineapple supplier: " + error.message)

    // Try to reload fixed pineapple supplier data anyway
    try {
      loadFixedPineappleSupplier()
    } catch (loadError) {
      console.error("Error reloading fixed pineapple supplier:", loadError)
    }
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
          <button type="button" class="btn btn-outline-primary edit-supplier-btn">
            <i class="bi bi-pencil me-1"></i>Edit
          </button>
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
    <button type="button" class="btn btn-outline-secondary edit-supplier-btn" data-supplier-id="${supplier.id}">
      <i class="bi bi-pencil"></i>
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
    <button type="button" class="btn btn-sm btn-outline-secondary edit-supplier-btn" data-supplier-id="${supplier.id}">
      <i class="bi bi-pencil"></i>
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

  // Fixed pineapple card click event
  const fixedPineappleCard = document.querySelector(".fixed-pineapple-card")
  if (fixedPineappleCard) {
    fixedPineappleCard.addEventListener("click", (e) => {
      // Don't trigger modal if clicking on the Add Alternative button
      if (e.target.closest(".add-alternative-btn") || e.target.closest(".edit-fixed-supplier-btn")) {
        return
      }
      showFixedPineappleDetailsModal()
    })
  }

  // Edit fixed supplier button
  const editFixedSupplierBtn = document.querySelector(".edit-fixed-supplier-btn")
  if (editFixedSupplierBtn) {
    editFixedSupplierBtn.addEventListener("click", showFixedPineappleEditModal)
  }

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
      document.getElementById("edit-fixed-other-delivery-container").style.display =
        deliveryInfo === "Other" ? "block" : "none"
    })
  }

  // Fixed pineapple edit modal communication change
  const editFixedCommunication = document.getElementById("edit-fixed-communication")
  if (editFixedCommunication) {
    editFixedCommunication.addEventListener("change", function () {
      const communicationModeValue = this.value
      let communicationMode
      if (communicationModeValue === "Other") {
        communicationMode = document.getElementById("edit-fixed-other-communication").value
      } else {
        communicationMode = communicationModeValue
      }
      document.getElementById("edit-fixed-other-communication-container").style.display =
        communicationMode === "Other" ? "block" : "none"
    })
  }

  // Dynamic event listeners for buttons that are added to the DOM after page load
  document.addEventListener("click", (e) => {
    // View details button - REMOVED and replaced with row click event
    /*
  if (e.target.closest(".view-details-btn")) {
    const supplierId = e.target.closest(".view-details-btn").getAttribute("data-supplier-id");
    showSupplierDetailsModal(supplierId);
    e.stopPropagation(); // Prevent event bubbling
  }
  */

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
      const supplierId = e.target.closest(".view-alternatives-btn").getAttribute("data-supplier-id")
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

  // Show the modal
  try {
    const bsModal = new bootstrap.Modal(modal)
    bsModal.show()
  } catch (error) {
    console.error("Error showing modal:", error)
    // Fallback method if bootstrap.Modal fails
    modal.classList.add("show")
    modal.style.display = "block"
    document.body.classList.add("modal-open")
    const backdrop = document.createElement("div")
    backdrop.className = "modal-backdrop fade show"
    document.body.appendChild(backdrop)
  }
}

// Update modal fixed alternatives display
function updateModalFixedAlternativesDisplay() {
  const container = document.getElementById("modal-fixed-alternatives-container")
  if (!container) return

  if (!fixedPineappleSupplier.alternatives || fixedPineappleSupplier.alternatives.length === 0) {
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

// Function to show alternative details modal
function showAlternativeDetailsModal(alternative, isFixedPineapple, parentSupplier = null) {
  console.log("Showing alternative details for:", alternative.name)

  // Check if the modal already exists
  let detailsModal = document.getElementById("alternativeDetailsModal")

  if (!detailsModal) {
    // Create the modal if it doesn't exist
    detailsModal = document.createElement("div")
    detailsModal.className = "modal fade"
    detailsModal.id = "alternativeDetailsModal"
    detailsModal.setAttribute("tabindex", "-1")
    detailsModal.setAttribute("aria-labelledby", "alternativeDetailsModalLabel")
    detailsModal.setAttribute("aria-hidden", "true")

    // Create modal content
    detailsModal.innerHTML = `
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

    document.body.appendChild(detailsModal)
  }

  // Update modal content based on alternative type
  const mainDetailsContainer = document.getElementById("alternative-main-details")
  const additionalDetailsContainer = document.getElementById("alternative-additional-details")

  if (isFixedPineapple) {
    // Fixed pineapple alternative details
    mainDetailsContainer.innerHTML = `
      <div class="card mb-3">
        <div class="card-header bg-warning bg-opacity-10">
          <h6 class="mb-0">Supplier Information</h6>
        </div>
        <div class="card-body">
          <p><strong>Name:</strong> ${alternative.name || "Not specified"}</p>
          <p><strong>Contact Info:</strong> ${alternative.contactInfo || "Not available"}</p>
          <p><strong>Farm Location:</strong> ${alternative.farmLocation || "Not specified"}</p>
          <p><strong>Delivery Method:</strong> ${alternative.deliveryInfo || "Not specified"}</p>
          <p><strong>Communication:</strong> ${alternative.communicationMode || "Not specified"}</p>
          <p><strong>Notes:</strong> ${alternative.notes || "No notes available"}</p>
        </div>
      </div>
    `

    additionalDetailsContainer.innerHTML = `
      <div class="card mb-3">
        <div class="card-header bg-warning bg-opacity-10">
          <h6 class="mb-0">Pineapple Details</h6>
        </div>
        <div class="card-body">
          <p><strong>Variety:</strong> ${alternative.variety || "Not specified"}</p>
          <p><strong>Harvest Season:</strong> ${alternative.harvestSeason || "Not specified"}</p>
          <p><strong>Planting Cycle:</strong> ${alternative.plantingCycle || "Not specified"}</p>
          <p><strong>Shelf Life:</strong> ${alternative.shelfLife || "Not specified"}</p>
        </div>
      </div>
      
      <div class="card">
        <div class="card-header bg-warning bg-opacity-10">
          <h6 class="mb-0">Record Information</h6>
        </div>
        <div class="card-body">
          <p><strong>Created:</strong> ${formatDateTime(alternative.created_at) || "Not available"}</p>
          <p><strong>Last Updated:</strong> ${formatDateTime(alternative.updated_at) || "Not available"}</p>
        </div>
      </div>
    `
  } else {
    // Regular alternative details
    const headerClass =
      parentSupplier && parentSupplier.type === "physical" ? "bg-primary bg-opacity-10" : "bg-success bg-opacity-10"

    mainDetailsContainer.innerHTML = `
      <div class="card mb-3">
        <div class="card-header ${headerClass}">
          <h6 class="mb-0">Basic Information</h6>
        </div>
        <div class="card-body">
          <p><strong>Name:</strong> ${alternative.name || "Not specified"}</p>
          <p><strong>Contact Info:</strong> ${alternative.contactInfo || "Not available"}</p>
          ${alternative.address ? `<p><strong>Address:</strong> ${alternative.address}</p>` : ""}
          ${alternative.link ? `<p><strong>Website:</strong> <a href="${alternative.link}" target="_blank">${alternative.link}</a></p>` : ""}
        </div>
      </div>
    `

    additionalDetailsContainer.innerHTML = `
      <div class="card mb-3">
        <div class="card-header ${headerClass}">
          <h6 class="mb-0">Contact Details</h6>
        </div>
        <div class="card-body">
          ${alternative.contactName ? `<p><strong>Contact Name:</strong> ${alternative.contactName}</p>` : ""}
          ${alternative.contactNumber ? `<p><strong>Contact Number:</strong> ${alternative.contactNumber}</p>` : ""}
          ${alternative.email ? `<p><strong>Email:</strong> ${alternative.email}</p>` : ""}
          ${alternative.openingHours ? `<p><strong>Opening Hours:</strong> ${alternative.openingHours}</p>` : ""}
        </div>
      </div>
      
      <div class="card">
        <div class="card-header ${headerClass}">
          <h6 class="mb-0">Record Information</h6>
        </div>
        <div class="card-body">
          <p><strong>Created:</strong> ${formatDateTime(alternative.created_at) || "Not available"}</p>
          <p><strong>Last Updated:</strong> ${formatDateTime(alternative.updated_at) || "Not available"}</p>
        </div>
      </div>
    `
  }

  // Update modal title
  const modalTitle = document.getElementById("alternativeDetailsModalLabel")
  modalTitle.textContent = `Alternative Supplier: ${alternative.name}`

  // Show the modal
  const modal = new bootstrap.Modal(detailsModal)
  modal.show()
}

// Open edit supplier modal
function openEditSupplierModal(supplierId) {
  // Close the supplier details modal if it's open
  const supplierDetailsModal = bootstrap.Modal.getInstance(document.getElementById("supplierDetailsModal"))
  if (supplierDetailsModal) {
    supplierDetailsModal.hide()
  }

  const supplier = suppliers.find((s) => s.id == supplierId)

  if (supplier) {
    document.getElementById("edit-supplier-id").value = supplier.id
    document.getElementById("edit-supplier-type").value = supplier.type

    // Set display type
    const typeDisplay = supplier.type === "physical" ? "Physical/Market Supplier" : "Online Shop Supplier"
    document.getElementById("edit-supplier-type-display").value = typeDisplay

    document.getElementById("edit-supplier-name").value = supplier.name
    document.getElementById("edit-notes").value = supplier.notes || ""

    // Show/hide type-specific fields
    document.getElementById("edit-physical-fields").style.display = supplier.type === "physical" ? "block" : "none"
    document.getElementById("edit-online-fields").style.display = supplier.type === "online" ? "block" : "none"

    // Set type-specific values
    if (supplier.type === "physical") {
      document.getElementById("edit-address").value = supplier.address || ""
      document.getElementById("edit-contact-name").value = supplier.contactName || ""
      document.getElementById("edit-contact-number").value = supplier.contactNumber || ""
      document.getElementById("edit-email").value = supplier.email || ""
      document.getElementById("edit-opening-hours").value = supplier.openingHours || ""

      // Handle delivery info with "Other" option
      const deliverySelect = document.getElementById("edit-delivery-info")
      if (["3rd Party", "Business Driver", "Pick Up"].includes(supplier.deliveryInfo)) {
        deliverySelect.value = supplier.deliveryInfo
        document.getElementById("edit-other-delivery-container").style.display = "none"
      } else if (supplier.deliveryInfo) {
        deliverySelect.value = "Other"
        document.getElementById("edit-other-delivery-container").style.display = "block"
        document.getElementById("edit-other-delivery").value = supplier.deliveryInfo
      } else {
        deliverySelect.value = ""
        document.getElementById("edit-other-delivery-container").style.display = "none"
      }

      // Handle communication mode with "Other" option
      const communicationSelect = document.getElementById("edit-communication-mode")
      if (["Text", "Call", "WhatsApp", "Telegram", "Viber"].includes(supplier.communicationMode)) {
        communicationSelect.value = supplier.communicationMode
        document.getElementById("edit-other-communication-container").style.display = "none"
      } else if (supplier.communicationMode) {
        communicationSelect.value = "Other"
        document.getElementById("edit-other-communication-container").style.display = "block"
        document.getElementById("edit-other-communication").value = supplier.communicationMode
      } else {
        communicationSelect.value = ""
        document.getElementById("edit-other-communication-container").style.display = "none"
      }
    } else if (supplier.type === "online") {
      document.getElementById("edit-link").value = supplier.link || ""

      // Handle platform with "Other" option
      const platformSelect = document.getElementById("edit-platform")
      if (["Shopee", "Lazada", "Tiktok Shop"].includes(supplier.platform)) {
        platformSelect.value = supplier.platform
        document.getElementById("edit-other-platform-container").style.display = "none"
      } else if (supplier.platform) {
        platformSelect.value = "Other"
        document.getElementById("edit-other-platform-container").style.display = "block"
        document.getElementById("edit-other-platform").value = supplier.platform
      } else {
        platformSelect.value = ""
        document.getElementById("edit-other-platform-container").style.display = "none"
      }

      // Handle delivery info with "Other" option
      const deliverySelect = document.getElementById("edit-online-delivery-info")
      if (["3rd Party", "Business Driver", "Pick Up"].includes(supplier.deliveryInfo)) {
        deliverySelect.value = supplier.deliveryInfo
        document.getElementById("edit-other-online-delivery-container").style.display = "none"
      } else if (supplier.deliveryInfo) {
        deliverySelect.value = "Other"
        document.getElementById("edit-other-online-delivery-container").style.display = "block"
        document.getElementById("edit-other-online-delivery").value = supplier.deliveryInfo
      } else {
        deliverySelect.value = ""
        document.getElementById("edit-other-online-delivery-container").style.display = "none"
      }
    }

    // Show modal
    const modal = new bootstrap.Modal(document.getElementById("editSupplierModal"))
    modal.show()
  }
}

// Open delete confirmation modal
function openDeleteConfirmationModal(supplierId) {
  // Prevent deletion of fixed pineapple supplier
  if (supplierId === fixedPineappleSupplier.id) {
    showToast("The fixed pineapple supplier cannot be deleted.", "warning")
    return
  }

  document.getElementById("delete-supplier-id").value = supplierId
  const modal = new bootstrap.Modal(document.getElementById("deleteSupplierModal"))
  modal.show()
}

// Function to open the add alternative modal
const openAddAlternativeModal = (supplierId) => {
  // Close the supplier details modal if it's open
  const supplierDetailsModal = bootstrap.Modal.getInstance(document.getElementById("supplierDetailsModal"))
  if (supplierDetailsModal) {
    supplierDetailsModal.hide()
  }

  // Close the fixed pineapple details modal if it's open
  const fixedPineappleDetailsModal = bootstrap.Modal.getInstance(document.getElementById("fixedPineappleDetailsModal"))
  if (fixedPineappleDetailsModal) {
    fixedPineappleDetailsModal.hide()
  }

  document.getElementById("parent-supplier-id").value = supplierId
  document.getElementById("add-alternative-form").reset()

  // Check if this is for the fixed pineapple supplier
  const isFixedPineapple = supplierId === fixedPineappleSupplier.id

  // Update modal title
  const modalTitle = document.getElementById("addAlternativeModalLabel")

  if (isFixedPineapple) {
    // This is for the fixed pineapple supplier
    modalTitle.textContent = "Add Alternative Pineapple Supplier"

    // Show pineapple-specific fields and hide supplier type selection
    document.getElementById("alternative-supplier-type-container").style.display = "none"
    document.getElementById("alternative-supplier-name-container").style.display = "none"
    document.getElementById("alternative-pineapple-fields").style.display = "block"
    document.getElementById("alternative-physical-fields").style.display = "none"
    document.getElementById("alternative-online-fields").style.display = "none"

    // Reset "Other" containers for pineapple fields
    document.getElementById("alternative-other-delivery-container").style.display = "none"
    document.getElementById("alternative-other-communication-container").style.display = "none"
  } else {
    // This is for regular suppliers
    const supplier = suppliers.find((s) => s.id == supplierId)
    if (supplier) {
      modalTitle.textContent = `Add Alternative for ${supplier.name}`

      // If we know the supplier type, we can pre-select it
      if (supplier.type === "physical" || supplier.type === "online") {
        document.getElementById("alternative-supplier-type").value = supplier.type
        document.getElementById("alternative-physical-fields").style.display =
          supplier.type === "physical" ? "block" : "none"
        document.getElementById("alternative-online-fields").style.display =
          supplier.type === "online" ? "block" : "none"
      }
    } else {
      modalTitle.textContent = "Add Alternative Supplier"
    }

    // Show supplier type selection and hide pineapple-specific fields
    document.getElementById("alternative-supplier-type-container").style.display = "block"
    document.getElementById("alternative-supplier-name-container").style.display = "block"
    document.getElementById("alternative-pineapple-fields").style.display = "none"

    // Reset all "Other" containers for regular supplier fields
    document.getElementById("alternative-other-delivery-container").style.display = "none"
    document.getElementById("alternative-other-communication-container").style.display = "none"
    document.getElementById("alternative-other-platform-container").style.display = "none"
    document.getElementById("alternative-other-online-delivery-container").style.display = "none"
  }

  const modal = new bootstrap.Modal(document.getElementById("addAlternativeModal"))
  modal.show()
}

// Function to open the view alternatives modal
function openViewAlternativesModal(supplierId) {
  // For now, just show an alert
  alert("View Alternatives Modal - Not fully implemented yet.")
}

// Function to delete an alternative
function deleteAlternative(supplierId, alternativeId) {
  // For now, just show an alert
  alert(
    `Delete Alternative - Supplier ID: ${supplierId}, Alternative ID: ${alternativeId} - Not fully implemented yet.`,
  )
}

// Function to delete a fixed alternative
function deleteFixedAlternative(alternativeId) {
  // For now, just show an alert
  alert(`Delete Fixed Alternative - Alternative ID: ${alternativeId} - Not fully implemented yet.`)
}

// Function to save a supplier
function saveSupplier() {
  // Get form values
  const type = document.getElementById("supplier-type").value
  const name = document.getElementById("supplier-name").value

  // Validate required fields
  if (!type || !name) {
    alert("Please fill in all required fields.")
    return
  }

  // Create supplier object with common properties
  const supplierData = {
    name,
    type,
    notes: "",
  }

  // Add type-specific fields
  if (type === "physical") {
    supplierData.address = document.getElementById("address").value
    supplierData.contactName = document.getElementById("contact-name").value
    supplierData.contactNumber = document.getElementById("contact-number").value
    supplierData.email = document.getElementById("email").value
    supplierData.openingHours = document.getElementById("opening-hours").value

    // Handle "Other" option for delivery info
    const deliveryInfo = document.getElementById("delivery-info").value
    if (deliveryInfo === "Other") {
      supplierData.deliveryInfo = document.getElementById("other-delivery").value
    } else {
      supplierData.deliveryInfo = deliveryInfo
    }

    // Handle "Other" option for communication mode
    const communicationMode = document.getElementById("communication-mode").value
    if (communicationMode === "Other") {
      supplierData.communicationMode = document.getElementById("other-communication").value
    } else {
      supplierData.communicationMode = communicationMode
    }

    supplierData.notes = document.getElementById("notes").value
  } else if (type === "online") {
    supplierData.link = document.getElementById("link").value

    // Handle "Other" option for platform
    const platform = document.getElementById("platform").value
    if (platform === "Other") {
      supplierData.platform = document.getElementById("other-platform").value
    } else {
      supplierData.platform = platform
    }

    // Handle "Other" option for online delivery info
    const onlineDeliveryInfo = document.getElementById("online-delivery-info").value
    if (onlineDeliveryInfo === "Other") {
      supplierData.deliveryInfo = document.getElementById("other-online-delivery").value
    } else {
      supplierData.deliveryInfo = onlineDeliveryInfo
    }

    supplierData.notes = document.getElementById("online-notes").value
  }

  try {
    // Show loading modal
    showLoadingModal("Adding new supplier...")

    // Send data to server
    const response = fetch("supplier.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(supplierData),
    })
      .then((response) => {
        // Hide loading modal
        hideLoadingModal()

        // Get the response text for debugging
        return response.text().then((responseText) => {
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
          const modal = bootstrap.Modal.getInstance(document.getElementById("addSupplierModal"))
          modal.hide()

          // Reset the form
          document.getElementById("add-supplier-form").reset()
          document.getElementById("physical-fields").style.display = "none"
          document.getElementById("online-fields").style.display = "none"
          document.getElementById("other-platform-container").style.display = "none"
          document.getElementById("other-delivery-container").style.display = "none"
          document.getElementById("other-communication-container").style.display = "none"
          document.getElementById("other-online-delivery-container").style.display = "none"

          // Reload suppliers from database
          return loadSuppliers().then(() => {
            // Show success message
            showSuccessModal("Supplier added successfully!")
          })
        })
      })
      .catch((error) => {
        console.error("Error saving supplier:", error)
        showErrorModal("Failed to save supplier: " + error.message)

        // Try to reload suppliers anyway
        try {
          loadSuppliers()
        } catch (loadError) {
          console.error("Error reloading suppliers:", loadError)
        }
      })
  } catch (error) {
    // Hide loading modal
    hideLoadingModal()

    console.error("Error saving supplier:", error)
    showErrorModal("Failed to save supplier: " + error.message)

    // Try to reload suppliers anyway
    try {
      loadSuppliers()
    } catch (loadError) {
      console.error("Error reloading suppliers:", loadError)
    }
  }
}

// Update supplier
function updateSupplier() {
  const id = document.getElementById("edit-supplier-id").value
  const name = document.getElementById("edit-supplier-name").value
  const notes = document.getElementById("edit-notes").value
  const type = document.getElementById("edit-supplier-type").value

  // Validate required fields
  if (!name) {
    alert("Supplier name is required.")
    return
  }

  // Create supplier object
  const supplierData = {
    id,
    name,
    type,
    notes,
  }

  // Add type-specific fields
  if (type === "physical") {
    supplierData.address = document.getElementById("edit-address").value
    supplierData.contactName = document.getElementById("edit-contact-name").value
    supplierData.contactNumber = document.getElementById("edit-contact-number").value
    supplierData.email = document.getElementById("edit-email").value
    supplierData.openingHours = document.getElementById("edit-opening-hours").value

    // Handle "Other" option for delivery info
    const deliveryInfo = document.getElementById("edit-delivery-info").value
    if (deliveryInfo === "Other") {
      supplierData.deliveryInfo = document.getElementById("edit-other-delivery").value
    } else {
      supplierData.deliveryInfo = deliveryInfo
    }

    // Handle "Other" option for communication mode
    const communicationMode = document.getElementById("edit-communication-mode").value
    if (communicationMode === "Other") {
      supplierData.communicationMode = document.getElementById("edit-other-communication").value
    } else {
      supplierData.communicationMode = communicationMode
    }
  } else if (type === "online") {
    supplierData.link = document.getElementById("edit-link").value

    // Handle "Other" option for platform
    const platform = document.getElementById("edit-platform").value
    if (platform === "Other") {
      supplierData.platform = document.getElementById("edit-other-platform").value
    } else {
      supplierData.platform = platform
    }

    // Handle "Other" option for online delivery info
    const onlineDeliveryInfo = document.getElementById("edit-online-delivery-info").value
    if (onlineDeliveryInfo === "Other") {
      supplierData.deliveryInfo = document.getElementById("edit-other-online-delivery").value
    } else {
      supplierData.deliveryInfo = onlineDeliveryInfo
    }
  }

  try {
    // Show loading modal
    showLoadingModal("Updating supplier...")

    // Send data to server
    const response = fetch("supplier.php", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(supplierData),
    })
      .then((response) => {
        // Hide loading modal
        hideLoadingModal()

        // Get the response text for debugging
        return response.text().then((responseText) => {
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
          const modal = bootstrap.Modal.getInstance(document.getElementById("editSupplierModal"))
          modal.hide()

          // Reload suppliers from database
          return loadSuppliers().then(() => {
            // Show success message
            showSuccessModal("Supplier updated successfully!")
          })
        })
      })
      .catch((error) => {
        console.error("Error updating supplier:", error)
        showErrorModal("Failed to update supplier: " + error.message)

        // Try to reload suppliers anyway
        try {
          loadSuppliers()
        } catch (loadError) {
          console.error("Error reloading suppliers:", loadError)
        }
      })
  } catch (error) {
    // Hide loading modal
    hideLoadingModal()

    console.error("Error updating supplier:", error)
    showErrorModal("Failed to update supplier: " + error.message)

    // Try to reload suppliers anyway
    try {
      loadSuppliers()
    } catch (loadError) {
      console.error("Error reloading suppliers:", loadError)
    }
  }
}

// Delete supplier
function deleteSupplier() {
  const id = document.getElementById("delete-supplier-id").value

  try {
    // Show loading modal
    showLoadingModal("Deleting supplier...")

    // Send delete request to server
    const response = fetch(`supplier.php?id=${id}`, {
      method: "DELETE",
    })
      .then((response) => {
        // Hide loading modal
        hideLoadingModal()

        // Get the response text for debugging
        return response.text().then((responseText) => {
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
          const modal = bootstrap.Modal.getInstance(document.getElementById("deleteSupplierModal"))
          modal.hide()

          // Reload suppliers from database
          return loadSuppliers().then(() => {
            // Show success message
            showSuccessModal("Supplier deleted successfully!")
          })
        })
      })
      .catch((error) => {
        console.error("Error deleting supplier:", error)
        showErrorModal("Failed to delete supplier: " + error.message)

        // Try to reload suppliers anyway
        try {
          loadSuppliers()
        } catch (loadError) {
          console.error("Error reloading suppliers:", loadError)
        }
      })
  } catch (error) {
    // Hide loading modal
    hideLoadingModal()

    console.error("Error deleting supplier:", error)
    showErrorModal("Failed to delete supplier: " + error.message)

    // Try to reload suppliers anyway
    try {
      loadSuppliers()
    } catch (loadError) {
      console.error("Error reloading suppliers:", loadError)
    }
  }
}

// Save alternative
const saveAlternative = async () => {
  // Disable the save button to prevent multiple clicks
  const saveButton = document.getElementById("save-alternative-btn")
  if (saveButton.disabled) {
    return // Exit if the button is already disabled (prevents duplicate submissions)
  }
  saveButton.disabled = true

  try {
    const parentId = document.getElementById("parent-supplier-id").value
    const isFixedPineapple = parentId === fixedPineappleSupplier.id

    let alternativeData = {
      is_alternative: true,
      supplierId: parentId,
      isFixedPineapple: isFixedPineapple,
    }

    if (isFixedPineapple) {
      // Handle pineapple alternative
      const name = document.getElementById("alternative-name").value

      // Validate required fields
      if (!name) {
        alert("Supplier name is required.")
        saveButton.disabled = false // Re-enable the button
        return
      }

      // Get values from enhanced fields
      // Contact Information - Get from hidden field populated by the enhanced input
      const contactInfo =
        document.querySelector(".full-contact-info").value || document.getElementById("alternative-contact").value

      // Farm Location - Get from hidden field populated by the enhanced input
      const farmLocation =
        document.querySelector(".full-location").value || document.getElementById("alternative-location").value

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

      // Get values from enhanced fields
      // Harvest Season - Get from hidden field populated by the enhanced input
      const harvestSeason =
        document.querySelector(".full-harvest-season").value || document.getElementById("alternative-harvest").value

      // Planting Cycle - Get from enhanced fields
      const plantingCycle =
        document.querySelector(".full-planting-cycle").value || document.getElementById("alternative-planting").value

      // Variety - Get from enhanced fields
      const variety =
        document.querySelector(".full-variety").value || document.getElementById("alternative-variety").value

      // Shelf Life - Get from enhanced fields
      const shelfLife =
        document.querySelector(".full-shelf-life").value || document.getElementById("alternative-shelf").value

      const notes = document.getElementById("alternative-notes").value

      // Add to data object
      alternativeData = {
        ...alternativeData,
        name,
        contactInfo,
        farmLocation,
        deliveryInfo,
        communicationMode,
        harvestSeason,
        plantingCycle,
        variety,
        shelfLife,
        notes,
      }

      // IMPORTANT: Set supplierId to null for fixed pineapple alternatives
      // This will prevent the foreign key constraint error
      alternativeData.supplierId = null
    } else {
      // Handle regular supplier alternative
      const supplierType = document.getElementById("alternative-supplier-type").value
      const name = document.getElementById("alternative-supplier-name").value

      // Validate required fields
      if (!supplierType) {
        alert("Please select a supplier type.")
        saveButton.disabled = false // Re-enable the button
        return
      }

      if (!name) {
        alert("Supplier name is required.")
        saveButton.disabled = false // Re-enable the button
        return
      }

      // Add common fields
      alternativeData.name = name
      alternativeData.type = supplierType

      // Add type-specific fields
      if (supplierType === "physical") {
        // Send individual fields instead of concatenating them
        alternativeData.address = document.getElementById("alternative-address").value
        alternativeData.contactName = document.getElementById("alternative-contact-name").value
        alternativeData.contactNumber = document.getElementById("alternative-contact-number").value
        alternativeData.email = document.getElementById("alternative-email").value
        alternativeData.openingHours = document.getElementById("alternative-opening-hours").value

        // Still include contactInfo for backward compatibility
        const contactName = alternativeData.contactName
        const contactNumber = alternativeData.contactNumber
        const email = alternativeData.email
        alternativeData.contactInfo = `${contactName ? contactName + ", " : ""}${contactNumber ? contactNumber + ", " : ""}${email || ""}`

        // Handle delivery info
        let deliveryInfo = document.getElementById("alternative-delivery-info").value
        if (deliveryInfo === "Other") {
          deliveryInfo = document.getElementById("alternative-other-delivery").value
        }
        alternativeData.deliveryInfo = deliveryInfo

        // Handle communication mode
        let communicationMode = document.getElementById("alternative-communication-mode").value
        if (communicationMode === "Other") {
          communicationMode = document.getElementById("alternative-other-communication").value
        }
        alternativeData.communicationMode = communicationMode

        alternativeData.notes = document.getElementById("alternative-physical-notes").value
      } else if (supplierType === "online") {
        alternativeData.link = document.getElementById("alternative-link").value

        // Handle platform
        let platform = document.getElementById("alternative-platform").value
        if (platform === "Other") {
          platform = document.getElementById("alternative-other-platform").value
        }
        alternativeData.platform = platform

        // Handle delivery info
        let deliveryInfo = document.getElementById("alternative-online-delivery-info").value
        if (deliveryInfo === "Other") {
          deliveryInfo = document.getElementById("alternative-other-online-delivery").value
        }
        alternativeData.deliveryInfo = deliveryInfo

        alternativeData.notes = document.getElementById("alternative-online-notes").value
      }
    }

    // Show loading modal
    showLoadingModal("Adding alternative supplier...")

    // Log the data being sent for debugging
    console.log("Sending alternative supplier data:", alternativeData)

    // Send data to server
    const response = await fetch("supplier.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(alternativeData),
    })

    // Hide loading modal
    hideLoadingModal()

    // Get the response text first
    const responseText = await response.text()
    console.log("Server response:", responseText)

    // Try to parse as JSON
    let result
    try {
      result = JSON.parse(responseText)
    } catch (parseError) {
      // If it's not valid JSON, show the raw response for debugging
      console.error("Server returned non-JSON response:", responseText)
      throw new Error(`Server returned invalid JSON. Response starts with: ${responseText.substring(0, 100)}...`)
    }

    // Close the modal
    const modal = bootstrap.Modal.getInstance(document.getElementById("addAlternativeModal"))
    modal.hide()

    // Reset the form
    document.getElementById("add-alternative-form").reset()
    document.getElementById("alternative-pineapple-fields").style.display = "none"
    document.getElementById("alternative-physical-fields").style.display = "none"
    document.getElementById("alternative-online-fields").style.display = "none"

    if (!response.ok) {
      throw new Error(`Server returned ${response.status}: ${result.message || response.statusText}`)
    }

    if (result.status !== "success") {
      throw new Error(result.message || "Unknown error")
    }

    // Check if this is for the fixed pineapple supplier
    if (isFixedPineapple) {
      // Reload fixed pineapple supplier data
      await loadFixedPineappleSupplier()
    } else {
      // Reload suppliers from database
      await loadSuppliers()
    }

    // Show success message
    showSuccessModal("Alternative supplier added successfully!")
  } catch (error) {
    console.error("Error adding alternative supplier:", error)
    showErrorModal("Failed to add alternative supplier: " + error.message)

    // Try to reload data anyway
    try {
      if (isFixedPineapple) {
        await loadFixedPineappleSupplier()
      } else {
        await loadSuppliers()
      }
    } catch (loadError) {
      console.error("Error reloading data:", loadError)
    }
  } finally {
    // Re-enable the save button after the operation completes (success or failure)
    saveButton.disabled = false
  }
}

// Helper function to format date and time
function formatDateTime(dateTimeStr) {
  if (!dateTimeStr) return null

  try {
    const date = new Date(dateTimeStr)
    return date.toLocaleString()
  } catch (e) {
    console.error("Error formatting date:", e)
    return dateTimeStr // Return the original string if parsing fails
  }
}

// Add a variable to track when the loading modal was shown
let loadingModalShownTime = 0

// Modify the showLoadingModal function to record the time
function showLoadingModal(message = "Loading...") {
  try {
    const loadingModal = document.getElementById("loadingModal")
    if (loadingModal) {
      document.getElementById("loading-message").textContent = message
      const modal = new bootstrap.Modal(loadingModal, {
        backdrop: "static", // Prevent closing when clicking outside
        keyboard: false, // Prevent closing with keyboard
      })
      modal.show()
      // Record the time when the loading modal is shown
      loadingModalShownTime = Date.now()
    }
  } catch (error) {
    console.error("Error showing loading modal:", error)
  }
}

// Modify the hideLoadingModal function to enforce minimum display time
function hideLoadingModal() {
  try {
    const loadingModal = document.getElementById("loadingModal")
    if (loadingModal) {
      // Calculate how long the modal has been visible
      const currentTime = Date.now()
      const elapsedTime = currentTime - loadingModalShownTime
      const minimumDisplayTime = 2000 // 2 seconds in milliseconds

      // If the modal hasn't been visible for at least 2 seconds, delay hiding it
      if (elapsedTime < minimumDisplayTime) {
        const remainingTime = minimumDisplayTime - elapsedTime
        console.log(`Loading modal shown for ${elapsedTime}ms, waiting ${remainingTime}ms more`)

        setTimeout(() => {
          hideLoadingModalImmediately(loadingModal)
        }, remainingTime)
      } else {
        // If it's been visible for at least 2 seconds, hide it immediately
        hideLoadingModalImmediately(loadingModal)
      }
    }
  } catch (error) {
    console.error("Error hiding loading modal:", error)
    // Last resort fallback - force remove all modal-related elements
    try {
      document.body.classList.remove("modal-open")
      const backdrops = document.getElementsByClassName("modal-backdrop")
      while (backdrops.length > 0) {
        backdrops[0].parentNode.removeChild(backdrops[0])
      }
    } catch (e) {
      console.error("Error in fallback modal cleanup:", e)
    }
  }
}

// Helper function to actually hide the loading modal
function hideLoadingModalImmediately(loadingModal) {
  try {
    // Try to get the Bootstrap modal instance
    const modal = bootstrap.Modal.getInstance(loadingModal)

    // If the instance exists, hide it
    if (modal) {
      modal.hide()
    } else {
      // Fallback method if bootstrap.Modal.getInstance fails
      try {
        $(loadingModal).modal("hide")
      } catch (error) {
        console.error("jQuery fallback failed:", error)
      }
    }

    // Additional fallback - force remove modal classes and backdrop
    setTimeout(() => {
      loadingModal.classList.remove("show")
      loadingModal.style.display = "none"
      document.body.classList.remove("modal-open")
      const backdrops = document.getElementsByClassName("modal-backdrop")
      while (backdrops.length > 0) {
        backdrops[0].parentNode.removeChild(backdrops[0])
      }
    }, 100)
  } catch (error) {
    console.error("Error in hideLoadingModalImmediately:", error)
  }
}

// Show success modal
function showSuccessModal(message) {
  // Ensure loading modal is hidden first
  hideLoadingModal()

  // Small delay to ensure loading modal is fully hidden
  setTimeout(() => {
    try {
      const successModal = document.getElementById("successModal")
      if (successModal) {
        document.getElementById("success-message").textContent = message
        const modal = new bootstrap.Modal(successModal)
        modal.show()

        // Auto-hide after 2 seconds
        setTimeout(() => {
          try {
            const modalInstance = bootstrap.Modal.getInstance(successModal)
            if (modalInstance) {
              modalInstance.hide()
            }
          } catch (error) {
            console.error("Error hiding success modal:", error)
          }
        }, 2000)
      }
    } catch (error) {
      console.error("Error showing success modal:", error)
      // Show a simple alert as fallback
      alert(message)
    }
  }, 300)
}

// Show error modal
function showErrorModal(message) {
  // Ensure loading modal is hidden first
  hideLoadingModal()

  // Small delay to ensure loading modal is fully hidden
  setTimeout(() => {
    try {
      const errorModal = document.getElementById("errorModal")
      if (errorModal) {
        document.getElementById("error-message").textContent = message
        const modal = new bootstrap.Modal(errorModal)
        modal.show()
      }
    } catch (error) {
      console.error("Error showing error modal:", error)
      // Show a simple alert as fallback
      alert("Error: " + message)
    }
  }, 300)
}

// Show toast notification
function showToast(message, type = "success") {
  // Create toast container if it doesn't exist
  let toastContainer = document.getElementById("toast-container")

  if (!toastContainer) {
    toastContainer = document.createElement("div")
    toastContainer.id = "toast-container"
    toastContainer.className = "toast-container position-fixed bottom-0 end-0 p-3"
    document.body.appendChild(toastContainer)
  }

  // Create toast element
  const toastId = "toast-" + Date.now()
  const toast = document.createElement("div")
  toast.id = toastId
  toast.className = "toast"
  toast.setAttribute("role", "alert")
  toast.setAttribute("aria-live", "assertive")
  toast.setAttribute("aria-atomic", "true")

  // Set header background based on type
  let headerClass = ""
  switch (type) {
    case "success":
      headerClass = "bg-success text-white"
      break
    case "warning":
      headerClass = "bg-warning"
      break
    case "danger":
      headerClass = "bg-danger text-white"
      break
    case "info":
      headerClass = "bg-info text-white"
      break
    default:
      headerClass = ""
  }

  toast.innerHTML = `
    <div class="toast-header ${headerClass}">
      <strong class="me-auto">Notification</strong>
      <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
    </div>
    <div class="toast-body">
      ${message}
    </div>
  `

  toastContainer.appendChild(toast)

  // Show toast
  const bsToast = new bootstrap.Toast(toast)
  bsToast.show()

  // Remove toast after it's hidden
  toast.addEventListener("hidden.bs.toast", () => {
    toast.remove()
  })
}

// Load fixed pineapple supplier from database
async function loadFixedPineappleSupplier() {
  try {
    // Show loading indicator
    console.log("Loading fixed pineapple supplier data...")

    // Fetch fixed pineapple supplier data
    const response = await fetch("supplier.php?id=fixed-pineapple")

    // Check if response is OK
    if (!response.ok) {
      throw new Error(`Server returned ${response.status}: ${response.statusText}`)
    }

    // Parse the JSON response
    const result = await response.json()

    if (result.status === "success" && result.data) {
      // Update global variable with data from database
      fixedPineappleSupplier = result.data
      console.log("Fixed pineapple supplier data loaded:", fixedPineappleSupplier)

      // Also load alternatives
      try {
        const altResponse = await fetch("supplier.php?type=fixed-pineapple-alternatives")

        if (altResponse.ok) {
          const altResult = await altResponse.json()

          if (altResult.status === "success") {
            fixedPineappleSupplier.alternatives = altResult.data || []
            console.log("Fixed pineapple alternatives loaded:", fixedPineappleSupplier.alternatives)
          }
        }
      } catch (altError) {
        console.error("Error loading fixed pineapple alternatives:", altError)
        // Continue without alternatives
        fixedPineappleSupplier.alternatives = []
      }

      // Update the fixed pineapple supplier section with the fetched data
      updateFixedPineappleSupplierSection()

      return fixedPineappleSupplier
    } else {
      throw new Error(result.message || "Unknown error")
    }
  } catch (error) {
    console.error("Error loading fixed pineapple supplier:", error)

    // If there's an error, we'll use default data as fallback
    fixedPineappleSupplier = {
      id: "fixed-pineapple",
      name: "Premium Pineapple Farm",
      contactInfo: "+1 (555) 789-0123",
      farmLocation: "Tropical Valley, Hawaii",
      deliveryInfo: "Business Driver",
      communicationMode: "Call",
      notes: "Our primary pineapple supplier with premium quality",
      harvestSeason: "Year-round with peak in summer",
      plantingCycle: "12-18 months",
      variety: "MD-2 Sweet Gold",
      shelfLife: "5-7 days at room temperature, 10-14 days refrigerated",
      alternatives: [],
    }

    // Update the display with default data
    updateFixedPineappleSupplierSection()

    throw error
  }
}

// Load suppliers from database
async function loadSuppliers() {
  try {
    // Fetch suppliers data
    const response = await fetch("supplier.php?type=all")

    // Check if response is OK
    if (!response.ok) {
      throw new Error(`Server returned ${response.status}: ${response.statusText}`)
    }

    // Check content type to ensure we're getting JSON
    const contentType = response.headers.get("content-type")
    if (!contentType || !contentType.includes("application/json")) {
      // Try to get the text to see what's being returned
      const text = await response.text()
      console.error("Server returned non-JSON response:", text.substring(0, 100) + "...")
      throw new Error("Server returned non-JSON response. Check server logs.")
    }

    const result = await response.json()

    if (result.status === "success" && result.data) {
      // Update global variable with data from database
      suppliers = result.data

      // Load alternatives for each supplier
      for (const supplier of suppliers) {
        try {
          const altResponse = await fetch(`supplier.php?supplier_id=${supplier.id}&type=alternatives`)

          if (altResponse.ok) {
            const contentType = altResponse.headers.get("content-type")
            if (contentType && contentType.includes("application/json")) {
              const altResult = await altResponse.json()

              if (altResult.status === "success") {
                supplier.alternatives = altResult.data || []
              }
            }
          }
        } catch (altError) {
          console.error(`Error loading alternatives for supplier ${supplier.id}:`, altError)
          supplier.alternatives = []
        }
      }

      // Update the display
      displaySuppliers()
      return suppliers
    } else {
      throw new Error(result.message || "Unknown error")
    }
  } catch (error) {
    console.error("Error loading suppliers:", error)
    throw error
  }
}

// Initialize the edit fixed pineapple modal events when the modal is shown
function initializeEditFixedPineappleModalEvents() {
  // The external library (pineapple-supplier-modals.js) will handle most of the initialization
  // We just need to make sure any specific functionality not covered by the library is initialized

  // Fixed pineapple edit modal delivery change
  const editFixedDelivery = document.getElementById("edit-fixed-delivery")
  if (editFixedDelivery) {
    editFixedDelivery.addEventListener("change", function () {
      const deliveryInfo = this.value
      document.getElementById("edit-fixed-other-delivery-container").style.display =
        deliveryInfo === "Other" ? "block" : "none"
    })
  }

  // Fixed pineapple edit modal communication change
  const editFixedCommunication = document.getElementById("edit-fixed-communication")
  if (editFixedCommunication) {
    editFixedCommunication.addEventListener("change", function () {
      const communicationModeValue = this.value
      document.getElementById("edit-fixed-other-communication-container").style.display =
        communicationModeValue === "Other" ? "block" : "none"
    })
  }
}
