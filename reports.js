// Declare global chart instances
let mainChartInstance = null;
let secondaryChartInstance = null;

// Initialize charts and data when the document is ready
document.addEventListener('DOMContentLoaded', async function () {
  try {
    initializeDateRangePicker();
    initializeReportTypeSelector();
    initializeChannelSelector();
    initializeTimePeriodSelector();
    await initializeCategorySelector();
    await generateReports();

    document.getElementById('applyFilters').addEventListener('click', generateReports);
    document.getElementById('exportReport').addEventListener('click', exportReport);
    document.getElementById('printReport').addEventListener('click', printReport);
    document.getElementById('sidebarToggle').addEventListener('click', function () {
      document.getElementById('sidebar').classList.toggle('show');
    });
  } catch (error) {
    console.error('Error initializing reports:', error);
    showErrorMessage('Failed to initialize reports. Please try again later.');
  }
});

// Initialize date range picker
function initializeDateRangePicker() {
  $('input[name="daterange"]').daterangepicker({
    opens: 'left',
    startDate: moment(),
    endDate: moment(),
    ranges: {
      'Today': [moment(), moment()],
      'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
      'Last 7 Days': [moment().subtract(6, 'days'), moment()],
      'Last 30 Days': [moment().subtract(29, 'days'), moment()],
      'This Month': [moment().startOf('month'), moment().endOf('month')],
      'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')],
      'This Quarter': [moment().startOf('quarter'), moment().endOf('quarter')],
      'Last Quarter': [moment().subtract(1, 'quarter').startOf('quarter'), moment().subtract(1, 'quarter').endOf('quarter')],
      'This Year': [moment().startOf('year'), moment().endOf('year')],
      'Last Year': [moment().subtract(1, 'year').startOf('year'), moment().subtract(1, 'year').endOf('year')]
    }
  })
  .on('apply.daterangepicker', function(ev, picker) {
    const tp = document.getElementById('timePeriod');
    tp.value = 'custom';        // reset back to “Custom”
    tp.disabled = true;         // gray it out
    tp.classList.add('text-muted'); // optional: give it a muted look via Bootstrap
  });
}

function initializeReportTypeSelector() {
  const reportTypeSelector = document.getElementById('reportType');
  reportTypeSelector.addEventListener('change', function () {
    const selectedReport = reportTypeSelector.value;
    const categoryContainer = document.getElementById('categoryFilterContainer');
    const categorySelect    = document.getElementById('categoryFilter');

    if (selectedReport === 'salesByCategory') {
      // reset to default…
      categorySelect.value = 'all';
      // …then hide & disable it
      categoryContainer.style.display = 'none';
      categorySelect.disabled = true;
    } else {
      // show & re-enable for other report types
      categoryContainer.style.display = 'block';
      categorySelect.disabled = false;
    }
  });
}


// Initialize channel selector
function initializeChannelSelector() {
  const channelSelector = document.getElementById('channelFilter');
  channelSelector.innerHTML = '';

  ['all', 'POS', 'Retailer'].forEach(channel => {
    const option = document.createElement('option');
    option.value = channel;
    option.textContent = channel === 'all' ? 'All Channels' : channel;
    channelSelector.appendChild(option);
  });

  channelSelector.value = 'all';
}

// Initialize category selector
async function initializeCategorySelector() {
  try {
    const response = await fetch('fetch_categories.php');
    const data = await response.json();

    if (data.status === 'error') throw new Error(data.message);

    const categories = data.categories || [];
    const categorySelector = document.getElementById('categoryFilter');
    categorySelector.innerHTML = '';

    const allOption = document.createElement('option');
    allOption.value = 'all';
    allOption.textContent = 'All Categories';
    categorySelector.appendChild(allOption);

    categories.forEach(category => {
      const option = document.createElement('option');
      option.value = category;
      option.textContent = category;
      categorySelector.appendChild(option);
    });
  } catch (error) {
    console.error('Error initializing category selector:', error);
    showErrorMessage('Failed to load product categories. Using default categories.');

    const defaultCategories = ['Fresh Fruit', 'Dried Fruit', 'Juices', 'Uncategorized'];
    const categorySelector = document.getElementById('categoryFilter');
    categorySelector.innerHTML = '';

    const allOption = document.createElement('option');
    allOption.value = 'all';
    allOption.textContent = 'All Categories';
    categorySelector.appendChild(allOption);

    defaultCategories.forEach(category => {
      const option = document.createElement('option');
      option.value = category;
      option.textContent = category;
      categorySelector.appendChild(option);
    });
  }
}

// Initialize time period selector
function initializeTimePeriodSelector() {
  const timePeriodSelector = document.getElementById('timePeriod');
  timePeriodSelector.addEventListener('change', function () {
    timePeriodSelector.disabled = false;

    const selectedPeriod = timePeriodSelector.value;
    const dateRangePicker = $('input[name="daterange"]').data('daterangepicker');

    switch (selectedPeriod) {
      case 'weekly':
        dateRangePicker.setStartDate(moment().subtract(1, 'week').startOf('week'));
        dateRangePicker.setEndDate(moment().subtract(1, 'week').endOf('week'));
        break;
      case 'monthly':
        dateRangePicker.setStartDate(moment().subtract(1, 'month').startOf('month'));
        dateRangePicker.setEndDate(moment().subtract(1, 'month').endOf('month'));
        break;
      case 'quarterly':
        dateRangePicker.setStartDate(moment().subtract(1, 'quarter').startOf('quarter'));
        dateRangePicker.setEndDate(moment().subtract(1, 'quarter').endOf('quarter'));
        break;
      case 'yearly':
        dateRangePicker.setStartDate(moment().subtract(1, 'year').startOf('year'));
        dateRangePicker.setEndDate(moment().subtract(1, 'year').endOf('year'));
        break;
      default:
        break;
    }
  });
}

// Fetch data
async function fetchData() {
  try {
    const dateRange = $('input[name="daterange"]').data('daterangepicker');
    const params = new URLSearchParams({
      startDate: dateRange.startDate.format('YYYY-MM-DD'),
      endDate: dateRange.endDate.format('YYYY-MM-DD'),
      channel: document.getElementById('channelFilter').value,
      reportType: document.getElementById('reportType').value,
      category: document.getElementById('categoryFilter').value
    });

    const response = await fetch(`fetch_reports_data.php?${params.toString()}`);
    const data = await response.json();

    if (data.status === 'error') throw new Error(data.message);
    return data.data || [];
  } catch (error) {
    console.error('Error fetching data:', error);
    showErrorMessage('Failed to fetch data from database. Please try again later.');
    return [];
  }
}

// Fetch metrics
async function fetchSummaryMetrics() {
  try {
    const dateRange = $('input[name="daterange"]').data('daterangepicker');
    const params = new URLSearchParams({
      startDate: dateRange.startDate.format('YYYY-MM-DD'),
      endDate: dateRange.endDate.format('YYYY-MM-DD'),
      channel: document.getElementById('channelFilter').value,
      category: document.getElementById('categoryFilter').value
    });

    const response = await fetch(`fetch_summary_metrics.php?${params.toString()}`);
    const data = await response.json();

    if (data.status === 'error') throw new Error(data.message);
    return data.metrics || {
      totalSales: 0,
      totalProfit: 0,
      profitMargin: 0,
      averageOrder: 0,
      totalOrders: 0
    };
  } catch (error) {
    console.error('Error fetching summary metrics:', error);
    return {
      totalSales: 0,
      totalProfit: 0,
      profitMargin: 0,
      averageOrder: 0,
      totalOrders: 0
    };
  }
}

// Generate reports
async function generateReports() {
  try {
    showLoadingIndicator();
    const data = await fetchData();
    const metrics = await fetchSummaryMetrics();
    const reportType = document.getElementById('reportType').value;

    clearCharts();

    switch (reportType) {
      case 'salesTrends':
        await generateSalesTrendsReport();
        break;
      case 'profitAnalysis':
        await generateProfitAnalysisReport();
        break;
      case 'salesByCategory':
        await generateSalesByCategoryReport();
        break;
      case 'profitabilityAnalysis':
        await generateProfitabilityAnalysisReport(data);
        break;
      default:
        await generateSalesTrendsReport();
    }

    updateSummaryMetrics(metrics);
    populateDataTable(data);
    hideLoadingIndicator();
  } catch (error) {
    console.error('Error generating reports:', error);
    hideLoadingIndicator();
    showErrorMessage('Failed to generate reports. Please try again later.');
  }
}

// Show/hide loading
function showLoadingIndicator() {
  const el = document.getElementById('loadingIndicator');
  if (el) el.style.display = 'flex';
}

function hideLoadingIndicator() {
  const el = document.getElementById('loadingIndicator');
  if (el) el.style.display = 'none';
}

// Error message
function showErrorMessage(message) {
  const container = document.getElementById('errorContainer');
  if (container) {
    container.textContent = message;
    container.style.display = 'block';
    setTimeout(() => container.style.display = 'none', 5000);
  }
}

// Clear previous charts
function clearCharts() {
  if (mainChartInstance) {
    mainChartInstance.destroy();
    mainChartInstance = null;
  }
  if (secondaryChartInstance) {
    secondaryChartInstance.destroy();
    secondaryChartInstance = null;
  }
}

// Generate Sales Trends Report
async function generateSalesTrendsReport() {
  try {
    const dateRange = $('input[name="daterange"]').data('daterangepicker');
    const params = new URLSearchParams({
      startDate: dateRange.startDate.format('YYYY-MM-DD'),
      endDate: dateRange.endDate.format('YYYY-MM-DD'),
      channel: document.getElementById('channelFilter').value,
      category: document.getElementById('categoryFilter').value,
      reportType: document.getElementById('reportType').value
    });
    

    const resp = await fetch(`fetch_sales_trends.php?${params.toString()}`);
    const raw = await resp.text();
console.log('🎯 RAW RESPONSE from', raw);
const result = JSON.parse(raw);
    if (result.status === 'error') throw new Error(result.message);

    const data = result.data;

    const ctx = document.getElementById('mainChart').getContext('2d');
    mainChartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels: data.labels,
        datasets: [
          {
            label: 'POS Sales',
            data: data.pos,
            borderColor: 'rgba(75, 192, 192, 1)',
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            tension: 0.1
          },
          {
            label: 'Retailer Sales',
            data: data.retailer,
            borderColor: 'rgba(153, 102, 255, 1)',
            backgroundColor: 'rgba(153, 102, 255, 0.2)',
            tension: 0.1
          },
          {
            label: 'Total Sales',
            data: data.total,
            borderColor: 'rgba(255, 99, 132, 1)',
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            tension: 0.1
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          title: { display: true, text: 'Sales Trends by Channel' },
          tooltip: {
            callbacks: {
              label: ctx => ctx.dataset.label + ': ₱' + ctx.raw.toLocaleString()
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: value => '₱' + value.toLocaleString()
            }
          }
        }
      }
    });

    const totalPOS = data.pos.reduce((sum, value) => sum + value, 0);
    const totalRetailer = data.retailer.reduce((sum, value) => sum + value, 0);

    const secondaryCtx = document.getElementById('secondaryChart').getContext('2d');
    secondaryChartInstance = new Chart(secondaryCtx, {
      type: 'pie',
      data: {
        labels: ['POS', 'Retailer'],
        datasets: [{
          data: [totalPOS, totalRetailer],
          backgroundColor: ['rgba(75, 192, 192, 0.6)', 'rgba(153, 102, 255, 0.6)']
        }]
      },
      options: {
        responsive: true,
        plugins: {
          title: { display: true, text: 'Sales Distribution by Channel' },
          tooltip: {
            callbacks: {
              label: ctx => {
                const label = ctx.label || '';
                const value = ctx.raw;
                const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
                const percentage = Math.round((value / total) * 100);
                return `${label}: ₱${value.toLocaleString()} (${percentage}%)`;
              }
            }
          }
        }
      }
    });

    document.getElementById('reportTitle').textContent = 'Sales Trends Report';
  } catch (error) {
    console.error('Error generating sales trends report:', error);
    showErrorMessage('Failed to generate sales trends report. Please try again later.');
  }
}

// Generate Profit Analysis Report
async function generateProfitAnalysisReport() {
  try {
    const dateRange = $('input[name="daterange"]').data('daterangepicker');
    const startDate = dateRange.startDate.format('YYYY-MM-DD');
    const endDate = dateRange.endDate.format('YYYY-MM-DD');
    const channelFilter = document.getElementById('channelFilter').value;
    
    // Build query parameters
    const params = new URLSearchParams({
      startDate: startDate,
      endDate: endDate,
      channel: channelFilter
    });
    
    // Fetch profit analysis data from PHP backend
    const response = await fetch(`fetch_profit_analysis.php?${params.toString()}`);
    const result = await response.json();
    
    if (result.status === 'error') {
      throw new Error(result.message);
    }
    
    const data = result.data;
    
    // Create chart
    const ctx = document.getElementById('mainChart').getContext('2d');
    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: data.labels,
        datasets: [
          {
            label: 'Sales',
            data: data.sales,
            backgroundColor: 'rgba(75, 192, 192, 0.6)',
            order: 2
          },
          {
            label: 'Cost',
            data: data.costs,
            backgroundColor: 'rgba(255, 99, 132, 0.6)',
            order: 3
          },
          {
            label: 'Profit',
            data: data.profits,
            type: 'line',
            borderColor: 'rgba(153, 102, 255, 1)',
            backgroundColor: 'rgba(153, 102, 255, 0.2)',
            order: 1
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: 'Profit Analysis Over Time'
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                return context.dataset.label + ': ₱' + context.raw.toLocaleString();
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: function(value) {
                return '₱' + value.toLocaleString();
              }
            }
          }
        }
      }
    });
    
    // Create secondary chart - Profit Margin by Channel
    const channels = Object.keys(data.byChannel);
    const margins = channels.map(channel => data.byChannel[channel].margin);
    
    const secondaryCtx = document.getElementById('secondaryChart').getContext('2d');
    new Chart(secondaryCtx, {
      type: 'bar',
      data: {
        labels: channels,
        datasets: [{
          label: 'Profit Margin (%)',
          data: margins,
          backgroundColor: [
            'rgba(75, 192, 192, 0.6)',
            'rgba(153, 102, 255, 0.6)'
          ]
        }]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: 'Profit Margin by Channel'
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: function(value) {
                return value.toFixed(1) + '%';
              }
            }
          }
        }
      }
    });
    
    // Update report title
    document.getElementById('reportTitle').textContent = 'Profit Analysis Report';
  } catch (error) {
    console.error('Error generating profit analysis report:', error);
    showErrorMessage('Failed to generate profit analysis report. Please try again later.');
  }
}

// Generate Sales by Category Report
async function generateSalesByCategoryReport() {
  try {
    // ─── 1) Read filters ───────────────────────────────────────────────────────
    const dateRange      = $('input[name="daterange"]').data('daterangepicker');
    const startDate      = dateRange.startDate.format('YYYY-MM-DD');
    const endDate        = dateRange.endDate.format('YYYY-MM-DD');
    const channelFilter  = document.getElementById('channelFilter').value;
    const categoryFilter = document.getElementById('categoryFilter').value;

    // ─── 2) Fetch data ─────────────────────────────────────────────────────────
    const params = new URLSearchParams({
      startDate,
      endDate,
      channel:  channelFilter,
      category: categoryFilter
    });
    const resp   = await fetch(`fetch_sales_by_category.php?${params}`);
    const raw    = await resp.text();
    console.log('🎯 RAW RESPONSE:', raw);
    const result = JSON.parse(raw);
    if (result.status === 'error') throw new Error(result.message);
    const data = result.data;

    // ─── 3) Normalize strings → numbers ────────────────────────────────────────
    // Use toString() so replace() always works
    const cleanNum = v => parseInt(v.toString().replace(/,/g,''), 10) || 0;

    const salesNums    = data.sales.map(cleanNum);
    const posNums      = data.byChannel.POS.map(cleanNum);
    const retailerNums = data.byChannel.Retailer.map(cleanNum);

    // ─── 4) Destroy old charts (avoid “canvas in use” errors) ─────────────────
    if (mainChartInstance) {
      mainChartInstance.destroy();
      mainChartInstance = null;
    }
    if (secondaryChartInstance) {
      secondaryChartInstance.destroy();
      secondaryChartInstance = null;
    }

    // ─── 5) Main “Sales by Category” bar ───────────────────────────────────────
    const mainCtx = document.getElementById('mainChart').getContext('2d');
    mainChartInstance = new Chart(mainCtx, {
      type: 'bar',
      data: {
        labels: data.categories,
        datasets: [{
          label: 'Sales by Category',
          data: salesNums,
          backgroundColor: [
            'rgba(75, 192, 192, 0.6)',
            'rgba(153, 102, 255, 0.6)',
            'rgba(255, 99, 132, 0.6)',
            'rgba(255, 159, 64, 0.6)',
            'rgba(54, 162, 235, 0.6)'
          ]
        }]
      },
      options: {
        responsive: true,
        plugins: {
          title:      { display: true, text: 'Sales by Product Category' },
          tooltip:    { callbacks: { label: ctx => `${ctx.dataset.label}: ₱${ctx.raw.toLocaleString()}` } }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks:       { callback: v => `₱${v.toLocaleString()}` }
          }
        }
      }
    });

    // ─── 6) Secondary “Category Sales by Channel” stacked bar ──────────────────
  const secondaryCtx = document
  .getElementById('secondaryChart')
  .getContext('2d');

// pre-compute the grand total once
const grandTotal = data.sales.reduce((sum, v) => sum + v, 0);

secondaryChartInstance = new Chart(secondaryCtx, {
  type: 'doughnut',
  data: {
    labels: data.categories,   // still show Beverages, Detergent, etc.
    datasets: [{
      data: data.sales,
      backgroundColor: [
        'rgba(75, 192, 192, 0.6)',
        'rgba(153, 102, 255, 0.6)',
        'rgba(255, 159, 64, 0.6)',
        'rgba(255, 99, 132, 0.6)'
      ]
    }]
  },
  options: {
    responsive: true,
    cutout: '50%',
    plugins: {
      legend: { display: true },
      title: {
        display: true,
        text: 'Sales Composition by Category & Channel'
      },
      tooltip: {
        callbacks: {
          title: ctx => ctx[0].label,  // category name
          label: ctx => {
            const i   = ctx.dataIndex;
            const pos = data.byChannel.POS[i];
            const ret = data.byChannel.Retailer[i];
            const tot = data.sales[i];
            // helper to compute % of grandTotal
            const pct = x => grandTotal
              ? ((x / grandTotal) * 100).toFixed(1) + '%'
              : '0%';

            return [
              `POS:      ${pct(pos)}`,
              `Retailer: ${pct(ret)}`,
              `Total:    ${pct(tot)}`
            ];
          }
        }
      }
    }
  }
});


    // ─── 7) Update report title ─────────────────────────────────────────────────
    document.getElementById('reportTitle').textContent = 'Sales by Category Report';

  } catch (error) {
    console.error('Error generating sales by category report:', error);
    showErrorMessage('Failed to generate sales by category report. Please try again later.');
  }
}


// Generate Profitability Analysis Report
function generateProfitabilityAnalysisReport(data) {
  try {
    // Group data by category for profitability analysis
    const profitabilityByCategory = data.reduce((acc, item) => {
      const category = item.category;
      if (!acc[category]) {
        acc[category] = { sales: 0, cost: 0 };
      }
      acc[category].sales += item.amount;
      acc[category].cost += item.cost;
      return acc;
    }, {});
    
    // Calculate profit and margin for each category
    const categories = Object.keys(profitabilityByCategory);
    const profits = categories.map(category => profitabilityByCategory[category].sales - profitabilityByCategory[category].cost);
    const margins = categories.map(category => {
      const data = profitabilityByCategory[category];
      return ((data.sales - data.cost) / data.sales) * 100;
    });
    
    // Create chart
    const ctx = document.getElementById('mainChart').getContext('2d');
    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: categories,
        datasets: [
          {
            label: 'Profit (₱)',
            data: profits,
            backgroundColor: 'rgba(75, 192, 192, 0.6)',
            yAxisID: 'y'
          },
          {
            label: 'Profit Margin (%)',
            data: margins,
            backgroundColor: 'rgba(153, 102, 255, 0.6)',
            type: 'line',
            yAxisID: 'y1'
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: 'Profitability Analysis by Category'
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                if (context.dataset.label === 'Profit (₱)') {
                  return context.dataset.label + ': ₱' + context.raw.toLocaleString();
                } else {
                  return context.dataset.label + ': ' + context.raw.toFixed(1) + '%';
                }
              }
            }
          }
        },
        scales: {
          y: {
            type: 'linear',
            display: true,
            position: 'left',
            beginAtZero: true,
            title: {
              display: true,
              text: 'Profit (₱)'
            },
            ticks: {
              callback: function(value) {
                return '₱' + value.toLocaleString();
              }
            }
          },
          y1: {
            type: 'linear',
            display: true,
            position: 'right',
            beginAtZero: true,
            title: {
              display: true,
              text: 'Profit Margin (%)'
            },
            ticks: {
              callback: function(value) {
                return value.toFixed(1) + '%';
              }
            },
            grid: {
              drawOnChartArea: false
            }
          }
        }
      }
    });
    
    // Group data by date for profitability trend
    const profitabilityByDate = data.reduce((acc, item) => {
      const date = item.date;
      if (!acc[date]) {
        acc[date] = { sales: 0, cost: 0 };
      }
      acc[date].sales += item.amount;
      acc[date].cost += item.cost;
      return acc;
    }, {});
    
    const dates = Object.keys(profitabilityByDate).sort();
    const profitsByDate = dates.map(date => profitabilityByDate[date].sales - profitabilityByDate[date].cost);
    const marginsByDate = dates.map(date => {
      const data = profitabilityByDate[date];
      return ((data.sales - data.cost) / data.sales) * 100;
    });
    
    const secondaryCtx = document.getElementById('secondaryChart').getContext('2d');
    new Chart(secondaryCtx, {
      type: 'line',
      data: {
        labels: dates.map(date => formatDate(date)),
        datasets: [
          {
            label: 'Profit',
            data: profitsByDate,
            borderColor: 'rgba(75, 192, 192, 1)',
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            yAxisID: 'y'
          },
          {
            label: 'Profit Margin (%)',
            data: marginsByDate,
            borderColor: 'rgba(153, 102, 255, 1)',
            backgroundColor: 'rgba(153, 102, 255, 0.2)',
            yAxisID: 'y1'
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: 'Profitability Trend Over Time'
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                if (context.dataset.label === 'Profit') {
                  return context.dataset.label + ': ₱' + context.raw.toLocaleString();
                } else {
                  return context.dataset.label + ': ' + context.raw.toFixed(1) + '%';
                }
              }
            }
          }
        },
        scales: {
          y: {
            type: 'linear',
            display: true,
            position: 'left',
            beginAtZero: true,
            title: {
              display: true,
              text: 'Profit (₱)'
            },
            ticks: {
              callback: function(value) {
                return '₱' + value.toLocaleString();
              }
            }
          },
          y1: {
            type: 'linear',
            display: true,
            position: 'right',
            beginAtZero: true,
            title: {
              display: true,
              text: 'Profit Margin (%)'
            },
            ticks: {
              callback: function(value) {
                return value.toFixed(1) + '%';
              }
            },
            grid: {
              drawOnChartArea: false
            }
          }
        }
      }
    });
    
    // Update report title
    document.getElementById('reportTitle').textContent = 'Profitability Analysis Report';
  } catch (error) {
    console.error('Error generating profitability analysis report:', error);
    showErrorMessage('Failed to generate profitability analysis report. Please try again later.');
  }
}

// Update summary metrics
function updateSummaryMetrics(metrics) {
  // Update total sales
  document.getElementById('totalSales').textContent = '₱' + metrics.totalSales.toLocaleString();
  
  // Update total profit
  document.getElementById('totalProfit').textContent = '₱' + metrics.totalProfit.toLocaleString();
  
  // Update profit margin
  document.getElementById('profitMargin').textContent = metrics.profitMargin.toFixed(2) + '%';
  
  // Update trend indicators (simulated for now)
  document.getElementById('salesTrend').textContent = '+12.5%';
  document.getElementById('profitTrend').textContent = '+8.3%';
  document.getElementById('marginTrend').textContent = '+2.1%';
  
  // Update total records count
  const totalRecordsElement = document.getElementById('totalRecords');
  if (totalRecordsElement) {
    totalRecordsElement.textContent = allTableData.length;
  }
}

// Global variables for pagination
let currentPage = 1;
let itemsPerPage = 7;
let allTableData = [];

// Populate data table with pagination
function populateDataTable(data) {
  const tableBody = document.getElementById('tableBody');
  tableBody.innerHTML = '';
  
  // Sort data by date (newest first)
  const sortedData = [...data].sort((a, b) => new Date(b.date) - new Date(a.date));
  
  // Store all data globally for pagination
  allTableData = sortedData;
  currentPage = 1;
  
  // Calculate pagination
  const totalPages = Math.ceil(allTableData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = allTableData.slice(startIndex, endIndex);
  
  // Populate current page data
  currentData.forEach(item => {
    const profit = item.amount - item.cost;
    const margin = item.amount > 0 ? (profit / item.amount) * 100 : 0;
    
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${formatDate(item.date)}</td>
      <td>${item.channel}</td>
      <td>${item.category}</td>
      <td>₱${item.amount.toLocaleString()}</td>
    `;
    
    tableBody.appendChild(row);
  });
  
  // Show message if no data
  if (allTableData.length === 0) {
    const messageRow = document.createElement('tr');
    messageRow.innerHTML = `
      <td colspan="4" class="text-center">
        <em>No data available for the selected filters.</em>
      </td>
    `;
    tableBody.appendChild(messageRow);
  }
  
  // Update pagination controls
  updatePaginationControls(totalPages);
}

// Update pagination controls
function updatePaginationControls(totalPages) {
  let paginationContainer = document.getElementById('paginationContainer');
  
  // Remove existing pagination if it exists
  if (paginationContainer) {
    paginationContainer.remove();
  }
  
  // Create new pagination container
  paginationContainer = document.createElement('div');
  paginationContainer.id = 'paginationContainer';
  paginationContainer.className = 'd-flex justify-content-between align-items-center mt-3';
  
  // Show current page info
  const pageInfo = document.createElement('div');
  pageInfo.className = 'text-muted small';
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, allTableData.length);
  pageInfo.textContent = `Showing ${startItem}-${endItem} of ${allTableData.length} records`;
  
  // Create pagination buttons
  const paginationButtons = document.createElement('div');
  paginationButtons.className = 'btn-group';
  
  // Previous button
  const prevButton = document.createElement('button');
  prevButton.className = 'btn btn-outline-secondary btn-sm';
  prevButton.innerHTML = '<i class="bi bi-chevron-left"></i>';
  prevButton.disabled = currentPage === 1;
  prevButton.onclick = () => changePage(currentPage - 1);
  
  // Next button
  const nextButton = document.createElement('button');
  nextButton.className = 'btn btn-outline-secondary btn-sm';
  nextButton.innerHTML = '<i class="bi bi-chevron-right"></i>';
  nextButton.disabled = currentPage === totalPages;
  nextButton.onclick = () => changePage(currentPage + 1);
  
  // Page number display
  const pageDisplay = document.createElement('span');
  pageDisplay.className = 'btn btn-outline-secondary btn-sm disabled';
  pageDisplay.textContent = `Page ${currentPage} of ${totalPages}`;
  
  // Add buttons to pagination
  paginationButtons.appendChild(prevButton);
  paginationButtons.appendChild(pageDisplay);
  paginationButtons.appendChild(nextButton);
  
  // Add elements to container
  paginationContainer.appendChild(pageInfo);
  paginationContainer.appendChild(paginationButtons);
  
  // Insert pagination after the table
  const dataTable = document.getElementById('dataTable');
  if (dataTable) {
    const dataTableCard = dataTable.closest('.card');
    if (dataTableCard) {
      dataTableCard.appendChild(paginationContainer);
    }
  }
}

// Change page function
function changePage(newPage) {
  if (newPage < 1 || newPage > Math.ceil(allTableData.length / itemsPerPage)) {
    return;
  }
  
  currentPage = newPage;
  const tableBody = document.getElementById('tableBody');
  tableBody.innerHTML = '';
  
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = allTableData.slice(startIndex, endIndex);
  
  // Populate current page data
  currentData.forEach(item => {
    const profit = item.amount - item.cost;
    const margin = item.amount > 0 ? (profit / item.amount) * 100 : 0;
    
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${formatDate(item.date)}</td>
      <td>${item.channel}</td>
      <td>${item.category}</td>
      <td>₱${item.amount.toLocaleString()}</td>
    `;
    
    tableBody.appendChild(row);
  });
  
  // Update pagination controls
  updatePaginationControls(Math.ceil(allTableData.length / itemsPerPage));
}

// Helper function to format date
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// Export report as CSV
function exportReport() {
  const reportType = document.getElementById('reportType').value;
  const dateRange = $('input[name="daterange"]').data('daterangepicker');
  const startDate = dateRange.startDate.format('YYYY-MM-DD');
  const endDate = dateRange.endDate.format('YYYY-MM-DD');
  
  let csvContent = 'data:text/csv;charset=utf-8,';
  
  // Add headers based on report type
  switch (reportType) {
    case 'salesTrends':
      csvContent += 'Date,Channel,Category,Amount\n';
      break;
    case 'profitAnalysis':
    case 'salesByCategory':
    case 'profitabilityAnalysis':
      csvContent += 'Date,Channel,Category,Sales,Cost,Profit,Margin\n';
      break;
  }
  
  // Add all data rows (not just current page)
  allTableData.forEach(item => {
    const profit = item.amount - item.cost;
    const margin = item.amount > 0 ? (profit / item.amount) * 100 : 0;
    
    const rowData = [
      formatDate(item.date),
      item.channel,
      item.category,
      item.amount.toString()
    ].map(field => `"${field}"`).join(',');
    
    csvContent += rowData + '\n';
  });
  
  // Create download link
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `${reportType}_report_${startDate}_to_${endDate}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Add this function to your reports.js file

function printReport() {
  // Get the report content
  const reportTitle = document.getElementById('reportTitle').textContent;
  const dateRange = $('input[name="daterange"]').val();
  const reportType = document.getElementById('reportType').value;
  const reportTypeText = document.getElementById('reportType').options[document.getElementById('reportType').selectedIndex].text;
  
  // Get metrics
  const totalSales = document.getElementById('totalSales').textContent;
  const totalProfit = document.getElementById('totalProfit').textContent;
  const profitMargin = document.getElementById('profitMargin').textContent;
  
  // Get table data from all data (not just current page)
  let tableContent = '';
  
  // Process all data rows (limit to 100 rows for printing)
  const maxRows = Math.min(allTableData.length, 100);
  for (let i = 0; i < maxRows; i++) {
    const item = allTableData[i];
    const rowHTML = `
      <tr>
        <td>${formatDate(item.date)}</td>
        <td>${item.channel}</td>
        <td>${item.category}</td>
        <td>₱${item.amount.toLocaleString()}</td>
      </tr>
    `;
    tableContent += rowHTML;
  }
  
  // Create print window
  const printWindow = window.open('', '_blank');
  
  printWindow.document.write(`
    <html>
      <head>
        <title>${reportTitle} - Piñana Gourmet</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 20px;
            max-width: 1000px;
            margin: 0 auto;
          }
          .report-header {
            text-align: center;
            margin-bottom: 20px;
          }
          .logo {
            max-width: 150px;
            margin-bottom: 10px;
          }
          .report-title {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 5px;
          }
          .report-subtitle {
            font-size: 14px;
            color: #666;
            margin-bottom: 20px;
          }
          .metrics-container {
            display: flex;
            justify-content: space-between;
            margin-bottom: 30px;
            flex-wrap: wrap;
          }
          .metric-card {
            border: 1px solid #ddd;
            border-radius: 5px;
            padding: 15px;
            width: 22%;
            box-sizing: border-box;
            margin-bottom: 10px;
          }
          .metric-title {
            font-size: 12px;
            color: #666;
            margin-bottom: 5px;
          }
          .metric-value {
            font-size: 18px;
            font-weight: bold;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
          }
          th, td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
          }
          th {
            background-color: #f2f2f2;
            font-weight: bold;
          }
          tr:nth-child(even) {
            background-color: #f9f9f9;
          }
          .footer {
            margin-top: 30px;
            text-align: center;
            font-size: 12px;
            color: #666;
          }
          @media print {
            body {
              width: 100%;
              padding: 0;
              margin: 0;
            }
            .no-print {
              display: none;
            }
          }
        </style>
      </head>
      <body>
        <div class="report-header">
          <img src="images/final-light.png" alt="Piñana Gourmet Logo" class="logo">
          <div class="report-title">${reportTitle}</div>
          <div class="report-subtitle">
            Report Type: ${reportTypeText} | Date Range: ${dateRange}
          </div>
        </div>
        
        <div class="metrics-container">
          <div class="metric-card">
            <div class="metric-title">Total Sales</div>
            <div class="metric-value">${totalSales}</div>
          </div>
          <div class="metric-card">
            <div class="metric-title">Total Profit</div>
            <div class="metric-value">${totalProfit}</div>
          </div>
          <div class="metric-card">
            <div class="metric-title">Profit Margin</div>
            <div class="metric-value">${profitMargin}</div>
          </div>
        </div>
        
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Channel</th>
              <th>Category</th>
              <th>Sales</th>
             
            </tr>
          </thead>
          <tbody>
            ${tableContent}
          </tbody>
        </table>
        
        <div class="footer">
          <p>Report generated on ${new Date().toLocaleString()}</p>
          <p>Piñana Gourmet © ${new Date().getFullYear()}</p>
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
  `);
  
  printWindow.document.close();
}