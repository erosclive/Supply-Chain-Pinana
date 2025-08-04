// Wizard Functionality for Add Material Modal

document.addEventListener("DOMContentLoaded", () => {
  let currentWizardStep = 1
  const totalWizardSteps = 5

  // Wizard DOM Elements
  const wizardStepNumber = document.getElementById("wizard-step-number")
  const wizardProgress = document.getElementById("wizard-progress")
  const wizardPrevBtn = document.getElementById("wizard-prev-btn")
  const wizardNextBtn = document.getElementById("wizard-next-btn")
  const wizardSaveBtn = document.getElementById("wizard-save-btn")

  // Initialize wizard functionality
  initializeWizard()

  function initializeWizard() {
    // Add event listeners for wizard navigation
    if (wizardNextBtn) {
      wizardNextBtn.addEventListener("click", () => {
        if (validateCurrentStep()) {
          nextWizardStep()
        }
      })
    }

    if (wizardPrevBtn) {
      wizardPrevBtn.addEventListener("click", () => {
        previousWizardStep()
      })
    }

    // Add event listeners for step validation
    addStepValidationListeners()
  }

  function resetWizard() {
    currentWizardStep = 1
    updateWizardUI()
    showStep(1)
  }

  function updateWizardUI() {
    // Update step number display
    if (wizardStepNumber) {
      wizardStepNumber.textContent = currentWizardStep
    }

    // Update progress bar
    if (wizardProgress) {
      const progressPercentage = (currentWizardStep / totalWizardSteps) * 100
      wizardProgress.style.width = progressPercentage + "%"
    }

    // Update step indicators
    updateStepIndicators()

    // Update navigation buttons
    updateNavigationButtons()
  }

  function updateStepIndicators() {
    const stepElements = document.querySelectorAll('.wizard-step')
    stepElements.forEach((step, index) => {
      const stepNumber = index + 1
      if (stepNumber < currentWizardStep) {
        step.classList.remove('text-muted')
        step.classList.add('text-success')
        step.innerHTML = `<i class="bi bi-check-circle me-1"></i>${step.textContent}`
      } else if (stepNumber === currentWizardStep) {
        step.classList.remove('text-muted', 'text-success')
        step.classList.add('text-primary', 'fw-bold')
        step.innerHTML = step.textContent
      } else {
        step.classList.remove('text-primary', 'text-success', 'fw-bold')
        step.classList.add('text-muted')
        step.innerHTML = step.textContent
      }
    })
  }

  function updateNavigationButtons() {
    if (wizardPrevBtn) {
      if (currentWizardStep === 1) {
        wizardPrevBtn.style.display = 'none'
      } else {
        wizardPrevBtn.style.display = 'inline-block'
      }
    }

    if (wizardNextBtn && wizardSaveBtn) {
      if (currentWizardStep === totalWizardSteps) {
        wizardNextBtn.style.display = 'none'
        wizardSaveBtn.style.display = 'inline-block'
      } else {
        wizardNextBtn.style.display = 'inline-block'
        wizardSaveBtn.style.display = 'none'
      }
    }
  }

  function showStep(stepNumber) {
    // Hide all steps
    const stepContents = document.querySelectorAll('.wizard-step-content')
    stepContents.forEach(step => {
      step.classList.add('d-none')
    })

    // Show current step
    const currentStepElement = document.getElementById(`step-${stepNumber}`)
    if (currentStepElement) {
      currentStepElement.classList.remove('d-none')
    }
  }

  function nextWizardStep() {
    if (currentWizardStep < totalWizardSteps) {
      currentWizardStep++
      updateWizardUI()
      showStep(currentWizardStep)
    }
  }

  function previousWizardStep() {
    if (currentWizardStep > 1) {
      currentWizardStep--
      updateWizardUI()
      showStep(currentWizardStep)
    }
  }

  function validateCurrentStep() {
    const currentStepElement = document.getElementById(`step-${currentWizardStep}`)
    if (!currentStepElement) return true

    const requiredFields = currentStepElement.querySelectorAll('[required]')
    let isValid = true

    requiredFields.forEach(field => {
      if (!field.value.trim()) {
        isValid = false
        field.classList.add('is-invalid')
        
        // Add validation message
        let validationMessage = field.parentNode.querySelector('.invalid-feedback')
        if (!validationMessage) {
          validationMessage = document.createElement('div')
          validationMessage.className = 'invalid-feedback'
          validationMessage.textContent = 'This field is required.'
          field.parentNode.appendChild(validationMessage)
        }
      } else {
        field.classList.remove('is-invalid')
        const validationMessage = field.parentNode.querySelector('.invalid-feedback')
        if (validationMessage) {
          validationMessage.remove()
        }
      }
    })

    // Step-specific validation
    switch (currentWizardStep) {
      case 1:
        // Basic info validation
        const materialName = document.getElementById('material_name')
        const category = document.getElementById('category')
        
        if (materialName && materialName.value.trim().length < 2) {
          isValid = false
          materialName.classList.add('is-invalid')
          showFieldError(materialName, 'Material name must be at least 2 characters long.')
        }
        
        if (category && category.value === '') {
          isValid = false
          category.classList.add('is-invalid')
          showFieldError(category, 'Please select a category.')
        }
        break
        
      case 2:
        // Measurement validation
        const measurementType = document.getElementById('measurement_type')
        if (measurementType && measurementType.value === '') {
          isValid = false
          measurementType.classList.add('is-invalid')
          showFieldError(measurementType, 'Please select a measurement type.')
        }
        break
        
      case 3:
        // Quantity and cost validation
        const quantity = document.getElementById('quantity')
        const cost = document.getElementById('cost')
        
        if (quantity && (quantity.value <= 0 || quantity.value === '')) {
          isValid = false
          quantity.classList.add('is-invalid')
          showFieldError(quantity, 'Quantity must be greater than 0.')
        }
        
        if (cost && (cost.value <= 0 || cost.value === '')) {
          isValid = false
          cost.classList.add('is-invalid')
          showFieldError(cost, 'Cost must be greater than 0.')
        }
        break
        
      case 4:
        // Supplier validation
        const supplier = document.getElementById('supplier')
        if (supplier && supplier.value === '') {
          isValid = false
          supplier.classList.add('is-invalid')
          showFieldError(supplier, 'Please select a supplier.')
        }
        break
        
      case 5:
        // Date validation
        const dateReceived = document.getElementById('date_received')
        if (dateReceived && dateReceived.value === '') {
          isValid = false
          dateReceived.classList.add('is-invalid')
          showFieldError(dateReceived, 'Please select a date received.')
        }
        break
    }

    if (!isValid) {
      showStepError('Please fill in all required fields correctly.')
    }

    return isValid
  }

  function showFieldError(field, message) {
    let validationMessage = field.parentNode.querySelector('.invalid-feedback')
    if (!validationMessage) {
      validationMessage = document.createElement('div')
      validationMessage.className = 'invalid-feedback'
      field.parentNode.appendChild(validationMessage)
    }
    validationMessage.textContent = message
  }

  function showStepError(message) {
    // Create or update step error message
    let stepError = document.querySelector('.wizard-step-error')
    if (!stepError) {
      stepError = document.createElement('div')
      stepError.className = 'alert alert-danger wizard-step-error mt-3'
      const currentStepElement = document.getElementById(`step-${currentWizardStep}`)
      if (currentStepElement) {
        currentStepElement.appendChild(stepError)
      }
    }
    stepError.textContent = message
  }

  function addStepValidationListeners() {
    // Add real-time validation for key fields
    const materialName = document.getElementById('material_name')
    if (materialName) {
      materialName.addEventListener('input', () => {
        if (materialName.value.trim().length >= 2) {
          materialName.classList.remove('is-invalid')
          const validationMessage = materialName.parentNode.querySelector('.invalid-feedback')
          if (validationMessage) {
            validationMessage.remove()
          }
        }
      })
    }

    const category = document.getElementById('category')
    if (category) {
      category.addEventListener('change', () => {
        if (category.value !== '') {
          category.classList.remove('is-invalid')
          const validationMessage = category.parentNode.querySelector('.invalid-feedback')
          if (validationMessage) {
            validationMessage.remove()
          }
        }
      })
    }

    const measurementType = document.getElementById('measurement_type')
    if (measurementType) {
      measurementType.addEventListener('change', () => {
        if (measurementType.value !== '') {
          measurementType.classList.remove('is-invalid')
          const validationMessage = measurementType.parentNode.querySelector('.invalid-feedback')
          if (validationMessage) {
            validationMessage.remove()
          }
        }
      })
    }

    const quantity = document.getElementById('quantity')
    if (quantity) {
      quantity.addEventListener('input', () => {
        if (quantity.value > 0) {
          quantity.classList.remove('is-invalid')
          const validationMessage = quantity.parentNode.querySelector('.invalid-feedback')
          if (validationMessage) {
            validationMessage.remove()
          }
        }
      })
    }

    const cost = document.getElementById('cost')
    if (cost) {
      cost.addEventListener('input', () => {
        if (cost.value > 0) {
          cost.classList.remove('is-invalid')
          const validationMessage = cost.parentNode.querySelector('.invalid-feedback')
          if (validationMessage) {
            validationMessage.remove()
          }
        }
      })
    }

    const supplier = document.getElementById('supplier')
    if (supplier) {
      supplier.addEventListener('change', () => {
        if (supplier.value !== '') {
          supplier.classList.remove('is-invalid')
          const validationMessage = supplier.parentNode.querySelector('.invalid-feedback')
          if (validationMessage) {
            validationMessage.remove()
          }
        }
      })
    }

    const dateReceived = document.getElementById('date_received')
    if (dateReceived) {
      dateReceived.addEventListener('change', () => {
        if (dateReceived.value !== '') {
          dateReceived.classList.remove('is-invalid')
          const validationMessage = dateReceived.parentNode.querySelector('.invalid-feedback')
          if (validationMessage) {
            validationMessage.remove()
          }
        }
      })
    }
  }

  // Expose resetWizard function globally so it can be called from other scripts
  window.resetWizard = resetWizard
}) 