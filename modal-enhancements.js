/**
 * Modal Enhancements for Piñana Gourmet
 * This script adds additional functionality and animations to modals
 */

document.addEventListener("DOMContentLoaded", function() {
    // Initialize enhanced modals
    initEnhancedModals();
    
    // Add form validation styling
    enhanceFormValidation();
    
    // Add animation to status badges
    enhanceStatusBadges();
    
    // Enhance delete confirmation modal
    enhanceDeleteModal();
    
    // Enhance create/edit order modal
    enhanceCreateEditOrderModal();
    
    // Enhance view order modal
    enhanceViewOrderModal();
  });
  
  /**
   * Initialize enhanced modals with animations and improved interactions
   */
  function initEnhancedModals() {
    // Add entrance animation class to modals
    const modals = document.querySelectorAll('.modal');
    
    modals.forEach(modal => {
      // Add animation when modal opens
      modal.addEventListener('show.bs.modal', function() {
        setTimeout(() => {
          this.classList.add('modal-animated');
        }, 10);
        
        // Make modal body scrollable if content is too long
        const modalBody = this.querySelector('.modal-body');
        if (modalBody && modalBody.scrollHeight > 400) {
          modalBody.classList.add('modal-body-scrollable');
        }
      });
      
      // Remove animation class when modal closes
      modal.addEventListener('hide.bs.modal', function() {
        this.classList.remove('modal-animated');
        
        // Remove scrollable class
        const modalBody = this.querySelector('.modal-body');
        if (modalBody) {
          modalBody.classList.remove('modal-body-scrollable');
        }
      });
      
      // Add keyboard shortcuts
      modal.addEventListener('keydown', function(e) {
        // Save with Ctrl+Enter or Cmd+Enter
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
          const saveBtn = this.querySelector('.btn-primary:not([data-bs-dismiss="modal"])');
          if (saveBtn) {
            e.preventDefault();
            saveBtn.click();
          }
        }
        
        // Close with Escape key (already handled by Bootstrap, but we'll add a visual effect)
        if (e.key === 'Escape') {
          const closeBtn = this.querySelector('.btn-close');
          if (closeBtn) {
            closeBtn.classList.add('btn-close-pulse');
            setTimeout(() => {
              closeBtn.classList.remove('btn-close-pulse');
            }, 300);
          }
        }
      });
    });
  }
  
  /**
   * Enhance form validation with visual feedback
   */
  function enhanceFormValidation() {
    // Add validation styles to form inputs
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
      // Add validation classes on submit
      form.addEventListener('submit', function(event) {
        if (!this.checkValidity()) {
          event.preventDefault();
          event.stopPropagation();
          
          // Find the first invalid input and focus it
          const firstInvalid = this.querySelector(':invalid');
          if (firstInvalid) {
            firstInvalid.focus();
            
            // Scroll to the first invalid input if needed
            const modalBody = this.closest('.modal-body');
            if (modalBody) {
              const inputTop = firstInvalid.getBoundingClientRect().top;
              const modalBodyTop = modalBody.getBoundingClientRect().top;
              if (inputTop < modalBodyTop || inputTop > modalBodyTop + modalBody.clientHeight) {
                firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }
            }
          }
        }
        
        this.classList.add('was-validated');
      });
      
      // Add real-time validation feedback
      const inputs = form.querySelectorAll('input, select, textarea');
      inputs.forEach(input => {
        input.addEventListener('blur', function() {
          if (this.checkValidity()) {
            this.classList.add('is-valid');
            this.classList.remove('is-invalid');
          } else if (this.value !== '') {
            this.classList.add('is-invalid');
            this.classList.remove('is-valid');
          }
        });
        
        // Add animation on focus
        input.addEventListener('focus', function() {
          this.classList.add('input-focused');
        });
        
        input.addEventListener('focusout', function() {
          this.classList.remove('input-focused');
        });
      });
    });
  }
  
  /**
   * Enhance status badges with animations
   */
  function enhanceStatusBadges() {
    // Add pulse animation to status badges in the view modal
    const viewOrderStatus = document.getElementById('viewOrderStatus');
    if (viewOrderStatus) {
      const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
          if (mutation.type === 'childList') {
            const badge = viewOrderStatus.querySelector('.badge');
            if (badge) {
              badge.classList.add('badge-pulse');
              setTimeout(() => {
                badge.classList.remove('badge-pulse');
              }, 1000);
            }
          }
        });
      });
      
      observer.observe(viewOrderStatus, { childList: true });
    }
    
    // Enhance status badges in the orders table
    const orderRows = document.querySelectorAll('#orders-table-body tr');
    orderRows.forEach(row => {
      const statusBadge = row.querySelector('.badge');
      if (statusBadge) {
        statusBadge.addEventListener('mouseenter', function() {
          this.classList.add('status-change');
        });
        
        statusBadge.addEventListener('mouseleave', function() {
          this.classList.remove('status-change');
        });
      }
    });
  }
  
  /**
   * Enhance delete confirmation modal
   */
  function enhanceDeleteModal() {
    const deleteOrderModal = document.getElementById('deleteOrderModal');
    if (!deleteOrderModal) return;
    
    // Add shake animation to delete button
    const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
    if (confirmDeleteBtn) {
      confirmDeleteBtn.addEventListener('mouseenter', function() {
        this.classList.add('btn-shake');
        setTimeout(() => {
          this.classList.remove('btn-shake');
        }, 500);
      });
      
      confirmDeleteBtn.addEventListener('click', function() {
        this.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span> Deleting...';
        this.classList.add('btn-delete-warning');
        
        // Simulate deletion process (remove this in production)
        setTimeout(() => {
          this.classList.remove('btn-delete-warning');
        }, 1000);
      });
    }
    
    // Add visual emphasis to order ID
    deleteOrderModal.addEventListener('show.bs.modal', function() {
      const deleteOrderId = document.getElementById('deleteOrderId');
      if (deleteOrderId) {
        deleteOrderId.classList.add('order-id-highlight');
        setTimeout(() => {
          deleteOrderId.classList.remove('order-id-highlight');
        }, 1000);
      }
    });
  }
  
  /**
   * Enhance create/edit order modal
   */
  function enhanceCreateEditOrderModal() {
    const orderModal = document.getElementById('orderModal');
    if (!orderModal) return;
    
    // Add visual feedback when adding items
    const addItemBtn = document.getElementById('addItemBtn');
    if (addItemBtn) {
      addItemBtn.addEventListener('click', function() {
        this.classList.add('btn-pulse');
        setTimeout(() => {
          this.classList.remove('btn-pulse');
        }, 300);
        
        // Add animation to the new row
        setTimeout(() => {
          const rows = document.querySelectorAll('.order-item-row');
          const lastRow = rows[rows.length - 1];
          if (lastRow) {
            lastRow.classList.add('table-row-new');
            setTimeout(() => {
              lastRow.classList.remove('table-row-new');
            }, 1000);
          }
        }, 10);
      });
    }
    
    // Add animation to the save button
    const saveOrderBtn = document.getElementById('saveOrderBtn');
    if (saveOrderBtn) {
      saveOrderBtn.addEventListener('click', function() {
        // Check if form is valid before showing animation
        const form = document.getElementById('orderForm');
        if (form && form.checkValidity()) {
          this.classList.add('btn-saving');
          this.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span> Saving...';
          
          // Simulate saving process (remove this in production)
          setTimeout(() => {
            this.innerHTML = '<i class="bi bi-check-lg me-1"></i> Saved!';
            this.classList.add('btn-save-success');
            
            setTimeout(() => {
              this.innerHTML = '<i class="bi bi-check-lg me-1"></i> Save Order';
              this.classList.remove('btn-saving');
              this.classList.remove('btn-save-success');
            }, 1000);
          }, 1500);
        }
      });
    }
    
    // Enhance product selection with auto-focus
    orderModal.addEventListener('shown.bs.modal', function() {
      const firstInput = this.querySelector('input[name="customerName"]');
      if (firstInput) {
        firstInput.focus();
      }
      
      // Add animation to form sections
      const formSections = this.querySelectorAll('.modal-body > div');
      formSections.forEach((section, index) => {
        setTimeout(() => {
          section.classList.add('form-section-animated');
        }, index * 100);
      });
    });
    
    // Add visual feedback when calculating totals
    const orderDiscount = document.getElementById('orderDiscount');
    if (orderDiscount) {
      orderDiscount.addEventListener('input', function() {
        const orderTotal = document.getElementById('orderTotal');
        if (orderTotal) {
          orderTotal.classList.add('total-updated');
          setTimeout(() => {
            orderTotal.classList.remove('total-updated');
          }, 500);
        }
      });
    }
    
    // Add event listeners to quantity inputs
    document.addEventListener('input', function(e) {
      if (e.target && e.target.classList.contains('item-quantity')) {
        const row = e.target.closest('.order-item-row');
        if (row) {
          const totalInput = row.querySelector('.item-total');
          if (totalInput) {
            totalInput.classList.add('total-updated');
            setTimeout(() => {
              totalInput.classList.remove('total-updated');
            }, 500);
          }
        }
      }
    });
    
    // Add animation to product selection
    document.addEventListener('change', function(e) {
      if (e.target && e.target.classList.contains('product-select')) {
        const row = e.target.closest('.order-item-row');
        if (row) {
          row.classList.add('table-row-new');
          setTimeout(() => {
            row.classList.remove('table-row-new');
          }, 1000);
        }
      }
    });
  }
  
  /**
   * Enhance view order modal
   */
  function enhanceViewOrderModal() {
    const viewOrderModal = document.getElementById('viewOrderModal');
    if (!viewOrderModal) return;
    
    // Add hover effect to order items
    viewOrderModal.addEventListener('shown.bs.modal', function() {
      const orderItems = this.querySelectorAll('#viewOrderItems tr');
      orderItems.forEach(item => {
        item.classList.add('order-item-hover');
      });
      
      // Animate timeline items
      const timelineItems = this.querySelectorAll('.timeline-item');
      timelineItems.forEach((item, index) => {
        setTimeout(() => {
          item.classList.add('timeline-item-animated');
        }, index * 200);
      });
    });
    
    // Enhance print button
    const printOrderBtn = document.getElementById('printOrderBtn');
    if (printOrderBtn) {
      printOrderBtn.addEventListener('click', function() {
        this.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span> Preparing...';
        setTimeout(() => {
          this.innerHTML = '<i class="bi bi-printer me-1"></i> Print';
        }, 1000);
      });
    }
    
    // Enhance edit button
    const editOrderBtn = document.getElementById('editOrderBtn');
    if (editOrderBtn) {
      editOrderBtn.addEventListener('click', function() {
        this.classList.add('btn-pulse');
      });
    }
    
    // Add animation to order information sections
    viewOrderModal.addEventListener('shown.bs.modal', function() {
      const infoSections = this.querySelectorAll('h6.text-muted');
      infoSections.forEach((section, index) => {
        setTimeout(() => {
          section.classList.add('form-section-animated');
        }, index * 150);
      });
    });
  }