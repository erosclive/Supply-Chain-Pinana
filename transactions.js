// DOM Elements
const transactionsTableBody = document.getElementById("transactions-table-body");
const showingStart = document.getElementById("showing-start");
const showingEnd = document.getElementById("showing-end");
const totalTransactions = document.getElementById("total-transactions");
const searchInput = document.getElementById("search-transactions");
const paginationContainer = document.querySelector(".pagination");

// Modal Elements
const transactionModal = new bootstrap.Modal(document.getElementById("transactionModal"));
const modalTransactionId = document.getElementById("modal-transaction-id");
const modalTransactionDate = document.getElementById("modal-transaction-date");
const modalCustomerName = document.getElementById("modal-customer-name");
const modalCashierName = document.getElementById("modal-cashier-name");
const modalPaymentMethod = document.getElementById("modal-payment-method");
const modalSubtotal = document.getElementById("modal-subtotal");
const modalTax = document.getElementById("modal-tax");
const modalDiscount = document.getElementById("modal-discount");
const modalTotal = document.getElementById("modal-total");
const modalItemsList = document.getElementById("modal-items-list");
const printReceiptBtn = document.getElementById("printReceiptBtn");

// State variables
let transactions = [];
let currentPage = 1;
const itemsPerPage = 5;
let searchTerm = "";

// Retailer orders state variables
let retailerOrders = [];
let retailerCurrentPage = 1;
const retailerOrdersPerPage = 10;
let retailerSearchTerm = "";

// Initialize the orderDetailsModal
const orderDetailsModal = new bootstrap.Modal(document.getElementById("orderDetailsModal"));

// Initialize
document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM loaded, initializing transactions page");
  
  // Fetch transactions
  fetchTransactions();

  // Set up event listeners
  setupEventListeners();

  // Fetch and display retailer orders with paid payment status
  fetchRetailerOrders();

  // Add event listeners for retailer orders tab
  document.getElementById('refreshRetailerOrdersBtn')?.addEventListener('click', fetchRetailerOrders);
  document.getElementById('searchRetailerOrdersBtn')?.addEventListener('click', searchRetailerOrders);
  document.getElementById('search-retailer-orders')?.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      searchRetailerOrders();
    }
  });

  // Add event listener for print order details button
  document.getElementById('printOrderDetailsBtn')?.addEventListener('click', printOrderDetails);
});

// Global function to change page - can be called directly from HTML if needed
function changePage(page) {
  console.log("Changing to page:", page);
  currentPage = page;
  renderTransactions();
  document.querySelector(".transaction-table").scrollIntoView({ behavior: "smooth" });
}

// Function to change retailer page
function changeRetailerPage(page) {
  retailerCurrentPage = page;
  renderRetailerOrders();
  document.querySelector(".retailer-orders-table").scrollIntoView({ behavior: "smooth" });
}

// Fetch transactions from server
function fetchTransactions() {
  console.log("Fetching transactions...");
  // Show loading state
  transactionsTableBody.innerHTML = `
    <tr>
      <td colspan="7" class="text-center py-4">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading transactions...</span>
        </div>
        <p class="mt-2">Loading transactions...</p>
      </td>
    </tr>
  `;

  // Fetch data from server
  fetch("fetch_transactions.php")
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then((data) => {
      if (data.success) {
        transactions = data.transactions;
        renderTransactions();
      } else {
        throw new Error(data.message || "Failed to fetch transactions");
      }
    })
    .catch((error) => {
      console.error("Error fetching transactions:", error);
      transactionsTableBody.innerHTML = `
        <tr>
          <td colspan="7" class="text-center py-4 text-danger">
            <i class="bi bi-exclamation-triangle-fill fs-1 mb-3"></i>
            <p>Error loading transactions. Please try again.</p>
            <button class="btn btn-outline-primary mt-3" onclick="fetchTransactions()">
              <i class="bi bi-arrow-clockwise me-2"></i>Retry
            </button>
          </td>
        </tr>
      `;
    });

  // For demo purposes, if fetch_transactions.php doesn't exist yet, use sample data
  // Remove this in production
  setTimeout(() => {
    if (transactions.length === 0) {
      console.log("Using sample transactions data");
      transactions = getSampleTransactions();
      renderTransactions();
    }
  }, 1000);
}

// Function to fetch retailer orders
function fetchRetailerOrders() {
  const retailerOrdersTableBody = document.getElementById("retailer-orders-table-body");
  
  if (!retailerOrdersTableBody) {
    console.error("Retailer orders table body not found");
    return;
  }
  
  // Show loading state
  retailerOrdersTableBody.innerHTML = `
    <tr>
      <td colspan="8" class="text-center py-4">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading orders...</span>
        </div>
        <p class="mt-2">Loading paid orders...</p>
      </td>
    </tr>
  `;

  // Fetch data from server - UPDATED FILENAME HERE
  fetch("fetch_paid_payments.php")
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then((data) => {
      if (data.success) {
        retailerOrders = data.orders || [];
        renderRetailerOrders();
      } else {
        throw new Error(data.message || "Failed to fetch retailer orders");
      }
    })
    .catch((error) => {
      console.error("Error fetching retailer orders:", error);
      if (retailerOrdersTableBody) {
        retailerOrdersTableBody.innerHTML = `
          <tr>
            <td colspan="8" class="text-center py-4 text-danger">
              <i class="bi bi-exclamation-triangle-fill fs-1 mb-3"></i>
              <p>Error loading orders: ${error.message}</p>
              <button class="btn btn-outline-primary mt-3" onclick="fetchRetailerOrders()">
                <i class="bi bi-arrow-clockwise me-2"></i>Retry
              </button>
            </td>
          </tr>
        `;
      }
    });
}

// Render transactions based on current pagination
function renderTransactions() {
  console.log("Rendering transactions for page:", currentPage);
  
  // Apply search if any
  let filteredTransactions = [...transactions];
  if (searchTerm) {
    const term = searchTerm.toLowerCase();
    filteredTransactions = filteredTransactions.filter(
      (transaction) =>
        transaction.transaction_id.toLowerCase().includes(term) ||
        transaction.customer_name.toLowerCase().includes(term)
    );
  }

  // Update pagination info
  const totalItems = filteredTransactions.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  
  // Calculate correct start and end indices for display
  const start = (currentPage - 1) * itemsPerPage + 1;
  const end = Math.min(start + itemsPerPage - 1, totalItems);

  console.log("Pagination info - Start:", start, "End:", end, "Total:", totalItems, "Total Pages:", totalPages);

  // Update pagination display text
  if (showingStart) showingStart.textContent = totalItems > 0 ? start : 0;
  if (showingEnd) showingEnd.textContent = end;
  if (totalTransactions) totalTransactions.textContent = totalItems;

  // Get current page items - this is the key part for pagination
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const currentItems = filteredTransactions.slice(startIndex, endIndex);

  console.log("Displaying items from index", startIndex, "to", endIndex, "Count:", currentItems.length);
  
  // Clear table
  transactionsTableBody.innerHTML = "";

  // Check if we have items
  if (currentItems.length === 0) {
    transactionsTableBody.innerHTML = `
      <tr>
        <td colspan="7" class="text-center py-4">
          <i class="bi bi-search fs-1 text-muted mb-3"></i>
          <p class="text-muted">No transactions found. Try a different search.</p>
        </td>
      </tr>
    `;
    return;
  }

  // Render items
  currentItems.forEach((transaction) => {
    const row = document.createElement("tr");

    // Format date
    const date = new Date(transaction.transaction_date);
    const formattedDate = date.toLocaleDateString();
    const formattedTime = date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    // Create status badge
    const statusBadge = getStatusBadge(transaction.status);

    row.innerHTML = `
      <td class="order-id">${transaction.transaction_id}</td>
      <td>
        <div>${formattedDate}</div>
        <small class="text-muted">${formattedTime}</small>
      </td>
      <td>${transaction.customer_name}</td>
      <td>${transaction.item_count} items</td>
      <td class="fw-bold">₱${Number.parseFloat(transaction.total_amount).toFixed(2)}</td>
      <td>${statusBadge}</td>
      <td>
        <div class="d-flex">
          <button class="btn btn-sm btn-outline-primary me-1 view-transaction" data-id="${transaction.transaction_id}">
            <i class="bi bi-eye"></i>
          </button>
          <button class="btn btn-sm btn-outline-secondary print-receipt" data-id="${transaction.transaction_id}">
            <i class="bi bi-printer"></i>
          </button>
        </div>
      </td>
    `;

    transactionsTableBody.appendChild(row);
  });

  // Add event listeners to view buttons
  document.querySelectorAll(".view-transaction").forEach((button) => {
    button.addEventListener("click", function () {
      const transactionId = this.getAttribute("data-id");
      viewTransactionDetails(transactionId);
    });
  });

  // Add event listeners to print buttons
  document.querySelectorAll(".print-receipt").forEach((button) => {
    button.addEventListener("click", function () {
      const transactionId = this.getAttribute("data-id");
      printTransactionReceipt(transactionId);
    });
  });

  // Update pagination UI
  updatePagination(currentPage, totalPages);
}

// Function to render retailer orders
function renderRetailerOrders() {
  const retailerOrdersTableBody = document.getElementById("retailer-orders-table-body");
  
  if (!retailerOrdersTableBody) {
    console.error("Retailer orders table body not found");
    return;
  }
  
  // Apply search if any
  let filteredOrders = [...retailerOrders];
  if (retailerSearchTerm) {
    const term = retailerSearchTerm.toLowerCase();
    filteredOrders = filteredOrders.filter(
      (order) =>
        order.order_id.toString().includes(term) ||
        (order.retailer_name && order.retailer_name.toLowerCase().includes(term)) ||
        (order.po_number && order.po_number.toLowerCase().includes(term))
    );
  }

  // Update pagination info
  const totalItems = filteredOrders.length;
  const totalPages = Math.ceil(totalItems / retailerOrdersPerPage);
  
  // Calculate correct start and end indices for display
  const start = (retailerCurrentPage - 1) * retailerOrdersPerPage + 1;
  const end = Math.min(start + retailerOrdersPerPage - 1, totalItems);

  // Update pagination display text
  const showingStart = document.getElementById("retailer-showing-start");
  const showingEnd = document.getElementById("retailer-showing-end");
  const totalRetailerOrders = document.getElementById("total-retailer-orders");
  
  if (showingStart) showingStart.textContent = totalItems > 0 ? start : 0;
  if (showingEnd) showingEnd.textContent = end;
  if (totalRetailerOrders) totalRetailerOrders.textContent = totalItems;

  // Get current page items
  const startIndex = (retailerCurrentPage - 1) * retailerOrdersPerPage;
  const endIndex = Math.min(startIndex + retailerOrdersPerPage, totalItems);
  const currentItems = filteredOrders.slice(startIndex, endIndex);
  
  // Clear table
  retailerOrdersTableBody.innerHTML = "";

  // Check if we have items
  if (currentItems.length === 0) {
    retailerOrdersTableBody.innerHTML = `
      <tr>
        <td colspan="8" class="text-center py-4">
          <i class="bi bi-search fs-1 text-muted mb-3"></i>
          <p class="text-muted">No paid orders found. Try a different search.</p>
        </td>
      </tr>
    `;
    return;
  }

  // Render items
  currentItems.forEach((order) => {
    const row = document.createElement("tr");

    // Format date
    const orderDate = new Date(order.order_date || order.created_at);
    const formattedDate = orderDate.toLocaleDateString();
    
    // Use retailer_id if retailer_name is not available
    const retailerName = order.retailer_name || `Retailer #${order.retailer_id}`;
    const retailerEmail = order.retailer_email || 'N/A';

    row.innerHTML = `
      <td class="fw-semibold">${order.order_id}</td>
      <td>
        <div class="fw-semibold">${retailerName}</div>
        <small class="text-muted">${retailerEmail}</small>
      </td>
      <td>${formattedDate}</td>
      <td>${order.po_number || 'N/A'}</td>
      <td>
        <span class="badge ${order.delivery_mode === 'pickup' ? 'bg-info' : 'bg-primary'}">
          <i class="bi bi-${order.delivery_mode === 'pickup' ? 'box' : 'truck'} me-1"></i>
          ${order.delivery_mode || 'N/A'}
        </span>
      </td>
      <td class="fw-bold">₱${Number.parseFloat(order.total_amount).toFixed(2)}</td>
      <td>
        <span class="badge bg-success">
          <i class="bi bi-check-circle-fill me-1"></i>Paid
        </span>
      </td>
      <td>
        <button class="btn btn-sm btn-outline-primary view-order-details" data-order-id="${order.order_id}">
          <i class="bi bi-eye me-1"></i>View Details
        </button>
      </td>
    `;

    retailerOrdersTableBody.appendChild(row);
  });

  // Add event listeners to view details buttons
  document.querySelectorAll(".view-order-details").forEach((button) => {
    button.addEventListener("click", function() {
      const orderId = this.getAttribute("data-order-id");
      viewOrderDetails(orderId);
    });
  });

  // Update pagination UI
  updateRetailerPagination(retailerCurrentPage, totalPages);
}

// Update pagination UI and attach event listeners
function updatePagination(currentPage, totalPages) {
  const paginationElement = document.querySelector(".pagination");
  if (!paginationElement) {
    console.error("Pagination element not found");
    return;
  }

  console.log("Updating pagination. Current page:", currentPage, "Total pages:", totalPages);

  // Create pagination HTML with direct onclick handlers for simplicity and reliability
  let paginationHTML = `
    <li class="page-item ${currentPage === 1 ? "disabled" : ""}">
      <a class="page-link" href="javascript:void(0);" onclick="changePage(${currentPage - 1})" aria-label="Previous">
        <span aria-hidden="true">&laquo;</span>
      </a>
    </li>
  `;

  // Generate page numbers
  for (let i = 1; i <= totalPages; i++) {
    paginationHTML += `
      <li class="page-item ${i === currentPage ? "active" : ""}">
        <a class="page-link" href="javascript:void(0);" onclick="changePage(${i})">${i}</a>
      </li>
    `;
  }

  paginationHTML += `
    <li class="page-item ${currentPage === totalPages || totalPages === 0 ? "disabled" : ""}">
      <a class="page-link" href="javascript:void(0);" onclick="changePage(${currentPage + 1})" aria-label="Next">
        <span aria-hidden="true">&raquo;</span>
      </a>
    </li>
  `;

  paginationElement.innerHTML = paginationHTML;
}

// Function to update retailer pagination
function updateRetailerPagination(currentPage, totalPages) {
  const paginationElement = document.getElementById("retailer-orders-pagination");
  
  if (!paginationElement) {
    console.error("Retailer pagination element not found");
    return;
  }
  
  // Create pagination HTML
  let paginationHTML = `
    <li class="page-item ${currentPage === 1 ? "disabled" : ""}">
      <a class="page-link" href="javascript:void(0);" onclick="changeRetailerPage(${currentPage - 1})" aria-label="Previous">
        <span aria-hidden="true">&laquo;</span>
      </a>
    </li>
  `;

  // Generate page numbers
  const maxPagesToShow = 5;
  let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
  let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
  
  if (endPage - startPage + 1 < maxPagesToShow) {
    startPage = Math.max(1, endPage - maxPagesToShow + 1);
  }
  
  for (let i = startPage; i <= endPage; i++) {
    paginationHTML += `
      <li class="page-item ${i === currentPage ? "active" : ""}">
        <a class="page-link" href="javascript:void(0);" onclick="changeRetailerPage(${i})">${i}</a>
      </li>
    `;
  }

  paginationHTML += `
    <li class="page-item ${currentPage === totalPages || totalPages === 0 ? "disabled" : ""}">
      <a class="page-link" href="javascript:void(0);" onclick="changeRetailerPage(${currentPage + 1})" aria-label="Next">
        <span aria-hidden="true">&raquo;</span>
      </a>
    </li>
  `;

  paginationElement.innerHTML = paginationHTML;
}

// View transaction details with enhanced UI
function viewTransactionDetails(transactionId) {
  // Find transaction
  const transaction = transactions.find((t) => t.transaction_id === transactionId);
  if (!transaction) return;

  // Format date for better display
  const transactionDate = new Date(transaction.transaction_date);
  const formattedDate = transactionDate.toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  const formattedTime = transactionDate.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });

  // Get payment method badge
  const paymentMethodBadge = getPaymentMethodBadge(transaction.payment_method || "Cash");
  
  // Get status badge
  const statusBadge = getStatusBadge(transaction.status);

  // Calculate total items
  let totalItems = 0;
  if (transaction.items && transaction.items.length > 0) {
    transaction.items.forEach(item => {
      totalItems += parseInt(item.quantity);
    });
  } else {
    totalItems = transaction.item_count;
  }

  // Create enhanced modal content
  const modalContent = `
    <div class="modal-body p-0">
      <!-- Transaction Header -->
      <div class="p-4 bg-light border-bottom">
        <div class="d-flex justify-content-between align-items-start">
          <div>
            <h5 class="mb-1 d-flex align-items-center">
              <span class="badge bg-warning text-dark me-2">Order #${transaction.transaction_id}</span>
              ${statusBadge}
            </h5>
            <p class="text-muted mb-0">
              <i class="bi bi-calendar-event me-1"></i> ${formattedDate} at ${formattedTime}
            </p>
          </div>
          <div class="text-end">
            <h5 class="mb-1 text-warning fw-bold">₱${Number.parseFloat(transaction.total_amount).toFixed(2)}</h5>
            <span class="badge bg-light text-dark border">
              <i class="bi bi-basket me-1"></i> ${totalItems} items
            </span>
          </div>
        </div>
      </div>
      
      <!-- Transaction Details -->
      <div class="row g-0">
        <!-- Customer & Payment Info -->
        <div class="col-md-4 p-4 border-end">
          <h6 class="fw-bold mb-3">
            <i class="bi bi-person-circle text-warning me-2"></i>Customer Information
          </h6>
          
          <div class="mb-4">
            <p class="mb-1 text-muted small">Customer Name</p>
            <p class="mb-3 fw-bold fs-5">${transaction.customer_name}</p>
            
            <p class="mb-1 text-muted small">Served By</p>
            <p class="mb-0 fw-semibold">${transaction.cashier_name}</p>
          </div>
          
          <h6 class="fw-bold mb-3 mt-4">
            <i class="bi bi-credit-card text-warning me-2"></i>Payment Details
          </h6>
          
          <div class="mb-3">
            <p class="mb-1 text-muted small">Payment Method</p>
            <p class="mb-3">${paymentMethodBadge}</p>
            
            <p class="mb-1 text-muted small">Transaction Date</p>
            <p class="mb-0">${formattedDate}</p>
          </div>
        </div>
        
        <!-- Order Items -->
        <div class="col-md-8 p-4">
          <h6 class="fw-bold mb-3">
            <i class="bi bi-cart-check text-warning me-2"></i>Order Items
          </h6>
          
          <div class="table-responsive">
            <table class="table table-hover border">
              <thead class="table-light">
                <tr>
                  <th>Product</th>
                  <th class="text-center">Quantity</th>
                  <th class="text-end">Unit Price</th>
                  <th class="text-end">Total</th>
                </tr>
              </thead>
              <tbody id="modal-items-list">
                <!-- Items will be inserted here -->
              </tbody>
              <tfoot class="table-light">
                <tr>
                  <td colspan="3" class="text-end fw-bold">Subtotal:</td>
                  <td class="text-end">₱${Number.parseFloat(transaction.subtotal).toFixed(2)}</td>
                </tr>
                <tr>
                  <td colspan="3" class="text-end fw-bold">Tax (10%):</td>
                  <td class="text-end">₱${Number.parseFloat(transaction.tax_amount).toFixed(2)}</td>
                </tr>
                <tr>
                  <td colspan="3" class="text-end fw-bold">Discount:</td>
                  <td class="text-end">₱${Number.parseFloat(transaction.discount_amount).toFixed(2)}</td>
                </tr>
                <tr>
                  <td colspan="3" class="text-end fw-bold fs-5">Total:</td>
                  <td class="text-end fw-bold fs-5 text-warning">₱${Number.parseFloat(transaction.total_amount).toFixed(2)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
      <button type="button" id="printReceiptBtn" class="btn btn-warning">
        <i class="bi bi-printer me-1"></i> Print Receipt
      </button>
    </div>
  `;

  // Update modal content
  const modalDialog = document.querySelector("#transactionModal .modal-content");
  if (modalDialog) {
    // Keep the header, replace the rest
    const modalHeader = modalDialog.querySelector(".modal-header");
    modalDialog.innerHTML = "";
    modalDialog.appendChild(modalHeader);
    
    // Append the new content
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = modalContent;
    while (tempDiv.firstChild) {
      modalDialog.appendChild(tempDiv.firstChild);
    }
  }

  // Render items
  const modalItemsList = document.getElementById("modal-items-list");
  if (modalItemsList) {
    if (transaction.items && transaction.items.length > 0) {
      let itemsHTML = "";
      transaction.items.forEach((item) => {
        const itemTotal = (Number.parseFloat(item.unit_price) * Number.parseFloat(item.quantity)).toFixed(2);
        itemsHTML += `
          <tr>
            <td>
              <div class="fw-semibold">${item.product_name}</div>
            </td>
            <td class="text-center">${item.quantity}</td>
            <td class="text-end">₱${Number.parseFloat(item.unit_price).toFixed(2)}</td>
            <td class="text-end fw-bold">₱${itemTotal}</td>
          </tr>
        `;
      });
      modalItemsList.innerHTML = itemsHTML;
    } else {
      // If we don't have detailed items, create a placeholder
      modalItemsList.innerHTML = `
        <tr>
          <td colspan="4" class="text-center py-3">
            <i class="bi bi-info-circle me-2"></i>
            Item details not available
          </td>
        </tr>
      `;
    }
  }

  // Add event listener to the new print button
  const printBtn = document.getElementById("printReceiptBtn");
  if (printBtn) {
    printBtn.addEventListener("click", () => {
      printTransactionReceipt(transactionId);
    });
  }

  // Show modal
  transactionModal.show();
}

// Function to view order details
function viewOrderDetails(orderId) {
  // Find the order in our data
  const order = retailerOrders.find(o => o.order_id.toString() === orderId.toString());
  
  if (!order) {
    console.error("Order not found:", orderId);
    return;
  }
  
  // Show the modal
  orderDetailsModal.show();
  
  // Get the modal body
  const modalBody = document.querySelector("#orderDetailsModal .modal-body");
  
  // Format dates
  const orderDate = new Date(order.order_date || order.created_at);
  const formattedOrderDate = orderDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  // Get payment method and reference from the first payment if available
  const paymentMethod = order.payments && order.payments.length > 0 ? 
    order.payments[0].payment_method : 'N/A';
  const paymentReference = order.payments && order.payments.length > 0 ? 
    order.payments[0].payment_reference : 'N/A';
  
  // Use retailer_id if retailer_name is not available
  const retailerName = order.retailer_name || `Retailer #${order.retailer_id}`;
  const retailerEmail = order.retailer_email || 'N/A';
  const retailerContact = order.retailer_contact || 'N/A';
  
  // Create the order details HTML
  let detailsHTML = `
    <div class="p-4 bg-light border-bottom">
      <div class="d-flex justify-content-between align-items-start">
        <div>
          <h5 class="mb-1 d-flex align-items-center">
            <span class="badge bg-success me-2">Order #${order.order_id}</span>
            <span class="badge bg-success">
              <i class="bi bi-check-circle-fill me-1"></i>Paid
            </span>
          </h5>
          <p class="text-muted mb-0">
            <i class="bi bi-calendar-event me-1"></i> ${formattedOrderDate}
          </p>
        </div>
        <div class="text-end">
          <h5 class="mb-1 text-success fw-bold">₱${Number.parseFloat(order.total_amount).toFixed(2)}</h5>
          <span class="badge bg-light text-dark border">
            <i class="bi bi-${order.delivery_mode === 'pickup' ? 'box' : 'truck'} me-1"></i>
            ${order.delivery_mode || 'N/A'}
          </span>
        </div>
      </div>
    </div>
    
    <div class="row g-0">
      <!-- Customer & Payment Info -->
      <div class="col-md-4 p-4 border-end">
        <h6 class="fw-bold mb-3">
          <i class="bi bi-person-circle text-success me-2"></i>Retailer Information
        </h6>
        
        <div class="mb-4">
          <p class="mb-1 text-muted small">Retailer Name</p>
          <p class="mb-3 fw-bold fs-5">${retailerName}</p>
          
          <p class="mb-1 text-muted small">Email</p>
          <p class="mb-3">${retailerEmail}</p>
          
          <p class="mb-1 text-muted small">Contact</p>
          <p class="mb-0">${retailerContact}</p>
        </div>
        
        <h6 class="fw-bold mb-3 mt-4">
          <i class="bi bi-credit-card text-success me-2"></i>Payment Details
        </h6>
        
        <div class="mb-3">
          <p class="mb-1 text-muted small">Payment Method</p>
          <p class="mb-3">
            <span class="badge ${paymentMethod.toLowerCase() === 'cash' ? 'bg-success' : 'bg-primary'}">
              <i class="bi bi-${paymentMethod.toLowerCase() === 'cash' ? 'cash' : 'credit-card'} me-1"></i>
              ${paymentMethod}
            </span>
          </p>
          
          <p class="mb-1 text-muted small">Payment Reference</p>
          <p class="mb-3">${paymentReference}</p>
          
          <p class="mb-1 text-muted small">PO Number</p>
          <p class="mb-0">${order.po_number || 'N/A'}</p>
        </div>
      </div>
      
      <!-- Order Items -->
      <div class="col-md-8 p-4">
        <h6 class="fw-bold mb-3">
          <i class="bi bi-cart-check text-success me-2"></i>Order Items
        </h6>
        
        <div class="table-responsive">
          <table class="table table-hover border">
            <thead class="table-light">
              <tr>
                <th>Product</th>
                <th class="text-center">Quantity</th>
                <th class="text-end">Unit Price</th>
                <th class="text-end">Total</th>
              </tr>
            </thead>
            <tbody id="order-items-list">
  `;
  
  // Add order items
  if (order.items && order.items.length > 0) {
    order.items.forEach(item => {
      const itemTotal = parseFloat(item.unit_price) * parseInt(item.quantity);
      detailsHTML += `
        <tr>
          <td>
            <div class="fw-semibold">${item.product_name || `Product #${item.product_id}`}</div>
            <small class="text-muted">${item.product_id}</small>
          </td>
          <td class="text-center">${item.quantity}</td>
          <td class="text-end">₱${parseFloat(item.unit_price).toFixed(2)}</td>
          <td class="text-end fw-bold">₱${itemTotal.toFixed(2)}</td>
        </tr>
      `;
    });
  } else {
    detailsHTML += `
      <tr>
        <td colspan="4" class="text-center py-3">
          <i class="bi bi-info-circle me-2"></i>
          No items found for this order
        </td>
      </tr>
    `;
  }
  
  // Add order totals
  detailsHTML += `
            </tbody>
            <tfoot class="table-light">
              <tr>
                <td colspan="3" class="text-end fw-bold">Subtotal:</td>
                <td class="text-end">₱${parseFloat(order.subtotal || order.total_amount).toFixed(2)}</td>
              </tr>
              <tr>
                <td colspan="3" class="text-end fw-bold">Tax:</td>
                <td class="text-end">₱${parseFloat(order.tax || 0).toFixed(2)}</td>
              </tr>
              <tr>
                <td colspan="3" class="text-end fw-bold">Discount:</td>
                <td class="text-end">₱${parseFloat(order.discount || 0).toFixed(2)}</td>
              </tr>
              <tr>
                <td colspan="3" class="text-end fw-bold fs-5">Total:</td>
                <td class="text-end fw-bold fs-5 text-success">₱${parseFloat(order.total_amount).toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  `;
  
  // Update the modal body
  modalBody.innerHTML = detailsHTML;

  // Re-attach the print event listener after updating modal content
  const printBtn = document.getElementById('printOrderDetailsBtn');
  if (printBtn) {
    printBtn.onclick = printOrderDetails;
  }
}

// Function to print order details
function printOrderDetails() {
  console.log('Print Details button clicked');
  // Find the currently viewed order ID
  const modalBody = document.querySelector("#orderDetailsModal .modal-body");
  if (!modalBody) return;
  // Try to extract order ID from the modal content
  const orderIdMatch = modalBody.innerHTML.match(/Order #(\d+)/);
  if (orderIdMatch) {
    const orderId = orderIdMatch[1];
    console.log('Extracted orderId for print:', orderId);
    printRetailerOrderReceipt(orderId);
  } else {
    console.log('Order ID not found in modal body');
    window.print(); // fallback
  }
}

// Helper function to get payment method badge
function getPaymentMethodBadge(method) {
  let badgeClass = "bg-secondary";
  let icon = "cash";
  
  const methodLower = method.toLowerCase();
  
  if (methodLower.includes("cash")) {
    badgeClass = "bg-success";
    icon = "cash";
  } else if (methodLower.includes("credit") || methodLower.includes("card")) {
    badgeClass = "bg-info";
    icon = "credit-card";
  } else if (methodLower.includes("mobile") || methodLower.includes("online")) {
    badgeClass = "bg-primary";
    icon = "phone";
  }
  
  return `<span class="badge ${badgeClass}"><i class="bi bi-${icon} me-1"></i>${method}</span>`;
}

// Print transaction receipt
function printTransactionReceipt(transactionId) {
  // Find transaction
  const transaction = transactions.find((t) => t.transaction_id === transactionId);
  if (!transaction) return;

  // Create receipt content
  let receiptContent = `
    <div class="receipt-header text-center mb-4">
      <h4>Piñana Gourmet</h4>
      <p class="mb-0">123 Main Street, Anytown</p>
      <p class="mb-0">Tel: (123) 456-7890</p>
    </div>
    
    <div class="receipt-info mb-4">
      <p class="mb-1"><strong>Receipt #:</strong> ${transaction.transaction_id}</p>
      <p class="mb-1"><strong>Date:</strong> ${new Date(transaction.transaction_date).toLocaleString()}</p>
      <p class="mb-1"><strong>Customer:</strong> ${transaction.customer_name}</p>
      <p class="mb-0"><strong>Cashier:</strong> ${transaction.cashier_name}</p>
    </div>
    
    <div class="receipt-divider mb-3"></div>
    
    <div class="receipt-items mb-4">
      <table class="w-100">
        <thead>
          <tr>
            <th class="text-start">Item</th>
            <th class="text-center">Qty</th>
            <th class="text-end">Price</th>
            <th class="text-end">Total</th>
          </tr>
        </thead>
        <tbody>
  `;

  // Add items
  if (transaction.items && transaction.items.length > 0) {
    transaction.items.forEach((item) => {
      const itemTotal = (Number.parseFloat(item.unit_price) * Number.parseFloat(item.quantity)).toFixed(2);
      receiptContent += `
        <tr>
          <td>${item.product_name}</td>
          <td class="text-center">${item.quantity}</td>
          <td class="text-end">₱${Number.parseFloat(item.unit_price).toFixed(2)}</td>
          <td class="text-end">₱${itemTotal}</td>
        </tr>
      `;
    });
  } else {
    // If we don't have detailed items, create a placeholder
    receiptContent += `
      <tr>
        <td colspan="4" class="text-center py-3">
          ${transaction.item_count} items
        </td>
      </tr>
    `;
  }

  // Add totals
  receiptContent += `
        </tbody>
      </table>
    </div>
    
    <div class="receipt-divider mb-3"></div>
    
    <div class="receipt-totals mb-4">
      <div class="d-flex justify-content-between mb-1">
        <span>Subtotal:</span>
        <span>₱${Number.parseFloat(transaction.subtotal).toFixed(2)}</span>
      </div>
      <div class="d-flex justify-content-between mb-1">
        <span>Tax (10%):</span>
        <span>₱${Number.parseFloat(transaction.tax_amount).toFixed(2)}</span>
      </div>
      <div class="d-flex justify-content-between mb-1">
        <span>Discount:</span>
        <span>₱${Number.parseFloat(transaction.discount_amount).toFixed(2)}</span>
      </div>
      <div class="d-flex justify-content-between fw-bold">
        <span>Total:</span>
        <span>₱${Number.parseFloat(transaction.total_amount).toFixed(2)}</span>
      </div>
    </div>
    
    <div class="receipt-footer text-center mt-4">
      <p class="mb-0">Thank you for shopping at Piñana Gourmet!</p>
      <p class="mb-0">Please come again.</p>
    </div>
  `;

  // Open print window
  const printWindow = window.open("", "_blank");

  printWindow.document.write(`
    <html>
      <head>
        <title>Receipt - ${transaction.transaction_id}</title>
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

// Function to print retailer order receipt
function printRetailerOrderReceipt(orderId) {
  const order = retailerOrders.find(o => o.order_id.toString() === orderId.toString());
  if (!order) return;

  // Format order date
  const orderDate = new Date(order.order_date || order.created_at);
  const formattedOrderDate = orderDate.toLocaleString();

  // Get payment method and reference
  const paymentMethod = order.payments && order.payments.length > 0 ? order.payments[0].payment_method : 'N/A';
  const paymentReference = order.payments && order.payments.length > 0 ? order.payments[0].payment_reference : 'N/A';

  // Use retailer_id if retailer_name is not available
  const retailerName = order.retailer_name || `Retailer #${order.retailer_id}`;
  const retailerEmail = order.retailer_email || 'N/A';
  const retailerContact = order.retailer_contact || 'N/A';

  let receiptContent = `
    <div class="container py-4" style="max-width: 700px;">
      <div class="card shadow border-0">
        <div class="card-header bg-success text-white d-flex align-items-center justify-content-between">
          <div class="d-flex align-items-center">
            <img src='images/final-light.png' alt='Logo' style='height:48px;width:auto;margin-right:16px;'>
            <div>
              <h4 class="mb-0">Piñana Gourmet</h4>
              <small>Purok 4 Brgy. San Isidro Calauan, Laguna</small><br>
              <small>Tel: 0994 940 7497</small>
            </div>
          </div>
          <div class="text-end">
            <span class="badge bg-success fs-6">PAID</span>
          </div>
        </div>
        <div class="card-body">
          <div class="row mb-4">
            <div class="col-md-6">
              <h5 class="fw-bold mb-2 text-success">Order #${order.order_id}</h5>
              <div><strong>Date:</strong> ${formattedOrderDate}</div>
              <div><strong>PO Number:</strong> ${order.po_number || 'N/A'}</div>
              <div><strong>Delivery Mode:</strong> ${order.delivery_mode || 'N/A'}</div>
            </div>
            <div class="col-md-6">
              <h6 class="fw-bold mb-1 text-primary">Retailer Information</h6>
              <div><strong>Name:</strong> ${retailerName}</div>
              <div><strong>Email:</strong> ${retailerEmail}</div>
              <div><strong>Contact:</strong> ${retailerContact}</div>
            </div>
          </div>
          <div class="row mb-4">
            <div class="col-md-6">
              <h6 class="fw-bold mb-1 text-primary">Payment Details</h6>
              <div><strong>Method:</strong> ${paymentMethod}</div>
              <div><strong>Reference:</strong> ${paymentReference}</div>
            </div>
          </div>
          <div class="table-responsive mb-4">
            <table class="table table-bordered align-middle">
              <thead class="table-success">
                <tr>
                  <th>Product</th>
                  <th class="text-center">Quantity</th>
                  <th class="text-end">Unit Price</th>
                  <th class="text-end">Total</th>
                </tr>
              </thead>
              <tbody>
  `;
  if (order.items && order.items.length > 0) {
    order.items.forEach(item => {
      const itemTotal = (parseFloat(item.unit_price) * parseInt(item.quantity)).toFixed(2);
      receiptContent += `
        <tr>
          <td>${item.product_name || `Product #${item.product_id}`}</td>
          <td class="text-center">${item.quantity}</td>
          <td class="text-end">₱${parseFloat(item.unit_price).toFixed(2)}</td>
          <td class="text-end">₱${itemTotal}</td>
        </tr>
      `;
    });
  } else {
    receiptContent += `
      <tr>
        <td colspan="4" class="text-center py-3">
          No items found for this order
        </td>
      </tr>
    `;
  }
  receiptContent += `
              </tbody>
              <tfoot>
                <tr>
                  <td colspan="3" class="text-end fw-bold">Subtotal:</td>
                  <td class="text-end">₱${parseFloat(order.subtotal || order.total_amount).toFixed(2)}</td>
                </tr>
                <tr>
                  <td colspan="3" class="text-end fw-bold">Tax:</td>
                  <td class="text-end">₱${parseFloat(order.tax || 0).toFixed(2)}</td>
                </tr>
                <tr>
                  <td colspan="3" class="text-end fw-bold">Discount:</td>
                  <td class="text-end">₱${parseFloat(order.discount || 0).toFixed(2)}</td>
                </tr>
                <tr>
                  <td colspan="3" class="text-end fw-bold fs-5 text-success">Total:</td>
                  <td class="text-end fw-bold fs-5 text-success">₱${parseFloat(order.total_amount).toFixed(2)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
          <div class="text-center mt-4">
            <span class="fw-bold text-success">Thank you for your business!</span><br>
            <span class="text-muted">Please come again.</span>
          </div>
        </div>
      </div>
    </div>
  `;
  const printWindow = window.open("", "_blank");
  printWindow.document.write(`
    <html>
      <head>
        <title>Order Invoice - #${order.order_id}</title>
        <link href='https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/css/bootstrap.min.css' rel='stylesheet'>
        <link rel='stylesheet' href='https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.0/font/bootstrap-icons.css'>
        <style>
          body { background: #f8f9fa; }
          .card { margin: 40px auto; }
          @media print {
            .card { box-shadow: none !important; border: 1px solid #ccc !important; }
            body { background: #fff !important; }
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
        <\/script>
      </body>
    </html>
  `);
  printWindow.document.close();
}

// Set up event listeners
function setupEventListeners() {
  console.log("Setting up event listeners");
  
  // Search input
  if (searchInput) {
    let searchTimeout;
    searchInput.addEventListener("input", function () {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        searchTerm = this.value.trim();
        currentPage = 1; // Reset to first page
        renderTransactions();
      }, 300);
    });
  }

  // Function to search retailer orders
  function searchRetailerOrders() {
    const searchInput = document.getElementById("search-retailer-orders");
    if (searchInput) {
      retailerSearchTerm = searchInput.value.trim();
      retailerCurrentPage = 1; // Reset to first page
      renderRetailerOrders();
    }
  }
}

// Helper function to get status badge HTML
function getStatusBadge(status) {
  if (!status) status = "completed";

  const statusLower = status.toLowerCase();
  let badgeClass = "bg-secondary";
  let icon = "check-circle-fill";

  if (statusLower === "completed") {
    badgeClass = "bg-success";
    icon = "check-circle-fill";
  } else if (statusLower === "pending") {
    badgeClass = "bg-warning text-dark";
    icon = "clock-fill";
  } else if (statusLower === "cancelled") {
    badgeClass = "bg-danger";
    icon = "x-circle-fill";
  }

  return `<span class="badge ${badgeClass}"><i class="bi bi-${icon} me-1"></i>${status.charAt(0).toUpperCase() + status.slice(1)}</span>`;
}

// Function to get sample transactions for demo purposes
function getSampleTransactions() {
  return [
    {
      transaction_id: "PG-12345",
      transaction_date: "2025-03-28T13:45:22",
      customer_name: "John Doe",
      cashier_name: "Admin User",
      payment_method: "Cash",
      item_count: 3,
      subtotal: 450.00,
      tax_amount: 45.00,
      discount_amount: 0.00,
      total_amount: 495.00,
      status: "completed",
      items: [
        {
          product_name: "Pineapple Jam",
          quantity: 2,
          unit_price: 150.00
        },
        {
          product_name: "Pineapple Juice",
          quantity: 1,
          unit_price: 150.00
        }
      ]
    },
    {
      transaction_id: "PG-12346",
      transaction_date: "2025-03-28T14:30:15",
      customer_name: "Jane Smith",
      cashier_name: "Admin User",
      payment_method: "Credit Card",
      item_count: 2,
      subtotal: 300.00,
      tax_amount: 30.00,
      discount_amount: 30.00,
      total_amount: 300.00,
      status: "completed",
      items: [
        {
          product_name: "Pineapple Cake",
          quantity: 1,
          unit_price: 200.00
        },
        {
          product_name: "Pineapple Candy",
          quantity: 1,
          unit_price: 100.00
        }
      ]
    },
    {
      transaction_id: "PG-12347",
      transaction_date: "2025-03-28T15:20:45",
      customer_name: "Robert Johnson",
      cashier_name: "Admin User",
      payment_method: "Mobile Payment",
      item_count: 4,
      subtotal: 600.00,
      tax_amount: 60.00,
      discount_amount: 0.00,
      total_amount: 660.00,
      status: "pending",
      items: [
        {
          product_name: "Pineapple Jam",
          quantity: 2,
          unit_price: 150.00
        },
        {
          product_name: "Pineapple Juice",
          quantity: 2,
          unit_price: 150.00
        }
      ]
    },
    {
      transaction_id: "PG-12348",
      transaction_date: "2025-03-28T16:15:30",
      customer_name: "Emily Davis",
      cashier_name: "Admin User",
      payment_method: "Cash",
      item_count: 1,
      subtotal: 200.00,
      tax_amount: 20.00,
      discount_amount: 0.00,
      total_amount: 220.00,
      status: "completed",
      items: [
        {
          product_name: "Pineapple Cake",
          quantity: 1,
          unit_price: 200.00
        }
      ]
    },
    {
      transaction_id: "PG-12349",
      transaction_date: "2025-03-28T17:05:10",
      customer_name: "Michael Wilson",
      cashier_name: "Admin User",
      payment_method: "Credit Card",
      item_count: 3,
      subtotal: 400.00,
      tax_amount: 40.00,
      discount_amount: 40.00,
      total_amount: 400.00,
      status: "cancelled",
      items: [
        {
          product_name: "Pineapple Jam",
          quantity: 1,
          unit_price: 150.00
        },
        {
          product_name: "Pineapple Cake",
          quantity: 1,
          unit_price: 200.00
        },
        {
          product_name: "Pineapple Candy",
          quantity: 1,
          unit_price: 50.00
        }
      ]
    }
  ];
}