// Global variables
let completedOrders = [];
let partialPaymentOrders = [];
let currentPage = 1;
let partialCurrentPage = 1;
const ordersPerPage = 10;

// Document ready function
document.addEventListener('DOMContentLoaded', function() {
    // Initialize the page
    fetchCompletedOrders();
    
    // Add event listeners
    document.getElementById('refreshCompletedOrdersBtn').addEventListener('click', fetchCompletedOrders);
    document.getElementById('searchCompletedOrdersBtn').addEventListener('click', searchCompletedOrders);
    document.getElementById('searchCompletedOrders').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            searchCompletedOrders();
        }
    });
    
    // Tab change listeners
    document.getElementById('pending-payments-tab').addEventListener('click', fetchPendingPayments);
    document.getElementById('partial-payments-tab').addEventListener('click', fetchPartialPayments);
    
    // Add event listener for the refresh partial orders button
    document.getElementById('refreshPartialOrdersBtn').addEventListener('click', fetchPartialPayments);

    // Add event listener for the print order button
    document.getElementById('printOrderBtn').addEventListener('click', printOrderDetails);
});

/**
 * Fetch completed orders
 */
function fetchCompletedOrders() {
    // Show loading state
    document.getElementById('completedOrdersTableBody').innerHTML = `
        <tr>
            <td colspan="8" class="text-center py-4">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
                <p class="mt-2">Loading completed orders...</p>
            </td>
        </tr>
    `;
    
    // Fetch data from the server
    fetch('fetch_completed_orders.php')
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        console.log('Fetched data:', data); // Debug log
        
        if (data.success) {
            completedOrders = data.orders || [];
            
            // Debug log
            console.log('Completed orders:', completedOrders);
            
            // Filter orders with pending payment status
            const pendingPaymentOrders = completedOrders.filter(order => {
                return order.payment_status === 'pending' || !order.payment_status;
            });
            
            console.log('Pending payment orders:', pendingPaymentOrders); // Debug log
            
            displayCompletedOrders(pendingPaymentOrders, currentPage);
            setupPagination(pendingPaymentOrders.length);
            updateOrdersCount(pendingPaymentOrders.length);
        } else {
            throw new Error(data.message || 'Failed to fetch completed orders');
        }
    })
    .catch(error => {
        console.error('Error fetching completed orders:', error);
        document.getElementById('completedOrdersTableBody').innerHTML = `
            <tr>
                <td colspan="8" class="text-center py-4 text-danger">
                    <i class="bi bi-exclamation-triangle-fill me-2"></i>
                    Error loading orders: ${error.message}
                </td>
            </tr>
        `;
    });
}

/**
 * Display completed orders in the table
 */
function displayCompletedOrders(orders, page) {
    const tableBody = document.getElementById('completedOrdersTableBody');
    tableBody.innerHTML = '';
    
    if (!orders || orders.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="8" class="text-center py-4">
                    <i class="bi bi-info-circle me-2"></i>
                    No completed orders with pending payments found.
                </td>
            </tr>
        `;
        return;
    }
    
    // Calculate start and end index for pagination
    const startIndex = (page - 1) * ordersPerPage;
    const endIndex = Math.min(startIndex + ordersPerPage, orders.length);
    
    // Display orders for current page
    for (let i = startIndex; i < endIndex; i++) {
        const order = orders[i];
        
        // Format date
        const orderDate = new Date(order.order_date || order.created_at);
        const formattedDate = orderDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
        
        // Create table row
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${order.order_id}</td>
            <td>${order.po_number || 'N/A'}</td>
            <td>${order.retailer_name}</td>
            <td>${formattedDate}</td>
            <td>${order.delivery_mode || 'N/A'}</td>
            <td>₱${parseFloat(order.total_amount).toFixed(2)}</td>
            <td>
                <span class="badge ${order.payment_status === 'pending' || !order.payment_status ? 'bg-warning text-dark' : 'bg-success'}">
                    ${order.payment_status || 'pending'}
                </span>
            </td>
            <td>
                <div class="btn-group btn-group-sm" role="group">
                    <button type="button" class="btn btn-outline-primary view-order-btn" data-order-id="${order.order_id}">
                        <i class="bi bi-eye"></i>
                    </button>
                </div>
            </td>
        `;
        
        tableBody.appendChild(row);
    }
    
    // Add event listeners to the view order buttons
    document.querySelectorAll('.view-order-btn').forEach(button => {
        button.addEventListener('click', function() {
            const orderId = this.getAttribute('data-order-id');
            viewOrderDetails(orderId);
        });
    });
}

/**
 * Setup pagination for the orders table
 */
function setupPagination(totalOrders) {
    const paginationElement = document.getElementById('completedOrdersPagination');
    paginationElement.innerHTML = '';
    
    const totalPages = Math.ceil(totalOrders / ordersPerPage);
    
    if (totalPages <= 1) {
        return;
    }
    
    // Previous button
    const prevLi = document.createElement('li');
    prevLi.className = `page-item ${currentPage === 1 ? 'disabled' : ''}`;
    prevLi.innerHTML = `
        <a class="page-link" href="#" aria-label="Previous">
            <span aria-hidden="true">&laquo;</span>
        </a>
    `;
    prevLi.addEventListener('click', function(e) {
        e.preventDefault();
        if (currentPage > 1) {
            currentPage--;
            const pendingPaymentOrders = completedOrders.filter(order => {
                return order.payment_status === 'pending' || !order.payment_status;
            });
            displayCompletedOrders(pendingPaymentOrders, currentPage);
            setupPagination(pendingPaymentOrders.length);
        }
    });
    paginationElement.appendChild(prevLi);
    
    // Page numbers
    const maxPagesToShow = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
    
    if (endPage - startPage + 1 < maxPagesToShow) {
        startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
        const pageLi = document.createElement('li');
        pageLi.className = `page-item ${i === currentPage ? 'active' : ''}`;
        pageLi.innerHTML = `<a class="page-link" href="#">${i}</a>`;
        
        pageLi.addEventListener('click', function(e) {
            e.preventDefault();
            currentPage = i;
            const pendingPaymentOrders = completedOrders.filter(order => {
                return order.payment_status === 'pending' || !order.payment_status;
            });
            displayCompletedOrders(pendingPaymentOrders, currentPage);
            setupPagination(pendingPaymentOrders.length);
        });
        
        paginationElement.appendChild(pageLi);
    }
    
    // Next button
    const nextLi = document.createElement('li');
    nextLi.className = `page-item ${currentPage === totalPages ? 'disabled' : ''}`;
    nextLi.innerHTML = `
        <a class="page-link" href="#" aria-label="Next">
            <span aria-hidden="true">&raquo;</span>
        </a>
    `;
    nextLi.addEventListener('click', function(e) {
        e.preventDefault();
        if (currentPage < totalPages) {
            currentPage++;
            const pendingPaymentOrders = completedOrders.filter(order => {
                return order.payment_status === 'pending' || !order.payment_status;
            });
            displayCompletedOrders(pendingPaymentOrders, currentPage);
            setupPagination(pendingPaymentOrders.length);
        }
    });
    paginationElement.appendChild(nextLi);
}

/**
 * Update the orders count display
 */
function updateOrdersCount(totalOrders) {
    const countElement = document.getElementById('completedOrdersCount');
    countElement.textContent = `Showing ${totalOrders} order${totalOrders !== 1 ? 's' : ''}`;
}

/**
 * Search completed orders
 */
function searchCompletedOrders() {
    const searchTerm = document.getElementById('searchCompletedOrders').value.toLowerCase().trim();
    
    // First filter by payment status
    const pendingPaymentOrders = completedOrders.filter(order => {
        return order.payment_status === 'pending' || !order.payment_status;
    });
    
    if (searchTerm === '') {
        displayCompletedOrders(pendingPaymentOrders, 1);
        setupPagination(pendingPaymentOrders.length);
        updateOrdersCount(pendingPaymentOrders.length);
        return;
    }
    
    const filteredOrders = pendingPaymentOrders.filter(order => {
        return (
            order.order_id.toString().includes(searchTerm) ||
            (order.po_number && order.po_number.toLowerCase().includes(searchTerm)) ||
            order.retailer_name.toLowerCase().includes(searchTerm)
        );
    });
    
    currentPage = 1;
    displayCompletedOrders(filteredOrders, currentPage);
    setupPagination(filteredOrders.length);
    updateOrdersCount(filteredOrders.length);
}

/**
 * View order details
 */
function viewOrderDetails(orderId) {
    const modal = new bootstrap.Modal(document.getElementById('viewOrderModal'));
    modal.show();
    
    const modalBody = document.getElementById('viewOrderModalBody');
    modalBody.innerHTML = `
        <div class="text-center py-5">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
            <p class="mt-3">Loading order details...</p>
        </div>
    `;
    
    // Find the order in our already loaded data
    let order = completedOrders.find(o => o.order_id.toString() === orderId.toString());
    
    // If not found in completed orders, check partial payment orders
    if (!order && partialPaymentOrders.length > 0) {
        order = partialPaymentOrders.find(o => o.order_id.toString() === orderId.toString());
    }
    
    if (order) {
        displayOrderDetails(order);
    } else {
        // If not found in our data, try to fetch it
        fetch('get_completed_order_details.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                order_id: orderId
            })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                displayOrderDetails(data.order);
            } else {
                throw new Error(data.message || 'Failed to fetch order details');
            }
        })
        .catch(error => {
            console.error('Error fetching order details:', error);
            modalBody.innerHTML = `
                <div class="text-center py-4 text-danger">
                    <i class="bi bi-exclamation-triangle-fill fs-1 mb-3"></i>
                    <p>Error loading order details: ${error.message}</p>
                </div>
            `;
        });
    }
}

/**
 * Display order details in the modal
 */
function displayOrderDetails(order) {
    const modalBody = document.getElementById('viewOrderModalBody');
    
    // Format order date
    const orderDate = new Date(order.order_date || order.created_at);
    const formattedOrderDate = orderDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });
    
    // Build the order details HTML
    let detailsHTML = `
        <div class="order-details">
            <div class="row mb-4">
                <div class="col-md-6">
                    <h6 class="fw-bold">Order Information</h6>
                    <table class="table table-sm table-borderless">
                        <tr>
                            <td class="text-muted">Order ID:</td>
                            <td>${order.order_id}</td>
                        </tr>
                        <tr>
                            <td class="text-muted">PO Number:</td>
                            <td>${order.po_number || 'N/A'}</td>
                        </tr>
                        <tr>
                            <td class="text-muted">Order Date:</td>
                            <td>${formattedOrderDate}</td>
                        </tr>
                        <tr>
                            <td class="text-muted">Status:</td>
                            <td><span class="badge bg-success">${order.status || 'completed'}</span></td>
                        </tr>
                        <tr>
                            <td class="text-muted">Payment Status:</td>
                            <td>
                                <span class="badge ${getPaymentStatusBadgeClass(order.payment_status)}">
                                    ${order.payment_status || 'pending'}
                                </span>
                            </td>
                        </tr>
                    </table>
                </div>
                <div class="col-md-6">
                    <h6 class="fw-bold">Retailer Information</h6>
                    <table class="table table-sm table-borderless">
                        <tr>
                            <td class="text-muted">Name:</td>
                            <td>${order.retailer_name}</td>
                        </tr>
                        <tr>
                            <td class="text-muted">Email:</td>
                            <td>${order.retailer_email}</td>
                        </tr>
                        <tr>
                            <td class="text-muted">Contact:</td>
                            <td>${order.retailer_contact || 'N/A'}</td>
                        </tr>
                        <tr>
                            <td class="text-muted">Delivery Mode:</td>
                            <td>${order.delivery_mode || 'N/A'}</td>
                        </tr>
                    </table>
                </div>
            </div>
            
            <h6 class="fw-bold mb-3">Order Items</h6>
            <div class="table-responsive">
                <table class="table table-sm table-bordered">
                    <thead class="table-light">
                        <tr>
                            <th>Product</th>
                            <th class="text-center">Quantity</th>
                            <th class="text-end">Unit Price</th>
                            <th class="text-end">Total</th>
                        </tr>
                    </thead>
                    <tbody>
    `;
    
    // Add order items
    if (order.items && order.items.length > 0) {
        order.items.forEach(item => {
            detailsHTML += `
                <tr>
                    <td>${item.product_name}</td>
                    <td class="text-center">${item.quantity}</td>
                    <td class="text-end">₱${parseFloat(item.unit_price).toFixed(2)}</td>
                    <td class="text-end">₱${parseFloat(item.total_price).toFixed(2)}</td>
                </tr>
            `;
        });
    } else {
        detailsHTML += `
            <tr>
                <td colspan="4" class="text-center">No items found for this order</td>
            </tr>
        `;
    }
    
    // Add order totals
    detailsHTML += `
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
                            <td colspan="3" class="text-end fw-bold">Total Amount:</td>
                            <td class="text-end fw-bold">₱${parseFloat(order.total_amount).toFixed(2)}</td>
                        </tr>
                    </tfoot>
                </table>
            </div>
    `;
    
    // Add consignment information if available
    if (order.consignment_term) {
        detailsHTML += `
            <div class="mt-4">
                <h6 class="fw-bold mb-3">Consignment Information</h6>
                <div class="row">
                    <div class="col-md-6">
                        <table class="table table-sm table-borderless">
                            <tr>
                                <td class="text-muted">Consignment Term:</td>
                                <td>${order.consignment_term} days</td>
                            </tr>
                            <tr>
                                <td class="text-muted">Days Since Start:</td>
                                <td>${order.days_since_start} days</td>
                            </tr>
                            <tr>
                                <td class="text-muted">Days Remaining:</td>
                                <td>${order.days_remaining} days</td>
                            </tr>
                        </table>
                    </div>
                </div>
            </div>
        `;
    }
    
    detailsHTML += `</div>`;
    
    modalBody.innerHTML = detailsHTML;
}

/**
 * Show payment confirmation modal for partial payment orders
 */
function showPaymentConfirmationModal(orderId) {
  // Find the order
  let order = completedOrders.find(o => o.order_id.toString() === orderId.toString());
  
  // If not found in completed orders, check partial payment orders
  if (!order && partialPaymentOrders.length > 0) {
      order = partialPaymentOrders.find(o => o.order_id.toString() === orderId.toString());
  }
  
  if (!order) {
      alert('Order not found');
      return;
  }
  
  // Calculate remaining amount
  const totalAmount = parseFloat(order.total_amount);
  const paidAmount = parseFloat(order.paid_amount || 0);
  const remainingAmount = totalAmount - paidAmount;
  
  // First, fetch the latest payment information for this order
  fetch('fetch_latest_payment.php', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
      },
      body: JSON.stringify({
          order_id: orderId
      })
  })
  .then(response => {
      if (!response.ok) {
          throw new Error('Network response was not ok');
      }
      return response.json();
  })
  .then(data => {
      let paymentMethod = 'N/A';
      let paymentReference = 'N/A';
      
      if (data.success && data.payment) {
          paymentMethod = data.payment.payment_method || 'N/A';
          paymentReference = data.payment.payment_reference || 'N/A';
      }
      
      // Create a modal for payment confirmation
      const modalHtml = `
          <div class="modal fade" id="paymentConfirmationModal" tabindex="-1" aria-labelledby="paymentConfirmationModalLabel" aria-hidden="true">
              <div class="modal-dialog modal-lg">
                  <div class="modal-content">
                      <div class="modal-header bg-success text-white">
                          <h5 class="modal-title" id="paymentConfirmationModalLabel">
                              <i class="bi bi-check-circle me-2"></i> Payment Confirmation
                          </h5>
                          <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                      </div>
                      <div class="modal-body">
                          <div class="alert alert-info">
                              <i class="bi bi-info-circle me-2"></i>
                              You are about to mark this order as fully paid. Please review the details below.
                          </div>
                          
                          <div class="row mb-4">
                              <div class="col-md-6">
                                  <h6 class="fw-bold">Order Information</h6>
                                  <table class="table table-sm table-borderless">
                                      <tr>
                                          <td class="text-muted">Order ID:</td>
                                          <td>${order.order_id}</td>
                                      </tr>
                                      <tr>
                                          <td class="text-muted">Retailer:</td>
                                          <td>${order.retailer_name}</td>
                                      </tr>
                                      <tr>
                                          <td class="text-muted">Total Amount:</td>
                                          <td>₱${totalAmount.toFixed(2)}</td>
                                      </tr>
                                  </table>
                              </div>
                              <div class="col-md-6">
                                  <h6 class="fw-bold">Payment Information</h6>
                                  <table class="table table-sm table-borderless">
                                      <tr>
                                          <td class="text-muted">Current Status:</td>
                                          <td><span class="badge bg-info">Partial</span></td>
                                      </tr>
                                      <tr>
                                          <td class="text-muted">Amount Paid:</td>
                                          <td>₱${paidAmount.toFixed(2)}</td>
                                      </tr>
                                      <tr>
                                          <td class="text-muted">Remaining Amount:</td>
                                          <td class="fw-bold text-danger">₱${remainingAmount.toFixed(2)}</td>
                                      </tr>
                                      <tr>
                                          <td class="text-muted">Payment Method:</td>
                                          <td>${paymentMethod}</td>
                                      </tr>
                                      <tr>
                                          <td class="text-muted">Payment Reference:</td>
                                          <td>${paymentReference}</td>
                                      </tr>
                                  </table>
                              </div>
                          </div>
                          
                          <h6 class="fw-bold mb-3">Paid Products</h6>
                          <div class="table-responsive mb-4">
                              <table class="table table-sm table-bordered">
                                  <thead class="table-light">
                                      <tr>
                                          <th>Product</th>
                                          <th class="text-center">Quantity Paid</th>
                                          <th class="text-end">Unit Price</th>
                                          <th class="text-end">Total</th>
                                      </tr>
                                  </thead>
                                  <tbody id="paidProductsTableBody">
                                      <tr>
                                          <td colspan="4" class="text-center py-3">
                                              <div class="spinner-border spinner-border-sm text-primary" role="status">
                                                  <span class="visually-hidden">Loading...</span>
                                              </div>
                                              <span class="ms-2">Loading paid products...</span>
                                          </td>
                                      </tr>
                                  </tbody>
                              </table>
                          </div>
                          
                          <h6 class="fw-bold mb-3">Remaining Unsold Products</h6>
                          <div class="table-responsive mb-4">
                              <table class="table table-sm table-bordered">
                                  <thead class="table-light">
                                      <tr>
                                          <th>Product</th>
                                          <th class="text-center">Quantity Unsold</th>
                                          <th class="text-end">Unit Price</th>
                                          <th class="text-end">Total</th>
                                      </tr>
                                  </thead>
                                  <tbody id="unsoldProductsTableBody">
                                      <tr>
                                          <td colspan="4" class="text-center py-3">
                                              <div class="spinner-border spinner-border-sm text-primary" role="status">
                                                  <span class="visually-hidden">Loading...</span>
                                              </div>
                                              <span class="ms-2">Loading unsold products...</span>
                                          </td>
                                      </tr>
                                  </tbody>
                              </table>
                          </div>
                      </div>
                      <div class="modal-footer">
                          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                          <button type="button" class="btn btn-success" id="confirmPaymentBtn">
                              <i class="bi bi-check-circle me-1"></i> Confirm Full Payment
                          </button>
                      </div>
                  </div>
              </div>
          </div>
      `;
      
      // Add the modal to the document
      const modalContainer = document.createElement('div');
      modalContainer.innerHTML = modalHtml;
      document.body.appendChild(modalContainer);
      
      // Initialize the modal
      const confirmationModal = new bootstrap.Modal(document.getElementById('paymentConfirmationModal'));
      
      // Show the modal
      confirmationModal.show();
      
      // Fetch product payment details
      fetchProductPaymentDetails(orderId);
      
      // Add event listener for the confirm button
      document.getElementById('confirmPaymentBtn').addEventListener('click', function() {
          // Update payment status to paid
          updatePaymentStatus(orderId, 'paid', confirmationModal);
      });
      
      // Remove the modal from the DOM when it's hidden
      document.getElementById('paymentConfirmationModal').addEventListener('hidden.bs.modal', function() {
          document.body.removeChild(modalContainer);
      });
  })
  .catch(error => {
      console.error('Error fetching latest payment information:', error);
      alert('Error fetching payment information: ' + error.message);
  });
}

/**
* Fetch product payment details for confirmation modal
*/
function fetchProductPaymentDetails(orderId) {
  fetch('fetch_product_payment_details.php', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
      },
      body: JSON.stringify({
          order_id: orderId
      })
  })
  .then(response => {
      if (!response.ok) {
          throw new Error('Network response was not ok');
      }
      return response.json();
  })
  .then(data => {
      if (data.success) {
          displayPaidProducts(data.paid_products);
          displayUnsoldProducts(data.unsold_products);
      } else {
          throw new Error(data.message || 'Failed to fetch product payment details');
      }
  })
  .catch(error => {
      console.error('Error fetching product payment details:', error);
      document.getElementById('paidProductsTableBody').innerHTML = `
          <tr>
              <td colspan="4" class="text-center py-3 text-danger">
                  <i class="bi bi-exclamation-triangle-fill me-2"></i>
                  Error loading paid products: ${error.message}
              </td>
          </tr>
      `;
      document.getElementById('unsoldProductsTableBody').innerHTML = `
          <tr>
              <td colspan="4" class="text-center py-3 text-danger">
                  <i class="bi bi-exclamation-triangle-fill me-2"></i>
                  Error loading unsold products: ${error.message}
              </td>
          </tr>
      `;
  });
}

/**
* Display paid products in the confirmation modal
*/
function displayPaidProducts(products) {
  const tableBody = document.getElementById('paidProductsTableBody');
  
  if (!products || products.length === 0) {
      tableBody.innerHTML = `
          <tr>
              <td colspan="4" class="text-center py-3">
                  <i class="bi bi-info-circle me-2"></i>
                  No paid products found.
              </td>
          </tr>
      `;
      return;
  }
  
  tableBody.innerHTML = '';
  let totalPaid = 0;
  
  products.forEach(product => {
      const totalPrice = parseFloat(product.unit_price) * parseInt(product.quantity_paid);
      totalPaid += totalPrice;
      
      const row = document.createElement('tr');
      row.innerHTML = `
          <td>${product.product_name}</td>
          <td class="text-center">${product.quantity_paid}</td>
          <td class="text-end">₱${parseFloat(product.unit_price).toFixed(2)}</td>
          <td class="text-end">₱${totalPrice.toFixed(2)}</td>
      `;
      
      tableBody.appendChild(row);
  });
  
  // Add total row
  const totalRow = document.createElement('tr');
  totalRow.className = 'table-light fw-bold';
  totalRow.innerHTML = `
      <td colspan="3" class="text-end">Total Paid:</td>
      <td class="text-end">₱${totalPaid.toFixed(2)}</td>
  `;
  
  tableBody.appendChild(totalRow);
}

/**
* Display unsold products in the confirmation modal
*/
function displayUnsoldProducts(products) {
  const tableBody = document.getElementById('unsoldProductsTableBody');
  
  if (!products || products.length === 0) {
      tableBody.innerHTML = `
          <tr>
              <td colspan="4" class="text-center py-3">
                  <i class="bi bi-info-circle me-2"></i>
                  No unsold products found.
              </td>
          </tr>
      `;
      return;
  }
  
  tableBody.innerHTML = '';
  let totalUnsold = 0;
  
  products.forEach(product => {
      const totalPrice = parseFloat(product.unit_price) * parseInt(product.quantity_unsold);
      totalUnsold += totalPrice;
      
      const row = document.createElement('tr');
      row.innerHTML = `
          <td>${product.product_name}</td>
          <td class="text-center">${product.quantity_unsold}</td>
          <td class="text-end">₱${parseFloat(product.unit_price).toFixed(2)}</td>
          <td class="text-end">₱${totalPrice.toFixed(2)}</td>
      `;
      
      tableBody.appendChild(row);
  });
  
  // Add total row
  const totalRow = document.createElement('tr');
  totalRow.className = 'table-light fw-bold';
  totalRow.innerHTML = `
      <td colspan="3" class="text-end">Total Remaining:</td>
      <td class="text-end">₱${totalUnsold.toFixed(2)}</td>
  `;
  
  tableBody.appendChild(totalRow);
}

/**
 * Update payment status
 */
function updatePaymentStatus(orderId, status, modal) {
    fetch('update_payment_status.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            order_id: orderId,
            payment_status: status
        })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        if (data.success) {
            // Close the confirmation modal if provided
            if (modal) {
                modal.hide();
            }

            // Show the success payment modal
            showSuccessPaymentModal();

            // Update the order in our array
            const orderIndex = completedOrders.findIndex(order => order.order_id.toString() === orderId.toString());
            if (orderIndex !== -1) {
                completedOrders[orderIndex].payment_status = status;
            }

            // Also check in partial payment orders
            const partialOrderIndex = partialPaymentOrders.findIndex(order => order.order_id.toString() === orderId.toString());
            if (partialOrderIndex !== -1) {
                partialPaymentOrders.splice(partialOrderIndex, 1);
            }

            // Refresh the display based on which tab is active
            if (document.getElementById('partial-payments-tab').classList.contains('active')) {
                displayPartialPaymentOrders(partialPaymentOrders, partialCurrentPage);
                setupPartialPagination(partialPaymentOrders.length);
                updatePartialOrdersCount(partialPaymentOrders.length);
            } else {
                const pendingPaymentOrders = completedOrders.filter(order => {
                    return order.payment_status === 'pending' || !order.payment_status;
                });
                displayCompletedOrders(pendingPaymentOrders, currentPage);
                setupPagination(pendingPaymentOrders.length);
                updateOrdersCount(pendingPaymentOrders.length);
            }

            // Close the view order modal
            const viewOrderModal = bootstrap.Modal.getInstance(document.getElementById('viewOrderModal'));
            if (viewOrderModal) {
                viewOrderModal.hide();
            }
        } else {
            throw new Error(data.message || 'Failed to update payment status');
        }
    })
    .catch(error => {
        console.error('Error updating payment status:', error);
        alert('Error updating payment status: ' + error.message);
    });
}

/**
 * Get the appropriate badge class for a payment status
 */
function getPaymentStatusBadgeClass(status) {
    switch(status) {
        case 'paid':
            return 'bg-success';
        case 'partial':
            return 'bg-info';
        case 'pending':
        default:
            return 'bg-warning text-dark';
    }
}

/**
 * Fetch payment history for an order
 */
function fetchPaymentHistory(orderId) {
  fetch('fetch_payment_history.php', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
      },
      body: JSON.stringify({
          order_id: orderId
      })
  })
  .then(response => {
      if (!response.ok) {
          throw new Error('Network response was not ok');
      }
      return response.json();
  })
  .then(data => {
      const tableBody = document.getElementById('paymentHistoryTableBody');
      
      if (data.success && data.payments && data.payments.length > 0) {
          tableBody.innerHTML = '';
          
          data.payments.forEach(payment => {
              const paymentDate = new Date(payment.created_at);
              const formattedDate = paymentDate.toLocaleString('en-US', {
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit'
              });
              
              const row = document.createElement('tr');
              row.innerHTML = `
                  <td>${payment.payment_id}</td>
                  <td>${payment.payment_method}</td>
                  <td class="text-end">₱${parseFloat(payment.payment_amount).toFixed(2)}</td>
                  <td>${payment.payment_reference || 'N/A'}</td>
                  <td>${formattedDate}</td>
                  <td>${payment.payment_notes || 'N/A'}</td>
              `;
              
              tableBody.appendChild(row);
          });
      } else {
          tableBody.innerHTML = `
              <tr>
                  <td colspan="6" class="text-center py-3">
                      <i class="bi bi-info-circle me-2"></i>
                      No payment records found for this order.
                  </td>
              </tr>
          `;
      }
  })
  .catch(error => {
      console.error('Error fetching payment history:', error);
      document.getElementById('paymentHistoryTableBody').innerHTML = `
          <tr>
              <td colspan="6" class="text-center py-3 text-danger">
                  <i class="bi bi-exclamation-triangle-fill me-2"></i>
                  Error loading payment history: ${error.message}
              </td>
          </tr>
      `;
  });
}
/**
 * Fetch pending payments for the Pending Payments tab
 */
function fetchPendingPayments() {
    const pendingPaymentsTableBody = document.getElementById('pendingPaymentsTableBody');
    
    pendingPaymentsTableBody.innerHTML = `
        <tr>
            <td colspan="5" class="text-center py-4">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
                <p class="mt-2">Loading pending payments...</p>
            </td>
        </tr>
    `;
    
    // Filter the already loaded completed orders for pending payments
    const pendingPaymentOrders = completedOrders.filter(order => {
        return order.payment_status === 'pending' || !order.payment_status;
    });
    
    if (pendingPaymentOrders.length > 0) {
        displayPendingPayments(pendingPaymentOrders);
    } else {
        // If no pending payments in our loaded data, try to fetch from server
        fetch('fetch_pending_payments.php')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            if (data.success && data.orders) {
                displayPendingPayments(data.orders);
            } else {
                throw new Error(data.message || 'No pending payments found');
            }
        })
        .catch(error => {
            console.error('Error fetching pending payments:', error);
            pendingPaymentsTableBody.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center py-4 text-danger">
                        <i class="bi bi-exclamation-triangle-fill me-2"></i>
                        Error loading pending payments: ${error.message}
                    </td>
                </tr>
            `;
        });
    }
}

/**
 * Display pending payments in the Pending Payments tab
 */
function displayPendingPayments(orders) {
    const pendingPaymentsTableBody = document.getElementById('pendingPaymentsTableBody');
    pendingPaymentsTableBody.innerHTML = '';

    if (orders.length === 0) {
        pendingPaymentsTableBody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center py-4">
                    <i class="bi bi-info-circle me-2"></i>
                    No pending payments found.
                </td>
            </tr>
        `;
        return;
    }

    orders.forEach(order => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${order.order_id}</td>
            <td>${order.retailer_name}</td>
            <td>₱${parseFloat(order.total_amount).toFixed(2)}</td>
            <td>
                <span class="badge bg-warning text-dark">
                    ${order.payment_status || 'pending'}
                </span>
            </td>
            <td>
                <div class="btn-group btn-group-sm" role="group">
                    <button type="button" class="btn btn-outline-primary view-order-btn" data-order-id="${order.order_id}">
                        <i class="bi bi-eye"></i>
                    </button>
                </div>
            </td>
        `;

        pendingPaymentsTableBody.appendChild(row);
    });

    document.querySelectorAll('#pendingPaymentsTableBody .view-order-btn').forEach(button => {
        button.addEventListener('click', function() {
            const orderId = this.getAttribute('data-order-id');
            viewOrderDetails(orderId);
        });
    });
}

/**
 * Fetch partial payment orders
 */
function fetchPartialPayments() {
    const partialPaymentsTableBody = document.getElementById('partialPaymentsTableBody');
    
    partialPaymentsTableBody.innerHTML = `
        <tr>
            <td colspan="7" class="text-center py-4">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
                <p class="mt-2">Loading partial payment orders...</p>
            </td>
        </tr>
    `;
    
    // Fetch data from the server
    fetch('fetch_partial_payments.php')
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        console.log('Fetched partial payment data:', data); // Debug log
        
        if (data.success) {
            partialPaymentOrders = data.orders || [];
            
            // Debug log
            console.log('Partial payment orders:', partialPaymentOrders);
            
            displayPartialPaymentOrders(partialPaymentOrders, partialCurrentPage);
            setupPartialPagination(partialPaymentOrders.length);
            updatePartialOrdersCount(partialPaymentOrders.length);
        } else {
            throw new Error(data.message || 'Failed to fetch partial payment orders');
        }
    })
    .catch(error => {
        console.error('Error fetching partial payment orders:', error);
        partialPaymentsTableBody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center py-4 text-danger">
                    <i class="bi bi-exclamation-triangle-fill me-2"></i>
                    Error loading orders: ${error.message}
                </td>
            </tr>
        `;
    });
}

/**
 * Display partial payment orders in the table
 */
function displayPartialPaymentOrders(orders, page) {
    const tableBody = document.getElementById('partialPaymentsTableBody');
    tableBody.innerHTML = '';
    
    if (!orders || orders.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center py-4">
                    <i class="bi bi-info-circle me-2"></i>
                    No orders with partial payments found.
                </td>
            </tr>
        `;
        return;
    }
    
    // Calculate start and end index for pagination
    const startIndex = (page - 1) * ordersPerPage;
    const endIndex = Math.min(startIndex + ordersPerPage, orders.length);
    
    // Display orders for current page
    for (let i = startIndex; i < endIndex; i++) {
        const order = orders[i];
        
        // Calculate remaining amount
        const totalAmount = parseFloat(order.total_amount);
        const paidAmount = parseFloat(order.paid_amount || 0);
        const remainingAmount = totalAmount - paidAmount;
        
        // Create table row
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${order.order_id}</td>
            <td>${order.retailer_name}</td>
            <td>₱${totalAmount.toFixed(2)}</td>
            <td>₱${paidAmount.toFixed(2)}</td>
            <td>₱${remainingAmount.toFixed(2)}</td>
            <td>
                <span class="badge bg-info">
                    ${order.payment_status}
                </span>
            </td>
            <td>
                <div class="btn-group btn-group-sm" role="group">
                    <button type="button" class="btn btn-outline-primary view-order-btn" data-order-id="${order.order_id}">
                        <i class="bi bi-eye"></i>
                    </button>
                    <button type="button" class="btn btn-outline-success mark-paid-btn" data-order-id="${order.order_id}">
                        <i class="bi bi-check-circle"></i>
                    </button>
                </div>
            </td>
        `;
        
        tableBody.appendChild(row);
    }
    
    // Add event listeners to the view order buttons
    document.querySelectorAll('#partialPaymentsTableBody .view-order-btn').forEach(button => {
        button.addEventListener('click', function() {
            const orderId = this.getAttribute('data-order-id');
            viewOrderDetails(orderId);
        });
    });
    
    // Add event listeners to the mark as paid buttons
    document.querySelectorAll('#partialPaymentsTableBody .mark-paid-btn').forEach(button => {
        button.addEventListener('click', function() {
            const orderId = this.getAttribute('data-order-id');
            showPaymentConfirmationModal(orderId);
        });
    });
}

/**
 * Setup pagination for the partial payment orders table
 */
function setupPartialPagination(totalOrders) {
    const paginationElement = document.getElementById('partialOrdersPagination');
    paginationElement.innerHTML = '';
    
    const totalPages = Math.ceil(totalOrders / ordersPerPage);
    
    if (totalPages <= 1) {
        return;
    }
    
    // Previous button
    const prevLi = document.createElement('li');
    prevLi.className = `page-item ${partialCurrentPage === 1 ? 'disabled' : ''}`;
    prevLi.innerHTML = `
        <a class="page-link" href="#" aria-label="Previous">
            <span aria-hidden="true">&laquo;</span>
        </a>
    `;
    prevLi.addEventListener('click', function(e) {
        e.preventDefault();
        if (partialCurrentPage > 1) {
            partialCurrentPage--;
            displayPartialPaymentOrders(partialPaymentOrders, partialCurrentPage);
            setupPartialPagination(partialPaymentOrders.length);
        }
    });
    paginationElement.appendChild(prevLi);
    
    // Page numbers
    const maxPagesToShow = 5;
    let startPage = Math.max(1, partialCurrentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
    
    if (endPage - startPage + 1 < maxPagesToShow) {
        startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
        const pageLi = document.createElement('li');
        pageLi.className = `page-item ${i === partialCurrentPage ? 'active' : ''}`;
        pageLi.innerHTML = `<a class="page-link" href="#">${i}</a>`;
        
        pageLi.addEventListener('click', function(e) {
            e.preventDefault();
            partialCurrentPage = i;
            displayPartialPaymentOrders(partialPaymentOrders, partialCurrentPage);
            setupPartialPagination(partialPaymentOrders.length);
        });
        
        paginationElement.appendChild(pageLi);
    }
    
    // Next button
    const nextLi = document.createElement('li');
    nextLi.className = `page-item ${partialCurrentPage === totalPages ? 'disabled' : ''}`;
    nextLi.innerHTML = `
        <a class="page-link" href="#" aria-label="Next">
            <span aria-hidden="true">&raquo;</span>
        </a>
    `;
    nextLi.addEventListener('click', function(e) {
        e.preventDefault();
        if (partialCurrentPage < totalPages) {
            partialCurrentPage++;
            displayPartialPaymentOrders(partialPaymentOrders, partialCurrentPage);
            setupPartialPagination(partialPaymentOrders.length);
        }
    });
    paginationElement.appendChild(nextLi);
}

/**
 * Update the partial orders count display
 */
function updatePartialOrdersCount(totalOrders) {
    const countElement = document.getElementById('partialOrdersCount');
    countElement.textContent = `Showing ${totalOrders} order${totalOrders !== 1 ? 's' : ''}`;
}

/**
 * Print order details
 */
function printOrderDetails() {
    const modalBody = document.getElementById('viewOrderModalBody').innerHTML;
    const printWindow = window.open('', '_blank');
    
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Order Details</title>
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/css/bootstrap.min.css" rel="stylesheet">
            <style>
                body { padding: 20px; }
                @media print {
                    .no-print { display: none; }
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="d-flex justify-content-between align-items-center mb-4">
                    <h4>Piñana Gourmet - Order Details</h4>
                    <button class="btn btn-primary no-print" onclick="window.print()">Print</button>
                </div>
                ${modalBody}
            </div>
        </body>
        </html>
    `);
    
    printWindow.document.close();
}

/**
 * Add a Bootstrap modal for successful payment
 */
function showSuccessPaymentModal() {
    const modalHtml = `
        <div class="modal fade" id="successPaymentModal" tabindex="-1" aria-labelledby="successPaymentModalLabel" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header bg-success text-white">
                        <h5 class="modal-title" id="successPaymentModalLabel">
                            <i class="bi bi-check-circle me-2"></i> Payment Successful
                        </h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body text-center">
                        <p class="mb-0">The payment has been successfully processed.</p>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-primary" data-bs-dismiss="modal">OK</button>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Add the modal to the document
    const modalContainer = document.createElement('div');
    modalContainer.innerHTML = modalHtml;
    document.body.appendChild(modalContainer);

    // Initialize and show the modal
    const successModal = new bootstrap.Modal(document.getElementById('successPaymentModal'));
    successModal.show();

    // Remove the modal from the DOM when it's hidden
    document.getElementById('successPaymentModal').addEventListener('hidden.bs.modal', function () {
        document.body.removeChild(modalContainer);
    });
}