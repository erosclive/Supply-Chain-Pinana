// POS System JavaScript

// Sample product data
const posProductsData = [
    {
      id: "P001",
      name: "Pineapple Jam",
      price: 8.99,
      category: "preserves",
      image: "/placeholder.svg?height=100&width=100",
    },
    {
      id: "P002",
      name: "Pineapple Juice",
      price: 4.99,
      category: "beverages",
      image: "/placeholder.svg?height=100&width=100",
    },
    {
      id: "P003",
      name: "Dried Pineapple",
      price: 6.99,
      category: "snacks",
      image: "/placeholder.svg?height=100&width=100",
    },
    {
      id: "P004",
      name: "Pineapple Cake",
      price: 12.99,
      category: "bakery",
      image: "/placeholder.svg?height=100&width=100",
    },
    {
      id: "P005",
      name: "Pineapple Syrup",
      price: 7.99,
      category: "preserves",
      image: "/placeholder.svg?height=100&width=100",
    },
    {
      id: "P006",
      name: "Pineapple Candy",
      price: 3.99,
      category: "snacks",
      image: "/placeholder.svg?height=100&width=100",
    },
    {
      id: "P007",
      name: "Pineapple Smoothie",
      price: 5.99,
      category: "beverages",
      image: "/placeholder.svg?height=100&width=100",
    },
    {
      id: "P008",
      name: "Pineapple Cookies",
      price: 4.49,
      category: "bakery",
      image: "/placeholder.svg?height=100&width=100",
    },
    {
      id: "P009",
      name: "Pineapple Marmalade",
      price: 9.99,
      category: "preserves",
      image: "/placeholder.svg?height=100&width=100",
    },
    {
      id: "P010",
      name: "Pineapple Soda",
      price: 2.99,
      category: "beverages",
      image: "/placeholder.svg?height=100&width=100",
    },
    {
      id: "P011",
      name: "Pineapple Chips",
      price: 3.49,
      category: "snacks",
      image: "/placeholder.svg?height=100&width=100",
    },
    {
      id: "P012",
      name: "Pineapple Bread",
      price: 6.49,
      category: "bakery",
      image: "/placeholder.svg?height=100&width=100",
    },
  ]
  
  let productsData = [...posProductsData]
  
  // DOM Elements
  const posProducts = document.getElementById("pos-products")
  const orderItems = document.getElementById("order-items")
  const subtotalElement = document.getElementById("subtotal")
  const taxElement = document.getElementById("tax")
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
  const modalSubtotal = document.getElementById("modal-subtotal")
  const modalTax = document.getElementById("modal-tax")
  const modalDiscount = document.getElementById("modal-discount")
  const modalTotal = document.getElementById("modal-total")
  const completePaymentBtn = document.getElementById("completePaymentBtn")
  
  // Receipt Modal Elements
  const receiptModalElement = document.getElementById("receiptModal")
  const receiptModal = receiptModalElement ? new bootstrap.Modal(receiptModalElement) : null
  const receiptOrderNumber = document.getElementById("receipt-order-number")
  const receiptDate = document.getElementById("receipt-date")
  const receiptCustomer = document.getElementById("receipt-customer")
  const receiptItems = document.getElementById("receipt-items")
  const receiptSubtotal = document.getElementById("receipt-subtotal")
  const receiptTax = document.getElementById("receipt-tax")
  const receiptDiscount = document.getElementById("receipt-discount")
  const receiptTotal = document.getElementById("receipt-total")
  const receiptPaymentMethod = document.getElementById("receipt-payment-method")
  const printReceiptBtn = document.getElementById("printReceiptBtn")
  
  // Order State
  const currentOrder = {
    items: [],
    subtotal: 0,
    tax: 0,
    discount: 0,
    total: 0,
  }
  
  // Initialize POS
  document.addEventListener("DOMContentLoaded", () => {
    // Load products
    loadProducts()
  
    // Set up event listeners
    setupEventListeners()
  })
  
  // Load products based on category and search
  function loadProducts(category = "all", searchTerm = "") {
    if (!posProducts) return
  
    let filteredProducts = posProductsData
  
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
  
    // Generate HTML
    let html = ""
  
    filteredProducts.forEach((product) => {
      html += `
          <div class="col-lg-3 col-md-4 col-sm-6 mb-3">
            <div class="card product-card h-100" data-id="${product.id}">
              <img src="${product.image}" class="card-img-top" alt="${product.name}">
              <div class="card-body">
                <h6 class="card-title" title="${product.name}">${product.name}</h6>
                <div class="d-flex justify-content-between align-items-center">
                  <p class="card-text mb-0">$${product.price.toFixed(2)}</p>
                  <button class="btn btn-sm btn-primary add-to-cart" data-id="${product.id}">
                    <i class="bi bi-plus"></i> Add
                  </button>
                </div>
              </div>
            </div>
          </div>
        `
    })
  
    posProducts.innerHTML = html
  
    // Add event listeners to "Add to Cart" buttons
    const addToCartButtons = document.querySelectorAll(".add-to-cart")
    addToCartButtons.forEach((button) => {
      button.addEventListener("click", function (e) {
        e.stopPropagation()
        const productId = this.getAttribute("data-id")
        addItemToOrder(productId)
      })
    })
  
    // Add event listeners to product cards
    const productCards = document.querySelectorAll(".product-card")
    productCards.forEach((card) => {
      card.addEventListener("click", function () {
        const productId = this.getAttribute("data-id")
        addItemToOrder(productId)
      })
    })
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
        loadProducts(category, searchInput.value)
      })
    })
  
    // Search input
    if (searchInput) {
      searchInput.addEventListener("input", function () {
        const activeCategory = document.querySelector(".category-tabs button.active")
        const category = activeCategory ? activeCategory.getAttribute("data-category") : "all"
        loadProducts(category, this.value)
      })
    }
  
    // Clear order button
    if (clearOrderBtn) {
      clearOrderBtn.addEventListener("click", clearOrder)
    }
  
    // Apply discount button
    if (applyDiscountBtn) {
      applyDiscountBtn.addEventListener("click", applyDiscount)
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
  
  // Add item to order
  function addItemToOrder(productId) {
    const product = productsData.find((p) => p.id === productId)
    if (!product) return
  
    // Check if item already exists in order
    const existingItemIndex = currentOrder.items.findIndex((item) => item.id === productId)
  
    if (existingItemIndex !== -1) {
      // Increment quantity
      currentOrder.items[existingItemIndex].quantity++
    } else {
      // Add new item
      currentOrder.items.push({
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
      })
    }
  
    // Update order display
    updateOrderDisplay()
  }
  
  // Remove item from order
  function removeItemFromOrder(productId) {
    const itemIndex = currentOrder.items.findIndex((item) => item.id === productId)
  
    if (itemIndex !== -1) {
      currentOrder.items.splice(itemIndex, 1)
      updateOrderDisplay()
    }
  }
  
  // Update item quantity
  function updateItemQuantity(productId, quantity) {
    const itemIndex = currentOrder.items.findIndex((item) => item.id === productId)
  
    if (itemIndex !== -1) {
      if (quantity <= 0) {
        // Remove item if quantity is 0 or less
        removeItemFromOrder(productId)
      } else {
        // Update quantity
        currentOrder.items[itemIndex].quantity = quantity
        updateOrderDisplay()
      }
    }
  }
  
  // Clear order
  function clearOrder() {
    currentOrder.items = []
    currentOrder.discount = 0
  
    if (discountInput) {
      discountInput.value = ""
    }
  
    updateOrderDisplay()
  }
  
  // Apply discount
  function applyDiscount() {
    const discountAmount = Number.parseFloat(discountInput.value) || 0
    currentOrder.discount = discountAmount
    updateOrderDisplay()
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
            No items in order
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
                  <div class="order-item-price">$${item.price.toFixed(2)} × ${item.quantity}</div>
                </div>
                <div class="text-end">
                  <div class="fw-bold mb-2">$${itemTotal}</div>
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
      const quantityInputs = document.querySelectorAll(".quantity-input")
  
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
    if (subtotalElement) subtotalElement.textContent = `$${currentOrder.subtotal.toFixed(2)}`
    if (taxElement) taxElement.textContent = `$${currentOrder.tax.toFixed(2)}`
    if (totalElement) totalElement.textContent = `$${currentOrder.total.toFixed(2)}`
  }
  
  // Calculate order totals
  function calculateOrderTotals() {
    // Calculate subtotal
    currentOrder.subtotal = currentOrder.items.reduce((total, item) => {
      return total + item.price * item.quantity
    }, 0)
  
    // Calculate tax (10%)
    currentOrder.tax = currentOrder.subtotal * 0.1
  
    // Calculate total
    currentOrder.total = currentOrder.subtotal + currentOrder.tax - currentOrder.discount
  
    // Ensure total is not negative
    if (currentOrder.total < 0) {
      currentOrder.total = 0
    }
  }
  
  // Open payment modal
  function openPaymentModal() {
    // Update modal totals
    modalSubtotal.textContent = `$${currentOrder.subtotal.toFixed(2)}`
    modalTax.textContent = `$${currentOrder.tax.toFixed(2)}`
    modalDiscount.textContent = `$${currentOrder.discount.toFixed(2)}`
    modalTotal.textContent = `$${currentOrder.total.toFixed(2)}`
  
    // Set amount tendered to match total by default
    amountTenderedInput.value = currentOrder.total.toFixed(2)
    calculateChange()
  
    // Show modal
    if (paymentModal) {
      paymentModal.show()
    }
  }
  
  // Calculate change
  function calculateChange() {
    const amountTendered = Number.parseFloat(amountTenderedInput.value) || 0
    const change = amountTendered - currentOrder.total
  
    changeAmountInput.value = change > 0 ? change.toFixed(2) : "0.00"
  }
  
  function showAlert(type, message) {
    const alertContainer = document.getElementById("alert-container")
    if (!alertContainer) {
      console.error("Alert container not found")
      return
    }
  
    const alertDiv = document.createElement("div")
    alertDiv.className = `alert alert-${type} alert-dismissible fade show`
    alertDiv.innerHTML = `
          ${message}
          <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
      `
  
    alertContainer.appendChild(alertDiv)
  
    // Automatically close the alert after 5 seconds
    setTimeout(() => {
      alertDiv.remove()
    }, 5000)
  }
  
  // Complete payment
  function completePayment() {
    // Get customer information
    const customerName = document.getElementById("customerName").value || "Guest"
  
    // Get payment method
    const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked').value
  
    // Generate order number
    const orderNumber = "PG-" + Math.floor(10000 + Math.random() * 90000)
  
    // Get current date and time
    const now = new Date()
    const dateString = now.toLocaleDateString()
    const timeString = now.toLocaleTimeString()
  
    // Update receipt information
    receiptOrderNumber.textContent = orderNumber
    receiptDate.textContent = `${dateString} ${timeString}`
    receiptCustomer.textContent = customerName
  
    // Update receipt items
    let receiptItemsHtml = ""
  
    currentOrder.items.forEach((item) => {
      const itemTotal = (item.price * item.quantity).toFixed(2)
  
      receiptItemsHtml += `
          <div class="receipt-item">
            <span class="receipt-item-name">${item.quantity} × ${item.name}</span>
            <span class="receipt-item-price">$${itemTotal}</span>
          </div>
        `
    })
  
    receiptItems.innerHTML = receiptItemsHtml
  
    // Update receipt totals
    receiptSubtotal.textContent = `$${currentOrder.subtotal.toFixed(2)}`
    receiptTax.textContent = `$${currentOrder.tax.toFixed(2)}`
    receiptDiscount.textContent = `$${currentOrder.discount.toFixed(2)}`
    receiptTotal.textContent = `$${currentOrder.total.toFixed(2)}`
    receiptPaymentMethod.textContent = paymentMethod.charAt(0).toUpperCase() + paymentMethod.slice(1)
  
    // Hide payment modal and show receipt modal
    if (paymentModal) {
      paymentModal.hide()
    }
    if (receiptModal) {
      receiptModal.show()
    }
  
    // Save transaction to database
    saveTransaction(orderNumber, customerName, paymentMethod)
  
    // Clear order after payment
    clearOrder()
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
              .receipt-item {
                display: flex;
                justify-content: space-between;
                margin-bottom: 5px;
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
  
  // Initialize on page load
  loadProducts()
  
  // This file extends the POS functionality to integrate with the database
  
  // Function to save transaction to database
  function saveTransaction(orderNumber, customerName, paymentMethod) {
    // Prepare transaction data
    const transactionData = {
      orderNumber,
      customerName,
      paymentMethod,
      items: currentOrder.items,
      subtotal: currentOrder.subtotal,
      tax: currentOrder.tax,
      discount: currentOrder.discount,
      total: currentOrder.total,
      date: new Date().toISOString(),
    }
  
    // Send data to server
    fetch("save_transaction.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(transactionData),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          console.log("Transaction saved successfully:", data)
          // You could show a success message here
        } else {
          console.error("Error saving transaction:", data.error)
          showAlert("danger", "Error saving transaction: " + data.error)
        }
      })
      .catch((error) => {
        console.error("Network error:", error)
        showAlert("danger", "Network error when saving transaction")
      })
  }
  
  // Function to check stock availability
  function checkStockAvailability(productId, requestedQuantity) {
    const product = productsData.find((p) => p.id === productId)
    if (!product) return false
  
    return product.stock >= requestedQuantity
  }
  
  // Function to refresh product data
  function refreshProductData() {
    // Fetch updated product data from server
    fetch("fetch_inventory.php")
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          // Update products data
          productsData = data.products.map((product) => ({
            id: product.product_id,
            name: product.product_name,
            price: Number.parseFloat(product.price),
            category: product.category.toLowerCase(),
            image: product.product_photo || "/placeholder.svg?height=100&width=100",
            stock: Number.parseInt(product.stocks),
            status: product.status,
          }))
  
          // Reload products with current filters
          const activeCategory = document.querySelector(".category-tabs button.active")
          const category = activeCategory ? activeCategory.getAttribute("data-category") : "all"
          loadProducts(category, searchInput.value)
  
          console.log("Product data refreshed")
        } else {
          console.error("Error refreshing product data:", data.error)
        }
      })
      .catch((error) => {
        console.error("Network error when refreshing products:", error)
      })
  }
  
  // Override the completePayment function to update stock
  const originalCompletePayment = completePayment
  completePayment = () => {
    // Call the original function
    originalCompletePayment()
  
    // Refresh product data after transaction
    setTimeout(refreshProductData, 1000)
  }
  
  // Add event listener to refresh button if it exists
  document.addEventListener("DOMContentLoaded", () => {
    const refreshButton = document.getElementById("refresh-products")
    if (refreshButton) {
      refreshButton.addEventListener("click", refreshProductData)
    }
  })
  
  