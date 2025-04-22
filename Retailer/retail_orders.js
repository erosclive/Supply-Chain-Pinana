// Global variables
let allOrders = []
let allProducts = []
let currentFilter = "all"
let currentDateRange = "all"
let currentSearch = ""
let currentPage = 1
let selectedOrderId = null
let orderItems = []
let editOrderItems = []
let originalOrderStatus = ""
let selectedProduct = null
let editSelectedProduct = null
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

      // Populate user information if available
      populateUserInformation()

      const createOrderModal = new bootstrap.Modal(document.getElementById("createOrderModal"))
      createOrderModal.show()
    })
  }

  // Product search input
  const productSearch = document.getElementById("product-search")
  if (productSearch) {
    productSearch.addEventListener("input", () => {
      filterProducts(productSearch.value, "product-list")
    })
  }

  // Edit product search input
  const editProductSearch = document.getElementById("edit-product-search")
  if (editProductSearch) {
    editProductSearch.addEventListener("input", () => {
      filterProducts(editProductSearch.value, "edit-product-list")
    })
  }

  // Quantity controls
  setupQuantityControls("decrease-quantity", "increase-quantity", "product-quantity")
  setupQuantityControls("edit-decrease-quantity", "edit-increase-quantity", "edit-product-quantity")

  // Add to order button
  const addToOrderBtn = document.getElementById("add-to-order-btn")
  if (addToOrderBtn) {
    addToOrderBtn.addEventListener("click", () => {
      addSelectedProductToOrder()
    })
  }

  // Edit add to order button
  const editAddToOrderBtn = document.getElementById("edit-add-to-order-btn")
  if (editAddToOrderBtn) {
    editAddToOrderBtn.addEventListener("click", () => {
      addSelectedProductToEditOrder()
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

    console.log("User information populated in form")
  }
}

// Setup quantity controls
function setupQuantityControls(decreaseId, increaseId, inputId) {
  const decreaseBtn = document.getElementById(decreaseId)
  const increaseBtn = document.getElementById(increaseId)
  const quantityInput = document.getElementById(inputId)

  if (decreaseBtn && increaseBtn && quantityInput) {
    decreaseBtn.addEventListener("click", () => {
      const currentValue = Number.parseInt(quantityInput.value) || 1
      if (currentValue > 1) {
        quantityInput.value = currentValue - 1
      }
    })

    increaseBtn.addEventListener("click", () => {
      const currentValue = Number.parseInt(quantityInput.value) || 1
      quantityInput.value = currentValue + 1
    })

    quantityInput.addEventListener("change", () => {
      const value = Number.parseInt(quantityInput.value) || 1
      if (value < 1) {
        quantityInput.value = 1
      }
    })
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
        populateProductLists(data.products)

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

// Populate product lists
function populateProductLists(products) {
  populateProductList(products, "product-list")
  populateProductList(products, "edit-product-list")
}

// Populate a product list
function populateProductList(products, listId) {
  const productList = document.getElementById(listId)
  if (!productList) return

  let html = ""

  if (products.length === 0) {
    html = `
      <div class="text-center py-4 text-muted">
        <i class="bi bi-box mb-2" style="font-size: 1.5rem;"></i>
        <p>No products available</p>
      </div>
    `
  } else {
    products.forEach((product) => {
      html += `
        <div class="product-item" data-product-id="${product.product_id}">
          <div class="product-item-details">
            <div class="product-item-name">${product.product_name}</div>
            <div class="product-item-price">₱${Number.parseFloat(product.retail_price).toFixed(2)}</div>
            <div class="product-item-stock">Stock: ${product.available_stock}</div>
          </div>
        </div>
      `
    })
  }

  productList.innerHTML = html

  // Add event listeners to product items
  const productItems = productList.querySelectorAll(".product-item")
  productItems.forEach((item) => {
    item.addEventListener("click", () => {
      const productId = item.getAttribute("data-product-id")
      const product = allProducts.find((p) => p.product_id == productId)

      if (listId === "product-list") {
        selectProduct(product)
      } else {
        selectEditProduct(product)
      }

      // Remove selected class from all items
      productItems.forEach((pi) => pi.classList.remove("selected"))

      // Add selected class to clicked item
      item.classList.add("selected")
    })
  })
}

// Filter products in a list
function filterProducts(searchTerm, listId) {
  const productList = document.getElementById(listId)
  if (!productList) return

  const productItems = productList.querySelectorAll(".product-item")

  if (searchTerm.trim() === "") {
    // Show all products
    productItems.forEach((item) => {
      item.style.display = ""
    })
    return
  }

  searchTerm = searchTerm.toLowerCase()

  productItems.forEach((item) => {
    const productId = item.getAttribute("data-product-id")
    const product = allProducts.find((p) => p.product_id == productId)

    if (product) {
      const nameMatch = product.product_name.toLowerCase().includes(searchTerm)
      const idMatch = product.product_id.toLowerCase().includes(searchTerm)

      if (nameMatch || idMatch) {
        item.style.display = ""
      } else {
        item.style.display = "none"
      }
    }
  })
}

// Select a product in the create order modal
function selectProduct(product) {
  selectedProduct = product

  const selectedProductDetails = document.getElementById("selected-product-details")
  const productNameElement = document.getElementById("selected-product-name")
  const productPriceElement = document.getElementById("selected-product-price")
  const productStockElement = document.getElementById("selected-product-stock")
  const quantityInput = document.getElementById("product-quantity")

  if (selectedProductDetails && productNameElement && productPriceElement && productStockElement && quantityInput) {
    productNameElement.textContent = product.product_name
    productPriceElement.textContent = Number.parseFloat(product.retail_price).toFixed(2)
    productStockElement.textContent = product.available_stock
    quantityInput.value = 1
    quantityInput.max = product.available_stock

    selectedProductDetails.style.display = "block"
  }
}

// Select a product in the edit order modal
function selectEditProduct(product) {
  editSelectedProduct = product

  const selectedProductDetails = document.getElementById("edit-selected-product-details")
  const productNameElement = document.getElementById("edit-selected-product-name")
  const productPriceElement = document.getElementById("edit-selected-product-price")
  const productStockElement = document.getElementById("edit-selected-product-stock")
  const quantityInput = document.getElementById("edit-product-quantity")

  if (selectedProductDetails && productNameElement && productPriceElement && productStockElement && quantityInput) {
    productNameElement.textContent = product.product_name
    productPriceElement.textContent = Number.parseFloat(product.retail_price).toFixed(2)
    productStockElement.textContent = product.available_stock
    quantityInput.value = 1
    quantityInput.max = product.available_stock

    selectedProductDetails.style.display = "block"
  }
}

// Add selected product to order
function addSelectedProductToOrder() {
  if (!selectedProduct) {
    showResponseMessage("warning", "Please select a product first")
    return
  }

  const quantityInput = document.getElementById("product-quantity")
  if (!quantityInput) return

  const quantity = Number.parseInt(quantityInput.value) || 1

  if (quantity < 1) {
    showResponseMessage("warning", "Quantity must be at least 1")
    return
  }

  if (quantity > selectedProduct.available_stock) {
    showResponseMessage("warning", "Quantity cannot exceed available stock")
    return
  }

  // Check if product already exists in order items
  const existingItemIndex = orderItems.findIndex((item) => item.product_id === selectedProduct.product_id)

  if (existingItemIndex !== -1) {
    // Update existing item
    orderItems[existingItemIndex].quantity += quantity
  } else {
    // Add new item
    orderItems.push({
      product_id: selectedProduct.product_id,
      product_name: selectedProduct.product_name,
      unit_price: Number.parseFloat(selectedProduct.retail_price),
      quantity: quantity,
    })
  }

  // Debug log to check what's being added
  console.log("Adding product to order:", {
    product_id: selectedProduct.product_id,
    product_name: selectedProduct.product_name,
    unit_price: selectedProduct.retail_price,
    quantity: quantity,
  })

  // Update order items table
  renderOrderItems()

  // Reset selection
  selectedProduct = null
  document.getElementById("selected-product-details").style.display = "none"

  // Remove selected class from all items
  const productItems = document.querySelectorAll("#product-list .product-item")
  productItems.forEach((item) => item.classList.remove("selected"))

  // Show success message
  showResponseMessage("success", "Product added to order")
}

// Add selected product to edit order
function addSelectedProductToEditOrder() {
  if (!editSelectedProduct) {
    showResponseMessage("warning", "Please select a product first")
    return
  }

  const quantityInput = document.getElementById("edit-product-quantity")
  if (!quantityInput) return

  const quantity = Number.parseInt(quantityInput.value) || 1

  if (quantity < 1) {
    showResponseMessage("warning", "Quantity must be at least 1")
    return
  }

  if (quantity > editSelectedProduct.available_stock) {
    showResponseMessage("warning", "Quantity cannot exceed available stock")
    return
  }

  // Check if product already exists in order items
  const existingItemIndex = editOrderItems.findIndex((item) => item.product_id === editSelectedProduct.product_id)

  if (existingItemIndex !== -1) {
    // Update existing item
    editOrderItems[existingItemIndex].quantity += quantity
  } else {
    // Add new item
    editOrderItems.push({
      product_id: editSelectedProduct.product_id,
      product_name: editSelectedProduct.product_name,
      unit_price: Number.parseFloat(editSelectedProduct.retail_price),
      quantity: quantity,
    })
  }

  // Debug log to check what's being added
  console.log("Adding product to edit order:", {
    product_id: editSelectedProduct.product_id,
    product_name: editSelectedProduct.product_name,
    unit_price: editSelectedProduct.retail_price,
    quantity: quantity,
  })

  // Update order items table
  renderEditOrderItems()

  // Reset selection
  editSelectedProduct = null
  document.getElementById("edit-selected-product-details").style.display = "none"

  // Remove selected class from all items
  const productItems = document.querySelectorAll("#edit-product-list .product-item")
  productItems.forEach((item) => item.classList.remove("selected"))

  // Show success message
  showResponseMessage("success", "Product added to order")
}

// Render order items in the table
function renderOrderItems() {
  const orderItemsBody = document.getElementById("order-items-body")
  const noItemsRow = document.getElementById("no-items-row")

  if (!orderItemsBody) return

  // Clear existing items except the no-items-row
  const rows = orderItemsBody.querySelectorAll("tr:not(#no-items-row)")
  rows.forEach((row) => row.remove())

  // Show/hide no items row
  if (orderItems.length === 0) {
    noItemsRow.style.display = "table-row"
    updateOrderTotal()
    return
  } else {
    noItemsRow.style.display = "none"
  }

  // Add items to table
  orderItems.forEach((item, index) => {
    const row = document.createElement("tr")
    row.className = "order-item-row"
    row.innerHTML = `
      <td>${item.product_name}</td>
      <td>₱${item.unit_price.toFixed(2)}</td>
      <td>${item.quantity}</td>
      <td>₱${(item.unit_price * item.quantity).toFixed(2)}</td>
      <td>
        <button type="button" class="btn btn-sm btn-outline-danger remove-item-btn" data-index="${index}">
          <i class="bi bi-trash"></i>
        </button>
      </td>
    `
    orderItemsBody.appendChild(row)
  })

  // Add event listeners to remove buttons
  const removeButtons = orderItemsBody.querySelectorAll(".remove-item-btn")
  removeButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const index = Number.parseInt(button.getAttribute("data-index"))
      orderItems.splice(index, 1)
      renderOrderItems()
    })
  })

  // Update order total
  updateOrderTotal()
}

// Render edit order items in the table
function renderEditOrderItems() {
  const orderItemsBody = document.getElementById("edit-order-items-body")
  const noItemsRow = document.getElementById("edit-no-items-row")

  if (!orderItemsBody) return

  // Clear existing items except the no-items-row
  const rows = orderItemsBody.querySelectorAll("tr:not(#edit-no-items-row)")
  rows.forEach((row) => row.remove())

  // Show/hide no items row
  if (editOrderItems.length === 0) {
    if (noItemsRow) noItemsRow.style.display = "table-row"
    updateEditOrderTotal()
    return
  } else {
    if (noItemsRow) noItemsRow.style.display = "none"
  }

  // Add items to table
  editOrderItems.forEach((item, index) => {
    const row = document.createElement("tr")
    row.className = "order-item-row"
    row.innerHTML = `
      <td>${item.product_name}</td>
      <td>₱${item.unit_price.toFixed(2)}</td>
      <td>${item.quantity}</td>
      <td>₱${(item.unit_price * item.quantity).toFixed(2)}</td>
      <td>
        <button type="button" class="btn btn-sm btn-outline-danger remove-edit-item-btn" data-index="${index}">
          <i class="bi bi-trash"></i>
        </button>
      </td>
    `
    orderItemsBody.appendChild(row)
  })

  // Add event listeners to remove buttons
  const removeButtons = orderItemsBody.querySelectorAll(".remove-edit-item-btn")
  removeButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const index = Number.parseInt(button.getAttribute("data-index"))
      editOrderItems.splice(index, 1)
      renderEditOrderItems()
    })
  })

  // Update order total
  updateEditOrderTotal()
}

// Update order total
function updateOrderTotal() {
  const subtotalElement = document.getElementById("subtotal")
  const discountInput = document.getElementById("discount")
  const totalElement = document.getElementById("total-amount")

  if (!subtotalElement || !discountInput || !totalElement) return

  // Calculate subtotal
  const subtotal = orderItems.reduce((total, item) => {
    return total + item.unit_price * item.quantity
  }, 0)

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
  const subtotalElement = document.getElementById("edit-subtotal")
  const discountInput = document.getElementById("edit-discount")
  const totalElement = document.getElementById("edit-total-amount")

  if (!subtotalElement || !discountInput || !totalElement) return

  // Calculate subtotal
  const subtotal = editOrderItems.reduce((total, item) => {
    return total + item.unit_price * item.quantity
  }, 0)

  // Get discount
  const discount = Number.parseFloat(discountInput.value) || 0

  // Calculate total
  const total = Math.max(0, subtotal - discount)

  // Update elements
  subtotalElement.textContent = subtotal.toFixed(2)
  totalElement.textContent = total.toFixed(2)
}

// Reset create order form
function resetCreateOrderForm() {
  const createOrderForm = document.getElementById("create-order-form")
  if (createOrderForm) {
    createOrderForm.reset()

    // Reset order items
    orderItems = []
    renderOrderItems()

    // Reset product selection
    selectedProduct = null
    document.getElementById("selected-product-details").style.display = "none"

    // Remove selected class from all items
    const productItems = document.querySelectorAll("#product-list .product-item")
    productItems.forEach((item) => item.classList.remove("selected"))

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
  }
}

// Save order
function saveOrder() {
  // Validate form
  if (orderItems.length === 0) {
    showResponseMessage("danger", "Please add at least one item to the order")
    return
  }

  // Get form data
  const retailerName = document.getElementById("retailer-name").value
  const retailerEmail = document.getElementById("retailer-email").value
  const retailerContact = document.getElementById("retailer-contact").value
  const orderDate = document.getElementById("order-date").value
  const expectedDelivery = document.getElementById("expected-delivery").value
  const notes = document.getElementById("order-notes").value
  const subtotal = Number.parseFloat(document.getElementById("subtotal").textContent)
  const discount = Number.parseFloat(document.getElementById("discount").value) || 0
  const totalAmount = Number.parseFloat(document.getElementById("total-amount").textContent)

  // Create order data
  const orderData = {
    retailer_name: retailerName,
    retailer_email: retailerEmail,
    retailer_contact: retailerContact,
    order_date: orderDate,
    expected_delivery: expectedDelivery,
    notes: notes,
    status: "order", // Default status for new orders
    subtotal: subtotal,
    discount: discount,
    total_amount: totalAmount,
    items: orderItems,
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

// Update order
function updateOrder() {
  // Validate form
  if (editOrderItems.length === 0) {
    showResponseMessage("danger", "Please add at least one item to the order")
    return
  }

  // Get form data
  const orderId = document.getElementById("edit-order-id").value
  const retailerName = document.getElementById("edit-retailer-name").value
  const retailerEmail = document.getElementById("edit-retailer-email").value
  const retailerContact = document.getElementById("edit-retailer-contact").value
  const orderDate = document.getElementById("edit-order-date").value
  const expectedDelivery = document.getElementById("edit-expected-delivery").value
  const notes = document.getElementById("edit-order-notes").value
  const subtotal = Number.parseFloat(document.getElementById("edit-subtotal").textContent)
  const discount = Number.parseFloat(document.getElementById("edit-discount").value) || 0
  const totalAmount = Number.parseFloat(document.getElementById("edit-total-amount").textContent)

  // Create order data
  const orderData = {
    order_id: orderId,
    retailer_name: retailerName,
    retailer_email: retailerEmail,
    retailer_contact: retailerContact,
    order_date: orderDate,
    expected_delivery: expectedDelivery,
    notes: notes,
    status: originalOrderStatus, // Maintain the original status
    subtotal: subtotal,
    discount: discount,
    total_amount: totalAmount,
    items: editOrderItems,
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

        // Calculate item counts for each order if not already provided
        allOrders.forEach((order) => {
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
        </td>
        <td>${expectedDelivery}</td>
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

  // Set order details in modal
  document.getElementById("view-order-number").textContent = order.po_number || order.order_id
  document.getElementById("view-order-date").textContent = orderDate
  document.getElementById("view-order-status").innerHTML =
    `<span class="status-badge status-${order.status}">${formatStatus(order.status)}</span>`
  document.getElementById("view-expected-delivery").textContent = expectedDelivery
  document.getElementById("view-retailer-name").textContent = order.retailer_name
  document.getElementById("view-retailer-email").textContent = order.retailer_email
  document.getElementById("view-retailer-contact").textContent = order.retailer_contact || "N/A"
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
        let productName = item.product_name || "Unknown Product"
        if (allProducts && allProducts.length > 0) {
          const product = allProducts.find((p) => p.product_id == item.product_id)
          if (product) {
            productName = product.product_name
          }
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

  // Format dates
  const orderDate = new Date(order.order_date)
  document.getElementById("edit-order-date").valueAsDate = orderDate

  if (order.expected_delivery) {
    const expectedDelivery = new Date(order.expected_delivery)
    document.getElementById("edit-expected-delivery").valueAsDate = expectedDelivery
  } else {
    // Default to 7 days from order date
    const deliveryDate = new Date(orderDate)
    deliveryDate.setDate(deliveryDate.getDate() + 7)
    document.getElementById("edit-expected-delivery").valueAsDate = deliveryDate
  }

  // Set discount
  document.getElementById("edit-discount").value = order.discount || 0

  // Reset and populate order items
  editOrderItems = []
  if (order.items && order.items.length > 0) {
    order.items.forEach((item) => {
      editOrderItems.push({
        product_id: item.product_id,
        product_name: item.product_name || "Piñana Gourmet Product",
        unit_price: Number.parseFloat(item.unit_price),
        quantity: Number.parseInt(item.quantity),
      })
    })
  }

  // Render order items
  renderEditOrderItems()

  // Reset product selection
  editSelectedProduct = null
  document.getElementById("edit-selected-product-details").style.display = "none"

  // Remove selected class from all items
  const productItems = document.querySelectorAll("#edit-product-list .product-item")
  productItems.forEach((item) => item.classList.remove("selected"))

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
  fetch("retailer_order_handler.php?action=delete_order", {
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
        showResponseMessage("danger", data.message || "Failed to delete order")
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
