
document.addEventListener("DOMContentLoaded", () => {
  // Declare bootstrap, showResponseMessage, and fetchInventoryData
  let bootstrap
  let showResponseMessage
  let fetchInventoryData

  // Check if bootstrap is available
  if (typeof window !== "undefined" && typeof window.bootstrap !== "undefined") {
    bootstrap = window.bootstrap
  } else {
    console.warn("Bootstrap is not available. Ensure it is properly loaded.")
  }

  // Check if showResponseMessage is available
  if (typeof window !== "undefined" && typeof window.showResponseMessage === "function") {
    showResponseMessage = window.showResponseMessage
  } else {
    console.warn("showResponseMessage is not available. Ensure it is properly defined.")
    showResponseMessage = (type, message) => {
      console.log(`${type}: ${message}`)
      alert(`${type}: ${message}`)
    }
  }

  // Check if fetchInventoryData is available
  if (typeof window !== "undefined" && typeof window.fetchInventoryData === "function") {
    fetchInventoryData = window.fetchInventoryData
  } else {
    console.warn("fetchInventoryData is not available. Ensure it is properly defined.")
    fetchInventoryData = () => {
      console.log("fetchInventoryData function is not defined.")
    }
  }

  // Utility functions for date handling
  const formatDateForInput = (dateString) => {
    try {
      if (!dateString || dateString === "0000-00-00") return ""
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return ""

      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, "0")
      const day = String(date.getDate()).padStart(2, "0")
      return `${year}-${month}-${day}`
    } catch (error) {
      console.error("Error formatting date for input:", error)
      return ""
    }
  }

  const formatDateForDisplay = (dateString) => {
    try {
      if (!dateString || dateString === "0000-00-00") return "N/A"
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return "N/A"

      const month = String(date.getMonth() + 1).padStart(2, "0")
      const day = String(date.getDate()).padStart(2, "0")
      const year = date.getFullYear()
      return `${month}/${day}/${year}`
    } catch (error) {
      console.error("Error formatting date for display:", error)
      return "N/A"
    }
  }

  const formatDateForServer = (dateString) => {
    try {
      if (!dateString) return ""
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return ""

      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, "0")
      const day = String(date.getDate()).padStart(2, "0")
      return `${year}-${month}-${day}`
    } catch (error) {
      console.error("Error formatting date for server:", error)
      return ""
    }
  }

  const generateExpirationDate = (manufacturingDate) => {
    try {
      if (!manufacturingDate) return ""
      const mfgDate = new Date(manufacturingDate)
      if (isNaN(mfgDate.getTime())) return ""

      // Add 2 months to match your existing logic
      const expDate = new Date(mfgDate)
      expDate.setMonth(expDate.getMonth() + 2)
      return formatDateForInput(expDate)
    } catch (error) {
      console.error("Error generating expiration date:", error)
      return ""
    }
  }

  // Create modal containers if they don't exist
  const setupModalContainers = () => {
    // Check if edit modal container exists
    if (!document.getElementById("edit-batch-modal-container")) {
      const editModalContainer = document.createElement("div")
      editModalContainer.id = "edit-batch-modal-container"
      document.body.appendChild(editModalContainer)
    }

    // Check if delete modal container exists
    if (!document.getElementById("delete-batch-modal-container")) {
      const deleteModalContainer = document.createElement("div")
      deleteModalContainer.id = "delete-batch-modal-container"
      document.body.appendChild(deleteModalContainer)
    }
  }

  // Function to close all modals - CRITICAL FIX FOR DOUBLE MODAL ISSUE
  const closeAllModals = () => {
    // Close edit batch modal container
    const editModalContainer = document.getElementById("edit-batch-modal-container")
    if (editModalContainer) {
      editModalContainer.style.display = "none"
      editModalContainer.innerHTML = "" // Clear content to prevent stacking issues
    }

    // Close delete batch modal container
    const deleteModalContainer = document.getElementById("delete-batch-modal-container")
    if (deleteModalContainer) {
      deleteModalContainer.style.display = "none"
      deleteModalContainer.innerHTML = "" // Clear content to prevent stacking issues
    }

    // Close Bootstrap modals
    if (typeof bootstrap !== "undefined") {
      // Close Batch Track Edit Modal if it exists
      const batchTrackEditModal = document.getElementById("batchTrackEditModal")
      if (batchTrackEditModal) {
        try {
          const bsModal = bootstrap.Modal.getInstance(batchTrackEditModal)
          if (bsModal) {
            bsModal.hide()
          }
        } catch (e) {
          console.error("Error closing bootstrap modal:", e)
        }
      }

      // Close Batches Modal if it exists
      const batchesModal = document.getElementById("batchesModal")
      if (batchesModal) {
        try {
          const bsModal = bootstrap.Modal.getInstance(batchesModal)
          if (bsModal) {
            bsModal.hide()
          }
        } catch (e) {
          console.error("Error closing bootstrap modal:", e)
        }
      }
    }
  }

  // Function to save batch with proper date formatting - CRITICAL FIX FOR DATE ISSUE
  const saveBatch = () => {
    const form = document.getElementById("add-batch-form")
    if (!form) return

    // Validate form
    if (!form.checkValidity()) {
      form.reportValidity()
      return
    }

    // Get form data
    const formData = new FormData(form)

    // CRITICAL FIX: Ensure dates are properly formatted (YYYY-MM-DD)
    const manufacturingDate = document.getElementById("batch-manufacturing-date").value
    const expirationDate = document.getElementById("batch-expiration-date").value

    // Format manufacturing date - CRITICAL FIX
    if (manufacturingDate) {
      formData.set("manufacturingDate", formatDateForServer(manufacturingDate))
    }

    // Format expiration date
    if (expirationDate) {
      formData.set("expirationDate", formatDateForServer(expirationDate))
    } else {
      // If expiration date is missing, generate it from manufacturing date
      const newExpirationDate = generateExpirationDate(manufacturingDate)
      formData.set("expirationDate", formatDateForServer(newExpirationDate))
    }

    // Log the data being sent for debugging
    console.log("Sending data:", {
      manufacturingDate: formData.get("manufacturingDate"),
      expirationDate: formData.get("expirationDate"),
    })

    // Send request
    fetch("save_batch.php", {
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
        if (data.success) {
          // Show success message
          showResponseMessage("success", data.message || "Batch saved successfully!")

          // Hide form
          document.getElementById("batch-modal-form").style.display = "none"

          // Reset form
          form.reset()

          // Refresh batch table
          const productId = document.getElementById("batch-product-id-input").value
          fetchProductBatches(productId)

          // Refresh inventory table
          if (typeof fetchInventoryData === "function") {
            fetchInventoryData(1, "", "", "")
          }
        } else {
          throw new Error(data.error || "Failed to save batch")
        }
      })
      .catch((error) => {
        console.error("Error saving batch:", error)
        showResponseMessage("danger", "Error saving batch. Please try again.")
      })
  }

  // Function to open edit batch modal - FIXED TO PREVENT DOUBLE MODAL
  const openEditBatchModal = (batchId, productId) => {
    // CRITICAL FIX: Close any existing modals first
    closeAllModals()

    // Fetch batch details
    fetch(`get_batch.php?batch_id=${batchId}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok")
        }
        return response.json()
      })
      .then((data) => {
        if (data.success) {
          // Format dates for display
          const batch = data.batch
          if (batch.manufacturing_date) {
            batch.manufacturing_date = formatDateForInput(batch.manufacturing_date)
          }
          if (batch.expiration_date) {
            batch.expiration_date = formatDateForInput(batch.expiration_date)
          }

          // Create and show edit modal
          const modalHtml = `
            <div class="modal-overlay">
              <div class="modal-container">
                <div class="modal-header">
                  <h3>Edit Batch</h3>
                  <button class="modal-close-btn" aria-label="Close">×</button>
                </div>
                <div class="modal-body">
                  <form id="edit-batch-form" class="batch-form">
                    <input type="hidden" name="batchId" value="${batch.batch_id}">
                    <input type="hidden" name="productId" value="${batch.product_id}">
                    
                    <div class="form-group">
                      <label for="edit-batch-code">Batch Code</label>
                      <input type="text" id="edit-batch-code" name="batchCode" class="form-control" value="${batch.batch_code}" required>
                    </div>
                    
                    <div class="form-group">
                      <label for="edit-batch-quantity">Quantity</label>
                      <input type="number" id="edit-batch-quantity" name="quantity" class="form-control" value="${batch.quantity}" min="1" required>
                    </div>
                    
                    <div class="form-group">
                      <label for="edit-manufacturing-date">Manufacturing Date</label>
                      <input type="date" id="edit-manufacturing-date" name="manufacturingDate" class="form-control" value="${batch.manufacturing_date}" required>
                    </div>
                    
                    <div class="form-group">
                      <label for="edit-expiration-date">Expiration Date</label>
                      <input type="date" id="edit-expiration-date" name="expirationDate" class="form-control" value="${batch.expiration_date}" required>
                    </div>
                    
                    <div class="form-actions">
                      <button type="button" class="btn btn-secondary modal-close-btn">Cancel</button>
                      <button type="submit" class="btn btn-primary">Save Changes</button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          `

          const modalContainer = document.getElementById("edit-batch-modal-container")
          modalContainer.innerHTML = modalHtml
          modalContainer.style.display = "block"

          // Add event listener for manufacturing date change
          const manufacturingDateInput = document.getElementById("edit-manufacturing-date")
          if (manufacturingDateInput) {
            manufacturingDateInput.addEventListener("change", function () {
              const expirationDateInput = document.getElementById("edit-expiration-date")
              if (expirationDateInput && this.value) {
                expirationDateInput.value = generateExpirationDate(this.value)
              }
            })
          }

          // Add event listener for form submission
          const editForm = document.getElementById("edit-batch-form")
          if (editForm) {
            editForm.addEventListener("submit", function (e) {
              e.preventDefault()
              updateBatch(this)
            })
          }
        } else {
          showToast("error", data.error || "Failed to fetch batch details")
        }
      })
      .catch((error) => {
        console.error("Error fetching batch details:", error)
        showToast("error", "Error fetching batch details. Please try again.")
      })
  }

  // Function to update batch with proper date formatting
  const updateBatch = (form) => {
    const formData = new FormData(form)

    // CRITICAL FIX: Ensure dates are properly formatted
    const manufacturingDate = document.getElementById("edit-manufacturing-date").value
    const expirationDate = document.getElementById("edit-expiration-date").value

    // Format manufacturing date - CRITICAL FIX
    formData.set("manufacturingDate", formatDateForServer(manufacturingDate))

    // Format expiration date
    formData.set("expirationDate", formatDateForServer(expirationDate))

    // Log the data being sent for debugging
    console.log("Updating batch with data:", {
      manufacturingDate: formData.get("manufacturingDate"),
      expirationDate: formData.get("expirationDate"),
    })

    // Send request
    fetch("save_batch.php", {
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
        if (data.success) {
          showToast("success", data.message || "Batch updated successfully!")
          closeAllModals()

          // Refresh batch table
          const productId = formData.get("productId")
          fetchProductBatches(productId)

          // Refresh inventory table if needed
          if (typeof fetchInventoryData === "function") {
            fetchInventoryData(1, "", "", "")
          }
        } else {
          throw new Error(data.error || "Failed to update batch")
        }
      })
      .catch((error) => {
        console.error("Error updating batch:", error)
        showToast("error", "Error updating batch. Please try again.")
      })
  }

  // Function to show toast notification
  const showToast = (type, message) => {
    // Check if we have a custom toast function
    if (typeof showResponseMessage === "function") {
      showResponseMessage(type, message)
      return
    }

    // Fallback toast implementation
    console.log(`${type}: ${message}`)
    alert(`${type}: ${message}`)
  }

  // Helper function to fetch product batches
  const fetchProductBatches = (productId) => {
    // Check if we have a custom function
    if (typeof window.fetchProductBatches === "function") {
      window.fetchProductBatches(productId)
      return
    }

    // Default implementation
    fetch(`get_product_batches.php?product_id=${productId}`)
      .then((response) => response.json())
      .then((data) => {
        if (data.success && typeof window.renderBatchTable === "function") {
          window.renderBatchTable(data.batches)
        }
      })
      .catch((error) => {
        console.error("Error fetching batches:", error)
      })
  }

  // Override the original editBatch function to use our enhanced modal
  // CRITICAL FIX: This prevents double modal issue
  const originalEditBatch = window.editBatch || (() => {})

  window.editBatch = (batchId, productId) => {
    // Close any existing modals first
    closeAllModals()

    // Then open our modal
    openEditBatchModal(batchId, productId)
  }

  // Initialize the enhanced batch management functionality
  const init = () => {
    setupModalContainers()

    // Set up event delegation for batch action buttons
    document.addEventListener("click", (e) => {
      // Edit batch button
      if (e.target.closest(".edit-batch-btn")) {
        const button = e.target.closest(".edit-batch-btn")
        const batchId = button.dataset.batchId
        const productId = button.dataset.productId
        openEditBatchModal(batchId, productId)
      }

      // Close modal buttons
      if (e.target.closest(".modal-close-btn") || e.target.classList.contains("modal-overlay")) {
        closeAllModals()
      }
    })

    // Fix the manufacturing date change event handler to properly update expiration date
    const batchManufacturingDate = document.getElementById("batch-manufacturing-date")
    if (batchManufacturingDate) {
      batchManufacturingDate.addEventListener("change", function () {
        // Update expiration date when manufacturing date changes
        const expirationDate = document.getElementById("batch-expiration-date")
        if (expirationDate && this.value) {
          const newExpirationDate = generateExpirationDate(this.value)
          expirationDate.value = newExpirationDate
          console.log("Updated expiration date to:", newExpirationDate)
        }
      })
    }

    // Fix the add batch form submission
    const addBatchForm = document.getElementById("add-batch-form")
    if (addBatchForm) {
      addBatchForm.addEventListener("submit", (e) => {
        e.preventDefault()
        saveBatch()
      })
    }

    // Make functions available globally
    window.openEditBatchModal = openEditBatchModal
    window.closeAllModals = closeAllModals
    window.saveBatch = saveBatch
    window.updateBatch = updateBatch
    window.showToast = showToast
  }

  // Run initialization
  init()
})



