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

// State - Make sure these variables are accessible globally
let transactions = [];
let currentPage = 1;
const itemsPerPage = 5;
let searchTerm = "";

// Initialize
document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM loaded, initializing transactions page");
  
  // Position the Back to POS button at the bottom of the page
  createBackToPosButton();
  
  // Fetch transactions
  fetchTransactions();

  // Set up event listeners
  setupEventListeners();
});

// Create and position the Back to POS button at the bottom of the page
function createBackToPosButton() {
  // Remove the existing button if it exists
  const existingButton = document.querySelector(".mb-4 .btn-outline-secondary");
  if (existingButton) {
    existingButton.parentElement.remove();
  }
  
  // Create a container for the button at the bottom of the page
  const buttonContainer = document.createElement("div");
  buttonContainer.className = "d-flex justify-content-center mt-4 mb-5";
  
  // Create the button with yellow theme
  const backButton = document.createElement("a");
  backButton.href = "pos.html";
  backButton.id = "back-to-pos-btn";
  backButton.className = "btn btn-warning text-dark fw-bold px-4 py-2";
  backButton.innerHTML = '<i class="bi bi-arrow-left me-2"></i>Back to POS';
  
  // Add hover effect styles
  const style = document.createElement('style');
  style.innerHTML = `
    #back-to-pos-btn {
      border-radius: 50px;
      background-color:rgb(255, 255, 255) !important;
      box-shadow: 0 4px 8px rgba(221, 202, 76, 0.1);
      transition: all 0.3s ease;
    }
    
    #back-to-pos-btn:hover {
      background-color:rgb(242, 211, 86) !important;
      box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
      transform: translateY(-2px);
    }
  `;
  document.head.appendChild(style);
  
  // Append the button to the container
  buttonContainer.appendChild(backButton);
  
  // Append the container to the main content
  const mainContent = document.querySelector(".main-content-inner");
  mainContent.appendChild(buttonContainer);
}

// Global function to change page - can be called directly from HTML if needed
function changePage(page) {
  console.log("Changing to page:", page);
  currentPage = page;
  renderTransactions();
  document.querySelector(".transaction-table").scrollIntoView({ behavior: "smooth" });
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

  // Remove filter dropdown event listeners since we're removing filtering
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

