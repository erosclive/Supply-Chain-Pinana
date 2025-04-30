// Global variables for pricing management
let completedOrders = []
let productPrices = {}
let priceHistory = {}

// Initialize the pricing tab
document.addEventListener("DOMContentLoaded", () => {
  console.log("Initializing pricing tab")

  // Set up tab change event listeners
  setupPricingTabListeners()

  // Set up event listeners for pricing tab
  setupPricingEventListeners()
})

// Set up tab change event listeners for pricing
function setupPricingTabListeners() {
  const pricingTab = document.getElementById("pricing-tab")
  if (pricingTab) {
    pricingTab.addEventListener("shown.bs.tab", () => {
      // Load completed orders when switching to pricing tab
      fetchCompletedOrdersForPricing()
    })
  }
}

// Set up event listeners for pricing tab
function setupPricingEventListeners() {
  // Refresh button for pricing tab
  const refreshPricingBtn = document.getElementById("refresh-pricing-btn")
  if (refreshPricingBtn) {
    refreshPricingBtn.addEventListener("click", fetchCompletedOrdersForPricing)
  }

  // Search functionality for pricing tab
  const pricingSearch = document.getElementById("pricing-search")
  if (pricingSearch) {
    pricingSearch.addEventListener("input", function () {
      const searchTerm = this.value.toLowerCase().trim()
      filterPricingOrders(searchTerm)
    })
  }

  // Event delegation for price history buttons and save price buttons
  document.addEventListener("click", (e) => {
    // Handle price history button clicks
    if (e.target.closest(".price-history-btn")) {
      const productId = e.target.closest(".price-history-btn").getAttribute("data-product-id")
      showPriceHistoryModal(productId)
    }

    // Handle save price button clicks
    if (e.target.closest(".save-price-btn")) {
      const btn = e.target.closest(".save-price-btn")
      const productId = btn.getAttribute("data-product-id")
      const orderId = btn.getAttribute("data-order-id")
      const priceInput = document.getElementById(`price-input-${productId}-${orderId}`)

      if (priceInput) {
        const newPrice = Number.parseFloat(priceInput.value)
        if (!isNaN(newPrice) && newPrice > 0) {
          updateProductPrice(productId, orderId, newPrice)
        } else {
          showResponseMessage("danger", "Please enter a valid price")
        }
      }
    }
  })
}

// Fetch completed orders for pricing tab
function fetchCompletedOrdersForPricing() {
  const pricingContainer = document.getElementById("pricing-container")
  if (!pricingContainer) {
    console.error("Pricing container not found")
    return
  }

  // Show loading indicator
  pricingContainer.innerHTML = `
    <div class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <div class="mt-3">Loading completed orders...</div>
    </div>
  `

  // Fetch completed orders from server
  fetch("fetch_completed_orders_for_pricing.php")
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.status}`)
      }
      return response.json()
    })
    .then((data) => {
      console.log("Fetch completed orders response:", data)
      if (data.success) {
        // Store orders
        completedOrders = data.orders || []
        console.log("Number of completed orders for pricing:", completedOrders.length)

        // Store product prices
        productPrices = data.product_prices || {}

        // Store price history
        priceHistory = data.price_history || {}

        // Render orders for pricing
        renderOrdersForPricing(completedOrders)
      } else {
        throw new Error(data.message || "Failed to fetch completed orders for pricing")
      }
    })
    .catch((error) => {
      console.error("Error fetching completed orders for pricing:", error)
      pricingContainer.innerHTML = `
        <div class="alert alert-danger" role="alert">
          <i class="bi bi-exclamation-triangle-fill me-2"></i>
          Error loading completed orders: ${error.message}
          <button class="btn btn-outline-danger btn-sm ms-3" onclick="fetchCompletedOrdersForPricing()">
            <i class="bi bi-arrow-clockwise me-1"></i> Try Again
          </button>
        </div>
      `
    })
}

// Render orders for pricing
function renderOrdersForPricing(orders) {
  const pricingContainer = document.getElementById("pricing-container")
  if (!pricingContainer) {
    console.error("Pricing container not found in renderOrdersForPricing")
    return
  }

  // Clear the container
  pricingContainer.innerHTML = ""

  // If no orders, show a message
  if (!orders || orders.length === 0) {
    pricingContainer.innerHTML = `
      <div class="alert alert-info" role="alert">
        <i class="bi bi-info-circle me-2"></i>
        No completed orders found. Complete an order to set pricing.
      </div>
    `
    return
  }

  // Create accordion for orders
  const accordion = document.createElement("div")
  accordion.className = "accordion"
  accordion.id = "pricingAccordion"

  // Loop through orders and create accordion items
  orders.forEach((order, index) => {
    const orderNumber = order.po_number || order.order_id
    const orderDate = new Date(order.created_at).toLocaleDateString()
    const accordionItemId = `order-${order.order_id}`

    // Count products in order
    const productCount = order.items ? order.items.length : 0

    // Create accordion item
    const accordionItem = document.createElement("div")
    accordionItem.className = "accordion-item order-card mb-3"

    // Create accordion header
    const accordionHeader = document.createElement("h2")
    accordionHeader.className = "accordion-header"
    accordionHeader.id = `heading-${accordionItemId}`

    // Create accordion button
    const accordionButton = document.createElement("button")
    accordionButton.className = "accordion-button collapsed"
    accordionButton.type = "button"
    accordionButton.setAttribute("data-bs-toggle", "collapse")
    accordionButton.setAttribute("data-bs-target", `#collapse-${accordionItemId}`)
    accordionButton.setAttribute("aria-expanded", "false")
    accordionButton.setAttribute("aria-controls", `collapse-${accordionItemId}`)

    // Set accordion button content
    accordionButton.innerHTML = `
      <div class="d-flex justify-content-between align-items-center w-100">
        <div>
          <span class="fw-bold">Order #${orderNumber}</span>
          <span class="badge bg-success ms-2">Completed</span>
        </div>
        <div class="d-flex align-items-center">
          <span class="text-muted me-3">${orderDate}</span>
          <span class="badge bg-primary">${productCount} Products</span>
        </div>
      </div>
    `

    // Append button to header
    accordionHeader.appendChild(accordionButton)

    // Create accordion collapse
    const accordionCollapse = document.createElement("div")
    accordionCollapse.className = "accordion-collapse collapse"
    accordionCollapse.id = `collapse-${accordionItemId}`
    accordionCollapse.setAttribute("aria-labelledby", `heading-${accordionItemId}`)
    accordionCollapse.setAttribute("data-bs-parent", "#pricingAccordion")

    // Create accordion body
    const accordionBody = document.createElement("div")
    accordionBody.className = "accordion-body"

    // Create table for products
    const table = document.createElement("table")
    table.className = "table table-hover"

    // Create table header
    const tableHeader = `
      <thead>
        <tr>
          <th>Product</th>
          <th>SKU</th>
          <th>Supplier Price</th>
          <th>Current Retail Price</th>
          <th>New Retail Price</th>
          <th>Profit Margin</th>
          <th>Actions</th>
        </tr>
      </thead>
    `

    // Create table body
    let tableBody = `<tbody>`

    // Add rows for each product
    if (order.items && order.items.length > 0) {
      order.items.forEach((item) => {
        const productId = item.product_id
        const productName = item.product_name || "Unknown Product"
        const supplierPrice = Number.parseFloat(item.unit_price)

        // Get current retail price from productPrices or use supplier price as default
        const currentRetailPrice = productPrices[productId]
          ? Number.parseFloat(productPrices[productId])
          : supplierPrice

        // Calculate profit margin
        const profitMargin = ((currentRetailPrice - supplierPrice) / supplierPrice) * 100
        const profitMarginClass =
          profitMargin > 0 ? "profit-positive" : profitMargin < 0 ? "profit-negative" : "profit-neutral"

        // Create table row
        tableBody += `
          <tr class="product-row" data-product-id="${productId}" data-order-id="${order.order_id}">
            <td>${productName}</td>
            <td>${productId}</td>
            <td>₱${supplierPrice.toFixed(2)}</td>
            <td>₱${currentRetailPrice.toFixed(2)}</td>
            <td>
              <div class="input-group input-group-sm">
                <span class="input-group-text">₱</span>
                <input type="number" class="form-control price-input" id="price-input-${productId}-${order.order_id}" 
                       value="${currentRetailPrice.toFixed(2)}" min="0" step="0.01">
              </div>
            </td>
            <td class="${profitMarginClass}">${profitMargin.toFixed(2)}%</td>
            <td>
              <button class="btn btn-sm btn-primary save-price-btn" data-product-id="${productId}" data-order-id="${order.order_id}">
                <i class="bi bi-save me-1"></i> Save
              </button>
              <button class="btn btn-sm btn-outline-secondary price-history-btn" data-product-id="${productId}">
                <i class="bi bi-clock-history me-1"></i> History
              </button>
            </td>
          </tr>
        `
      })
    } else {
      tableBody += `
        <tr>
          <td colspan="7" class="text-center">No products found in this order</td>
        </tr>
      `
    }

    tableBody += `</tbody>`

    // Set table content
    table.innerHTML = tableHeader + tableBody

    // Append table to accordion body
    accordionBody.appendChild(table)

    // Append body to collapse
    accordionCollapse.appendChild(accordionBody)

    // Append header and collapse to accordion item
    accordionItem.appendChild(accordionHeader)
    accordionItem.appendChild(accordionCollapse)

    // Append accordion item to accordion
    accordion.appendChild(accordionItem)
  })

  // Append accordion to pricing container
  pricingContainer.appendChild(accordion)
}

// Filter pricing orders based on search term
function filterPricingOrders(searchTerm) {
  if (!completedOrders || completedOrders.length === 0) return

  if (searchTerm === "") {
    // If search term is empty, show all orders
    renderOrdersForPricing(completedOrders)
    return
  }

  // Filter orders based on search term
  const filteredOrders = completedOrders.filter((order) => {
    // Check if order number or date matches
    const orderNumber = (order.po_number || order.order_id).toString().toLowerCase()
    const orderDate = new Date(order.created_at).toLocaleDateString().toLowerCase()

    if (orderNumber.includes(searchTerm) || orderDate.includes(searchTerm)) {
      return true
    }

    // Check if any product in the order matches
    if (order.items && order.items.length > 0) {
      return order.items.some((item) => {
        const productName = (item.product_name || "").toLowerCase()
        const productId = (item.product_id || "").toLowerCase()
        return productName.includes(searchTerm) || productId.includes(searchTerm)
      })
    }

    return false
  })

  // Render filtered orders
  renderOrdersForPricing(filteredOrders)
}

// Update product price
function updateProductPrice(productId, orderId, newPrice) {
  // Show loading state
  const saveBtn = document.querySelector(`.save-price-btn[data-product-id="${productId}"][data-order-id="${orderId}"]`)
  if (saveBtn) {
    saveBtn.disabled = true
    saveBtn.innerHTML =
      '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Saving...'
  }

  // Prepare data for the request
  const data = {
    product_id: productId,
    order_id: orderId,
    price: newPrice,
  }

  // Send request to update price
  fetch("update_product_price.php", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        // Update local data
        productPrices[productId] = newPrice

        // Update UI
        updatePriceUI(productId, orderId, newPrice)

        // Show success message
        showResponseMessage("success", data.message || "Price updated successfully")
      } else {
        throw new Error(data.message || "Failed to update price")
      }
    })
    .catch((error) => {
      console.error("Error updating price:", error)
      showResponseMessage("danger", `Error updating price: ${error.message}`)
    })
    .finally(() => {
      // Reset button state
      if (saveBtn) {
        saveBtn.disabled = false
        saveBtn.innerHTML = '<i class="bi bi-save me-1"></i> Save'
      }
    })
}

// Update price UI after successful price update
function updatePriceUI(productId, orderId, newPrice) {
  // Find all rows for this product (could be in multiple orders)
  const productRows = document.querySelectorAll(`.product-row[data-product-id="${productId}"]`)

  productRows.forEach((row) => {
    // Update current retail price cell
    const currentPriceCell = row.cells[3]
    if (currentPriceCell) {
      currentPriceCell.textContent = `₱${newPrice.toFixed(2)}`
    }

    // Update price input value
    const priceInput = row.querySelector(".price-input")
    if (priceInput) {
      priceInput.value = newPrice.toFixed(2)
    }

    // Update profit margin
    const supplierPriceText = row.cells[2].textContent
    const supplierPrice = Number.parseFloat(supplierPriceText.replace("₱", ""))
    const profitMargin = ((newPrice - supplierPrice) / supplierPrice) * 100
    const profitMarginClass =
      profitMargin > 0 ? "profit-positive" : profitMargin < 0 ? "profit-negative" : "profit-neutral"

    const profitMarginCell = row.cells[5]
    if (profitMarginCell) {
      profitMarginCell.textContent = `${profitMargin.toFixed(2)}%`
      profitMarginCell.className = profitMarginClass
    }

    // Add highlight animation to the row
    row.classList.add("price-changed")
    setTimeout(() => {
      row.classList.remove("price-changed")
    }, 2000)
  })
}

// Show price history modal
function showPriceHistoryModal(productId) {
  // Get product name
  let productName = "Unknown Product"
  completedOrders.forEach((order) => {
    if (order.items) {
      const product = order.items.find((item) => item.product_id === productId)
      if (product) {
        productName = product.product_name || "Unknown Product"
      }
    }
  })

  // Get modal elements
  const modal = document.getElementById("priceHistoryModal")
  const modalTitle = document.getElementById("priceHistoryModalLabel")
  const modalBody = document.getElementById("priceHistoryModalBody")

  // Set modal title
  modalTitle.innerHTML = `<i class="bi bi-clock-history me-2"></i> Price History: ${productName} (${productId})`

  // Show loading state
  modalBody.innerHTML = `
    <div class="text-center py-4">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p class="mt-2">Loading price history...</p>
    </div>
  `

  // Show the modal
  const bsModal = new bootstrap.Modal(modal)
  bsModal.show()

  // Fetch price history from server
  fetch(`get_price_history.php?product_id=${productId}`)
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        // Render price history
        renderPriceHistory(modalBody, data.history, productId)
      } else {
        throw new Error(data.message || "Failed to fetch price history")
      }
    })
    .catch((error) => {
      console.error("Error fetching price history:", error)
      modalBody.innerHTML = `
        <div class="alert alert-danger">
          <i class="bi bi-exclamation-triangle-fill me-2"></i>
          Error loading price history: ${error.message}
        </div>
      `
    })
}

// Render price history in modal
function renderPriceHistory(modalBody, history, productId) {
  // If no history, show a message
  if (!history || history.length === 0) {
    modalBody.innerHTML = `
      <div class="alert alert-info">
        <i class="bi bi-info-circle-fill me-2"></i>
        No price history found for this product.
      </div>
    `
    return
  }

  // Create table for price history
  let tableHtml = `
    <div class="table-responsive">
      <table class="table table-hover">
        <thead>
          <tr>
            <th>Date</th>
            <th>Previous Price</th>
            <th>New Price</th>
            <th>Change</th>
            <th>Updated By</th>
          </tr>
        </thead>
        <tbody>
  `

  // Add rows for each price change
  history.forEach((item) => {
    const date = new Date(item.created_at).toLocaleString()
    const previousPrice = Number.parseFloat(item.previous_price)
    const newPrice = Number.parseFloat(item.new_price)
    const change = newPrice - previousPrice
    const changePercent = (change / previousPrice) * 100

    const changeClass = change > 0 ? "profit-positive" : change < 0 ? "profit-negative" : "profit-neutral"
    const changeIcon =
      change > 0 ? "bi-arrow-up-circle-fill" : change < 0 ? "bi-arrow-down-circle-fill" : "bi-dash-circle-fill"

    tableHtml += `
      <tr>
        <td>${date}</td>
        <td>₱${previousPrice.toFixed(2)}</td>
        <td>₱${newPrice.toFixed(2)}</td>
        <td class="${changeClass}">
          <i class="bi ${changeIcon} me-1"></i>
          ${Math.abs(change).toFixed(2)} (${changePercent.toFixed(2)}%)
        </td>
        <td>${item.updated_by || "System"}</td>
      </tr>
    `
  })

  tableHtml += `
        </tbody>
      </table>
    </div>
  `

  // Set modal body content
  modalBody.innerHTML = tableHtml
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
        const bsAlert = bootstrap.Alert.getInstance(responseMessage)
        if (bsAlert) {
          bsAlert.close()
        } else {
          responseMessage.style.display = "none"
        }
      } catch (error) {
        console.error("Bootstrap Alert error:", error)
        // Fallback to removing the element if Bootstrap Alert fails
        responseMessage.style.display = "none"
      }
    }
  }, 5000)
}
