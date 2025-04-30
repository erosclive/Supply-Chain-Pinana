// FIFO Batch Tracking Enhancement for Order Completion

// Function to complete an order with FIFO batch tracking
function completeOrderWithFIFO() {
    const orderId = document.getElementById("complete-order-id").value;
  
    // Verify all items are checked
    const verifyAllCheckbox = document.getElementById("verify-all-items");
    if (!verifyAllCheckbox.checked) {
      showResponseMessage("danger", "Please verify all items before completing the order");
      return;
    }
  
    // Show loading state
    const completeBtn = document.getElementById("confirm-complete-btn");
    const originalBtnText = completeBtn.innerHTML;
    completeBtn.disabled = true;
    completeBtn.innerHTML =
      '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Processing...';
  
    // First update order status to completed
    fetch("complete_order.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        order_id: orderId,
      }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        if (data.success) {
          // Close modal
          const completeOrderModal = bootstrap.Modal.getInstance(document.getElementById("completeOrderModal"));
          completeOrderModal.hide();
  
          // Show success message with inventory details
          let message = data.message;
  
          // Add inventory update details if available
          if (data.updated_products && data.updated_products.length > 0) {
            message += "<br><br><strong>Inventory Updates:</strong><ul>";
            data.updated_products.forEach((product) => {
              message += `<li>${product.product_name}: ${product.previous_stock} → ${product.new_stock} (reduced by ${product.quantity_reduced})`;
              
              // Add batch details if available
              if (product.batch_tracking === "Yes" && product.batch_updates && product.batch_updates.length > 0) {
                message += "<ul>";
                product.batch_updates.forEach((batch) => {
                  const expiryDate = batch.expiration_date ? new Date(batch.expiration_date).toLocaleDateString() : "N/A";
                  message += `<li>Batch ${batch.batch_code}: Deducted ${batch.deducted}, Remaining: ${batch.remaining} (Expires: ${expiryDate})</li>`;
                });
                message += "</ul>";
              }
              
              message += "</li>";
            });
            message += "</ul>";
          }
  
          showResponseMessage("success", message);
  
          // Refresh orders
          fetchOrders();
        } else {
          showResponseMessage("danger", data.message || "Failed to complete order");
        }
      })
      .catch((error) => {
        // Reset button state
        completeBtn.disabled = false;
        completeBtn.innerHTML = originalBtnText;
  
        console.error("Error completing order:", error);
        showResponseMessage("danger", "Error connecting to the server. Please try again.");
      });
  }
  
  // Function to show batch details in a modal
  function showBatchDetails(batchDetails) {
    // Create modal if it doesn't exist
    let batchModal = document.getElementById("batchDetailsModal");
    
    if (!batchModal) {
      const modalHtml = `
        <div class="modal fade" id="batchDetailsModal" tabindex="-1" aria-labelledby="batchDetailsModalLabel" aria-hidden="true">
          <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title" id="batchDetailsModalLabel">Batch Deduction Details</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
              </div>
              <div class="modal-body">
                <div class="table-responsive">
                  <table class="table table-sm">
                    <thead>
                      <tr>
                        <th>Batch Code</th>
                        <th>Expiration Date</th>
                        <th>Deducted</th>
                        <th>Remaining</th>
                      </tr>
                    </thead>
                    <tbody id="batchDetailsTableBody">
                      <!-- Batch details will be populated here -->
                    </tbody>
                  </table>
                </div>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
              </div>
            </div>
          </div>
        </div>
      `;
      
      // Append modal to body
      document.body.insertAdjacentHTML('beforeend', modalHtml);
      batchModal = document.getElementById("batchDetailsModal");
    }
    
    // Populate batch details
    const tableBody = document.getElementById("batchDetailsTableBody");
    tableBody.innerHTML = "";
    
    batchDetails.forEach(batch => {
      const row = document.createElement("tr");
      
      const formatDate = (dateString) => {
        if (!dateString || dateString === '0000-00-00') return 'N/A';
        return new Date(dateString).toLocaleDateString();
      };
      
      row.innerHTML = `
        <td>${batch.batch_code}</td>
        <td>${formatDate(batch.expiration_date)}</td>
        <td>${batch.deducted}</td>
        <td>${batch.remaining}</td>
      `;
      
      tableBody.appendChild(row);
    });
    
    // Show the modal
    const batchModalInstance = new bootstrap.Modal(batchModal);
    batchModalInstance.show();
  }
  
  // Replace the existing completeOrder function with this enhanced version
  document.addEventListener('DOMContentLoaded', function() {
    // Set up the complete order listener
    const confirmCompleteBtn = document.getElementById("confirm-complete-btn");
    if (confirmCompleteBtn) {
      confirmCompleteBtn.addEventListener("click", completeOrderWithFIFO);
    }
    
    // Set up batch details viewers for inventory log
    document.querySelectorAll('.view-batch-details').forEach(button => {
      button.addEventListener('click', function() {
        const batchDetails = JSON.parse(this.getAttribute('data-batch-details'));
        showBatchDetails(batchDetails);
      });
    });
  });