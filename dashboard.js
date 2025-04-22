// Dashboard.js - Handles dashboard functionality and data visualization

// Global chart instances
let salesTrendChart;
let categoryRevenueChart;
let inventoryStatusChart;
let paymentMethodsChart;

// Dashboard initialization
document.addEventListener('DOMContentLoaded', function() {
  // Initialize period selector
  const periodSelect = document.getElementById('period-select');
  if (periodSelect) {
    periodSelect.addEventListener('change', function() {
      loadDashboardData(this.value);
    });
    
    // Load initial data with default period (month)
    loadDashboardData(periodSelect.value);
  }
  
  // Initialize sidebar toggle for mobile
  const sidebarToggle = document.getElementById('sidebarToggle');
  const sidebar = document.getElementById('sidebar');
  
  if (sidebarToggle && sidebar) {
    sidebarToggle.addEventListener('click', function() {
      sidebar.classList.toggle('show');
    });
  }
});

// Load dashboard data from API
function loadDashboardData(period) {
  // Show loading indicators
  showLoadingState();
  
  // Fetch data from API
  fetch(`fetch_dashboard_data.php?period=${period}`)
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
      if (data.success) {
        // Update dashboard with fetched data
        updateDashboard(data);
      } else {
        throw new Error(data.message || 'Failed to load dashboard data');
      }
    })
    .catch(error => {
      console.error('Error loading dashboard data:', error);
      showErrorState(error.message);
    });
}

// Show loading state for dashboard elements
function showLoadingState() {
  // KPI cards loading state
  document.getElementById('total-sales').innerHTML = '<div class="placeholder-glow"><span class="placeholder col-8"></span></div>';
  document.getElementById('total-transactions').innerHTML = '<div class="placeholder-glow"><span class="placeholder col-8"></span></div>';
  document.getElementById('avg-transaction').innerHTML = '<div class="placeholder-glow"><span class="placeholder col-8"></span></div>';
  document.getElementById('items-sold').innerHTML = '<div class="placeholder-glow"><span class="placeholder col-8"></span></div>';
  
  // Top products loading state
  document.getElementById('top-products-table').innerHTML = `
    <tr>
      <td colspan="3" class="text-center py-3">
        <div class="spinner-border spinner-border-sm text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
        <span class="ms-2">Loading data...</span>
      </td>
    </tr>
  `;
  
  // Recent transactions loading state
  document.getElementById('recent-transactions-table').innerHTML = `
    <tr>
      <td colspan="6" class="text-center py-3">
        <div class="spinner-border spinner-border-sm text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
        <span class="ms-2">Loading transactions...</span>
      </td>
    </tr>
  `;
}

// Show error state for dashboard elements
function showErrorState(errorMessage) {
  // KPI cards error state
  const errorHtml = `<span class="text-danger"><i class="bi bi-exclamation-triangle"></i> Error</span>`;
  document.getElementById('total-sales').innerHTML = errorHtml;
  document.getElementById('total-transactions').innerHTML = errorHtml;
  document.getElementById('avg-transaction').innerHTML = errorHtml;
  document.getElementById('items-sold').innerHTML = errorHtml;
  
  // Top products error state
  document.getElementById('top-products-table').innerHTML = `
    <tr>
      <td colspan="3" class="text-center py-3 text-danger">
        <i class="bi bi-exclamation-triangle-fill me-2"></i>
        ${errorMessage || 'Failed to load data'}
      </td>
    </tr>
  `;
  
  // Recent transactions error state
  document.getElementById('recent-transactions-table').innerHTML = `
    <tr>
      <td colspan="6" class="text-center py-3 text-danger">
        <i class="bi bi-exclamation-triangle-fill me-2"></i>
        ${errorMessage || 'Failed to load data'}
      </td>
    </tr>
  `;
}

// Update dashboard with fetched data
function updateDashboard(data) {
  // Update KPI cards
  updateKPICards(data.kpi);
  
  // Update charts
  updateSalesTrendChart(data.sales_trend);
  updateCategoryRevenueChart(data.category_revenue);
  updateInventoryStatusChart(data.inventory_status);
  updatePaymentMethodsChart(data.payment_methods);
  
  // Update tables
  updateTopProductsTable(data.top_products);
  updateRecentTransactionsTable(data.recent_transactions);
}

// Update KPI cards with data
function updateKPICards(kpiData) {
  // Format currency values
  const formatCurrency = value => '₱' + parseFloat(value).toLocaleString('en-PH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  
  // Format growth indicators
  const formatGrowth = (value, element) => {
    const growthValue = parseFloat(value);
    let icon, colorClass;
    
    if (growthValue > 0) {
      icon = 'bi-arrow-up-short';
      colorClass = 'text-success';
    } else if (growthValue < 0) {
      icon = 'bi-arrow-down-short';
      colorClass = 'text-danger';
    } else {
      icon = 'bi-dash';
      colorClass = 'text-muted';
    }
    
    element.innerHTML = `<i class="bi ${icon}"></i> ${Math.abs(growthValue).toFixed(1)}%`;
    element.className = colorClass;
  };
  
  // Total Sales
  document.getElementById('total-sales').textContent = formatCurrency(kpiData.total_sales);
  formatGrowth(kpiData.sales_growth, document.getElementById('sales-growth-badge'));
  
  // Total Transactions
  document.getElementById('total-transactions').textContent = parseInt(kpiData.total_transactions).toLocaleString();
  formatGrowth(kpiData.transactions_growth, document.getElementById('transactions-growth-badge'));
  
  // Average Transaction Value
  document.getElementById('avg-transaction').textContent = formatCurrency(kpiData.avg_transaction_value);
  formatGrowth(kpiData.avg_transaction_growth, document.getElementById('avg-transaction-growth-badge'));
  
  // Total Items Sold
  document.getElementById('items-sold').textContent = parseInt(kpiData.total_items_sold).toLocaleString();
  formatGrowth(kpiData.items_sold_growth, document.getElementById('items-sold-growth-badge'));
}

// Update Sales Trend Chart
function updateSalesTrendChart(salesTrendData) {
  const ctx = document.getElementById('sales-trend-chart').getContext('2d');
  
  // Destroy existing chart if it exists
  if (salesTrendChart) {
    salesTrendChart.destroy();
  }
  
  // Create new chart
  salesTrendChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: salesTrendData.labels,
      datasets: [{
        label: 'Sales',
        data: salesTrendData.values,
        backgroundColor: 'rgba(248, 215, 117, 0.2)',
        borderColor: 'rgba(248, 215, 117, 1)',
        borderWidth: 2,
        pointBackgroundColor: 'rgba(248, 215, 117, 1)',
        pointBorderColor: '#fff',
        pointBorderWidth: 1,
        pointRadius: 4,
        tension: 0.3,
        fill: true
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              return '₱' + context.raw.toLocaleString('en-PH', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              });
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function(value) {
              return '₱' + value.toLocaleString('en-PH', {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
              });
            }
          }
        }
      }
    }
  });
}

// Update Category Revenue Chart
function updateCategoryRevenueChart(categoryData) {
  const ctx = document.getElementById('category-revenue-chart').getContext('2d');
  
  // Destroy existing chart if it exists
  if (categoryRevenueChart) {
    categoryRevenueChart.destroy();
  }
  
  // Generate colors for categories
  const backgroundColors = [
    'rgba(248, 215, 117, 0.7)',
    'rgba(8, 151, 20, 0.7)',
    'rgba(117, 248, 117, 0.7)',
    'rgba(250, 184, 19, 0.7)',
    'rgba(236, 234, 112, 0.7)',
    'rgba(153, 237, 74, 0.7)'
  ];
  
  // Create new chart
  categoryRevenueChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: categoryData.labels,
      datasets: [{
        data: categoryData.values,
        backgroundColor: backgroundColors,
        borderColor: backgroundColors.map(color => color.replace('0.7', '1')),
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'right',
          labels: {
            boxWidth: 12,
            padding: 10
          }
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const label = context.label || '';
              const value = context.raw;
              const total = context.dataset.data.reduce((a, b) => a + b, 0);
              const percentage = Math.round((value / total) * 100);
              return `${label}: ₱${value.toLocaleString()} (${percentage}%)`;
            }
          }
        }
      },
      cutout: '60%'
    }
  });
}

// Update Inventory Status Chart
function updateInventoryStatusChart(inventoryData) {
  const ctx = document.getElementById('inventory-status-chart').getContext('2d');
  
  // Destroy existing chart if it exists
  if (inventoryStatusChart) {
    inventoryStatusChart.destroy();
  }
  
  // Update inventory counts
  document.getElementById('in-stock-count').textContent = inventoryData.in_stock;
  document.getElementById('low-stock-count').textContent = inventoryData.low_stock;
  document.getElementById('out-of-stock-count').textContent = inventoryData.out_of_stock;
  
  // Create new chart
  inventoryStatusChart = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: ['In Stock', 'Low Stock', 'Out of Stock'],
      datasets: [{
        data: [
          inventoryData.in_stock,
          inventoryData.low_stock,
          inventoryData.out_of_stock
        ],
        backgroundColor: [
          'rgba(25, 135, 84, 0.7)',
          'rgba(255, 193, 7, 0.7)',
          'rgba(220, 53, 69, 0.7)'
        ],
        borderColor: [
          'rgba(25, 135, 84, 1)',
          'rgba(255, 193, 7, 1)',
          'rgba(220, 53, 69, 1)'
        ],
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const label = context.label || '';
              const value = context.raw;
              const total = context.dataset.data.reduce((a, b) => a + b, 0);
              const percentage = Math.round((value / total) * 100);
              return `${label}: ${value} (${percentage}%)`;
            }
          }
        }
      }
    }
  });
}

// Update Payment Methods Chart
function updatePaymentMethodsChart(paymentData) {
  const ctx = document.getElementById('payment-methods-chart').getContext('2d');
  
  // Destroy existing chart if it exists
  if (paymentMethodsChart) {
    paymentMethodsChart.destroy();
  }
  
  // Generate colors for payment methods
  const backgroundColors = [
    'rgba(12, 192, 96, 0.7)',
    'rgba(234, 220, 21, 0.7)',
    'rgba(255, 255, 0, 0.7)',
    'rgba(227, 229, 78, 0.7)',
    'rgba(241, 144, 9, 0.7)'
  ];
  
  // Create new chart
  paymentMethodsChart = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: paymentData.labels,
      datasets: [{
        data: paymentData.values,
        backgroundColor: backgroundColors,
        borderColor: backgroundColors.map(color => color.replace('0.7', '1')),
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const label = context.label || '';
              const value = context.raw;
              const total = context.dataset.data.reduce((a, b) => a + b, 0);
              const percentage = Math.round((value / total) * 100);
              return `${label}: ₱${value.toLocaleString()} (${percentage}%)`;
            }
          }
        }
      }
    }
  });
  
  // Update payment methods legend
  updatePaymentMethodsLegend(paymentData);
}

// Update Payment Methods Legend
function updatePaymentMethodsLegend(paymentData) {
  const legendContainer = document.getElementById('payment-methods-legend');
  if (!legendContainer) return;
  
  // Calculate total
  const total = paymentData.values.reduce((a, b) => a + b, 0);
  
  // Generate legend HTML
  let legendHtml = '';
  
  const backgroundColors = [
    'rgba(12, 192, 96, 0.7)',
    'rgba(234, 220, 21, 0.7)',
    'rgba(255, 255, 0, 0.7)',
    'rgba(227, 229, 78, 0.7)',
    'rgba(241, 144, 9, 0.7)'
  ];
  
  paymentData.labels.forEach((label, index) => {
    const value = paymentData.values[index];
    const percentage = Math.round((value / total) * 100);
    const color = backgroundColors[index % backgroundColors.length];
    
    legendHtml += `
      <div class="legend-item">
        <span class="legend-color" style="background-color: ${color}"></span>
        <span class="legend-label">${label}</span>
        <span class="legend-value">${percentage}%</span>
      </div>
    `;
  });
  
  legendContainer.innerHTML = legendHtml;
}

// Update Top Products Table
function updateTopProductsTable(productsData) {
  const tableBody = document.getElementById('top-products-table');
  if (!tableBody) return;
  
  // Generate table rows
  let tableHtml = '';
  
  if (productsData.length === 0) {
    tableHtml = `
      <tr>
        <td colspan="3" class="text-center py-3">No product data available</td>
      </tr>
    `;
  } else {
    productsData.forEach(product => {
      tableHtml += `
        <tr>
          <td>
            <div class="d-flex flex-column">
              <span class="fw-medium">${product.product_name}</span>
              <small class="text-muted">${product.category}</small>
            </div>
          </td>
          <td class="text-center">${product.units_sold}</td>
          <td class="text-end">${product.revenue_formatted}</td>
        </tr>
      `;
    });
  }
  
  tableBody.innerHTML = tableHtml;
}

// Update Recent Transactions Table
function updateRecentTransactionsTable(transactionsData) {
  const tableBody = document.getElementById('recent-transactions-table');
  if (!tableBody) return;
  
  // Generate table rows
  let tableHtml = '';
  
  if (transactionsData.length === 0) {
    tableHtml = `
      <tr>
        <td colspan="6" class="text-center py-3">No transaction data available</td>
      </tr>
    `;
  } else {
    transactionsData.forEach(transaction => {
      // Add badge for transaction type
      const typeBadge = transaction.transaction_type === 'pos' 
        ? '<span class="badge bg-warning">POS</span>' 
        : '<span class="badge bg-success">Order</span>';
      
      tableHtml += `
        <tr>
          <td>${transaction.transaction_id} ${typeBadge}</td>
          <td>${transaction.transaction_date}</td>
          <td>${transaction.customer_name}</td>
          <td class="text-center">${transaction.item_count}</td>
          <td>${transaction.payment_method || 'N/A'}</td>
          <td class="text-end">${transaction.total_amount_formatted}</td>
        </tr>
      `;
    });
  }
  
  tableBody.innerHTML = tableHtml;
}

