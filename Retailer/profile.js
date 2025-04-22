// Wait for the DOM to be fully loaded
document.addEventListener("DOMContentLoaded", () => {
    // Initialize date pickers
    if (typeof flatpickr !== "undefined") {
      flatpickr("#birthday", {
        dateFormat: "Y-m-d",
        maxDate: "today",
      })
    }
  
    // Auto-dismiss alerts after 5 seconds
    setTimeout(() => {
      const alerts = document.querySelectorAll(".alert:not(.alert-permanent)")
      alerts.forEach((alert) => {
        if (typeof bootstrap !== "undefined") {
          const bsAlert = new bootstrap.Alert(alert)
          bsAlert.close()
        } else {
          alert.style.display = "none"
        }
      })
    }, 5000)
  
    // Initialize back button
    const backButton = document.querySelector(".back-button")
    if (backButton) {
      backButton.addEventListener("click", (e) => {
        e.preventDefault()
        window.history.back()
      })
    }
  
    // Profile avatar click handler
    const profileAvatar = document.getElementById("profileAvatar")
    if (profileAvatar) {
      profileAvatar.addEventListener("click", () => {
        // Show profile image modal
        const profileImageModal = new bootstrap.Modal(document.getElementById("profileImageModal"))
        profileImageModal.show()
      })
    }
  
    // Profile image input change handler
    const profileImageInput = document.getElementById("profileImageInput")
    const uploadImageBtn = document.getElementById("uploadImageBtn")
    const selectImageBtn = document.getElementById("selectImageBtn")
  
    if (profileImageInput && selectImageBtn) {
      // Click the hidden file input when the select button is clicked
      selectImageBtn.addEventListener("click", () => {
        profileImageInput.click()
      })
    }
  
    if (profileImageInput && uploadImageBtn) {
      profileImageInput.addEventListener("change", function () {
        if (this.files && this.files[0]) {
          // Check file size
          if (this.files[0].size > 2 * 1024 * 1024) {
            showAlert("danger", "File size is too large. Maximum size is 2MB.")
            this.value = ""
            uploadImageBtn.disabled = true
            return
          }
  
          // Check file type
          const fileType = this.files[0].type
          if (!fileType.match(/image\/(jpeg|jpg|png|gif)/)) {
            showAlert("danger", "Invalid file type. Only JPG, JPEG, PNG, and GIF are allowed.")
            this.value = ""
            uploadImageBtn.disabled = true
            return
          }
  
          // Preview the image
          const reader = new FileReader()
          reader.onload = (e) => {
            // Get the preview container
            const previewContainer = document.querySelector(".profile-image-preview")
            if (previewContainer) {
              // Clear the container and add the image
              previewContainer.innerHTML = `<img src="${e.target.result}" alt="Profile Image" id="profileImagePreview" style="width: 100%; height: 100%; object-fit: cover;">`
              uploadImageBtn.disabled = false
            }
          }
          reader.readAsDataURL(this.files[0])
        }
      })
    }
  
    // Profile image form submission
    const profileImageForm = document.getElementById("profileImageForm")
    if (profileImageForm) {
      profileImageForm.addEventListener("submit", function (e) {
        e.preventDefault()
  
        if (!profileImageInput.files || !profileImageInput.files[0]) {
          showAlert("danger", "Please select an image to upload.")
          return
        }
  
        // Show loading state
        const originalBtnText = uploadImageBtn.innerHTML
        uploadImageBtn.innerHTML =
          '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span> Uploading...'
        uploadImageBtn.disabled = true
  
        // Create FormData object
        const formData = new FormData(this)
  
        // Send AJAX request
        fetch("profile_operations.php", {
          method: "POST",
          body: formData,
        })
          .then((response) => response.json())
          .then((data) => {
            // Reset button state
            uploadImageBtn.innerHTML = originalBtnText
            uploadImageBtn.disabled = true
  
            if (data.success) {
              showAlert("success", data.message)
  
              // Update profile avatar in the page
              const mainProfileAvatar = document.getElementById("profileAvatar")
              if (mainProfileAvatar) {
                mainProfileAvatar.innerHTML = `<img src="${data.image_path}" alt="Profile Image" style="width: 100%; height: 100%; object-fit: cover;">`
              }
  
              // Close modal after a delay
              setTimeout(() => {
                const profileImageModal = bootstrap.Modal.getInstance(document.getElementById("profileImageModal"))
                if (profileImageModal) {
                  profileImageModal.hide()
                }
  
                // Reload the page to ensure all instances of the profile image are updated
                location.reload()
              }, 1500)
            } else {
              showAlert("danger", data.message || "An error occurred. Please try again.")
            }
          })
          .catch((error) => {
            // Reset button state
            uploadImageBtn.innerHTML = originalBtnText
            uploadImageBtn.disabled = true
  
            console.error("Error:", error)
            showAlert("danger", "An error occurred. Please try again.")
          })
      })
    }
  
    // Personal Information Modal Save Button
    const savePersonalInfoBtn = document.getElementById("savePersonalInfoBtn")
    if (savePersonalInfoBtn) {
      savePersonalInfoBtn.addEventListener("click", function () {
        const form = document.getElementById("personalInfoForm")
        if (form && form.checkValidity()) {
          // Show loading state
          const originalBtnText = this.innerHTML
          this.innerHTML =
            '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span> Saving...'
          this.disabled = true
  
          // Create FormData object
          const formData = new FormData(form)
          formData.append("action", "update_profile")
  
          // Add other required fields from other forms
          const businessForm = document.getElementById("businessInfoForm")
          const socialMediaForm = document.getElementById("socialMediaForm")
  
          if (businessForm) {
            formData.append("business_name", document.getElementById("business_name").value)
            formData.append("business_type", document.getElementById("business_type").value)
            formData.append("business_address", document.getElementById("business_address").value)
          }
  
          if (socialMediaForm) {
            formData.append("facebook", document.getElementById("facebook").value || "")
            formData.append("instagram", document.getElementById("instagram").value || "")
            formData.append("tiktok", document.getElementById("tiktok").value || "")
          }
  
          // Send AJAX request
          fetch("profile_operations.php", {
            method: "POST",
            body: formData,
          })
            .then((response) => response.json())
            .then((data) => {
              // Reset button state
              this.innerHTML = originalBtnText
              this.disabled = false
  
              if (data.success) {
                showAlert("success", data.message)
  
                // Close modal
                const modal = bootstrap.Modal.getInstance(document.getElementById("personalInfoModal"))
                if (modal) {
                  modal.hide()
                }
  
                // Refresh the page after a delay
                setTimeout(() => {
                  location.reload()
                }, 1500)
              } else {
                showAlert("danger", data.message || "An error occurred. Please try again.")
              }
            })
            .catch((error) => {
              // Reset button state
              this.innerHTML = originalBtnText
              this.disabled = false
  
              console.error("Error:", error)
              showAlert("danger", "An error occurred. Please try again.")
            })
        } else {
          form.reportValidity()
        }
      })
    }
  
    // Business Information Modal Save Button
    const saveBusinessInfoBtn = document.getElementById("saveBusinessInfoBtn")
    if (saveBusinessInfoBtn) {
      saveBusinessInfoBtn.addEventListener("click", function () {
        const form = document.getElementById("businessInfoForm")
        if (form && form.checkValidity()) {
          // Show loading state
          const originalBtnText = this.innerHTML
          this.innerHTML =
            '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span> Saving...'
          this.disabled = true
  
          // Create FormData object
          const formData = new FormData(form)
          formData.append("action", "update_profile")
  
          // Add other required fields from other forms
          const personalForm = document.getElementById("personalInfoForm")
          const socialMediaForm = document.getElementById("socialMediaForm")
  
          if (personalForm) {
            formData.append("first_name", document.getElementById("first_name").value)
            formData.append("last_name", document.getElementById("last_name").value)
            formData.append("birthday", document.getElementById("birthday").value)
            formData.append("nationality", document.getElementById("nationality").value)
            formData.append("phone", document.getElementById("phone").value)
          }
  
          if (socialMediaForm) {
            formData.append("facebook", document.getElementById("facebook").value || "")
            formData.append("instagram", document.getElementById("instagram").value || "")
            formData.append("tiktok", document.getElementById("tiktok").value || "")
          }
  
          // Send AJAX request
          fetch("profile_operations.php", {
            method: "POST",
            body: formData,
          })
            .then((response) => response.json())
            .then((data) => {
              // Reset button state
              this.innerHTML = originalBtnText
              this.disabled = false
  
              if (data.success) {
                showAlert("success", data.message)
  
                // Close modal
                const modal = bootstrap.Modal.getInstance(document.getElementById("businessInfoModal"))
                if (modal) {
                  modal.hide()
                }
  
                // Refresh the page after a delay
                setTimeout(() => {
                  location.reload()
                }, 1500)
              } else {
                showAlert("danger", data.message || "An error occurred. Please try again.")
              }
            })
            .catch((error) => {
              // Reset button state
              this.innerHTML = originalBtnText
              this.disabled = false
  
              console.error("Error:", error)
              showAlert("danger", "An error occurred. Please try again.")
            })
        } else {
          form.reportValidity()
        }
      })
    }
  
    // Social Media Modal Save Button
    const saveSocialMediaBtn = document.getElementById("saveSocialMediaBtn")
    if (saveSocialMediaBtn) {
      saveSocialMediaBtn.addEventListener("click", function () {
        const form = document.getElementById("socialMediaForm")
        if (form) {
          // Show loading state
          const originalBtnText = this.innerHTML
          this.innerHTML =
            '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span> Saving...'
          this.disabled = true
  
          // Create FormData object
          const formData = new FormData(form)
          formData.append("action", "update_profile")
  
          // Add other required fields from other forms
          const personalForm = document.getElementById("personalInfoForm")
          const businessForm = document.getElementById("businessInfoForm")
  
          if (personalForm) {
            formData.append("first_name", document.getElementById("first_name").value)
            formData.append("last_name", document.getElementById("last_name").value)
            formData.append("birthday", document.getElementById("birthday").value)
            formData.append("nationality", document.getElementById("nationality").value)
            formData.append("phone", document.getElementById("phone").value)
          }
  
          if (businessForm) {
            formData.append("business_name", document.getElementById("business_name").value)
            formData.append("business_type", document.getElementById("business_type").value)
            formData.append("business_address", document.getElementById("business_address").value)
          }
  
          // Send AJAX request
          fetch("profile_operations.php", {
            method: "POST",
            body: formData,
          })
            .then((response) => response.json())
            .then((data) => {
              // Reset button state
              this.innerHTML = originalBtnText
              this.disabled = false
  
              if (data.success) {
                showAlert("success", data.message)
  
                // Close modal
                const modal = bootstrap.Modal.getInstance(document.getElementById("socialMediaModal"))
                if (modal) {
                  modal.hide()
                }
  
                // Refresh the page after a delay
                setTimeout(() => {
                  location.reload()
                }, 1500)
              } else {
                showAlert("danger", data.message || "An error occurred. Please try again.")
              }
            })
            .catch((error) => {
              // Reset button state
              this.innerHTML = originalBtnText
              this.disabled = false
  
              console.error("Error:", error)
              showAlert("danger", "An error occurred. Please try again.")
            })
        }
      })
    }
  
    // Handle form submissions for account and preferences
    document.querySelectorAll("form[data-form-type]").forEach((form) => {
      form.addEventListener("submit", function (e) {
        e.preventDefault()
  
        const formType = this.getAttribute("data-form-type")
        if (formType === "profile") {
          // Skip this as we're handling profile forms with modal buttons
          return
        }
  
        const formData = new FormData(this)
  
        // Add action based on form type
        if (formType === "account") {
          formData.append("action", "update_account")
        } else if (formType === "preferences") {
          formData.append("action", "update_preferences")
        }
  
        // Show loading state
        const submitBtn = this.querySelector('button[type="submit"]')
        const originalBtnText = submitBtn.innerHTML
        submitBtn.innerHTML =
          '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span> Saving...'
        submitBtn.disabled = true
  
        // Send AJAX request
        fetch("profile_operations.php", {
          method: "POST",
          body: formData,
        })
          .then((response) => response.json())
          .then((data) => {
            // Reset button state
            submitBtn.innerHTML = originalBtnText
            submitBtn.disabled = false
  
            if (data.success) {
              showAlert("success", data.message)
  
              // Clear password fields
              if (formType === "account") {
                document.getElementById("current_password").value = ""
                document.getElementById("new_password").value = ""
                document.getElementById("confirm_password").value = ""
              }
            } else {
              showAlert("danger", data.message || "An error occurred. Please try again.")
            }
          })
          .catch((error) => {
            // Reset button state
            submitBtn.innerHTML = originalBtnText
            submitBtn.disabled = false
  
            console.error("Error:", error)
            showAlert("danger", "An error occurred. Please try again.")
          })
      })
    })
  
    // Handle logout button
    const logoutButton = document.getElementById("logoutButton")
    if (logoutButton) {
      logoutButton.addEventListener("click", (e) => {
        e.preventDefault()
  
        // Show logout confirmation modal
        if (typeof bootstrap !== "undefined") {
          const logoutModal = new bootstrap.Modal(document.getElementById("logoutModal"))
          logoutModal.show()
        }
      })
    }
  
    // Handle confirm logout button
    const confirmLogout = document.getElementById("confirmLogout")
    if (confirmLogout) {
      confirmLogout.addEventListener("click", () => {
        window.location.href = "logout.php"
      })
    }
  
    // Handle sidebar toggle for mobile
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
  
    // Add animation classes to elements when they come into view
    const animateOnScroll = () => {
      const elements = document.querySelectorAll(".profile-card:not(.fade-in)")
  
      elements.forEach((element) => {
        const elementTop = element.getBoundingClientRect().top
        const elementBottom = element.getBoundingClientRect().bottom
  
        if (elementTop < window.innerHeight && elementBottom > 0) {
          element.classList.add("fade-in")
        }
      })
    }
  
    // Run animation on load
    animateOnScroll()
  
    // Run animation on scroll
    window.addEventListener("scroll", animateOnScroll)
  
    // Initialize tooltips and profile tabs after DOM is fully loaded
    initTooltips()
    initProfileTabs()
  })
  
  // Initialize tooltips
  function initTooltips() {
    // Check if Bootstrap's tooltip plugin is available
    if (typeof bootstrap !== "undefined" && typeof bootstrap.Tooltip !== "undefined") {
      const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
      tooltipTriggerList.map((tooltipTriggerEl) => new bootstrap.Tooltip(tooltipTriggerEl))
    }
  }
  
  // Initialize profile tabs
  function initProfileTabs() {
    // Get the tab from URL hash, if any
    const hash = window.location.hash
    if (hash) {
      // Find the tab that corresponds to the hash
      const tab = document.querySelector(`button[data-bs-target="${hash}"]`)
      if (tab) {
        // Activate the tab
        const tabInstance = new bootstrap.Tab(tab)
        tabInstance.show()
      }
    }
  
    // Update URL hash when tab is changed
    const tabs = document.querySelectorAll('button[data-bs-toggle="tab"]')
    tabs.forEach((tab) => {
      tab.addEventListener("shown.bs.tab", (event) => {
        const targetId = event.target.getAttribute("data-bs-target")
        window.location.hash = targetId
      })
    })
  }
  
  // Function to show alert messages
  function showAlert(type, message) {
    const alertContainer = document.getElementById("alert-container")
    if (!alertContainer) return
  
    const alertElement = document.createElement("div")
    alertElement.className = `alert alert-${type} alert-dismissible fade show`
    alertElement.setAttribute("role", "alert")
  
    let icon = ""
    if (type === "success") {
      icon = '<i class="bi bi-check-circle-fill me-2"></i>'
    } else if (type === "danger") {
      icon = '<i class="bi bi-exclamation-triangle-fill me-2"></i>'
    } else if (type === "warning") {
      icon = '<i class="bi bi-exclamation-circle-fill me-2"></i>'
    } else if (type === "info") {
      icon = '<i class="bi bi-info-circle-fill me-2"></i>'
    }
  
    alertElement.innerHTML = `
          ${icon}${message}
          <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
      `
  
    alertContainer.appendChild(alertElement)
  
    // Auto-dismiss after 5 seconds
    setTimeout(() => {
      if (typeof bootstrap !== "undefined") {
        const bsAlert = new bootstrap.Alert(alertElement)
        bsAlert.close()
      } else {
        alertElement.remove()
      }
    }, 5000)
  }
  
  // Password validation
  function validatePassword() {
    const newPassword = document.getElementById("new_password")
    const confirmPassword = document.getElementById("confirm_password")
  
    if (newPassword && confirmPassword) {
      if (newPassword.value !== confirmPassword.value) {
        confirmPassword.setCustomValidity("Passwords don't match")
      } else {
        confirmPassword.setCustomValidity("")
      }
    }
  }
  
  // Add event listeners for password validation
  document.addEventListener("DOMContentLoaded", () => {
    const newPassword = document.getElementById("new_password")
    const confirmPassword = document.getElementById("confirm_password")
  
    if (newPassword && confirmPassword) {
      newPassword.addEventListener("change", validatePassword)
      confirmPassword.addEventListener("keyup", validatePassword)
    }
  })
  