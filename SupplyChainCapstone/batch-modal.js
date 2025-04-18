/**
 * Enhanced UI modals for batch management
 * This script adds improved edit and delete modals for batch management
 */

document.addEventListener("DOMContentLoaded", () => {
    // Declare variables that might be undefined
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
  
    const generateExpirationDate = (manufacturingDate) => {
      try {
        const mfgDate = new Date(manufacturingDate)
        // Add 2 months to match your existing logic
        const expDate = new Date(mfgDate)
        expDate.setMonth(expDate.getMonth() + 2)
        const year = expDate.getFullYear()
        const month = String(expDate.getMonth() + 1).padStart(2, "0")
        const day = String(expDate.getDate()).padStart(2, "0")
        return `${year}-${month}-${day}`
      } catch (error) {
        console.error("Error generating expiration date:", error)
        return "" // Or some default value
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
        return "" // Or some default value
      }
    }
  
    const fetchInventoryData = () => {
      console.warn("fetchInventoryData function is not defined.")
    }
  
    const showResponseMessage = () => {
      console.warn("showResponseMessage function is not defined.")
    }
  
    // Create modal containers if they don't exist
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
  
    // Function to set up modal containers
    function setupModalContainers() {
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
  
    // Function to open edit batch modal
    function openEditBatchModal(batchId, productId) {
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
  
            // Create and show edit modal as dropdown
            const modalHtml = `
              <div class="modal-container edit-modal-dropdown">
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
    function updateBatch(form) {
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
    function deleteBatch(batchId, productId) {
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
    function closeAllModals() {
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
    function showToast(type, message) {
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
    function fetchProductBatches(productId) {
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
    const originalEditBatch = window.editBatch || (() => {})
  
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
    }
  
    // Make functions available globally
    window.openEditBatchModal = openEditBatchModal
    window.closeAllModals = closeAllModals
  })
  
  