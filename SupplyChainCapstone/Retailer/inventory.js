// Global variables
let allProducts = []
let filteredProducts = []
let currentPage = 1
const itemsPerPage = 12
let totalPages = 1
let currentView = "table"
let currentFilters = {
  search: "",
  category: "all",
  stock: "all",
  expiry: "all",
  sort: "name-asc",
}

// Initialize the page
document.addEventListener("DOMContentLoaded", () => {
  // Initialize sidebar toggle for mobile
  initSidebar()

  // Initialize date pickers
  initDatePickers()

  // Initialize view toggle
  initViewToggle()

  // Initialize filters
  initFilters()

  // Initialize product form
  initProductForm()

  // Load products
  loadProducts()

  // Initialize event listeners
  initEventListeners()
})

// Initialize sidebar toggle for mobile
function initSidebar() {
  const sidebarToggle = document.getElementById("sidebarToggle")
  const sidebar = document.getElementById("sidebar")

  if (sidebarToggle && sidebar) {
    sidebarToggle.addEventListener("click", () => {
      sidebar.classList.toggle("show")
    })

    // Close sidebar when clicking outside on mobile
    document.addEventListener("click", (event) => {
      if (
        window.innerWidth < 768 &&
        !sidebar.contains(event.target) &&
        !sidebarToggle.contains(event.target) &&
        sidebar.classList.contains("show")
      ) {
        sidebar.classList.remove("show")
      }
    })
  }
}

// Initialize date pickers
function initDatePickers() {
  try {
    if (typeof flatpickr !== "undefined") {
      flatpickr("#batchManufacturingDate", {
        enableTime: false,
        dateFormat: "Y-m-d",
        maxDate: "today",
      })

      flatpickr("#batchExpiryDate", {
        enableTime: false,
        dateFormat: "Y-m-d",
        minDate: "today",
      })
    } else {
      console.warn("flatpickr is not defined. Date pickers may not work properly.")
    }
  } catch (error) {
    console.error("Error initializing date pickers:", error)
  }
}

// Initialize view toggle
function initViewToggle() {
  const tableViewBtn = document.getElementById("tableViewBtn")
  const cardViewBtn = document.getElementById("cardViewBtn")
  const tableView = document.getElementById("tableView")
  const cardView = document.getElementById("cardView")

  if (tableViewBtn && cardViewBtn && tableView && cardView) {
    tableViewBtn.addEventListener("click", () => {
      tableViewBtn.classList.add("active")
      cardViewBtn.classList.remove("active")
      tableView.classList.remove("d-none")
      cardView.classList.add("d-none")
      currentView = "table"
      renderProducts()
    })

    cardViewBtn.addEventListener("click", () => {
      cardViewBtn.classList.add("active")
      tableViewBtn.classList.remove("active")
      cardView.classList.remove("d-none")
      tableView.classList.add("d-none")
      currentView = "card"
      renderProducts()
    })
  }
}

// Initialize filters
function initFilters() {
  // Category filter
  const categoryFilters = document.querySelectorAll(".category-filter")
  categoryFilters.forEach((filter) => {
    filter.addEventListener("click", function (e) {
      e.preventDefault()
      const category = this.getAttribute("data-category")

      // Update active state
      categoryFilters.forEach((f) => f.classList.remove("active"))
      this.classList.add("active")

      // Update dropdown button text
      document.getElementById("categoryFilter").innerHTML =
        `<i class="bi bi-tag me-1"></i> Category: ${category === "all" ? "All" : category.charAt(0).toUpperCase() + category.slice(1)}`

      // Apply filter
      currentFilters.category = category
      applyFilters()
    })
  })

  // Stock filter
  const stockFilters = document.querySelectorAll(".stock-filter")
  stockFilters.forEach((filter) => {
    filter.addEventListener("click", function (e) {
      e.preventDefault()
      const stock = this.getAttribute("data-stock")

      // Update active state
      stockFilters.forEach((f) => f.classList.remove("active"))
      this.classList.add("active")

      // Update dropdown button text
      let statusText = "All"
      if (stock === "in-stock") statusText = "In Stock"
      if (stock === "low-stock") statusText = "Low Stock"
      if (stock === "out-of-stock") statusText = "Out of Stock"

      document.getElementById("stockFilter").innerHTML = `<i class="bi bi-layers me-1"></i> Status: ${statusText}`

      // Apply filter
      currentFilters.stock = stock
      applyFilters()
    })
  })

  // Expiry filter
  const expiryFilters = document.querySelectorAll(".expiry-filter")
  expiryFilters.forEach((filter) => {
    filter.addEventListener("click", function (e) {
      e.preventDefault()
      const expiry = this.getAttribute("data-expiry")

      // Update active state
      expiryFilters.forEach((f) => f.classList.remove("active"))
      this.classList.add("active")

      // Update dropdown button text
      let expiryText = "All"
      if (expiry === "expiring-soon") expiryText = "Expiring Soon"
      if (expiry === "expired") expiryText = "Expired"

      document.getElementById("expiryFilter").innerHTML = `<i class="bi bi-calendar-x me-1"></i> Expiry: ${expiryText}`

      // Apply filter
      currentFilters.expiry = expiry
      applyFilters()
    })
  })

  // Sort by
  const sortByFilters = document.querySelectorAll(".sort-by")
  sortByFilters.forEach((filter) => {
    filter.addEventListener("click", function (e) {
      e.preventDefault()
      const sort = this.getAttribute("data-sort")

      // Update active state
      sortByFilters.forEach((f) => f.classList.remove("active"))
      this.classList.add("active")

      // Update dropdown button text
      let sortText = "Name"
      if (sort === "name-asc") sortText = "Name (A-Z)"
      if (sort === "name-desc") sortText = "Name (Z-A)"
      if (sort === "stock-asc") sortText = "Stock (Low to High)"
      if (sort === "stock-desc") sortText = "Stock (High to Low)"
      if (sort === "expiry-asc") sortText = "Expiry (Earliest First)"
      if (sort === "expiry-desc") sortText = "Expiry (Latest First)"

      document.getElementById("sortByFilter").innerHTML =
        `<i class="bi bi-sort-alpha-down me-1"></i> Sort By: ${sortText.split(" ")[0]}`

      // Apply filter
      currentFilters.sort = sort
      applyFilters()
    })
  })

  // Search
  document.getElementById("searchInventoryBtn").addEventListener("click", () => {
    const searchTerm = document.getElementById("inventorySearch").value.trim()
    currentFilters.search = searchTerm
    applyFilters()
  })

  // Search on Enter key
  document.getElementById("inventorySearch").addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      e.preventDefault()
      document.getElementById("searchInventoryBtn").click()
    }
  })

  // Reset filters
  document.getElementById("resetFiltersBtn").addEventListener("click", () => {
    resetFilters()
  })

  // Clear all filters
  document.getElementById("clearAllFilters").addEventListener("click", () => {
    resetFilters()
  })
}

// Reset all filters to default
function resetFilters() {
  // Reset search input
  document.getElementById("inventorySearch").value = ""

  // Reset category filter
  document.querySelectorAll(".category-filter").forEach((f) => {
    f.classList.remove("active")
    if (f.getAttribute("data-category") === "all") {
      f.classList.add("active")
    }
  })
  document.getElementById("categoryFilter").innerHTML = `<i class="bi bi-tag me-1"></i> Category: All`

  // Reset stock filter
  document.querySelectorAll(".stock-filter").forEach((f) => {
    f.classList.remove("active")
    if (f.getAttribute("data-stock") === "all") {
      f.classList.add("active")
    }
  })
  document.getElementById("stockFilter").innerHTML = `<i class="bi bi-layers me-1"></i> Status: All`

  // Reset expiry filter
  document.querySelectorAll(".expiry-filter").forEach((f) => {
    f.classList.remove("active")
    if (f.getAttribute("data-expiry") === "all") {
      f.classList.add("active")
    }
  })
  document.getElementById("expiryFilter").innerHTML = `<i class="bi bi-calendar-x me-1"></i> Expiry: All`

  // Reset sort by
  document.querySelectorAll(".sort-by").forEach((f) => {
    f.classList.remove("active")
    if (f.getAttribute("data-sort") === "name-asc") {
      f.classList.add("active")
    }
  })
  document.getElementById("sortByFilter").innerHTML = `<i class="bi bi-sort-alpha-down me-1"></i> Sort By: Name`

  // Reset filter object
  currentFilters = {
    search: "",
    category: "all",
    stock: "all",
    expiry: "all",
    sort: "name-asc",
  }

  // Hide active filters
  document.getElementById("activeFilters").classList.add("d-none")

  // Apply reset filters
  applyFilters()
}

// Apply all current filters
function applyFilters() {
  // Show loading state
  document.getElementById("loadingState").classList.remove("d-none")
  document.getElementById("tableView").classList.add("d-none")
  document.getElementById("cardView").classList.add("d-none")
  document.getElementById("emptyState").classList.add("d-none")

  // Reset to first page
  currentPage = 1

  // Filter products
  filteredProducts = allProducts.filter((product) => {
    // Search filter
    if (
      currentFilters.search &&
      !product.product_name.toLowerCase().includes(currentFilters.search.toLowerCase()) &&
      !product.sku.toLowerCase().includes(currentFilters.search.toLowerCase())
    ) {
      return false
    }

    // Category filter
    if (currentFilters.category !== "all" && product.category !== currentFilters.category) {
      return false
    }

    // Stock filter
    if (currentFilters.stock !== "all") {
      if (currentFilters.stock === "in-stock" && product.stock_status !== "in-stock") {
        return false
      }
      if (currentFilters.stock === "low-stock" && product.stock_status !== "low-stock") {
        return false
      }
      if (currentFilters.stock === "out-of-stock" && product.stock_status !== "out-of-stock") {
        return false
      }
    }

    // Expiry filter
    if (currentFilters.expiry !== "all") {
      if (currentFilters.expiry === "expiring-soon" && !product.is_expiring_soon) {
        return false
      }
      if (currentFilters.expiry === "expired" && !product.is_expired) {
        return false
      }
    }

    return true
  })

  // Sort products
  sortProducts()

  // Update active filters display
  updateActiveFilters()

  // Render products
  renderProducts()
}

// Sort products based on current sort option
function sortProducts() {
  switch (currentFilters.sort) {
    case "name-asc":
      filteredProducts.sort((a, b) => a.product_name.localeCompare(b.product_name))
      break
    case "name-desc":
      filteredProducts.sort((a, b) => b.product_name.localeCompare(a.product_name))
      break
    case "stock-asc":
      filteredProducts.sort((a, b) => a.total_stock - b.total_stock)
      break
    case "stock-desc":
      filteredProducts.sort((a, b) => b.total_stock - a.total_stock)
      break
    case "expiry-asc":
      filteredProducts.sort((a, b) => {
        // Sort by earliest expiry date first
        if (!a.earliest_expiry) return 1
        if (!b.earliest_expiry) return -1
        return new Date(a.earliest_expiry) - new Date(b.earliest_expiry)
      })
      break
    case "expiry-desc":
      filteredProducts.sort((a, b) => {
        // Sort by latest expiry date first
        if (!a.earliest_expiry) return 1
        if (!b.earliest_expiry) return -1
        return new Date(b.earliest_expiry) - new Date(a.earliest_expiry)
      })
      break
  }
}

// Update active filters display
function updateActiveFilters() {
  const activeFiltersContainer = document.getElementById("activeFilters")
  const activeFilterTags = document.querySelector(".active-filter-tags")

  // Clear existing tags
  activeFilterTags.innerHTML = ""

  // Check if any filters are active
  let hasActiveFilters = false

  // Add search filter tag
  if (currentFilters.search) {
    hasActiveFilters = true
    const searchTag = document.createElement("span")
    searchTag.className = "badge bg-light text-dark me-2"
    searchTag.innerHTML = `Search: ${currentFilters.search} <i class="bi bi-x-circle ms-1" data-filter="search"></i>`
    activeFilterTags.appendChild(searchTag)

    // Add click event to remove this filter
    searchTag.querySelector("i").addEventListener("click", () => {
      document.getElementById("inventorySearch").value = ""
      currentFilters.search = ""
      applyFilters()
    })
  }

  // Add category filter tag
  if (currentFilters.category !== "all") {
    hasActiveFilters = true
    const categoryTag = document.createElement("span")
    categoryTag.className = "badge bg-light text-dark me-2"
    categoryTag.innerHTML = `Category: ${currentFilters.category.charAt(0).toUpperCase() + currentFilters.category.slice(1)} <i class="bi bi-x-circle ms-1" data-filter="category"></i>`
    activeFilterTags.appendChild(categoryTag)

    // Add click event to remove this filter
    categoryTag.querySelector("i").addEventListener("click", () => {
      document.querySelectorAll(".category-filter").forEach((f) => {
        f.classList.remove("active")
        if (f.getAttribute("data-category") === "all") {
          f.classList.add("active")
        }
      })
      document.getElementById("categoryFilter").innerHTML = `<i class="bi bi-tag me-1"></i> Category: All`
      currentFilters.category = "all"
      applyFilters()
    })
  }

  // Add stock filter tag
  if (currentFilters.stock !== "all") {
    hasActiveFilters = true
    let stockText = ""
    if (currentFilters.stock === "in-stock") stockText = "In Stock"
    if (currentFilters.stock === "low-stock") stockText = "Low Stock"
    if (currentFilters.stock === "out-of-stock") stockText = "Out of Stock"

    const stockTag = document.createElement("span")
    stockTag.className = "badge bg-light text-dark me-2"
    stockTag.innerHTML = `Status: ${stockText} <i class="bi bi-x-circle ms-1" data-filter="stock"></i>`
    activeFilterTags.appendChild(stockTag)

    // Add click event to remove this filter
    stockTag.querySelector("i").addEventListener("click", () => {
      document.querySelectorAll(".stock-filter").forEach((f) => {
        f.classList.remove("active")
        if (f.getAttribute("data-stock") === "all") {
          f.classList.add("active")
        }
      })
      document.getElementById("stockFilter").innerHTML = `<i class="bi bi-layers me-1"></i> Status: All`
      currentFilters.stock = "all"
      applyFilters()
    })
  }

  // Add expiry filter tag
  if (currentFilters.expiry !== "all") {
    hasActiveFilters = true
    let expiryText = ""
    if (currentFilters.expiry === "expiring-soon") expiryText = "Expiring Soon"
    if (currentFilters.expiry === "expired") expiryText = "Expired"

    const expiryTag = document.createElement("span")
    expiryTag.className = "badge bg-light text-dark me-2"
    expiryTag.innerHTML = `Expiry: ${expiryText} <i class="bi bi-x-circle ms-1" data-filter="expiry"></i>`
    activeFilterTags.appendChild(expiryTag)

    // Add click event to remove this filter
    expiryTag.querySelector("i").addEventListener("click", () => {
      document.querySelectorAll(".expiry-filter").forEach((f) => {
        f.classList.remove("active")
        if (f.getAttribute("data-expiry") === "all") {
          f.classList.add("active")
        }
      })
      document.getElementById("expiryFilter").innerHTML = `<i class="bi bi-calendar-x me-1"></i> Expiry: All`
      currentFilters.expiry = "all"
      applyFilters()
    })
  }

  // Show or hide active filters container
  if (hasActiveFilters) {
    activeFiltersContainer.classList.remove("d-none")
  } else {
    activeFiltersContainer.classList.add("d-none")
  }
}

// Initialize product form
function initProductForm() {
  // Add product button
  document.getElementById("addProductBtn").addEventListener("click", () => {
    // Reset form
    document.getElementById("productForm").reset()
    document.getElementById("productId").value = ""

    // Update modal title
    document.getElementById("productFormModalLabel").textContent = "Add New Product"

    // Show modal
    const productFormModal = new bootstrap.Modal(document.getElementById("productFormModal"))
    productFormModal.show()
  })

  // Save product button
  document.getElementById("saveProductBtn").addEventListener("click", () => {
    saveProduct()
  })
}

// Initialize event listeners
function initEventListeners() {
  // Export inventory button
  document.getElementById("exportInventoryBtn").addEventListener("click", () => {
    exportInventory()
  })

  // Modal order more button
  document.getElementById("modalOrderMoreBtn").addEventListener("click", () => {
    orderMoreProduct()
  })

  // Modal edit button
  document.getElementById("modalEditBtn").addEventListener("click", () => {
    const productId = document.getElementById("modalProductSku").textContent
    editProduct(productId)
  })

  // Confirm delete button
  document.getElementById("confirmDeleteBtn").addEventListener("click", () => {
    deleteProduct()
  })
}

// Load products from server
function loadProducts() {
  // Show loading state
  document.getElementById("loadingState").classList.remove("d-none")
  document.getElementById("tableView").classList.add("d-none")
  document.getElementById("cardView").classList.add("d-none")
  document.getElementById("emptyState").classList.add("d-none")

  // Simulate API call with setTimeout
  setTimeout(() => {
    // Mock data for demonstration
    allProducts = [
      {
        product_id: "1",
        product_name: "Pineapple Jam",
        sku: "SKU-001",
        category: "preserves",
        total_stock: 75,
        batch_count: 3,
        stock_status: "in-stock",
        reorder_level: 30,
        supplier: "Piñana Gourmet",
        description: "Premium pineapple jam made from fresh pineapples.",
        image_url: "https://via.placeholder.com/200",
        is_expiring_soon: false,
        is_expired: false,
        earliest_expiry: "2023-09-05",
        batches: [
          {
            batch_id: "BATCH-001",
            quantity: 15,
            manufacturing_date: "2022-11-15",
            expiry_date: "2023-05-15",
            status: "expired",
          },
          {
            batch_id: "BATCH-002",
            quantity: 25,
            manufacturing_date: "2023-01-10",
            expiry_date: "2023-07-10",
            status: "expiring-soon",
          },
          {
            batch_id: "BATCH-003",
            quantity: 35,
            manufacturing_date: "2023-03-05",
            expiry_date: "2023-09-05",
            status: "good",
          },
        ],
      },
      {
        product_id: "2",
        product_name: "Pineapple Juice",
        sku: "SKU-002",
        category: "beverages",
        total_stock: 25,
        batch_count: 2,
        stock_status: "low-stock",
        reorder_level: 50,
        supplier: "Piñana Gourmet",
        description: "Refreshing pineapple juice made from 100% fresh pineapples.",
        image_url: "https://via.placeholder.com/200",
        is_expiring_soon: true,
        is_expired: false,
        earliest_expiry: "2023-05-30",
        batches: [
          {
            batch_id: "BATCH-005",
            quantity: 15,
            manufacturing_date: "2022-12-01",
            expiry_date: "2023-05-30",
            status: "expiring-soon",
          },
          {
            batch_id: "BATCH-006",
            quantity: 10,
            manufacturing_date: "2023-01-15",
            expiry_date: "2023-06-15",
            status: "good",
          },
        ],
      },
      {
        product_id: "3",
        product_name: "Dried Pineapple",
        sku: "SKU-003",
        category: "snacks",
        total_stock: 60,
        batch_count: 4,
        stock_status: "in-stock",
        reorder_level: 40,
        supplier: "Piñana Gourmet",
        description: "Delicious dried pineapple slices, perfect for snacking.",
        image_url: "https://via.placeholder.com/200",
        is_expiring_soon: true,
        is_expired: false,
        earliest_expiry: "2023-06-10",
        batches: [
          {
            batch_id: "BATCH-008",
            quantity: 20,
            manufacturing_date: "2022-12-10",
            expiry_date: "2023-06-10",
            status: "expiring-soon",
          },
          {
            batch_id: "BATCH-009",
            quantity: 15,
            manufacturing_date: "2023-01-20",
            expiry_date: "2023-07-20",
            status: "good",
          },
          {
            batch_id: "BATCH-010",
            quantity: 15,
            manufacturing_date: "2023-02-05",
            expiry_date: "2023-08-05",
            status: "good",
          },
          {
            batch_id: "BATCH-011",
            quantity: 10,
            manufacturing_date: "2023-02-20",
            expiry_date: "2023-08-20",
            status: "good",
          },
        ],
      },
      {
        product_id: "4",
        product_name: "Pineapple Cake",
        sku: "SKU-004",
        category: "bakery",
        total_stock: 10,
        batch_count: 1,
        stock_status: "out-of-stock",
        reorder_level: 40,
        supplier: "Piñana Gourmet",
        description: "Delicious pineapple cake with real pineapple chunks.",
        image_url: "https://via.placeholder.com/200",
        is_expiring_soon: false,
        is_expired: false,
        earliest_expiry: "2023-05-10",
        batches: [
          {
            batch_id: "BATCH-012",
            quantity: 10,
            manufacturing_date: "2023-04-10",
            expiry_date: "2023-05-10",
            status: "expiring-soon",
          },
        ],
      },
      {
        product_id: "5",
        product_name: "Pineapple Syrup",
        sku: "SKU-007",
        category: "condiments",
        total_stock: 30,
        batch_count: 2,
        stock_status: "low-stock",
        reorder_level: 60,
        supplier: "Piñana Gourmet",
        description: "Sweet pineapple syrup, perfect for desserts and cocktails.",
        image_url: "https://via.placeholder.com/200",
        is_expiring_soon: false,
        is_expired: false,
        earliest_expiry: "2023-10-15",
        batches: [
          {
            batch_id: "BATCH-015",
            quantity: 15,
            manufacturing_date: "2023-04-15",
            expiry_date: "2023-10-15",
            status: "good",
          },
          {
            batch_id: "BATCH-016",
            quantity: 15,
            manufacturing_date: "2023-04-20",
            expiry_date: "2023-10-20",
            status: "good",
          },
        ],
      },
      {
        product_id: "6",
        product_name: "Pineapple Vinegar",
        sku: "SKU-009",
        category: "condiments",
        total_stock: 20,
        batch_count: 1,
        stock_status: "low-stock",
        reorder_level: 45,
        supplier: "Piñana Gourmet",
        description: "Tangy pineapple vinegar, great for salad dressings and marinades.",
        image_url: "https://via.placeholder.com/200",
        is_expiring_soon: false,
        is_expired: false,
        earliest_expiry: "2023-11-10",
        batches: [
          {
            batch_id: "BATCH-020",
            quantity: 20,
            manufacturing_date: "2023-05-10",
            expiry_date: "2023-11-10",
            status: "good",
          },
        ],
      },
    ]

    // Apply initial filters
    filteredProducts = [...allProducts]

    // Sort products
    sortProducts()

    // Render products
    renderProducts()
  }, 1000)
}

// Render products based on current view and filters
function renderProducts() {
  // Hide loading state
  document.getElementById("loadingState").classList.add("d-none")

  // Check if there are products to display
  if (filteredProducts.length === 0) {
    document.getElementById("emptyState").classList.remove("d-none")
    document.getElementById("tableView").classList.add("d-none")
    document.getElementById("cardView").classList.add("d-none")

    // Update counts
    document.getElementById("currentCount").textContent = "0"
    document.getElementById("totalCount").textContent = allProducts.length

    // Clear pagination
    document.getElementById("inventoryPagination").innerHTML = ""

    return
  }

  // Calculate pagination
  totalPages = Math.ceil(filteredProducts.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = Math.min(startIndex + itemsPerPage, filteredProducts.length)
  const currentPageProducts = filteredProducts.slice(startIndex, endIndex)

  // Update counts
  document.getElementById("currentCount").textContent = currentPageProducts.length
  document.getElementById("totalCount").textContent = allProducts.length

  // Render based on current view
  if (currentView === "table") {
    renderTableView(currentPageProducts)
    document.getElementById("tableView").classList.remove("d-none")
    document.getElementById("cardView").classList.add("d-none")
  } else {
    renderCardView(currentPageProducts)
    document.getElementById("cardView").classList.remove("d-none")
    document.getElementById("tableView").classList.add("d-none")
  }

  document.getElementById("emptyState").classList.add("d-none")

  // Render pagination
  renderPagination()
}

// Render table view
function renderTableView(products) {
  const tableBody = document.getElementById("inventoryTableBody")
  tableBody.innerHTML = ""

  products.forEach((product) => {
    // Determine status badge class
    let statusBadgeClass = ""
    if (product.stock_status === "in-stock") {
      statusBadgeClass = "status-in-stock"
    } else if (product.stock_status === "low-stock") {
      statusBadgeClass = "status-low-stock"
    } else if (product.stock_status === "out-of-stock") {
      statusBadgeClass = "status-out-stock"
    }

    // Format status text
    let statusText = ""
    if (product.stock_status === "in-stock") {
      statusText = "In Stock"
    } else if (product.stock_status === "low-stock") {
      statusText = "Low Stock"
    } else if (product.stock_status === "out-of-stock") {
      statusText = "Out of Stock"
    }

    const row = document.createElement("tr")
    row.innerHTML = `
            <td>
                <div class="d-flex align-items-center">
                    <img src="${product.image_url}" alt="${product.product_name}" class="me-2" width="40" height="40">
                    <span class="product-name">${product.product_name}</span>
                </div>
            </td>
            <td class="product-id">${product.sku}</td>
            <td>${product.category.charAt(0).toUpperCase() + product.category.slice(1)}</td>
            <td>
                <div class="progress">
                    <div class="progress-bar ${product.stock_status === "out-of-stock" ? "bg-danger" : product.stock_status === "low-stock" ? "bg-warning" : "bg-success"}" 
                         role="progressbar" 
                         style="width: ${Math.min(100, Math.round((product.total_stock / product.reorder_level) * 100))}%">
                    </div>
                </div>
                <span class="small">${product.total_stock} units</span>
            </td>
            <td>${product.batch_count} ${product.batch_count === 1 ? "batch" : "batches"}</td>
            <td><span class="status-badge ${statusBadgeClass}">${statusText}</span></td>
            <td>
                <div class="action-buttons">
                    <button class="action-btn action-btn-edit" data-bs-toggle="tooltip" title="Edit" data-id="${product.sku}">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="action-btn action-btn-view" data-bs-toggle="tooltip" title="View Details" data-id="${product.sku}">
                        <i class="bi bi-eye"></i>
                    </button>
                    <button class="action-btn action-btn-delete" data-bs-toggle="tooltip" title="Delete" data-id="${product.sku}" data-name="${product.product_name}">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            </td>
        `

    tableBody.appendChild(row)

    // Add event listeners to action buttons
    row.querySelector(".action-btn-view").addEventListener("click", function () {
      viewProduct(this.getAttribute("data-id"))
    })

    row.querySelector(".action-btn-edit").addEventListener("click", function () {
      editProduct(this.getAttribute("data-id"))
    })

    row.querySelector(".action-btn-delete").addEventListener("click", function () {
      confirmDelete(this.getAttribute("data-id"), this.getAttribute("data-name"))
    })
  })

  // Initialize tooltips
  if (typeof bootstrap !== "undefined" && typeof bootstrap.Tooltip !== "undefined") {
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
    tooltipTriggerList.map((tooltipTriggerEl) => new bootstrap.Tooltip(tooltipTriggerEl))
  }
}

// Render card view
function renderCardView(products) {
  const cardContainer = document.getElementById("inventoryCardContainer")
  cardContainer.innerHTML = ""

  products.forEach((product) => {
    // Determine status badge class
    let statusBadgeClass = ""
    let statusBgClass = ""
    if (product.stock_status === "in-stock") {
      statusBadgeClass = "status-in-stock"
      statusBgClass = "bg-success"
    } else if (product.stock_status === "low-stock") {
      statusBadgeClass = "status-low-stock"
      statusBgClass = "bg-warning"
    } else if (product.stock_status === "out-of-stock") {
      statusBadgeClass = "status-out-stock"
      statusBgClass = "bg-danger"
    }

    // Format status text
    let statusText = ""
    if (product.stock_status === "in-stock") {
      statusText = "In Stock"
    } else if (product.stock_status === "low-stock") {
      statusText = "Low Stock"
    } else if (product.stock_status === "out-of-stock") {
      statusText = "Out of Stock"
    }

    const card = document.createElement("div")
    card.className = "col"

    card.innerHTML = `
            <div class="card h-100 product-card">
                <div class="position-relative">
                    <img src="${product.image_url}" class="card-img-top p-3" alt="${product.product_name}" style="height: 180px; object-fit: contain;">
                    <span class="position-absolute top-0 end-0 badge ${statusBgClass} m-2">${statusText}</span>
                </div>
                <div class="card-body d-flex flex-column">
                    <h5 class="card-title">${product.product_name}</h5>
                    <p class="card-text text-muted small mb-2">SKU: ${product.sku}</p>
                    <div class="mb-2">
                        <div class="progress" style="height: 6px;">
                            <div class="progress-bar ${product.stock_status === "out-of-stock" ? "bg-danger" : product.stock_status === "low-stock" ? "bg-warning" : "bg-success"}" 
                                role="progressbar" 
                                style="width: ${Math.min(100, Math.round((product.total_stock / product.reorder_level) * 100))}%">
                            </div>
                        </div>
                        <div class="d-flex justify-content-between align-items-center mt-1">
                            <small class="text-muted">Stock: ${product.total_stock} units</small>
                            <small class="text-muted">Min: ${product.reorder_level}</small>
                        </div>
                    </div>
                    <div class="mt-auto pt-2 border-top d-flex justify-content-between">
                        <span class="text-muted small">${product.category.charAt(0).toUpperCase() + product.category.slice(1)}</span>
                        <span class="text-muted small">${product.batch_count} ${product.batch_count === 1 ? "batch" : "batches"}</span>
                    </div>
                </div>
                <div class="card-footer bg-transparent border-top-0">
                    <div class="d-flex justify-content-between">
                        <button class="btn btn-sm btn-outline-primary view-product-btn" data-id="${product.sku}">
                            <i class="bi bi-eye me-1"></i> View
                        </button>
                        <div>
                            <button class="btn btn-sm btn-outline-secondary edit-product-btn" data-id="${product.sku}">
                                <i class="bi bi-pencil"></i>
                            </button>
                            <button class="btn btn-sm btn-outline-danger delete-product-btn" data-id="${product.sku}" data-name="${product.product_name}">
                                <i class="bi bi-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `

    cardContainer.appendChild(card)

    // Add event listeners to action buttons
    card.querySelector(".view-product-btn").addEventListener("click", function () {
      viewProduct(this.getAttribute("data-id"))
    })

    card.querySelector(".edit-product-btn").addEventListener("click", function () {
      editProduct(this.getAttribute("data-id"))
    })

    card.querySelector(".delete-product-btn").addEventListener("click", function () {
      confirmDelete(this.getAttribute("data-id"), this.getAttribute("data-name"))
    })
  })
}

// Render pagination
function renderPagination() {
  const pagination = document.getElementById("inventoryPagination")
  pagination.innerHTML = ""

  if (totalPages <= 1) {
    return
  }

  // Previous button
  const prevLi = document.createElement("li")
  prevLi.className = `page-item ${currentPage === 1 ? "disabled" : ""}`
  prevLi.innerHTML = `<a class="page-link" href="#" aria-label="Previous"><span aria-hidden="true">&laquo;</span></a>`
  pagination.appendChild(prevLi)

  if (currentPage > 1) {
    prevLi.addEventListener("click", (e) => {
      e.preventDefault()
      currentPage--
      renderProducts()
    })
  }

  // Page numbers
  const maxPages = 5 // Maximum number of page links to show
  let startPage = Math.max(1, currentPage - Math.floor(maxPages / 2))
  const endPage = Math.min(totalPages, startPage + maxPages - 1)

  if (endPage - startPage + 1 < maxPages) {
    startPage = Math.max(1, endPage - maxPages + 1)
  }

  for (let i = startPage; i <= endPage; i++) {
    const pageLi = document.createElement("li")
    pageLi.className = `page-item ${i === currentPage ? "active" : ""}`
    pageLi.innerHTML = `<a class="page-link" href="#">${i}</a>`

    pageLi.addEventListener("click", (e) => {
      e.preventDefault()
      currentPage = i
      renderProducts()
    })

    pagination.appendChild(pageLi)
  }

  // Next button
  const nextLi = document.createElement("li")
  nextLi.className = `page-item ${currentPage === totalPages ? "disabled" : ""}`
  nextLi.innerHTML = `<a class="page-link" href="#" aria-label="Next"><span aria-hidden="true">&raquo;</span></a>`
  pagination.appendChild(nextLi)

  if (currentPage < totalPages) {
    nextLi.addEventListener("click", (e) => {
      e.preventDefault()
      currentPage++
      renderProducts()
    })
  }
}

// View product details
function viewProduct(productId) {
  // Find product
  const product = allProducts.find((p) => p.sku === productId)

  if (!product) {
    showAlert("danger", "Product not found")
    return
  }

  // Populate modal
  document.getElementById("modalProductImage").src = product.image_url
  document.getElementById("modalProductName").textContent = product.product_name
  document.getElementById("modalProductDescription").textContent = product.description
  document.getElementById("modalProductSku").textContent = product.sku
  document.getElementById("modalProductCategory").textContent =
    product.category.charAt(0).toUpperCase() + product.category.slice(1)
  document.getElementById("modalProductStock").textContent = `${product.total_stock} units`
  document.getElementById("modalProductReorderLevel").textContent = `${product.reorder_level} units`
  document.getElementById("modalProductSupplier").textContent = product.supplier

  // Set status badge
  const statusBadge = document.getElementById("modalProductStatus")
  statusBadge.textContent =
    product.stock_status === "in-stock"
      ? "In Stock"
      : product.stock_status === "low-stock"
        ? "Low Stock"
        : "Out of Stock"

  statusBadge.className =
    "badge " +
    (product.stock_status === "in-stock"
      ? "bg-success"
      : product.stock_status === "low-stock"
        ? "bg-warning"
        : "bg-danger")

  // Populate batches table
  const batchesTable = document.getElementById("modalBatchesTable")
  batchesTable.innerHTML = ""

  product.batches.forEach((batch) => {
    const row = document.createElement("tr")

    // Determine status badge class
    let statusClass = ""
    if (batch.status === "good") {
      statusClass = "bg-success"
    } else if (batch.status === "expiring-soon") {
      statusClass = "bg-warning"
    } else if (batch.status === "expired") {
      statusClass = "bg-danger"
    }

    // Format status text
    let statusText = ""
    if (batch.status === "good") {
      statusText = "Good"
    } else if (batch.status === "expiring-soon") {
      statusText = "Expiring Soon"
    } else if (batch.status === "expired") {
      statusText = "Expired"
    }

    row.innerHTML = `
            <td>${batch.batch_id}</td>
            <td>${batch.quantity} units</td>
            <td>${batch.manufacturing_date}</td>
            <td>${batch.expiry_date}</td>
            <td><span class="badge ${statusClass}">${statusText}</span></td>
        `

    batchesTable.appendChild(row)
  })

  // Show modal
  const productDetailsModal = new bootstrap.Modal(document.getElementById("productDetailsModal"))
  productDetailsModal.show()
}

// Edit product
function editProduct(productId) {
  // Find product
  const product = allProducts.find((p) => p.sku === productId)

  if (!product) {
    showAlert("danger", "Product not found")
    return
  }

  // Populate form
  document.getElementById("productId").value = product.product_id
  document.getElementById("productName").value = product.product_name
  document.getElementById("productSku").value = product.sku
  document.getElementById("productCategory").value = product.category
  document.getElementById("productSupplier").value = product.supplier
  document.getElementById("productReorderLevel").value = product.reorder_level
  document.getElementById("productDescription").value = product.description

  // Update modal title
  document.getElementById("productFormModalLabel").textContent = "Edit Product"

  // Show modal
  const productFormModal = new bootstrap.Modal(document.getElementById("productFormModal"))
  productFormModal.show()
}

// Confirm delete product
function confirmDelete(productId, productName) {
  document.getElementById("deleteProductName").textContent = productName

  // Store product ID in a data attribute for the confirm button
  document.getElementById("confirmDeleteBtn").setAttribute("data-id", productId)

  // Show modal
  const confirmDeleteModal = new bootstrap.Modal(document.getElementById("confirmDeleteModal"))
  confirmDeleteModal.show()
}

// Delete product
function deleteProduct() {
  const productId = document.getElementById("confirmDeleteBtn").getAttribute("data-id")

  // Find product index
  const productIndex = allProducts.findIndex((p) => p.sku === productId)

  if (productIndex === -1) {
    showAlert("danger", "Product not found")
    return
  }

  // Remove product
  allProducts.splice(productIndex, 1)

  // Close modal
  const confirmDeleteModal = bootstrap.Modal.getInstance(document.getElementById("confirmDeleteModal"))
  confirmDeleteModal.hide()

  // Show success message
  showAlert("success", "Product deleted successfully")

  // Apply filters to update the view
  applyFilters()
}

// Save product
function saveProduct() {
  // Get form data
  const productId = document.getElementById("productId").value
  const productName = document.getElementById("productName").value
  const productSku = document.getElementById("productSku").value
  const productCategory = document.getElementById("productCategory").value
  const productSupplier = document.getElementById("productSupplier").value
  const productReorderLevel = document.getElementById("productReorderLevel").value
  const productDescription = document.getElementById("productDescription").value

  // Validate form
  if (!productName || !productSku || !productCategory || !productSupplier || !productReorderLevel) {
    showAlert("danger", "Please fill in all required fields")
    return
  }

  // Check if editing or adding
  if (productId) {
    // Find product
    const productIndex = allProducts.findIndex((p) => p.product_id === productId)

    if (productIndex === -1) {
      showAlert("danger", "Product not found")
      return
    }

    // Update product
    allProducts[productIndex].product_name = productName
    allProducts[productIndex].sku = productSku
    allProducts[productIndex].category = productCategory
    allProducts[productIndex].supplier = productSupplier
    allProducts[productIndex].reorder_level = Number.parseInt(productReorderLevel)
    allProducts[productIndex].description = productDescription

    showAlert("success", "Product updated successfully")
  } else {
    // Create new product
    const newProduct = {
      product_id: (allProducts.length + 1).toString(),
      product_name: productName,
      sku: productSku,
      category: productCategory,
      total_stock: 0,
      batch_count: 0,
      stock_status: "out-of-stock",
      reorder_level: Number.parseInt(productReorderLevel),
      supplier: productSupplier,
      description: productDescription,
      image_url: "https://via.placeholder.com/200",
      is_expiring_soon: false,
      is_expired: false,
      earliest_expiry: null,
      batches: [],
    }

    // Add batch if provided
    const batchId = document.getElementById("batchId").value
    const batchQuantity = document.getElementById("batchQuantity").value
    const batchManufacturingDate = document.getElementById("batchManufacturingDate").value
    const batchExpiryDate = document.getElementById("batchExpiryDate").value

    if (batchId && batchQuantity && batchManufacturingDate && batchExpiryDate) {
      const batch = {
        batch_id: batchId,
        quantity: Number.parseInt(batchQuantity),
        manufacturing_date: batchManufacturingDate,
        expiry_date: batchExpiryDate,
        status: "good",
      }

      newProduct.batches.push(batch)
      newProduct.batch_count = 1
      newProduct.total_stock = Number.parseInt(batchQuantity)
      newProduct.earliest_expiry = batchExpiryDate

      // Determine stock status
      if (newProduct.total_stock === 0) {
        newProduct.stock_status = "out-of-stock"
      } else if (newProduct.total_stock < newProduct.reorder_level) {
        newProduct.stock_status = "low-stock"
      } else {
        newProduct.stock_status = "in-stock"
      }

      // Check if expiring soon
      const today = new Date()
      const expiryDate = new Date(batchExpiryDate)
      const diffTime = expiryDate - today
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

      if (diffDays <= 30 && diffDays > 0) {
        newProduct.is_expiring_soon = true
        batch.status = "expiring-soon"
      } else if (diffDays <= 0) {
        newProduct.is_expired = true
        batch.status = "expired"
      }
    }

    // Add to products array
    allProducts.push(newProduct)

    showAlert("success", "Product added successfully")
  }

  // Close modal
  const productFormModal = bootstrap.Modal.getInstance(document.getElementById("productFormModal"))
  productFormModal.hide()

  // Apply filters to update the view
  applyFilters()
}

// Order more product
function orderMoreProduct() {
  // Get product ID from modal
  const productSku = document.getElementById("modalProductSku").textContent

  // Close product details modal
  const productDetailsModal = bootstrap.Modal.getInstance(document.getElementById("productDetailsModal"))
  productDetailsModal.hide()

  // Show alert
  showAlert("info", "Redirecting to orders page to place an order for " + productSku)

  // In a real application, you would redirect to the orders page with the product pre-selected
  // window.location.href = "rt_orders.php?product=" + productSku;
}

// Export inventory
function exportInventory() {
  // Show alert
  showAlert("info", "Exporting inventory data...")

  // In a real application, you would make an AJAX request to export the data
  setTimeout(() => {
    showAlert("success", "Inventory data exported successfully")
  }, 1500)
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

  // Alert content
  alertDiv.innerHTML = `
        <div class="d-flex align-items-center">
            <i class="bi ${getAlertIcon(type)} me-2"></i>
            <div>${message}</div>
        </div>
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `

  // Add to document
  document.body.appendChild(alertDiv)

  // Auto-dismiss after 3 seconds
  setTimeout(() => {
    try {
      if (typeof bootstrap !== "undefined") {
        const bsAlert = new bootstrap.Alert(alertDiv)
        bsAlert.close()
      } else {
        alertDiv.remove()
      }
    } catch (error) {
      console.error("Error closing alert:", error)
      alertDiv.remove()
    }
  }, 3000)
}

// Get alert icon based on type
function getAlertIcon(type) {
  switch (type) {
    case "success":
      return "bi-check-circle-fill text-success"
    case "danger":
      return "bi-exclamation-circle-fill text-danger"
    case "warning":
      return "bi-exclamation-triangle-fill text-warning"
    case "info":
      return "bi-info-circle-fill text-info"
    default:
      return "bi-bell-fill"
  }
}
