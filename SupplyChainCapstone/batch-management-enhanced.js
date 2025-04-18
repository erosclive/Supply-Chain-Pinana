/**
 * Enhanced batch management functionality with improved edit and delete modals
 */

document.addEventListener("DOMContentLoaded", () => {
    // Utility functions for date handling
    const formatDateForInput = (dateString) => {
      try {
        const date = new Date(dateString)
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, "0")
        const day = String(date.getDate()).padStart(2, "0")
        return `${year}-${month}-${day}`
      } catch (error) {
        console.error("Error formatting date:", error)
        return "" // Or some default value
      }
    }
  
    const formatDateForDisplay = (dateString) => {
      try {
        const date = new Date(dateString)
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
        const date = new Date(dateString)
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
        const mfgDate = new Date(manufacturingDate)
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
  
    // Set up event delegation for batch action buttons
    const setupBatchActionListeners = () => {
      document.addEventListener("click", (e) => {
        // Edit batch button
        if (e.target.closest(".edit-batch-btn")) {
          const button = e.target.closest(".edit-batch-btn")
          const batchId = button.dataset.batchId
          const productId = button.dataset.productId
          openEditBatchModal(batchId, productId)
        }
  
        // Delete batch button
        if (e.target.closest(".delete-batch-btn")) {
          const button = e.target.closest(".delete-batch-btn")
          const batchId = button.dataset.batchId
          const productId = button.dataset.productId
          const batchCode = button.dataset.batchCode || "this batch"
          openDeleteBatchModal(batchId, productId, batchCode)
        }
  
        // Close modal buttons
        if (e.target.closest(".modal-close-btn") || e.target.classList.contains("modal-overlay")) {
          closeAllModals()
        }
      })
    }
  
    // Function to open edit batch modal
    const openEditBatchModal = (batchId, productId) => {
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
  
    // Function to update batch
    const updateBatch = (form) => {
      const formData = new FormData(form)
  
      // Ensure dates are properly formatted
      const manufacturingDate = document.getElementById("edit-manufacturing-date").value
      const expirationDate = document.getElementById("edit-expiration-date").value
  
      formData.set("manufacturingDate", formatDateForServer(manufacturingDate))
      formData.set("expirationDate", formatDateForServer(expirationDate))
  
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
  
    // Function to delete batch
    const deleteBatch = (batchId, productId) => {
      fetch("delete_batch.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: `batch_id=${batchId}&product_id=${productId}`,
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error("Network response was not ok")
          }
          return response.json()
        })
        .then((data) => {
          if (data.success) {
            showToast("success", data.message || "Batch deleted successfully!")
            closeAllModals()
  
            // Refresh batch table
            fetchProductBatches(productId)
  
            // Refresh inventory table if needed
            if (typeof fetchInventoryData === "function") {
              fetchInventoryData(1, "", "", "")
            }
          } else {
            throw new Error(data.error || "Failed to delete batch")
          }
        })
        .catch((error) => {
          console.error("Error deleting batch:", error)
          showToast("error", "Error deleting batch. Please try again.")
        })
    }
  
    // Function to close all modals
    const closeAllModals = () => {
      const editModalContainer = document.getElementById("edit-batch-modal-container")
      if (editModalContainer) {
        editModalContainer.style.display = "none"
        editModalContainer.innerHTML = "" // Clear content to prevent stacking issues
      }
  
      const deleteModalContainer = document.getElementById("delete-batch-modal-container")
      if (deleteModalContainer) {
        deleteModalContainer.style.display = "none"
        deleteModalContainer.innerHTML = "" // Clear content to prevent stacking issues
      }
    }
  
    // Function to show toast notification
    const showToast = (type, message) => {
      // Check if we have a custom toast function
      if (typeof showResponseMessage === "function") {
        showResponseMessage(type, message)
        return
      }
  
      // Fallback toast implementation
      const toast = document.createElement("div")
      toast.className = `toast toast-${type}`
      toast.innerHTML = `
        <div class="toast-content">
          <i class="bi ${type === "success" ? "bi-check-circle-fill" : "bi-exclamation-circle-fill"}"></i>
          <span>${message}</span>
        </div>
        <button class="toast-close">×</button>
      `
  
      document.body.appendChild(toast)
  
      // Show toast
      setTimeout(() => {
        toast.classList.add("show")
      }, 10)
  
      // Auto hide after 5 seconds
      setTimeout(() => {
        toast.classList.remove("show")
        setTimeout(() => {
          document.body.removeChild(toast)
        }, 300)
      }, 5000)
  
      // Close button
      const closeBtn = toast.querySelector(".toast-close")
      if (closeBtn) {
        closeBtn.addEventListener("click", () => {
          toast.classList.remove("show")
          setTimeout(() => {
            document.body.removeChild(toast)
          }, 300)
        })
      }
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
  
    // Override the original renderBatchTable function with improved date handling
    window.renderBatchTable = (batches) => {
      const batchTableBody = document.getElementById("batch-table-body")
      if (!batchTableBody) return
  
      if (batches.length === 0) {
        batchTableBody.innerHTML = `
          <tr>
            <td colspan="6" class="text-center py-3">
              No batches found for this product. Add your first batch!
            </td>
          </tr>
        `
        return
      }
  
      let html = ""
  
      batches.forEach((batch) => {
        // Ensure dates are properly parsed
        const today = new Date()
  
        // Fix: Properly parse the expiration date with fallback for invalid dates
        let expiryDate = null
        try {
          // First check if it's 0000-00-00 or null
          if (!batch.expiration_date || batch.expiration_date === "0000-00-00") {
            // Generate expiration date from manufacturing date if available
            if (batch.manufacturing_date && batch.manufacturing_date !== "0000-00-00") {
              const mfgDate = new Date(batch.manufacturing_date)
              mfgDate.setMonth(mfgDate.getMonth() + 2)
              expiryDate = mfgDate
            } else {
              // Default to 2 months from today
              expiryDate = new Date()
              expiryDate.setMonth(expiryDate.getMonth() + 2)
            }
          } else {
            expiryDate = new Date(batch.expiration_date)
            // Check if date is valid
            if (isNaN(expiryDate.getTime())) {
              throw new Error("Invalid date")
            }
          }
        } catch (error) {
          console.error("Error parsing expiration date:", error, batch.expiration_date)
          // Default to 2 months from today if parsing fails
          expiryDate = new Date()
          expiryDate.setMonth(expiryDate.getMonth() + 2)
        }
  
        const daysUntilExpiry = expiryDate ? Math.floor((expiryDate - today) / (1000 * 60 * 60 * 24)) : 0
  
        let expiryStatus, expiryClass, expiryIcon
  
        if (!expiryDate) {
          expiryStatus = "Unknown"
          expiryClass = "text-secondary"
          expiryIcon = "bi-question-circle-fill"
        } else if (daysUntilExpiry < 0) {
          expiryStatus = "Expired"
          expiryClass = "text-danger"
          expiryIcon = "bi-exclamation-triangle-fill"
        } else if (daysUntilExpiry <= 30) {
          expiryStatus = `Expires in ${daysUntilExpiry} days`
          expiryClass = "text-warning"
          expiryIcon = "bi-clock-fill"
        } else {
          expiryStatus = "Good"
          expiryClass = "text-success"
          expiryIcon = "bi-check-circle-fill"
        }
  
        // Format dates for display with fallbacks for invalid dates
        let formattedExpiryDate = "N/A"
        if (expiryDate) {
          try {
            const year = expiryDate.getFullYear()
            const month = String(expiryDate.getMonth() + 1).padStart(2, "0")
            const day = String(expiryDate.getDate()).padStart(2, "0")
            formattedExpiryDate = `${month}/${day}/${year}`
          } catch (error) {
            console.error("Error formatting expiry date:", error)
            formattedExpiryDate = "Invalid date"
          }
        }
  
        let formattedManufacturingDate = "N/A"
        if (batch.manufacturing_date && batch.manufacturing_date !== "0000-00-00") {
          try {
            const mfgDate = new Date(batch.manufacturing_date)
            const year = mfgDate.getFullYear()
            const month = String(mfgDate.getMonth() + 1).padStart(2, "0")
            const day = String(mfgDate.getDate()).padStart(2, "0")
            formattedManufacturingDate = `${month}/${day}/${year}`
          } catch (error) {
            console.error("Error formatting manufacturing date:", error)
            formattedManufacturingDate = "Invalid date"
          }
        }
  
        html += `
          <tr>
            <td>${batch.batch_code}</td>
            <td>${batch.quantity}</td>
            <td>${formattedManufacturingDate}</td>
            <td>${formattedExpiryDate}</td>
            <td>
              <div class="${expiryClass}">
                <i class="bi ${expiryIcon} me-1"></i>
                ${expiryStatus}
              </div>
            </td>
            <td>
              <div class="action-buttons">
                <button class="action-btn action-btn-edit edit-batch-btn" title="Edit Batch" 
                  data-batch-id="${batch.batch_id}" 
                  data-product-id="${batch.product_id}">
                  <i class="bi bi-pencil"></i>
                </button>
                <button class="action-btn action-btn-delete delete-batch-btn" title="Delete Batch" 
                  data-batch-id="${batch.batch_id}" 
                  data-product-id="${batch.product_id}">
                  <i class="bi bi-trash"></i>
                </button>
              </div>
            </td>
          </tr>
        `
      })
  
      batchTableBody.innerHTML = html
  
      // Add event listeners to batch action buttons
      setupBatchActionButtons()
    }
  
    // Override the original editBatch function to use our enhanced modal
    window.editBatch = (batchId, productId) => {
      openEditBatchModal(batchId, productId)
    }
  
    // Add data-batch-code attribute to delete buttons for better UX
    window.setupBatchActionButtons = () => {
      const deleteBtns = document.querySelectorAll(".delete-batch-btn")
      deleteBtns.forEach((btn) => {
        const batchId = btn.dataset.batchId
        const row = btn.closest("tr")
        if (row) {
          const batchCode = row.cells[0].textContent.trim()
          btn.dataset.batchCode = batchCode
        }
      })
  
      // Add event listeners to edit and delete buttons
      const editBtns = document.querySelectorAll(".edit-batch-btn")
      editBtns.forEach((btn) => {
        btn.addEventListener("click", function () {
          const batchId = this.dataset.batchId
          const productId = this.dataset.productId
          openEditBatchModal(batchId, productId)
        })
      })
  
     
    }
  
    // Initialize the enhanced batch management functionality
    const init = () => {
      setupModalContainers()
      setupBatchActionListeners()
  
      // Make functions available globally
      window.openEditBatchModal = openEditBatchModal
      
      window.closeAllModals = closeAllModals
      window.showToast = showToast
    }
  
    // Run initialization
    init()
  
    // Compatibility with existing code
    if (typeof showResponseMessage !== "function") {
      window.showResponseMessage = (type, message) => {
        // Basic implementation
        console.log(`${type}: ${message}`)
        alert(`${type}: ${message}`)
      }
    }
  
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
  
        // Get form data
        const formData = new FormData(addBatchForm)
  
        // Ensure dates are properly formatted
        const manufacturingDate = document.getElementById("batch-manufacturing-date").value
        const expirationDate = document.getElementById("batch-expiration-date").value
  
        formData.set("manufacturingDate", formatDateForServer(manufacturingDate))
        formData.set("expirationDate", formatDateForServer(expirationDate))
  
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
              showToast("success", data.message || "Batch saved successfully!")
  
              // Hide form
              document.getElementById("batch-modal-form").style.display = "none"
  
              // Reset form
              addBatchForm.reset()
  
              // Refresh batch table
              const productId = document.getElementById("batch-product-id-input").value
              fetchProductBatches(productId)
  
              // Refresh inventory table if needed
              if (typeof fetchInventoryData === "function") {
                fetchInventoryData(1, "", "", "")
              }
            } else {
              throw new Error(data.error || "Failed to save batch")
            }
          })
          .catch((error) => {
            console.error("Error saving batch:", error)
            showToast("error", "Error saving batch. Please try again.")
          })
      })
    }
  
    // Declare fetchInventoryData if it's not already defined
    if (typeof fetchInventoryData === "undefined") {
      window.fetchInventoryData = () => {
        console.warn("fetchInventoryData is not defined. Please ensure it is loaded.")
      }
    }
  
    // Declare showResponseMessage if it's not already defined
    if (typeof showResponseMessage === "undefined") {
      window.showResponseMessage = (type, message) => {
        console.warn("showResponseMessage is not defined. Using a default implementation.")
        alert(`${type}: ${message}`)
      }
    }
  
    // Declare setupBatchActionButtons if it's not already defined
    if (typeof setupBatchActionButtons === "undefined") {
      window.setupBatchActionButtons = () => {
        console.warn("setupBatchActionButtons is not defined. Please ensure it is loaded.")
      }
    }
  })
  
  