// Advanced Location Picker with comprehensive location support
class AdvancedLocationPicker {
  constructor(container, options = {}) {
    this.container = container
    this.options = {
      showSearch: true,
      showCountrySelector: true,
      showStateSelector: true,
      showCitySelector: true,
      showCustomInput: true,
      defaultCountry: "PH",
      placeholder: "Search for any location worldwide...",
      searchMinLength: 2,
      maxSearchResults: 15,
      showPopularCities: true,
      ...options,
    }
    this.selectedLocation = null
    this.searchTimeout = null
    this.isLoading = false
    this.init()
  }

  async init() {
    this.createHTML()
    this.bindEvents()
    await this.loadInitialData()
  }

  createHTML() {
    this.container.innerHTML = `
      <div class="advanced-location-picker">
        ${
          this.options.showSearch
            ? `
          <div class="location-search-container mb-3">
            <div class="input-group">
              <input type="text" class="form-control location-search-input" 
                     placeholder="${this.options.placeholder}">
              <button class="btn btn-outline-secondary location-search-btn" type="button">
                <i class="bi bi-search"></i>
              </button>
            </div>
            <div class="location-search-results position-relative" style="display: none;">
              <div class="search-results-dropdown position-absolute w-100 bg-white border rounded shadow-sm" style="z-index: 1000; max-height: 300px; overflow-y: auto;">
                <!-- Search results will be inserted here -->
              </div>
            </div>
          </div>
        `
            : ""
        }
        
        <div class="location-selectors">
          ${
            this.options.showCountrySelector
              ? `
            <div class="mb-2">
              <label class="form-label small text-muted">Country</label>
              <select class="form-select location-country">
                <option value="">Select Country</option>
              </select>
            </div>
          `
              : ""
          }
          
          ${
            this.options.showStateSelector
              ? `
            <div class="mb-2">
              <label class="form-label small text-muted">State/Region/Province</label>
              <select class="form-select location-state" disabled>
                <option value="">Select State/Region</option>
              </select>
            </div>
          `
              : ""
          }
          
          ${
            this.options.showCitySelector
              ? `
            <div class="mb-2">
              <label class="form-label small text-muted">City/Municipality</label>
              <select class="form-select location-city" disabled>
                <option value="">Select City</option>
              </select>
            </div>
          `
              : ""
          }
          
          ${
            this.options.showCustomInput
              ? `
            <div class="mb-2">
              <label class="form-label small text-muted">District/Barangay/Additional Info</label>
              <input type="text" class="form-control location-custom" 
                     placeholder="Enter district, barangay, or additional location details" disabled>
            </div>
          `
              : ""
          }
        </div>
        
        ${
          this.options.showPopularCities
            ? `
          <div class="popular-cities-container" style="display: none;">
            <label class="form-label small text-muted">Popular Cities</label>
            <div class="popular-cities-list">
              <!-- Popular cities will be inserted here -->
            </div>
          </div>
        `
            : ""
        }
        
        <input type="hidden" class="location-full-value">
        
        <div class="location-preview mt-2" style="display: none;">
          <div class="alert alert-info py-2 px-3 mb-0">
            <small><strong>Selected Location:</strong> <span class="location-preview-text"></span></small>
          </div>
        </div>
        
        <div class="loading-indicator text-center py-2" style="display: none;">
          <div class="spinner-border spinner-border-sm text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
          <small class="text-muted ms-2">Loading locations...</small>
        </div>
      </div>
    `

    // Get references to elements
    this.searchInput = this.container.querySelector(".location-search-input")
    this.searchBtn = this.container.querySelector(".location-search-btn")
    this.searchResults = this.container.querySelector(".location-search-results")
    this.searchDropdown = this.container.querySelector(".search-results-dropdown")
    this.countrySelect = this.container.querySelector(".location-country")
    this.stateSelect = this.container.querySelector(".location-state")
    this.citySelect = this.container.querySelector(".location-city")
    this.customInput = this.container.querySelector(".location-custom")
    this.popularCitiesContainer = this.container.querySelector(".popular-cities-container")
    this.popularCitiesList = this.container.querySelector(".popular-cities-list")
    this.hiddenInput = this.container.querySelector(".location-full-value")
    this.preview = this.container.querySelector(".location-preview")
    this.previewText = this.container.querySelector(".location-preview-text")
    this.loadingIndicator = this.container.querySelector(".loading-indicator")
  }

  bindEvents() {
    // Search functionality
    if (this.searchInput) {
      this.searchInput.addEventListener("input", this.handleSearchInput.bind(this))
      this.searchInput.addEventListener("focus", this.handleSearchFocus.bind(this))
      this.searchBtn.addEventListener("click", this.handleSearchClick.bind(this))
    }

    // Dropdown changes
    if (this.countrySelect) {
      this.countrySelect.addEventListener("change", this.handleCountryChange.bind(this))
    }
    if (this.stateSelect) {
      this.stateSelect.addEventListener("change", this.handleStateChange.bind(this))
    }
    if (this.citySelect) {
      this.citySelect.addEventListener("change", this.handleCityChange.bind(this))
    }
    if (this.customInput) {
      this.customInput.addEventListener("input", this.updateFullValue.bind(this))
    }

    // Click outside to close search results
    document.addEventListener("click", (e) => {
      if (!this.container.contains(e.target)) {
        this.hideSearchResults()
      }
    })

    // Keyboard navigation for search results
    if (this.searchInput) {
      this.searchInput.addEventListener("keydown", this.handleKeyNavigation.bind(this))
    }
  }

  async loadInitialData() {
    if (!window.comprehensiveLocationService) {
      console.error("Comprehensive Location Service not found")
      return
    }

    this.showLoading()

    try {
      // Initialize the service if not already done
      if (!window.comprehensiveLocationService.isReady()) {
        await window.comprehensiveLocationService.init()
      }

      // Load countries
      const countries = await window.comprehensiveLocationService.loadCountries()
      this.populateCountries(countries)

      // Set default country if specified
      if (this.options.defaultCountry && this.countrySelect) {
        this.countrySelect.value = this.options.defaultCountry
        await this.handleCountryChange()
      }
    } catch (error) {
      console.error("Error loading initial location data:", error)
    } finally {
      this.hideLoading()
    }
  }

  populateCountries(countries) {
    if (!this.countrySelect) return

    this.countrySelect.innerHTML = '<option value="">Select Country</option>'

    countries.forEach((country) => {
      const option = document.createElement("option")
      option.value = country.code
      option.textContent = `${country.flag} ${country.name}`
      this.countrySelect.appendChild(option)
    })
  }

  async handleCountryChange() {
    const countryCode = this.countrySelect?.value

    // Reset dependent dropdowns
    this.resetSelect(this.stateSelect, "Select State/Region")
    this.resetSelect(this.citySelect, "Select City")
    if (this.customInput) this.customInput.value = ""

    // Update disabled states
    if (this.stateSelect) this.stateSelect.disabled = !countryCode
    if (this.citySelect) this.citySelect.disabled = true
    if (this.customInput) this.customInput.disabled = true

    if (countryCode) {
      this.showLoading()

      try {
        // Load states for the selected country
        const states = await window.comprehensiveLocationService.getStates(countryCode)
        this.populateStates(states)

        // Load popular cities for the country
        if (this.options.showPopularCities) {
          const popularCities = await window.comprehensiveLocationService.getPopularCities(countryCode)
          this.displayPopularCities(popularCities)
        }
      } catch (error) {
        console.error("Error loading states:", error)
      } finally {
        this.hideLoading()
      }
    } else {
      this.hidePopularCities()
    }

    this.updateFullValue()
  }

  populateStates(states) {
    if (!this.stateSelect) return

    this.stateSelect.innerHTML = '<option value="">Select State/Region</option>'

    states.forEach((state) => {
      const option = document.createElement("option")
      option.value = state.code
      option.textContent = state.name
      this.stateSelect.appendChild(option)
    })
  }

  async handleStateChange() {
    const countryCode = this.countrySelect?.value
    const stateCode = this.stateSelect?.value

    // Reset dependent dropdowns
    this.resetSelect(this.citySelect, "Select City")
    if (this.customInput) this.customInput.value = ""

    // Update disabled states
    if (this.citySelect) this.citySelect.disabled = !stateCode
    if (this.customInput) this.customInput.disabled = true

    if (countryCode && stateCode) {
      this.showLoading()

      try {
        const cities = await window.comprehensiveLocationService.getCities(countryCode, stateCode)
        this.populateCities(cities)
      } catch (error) {
        console.error("Error loading cities:", error)
      } finally {
        this.hideLoading()
      }
    }

    this.updateFullValue()
  }

  populateCities(cities) {
    if (!this.citySelect) return

    this.citySelect.innerHTML = '<option value="">Select City</option>'

    cities.forEach((city) => {
      const option = document.createElement("option")
      option.value = city.name
      option.textContent = city.name + (city.population ? ` (${this.formatPopulation(city.population)})` : "")
      this.citySelect.appendChild(option)
    })
  }

  handleCityChange() {
    if (this.customInput) {
      this.customInput.disabled = !this.citySelect?.value
    }
    this.updateFullValue()
  }

  handleSearchInput() {
    clearTimeout(this.searchTimeout)

    const query = this.searchInput.value.trim()

    if (query.length < this.options.searchMinLength) {
      this.hideSearchResults()
      return
    }

    this.searchTimeout = setTimeout(() => {
      this.performSearch(query)
    }, 300)
  }

  handleSearchFocus() {
    const query = this.searchInput.value.trim()
    if (query.length >= this.options.searchMinLength) {
      this.performSearch(query)
    }
  }

  handleSearchClick() {
    const query = this.searchInput.value.trim()
    if (query.length >= this.options.searchMinLength) {
      this.performSearch(query)
    }
  }

  async performSearch(query) {
    if (this.isLoading) return

    this.isLoading = true
    this.showSearchLoading()

    try {
      const results = await window.comprehensiveLocationService.searchLocations(
        query,
        this.countrySelect?.value,
        this.options.maxSearchResults,
      )

      this.displaySearchResults(results)
    } catch (error) {
      console.error("Error searching locations:", error)
      this.displaySearchError()
    } finally {
      this.isLoading = false
    }
  }

  displaySearchResults(results) {
    if (!this.searchDropdown) return

    if (results.length === 0) {
      this.searchDropdown.innerHTML = `
        <div class="p-3 text-center text-muted">
          <i class="bi bi-search"></i>
          <div>No locations found</div>
          <small>Try a different search term</small>
        </div>
      `
    } else {
      this.searchDropdown.innerHTML = results
        .map(
          (result, index) => `
        <div class="location-search-result p-2 border-bottom cursor-pointer" 
             data-index="${index}" 
             data-location='${JSON.stringify(result)}'>
          <div class="d-flex justify-content-between align-items-start">
            <div>
              <div class="fw-bold">${this.highlightSearchTerm(result.name, this.searchInput.value)}</div>
              <small class="text-muted">${result.fullName}</small>
              ${result.population ? `<div><small class="badge bg-light text-dark">${this.formatPopulation(result.population)} people</small></div>` : ""}
            </div>
            <div class="text-end">
              ${result.isCapital ? '<small class="badge bg-warning">Capital</small>' : ""}
              ${result.countryCode ? `<div><small class="text-muted">${result.countryCode}</small></div>` : ""}
            </div>
          </div>
        </div>
      `,
        )
        .join("")

      // Bind click events to results
      this.searchDropdown.querySelectorAll(".location-search-result").forEach((item) => {
        item.addEventListener("click", () => {
          const location = JSON.parse(item.getAttribute("data-location"))
          this.selectSearchResult(location)
        })

        item.addEventListener("mouseenter", () => {
          this.highlightSearchResult(item)
        })
      })
    }

    this.showSearchResults()
  }

  displaySearchError() {
    if (!this.searchDropdown) return

    this.searchDropdown.innerHTML = `
      <div class="p-3 text-center text-danger">
        <i class="bi bi-exclamation-triangle"></i>
        <div>Search failed</div>
        <small>Please try again</small>
      </div>
    `
    this.showSearchResults()
  }

  selectSearchResult(location) {
    this.selectedLocation = location
    this.searchInput.value = location.fullName
    this.hiddenInput.value = location.fullName
    this.updatePreview(location.fullName)
    this.hideSearchResults()

    // Try to set dropdowns if possible
    if (location.countryCode && this.countrySelect) {
      this.countrySelect.value = location.countryCode
      this.handleCountryChange()
    }

    // Trigger change event
    this.hiddenInput.dispatchEvent(new Event("change"))
  }

  displayPopularCities(cities) {
    if (!this.popularCitiesContainer || !this.popularCitiesList) return

    if (cities.length === 0) {
      this.hidePopularCities()
      return
    }

    this.popularCitiesList.innerHTML = cities
      .slice(0, 8)
      .map(
        (city) => `
      <button type="button" class="btn btn-outline-secondary btn-sm me-1 mb-1 popular-city-btn" 
              data-city='${JSON.stringify(city)}'>
        ${city.name}
        ${city.isCapital ? " 🏛️" : ""}
      </button>
    `,
      )
      .join("")

    // Bind click events
    this.popularCitiesList.querySelectorAll(".popular-city-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const city = JSON.parse(btn.getAttribute("data-city"))
        this.selectPopularCity(city)
      })
    })

    this.popularCitiesContainer.style.display = "block"
  }

  selectPopularCity(city) {
    if (this.citySelect) {
      this.citySelect.value = city.name
      this.handleCityChange()
    }

    if (this.searchInput) {
      this.searchInput.value = city.name
    }
  }

  hidePopularCities() {
    if (this.popularCitiesContainer) {
      this.popularCitiesContainer.style.display = "none"
    }
  }

  showSearchResults() {
    if (this.searchResults) {
      this.searchResults.style.display = "block"
    }
  }

  hideSearchResults() {
    if (this.searchResults) {
      this.searchResults.style.display = "none"
    }
  }

  showSearchLoading() {
    if (this.searchDropdown) {
      this.searchDropdown.innerHTML = `
        <div class="p-3 text-center">
          <div class="spinner-border spinner-border-sm text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
          <div class="mt-2">Searching locations...</div>
        </div>
      `
      this.showSearchResults()
    }
  }

  showLoading() {
    if (this.loadingIndicator) {
      this.loadingIndicator.style.display = "block"
    }
  }

  hideLoading() {
    if (this.loadingIndicator) {
      this.loadingIndicator.style.display = "none"
    }
  }

  updateFullValue() {
    const parts = []

    if (this.customInput?.value) parts.push(this.customInput.value)
    if (this.citySelect?.value) parts.push(this.citySelect.value)
    if (this.stateSelect?.value) {
      const stateText = this.stateSelect.options[this.stateSelect.selectedIndex]?.text
      if (stateText) parts.push(stateText)
    }
    if (this.countrySelect?.value) {
      const countryText = this.countrySelect.options[this.countrySelect.selectedIndex]?.text
      if (countryText) {
        // Remove flag emoji from country name
        const cleanCountryName = countryText.replace(/^[\u{1F1E6}-\u{1F1FF}]{2}\s*/u, "")
        parts.push(cleanCountryName)
      }
    }

    const fullValue = parts.join(", ")
    this.hiddenInput.value = fullValue
    this.updatePreview(fullValue)

    // Trigger change event
    this.hiddenInput.dispatchEvent(new Event("change"))
  }

  updatePreview(text) {
    if (text && this.preview && this.previewText) {
      this.previewText.textContent = text
      this.preview.style.display = "block"
    } else if (this.preview) {
      this.preview.style.display = "none"
    }
  }

  resetSelect(select, defaultText) {
    if (!select) return

    select.innerHTML = `<option value="">${defaultText}</option>`
  }

  highlightSearchTerm(text, term) {
    if (!term) return text

    const regex = new RegExp(`(${term})`, "gi")
    return text.replace(regex, "<mark>$1</mark>")
  }

  formatPopulation(population) {
    if (population >= 1000000) {
      return (population / 1000000).toFixed(1) + "M"
    } else if (population >= 1000) {
      return (population / 1000).toFixed(0) + "K"
    }
    return population.toString()
  }

  highlightSearchResult(item) {
    // Remove previous highlights
    this.searchDropdown.querySelectorAll(".location-search-result").forEach((el) => {
      el.classList.remove("bg-light")
    })

    // Highlight current item
    item.classList.add("bg-light")
  }

  handleKeyNavigation(e) {
    const results = this.searchDropdown?.querySelectorAll(".location-search-result")
    if (!results || results.length === 0) return

    const currentHighlight = this.searchDropdown.querySelector(".bg-light")
    let currentIndex = currentHighlight ? Array.from(results).indexOf(currentHighlight) : -1

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault()
        currentIndex = (currentIndex + 1) % results.length
        this.highlightSearchResult(results[currentIndex])
        break

      case "ArrowUp":
        e.preventDefault()
        currentIndex = currentIndex <= 0 ? results.length - 1 : currentIndex - 1
        this.highlightSearchResult(results[currentIndex])
        break

      case "Enter":
        e.preventDefault()
        if (currentHighlight) {
          const location = JSON.parse(currentHighlight.getAttribute("data-location"))
          this.selectSearchResult(location)
        }
        break

      case "Escape":
        this.hideSearchResults()
        break
    }
  }

  // Public methods
  getValue() {
    return this.hiddenInput.value
  }

  setValue(value) {
    this.hiddenInput.value = value
    if (this.searchInput) {
      this.searchInput.value = value
    }
    this.updatePreview(value)
  }

  getSelectedLocation() {
    return this.selectedLocation
  }

  reset() {
    if (this.searchInput) this.searchInput.value = ""
    if (this.countrySelect) this.countrySelect.value = ""
    if (this.stateSelect) this.stateSelect.value = ""
    if (this.citySelect) this.citySelect.value = ""
    if (this.customInput) this.customInput.value = ""

    this.hiddenInput.value = ""
    this.selectedLocation = null
    this.updatePreview("")
    this.hideSearchResults()
    this.hidePopularCities()
  }
}

// Make it globally available
window.AdvancedLocationPicker = AdvancedLocationPicker
