// order_completion.js

// Function to complete an order
function completeOrder(orderId) {
    // Show loading state
    const completeBtn = document.getElementById("complete-btn-" + orderId);
    if (completeBtn) {
        const originalBtnText = completeBtn.innerHTML;
        completeBtn.disabled = true;
        completeBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Processing...';
    }
    
    // Send request to complete order
    fetch('complete_order.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            order_id: orderId
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Show success message
            showNotification('success', data.message);
            
            // Show batch deduction details if available
            if (data.updated_products && data.updated_products.length > 0) {
                showBatchDeductionDetails(data.updated_products);
            }
            
            // Refresh orders list or update UI
            setTimeout(() => {
                window.location.reload();
            }, 2000);
        } else {
            // Show error message
            showNotification('danger', data.message);
            
            // Reset button state
            if (completeBtn) {
                completeBtn.disabled = false;
                completeBtn.innerHTML = originalBtnText;
            }
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showNotification('danger', 'An error occurred while processing your request');
        
        // Reset button state
        if (completeBtn) {
            completeBtn.disabled = false;
            completeBtn.innerHTML = originalBtnText;
        }
    });
}

// Function to show batch deduction details
function showBatchDeductionDetails(products) {
    // Create modal HTML
    let modalHtml = `
    <div class="modal fade" id="batchDeductionModal" tabindex="-1" aria-labelledby="batchDeductionModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="batchDeductionModalLabel">Inventory Update Details</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <div class="alert alert-success">
                        <i class="bi bi-check-circle-fill me-2"></i>
                        Order completed successfully and inventory has been updated.
                    </div>
                    <div class="table-responsive">
                        <table class="table table-bordered">
                            <thead>
                                <tr>
                                    <th>Product</th>
                                    <th>Previous Stock</th>
                                    <th>New Stock</th>
                                    <th>Quantity Reduced</th>
                                    <th>Batch Tracking</th>
                                    <th>Details</th>
                                </tr>
                            </thead>
                            <tbody>`;
    
    // Add product rows
    products.forEach(product => {
        modalHtml += `
            <tr>
                <td>${product.product_name}</td>
                <td>${product.previous_stock}</td>
                <td>${product.new_stock}</td>
                <td>${product.quantity_reduced}</td>
                <td>${product.batch_tracking}</td>
                <td>`;
        
        // Add batch details if available
        if (product.batch_tracking === "Yes" && product.batch_updates && product.batch_updates.length > 0) {
            modalHtml += `
                <button type="button" class="btn btn-sm btn-outline-primary view-batch-details" 
                        data-batch-details='${JSON.stringify(product.batch_updates)}'>
                    View Batch Details
                </button>`;
        } else {
            modalHtml += `<span class="text-muted">N/A</span>`;
        }
        
        modalHtml += `</td>
            </tr>`;
    });
    
    modalHtml += `
                            </tbody>
                        </table>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                </div>
            </div>
        </div>
    </div>`;
    
    // Add modal to body
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    
    // Show the modal
    const batchDeductionModal = new bootstrap.Modal(document.getElementById('batchDeductionModal'));
    batchDeductionModal.show();
    
    // Add event listeners for batch detail buttons
    document.querySelectorAll('.view-batch-details').forEach(button => {
        button.addEventListener('click', function() {
            const batchDetails = JSON.parse(this.getAttribute('data-batch-details'));
            showBatchDetails(batchDetails);
        });
    });
    
    // Remove modal from DOM when hidden
    document.getElementById('batchDeductionModal').addEventListener('hidden.bs.modal', function() {
        this.remove();
    });
}

// Function to show batch details in a modal
function showBatchDetails(batchDetails) {
    // Create modal HTML
    let modalHtml = `
    <div class="modal fade" id="batchDetailsModal" tabindex="-1" aria-labelledby="batchDetailsModalLabel" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="batchDetailsModalLabel">Batch Deduction Details</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <div class="alert alert-info">
                        <i class="bi bi-info-circle-fill me-2"></i>
                        Batches are deducted in FIFO order (earliest expiration date first).
                    </div>
                    <div class="table-responsive">
                        <table class="table table-sm table-bordered">
                            <thead>
                                <tr>
                                    <th>Batch Code</th>
                                    <th>Expiration Date</th>
                                    <th>Deducted</th>
                                    <th>Remaining</th>
                                </tr>
                            </thead>
                            <tbody>`;
    
    // Add batch rows
    batchDetails.forEach(batch => {
        const expiryDate = batch.expiration_date ? new Date(batch.expiration_date).toLocaleDateString() : 'N/A';
        
        modalHtml += `
            <tr>
                <td>${batch.batch_code}</td>
                <td>${expiryDate}</td>
                <td>${batch.deducted}</td>
                <td>${batch.remaining}</td>
            </tr>`;
    });
    
    modalHtml += `
                            </tbody>
                        </table>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                </div>
            </div>
        </div>
    </div>`;
    
    // Add modal to body
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    
    // Show the modal
    const batchDetailsModal = new bootstrap.Modal(document.getElementById('batchDetailsModal'));
    batchDetailsModal.show();
    
    // Remove modal from DOM when hidden
    document.getElementById('batchDetailsModal').addEventListener('hidden.bs.modal', function() {
        this.remove();
    });
}

// Function to show notification
function showNotification(type, message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `alert alert-${type} alert-dismissible fade show notification-toast`;
    notification.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    
    // Add to notification container or body
    const container = document.querySelector('.notification-container') || document.body;
    container.appendChild(notification);
    
    // Auto-dismiss after 5 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 5000);
}

// Add event listeners when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Add click event listeners to complete order buttons
    document.querySelectorAll('[data-action="complete-order"]').forEach(button => {
        button.addEventListener('click', function() {
            const orderId = this.getAttribute('data-order-id');
            if (orderId) {
                if (confirm('Are you sure you want to complete this order? This will update inventory.')) {
                    completeOrder(orderId);
                }
            }
        });
    });
});