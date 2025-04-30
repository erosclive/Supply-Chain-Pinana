// Add this function to your existing retail_orders.js file

// Function to complete an order and update inventory
function completeOrder() {
    const orderId = document.getElementById("complete-order-id").value
  
    // Verify all items are checked
    const verifyAllCheckbox = document.getElementById("verify-all-items")
    if (!verifyAllCheckbox.checked) {
      showResponseMessage("danger", "Please verify all items before completing the order")
      return
    }
  
    // Show loading state
    const completeBtn = document.getElementById("confirm-complete-btn")
    const originalBtnText = completeBtn.innerHTML
    completeBtn.disabled = true
    completeBtn.innerHTML =
      '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Processing...'
  
    // Send request to complete order and update inventory
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
          throw new Error("Network response was not ok")
        }
        return response.json()
      })
      .then((data) => {
        // Reset button state
        completeBtn.disabled = false
        completeBtn.innerHTML = originalBtnText
  
        if (data.success) {
          // Close modal
          const completeOrderModal = bootstrap.Modal.getInstance(document.getElementById("completeOrderModal"))
          completeOrderModal.hide()
  
          // Show success message with inventory details
          let message = data.message
  
          // Add inventory update details if available
          if (data.updated_products && data.updated_products.length > 0) {
            message += "<br><br><strong>Inventory Updates:</strong><ul>"
            data.updated_products.forEach((product) => {
              message += `<li>Product ${product.product_id}: ${product.previous_stock} → ${product.new_stock} (reduced by ${product.quantity_reduced})</li>`
            })
            message += "</ul>"
          }
  
          showResponseMessage("success", message)
  
          // Refresh orders
          fetchOrders()
        } else {
          showResponseMessage("danger", data.message || "Failed to complete order")
        }
      })
      .catch((error) => {
        // Reset button state
        completeBtn.disabled = false
        completeBtn.innerHTML = originalBtnText
  
        console.error("Error completing order:", error)
        showResponseMessage("danger", "Error connecting to the server. Please try again.")
      })
  }
  
  // Make sure this event listener is set up in your setupEventListeners function
  function setupCompleteOrderListener() {
    const confirmCompleteBtn = document.getElementById("confirm-complete-btn")
    if (confirmCompleteBtn) {
      confirmCompleteBtn.addEventListener("click", completeOrder)
    }
  }
  
  // Mock functions to resolve undeclared variables.  These should be replaced with actual implementations.
  function showResponseMessage(type, message) {
    console.log(`Response: Type=${type}, Message=${message}`)
  }
  
  function fetchOrders() {
    console.log("Fetching orders...")
  }
  
  const bootstrap = {
    Modal: {
      getInstance: (element) => {
        return {
          hide: () => {
            console.log("Hiding modal")
          },
        }
      },
    },
  }
  
  // Call this function when the document is loaded
  document.addEventListener("DOMContentLoaded", () => {
    // Your existing initialization code
  
    // Set up the complete order listener
    setupCompleteOrderListener()
  })
  