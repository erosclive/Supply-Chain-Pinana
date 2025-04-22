import { Chart } from "@/components/ui/chart"
// Global variables
let currentReportData
let filteredData
let reportChart
let currentReportType = "sales"
const currentDateRange = {
  startDate: moment().subtract(30, "days").format("YYYY-MM-DD"),
  endDate: moment().format("YYYY-MM-DD"),
}
const currentFilters = {
  category: "",
  period: "month",
  year: new Date().getFullYear(),
  month: new Date().getMonth() + 1,
}

// Import necessary libraries
import $ from "jquery"
import "daterangepicker"
import moment from "moment"
import * as bootstrap from "bootstrap"

// Initialize the page when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  // Initialize date range picker
  initDateRangePicker()

  // Load categories for filter
  loadCategories()

  // Set up event listeners
  setupEventListeners()

  // Initialize report tabs
  initReportTabs()

  // Generate initial report
  generateReport()
})

// Initialize date range picker
function initDateRangePicker() {
  $("#date-range").daterangepicker(
    {
      opens: "left",
      maxDate: new Date(),
      ranges: {
        Today: [moment(), moment()],
        Yesterday: [moment().subtract(1, "days"), moment().subtract(1, "days")],
        "Last 7 Days": [moment().subtract(6, "days"), moment()],
        "Last 30 Days": [moment().subtract(29, "days"), moment()],
        "This Month": [moment().startOf("month"), moment().endOf("month")],
        "Last Month": [moment().subtract(1, "month").startOf("month"), moment().subtract(1, "month").endOf("month")],
      },
      startDate: moment().subtract(29, "days"),
      endDate: moment(),
    },
    (start, end) => {
      currentDateRange.startDate = start.format("YYYY-MM-DD")
      currentDateRange.endDate = end.format("YYYY-MM-DD")
    },
  )
}

// Load categories for filter
function loadCategories() {
  fetch("fetch_categories.php")
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok")
      }
      return response.json()
    })
    .then((data) => {
      if (data.success) {
        const categoryFilter = document.getElementById("category-filter")
        data.categories.forEach((category) => {
          const option = document.createElement("option")
          option.value = category
          option.textContent = category
          categoryFilter.appendChild(option)
        })
      } else {
        console.error("Failed to load categories:", data.message)
      }
    })
    .catch((error) => {
      console.error("Error loading categories:", error)
    })
}

// Initialize report tabs
function initReportTabs() {
  const reportTabsContainer = document.getElementById("report-tabs")

  if (!reportTabsContainer) {
    console.error("Report tabs container not found")
    return
  }

  // Create report tabs
  reportTabsContainer.innerHTML = `
        <ul class="nav nav-tabs mb-4" id="reportTabs" role="tablist">
            <li class="nav-item" role="presentation">
                <button class="nav-link active" id="sales-tab" data-bs-toggle="tab" data-report-type="sales" type="button" role="tab" aria-selected="true">
                    <i class="bi bi-graph-up"></i> Sales Trend
                </button>
            </li>
            <li class="nav-item" role="presentation">
                <button class="nav-link" id="products-tab" data-bs-toggle="tab" data-report-type="products" type="button" role="tab" aria-selected="false">
                    <i class="bi bi-box-seam"></i> Product Sales
                </button>
            </li>
            <li class="nav-item" role="presentation">
                <button class="nav-link" id="inventory-tab" data-bs-toggle="tab" data-report-type="inventory" type="button" role="tab" aria-selected="false">
                    <i class="bi bi-clipboard-data"></i> Inventory
                </button>
            </li>
            <li class="nav-item" role="presentation">
                <button class="nav-link" id="categories-tab" data-bs-toggle="tab" data-report-type="categories" type="button" role="tab" aria-selected="false">
                    <i class="bi bi-tags"></i> Categories
                </button>
            </li>
            <li class="nav-item" role="presentation">
                <button class="nav-link" id="payment-methods-tab" data-bs-toggle="tab" data-report-type="payment_methods" type="button" role="tab" aria-selected="false">
                    <i class="bi bi-credit-card"></i> Payment Methods
                </button>
            </li>
        </ul>
    `

  // Add event listeners to tabs
  document.querySelectorAll("#reportTabs .nav-link").forEach((tab) => {
    tab.addEventListener("click", function () {
      const reportType = this.getAttribute("data-report-type")
      currentReportType = reportType

      // Update report type in filter
      const reportTypeSelect = document.getElementById("report-type")
      if (reportTypeSelect) {
        reportTypeSelect.value = reportType
      }

      // Update filter visibility based on report type
      updateFilterVisibility(reportType)

      // Generate report
      generateReport()
    })
  })
}

// Update filter visibility based on report type
function updateFilterVisibility(reportType) {
  const categoryFilterContainer = document.getElementById("category-filter-container")
  const periodFilterContainer = document.getElementById("period-filter-container")
  const dateRangeContainer = document.getElementById("date-range-container")
  const yearMonthContainer = document.getElementById("year-month-container")

  // Reset all filters
  if (categoryFilterContainer) categoryFilterContainer.style.display = "block"
  if (periodFilterContainer) periodFilterContainer.style.display = "block"
  if (dateRangeContainer) dateRangeContainer.style.display = "block"
  if (yearMonthContainer) yearMonthContainer.style.display = "none"

  // Adjust filters based on report type
  switch (reportType) {
    case "inventory":
      if (categoryFilterContainer) categoryFilterContainer.style.display = "block"
      if (periodFilterContainer) periodFilterContainer.style.display = "none"
      if (dateRangeContainer) dateRangeContainer.style.display = "none"
      if (yearMonthContainer) yearMonthContainer.style.display = "block"
      break

    case "products":
      if (categoryFilterContainer) categoryFilterContainer.style.display = "block"
      if (periodFilterContainer) periodFilterContainer.style.display = "block"
      break

    case "categories":
      if (categoryFilterContainer) categoryFilterContainer.style.display = "none"
      break

    case "payment_methods":
      if (categoryFilterContainer) categoryFilterContainer.style.display = "none"
      break
  }
}

// Set up event listeners
function setupEventListeners() {
  // Generate report button
  document.getElementById("generate-report-btn").addEventListener("click", generateReport)

  // Export report button
  document.getElementById("export-report-btn").addEventListener("click", () => {
    const exportModal = new bootstrap.Modal(document.getElementById("exportModal"))
    exportModal.show()
  })

  // Chart type buttons
  document.querySelectorAll("[data-chart-type]").forEach((button) => {
    button.addEventListener("click", function () {
      const chartType = this.getAttribute("data-chart-type")
      updateChartType(chartType)

      // Update active state
      document.querySelectorAll("[data-chart-type]").forEach((btn) => {
        btn.classList.remove("active")
      })
      this.classList.add("active")
    })
  })

  // Table search
  document.getElementById("table-search").addEventListener("input", function () {
    filterTableData(this.value)
  })

  // Export options
  document.getElementById("exportCSV").addEventListener("click", () => exportReport("csv"))
  document.getElementById("exportExcel").addEventListener("click", () => exportReport("excel"))
  document.getElementById("exportPDF").addEventListener("click", () => exportReport("pdf"))
  document.getElementById("printReport").addEventListener("click", printReport)

  // Report type change
  document.getElementById("report-type").addEventListener("change", function () {
    currentReportType = this.value

    // Update active tab
    document.querySelectorAll("#reportTabs .nav-link").forEach((tab) => {
      tab.classList.remove("active")
      if (tab.getAttribute("data-report-type") === currentReportType) {
        tab.classList.add("active")
      }
    })

    // Update filter visibility
    updateFilterVisibility(currentReportType)

    // Update report title
    updateReportTitle(currentReportType)
  })

  // Period filter change
  document.getElementById("period-filter").addEventListener("change", function () {
    currentFilters.period = this.value

    // Show/hide year-month filter based on period
    const yearMonthContainer = document.getElementById("year-month-container")
    if (yearMonthContainer) {
      yearMonthContainer.style.display = this.value === "custom" ? "block" : "none"
    }
  })

  // Year filter change
  document.getElementById("year-filter").addEventListener("change", function () {
    currentFilters.year = this.value
  })

  // Month filter change
  document.getElementById("month-filter").addEventListener("change", function () {
    currentFilters.month = this.value
  })

  // Sidebar toggle for mobile
  document.getElementById("sidebarToggle").addEventListener("click", () => {
    document.getElementById("sidebar").classList.toggle("show")
  })
}

// Generate report based on selected filters
function generateReport() {
  // Get filter values
  const reportType = document.getElementById("report-type").value
  currentReportType = reportType

  const dateRange = document.getElementById("date-range").value
  const category = document.getElementById("category-filter").value
  currentFilters.category = category

  // Parse date range
  const dates = dateRange.split(" - ")
  currentDateRange.startDate = moment(dates[0], "MM/DD/YYYY").format("YYYY-MM-DD")
  currentDateRange.endDate = moment(dates[1], "MM/DD/YYYY").format("YYYY-MM-DD")

  // Get period filter
  const periodFilter = document.getElementById("period-filter").value
  currentFilters.period = periodFilter

  // Get year and month filters
  const yearFilter = document.getElementById("year-filter").value
  const monthFilter = document.getElementById("month-filter").value
  currentFilters.year = yearFilter
  currentFilters.month = monthFilter

  // Show loading state
  showReportLoadingState()

  // Update report title
  updateReportTitle(reportType)

  // Build URL based on report type and filters
  let url = ""

  switch (reportType) {
    case "inventory":
      url = `fetch_inventory_report.php?year=${yearFilter}&month=${monthFilter}&category=${category}`
      break

    default:
      url = `fetch_reports_data.php?type=${reportType}&start_date=${currentDateRange.startDate}&end_date=${currentDateRange.endDate}&category=${category}&period=${periodFilter}`
  }

  console.log("Fetching data from:", url)

  fetch(url)
    .then((response) => {
      console.log("Response status:", response.status)
      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.status} ${response.statusText}`)
      }
      return response.json()
    })
    .then((data) => {
      console.log("Data received:", data)
      if (data.success) {
        // Store report data
        currentReportData = data
        filteredData = [...data.data]

        // Check if we have data
        if (data.data.length === 0) {
          console.log("No data returned from server")
          showReportErrorState(data.message || "No data available for the selected filters")
          return
        }

        // Update report with fetched data
        updateReportSummary(data)
        updateReportChart(data)
        updateReportTable(data)
      } else {
        throw new Error(data.message || "Failed to load report data")
      }
    })
    .catch((error) => {
      console.error("Error loading report data:", error)
      showReportErrorState(error.message)
    })
}

// Show loading state for report
function showReportLoadingState() {
  // Summary loading state
  document.getElementById("report-summary").innerHTML = `
        <div class="col-12 text-center py-4">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
            <p class="mt-2">Loading report data...</p>
        </div>
    `

  // Chart loading state
  if (reportChart) {
    reportChart.destroy()
  }

  const chartCanvas = document.getElementById("report-chart")
  if (chartCanvas) {
    const ctx = chartCanvas.getContext("2d")
    ctx.clearRect(0, 0, chartCanvas.width, chartCanvas.height)
  }

  // Table loading state
  document.getElementById("report-table-head").innerHTML = "<tr><th>Loading...</th></tr>"
  document.getElementById("report-table-body").innerHTML = `
        <tr>
            <td class="text-center py-3">
                <div class="spinner-border spinner-border-sm text-primary" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
                <span class="ms-2">Loading data...</span>
            </td>
        </tr>
    `

  // Reset pagination and counts
  document.getElementById("showing-entries").textContent = "0"
  document.getElementById("total-entries").textContent = "0"
  document.getElementById("table-pagination").innerHTML = ""
}

// Show error state for report
function showReportErrorState(errorMessage) {
  // Summary error state
  document.getElementById("report-summary").innerHTML = `
        <div class="col-12 text-center py-4">
            <div class="alert alert-danger">
                <i class="bi bi-exclamation-triangle-fill me-2"></i>
                ${errorMessage || "Failed to load report data"}
            </div>
        </div>
    `

  // Chart error state
  if (reportChart) {
    reportChart.destroy()
  }

  // Table error state
  document.getElementById("report-table-head").innerHTML = "<tr><th>Error</th></tr>"
  document.getElementById("report-table-body").innerHTML = `
        <tr>
            <td class="text-center py-3 text-danger">
                <i class="bi bi-exclamation-triangle-fill me-2"></i>
                ${errorMessage || "Failed to load data"}
            </td>
        </tr>
    `

  // Reset pagination and counts
  document.getElementById("showing-entries").textContent = "0"
  document.getElementById("total-entries").textContent = "0"
  document.getElementById("table-pagination").innerHTML = ""
}

// Update report title based on report type
function updateReportTitle(reportType) {
  const titleElement = document.getElementById("report-title")
  const visualizationTitleElement = document.getElementById("visualization-title")

  switch (reportType) {
    case "sales":
      titleElement.textContent = "Sales Report"
      visualizationTitleElement.textContent = "Sales Trend"
      break
    case "products":
      titleElement.textContent = "Product Sales Report"
      visualizationTitleElement.textContent = "Top Products by Revenue"
      break
    case "inventory":
      titleElement.textContent = "Inventory Report"
      visualizationTitleElement.textContent = "Inventory Status"
      break
    case "categories":
      titleElement.textContent = "Category Sales Report"
      visualizationTitleElement.textContent = "Revenue by Category"
      break
    case "payment_methods":
      titleElement.textContent = "Payment Methods Report"
      visualizationTitleElement.textContent = "Payment Methods Distribution"
      break
    default:
      titleElement.textContent = "Sales Report"
      visualizationTitleElement.textContent = "Sales Trend"
  }
}

// Update report summary cards
function updateReportSummary(data) {
  const summaryElement = document.getElementById("report-summary")
  let summaryHTML = ""

  // Format currency
  const formatCurrency = (value) => {
    return (
      "₱" +
      Number.parseFloat(value).toLocaleString("en-PH", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    )
  }

  // Generate summary cards based on report type
  switch (data.report_type) {
    case "sales":
      // Calculate totals
      const totalSales = data.data.reduce((sum, item) => sum + Number.parseFloat(item.total_sales || 0), 0)
      const totalTransactions = data.data.reduce((sum, item) => sum + Number.parseInt(item.transaction_count || 0), 0)
      const avgTransactionValue = totalTransactions > 0 ? totalSales / totalTransactions : 0
      const totalTax = data.data.reduce((sum, item) => sum + Number.parseFloat(item.total_tax || 0), 0)
      const totalDiscount = data.data.reduce((sum, item) => sum + Number.parseFloat(item.total_discount || 0), 0)

      summaryHTML = `
                <div class="col-md-4 mb-3">
                    <div class="card h-100 border-0 shadow-sm">
                        <div class="card-body">
                            <div class="d-flex justify-content-between align-items-start">
                                <div>
                                    <h6 class="card-subtitle mb-2 text-muted">Total Sales</h6>
                                    <h4 class="card-title mb-0">${formatCurrency(totalSales)}</h4>
                                </div>
                                <div class="p-2 bg-light rounded">
                                    <i class="bi bi-currency-dollar text-primary fs-4"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-md-4 mb-3">
                    <div class="card h-100 border-0 shadow-sm">
                        <div class="card-body">
                            <div class="d-flex justify-content-between align-items-start">
                                <div>
                                    <h6 class="card-subtitle mb-2 text-muted">Transactions</h6>
                                    <h4 class="card-title mb-0">${totalTransactions.toLocaleString()}</h4>
                                </div>
                                <div class="p-2 bg-light rounded">
                                    <i class="bi bi-receipt text-primary fs-4"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-md-4 mb-3">
                    <div class="card h-100 border-0 shadow-sm">
                        <div class="card-body">
                            <div class="d-flex justify-content-between align-items-start">
                                <div>
                                    <h6 class="card-subtitle mb-2 text-muted">Avg. Transaction</h6>
                                    <h4 class="card-title mb-0">${formatCurrency(avgTransactionValue)}</h4>
                                </div>
                                <div class="p-2 bg-light rounded">
                                    <i class="bi bi-cash-stack text-primary fs-4"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `
      break

    case "products":
      // Calculate totals
      const totalUnitsSold = data.data.reduce((sum, item) => sum + Number.parseInt(item.units_sold || 0), 0)
      const totalRevenue = data.data.reduce((sum, item) => sum + Number.parseFloat(item.total_revenue || 0), 0)
      const productCount = data.data.length

      summaryHTML = `
                <div class="col-md-4 mb-3">
                    <div class="card h-100 border-0 shadow-sm">
                        <div class="card-body">
                            <div class="d-flex justify-content-between align-items-start">
                                <div>
                                    <h6 class="card-subtitle mb-2 text-muted">Total Revenue</h6>
                                    <h4 class="card-title mb-0">${formatCurrency(totalRevenue)}</h4>
                                </div>
                                <div class="p-2 bg-light rounded">
                                    <i class="bi bi-currency-dollar text-primary fs-4"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-md-4 mb-3">
                    <div class="card h-100 border-0 shadow-sm">
                        <div class="card-body">
                            <div class="d-flex justify-content-between align-items-start">
                                <div>
                                    <h6 class="card-subtitle mb-2 text-muted">Units Sold</h6>
                                    <h4 class="card-title mb-0">${totalUnitsSold.toLocaleString()}</h4>
                                </div>
                                <div class="p-2 bg-light rounded">
                                    <i class="bi bi-box-seam text-primary fs-4"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-md-4 mb-3">
                    <div class="card h-100 border-0 shadow-sm">
                        <div class="card-body">
                            <div class="d-flex justify-content-between align-items-start">
                                <div>
                                    <h6 class="card-subtitle mb-2 text-muted">Products Sold</h6>
                                    <h4 class="card-title mb-0">${productCount.toLocaleString()}</h4>
                                </div>
                                <div class="p-2 bg-light rounded">
                                    <i class="bi bi-grid text-primary fs-4"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `
      break

    case "inventory":
      // Calculate inventory stats
      const totalProducts = data.data.length
      const totalStock = data.data.reduce((sum, item) => sum + Number.parseInt(item.stocks || 0), 0)
      const lowStockCount = data.data.filter((item) => item.status === "Low Stock").length
      const outOfStockCount = data.data.filter((item) => item.status === "Out of Stock").length

      summaryHTML = `
                <div class="col-md-3 mb-3">
                    <div class="card h-100 border-0 shadow-sm">
                        <div class="card-body">
                            <div class="d-flex justify-content-between align-items-start">
                                <div>
                                    <h6 class="card-subtitle mb-2 text-muted">Total Products</h6>
                                    <h4 class="card-title mb-0">${totalProducts.toLocaleString()}</h4>
                                </div>
                                <div class="p-2 bg-light rounded">
                                    <i class="bi bi-box text-primary fs-4"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-md-3 mb-3">
                    <div class="card h-100 border-0 shadow-sm">
                        <div class="card-body">
                            <div class="d-flex justify-content-between align-items-start">
                                <div>
                                    <h6 class="card-subtitle mb-2 text-muted">Total Stock</h6>
                                    <h4 class="card-title mb-0">${totalStock.toLocaleString()}</h4>
                                </div>
                                <div class="p-2 bg-light rounded">
                                    <i class="bi bi-boxes text-primary fs-4"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-md-3 mb-3">
                    <div class="card h-100 border-0 shadow-sm">
                        <div class="card-body">
                            <div class="d-flex justify-content-between align-items-start">
                                <div>
                                    <h6 class="card-subtitle mb-2 text-muted">Low Stock</h6>
                                    <h4 class="card-title mb-0">${lowStockCount.toLocaleString()}</h4>
                                </div>
                                <div class="p-2 bg-warning bg-opacity-10 rounded">
                                    <i class="bi bi-exclamation-triangle text-warning fs-4"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-md-3 mb-3">
                    <div class="card h-100 border-0 shadow-sm">
                        <div class="card-body">
                            <div class="d-flex justify-content-between align-items-start">
                                <div>
                                    <h6 class="card-subtitle mb-2 text-muted">Out of Stock</h6>
                                    <h4 class="card-title mb-0">${outOfStockCount.toLocaleString()}</h4>
                                </div>
                                <div class="p-2 bg-danger bg-opacity-10 rounded">
                                    <i class="bi bi-x-circle text-danger fs-4"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `
      break

    case "categories":
      // Calculate totals
      const totalCategoryRevenue = data.data.reduce((sum, item) => sum + Number.parseFloat(item.total_revenue || 0), 0)
      const totalCategoryUnitsSold = data.data.reduce((sum, item) => sum + Number.parseInt(item.units_sold || 0), 0)
      const categoryCount = data.data.length

      summaryHTML = `
                <div class="col-md-4 mb-3">
                    <div class="card h-100 border-0 shadow-sm">
                        <div class="card-body">
                            <div class="d-flex justify-content-between align-items-start">
                                <div>
                                    <h6 class="card-subtitle mb-2 text-muted">Total Revenue</h6>
                                    <h4 class="card-title mb-0">${formatCurrency(totalCategoryRevenue)}</h4>
                                </div>
                                <div class="p-2 bg-light rounded">
                                    <i class="bi bi-currency-dollar text-primary fs-4"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-md-4 mb-3">
                    <div class="card h-100 border-0 shadow-sm">
                        <div class="card-body">
                            <div class="d-flex justify-content-between align-items-start">
                                <div>
                                    <h6 class="card-subtitle mb-2 text-muted">Units Sold</h6>
                                    <h4 class="card-title mb-0">${totalCategoryUnitsSold.toLocaleString()}</h4>
                                </div>
                                <div class="p-2 bg-light rounded">
                                    <i class="bi bi-box-seam text-primary fs-4"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-md-4 mb-3">
                    <div class="card h-100 border-0 shadow-sm">
                        <div class="card-body">
                            <div class="d-flex justify-content-between align-items-start">
                                <div>
                                    <h6 class="card-subtitle mb-2 text-muted">Categories</h6>
                                    <h4 class="card-title mb-0">${categoryCount.toLocaleString()}</h4>
                                </div>
                                <div class="p-2 bg-light rounded">
                                    <i class="bi bi-tags text-primary fs-4"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `
      break

    case "payment_methods":
      // Calculate totals
      const totalPaymentAmount = data.data.reduce((sum, item) => sum + Number.parseFloat(item.total_amount || 0), 0)
      const totalPaymentCount = data.data.reduce((sum, item) => sum + Number.parseInt(item.payment_count || 0), 0)
      const methodCount = data.data.length

      summaryHTML = `
                <div class="col-md-4 mb-3">
                    <div class="card h-100 border-0 shadow-sm">
                        <div class="card-body">
                            <div class="d-flex justify-content-between align-items-start">
                                <div>
                                    <h6 class="card-subtitle mb-2 text-muted">Total Amount</h6>
                                    <h4 class="card-title mb-0">${formatCurrency(totalPaymentAmount)}</h4>
                                </div>
                                <div class="p-2 bg-light rounded">
                                    <i class="bi bi-currency-dollar text-primary fs-4"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-md-4 mb-3">
                    <div class="card h-100 border-0 shadow-sm">
                        <div class="card-body">
                            <div class="d-flex justify-content-between align-items-start">
                                <div>
                                    <h6 class="card-subtitle mb-2 text-muted">Payment Count</h6>
                                    <h4 class="card-title mb-0">${totalPaymentCount.toLocaleString()}</h4>
                                </div>
                                <div class="p-2 bg-light rounded">
                                    <i class="bi bi-credit-card text-primary fs-4"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-md-4 mb-3">
                    <div class="card h-100 border-0 shadow-sm">
                        <div class="card-body">
                            <div class="d-flex justify-content-between align-items-start">
                                <div>
                                    <h6 class="card-subtitle mb-2 text-muted">Payment Methods</h6>
                                    <h4 class="card-title mb-0">${methodCount.toLocaleString()}</h4>
                                </div>
                                <div class="p-2 bg-light rounded">
                                    <i class="bi bi-wallet2 text-primary fs-4"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `
      break

    default:
      summaryHTML = `
                <div class="col-12">
                    <div class="alert alert-warning">
                        <i class="bi bi-exclamation-triangle-fill me-2"></i>
                        Unknown report type: ${data.report_type}
                    </div>
                </div>
            `
  }

  // Update summary element
  summaryElement.innerHTML = summaryHTML
}

// Update report chart
function updateReportChart(data) {
  const ctx = document.getElementById("report-chart").getContext("2d")

  // Destroy existing chart if it exists
  if (reportChart) {
    reportChart.destroy()
  }

  // Format currency
  const formatCurrency = (value) => {
    return (
      "₱" +
      Number.parseFloat(value).toLocaleString("en-PH", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    )
  }

  // Generate chart based on report type
  let chartConfig

  switch (data.report_type) {
    case "sales":
      // Sort data by date ascending
      const sortedSalesData = [...data.data].sort((a, b) => new Date(a.date) - new Date(b.date))

      // Extract labels and values
      const salesLabels = sortedSalesData.map((item) => {
        const date = new Date(item.date)
        return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
      })

      const salesValues = sortedSalesData.map((item) => Number.parseFloat(item.total_sales || 0))

      chartConfig = {
        type: "bar",
        data: {
          labels: salesLabels,
          datasets: [
            {
              label: "Sales",
              data: salesValues,
              backgroundColor: "rgba(248, 215, 117, 0.7)",
              borderColor: "rgba(248, 215, 117, 1)",
              borderWidth: 1,
              borderRadius: 4,
              maxBarThickness: 35,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false,
            },
            tooltip: {
              callbacks: {
                label: (context) => formatCurrency(context.raw),
              },
            },
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                callback: (value) => formatCurrency(value),
              },
            },
          },
        },
      }
      break

    case "products":
      // Sort data by revenue descending and take top 10
      const sortedProductsData = [...data.data]
        .sort((a, b) => Number.parseFloat(b.total_revenue || 0) - Number.parseFloat(a.total_revenue || 0))
        .slice(0, 10)

      // Extract labels and values
      const productLabels = sortedProductsData.map((item) => item.product_name)
      const productValues = sortedProductsData.map((item) => Number.parseFloat(item.total_revenue || 0))

      chartConfig = {
        type: "bar",
        data: {
          labels: productLabels,
          datasets: [
            {
              label: "Revenue",
              data: productValues,
              backgroundColor: "rgba(248, 215, 117, 0.7)",
              borderColor: "rgba(248, 215, 117, 1)",
              borderWidth: 1,
              borderRadius: 4,
              maxBarThickness: 35,
            },
          ],
        },
        options: {
          indexAxis: "y",
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false,
            },
            tooltip: {
              callbacks: {
                label: (context) => formatCurrency(context.raw),
              },
            },
          },
          scales: {
            x: {
              beginAtZero: true,
              ticks: {
                callback: (value) => formatCurrency(value),
              },
            },
          },
        },
      }
      break

    case "inventory":
      // Count products by status
      const statusCounts = {
        "In Stock": data.data.filter((item) => item.status === "In Stock").length,
        "Low Stock": data.data.filter((item) => item.status === "Low Stock").length,
        "Out of Stock": data.data.filter((item) => item.status === "Out of Stock").length,
      }

      // Extract labels and values
      const statusLabels = Object.keys(statusCounts)
      const statusValues = Object.values(statusCounts)

      // Generate colors
      const statusColors = [
        "rgba(25, 135, 84, 0.7)", // In Stock - Green
        "rgba(255, 193, 7, 0.7)", // Low Stock - Yellow
        "rgba(220, 53, 69, 0.7)", // Out of Stock - Red
      ]

      const statusBorderColors = ["rgba(25, 135, 84, 1)", "rgba(255, 193, 7, 1)", "rgba(220, 53, 69, 1)"]

      chartConfig = {
        type: "pie",
        data: {
          labels: statusLabels,
          datasets: [
            {
              data: statusValues,
              backgroundColor: statusColors,
              borderColor: statusBorderColors,
              borderWidth: 1,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: "right",
              labels: {
                boxWidth: 12,
                padding: 10,
              },
            },
            tooltip: {
              callbacks: {
                label: (context) => {
                  const label = context.label || ""
                  const value = context.raw
                  const total = context.dataset.data.reduce((a, b) => a + b, 0)
                  const percentage = Math.round((value / total) * 100)
                  return `${label}: ${value} (${percentage}%)`
                },
              },
            },
          },
        },
      }
      break

    case "categories":
      // Sort data by revenue descending
      const sortedCategoriesData = [...data.data].sort(
        (a, b) => Number.parseFloat(b.total_revenue || 0) - Number.parseFloat(a.total_revenue || 0),
      )

      // Extract labels and values
      const categoryLabels = sortedCategoriesData.map((item) => item.category)
      const categoryValues = sortedCategoriesData.map((item) => Number.parseFloat(item.total_revenue || 0))

      // Generate colors
      const backgroundColors = [
        "rgba(248, 215, 117, 0.7)",
        "rgba(220, 53, 69, 0.7)",
        "rgba(25, 135, 84, 0.7)",
        "rgba(255, 193, 7, 0.7)",
        "rgba(111, 66, 193, 0.7)",
        "rgba(23, 162, 184, 0.7)",
        "rgba(102, 16, 242, 0.7)",
        "rgba(253, 126, 20, 0.7)",
        "rgba(32, 201, 151, 0.7)",
        "rgba(108, 117, 125, 0.7)",
      ]

      const borderColors = backgroundColors.map((color) => color.replace("0.7", "1"))

      chartConfig = {
        type: "pie",
        data: {
          labels: categoryLabels,
          datasets: [
            {
              data: categoryValues,
              backgroundColor: backgroundColors.slice(0, categoryLabels.length),
              borderColor: borderColors.slice(0, categoryLabels.length),
              borderWidth: 1,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: "right",
              labels: {
                boxWidth: 12,
                padding: 10,
              },
            },
            tooltip: {
              callbacks: {
                label: (context) => {
                  const label = context.label || ""
                  const value = context.raw
                  const total = context.dataset.data.reduce((a, b) => a + b, 0)
                  const percentage = Math.round((value / total) * 100)
                  return `${label}: ${formatCurrency(value)} (${percentage}%)`
                },
              },
            },
          },
        },
      }
      break

    case "payment_methods":
      // Extract labels and values
      const methodLabels = data.data.map((item) => item.method_name)
      const methodValues = data.data.map((item) => Number.parseFloat(item.total_amount || 0))

      // Generate colors
      const methodBackgroundColors = [
        "rgba(248, 215, 117, 0.7)",
        "rgba(220, 53, 69, 0.7)",
        "rgba(25, 135, 84, 0.7)",
        "rgba(255, 193, 7, 0.7)",
        "rgba(111, 66, 193, 0.7)",
      ]

      const methodBorderColors = methodBackgroundColors.map((color) => color.replace("0.7", "1"))

      chartConfig = {
        type: "doughnut",
        data: {
          labels: methodLabels,
          datasets: [
            {
              data: methodValues,
              backgroundColor: methodBackgroundColors.slice(0, methodLabels.length),
              borderColor: methodBorderColors.slice(0, methodLabels.length),
              borderWidth: 1,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: "right",
              labels: {
                boxWidth: 12,
                padding: 10,
              },
            },
            tooltip: {
              callbacks: {
                label: (context) => {
                  const label = context.label || ""
                  const value = context.raw
                  const total = context.dataset.data.reduce((a, b) => a + b, 0)
                  const percentage = Math.round((value / total) * 100)
                  return `${label}: ${formatCurrency(value)} (${percentage}%)`
                },
              },
            },
          },
          cutout: "60%",
        },
      }
      break

    default:
      // Default empty chart
      chartConfig = {
        type: "bar",
        data: {
          labels: [],
          datasets: [
            {
              label: "No Data",
              data: [],
              backgroundColor: "rgba(248, 215, 117, 0.7)",
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false,
            },
          },
        },
      }
  }

  // Create new chart
  reportChart = new Chart(ctx, chartConfig)
}

// Update chart type (bar or line)
function updateChartType(chartType) {
  if (!reportChart || !currentReportData) return

  // Only applicable for sales report
  if (currentReportData.report_type !== "sales") return

  // Update chart type
  reportChart.config.type = chartType

  // Update chart
  reportChart.update()
}

// Update report table
function updateReportTable(data) {
  const tableHead = document.getElementById("report-table-head")
  const tableBody = document.getElementById("report-table-body")

  // Format currency
  const formatCurrency = (value) => {
    return (
      "₱" +
      Number.parseFloat(value).toLocaleString("en-PH", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    )
  }

  // Generate table headers and rows based on report type
  let headHTML = ""
  let bodyHTML = ""

  switch (data.report_type) {
    case "sales":
      headHTML = `
                <tr>
                    <th>Date</th>
                    <th class="text-center">Transactions</th>
                    <th class="text-end">Total Sales</th>
                    <th class="text-end">Avg. Transaction</th>
                    <th class="text-end">Tax</th>
                    <th class="text-end">Discount</th>
                </tr>
            `

      // Sort data by date descending
      const sortedSalesData = [...data.data].sort((a, b) => new Date(b.date) - new Date(a.date))

      sortedSalesData.forEach((item) => {
        const date = new Date(item.date)
        const formattedDate = date.toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        })

        const transactionCount = Number.parseInt(item.transaction_count || 0)
        const totalSales = Number.parseFloat(item.total_sales || 0)
        const avgTransaction = transactionCount > 0 ? totalSales / transactionCount : 0

        bodyHTML += `
                    <tr>
                        <td>${formattedDate}</td>
                        <td class="text-center">${transactionCount.toLocaleString()}</td>
                        <td class="text-end">${formatCurrency(totalSales)}</td>
                        <td class="text-end">${formatCurrency(avgTransaction)}</td>
                        <td class="text-end">${formatCurrency(item.total_tax || 0)}</td>
                        <td class="text-end">${formatCurrency(item.total_discount || 0)}</td>
                    </tr>
                `
      })
      break

    case "products":
      headHTML = `
                <tr>
                    <th>Product</th>
                    <th>Category</th>
                    <th class="text-center">Units Sold</th>
                    <th class="text-end">Avg. Price</th>
                    <th class="text-end">Revenue</th>
                    <th class="text-center">Transactions</th>
                </tr>
            `

      // Sort data by revenue descending
      const sortedProductsData = [...data.data].sort(
        (a, b) => Number.parseFloat(b.total_revenue || 0) - Number.parseFloat(a.total_revenue || 0),
      )

      sortedProductsData.forEach((item) => {
        bodyHTML += `
                    <tr>
                        <td>${item.product_name}</td>
                        <td>${item.category || "N/A"}</td>
                        <td class="text-center">${Number.parseInt(item.units_sold || 0).toLocaleString()}</td>
                        <td class="text-end">${formatCurrency(item.avg_price || 0)}</td>
                        <td class="text-end">${formatCurrency(item.total_revenue || 0)}</td>
                        <td class="text-center">${Number.parseInt(item.transaction_count || 0).toLocaleString()}</td>
                    </tr>
                `
      })
      break

    case "inventory":
      headHTML = `
                <tr>
                    <th>Product ID</th>
                    <th>Product Name</th>
                    <th>Category</th>
                    <th class="text-center">Stock</th>
                    <th class="text-end">Price</th>
                    <th>Expiration Date</th>
                    <th>Status</th>
                    <th>Last Updated</th>
                </tr>
            `

      // Sort data by stock level (ascending)
      const sortedInventoryData = [...data.data].sort(
        (a, b) => Number.parseInt(a.stocks || 0) - Number.parseInt(b.stocks || 0),
      )

      sortedInventoryData.forEach((item) => {
        // Determine status class
        let statusClass = ""
        switch (item.status) {
          case "In Stock":
            statusClass = "bg-success"
            break
          case "Low Stock":
            statusClass = "bg-warning"
            break
          case "Out of Stock":
            statusClass = "bg-danger"
            break
        }

        // Format expiration date
        const expirationDate =
          item.expiration_date && item.expiration_date !== "0000-00-00"
            ? new Date(item.expiration_date).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })
            : "N/A"

        // Format updated date
        const updatedDate = item.updated_at
          ? new Date(item.updated_at).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })
          : "N/A"

        bodyHTML += `
                    <tr>
                        <td>${item.product_id}</td>
                        <td>${item.product_name}</td>
                        <td>${item.category || "N/A"}</td>
                        <td class="text-center">${Number.parseInt(item.stocks || 0).toLocaleString()}</td>
                        <td class="text-end">${formatCurrency(item.price || 0)}</td>
                        <td>${expirationDate}</td>
                        <td><span class="badge ${statusClass}">${item.status}</span></td>
                        <td>${updatedDate}</td>
                    </tr>
                `
      })
      break

    case "categories":
      headHTML = `
                <tr>
                    <th>Category</th>
                    <th class="text-center">Products</th>
                    <th class="text-center">Units Sold</th>
                    <th class="text-end">Revenue</th>
                    <th class="text-center">Transactions</th>
                </tr>
            `

      // Sort data by revenue descending
      const sortedCategoriesData = [...data.data].sort(
        (a, b) => Number.parseFloat(b.total_revenue || 0) - Number.parseFloat(a.total_revenue || 0),
      )

      sortedCategoriesData.forEach((item) => {
        bodyHTML += `
                    <tr>
                        <td>${item.category}</td>
                        <td class="text-center">${Number.parseInt(item.product_count || 0).toLocaleString()}</td>
                        <td class="text-center">${Number.parseInt(item.units_sold || 0).toLocaleString()}</td>
                        <td class="text-end">${formatCurrency(item.total_revenue || 0)}</td>
                        <td class="text-center">${Number.parseInt(item.transaction_count || 0).toLocaleString()}</td>
                    </tr>
                `
      })
      break

    case "payment_methods":
      headHTML = `
                <tr>
                    <th>Payment Method</th>
                    <th class="text-center">Payment Count</th>
                    <th class="text-end">Total Amount</th>
                    <th class="text-end">Avg. Amount</th>
                    <th class="text-center">Transactions</th>
                </tr>
            `

      // Sort data by total amount descending
      const sortedMethodsData = [...data.data].sort(
        (a, b) => Number.parseFloat(b.total_amount || 0) - Number.parseFloat(a.total_amount || 0),
      )

      sortedMethodsData.forEach((item) => {
        bodyHTML += `
                    <tr>
                        <td>${item.method_name}</td>
                        <td class="text-center">${Number.parseInt(item.payment_count || 0).toLocaleString()}</td>
                        <td class="text-end">${formatCurrency(item.total_amount || 0)}</td>
                        <td class="text-end">${formatCurrency(item.avg_amount || 0)}</td>
                        <td class="text-center">${Number.parseInt(item.transaction_count || 0).toLocaleString()}</td>
                    </tr>
                `
      })
      break

    default:
      headHTML = `<tr><th>No data available</th></tr>`
      bodyHTML = `<tr><td>No data available for the selected report type</td></tr>`
  }

  // Update table
  tableHead.innerHTML = headHTML
  tableBody.innerHTML = bodyHTML

  // Update pagination and counts
  document.getElementById("showing-entries").textContent = data.data.length
  document.getElementById("total-entries").textContent = data.data.length

  // Simple pagination (can be enhanced for larger datasets)
  updatePagination(data.data.length, 1, 10)
}

// Filter table data based on search term
function filterTableData(searchTerm) {
  if (!currentReportData || !filteredData) return

  searchTerm = searchTerm.toLowerCase()

  if (searchTerm === "") {
    // Reset to original data
    filteredData = [...currentReportData.data]
  } else {
    // Filter data based on search term
    filteredData = currentReportData.data.filter((item) => {
      // Check all properties for a match
      return Object.values(item).some((value) => {
        if (value === null || value === undefined) return false
        return value.toString().toLowerCase().includes(searchTerm)
      })
    })
  }

  // Update table with filtered data
  const filteredDataObj = {
    ...currentReportData,
    data: filteredData,
  }

  updateReportTable(filteredDataObj)
}

// Update pagination controls
function updatePagination(totalItems, currentPage, itemsPerPage) {
  const paginationElement = document.getElementById("table-pagination")
  const totalPages = Math.ceil(totalItems / itemsPerPage)

  // Simple pagination for now
  let paginationHTML = ""

  if (totalPages > 1) {
    paginationHTML += `
            <li class="page-item ${currentPage === 1 ? "disabled" : ""}">
                <a class="page-link" href="#" data-page="${currentPage - 1}" aria-label="Previous">
                    <span aria-hidden="true">&laquo;</span>
                </a>
            </li>
        `

    for (let i = 1; i <= totalPages; i++) {
      paginationHTML += `
                <li class="page-item ${i === currentPage ? "active" : ""}">
                    <a class="page-link" href="#" data-page="${i}">${i}</a>
                </li>
            `
    }

    paginationHTML += `
            <li class="page-item ${currentPage === totalPages ? "disabled" : ""}">
                <a class="page-link" href="#" data-page="${currentPage + 1}" aria-label="Next">
                    <span aria-hidden="true">&raquo;</span>
                </a>
            </li>
        `
  }

  paginationElement.innerHTML = paginationHTML

  // Add event listeners to pagination links
  document.querySelectorAll("#table-pagination .page-link").forEach((link) => {
    link.addEventListener("click", function (e) {
      e.preventDefault()
      const page = Number.parseInt(this.getAttribute("data-page"))
      // Implement pagination logic here
      // For now, just update the pagination UI
      updatePagination(totalItems, page, itemsPerPage)
    })
  })
}

// Export report functions
function exportReport(format) {
  if (!currentReportData) return

  const reportType = currentReportData.report_type
  const dateRange = document.getElementById("date-range").value

  // Close modal
  const exportModal = bootstrap.Modal.getInstance(document.getElementById("exportModal"))
  if (exportModal) {
    exportModal.hide()
  }

  // Show loading indicator
  const loadingToast = new bootstrap.Toast(document.getElementById("loadingToast"))
  loadingToast.show()

  // Prepare data for export
  const exportData = prepareExportData(currentReportData)

  // Simulate export process (in a real app, this would call a server endpoint)
  setTimeout(() => {
    // Hide loading indicator
    loadingToast.hide()

    // Show success message
    const successToast = new bootstrap.Toast(document.getElementById("successToast"))
    document.getElementById("successToastMessage").textContent =
      `${reportType.charAt(0).toUpperCase() + reportType.slice(1)} report exported as ${format.toUpperCase()}`
    successToast.show()

    // In a real implementation, you would:
    // 1. Send data to server for processing
    // 2. Receive a file URL
    // 3. Trigger download

    // For demo purposes, we'll simulate a download for CSV
    if (format === "csv") {
      downloadCSV(exportData, `${reportType}_report_${new Date().toISOString().split("T")[0]}.csv`)
    }
  }, 1500)
}

// Prepare data for export
function prepareExportData(reportData) {
  const data = reportData.data
  const reportType = reportData.report_type

  // Format data based on report type
  switch (reportType) {
    case "sales":
      return data.map((item) => ({
        Date: new Date(item.date).toLocaleDateString(),
        Transactions: item.transaction_count,
        "Total Sales": Number.parseFloat(item.total_sales || 0).toFixed(2),
        "Average Transaction": (
          Number.parseFloat(item.total_sales || 0) / Number.parseInt(item.transaction_count || 1)
        ).toFixed(2),
        "Tax Amount": Number.parseFloat(item.total_tax || 0).toFixed(2),
        "Discount Amount": Number.parseFloat(item.total_discount || 0).toFixed(2),
      }))

    case "products":
      return data.map((item) => ({
        Product: item.product_name,
        Category: item.category || "N/A",
        "Units Sold": item.units_sold,
        "Average Price": Number.parseFloat(item.avg_price || 0).toFixed(2),
        Revenue: Number.parseFloat(item.total_revenue || 0).toFixed(2),
        Transactions: item.transaction_count,
      }))

    case "inventory":
      return data.map((item) => ({
        "Product ID": item.product_id,
        "Product Name": item.product_name,
        Category: item.category || "N/A",
        Stock: item.stocks,
        Price: Number.parseFloat(item.price || 0).toFixed(2),
        "Expiration Date":
          item.expiration_date && item.expiration_date !== "0000-00-00"
            ? new Date(item.expiration_date).toLocaleDateString()
            : "N/A",
        Status: item.status,
        "Last Updated": item.updated_at ? new Date(item.updated_at).toLocaleDateString() : "N/A",
      }))

    case "categories":
      return data.map((item) => ({
        Category: item.category,
        Products: item.product_count,
        "Units Sold": item.units_sold,
        Revenue: Number.parseFloat(item.total_revenue || 0).toFixed(2),
        Transactions: item.transaction_count,
      }))

    case "payment_methods":
      return data.map((item) => ({
        "Payment Method": item.method_name,
        "Payment Count": item.payment_count,
        "Total Amount": Number.parseFloat(item.total_amount || 0).toFixed(2),
        "Average Amount": Number.parseFloat(item.avg_amount || 0).toFixed(2),
        Transactions: item.transaction_count,
      }))

    default:
      return data
  }
}

// Download CSV function
function downloadCSV(data, filename) {
  if (!data || !data.length) {
    console.error("No data to export")
    return
  }

  // Get headers from first object
  const headers = Object.keys(data[0])

  // Create CSV content
  let csvContent = headers.join(",") + "\n"

  // Add rows
  data.forEach((item) => {
    const row = headers
      .map((header) => {
        // Wrap values with commas in quotes
        const value = item[header] !== undefined ? item[header] : ""
        return typeof value === "string" && value.includes(",") ? `"${value}"` : value
      })
      .join(",")
    csvContent += row + "\n"
  })

  // Create blob and download link
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)

  // Create download link
  const link = document.createElement("a")
  link.setAttribute("href", url)
  link.setAttribute("download", filename)
  link.style.visibility = "hidden"

  // Add to document, click and remove
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// Print report
function printReport() {
  if (!currentReportData) return

  // Close modal
  const exportModal = bootstrap.Modal.getInstance(document.getElementById("exportModal"))
  if (exportModal) {
    exportModal.hide()
  }

  // Create print-friendly version
  const printWindow = window.open("", "_blank")

  // Get report title
  const reportTitle = document.getElementById("report-title").textContent

  // Get date range
  const dateRange = document.getElementById("date-range").value

  // Get report summary
  const reportSummary = document.getElementById("report-summary").innerHTML

  // Get report table
  const reportTableHead = document.getElementById("report-table-head").innerHTML
  const reportTableBody = document.getElementById("report-table-body").innerHTML

  // Create print content
  const printContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>${reportTitle} - Piñana Gourmet</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    margin: 20px;
                }
                .header {
                    text-align: center;
                    margin-bottom: 20px;
                }
                .logo {
                    max-width: 150px;
                    margin-bottom: 10px;
                }
                h1 {
                    margin: 0;
                    color: #333;
                }
                .date-range {
                    color: #666;
                    margin-top: 5px;
                }
                .summary {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 15px;
                    margin-bottom: 30px;
                }
                .summary-card {
                    flex: 1;
                    min-width: 200px;
                    padding: 15px;
                    border: 1px solid #ddd;
                    border-radius: 8px;
                }
                .card-subtitle {
                    color: #666;
                    margin-bottom: 5px;
                    font-size: 14px;
                }
                .card-title {
                    font-size: 24px;
                    margin: 0;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-top: 20px;
                }
                th, td {
                    padding: 10px;
                    text-align: left;
                    border-bottom: 1px solid #ddd;
                }
                th {
                    background-color: #f5f5f5;
                    font-weight: bold;
                }
                .text-center {
                    text-align: center;
                }
                .text-end {
                    text-align: right;
                }
                .footer {
                    margin-top: 30px;
                    text-align: center;
                    color: #666;
                    font-size: 12px;
                }
                @media print {
                    body {
                        margin: 0;
                        padding: 15px;
                    }
                }
            </style>
        </head>
        <body>
            <div class="header">
                <img src="images/final-light.png" alt="Piñana Gourmet Logo" class="logo">
                <h1>${reportTitle}</h1>
                <div class="date-range">Date Range: ${dateRange}</div>
                <div class="date-range">Generated on: ${new Date().toLocaleString()}</div>
            </div>
            
            <div class="summary">
                ${reportSummary.replace(/class="col-md-\d+/g, 'class="summary-card')}
            </div>
            
            <table>
                <thead>
                    ${reportTableHead}
                </thead>
                <tbody>
                    ${reportTableBody}
                </tbody>
            </table>
            
            <div class="footer">
                <p>© ${new Date().getFullYear()} Piñana Gourmet. All rights reserved.</p>
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
    `

  // Write to print window
  printWindow.document.open()
  printWindow.document.write(printContent)
  printWindow.document.close()
}

