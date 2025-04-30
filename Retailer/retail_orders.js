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
const originalOrderStatus = ""
const selectedProduct = null
const editSelectedProduct = null
let currentUser = null

// Add a variable to track if the current order is in pickup mode
let currentOrderIsPickup = false

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
    fetchOrders()
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

// Initialize date pickers
function initDatePickers() {
  // Set today's date as default for order date
  const orderDateInput = document.getElementById("order-date")
  if (orderDateInput) {
    orderDateInput.valueAsDate = new Date()
  }

  // Set date 7 days from today as default for expected delivery
  const expectedDeliveryInput = document.getElementById("expected-delivery")
  if (expectedDeliveryInput) {
    const deliveryDate = new Date()
    deliveryDate.setDate(deliveryDate.getDate() + 7)
    expectedDeliveryInput.valueAsDate = deliveryDate
  }

  // Initialize flatpickr for date inputs if needed
  if (typeof flatpickr !== "undefined") {
    flatpickr(".datepicker", {
      dateFormat: "Y-m-d",
      allowInput: true,
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

  // Review order button in create order modal
  const reviewOrderBtn = document.getElementById("review-order-btn")
  if (reviewOrderBtn) {
    console.log("Review order button found")
    reviewOrderBtn.addEventListener("click", () => {
      console.log("Review order button clicked")
      // Validate form before showing confirmation
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
      })
    })
  }

  // Delivery mode change in edit order modal
  const editDeliveryModeRadios = document.querySelectorAll('input[name="edit_delivery_mode"]')
  if (editDeliveryModeRadios.length > 0) {
    editDeliveryModeRadios.forEach((radio) => {
      radio.addEventListener("change", function () {
        toggleEditDeliveryFields(this.value)
      })
    })
  }
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
        <input type="text" class="form-control text-center qty-input" value="1" min="1">
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
        <input type="text" class="form-control text-center qty-input" value="1" min="1">
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

  // Price edit button
  const priceEditBtn = row.querySelector(".price-edit")
  if (priceEditBtn) {
    priceEditBtn.addEventListener("click", () => {
      const priceInput = row.querySelector(".price-input")
      if (priceInput) {
        // Toggle readonly attribute
        priceInput.readOnly = !priceInput.readOnly

        if (!priceInput.readOnly) {
          // Focus the input if it's now editable
          priceInput.focus()
          priceInput.select()
        } else {
          // Update row total when done editing
          updateRowTotal(row)

          // Update order total
          const isEditModal = row.closest("#edit-order-items-body") !== null
          if (isEditModal) {
            updateEditOrderTotal()
          } else {
            updateOrderTotal()
          }
        }
      }
    })
  }

  // Price input change
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
      deliveryDate.setDate(deliveryDate.getDate() + 7)
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

// Find the saveOrder function and update it to properly close all modals
// Replace the existing saveOrder function with this updated version that properly closes all modals

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
      if (data.success) {
        // First, properly close all modals and remove backdrops
        closeAllModals()

        // Remove any lingering modal backdrops
        const modalBackdrops = document.querySelectorAll(".modal-backdrop")
        modalBackdrops.forEach((backdrop) => {
          backdrop.remove()
        })

        // Remove modal-open class from body
        document.body.classList.remove("modal-open")
        document.body.style.overflow = ""
        document.body.style.paddingRight = ""

        // Show success message
        showResponseMessage("success", data.message || "Order created successfully")

        // Refresh orders
        fetchOrders()
      } else {
        showResponseMessage("danger", data.message || "Failed to create order")
      }
    })
    .catch((error) => {
      console.error("Error creating order:", error)
      showResponseMessage("danger", "Error connecting to the server. Please try again.")
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

// Update order
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

  // Send order data to server
  fetch("save_retailer_order.php", {
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
      if (data.success) {
        // Close modal
        if (typeof bootstrap !== "undefined") {
          const editOrderModal = bootstrap.Modal.getInstance(document.getElementById("editOrderModal"))
          editOrderModal.hide()
        }

        // Show success message
        showResponseMessage("success", data.message || "Order updated successfully")

        // Refresh orders
        fetchOrders()
      } else {
        showResponseMessage("danger", data.message || "Failed to update order")
      }
    })
    .catch((error) => {
      console.error("Error updating order:", error)
      showResponseMessage("danger", "Error connecting to the server. Please try again.")
    })
}

// Validate order form
function validateOrderForm(isEdit = false) {
  const prefix = isEdit ? "edit-" : ""

  // Required fields
  const retailerName = document.getElementById(`${prefix}retailer-name`).value
  const retailerEmail = document.getElementById(`${prefix}retailer-email`).value
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

  // Special case for "delivered" status when the order is in pickup mode
  if (status === "delivered" && currentOrderIsPickup) {
    return "Picked Up"
  }

  // Convert to title case and replace underscores with spaces
  return status.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase())
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
    selectedOrderId = this.getAttribute("data-id")

    const cancelModal = new bootstrap.Modal(document.getElementById("cancelConfirmationModal"))
    cancelModal.show()
  })
}

// Set up action buttons
function setupActionButtons() {
  // View buttons
  const viewButtons = document.querySelectorAll(".action-btn-view")
  viewButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const orderId = this.getAttribute("data-id")
      viewOrderDetails(orderId)
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

  // Delete buttons
  const deleteButtons = document.querySelectorAll(".action-btn-delete")
  deleteButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const orderId = this.getAttribute("data-id")
      showDeleteConfirmation(orderId)
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

  // Complete order buttons
  const completeButtons = document.querySelectorAll(".action-btn-complete")
  completeButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const orderId = this.getAttribute("data-id")
      showCompleteOrderModal(orderId)
    })
  })

  // Return order buttons
  const returnButtons = document.querySelectorAll(".action-btn-return")
  returnButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const orderId = this.getAttribute("data-id")
      showReturnOrderModal(orderId)
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

  // In retail_orders.js, add this code to the setupActionButtons function:
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

  // Reorder
  const reorderButtons = document.querySelectorAll(".action-btn-reorder")
  reorderButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const orderId = this.getAttribute("data-id")
      reorderCancelledOrder(orderId)
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

function updateOrderStatusToCancelled(orderId) {
  fetch("retailer_order_handler.php", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      action: "cancel_order",
      order_id: orderId,
    }),
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.success) {
        showResponseMessage("success", "Order cancelled successfully.")
        fetchOrders()
      } else {
        showResponseMessage("danger", data.message || "Failed to cancel order.")
      }
    })
    .catch((err) => {
      console.error(err)
      showResponseMessage("danger", "Server error while cancelling order.")
    })
}

function reorderCancelledOrder(orderId) {
  fetch("retailer_order_handler.php?action=reorder_cancelled_order", {
    // Add ?action=reorder_cancelled_order here
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
      if (data.success) {
        showResponseMessage("success", "Order has been placed again.")
        fetchOrders()
      } else {
        showResponseMessage("danger", data.message || "Failed to reorder.")
      }
    })
    .catch((err) => {
      console.error(err)
      showResponseMessage("danger", "Server error while reordering.")
    })
}

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

// Delete order
function deleteOrder() {
  const orderId = document.getElementById("delete-order-id").value

  // Create delete data
  const deleteData = {
    order_id: orderId,
  }

  // Send delete request to server
  fetch("delete_order.php", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(deleteData),
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
          const deleteOrderModal = bootstrap.Modal.getInstance(document.getElementById("deleteOrderModal"))
          deleteOrderModal.hide()
        }

        // Show success message
        showResponseMessage("success", data.message || "Order deleted successfully")

        // Refresh orders
        fetchOrders()
      } else {
        showResponseMessage("danger", data.message || "Failed to delete order: " + data.message)
      }
    })
    .catch((error) => {
      console.error("Error deleting order:", error)
      showResponseMessage("danger", "Error connecting to the server. Please try again.")
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

// Update the formatStatus function to properly handle completed and returned statuses
function formatStatus(status) {
  if (!status) return "Unknown";

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
      return status.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
  }
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
  const retailerName = document.getElementById(`${prefix}retailer-name`).value
  const retailerEmail = document.getElementById(`${prefix}retailer-email`).value
  const retailerContact = document.getElementById(`${prefix}retailer-contact`).value || "N/A"
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

// Add these event listeners to your setupEventListeners function in retail_orders.js

// Review order button in create order modal
const reviewOrderBtn = document.getElementById("review-order-btn")
if (reviewOrderBtn) {
  reviewOrderBtn.addEventListener("click", () => {
    // Validate form before showing confirmation
    if (validateOrderForm()) {
      showOrderConfirmation(false)
    }
  })
}

// Review changes button in edit order modal
const reviewEditOrderBtn = document.getElementById("review-edit-order-btn")
if (reviewEditOrderBtn) {
  reviewEditOrderBtn.addEventListener("click", () => {
    // Validate form before showing confirmation
    if (validateOrderForm(true)) {
      showOrderConfirmation(true)
    }
  })
}

// Back to edit button in confirmation modal
const backToEditBtn = document.getElementById("back-to-edit-btn")
if (backToEditBtn) {
  backToEditBtn.addEventListener("click", () => {
    // Hide confirmation modal
    const confirmationModal = bootstrap.Modal.getInstance(document.getElementById("orderConfirmationModal"))
    confirmationModal.hide()
  })
}

// Save order button in confirmation modal
const saveOrderBtn = document.getElementById("save-order-btn")
if (saveOrderBtn) {
  saveOrderBtn.addEventListener("click", () => {
    // Submit the form based on whether we're editing or creating
    const isEditModal = document.getElementById("edit-order-id").value !== ""
    if (isEditModal) {
      updateOrder()
    } else {
      saveOrder()
    }

    // Hide confirmation modal
    const confirmationModal = bootstrap.Modal.getInstance(document.getElementById("orderConfirmationModal"))
    confirmationModal.hide()
  })
}

// Modal Enhancements for Retailer Order Management

document.addEventListener("DOMContentLoaded", () => {
  // Apply enhanced styles to all modals
  enhanceModals()

  // Set up event listeners for modal events
  setupModalEventListeners()
})

// Function to enhance all modals with modern styling and animations
function enhanceModals() {
  // Add animation classes to modals
  const modals = document.querySelectorAll(".modal")
  modals.forEach((modal) => {
    // Add fade-in animation when modal opens
    modal.addEventListener("show.bs.modal", function () {
      setTimeout(() => {
        this.classList.add("animate-in")
      }, 50)
    })

    // Remove animation class when modal closes
    modal.addEventListener("hide.bs.modal", function () {
      this.classList.remove("animate-in")
    })
  })

  // Enhance status badges
  enhanceStatusBadges()

  // Enhance timeline visualization
  enhanceTimeline()

  // Add hover effects to action buttons
  enhanceActionButtons()

  // Improve form controls
  enhanceFormControls()
}

// Function to enhance status badges with appropriate colors
function enhanceStatusBadges() {
  const statusBadges = document.querySelectorAll(".status-badge")
  statusBadges.forEach((badge) => {
    // Add pulse animation to "processing" status
    if (badge.classList.contains("status-processing")) {
      badge.innerHTML = `<span class="pulse-dot"></span>${badge.textContent}`
    }

    // Add checkmark icon to "delivered" status
    if (badge.classList.contains("status-delivered")) {
      badge.innerHTML = `<i class="bi bi-check-circle-fill me-1"></i>${badge.textContent}`
    }

    // Add warning icon to "cancelled" status
    if (badge.classList.contains("status-cancelled")) {
      badge.innerHTML = `<i class="bi bi-x-circle-fill me-1"></i>${badge.textContent}`
    }
  })
}

// Function to enhance timeline visualization
function enhanceTimeline() {
  const timeline = document.querySelector(".status-timeline")
  if (!timeline) return

  const timelineItems = timeline.querySelectorAll(".status-timeline-item")

  // Add animation delay to each timeline item
  timelineItems.forEach((item, index) => {
    item.style.animationDelay = `${index * 0.15}s`
    item.classList.add("fade-in-up")

    // Add appropriate status color to timeline dots
    const dot = item.querySelector(".status-timeline-dot")
    if (dot) {
      const statusText = item.querySelector(".status-timeline-title").textContent.toLowerCase()

      if (statusText.includes("delivered")) {
        dot.style.borderColor = "#198754"
        dot.style.backgroundColor = "#d1e7dd"
      } else if (statusText.includes("shipped")) {
        dot.style.borderColor = "#0d6efd"
        dot.style.backgroundColor = "#cfe2ff"
      } else if (statusText.includes("processing")) {
        dot.style.borderColor = "#ffc107"
        dot.style.backgroundColor = "#fff3cd"
      } else if (statusText.includes("cancelled")) {
        dot.style.borderColor = "#dc3545"
        dot.style.backgroundColor = "#f8d7da"
      } else {
        dot.style.borderColor = "#f5cc39"
        dot.backgroundColor = "#fff8dd"
      }
    }
  })
}

// Function to enhance action buttons
function enhanceActionButtons() {
  const actionButtons = document.querySelectorAll(".action-btn")
  actionButtons.forEach((button) => {
    // Add tooltip if not already present
    if (!button.getAttribute("data-bs-toggle")) {
      const title = button.getAttribute("title")
      if (title) {
        button.setAttribute("data-bs-toggle", "tooltip")
        button.setAttribute("data-bs-placement", "top")
      }
    }

    // Initialize tooltips
    if (typeof bootstrap !== "undefined") {
      const tooltip = new bootstrap.Tooltip(button)
    }
  })
}

// Function to enhance form controls
function enhanceFormControls() {
  // Add floating labels to form controls
  const formControls = document.querySelectorAll(".modal .form-control, .modal .form-select")
  formControls.forEach((control) => {
    control.addEventListener("focus", function () {
      this.parentElement.classList.add("focused")
    })

    control.addEventListener("blur", function () {
      this.parentElement.classList.remove("focused")
    })

    // Check if control already has a value
    if (control.value) {
      control.parentElement.classList.add("has-value")
    }

    control.addEventListener("input", function () {
      if (this.value) {
        this.parentElement.classList.add("has-value")
      } else {
        this.parentElement.classList.remove("has-value")
      }
    })
  })
}

// Function to set up event listeners for modal events
function setupModalEventListeners() {
  // View Order Modal
  const viewOrderModal = document.getElementById("viewOrderModal")
  if (viewOrderModal) {
    viewOrderModal.addEventListener("show.bs.modal", () => {
      // Enhance the status timeline when the modal is shown
      setTimeout(() => {
        enhanceTimeline()
      }, 300)
    })
  }

  // Order Confirmation Modal
  const orderConfirmationModal = document.getElementById("orderConfirmationModal")
  if (orderConfirmationModal) {
    orderConfirmationModal.addEventListener("show.bs.modal", function () {
      // Add animation to order items
      const orderItems = this.querySelectorAll("#confirm-order-items tr")
      orderItems.forEach((item, index) => {
        item.style.animationDelay = `${index * 0.1}s`
        item.classList.add("fade-in-up")
      })
    })
  }

  // Delete Order Modal
  const deleteOrderModal = document.getElementById("deleteOrderModal")
  if (deleteOrderModal) {
    deleteOrderModal.addEventListener("show.bs.modal", function () {
      // Add shake animation to warning icon
      const warningIcon = this.querySelector(".bi-exclamation-triangle-fill")
      if (warningIcon) {
        warningIcon.classList.add("shake-animation")
      }
    })
  }

  // Update Status Modal
  const updateStatusModal = document.getElementById("updateStatusModal")
  if (updateStatusModal) {
    updateStatusModal.addEventListener("show.bs.modal", function () {
      // Highlight the current status
      const currentStatus = document.getElementById("update-status").value
      const statusOptions = this.querySelectorAll(".status-option")

      statusOptions.forEach((option) => {
        if (option.getAttribute("data-status") === currentStatus) {
          option.classList.add("active")
        } else {
          option.classList.remove("active")
        }
      })
    })
  }
}

// Function to format currency
function formatCurrency(amount) {
  return (
    "₱" +
    Number.parseFloat(amount)
      .toFixed(2)
      .replace(/\d(?=(\d{3})+\.)/g, "$&,")
  )
}

// Function to format date
function formatDate(dateString) {
  const options = { year: "numeric", month: "long", day: "numeric" }
  return new Date(dateString).toLocaleDateString(undefined, options)
}

// Add these functions to the window object to make them available globally
window.enhanceModals = enhanceModals
window.enhanceStatusBadges = enhanceStatusBadges
window.enhanceTimeline = enhanceTimeline

// Function to enhance the view order modal display
function enhanceViewOrderModal() {
  // Add event listener to update the modal when it's shown
  $("#viewOrderModal").on("show.bs.modal", () => {
    // Apply custom styling to status badges
    styleStatusBadges()

    // Enhance the status timeline
    enhanceStatusTimeline()

    // Make order items table more readable
    enhanceOrderItemsTable()
  })
}

// Function to style status badges
function styleStatusBadges() {
  // Get the status badge element
  const statusBadge = document.getElementById("view-order-status")
  if (!statusBadge) return

  // Get the status text
  const statusText = statusBadge.textContent.trim()

  // Create a large badge for the header
  const statusClass = statusBadge.querySelector(".status-badge").className
  const headerStatus = document.createElement("span")
  headerStatus.className = statusClass + " status-badge-lg"
  headerStatus.textContent = statusText

  // Replace the original badge with the enhanced one
  statusBadge.innerHTML = ""
  statusBadge.appendChild(headerStatus)
}

// Function to enhance the status timeline
function enhanceStatusTimeline() {
  const timelineContainer = document.getElementById("status-timeline")
  if (!timelineContainer) return

  // Get all timeline items
  const timelineItems = timelineContainer.querySelectorAll(".status-timeline-item")

  // Add animation delay to each item
  timelineItems.forEach((item, index) => {
    item.style.animationDelay = `${index * 0.1}s`
    item.classList.add("fade-in")

    // Add pulse animation to the most recent status dot
    if (index === 0) {
      const dot = item.querySelector(".status-timeline-dot")
      if (dot) {
        dot.classList.add("pulse")
      }
    }
  })
}

// Function to enhance the order items table
function enhanceOrderItemsTable() {
  const orderItemsTable = document.querySelector(".order-items-table")
  if (!orderItemsTable) return

  // Add hover effect to table rows
  const tableRows = orderItemsTable.querySelectorAll("tbody tr")
  tableRows.forEach((row) => {
    row.classList.add("hover-highlight")
  })

  // Format currency values
  const currencyElements = orderItemsTable.querySelectorAll("td:nth-child(2), td:nth-child(4)")
  currencyElements.forEach((element) => {
    const value = element.textContent.trim()
    if (value.startsWith("₱")) {
      const numericValue = Number.parseFloat(value.substring(1))
      element.textContent = "₱" + numericValue.toFixed(2)
    }
  })
}

// Initialize enhancements when document is ready
document.addEventListener("DOMContentLoaded", () => {
  // Set up event listeners for the view order modal
  setupViewOrderModal()
})

// Function to set up the view order modal
function setupViewOrderModal() {
  const viewOrderModal = document.getElementById("viewOrderModal")
  if (!viewOrderModal) return

  viewOrderModal.addEventListener("show.bs.modal", (event) => {
    // Get the button that triggered the modal
    const button = event.relatedTarget

    // Extract order ID from the button
    const orderId = button.getAttribute("data-id")

    // Enhance the modal content after it's shown
    setTimeout(() => {
      enhanceViewOrderContent(orderId)
    }, 300)
  })
}

// Function to enhance the view order modal content
function enhanceViewOrderContent(orderId) {
  // Enhance status badge
  const statusBadge = document.querySelector("#view-order-status .status-badge")
  if (statusBadge) {
    addStatusIcon(statusBadge)
  }

  // Enhance timeline
  enhanceOrderTimeline()

  // Add hover effects to order items
  const orderItems = document.querySelectorAll("#view-order-items tr")
  orderItems.forEach((item) => {
    item.classList.add("hover-highlight")
  })

  // Format currency values
  formatCurrencyValues()

  // Add print button if not already present
  addPrintButton()
}

// Function to add appropriate icon to status badge
function addStatusIcon(badge) {
  let icon = ""

  if (badge.classList.contains("status-order")) {
    icon = '<i class="bi bi-receipt me-1"></i>'
  } else if (badge.classList.contains("status-processing")) {
    icon = '<i class="bi bi-gear-fill me-1"></i>'
  } else if (badge.classList.contains("status-shipped")) {
    icon = '<i class="bi bi-truck me-1"></i>'
  } else if (badge.classList.contains("status-delivered")) {
    icon = '<i class="bi bi-check-circle-fill me-1"></i>'
  } else if (badge.classList.contains("status-cancelled")) {
    icon = '<i class="bi bi-x-circle-fill me-1"></i>'
  }

  if (icon && !badge.innerHTML.includes("<i class")) {
    badge.innerHTML = icon + badge.innerHTML
  }
}

// Function to enhance the order timeline
function enhanceOrderTimeline() {
  const timeline = document.getElementById("status-timeline")
  if (!timeline) return

  // Add animation class to timeline container
  timeline.classList.add("animated-timeline")

  // Get all timeline items
  const timelineItems = timeline.querySelectorAll(".status-timeline-item")

  // Add animation delay to each item
  timelineItems.forEach((item, index) => {
    item.style.animationDelay = `${index * 0.15}s`
    item.classList.add("fade-in-up")

    // Add appropriate status color to timeline dots
    const dot = item.querySelector(".status-timeline-dot")
    if (dot) {
      const statusTitle = item.querySelector(".status-timeline-title")
      if (statusTitle) {
        const statusText = statusTitle.textContent.toLowerCase()

        if (statusText.includes("delivered")) {
          dot.style.borderColor = "#198754"
          item.querySelector(".status-timeline-content").style.borderLeftColor = "#198754"
        } else if (statusText.includes("shipped")) {
          dot.style.borderColor = "#0d6efd"
          item.querySelector(".status-timeline-content").style.borderLeftColor = "#0d6efd"
        } else if (statusText.includes("processing")) {
          dot.style.borderColor = "#ffc107"
          item.querySelector(".status-timeline-content").style.borderLeftColor = "#ffc107"
        } else if (statusText.includes("cancelled")) {
          dot.style.borderColor = "#dc3545"
          item.querySelector(".status-timeline-content").style.borderLeftColor = "#dc3545"
        } else {
          dot.style.borderColor = "#f5cc39"
          item.querySelector(".status-timeline-content").style.borderLeftColor = "#f5cc39"
        }
      }
    }
  })
}

function updateOrderStatusToCancelled(orderId) {
  console.log("Cancelling order:", orderId)

  fetch("retailer_order_handler.php?action=cancel_order", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      order_id: orderId,
    }),
  })
    .then((res) => {
      console.log("Response status:", res.status)
      return res.json()
    })
    .then((data) => {
      console.log("Response data:", data)
      if (data.success) {
        showResponseMessage("success", "Order cancelled successfully.")
        fetchOrders()
      } else {
        showResponseMessage("danger", data.message || "Failed to cancel order.")
      }
    })
    .catch((err) => {
      console.error("Error:", err)
      showResponseMessage("danger", "Server error while cancelling order.")
    })
}

// Function to format currency values
function formatCurrencyValues() {
  const currencyElements = document.querySelectorAll("#view-subtotal, #view-discount, #view-total-amount")
  currencyElements.forEach((element) => {
    const value = Number.parseFloat(element.textContent)
    if (!isNaN(value)) {
      element.textContent = value.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, "$&,")
    }
  })
}

// Function to add print button
function addPrintButton() {
  const modalFooter = document.querySelector("#viewOrderModal .modal-footer")
  if (!modalFooter || modalFooter.querySelector(".print-btn")) return

  const printBtn = document.createElement("button")
  printBtn.type = "button"
  printBtn.className = "btn btn-outline-secondary print-btn"
  printBtn.innerHTML = '<i class="bi bi-printer me-1"></i> Print'
  printBtn.addEventListener("click", printOrderDetails)

  // Insert after close button
  const closeBtn = modalFooter.querySelector('button[data-bs-dismiss="modal"]')
  if (closeBtn) {
    closeBtn.after(printBtn)
  } else {
    modalFooter.prepend(printBtn)
  }
}

// Function to print order details
function printOrderDetails() {
  const orderNumber = document.getElementById("view-order-number").textContent
  const printWindow = window.open("", "_blank")

  // Get content to print
  const orderInfo = document.querySelector("#viewOrderModal .col-md-6:first-child").cloneNode(true)
  const orderItems = document.querySelector("#viewOrderModal .table-responsive").cloneNode(true)

  // Create print document
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Order #${orderNumber}</title>
      <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/css/bootstrap.min.css" rel="stylesheet">
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.0/font/bootstrap-icons.css">
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        .print-header { text-align: center; margin-bottom: 20px; }
        .print-title { font-size: 24px; font-weight: bold; }
        .print-subtitle { color: #6c757d; }
        .card { margin-bottom: 20px; border: 1px solid #ddd; border-radius: 8px; }
        .card-header { background-color: #f8f9fa; padding: 10px 15px; border-bottom: 1px solid #ddd; font-weight: bold; }
        .card-body { padding: 15px; }
        table { width: 100%; border-collapse: collapse; }
        th, td { padding: 8px; border-bottom: 1px solid #ddd; }
        th { background-color: #f8f9fa; text-align: left; }
        .text-end { text-align: right; }
        .fw-bold { font-weight: bold; }
        @media print {
          body { padding: 0; }
          .card { border: none; }
          .card-header { background-color: transparent; border-bottom: 1px solid #000; }
        }
      </style>
    </head>
    <body>
      <div class="print-header">
        <div class="print-title">Order #${orderNumber}</div>
        <div class="print-subtitle">Piñana Gourmet</div>
      </div>
      <div class="row">
        <div class="col-12">
          ${orderInfo.outerHTML}
        </div>
        <div class="col-12">
          ${orderItems.outerHTML}
        </div>
      </div>
      <div class="text-center mt-4">
        <p>Thank you for your order!</p>
      </div>
    </body>
    </html>
  `)

  printWindow.document.close()

  // Print after resources are loaded
  printWindow.onload = () => {
    printWindow.print()
    // printWindow.close();
  }
}

// Import jQuery if it's not already available
if (typeof jQuery == "undefined") {
  var script = document.createElement("script")
  script.src = "https://code.jquery.com/jquery-3.6.0.min.js"
  script.type = "text/javascript"
  document.head.appendChild(script)

  // Wait for jQuery to load before initializing enhancements
  script.onload = () => {
    var jQuery = window.jQuery // Declare jQuery variable
    $(document).ready(() => {
      enhanceViewOrderModal()
    })
  }
} else {
  // jQuery is already available, so initialize enhancements
  $(document).ready(() => {
    enhanceViewOrderModal()
  })
}

// Add this function to properly close all modals
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
}
