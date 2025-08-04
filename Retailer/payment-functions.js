// Payment processing functions for inventory.js

// Declare the variables
const completedOrders = []
const showResponseMessage = (type, message) => {
  console.log(`${type}: ${message}`)
}
const bootstrap = window.bootstrap
const fetchCompletedOrders = () => {
  console.log("Fetching completed orders...")
}

// Show the "Pay Now" modal
function showPayNowModal(orderId) {
  // Find the order in completedOrders
  const order = completedOrders.find((o) => o.order_id == orderId)

  if (!order) {
    showResponseMessage("danger", "Order not found")
    return
  }

  // Create modal if it doesn't exist
  let payNowModal = document.getElementById("payNowModal")
  if (!payNowModal) {
    payNowModal = document.createElement("div")
    payNowModal.className = "modal fade"
    payNowModal.id = "payNowModal"
    payNowModal.tabIndex = "-1"
    payNowModal.setAttribute("aria-labelledby", "payNowModalLabel")
    payNowModal.setAttribute("aria-hidden", "true")

    payNowModal.innerHTML = `
      <div class="modal-dialog modal-dialog-centered modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="payNowModalLabel">
              <i class="bi bi-cash-coin me-2"></i> Pay for Order #${order.order_id}
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <div class="row mb-4">
              <div class="col-md-6">
                <div class="card">
                  <div class="card-header bg-light">
                    <h6 class="mb-0">Payment Method</h6>
                  </div>
                  <div class="card-body">
                    <div class="payment-methods">
                      <div class="form-check mb-3">
                        <input class="form-check-input" type="radio" name="paymentMethod" id="cashPayment" value="cash" checked>
                        <label class="form-check-label" for="cashPayment">
                          <i class="bi bi-cash me-2"></i> Cash Payment
                        </label>
                      </div>
                      <div class="form-check">
                        <input class="form-check-input" type="radio" name="paymentMethod" id="mobilePayment" value="mobile">
                        <label class="form-check-label" for="mobilePayment">
                          <i class="bi bi-phone me-2"></i> Mobile Payment
                        </label>
                      </div>
                    </div>
                    
                    <!-- Cash Payment Form (default) -->
                    <div id="cashPaymentForm" class="payment-form mt-4">
                      <div class="mb-3">
                        <label for="cashAmount" class="form-label">Cash Amount</label>
                        <div class="input-group">
                          <span class="input-group-text">₱</span>
                          <input type="number" class="form-control" id="cashAmount" step="0.01" min="0" value="${Number.parseFloat(order.total_amount).toFixed(2)}">
                        </div>
                      </div>
                      <div class="mb-3">
                        <label for="cashNotes" class="form-label">Notes (Optional)</label>
                        <textarea class="form-control" id="cashNotes" rows="2"></textarea>
                      </div>
                    </div>
                    
                    <!-- Mobile Payment Form (hidden by default) -->
                    <div id="mobilePaymentForm" class="payment-form mt-4" style="display: none;">
                      <div class="mb-3">
                        <label for="mobileProvider" class="form-label">Mobile Provider</label>
                        <select class="form-select" id="mobileProvider">
                          <option value="gcash">GCash</option>
                          <option value="paymaya">PayMaya</option>
                          <option value="grabpay">GrabPay</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                      <div class="mb-3">
                        <label for="mobileAmount" class="form-label">Payment Amount</label>
                        <div class="input-group">
                          <span class="input-group-text">₱</span>
                          <input type="number" class="form-control" id="mobileAmount" step="0.01" min="0" value="${Number.parseFloat(order.total_amount).toFixed(2)}">
                        </div>
                      </div>
                      <div class="mb-3">
                        <label for="mobileReference" class="form-label">Reference Number</label>
                        <input type="text" class="form-control" id="mobileReference">
                      </div>
                      <div class="mb-3">
                        <label for="mobileNotes" class="form-label">Notes (Optional)</label>
                        <textarea class="form-control" id="mobileNotes" rows="2"></textarea>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="col-md-6">
                <div class="card">
                  <div class="card-header bg-light">
                    <h6 class="mb-0">Order Summary</h6>
                  </div>
                  <div class="card-body">
                    <div class="mb-2 d-flex justify-content-between">
                      <span class="text-muted">Order #:</span>
                      <span class="fw-bold">${order.po_number || order.order_id}</span>
                    </div>
                    <div class="mb-2 d-flex justify-content-between">
                      <span class="text-muted">Date:</span>
                      <span>${new Date(order.created_at).toLocaleDateString()}</span>
                    </div>
                    <div class="mb-2 d-flex justify-content-between">
                      <span class="text-muted">Items:</span>
                      <span>${order.items ? order.items.length : 0}</span>
                    </div>
                    <div class="mb-2 d-flex justify-content-between">
                      <span class="text-muted">Subtotal:</span>
                      <span>₱${Number.parseFloat(order.subtotal || order.total_amount).toFixed(2)}</span>
                    </div>
                    <div class="mb-2 d-flex justify-content-between">
                      <span class="text-muted">Discount:</span>
                      <span>₱${Number.parseFloat(order.discount || 0).toFixed(2)}</span>
                    </div>
                    <hr>
                    <div class="mb-0 d-flex justify-content-between">
                      <span class="fw-bold">Total:</span>
                      <span class="fw-bold">₱${Number.parseFloat(order.total_amount).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="card">
              <div class="card-header bg-light">
                <h6 class="mb-0">Order Items</h6>
              </div>
              <div class="card-body p-0">
                <div class="table-responsive">
                  <table class="table table-hover mb-0">
                    <thead class="table-light">
                      <tr>
                        <th>#</th>
                        <th>Product</th>
                        <th>Quantity</th>
                        <th>Unit Price</th>
                        <th>Total</th>
                      </tr>
                    </thead>
                    <tbody id="payment-items-table">
                      ${order.items
                        .map(
                          (item, index) => `
                            <tr>
                              <td>${index + 1}</td>
                              <td>${item.product_name || "Unknown Product"}</td>
                              <td>${item.quantity}</td>
                              <td>₱${Number.parseFloat(item.unit_price).toFixed(2)}</td>
                              <td>₱${Number.parseFloat(item.total_price || item.quantity * item.unit_price).toFixed(2)}</td>
                            </tr>
                          `,
                        )
                        .join("")}
                    </tbody>
                    <tfoot class="table-light">
                      <tr>
                        <td colspan="4" class="text-end fw-bold">Total:</td>
                        <td class="fw-bold">₱${Number.parseFloat(order.total_amount).toFixed(2)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
            <button type="button" class="btn btn-success" id="processPaymentBtn">
              <i class="bi bi-check-circle me-1"></i> Process Payment
            </button>
          </div>
        </div>
      </div>
    `

    document.body.appendChild(payNowModal)

    // Set up event listeners for payment method switching
    setupPaymentMethodListeners()
  }

  // Add event listener for the "Process Payment" button
  const processPaymentBtn = document.getElementById("processPaymentBtn")
  processPaymentBtn.addEventListener("click", () => {
    processPaymentForOrder(order)
  })

  // Show the modal
  try {
    if (typeof bootstrap !== "undefined") {
      const bsModal = new bootstrap.Modal(payNowModal)
      bsModal.show()
    } else {
      console.error("Bootstrap is not defined. Ensure it is properly loaded.")
      showResponseMessage("danger", "Bootstrap is not loaded. Please check your setup.")
    }
  } catch (error) {
    console.error("Bootstrap modal error:", error)
    showResponseMessage("danger", "Failed to open Pay Now modal. Please check console for errors.")
  }
}

// Set up event listeners for payment method switching
function setupPaymentMethodListeners() {
  const cashPayment = document.getElementById("cashPayment")
  const mobilePayment = document.getElementById("mobilePayment")
  const cashPaymentForm = document.getElementById("cashPaymentForm")
  const mobilePaymentForm = document.getElementById("mobilePaymentForm")

  cashPayment.addEventListener("change", function () {
    if (this.checked) {
      cashPaymentForm.style.display = "block"
      mobilePaymentForm.style.display = "none"
    }
  })

  mobilePayment.addEventListener("change", function () {
    if (this.checked) {
      cashPaymentForm.style.display = "none"
      mobilePaymentForm.style.display = "block"
    }
  })
}

// Process payment for an order
function processPaymentForOrder(order) {
  // Get selected payment method
  const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked').value

  // Get payment details based on method
  let paymentAmount, paymentReference, paymentNotes

  if (paymentMethod === "cash") {
    paymentAmount = Number.parseFloat(document.getElementById("cashAmount").value)
    paymentReference = ""
    paymentNotes = document.getElementById("cashNotes").value
  } else if (paymentMethod === "mobile") {
    paymentAmount = Number.parseFloat(document.getElementById("mobileAmount").value)
    const provider = document.getElementById("mobileProvider").value
    paymentReference = document.getElementById("mobileReference").value
    paymentNotes = `Provider: ${provider}\n${document.getElementById("mobileNotes").value}`
  }

  // Validate payment amount
  if (isNaN(paymentAmount) || paymentAmount <= 0) {
    showResponseMessage("danger", "Please enter a valid payment amount")
    return
  }

  // For mobile payment, validate reference number
  if (paymentMethod === "mobile" && !paymentReference.trim()) {
    showResponseMessage("danger", "Please enter a reference number for mobile payment")
    return
  }

  // Get all items from the order for payment
  const payQuantities = order.items.map((item) => ({
    productId: item.product_id,
    quantity: Number.parseInt(item.quantity),
  }))

  // Disable the process payment button and show loading state
  const processPaymentBtn = document.getElementById("processPaymentBtn")
  const originalBtnText = processPaymentBtn.innerHTML
  processPaymentBtn.disabled = true
  processPaymentBtn.innerHTML = `
    <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
    Processing...
  `

  // Prepare data for the request
  const paymentData = {
    orderId: order.order_id,
    paymentMethod: paymentMethod,
    totalPaymentAmount: paymentAmount,
    paymentReference: paymentReference,
    paymentNotes: paymentNotes,
    payQuantities: payQuantities,
  }

  // Send request to process payment
  fetch("process_payment.php", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(paymentData),
  })
    .then((response) => response.json())
    .then((data) => {
      // Re-enable the button
      processPaymentBtn.disabled = false
      processPaymentBtn.innerHTML = originalBtnText

      if (data.success) {
        // Show success message
        showResponseMessage("success", data.message)

        // Close the modal
        try {
          const paymentModalElement = document.getElementById("payNowModal")
          if (paymentModalElement) {
            const paymentModal = bootstrap.Modal.getInstance(paymentModalElement)
            if (paymentModal) {
              paymentModal.hide()
            }
          }
        } catch (error) {
          console.error("Error closing modal:", error)
        }

        // Refresh the consignment inventory
        fetchCompletedOrders()
      } else {
        // Show error message
        showResponseMessage("danger", data.message)
      }
    })
    .catch((error) => {
      // Re-enable the button
      processPaymentBtn.disabled = false
      processPaymentBtn.innerHTML = originalBtnText

      console.error("Payment processing error:", error)
      showResponseMessage("danger", "An error occurred while processing the payment. Please try again.")
    })
}
