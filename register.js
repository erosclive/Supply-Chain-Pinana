document.addEventListener("DOMContentLoaded", () => {
  // Registration password toggle
  const toggleRegPassword = document.querySelector("#toggleRegPassword")
  const regPassword = document.querySelector("#reg_password")

  if (toggleRegPassword && regPassword) {
    toggleRegPassword.addEventListener("click", function () {
      const type = regPassword.getAttribute("type") === "password" ? "text" : "password"
      regPassword.setAttribute("type", type)

      // Toggle the eye icon
      const eyeIcon = this.querySelector("i")
      eyeIcon.classList.toggle("bi-eye")
      eyeIcon.classList.toggle("bi-eye-slash")
    })
  }

  // Registration confirm password toggle
  const toggleRegPasswordConfirm = document.querySelector("#toggleRegPasswordConfirm")
  const regPasswordConfirm = document.querySelector("#reg_password_confirm")

  if (toggleRegPasswordConfirm && regPasswordConfirm) {
    toggleRegPasswordConfirm.addEventListener("click", function () {
      const type = regPasswordConfirm.getAttribute("type") === "password" ? "text" : "password"
      regPasswordConfirm.setAttribute("type", type)

      // Toggle the eye icon
      const eyeIcon = this.querySelector("i")
      eyeIcon.classList.toggle("bi-eye")
      eyeIcon.classList.toggle("bi-eye-slash")
    })
  }

  // Initialize phone input with country selector
  const phoneInput = document.getElementById("phone")
  let iti
  if (phoneInput) {
    iti = window.intlTelInput(phoneInput, {
      utilsScript: "https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.8/js/utils.js",
      preferredCountries: ["ph", "us"],
      separateDialCode: true,
    })
  }

  // Age calculation from birthday
  const birthdayInput = document.getElementById("birthday")
  const ageDisplay = document.getElementById("calculatedAge")
  const ageInput = document.getElementById("age")

  if (birthdayInput && ageDisplay && ageInput) {
    birthdayInput.addEventListener("change", function () {
      const birthDate = new Date(this.value)
      const today = new Date()

      let age = today.getFullYear() - birthDate.getFullYear()
      const monthDiff = today.getMonth() - birthDate.getMonth()

      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--
      }

      if (age < 0) {
        age = 0
      }

      ageDisplay.textContent = age
      ageInput.value = age

      // Set max date to today (can't select future dates)
      const maxDate = new Date().toISOString().split("T")[0]
      birthdayInput.setAttribute("max", maxDate)
    })

    // Set max date to today (can't select future dates)
    const maxDate = new Date().toISOString().split("T")[0]
    birthdayInput.setAttribute("max", maxDate)
  }

  // Multi-step form navigation
  const step1 = document.getElementById("step1")
  const step2 = document.getElementById("step2")
  const step3 = document.getElementById("step3")

  const step1Indicator = document.getElementById("step1-indicator")
  const step2Indicator = document.getElementById("step2-indicator")
  const step3Indicator = document.getElementById("step3-indicator")

  const step1NextBtn = document.getElementById("step1NextBtn")
  const step2PrevBtn = document.getElementById("step2PrevBtn")
  const step2NextBtn = document.getElementById("step2NextBtn")
  const step3PrevBtn = document.getElementById("step3PrevBtn")

  if (step1NextBtn) {
    step1NextBtn.addEventListener("click", () => {
      // Validate step 1 fields
      const firstName = document.getElementById("firstName")
      const lastName = document.getElementById("lastName")
      const birthday = document.getElementById("birthday")

      if (!firstName.value || !lastName.value || !birthday.value) {
        alert("Please fill in all required fields in Basic Information.")
        return
      }

      // Move to step 2
      step1.style.display = "none"
      step2.style.display = "block"

      // Update progress indicators
      step1Indicator.classList.remove("active")
      step1Indicator.classList.add("completed")
      step2Indicator.classList.add("active")
    })
  }

  if (step2PrevBtn) {
    step2PrevBtn.addEventListener("click", () => {
      // Move back to step 1
      step2.style.display = "none"
      step1.style.display = "block"

      // Update progress indicators
      step2Indicator.classList.remove("active")
      step1Indicator.classList.remove("completed")
      step1Indicator.classList.add("active")
    })
  }

  if (step2NextBtn) {
    step2NextBtn.addEventListener("click", () => {
      // Validate step 2 fields
      const businessType = document.getElementById("businessType")
      const province = document.getElementById("province")
      const city = document.getElementById("city")
      const barangay = document.getElementById("barangay")
      const houseNumber = document.getElementById("houseNumber")

      if (!businessType.value || !province.value || !city.value || !barangay.value || !houseNumber.value) {
        alert("Please fill in all required fields in Business Information.")
        return
      }

      // Move to step 3
      step2.style.display = "none"
      step3.style.display = "block"

      // Update progress indicators
      step2Indicator.classList.remove("active")
      step2Indicator.classList.add("completed")
      step3Indicator.classList.add("active")
    })
  }

  if (step3PrevBtn) {
    step3PrevBtn.addEventListener("click", () => {
      // Move back to step 2
      step3.style.display = "none"
      step2.style.display = "block"

      // Update progress indicators
      step3Indicator.classList.remove("active")
      step2Indicator.classList.remove("completed")
      step2Indicator.classList.add("active")
    })
  }

  // Password strength checker
  const passwordInput = document.getElementById("reg_password")
  const passwordConfirmInput = document.getElementById("reg_password_confirm")
  const passwordStrengthBar = document.getElementById("passwordStrengthBar")
  const passwordStrengthText = document.getElementById("passwordStrengthText")
  const passwordMatchFeedback = document.getElementById("passwordMatchFeedback")

  if (passwordInput) {
    passwordInput.addEventListener("input", function () {
      const password = this.value
      let strength = 0
      const tips = []

      // Length check
      if (password.length >= 8) {
        strength += 25
      } else {
        tips.push("Use at least 8 characters")
      }

      // Uppercase check
      if (/[A-Z]/.test(password)) {
        strength += 25
      } else {
        tips.push("Include uppercase letters")
      }

      // Lowercase check
      if (/[a-z]/.test(password)) {
        strength += 25
      } else {
        tips.push("Include lowercase letters")
      }

      // Number or special char check
      if (/[0-9]|[^A-Za-z0-9]/.test(password)) {
        strength += 25
      } else {
        tips.push("Include numbers or special characters")
      }

      // Update strength bar
      passwordStrengthBar.style.width = strength + "%"

      // Update color based on strength
      if (strength <= 25) {
        passwordStrengthBar.className = "progress-bar bg-danger"
        passwordStrengthText.textContent = "Weak password"
        passwordStrengthText.className = "text-danger"
      } else if (strength <= 50) {
        passwordStrengthBar.className = "progress-bar bg-warning"
        passwordStrengthText.textContent = "Fair password"
        passwordStrengthText.className = "text-warning"
      } else if (strength <= 75) {
        passwordStrengthBar.className = "progress-bar bg-info"
        passwordStrengthText.textContent = "Good password"
        passwordStrengthText.className = "text-info"
      } else {
        passwordStrengthBar.className = "progress-bar bg-success"
        passwordStrengthText.textContent = "Strong password"
        passwordStrengthText.className = "text-success"
      }

      // If there are tips, show them
      if (tips.length > 0) {
        passwordStrengthText.textContent += ": " + tips.join(", ")
      }

      // Check if passwords match if confirm field has a value
      if (passwordConfirmInput && passwordConfirmInput.value) {
        checkPasswordsMatch()
      }
    })
  }

  // Password match checker
  if (passwordConfirmInput) {
    passwordConfirmInput.addEventListener("input", checkPasswordsMatch)
  }

  function checkPasswordsMatch() {
    if (passwordInput.value !== passwordConfirmInput.value) {
      passwordConfirmInput.classList.add("is-invalid")
      passwordMatchFeedback.style.display = "block"
      return false
    } else {
      passwordConfirmInput.classList.remove("is-invalid")
      passwordConfirmInput.classList.add("is-valid")
      passwordMatchFeedback.style.display = "none"
      return true
    }
  }

  // Email validation with Gmail requirement
  const emailInput = document.getElementById("email")
  const verifyEmailBtn = document.getElementById("verifyEmailBtn")
  const emailFeedback = document.getElementById("emailFeedback")
  const emailValidFeedback = document.getElementById("emailValidFeedback")

  if (emailInput && verifyEmailBtn) {
    // Real-time email validation on input
    emailInput.addEventListener("input", function () {
      const email = this.value.trim()
      const isValidFormat = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

      // Reset verify button
      verifyEmailBtn.innerHTML = '<i class="bi bi-check-circle"></i>'
      verifyEmailBtn.disabled = false

      if (!email) {
        // Empty field
        emailInput.classList.remove("is-invalid", "is-valid")
        emailFeedback.style.display = "none"
        emailValidFeedback.style.display = "none"
        return
      }

      if (!isValidFormat) {
        // Invalid email format
        emailInput.classList.add("is-invalid")
        emailInput.classList.remove("is-valid")
        emailFeedback.textContent = "Please enter a valid email address."
        emailFeedback.style.display = "block"
        emailValidFeedback.style.display = "none"
        return
      }

      // Check if it's a Gmail address
      if (!email.toLowerCase().endsWith("@gmail.com")) {
        emailInput.classList.add("is-invalid")
        emailInput.classList.remove("is-valid")
        emailFeedback.textContent = "Only Gmail addresses are accepted for retailer accounts."
        emailFeedback.style.display = "block"
        emailValidFeedback.style.display = "none"
        return
      }

      // Valid Gmail format - show as valid but not verified yet
      emailInput.classList.remove("is-invalid")
      emailInput.classList.add("is-valid")
      emailFeedback.style.display = "none"
      emailValidFeedback.textContent = "Valid Gmail format. Click verify to check availability."
      emailValidFeedback.style.display = "block"
    })

    // Gmail verification on button click
    verifyEmailBtn.addEventListener("click", () => {
      const email = emailInput.value.trim()

      // Validate email first
      if (!email) {
        emailInput.classList.add("is-invalid")
        emailFeedback.textContent = "Please enter an email address."
        emailFeedback.style.display = "block"
        emailValidFeedback.style.display = "none"
        return
      }

      const isValidFormat = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
      if (!isValidFormat) {
        emailInput.classList.add("is-invalid")
        emailFeedback.textContent = "Please enter a valid email address."
        emailFeedback.style.display = "block"
        emailValidFeedback.style.display = "none"
        return
      }

      // Check if it's a Gmail address
      if (!email.toLowerCase().endsWith("@gmail.com")) {
        emailInput.classList.add("is-invalid")
        emailFeedback.textContent = "Only Gmail addresses are accepted for retailer accounts."
        emailFeedback.style.display = "block"
        emailValidFeedback.style.display = "none"
        return
      }

      // Show loading state
      verifyEmailBtn.innerHTML =
        '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>'
      verifyEmailBtn.disabled = true

      // Simulate Gmail verification process
      // In a real implementation, you would call your server-side API to check:
      // 1. If the email already exists in your database
      // 2. If the Gmail account is valid/active
      // 3. Any other business logic for email verification

      setTimeout(() => {
        // Simulate verification result
        const isEmailAvailable = Math.random() > 0.1 // 90% success rate for demo

        if (isEmailAvailable) {
          // Email is available and valid
          emailInput.classList.remove("is-invalid")
          emailInput.classList.add("is-valid")
          emailFeedback.style.display = "none"
          emailValidFeedback.textContent = "Gmail address verified and available!"
          emailValidFeedback.style.display = "block"

          // Update button to show success
          verifyEmailBtn.innerHTML = '<i class="bi bi-check-circle-fill text-success"></i>'
          verifyEmailBtn.disabled = false

          // Mark email as verified (you can use this in form validation)
          emailInput.setAttribute("data-verified", "true")
        } else {
          // Email already exists or other issue
          emailInput.classList.add("is-invalid")
          emailInput.classList.remove("is-valid")
          emailFeedback.textContent = "This Gmail address is already registered or unavailable."
          emailFeedback.style.display = "block"
          emailValidFeedback.style.display = "none"

          // Reset button
          verifyEmailBtn.innerHTML = '<i class="bi bi-check-circle"></i>'
          verifyEmailBtn.disabled = false

          // Remove verified status
          emailInput.removeAttribute("data-verified")
        }
      }, 2000) // 2 second delay to simulate API call
    })

    // Additional validation: require verification before form submission
    const retailerForm = document.getElementById("retailerRegistrationForm")
    const originalFormSubmit = retailerForm?.addEventListener
    if (retailerForm) {
      // Add this check in the form submission validation
      const originalSubmitHandler = retailerForm.onsubmit

      // We'll add this check in the existing form submission handler
      // The check will be: if (!emailInput.getAttribute('data-verified')) { ... }
    }
  }

  // Initialize Philippine location API
  initializeLocationDropdowns()

  // Form submission
  const retailerForm = document.getElementById("retailerRegistrationForm")
  if (retailerForm) {
    retailerForm.addEventListener("submit", (e) => {
      e.preventDefault()

      // Check if Gmail is verified
      if (emailInput && !emailInput.getAttribute("data-verified")) {
        isValid = false
        emailInput.classList.add("is-invalid")
        emailFeedback.textContent = "Please verify your Gmail address before submitting."
        emailFeedback.style.display = "block"
        emailValidFeedback.style.display = "none"

        // Scroll to email field
        emailInput.scrollIntoView({ behavior: "smooth", block: "center" })
        alert("Please verify your Gmail address before submitting the form.")
        return
      }

      // Validate all required fields
      const requiredFields = retailerForm.querySelectorAll("[required]")
      let isValid = true

      requiredFields.forEach((field) => {
        if (!field.value) {
          isValid = false
          field.classList.add("is-invalid")
        } else {
          field.classList.remove("is-invalid")
        }
      })

      // Check password match
      if (passwordInput && passwordConfirmInput) {
        if (passwordInput.value !== passwordConfirmInput.value) {
          isValid = false
          passwordConfirmInput.classList.add("is-invalid")
          passwordMatchFeedback.style.display = "block"
        }
      }

      // Check terms agreement
      const termsAgreement = document.getElementById("termsAgreement")
      if (!termsAgreement.checked) {
        isValid = false
        termsAgreement.classList.add("is-invalid")
        alert("Please agree to the Terms and Conditions to continue.")
        return
      }

      if (!isValid) {
        alert("Please fill in all required fields correctly.")
        return
      }

      // Show loading state
      const submitBtn = document.getElementById("submitBtn")
      submitBtn.innerHTML =
        '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Processing...'
      submitBtn.disabled = true

      // Get the full phone number with country code
      if (iti) {
        const fullNumber = iti.getNumber()
        phoneInput.value = fullNumber
      }

      // Submit the form
      const formData = new FormData(retailerForm)

      fetch("register_retailer.php", {
        method: "POST",
        body: formData,
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error("Network response was not ok")
          }
          return response.json()
        })
        .then((data) => {
          // Reset loading state
          submitBtn.innerHTML = '<i class="bi bi-check-lg"></i> Complete Registration'
          submitBtn.disabled = false

          console.log("Registration response:", data) // For debugging

          if (data.success) {
            // Check if verification is required
            if (data.requiresVerification) {
              // Set the email in the verification modal
              document.getElementById("verificationEmail").textContent = data.email

              // Set up resend link
              const resendLink = document.getElementById("resendVerificationLink")
              resendLink.href = "resend_verification.php?email=" + encodeURIComponent(data.email)

              // Attempt to trigger email sending again
              fetch("resend_verification.php", {
                method: "POST",
                headers: {
                  "Content-Type": "application/x-www-form-urlencoded",
                },
                body: "email=" + encodeURIComponent(data.email),
              })
                .then((response) => {
                  console.log("Verification email resent automatically")
                })
                .catch((error) => {
                  console.error("Error resending verification email:", error)
                })

              // Show verification modal
              const verificationModalElement = document.getElementById("verificationRequiredModal")
              const bootstrap = window.bootstrap // Declare bootstrap variable
              const verificationModal = new bootstrap.Modal(verificationModalElement)
              verificationModal.show()
            } else {
              // Show success modal
              const successModalElement = document.getElementById("registrationSuccessModal")
              const bootstrap = window.bootstrap // Declare bootstrap variable
              const successModal = new bootstrap.Modal(successModalElement)
              successModal.show()
            }

            // Reset the form
            retailerForm.reset()

            // Reset the steps
            step3.style.display = "none"
            step2.style.display = "none"
            step1.style.display = "block"

            // Reset progress indicators
            step3Indicator.classList.remove("active")
            step2Indicator.classList.remove("active", "completed")
            step1Indicator.classList.remove("completed")
            step1Indicator.classList.add("active")

            // Reset age display
            if (ageDisplay) {
              ageDisplay.textContent = "--"
            }
          } else {
            // Show detailed error message
            let errorMsg = "Registration failed"
            if (data.error) {
              errorMsg += ": " + data.error
            }

            // Create a more user-friendly alert
            const alertDiv = document.createElement("div")
            alertDiv.className = "alert alert-danger alert-dismissible fade show"
            alertDiv.innerHTML = `
                          <strong>Registration Error</strong><br>
                          ${errorMsg}
                          <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                      `

            // Insert at the top of the form
            const registrationCard = document.querySelector(".registration-card")
            registrationCard.insertBefore(alertDiv, registrationCard.firstChild)

            // Auto-dismiss after 5 seconds
            setTimeout(() => {
              const bsAlert = new window.bootstrap.Alert(alertDiv) // Use window.bootstrap
              bsAlert.close()
            }, 5000)
          }
        })
        .catch((error) => {
          // Reset loading state
          submitBtn.innerHTML = '<i class="bi bi-check-lg"></i> Complete Registration'
          submitBtn.disabled = false

          console.error("Error:", error)
          alert("An error occurred during registration. Please try again.")
        })
    })
  }
})

// Function to initialize Philippine location dropdowns using an API
function initializeLocationDropdowns() {
  const provinceSelect = document.getElementById("province")
  const citySelect = document.getElementById("city")
  const barangaySelect = document.getElementById("barangay")

  const provinceLoader = document.getElementById("provinceLoader")
  const cityLoader = document.getElementById("cityLoader")
  const barangayLoader = document.getElementById("barangayLoader")

  if (!provinceSelect || !citySelect || !barangaySelect) return

  // Show province loader
  if (provinceLoader) provinceLoader.classList.remove("d-none")

  // Fetch provinces from Philippine Geographical API
  fetch("https://psgc.gitlab.io/api/provinces.json")
    .then((response) => response.json())
    .then((data) => {
      // Sort provinces alphabetically
      data.sort((a, b) => a.name.localeCompare(b.name))

      // Add provinces to dropdown
      data.forEach((province) => {
        const option = document.createElement("option")
        option.value = province.code
        option.textContent = province.name
        provinceSelect.appendChild(option)
      })

      // Hide loader
      if (provinceLoader) provinceLoader.classList.add("d-none")

      // Enable province select
      provinceSelect.disabled = false
    })
    .catch((error) => {
      console.error("Error fetching provinces:", error)

      // Hide loader
      if (provinceLoader) provinceLoader.classList.add("d-none")

      // Add fallback provinces
      const fallbackProvinces = [
        { code: "PH-LAG", name: "Laguna" },
        { code: "PH-CAV", name: "Cavite" },
        { code: "PH-RIZ", name: "Rizal" },
        { code: "PH-BTG", name: "Batangas" },
        { code: "PH-QUE", name: "Quezon" },
        { code: "PH-MNL", name: "Metro Manila" },
      ]

      fallbackProvinces.forEach((province) => {
        const option = document.createElement("option")
        option.value = province.code
        option.textContent = province.name
        provinceSelect.appendChild(option)
      })

      // Enable province select
      provinceSelect.disabled = false
    })

  // Handle province change
  provinceSelect.addEventListener("change", function () {
    const provinceCode = this.value

    // Clear city and barangay dropdowns
    citySelect.innerHTML = '<option value="" selected disabled>Select city/municipality</option>'
    barangaySelect.innerHTML = '<option value="" selected disabled>Select barangay</option>'

    // Disable city and barangay dropdowns
    citySelect.disabled = true
    barangaySelect.disabled = true

    if (!provinceCode) return

    // Show city loader
    if (cityLoader) cityLoader.classList.remove("d-none")

    // Fetch cities for the selected province
    fetch(`https://psgc.gitlab.io/api/provinces/${provinceCode}/cities-municipalities.json`)
      .then((response) => response.json())
      .then((data) => {
        // Sort cities alphabetically
        data.sort((a, b) => a.name.localeCompare(b.name))

        // Add cities to dropdown
        data.forEach((city) => {
          const option = document.createElement("option")
          option.value = city.code
          option.textContent = city.name
          citySelect.appendChild(option)
        })

        // Hide loader
        if (cityLoader) cityLoader.classList.add("d-none")

        // Enable city select
        citySelect.disabled = false
      })
      .catch((error) => {
        console.error("Error fetching cities:", error)

        // Hide loader
        if (cityLoader) cityLoader.classList.add("d-none")

        // Add fallback cities
        const fallbackCities = [
          { code: "CM-CAL", name: "Calauan" },
          { code: "CM-STA", name: "Santa Rosa" },
          { code: "CM-CAB", name: "Cabuyao" },
          { code: "CM-BIN", name: "Biñan" },
          { code: "CM-SPC", name: "San Pablo City" },
        ]

        fallbackCities.forEach((city) => {
          const option = document.createElement("option")
          option.value = city.code
          option.textContent = city.name
          citySelect.appendChild(option)
        })

        // Enable city select
        citySelect.disabled = false
      })
  })

  // Handle city change
  citySelect.addEventListener("change", function () {
    const cityCode = this.value

    // Clear barangay dropdown
    barangaySelect.innerHTML = '<option value="" selected disabled>Select barangay</option>'

    // Disable barangay dropdown
    barangaySelect.disabled = true

    if (!cityCode) return

    // Show barangay loader
    if (barangayLoader) barangayLoader.classList.remove("d-none")

    // Fetch barangays for the selected city
    fetch(`https://psgc.gitlab.io/api/cities-municipalities/${cityCode}/barangays.json`)
      .then((response) => response.json())
      .then((data) => {
        // Sort barangays alphabetically
        data.sort((a, b) => a.name.localeCompare(b.name))

        // Add barangays to dropdown
        data.forEach((barangay) => {
          const option = document.createElement("option")
          option.value = barangay.code
          option.textContent = barangay.name
          barangaySelect.appendChild(option)
        })

        // Hide loader
        if (barangayLoader) barangayLoader.classList.add("d-none")

        // Enable barangay select
        barangaySelect.disabled = false
      })
      .catch((error) => {
        console.error("Error fetching barangays:", error)

        // Hide loader
        if (barangayLoader) barangayLoader.classList.add("d-none")

        // Add fallback barangays
        const fallbackBarangays = [
          { code: "BRG-SIS", name: "San Isidro" },
          { code: "BRG-DAY", name: "Dayap" },
          { code: "BRG-LAM", name: "Lamot" },
          { code: "BRG-IMO", name: "Imok" },
          { code: "BRG-HAN", name: "Hanggan" },
          { code: "BRG-MAS", name: "Masiit" },
        ]

        fallbackBarangays.forEach((barangay) => {
          const option = document.createElement("option")
          option.value = barangay.code
          option.textContent = barangay.name
          barangaySelect.appendChild(option)
        })

        // Enable barangay select
        barangaySelect.disabled = false
      })
  })
}
