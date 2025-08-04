// Pineapple Supplier Modals - Enhanced with comprehensive location service
class PineappleSupplierModals {
  constructor() {
    this.locationPickers = new Map()
    this.init()
  }

  init() {
    this.bindEvents()
    this.initializeLocationService()
  }

  async initializeLocationService() {
    try {
      if (window.comprehensiveLocationService && !window.comprehensiveLocationService.isReady()) {
        await window.comprehensiveLocationService.init()
        console.log("Comprehensive Location Service initialized for pineapple modals")
      }
    } catch (error) {
      console.warn("Failed to initialize location service:", error)
    }
  }

  bindEvents() {
    // Country code dropdown handlers
    document.addEventListener("click", (e) => {
      if (e.target.matches(".country-code-dropdown .dropdown-item")) {
        e.preventDefault()
        const code = e.target.getAttribute("data-code")
        const btn = e.target.closest(".input-group").querySelector(".country-code-btn")
        const phoneInput = e.target.closest(".input-group").querySelector(".phone-input")
        const hiddenInput = e.target.closest(".input-group").querySelector(".full-contact-info")

        btn.textContent = code
        this.updateContactInfo(phoneInput, hiddenInput, code)
      }
    })

    // Phone input handlers
    document.addEventListener("input", (e) => {
      if (e.target.matches(".phone-input")) {
        const btn = e.target.closest(".input-group").querySelector(".country-code-btn")
        const hiddenInput = e.target.closest(".input-group").querySelector(".full-contact-info")
        const code = btn.textContent
        this.updateContactInfo(e.target, hiddenInput, code)
      }
    })

    // Harvest season handlers
    document.addEventListener("change", (e) => {
      if (e.target.matches(".harvest-season-select")) {
        this.handleHarvestSeasonChange(e.target)
      }
    })

    // Planting cycle handlers
    document.addEventListener("change", (e) => {
      if (e.target.matches(".planting-cycle-select")) {
        this.handlePlantingCycleChange(e.target)
      }
    })

    // Variety handlers
    document.addEventListener("change", (e) => {
      if (e.target.matches(".variety-select")) {
        this.handleVarietyChange(e.target)
      }
    })

    // Shelf life handlers
    document.addEventListener("change", (e) => {
      if (e.target.matches(".shelf-life-select")) {
        this.handleShelfLifeChange(e.target)
      }
    })

    // Custom input handlers for harvest season
    document.addEventListener("change", (e) => {
      if (e.target.matches(".harvest-from-month, .harvest-to-month")) {
        this.updateHarvestSeasonValue(e.target)
      }
    })

    // Custom input handlers for planting cycle
    document.addEventListener("input", (e) => {
      if (e.target.matches(".planting-cycle-min, .planting-cycle-max")) {
        this.updatePlantingCycleValue(e.target)
      }
    })

    // Custom input handlers for variety
    document.addEventListener("input", (e) => {
      if (e.target.matches(".variety-custom-input")) {
        this.updateVarietyValue(e.target)
      }
    })

    // Custom input handlers for shelf life
    document.addEventListener("input", (e) => {
      if (
        e.target.matches(".shelf-life-room-min, .shelf-life-room-max, .shelf-life-refrig-min, .shelf-life-refrig-max")
      ) {
        this.updateShelfLifeValue(e.target)
      }
    })

    // Modal show handlers to initialize location pickers
    document.addEventListener("show.bs.modal", (e) => {
      if (e.target.id === "addAlternativeModal") {
        setTimeout(() => this.initializeLocationPicker("farm-location-picker-container"), 100)
      } else if (e.target.id === "editFixedPineappleModal") {
        setTimeout(() => this.initializeLocationPicker("edit-farm-location-picker-container"), 100)
      } else if (e.target.id === "editAlternativeModal") {
        setTimeout(() => this.initializeLocationPicker("edit-alternative-farm-location-picker-container"), 100)
      }
    })
  }

  async initializeLocationPicker(containerId) {
    const container = document.getElementById(containerId)
    if (!container) return

    try {
      // Clear existing picker if any
      if (this.locationPickers.has(containerId)) {
        this.locationPickers.get(containerId).reset()
      }

      // Create new location picker
      const picker = new window.AdvancedLocationPicker(container, {
        showSearch: true,
        showCountrySelector: true,
        showStateSelector: true,
        showCitySelector: true,
        showCustomInput: true,
        defaultCountry: "PH",
        placeholder: "Search for farm location worldwide...",
        searchMinLength: 2,
        maxSearchResults: 15,
        showPopularCities: true,
      })

      // Store the picker
      this.locationPickers.set(containerId, picker)

      // Set up change handler to update hidden field
      const hiddenInput = container.closest(".mb-3").querySelector(".full-location")
      if (hiddenInput) {
        picker.hiddenInput.addEventListener("change", () => {
          hiddenInput.value = picker.getValue()
        })
      }

      console.log(`Location picker initialized for ${containerId}`)
    } catch (error) {
      console.error(`Failed to initialize location picker for ${containerId}:`, error)
    }
  }

  updateContactInfo(phoneInput, hiddenInput, countryCode) {
    if (!phoneInput || !hiddenInput) return

    const phoneNumber = phoneInput.value.trim()
    if (phoneNumber) {
      hiddenInput.value = `${countryCode} ${phoneNumber}`
    } else {
      hiddenInput.value = ""
    }
  }

  handleHarvestSeasonChange(select) {
    const container = select.closest(".mb-3")
    const customContainer = container.querySelector(".harvest-season-custom")
    const hiddenInput = container.querySelector(".full-harvest-season")

    if (select.value === "custom") {
      customContainer.style.display = "block"
      this.updateHarvestSeasonValue(select)
    } else {
      customContainer.style.display = "none"
      hiddenInput.value = select.value
    }
  }

  updateHarvestSeasonValue(element) {
    const container = element.closest(".mb-3")
    const select = container.querySelector(".harvest-season-select")
    const fromMonth = container.querySelector(".harvest-from-month")
    const toMonth = container.querySelector(".harvest-to-month")
    const hiddenInput = container.querySelector(".full-harvest-season")

    if (select.value === "custom" && fromMonth && toMonth) {
      if (fromMonth.value && toMonth.value) {
        hiddenInput.value = `${fromMonth.value}-${toMonth.value}`
      }
    }
  }

  handlePlantingCycleChange(select) {
    const container = select.closest(".mb-3")
    const customContainer = container.querySelector(".planting-cycle-custom")
    const hiddenInput = container.querySelector(".full-planting-cycle")

    if (select.value === "custom") {
      customContainer.style.display = "block"
      this.updatePlantingCycleValue(select)
    } else {
      customContainer.style.display = "none"
      hiddenInput.value = select.value
    }
  }

  updatePlantingCycleValue(element) {
    const container = element.closest(".mb-3")
    const select = container.querySelector(".planting-cycle-select")
    const minInput = container.querySelector(".planting-cycle-min")
    const maxInput = container.querySelector(".planting-cycle-max")
    const hiddenInput = container.querySelector(".full-planting-cycle")

    if (select.value === "custom" && minInput && maxInput) {
      const min = minInput.value
      const max = maxInput.value
      if (min && max) {
        hiddenInput.value = `${min}-${max} months`
      } else if (min) {
        hiddenInput.value = `${min}+ months`
      }
    }
  }

  handleVarietyChange(select) {
    const container = select.closest(".mb-3")
    const customContainer = container.querySelector(".variety-custom")
    const hiddenInput = container.querySelector(".full-variety")

    if (select.value === "custom") {
      customContainer.style.display = "block"
      this.updateVarietyValue(select)
    } else {
      customContainer.style.display = "none"
      hiddenInput.value = select.value
    }
  }

  updateVarietyValue(element) {
    const container = element.closest(".mb-3")
    const select = container.querySelector(".variety-select")
    const customInput = container.querySelector(".variety-custom-input")
    const hiddenInput = container.querySelector(".full-variety")

    if (select.value === "custom" && customInput) {
      hiddenInput.value = customInput.value
    }
  }

  handleShelfLifeChange(select) {
    const container = select.closest(".mb-3")
    const customContainer = container.querySelector(".shelf-life-custom")
    const hiddenInput = container.querySelector(".full-shelf-life")

    if (select.value === "custom") {
      customContainer.style.display = "block"
      this.updateShelfLifeValue(select)
    } else {
      customContainer.style.display = "none"
      hiddenInput.value = select.value
    }
  }

  updateShelfLifeValue(element) {
    const container = element.closest(".mb-3")
    const select = container.querySelector(".shelf-life-select")
    const roomMin = container.querySelector(".shelf-life-room-min")
    const roomMax = container.querySelector(".shelf-life-room-max")
    const refrigMin = container.querySelector(".shelf-life-refrig-min")
    const refrigMax = container.querySelector(".shelf-life-refrig-max")
    const hiddenInput = container.querySelector(".full-shelf-life")

    if (select.value === "custom") {
      const parts = []

      if (roomMin?.value && roomMax?.value) {
        parts.push(`${roomMin.value}-${roomMax.value} days at room temperature`)
      } else if (roomMin?.value) {
        parts.push(`${roomMin.value}+ days at room temperature`)
      }

      if (refrigMin?.value && refrigMax?.value) {
        parts.push(`${refrigMin.value}-${refrigMax.value} days refrigerated`)
      } else if (refrigMin?.value) {
        parts.push(`${refrigMin.value}+ days refrigerated`)
      }

      hiddenInput.value = parts.join(", ")
    }
  }

  // Utility methods for getting/setting values
  getLocationPickerValue(containerId) {
    const picker = this.locationPickers.get(containerId)
    return picker ? picker.getValue() : ""
  }

  setLocationPickerValue(containerId, value) {
    const picker = this.locationPickers.get(containerId)
    if (picker) {
      picker.setValue(value)
    }
  }

  // Method to populate contact info field
  populateContactInfo(containerId, contactInfo) {
    const container = document.getElementById(containerId)
    if (!container) return

    // Parse contact info (e.g., "+63 9495027266")
    const parts = contactInfo.split(" ")
    if (parts.length >= 2) {
      const countryCode = parts[0]
      const phoneNumber = parts.slice(1).join(" ")

      const btn = container.querySelector(".country-code-btn")
      const phoneInput = container.querySelector(".phone-input")
      const hiddenInput = container.querySelector(".full-contact-info")

      if (btn) btn.textContent = countryCode
      if (phoneInput) phoneInput.value = phoneNumber
      if (hiddenInput) hiddenInput.value = contactInfo
    }
  }

  // Method to populate harvest season field
  populateHarvestSeason(containerId, harvestSeason) {
    const container = document.getElementById(containerId)
    if (!container) return

    const select = container.querySelector(".harvest-season-select")
    const hiddenInput = container.querySelector(".full-harvest-season")

    if (!select || !hiddenInput) return

    // Check if it's a predefined option
    const option = Array.from(select.options).find((opt) => opt.value === harvestSeason)
    if (option) {
      select.value = harvestSeason
      hiddenInput.value = harvestSeason
    } else {
      // Custom range
      select.value = "custom"
      hiddenInput.value = harvestSeason

      const customContainer = container.querySelector(".harvest-season-custom")
      if (customContainer) {
        customContainer.style.display = "block"

        // Try to parse custom range (e.g., "March-June")
        const parts = harvestSeason.split("-")
        if (parts.length === 2) {
          const fromMonth = container.querySelector(".harvest-from-month")
          const toMonth = container.querySelector(".harvest-to-month")
          if (fromMonth) fromMonth.value = parts[0]
          if (toMonth) toMonth.value = parts[1]
        }
      }
    }
  }

  // Method to populate planting cycle field
  populatePlantingCycle(containerId, plantingCycle) {
    const container = document.getElementById(containerId)
    if (!container) return

    const select = container.querySelector(".planting-cycle-select")
    const hiddenInput = container.querySelector(".full-planting-cycle")

    if (!select || !hiddenInput) return

    // Check if it's a predefined option
    const option = Array.from(select.options).find((opt) => opt.value === plantingCycle)
    if (option) {
      select.value = plantingCycle
      hiddenInput.value = plantingCycle
    } else {
      // Custom range
      select.value = "custom"
      hiddenInput.value = plantingCycle

      const customContainer = container.querySelector(".planting-cycle-custom")
      if (customContainer) {
        customContainer.style.display = "block"

        // Try to parse custom range (e.g., "15-20 months")
        const match = plantingCycle.match(/(\d+)-(\d+)\s*months?/)
        if (match) {
          const minInput = container.querySelector(".planting-cycle-min")
          const maxInput = container.querySelector(".planting-cycle-max")
          if (minInput) minInput.value = match[1]
          if (maxInput) maxInput.value = match[2]
        }
      }
    }
  }

  // Method to populate variety field
  populateVariety(containerId, variety) {
    const container = document.getElementById(containerId)
    if (!container) return

    const select = container.querySelector(".variety-select")
    const hiddenInput = container.querySelector(".full-variety")

    if (!select || !hiddenInput) return

    // Check if it's a predefined option
    const option = Array.from(select.options).find((opt) => opt.value === variety)
    if (option) {
      select.value = variety
      hiddenInput.value = variety
    } else {
      // Custom variety
      select.value = "custom"
      hiddenInput.value = variety

      const customContainer = container.querySelector(".variety-custom")
      if (customContainer) {
        customContainer.style.display = "block"
        const customInput = container.querySelector(".variety-custom-input")
        if (customInput) customInput.value = variety
      }
    }
  }

  // Method to populate shelf life field
  populateShelfLife(containerId, shelfLife) {
    const container = document.getElementById(containerId)
    if (!container) return

    const select = container.querySelector(".shelf-life-select")
    const hiddenInput = container.querySelector(".full-shelf-life")

    if (!select || !hiddenInput) return

    // Check if it's a predefined option
    const option = Array.from(select.options).find((opt) => opt.value === shelfLife)
    if (option) {
      select.value = shelfLife
      hiddenInput.value = shelfLife
    } else {
      // Custom shelf life
      select.value = "custom"
      hiddenInput.value = shelfLife

      const customContainer = container.querySelector(".shelf-life-custom")
      if (customContainer) {
        customContainer.style.display = "block"

        // Try to parse custom shelf life
        // This is a simplified parser - you might want to make it more robust
        const roomMatch = shelfLife.match(/(\d+)-(\d+)\s*days at room temperature/)
        const refrigMatch = shelfLife.match(/(\d+)-(\d+)\s*days refrigerated/)

        if (roomMatch) {
          const roomMin = container.querySelector(".shelf-life-room-min")
          const roomMax = container.querySelector(".shelf-life-room-max")
          if (roomMin) roomMin.value = roomMatch[1]
          if (roomMax) roomMax.value = roomMatch[2]
        }

        if (refrigMatch) {
          const refrigMin = container.querySelector(".shelf-life-refrig-min")
          const refrigMax = container.querySelector(".shelf-life-refrig-max")
          if (refrigMin) refrigMin.value = refrigMatch[1]
          if (refrigMax) refrigMax.value = refrigMatch[2]
        }
      }
    }
  }

  // Method to reset all fields in a modal
  resetModal(modalId) {
    const modal = document.getElementById(modalId)
    if (!modal) return

    // Reset all form inputs
    const form = modal.querySelector("form")
    if (form) {
      form.reset()
    }

    // Hide all custom containers
    modal
      .querySelectorAll(".harvest-season-custom, .planting-cycle-custom, .variety-custom, .shelf-life-custom")
      .forEach((container) => {
        container.style.display = "none"
      })

    // Reset country code buttons
    modal.querySelectorAll(".country-code-btn").forEach((btn) => {
      btn.textContent = "+63"
    })

    // Reset location pickers
    this.locationPickers.forEach((picker, containerId) => {
      if (modal.contains(document.getElementById(containerId))) {
        picker.reset()
      }
    })
  }
}

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  window.pineappleSupplierModals = new PineappleSupplierModals()
})

// Export for use in other modules
if (typeof module !== "undefined" && module.exports) {
  module.exports = PineappleSupplierModals
}
