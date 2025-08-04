// Modal Handlers for Suppliers Management
// This file handles loading and success modals for all supplier operations

class ModalHandler {
  constructor() {
    this.loadingModal = null;
    this.successModal = null;
    this.errorModal = null;
    this.init();
  }

  init() {
    this.loadingModal = new bootstrap.Modal(document.getElementById('loadingModal'));
    this.successModal = new bootstrap.Modal(document.getElementById('successModal'));
    this.errorModal = new bootstrap.Modal(document.getElementById('errorModal'));
  }

  // Show loading modal with custom message
  showLoading(message = "Please wait while we process your request...") {
    const loadingMessage = document.getElementById('loading-message');
    if (loadingMessage) {
      loadingMessage.textContent = message;
    }
    this.loadingModal.show();
  }

  // Hide loading modal
  hideLoading() {
    this.loadingModal.hide();
  }

  // Show success modal with custom message
  showSuccess(message = "Operation completed successfully.") {
    const successMessage = document.getElementById('success-message');
    if (successMessage) {
      successMessage.textContent = message;
    }
    this.successModal.show();
  }

  // Show error modal with custom message
  showError(message = "An error occurred.") {
    const errorMessage = document.getElementById('error-message');
    if (errorMessage) {
      errorMessage.textContent = message;
    }
    this.errorModal.show();
  }

  // Execute operation with loading and success modals
  async executeWithModals(operation, loadingMessage, successMessage, errorMessage) {
    try {
      // Show loading modal
      this.showLoading(loadingMessage);
      
      // Wait for 2 seconds to show loading
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Execute the operation
      const result = await operation();
      
      // Hide loading modal
      this.hideLoading();
      
      // Wait a bit before showing success
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Show success modal
      this.showSuccess(successMessage);
      
      // Auto-hide success modal after 2 seconds
      setTimeout(() => {
        this.successModal.hide();
      }, 2000);
      
      return result;
    } catch (error) {
      // Hide loading modal
      this.hideLoading();
      
      // Show error modal
      this.showError(errorMessage || error.message);
      
      throw error;
    }
  }

  // Specific operation handlers
  async addSupplier(operation) {
    return this.executeWithModals(
      operation,
      "Adding new supplier...",
      "Supplier added successfully!",
      "Failed to add supplier."
    );
  }

  async editSupplier(operation) {
    return this.executeWithModals(
      operation,
      "Updating supplier information...",
      "Supplier updated successfully!",
      "Failed to update supplier."
    );
  }

  async deleteSupplier(operation) {
    return this.executeWithModals(
      operation,
      "Deleting supplier...",
      "Supplier deleted successfully!",
      "Failed to delete supplier."
    );
  }

  async addAlternative(operation) {
    return this.executeWithModals(
      operation,
      "Adding alternative supplier...",
      "Alternative supplier added successfully!",
      "Failed to add alternative supplier."
    );
  }

  async editFixedPineapple(operation) {
    return this.executeWithModals(
      operation,
      "Updating pineapple supplier...",
      "Pineapple supplier updated successfully!",
      "Failed to update pineapple supplier."
    );
  }

  async deleteAlternative(operation) {
    return this.executeWithModals(
      operation,
      "Deleting alternative supplier...",
      "Alternative supplier deleted successfully!",
      "Failed to delete alternative supplier."
    );
  }
}

// Global modal handler instance
let modalHandler;

// Initialize modal handler when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  modalHandler = new ModalHandler();
});

// Export for use in other files
window.modalHandler = modalHandler; 