// Global variables
let allOrders = []
let allProducts = []
let currentFilter = "all"
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

// Initialize the orders page
document.addEventListener("DOMContentLoaded", () => {
  // Fetch current user data
  fetchCurrentUser()

  // Initialize date pickers
  initDatePickers()

  // Set up event listeners
  setupEventListeners()

  // Fetch products for the product selection
  fetchProducts()

  // Fetch orders with initial settings
  fetchOrders()
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

// Save order
function saveOrder() {
  // Validate form
  if (!validateOrderForm()) {
    return
  }

  // Collect order items
  const orderItems = collectOrderItems()

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

  // Get delivery mode
  const deliveryMode = document.querySelector('input[name="delivery_mode"]:checked').value

  // Get mode-specific data
  let expectedDelivery = ""
  let pickupLocation = ""
  let pickupDate = ""

  if (deliveryMode === "delivery") {
    expectedDelivery = document.getElementById("expected-delivery").value
  } else if (deliveryMode === "pickup") {
    pickupLocation = document.getElementById("pickup-location").value
    pickupDate = document.getElementById("pickup-date").value
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
          const createOrderModal = bootstrap.Modal.getInstance(document.getElementById("createOrderModal"))
          createOrderModal.hide()
        }

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

// Collect order items from the table
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

    if (productSelect && qtyInput && priceInput) {
      const productId = productSelect.value
      const productName = productSelect.options[productSelect.selectedIndex].text

      // Only add items with a selected product
      if (productId && productName !== "Select Product") {
        items.push({
          product_id: productId,
          product_name: productName,
          quantity: Number.parseInt(qtyInput.value) || 1,
          unit_price: Number.parseFloat(priceInput.value) || 0,
        })
      }
    }
  })

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

// Fetch orders from the server
function fetchOrders() {
  const ordersTableBody = document.getElementById("orders-table-body")
  if (!ordersTableBody) return

  // Show loading indicator
  ordersTableBody.innerHTML = `
    <tr>
      <td colspan="7" class="text-center py-3">
        <div class="spinner-border spinner-border-sm text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
        <span class="ms-2">Loading orders...</span>
      </td>
    </tr>
  `

  // Build query parameters
  let params = `?action=get_orders&status=${currentFilter}`

  // Add date range parameters
  if (currentDateRange === "custom") {
    const startDate = document.getElementById("start-date").value
    const endDate = document.getElementById("end-date").value
    if (startDate && endDate) {
      params += `&start_date=${startDate}&end_date=${endDate}`
    }
  } else if (currentDateRange !== "all") {
    params += `&date_range=${currentDateRange}`
  }

  // Add search parameter
  if (currentSearch) {
    params += `&search=${encodeURIComponent(currentSearch)}`
  }

  // Fetch orders from server
  fetch(`retailer_order_handler.php${params}`)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok")
      }
      return response.json()
    })
    .then((data) => {
      if (data.success) {
        // Store orders
        allOrders = data.orders

        // Process each order to ensure address is available
        allOrders.forEach((order) => {
          // If retailer_address is not available, try to construct it
          if (!order.retailer_address && currentUser) {
            const addressParts = []

            if (currentUser.business_address) {
              order.retailer_address = currentUser.business_address
            } else {
              // Build from individual parts
              if (currentUser.house_number) addressParts.push(currentUser.house_number)
              if (currentUser.address_notes) addressParts.push(currentUser.address_notes)
              if (currentUser.barangay) addressParts.push(currentUser.barangay)
              if (currentUser.city) addressParts.push(currentUser.city)
              if (currentUser.province) addressParts.push(currentUser.province)

              if (addressParts.length > 0) {
                order.retailer_address = addressParts.join(", ")
              }
            }
          }

          // Calculate item counts if not already provided
          if (!order.item_count && order.items) {
            order.item_count = order.items.reduce((total, item) => total + Number.parseInt(item.quantity), 0)
          }
        })

        // Render orders
        renderOrders(data.orders)

        // Update stats
        updateOrderStats(data.orders)
      } else {
        throw new Error(data.message || "Failed to fetch orders")
      }
    })
    .catch((error) => {
      console.error("Error fetching orders:", error)
      ordersTableBody.innerHTML = `
        <tr>
          <td colspan="7" class="text-center py-3 text-danger">
            <i class="bi bi-exclamation-triangle me-2"></i>
            Error loading orders. Please try again.
          </td>
        </tr>
      `
    })
}

// Render orders in the table
function renderOrders(orders) {
  const ordersTableBody = document.getElementById("orders-table-body")
  if (!ordersTableBody) return

  if (orders.length === 0) {
    ordersTableBody.innerHTML = `
      <tr>
        <td colspan="7" class="text-center py-3">
          No orders found. ${currentSearch ? "Try a different search term." : "Create your first order!"}
        </td>
      </tr>
    `
    return
  }

  let html = ""

  orders.forEach((order) => {
    // Format dates
    const orderDate = new Date(order.order_date).toLocaleDateString()
    const expectedDelivery = order.expected_delivery ? new Date(order.expected_delivery).toLocaleDateString() : "N/A"

    // Format total amount
    const totalAmount = Number.parseFloat(order.total_amount).toFixed(2)

    // Calculate item count if not provided
    let itemCount = order.item_count || 0
    if (!itemCount && order.items) {
      itemCount = order.items.reduce((total, item) => total + Number.parseInt(item.quantity), 0)
    }

    // Determine if edit button should be enabled
    const canEdit = order.status !== "shipped"
    const editButtonClass = canEdit ? "action-btn-edit" : "action-btn-disabled"
    const editButtonTitle = canEdit ? "Edit Order" : "Cannot edit shipped orders"

    // Format delivery mode
    const deliveryMode =
      order.delivery_mode === "pickup"
        ? `<span class="badge bg-info">Pickup</span>`
        : `<span class="badge bg-success">Delivery</span>`

    html += `
  <tr>
    <td>
      <span class="fw-medium">${order.po_number || order.order_id}</span>
    </td>
    <td>${orderDate}</td>
    <td>${itemCount} items</td>
    <td>₱${totalAmount}</td>
    <td>
      <span class="status-badge status-${order.status}">${formatStatus(order.status)}</span>
      <div class="mt-1">${deliveryMode}</div>
    </td>
    <td>
      <div class="action-buttons">
        <button class="action-btn action-btn-view" title="View Details" data-id="${order.order_id}">
          <i class="bi bi-eye"></i>
        </button>
        <button class="action-btn ${editButtonClass}" title="${editButtonTitle}" data-id="${order.order_id}" ${!canEdit ? "disabled" : ""}>
          <i class="bi bi-pencil"></i>
        </button>
        <button class="action-btn action-btn-delete" title="Delete" data-id="${order.order_id}">
          <i class="bi bi-trash"></i>
        </button>
      </div>
    </td>
  </tr>
`
  })

  ordersTableBody.innerHTML = html

  // Add event listeners to action buttons
  setupActionButtons()
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
}

// View order details
function viewOrderDetails(orderId) {
  // Set selected order ID
  selectedOrderId = orderId

  // Find order in allOrders
  const order = allOrders.find((o) => o.order_id == orderId)

  if (!order) {
    showResponseMessage("danger", "Order not found")
    return
  }

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
  const canEdit = order.status !== "shipped"
  const editButtonHtml = canEdit
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
      ${editButtonHtml}
      <div class="dropdown">
        <button class="btn btn-pineapple dropdown-toggle" type="button" id="updateStatusDropdown" data-bs-toggle="dropdown" aria-expanded="false">
          <i class="bi bi-arrow-repeat me-1"></i> Update Status
        </button>
        <ul class="dropdown-menu" aria-labelledby="updateStatusDropdown">
          <li><a class="dropdown-item update-status" href="#" data-status="order">Order Placed</a></li>
          <li><a class="dropdown-item update-status" href="#" data-status="processing">Processing</a></li>
          <li><a class="dropdown-item update-status" href="#" data-status="shipped">Shipped</a></li>
          <li><a class="dropdown-item update-status" href="#" data-status="delivered">Delivered</a></li>
          <li><a class="dropdown-item update-status" href="#" data-status="cancelled">Cancelled</a></li>
        </ul>
      </div>
    `

    // Add event listener to edit button
    const editButton = modalFooter.querySelector(".edit-order-btn")
    if (editButton) {
      editButton.addEventListener("click", function () {
        const orderId = this.getAttribute("data-id")

        // Close view modal
        const viewOrderModal = bootstrap.Modal.getInstance(document.getElementById("viewOrderModal"))
        viewOrderModal.hide()

        // Show edit modal
        setTimeout(() => {
          showEditOrderModal(orderId)
        }, 500)
      })
    }
  }

  // Show modal
  if (typeof bootstrap !== "undefined") {
    const viewOrderModal = new bootstrap.Modal(document.getElementById("viewOrderModal"))
    viewOrderModal.show()
  }
}

// Show edit order modal
function showEditOrderModal(orderId) {
  // Set selected order ID
  selectedOrderId = orderId

  // Find order in allOrders
  const order = allOrders.find((o) => o.order_id == orderId)

  if (!order) {
    showResponseMessage("danger", "Order not found")
    return
  }

  // Check if order is in shipped status
  if (order.status === "shipped") {
    showResponseMessage("warning", "Orders in 'Shipped' status cannot be edited")
    return
  }

  // Store original status
  originalOrderStatus = order.status

  // Set order details in modal
  document.getElementById("edit-order-id").value = order.order_id
  document.getElementById("edit-retailer-name").value = order.retailer_name
  document.getElementById("edit-retailer-email").value = order.retailer_email
  document.getElementById("edit-retailer-contact").value = order.retailer_contact || ""
  document.getElementById("edit-order-notes").value = order.notes || ""

  // Set delivery mode
  const deliveryMode = order.delivery_mode || "delivery"
  const deliveryRadio = document.querySelector(`input[name="edit_delivery_mode"][value="${deliveryMode}"]`)
  if (deliveryRadio) {
    deliveryRadio.checked = true
  }

  // Set mode-specific fields
  if (deliveryMode === "delivery") {
    // Set expected delivery date if available
    if (order.expected_delivery) {
      document.getElementById("edit-expected-delivery").valueAsDate = new Date(order.expected_delivery)
    }
    toggleEditDeliveryFields("delivery")
  } else if (deliveryMode === "pickup") {
    document.getElementById("edit-pickup-location").value = order.pickup_location || ""

    // Set pickup date if available
    if (order.pickup_date) {
      document.getElementById("edit-pickup-date").valueAsDate = new Date(order.pickup_date)
    }

    toggleEditDeliveryFields("pickup")
  }

  // Add this code to populate and disable the address field
  const retailerAddressInput = document.getElementById("edit-retailer-address")
  if (retailerAddressInput) {
    // Construct address from available data if not directly available in order
    let addressValue = ""

    if (order.retailer_address) {
      // Use retailer_address if available in order
      addressValue = order.retailer_address
    } else if (currentUser) {
      // Otherwise try to construct from currentUser data
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

        addressValue = addressParts.join(", ")
      }
    }

    // Set the address value
    retailerAddressInput.value = addressValue

    // Make the field read-only
    retailerAddressInput.readOnly = true

    // Add a visual indication that it's read-only
    retailerAddressInput.classList.add("bg-light")
  }

  // Format dates
  const orderDate = new Date(order.order_date)
  document.getElementById("edit-order-date").valueAsDate = orderDate

  // Set discount
  document.getElementById("edit-discount").value = order.discount || 0

  // Initialize order items table
  const orderItemsBody = document.getElementById("edit-order-items-body")
  if (orderItemsBody) {
    // Clear existing items
    orderItemsBody.innerHTML = ""

    // Hide no items row if it exists
    const noItemsRow = document.getElementById("edit-no-items-row")
    if (noItemsRow) {
      noItemsRow.style.display = "none"
    }

    // Add rows for existing items
    if (order.items && order.items.length > 0) {
      order.items.forEach((item) => {
        // Find the actual product name from allProducts
        let productFound = false

        // Create new row
        const row = document.createElement("tr")
        row.className = "order-item-row"

        // Create row content
        row.innerHTML = `
          <td>
            <select class="form-select product-select">
              <option value="">Select Product</option>
              ${allProducts
                .map((product) => {
                  // Check if this is the matching product
                  const isMatch = product.product_id == item.product_id
                  if (isMatch) productFound = true
                  return `
                  <option value="${product.product_id}" 
                    data-price="${product.retail_price}" 
                    ${isMatch ? "selected" : ""}>
                    ${product.product_name}
                  </option>`
                })
                .join("")}
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
              <input type="text" class="form-control text-end price-input" value="${Number.parseFloat(item.unit_price).toFixed(2)}" readonly>
              <button class="btn btn-outline-secondary price-edit" type="button">
                <i class="bi bi-pencil"></i>
              </button>
            </div>
          </td>
          <td>
            <div class="input-group">
              <input type="text" class="form-control text-end total-input" value="${Number.parseFloat(item.unit_price * item.quantity).toFixed(2)}" readonly>
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

        // Set up event listeners for the row
        setupRowEventListeners(row)

        // If product wasn't found in the dropdown, log a warning
        if (!productFound && item.product_id) {
          console.warn(`Product ID ${item.product_id} not found in products list`)
        }
      })
    } else {
      // Add an empty row if no items
      addEditOrderItemRow()
    }

    // Update order total
    updateEditOrderTotal()
  }

  // Show modal
  const editOrderModal = new bootstrap.Modal(document.getElementById("editOrderModal"))
  editOrderModal.show()
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

// Format status text
function formatStatus(status) {
  switch (status) {
    case "order":
      return "Order Placed"
    case "processing":
      return "Processing"
    case "shipped":
      return "Shipped"
    case "delivered":
      return "Delivered"
    case "cancelled":
      return "Cancelled"
    default:
      return status.charAt(0).toUpperCase() + status.slice(1)
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
