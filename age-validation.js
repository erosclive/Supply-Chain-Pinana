document.addEventListener("DOMContentLoaded", () => {
    // Get the birthday input and next button elements
    const birthdayInput = document.getElementById("birthday")
    const step1NextBtn = document.getElementById("step1NextBtn")
    const ageDisplay = document.getElementById("calculatedAge")
    const ageInput = document.getElementById("age")
  
    // Function to calculate age from birthday
    function calculateAge(birthDate) {
      const today = new Date()
      const birth = new Date(birthDate)
  
      let age = today.getFullYear() - birth.getFullYear()
      const monthDiff = today.getMonth() - birth.getMonth()
  
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--
      }
  
      return age
    }
  
    // Function to show the age validation modal
    function showAgeValidationModal() {
      // Create modal elements
      const modalBackdrop = document.createElement("div")
      modalBackdrop.className = "modal-backdrop fade show"
      document.body.appendChild(modalBackdrop)
  
      const modalHTML = `
        <div class="modal fade show" id="ageValidationModal" tabindex="-1" aria-labelledby="ageValidationModalLabel" style="display: block;" aria-modal="true">
          <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title text-danger" id="ageValidationModalLabel">
                  <i class="bi bi-exclamation-triangle-fill me-2"></i>Age Requirement
                </h5>
                <button type="button" class="btn-close" id="closeAgeModal" aria-label="Close"></button>
              </div>
              <div class="modal-body text-center p-4">
                <div class="d-flex justify-content-center mb-3">
                  <div class="bg-danger bg-opacity-10 rounded-circle p-3">
                    <i class="bi bi-exclamation-triangle-fill text-danger fs-1"></i>
                  </div>
                </div>
                <p class="mb-0">You must be at least 18 years old to register as a retailer.</p>
                <p>Please enter a valid birth date before proceeding to the Business Information section.</p>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-primary w-100" id="confirmAgeModal">I understand</button>
              </div>
            </div>
          </div>
        </div>
      `
  
      const modalContainer = document.createElement("div")
      modalContainer.innerHTML = modalHTML
      document.body.appendChild(modalContainer.firstChild)
  
      // Add event listeners to close the modal
      document.getElementById("closeAgeModal").addEventListener("click", closeAgeValidationModal)
      document.getElementById("confirmAgeModal").addEventListener("click", closeAgeValidationModal)
    }
  
    // Function to close the age validation modal
    function closeAgeValidationModal() {
      const modal = document.getElementById("ageValidationModal")
      if (modal) {
        document.body.removeChild(modal)
        const backdrop = document.querySelector(".modal-backdrop")
        if (backdrop) {
          document.body.removeChild(backdrop)
        }
      }
    }
  
    // Add event listener to the birthday input
    if (birthdayInput) {
      birthdayInput.addEventListener("change", function () {
        const birthDate = new Date(this.value)
        const today = new Date()
  
        let age = calculateAge(birthDate)
  
        if (age < 0) {
          age = 0
        }
  
        // Update the age display and hidden input
        if (ageDisplay) {
          ageDisplay.textContent = age
        }
        if (ageInput) {
          ageInput.value = age
        }
      })
  
      // Set max date to today (can't select future dates)
      const maxDate = new Date().toISOString().split("T")[0]
      birthdayInput.setAttribute("max", maxDate)
    }
  
    // Add event listener to the Next button in Step 1
    if (step1NextBtn) {
      // Store the original click event
      const originalClickHandler = step1NextBtn.onclick
      step1NextBtn.onclick = null
  
      // Add our new click event handler
      step1NextBtn.addEventListener("click", (event) => {
        // Validate step 1 fields
        const firstName = document.getElementById("firstName")
        const lastName = document.getElementById("lastName")
        const birthday = document.getElementById("birthday")
  
        if (!firstName.value || !lastName.value || !birthday.value) {
          alert("Please fill in all required fields in Basic Information.")
          return
        }
  
        // Check age requirement
        const age = Number.parseInt(document.getElementById("age").value || "0")
  
        if (age < 18) {
          // Show age validation modal
          showAgeValidationModal()
          return
        }
  
        // If age is valid, proceed with the original handler logic
        const step1 = document.getElementById("step1")
        const step2 = document.getElementById("step2")
        const step1Indicator = document.getElementById("step1-indicator")
        const step2Indicator = document.getElementById("step2-indicator")
  
        // Move to step 2
        step1.style.display = "none"
        step2.style.display = "block"
  
        // Update progress indicators
        step1Indicator.classList.remove("active")
        step1Indicator.classList.add("completed")
        step2Indicator.classList.add("active")
      })
    }
  })
  