// Fix for modal display issues
document.addEventListener("DOMContentLoaded", function() {
    // Ensure only one modal backdrop exists at a time
    function fixModalBackdrop() {
      const backdrops = document.querySelectorAll('.modal-backdrop');
      if (backdrops.length > 1) {
        // Keep only the last backdrop
        for (let i = 0; i < backdrops.length - 1; i++) {
          backdrops[i].remove();
        }
      }
    }
  
    // Properly initialize all modals
    const modalElements = document.querySelectorAll('.modal');
    modalElements.forEach(modalElement => {
      // Remove any existing event listeners to prevent duplicates
      const newModal = modalElement.cloneNode(true);
      modalElement.parentNode.replaceChild(newModal, modalElement);
      
      // Initialize with proper options
      new bootstrap.Modal(newModal, {
        backdrop: true,
        keyboard: true,
        focus: true
      });
      
      // Add event listeners for modal events
      newModal.addEventListener('show.bs.modal', function() {
        // Ensure body has proper class
        document.body.classList.add('modal-open');
        
        // Fix z-index issues - ensure this modal is on top
        const currentZIndex = parseInt(window.getComputedStyle(newModal).zIndex);
        modalElements.forEach(otherModal => {
          if (otherModal !== newModal && otherModal.classList.contains('show')) {
            otherModal.style.zIndex = currentZIndex - 10;
          }
        });
      });
      
      newModal.addEventListener('hidden.bs.modal', function() {
        fixModalBackdrop();
        
        // Only remove modal-open class if no other modals are open
        const openModals = document.querySelectorAll('.modal.show');
        if (openModals.length === 0) {
          document.body.classList.remove('modal-open');
        }
      });
    });
    
    // Fix for modal buttons
    document.querySelectorAll('[data-bs-toggle="modal"]').forEach(button => {
      button.addEventListener('click', function(e) {
        e.preventDefault();
        const targetModalId = this.getAttribute('data-bs-target');
        const targetModal = document.querySelector(targetModalId);
        if (targetModal) {
          const modalInstance = bootstrap.Modal.getInstance(targetModal) || new bootstrap.Modal(targetModal);
          modalInstance.show();
        }
      });
    });
  });