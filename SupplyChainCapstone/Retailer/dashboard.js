import { Chart } from "@/components/ui/chart"
// Wait for the DOM to be fully loaded
document.addEventListener("DOMContentLoaded", () => {
  // Initialize charts
  initCharts()

  // Initialize sales period dropdown
  initSalesPeriodDropdown()
})

// Initialize charts
function initCharts() {
  // Sales Chart
  const salesChartCtx = document.getElementById("salesChart")
  if (salesChartCtx) {
    const salesChart = new Chart(salesChartCtx, {
      type: "line",
      data: {
        labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
        datasets: [
          {
            label: "Sales",
            data: [1500, 1800, 2200, 2400, 2000, 2500, 2800, 3100, 2900, 3300, 3500, 3800],
            backgroundColor: "rgba(248, 215, 117, 0.2)",
            borderColor: "#f8d775",
            borderWidth: 2,
            tension: 0.4,
            fill: true,
          },
          {
            label: "Revenue",
            data: [2500, 2800, 3200, 3400, 3000, 3500, 3800, 4100, 3900, 4300, 4500, 4800],
            backgroundColor: "rgba(248, 117, 0, 0.1)",
            borderColor: "#f87500",
            borderWidth: 2,
            tension: 0.4,
            fill: true,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "top",
          },
          tooltip: {
            mode: "index",
            intersect: false,
            callbacks: {
              label: (context) => {
                let label = context.dataset.label || ""
                if (label) {
                  label += ": "
                }
                if (context.parsed.y !== null) {
                  label += "₱" + context.parsed.y.toLocaleString()
                }
                return label
              },
            },
          },
        },
        scales: {
          x: {
            grid: {
              display: false,
            },
          },
          y: {
            beginAtZero: true,
            ticks: {
              callback: (value) => "₱" + value.toLocaleString(),
            },
          },
        },
      },
    })

    // Store chart in window object for later access
    window.salesChart = salesChart
  }

  // Category Chart
  const categoryChartCtx = document.getElementById("categoryChart")
  if (categoryChartCtx) {
    const categoryChart = new Chart(categoryChartCtx, {
      type: "doughnut",
      data: {
        labels: ["Preserves", "Beverages", "Snacks", "Bakery", "Confectionery"],
        datasets: [
          {
            data: [35, 25, 15, 15, 10],
            backgroundColor: [
              "#f8d775", // Primary yellow
              "#f87500", // Secondary orange
              "#f8c145", // Primary dark
              "#fae7a5", // Primary light
              "#ff9a3c", // Another orange shade
            ],
            borderWidth: 0,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "bottom",
            labels: {
              padding: 20,
              boxWidth: 12,
            },
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const label = context.label || ""
                const value = context.parsed || 0
                const total = context.dataset.data.reduce((acc, data) => acc + data, 0)
                const percentage = Math.round((value / total) * 100)
                return `${label}: ${percentage}% (${value})`
              },
            },
          },
        },
        cutout: "70%",
      },
    })

    // Store chart in window object for later access
    window.categoryChart = categoryChart
  }
}

// Initialize sales period dropdown
function initSalesPeriodDropdown() {
  const salesPeriodDropdown = document.getElementById("salesPeriodDropdown")
  const periodItems = document.querySelectorAll("[data-period]")

  if (salesPeriodDropdown && periodItems.length > 0) {
    periodItems.forEach((item) => {
      item.addEventListener("click", function (e) {
        e.preventDefault()

        // Get the selected period
        const period = this.getAttribute("data-period")

        // Update dropdown button text
        salesPeriodDropdown.textContent = this.textContent

        // Update active state
        periodItems.forEach((periodItem) => {
          periodItem.classList.remove("active")
        })
        this.classList.add("active")

        // Update chart data based on selected period
        updateSalesChart(period)
      })
    })
  }
}

// Update sales chart based on selected period
function updateSalesChart(period) {
  if (!window.salesChart) return

  let labels, salesData, revenueData

  switch (period) {
    case "weekly":
      labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
      salesData = [500, 700, 650, 800, 750, 900, 850]
      revenueData = [800, 1000, 950, 1100, 1050, 1200, 1150]
      break
    case "yearly":
      labels = ["2018", "2019", "2020", "2021", "2022", "2023"]
      salesData = [15000, 18000, 16000, 22000, 25000, 30000]
      revenueData = [25000, 28000, 26000, 32000, 35000, 40000]
      break
    default: // monthly
      labels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
      salesData = [1500, 1800, 2200, 2400, 2000, 2500, 2800, 3100, 2900, 3300, 3500, 3800]
      revenueData = [2500, 2800, 3200, 3400, 3000, 3500, 3800, 4100, 3900, 4300, 4500, 4800]
  }

  // Update chart data
  window.salesChart.data.labels = labels
  window.salesChart.data.datasets[0].data = salesData
  window.salesChart.data.datasets[1].data = revenueData
  window.salesChart.update()
}
