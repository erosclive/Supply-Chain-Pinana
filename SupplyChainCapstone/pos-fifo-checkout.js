/**
 * FIFO Inventory Management for POS Checkout
 * This script extends the existing POS functionality to implement
 * First In, First Out (FIFO) inventory management for batch-tracked products.
 */

// Global variables to track batch information
let productBatchDetails = {}

// Mock data and functions - Replace with your actual implementation
const productsData = [] // Initialize productsData
const currentOrder = { items: [] } // Initialize currentOrder
const showAlert = (type, message) => console.log(`${type}: ${message}`) // Initialize showAlert
let openPaymentModal = () => console.log("Opening payment modal") // Initialize openPaymentModal
let completePayment = () => console.log("Completing payment") // Initialize completePayment

// Add this function to your existing pos.js file
// This function fetches batch information for batch-tracked products
function fetchProductBatchesForCheckout(productId) {
  return new Promise((resolve, reject) => {
    // Fetch batches from server
    fetch(`fetch_product_batches_fifo.php?product_id=${productId}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok")
        }
        return response.json()
      })
      .then((data) => {
        if (data.success) {
          // Sort batches by expiration date (oldest first - FIFO)
          const sortedBatches = data.batches.sort(
            (a, b) => new Date(a.expiration_date).getTime() - new Date(b.expiration_date).getTime(),
          )

          resolve(sortedBatches)
        } else {
          reject(new Error(data.error || "Failed to fetch batch data"))
        }
      })
      .catch((error) => {
        console.error("Error fetching batches:", error)
        reject(error)
      })
  })
}

// Add this function to calculate which batches will be used for a product
function calculateBatchAllocation(productId, quantityNeeded, batches) {
  const allocation = []
  let remainingQuantity = quantityNeeded

  // Allocate from oldest batch first (FIFO)
  for (const batch of batches) {
    if (remainingQuantity <= 0) break

    const quantityFromBatch = Math.min(remainingQuantity, batch.quantity)
    if (quantityFromBatch > 0) {
      allocation.push({
        batch_id: batch.batch_id,
        batch_code: batch.batch_code,
        quantity: quantityFromBatch,
        expiration_date: batch.expiration_date,
      })

      remainingQuantity -= quantityFromBatch
    }
  }

  return allocation
}

// Add this function to check if a product uses batch tracking
function isProductBatchTracked(productId) {
  // Find the product in the productsData array
  const product = productsData.find((p) => p.id === productId)
  return product && product.batch_tracking === 1
}

// Add this function to prepare batch information before checkout
async function prepareBatchInformation() {
  // Reset batch details
  productBatchDetails = {}

  // Get batch information for each batch-tracked product in the order
  const batchTrackedItems = currentOrder.items.filter((item) => isProductBatchTracked(item.id))

  if (batchTrackedItems.length === 0) {
    return true // No batch-tracked items, proceed with checkout
  }

  try {
    // Fetch batch information for each product
    for (const item of batchTrackedItems) {
      const batches = await fetchProductBatchesForCheckout(item.id)

      // Check if we have enough stock across all batches
      const totalAvailable = batches.reduce((sum, batch) => sum + batch.quantity, 0)

      if (totalAvailable < item.quantity) {
        showAlert(
          "danger",
          `Insufficient stock for ${item.name}. Available: ${totalAvailable}, Required: ${item.quantity}`,
        )
        return false
      }

      // Calculate which batches will be used
      const allocation = calculateBatchAllocation(item.id, item.quantity, batches)
      productBatchDetails[item.id] = allocation
    }

    return true // All batch information prepared successfully
  } catch (error) {
    console.error("Error preparing batch information:", error)
    showAlert("danger", "Error preparing batch information. Please try again.")
    return false
  }
}

// Add this function to display batch allocation preview
function showBatchAllocationPreview() {
  const batchPreviewContainer = document.getElementById("batch-preview-container")
  if (!batchPreviewContainer) return

  // Clear previous content
  batchPreviewContainer.innerHTML = ""

  // Check if we have any batch-tracked products
  const hasBatchTrackedItems = Object.keys(productBatchDetails).length > 0

  if (!hasBatchTrackedItems) {
    batchPreviewContainer.style.display = "none"
    return
  }

  // Show the container
  batchPreviewContainer.style.display = "block"

  // Create header
  const header = document.createElement("h6")
  header.className = "mb-2 fw-bold"
  header.textContent = "Batch Allocation Preview (FIFO)"
  batchPreviewContainer.appendChild(header)

  // Create batch allocation details
  for (const productId in productBatchDetails) {
    const allocation = productBatchDetails[productId]
    const product = currentOrder.items.find((item) => item.id === productId)

    if (!product || allocation.length === 0) continue

    const productDiv = document.createElement("div")
    productDiv.className = "batch-allocation-item mb-2 p-2 border rounded"

    const productName = document.createElement("div")
    productName.className = "fw-medium"
    productName.textContent = product.name
    productDiv.appendChild(productName)

    const batchList = document.createElement("ul")
    batchList.className = "list-unstyled mb-0 mt-1"

    allocation.forEach((batch) => {
      const batchItem = document.createElement("li")
      batchItem.className = "d-flex justify-content-between small"

      const batchCode = document.createElement("span")
      batchCode.textContent = `Batch ${batch.batch_code}`

      const quantity = document.createElement("span")
      quantity.className = "fw-medium"
      quantity.textContent = `${batch.quantity} units`

      batchItem.appendChild(batchCode)
      batchItem.appendChild(quantity)
      batchList.appendChild(batchItem)
    })

    productDiv.appendChild(batchList)
    batchPreviewContainer.appendChild(productDiv)
  }

  // Add explanation
  const explanation = document.createElement("p")
  explanation.className = "small text-muted mt-2 mb-0"
  explanation.textContent = "Using FIFO method: Oldest batches (by expiration date) will be used first."
  batchPreviewContainer.appendChild(explanation)
}

// Modify the openPaymentModal function to include batch allocation preview
const originalOpenPaymentModal = openPaymentModal
openPaymentModal = async () => {
  // Check if we have batch-tracked products and prepare batch information
  const batchInfoPrepared = await prepareBatchInformation()

  if (!batchInfoPrepared) {
    return // Don't open payment modal if batch information preparation failed
  }

  // Call the original function
  originalOpenPaymentModal()

  // Show batch allocation preview
  showBatchAllocationPreview()
}

// Modify the completePayment function to use FIFO inventory management
const amountTenderedInput = document.getElementById("amountTendered") // Assuming this is defined elsewhere
const receiptOrderNumber = document.getElementById("receiptOrderNumber") // Assuming this is defined elsewhere
const receiptDate = document.getElementById("receiptDate") // Assuming this is defined elsewhere
const receiptCustomer = document.getElementById("receiptCustomer") // Assuming this is defined elsewhere
const receiptItems = document.getElementById("receiptItems") // Assuming this is defined elsewhere
const originalCompletePayment = completePayment
completePayment = () => {
  // Validate input (from original function)
  const amountTendered = Number.parseFloat(amountTenderedInput.value) || 0
  const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked')?.value || "cash"

  // For cash payments, ensure enough money was tendered
  if (paymentMethod === "cash" && amountTendered < currentOrder.total) {
    showAlert("danger", "Amount tendered is insufficient")
    return
  }

  // Get customer information
  const customerName = document.getElementById("customerName").value || "Guest"

  // Generate order number
  const orderNumber = "PG-" + Math.floor(10000 + Math.random() * 90000)

  // Prepare order data for FIFO processing
  const orderData = {
    orderID: orderNumber,
    customerName: customerName,
    products: currentOrder.items.map((item) => ({
      product_id: item.id,
      name: item.name,
      quantity: item.quantity,
      price: item.price,
      batch_tracking: isProductBatchTracked(item.id),
      // Include batch allocation if this is a batch-tracked product
      batch_allocation: productBatchDetails[item.id] || null,
    })),
    paymentMethod: paymentMethod,
    amountTendered: amountTendered,
    total: currentOrder.total,
    tax: currentOrder.tax,
    discount: currentOrder.discount,
    subtotal: currentOrder.subtotal,
  }

  // Show processing indicator
  const completePaymentBtn = document.getElementById("completePaymentBtn")
  if (completePaymentBtn) {
    completePaymentBtn.disabled = true
    completePaymentBtn.innerHTML =
      '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Processing...'
  }

  // Process the order with FIFO inventory management
  fetch("process_order_with_fifo.php", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(orderData),
  })
    .then((response) => response.json())
    .then((data) => {
      // Reset button state
      if (completePaymentBtn) {
        completePaymentBtn.disabled = false
        completePaymentBtn.innerHTML = "Complete Payment"
      }

      if (data.success) {
        // Update receipt information (similar to original function)
        if (receiptOrderNumber) receiptOrderNumber.textContent = orderNumber
        if (receiptDate)
          receiptDate.textContent = `${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`
        if (receiptCustomer) receiptCustomer.textContent = customerName

        // Update receipt items
        if (receiptItems) {
          let receiptItemsHtml = `<table class="table table-borderless">
          <thead>
            <tr>
              <th>Item</th>
              <th class="text-center">Qty</th>
              <th class="text-end">Price</th>
              <th class="text-end">Total</th>
            </tr>
          </thead>
          <tbody>`

          currentOrder.items.forEach((item) => {
            const itemTotal = (item.price * item.quantity).toFixed(2)

            receiptItemsHtml += `
            <tr>
              <td>${item.name}</td>
              <td class="text-center">${item.quantity}</td>
              <td class="text-end">₱${item.price.toFixed(2)}</td>
              <td class="text-end">₱${itemTotal}</td>
            </tr>
          `
          })

          receiptItemsHtml += `</tbody></table>`
          receiptItems.innerHTML = receiptItemsHtml
        }

        // Declare the missing variables
        const receiptSubtotal = document.getElementById("receiptSubtotal")
        const receiptTax = document.getElementById("receiptTax")
        const receiptDiscount = document.getElementById("receiptDiscount")
        const receiptTotal = document.getElementById("receiptTotal")
        const receiptPaymentMethod = document.getElementById("receiptPaymentMethod")

        // Update receipt totals
        if (receiptSubtotal) receiptSubtotal.textContent = `₱${currentOrder.subtotal.toFixed(2)}`
        if (receiptTax) receiptTax.textContent = `₱${currentOrder.tax.toFixed(2)}`
        if (receiptDiscount) receiptDiscount.textContent = `₱${currentOrder.discount.toFixed(2)}`
        if (receiptTotal) receiptTotal.textContent = `₱${currentOrder.total.toFixed(2)}`
        if (receiptPaymentMethod)
          receiptPaymentMethod.textContent = paymentMethod.charAt(0).toUpperCase() + paymentMethod.slice(1)

        // Hide payment modal and show receipt modal
        if (paymentModal) {
          paymentModal.hide()
        }
        if (receiptModal) {
          receiptModal.show()
        }

        // Clear order after payment
        clearOrder()

        // Show success message
        showAlert("success", "Payment completed successfully with FIFO inventory management!")
      } else {
        showAlert("danger", data.error || "Failed to process order")
      }
    })
    .catch((error) => {
      console.error("Error processing order:", error)

      // Reset button state
      if (completePaymentBtn) {
        completePaymentBtn.disabled = false
        completePaymentBtn.innerHTML = "Complete Payment"
      }

      showAlert("danger", "Network error. Please try again.")
    })
}

// Add this to document ready to initialize the batch preview container
document.addEventListener("DOMContentLoaded", () => {
  // Create batch preview container if it doesn't exist
  if (!document.getElementById("batch-preview-container")) {
    const orderSummary = document.querySelector(".order-summary")
    if (orderSummary) {
      const batchPreviewContainer = document.createElement("div")
      batchPreviewContainer.id = "batch-preview-container"
      batchPreviewContainer.className = "batch-preview mt-3 border-top pt-3"
      batchPreviewContainer.style.display = "none"

      // Insert before the total row
      const totalRow = orderSummary.querySelector(".total-row")
      if (totalRow) {
        orderSummary.insertBefore(batchPreviewContainer, totalRow)
      } else {
        orderSummary.appendChild(batchPreviewContainer)
      }
    }
  }
})

