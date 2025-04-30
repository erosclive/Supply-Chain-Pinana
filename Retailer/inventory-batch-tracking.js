// inventory-batch-tracking.js
// This file contains functions for batch tracking display in the product details modal

// Show product details modal with batch tracking information
function showProductDetailsModal(productId) {
    // Find all instances of this product in inventoryProducts
    const productInstances = inventoryProducts.filter((p) => p.product_id === productId)
  
    if (!productInstances || productInstances.length === 0) {
      showResponseMessage("danger", "Product not found")
      return
    }
  
    // Use the first instance for basic product info
    const product = productInstances[0]
  
    // Show loading modal first
    let productModal = document.getElementById("productDetailsModal")
    if (!productModal) {
      productModal = document.createElement("div")
      productModal.className = "modal fade"
      productModal.id = "productDetailsModal"
      productModal.tabIndex = "-1"
      productModal.setAttribute("aria-labelledby", "productDetailsModalLabel")
      productModal.setAttribute("aria-hidden", "true")
  
      productModal.innerHTML = `
        <div class="modal-dialog modal-dialog-centered modal-lg">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="productDetailsModalLabel">
                <i class="bi bi-box-seam me-2"></i> Product Details
              </h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body" id="productDetailsModalBody">
              <div class="text-center py-4">
                <div class="spinner-border text-primary" role="status">
                  <span class="visually-hidden">Loading...</span>
                </div>
                <p class="mt-2">Loading product details...</p>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
            </div>
          </div>
        </div>
      `
  
      document.body.appendChild(productModal)
    }
  
    // Show the modal with loading state
    try {
      if (typeof bootstrap !== "undefined") {
        const bsModal = new bootstrap.Modal(productModal)
        bsModal.show()
      } else {
        console.error("Bootstrap is not defined. Ensure it is properly loaded.")
        showResponseMessage("danger", "Bootstrap is not loaded. Please check your setup.")
        return
      }
    } catch (error) {
      console.error("Bootstrap modal error:", error)
      showResponseMessage("danger", "Failed to open product details modal. Please check console for errors.")
      return
    }
  
    // Fetch batch details for this product
    fetch(`get_batch_details.php?product_id=${productId}`)
      .then(response => response.json())
      .then(batchData => {
        // Get product image path or use placeholder
        const productImage = `uploads/product_${product.product_id}.jpg`
  
        // Determine stock status and badge color
        let stockStatusClass = "bg-success"
        let stockStatusText = "In Stock"
  
        if (product.available_stock <= 0) {
          stockStatusClass = "bg-danger"
          stockStatusText = "Out of Stock"
        } else if (product.available_stock < 5) {
          stockStatusClass = "bg-warning"
          stockStatusText = "Low Stock"
        }
  
        // Calculate total quantity across all orders
        const totalQuantity = productInstances.reduce((sum, p) => sum + Number.parseInt(p.quantity), 0)
  
        // Group by order
        const orderMap = new Map()
        productInstances.forEach((p) => {
          if (!orderMap.has(p.order_id)) {
            orderMap.set(p.order_id, {
              order_id: p.order_id,
              po_number: p.po_number || p.order_id,
              quantity: Number.parseInt(p.quantity),
              unit_price: p.unit_price,
              total_price: p.total_price,
            })
          } else {
            const order = orderMap.get(p.order_id)
            order.quantity += Number.parseInt(p.quantity)
            order.total_price = (Number.parseFloat(order.total_price) + Number.parseFloat(p.total_price)).toFixed(2)
          }
        })
  
        const orders = Array.from(orderMap.values())
  
        // Populate modal content
        const modalBody = document.getElementById("productDetailsModalBody")
        
        // Create tabs for product info, orders, and batch details
        modalBody.innerHTML = `
          <ul class="nav nav-tabs" id="productDetailsTabs" role="tablist">
            <li class="nav-item" role="presentation">
              <button class="nav-link active" id="product-info-tab" data-bs-toggle="tab" data-bs-target="#product-info" 
                      type="button" role="tab" aria-controls="product-info" aria-selected="true">
                Product Info
              </button>
            </li>
            <li class="nav-item" role="presentation">
              <button class="nav-link" id="orders-tab" data-bs-toggle="tab" data-bs-target="#orders" 
                      type="button" role="tab" aria-controls="orders" aria-selected="false">
                Orders
              </button>
            </li>
            ${batchData.batch_tracking_enabled ? `
            <li class="nav-item" role="presentation">
              <button class="nav-link" id="batch-details-tab" data-bs-toggle="tab" data-bs-target="#batch-details" 
                      type="button" role="tab" aria-controls="batch-details" aria-selected="false">
                Batch Details
              </button>
            </li>
            ` : ''}
          </ul>
          
          <div class="tab-content pt-3" id="productDetailsTabContent">
            <!-- Product Info Tab -->
            <div class="tab-pane fade show active" id="product-info" role="tabpanel" aria-labelledby="product-info-tab">
              <div class="row">
                <div class="col-md-4 text-center">
                  <img src="${productImage}" class="product-detail-image mb-3" alt="${product.product_name}" 
                       onerror="this.src='assets/placeholder-product.jpg'" style="max-width: 100%; height: auto;">
                  <span class="badge ${stockStatusClass} d-block mx-auto">${stockStatusText}</span>
                </div>
                <div class="col-md-8">
                  <h4 class="mb-3">${product.product_name}</h4>
                  
                  <div class="card mb-3">
                    <div class="card-header bg-light">
                      <h6 class="mb-0">Product Information</h6>
                    </div>
                    <div class="card-body">
                      <div class="mb-2 d-flex justify-content-between">
                        <span class="text-muted">SKU:</span>
                        <span class="fw-medium">${product.product_id}</span>
                      </div>
                      <div class="mb-2 d-flex justify-content-between">
                        <span class="text-muted">Price:</span>
                        <span class="fw-bold">${product.unit_price_formatted || `₱${Number.parseFloat(product.price).toFixed(2)}`}</span>
                      </div>
                      <div class="mb-2 d-flex justify-content-between">
                        <span class="text-muted">Category:</span>
                        <span>${product.category || "N/A"}</span>
                      </div>
                      <div class="mb-2 d-flex justify-content-between">
                        <span class="text-muted">Available Stock:</span>
                        <span class="${product.available_stock <= 0 ? "text-danger" : product.available_stock < 5 ? "text-warning" : "text-success"} fw-bold">
                          ${product.available_stock || "N/A"}
                        </span>
                      </div>
                      <div class="mb-2 d-flex justify-content-between">
                        <span class="text-muted">Total Ordered:</span>
                        <span class="fw-bold text-primary">${totalQuantity}</span>
                      </div>
                      <div class="mb-2 d-flex justify-content-between">
                        <span class="text-muted">In Orders:</span>
                        <span>${orders.length}</span>
                      </div>
                      <div class="mb-2 d-flex justify-content-between">
                        <span class="text-muted">Batch Tracking:</span>
                        <span>
                          ${batchData.batch_tracking_enabled ? 
                            `<span class="badge bg-success">Enabled</span>` : 
                            `<span class="badge bg-secondary">Disabled</span>`}
                        </span>
                      </div>
                      <div class="mb-0 d-flex justify-content-between">
                        <span class="text-muted">Status:</span>
                        <span>${product.status || "N/A"}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Orders Tab -->
            <div class="tab-pane fade" id="orders" role="tabpanel" aria-labelledby="orders-tab">
              <div class="card">
                <div class="card-header bg-light">
                  <h6 class="mb-0">Order Details</h6>
                </div>
                <div class="card-body p-0">
                  <div class="table-responsive">
                    <table class="table table-hover mb-0">
                      <thead class="table-light">
                        <tr>
                          <th>Order #</th>
                          <th>Quantity</th>
                          <th>Unit Price</th>
                          <th>Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        ${orders
                          .map(
                            (order) => `
                            <tr>
                              <td>${order.po_number}</td>
                              <td>${order.quantity}</td>
                              <td>₱${Number.parseFloat(order.unit_price).toFixed(2)}</td>
                              <td>₱${Number.parseFloat(order.total_price).toFixed(2)}</td>
                            </tr>
                          `,
                          )
                          .join("")}
                      </tbody>
                      <tfoot class="table-light">
                        <tr>
                          <td colspan="1" class="text-end fw-bold">Total:</td>
                          <td class="fw-bold">${totalQuantity}</td>
                          <td></td>
                          <td class="fw-bold">₱${orders.reduce((sum, order) => sum + Number.parseFloat(order.total_price), 0).toFixed(2)}</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              </div>
            </div>
            
            ${batchData.batch_tracking_enabled ? `
            <!-- Batch Details Tab -->
            <div class="tab-pane fade" id="batch-details" role="tabpanel" aria-labelledby="batch-details-tab">
              <div class="card">
                <div class="card-header bg-light d-flex justify-content-between align-items-center">
                  <h6 class="mb-0">Batch Details (FIFO Order)</h6>
                  <span class="badge bg-primary">${batchData.batches.length} Active Batches</span>
                </div>
                <div class="card-body p-0">
                  ${batchData.batches.length > 0 ? `
                  <div class="alert alert-info m-3">
                    <i class="bi bi-info-circle-fill me-2"></i>
                    Batches are listed in FIFO order (earliest expiration first). When inventory is deducted, it will be taken from the top batches first.
                  </div>
                  <div class="table-responsive">
                    <table class="table table-hover mb-0">
                      <thead class="table-light">
                        <tr>
                          <th>Batch Code</th>
                          <th>Quantity</th>
                          <th>Expiration Date</th>
                          <th>Manufacturing Date</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        ${batchData.batches.map(batch => {
                          // Calculate expiration status
                          const expiryDate = batch.expiration_date ? new Date(batch.expiration_date) : null;
                          const today = new Date();
                          let statusClass = 'bg-secondary';
                          let statusText = 'No Expiry';
                          
                          if (expiryDate && batch.expiration_date !== '0000-00-00') {
                            const daysUntilExpiry = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
                            
                            if (daysUntilExpiry < 0) {
                              statusClass = 'bg-danger';
                              statusText = 'Expired';
                            } else if (daysUntilExpiry <= 7) {
                              statusClass = 'bg-danger';
                              statusText = `Critical (${daysUntilExpiry} days)`;
                            } else if (daysUntilExpiry <= 30) {
                              statusClass = 'bg-warning';
                              statusText = `Warning (${daysUntilExpiry} days)`;
                            } else {
                              statusClass = 'bg-success';
                              statusText = 'Good';
                            }
                          }
                          
                          return `
                          <tr>
                            <td>${batch.batch_code}</td>
                            <td>${batch.quantity}</td>
                            <td>${formatDate(batch.expiration_date)}</td>
                            <td>${formatDate(batch.manufacturing_date)}</td>
                            <td><span class="badge ${statusClass}">${statusText}</span></td>
                          </tr>
                          `;
                        }).join('')}
                      </tbody>
                    </table>
                  </div>
                  
                  ` : `
                  <div class="alert alert-info m-3">
                    <i class="bi bi-info-circle-fill me-2"></i>
                    No active batches found for this product.
                  </div>
                  `}
                </div>
              </div>
            </div>
            ` : ''}
          </div>
        `
      })
      .catch(error => {
        console.error('Error fetching batch details:', error);
        document.getElementById("productDetailsModalBody").innerHTML = `
          <div class="alert alert-danger">
            <i class="bi bi-exclamation-triangle-fill me-2"></i>
            Error loading batch details: ${error.message || 'Unknown error'}
          </div>
          <div class="row mb-4">
            <!-- Basic product info without batch details -->
            <div class="col-md-4 text-center">
              <img src="${productImage}" class="product-detail-image mb-3" alt="${product.product_name}" 
                   onerror="this.src='assets/placeholder-product.jpg'" style="max-width: 100%; height: auto;">
              <span class="badge ${stockStatusClass} d-block mx-auto">${stockStatusText}</span>
            </div>
            <div class="col-md-8">
              <h4 class="mb-3">${product.product_name}</h4>
              <!-- Basic product info card -->
            </div>
          </div>
        `;
      });
  }
  
  // Show batch deduction history modal
  function showBatchDeductionHistoryModal(productId, productName) {
    // Create modal if it doesn't exist
    let batchHistoryModal = document.getElementById("batchDeductionHistoryModal");
    if (!batchHistoryModal) {
      batchHistoryModal = document.createElement("div");
      batchHistoryModal.className = "modal fade";
      batchHistoryModal.id = "batchDeductionHistoryModal";
      batchHistoryModal.tabIndex = "-1";
      batchHistoryModal.setAttribute("aria-labelledby", "batchDeductionHistoryModalLabel");
      batchHistoryModal.setAttribute("aria-hidden", "true");
  
      batchHistoryModal.innerHTML = `
        <div class="modal-dialog modal-dialog-centered modal-lg">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="batchDeductionHistoryModalLabel">
                <i class="bi bi-clock-history me-2"></i> Batch Deduction History
              </h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body" id="batchDeductionHistoryModalBody">
              <div class="text-center py-4">
                <div class="spinner-border text-primary" role="status">
                  <span class="visually-hidden">Loading...</span>
                </div>
                <p class="mt-2">Loading batch deduction history...</p>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
            </div>
          </div>
        </div>
      `;
  
      document.body.appendChild(batchHistoryModal);
    }
  
    // Show the modal with loading state
    try {
      if (typeof bootstrap !== "undefined") {
        const bsModal = new bootstrap.Modal(batchHistoryModal);
        bsModal.show();
      } else {
        console.error("Bootstrap is not defined. Ensure it is properly loaded.");
        showResponseMessage("danger", "Bootstrap is not loaded. Please check your setup.");
        return;
      }
    } catch (error) {
      console.error("Bootstrap modal error:", error);
      showResponseMessage("danger", "Failed to open batch history modal. Please check console for errors.");
      return;
    }
  
    // Fetch batch deduction history
    fetch(`get_batch_deduction_history.php?product_id=${productId}`)
      .then(response => response.json())
      .then(data => {
        const modalBody = document.getElementById("batchDeductionHistoryModalBody");
        
        if (data.success && data.logs.length > 0) {
          let html = `
            <h5 class="mb-3">${productName}</h5>
            <div class="alert alert-info">
              <i class="bi bi-info-circle-fill me-2"></i>
              This shows the history of batch deductions for this product, including which batches were affected when inventory was reduced.
            </div>
            <div class="batch-history-timeline">
          `;
          
          data.logs.forEach(log => {
            const date = new Date(log.created_at).toLocaleString();
            const batchDetails = log.batch_details_parsed || [];
            
            html += `
              <div class="card mb-3 batch-history-item">
                <div class="card-header bg-light py-2">
                  <div class="d-flex justify-content-between align-items-center">
                    <h6 class="mb-0">
                      <i class="bi bi-clock-history me-2"></i>
                      ${log.change_type === 'order_completion' ? 'Order Completion' : 'Inventory Change'}
                    </h6>
                    <small class="text-muted">${date}</small>
                  </div>
                </div>
                <div class="card-body">
                  <p class="mb-2">
                    <strong>Order:</strong> ${log.order_number || 'N/A'} | 
                    <strong>Quantity:</strong> ${log.quantity} | 
                    <strong>Stock Change:</strong> ${log.previous_stock} → ${log.new_stock}
                  </p>
                  <div class="table-responsive">
                    <table class="table table-sm table-bordered mb-0">
                      <thead class="table-light">
                        <tr>
                          <th>Batch Code</th>
                          <th>Expiration Date</th>
                          <th>Deducted</th>
                          <th>Remaining</th>
                        </tr>
                      </thead>
                      <tbody>
            `;
            
            if (batchDetails.length > 0) {
              batchDetails.forEach(batch => {
                html += `
                  <tr>
                    <td>${batch.batch_code}</td>
                    <td>${formatDate(batch.expiration_date)}</td>
                    <td>${batch.deducted}</td>
                    <td>${batch.remaining}</td>
                  </tr>
                `;
              });
            } else {
              html += `
                <tr>
                  <td colspan="4" class="text-center">No batch details available</td>
                </tr>
              `;
            }
            
            html += `
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            `;
          });
          
          html += `</div>`;
          modalBody.innerHTML = html;
        } else {
          modalBody.innerHTML = `
            <h5 class="mb-3">${productName}</h5>
            <div class="alert alert-info">
              <i class="bi bi-info-circle-fill me-2"></i>
              No batch deduction history found for this product.
            </div>
          `;
        }
      })
      .catch(error => {
        console.error('Error fetching batch deduction history:', error);
        document.getElementById("batchDeductionHistoryModalBody").innerHTML = `
          <div class="alert alert-danger">
            <i class="bi bi-exclamation-triangle-fill me-2"></i>
            Error loading batch deduction history: ${error.message || 'Unknown error'}
          </div>
        `;
      });
  }
  
  // Helper function to format dates
  function formatDate(dateString) {
    if (!dateString || dateString === '0000-00-00') return 'N/A';
    return new Date(dateString).toLocaleDateString();
  }