// Update the inventory.js file to include the payment modal functionality

// Declare variables that are used but not defined in this snippet
const completedOrders = []
const showResponseMessage = (type, message) => {
  console.log(`${type}: ${message}`)
}
const bootstrap = window.bootstrap // Assuming bootstrap is a global object
const fetchCompletedOrders = () => {
  console.log("fetchCompletedOrders called")
}
let showPaymentModal // Declaration of showPaymentModal

document.addEventListener("DOMContentLoaded", () => {
  // Existing code...

  // Load the payment modal functionality
  const script = document.createElement("script")
  script.src = "payment-modal.js"
  script.onload = () => {
    // Check if showPaymentModal is defined after the script is loaded
    if (typeof window.showPaymentModal === "function") {
      showPaymentModal = window.showPaymentModal
    } else {
      console.warn("payment-modal.js did not define showPaymentModal function.")
    }
  }
  script.onerror = () => {
    console.error("Failed to load payment-modal.js")
  }
  document.head.appendChild(script)
})

// Update the showPayNowModal function to use the new payment modal
function showPayNowModal(orderId) {
  // If the new payment modal functionality is loaded, use it
  if (typeof showPaymentModal === "function") {
    showPaymentModal(orderId)
  } else {
    // Fallback to the old implementation
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
            <div class="modal-body" id="payNowModalBody">
              <div class="table-responsive">
                <table class="table table-hover">
                  <thead class="table-light">
                    <tr>
                      <th>#</th>
                      <th>Product</th>
                      <th>Quantity</th>
                      <th>Unit Price</th>
                      <th>Total</th>
                      <th>Pay Quantity</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${order.items
                      .map(
                        (item, index) => `
                          <tr>
                            <td>${index + 1}</td>
                            <td>${item.product_name || "Unknown Product"}</td>
                            <td>${item.quantity}</td>
                            <td>₱${Number.parseFloat(item.unit_price).toFixed(2)}</td>
                            <td>₱${Number.parseFloat(item.total_price || item.quantity * item.unit_price).toFixed(2)}</td>
                            <td>
                              <input type="number" class="form-control pay-quantity-input" data-product-id="${item.product_id}" min="0" max="${item.quantity}" value="${item.quantity}">
                            </td>
                          </tr>
                        `,
                      )
                      .join("")}
                  </tbody>
                  <tfoot class="table-light">
                    <tr>
                      <td colspan="4" class="text-end fw-bold">Total:</td>
                      <td class="fw-bold">₱${Number.parseFloat(order.total_amount).toFixed(2)}</td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
            <div class="modal-footer">
              <div class="me-auto">
                <label for="paymentMethod" class="form-label">Payment Method:</label>
                <select id="paymentMethod" class="form-select">
                  <option value="cash">Cash</option>
                  <option value="mobile">Mobile Payment</option>
                </select>
              </div>
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
              <button type="button" class="btn btn-success" id="proceedToPaymentBtn">Proceed to Payment</button>
            </div>
          </div>
        </div>
      `

      document.body.appendChild(payNowModal)
    }

    // Populate modal content
    const modalBody = document.getElementById("payNowModalBody")
    modalBody.innerHTML = `
      <div class="table-responsive">
        <table class="table table-hover">
          <thead class="table-light">
            <tr>
              <th>#</th>
              <th>Product</th>
              <th>Quantity</th>
              <th>Unit Price</th>
              <th>Total</th>
              <th>Pay Quantity</th>
            </tr>
          </thead>
          <tbody>
            ${order.items
              .map(
                (item, index) => `
                  <tr>
                    <td>${index + 1}</td>
                    <td>${item.product_name || "Unknown Product"}</td>
                    <td>${item.quantity}</td>
                    <td>₱${Number.parseFloat(item.unit_price).toFixed(2)}</td>
                    <td>₱${Number.parseFloat(item.total_price || item.quantity * item.unit_price).toFixed(2)}</td>
                    <td>
                      <input type="number" class="form-control pay-quantity-input" data-product-id="${item.product_id}" min="0" max="${item.quantity}" value="${item.quantity}">
                    </td>
                  </tr>
                `,
              )
              .join("")}
          </tbody>
          <tfoot class="table-light">
            <tr>
              <td colspan="4" class="text-end fw-bold">Total:</td>
              <td class="fw-bold">₱${Number.parseFloat(order.total_amount).toFixed(2)}</td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>
    `

    // Add event listener for the "Proceed to Payment" button
    const proceedToPaymentBtn = document.getElementById("proceedToPaymentBtn")
    proceedToPaymentBtn.addEventListener("click", () => {
      const paymentMethod = document.getElementById("paymentMethod").value
      const payQuantities = Array.from(document.querySelectorAll(".pay-quantity-input")).map((input) => ({
        productId: input.getAttribute("data-product-id"),
        quantity: Number.parseInt(input.value, 10),
      }))

      processPayment(order.order_id, paymentMethod, payQuantities, order.total_amount)
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
}

// Function to process payment
function processPayment(orderId, paymentMethod, payQuantities, totalAmount) {
  // Create form data for the AJAX request
  const formData = new FormData()
  formData.append("order_id", orderId)
  formData.append("payment_method", paymentMethod)
  formData.append("payment_amount", totalAmount)
  formData.append("items", JSON.stringify(payQuantities))

  // Show loading message
  showResponseMessage("info", "Processing payment...")

  // Send AJAX request to process payment
  fetch("process-payment.php", {
    method: "POST",
    body: formData,
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        // Show success message
        showResponseMessage("success", "Payment processed successfully!")

        // Close the modal
        const payNowModal = bootstrap.Modal.getInstance(document.getElementById("payNowModal"))
        payNowModal.hide()

        // Refresh the consignment inventory
        fetchCompletedOrders()
      } else {
        // Show error message
        showResponseMessage("danger", "Payment processing failed: " + data.message)
      }
    })
    .catch((error) => {
      console.error("Payment processing error:", error)
      showResponseMessage("danger", "An error occurred while processing the payment. Please try again.")
    })
}
