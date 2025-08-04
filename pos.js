// DOM Elements
const productCardsContainer = document.getElementById("product-cards-container")
const orderItems = document.getElementById("order-items")
const subtotalElement = document.getElementById("subtotal")
const totalElement = document.getElementById("total")
const checkoutBtn = document.getElementById("checkout-btn")
const clearOrderBtn = document.getElementById("clear-order")
const categoryButtons = document.querySelectorAll(".category-tabs button")
const searchInput = document.getElementById("pos-search")
const productCount = document.getElementById("product-count")
const discountInput = document.getElementById("discount-amount")
const applyDiscountBtn = document.getElementById("apply-discount")

// Payment Modal Elements
const paymentModalElement = document.getElementById("paymentModal")
const paymentModal = paymentModalElement ? new bootstrap.Modal(paymentModalElement) : null
const paymentMethodRadios = document.querySelectorAll('input[name="paymentMethod"]')
const cashPaymentDetails = document.getElementById("cashPaymentDetails")
const cardPaymentDetails = document.getElementById("cardPaymentDetails")
const mobilePaymentDetails = document.getElementById("mobilePaymentDetails")
const amountTenderedInput = document.getElementById("amountTendered")
const changeAmountInput = document.getElementById("changeAmount")
const completePaymentBtn = document.getElementById("completePaymentBtn")

// Receipt Modal Elements
const receiptModalElement = document.getElementById("receiptModal")
const receiptModal = receiptModalElement ? new bootstrap.Modal(receiptModalElement) : null
const receiptOrderNumber = document.getElementById("receipt-order-number")
const receiptDate = document.getElementById("receipt-date")
const receiptCustomer = document.getElementById("receipt-customer")
const receiptItems = document.getElementById("receipt-items")
const receiptSubtotal = document.getElementById("receipt-subtotal")
const receiptDiscount = document.getElementById("receipt-discount")
const receiptTotal = document.getElementById("receipt-total")
const receiptPaymentMethod = document.getElementById("receipt-payment-method")
const printReceiptBtn = document.getElementById("printReceiptBtn")

// Clear Order Modal Elements
const clearOrderModalElement = document.getElementById("clearOrderModal")
const clearOrderModal = clearOrderModalElement ? new bootstrap.Modal(clearOrderModalElement) : null
const confirmClearOrderBtn = document.getElementById("confirmClearOrderBtn")

// Products data from database
let productsData = []

// Order State
const currentOrder = {
  items: [],
  subtotal: 0,
  discountPercent: 0,
  discountAmount: 0,
  total: 0,
}

// Initialize POS
document.addEventListener("DOMContentLoaded", () => {
  // Fetch products from database
  fetchProducts()

  // Set up event listeners
  setupEventListeners()
})

// Fetch products from database
function fetchProducts() {
  if (!productCardsContainer) return

  // Show loading indicator
  productCardsContainer.innerHTML = `
    <div class="col-12 text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading products...</span>
      </div>
      <p class="mt-2">Loading products...</p>
    </div>
  `

  // Fetch data from PHP endpoint
  fetch("fetch_pos_products.php")
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok")
      }
      return response.json()
    })
    .then((data) => {
      if (data.success) {
        // Store products data
        productsData = data.products.map((product) => ({
          id: product.product_id,
          name: product.product_name,
          price: Number.parseFloat(product.price),
          category: product.category ? product.category.toLowerCase() : "other",
          image: product.product_photo || "/placeholder.svg?height=100&width=100",
          stock: Number.parseInt(product.stocks) || 0,
          status: product.status || "In Stock",
        }))

        // Update product count
        if (productCount) {
          productCount.textContent = `${productsData.length} items`
        }

        // Load products with default category (all)
        loadProducts()
      } else {
        throw new Error(data.error || "Failed to fetch products")
      }
    })
    .catch((error) => {
      console.error("Error fetching products:", error)
      productCardsContainer.innerHTML = `
        <div class="col-12 text-center py-5 text-danger">
          <i class="bi bi-exclamation-triangle-fill fs-1 mb-3"></i>
          <p>Error loading products. Please try again.</p>
          <button class="btn btn-outline-primary mt-3" onclick="fetchProducts()">
            <i class="bi bi-arrow-clockwise me-2"></i>Retry
          </button>
        </div>
      `
    })
}

// Load products based on category and search
function loadProducts(category = "all", searchTerm = "") {
  if (!productCardsContainer) return

  let filteredProducts = productsData

  // Filter by category
  if (category !== "all") {
    filteredProducts = filteredProducts.filter((product) => product.category === category)
  }

  // Filter by search term
  if (searchTerm) {
    const term = searchTerm.toLowerCase()
    filteredProducts = filteredProducts.filter(
      (product) => product.name.toLowerCase().includes(term) || product.category.toLowerCase().includes(term),
    )
  }

  // Update product count
  if (productCount) {
    productCount.textContent = `${filteredProducts.length} items`
  }

  // Clear the container first
  productCardsContainer.innerHTML = ""

  if (filteredProducts.length === 0) {
    productCardsContainer.innerHTML = `
      <div class="col-12 text-center py-5">
        <i class="bi bi-search fs-1 text-muted mb-3"></i>
        <p class="text-muted">No products found. Try a different search or category.</p>
      </div>
    `
    return
  }

  // Create and append product cards with staggered animation
  filteredProducts.forEach((product, index) => {
    // Determine if product is available for ordering
    const isAvailable = product.status !== "Out of Stock" && product.stock > 0
    const statusClass = isAvailable ? "" : "opacity-50"
    const buttonDisabled = isAvailable ? "" : "disabled"

    // Create badge based on status
    let statusBadge = ""
    if (!isAvailable) {
      statusBadge = `<span class="badge bg-danger">Out of Stock</span>`
    } else if (product.stock <= 5) {
      statusBadge = `<span class="badge bg-warning text-dark">Low Stock</span>`
    }

    // Create product card element
    const productCard = document.createElement("div")
    productCard.className = `product-card ${statusClass}`
    productCard.dataset.id = product.id
    productCard.style.animationDelay = `${index * 0.05}s`

    productCard.innerHTML = `
      ${statusBadge}
      <div class="product-img-container">
        <img src="${product.image}" class="product-img" alt="${product.name}" 
          onerror="this.src='uploads/default-placeholder.png'">
      </div>
      <div class="card-body">
        <h6 class="card-title" title="${product.name}">${product.name}</h6>
        <div class="d-flex justify-content-between align-items-center mt-auto">
          <p class="card-text mb-0">₱${product.price.toFixed(2)}</p>
          <button class="btn btn-sm add-to-cart" data-id="${product.id}" ${buttonDisabled}>
            <i class="bi bi-plus"></i> Add
          </button>
        </div>
      </div>
    `

    // Add event listeners for product card click (opens modal)
    productCard.addEventListener("click", (e) => {
      // Only show modal if not clicking the add button directly
      if (!e.target.closest(".add-to-cart") && isAvailable) {
        showProductModal(product.id)
      }
    })

    // Add event listener for add button click (directly adds to cart)
    const addButton = productCard.querySelector(".add-to-cart")
    if (addButton) {
      addButton.addEventListener("click", function (e) {
        e.stopPropagation() // Prevent card click
        if (isAvailable) {
          this.classList.add("add-to-cart-animation")
          setTimeout(() => {
            this.classList.remove("add-to-cart-animation")
          }, 400)
          // Directly add to cart with quantity 1
          addItemToOrderWithQuantity(product.id, 1)
        }
      })
    }

    // Append to container
    productCardsContainer.appendChild(productCard)
  })
}

// Function to show product modal with stock information
function showProductModal(productId) {
  const product = productsData.find((p) => p.id === productId)
  if (!product) return

  // Get or create modal if it doesn't exist
  let modalElement = document.getElementById("productDetailsModal")

  if (!modalElement) {
    // Create modal if it doesn't exist
    modalElement = document.createElement("div")
    modalElement.id = "productDetailsModal"
    modalElement.className = "modal fade"
    modalElement.tabIndex = -1
    modalElement.setAttribute("aria-labelledby", "productDetailsModalLabel")
    modalElement.setAttribute("aria-hidden", "true")

    // Set modal HTML
    modalElement.innerHTML = `
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="productDetailsModalLabel">Product Details</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <div class="row">
              <div class="col-md-5">
                <div class="product-modal-img-container mb-3">
                  <img src="/placeholder.svg" id="modal-product-image" class="img-fluid rounded" alt="Product Image">
                </div>
                <div class="stock-info mb-2">
                  <span class="badge" id="modal-stock-badge"></span>
                  <span id="modal-stock-count"></span>
                </div>
              </div>
              <div class="col-md-7">
                <h4 id="modal-product-name"></h4>
                <h5 class="text-primary mb-3" id="modal-product-price"></h5>
                <p class="text-muted small" id="modal-product-id"></p>
                <div class="mb-3" id="modal-product-category"></div>
                
                <div class="batch-info mb-3" id="batch-info-container">
                  <h6>Batch Information</h6>
                  <div class="spinner-border spinner-border-sm text-primary" role="status" id="batch-loading">
                    <span class="visually-hidden">Loading...</span>
                  </div>
                  <div id="batch-data" class="small"></div>
                </div>
                
                <div class="quantity-selector mb-3">
                  <label for="modal-quantity" class="form-label">Quantity:</label>
                  <div class="input-group">
                    <button class="btn btn-outline-secondary" type="button" id="modal-decrease-quantity">-</button>
                    <input type="number" class="form-control text-center" id="modal-quantity" value="1" min="1">
                    <button class="btn btn-outline-secondary" type="button" id="modal-increase-quantity">+</button>
                  </div>
                  <small class="text-danger" id="quantity-warning" style="display: none;">
                    <i class="bi bi-exclamation-triangle-fill"></i> Maximum stock reached
                  </small>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
            <button type="button" class="btn btn-primary" id="modal-add-to-cart">
              <i class="bi bi-cart-plus"></i> Add to Cart
            </button>
          </div>
        </div>
      </div>
    `

    document.body.appendChild(modalElement)
  }

  // Get modal elements
  const modalProductName = document.getElementById("modal-product-name")
  const modalProductPrice = document.getElementById("modal-product-price")
  const modalProductImage = document.getElementById("modal-product-image")
  const modalProductId = document.getElementById("modal-product-id")
  const modalProductCategory = document.getElementById("modal-product-category")
  const modalStockBadge = document.getElementById("modal-stock-badge")
  const modalStockCount = document.getElementById("modal-stock-count")
  const modalQuantity = document.getElementById("modal-quantity")
  const modalDecreaseQuantity = document.getElementById("modal-decrease-quantity")
  const modalIncreaseQuantity = document.getElementById("modal-increase-quantity")
  const modalAddToCart = document.getElementById("modal-add-to-cart")
  const quantityWarning = document.getElementById("quantity-warning")
  const batchInfoContainer = document.getElementById("batch-info-container")
  const batchLoading = document.getElementById("batch-loading")
  const batchData = document.getElementById("batch-data")

  // Reset quantity
  modalQuantity.value = 1
  quantityWarning.style.display = "none"

  // Set product details
  modalProductName.textContent = product.name
  modalProductPrice.textContent = `₱${product.price.toFixed(2)}`
  modalProductImage.src = product.image
  modalProductId.textContent = `Product ID: ${product.id}`
  modalProductCategory.textContent = `Category: ${product.category.charAt(0).toUpperCase() + product.category.slice(1)}`

  // Set stock information
  if (product.stock <= 0) {
    modalStockBadge.className = "badge bg-danger"
    modalStockBadge.textContent = "Out of Stock"
    modalStockCount.textContent = ""
    modalAddToCart.disabled = true
    modalQuantity.disabled = true
    modalDecreaseQuantity.disabled = true
    modalIncreaseQuantity.disabled = true
  } else if (product.stock <= 5) {
    modalStockBadge.className = "badge bg-warning text-dark"
    modalStockBadge.textContent = "Low Stock"
    modalStockCount.textContent = ` (${product.stock} remaining)`
    modalAddToCart.disabled = false
    modalQuantity.disabled = false
    modalDecreaseQuantity.disabled = false
    modalIncreaseQuantity.disabled = false
  } else {
    modalStockBadge.className = "badge bg-success"
    modalStockBadge.textContent = "In Stock"
    modalStockCount.textContent = ` (${product.stock} available)`
    modalAddToCart.disabled = false
    modalQuantity.disabled = false
    modalDecreaseQuantity.disabled = false
    modalIncreaseQuantity.disabled = false
  }

  // Set max quantity
  modalQuantity.max = product.stock

  // Fetch batch information
  fetchBatchInfo(product.id)

  // Set up event listeners for quantity buttons
  modalDecreaseQuantity.onclick = () => {
    const quantity = Number.parseInt(modalQuantity.value)
    if (quantity > 1) {
      modalQuantity.value = quantity - 1
      quantityWarning.style.display = "none"
    }
  }

  modalIncreaseQuantity.onclick = () => {
    const quantity = Number.parseInt(modalQuantity.value)
    if (quantity < product.stock) {
      modalQuantity.value = quantity + 1
      if (quantity + 1 >= product.stock) {
        quantityWarning.style.display = "block"
      }
    } else {
      quantityWarning.style.display = "block"
    }
  }

  // Event listener for quantity input
  modalQuantity.onchange = () => {
    let quantity = Number.parseInt(modalQuantity.value)

    // Ensure quantity is at least 1
    if (quantity < 1 || isNaN(quantity)) {
      modalQuantity.value = 1
      quantity = 1
    }

    // Ensure quantity doesn't exceed stock
    if (quantity > product.stock) {
      modalQuantity.value = product.stock
      quantityWarning.style.display = "block"
    } else {
      quantityWarning.style.display = "none"
    }
  }

  // Event listener for add to cart button
  modalAddToCart.onclick = () => {
    const quantity = Number.parseInt(modalQuantity.value)
    addItemToOrderWithQuantity(product.id, quantity)

    // Close modal
    const modalInstance = bootstrap.Modal.getInstance(modalElement)
    if (modalInstance) {
      modalInstance.hide()
    }
  }

  // Show modal
  const modal = new bootstrap.Modal(modalElement)
  modal.show()
}

// Function to fetch batch information
function fetchBatchInfo(productId) {
  const batchLoading = document.getElementById("batch-loading")
  const batchData = document.getElementById("batch-data")

  // Show loading indicator
  if (batchLoading) batchLoading.style.display = "inline-block"
  if (batchData) batchData.innerHTML = ""

  // Fetch batch data
  fetch(`fetch_product_batches.php?product_id=${productId}`)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok")
      }
      return response.json()
    })
    .then((data) => {
      // Hide loading indicator
      if (batchLoading) batchLoading.style.display = "none"

      if (data.success && data.batches && data.batches.length > 0) {
        // Display batch information
        let batchHtml = '<div class="table-responsive"><table class="table table-sm table-bordered">'
        batchHtml += "<thead><tr><th>Batch</th><th>Qty</th><th>Expiry</th></tr></thead><tbody>"

        data.batches.forEach((batch) => {
          // Determine expiry status class
          let expiryClass = ""
          if (batch.expiry_status === "expired") {
            expiryClass = "text-danger"
          } else if (batch.expiry_status === "expiring-soon") {
            expiryClass = "text-warning"
          }

          // Format expiration date
          const expiryDate = new Date(batch.expiration_date)
          const formattedDate = expiryDate.toLocaleDateString()

          batchHtml += `<tr class="${expiryClass}">
            <td>${batch.batch_code || "N/A"}</td>
            <td>${batch.quantity}</td>
            <td>${formattedDate}</td>
          </tr>`
        })

        batchHtml += "</tbody></table></div>"
        if (batchData) batchData.innerHTML = batchHtml
      } else {
        // No batch data
        if (batchData) batchData.innerHTML = '<p class="text-muted">No batch information available</p>'
      }
    })
    .catch((error) => {
      console.error("Error fetching batch information:", error)
      if (batchLoading) batchLoading.style.display = "none"
      if (batchData) batchData.innerHTML = '<p class="text-danger">Error loading batch information</p>'
    })
}

// Function to add item to order with specific quantity
function addItemToOrderWithQuantity(productId, quantity) {
  const product = productsData.find((p) => p.id === productId)
  if (!product) return

  // Check if product is available
  if (product.status === "Out of Stock" || product.stock <= 0) {
    showAlert("danger", "This product is out of stock")
    return
  }

  // Check if we have enough stock
  if (quantity > product.stock) {
    showAlert("warning", `Only ${product.stock} units available in stock`)
    return
  }

  // Check if item already exists in order
  const existingItemIndex = currentOrder.items.findIndex((item) => item.id === productId)

  if (existingItemIndex !== -1) {
    // Check if we have enough stock for the total quantity
    const currentQuantity = currentOrder.items[existingItemIndex].quantity
    const newTotalQuantity = currentQuantity + quantity

    if (newTotalQuantity > product.stock) {
      showAlert(
        "warning",
        `Only ${product.stock} units available in stock. You already have ${currentQuantity} in your cart.`,
      )
      return
    }

    // Update quantity
    currentOrder.items[existingItemIndex].quantity = newTotalQuantity
  } else {
    // Add new item
    currentOrder.items.push({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: quantity,
    })
  }

  // Update order display
  updateOrderDisplay()

  // Show success message
  showAlert("success", `${quantity} ${quantity > 1 ? "units" : "unit"} of ${product.name} added to order`)
}

// Add item to order (now calls addItemToOrderWithQuantity)
function addItemToOrder(productId) {
  // Default to quantity of 1 when directly adding from product card
  addItemToOrderWithQuantity(productId, 1)
}

// Set up event listeners
function setupEventListeners() {
  // Category filter buttons
  categoryButtons.forEach((button) => {
    button.addEventListener("click", function () {
      // Remove active class from all buttons
      categoryButtons.forEach((btn) => btn.classList.remove("active", "btn-primary"))
      categoryButtons.forEach((btn) => btn.classList.add("btn-outline-secondary"))

      // Add active class to clicked button
      this.classList.add("active", "btn-primary")
      this.classList.remove("btn-outline-secondary")

      // Filter products
      const category = this.getAttribute("data-category")
      loadProducts(category, searchInput ? searchInput.value : "")
    })
  })

  // Search input
  if (searchInput) {
    // Debounce search to improve performance
    let searchTimeout
    searchInput.addEventListener("input", function () {
      clearTimeout(searchTimeout)
      searchTimeout = setTimeout(() => {
        const activeCategory = document.querySelector(".category-tabs button.active")
        const category = activeCategory ? activeCategory.getAttribute("data-category") : "all"
        loadProducts(category, this.value)
      }, 300)
    })
  }

  // Clear order button - MODIFIED to use modal
  if (clearOrderBtn) {
    clearOrderBtn.addEventListener("click", () => {
      if (currentOrder.items.length > 0) {
        // Show the modal instead of browser confirm
        clearOrderModal.show()
      } else {
        showAlert("info", "Order is already empty")
      }
    })
  }

  // Confirm clear order button in modal - NEW
  if (confirmClearOrderBtn) {
    confirmClearOrderBtn.addEventListener("click", () => {
      clearOrder()
      clearOrderModal.hide()
    })
  }

  // Apply discount button
  if (applyDiscountBtn) {
    applyDiscountBtn.addEventListener("click", applyDiscount)
  }

  // Discount input - apply on enter
  if (discountInput) {
    discountInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        e.preventDefault()
        applyDiscount()
      }
    })
  }

  // Checkout button
  if (checkoutBtn) {
    checkoutBtn.addEventListener("click", openPaymentModal)
  }

  // Payment method radios
  paymentMethodRadios.forEach((radio) => {
    radio.addEventListener("change", function () {
      // Hide all payment details
      cashPaymentDetails.style.display = "none"
      cardPaymentDetails.style.display = "none"
      mobilePaymentDetails.style.display = "none"

      // Show selected payment details
      if (this.value === "cash") {
        cashPaymentDetails.style.display = "block"
      } else if (this.value === "card") {
        cardPaymentDetails.style.display = "block"
      } else if (this.value === "mobile") {
        mobilePaymentDetails.style.display = "block"
      }
    })
  })

  // Amount tendered input
  if (amountTenderedInput) {
    amountTenderedInput.addEventListener("input", calculateChange)
  }

  // Complete payment button
  if (completePaymentBtn) {
    completePaymentBtn.addEventListener("click", completePayment)
  }

  // Print receipt button
  if (printReceiptBtn) {
    printReceiptBtn.addEventListener("click", printReceipt)
  }
}

// Clear order
function clearOrder() {
  currentOrder.items = []
  currentOrder.discountPercent = 0
  currentOrder.discountAmount = 0

  if (discountInput) {
    discountInput.value = ""
  }

  updateOrderDisplay()
  showAlert("info", "Order has been cleared")
}

// Apply discount
function applyDiscount() {
  const discountPercent = Number.parseFloat(discountInput.value) || 0

  if (discountPercent < 0) {
    showAlert("warning", "Discount percentage cannot be negative")
    return
  }

  if (discountPercent > 100) {
    showAlert("warning", "Discount percentage cannot be greater than 100%")
    return
  }

  currentOrder.discountPercent = discountPercent
  updateOrderDisplay()
  showAlert("success", `Discount of ${discountPercent}% applied`)
}

// Update order display
function updateOrderDisplay() {
  if (!orderItems) return

  // Calculate totals
  calculateOrderTotals()

  // Update order items display
  if (currentOrder.items.length === 0) {
    orderItems.innerHTML = `
      <li class="list-group-item text-center text-muted py-5">
        <i class="bi bi-cart3 d-block mb-2" style="font-size: 2rem;"></i>
        <p class="mb-0">No items in order</p>
        <small>Add products by clicking on them</small>
      </li>
    `

    // Disable checkout button
    if (checkoutBtn) {
      checkoutBtn.disabled = true
    }
  } else {
    let html = ""

    currentOrder.items.forEach((item) => {
      const itemTotal = (item.price * item.quantity).toFixed(2)

      html += `
        <li class="list-group-item order-item">
          <div class="d-flex justify-content-between">
            <div class="order-item-details">
              <div class="order-item-title">${item.name}</div>
              <div class="order-item-price">₱${item.price.toFixed(2)} × ${item.quantity}</div>
            </div>
            <div class="text-end">
              <div class="fw-bold mb-2">₱${itemTotal}</div>
              <div class="order-item-quantity">
                <button class="quantity-btn decrease-quantity" data-id="${item.id}">-</button>
                <input type="text" class="quantity-input" value="${item.quantity}" data-id="${item.id}" readonly>
                <button class="quantity-btn increase-quantity" data-id="${item.id}">+</button>
              </div>
            </div>
          </div>
        </li>
      `
    })

    orderItems.innerHTML = html

    // Enable checkout button
    if (checkoutBtn) {
      checkoutBtn.disabled = false
    }

    // Add event listeners to quantity buttons
    const decreaseButtons = document.querySelectorAll(".decrease-quantity")
    const increaseButtons = document.querySelectorAll(".increase-quantity")

    decreaseButtons.forEach((button) => {
      button.addEventListener("click", function () {
        const productId = this.getAttribute("data-id")
        const itemIndex = currentOrder.items.findIndex((item) => item.id === productId)

        if (itemIndex !== -1) {
          const newQuantity = currentOrder.items[itemIndex].quantity - 1
          updateItemQuantity(productId, newQuantity)
        }
      })
    })

    increaseButtons.forEach((button) => {
      button.addEventListener("click", function () {
        const productId = this.getAttribute("data-id")
        const itemIndex = currentOrder.items.findIndex((item) => item.id === productId)

        if (itemIndex !== -1) {
          const newQuantity = currentOrder.items[itemIndex].quantity + 1
          updateItemQuantity(productId, newQuantity)
        }
      })
    })
  }

  // Update totals display
  if (subtotalElement) subtotalElement.textContent = `₱${currentOrder.subtotal.toFixed(2)}`
  if (totalElement) totalElement.textContent = `₱${currentOrder.total.toFixed(2)}`
}

// Calculate order totals
function calculateOrderTotals() {
  // Calculate subtotal
  currentOrder.subtotal = currentOrder.items.reduce((total, item) => {
    return total + item.price * item.quantity
  }, 0)

  // Calculate discount amount based on percentage
  currentOrder.discountAmount = (currentOrder.subtotal * currentOrder.discountPercent) / 100

  // Calculate total (subtotal - discount)
  currentOrder.total = currentOrder.subtotal - currentOrder.discountAmount

  // Ensure total is not negative
  if (currentOrder.total < 0) {
    currentOrder.total = 0
  }
}

// Open payment modal
function openPaymentModal() {
  // Reset modal values
  document.getElementById("customerName").value = ""

  // Select cash payment as default
  const cashRadio = document.querySelector('input[name="paymentMethod"][value="cash"]')
  if (cashRadio) {
    cashRadio.checked = true
  }

  // Show cash payment details, hide others
  if (cashPaymentDetails) cashPaymentDetails.style.display = "block"
  if (cardPaymentDetails) cardPaymentDetails.style.display = "none"
  if (mobilePaymentDetails) mobilePaymentDetails.style.display = "none"

  // Set amount tendered to match total by default
  if (amountTenderedInput) {
    amountTenderedInput.value = currentOrder.total.toFixed(2)
    calculateChange()
  }

  // Show modal
  if (paymentModal) {
    paymentModal.show()
  }
}

// Calculate change
function calculateChange() {
  if (!amountTenderedInput || !changeAmountInput) return

  const amountTendered = Number.parseFloat(amountTenderedInput.value) || 0
  const change = amountTendered - currentOrder.total

  changeAmountInput.value = change >= 0 ? change.toFixed(2) : "0.00"

  // Highlight if insufficient
  if (change < 0) {
    changeAmountInput.classList.add("is-invalid")
  } else {
    changeAmountInput.classList.remove("is-invalid")
  }
}

// Complete payment
function completePayment() {
  // Validate input
  const amountTendered = Number.parseFloat(amountTenderedInput.value) || 0
  const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked')?.value || "cash"

  // For cash payments, ensure enough money was tendered
  if (paymentMethod === "cash" && amountTendered < currentOrder.total) {
    showAlert("danger", "Amount tendered is insufficient")
    return
  }

  // Get customer information
  const customerName = document.getElementById("customerName").value || "Guest"

  // Generate order number
  const orderNumber = "PG-" + Math.floor(10000 + Math.random() * 90000)

  // Get current date and time
  const now = new Date()
  const dateString = now.toLocaleDateString()
  const timeString = now.toLocaleTimeString()

  // Update receipt information
  if (receiptOrderNumber) receiptOrderNumber.textContent = orderNumber
  if (receiptDate) receiptDate.textContent = `${dateString} ${timeString}`
  if (receiptCustomer) receiptCustomer.textContent = customerName

  // Update receipt items
  if (receiptItems) {
    let receiptItemsHtml = `<table class="table table-borderless">
      <thead>
        <tr>
          <th>Item</th>
          <th class="text-center">Qty</th>
          <th class="text-end">Price</th>
          <th class="text-end">Total</th>
        </tr>
      </thead>
      <tbody>`

    currentOrder.items.forEach((item) => {
      const itemTotal = (item.price * item.quantity).toFixed(2)

      receiptItemsHtml += `
        <tr>
          <td>${item.name}</td>
          <td class="text-center">${item.quantity}</td>
          <td class="text-end">₱${item.price.toFixed(2)}</td>
          <td class="text-end">₱${itemTotal}</td>
        </tr>
      `
    })

    receiptItemsHtml += `</tbody></table>`
    receiptItems.innerHTML = receiptItemsHtml
  }

  // Update receipt totals
  if (receiptSubtotal) receiptSubtotal.textContent = `₱${currentOrder.subtotal.toFixed(2)}`
  if (receiptDiscount)
    receiptDiscount.textContent = `₱${currentOrder.discountAmount.toFixed(2)} (${currentOrder.discountPercent}%)`
  if (receiptTotal) receiptTotal.textContent = `₱${currentOrder.total.toFixed(2)}`
  if (receiptPaymentMethod)
    receiptPaymentMethod.textContent = paymentMethod.charAt(0).toUpperCase() + paymentMethod.slice(1)

  // Save transaction to database
  saveTransaction(orderNumber, customerName, paymentMethod, amountTendered)

  // Hide payment modal and show receipt modal
  if (paymentModal) {
    paymentModal.hide()
  }
  if (receiptModal) {
    receiptModal.show()
  }

  // Clear order after payment
  clearOrder()

  // Show success message
  showAlert("success", "Payment completed successfully!")
}

// Enhanced save transaction function
function saveTransaction(orderNumber, customerName, paymentMethod, amountTendered) {
  const transactionData = {
    orderNumber,
    customerName,
    paymentMethod,
    items: currentOrder.items,
    subtotal: currentOrder.subtotal,
    discountPercent: currentOrder.discountPercent,
    discountAmount: currentOrder.discountAmount,
    total: currentOrder.total,
    date: new Date().toISOString(),
    amountTendered: amountTendered || 0,
    change: Number.parseFloat(changeAmountInput.value) || 0,
  }

  console.log("Transaction data:", transactionData)

  // Send data to server
  fetch("save_transaction.php", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(transactionData),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok")
      }
      return response.json()
    })
    .then((data) => {
      if (data.success) {
        console.log("Transaction saved successfully")
        // No need to show an alert here as we already show a success message after payment
      } else {
        console.error("Error saving transaction:", data.error)
        showAlert("Success", `Transaction processed successfully! ${data.error}`)
      }
    })
    .catch((error) => {
      console.error("Error saving transaction:", error)
      showAlert("success", "Transaction processed successfully!")
    })

  // Also save to localStorage as backup
  try {
    // Get existing transactions
    const existingTransactions = JSON.parse(localStorage.getItem("transactions")) || []

    // Add new transaction
    existingTransactions.push(transactionData)

    // Save back to localStorage
    localStorage.setItem("transactions", JSON.stringify(existingTransactions))
  } catch (e) {
    console.error("Error saving to localStorage:", e)
  }
}

// Update item quantity function
function updateItemQuantity(productId, newQuantity) {
  const itemIndex = currentOrder.items.findIndex((item) => item.id === productId)
  if (itemIndex === -1) return

  // Find the product in the products data
  const product = productsData.find((p) => p.id === productId)
  if (!product) return

  // Check if we're removing the item
  if (newQuantity <= 0) {
    currentOrder.items.splice(itemIndex, 1)
    showAlert("info", `${product.name} removed from order`)
  } else {
    // Check if we have enough stock
    if (product && newQuantity > product.stock) {
      showAlert("warning", `Only ${product.stock} units available in stock`)
      return
    }

    // Update quantity
    currentOrder.items[itemIndex].quantity = newQuantity
  }

  // Update order display
  updateOrderDisplay()
}

// Print receipt
function printReceipt() {
  const receiptContent = document.querySelector(".receipt-container").innerHTML
  const printWindow = window.open("", "_blank")

  printWindow.document.write(`
    <html>
      <head>
        <title>Receipt - Piñana Gourmet</title>
        <style>
          body {
            font-family: 'Courier New', monospace;
            padding: 20px;
            max-width: 300px;
            margin: 0 auto;
          }
          .receipt-divider {
            border-top: 1px dashed #ccc;
            margin: 10px 0;
          }
          table {
            width: 100%;
            border-collapse: collapse;
          }
          th, td {
            padding: 5px;
            text-align: left;
          }
          th {
            border-bottom: 1px solid #ccc;
          }
          .text-end {
            text-align: right;
          }
          .text-center {
            text-align: center;
          }
          @media print {
            body {
              width: 80mm;
            }
          }
        </style>
      </head>
      <body>
        ${receiptContent}
        <div style="text-align: center; margin-top: 20px;">
          <p>Thank you for shopping at Piñana Gourmet!</p>
          <p>Please come again.</p>
        </div>
        <script>
          window.onload = function() {
            window.print();
            setTimeout(function() {
              window.close();
            }, 500);
          };
        </script>
      </body>
    </html>
  `)

  printWindow.document.close()
}

// Show alert message
function showAlert(type, message) {
  // Create alert element
  const alertDiv = document.createElement("div")
  alertDiv.className = `alert alert-${type} alert-dismissible fade show position-fixed top-0 end-0 m-3`
  alertDiv.setAttribute("role", "alert")
  alertDiv.style.zIndex = "9999"
  alertDiv.style.maxWidth = "350px"
  alertDiv.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.15)"
  alertDiv.innerHTML = `
    <div class="d-flex align-items-center">
      ${getAlertIcon(type)}
      <div class="ms-2">${message}</div>
    </div>
    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
  `

  // Add to document
  document.body.appendChild(alertDiv)

  // Auto-dismiss after 3 seconds
  setTimeout(() => {
    const bsAlert = new bootstrap.Alert(alertDiv)
    bsAlert.close()
  }, 3000)
}

// Helper function to get alert icon
function getAlertIcon(type) {
  switch (type) {
    case "success":
      return '<i class="bi bi-check-circle-fill text-success"></i>'
    case "danger":
      return '<i class="bi bi-exclamation-circle-fill text-danger"></i>'
    case "warning":
      return '<i class="bi bi-exclamation-triangle-fill text-warning"></i>'
    case "info":
      return '<i class="bi bi-info-circle-fill text-info"></i>'
    default:
      return '<i class="bi bi-bell-fill"></i>'
  }
}

// Add this function to create a staggered animation effect for product cards
function animateProductCards() {
  const cards = document.querySelectorAll(".product-card")
  cards.forEach((card, index) => {
    card.style.opacity = "0"
    card.style.transform = "translateY(20px)"

    setTimeout(() => {
      card.style.transition = "opacity 0.3s ease, transform 0.3s ease"
      card.style.opacity = "1"
      card.style.transform = "translateY(0)"
    }, index * 50)
  })
}

// Call this function after loading products
document.addEventListener("DOMContentLoaded", () => {
  // Add event listener for search clear button
  const searchInput = document.getElementById("pos-search")
  const clearSearchBtn = document.createElement("button")
  clearSearchBtn.className = "btn btn-sm btn-link position-absolute end-0 top-50 translate-middle-y text-muted"
  clearSearchBtn.innerHTML = '<i class="bi bi-x"></i>'
  clearSearchBtn.style.display = "none"

  if (searchInput) {
    searchInput.parentNode.style.position = "relative"
    searchInput.parentNode.appendChild(clearSearchBtn)

    searchInput.addEventListener("input", function () {
      clearSearchBtn.style.display = this.value ? "block" : "none"
    })

    clearSearchBtn.addEventListener("click", function () {
      searchInput.value = ""
      searchInput.dispatchEvent(new Event("input"))
      this.style.display = "none"
    })
  }
})

// Add event listener for the Recent Transactions button
document.addEventListener("DOMContentLoaded", () => {
  const recentTransactionsBtn = document.querySelector(".list-group-item-action:first-child")

  if (recentTransactionsBtn) {
    recentTransactionsBtn.addEventListener("click", () => {
      window.location.href = "transactions.html"
    })
  }
})
