// Global variables
let allOrders = []
let allProducts = []
let currentTab = "all"
let currentDateRange = "all"
let currentSearch = ""
let currentPage = 1
let selectedOrderId = null
const orderItems = []
const editOrderItems = []
let originalOrderStatus = ""
const selectedProduct = null
const editSelectedProduct = null
let currentUser = null

// Add a variable to track if the current order is in pickup mode
let currentOrderIsPickup = false

// At the top of the file, add a new variable to track tab counts
const tabCounts = {
  all: 0,
  delivered: 0,
  cancelled: 0,
  return_requested: 0,
}

// Add event listeners for the new tabs
document.querySelectorAll(".order-tab").forEach((tab) => {
  tab.addEventListener("click", function (e) {
    e.preventDefault()

    // Update active tab UI
    document.querySelectorAll(".order-tab").forEach((t) => {
      t.classList.remove("active")
    })
    this.classList.add("active")

    // Set current tab and fetch orders
    currentTab = this.getAttribute("data-status")
    currentPage = 1

    // Check if this is the return_requested tab
    if (currentTab === "return_requested") {
      fetchReturnRequestedOrders()
    } else {
      fetchOrders()
    }
  })
})

// Initialize the orders page
document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM loaded, initializing orders page")

  // Fetch current user data
  fetchCurrentUser()

  // Initialize date pickers
  initDatePickers()

  // Set up event listeners
  setupEventListeners()

  // Fetch products for the product selection
  fetchProducts()

  // Add a small delay to ensure all DOM elements are properly initialized
  setTimeout(() => {
    // Fetch orders with initial settings
    console.log("Fetching initial orders")
    fetchOrders()
    initializeTabBadges()
  }, 100)
})

// Fetch current user data
function fetchCurrentUser() {
  fetch("get_current_user.php")
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok")
      }
      return response.json()
    })
    .then((data) => {
      if (data.success) {
        currentUser = data.user
        console.log("Current user data loaded:", currentUser)
      } else {
        console.error("Failed to load user data:", data.message)
      }
    })
    .catch((error) => {
      console.error("Error fetching current user:", error)
    })
}

// Find the initDatePickers function and replace it with this updated version
function initDatePickers() {
  // Get today's date
  const today = new Date()
  const todayFormatted = today.toISOString().split("T")[0] // Format as YYYY-MM-DD

  // Set today's date as default for order date and set min attribute to today
  const orderDateInput = document.getElementById("order-date")
  if (orderDateInput) {
    orderDateInput.valueAsDate = today
    orderDateInput.setAttribute("min", todayFormatted) // Disable past dates
  }

  // Set date 3 days from today as default for expected delivery and set min attribute to today
  const expectedDeliveryInput = document.getElementById("expected-delivery")
  if (expectedDeliveryInput) {
    const deliveryDate = new Date()
    deliveryDate.setDate(deliveryDate.getDate() + 3)
    expectedDeliveryInput.valueAsDate = deliveryDate
    expectedDeliveryInput.setAttribute("min", todayFormatted) // Disable past dates
  }

  // Set min attribute for pickup date as well
  const pickupDateInput = document.getElementById("pickup-date")
  if (pickupDateInput) {
    pickupDateInput.setAttribute("min", todayFormatted) // Disable past dates
  }

  // Initialize flatpickr for date inputs if needed
  if (typeof flatpickr !== "undefined") {
    flatpickr(".datepicker", {
      dateFormat: "Y-m-d",
      allowInput: true,
      minDate: "today", // Disable past dates in flatpickr
    })
  }
}

// Set up event listeners
function setupEventListeners() {
  // Create order button
  const createOrderBtn = document.getElementById("create-order-btn")
  if (createOrderBtn) {
    createOrderBtn.addEventListener("click", () => {
      // Reset form and open modal
      resetCreateOrderForm()

      // Populate user information
      populateUserInformation()

      // Initialize order items table
      initOrderItemsTable()

      const createOrderModal = new bootstrap.Modal(document.getElementById("createOrderModal"))
      createOrderModal.show()
    })
  }

  // Add item button in create order modal
  const addItemBtn = document.getElementById("add-item-btn")
  if (addItemBtn) {
    addItemBtn.addEventListener("click", () => {
      addOrderItemRow()
    })
  }

  // Add item button in edit order modal
  const editAddItemBtn = document.getElementById("edit-add-item-btn")
  if (editAddItemBtn) {
    editAddItemBtn.addEventListener("click", () => {
      addEditOrderItemRow()
    })
  }

  // Discount input change
  const discountInput = document.getElementById("discount")
  if (discountInput) {
    discountInput.addEventListener("input", updateOrderTotal)
  }

  // Edit discount input change
  const editDiscountInput = document.getElementById("edit-discount")
  if (editDiscountInput) {
    editDiscountInput.addEventListener("input", updateEditOrderTotal)
  }

  // Create order form submission
  const createOrderForm = document.getElementById("create-order-form")
  if (createOrderForm) {
    createOrderForm.addEventListener("submit", (e) => {
      e.preventDefault()
      saveOrder()
    })
  }

  // Edit order form submission
  const editOrderForm = document.getElementById("edit-order-form")
  if (editOrderForm) {
    editOrderForm.addEventListener("submit", (e) => {
      e.preventDefault()
      updateOrder()
    })
  }

  // Status filter dropdown
  const statusFilters = document.querySelectorAll(".status-filter")
  statusFilters.forEach((filter) => {
    filter.addEventListener("click", (e) => {
      e.preventDefault()
      const status = filter.getAttribute("data-status")
      document.getElementById("statusDropdown").innerHTML = `<i class="bi bi-funnel me-1"></i> ${filter.textContent}`
      currentFilter = status
      currentPage = 1
      fetchOrders()
    })
  })

  // Make sure this code is in your setupEventListeners function
  const confirmCancelBtn = document.getElementById("confirm-cancel-btn")
  if (confirmCancelBtn) {
    confirmCancelBtn.addEventListener("click", () => {
      if (!selectedOrderId) return

      updateOrderStatusToCancelled(selectedOrderId)

      const cancelModalInstance = bootstrap.Modal.getInstance(document.getElementById("cancelConfirmationModal"))
      if (cancelModalInstance) cancelModalInstance.hide()
    })
  }

const reviewOrderBtn = document.getElementById("review-order-btn")
if (reviewOrderBtn) {
  console.log("Review order button found")
  reviewOrderBtn.addEventListener("click", () => {
    console.log("Review order button clicked")

    // Adjust this selector based on your actual product select input class or name
    const itemSelects = document.querySelectorAll('.product-select') // <-- Update if needed
    const selectedItems = Array.from(itemSelects)
      .map(select => select.value.trim())
      .filter(val => val !== "")

    console.log("Selected items:", selectedItems)

    // Check if at least one valid item is selected
    if (selectedItems.length === 0) {
      alert("You must add at least one item to proceed.")
      return
    }

    // Check for duplicates
    const duplicates = selectedItems.some((item, index) => selectedItems.indexOf(item) !== index)
    if (duplicates) {
      alert("Duplicate items detected. Please ensure each item is unique.")
      return
    }

    // Check quantity restrictions
    const deliveryMode = document.querySelector('input[name="delivery_mode"]:checked')?.value || "delivery"
    const minQty = deliveryMode === "pickup" ? 20 : 30
    const qtyInputs = document.querySelectorAll(".qty-input")
    let invalidQty = false

    qtyInputs.forEach((input, index) => {
      const qty = parseInt(input.value) || 0
      if (qty < minQty) {
        alert(`Item #${index + 1} has quantity below minimum (${minQty}) for ${deliveryMode}.`)
        input.focus()
        invalidQty = true
      }
    })

    if (invalidQty) return

    // Proceed if form is valid
    if (validateOrderForm()) {
      console.log("Form validated, showing confirmation")
      showOrderConfirmation(false)
    } else {
      console.log("Form validation failed")
    }
  })
} else {
  console.log("Review order button not found")
}


  // Back to edit button in confirmation modal
  const backToEditBtn = document.getElementById("back-to-edit-btn")
  if (backToEditBtn) {
    backToEditBtn.addEventListener("click", () => {
      // Hide confirmation modal
      const confirmationModal = bootstrap.Modal.getInstance(document.getElementById("orderConfirmationModal"))
      if (confirmationModal) {
        confirmationModal.hide()
      }
    })
  }

  // Save order button in confirmation modal - CONSOLIDATED HERE
  const saveOrderBtn = document.getElementById("save-order-btn")
  if (saveOrderBtn) {
    console.log("Save order button found in setupEventListeners")
    saveOrderBtn.addEventListener("click", () => {
      console.log("Save order button clicked")

      // Check if we're editing an existing order or creating a new one
      const isEditModal =
        document.getElementById("edit-order-id") && document.getElementById("edit-order-id").value !== ""

      console.log("Is edit mode:", isEditModal)

      if (isEditModal) {
        updateOrder()
      } else {
        saveOrder()
      }
    })
  } else {
    console.log("Save order button not found in setupEventListeners")
  }

  // Date range filter dropdown
  const dateRangeFilters = document.querySelectorAll(".date-range-filter")
  dateRangeFilters.forEach((filter) => {
    filter.addEventListener("click", (e) => {
      e.preventDefault()
      const range = filter.getAttribute("data-range")
      document.getElementById("dateRangeDropdown").innerHTML =
        `<i class="bi bi-calendar-range me-1"></i> ${filter.textContent}`
      currentDateRange = range

      // Show/hide custom date range selector
      const customDateRange = document.getElementById("custom-date-range")
      if (range === "custom") {
        customDateRange.style.display = "block"
      } else {
        customDateRange.style.display = "none"
        currentPage = 1
        fetchOrders()
      }
    })
  })

  // Apply custom date range button
  const applyDateRangeBtn = document.getElementById("apply-date-range")
  if (applyDateRangeBtn) {
    applyDateRangeBtn.addEventListener("click", () => {
      currentPage = 1
      fetchOrders()
    })
  }

  // Search input
  const searchInput = document.getElementById("order-search")
  if (searchInput) {
    searchInput.addEventListener(
      "input",
      debounce(() => {
        currentSearch = searchInput.value.trim()
        currentPage = 1
        fetchOrders()
      }, 500),
    )
  }

  // Confirm status update button
  const confirmStatusUpdateBtn = document.getElementById("confirm-status-update")
  if (confirmStatusUpdateBtn) {
    confirmStatusUpdateBtn.addEventListener("click", updateOrderStatus)
  }

  // Confirm delete button
  const confirmDeleteBtn = document.getElementById("confirm-delete-btn")
  if (confirmDeleteBtn) {
    confirmDeleteBtn.addEventListener("click", deleteOrder)
  }

  // Delivery mode change in create order modal
  const deliveryModeRadios = document.querySelectorAll('input[name="delivery_mode"]')
  if (deliveryModeRadios.length > 0) {
    deliveryModeRadios.forEach((radio) => {
      radio.addEventListener("change", function () {
        toggleDeliveryFields(this.value)
        updateDefaultQuantities(false) // Update default quantities for new rows
      })
    })
  }

  // Delivery mode change in edit order modal
  const editDeliveryModeRadios = document.querySelectorAll('input[name="edit_delivery_mode"]')
  if (editDeliveryModeRadios.length > 0) {
    editDeliveryModeRadios.forEach((radio) => {
      radio.addEventListener("change", function () {
        toggleEditDeliveryFields(this.value)
        updateDefaultQuantities(true) // Update default quantities for new rows
      })
    })
  }
}

// Add this new function after the setupEventListeners() function
// Function to initialize tab badges with loading spinners
function initializeTabBadges() {
  const tabs = document.querySelectorAll(".order-tab")

  tabs.forEach((tab) => {
    const status = tab.getAttribute("data-status")

    // Create badge if it doesn't exist
    let badge = tab.querySelector(".badge")
    if (!badge) {
      badge = document.createElement("span")
      badge.className = "badge rounded-pill ms-2"

      // Set appropriate badge color based on status
      if (status === "delivered") {
        badge.classList.add("bg-success")
      } else if (status === "cancelled") {
        badge.classList.add("bg-danger")
      } else if (status === "return_requested") {
        badge.classList.add("bg-warning", "text-dark")
      } else {
        badge.classList.add("bg-primary")
      }

      tab.appendChild(badge)
    }

    // Show loading spinner in badge
    badge.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>'
  })
}

// Add this new function after the initializeTabBadges() function
// Function to update tab badges with counts
function updateTabBadges() {
  const tabs = document.querySelectorAll(".order-tab")

  tabs.forEach((tab) => {
    const status = tab.getAttribute("data-status")
    const badge = tab.querySelector(".badge")

    if (badge) {
      badge.textContent = tabCounts[status] || 0

      // Hide badge if count is 0
      if (tabCounts[status] === 0) {
        badge.style.display = "none"
      } else {
        badge.style.display = "inline-block"
      }
    }
  })
}

// Toggle delivery/pickup specific fields in create order modal
function toggleDeliveryFields(mode) {
  const pickupLocationField = document.getElementById("pickup-location-container")
  const pickupDateField = document.getElementById("pickup-date-container")
  const expectedDeliveryField = document.getElementById("expected-delivery-container")

  if (mode === "delivery") {
    pickupLocationField.style.display = "none"
    pickupDateField.style.display = "none"
    expectedDeliveryField.style.display = "block"
  } else if (mode === "pickup") {
    pickupLocationField.style.display = "block"
    pickupDateField.style.display = "block"
    expectedDeliveryField.style.display = "none"
  }
}

// Toggle delivery/pickup specific fields in edit order modal
function toggleEditDeliveryFields(mode) {
  const pickupLocationField = document.getElementById("edit-pickup-location-container")
  const pickupDateField = document.getElementById("edit-pickup-date-container")
  const expectedDeliveryField = document.getElementById("edit-expected-delivery-container")

  if (mode === "delivery") {
    pickupLocationField.style.display = "none"
    pickupDateField.style.display = "none"
    expectedDeliveryField.style.display = "block"
  } else if (mode === "pickup") {
    pickupLocationField.style.display = "block"
    pickupDateField.style.display = "block"
    expectedDeliveryField.style.display = "none"
  }
}

// Initialize order items table
function initOrderItemsTable() {
  const orderItemsBody = document.getElementById("order-items-body")
  if (!orderItemsBody) return

  // Clear existing items
  orderItemsBody.innerHTML = ""

  // Add initial empty row
  addOrderItemRow()

  // Update order total
  updateOrderTotal()
}

// Add a new order item row
function addOrderItemRow() {
  const orderItemsBody = document.getElementById("order-items-body")
  if (!orderItemsBody) return

  // Hide no items row if it exists
  const noItemsRow = document.getElementById("no-items-row")
  if (noItemsRow) {
    noItemsRow.style.display = "none"
  }

  // Get current delivery mode to determine default quantity
  const deliveryMode = document.querySelector('input[name="delivery_mode"]:checked')?.value || "delivery"
  const defaultQuantity = deliveryMode === "pickup" ? "20" : "30" // Corrected: delivery=30, pickup=20

  // Create new row
  const row = document.createElement("tr")
  row.className = "order-item-row"

  // Create row content
  row.innerHTML = `
    <td>
      <select class="form-select product-select">
        <option value="">Select Product</option>
        ${allProducts.map((product) => `<option value="${product.product_id}" data-price="${product.retail_price}">${product.product_name}</option>`).join("")}
      </select>
    </td>
    <td>
      <div class="input-group">
        <button class="btn btn-outline-secondary decrease-qty" type="button">
          <i class="bi bi-dash"></i>
        </button>
        <input type="text" class="form-control text-center qty-input" value="${defaultQuantity}" min="1">
        <button class="btn btn-outline-secondary increase-qty" type="button">
          <i class="bi bi-plus"></i>
        </button>
      </div>
    </td>
    <td>
      <div class="input-group">
        <input type="text" class="form-control text-end price-input" value="0.00" readonly>
        <button class="btn btn-outline-secondary price-edit" type="button">
          
        </button>
      </div>
    </td>
    <td>
      <div class="input-group">
        <input type="text" class="form-control text-end total-input" value="0.00" readonly>
        <button class="btn btn-outline-secondary" type="button" disabled>
      
        </button>
      </div>
    </td>
    <td class="text-center">
      <button type="button" class="btn btn-outline-danger btn-sm delete-item">
        <i class="bi bi-trash"></i>
      </button>
    </td>
  `

  // Add row to table
  orderItemsBody.appendChild(row)

  // Set up event listeners for the new row
  setupRowEventListeners(row)
}

// Add a new edit order item row
function addEditOrderItemRow() {
  const orderItemsBody = document.getElementById("edit-order-items-body")
  if (!orderItemsBody) return

  // Hide no items row if it exists
  const noItemsRow = document.getElementById("edit-no-items-row")
  if (noItemsRow) {
    noItemsRow.style.display = "none"
  }

  // Get current delivery mode to determine default quantity
  const deliveryMode = document.querySelector('input[name="edit_delivery_mode"]:checked')?.value || "delivery"
  const defaultQuantity = deliveryMode === "pickup" ? "20" : "30" // Corrected: delivery=30, pickup=20

  // Create new row
  const row = document.createElement("tr")
  row.className = "order-item-row"

  // Create row content
  row.innerHTML = `
    <td>
      <select class="form-select product-select">
        <option value="">Select Product</option>
        ${allProducts.map((product) => `<option value="${product.product_id}" data-price="${product.retail_price}">${product.product_name}</option>`).join("")}
      </select>
    </td>
    <td>
      <div class="input-group">
        <button class="btn btn-outline-secondary decrease-qty" type="button">
          <i class="bi bi-dash"></i>
        </button>
        <input type="text" class="form-control text-center qty-input" value="${defaultQuantity}" min="1">
        <button class="btn btn-outline-secondary increase-qty" type="button">
          <i class="bi bi-plus"></i>
        </button>
      </div>
    </td>
    <td>
      <div class="input-group">
        <input type="text" class="form-control text-end price-input" value="0.00" readonly>
        <button class="btn btn-outline-secondary price-edit" type="button">
          <i class="bi bi-pencil"></i>
        </button>
      </div>
    </td>
    <td>
      <div class="input-group">
        <input type="text" class="form-control text-end total-input" value="0.00" readonly>
        <button class="btn btn-outline-secondary" type="button" disabled>
          <i class="bi bi-pencil"></i>
        </button>
      </div>
    </td>
    <td class="text-center">
      <button type="button" class="btn btn-outline-danger btn-sm delete-item">
        <i class="bi bi-trash"></i>
      </button>
    </td>
  `

  // Add row to table
  orderItemsBody.appendChild(row)

  // Set up event listeners for the new row
  setupRowEventListeners(row)

  // Update order total
  updateEditOrderTotal()
}

// Function to update default quantities when delivery mode changes
function updateDefaultQuantities(isEdit = false) {
  const prefix = isEdit ? "edit-" : ""
  const deliveryMode = document.querySelector(`input[name="${prefix}delivery_mode"]:checked`)?.value || "delivery"
  const defaultQuantity = deliveryMode === "pickup" ? "20" : "30" // Corrected: delivery=30, pickup=20

  const tableId = isEdit ? "edit-order-items-body" : "order-items-body"
  const orderItemsBody = document.getElementById(tableId)

  if (orderItemsBody) {
    const rows = orderItemsBody.querySelectorAll(".order-item-row")
    rows.forEach((row) => {
      const qtyInput = row.querySelector(".qty-input")
      const productSelect = row.querySelector(".product-select")

      // Only update if no product is selected (empty row)
      if (qtyInput && (!productSelect || !productSelect.value)) {
        qtyInput.value = defaultQuantity
        updateRowTotal(row)
      }
    })

    // Update order total
    if (isEdit) {
      updateEditOrderTotal()
    } else {
      updateOrderTotal()
    }
  }
}

// Set up event listeners for a row
function setupRowEventListeners(row) {
  // Product select
  const productSelect = row.querySelector(".product-select")
  if (productSelect) {
    productSelect.addEventListener("change", function () {
      const selectedOption = this.options[this.selectedIndex]
      const price = selectedOption.getAttribute("data-price") || 0

      // Update price input
      const priceInput = row.querySelector(".price-input")
      if (priceInput) {
        priceInput.value = Number.parseFloat(price).toFixed(2)
      }

      // Update row total
      updateRowTotal(row)

      // Update order total
      const isEditModal = row.closest("#edit-order-items-body") !== null
      if (isEditModal) {
        updateEditOrderTotal()
      } else {
        updateOrderTotal()
      }
    })
  }

  // Quantity decrease button
  const decreaseBtn = row.querySelector(".decrease-qty")
  if (decreaseBtn) {
    decreaseBtn.addEventListener("click", () => {
      const qtyInput = row.querySelector(".qty-input")
      const qty = Number.parseInt(qtyInput.value) || 1
      if (qty > 1) {
        qtyInput.value = qty - 1
        updateRowTotal(row)

        // Update order total
        const isEditModal = row.closest("#edit-order-items-body") !== null
        if (isEditModal) {
          updateEditOrderTotal()
        } else {
          updateOrderTotal()
        }
      }
    })
  }

  // Quantity increase button
  const increaseBtn = row.querySelector(".increase-qty")
  if (increaseBtn) {
    increaseBtn.addEventListener("click", () => {
      const qtyInput = row.querySelector(".qty-input")
      const qty = Number.parseInt(qtyInput.value) || 1
      qtyInput.value = qty + 1
      updateRowTotal(row)

      // Update order total
      const isEditModal = row.closest("#edit-order-items-body") !== null
      if (isEditModal) {
        updateEditOrderTotal()
      } else {
        updateOrderTotal()
      }
    })
  }

  // Quantity input change
  const qtyInput = row.querySelector(".qty-input")
  if (qtyInput) {
    qtyInput.addEventListener("change", function () {
      let qty = Number.parseInt(this.value) || 1
      if (qty < 1) {
        this.value = 1
        qty = 1
      }
      updateRowTotal(row)

      // Update order total
      const isEditModal = row.closest("#edit-order-items-body") !== null
      if (isEditModal) {
        updateEditOrderTotal()
      } else {
        updateOrderTotal()
      }
    })
  }

  // Keep the Price input change event listener to handle cases where the price might be set programmatically
  const priceInput = row.querySelector(".price-input")
  if (priceInput) {
    priceInput.addEventListener("change", function () {
      let price = Number.parseFloat(this.value) || 0
      if (price < 0) {
        this.value = "0.00"
        price = 0
      } else {
        this.value = price.toFixed(2)
      }
      updateRowTotal(row)

      // Update order total
      const isEditModal = row.closest("#edit-order-items-body") !== null
      if (isEditModal) {
        updateEditOrderTotal()
      } else {
        updateOrderTotal()
      }
    })

    // Handle Enter key to finish editing
    priceInput.addEventListener("keydown", function (e) {
      if (e.key === "Enter") {
        this.readOnly = true
        updateRowTotal(row)

        // Update order total
        const isEditModal = row.closest("#edit-order-items-body") !== null
        if (isEditModal) {
          updateEditOrderTotal()
        } else {
          updateOrderTotal()
        }
      }
    })
  }

  // Delete item button
  const deleteBtn = row.querySelector(".delete-item")
  if (deleteBtn) {
    deleteBtn.addEventListener("click", () => {
      const tbody = row.parentElement
      const rows = tbody.querySelectorAll(".order-item-row")

      // If this is the only row, just reset it instead of removing
      if (rows.length === 1) {
        const productSelect = row.querySelector(".product-select")
        const qtyInput = row.querySelector(".qty-input")
        const priceInput = row.querySelector(".price-input")
        const totalInput = row.querySelector(".total-input")

        if (productSelect) productSelect.value = ""
        if (qtyInput) qtyInput.value = "1"
        if (priceInput) priceInput.value = "0.00"
        if (totalInput) totalInput.value = "0.00"

        // Show no items row if it exists
        const isEditModal = row.closest("#edit-order-items-body") !== null
        const noItemsRow = document.getElementById(isEditModal ? "edit-no-items-row" : "no-items-row")
        if (noItemsRow) {
          noItemsRow.style.display = "table-row"
        }
      } else {
        // Remove the row
        row.remove()
      }

      // Update order total
      const isEditModal = row.closest("#edit-order-items-body") !== null
      if (isEditModal) {
        updateEditOrderTotal()
      } else {
        updateOrderTotal()
      }
    })
  }
}

// Update the total for a row
function updateRowTotal(row) {
  const qtyInput = row.querySelector(".qty-input")
  const priceInput = row.querySelector(".price-input")
  const totalInput = row.querySelector(".total-input")

  if (qtyInput && priceInput && totalInput) {
    const qty = Number.parseInt(qtyInput.value) || 0
    const price = Number.parseFloat(priceInput.value) || 0
    const total = qty * price

    totalInput.value = total.toFixed(2)
  }
}

// Update order total
function updateOrderTotal() {
  const orderItemsBody = document.getElementById("order-items-body")
  const subtotalElement = document.getElementById("subtotal")
  const discountInput = document.getElementById("discount")
  const totalElement = document.getElementById("total-amount")

  if (!orderItemsBody || !subtotalElement || !discountInput || !totalElement) return

  // Calculate subtotal from all rows
  let subtotal = 0
  const rows = orderItemsBody.querySelectorAll(".order-item-row")

  rows.forEach((row) => {
    const totalInput = row.querySelector(".total-input")
    if (totalInput) {
      subtotal += Number.parseFloat(totalInput.value) || 0
    }
  })

  // Get discount
  const discount = Number.parseFloat(discountInput.value) || 0

  // Calculate total
  const total = Math.max(0, subtotal - discount)

  // Update elements
  subtotalElement.textContent = subtotal.toFixed(2)
  totalElement.textContent = total.toFixed(2)
}

// Update edit order total
function updateEditOrderTotal() {
  const orderItemsBody = document.getElementById("edit-order-items-body")
  const subtotalElement = document.getElementById("edit-subtotal")
  const discountInput = document.getElementById("edit-discount")
  const totalElement = document.getElementById("edit-total-amount")

  if (!orderItemsBody || !subtotalElement || !discountInput || !totalElement) return

  // Calculate subtotal from all rows
  let subtotal = 0
  const rows = orderItemsBody.querySelectorAll(".order-item-row")

  rows.forEach((row) => {
    const totalInput = row.querySelector(".total-input")
    if (totalInput) {
      subtotal += Number.parseFloat(totalInput.value) || 0
    }
  })

  // Get discount
  const discount = Number.parseFloat(discountInput.value) || 0

  // Calculate total
  const total = Math.max(0, subtotal - discount)

  // Update elements
  subtotalElement.textContent = subtotal.toFixed(2)
  totalElement.textContent = total.toFixed(2)
}

// Populate user information in the create order form
function populateUserInformation() {
  if (!currentUser) {
    console.log("No user data available to populate form")
    return
  }

  const retailerNameInput = document.getElementById("retailer-name")
  const retailerEmailInput = document.getElementById("retailer-email")
  const retailerContactInput = document.getElementById("retailer-contact")
  const retailerAddressInput = document.getElementById("retailer-address")

  if (retailerNameInput && retailerEmailInput && retailerContactInput) {
    // Prioritize using first_name and last_name combined
    let fullName = ""

    if (currentUser.first_name && currentUser.last_name) {
      fullName = `${currentUser.first_name} ${currentUser.last_name}`
    } else if (currentUser.full_name) {
      // Fall back to full_name if first_name and last_name aren't available
      fullName = currentUser.full_name
    } else if (currentUser.business_name) {
      // Fall back to business_name as last resort
      fullName = currentUser.business_name
    }

    retailerNameInput.value = fullName
    retailerEmailInput.value = currentUser.email || ""
    retailerContactInput.value = currentUser.phone || ""

    // Populate address fields
    let addressValue = ""
    if (currentUser.business_address) {
      addressValue = currentUser.business_address
    } else {
      // Otherwise construct from individual parts
      const addressParts = []
      if (currentUser.house_number) addressParts.push(currentUser.house_number)
      if (currentUser.address_notes) addressParts.push(currentUser.address_notes)
      if (currentUser.barangay) addressParts.push(currentUser.barangay)
      if (currentUser.city) addressParts.push(currentUser.city)
      if (currentUser.province) addressParts.push(currentUser.province)

      addressValue = addressParts.join(", ")
    }

    if (retailerAddressInput) {
      retailerAddressInput.value = addressValue
    }

    console.log("User information populated in form")
  }
}

// Fetch products for the product selection
function fetchProducts() {
  fetch("retailer_order_handler.php?action=get_products")
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok")
      }
      return response.json()
    })
    .then((data) => {
      if (data.success) {
        allProducts = data.products
        console.log("Products loaded:", allProducts.length)

        // If we have orders with items, update product names
        if (allOrders && allOrders.length > 0) {
          allOrders.forEach((order) => {
            if (order.items && order.items.length > 0) {
              order.items.forEach((item) => {
                if (!item.product_name && item.product_id) {
                  const product = allProducts.find((p) => p.product_id == item.product_id)
                  if (product) {
                    item.product_name = product.product_name
                  }
                }
              })
            }
          })
        }
      } else {
        showResponseMessage("danger", data.message || "Failed to fetch products")
      }
    })
    .catch((error) => {
      console.error("Error fetching products:", error)
      showResponseMessage("danger", "Error connecting to the server. Please try again.")
    })
}

// Reset create order form
function resetCreateOrderForm() {
  const createOrderForm = document.getElementById("create-order-form")
  if (createOrderForm) {
    createOrderForm.reset()

    // Set default dates
    const orderDateInput = document.getElementById("order-date")
    if (orderDateInput) {
      orderDateInput.valueAsDate = new Date()
    }

    const expectedDeliveryInput = document.getElementById("expected-delivery")
    if (expectedDeliveryInput) {
      const deliveryDate = new Date()
      deliveryDate.setDate(deliveryDate.getDate() + 3)
      expectedDeliveryInput.valueAsDate = deliveryDate
    }

    const pickupDateInput = document.getElementById("pickup-date")
    if (pickupDateInput) {
      const pickupDate = new Date()
      pickupDate.setDate(pickupDate.getDate() + 3) // Default pickup date 3 days from now
      pickupDateInput.valueAsDate = pickupDate
    }

    // Set default delivery mode to delivery
    const deliveryRadio = document.querySelector('input[name="delivery_mode"][value="delivery"]')
    if (deliveryRadio) {
      deliveryRadio.checked = true
      toggleDeliveryFields("delivery")
    }
  }
}

// Utility functions for modal management
function showModal(modalId) {
  const modal = new bootstrap.Modal(document.getElementById(modalId))
  modal.show()
  return modal
}
function hideModal(modalId) {
  const modalInstance = bootstrap.Modal.getInstance(document.getElementById(modalId))
  if (modalInstance) modalInstance.hide()
}
function cleanupModals() {
  // Remove any lingering modal backdrops
  const modalBackdrops = document.querySelectorAll('.modal-backdrop')
  modalBackdrops.forEach((backdrop) => backdrop.remove())
  // Remove modal-open class from body
  document.body.classList.remove('modal-open')
  document.body.style.overflow = ''
  document.body.style.paddingRight = ''
}

// Refactored saveOrder
function saveOrder() {
  console.log("saveOrder function called")

  // Validate form
  if (!validateOrderForm()) {
    console.error("Form validation failed")
    return
  }

  // Collect order items
  const orderItems = collectOrderItems()
  console.log("Collected order items:", orderItems)

  if (orderItems.length === 0) {
    showResponseMessage("danger", "Please add at least one item to the order")
    return
  }

  // Get form data
  const retailerName = document.getElementById("retailer-name").value
  const retailerEmail = document.getElementById("retailer-email").value
  const retailerContact = document.getElementById("retailer-contact").value
  const retailerAddress = document.getElementById("retailer-address").value
  const orderDate = document.getElementById("order-date").value
  const notes = document.getElementById("order-notes").value
  const subtotal = Number.parseFloat(document.getElementById("subtotal").textContent)
  const discount = Number.parseFloat(document.getElementById("discount").value) || 0
  const totalAmount = Number.parseFloat(document.getElementById("total-amount").textContent)

  // Get consignment term
  const consignmentTerm = document.getElementById("consignment-term").value
  console.log("Consignment term:", consignmentTerm)

  // Get delivery mode
  const deliveryMode = document.querySelector('input[name="delivery_mode"]:checked').value
  console.log("Delivery mode:", deliveryMode)

  // Get mode-specific data
  let expectedDelivery = ""
  let pickupLocation = ""
  let pickupDate = ""

  if (deliveryMode === "delivery") {
    expectedDelivery = document.getElementById("expected-delivery").value
    console.log("Expected delivery:", expectedDelivery)
  } else if (deliveryMode === "pickup") {
    pickupLocation = document.getElementById("pickup-location").value
    pickupDate = document.getElementById("pickup-date").value
    console.log("Pickup location:", pickupLocation)
    console.log("Pickup date:", pickupDate)
  }

  // Create order data
  const orderData = {
    retailer_name: retailerName,
    retailer_email: retailerEmail,
    retailer_contact: retailerContact,
    retailer_address: retailerAddress,
    order_date: orderDate,
    expected_delivery: expectedDelivery,
    notes: notes,
    status: "order", // Default status for new orders
    subtotal: subtotal,
    discount: discount,
    total_amount: totalAmount,
    items: orderItems,
    delivery_mode: deliveryMode,
    pickup_location: pickupLocation,
    pickup_date: pickupDate,
    consignment_term: consignmentTerm, // Add consignment term to the order data
  }

  console.log("Sending order data:", orderData)

  // First, properly close all modals
  closeAllModals()

  // Show loading modal
  showModal('loadingModal')

  // Send order data to server
  fetch("save_retailer_order.php", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(orderData),
  })
    .then((response) => {
      console.log("Response status:", response.status)
      if (!response.ok) {
        throw new Error("Network response was not ok")
      }
      return response.json()
    })
    .then((data) => {
      console.log("Server response:", data)

      // Set a timeout to hide loading modal and show success modal
      setTimeout(() => {
        hideModal('loadingModal')
        if (data.success) {
          // Set success message
          document.getElementById("success-message").textContent = data.message || "Order created successfully"

          // Show success modal
          showModal('successModal')

          // Auto-hide success modal after 3 seconds
          setTimeout(() => {
            hideModal('successModal')
            cleanupModals()
            fetchOrders()
          }, 2000)
        } else {
          showResponseMessage("danger", data.message || "Failed to create order")
        }
      }, 2000)
    })
    .catch((error) => {
      // Hide loading modal in case of error
      setTimeout(() => {
        hideModal('loadingModal')
        console.error("Error creating order:", error)
        showResponseMessage("danger", "Error connecting to the server. Please try again.")
      }, 1000)
    })
}

// Add this function to properly close all modals and clean up the backdrop
function closeAllModals() {
  // Close confirmation modal
  const confirmationModal = document.getElementById("orderConfirmationModal")
  if (confirmationModal) {
    const bsConfirmationModal = bootstrap.Modal.getInstance(confirmationModal)
    if (bsConfirmationModal) {
      bsConfirmationModal.hide()
    }
  }

  // Close create order modal
  const createOrderModal = document.getElementById("createOrderModal")
  if (createOrderModal) {
    const bsCreateOrderModal = bootstrap.Modal.getInstance(createOrderModal)
    if (bsCreateOrderModal) {
      bsCreateOrderModal.hide()
    }
  }

  // Close edit order modal if it exists
  const editOrderModal = document.getElementById("editOrderModal")
  if (editOrderModal) {
    const bsEditOrderModal = bootstrap.Modal.getInstance(editOrderModal)
    if (bsEditOrderModal) {
      bsEditOrderModal.hide()
    }
  }

  // Force cleanup of any lingering modal backdrops after a short delay
  setTimeout(() => {
    const modalBackdrops = document.querySelectorAll(".modal-backdrop")
    modalBackdrops.forEach((backdrop) => {
      backdrop.remove()
    })

    // Remove modal-open class from body
    document.body.classList.remove("modal-open")
    document.body.style.overflow = ""
    document.body.style.paddingRight = ""
  }, 300)
}

// Function to properly clean up modal backdrop when clicking the X button
document.addEventListener("DOMContentLoaded", () => {
  // Get all close buttons in modals
  const modalCloseButtons = document.querySelectorAll(".modal .btn-close")

  modalCloseButtons.forEach((button) => {
    button.addEventListener("click", () => {
      // Add a small delay to ensure the modal is fully closed
      setTimeout(() => {
        // Remove any lingering modal backdrops
        const modalBackdrops = document.querySelectorAll(".modal-backdrop")
        modalBackdrops.forEach((backdrop) => {
          backdrop.remove()
        })

        // Remove modal-open class from body
        document.body.classList.remove("modal-open")
        document.body.style.overflow = ""
        document.body.style.paddingRight = ""
      }, 300)
    })
  })
})

// Fix the collectOrderItems function to ensure it properly collects all data
function collectOrderItems(isEdit = false) {
  const tableId = isEdit ? "edit-order-items-body" : "order-items-body"
  const orderItemsBody = document.getElementById(tableId)
  if (!orderItemsBody) return []

  const items = []
  const rows = orderItemsBody.querySelectorAll(".order-item-row")

  rows.forEach((row) => {
    const productSelect = row.querySelector(".product-select")
    const qtyInput = row.querySelector(".qty-input")
    const priceInput = row.querySelector(".price-input")
    const totalInput = row.querySelector(".total-input")

    if (productSelect && qtyInput && priceInput) {
      const productId = productSelect.value
      const productName = productSelect.options[productSelect.selectedIndex].text
      const quantity = Number.parseInt(qtyInput.value) || 1
      const unitPrice = Number.parseFloat(priceInput.value) || 0
      const totalPrice = Number.parseFloat(totalInput.value) || 0

      // Only add items with a selected product
      if (productId && productName !== "Select Product") {
        items.push({
          product_id: productId,
          product_name: productName,
          quantity: quantity,
          unit_price: unitPrice,
          total_price: totalPrice,
        })
      }
    }
  })

  console.log("Collected items:", items) // Debug log
  return items
}

// Find the updateOrder function and replace it with this updated version
function updateOrder() {
  // Validate form
  if (!validateOrderForm(true)) {
    return
  }

  // Collect order items
  const orderItems = collectOrderItems(true)

  if (orderItems.length === 0) {
    showResponseMessage("danger", "Please add at least one item to the order")
    return
  }

  // Get form data
  const orderId = document.getElementById("edit-order-id").value
  const retailerName = document.getElementById("edit-retailer-name").value
  const retailerEmail = document.getElementById("edit-retailer-email").value
  const retailerContact = document.getElementById("edit-retailer-contact").value
  const retailerAddress = document.getElementById("edit-retailer-address").value
  const orderDate = document.getElementById("edit-order-date").value
  const notes = document.getElementById("edit-order-notes").value
  const subtotal = Number.parseFloat(document.getElementById("edit-subtotal").textContent)
  const discount = Number.parseFloat(document.getElementById("edit-discount").value) || 0
  const totalAmount = Number.parseFloat(document.getElementById("edit-total-amount").textContent)

  // Get delivery mode
  const deliveryMode = document.querySelector('input[name="edit_delivery_mode"]:checked').value

  // Get mode-specific data
  let expectedDelivery = ""
  let pickupLocation = ""
  let pickupDate = ""

  if (deliveryMode === "delivery") {
    expectedDelivery = document.getElementById("edit-expected-delivery").value
  } else if (deliveryMode === "pickup") {
    pickupLocation = document.getElementById("edit-pickup-location").value
    pickupDate = document.getElementById("edit-pickup-date").value
  }

  // Create order data
  const orderData = {
    order_id: orderId,
    retailer_name: retailerName,
    retailer_email: retailerEmail,
    retailer_contact: retailerContact,
    retailer_address: retailerAddress,
    order_date: orderDate,
    expected_delivery: expectedDelivery,
    notes: notes,
    status: originalOrderStatus, // Maintain the original status
    subtotal: subtotal,
    discount: discount,
    total_amount: totalAmount,
    items: orderItems,
    delivery_mode: deliveryMode,
    pickup_location: pickupLocation,
    pickup_date: pickupDate,
  }

  // First, properly close all modals
  closeAllModals()

  // Show loading modal
  showModal('loadingModal')

  // Send order data to server
  fetch("update_retailer_order.php", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(orderData),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok")
      }
      return response.json()
    })
    .then((data) => {
      // Set a timeout to hide loading modal and show success modal
      setTimeout(() => {
        hideModal('loadingModal')
        if (data.success) {
          // Set success message
          document.getElementById("success-message").textContent = data.message || "Order updated successfully"

          // Show success modal
          showModal('successModal')

          // Auto-hide success modal after 3 seconds
          setTimeout(() => {
            hideModal('successModal')
            cleanupModals()
            fetchOrders()
          }, 2000)
        } else {
          showResponseMessage("danger", data.message || "Failed to update order")
        }
      }, 2000)
    })
    .catch((error) => {
      // Hide loading modal in case of error
      setTimeout(() => {
        hideModal('loadingModal')
        console.error("Error updating order:", error)
        showResponseMessage("danger", "Error connecting to the server. Please try again.")
      }, 1000)
    })
}

// Add an event listener for the view-orders-btn in the success modal
document.addEventListener("DOMContentLoaded", () => {
  const viewOrdersBtn = document.getElementById("view-orders-btn")
  if (viewOrdersBtn) {
    viewOrdersBtn.addEventListener("click", () => {
      // Hide the success modal
      const successModal = bootstrap.Modal.getInstance(document.getElementById("successModal"))
      if (successModal) {
        successModal.hide()
      }

      // Refresh orders
      fetchOrders()
    })
  }
})

// Validate order form
function validateOrderForm(isEdit = false) {
  const prefix = isEdit ? "edit-" : ""

  // Required fields
  let retailerName, retailerEmail
  if (isEdit) {
    retailerName = document.getElementById(`${prefix}retailer-name`).value
    retailerEmail = document.getElementById(`${prefix}retailer-email`).value
  }
  const orderDate = document.getElementById(`${prefix}order-date`).value

  // Get delivery mode
  const deliveryModeSelector = isEdit
    ? 'input[name="edit_delivery_mode"]:checked'
    : 'input[name="delivery_mode"]:checked'
  const deliveryMode = document.querySelector(deliveryModeSelector)

  if (!deliveryMode) {
    showResponseMessage("danger", "Please select a delivery mode")
    return false
  }

  // Validate mode-specific fields
  if (deliveryMode.value === "delivery") {
    // For delivery mode, validate expected delivery date
    const expectedDelivery = document.getElementById(`${prefix}expected-delivery`).value
    if (!expectedDelivery) {
      showResponseMessage("danger", "Please enter an expected delivery date")
      return false
    }
  } else if (deliveryMode.value === "pickup") {
    const pickupLocation = document.getElementById(`${prefix}pickup-location`).value
    if (!pickupLocation) {
      showResponseMessage("danger", "Please select a pickup location")
      return false
    }

    const pickupDate = document.getElementById(`${prefix}pickup-date`).value
    if (!pickupDate) {
      showResponseMessage("danger", "Please enter a pickup date")
      return false
    }
  }

  if (isEdit) {
    if (!retailerName || !retailerEmail || !orderDate) {
      showResponseMessage("danger", "Please fill in all required fields")
      return false
    }
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(retailerEmail)) {
      showResponseMessage("danger", "Please enter a valid email address")
      return false
    }
  } else {
    if (!orderDate) {
      showResponseMessage("danger", "Please fill in all required fields")
      return false
    }
  }

  return true
}

function fetchOrders() {
  const ordersContainer = document.getElementById("orders-card-container")
  if (!ordersContainer) {
    console.error("Orders container not found")
    return
  }

  // Show loading indicator
  ordersContainer.innerHTML = `
    <div class="col-12 text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <div class="mt-3">Loading orders...</div>
    </div>
  `

  // Build query parameters
  const params = `?action=get_orders&status=${currentTab}`

  console.log("Fetching orders with params:", params)

  // Fetch orders from server
  fetch(`retailer_order_handler.php${params}`)
    .then((response) => {
      console.log("Response status:", response.status)
      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.status}`)
      }
      return response.json()
    })
    .then((data) => {
      console.log("Orders data received:", data)
      if (data.success) {
        // Store orders
        allOrders = data.orders || []
        console.log("Number of orders:", allOrders.length)

        // Update tab counts
        tabCounts.all = allOrders.length

        // Count orders by status
        tabCounts.delivered = allOrders.filter(
          (order) => order.status === "delivered" || (order.status === "picked up" && order.delivery_mode === "pickup"),
        ).length

        tabCounts.cancelled = allOrders.filter((order) => order.status === "cancelled").length

        // Update badges
        updateTabBadges()

        // Render orders
        renderOrders(allOrders)
      } else {
        throw new Error(data.message || "Failed to fetch orders")
      }
    })
    .catch((error) => {
      console.error("Error fetching orders:", error)
      ordersContainer.innerHTML = `
        <div class="col-12 text-center py-5">
          <div class="text-danger">
            <i class="bi bi-exclamation-triangle-fill fs-1"></i>
            <div class="mt-3">Error loading orders: ${error.message}</div>
            <button class="btn btn-outline-primary mt-3" onclick="fetchOrders()">
              <i class="bi bi-arrow-clockwise me-1"></i> Try Again
            </button>
          </div>
        </div>
      `
    })
}

// Function to fetch orders with return_requested status
function fetchReturnRequestedOrders() {
  const ordersContainer = document.getElementById("orders-card-container")
  if (!ordersContainer) {
    console.error("Orders container not found")
    return
  }

  // Show loading indicator
  ordersContainer.innerHTML = `
    <div class="col-12 text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <div class="mt-3">Loading return requested orders...</div>
    </div>
  `

  // Build query parameters
  const params = `?action=get_orders&status=return_requested`

  console.log("Fetching return requested orders with params:", params)

  // Fetch orders from server
  fetch(`retailer_order_handler.php${params}`)
    .then((response) => {
      console.log("Response status:", response.status)
      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.status}`)
      }
      return response.json()
    })
    .then((data) => {
      console.log("Return requested orders data received:", data)
      if (data.success) {
        // Store orders
        allOrders = data.orders || []
        console.log("Number of return requested orders:", allOrders.length)

        // Update return_requested tab count
        tabCounts.return_requested = allOrders.length

        // Update badges
        updateTabBadges()

        // Render orders
        renderOrders(allOrders)
      } else {
        throw new Error(data.message || "Failed to fetch return requested orders")
      }
    })
    .catch((error) => {
      console.error("Error fetching return requested orders:", error)
      ordersContainer.innerHTML = `
        <div class="col-12 text-center py-5">
          <div class="text-danger">
            <i class="bi bi-exclamation-triangle-fill fs-1"></i>
            <div class="mt-3">Error loading return requested orders: ${error.message}</div>
            <button class="btn btn-outline-primary mt-3" onclick="fetchReturnRequestedOrders()">
              <i class="bi bi-arrow-clockwise me-1"></i> Try Again
            </button>
          </div>
        </div>
      `
    })
}

// Update the renderOrders function to check for pickup mode when displaying status
// Find the part where it creates the card HTML and update the status display
function renderOrders(orders) {
  const ordersContainer = document.getElementById("orders-card-container")
  if (!ordersContainer) {
    console.error("Orders container not found in renderOrders")
    return
  }

  // Clear the container
  ordersContainer.innerHTML = ""

  // If no orders, show a message
  if (!orders || orders.length === 0) {
    ordersContainer.innerHTML = `
      <div class="col-12">
        <div class="alert alert-info text-center">
          <i class="bi bi-info-circle me-2"></i> No orders found.
        </div>
      </div>
    `
    return
  }

  // Sort orders by date (newest first)
  orders.sort((a, b) => new Date(b.order_date) - new Date(a.order_date))

  let html = ""

  // Loop through orders and create cards
  orders.forEach((order) => {
    // Format date
    const orderDate = new Date(order.order_date)
    const formattedDate = orderDate.toLocaleDateString()

    // Format status - Check if it's a delivered order in pickup mode
    let displayStatus = order.status
    if (order.status === "delivered" && order.delivery_mode === "pickup") {
      displayStatus = "picked up"
    }

    // Format status
    const statusClass = getStatusClass(displayStatus)

    // Format total amount
    const totalAmount = Number.parseFloat(order.total_amount).toFixed(2)

    // Get order number (PO number or order ID)
    const orderNumber = order.po_number || order.order_id

    // Get retailer name
    const retailerName = order.retailer_name || "Unknown Retailer"

    // Get items count
    const itemsCount = order.items ? order.items.length : 0

    // Initialize action buttons with the View button (always shown)
    let actionButtons = `
      <button class="btn btn-sm btn-outline-primary action-btn-view" title="View Details" data-id="${order.order_id}">
        <i class="bi bi-eye me-1"></i> View
      </button>`

    // Show Complete and Return buttons for delivered or picked up orders
    if (order.status === "delivered" || order.status === "picked up") {
      actionButtons += `
        <button class="btn btn-sm btn-outline-success action-btn-complete" title="Complete Order" data-id="${order.order_id}">
          <i class="bi bi-check-circle me-1"></i> Complete
        </button>
        <button class="btn btn-sm btn-outline-warning action-btn-return" title="Return Order" data-id="${order.order_id}">
          <i class="bi bi-arrow-return-left me-1"></i> Return
        </button>`
    } else if (order.status === "order" || order.status === "order placed") {
      actionButtons += `
        <button class="btn btn-sm btn-outline-warning action-btn-cancel" title="Cancel" data-id="${order.order_id}">
          <i class="bi bi-x-circle me-1"></i> Cancel
        </button>`
    } else if (order.status === "cancelled") {
      actionButtons += `
        <button class="btn btn-sm btn-outline-primary action-btn-reorder" title="Reorder" data-id="${order.order_id}">
          <i class="bi bi-arrow-clockwise me-1"></i> Reorder
        </button>
        <button class="btn btn-sm btn-outline-danger action-btn-delete" title="Delete" data-id="${order.order_id}">
          <i class="bi bi-trash me-1"></i> Delete
        </button>`
    }

    // Create the card HTML with the updated status display
    html += `
      <div class="col-md-6 col-lg-4 mb-4">
        <div class="card order-card modern-card h-100">
          <div class="card-header d-flex justify-content-between align-items-center">
            <h6 class="mb-0">
              <i class="bi bi-box me-2"></i> Order #${orderNumber}
            </h6>
            <span class="badge ${getStatusBgClass(displayStatus)}">${formatStatus(displayStatus)}</span>
          </div>
          <div class="card-body">
            <div class="mb-3">
              <div class="d-flex justify-content-between mb-2">
                <span class="text-muted"><i class="bi bi-calendar me-1"></i> Date:</span>
                <span class="fw-medium">${formattedDate}</span>
              </div>
              <div class="d-flex justify-content-between mb-2">
                <span class="text-muted"><i class="bi bi-shop me-1"></i> Retailer:</span>
                <span class="fw-medium">${retailerName}</span>
              </div>
              <div class="d-flex justify-content-between mb-2">
                <span class="text-muted"><i class="bi bi-list-check me-1"></i> Items:</span>
                <span class="fw-medium">${itemsCount}</span>
              </div>
              <div class="d-flex justify-content-between">
                <span class="text-muted"><i class="bi bi-currency-dollar me-1"></i> Total:</span>
                <span class="fw-bold">₱${totalAmount}</span>
              </div>
            </div>
            
            ${
              order.notes
                ? `
            <div class="order-notes mt-3">
              <div class="text-muted small mb-1"><i class="bi bi-sticky me-1"></i> Notes:</div>
              <div class="notes-content small">${order.notes}</div>
            </div>
            `
                : ""
            }
          </div>
          <div class="card-footer">
            <div class="action-buttons d-flex gap-2">
              ${actionButtons}
            </div>
          </div>
        </div>
      </div>
    `
  })

  // Add the HTML to the container
  ordersContainer.innerHTML = html

  // Set up event listeners for the action buttons
  setupActionButtons()
}

// Helper function to format status text
// Find the formatStatus function and update it to handle "picked up" status
function formatStatus(status) {
  if (!status) return "Unknown"

  // Special case for "delivered" status when the order  {
  if (!status) return "Unknown"

  // Special case for "delivered" status when the order is in pickup mode
  if (status === "delivered" && currentOrderIsPickup) {
    return "Picked Up"
  }

  // Handle specific statuses
  switch (status.toLowerCase()) {
    case "completed":
      return "Completed"
    case "returned":
      return "Returned"
    case "return_requested":
      return "Return Requested"
    case "confirmed":
      return "Confirmed"
    case "ready-to-pickup":
      return "Ready for Pickup"
    case "picked up":
      return "Picked Up"
    case "order":
    case "order placed":
      return "Order Placed"
    default:
      // Convert to title case and replace underscores with spaces
      return status.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase())
  }
}

// Helper function to get status class for styling
// Update the getStatusBgClass function to include confirmed and ready-to-pickup classes
function getStatusClass(status) {
  switch (status) {
    case "pending":
      return "pending"
    case "processing":
      return "processing"
    case "shipped":
      return "shipped"
    case "delivered":
      return "delivered"
    case "picked up":
      return "picked-up"
    case "completed":
      return "completed"
    case "cancelled":
      return "cancelled"
    case "return_requested":
      return "return-requested"
    case "returned":
      return "returned"
    default:
      return "default"
  }
}

// Set up event listeners for the action buttons
function setupActionButtons() {
  // View order details
  const viewButtons = document.querySelectorAll(".action-btn-view")
  viewButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const orderId = this.getAttribute("data-id")
      showOrderDetailsModal(orderId)
    })
  })

  // Delete order
  const deleteButtons = document.querySelectorAll(".action-btn-delete")
  deleteButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const orderId = this.getAttribute("data-id")
      showDeleteConfirmation(orderId)
    })
  })

  // Complete order
  const completeButtons = document.querySelectorAll(".action-btn-complete")
  completeButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const orderId = this.getAttribute("data-id")
      showCompleteOrderModal(orderId)
    })
  })

  // Return order
  const returnButtons = document.querySelectorAll(".action-btn-return")
  returnButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const orderId = this.getAttribute("data-id")
      showReturnOrderModal(orderId)
    })
  })

  // Cancel order
  const cancelButtons = document.querySelectorAll(".action-btn-cancel")
  cancelButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const orderId = this.getAttribute("data-id")
      selectedOrderId = orderId

      const cancelModal = new bootstrap.Modal(document.getElementById("cancelConfirmationModal"))
      cancelModal.show()
    })
  })

  // Edit buttons
  const editButtons = document.querySelectorAll(".action-btn-edit")
  editButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const orderId = this.getAttribute("data-id")
      showEditOrderModal(orderId)
    })
  })

  // Update status buttons
  const updateStatusButtons = document.querySelectorAll(".update-status")
  updateStatusButtons.forEach((button) => {
    button.addEventListener("click", function (e) {
      e.preventDefault()
      const status = this.getAttribute("data-status")
      showUpdateStatusModal(selectedOrderId, status)
    })
  })

  // Verify all items checkbox
  const verifyAllCheckbox = document.getElementById("verify-all-items")
  if (verifyAllCheckbox) {
    verifyAllCheckbox.addEventListener("change", function () {
      const completeButton = document.getElementById("confirm-complete-btn")
      if (completeButton) {
        completeButton.disabled = !this.checked
      }

      // Check/uncheck all item verification checkboxes
      const itemCheckboxes = document.querySelectorAll(".item-verify-checkbox")
      itemCheckboxes.forEach((checkbox) => {
        checkbox.checked = this.checked
      })
    })
  }

  // Reorder
  const reorderButtons = document.querySelectorAll('.action-btn-reorder')
  reorderButtons.forEach((button) => {
    button.addEventListener('click', function () {
      reorderOrderId = this.getAttribute('data-id')
      showModal('reorderConfirmationModal')
    })
  })

  // Confirm complete button
  const confirmCompleteBtn = document.getElementById("confirm-complete-btn")
  if (confirmCompleteBtn) {
    confirmCompleteBtn.addEventListener("click", completeOrder)
  }

  // Confirm return button
  const confirmReturnBtn = document.getElementById("confirm-return-btn")
  if (confirmReturnBtn) {
    confirmReturnBtn.addEventListener("click", submitReturnRequest)
  }
}

// Show complete order modal
function showCompleteOrderModal(orderId) {
  // Set selected order ID
  selectedOrderId = orderId

  // Find order in allOrders
  const order = allOrders.find((o) => o.order_id == orderId)

  if (!order) {
    showResponseMessage("danger", "Order not found")
    return
  }

  // Set order details in modal
  document.getElementById("complete-order-id").value = orderId
  document.getElementById("complete-order-number").textContent = order.po_number || order.order_id
  document.getElementById("complete-order-date").textContent = new Date(order.order_date).toLocaleDateString()
  document.getElementById("complete-order-status").innerHTML =
    `<span class="status-badge status-${order.status}">${formatStatus(order.status)}</span>`
  document.getElementById("complete-retailer-name").textContent = order.retailer_name
  document.getElementById("complete-total-amount").textContent = Number.parseFloat(order.total_amount).toFixed(2)

  // Render order items with verification checkboxes
  const orderItemsContainer = document.getElementById("complete-order-items")
  if (orderItemsContainer) {
    let itemsHtml = ""

    if (order.items && order.items.length > 0) {
      order.items.forEach((item, index) => {
        const unitPrice = Number.parseFloat(item.unit_price).toFixed(2)
        const totalPrice = Number.parseFloat(item.total_price || item.unit_price * item.quantity).toFixed(2)

        // Get product name
        const productName = item.product_name || "Unknown Product"

        itemsHtml += `
          <tr>
            <td>${index + 1}</td>
            <td>${productName}</td>
            <td>${item.quantity}</td>
            <td>₱${unitPrice}</td>
            <td>₱${totalPrice}</td>
            <td class="text-center">
              <div class="form-check d-flex justify-content-center">
                <input class="form-check-input item-verify-checkbox" type="checkbox" 
                  data-item-id="${item.item_id}" data-quantity="${item.quantity}">
              </div>
            </td>
          </tr>
        `
      })
    } else {
      itemsHtml = `
        <tr>
          <td colspan="6" class="text-center py-3">No items found for this order</td>
        </tr>
      `
    }

    orderItemsContainer.innerHTML = itemsHtml
  }

  // Reset verify all checkbox
  const verifyAllCheckbox = document.getElementById("verify-all-items")
  if (verifyAllCheckbox) {
    verifyAllCheckbox.checked = false
  }

  // Disable complete button until verification
  const completeButton = document.getElementById("confirm-complete-btn")
  if (completeButton) {
    completeButton.disabled = true
  }

  // Show modal
  const completeOrderModal = new bootstrap.Modal(document.getElementById("completeOrderModal"))
  completeOrderModal.show()
}

// Show return order modal
function showReturnOrderModal(orderId) {
  // Set selected order ID
  selectedOrderId = orderId

  // Find order in allOrders
  const order = allOrders.find((o) => o.order_id == orderId)

  if (!order) {
    showResponseMessage("danger", "Order not found")
    return
  }

  // Set order details in modal
  document.getElementById("return-order-id").value = orderId
  document.getElementById("return-order-number").textContent = order.po_number || order.order_id
  document.getElementById("return-order-date").textContent = new Date(order.order_date).toLocaleDateString()
  document.getElementById("return-retailer-name").textContent = order.retailer_name
  document.getElementById("return-total-amount").textContent = Number.parseFloat(order.total_amount).toFixed(2)

  // Render order items with return quantity inputs
  const orderItemsContainer = document.getElementById("return-order-items")
  if (orderItemsContainer) {
    let itemsHtml = ""

    if (order.items && order.items.length > 0) {
      order.items.forEach((item, index) => {
        // Get product name
        const productName = item.product_name || "Unknown Product"

        itemsHtml += `
          <tr>
            <td>${index + 1}</td>
            <td>${productName}</td>
            <td>${item.quantity}</td>
            <td>
              <input type="number" class="form-control form-control-sm return-qty-input" 
                data-item-id="${item.item_id}" min="0" max="${item.quantity}" value="0">
            </td>
            <td>
              <select class="form-select form-select-sm item-return-reason" data-item-id="${item.item_id}">
                <option value="">Select reason</option>
                <option value="Damaged">Damaged</option>
                <option value="Wrong Item">Wrong Item</option>
                <option value="Quality Issue">Quality Issue</option>
                <option value="Expired">Expired</option>
                <option value="Other">Other</option>
              </select>
            </td>
          </tr>
        `
      })
    } else {
      itemsHtml = `
        <tr>
          <td colspan="5" class="text-center py-3">No items found for this order</td>
        </tr>
      `
    }

    orderItemsContainer.innerHTML = itemsHtml
  }

  // Reset form fields
  document.getElementById("return-reason").value = ""
  document.getElementById("return-details").value = ""

  // Show modal
  const returnOrderModal = new bootstrap.Modal(document.getElementById("returnOrderModal"))
  returnOrderModal.show()
}

// Complete order function
function completeOrder() {
  const orderId = document.getElementById("complete-order-id").value

  // Collect verified items
  const verifiedItems = []
  const itemCheckboxes = document.querySelectorAll(".item-verify-checkbox")

  itemCheckboxes.forEach((checkbox) => {
    if (checkbox.checked) {
      verifiedItems.push({
        item_id: checkbox.getAttribute("data-item-id"),
        quantity: checkbox.getAttribute("data-quantity"),
      })
    }
  })

  if (verifiedItems.length === 0) {
    showResponseMessage("danger", "Please verify at least one item")
    return
  }

  // Create completion data
  const completionData = {
    order_id: orderId,
    verified_items: verifiedItems,
  }

  // Send completion data to server
  fetch("complete_order.php", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(completionData),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok")
      }
      return response.json()
    })
    .then((data) => {
      if (data.success) {
        // Close modal
        const completeOrderModal = bootstrap.Modal.getInstance(document.getElementById("completeOrderModal"))
        completeOrderModal.hide()

        // Show success message
        showResponseMessage("success", data.message || "Order completed successfully")

        // Refresh orders
        fetchOrders()
      } else {
        showResponseMessage("danger", data.message || "Failed to complete order")
      }
    })
    .catch((error) => {
      console.error("Error completing order:", error)
      showResponseMessage("danger", "Error connecting to the server. Please try again.")
    })
}

// Update the function to cancel an order with proper modals and timing
function updateOrderStatusToCancelled(orderId) {
  console.log("Cancelling order:", orderId)

  // Show cancel loading modal
  showModal('cancelLoadingModal')

  fetch("retailer_order_handler.php?action=cancel_order", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      order_id: orderId,
    }),
  })
    .then((res) => res.json())
    .then((data) => {
      console.log("Response data:", data)

      if (data.success) {
        // Close the cancel confirmation modal
        hideModal('cancelConfirmationModal')
        setTimeout(() => {
          hideModal('cancelLoadingModal')
          // Set success message
          document.getElementById("cancel-success-message").textContent = data.message || "Order cancelled successfully"

          // Show cancel success modal after loading modal is hidden
          showModal('cancelSuccessModal')
          setTimeout(() => {
            hideModal('cancelSuccessModal')
            cleanupModals()
            fetchOrders()
          }, 2000)
        }, 2000)
      } else {
        // Hide cancel loading modal immediately on error
        hideModal('cancelLoadingModal')
        showResponseMessage("danger", data.message || "Failed to cancel order.")
      }
    })
    .catch((err) => {
      // Hide cancel loading modal in case of error
      hideModal('cancelLoadingModal')
      console.error("Error:", err)
      showResponseMessage("danger", "Server error while cancelling order.")
    })
}

// Add event listener for the view-orders-btn in the cancel success modal
document.addEventListener("DOMContentLoaded", () => {
  // Existing event listeners...

  const viewOrdersAfterCancelBtn = document.getElementById("view-orders-after-cancel-btn")
  if (viewOrdersAfterCancelBtn) {
    viewOrdersAfterCancelBtn.addEventListener("click", () => {
      // Hide the cancel success modal
      const cancelSuccessModal = bootstrap.Modal.getInstance(document.getElementById("cancelSuccessModal"))
      if (cancelSuccessModal) {
        cancelSuccessModal.hide()
      }

      // Refresh orders
      fetchOrders()
    })
  }
})

// Handle reorder confirmation
function handleReorderConfirmation() {
  if (!reorderOrderId) return
  hideModal('reorderConfirmationModal')
  showModal('reorderLoadingModal')
  fetch('retailer_order_handler.php?action=reorder_cancelled_order', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ order_id: reorderOrderId }),
  })
    .then((res) => res.json())
    .then((data) => {
      setTimeout(() => {
        hideModal('reorderLoadingModal')
        if (data.success) {
          document.getElementById('reorder-success-message').textContent = data.message || 'Your reorder has been placed and is now being processed.'
          showModal('reorderSuccessModal')
          setTimeout(() => {
            hideModal('reorderSuccessModal')
            cleanupModals()
            fetchOrders()
          }, 2000)
        } else {
          showResponseMessage('danger', data.message || 'Failed to reorder.')
        }
      }, 1500)
    })
    .catch((err) => {
      hideModal('reorderLoadingModal')
      showResponseMessage('danger', 'Server error while reordering.')
    })
}
// Event listeners for reorder confirmation and success modals

document.addEventListener('DOMContentLoaded', () => {
  // Confirm reorder button
  const confirmReorderBtn = document.getElementById('confirm-reorder-btn')
  if (confirmReorderBtn) {
    confirmReorderBtn.addEventListener('click', handleReorderConfirmation)
  }
})

// Submit return request function
function submitReturnRequest() {
  const orderId = document.getElementById("return-order-id").value
  const returnReason = document.getElementById("return-reason").value
  const returnDetails = document.getElementById("return-details").value

  if (!returnReason) {
    showResponseMessage("danger", "Please select a return reason")
    return
  }

  // Collect return items
  const returnItems = []
  const qtyInputs = document.querySelectorAll(".return-qty-input")

  let hasItemsToReturn = false

  qtyInputs.forEach((input) => {
    const itemId = input.getAttribute("data-item-id")
    const quantity = Number.parseInt(input.value)

    if (quantity > 0) {
      hasItemsToReturn = true
      const reasonSelect = document.querySelector(`.item-return-reason[data-item-id="${itemId}"]`)
      const reason = reasonSelect ? reasonSelect.value : ""

      returnItems.push({
        item_id: itemId,
        quantity: quantity,
        reason: reason,
      })
    }
  })

  if (!hasItemsToReturn) {
    showResponseMessage("danger", "Please specify at least one item to return")
    return
  }

  // Create return data
  const returnData = {
    order_id: orderId,
    return_reason: returnReason,
    return_details: returnDetails,
    return_items: returnItems,
  }

  // Send return data to server
  fetch("return_order.php", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(returnData),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok")
      }
      return response.json()
    })
    .then((data) => {
      if (data.success) {
        // Close modal
        const returnOrderModal = bootstrap.Modal.getInstance(document.getElementById("returnOrderModal"))
        returnOrderModal.hide()

        // Show success message
        showResponseMessage("success", data.message || "Return request submitted successfully")

        // Refresh orders
        fetchOrders()
      } else {
        showResponseMessage("danger", data.message || "Failed to submit return request")
      }
    })
    .catch((error) => {
      console.error("Error submitting return request:", error)
      showResponseMessage("danger", "Error connecting to the server. Please try again.")
    })
}

// View order details
// Update the viewOrderDetails function to set the currentOrderIsPickup flag
function viewOrderDetails(orderId) {
  // Set selected order ID
  selectedOrderId = orderId

  // Find order in allOrders
  const order = allOrders.find((o) => o.order_id == orderId)

  if (!order) {
    showResponseMessage("danger", "Order not found")
    return
  }

  // Set the pickup flag based on the order's delivery mode
  currentOrderIsPickup = order.delivery_mode === "pickup"

  // Format dates
  const orderDate = new Date(order.order_date).toLocaleDateString()
  const expectedDelivery = order.expected_delivery ? new Date(order.expected_delivery).toLocaleDateString() : "N/A"

  // Format pickup date if available
  const pickupDate = order.pickup_date ? new Date(order.pickup_date).toLocaleDateString() : "N/A"

  // Set order details in modal
  document.getElementById("view-order-number").textContent = order.po_number || order.order_id
  document.getElementById("view-order-date").textContent = orderDate
  document.getElementById("view-order-status").innerHTML =
    `<span class="status-badge status-${order.status}">${formatStatus(order.status)}</span>`

  // Add this code to set the consignment term
  const consignmentTerm = order.consignment_term || 30 // Default to 30 days if not set
  document.getElementById("view-consignment-term").textContent = `${consignmentTerm} days`

  // Set delivery mode information
  const deliveryModeElement = document.getElementById("view-delivery-mode")
  if (deliveryModeElement) {
    if (order.delivery_mode === "pickup") {
      deliveryModeElement.innerHTML = `<span class="badge bg-info">Pickup</span>`

      // Show pickup details
      document.getElementById("view-pickup-details").style.display = "block"
      document.getElementById("view-delivery-details").style.display = "none"

      document.getElementById("view-pickup-location").textContent = order.pickup_location || "Not specified"
      document.getElementById("view-pickup-date").textContent = pickupDate
    } else {
      deliveryModeElement.innerHTML = `<span class="badge bg-success">Delivery</span>`

      // Show delivery details
      document.getElementById("view-pickup-details").style.display = "none"
      document.getElementById("view-delivery-details").style.display = "block"

      document.getElementById("view-expected-delivery").textContent = expectedDelivery
      document.getElementById("view-delivery-address").textContent = order.retailer_address || "Not specified"
    }
  }

  document.getElementById("view-retailer-name").textContent = order.retailer_name
  document.getElementById("view-retailer-email").textContent = order.retailer_email
  document.getElementById("view-retailer-contact").textContent = order.retailer_contact || "N/A"

  // Ensure address is displayed properly
  const addressElement = document.getElementById("view-retailer-address")
  if (addressElement) {
    // Use retailer_address if available, otherwise try to construct it
    let addressValue = "N/A"

    if (order.retailer_address) {
      addressValue = order.retailer_address
    } else if (currentUser) {
      const addressParts = []

      if (currentUser.business_address) {
        addressValue = currentUser.business_address
      } else {
        // Build from individual parts
        if (currentUser.house_number) addressParts.push(currentUser.house_number)
        if (currentUser.address_notes) addressParts.push(currentUser.address_notes)
        if (currentUser.barangay) addressParts.push(currentUser.barangay)
        if (currentUser.city) addressParts.push(currentUser.city)
        if (currentUser.province) addressParts.push(currentUser.province)

        if (addressParts.length > 0) {
          addressValue = addressParts.join(", ")
        }
      }
    }

    addressElement.textContent = addressValue
  }

  document.getElementById("view-notes").textContent = order.notes || "No notes available"

  // Format amounts
  document.getElementById("view-subtotal").textContent = Number.parseFloat(order.subtotal).toFixed(2)
  document.getElementById("view-discount").textContent = Number.parseFloat(order.discount || 0).toFixed(2)
  document.getElementById("view-total-amount").textContent = Number.parseFloat(order.total_amount).toFixed(2)

  // Calculate total items
  const totalItems = order.items ? order.items.reduce((total, item) => total + Number.parseInt(item.quantity), 0) : 0

  // Add total items count to the modal title
  const modalTitle = document.getElementById("viewOrderModalLabel")
  if (modalTitle) {
    modalTitle.innerHTML = `<i class="bi bi-info-circle me-2"></i>Order Details (${totalItems} items)`
  }

  // Render order items
  const orderItemsContainer = document.getElementById("view-order-items")
  if (orderItemsContainer) {
    let itemsHtml = ""

    if (order.items && order.items.length > 0) {
      order.items.forEach((item) => {
        const unitPrice = Number.parseFloat(item.unit_price).toFixed(2)
        const totalPrice = Number.parseFloat(item.total_price || item.unit_price * item.quantity).toFixed(2)

        // Get product name from allProducts if available, otherwise use the one from the item
        let productName = "Unknown Product"
        if (item.product_id && allProducts && allProducts.length > 0) {
          const product = allProducts.find((p) => p.product_id == item.product_id)
          if (product) {
            productName = product.product_name
          }
        } else if (item.product_name) {
          productName = item.product_name
        }

        itemsHtml += `
          <tr>
            <td>${productName}</td>
            <td>₱${unitPrice}</td>
            <td>${item.quantity}</td>
            <td>₱${totalPrice}</td>
          </tr>
        `
      })
    } else {
      itemsHtml = `
        <tr>
          <td colspan="4" class="text-center py-3">No items found for this order</td>
        </tr>
      `
    }

    orderItemsContainer.innerHTML = itemsHtml
  }

  // Render status history
  const statusTimelineContainer = document.getElementById("status-timeline")
  if (statusTimelineContainer) {
    let timelineHtml = '<div class="status-timeline">'

    if (order.status_history && order.status_history.length > 0) {
      order.status_history.forEach((history) => {
        const statusDate = new Date(history.created_at).toLocaleString()

        timelineHtml += `
          <div class="status-timeline-item">
            <div class="status-timeline-dot"></div>
            <div class="status-timeline-content">
              <div class="status-timeline-title">${formatStatus(history.status)}</div>
              <div class="status-timeline-date">${statusDate}</div>
              ${history.notes ? `<div class="status-timeline-notes">${history.notes}</div>` : ""}
            </div>
          </div>
        `
      })
    } else {
      timelineHtml += `
        <div class="status-timeline-item">
          <div class="status-timeline-dot"></div>
          <div class="status-timeline-content">
            <div class="status-timeline-title">${formatStatus(order.status)}</div>
            <div class="status-timeline-date">${new Date(order.created_at || Date.now()).toLocaleString()}</div>
            <div class="status-timeline-notes">Order created</div>
          </div>
        </div>
      `
    }

    timelineHtml += "</div>"
    statusTimelineContainer.innerHTML = timelineHtml
  }

  // Determine if edit button should be enabled
  const canEdit =
    order.status !== "shipped"
      ? `<button type="button" class="btn btn-secondary edit-order-btn" data-id="${order.order_id}">
         <i class="bi bi-pencil me-1"></i> Edit
       </button>`
      : ""

  // Update modal footer to include edit button if order is not shipped
  const modalFooter = document.querySelector("#viewOrderModal .modal-footer")
  if (modalFooter) {
    modalFooter.innerHTML = `
      <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
        <i class="bi bi-x-lg me-1"></i> Close
      </button>
    
    `
  }

  // Show modal
  if (typeof bootstrap !== "undefined") {
    const viewOrderModal = new bootstrap.Modal(document.getElementById("viewOrderModal"))
    viewOrderModal.show()
  }
}

// Show update status modal
function showUpdateStatusModal(orderId, status) {
  document.getElementById("update-order-id").value = orderId
  document.getElementById("update-status").value = status
  document.getElementById("status-notes").value = ""

  // Show modal
  const updateStatusModal = new bootstrap.Modal(document.getElementById("updateStatusModal"))
  updateStatusModal.show()
}

// Update order status
function updateOrderStatus() {
  const orderId = document.getElementById("update-order-id").value
  const status = document.getElementById("update-status").value
  const notes = document.getElementById("status-notes").value

  // Create status update data
  const statusData = {
    order_id: orderId,
    status: status,
    notes: notes,
  }

  // Send status update to server
  fetch("retailer_order_handler.php?action=update_status", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(statusData),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok")
      }
      return response.json()
    })
    .then((data) => {
      if (data.success) {
        // Close modal
        if (typeof bootstrap !== "undefined") {
          const updateStatusModal = bootstrap.Modal.getInstance(document.getElementById("updateStatusModal"))
          updateStatusModal.hide()
        }

        // Show success message
        showResponseMessage("success", data.message || "Order status updated successfully")

        // Refresh orders
        fetchOrders()
      } else {
        showResponseMessage("danger", data.message || "Failed to update order status")
      }
    })
    .catch((error) => {
      console.error("Error updating order status:", error)
      showResponseMessage("danger", "Error connecting to the server. Please try again.")
    })
}

// Show delete confirmation modal
function showDeleteConfirmation(orderId) {
  document.getElementById("delete-order-id").value = orderId

  // Show delete confirmation modal
  if (typeof bootstrap !== "undefined") {
    const deleteOrderModal = new bootstrap.Modal(document.getElementById("deleteOrderModal"))
    deleteOrderModal.show()
  }
}

// Refactored deleteOrder
function deleteOrder() {
  const orderId = document.getElementById('delete-order-id').value
  const deleteData = { order_id: orderId }
  showModal('deleteLoadingModal')
  fetch('retailer_order_handler.php?action=delete_order', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(deleteData),
  })
    .then((response) => {
      if (!response.ok) throw new Error('Network response was not ok')
      return response.json()
    })
    .then((data) => {
      if (data.success) {
        hideModal('deleteOrderModal')
        setTimeout(() => {
          hideModal('deleteLoadingModal')
          document.getElementById('delete-success-message').textContent = data.message || 'Order deleted successfully'
          showModal('deleteSuccessModal')
          setTimeout(() => {
            hideModal('deleteSuccessModal')
            cleanupModals()
            fetchOrders()
          }, 2000)
        }, 2000)
      } else {
        hideModal('deleteLoadingModal')
        showResponseMessage('danger', data.message || 'Failed to delete order')
      }
    })
    .catch((error) => {
      hideModal('deleteLoadingModal')
      console.error('Error deleting order:', error)
      showResponseMessage('danger', 'Error connecting to the server. Please try again.')
    })
}

// Update order stats
function updateOrderStats(orders) {
  // Count total orders
  document.getElementById("total-orders").textContent = orders.length

  // Count pending orders (status = order or processing)
  const pendingOrders = orders.filter((order) => order.status === "order" || order.status === "processing").length
  document.getElementById("pending-orders").textContent = pendingOrders

  // Count received orders (status = delivered)
  const receivedOrders = orders.filter((order) => order.status === "delivered").length
  document.getElementById("received-orders").textContent = receivedOrders

  // Calculate total spent
  const totalSpent = orders.reduce((total, order) => {
    return total + Number.parseFloat(order.total_amount)
  }, 0)
  document.getElementById("total-spent").textContent = `₱${totalSpent.toFixed(2)}`
}

// Update the getStatusBgClass function to include background colors for completed and returned
function getStatusBgClass(status) {
  switch (status.toLowerCase()) {
    case "pending":
    case "order":
    case "order placed":
      return "bg-secondary text-white"
    case "processing":
      return "bg-info text-dark"
    case "shipped":
      return "bg-primary text-white"
    case "delivered":
    case "picked up":
      return "bg-primary text-white"
    case "completed":
      return "bg-success text-white"
    case "cancelled":
      return "bg-danger text-white"
    case "return_requested":
      return "bg-warning text-dark"
    case "returned":
      return "bg-danger text-white"
    case "confirmed":
      return "bg-warning text-dark"
    case "ready-to-pickup":
      return "bg-info text-white"
    default:
      return "bg-light text-dark"
  }
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

// Debounce function for search input
function debounce(func, wait) {
  let timeout
  return function () {
    const args = arguments
    clearTimeout(timeout)
    timeout = setTimeout(() => {
      func.apply(this, args)
    }, wait)
  }
}

// Show order confirmation modal
function showOrderConfirmation(isEdit = false) {
  // Get form data from the appropriate form
  const prefix = isEdit ? "edit-" : ""
  let retailerName, retailerEmail, retailerContact
  if (isEdit) {
    retailerName = document.getElementById(`${prefix}retailer-name`).value
    retailerEmail = document.getElementById(`${prefix}retailer-email`).value
    retailerContact = document.getElementById(`${prefix}retailer-contact`).value || "N/A"
  } else {
    // Use currentUser for customer info
    if (currentUser) {
      if (currentUser.first_name && currentUser.last_name) {
        retailerName = `${currentUser.first_name} ${currentUser.last_name}`
      } else if (currentUser.full_name) {
        retailerName = currentUser.full_name
      } else if (currentUser.business_name) {
        retailerName = currentUser.business_name
      } else {
        retailerName = "N/A"
      }
      retailerEmail = currentUser.email || "N/A"
      retailerContact = currentUser.phone || "N/A"
    } else {
      retailerName = "N/A"
      retailerEmail = "N/A"
      retailerContact = "N/A"
    }
  }
  const orderDate = document.getElementById(`${prefix}order-date`).value
  const consignmentTerm = document.getElementById(`${prefix}consignment-term`).value
  const notes = document.getElementById(`${prefix}order-notes`).value || "No notes provided."
  const subtotal = document.getElementById(`${prefix}subtotal`).textContent
  const discount = document.getElementById(`${prefix}discount`).value || "0.00"
  const total = document.getElementById(`${prefix}total-amount`).textContent

  // Get delivery mode
  const deliveryModeSelector = isEdit
    ? 'input[name="edit_delivery_mode"]:checked'
    : 'input[name="delivery_mode"]:checked'
  const deliveryMode = document.querySelector(deliveryModeSelector).value

  // Populate confirmation modal
  document.getElementById("confirm-retailer-name").textContent = retailerName
  document.getElementById("confirm-retailer-email").textContent = retailerEmail
  document.getElementById("confirm-retailer-contact").textContent = retailerContact
  document.getElementById("confirm-order-date").textContent = formatDate(orderDate)
  document.getElementById("confirm-consignment-term").textContent = `${consignmentTerm} days`
  document.getElementById("confirm-notes").textContent = notes
  document.getElementById("confirm-subtotal").textContent = subtotal
  document.getElementById("confirm-discount").textContent = discount
  document.getElementById("confirm-total").textContent = total

  // Set delivery mode
  document.getElementById("confirm-delivery-mode").textContent = deliveryMode === "delivery" ? "Delivery" : "Pickup"

  // Collect order items
  const items = collectOrderItems(isEdit)
  const orderItemsHtml = items
    .map(
      (item) => `
    <tr>
      <td>${item.product_name}</td>
      <td class="text-center">${item.quantity}</td>
      <td class="text-end">₱${Number.parseFloat(item.unit_price).toFixed(2)}</td>
      <td class="text-end">₱${Number.parseFloat(item.quantity * item.unit_price).toFixed(2)}</td>
    </tr>
  `,
    )
    .join("")

  document.getElementById("confirm-order-items").innerHTML =
    orderItemsHtml || '<tr><td colspan="4" class="text-center">No items added</td></tr>'

  // Show confirmation modal
  const confirmationModal = new bootstrap.Modal(document.getElementById("orderConfirmationModal"))
  confirmationModal.show()
}

// Format date for display
function formatDate(dateString) {
  const options = { year: "numeric", month: "long", day: "numeric" }
  return new Date(dateString).toLocaleDateString(undefined, options)
}

// Declare missing variables
let currentFilter = ""
const bootstrap = window.bootstrap

function showOrderDetailsModal(orderId) {
  viewOrderDetails(orderId)
}

function showEditOrderModal(orderId) {
  // Find the order in allOrders
  const order = allOrders.find((o) => o.order_id == orderId)

  if (!order) {
    showResponseMessage("danger", "Order not found")
    return
  }

  // Set the order ID in the edit form
  document.getElementById("edit-order-id").value = order.order_id

  // Populate the retailer information
  document.getElementById("edit-retailer-name").value = order.retailer_name
  document.getElementById("edit-retailer-email").value = order.retailer_email
  document.getElementById("edit-retailer-contact").value = order.retailer_contact
  document.getElementById("edit-retailer-address").value = order.retailer_address

  // Populate the order date
  document.getElementById("edit-order-date").value = order.order_date

  // Populate the consignment term
  document.getElementById("edit-consignment-term").value = order.consignment_term

  // Populate the notes
  document.getElementById("edit-order-notes").value = order.notes

  // Populate the discount
  document.getElementById("edit-discount").value = order.discount

  // Populate delivery mode
  const deliveryModeRadios = document.querySelectorAll('input[name="edit_delivery_mode"]')
  deliveryModeRadios.forEach((radio) => {
    radio.checked = radio.value === order.delivery_mode
  })

  // Show/hide delivery fields
  toggleEditDeliveryFields(order.delivery_mode)

  // Populate delivery/pickup specific fields
  if (order.delivery_mode === "delivery") {
    document.getElementById("edit-expected-delivery").value = order.expected_delivery
  } else if (order.delivery_mode === "pickup") {
    document.getElementById("edit-pickup-location").value = order.pickup_location
    document.getElementById("edit-pickup-date").value = order.pickup_date
  }

  // Initialize the edit order items table
  initEditOrderItemsTable(order.items)

  // Store the original order status
  originalOrderStatus = order.status

  // Show the edit order modal
  const editOrderModal = new bootstrap.Modal(document.getElementById("editOrderModal"))
  editOrderModal.show()
}

// Initialize edit order items table
function initEditOrderItemsTable(items) {
  const orderItemsBody = document.getElementById("edit-order-items-body")
  if (!orderItemsBody) return

  // Clear existing items
  orderItemsBody.innerHTML = ""

  if (items && items.length > 0) {
    items.forEach((item) => {
      addExistingEditOrderItemRow(item)
    })
  } else {
    // Show no items row if it exists
    const noItemsRow = document.getElementById("edit-no-items-row")
    if (noItemsRow) {
      noItemsRow.style.display = "table-row"
    }
  }

  // Update order total
  updateEditOrderTotal()
}

// Add an existing order item row to the edit order modal
function addExistingEditOrderItemRow(item) {
  const orderItemsBody = document.getElementById("edit-order-items-body")
  if (!orderItemsBody) return

  // Hide no items row if it exists
  const noItemsRow = document.getElementById("edit-no-items-row")
  if (noItemsRow) {
    noItemsRow.style.display = "none"
  }

  // Create new row
  const row = document.createElement("tr")
  row.className = "order-item-row"

  // Create row content
  row.innerHTML = `
    <td>
      <select class="form-select product-select">
        <option value="">Select Product</option>
        ${allProducts.map((product) => `<option value="${product.product_id}" data-price="${product.retail_price}" ${product.product_id == item.product_id ? "selected" : ""}>${product.product_name}</option>`).join("")}
      </select>
    </td>
    <td>
      <div class="input-group">
        <button class="btn btn-outline-secondary decrease-qty" type="button">
          <i class="bi bi-dash"></i>
        </button>
        <input type="text" class="form-control text-center qty-input" value="${item.quantity}" min="1">
        <button class="btn btn-outline-secondary increase-qty" type="button">
          <i class="bi bi-plus"></i>
        </button>
      </div>
    </td>
    <td>
      <div class="input-group">
        <input type="text" class="form-control text-end price-input" value="${item.unit_price}" readonly>
        <button class="btn btn-outline-secondary price-edit" type="button">
          <i class="bi bi-pencil"></i>
        </button>
      </div>
    </td>
    <td>
      <div class="input-group">
        <input type="text" class="form-control text-end total-input" value="${item.unit_price * item.quantity}" readonly>
        <button class="btn btn-outline-secondary" type="button" disabled>
          <i class="bi bi-pencil"></i>
        </button>
      </div>
    </td>
    <td class="text-center">
      <button type="button" class="btn btn-outline-danger btn-sm delete-item">
        <i class="bi bi-trash"></i>
      </button>
    </td>
  `

  // Add row to table
  orderItemsBody.appendChild(row)

  // Set up event listeners for the new row
  setupRowEventListeners(row)
}

// Utility to get all selected product IDs in the order items table
function getSelectedProductIds() {
  const selects = document.querySelectorAll('#order-items-body .product-select')
  return Array.from(selects)
    .map(sel => sel.value + '') // ensure string
    .filter(val => val !== '')
}

// Refresh all product dropdowns to hide already-selected products
function refreshProductDropdowns() {
  const selects = document.querySelectorAll('#order-items-body .product-select')
  // Gather selected product IDs, but for each select, exclude its own value
  selects.forEach(select => {
    const currentValue = select.value + ''
    // Gather all selected except this one
    const selectedIds = Array.from(selects)
      .filter(s => s !== select)
      .map(s => s.value + '')
      .filter(val => val !== '')
    // Remove all except the placeholder
    select.innerHTML = '<option value="">Select Product</option>'
    allProducts.forEach(product => {
      // Only show if not selected elsewhere, or if it's the current value
      if (!selectedIds.includes(product.product_id + '') || product.product_id + '' === currentValue) {
        const option = document.createElement('option')
        option.value = product.product_id
        option.textContent = product.product_name
        option.setAttribute('data-price', product.retail_price)
        if (product.product_id + '' === currentValue) option.selected = true
        select.appendChild(option)
      }
    })
  })
}

// Patch addOrderItemRow to refresh dropdowns after adding
const _origAddOrderItemRow = addOrderItemRow
addOrderItemRow = function() {
  _origAddOrderItemRow.apply(this, arguments)
  refreshProductDropdowns()
}

// Patch setupRowEventListeners to refresh dropdowns on product change
const _origSetupRowEventListeners = setupRowEventListeners
setupRowEventListeners = function(row) {
  _origSetupRowEventListeners.apply(this, arguments)
  const productSelect = row.querySelector('.product-select')
  if (productSelect) {
    productSelect.addEventListener('change', function() {
      refreshProductDropdowns()
    })
  }
  // Also refresh when deleting a row
  const deleteBtn = row.querySelector('.delete-item')
  if (deleteBtn) {
    deleteBtn.addEventListener('click', function() {
      setTimeout(refreshProductDropdowns, 10)
    })
  }
}