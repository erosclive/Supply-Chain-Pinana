// Function to load retailer orders
function loadRetailerOrders(page = 1, limit = 10, status = 'all', search = '') {
    // Show loading indicator
    const tableBody = document.getElementById('orders-table-body');
    if (tableBody) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="8" class="text-center py-4">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                    <p class="mt-2">Loading retailer orders...</p>
                </td>
            </tr>
        `;
    }

    // Build query string
    let queryString = `fetch_retailer_orders.php?page=${page}&limit=${limit}&status=${status}`;
    if (search) {
        queryString += `&search=${encodeURIComponent(search)}`;
    }

    // Fetch retailer orders
    fetch(queryString)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                displayRetailerOrders(data.orders);
                updatePagination(page, data.total_pages, loadRetailerOrders);
                
                // Update order count text
                const orderCountElement = document.getElementById('orderCount');
                if (orderCountElement) {
                    orderCountElement.textContent = `Showing ${data.orders.length} of ${data.total_count} retailer orders`;
                }
            } else {
                showAlert('danger', 'Failed to load retailer orders');
                if (tableBody) {
                    tableBody.innerHTML = `
                        <tr>
                            <td colspan="8" class="text-center py-4">
                                <div class="text-danger">
                                    <i class="bi bi-exclamation-triangle-fill fs-1 mb-3"></i>
                                    <p>Error loading retailer orders. Please try again.</p>
                                </div>
                            </td>
                        </tr>
                    `;
                }
            }
        })
        .catch(error => {
            console.error('Error loading retailer orders:', error);
            showAlert('danger', 'Error loading retailer orders. Please try again.');
            if (tableBody) {
                tableBody.innerHTML = `
                    <tr>
                        <td colspan="8" class="text-center py-4">
                            <div class="text-danger">
                                <i class="bi bi-exclamation-triangle-fill fs-1 mb-3"></i>
                                <p>Error loading retailer orders. Please try again.</p>
                            </div>
                        </td>
                    </tr>
                `;
            }
        });
}

// Function to display retailer orders in the table
function displayRetailerOrders(orders) {
    const tableBody = document.getElementById('orders-table-body');
    if (!tableBody) return;

    if (!orders || orders.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="8" class="text-center py-5">
                    <i class="bi bi-inbox fs-1 text-muted mb-3"></i>
                    <p class="text-muted">No retailer orders found</p>
                </td>
            </tr>
        `;
        return;
    }

    let html = '';

    orders.forEach(order => {
        // Format date
        const orderDate = new Date(order.order_date);
        const formattedDate = orderDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });

        // Status badge class
        let statusClass = '';
        switch (order.status) {
            case 'order':
                statusClass = 'bg-warning text-dark';
                break;
            case 'confirmed':
                statusClass = 'bg-success';
                break;
            default:
                statusClass = 'bg-secondary';
        }

        html += `
            <tr>
                <td>
                    <span class="fw-medium">${order.order_id}</span>
                </td>
                <td>
                    <span class="fw-medium">${order.po_number || 'N/A'}</span>
                </td>
                <td>
                    <div class="fw-medium">${order.retailer_name}</div>
                    <div class="small text-muted">${order.retailer_email || 'No email'}</div>
                </td>
                <td>
                    <div>${formattedDate}</div>
                    <div class="small text-muted">${order.expected_delivery ? `Expected: ${new Date(order.expected_delivery).toLocaleDateString()}` : ''}</div>
                </td>
                <td>${order.item_count} item${order.item_count !== 1 ? 's' : ''}</td>
                <td class="fw-bold">₱${parseFloat(order.total_amount).toFixed(2)}</td>
                <td>
                    <span class="badge ${statusClass}">${order.status.charAt(0).toUpperCase() + order.status.slice(1)}</span>
                </td>
                <td>
                    <div class="btn-group">
                        <button type="button" class="btn btn-sm btn-outline-primary view-order-btn" data-id="${order.order_id}">
                            <i class="bi bi-eye"></i>
                        </button>
                        <button type="button" class="btn btn-sm btn-outline-secondary edit-order-btn" data-id="${order.order_id}">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button type="button" class="btn btn-sm btn-outline-danger delete-order-btn" data-id="${order.order_id}">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    });

    tableBody.innerHTML = html;

    // Add event listeners to action buttons
    document.querySelectorAll('.view-order-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const orderId = this.getAttribute('data-id');
            viewRetailerOrder(orderId);
        });
    });

    document.querySelectorAll('.edit-order-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const orderId = this.getAttribute('data-id');
            editRetailerOrder(orderId);
        });
    });

    document.querySelectorAll('.delete-order-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const orderId = this.getAttribute('data-id');
            confirmDeleteRetailerOrder(orderId);
        });
    });
}

// Function to update pagination
function updatePagination(currentPage, totalPages, loadFunction) {
    const pagination = document.getElementById('ordersPagination');
    if (!pagination) return;

    pagination.innerHTML = '';

    if (totalPages <= 1) {
        return;
    }

    // Previous button
    const prevLi = document.createElement('li');
    prevLi.className = `page-item ${currentPage === 1 ? 'disabled' : ''}`;
    prevLi.innerHTML = `<a class="page-link" href="#" aria-label="Previous"><span aria-hidden="true">&laquo;</span></a>`;
    pagination.appendChild(prevLi);

    if (currentPage > 1) {
        prevLi.addEventListener('click', e => {
            e.preventDefault();
            loadFunction(currentPage - 1);
        });
    }

    // Page numbers
    const maxPages = 5; // Maximum number of page links to show
    let startPage = Math.max(1, currentPage - Math.floor(maxPages / 2));
    const endPage = Math.min(totalPages, startPage + maxPages - 1);

    if (endPage - startPage + 1 < maxPages) {
        startPage = Math.max(1, endPage - maxPages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
        const pageLi = document.createElement('li');
        pageLi.className = `page-item ${i === currentPage ? 'active' : ''}`;
        pageLi.innerHTML = `<a class="page-link" href="#">${i}</a>`;

        pageLi.addEventListener('click', e => {
            e.preventDefault();
            loadFunction(i);
        });

        pagination.appendChild(pageLi);
    }

    // Next button
    const nextLi = document.createElement('li');
    nextLi.className = `page-item ${currentPage === totalPages ? 'disabled' : ''}`;
    nextLi.innerHTML = `<a class="page-link" href="#" aria-label="Next"><span aria-hidden="true">&raquo;</span></a>`;
    pagination.appendChild(nextLi);

    if (currentPage < totalPages) {
        nextLi.addEventListener('click', e => {
            e.preventDefault();
            loadFunction(currentPage + 1);
        });
    }
}

// Function to view retailer order details
function viewRetailerOrder(orderId) {
    // Implement this function based on your existing view order functionality
    alert(`View retailer order ${orderId}`);
    // You would typically fetch order details and show them in a modal
}

// Function to edit retailer order
function editRetailerOrder(orderId) {
    // Implement this function based on your existing edit order functionality
    alert(`Edit retailer order ${orderId}`);
    // You would typically fetch order details and populate a form
}

// Function to confirm delete retailer order
function confirmDeleteRetailerOrder(orderId) {
    // Implement this function based on your existing delete confirmation functionality
    if (confirm(`Are you sure you want to delete retailer order ${orderId}?`)) {
        deleteRetailerOrder(orderId);
    }
}

// Function to delete retailer order
function deleteRetailerOrder(orderId) {
    // Implement this function based on your existing delete order functionality
    alert(`Delete retailer order ${orderId}`);
    // You would typically send a delete request to the server
}

// Function to show alert message
function showAlert(type, message) {
    // Create alert element
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show position-fixed top-0 end-0 m-3`;
    alertDiv.setAttribute('role', 'alert');
    alertDiv.style.zIndex = '9999';
    alertDiv.style.maxWidth = '350px';
    alertDiv.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';

    // Alert content
    let icon = 'bi-info-circle-fill';
    if (type === 'success') icon = 'bi-check-circle-fill';
    if (type === 'danger') icon = 'bi-exclamation-circle-fill';
    if (type === 'warning') icon = 'bi-exclamation-triangle-fill';

    alertDiv.innerHTML = `
        <div class="d-flex align-items-center">
            <i class="bi ${icon} me-2"></i>
            <div>${message}</div>
        </div>
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;

    // Add to document
    document.body.appendChild(alertDiv);

    // Auto-dismiss after 3 seconds
    setTimeout(() => {
        alertDiv.classList.remove('show');
        setTimeout(() => alertDiv.remove(), 150);
    }, 3000);
}

// Call this function when the page loads or when the retailer orders tab is clicked
document.addEventListener('DOMContentLoaded', function() {
    // Check if we're on the orders page
    if (document.getElementById('orders-table-body')) {
        // Add tab functionality if needed
        const retailerOrdersTab = document.getElementById('retailerOrdersTab');
        if (retailerOrdersTab) {
            retailerOrdersTab.addEventListener('click', function(e) {
                e.preventDefault();
                loadRetailerOrders();
            });
        } else {
            // If there's no tab, just load retailer orders directly
            loadRetailerOrders();
        }
    }
});