// Global variables
let completedOrders = []
let inventoryProducts = []

// Declare bootstrap variable if it's not already declared
if (typeof bootstrap === "undefined") {
  bootstrap = window.bootstrap
}

// Initialize the inventory page
document.addEventListener("DOMContentLoaded", () => {
  console.log("Initializing inventory page")

  // Set up tab change event listeners
  setupTabListeners()

  // Fetch products for the products tab (since it's active by default)
  fetchProducts()

  // Set up event listeners
  setupEventListeners()
})

// Set up tab change event listeners
function setupTabListeners() {
  const tabs = document.querySelectorAll('button[data-bs-toggle="tab"]')
  tabs.forEach((tab) => {
    tab.addEventListener("shown.bs.tab", (event) => {
      const targetId = event.target.getAttribute("data-bs-target")
      if (targetId === "#products") {
        // Refresh products when switching to products tab
        fetchProducts()
      } else if (targetId === "#consignment") {
        // Refresh consignment orders when switching to consignment tab
        fetchCompletedOrders()
      }
    })
  })
}

// Fetch completed orders from the server
function fetchCompletedOrders() {
  const inventoryContainer = document.getElementById("consignment-inventory-container")
  if (!inventoryContainer) {
    console.error("Inventory container not found")
    return
  }

  // Show loading indicator
  inventoryContainer.innerHTML = `
        <div class="text-center py-5">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
            <div class="mt-3">Loading consignment inventory...</div>
        </div>
    `

  // Fetch completed orders from server
  fetch("fetch_completed_orders.php")
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.status}`)
      }
      return response.json()
    })
    .then((data) => {
      if (data.success) {
        // Store orders
        completedOrders = data.orders || []
        console.log("Number of completed orders:", completedOrders.length)

        // Render orders
        renderCompletedOrders(completedOrders)
      } else {
        throw new Error(data.message || "Failed to fetch completed orders")
      }
    })
    .catch((error) => {
      console.error("Error fetching completed orders:", error)
      inventoryContainer.innerHTML = `
                <div class="alert alert-danger" role="alert">
                    <i class="bi bi-exclamation-triangle-fill me-2"></i>
                    Error loading consignment inventory: ${error.message}
                    <button class="btn btn-outline-danger btn-sm ms-3" onclick="fetchCompletedOrders()">
                        <i class="bi bi-arrow-clockwise me-1"></i> Try Again
                    </button>
                </div>
            `
    })
}

// Fetch products from the server
function fetchProducts() {
  const productsContainer = document.getElementById("products-inventory-container")
  if (!productsContainer) {
    console.error("Products container not found")
    return
  }

  // Show loading indicator
  productsContainer.innerHTML = `
        <div class="text-center py-5">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
            <div class="mt-3">Loading product inventory...</div>
        </div>
    `

  // Fetch products from server
  fetch("fetch_products.php")
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.status}`)
      }
      return response.json()
    })
    .then((data) => {
      if (data.success) {
        // Store products
        inventoryProducts = data.products || []
        console.log("Number of products:", inventoryProducts.length)

        // Render products
        renderProducts(inventoryProducts)
      } else {
        throw new Error(data.message || "Failed to fetch products")
      }
    })
    .catch((error) => {
      console.error("Error fetching products:", error)
      productsContainer.innerHTML = `
                <div class="alert alert-danger" role="alert">
                    <i class="bi bi-exclamation-triangle-fill me-2"></i>
                    Error loading product inventory: ${error.message}
                    <button class="btn btn-outline-danger btn-sm ms-3" onclick="fetchProducts()">
                        <i class="bi bi-arrow-clockwise me-1"></i> Try Again
                    </button>
                </div>
            `
    })
}

// Group products by product_id
function groupProductsByProductId(products) {
  const groupedProducts = {}

  products.forEach((product) => {
    const productId = product.product_id

    if (!groupedProducts[productId]) {
      groupedProducts[productId] = {
        ...product,
        orders: [],
        total_quantity: 0,
      }
    }

    // Add order info if not already added
    const orderExists = groupedProducts[productId].orders.some((order) => order.order_id === product.order_id)
    if (!orderExists) {
      groupedProducts[productId].orders.push({
        order_id: product.order_id,
        po_number: product.po_number,
        quantity: product.quantity,
      })
    }

    // Sum up quantities
    groupedProducts[productId].total_quantity += Number.parseInt(product.quantity)
  })

  return Object.values(groupedProducts)
}

// Render products in a grid
function renderProducts(products) {
  const productsContainer = document.getElementById("products-inventory-container")
  if (!productsContainer) {
    console.error("Products container not found in renderProducts")
    return
  }

  // Clear the container
  productsContainer.innerHTML = ""

  // If no products, show a message
  if (!products || products.length === 0) {
    productsContainer.innerHTML = `
            <div class="alert alert-info" role="alert">
                <i class="bi bi-info-circle me-2"></i>
                No products found in completed orders.
            </div>
        `
    return
  }

  // Group products by product_id
  const groupedProducts = groupProductsByProductId(products)

  // Create a row for the product cards
  const row = document.createElement("div")
  row.className = "row g-3"

  // Loop through grouped products and create cards
  groupedProducts.forEach((product) => {
    // Get product image path or use placeholder
    const productImage = `uploads/product_${product.product_id}.jpg`

    // Determine stock status and badge color
    let stockStatusClass = "bg-success"
    let stockStatusText = "In Stock"

    if (product.available_stock <= 0) {
      stockStatusClass = "bg-danger"
      stockStatusText = "Out of Stock"
    } else if (product.available_stock < 5) {
      stockStatusClass = "bg-warning"
      stockStatusText = "Low Stock"
    }

    // Format price
    const formattedPrice = product.unit_price_formatted || `₱${Number.parseFloat(product.price).toFixed(2)}`

    // Create the card HTML
    const cardHtml = `
            <div class="col-md-6 col-lg-4 col-xl-3 mb-3">
                <div class="card product-card h-100">
                    <div class="product-image-container">
                        <img src="${productImage}" class="card-img-top product-image" alt="${product.product_name}" onerror="this.src='assets/placeholder-product.jpg'">
                        <span class="badge ${stockStatusClass} position-absolute top-0 end-0 m-2">${stockStatusText}</span>
                        <span class="ordered-quantity-badge">${product.total_quantity}</span>
                    </div>
                    <div class="card-body">
                        <h5 class="card-title product-name">${product.product_name}</h5>
                        <div class="product-details">
                            <div class="mb-2 d-flex justify-content-between">
                                <span class="text-muted">SKU:</span>
                                <span class="fw-medium">${product.product_id}</span>
                            </div>
                            <div class="mb-2 d-flex justify-content-between">
                                <span class="text-muted">Price:</span>
                                <span class="fw-bold">${formattedPrice}</span>
                            </div>
                            <div class="mb-2 d-flex justify-content-between">
                                <span class="text-muted">Category:</span>
                                <span>${product.category || "N/A"}</span>
                            </div>
                            <div class="mb-2 d-flex justify-content-between">
                                <span class="text-muted">Ordered Quantity:</span>
                                <span class="fw-bold text-primary">${product.total_quantity}</span>
                            </div>
                            <div class="mb-2 d-flex justify-content-between">
                                <span class="text-muted">In Orders:</span>
                                <span>${product.orders.length}</span>
                            </div>
                        </div>
                    </div>
                    <div class="card-footer">
                        <button class="btn btn-primary btn-sm view-product-btn" data-id="${product.product_id}">
                            <i class="bi bi-eye me-1"></i> View Details
                        </button>
                    </div>
                </div>
            </div>
        `

    // Add the card to the row
    row.innerHTML += cardHtml
  })

  // Add the row to the container
  productsContainer.appendChild(row)

  // Set up event listeners for the view product buttons
  setupViewProductButtons()
}

// Render completed orders as horizontal cards
function renderCompletedOrders(orders) {
  const inventoryContainer = document.getElementById("consignment-inventory-container")
  if (!inventoryContainer) {
    console.error("Inventory container not found in renderCompletedOrders")
    return
  }

  // Clear the container
  inventoryContainer.innerHTML = ""

  // If no orders, show a message
  if (!orders || orders.length === 0) {
    inventoryContainer.innerHTML = `
            <div class="alert alert-info" role="alert">
                <i class="bi bi-info-circle me-2"></i>
                No completed orders found in consignment inventory.
            </div>
        `
    return
  }

  // Create a row for the cards
  const row = document.createElement("div")
  row.className = "row g-3"

  // Loop through orders and create cards
  orders.forEach((order) => {
    // Get order number (PO number or order ID)
    const orderNumber = order.po_number || order.order_id

    // Get consignment term
    const consignmentTerm = order.consignment_term || 30 // Default to 30 days if not set

    // Calculate days remaining
    const daysRemaining = order.days_remaining

    // Calculate days since start
    const daysSinceStart = order.days_since_start

    // Determine status color based on days remaining
    let statusClass = "bg-success"
    let statusText = "Active"

    if (daysRemaining < 0) {
      statusClass = "bg-danger"
      statusText = "Expired"
    } else if (daysRemaining < 7) {
      statusClass = "bg-warning"
      statusText = "Ending Soon"
    }

    // Format dates
    const startDate = new Date(order.created_at).toLocaleDateString()
    const endDate = new Date(
      new Date(order.created_at).getTime() + consignmentTerm * 24 * 60 * 60 * 1000,
    ).toLocaleDateString()

    // Create the card HTML
    const cardHtml = `
            <div class="col-md-6 col-lg-4 mb-3">
                <div class="card consignment-card h-100">
                    <div class="card-header d-flex justify-content-between align-items-center">
                        <h6 class="mb-0">
                            <i class="bi bi-box me-2"></i> Order #${orderNumber}
                        </h6>
                        <span class="badge ${statusClass}">${statusText}</span>
                    </div>
                    <div class="card-body">
                        <div class="mb-3">
                            <div class="d-flex justify-content-between mb-2">
                                <span class="text-muted"><i class="bi bi-calendar-check me-1"></i> Consignment Term:</span>
                                <span class="fw-medium">${consignmentTerm} days</span>
                            </div>
                            <div class="d-flex justify-content-between mb-2">
                                <span class="text-muted"><i class="bi bi-calendar-date me-1"></i> Start Date:</span>
                                <span class="fw-medium">${startDate}</span>
                            </div>
                            <div class="d-flex justify-content-between mb-2">
                                <span class="text-muted"><i class="bi bi-calendar-date me-1"></i> End Date:</span>
                                <span class="fw-medium">${endDate}</span>
                            </div>
                            <div class="d-flex justify-content-between mb-2">
                                <span class="text-muted"><i class="bi bi-clock-history me-1"></i> Days Since Start:</span>
                                <span class="fw-medium">${daysSinceStart} days</span>
                            </div>
                            <div class="d-flex justify-content-between">
                                <span class="text-muted"><i class="bi bi-clock me-1"></i> Days Remaining:</span>
                                <span class="fw-bold ${daysRemaining < 0 ? "text-danger" : daysRemaining < 7 ? "text-warning" : "text-success"}">
                                    ${daysRemaining < 0 ? "Expired" : daysRemaining + " days"}
                                </span>
                            </div>
                        </div>
                        
                        <div class="progress mb-3" style="height: 10px;">
                            <div class="progress-bar ${statusClass}" role="progressbar" 
                                style="width: ${Math.min(100, (daysSinceStart / consignmentTerm) * 100)}%;" 
                                aria-valuenow="${daysSinceStart}" 
                                aria-valuemin="0" 
                                aria-valuemax="${consignmentTerm}">
                            </div>
                        </div>
                        
                        <div class="d-flex justify-content-between align-items-center">
                            <span class="text-muted small">Total Items: ${order.items ? order.items.length : 0}</span>
                            <span class="fw-bold">₱${Number.parseFloat(order.total_amount).toFixed(2)}</span>
                        </div>
                    </div>
                    <div class="card-footer">
                        <button class="btn btn-primary btn-sm view-details-btn" data-id="${order.order_id}">
                            <i class="bi bi-eye me-1"></i> View Details
                        </button>
                    </div>
                </div>
            </div>
        `

    // Add the card to the row
    row.innerHTML += cardHtml
  })

  // Add the row to the container
  inventoryContainer.appendChild(row)

  // Set up event listeners for the view details buttons
  setupViewDetailsButtons()
}

// Set up event listeners
function setupEventListeners() {
  // Add any general event listeners here

  // Example: Refresh buttons
  const refreshConsignmentBtn = document.getElementById("refresh-inventory-btn")
  if (refreshConsignmentBtn) {
    refreshConsignmentBtn.addEventListener("click", fetchCompletedOrders)
  }

  const refreshProductsBtn = document.getElementById("refresh-products-btn")
  if (refreshProductsBtn) {
    refreshProductsBtn.addEventListener("click", fetchProducts)
  }

  // Product search functionality
  const productSearch = document.getElementById("product-search")
  if (productSearch) {
    productSearch.addEventListener("input", function () {
      const searchTerm = this.value.toLowerCase().trim()
      if (searchTerm === "") {
        renderProducts(inventoryProducts)
      } else {
        const filteredProducts = inventoryProducts.filter(
          (product) =>
            product.product_name.toLowerCase().includes(searchTerm) ||
            product.product_id.toLowerCase().includes(searchTerm) ||
            (product.category && product.category.toLowerCase().includes(searchTerm)),
        )
        renderProducts(filteredProducts)
      }
    })
  }
}

// Set up view details buttons for consignment orders
function setupViewDetailsButtons() {
  const viewDetailsButtons = document.querySelectorAll(".view-details-btn")
  viewDetailsButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const orderId = this.getAttribute("data-id")
      showConsignmentDetailsModal(orderId)
    })
  })
}

// Set up view product buttons
function setupViewProductButtons() {
  const viewProductButtons = document.querySelectorAll(".view-product-btn")
  viewProductButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const productId = this.getAttribute("data-id")
      showProductDetailsModal(productId)
    })
  })
}

// Show product details modal
function showProductDetailsModal(productId) {
    // Find all instances of this product in inventoryProducts
    const productInstances = inventoryProducts.filter((p) => p.product_id === productId)
  
    if (!productInstances || productInstances.length === 0) {
      showResponseMessage("danger", "Product not found")
      return
    }
  
    // Use the first instance for basic product info
    const product = productInstances[0]
  
    // Create modal if it doesn't exist
    let productModal = document.getElementById("productDetailsModal")
    if (!productModal) {
      productModal = document.createElement("div")
      productModal.className = "modal fade"
      productModal.id = "productDetailsModal"
      productModal.tabIndex = "-1"
      productModal.setAttribute("aria-labelledby", "productDetailsModalLabel")
      productModal.setAttribute("aria-hidden", "true")
  
      productModal.innerHTML = `
        <div class="modal-dialog modal-dialog-centered modal-lg">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="productDetailsModalLabel">
                <i class="bi bi-box-seam me-2"></i> Product Details
              </h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body" id="productDetailsModalBody">
              <!-- Content will be dynamically inserted here -->
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
            </div>
          </div>
        </div>
      `
  
      document.body.appendChild(productModal)
    }
  
    // Get product image path or use placeholder
    const productImage = `uploads/product_${product.product_id}.jpg`
  
    // Determine stock status and badge color
    let stockStatusClass = "bg-success"
    let stockStatusText = "In Stock"
  
    if (product.available_stock <= 0) {
      stockStatusClass = "bg-danger"
      stockStatusText = "Out of Stock"
    } else if (product.available_stock < 5) {
      stockStatusClass = "bg-warning"
      stockStatusText = "Low Stock"
    }
  
    // Calculate total quantity across all orders
    const totalQuantity = productInstances.reduce((sum, p) => sum + Number.parseInt(p.quantity), 0)
  
    // Group by order
    const orderMap = new Map()
    productInstances.forEach((p) => {
      if (!orderMap.has(p.order_id)) {
        orderMap.set(p.order_id, {
          order_id: p.order_id,
          po_number: p.po_number || p.order_id,
          quantity: Number.parseInt(p.quantity),
          unit_price: p.unit_price,
          total_price: p.total_price,
        })
      } else {
        const order = orderMap.get(p.order_id)
        order.quantity += Number.parseInt(p.quantity)
        order.total_price = (Number.parseFloat(order.total_price) + Number.parseFloat(p.total_price)).toFixed(2)
      }
    })
  
    const orders = Array.from(orderMap.values())
  
    // Populate modal content with tabs
    const modalBody = document.getElementById("productDetailsModalBody")
    modalBody.innerHTML = `
      <ul class="nav nav-tabs" id="productDetailsTabs" role="tablist">
        <li class="nav-item" role="presentation">
          <button class="nav-link active" id="product-info-tab" data-bs-toggle="tab" data-bs-target="#product-info" 
                  type="button" role="tab" aria-controls="product-info" aria-selected="true">
            Product Info
          </button>
        </li>
        <li class="nav-item" role="presentation">
          <button class="nav-link" id="orders-tab" data-bs-toggle="tab" data-bs-target="#orders" 
                  type="button" role="tab" aria-controls="orders" aria-selected="false">
            Orders
          </button>
        </li>
        <li class="nav-item" role="presentation">
          <button class="nav-link" id="batch-details-tab" data-bs-toggle="tab" data-bs-target="#batch-details" 
                  type="button" role="tab" aria-controls="batch-details" aria-selected="false">
            Batch Details
          </button>
        </li>
      </ul>
      
      <div class="tab-content pt-3" id="productDetailsTabContent">
        <!-- Product Info Tab -->
        <div class="tab-pane fade show active" id="product-info" role="tabpanel" aria-labelledby="product-info-tab">
          <div class="row">
            <div class="col-md-4 text-center">
              <img src="${productImage}" class="product-detail-image mb-3" alt="${product.product_name}" 
                   onerror="this.src='assets/placeholder-product.jpg'" style="max-width: 100%; height: auto;">
              <span class="badge ${stockStatusClass} d-block mx-auto">${stockStatusText}</span>
            </div>
            <div class="col-md-8">
              <h4 class="mb-3">${product.product_name}</h4>
              
              <div class="card mb-3">
                <div class="card-header bg-light">
                  <h6 class="mb-0">Product Information</h6>
                </div>
                <div class="card-body">
                  <div class="mb-2 d-flex justify-content-between">
                    <span class="text-muted">SKU:</span>
                    <span class="fw-medium">${product.product_id}</span>
                  </div>
                  <div class="mb-2 d-flex justify-content-between">
                    <span class="text-muted">Price:</span>
                    <span class="fw-bold">${product.unit_price_formatted || `₱${Number.parseFloat(product.price).toFixed(2)}`}</span>
                  </div>
                  <div class="mb-2 d-flex justify-content-between">
                    <span class="text-muted">Category:</span>
                    <span>${product.category || "N/A"}</span>
                  </div>
                  <div class="mb-2 d-flex justify-content-between">
                    <span class="text-muted">Available Stock:</span>
                    <span class="${product.available_stock <= 0 ? "text-danger" : product.available_stock < 5 ? "text-warning" : "text-success"} fw-bold">
                      ${product.available_stock || "N/A"}
                    </span>
                  </div>
                  <div class="mb-2 d-flex justify-content-between">
                    <span class="text-muted">Total Ordered:</span>
                    <span class="fw-bold text-primary">${totalQuantity}</span>
                  </div>
                  <div class="mb-2 d-flex justify-content-between">
                    <span class="text-muted">In Orders:</span>
                    <span>${orders.length}</span>
                  </div>
                  <div class="mb-0 d-flex justify-content-between">
                    <span class="text-muted">Status:</span>
                    <span>${product.status || "N/A"}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Orders Tab -->
        <div class="tab-pane fade" id="orders" role="tabpanel" aria-labelledby="orders-tab">
          <div class="card">
            <div class="card-header bg-light">
              <h6 class="mb-0">Order Details</h6>
            </div>
            <div class="card-body p-0">
              <div class="table-responsive">
                <table class="table table-hover mb-0">
                  <thead class="table-light">
                    <tr>
                      <th>Order #</th>
                      <th>Quantity</th>
                      <th>Unit Price</th>
                      <th>Total</th>
                      <th>Batch Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${orders
                      .map(
                        (order) => `
                        <tr>
                          <td>${order.po_number}</td>
                          <td>${order.quantity}</td>
                          <td>₱${Number.parseFloat(order.unit_price).toFixed(2)}</td>
                          <td>₱${Number.parseFloat(order.total_price).toFixed(2)}</td>
                          <td>
                            <button class="btn btn-sm btn-outline-primary" 
                                onclick="showOrderProductBatchDetails('${order.order_id}', '${product.product_id}', '${product.product_name}')">
                                <i class="bi bi-box-seam me-1"></i> View Batches
                            </button>
                          </td>
                        </tr>
                      `,
                      )
                      .join("")}
                  </tbody>
                  <tfoot class="table-light">
                    <tr>
                      <td colspan="1" class="text-end fw-bold">Total:</td>
                      <td class="fw-bold">${totalQuantity}</td>
                      <td></td>
                      <td class="fw-bold">₱${orders.reduce((sum, order) => sum + Number.parseFloat(order.total_price), 0).toFixed(2)}</td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Batch Details Tab -->
        <div class="tab-pane fade" id="batch-details" role="tabpanel" aria-labelledby="batch-details-tab">
          <div class="alert alert-info mb-3">
            <i class="bi bi-info-circle-fill me-2"></i>
            This tab shows batch details for this product in completed orders. Click on "View Batches" in the Orders tab to see specific batch details for each order.
          </div>
          <div id="batch-details-content">
            <div class="text-center py-4">
              <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
              </div>
              <p class="mt-2">Loading batch details...</p>
            </div>
          </div>
        </div>
      </div>
    `
  
    // Show the modal
    try {
      // Ensure bootstrap is available
      if (typeof bootstrap !== "undefined") {
        const bsModal = new bootstrap.Modal(productModal)
        bsModal.show()
        
        // Load batch details for all orders of this product
        loadProductBatchDetails(product.product_id, product.product_name)
      } else {
        console.error("Bootstrap is not defined. Ensure it is properly loaded.")
        showResponseMessage("danger", "Bootstrap is not loaded. Please check your setup.")
      }
    } catch (error) {
      console.error("Bootstrap modal error:", error)
      showResponseMessage("danger", "Failed to open product details modal. Please check console for errors.")
    }
  }
  
  // Function to load batch details for a product across all orders
  function loadProductBatchDetails(productId, productName) {
    const batchDetailsContent = document.getElementById("batch-details-content")
    
    // Get all orders for this product
    const productInstances = inventoryProducts.filter((p) => p.product_id === productId)
    const orderIds = [...new Set(productInstances.map(p => p.order_id))]
    
    if (orderIds.length === 0) {
      batchDetailsContent.innerHTML = `
        <div class="alert alert-info">
          <i class="bi bi-info-circle-fill me-2"></i>
          No orders found for this product.
        </div>
      `
      return
    }
    
    // Create a container for batch details from all orders
    let allBatchDetails = []
    let loadedOrders = 0
    
    // Load batch details for each order
    orderIds.forEach(orderId => {
      fetch(`get_order_batch_details.php?order_id=${orderId}&product_id=${productId}`)
        .then(response => response.json())
        .then(data => {
          loadedOrders++
          
          if (data.success && data.batch_tracking_enabled && data.batch_details && data.batch_details.length > 0) {
            // Add order info to each batch detail
            const orderBatchDetails = data.batch_details.map(batch => ({
              ...batch,
              order_id: orderId,
              order_number: data.order.order_number,
              deduction_date: data.deduction_date
            }))
            
            allBatchDetails = [...allBatchDetails, ...orderBatchDetails]
          }
          
          // If all orders have been processed, render the batch details
          if (loadedOrders === orderIds.length) {
            renderAllBatchDetails(allBatchDetails, productName)
          }
        })
        .catch(error => {
          console.error(`Error fetching batch details for order ${orderId}:`, error)
          loadedOrders++
          
          // If all orders have been processed, render the batch details
          if (loadedOrders === orderIds.length) {
            renderAllBatchDetails(allBatchDetails, productName)
          }
        })
    })
  }
  
  // Function to render all batch details for a product
  function renderAllBatchDetails(batchDetails, productName) {
    const batchDetailsContent = document.getElementById("batch-details-content")
    
    if (batchDetails.length === 0) {
      batchDetailsContent.innerHTML = `
        <div class="alert alert-info">
          <i class="bi bi-info-circle-fill me-2"></i>
          No batch details found for this product in completed orders.
        </div>
      `
      return
    }
    
    // Group batch details by order
    const batchesByOrder = {}
    batchDetails.forEach(batch => {
      const orderId = batch.order_id
      if (!batchesByOrder[orderId]) {
        batchesByOrder[orderId] = {
          order_id: orderId,
          order_number: batch.order_number,
          deduction_date: batch.deduction_date,
          batches: []
        }
      }
      batchesByOrder[orderId].batches.push(batch)
    })
    
    // Render batch details grouped by order
    let html = `
      <h5 class="mb-3">${productName} - Batch Details from Completed Orders</h5>
    `
    
    Object.values(batchesByOrder).forEach(orderBatches => {
      const deductionDate = new Date(orderBatches.deduction_date).toLocaleString()
      
      html += `
        <div class="card mb-3">
          <div class="card-header bg-light">
            <h6 class="mb-0">Order #${orderBatches.order_number}</h6>
            <small class="text-muted">Deducted on: ${deductionDate}</small>
          </div>
          <div class="card-body p-0">
            <div class="table-responsive">
              <table class="table table-bordered table-hover mb-0">
                <thead class="table-light">
                  <tr>
                    <th>Batch Code</th>
                    <th>Quantity</th>
                    <th>Expiration Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
      `
      
      orderBatches.batches.forEach(batch => {
        // Format dates
        const expiryDate = batch.expiration_date ? new Date(batch.expiration_date) : null
        let expiryFormatted = "N/A"
        let statusClass = "bg-secondary"
        let statusText = "No Expiry"
        
        if (expiryDate && batch.expiration_date !== "0000-00-00") {
          expiryFormatted = expiryDate.toLocaleDateString()
          const today = new Date()
          
          if (expiryDate < today) {
            statusClass = "bg-danger"
            statusText = "Expired"
          } else {
            statusClass = "bg-success"
            statusText = "Valid"
          }
        }
        
        html += `
          <tr>
            <td>${batch.batch_code}</td>
            <td>${batch.deducted}</td>
            <td>${expiryFormatted}</td>
            <td><span class="badge ${statusClass}">${statusText}</span></td>
          </tr>
        `
      })
      
      html += `
                </tbody>
              </table>
            </div>
          </div>
        </div>
      `
    })
    
    batchDetailsContent.innerHTML = html
  }
// Show consignment details modal
function showConsignmentDetailsModal(orderId) {
  // Find the order in completedOrders
  const order = completedOrders.find((o) => o.order_id == orderId)

  if (!order) {
    showResponseMessage("danger", "Order not found")
    return
  }

  // Get order number (PO number or order ID)
  const orderNumber = order.po_number || order.order_id

  // Get consignment term
  const consignmentTerm = order.consignment_term || 30

  // Calculate days remaining
  const daysRemaining = order.days_remaining

  // Calculate days since start
  const daysSinceStart = order.days_since_start

  // Format dates
  const startDate = new Date(order.created_at).toLocaleDateString()
  const endDate = new Date(
    new Date(order.created_at).getTime() + consignmentTerm * 24 * 60 * 60 * 1000,
  ).toLocaleDateString()

  // Create modal if it doesn't exist
  let consignmentModal = document.getElementById("consignmentDetailsModal")
  if (!consignmentModal) {
    consignmentModal = document.createElement("div")
    consignmentModal.className = "modal fade"
    consignmentModal.id = "consignmentDetailsModal"
    consignmentModal.tabIndex = "-1"
    consignmentModal.setAttribute("aria-labelledby", "consignmentDetailsModalLabel")
    consignmentModal.setAttribute("aria-hidden", "true")

    consignmentModal.innerHTML = `
            <div class="modal-dialog modal-dialog-centered modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="consignmentDetailsModalLabel">
                            <i class="bi bi-box me-2"></i> Consignment Details
                        </h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body" id="consignmentDetailsModalBody">
                        <!-- Content will be dynamically inserted here -->
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                    </div>
                </div>
            </div>
        `

    document.body.appendChild(consignmentModal)
  }

  // Populate modal content
  const modalBody = document.getElementById("consignmentDetailsModalBody")

  // Determine status color based on days remaining
  let statusClass = "bg-success"
  let statusText = "Active"

  if (daysRemaining < 0) {
    statusClass = "bg-danger"
    statusText = "Expired"
  } else if (daysRemaining < 7) {
    statusClass = "bg-warning"
    statusText = "Ending Soon"
  }

  modalBody.innerHTML = `
        <div class="row mb-4">
            <div class="col-md-6">
                <div class="card">
                    <div class="card-header bg-light">
                        <h6 class="mb-0">Consignment Information</h6>
                    </div>
                    <div class="card-body">
                        <div class="mb-2 d-flex justify-content-between">
                            <span class="text-muted">Order #:</span>
                            <span class="fw-bold">${orderNumber}</span>
                        </div>
                        <div class="mb-2 d-flex justify-content-between">
                            <span class="text-muted">Status:</span>
                            <span class="badge ${statusClass}">${statusText}</span>
                        </div>
                        <div class="mb-2 d-flex justify-content-between">
                            <span class="text-muted">Consignment Term:</span>
                            <span>${consignmentTerm} days</span>
                        </div>
                        <div class="mb-2 d-flex justify-content-between">
                            <span class="text-muted">Start Date:</span>
                            <span>${startDate}</span>
                        </div>
                        <div class="mb-2 d-flex justify-content-between">
                            <span class="text-muted">End Date:</span>
                            <span>${endDate}</span>
                        </div>
                        <div class="mb-2 d-flex justify-content-between">
                            <span class="text-muted">Days Since Start:</span>
                            <span>${daysSinceStart} days</span>
                        </div>
                        <div class="mb-2 d-flex justify-content-between">
                            <span class="text-muted">Days Remaining:</span>
                            <span class="${daysRemaining < 0 ? "text-danger" : daysRemaining < 7 ? "text-warning" : "text-success"} fw-bold">
                                ${daysRemaining < 0 ? "Expired" : daysRemaining + " days"}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-md-6">
                <div class="card">
                    <div class="card-header bg-light">
                        <h6 class="mb-0">Order Information</h6>
                    </div>
                    <div class="card-body">
                        <div class="mb-2 d-flex justify-content-between">
                            <span class="text-muted">Retailer:</span>
                            <span>${order.retailer_name}</span>
                        </div>
                        <div class="mb-2 d-flex justify-content-between">
                            <span class="text-muted">Email:</span>
                            <span>${order.retailer_email}</span>
                        </div>
                        <div class="mb-2 d-flex justify-content-between">
                            <span class="text-muted">Contact:</span>
                            <span>${order.retailer_contact || "N/A"}</span>
                        </div>
                        <div class="mb-2 d-flex justify-content-between">
                            <span class="text-muted">Order Date:</span>
                            <span>${new Date(order.order_date).toLocaleDateString()}</span>
                        </div>
                        <div class="mb-2 d-flex justify-content-between">
                            <span class="text-muted">Delivery Mode:</span>
                            <span>${order.delivery_mode === "pickup" ? "Pickup" : "Delivery"}</span>
                        </div>
                        <div class="mb-2 d-flex justify-content-between">
                            <span class="text-muted">Total Amount:</span>
                            <span class="fw-bold">₱${Number.parseFloat(order.total_amount).toFixed(2)}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="card mb-4">
            <div class="card-header bg-light">
                <h6 class="mb-0">Consignment Progress</h6>
            </div>
            <div class="card-body">
                <div class="progress mb-3" style="height: 20px;">
                    <div class="progress-bar ${statusClass}" role="progressbar" 
                        style="width: ${Math.min(100, (daysSinceStart / consignmentTerm) * 100)}%;" 
                        aria-valuenow="${daysSinceStart}" 
                        aria-valuemin="0" 
                        aria-valuemax="${consignmentTerm}">
                        ${Math.round((daysSinceStart / consignmentTerm) * 100)}%
                    </div>
                </div>
                <div class="d-flex justify-content-between">
                    <span class="small">${startDate}</span>
                    <span class="small">${endDate}</span>
                </div>
            </div>
        </div>
        
        <div class="card">
            <div class="card-header bg-light">
                <h6 class="mb-0">Consigned Items</h6>
            </div>
            <div class="card-body p-0">
                <div class="table-responsive">
                    <table class="table table-hover mb-0">
                        <thead class="table-light">
                            <tr>
                                <th>#</th>
                                <th>Product</th>
                                <th>Quantity</th>
                                <th>Unit Price</th>
                                <th>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${
                              order.items && order.items.length > 0
                                ? order.items
                                    .map(
                                      (item, index) => `
                                    <tr>
                                        <td>${index + 1}</td>
                                        <td>${item.product_name || "Unknown Product"}</td>
                                        <td>${item.quantity}</td>
                                        <td>₱${Number.parseFloat(item.unit_price).toFixed(2)}</td>
                                        <td>₱${Number.parseFloat(item.total_price || item.quantity * item.unit_price).toFixed(2)}</td>
                                    </tr>
                                `,
                                    )
                                    .join("")
                                : '<tr><td colspan="5" class="text-center py-3">No items found for this order</td></tr>'
                            }
                        </tbody>
                        <tfoot class="table-light">
                            <tr>
                                <td colspan="4" class="text-end fw-bold">Subtotal:</td>
                                <td>₱${Number.parseFloat(order.subtotal).toFixed(2)}</td>
                            </tr>
                            <tr>
                                <td colspan="4" class="text-end">Discount:</td>
                                <td>₱${Number.parseFloat(order.discount || 0).toFixed(2)}</td>
                            </tr>
                            <tr>
                                <td colspan="4" class="text-end fw-bold">Total:</td>
                                <td class="fw-bold">₱${Number.parseFloat(order.total_amount).toFixed(2)}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
        </div>
    `

  // Show the modal
  try {
    // Ensure bootstrap is available
    if (typeof bootstrap !== "undefined") {
      const bsModal = new bootstrap.Modal(consignmentModal)
      bsModal.show()
    } else {
      console.error("Bootstrap is not defined. Ensure it is properly loaded.")
      showResponseMessage("danger", "Bootstrap is not loaded. Please check your setup.")
    }
  } catch (error) {
    console.error("Bootstrap modal error:", error)
    showResponseMessage("danger", "Failed to open details modal. Please check console for errors.")
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

// Function to show batch details for a product in an order
function showOrderProductBatchDetails(orderId, productId, productName) {
    // Create modal if it doesn't exist
    let batchDetailsModal = document.getElementById("orderProductBatchDetailsModal")
    if (!batchDetailsModal) {
      batchDetailsModal = document.createElement("div")
      batchDetailsModal.className = "modal fade"
      batchDetailsModal.id = "orderProductBatchDetailsModal"
      batchDetailsModal.tabIndex = "-1"
      batchDetailsModal.setAttribute("aria-labelledby", "orderProductBatchDetailsModalLabel")
      batchDetailsModal.setAttribute("aria-hidden", "true")
  
      batchDetailsModal.innerHTML = `
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="orderProductBatchDetailsModalLabel">
                <i class="bi bi-box-seam me-2"></i> Product Batch Details
              </h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body" id="orderProductBatchDetailsModalBody">
              <div class="text-center py-4">
                <div class="spinner-border text-primary" role="status">
                  <span class="visually-hidden">Loading...</span>
                </div>
                <p class="mt-2">Loading batch details...</p>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
            </div>
          </div>
        </div>
      `
  
      document.body.appendChild(batchDetailsModal)
    }
  
    // Show the modal with loading state
    try {
      if (typeof bootstrap !== "undefined") {
        const bsModal = new bootstrap.Modal(batchDetailsModal)
        bsModal.show()
      } else {
        console.error("Bootstrap is not defined. Ensure it is properly loaded.")
        showResponseMessage("danger", "Bootstrap is not loaded. Please check your setup.")
        return
      }
    } catch (error) {
      console.error("Bootstrap modal error:", error)
      showResponseMessage("danger", "Failed to open batch details modal. Please check console for errors.")
      return
    }
  
    // Fetch batch details for this product in this order
    fetch(`get_order_batch_details.php?order_id=${orderId}&product_id=${productId}`)
      .then((response) => response.json())
      .then((data) => {
        const modalBody = document.getElementById("orderProductBatchDetailsModalBody")
  
        if (data.success) {
          if (data.batch_tracking_enabled && data.batch_details && data.batch_details.length > 0) {
            const deductionDate = new Date(data.deduction_date).toLocaleString()
  
            let html = `
              <h5 class="mb-3">${productName}</h5>
              <div class="alert alert-info">
                <i class="bi bi-info-circle-fill me-2"></i>
                Order #${data.order.order_number} - Quantity: ${data.quantity_deducted}
                <br>Deducted on: ${deductionDate}
              </div>
              <div class="table-responsive">
                <table class="table table-bordered table-hover">
                  <thead class="table-light">
                    <tr>
                      <th>Batch Code</th>
                      <th>Quantity</th>
                      <th>Expiration Date</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
            `
  
            data.batch_details.forEach((batch) => {
              // Format dates
              const expiryDate = batch.expiration_date ? new Date(batch.expiration_date) : null
              let expiryFormatted = "N/A"
              let statusClass = "bg-secondary"
              let statusText = "No Expiry"
  
              if (expiryDate && batch.expiration_date !== "0000-00-00") {
                expiryFormatted = expiryDate.toLocaleDateString()
                const today = new Date()
  
                if (expiryDate < today) {
                  statusClass = "bg-danger"
                  statusText = "Expired"
                } else {
                  statusClass = "bg-success"
                  statusText = "Valid"
                }
              }
  
              html += `
                <tr>
                  <td>${batch.batch_code}</td>
                  <td>${batch.deducted}</td>
                  <td>${expiryFormatted}</td>
                  <td><span class="badge ${statusClass}">${statusText}</span></td>
                </tr>
              `
            })
  
            html += `
                  </tbody>
                </table>
              </div>
            `
  
            modalBody.innerHTML = html
          } else {
            modalBody.innerHTML = `
              <h5 class="mb-3">${productName}</h5>
              <div class="alert alert-info">
                <i class="bi bi-info-circle-fill me-2"></i>
                ${
                  data.batch_tracking_enabled
                    ? "No batch details available for this product in this order."
                    : "Batch tracking is not enabled for this product."
                }
              </div>
            `
          }
        } else {
          modalBody.innerHTML = `
            <div class="alert alert-danger">
              <i class="bi bi-exclamation-triangle-fill me-2"></i>
              ${data.message || "Failed to load batch details"}
            </div>
          `
        }
      })
      .catch((error) => {
        console.error("Error fetching batch details:", error)
        document.getElementById("orderProductBatchDetailsModalBody").innerHTML = `
          <div class="alert alert-danger">
            <i class="bi bi-exclamation-triangle-fill me-2"></i>
            Error loading batch details: ${error.message || "Unknown error"}
          </div>
        `
      })
  }