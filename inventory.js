// Global variables
let allProducts = []
let currentFilter = "all"
let currentSort = "id-desc"
let currentSearch = ""
let currentPage = 1
let selectedTrackingType = null

// Function to generate the next product ID
function generateNextProductId() {
  const inventoryTableBody = document.getElementById("inventory-table-body")
  if (!inventoryTableBody) return "P001" // Default if table doesn't exist

  // Get all existing product IDs from the table
  const productIdElements = inventoryTableBody.querySelectorAll(".product-id")
  const productIds = Array.from(productIdElements).map((el) => el.textContent)

  if (productIds.length === 0) return "P001" // First product

  // Find the highest product ID number
  let highestNum = 0

  productIds.forEach((id) => {
    if (id.startsWith("P")) {
      const numPart = Number.parseInt(id.substring(1), 10)
      if (!isNaN(numPart) && numPart > highestNum) {
        highestNum = numPart
      }
    }
  })

  // Generate the next ID by incrementing the highest number
  const nextNum = highestNum + 1
  return `P${nextNum.toString().padStart(3, "0")}`
}

// Function to generate batch code with format: YYYYMMDD-XXX
function generateBatchCode() {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, "0")
  const day = String(now.getDate()).padStart(2, "0")

  // Generate a random 3-digit number
  const randomNum = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0")

  return `${year}${month}${day}-${randomNum}`
}

// Function to generate expiration date (2 months from today)
function generateExpirationDate(fromDate = null) {
  const date = fromDate ? new Date(fromDate) : new Date()
  date.setMonth(date.getMonth() + 2)

  // Format as YYYY-MM-DD
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")

  return `${year}-${month}-${day}`
}

// Format date for input fields (YYYY-MM-DD)
function formatDateForInput(dateString) {
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

// Format date for display (MM/DD/YYYY)
function formatDateForDisplay(dateString) {
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

// Format date for server (YYYY-MM-DD)
function formatDateForServer(dateString) {
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

// Fetch inventory data from the database with all parameters
function fetchInventoryData(page = 1, filter = "all", sort = "id-desc", search = "") {
  const inventoryTableBody = document.getElementById("inventory-table-body")
  if (!inventoryTableBody) return

  // Update current page
  currentPage = page

  // Show loading indicator
  inventoryTableBody.innerHTML = `
    <tr>
      <td colspan="8" class="text-center py-3">
        <div class="spinner-border spinner-border-sm text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
        <span class="ms-2">Loading inventory data...</span>
      </td>
    </tr>
  `

  // Build URL with all parameters
  const url = `fetch_inventory.php?page=${page}&filter=${filter}&sort=${sort}&search=${encodeURIComponent(search)}`

  // Fetch data from PHP endpoint
  fetch(url)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok")
      }
      return response.json()
    })
    .then((data) => {
      if (data.success) {
        // Store all products for reference
        allProducts = data.products

        // Render inventory table
        renderInventoryTable(data.products)

        // Render pagination
        renderPagination(data.pagination)

        // Update search input if it was set from URL
        const searchInput = document.getElementById("inventory-search")
        if (searchInput && data.search && searchInput.value !== data.search) {
          searchInput.value = data.search
        }
      } else {
        throw new Error(data.error || "Failed to fetch inventory data")
      }
    })
    .catch((error) => {
      console.error("Error fetching inventory:", error)
      inventoryTableBody.innerHTML = `
        <tr>
          <td colspan="8" class="text-center py-3 text-danger">
            <i class="bi bi-exclamation-triangle me-2"></i>
            Error loading inventory data. Please try again.
          </td>
        </tr>
      `
    })
}

// Render inventory table with data
function renderInventoryTable(products) {
  const inventoryTableBody = document.getElementById("inventory-table-body")
  if (!inventoryTableBody) return

  if (products.length === 0) {
    inventoryTableBody.innerHTML = `
        <tr>
          <td colspan="7" class="text-center py-3">
            No products found. ${currentSearch ? "Try a different search term." : "Add your first product!"}
          </td>
        </tr>
      `
    return
  }

  let html = ""

  products.forEach((product) => {
    // Determine status class
    let statusClass = ""
    if (product.status === "In Stock") {
      statusClass = "status-in-stock"
    } else if (product.status === "Low Stock") {
      statusClass = "status-low-stock"
    } else if (product.status === "Out of Stock") {
      statusClass = "status-out-stock"
    }

    // Format price with 2 decimal places
    const formattedPrice = Number.parseFloat(product.price).toFixed(2)

    // Determine if product has batch tracking
    const batchTrackingIcon =
      product.batch_tracking == 1
        ? '<span class="badge bg-success ms-1" title="Batch tracking enabled"><i class="bi bi-layers"></i></span>'
        : ""

    html += `
        <tr data-id="${product.id}" data-product-id="${product.product_id}" data-name="${product.product_name}" data-category="${product.category}" data-status="${product.status}">
          <td><span class="product-id">${product.product_id}</span></td>
          <td>
            <div class="d-flex align-items-center">
              ${product.product_photo ? `<img src="${product.product_photo}" class="me-2" width="30" height="30" alt="${product.product_name}" style="object-fit: cover; border-radius: 4px;">` : ""}
              <span class="product-name">${product.product_name}</span>
            </div>
          </td>
          <td class="product-category">${product.category}</td>
          <td><span class="stock">${product.stocks}</span></td>
          <td><span class="price">₱${formattedPrice}</span></td>
          <td >
            <span class="status-badge ${statusClass}" >${product.status}</span>
            ${batchTrackingIcon} 
          </td>
          <td>
            <div class="action-buttons">
              <button class="action-btn action-btn-view view-product-btn" title="View Details" data-id="${product.id}" data-product-id="${product.product_id}">
                <i class="bi bi-eye"></i>
              </button>
              <button class="action-btn action-btn-edit" title="Edit" data-id="${product.id}" data-product-id="${product.product_id}">
                <i class="bi bi-pencil"></i>
              </button>
              ${
                product.batch_tracking == 1
                  ? `<button class="action-btn action-btn-batches" title="Manage Batches" data-id="${product.id}" data-product-id="${product.product_id}">
                  <i class="bi bi-layers" ></i>
                </button>`
                  : ""
              }
              <button class="action-btn action-btn-delete" title="Delete" data-id="${product.id}" data-product-id="${product.product_id}">
                <i class="bi bi-trash"></i>
              </button>
            </div>
          </td>
        </tr>
      `
  })

  inventoryTableBody.innerHTML = html

  // Add event listeners to action buttons
  setupActionButtons()
}

// Render pagination controls
function renderPagination(pagination) {
  const paginationContainer = document.getElementById("pagination-container")
  if (!paginationContainer) return

  const { current_page, total_pages, total_items } = pagination

  // If there are no items or only one page, hide pagination
  if (total_items === 0 || total_pages <= 1) {
    paginationContainer.innerHTML = ""
    return
  }

  let html = ""

  // Previous button
  html += `
      <li class="page-item ${current_page === 1 ? "disabled" : ""}">
        <a class="page-link" href="#" data-page="${current_page - 1}" aria-label="Previous">
          <span aria-hidden="true">&laquo;</span>
        </a>
      </li>
    `

  // Page numbers
  const startPage = Math.max(1, current_page - 2)
  const endPage = Math.min(total_pages, current_page + 2)

  // First page
  if (startPage > 1) {
    html += `
        <li class="page-item">
          <a class="page-link" href="#" data-page="1">1</a>
        </li>
      `

    if (startPage > 2) {
      html += `
          <li class="page-item disabled">
            <a class="page-link" href="#">...</a>
          </li>
        `
    }
  }

  // Page numbers
  for (let i = startPage; i <= endPage; i++) {
    html += `
        <li class="page-item ${i === current_page ? "active" : ""}">
          <a class="page-link" href="#" data-page="${i}">${i}</a>
        </li>
      `
  }

  // Last page
  if (endPage < total_pages) {
    if (endPage < total_pages - 1) {
      html += `
          <li class="page-item disabled">
            <a class="page-link" href="#">...</a>
          </li>
        `
    }

    html += `
        <li class="page-item">
          <a class="page-link" href="#" data-page="${total_pages}">${total_pages}</a>
        </li>
      `
  }

  // Next button
  html += `
      <li class="page-item ${current_page === total_pages ? "disabled" : ""}">
        <a class="page-link" href="#" data-page="${current_page + 1}" aria-label="Next">
          <span aria-hidden="true">&raquo;</span>
        </a>
      </li>
    `

  paginationContainer.innerHTML = html

  // Add event listeners to pagination links
  const pageLinks = paginationContainer.querySelectorAll(".page-link")
  pageLinks.forEach((link) => {
    link.addEventListener("click", function (e) {
      e.preventDefault()

      const page = Number.parseInt(this.getAttribute("data-page"))
      if (!isNaN(page) && page > 0) {
        // Fetch data with the new page but keep other filters
        fetchInventoryData(page, currentFilter, currentSort, currentSearch)

        // Scroll to top of table
        const tableContainer = document.querySelector(".table-responsive")
        if (tableContainer) {
          tableContainer.scrollIntoView({ behavior: "smooth" })
        }
      }
    })
  })
}

// Set up action buttons (edit, delete, and manage batches)
function setupActionButtons() {
  // View buttons
  const viewButtons = document.querySelectorAll(".view-product-btn")
  viewButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const productId = this.getAttribute("data-product-id")
      viewProductDetails(productId)
    })
  })

  // Edit buttons
  const editButtons = document.querySelectorAll(".action-btn-edit")
  editButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const productId = this.getAttribute("data-product-id")
      fetchProductForEdit(productId)
    })
  })

  // Delete buttons
  const deleteButtons = document.querySelectorAll(".action-btn-delete")
  deleteButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const productId = this.getAttribute("data-product-id")
      showDeleteConfirmation(productId)
    })
  })

  // Batch management buttons
  const batchButtons = document.querySelectorAll(".action-btn-batches")
  batchButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const productId = this.getAttribute("data-product-id")
      openBatchesModal(productId)
    })
  })
}

// Show delete confirmation modal
function showDeleteConfirmation(productId) {
  // First check if the product can be deleted (not referenced by other tables)
  fetch(`check_product_references.php?productId=${productId}`)
    .then((response) => response.json())
    .then((data) => {
      if (data.canDelete === false) {
        // Product has references, show the cannot delete modal
        showCannotDeleteModal(data.references)
      } else {
        // Product can be deleted, show the normal confirmation modal
        const deleteProductIdField = document.getElementById("delete-product-id")
        if (deleteProductIdField) {
          deleteProductIdField.value = productId
        }

        // Declare bootstrap before using it
        const bootstrap = window.bootstrap
        const deleteConfirmModal = new bootstrap.Modal(document.getElementById("deleteConfirmModal"))
        deleteConfirmModal.show()
      }
    })
    .catch((error) => {
      console.error("Error checking product references:", error)
      showResponseMessage("danger", "Error checking if product can be deleted. Please try again.")
    })
}

// Add a new function to show the cannot delete modal
function showCannotDeleteModal(references) {
  const bootstrap = window.bootstrap

  // Set the references in the modal
  const referencesContainer = document.getElementById("cannot-delete-references")
  if (referencesContainer) {
    let referencesHtml = ""

    if (references.orders && references.orders > 0) {
      referencesHtml += `<li><strong>Orders:</strong> This product is used in ${references.orders} order(s)</li>`
    }

    if (references.orderItems && references.orderItems > 0) {
      referencesHtml += `<li><strong>Order Items:</strong> This product appears in ${references.orderItems} order item(s)</li>`
    }

    if (references.batches && references.batches > 0) {
      referencesHtml += `<li><strong>Batches:</strong> This product has ${references.batches} batch(es)</li>`
    }

    if (references.other && references.other.length > 0) {
      references.other.forEach((ref) => {
        referencesHtml += `<li><strong>${ref.table}:</strong> ${ref.count} reference(s)</li>`
      })
    }

    referencesContainer.innerHTML = referencesHtml
  }

  // Show the modal
  const cannotDeleteModal = new bootstrap.Modal(document.getElementById("cannotDeleteModal"))
  cannotDeleteModal.show()
}

// Set up delete product form
function setupDeleteProductForm() {
  const confirmDeleteBtn = document.getElementById("confirm-delete-btn")
  if (!confirmDeleteBtn) return

  confirmDeleteBtn.addEventListener("click", () => {
    const deleteForm = document.getElementById("delete-product-form")
    if (deleteForm) {
      deleteForm.submit()

      // Listen for iframe load event to know when the form submission is complete
      const deleteFormTarget = document.getElementById("delete-form-target")
      deleteFormTarget.addEventListener("load", function () {
        try {
          const response = JSON.parse(this.contentDocument.body.textContent)
          if (response.success) {
            showResponseMessage("success", response.message || "Product deleted successfully!")

            // Refresh the table with current filters
            fetchInventoryData(currentPage, currentFilter, currentSort, currentSearch)
          } else {
            showResponseMessage("danger", response.error || "Failed to delete product")
          }
        } catch (error) {
          console.error("Error parsing response:", error)
          showResponseMessage("danger", "Error processing server response")
        }

        // Close the modal
        const bootstrap = window.bootstrap
        const deleteConfirmModal = bootstrap.Modal.getInstance(document.getElementById("deleteConfirmModal"))
        if (deleteConfirmModal) {
          deleteConfirmModal.hide()
        }
      })
    }
  })
}

// Fetch product for editing - Fixed to prevent double modal issue
function fetchProductForEdit(productId) {
  // Close any existing modals first
  closeAllModals()

  fetch(`get_product.php?id=${productId}`)
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        const product = data.product

        // Check if product has batch tracking
        if (product.batch_tracking == 1) {
          // Use the batch track edit modal for batch-tracked products
          populateBatchTrackEditForm(product)

          // Show batch track edit modal
          const bootstrap = window.bootstrap
          const batchTrackEditModal = new bootstrap.Modal(document.getElementById("batchTrackEditModal"))
          batchTrackEditModal.show()
        } else {
          // Use the normal track edit modal for normal products
          populateNormalTrackEditForm(product)

          // Show normal track edit modal
          const bootstrap = window.bootstrap
          const normalTrackEditModal = new bootstrap.Modal(document.getElementById("normalTrackEditModal"))
          normalTrackEditModal.show()
        }
      } else {
        showResponseMessage("danger", data.error || "Failed to fetch product details")
      }
    })
    .catch((error) => {
      console.error("Error fetching product details:", error)
      showResponseMessage("danger", "Error connecting to the server. Please try again.")
    })
}

// Populate the normal track edit form
function populateNormalTrackEditForm(product) {
  const editForm = document.getElementById("normal-track-edit-form")
  if (!editForm) return

  // Set form values
  editForm.querySelector("#normal-edit-id").value = product.id
  editForm.querySelector("#normal-edit-productID").value = product.product_id
  editForm.querySelector("#normal-edit-productName").value = product.product_name
  editForm.querySelector("#normal-edit-category").value = product.category
  editForm.querySelector("#normal-edit-stocks").value = product.stocks
  editForm.querySelector("#normal-edit-price").value = product.price

  // If there's a product photo, show it
  const currentPhotoContainer = document.getElementById("normal-current-photo-container")
  if (currentPhotoContainer) {
    if (product.product_photo) {
      currentPhotoContainer.innerHTML = `
          <div class="mb-2">Current photo:</div>
          <img src="${product.product_photo}" alt="${product.product_name}" class="img-thumbnail" style="max-width: 100px;">
        `
      currentPhotoContainer.style.display = "block"
    } else {
      currentPhotoContainer.style.display = "none"
    }
  }
}

// Populate the batch track edit form
function populateBatchTrackEditForm(product) {
  const editForm = document.getElementById("batch-track-edit-form")
  if (!editForm) return

  // Set form values
  editForm.querySelector("#batch-edit-id").value = product.id
  editForm.querySelector("#batch-edit-productID").value = product.product_id
  editForm.querySelector("#batch-edit-productName").value = product.product_name
  editForm.querySelector("#batch-edit-category").value = product.category
  editForm.querySelector("#batch-edit-stocks").value = product.stocks
  editForm.querySelector("#batch-edit-price").value = product.price

  // If there's a product photo, show it
  const currentPhotoContainer = document.getElementById("batch-current-photo-container")
  if (currentPhotoContainer) {
    if (product.product_photo) {
      currentPhotoContainer.innerHTML = `
          <div class="mb-2">Current photo:</div>
          <img src="${product.product_photo}" alt="${product.product_name}" class="img-thumbnail" style="max-width: 100px;">
        `
      currentPhotoContainer.style.display = "block"
    } else {
      currentPhotoContainer.style.display = "none"
    }
  }
}

// Set up add product form
function setupAddProductForm() {
  // Set up track selection modal
  const trackSelectionModal = document.getElementById("trackSelectionModal")
  const normalTrackOption = document.getElementById("normal-track-option")
  const batchTrackOption = document.getElementById("batch-track-option")
  const continueToFormBtn = document.getElementById("continue-to-form-btn")

  // Normal Track Modal
  const normalTrackModal = document.getElementById("normalTrackModal")
  // Batch Track Modal
  const batchTrackModal = document.getElementById("batchTrackModal")

  // Add Product button click
  const addProductBtn = document.getElementById("add-product-btn")
  if (addProductBtn) {
    addProductBtn.addEventListener("click", () => {
      // Reset selection
      selectedTrackingType = null
      normalTrackOption.classList.remove("selected")
      batchTrackOption.classList.remove("selected")
      continueToFormBtn.disabled = true

      // Show track selection modal
      const bootstrap = window.bootstrap
      const trackSelectionModalObj = new bootstrap.Modal(trackSelectionModal)
      trackSelectionModalObj.show()
    })
  }

  // Track option selection
  if (normalTrackOption) {
    normalTrackOption.addEventListener("click", () => {
      normalTrackOption.classList.add("selected")
      batchTrackOption.classList.remove("selected")
      selectedTrackingType = "normal"
      continueToFormBtn.disabled = false
    })
  }

  if (batchTrackOption) {
    batchTrackOption.addEventListener("click", () => {
      batchTrackOption.classList.add("selected")
      normalTrackOption.classList.remove("selected")
      selectedTrackingType = "batch"
      continueToFormBtn.disabled = false
    })
  }

  // Continue to form button click
  if (continueToFormBtn) {
    continueToFormBtn.addEventListener("click", () => {
      // Hide track selection modal
      const bootstrap = window.bootstrap
      const trackSelectionModalObj = bootstrap.Modal.getInstance(trackSelectionModal)
      trackSelectionModalObj.hide()

      // Generate and set the next product ID
      const nextProductId = generateNextProductId()

      // Show the appropriate modal based on selection
      if (selectedTrackingType === "normal") {
        // Set product ID for normal track
        const normalProductIdInput = document.getElementById("normal_productID")
        if (normalProductIdInput) {
          normalProductIdInput.value = nextProductId
        }

        // Set today's date for manufacturing date
        const normalManufacturingDate = document.getElementById("normal_manufacturingDate")
        if (normalManufacturingDate) {
          const today = new Date().toISOString().split("T")[0]
          normalManufacturingDate.value = today
        }

        // Show normal track modal
        const normalTrackModalObj = new bootstrap.Modal(normalTrackModal)
        normalTrackModalObj.show()
      } else if (selectedTrackingType === "batch") {
        // Set product ID for batch track
        const batchProductIdInput = document.getElementById("batch_productID")
        if (batchProductIdInput) {
          batchProductIdInput.value = nextProductId
        }

        // Set today's date for manufacturing date
        const manufacturingDate = document.getElementById("manufacturingDate")
        if (manufacturingDate) {
          const today = new Date().toISOString().split("T")[0]
          manufacturingDate.value = today

          // Auto-generate batch code
          const batchCodeInput = document.getElementById("batchCode")
          if (batchCodeInput) {
            batchCodeInput.value = generateBatchCode()
          }

          // Auto-generate expiration date (2 months from today)
          const expirationDate = document.getElementById("expirationDate")
          if (expirationDate) {
            expirationDate.value = generateExpirationDate(today)
          }
        }

        // Show batch track modal
        const batchTrackModalObj = new bootstrap.Modal(batchTrackModal)
        batchTrackModalObj.show()
      }
    })
  }

  // Set up manufacturing date change event for batch track
  const manufacturingDate = document.getElementById("manufacturingDate")
  if (manufacturingDate) {
    manufacturingDate.addEventListener("change", function () {
      // Update expiration date when manufacturing date changes
      const expirationDate = document.getElementById("expirationDate")
      if (expirationDate && this.value) {
        expirationDate.value = generateExpirationDate(this.value)
      }
    })
  }

  // Set up normal track form submission
  const normalTrackForm = document.getElementById("normal-track-form")
  if (normalTrackForm) {
    normalTrackForm.addEventListener("submit", function (e) {
      e.preventDefault()

      // Submit the form
      this.submit()

      // Listen for iframe load event to know when the form submission is complete
      const formTarget = document.getElementById("form-target")
      formTarget.addEventListener("load", function () {
        handleFormSubmissionResponse(this, normalTrackForm)
      })
    })
  }

  // Set up batch track form submission
  const batchTrackForm = document.getElementById("batch-track-form")
  if (batchTrackForm) {
    batchTrackForm.addEventListener("submit", function (e) {
      e.preventDefault()

      // Submit the form
      this.submit()

      // Listen for iframe load event to know when the form submission is complete
      const formTarget = document.getElementById("form-target")
      formTarget.addEventListener("load", function () {
        handleFormSubmissionResponse(this, batchTrackForm)
      })
    })
  }

  // Set up modal close events to clear form inputs
  if (normalTrackModal) {
    normalTrackModal.addEventListener("hidden.bs.modal", () => {
      if (normalTrackForm) {
        normalTrackForm.reset()
      }
    })

    // Also add event listener to the cancel button
    const normalCancelBtn = normalTrackModal.querySelector('button[data-bs-dismiss="modal"]')
    if (normalCancelBtn) {
      normalCancelBtn.addEventListener("click", () => {
        if (normalTrackForm) {
          normalTrackForm.reset()
        }
      })
    }
  }

  if (batchTrackModal) {
    batchTrackModal.addEventListener("hidden.bs.modal", () => {
      if (batchTrackForm) {
        batchTrackForm.reset()
      }
    })

    // Also add event listener to the cancel button
    const batchCancelBtn = batchTrackModal.querySelector('button[data-bs-dismiss="modal"]')
    if (batchCancelBtn) {
      batchCancelBtn.addEventListener("click", () => {
        if (batchTrackForm) {
          batchTrackForm.reset()
        }
      })
    }
  }
}

// Add this function after the setupAddProductForm function
function validateProductName(input) {
  // Check if input contains only whitespace
  if (!input.value.trim()) {
    input.setCustomValidity("Product name cannot be empty or contain only spaces")
    return false
  }

  // Check for special characters - only allow letters, numbers, spaces, hyphens, apostrophes, commas, periods, and parentheses
  const pattern = /^[A-Za-z0-9\s\-',.()]+$/
  if (!pattern.test(input.value)) {
    input.setCustomValidity("Product name cannot contain special characters")
    return false
  } else {
    input.setCustomValidity("")
    return true
  }
}

// Add validation to normal track form
function setupNormalTrackFormValidation() {
  const normalProductNameInput = document.getElementById("normal_productName")
  if (normalProductNameInput) {
    normalProductNameInput.addEventListener("input", function () {
      validateProductName(this)
    })

    normalProductNameInput.addEventListener("invalid", function () {
      if (!this.value.trim()) {
        this.setCustomValidity("Product name cannot be empty or contain only spaces")
      } else if (!/^[A-Za-z0-9\s\-',.()]+$/.test(this.value)) {
        this.setCustomValidity("Product name cannot contain special characters")
      }
    })

    // Add validation before form submission
    const normalTrackForm = document.getElementById("normal-track-form")
    if (normalTrackForm) {
      normalTrackForm.addEventListener(
        "submit",
        (e) => {
          const isValid = validateProductName(normalProductNameInput)
          if (!isValid) {
            e.preventDefault()
            e.stopPropagation()
          }
        },
        true,
      )
    }
  }
}

// Add validation to batch track form
function setupBatchTrackFormValidation() {
  const batchProductNameInput = document.getElementById("batch_productName")
  if (batchProductNameInput) {
    batchProductNameInput.addEventListener("input", function () {
      validateProductName(this)
    })

    batchProductNameInput.addEventListener("invalid", function () {
      if (!this.value.trim()) {
        this.setCustomValidity("Product name cannot be empty or contain only spaces")
      } else if (!/^[A-Za-z0-9\s\-',.()]+$/.test(this.value)) {
        this.setCustomValidity("Product name cannot contain special characters")
      }
    })

    // Add validation before form submission
    const batchTrackForm = document.getElementById("batch-track-form")
    if (batchTrackForm) {
      batchTrackForm.addEventListener(
        "submit",
        (e) => {
          const isValid = validateProductName(batchProductNameInput)
          if (!isValid) {
            e.preventDefault()
            e.stopPropagation()
          }
        },
        true,
      )
    }
  }
}

// Add validation to edit forms
function setupEditFormsValidation() {
  // Normal track edit form validation
  const normalEditProductNameInput = document.getElementById("normal-edit-productName")
  if (normalEditProductNameInput) {
    normalEditProductNameInput.addEventListener("input", function () {
      validateProductName(this)
    })

    const normalTrackEditForm = document.getElementById("normal-track-edit-form")
    if (normalTrackEditForm) {
      normalTrackEditForm.addEventListener(
        "submit",
        (e) => {
          const isValid = validateProductName(normalEditProductNameInput)
          if (!isValid) {
            e.preventDefault()
            e.stopPropagation()
          }
        },
        true,
      )
    }
  }

  // Batch track edit form validation
  const batchEditProductNameInput = document.getElementById("batch-edit-productName")
  if (batchEditProductNameInput) {
    batchEditProductNameInput.addEventListener("input", function () {
      validateProductName(this)
    })

    const batchTrackEditForm = document.getElementById("batch-track-edit-form")
    if (batchTrackEditForm) {
      batchTrackEditForm.addEventListener(
        "submit",
        (e) => {
          const isValid = validateProductName(batchEditProductNameInput)
          if (!isValid) {
            e.preventDefault()
            e.stopPropagation()
          }
        },
        true,
      )
    }
  }
}

// Handle form submission response
function handleFormSubmissionResponse(iframe, form) {
  // Only process if there's content (form was submitted)
  if (iframe.contentDocument && iframe.contentDocument.body && iframe.contentDocument.body.textContent) {
    try {
      const response = JSON.parse(iframe.contentDocument.body.textContent)
      if (response.success) {
        // Reset form and close modal
        form.reset()
        const bootstrap = window.bootstrap

        // Close the appropriate modal
        if (form.id === "normal-track-form") {
          const modal = bootstrap.Modal.getInstance(document.getElementById("normalTrackModal"))
          if (modal) {
            modal.hide()
          }
        } else if (form.id === "batch-track-form") {
          const modal = bootstrap.Modal.getInstance(document.getElementById("batchTrackModal"))
          if (modal) {
            modal.hide()
          }
        }

        // Refresh inventory data - go to first page to see new product
        fetchInventoryData(1, currentFilter, currentSort, currentSearch)

        // Show success message
        showResponseMessage("success", response.message || "Product added successfully!")
        // In the saveBatch function, add this after the success message:
        // Inside the .then((data) => { if (data.success) { ... } block:
        // Add this line after refreshing the batch table:
        const productId = document.getElementById("batch-product-id-input").value
        updateProductStatusFromBatches(productId)
      } else {
        showResponseMessage("danger", response.error || "Failed to add product")
      }
    } catch (error) {
      console.error("Error parsing response:", error)
      showResponseMessage("danger", "Error processing server response")
    }
  }
}

// Set up edit product form
function setupEditProductForm() {
  const editProductForm = document.getElementById("edit-product-form")
  if (!editProductForm) return

  // Reset form when modal is closed
  const editProductModal = document.getElementById("editProductModal")
  if (editProductModal) {
    editProductModal.addEventListener("hidden.bs.modal", () => {
      if (editProductForm) {
        editProductForm.reset()
        // Also clear the current photo container
        const currentPhotoContainer = document.getElementById("current-photo-container")
        if (currentPhotoContainer) {
          currentPhotoContainer.style.display = "none"
        }
      }
    })
  }

  // Toggle batch details section based on batch tracking checkbox
  const batchTrackingCheckbox = document.getElementById("edit-batchTracking")
  const batchDetailsSection = document.getElementById("edit-batchDetailsSection")

  if (batchTrackingCheckbox && batchDetailsSection) {
    batchTrackingCheckbox.addEventListener("change", function () {
      batchDetailsSection.style.display = this.checked ? "block" : "none"
    })
  }

  // Set up form submission - DIRECT APPROACH WITHOUT EVENT LISTENER
  // This ensures the form is submitted properly
  const updateButton = editProductForm.querySelector('button[type="submit"]')
  if (updateButton) {
    updateButton.addEventListener("click", (e) => {
      e.preventDefault()

      // Submit the form directly
      editProductForm.submit()

      // Listen for iframe load event to know when the form submission is complete
      const editFormTarget = document.getElementById("edit-form-target")
      if (editFormTarget) {
        editFormTarget.onload = function () {
          // Only process if there's content (form was submitted)
          if (this.contentDocument && this.contentDocument.body && this.contentDocument.body.textContent) {
            try {
              const response = JSON.parse(this.contentDocument.body.textContent)
              if (response.success) {
                // Close modal
                const bootstrap = window.bootstrap
                const modal = bootstrap.Modal.getInstance(document.getElementById("editProductModal"))
                if (modal) {
                  modal.hide()
                }

                // Refresh inventory data with current filters
                fetchInventoryData(currentPage, currentFilter, currentSort, currentSearch)

                // Show success message
                showResponseMessage("success", response.message || "Product updated successfully!")
              } else {
                showResponseMessage("danger", response.error || "Failed to update product")
              }
            } catch (error) {
              console.error("Error parsing response:", error)
              showResponseMessage("danger", "Error processing server response")
            }
          }
        }
      }
    })
  }
}

// Set up normal track edit form
function setupNormalTrackEditForm() {
  const normalTrackEditForm = document.getElementById("normal-track-edit-form")
  if (!normalTrackEditForm) return

  // Reset form when modal is closed
  const normalTrackEditModal = document.getElementById("normalTrackEditModal")
  if (normalTrackEditModal) {
    normalTrackEditModal.addEventListener("hidden.bs.modal", () => {
      if (normalTrackEditForm) {
        normalTrackEditForm.reset()
        // Also clear the current photo container
        const currentPhotoContainer = document.getElementById("normal-current-photo-container")
        if (currentPhotoContainer) {
          currentPhotoContainer.style.display = "none"
        }
      }
    })
  }

  // Set up form submission
  const updateButton = normalTrackEditForm.querySelector('button[type="submit"]')
  if (updateButton) {
    updateButton.addEventListener("click", (e) => {
      e.preventDefault()

      // Submit the form directly
      normalTrackEditForm.submit()

      // Listen for iframe load event to know when the form submission is complete
      const editFormTarget = document.getElementById("normal-edit-form-target")
      if (editFormTarget) {
        editFormTarget.onload = function () {
          // Only process if there's content (form was submitted)
          if (this.contentDocument && this.contentDocument.body && this.contentDocument.body.textContent) {
            try {
              const response = JSON.parse(this.contentDocument.body.textContent)
              if (response.success) {
                // Close modal
                const bootstrap = window.bootstrap
                const modal = bootstrap.Modal.getInstance(document.getElementById("normalTrackEditModal"))
                if (modal) {
                  modal.hide()
                }

                // Refresh inventory data with current filters
                fetchInventoryData(currentPage, currentFilter, currentSort, currentSearch)

                // Show success message
                showResponseMessage("success", response.message || "Product updated successfully!")
              } else {
                showResponseMessage("danger", response.error || "Failed to update product")
              }
            } catch (error) {
              console.error("Error parsing response:", error)
              showResponseMessage("danger", "Error processing server response")
            }
          }
        }
      }
    })
  }
}

// Set up batch track edit form
function setupBatchTrackEditForm() {
  const batchTrackEditForm = document.getElementById("batch-track-edit-form")
  if (!batchTrackEditForm) return

  // Reset form when modal is closed
  const batchTrackEditModal = document.getElementById("batchTrackEditModal")
  if (batchTrackEditModal) {
    batchTrackEditModal.addEventListener("hidden.bs.modal", () => {
      if (batchTrackEditForm) {
        batchTrackEditForm.reset()
        // Also clear the current photo container
        const currentPhotoContainer = document.getElementById("batch-current-photo-container")
        if (currentPhotoContainer) {
          currentPhotoContainer.style.display = "none"
        }
      }
    })
  }

  // Set up form submission
  const updateButton = batchTrackEditForm.querySelector('button[type="submit"]')
  if (updateButton) {
    updateButton.addEventListener("click", (e) => {
      e.preventDefault()

      // Submit the form directly
      batchTrackEditForm.submit()

      // Listen for iframe load event to know when the form submission is complete
      const editFormTarget = document.getElementById("batch-edit-form-target")
      if (editFormTarget) {
        editFormTarget.onload = function () {
          // Only process if there's content (form was submitted)
          if (this.contentDocument && this.contentDocument.body && this.contentDocument.body.textContent) {
            try {
              const response = JSON.parse(this.contentDocument.body.textContent)
              if (response.success) {
                // Close modal
                const bootstrap = window.bootstrap
                const modal = bootstrap.Modal.getInstance(document.getElementById("batchTrackEditModal"))
                if (modal) {
                  modal.hide()
                }

                // Refresh inventory data with current filters
                fetchInventoryData(currentPage, currentFilter, currentSort, currentSearch)

                // Show success message
                showResponseMessage("success", response.message || "Product updated successfully!")
              } else {
                showResponseMessage("danger", response.error || "Failed to update product")
              }
            } catch (error) {
              console.error("Error parsing response:", error)
              showResponseMessage("danger", "Error processing server response")
            }
          }
        }
      }
    })
  }
}

// Function to view product details
function viewProductDetails(productId) {
  // Find product in allProducts array
  const product = allProducts.find((p) => p.product_id === productId)

  if (!product) {
    showResponseMessage("danger", "Product not found")
    return
  }

  // Format price with 2 decimal places
  const formattedPrice = Number.parseFloat(product.price).toFixed(2)

  // Create HTML content for the modal
  let detailsHtml = `
    <div class="product-details-container">
      <div class="product-details-header">
        <h4 class="product-title">${product.product_name}</h4>
        <div class="product-id"><span class="badge bg-secondary">${product.product_id}</span></div>
      </div>
      
      <div class="product-details-body">
        <div class="product-image-container">
          ${
            product.product_photo
              ? `<img src="${product.product_photo}" alt="${product.product_name}" class="product-image">`
              : `<div class="no-image">
                <i class="bi bi-image text-muted"></i>
                <span>No Image</span>
              </div>`
          }
        </div>
        
        <div class="product-info">
          <div class="info-group">
            <div class="info-label">Category</div>
            <div class="info-value">${product.category}</div>
          </div>
          
          <div class="info-group">
            <div class="info-label">Price</div>
            <div class="info-value price">₱${formattedPrice}</div>
          </div>
          
          <div class="info-group">
            <div class="info-label">Stock</div>
            <div class="info-value">${product.stocks}</div>
          </div>
          
          <div class="info-group">
            <div class="info-label">Status</div>
            <div class="info-value">
              <span class="status-badge ${getStatusClass(product.status)}">${product.status}</span>
            </div>
          </div>
          
          <div class="info-group">
            <div class="info-label">Tracking Type</div>
            <div class="info-value">
              ${
                product.batch_tracking == 1
                  ? '<span class="badge bg-info">Batch Tracking</span>'
                  : '<span class="badge bg-secondary">Normal Tracking</span>'
              }
            </div>
          </div>
  `

  // Add expiration date information if available
  if (product.expiration_date && product.expiration_date !== "N/A") {
    const expiryDate = new Date(product.expiration_date)
    const today = new Date()
    const daysUntilExpiry = Math.floor((expiryDate - today) / (1000 * 60 * 60 * 24))

    let expiryClass = ""
    let expiryIcon = ""
    let expiryStatus = ""

    if (daysUntilExpiry < 0) {
      expiryClass = "text-danger"
      expiryIcon = "bi-exclamation-triangle-fill"
      expiryStatus = "Expired"
    } else if (daysUntilExpiry <= 30) {
      expiryClass = "text-warning"
      expiryIcon = "bi-clock-fill"
      expiryStatus = `Expires in ${daysUntilExpiry} days`
    } else {
      expiryClass = "text-success"
      expiryIcon = "bi-check-circle-fill"
      expiryStatus = "Good"
    }

    detailsHtml += `
          <div class="info-group">
            <div class="info-label">Expiration Date</div>
            <div class="info-value ${expiryClass}">
              <i class="bi ${expiryIcon} me-1"></i>
              ${formatDateForDisplay(product.expiration_date)}
              <span class="ms-2 fst-italic">(${expiryStatus})</span>
            </div>
          </div>
    `
  }

  // Close the product info div
  detailsHtml += `
        </div>
      </div>
  `

  // If product has batch tracking, fetch and display batch information
  if (product.batch_tracking == 1) {
    detailsHtml += `
      <div class="batch-info-container">
        <div class="batch-info-header">
          <h5><i class="bi bi-layers me-2"></i>Batch Information</h5>
        </div>
        <div id="product-batches-container">
          <div class="batch-loading">
            <div class="spinner-border spinner-border-sm text-primary" role="status">
              <span class="visually-hidden">Loading...</span>
            </div>
            <span class="ms-2">Loading batch data...</span>
          </div>
        </div>
      </div>
    `
  }

  // Close the container div
  detailsHtml += `</div>`

  // Set the modal content
  document.getElementById("product-details-content").innerHTML = detailsHtml

  // Show the modal
  const bootstrap = window.bootstrap
  const productDetailsModal = new bootstrap.Modal(document.getElementById("productDetailsModal"))
  productDetailsModal.show()

  // If product has batch tracking, fetch batch information
  if (product.batch_tracking == 1) {
    fetchProductBatchesForDetails(productId)
  }
}

// Function to fetch batches for product details modal
function fetchProductBatchesForDetails(productId) {
  const batchesContainer = document.getElementById("product-batches-container")
  if (!batchesContainer) return

  // Fetch batches from server
  fetch(`fetch_product_batches.php?product_id=${productId}`)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok")
      }
      return response.json()
    })
    .then((data) => {
      if (data.success) {
        renderBatchesForDetails(data.batches)
      } else {
        throw new Error(data.error || "Failed to fetch batch data")
      }
    })
    .catch((error) => {
      console.error("Error fetching batches:", error)
      batchesContainer.innerHTML = `
        <div class="alert alert-danger" role="alert">
          <i class="bi bi-exclamation-triangle me-2"></i>
          Error loading batch data. Please try again.
        </div>
      `
    })
}

// Function to render batches in the product details modal
function renderBatchesForDetails(batches) {
  const batchesContainer = document.getElementById("product-batches-container")
  if (!batchesContainer) return

  if (batches.length === 0) {
    batchesContainer.innerHTML = `
      <div class="alert alert-info" role="alert">
        <i class="bi bi-info-circle me-2"></i>
        No batches found for this product.
      </div>
    `
    return
  }

  let html = `
    <div class="table-responsive batch-table-container">
      <table class="table table-sm table-hover">
        <thead>
          <tr>
            <th>Batch Code</th>
            <th>Quantity</th>
            <th>Manufacturing Date</th>
            <th>Expiration Date</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
  `

  batches.forEach((batch) => {
    // Calculate expiry status
    const today = new Date()
    const expiryDate = new Date(batch.expiration_date)
    const daysUntilExpiry = Math.floor((expiryDate - today) / (1000 * 60 * 60 * 24))

    let expiryStatus, expiryClass, expiryIcon

    if (daysUntilExpiry < 0) {
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

    // Format dates
    const formattedExpiryDate = formatDateForDisplay(batch.expiration_date)
    const formattedManufacturingDate = batch.manufacturing_date ? formatDateForDisplay(batch.manufacturing_date) : "N/A"

    html += `
      <tr>
        <td><span class="fw-medium">${batch.batch_code}</span></td>
        <td>${batch.quantity}</td>
        <td>${formattedManufacturingDate}</td>
        <td>${formattedExpiryDate}</td>
        <td>
          <div class="${expiryClass}">
            <i class="bi ${expiryIcon} me-1"></i>
            ${expiryStatus}
          </div>
        </td>
      </tr>
    `
  })

  html += `
        </tbody>
      </table>
    </div>
  `

  batchesContainer.innerHTML = html
}

// Helper function to get status class
function getStatusClass(status) {
  switch (status) {
    case "In Stock":
      return "status-in-stock"
    case "Low Stock":
      return "status-low-stock"
    case "Out of Stock":
      return "status-out-stock"
    default:
      return ""
  }
}

// Function to close all modals - CRITICAL FIX FOR DOUBLE MODAL ISSUE
function closeAllModals() {
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

    // Close Normal Track Edit Modal if it exists
    const normalTrackEditModal = document.getElementById("normalTrackEditModal")
    if (normalTrackEditModal) {
      try {
        const bsModal = bootstrap.Modal.getInstance(normalTrackEditModal)
        if (bsModal) {
          bsModal.hide()
        }
      } catch (e) {
        console.error("Error closing bootstrap modal:", e)
      }
    }

    // Close Edit Batch Modal if it exists
    const editBatchModal = document.getElementById("editBatchModal")
    if (editBatchModal) {
      try {
        const bsModal = bootstrap.Modal.getInstance(editBatchModal)
        if (bsModal) {
          bsModal.hide()
        }
      } catch (e) {
        console.error("Error closing bootstrap modal:", e)
      }
    }
  }
}

// Open batches modal
function openBatchesModal(productId) {
  // Close any existing modals first
  closeAllModals()

  // Find product in allProducts array
  const product = allProducts.find((p) => p.product_id === productId)

  if (!product) {
    showResponseMessage("danger", "Product not found")
    return
  }

  // Set product info in modal
  const batchProductName = document.getElementById("batch-product-name")
  const batchProductId = document.getElementById("batch-product-id")
  const batchProductIdInput = document.getElementById("batch-product-id-input")

  if (batchProductName) batchProductName.textContent = product.product_name
  if (batchProductId) batchProductId.textContent = product.product_id
  if (batchProductIdInput) batchProductIdInput.value = product.product_id

  // Fetch batches for this product
  fetchProductBatches(productId)

  // Show modal
  const bootstrap = window.bootstrap
  const batchesModal = new bootstrap.Modal(document.getElementById("batchesModal"))
  batchesModal.show()
}

// Fetch product batches
function fetchProductBatches(productId) {
  const batchTableBody = document.getElementById("batch-table-body")
  if (!batchTableBody) return

  // Show loading indicator
  batchTableBody.innerHTML = `
    <tr>
      <td colspan="6" class="text-center py-3">
        <div class="spinner-border spinner-border-sm text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
        <span class="ms-2">Loading batch data...</span>
      </td>
    </tr>
  `

  // Fetch batches from server
  fetch(`fetch_product_batches.php?product_id=${productId}`)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok")
      }
      return response.json()
    })
    .then((data) => {
      if (data.success) {
        renderBatchTable(data.batches)
      } else {
        throw new Error(data.error || "Failed to fetch batch data")
      }
    })
    .catch((error) => {
      console.error("Error fetching batches:", error)
      batchTableBody.innerHTML = `
        <tr>
          <td colspan="6" class="text-center py-3 text-danger">
            <i class="bi bi-exclamation-triangle me-2"></i>
            Error loading batch data. Please try again.
          </td>
        </tr>
      `
    })
}

// Override the original renderBatchTable function to display expiration duration including custom
function renderBatchTable(batches) {
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
    // Calculate expiry status
    const today = new Date()

    // Ensure dates are properly parsed
    let expiryDate = null
    try {
      if (batch.expiration_date && batch.expiration_date !== "0000-00-00") {
        expiryDate = new Date(batch.expiration_date)
      } else {
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
      }
    } catch (error) {
      console.error("Error parsing expiration date:", error)
      expiryDate = new Date()
      expiryDate.setMonth(expiryDate.getMonth() + 2)
    }

    const daysUntilExpiry = Math.floor((expiryDate - today) / (1000 * 60 * 60 * 24))

    let expiryStatus, expiryClass, expiryIcon

    if (daysUntilExpiry < 0) {
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

    // Format dates for display
    let formattedExpiryDate = "N/A"
    if (expiryDate) {
      formattedExpiryDate = formatDateForDisplay(expiryDate)
    }

    let formattedManufacturingDate = "N/A"
    if (batch.manufacturing_date && batch.manufacturing_date !== "0000-00-00") {
      formattedManufacturingDate = formatDateForDisplay(batch.manufacturing_date)
    }

    // Determine expiration duration for display
    let durationText = ""
    if (batch.expiration_duration) {
      switch (batch.expiration_duration) {
        case "2w":
          durationText = "(2 Weeks)"
          break
        case "5m":
          durationText = "(5 Months)"
          break
        case "8m":
          durationText = "(8 Months)"
          break
        case "1y":
          durationText = "(1 Year)"
          break
        case "custom":
          if (batch.custom_duration_days) {
            durationText = `(${batch.custom_duration_days} Days)`
          } else {
            durationText = "(Custom)"
          }
          break
        default:
          durationText = ""
      }
    }

    html += `
      <tr>
        <td>${batch.batch_code}</td>
        <td>${batch.quantity}</td>
        <td>${formattedManufacturingDate}</td>
        <td>${formattedExpiryDate} <span class="text-muted small">${durationText}</span></td>
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

// Set up batch action buttons
function setupBatchActionButtons() {
  // Edit batch buttons
  document.querySelectorAll(".edit-batch-btn").forEach((button) => {
    button.addEventListener("click", function () {
      const batchId = this.getAttribute("data-batch-id")
      const productId = this.getAttribute("data-product-id")
      editBatch(batchId, productId)
    })
  })

  // Delete batch buttons
  document.querySelectorAll(".delete-batch-btn").forEach((button) => {
    button.addEventListener("click", function () {
      const batchId = this.getAttribute("data-batch-id")
      const productId = this.getAttribute("data-product-id")
      deleteBatch(batchId, productId)
    })
  })
}

function editBatch(batchId, productId) {
  // Close any existing modals first
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
        // Create and show edit modal
        const batch = data.batch
        if (batch.manufacturing_date) {
          batch.manufacturing_date = formatDateForInput(batch.manufacturing_date)
        }
        if (batch.expiration_date) {
          batch.expiration_date = formatDateForInput(batch.expiration_date)
        }

        // Create and show edit modal with enhanced UI
        const modalHtml = `
          <div class="modal-overlay batch-edit-overlay">
            <div class="modal-container batch-edit-container">
              <div class="modal-header bg-primary text-white p-3 rounded-top d-flex justify-content-between align-items-center">
                <h3 class="m-0 fs-5"><i class="bi bi-box-seam me-2"></i>Edit Batch</h3>
                <button class="modal-close-btn btn-close btn-close-white" aria-label="Close"></button>
              </div>
              <div class="modal-body p-4">
                <form id="edit-batch-form" class="batch-form">
                  <input type="hidden" name="batchId" value="${batch.batch_id}">
                  <input type="hidden" name="productId" value="${batch.product_id}">
                  
                  <div class="row mb-3">
                    <div class="col-md-6">
                      <label for="edit-batch-code" class="form-label fw-bold">Batch Code</label>
                      <div class="input-group">
                        <span class="input-group-text"><i class="bi bi-upc-scan"></i></span>
                        <input type="text" id="edit-batch-code" name="batchCode" class="form-control" value="${batch.batch_code}" required>
                      </div>
                    </div>
                    
                    <div class="col-md-6">
                      <label for="edit-batch-quantity" class="form-label fw-bold">Quantity</label>
                      <div class="input-group">
                        <span class="input-group-text"><i class="bi bi-123"></i></span>
                        <input type="number" id="edit-batch-quantity" name="quantity" class="form-control" value="${batch.quantity}" min="1" required>
                      </div>
                    </div>
                  </div>
                  
                  <div class="row mb-3">
                    <div class="col-md-6">
                      <label for="edit-manufacturing-date" class="form-label fw-bold">Manufacturing Date</label>
                      <div class="input-group">
                        <span class="input-group-text"><i class="bi bi-calendar-check"></i></span>
                        <input type="date" id="edit-manufacturing-date" name="manufacturingDate" class="form-control" value="${batch.manufacturing_date}" readonly>
                      </div>
                      <small class="text-muted">Manufacturing date cannot be changed</small>
                    </div>
                    
                    <div class="col-md-6">
                      <label for="edit-expiration-duration" class="form-label fw-bold">Expiration Duration</label>
                      <div class="input-group">
                        <span class="input-group-text"><i class="bi bi-hourglass-split"></i></span>
                        <select id="edit-expiration-duration" name="expirationDuration" class="form-select" required>
                          <option value="" disabled>Select duration</option>
                          <option value="2w">2 Weeks</option>
                          <option value="5m">5 Months</option>
                          <option value="8m">8 Months</option>
                          <option value="1y">1 Year</option>
                          <option value="custom">Custom</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  
                  <div class="row mb-3" id="edit-custom-duration-row" style="display: none;">
                    <div class="col-md-12">
                      <label for="edit-custom-duration-value" class="form-label fw-bold">Custom Duration</label>
                      <div class="input-group">
                        <span class="input-group-text"><i class="bi bi-clock-history"></i></span>
                        <input type="number" id="edit-custom-duration-value" name="customDurationValue" class="form-control" min="1" max="100" placeholder="Enter value">
                        <select class="form-select" id="edit-custom-duration-unit" name="customDurationUnit" style="max-width: 120px;">
                          <option value="days">Days</option>
                          <option value="months">Months</option>
                          <option value="years">Years</option>
                        </select>
                      </div>
                      <div class="form-text">Specify a custom duration for product expiration</div>
                    </div>
                  </div>
                  
                  <div class="row mb-4">
                    <div class="col-md-12">
                      <label for="edit-expiration-date" class="form-label fw-bold">Calculated Expiration Date</label>
                      <div class="input-group">
                        <span class="input-group-text"><i class="bi bi-calendar-x"></i></span>
                        <input type="date" id="edit-expiration-date" name="expirationDate" class="form-control" value="${batch.expiration_date}" readonly>
                      </div>
                      <div class="form-text">Auto-calculated based on duration</div>
                    </div>
                  </div>
                        <input type="date" id="edit-expiration-date" name="expirationDate" class="form-control" value="${batch.expiration_date}" readonly>
                      </div>
                      <div class="form-text">Auto-calculated based on duration</div>
                    </div>
                  </div>
                  
                  <div class="d-flex justify-content-end gap-2 mt-4 pt-3 border-top">
                    <button type="button" class="btn btn-outline-secondary modal-close-btn">
                      <i class="bi bi-x-circle me-1"></i> Cancel
                    </button>
                    <button type="submit" class="btn btn-primary">
                      <i class="bi bi-check-circle me-1"></i> Save Changes
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        `

        const modalContainer = document.getElementById("edit-batch-modal-container")
        modalContainer.innerHTML = modalHtml
        modalContainer.style.display = "block"

        // Try to determine the duration from the expiration date
        const mfgDate = new Date(batch.manufacturing_date)
        const expDate = new Date(batch.expiration_date)
        const diffTime = Math.abs(expDate - mfgDate)
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

        // Set the appropriate duration option
        const durationSelect = document.getElementById("edit-expiration-duration")
        if (durationSelect) {
          if (batch.expiration_duration) {
            // If we have a stored duration, use it
            durationSelect.value = batch.expiration_duration

            // If it's custom, show the custom duration row and set the value
            if (batch.expiration_duration === "custom") {
              const customDurationRow = document.getElementById("edit-custom-duration-row")
              if (customDurationRow) {
                customDurationRow.style.display = "block"

                // Set custom duration value and unit
                const customValueInput = document.getElementById("edit-custom-duration-value")
                const customUnitSelect = document.getElementById("edit-custom-duration-unit")

                if (customValueInput && customUnitSelect) {
                  // If we have stored custom duration data
                  if (batch.custom_duration_value !== null && batch.custom_duration_unit) {
                    customValueInput.value = batch.custom_duration_value
                    customUnitSelect.value = batch.custom_duration_unit
                  } else if (batch.custom_duration_days !== null) {
                    // If only days stored, determine appropriate unit
                    const days = batch.custom_duration_days
                    if (days < 30) {
                      customValueInput.value = days
                      customUnitSelect.value = "days"
                    } else if (days < 365) {
                      customValueInput.value = Math.round(days / 30)
                      customUnitSelect.value = "months"
                    } else {
                      customValueInput.value = Math.round((days / 365) * 10) / 10
                      customUnitSelect.value = "years"
                    }
                  } else {
                    // If no stored value, try to determine from date difference
                    if (diffDays <= 90) {
                      // If less than 3 months, show in days
                      customValueInput.value = diffDays
                      customUnitSelect.value = "days"
                    } else if (diffDays <= 730) {
                      // If less than 2 years, show in months
                      customValueInput.value = Math.round(diffDays / 30)
                      customUnitSelect.value = "months"
                    } else {
                      // Otherwise show in years
                      customValueInput.value = Math.round((diffDays / 365) * 10) / 10
                      customUnitSelect.value = "years"
                    }
                  }
                }
              }
            }
          } else {
            // If no stored duration, try to determine from the date difference
            if (diffDays <= 14) {
              durationSelect.value = "2w"
            } else if (diffDays <= 150) {
              // ~5 months
              durationSelect.value = "5m"
            } else if (diffDays <= 240) {
              // ~8 months
              durationSelect.value = "8m"
            } else if (diffDays <= 365) {
              // ~1 year
              durationSelect.value = "1y"
            } else {
              // If it doesn't match standard durations, set as custom
              durationSelect.value = "custom"
              // Show custom duration row
              const customDurationRow = document.getElementById("edit-custom-duration-row")
              if (customDurationRow) {
                customDurationRow.style.display = "block"

                // Set custom duration value and unit
                const customValueInput = document.getElementById("edit-custom-duration-value")
                const customUnitSelect = document.getElementById("edit-custom-duration-unit")

                if (customValueInput && customUnitSelect) {
                  if (diffDays <= 90) {
                    // If less than 3 months, show in days
                    customValueInput.value = diffDays
                    customUnitSelect.value = "days"
                  } else if (diffDays <= 730) {
                    // If less than 2 years, show in months
                    customValueInput.value = Math.round(diffDays / 30)
                    customUnitSelect.value = "months"
                  } else {
                    // Otherwise show in years
                    customValueInput.value = Math.round((diffDays / 365) * 10) / 10
                    customUnitSelect.value = "years"
                  }
                }
              }
            }
          }
        }

        // Add event listeners for form interactions
        setupEditBatchFormListeners()

        // Add event listener for form submission
        const editForm = document.getElementById("edit-batch-form")
        if (editForm) {
          editForm.addEventListener("submit", function (e) {
            e.preventDefault()
            updateBatch(this)
          })
        }

        // Add event listener for close buttons
        document.querySelectorAll(".modal-close-btn").forEach((btn) => {
          btn.addEventListener("click", () => {
            const editModalContainer = document.getElementById("edit-batch-modal-container")
            if (editModalContainer) {
              editModalContainer.style.display = "none"
              editModalContainer.innerHTML = ""
            }
          })
        })

        // Add event listener for clicking outside the modal
        document.querySelector(".batch-edit-overlay").addEventListener("click", function (e) {
          if (e.target === this) {
            const editModalContainer = document.getElementById("edit-batch-modal-container")
            if (editModalContainer) {
              editModalContainer.style.display = "none"
              editModalContainer.innerHTML = ""
            }
          }
        })
      } else {
        showResponseMessage("danger", data.error || "Failed to fetch batch details")
      }
    })
    .catch((error) => {
      console.error("Error fetching batch details:", error)
      showResponseMessage("danger", "Error fetching batch details. Please try again.")
    })
}

// Function to set up event listeners for the edit batch form
function setupEditBatchFormListeners() {
  const expirationDurationInput = document.getElementById("edit-expiration-duration")
  const customDurationRow = document.getElementById("edit-custom-duration-row")
  const manufacturingDateInput = document.getElementById("edit-manufacturing-date")
  const customDurationValueInput = document.getElementById("edit-custom-duration-value")
  const customDurationUnitSelect = document.getElementById("edit-custom-duration-unit")
  const expirationDateInput = document.getElementById("edit-expiration-date")

  if (expirationDurationInput && customDurationRow) {
    // Toggle custom duration input visibility
    expirationDurationInput.addEventListener("change", function () {
      customDurationRow.style.display = this.value === "custom" ? "block" : "none"

      // Update expiration date when duration changes
      if (manufacturingDateInput && manufacturingDateInput.value) {
        const customValue = this.value === "custom" && customDurationValueInput ? customDurationValueInput.value : null
        const customUnit = this.value === "custom" && customDurationUnitSelect ? customDurationUnitSelect.value : "days"
        expirationDateInput.value = calculateExpirationDate(
          manufacturingDateInput.value,
          this.value,
          customValue,
          customUnit,
        )
      }
    })
  }

  if (
    customDurationValueInput &&
    customDurationUnitSelect &&
    manufacturingDateInput &&
    expirationDurationInput &&
    expirationDateInput
  ) {
    // Update expiration date when custom duration value changes
    customDurationValueInput.addEventListener("input", function () {
      if (manufacturingDateInput.value && expirationDurationInput.value === "custom") {
        expirationDateInput.value = calculateExpirationDate(
          manufacturingDateInput.value,
          "custom",
          this.value,
          customDurationUnitSelect.value,
        )
      }
    })

    // Update expiration date when custom duration unit changes
    customDurationUnitSelect.addEventListener("change", function () {
      if (manufacturingDateInput.value && expirationDurationInput.value === "custom") {
        expirationDateInput.value = calculateExpirationDate(
          manufacturingDateInput.value,
          "custom",
          customDurationValueInput.value,
          this.value,
        )
      }
    })
  }
}

// Function to update batch with proper date formatting and expiration duration including custom duration
function updateBatch(form) {
  const formData = new FormData(form)

  // CRITICAL FIX: Ensure dates are properly formatted
  const manufacturingDate = document.getElementById("edit-manufacturing-date").value
  const expirationDuration = document.getElementById("edit-expiration-duration").value

  // Format manufacturing date - CRITICAL FIX
  formData.set("manufacturingDate", formatDateForServer(manufacturingDate))

  // Handle custom duration
  let customDurationDays = null
  if (expirationDuration === "custom") {
    customDurationDays = document.getElementById("edit-custom-duration-days").value
    if (!customDurationDays || isNaN(customDurationDays) || customDurationDays < 1) {
      alert("Please enter a valid number of days for custom duration")
      return
    }
    formData.set("customDurationDays", customDurationDays)
  }

  // Calculate and format expiration date based on duration
  const calculatedExpirationDate = calculateExpirationDate(manufacturingDate, expirationDuration, customDurationDays)
  formData.set("expirationDate", formatDateForServer(calculatedExpirationDate))

  // Store the duration for reference
  formData.set("expirationDuration", expirationDuration)

  // Log the data being sent for debugging
  console.log("Updating batch with data:", {
    manufacturingDate: formData.get("manufacturingDate"),
    expirationDuration: formData.get("expirationDuration"),
    customDurationDays: formData.get("customDurationDays"),
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
        showResponseMessage("success", data.message || "Batch updated successfully!")

        // Close only the edit modal, not the batch management modal
        const editModalContainer = document.getElementById("edit-batch-modal-container")
        if (editModalContainer) {
          editModalContainer.style.display = "none"
          editModalContainer.innerHTML = ""
        }

        // Refresh batch table
        const productId = formData.get("productId")
        fetchProductBatches(productId)

        // Refresh inventory table if needed
        if (typeof fetchInventoryData === "function") {
          fetchInventoryData(currentPage, currentFilter, currentSort, currentSearch)
        }
        // Similarly, modify the updateBatch function to call our new function:
        // Inside the .then((data) => { if (data.success) { ... } block:
        // Add this line after refreshing the batch table:
        updateProductStatusFromBatches(formData.get("productId"))
      } else {
        throw new Error(data.error || "Failed to update batch")
      }
    })
    .catch((error) => {
      console.error("Error updating batch:", error)
      showResponseMessage("danger", "Error updating batch. Please try again.")
    })
}

// Delete batch
function deleteBatch(batchId, productId) {
  // Set the batch ID and product ID in the hidden form fields
  document.getElementById("delete-batch-id").value = batchId
  document.getElementById("delete-product-id-batch").value = productId

  // Show the delete confirmation modal
  const bootstrap = window.bootstrap
  const deleteBatchConfirmModal = new bootstrap.Modal(document.getElementById("deleteBatchConfirmModal"))
  deleteBatchConfirmModal.show()
}

// Set up batch form buttons
function setupBatchFormButtons() {
  // Add batch button
  const addBatchModalBtn = document.getElementById("add-batch-modal-btn")
  if (addBatchModalBtn) {
    addBatchModalBtn.addEventListener("click", () => {
      showBatchForm()
    })
  }

  // Cancel batch button
  const cancelBatchBtn = document.getElementById("cancel-batch-btn")
  if (cancelBatchBtn) {
    cancelBatchBtn.addEventListener("click", () => {
      document.getElementById("batch-modal-form").style.display = "none"
    })
  }

  // Save batch button
  const saveBatchBtn = document.getElementById("save-batch-btn")
  if (saveBatchBtn) {
    saveBatchBtn.addEventListener("click", (e) => {
      e.preventDefault()
      saveBatch()
    })
  }

  // Set up manufacturing date change event for edit batch form
  const editManufacturingDate = document.getElementById("edit-manufacturing-date")
  if (editManufacturingDate) {
    editManufacturingDate.addEventListener("change", function () {
      // Update expiration date when manufacturing date changes
      const expirationDate = document.getElementById("edit-expiration-date")
      if (expirationDate && this.value) {
        expirationDate.value = generateExpirationDate(this.value)
      }
    })
  }

  // Set up update batch button
  const updateBatchBtn = document.getElementById("update-batch-btn")
  if (updateBatchBtn) {
    updateBatchBtn.addEventListener("click", () => {
      updateBatch()
    })
  }
}

// Show batch form with proper date formatting
function showBatchForm(batch = null) {
  const batchModalForm = document.getElementById("batch-modal-form")
  if (!batchModalForm) return

  // Show the form
  batchModalForm.style.display = "block"

  // If batch is provided, populate form for editing
  if (batch) {
    document.getElementById("batch-code-input").value = batch.batch_code
    document.getElementById("batch-quantity-input").value = batch.quantity

    // Format dates properly for input fields
    document.getElementById("batch-manufacturing-date").value = formatDateForInput(batch.manufacturing_date)
    document.getElementById("batch-expiration-date").value = formatDateForInput(batch.expiration_date)
  } else {
    // Reset form for new batch
    document.getElementById("add-batch-form").reset()

    // Set today's date as manufacturing date
    const today = new Date().toISOString().split("T")[0]
    document.getElementById("batch-manufacturing-date").value = today

    // Auto-generate batch code
    document.getElementById("batch-code-input").value = generateBatchCode()

    // Auto-generate expiration date (2 months from today)
    document.getElementById("batch-expiration-date").value = generateExpirationDate(today)
  }

  // Scroll to form
  batchModalForm.scrollIntoView({ behavior: "smooth" })
}

// Save batch with proper date formatting and expiration duration including custom duration
function saveBatch() {
  const form = document.getElementById("add-batch-form")
  if (!form) return

  // Validate form
  if (!form.checkValidity()) {
    form.reportValidity()
    return
  }

  // Get form data
  const formData = new FormData(form)

  // CRITICAL FIX: Ensure dates are properly formatted
  const manufacturingDate = document.getElementById("batch-manufacturing-date").value
  const expirationDuration = document.getElementById("batch-expiration-duration").value

  // Format manufacturing date - CRITICAL FIX
  if (manufacturingDate) {
    formData.set("manufacturingDate", formatDateForServer(manufacturingDate))
  }

  // Handle custom duration
  let customDurationDays = null
  if (expirationDuration === "custom") {
    customDurationDays = document.getElementById("batch-custom-duration-days").value
    if (!customDurationDays || isNaN(customDurationDays) || customDurationDays < 1) {
      alert("Please enter a valid number of days for custom duration")
      return
    }
    formData.set("customDurationDays", customDurationDays)
  }

  // Calculate and format expiration date based on duration
  const calculatedExpirationDate = calculateExpirationDate(manufacturingDate, expirationDuration, customDurationDays)
  formData.set("expirationDate", formatDateForServer(calculatedExpirationDate))

  // Store the duration for reference
  formData.set("expirationDuration", expirationDuration)

  // Log the data being sent for debugging
  console.log("Sending batch data:", {
    manufacturingDate: formData.get("manufacturingDate"),
    expirationDuration: formData.get("expirationDuration"),
    customDurationDays: formData.get("customDurationDays"),
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
          fetchInventoryData(currentPage, currentFilter, currentSort, currentSearch)
        }

        // Update product status based on the new batch quantities
        updateProductStatusFromBatches(productId)
      } else {
        throw new Error(data.error || "Failed to save batch")
      }
    })
    .catch((error) => {
      console.error("Error saving batch:", error)
      showResponseMessage("danger", "Error saving batch. Please try again.")
    })
}

// Show response message
function showResponseMessage(type, message) {
  const responseMessage = document.getElementById("response-message")
  if (!responseMessage) return

  // Set message content and type
  responseMessage.className = `alert alert-${type} alert-dismissible fade show`
  responseMessage.innerHTML = `
    ${message}
    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
  `

  // Show the message
  responseMessage.style.display = "block"

  // Auto-dismiss after 5 seconds
  setTimeout(() => {
    if (responseMessage.parentNode) {
      try {
        const bootstrap = window.bootstrap
        const bsAlert = new bootstrap.Alert(responseMessage)
        bsAlert.close()
      } catch (error) {
        console.error("Bootstrap Alert error:", error)
        // Fallback to removing the element if Bootstrap Alert fails
        responseMessage.style.display = "none"
      }
    }
  }, 5000)
}

// Initialize the inventory page
function initInventoryPage() {
  // Initialize Bootstrap components
  initBootstrapComponents()

  // Set up filter dropdown
  setupFilterDropdown()

  // Set up sort dropdown
  setupSortDropdown()

  // Set up search functionality
  setupSearch()

  // Fetch products from the database with initial settings
  fetchInventoryData(1, currentFilter, currentSort, currentSearch)
}

// Set up filter dropdown
function setupFilterDropdown() {
  const filterItems = document.querySelectorAll(".filter-item")
  const filterButton = document.getElementById("filterDropdown")

  filterItems.forEach((item) => {
    item.addEventListener("click", function (e) {
      e.preventDefault()

      // Update filter value
      currentFilter = this.getAttribute("data-filter")

      // Update button text
      if (filterButton) {
        filterButton.innerHTML = `<i class="bi bi-funnel me-1"></i> ${this.textContent}`
      }

      // Reset to page 1 when filter changes
      currentPage = 1

      // Fetch data with new filter
      fetchInventoryData(currentPage, currentFilter, currentSort, currentSearch)
    })
  })
}

// Set up sort dropdown
function setupSortDropdown() {
  const sortItems = document.querySelectorAll(".sort-item")
  const sortButton = document.getElementById("sortDropdown")

  sortItems.forEach((item) => {
    item.addEventListener("click", function (e) {
      e.preventDefault()

      // Update sort value
      currentSort = this.getAttribute("data-sort")

      // Update button text
      if (sortButton) {
        sortButton.innerHTML = `<i class="bi bi-sort-alpha-down me-1"></i> ${this.textContent}`
      }

      currentSort = this.getAttribute("data-sort")

      // Update button text
      if (sortButton) {
        sortButton.innerHTML = `<i class="bi bi-sort-alpha-down me-1"></i> ${this.textContent}`
      }

      // Fetch data with new sort
      fetchInventoryData(currentPage, currentFilter, currentSort, currentSearch)
    })
  })
}

// Set up search functionality
function setupSearch() {
  const searchInput = document.getElementById("inventory-search")

  if (searchInput) {
    // Add debounce to prevent too many requests
    let searchTimeout

    searchInput.addEventListener("input", function () {
      clearTimeout(searchTimeout)

      searchTimeout = setTimeout(() => {
        currentSearch = this.value.trim()

        // Reset to page 1 when search changes
        currentPage = 1

        // Fetch data with new search
        fetchInventoryData(currentPage, currentFilter, currentSort, currentSearch)
      }, 300) // 300ms debounce
    })

    // Add event listener for Enter key
    searchInput.addEventListener("keypress", function (e) {
      if (e.key === "Enter") {
        e.preventDefault()
        clearTimeout(searchTimeout)

        currentSearch = this.value.trim()
        currentPage = 1
        fetchInventoryData(currentPage, currentFilter, currentSort, currentSearch)
      }
    })
  }
}

// Initialize Bootstrap components
function initBootstrapComponents() {
  // Check if Bootstrap is loaded
  if (typeof bootstrap === "undefined") {
    console.error("Bootstrap is not loaded. Some features may not work properly.")
    return
  }

  // Initialize tooltips
  const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
  tooltipTriggerList.map((tooltipTriggerEl) => new bootstrap.Tooltip(tooltipTriggerEl))

  // Initialize popovers
  const popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'))
  popoverTriggerList.map((popoverTriggerEl) => new bootstrap.Popover(popoverTriggerEl))
}

// Call these functions in the DOMContentLoaded event
document.addEventListener("DOMContentLoaded", () => {
  // Initialize the inventory page
  initInventoryPage()

  // Set up the add product form
  setupAddProductForm()

  // Set up normal track edit form
  setupNormalTrackEditForm()

  // Set up batch track edit form
  setupBatchTrackEditForm()

  // Set up delete product form
  setupDeleteProductForm()

  // Set up batch form buttons
  setupBatchFormButtons()

  // Set up manufacturing date change event for batch management
  const batchManufacturingDate = document.getElementById("batch-manufacturing-date")
  if (batchManufacturingDate) {
    batchManufacturingDate.addEventListener("change", function () {
      // Update expiration date when manufacturing date changes
      const expirationDate = document.getElementById("batch-expiration-date")
      if (expirationDate && this.value) {
        expirationDate.value = generateExpirationDate(this.value)
      }
    })
  }

  // Set up the confirm delete batch button
  document.addEventListener("DOMContentLoaded", () => {
    const confirmDeleteBatchBtn = document.getElementById("confirm-delete-batch-btn")
    if (confirmDeleteBatchBtn) {
      confirmDeleteBatchBtn.addEventListener("click", () => {
        // Get the batch ID and product ID from the hidden form fields
        const batchId = document.getElementById("delete-batch-id").value
        const productId = document.getElementById("delete-product-id-batch").value

        // Hide the modal
        const bootstrap = window.bootstrap
        const deleteBatchConfirmModal = bootstrap.Modal.getInstance(document.getElementById("deleteBatchConfirmModal"))
        if (deleteBatchConfirmModal) {
          deleteBatchConfirmModal.hide()
        }

        // Send delete request
        const formData = new FormData()
        formData.append("batch_id", batchId)
        formData.append("product_id", productId)

        fetch("delete_batch.php", {
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
              showResponseMessage("success", data.message || "Batch deleted successfully!")

              // Refresh batch table
              fetchProductBatches(productId)

              // Refresh inventory table
              fetchInventoryData(currentPage, currentFilter, currentSort, currentSearch)
              // And finally, modify the deleteBatch function (or the confirm delete batch button handler):
              // After the success message and refreshing tables, add:
              updateProductStatusFromBatches(productId)
            } else {
              throw new Error(data.error || "Failed to delete batch")
            }
          })
          .catch((error) => {
            console.error("Error deleting batch:", error)
            showResponseMessage("danger", "Error deleting batch. Please try again.")
          })
      })
    }
  })

  // Set up form validations
  setupNormalTrackFormValidation()
  setupBatchTrackFormValidation()
  setupEditFormsValidation()
  setupCustomDurationFunctionality()
})

// Function to set up custom duration functionality
function setupCustomDurationFunctionality() {
  // Setup event listeners for the batch track modal
  const expirationDuration = document.getElementById("expirationDuration")
  const customDurationRow = document.getElementById("customDurationRow")
  const manufacturingDate = document.getElementById("manufacturingDate")
  const customDurationValue = document.getElementById("customDurationValue")
  const customDurationUnit = document.getElementById("customDurationUnit")
  const expirationDate = document.getElementById("expirationDate")

  if (expirationDuration && customDurationRow) {
    // Toggle custom duration input visibility
    expirationDuration.addEventListener("change", function () {
      customDurationRow.style.display = this.value === "custom" ? "block" : "none"

      // Update expiration date when duration changes
      if (manufacturingDate && manufacturingDate.value) {
        const value = this.value === "custom" && customDurationValue ? customDurationValue.value : null
        const unit = this.value === "custom" && customDurationUnit ? customDurationUnit.value : "days"
        expirationDate.value = calculateExpirationDate(manufacturingDate.value, this.value, value, unit)
      }
    })
  }

  if (customDurationValue && customDurationUnit && manufacturingDate && expirationDuration && expirationDate) {
    // Update expiration date when custom duration value changes
    customDurationValue.addEventListener("input", function () {
      if (manufacturingDate.value && expirationDuration.value === "custom") {
        expirationDate.value = calculateExpirationDate(
          manufacturingDate.value,
          "custom",
          this.value,
          customDurationUnit.value,
        )
      }
    })

    // Update expiration date when custom duration unit changes
    customDurationUnit.addEventListener("change", function () {
      if (manufacturingDate.value && expirationDuration.value === "custom") {
        expirationDate.value = calculateExpirationDate(
          manufacturingDate.value,
          "custom",
          customDurationValue.value,
          this.value,
        )
      }
    })
  }

  // Setup event listeners for the batch management modal
  const batchExpirationDuration = document.getElementById("batch-expiration-duration")
  const batchCustomDurationRow = document.getElementById("batch-custom-duration-row")
  const batchManufacturingDate = document.getElementById("batch-manufacturing-date")
  const batchCustomDurationValue = document.getElementById("batch-custom-duration-value")
  const batchCustomDurationUnit = document.getElementById("batch-custom-duration-unit")
  const batchExpirationDate = document.getElementById("batch-expiration-date")

  if (batchExpirationDuration && batchCustomDurationRow) {
    // Toggle custom duration input visibility
    batchExpirationDuration.addEventListener("change", function () {
      batchCustomDurationRow.style.display = this.value === "custom" ? "block" : "none"

      // Update expiration date when duration changes
      if (batchManufacturingDate && batchManufacturingDate.value) {
        const value = this.value === "custom" && batchCustomDurationValue ? batchCustomDurationValue.value : null
        const unit = this.value === "custom" && batchCustomDurationUnit ? batchCustomDurationUnit.value : "days"
        batchExpirationDate.value = calculateExpirationDate(batchManufacturingDate.value, this.value, value, unit)
      }
    })
  }

  if (
    batchCustomDurationValue &&
    batchCustomDurationUnit &&
    batchManufacturingDate &&
    batchExpirationDuration &&
    batchExpirationDate
  ) {
    // Update expiration date when custom duration value changes
    batchCustomDurationValue.addEventListener("input", function () {
      if (batchManufacturingDate.value && batchExpirationDuration.value === "custom") {
        batchExpirationDate.value = calculateExpirationDate(
          batchManufacturingDate.value,
          "custom",
          this.value,
          batchCustomDurationUnit.value,
        )
      }
    })

    // Update expiration date when custom duration unit changes
    batchCustomDurationUnit.addEventListener("change", function () {
      if (batchManufacturingDate.value && batchExpirationDuration.value === "custom") {
        batchExpirationDate.value = calculateExpirationDate(
          batchManufacturingDate.value,
          "custom",
          batchCustomDurationValue.value,
          this.value,
        )
      }
    })
  }
}

// Updated logic for Edit Batch Modal
document.addEventListener("DOMContentLoaded", () => {
  const editBatchModal = new bootstrap.Modal(document.getElementById("editBatchModal"))

  document.querySelectorAll(".edit-batch-btn").forEach((button) => {
    button.addEventListener("click", () => {
      const batchId = button.getAttribute("data-batch-id")
      const productId = button.getAttribute("data-product-id")

      fetch(`get_batch.php?batch_id=${batchId}`)
        .then((response) => response.json())
        .then((data) => {
          if (data.success) {
            const batch = data.batch
            document.getElementById("edit-batch-id").value = batch.batch_id
            document.getElementById("edit-product-id").value = batch.product_id
            document.getElementById("edit-batch-code").value = batch.batch_code
            document.getElementById("edit-batch-quantity").value = batch.quantity
            document.getElementById("edit-manufacturing-date").value = batch.manufacturing_date
            document.getElementById("edit-expiration-date").value = batch.expiration_date

            editBatchModal.show()
          } else {
            alert("Failed to fetch batch details.")
          }
        })
        .catch((error) => console.error("Error fetching batch details:", error))
    })
  })

  document.getElementById("edit-batch-form").addEventListener("submit", (e) => {
    e.preventDefault()

    const formData = new FormData(e.target)

    fetch("save_batch.php", {
      method: "POST",
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          alert("Batch updated successfully.")
          editBatchModal.hide()
          location.reload()
        } else {
          alert("Failed to update batch.")
        }
      })
      .catch((error) => console.error("Error updating batch:", error))
  })
})

// Function to update product status based on total batch quantities
function updateProductStatusFromBatches(productId) {
  // Fetch all batches for this product
  fetch(`fetch_product_batches.php?product_id=${productId}`)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok")
      }
      return response.json()
    })
    .then((data) => {
      if (data.success) {
        const batches = data.batches

        // Calculate total quantity across all batches
        let totalQuantity = 0
        batches.forEach((batch) => {
          totalQuantity += Number.parseInt(batch.quantity, 10)
        })

        // Determine new status based on total quantity
        let newStatus = "Out of Stock"
        if (totalQuantity > 10) {
          newStatus = "In Stock"
        } else if (totalQuantity > 0) {
          newStatus = "Low Stock"
        }

        // Update the product status in the database
        const formData = new FormData()
        formData.append("productId", productId)
        formData.append("totalStock", totalQuantity)
        formData.append("newStatus", newStatus)

        fetch("update_product_status.php", {
          method: "POST",
          body: formData,
        })
          .then((response) => response.json())
          .then((data) => {
            if (data.success) {
              console.log("Product status updated successfully")
              // Refresh inventory table to show updated status
              if (typeof fetchInventoryData === "function") {
                fetchInventoryData(currentPage, currentFilter, currentSort, currentSearch)
              }
            }
          })
          .catch((error) => {
            console.error("Error updating product status:", error)
          })
      }
    })
    .catch((error) => {
      console.error("Error fetching batches for status update:", error)
    })
}

// Function to calculate expiration date based on manufacturing date and duration
function calculateExpirationDate(manufacturingDate, duration, customValue = null, customUnit = "days") {
  const mfgDate = new Date(manufacturingDate)
  const expDate = new Date(mfgDate)

  switch (duration) {
    case "2w":
      expDate.setDate(mfgDate.getDate() + 14)
      break
    case "5m":
      expDate.setMonth(mfgDate.getMonth() + 5)
      break
    case "8m":
      expDate.setMonth(mfgDate.getMonth() + 8)
      break
    case "1y":
      expDate.setFullYear(mfgDate.getFullYear() + 1)
      break
    case "custom":
      let daysToAdd = 0
      if (customValue !== null) {
        switch (customUnit) {
          case "days":
            daysToAdd = Number.parseInt(customValue, 10)
            break
          case "months":
            daysToAdd = Number.parseInt(customValue, 10) * 30
            break
          case "years":
            daysToAdd = Number.parseInt(customValue, 10) * 365
            break
          default:
            daysToAdd = 0
        }
      }
      expDate.setDate(mfgDate.getDate() + daysToAdd)
      break
    default:
      expDate.setMonth(mfgDate.getMonth() + 2) // Default to 2 months
  }

  // Format as YYYY-MM-DD
  const year = expDate.getFullYear()
  const month = String(expDate.getMonth() + 1).padStart(2, "0")
  const day = String(expDate.getDate()).padStart(2, "0")

  return `${year}-${month}-${day}`
}

// Add delete batch modal HTML structure
const deleteBatchModalHtml = `
  <div class="modal fade" id="deleteBatchModal" tabindex="-1" aria-labelledby="deleteBatchModalLabel" aria-hidden="true">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="deleteBatchModalLabel">Confirm Delete</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          Are you sure you want to delete this batch?
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
          <button type="button" class="btn btn-danger" id="confirmDeleteBatchBtn">Delete</button>
        </div>
      </div>
    </div>
  </div>
`

document.body.insertAdjacentHTML("beforeend", deleteBatchModalHtml)

// Add event listener for delete batch buttons
document.querySelectorAll(".delete-batch-btn").forEach((button) => {
  button.addEventListener("click", function () {
    const batchId = this.getAttribute("data-batch-id")
    const productId = this.getAttribute("data-product-id")

    // Store batch and product IDs in the modal for later use
    const confirmDeleteBtn = document.getElementById("confirmDeleteBatchBtn")
    confirmDeleteBtn.setAttribute("data-batch-id", batchId)
    confirmDeleteBtn.setAttribute("data-product-id", productId)

    // Show the delete confirmation modal
    const bootstrap = window.bootstrap
    const deleteBatchModal = new bootstrap.Modal(document.getElementById("deleteBatchModal"))
    deleteBatchModal.show()
  })
})

// Add event listener for confirm delete button
document.getElementById("confirmDeleteBatchBtn").addEventListener("click", function () {
  const batchId = this.getAttribute("data-batch-id")
  const productId = this.getAttribute("data-product-id")

  // Send delete request
  fetch("delete_batch.php", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ batch_id: batchId, product_id: productId }),
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
        showResponseMessage("success", data.message || "Batch deleted successfully!")

        // Refresh batch table
        fetchProductBatches(productId)

        // Refresh inventory table
        if (typeof fetchInventoryData === "function") {
          fetchInventoryData(currentPage, currentFilter, currentSort, currentSearch)
        }
      } else {
        throw new Error(data.error || "Failed to delete batch")
      }
    })
    .catch((error) => {
      console.error("Error deleting batch:", error)
      showResponseMessage("danger", "Error deleting batch. Please try again.")
    })

  // Hide the modal
  const bootstrap = window.bootstrap
  const deleteBatchModal = bootstrap.Modal.getInstance(document.getElementById("deleteBatchModal"))
  if (deleteBatchModal) {
    deleteBatchModal.hide()
  }
})

// Modify the renderOrders function to conditionally hide the Pay Now button based on payment_status
function renderOrders(orders) {
  orders.sort((a, b) => new Date(b.order_date) - new Date(a.order_date))

  let html = ""

  // Loop through orders and create cards
  orders.forEach((order) => {
    const actionButtons = "" // Generate action buttons dynamically

    // Modify the card footer section to conditionally hide the Pay Now button
    html += `
      <div class="card-footer">
        <div class="action-buttons d-flex gap-2">
          ${actionButtons}
        </div>
        ${
          order.status === "completed" && order.payment_status !== "partial" && order.payment_status !== "paid"
            ? `<button class="btn btn-sm btn-success mt-2 w-100 pay-now-btn" data-id="${order.order_id}">
                <i class="bi bi-credit-card me-1"></i> Pay Now
              </button>`
            : ""
        }
      </div>
    `
  })

  // Add the HTML to the container
  ordersContainer.innerHTML = html

  // Set up event listeners for the action buttons
  setupActionButtons()
}

// First, add the HTML for the loading and success modals at the end of the document body
// Add this right after the editBatchModal div in the HTML file

// Add the loading modal HTML
document.body.insertAdjacentHTML(
  "beforeend",
  `
  <div class="modal fade" id="loadingModal" tabindex="-1" aria-labelledby="loadingModalLabel" aria-hidden="true" data-bs-backdrop="static" data-bs-keyboard="false">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-body text-center p-4">
          <div class="spinner-border text-primary mb-3" style="width: 3rem; height: 3rem;" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
          <h5 class="modal-title" id="loadingModalLabel">Processing...</h5>
          <p class="text-muted">Please wait while we save your product.</p>
        </div>
      </div>
    </div>
  </div>
`,
)

// Add the success modal HTML
document.body.insertAdjacentHTML(
  "beforeend",
  `
  <div class="modal fade" id="successModal" tabindex="-1" aria-labelledby="successModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-body text-center p-4">
          <div class="success-icon mb-3">
            <i class="bi bi-check-circle-fill text-success" style="font-size: 3rem;"></i>
          </div>
          <h5 class="modal-title" id="successModalLabel">Success!</h5>
          <p id="success-message">Product has been added successfully.</p>
        </div>
      </div>
    </div>
  </div>
`,
)

// Now modify the normal track form submission to show the loading and success modals
// Find the normal track form submission event listener and modify it
const originalNormalTrackFormSubmit = setupAddProductForm
setupAddProductForm = () => {
  originalNormalTrackFormSubmit()

  // Override normal track form submission
  const normalTrackForm = document.getElementById("normal-track-form")
  if (normalTrackForm) {
    normalTrackForm.removeEventListener("submit", normalTrackForm.onsubmit)
    normalTrackForm.addEventListener("submit", function (e) {
      e.preventDefault()

      // Show loading modal
      const loadingModal = new bootstrap.Modal(document.getElementById("loadingModal"))
      loadingModal.show()

      // Submit the form
      this.submit()

      // Listen for iframe load event to know when the form submission is complete
      const formTarget = document.getElementById("form-target")
      formTarget.addEventListener("load", function () {
        // Hide loading modal after 2 seconds
        setTimeout(() => {
          loadingModal.hide()

          // Process the response
          if (this.contentDocument && this.contentDocument.body && this.contentDocument.body.textContent) {
            try {
              const response = JSON.parse(this.contentDocument.body.textContent)
              if (response.success) {
                // Reset form
                normalTrackForm.reset()

                // Get the bootstrap modal instance
                const bootstrap = window.bootstrap
                const modal = bootstrap.Modal.getInstance(document.getElementById("normalTrackModal"))

                // Hide the form modal
                if (modal) {
                  modal.hide()
                }

                // Update success message
                document.getElementById("success-message").textContent =
                  response.message || "Normal track product added successfully!"

                // Show success modal
                const successModal = new bootstrap.Modal(document.getElementById("successModal"))
                successModal.show()

                // Hide success modal after 2 seconds
                setTimeout(() => {
                  successModal.hide()

                  // Refresh inventory data - go to first page to see new product
                  fetchInventoryData(1, currentFilter, currentSort, currentSearch)

                  // Update product status if needed
                  if (response.productId) {
                    updateProductStatusFromBatches(response.productId)
                  }
                }, 2000)
              } else {
                // Hide loading modal immediately
                loadingModal.hide()

                // Show error message
                showResponseMessage("danger", response.error || "Failed to add product")
              }
            } catch (error) {
              // Hide loading modal immediately
              loadingModal.hide()

              console.error("Error parsing response:", error)
              showResponseMessage("danger", "Error processing server response")
            }
          }
        }, 2000)
      })
    })
  }

  // Override batch track form submission
  const batchTrackForm = document.getElementById("batch-track-form")
  if (batchTrackForm) {
    batchTrackForm.removeEventListener("submit", batchTrackForm.onsubmit)
    batchTrackForm.addEventListener("submit", function (e) {
      e.preventDefault()

      // Show loading modal
      const loadingModal = new bootstrap.Modal(document.getElementById("loadingModal"))
      loadingModal.show()

      // Submit the form
      this.submit()

      // Listen for iframe load event to know when the form submission is complete
      const formTarget = document.getElementById("form-target")
      formTarget.addEventListener("load", function () {
        // Hide loading modal after 2 seconds
        setTimeout(() => {
          loadingModal.hide()

          // Process the response
          if (this.contentDocument && this.contentDocument.body && this.contentDocument.body.textContent) {
            try {
              const response = JSON.parse(this.contentDocument.body.textContent)
              if (response.success) {
                // Reset form
                batchTrackForm.reset()

                // Get the bootstrap modal instance
                const bootstrap = window.bootstrap
                const modal = bootstrap.Modal.getInstance(document.getElementById("batchTrackModal"))

                // Hide the form modal
                if (modal) {
                  modal.hide()
                }

                // Update success message
                document.getElementById("success-message").textContent =
                  response.message || "Batch track product added successfully!"

                // Show success modal
                const successModal = new bootstrap.Modal(document.getElementById("successModal"))
                successModal.show()

                // Hide success modal after 2 seconds
                setTimeout(() => {
                  successModal.hide()

                  // Refresh inventory data - go to first page to see new product
                  fetchInventoryData(1, currentFilter, currentSort, currentSearch)

                  // Update product status if needed
                  if (response.productId) {
                    updateProductStatusFromBatches(response.productId)
                  }
                }, 2000)
              } else {
                // Hide loading modal immediately
                loadingModal.hide()

                // Show error message
                showResponseMessage("danger", response.error || "Failed to add product")
              }
            } catch (error) {
              // Hide loading modal immediately
              loadingModal.hide()

              console.error("Error parsing response:", error)
              showResponseMessage("danger", "Error processing server response")
            }
          }
        }, 2000)
      })
    })
  }
}

// Also modify the handleFormSubmissionResponse function to prevent it from executing
// since we're now handling the response in our custom event listeners
const originalHandleFormSubmissionResponse = handleFormSubmissionResponse
handleFormSubmissionResponse = (iframe, form) => {
  // Do nothing - we're handling the response in our custom event listeners
  // This prevents the original function from executing
}

// Declare bootstrap variable
const bootstrap = window.bootstrap

// Declare ordersContainer variable
const ordersContainer = document.getElementById("orders-container")