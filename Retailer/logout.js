document.addEventListener("DOMContentLoaded", function() {
    // Add modal HTML to the page
    addLogoutModals();
    
    // Get the logout button
    const logoutButton = document.getElementById("logoutButton");
    
    // Add click event listener to the logout button
    if (logoutButton) {
      logoutButton.addEventListener("click", function(event) {
        event.preventDefault();
        
        // Show the confirmation modal instead of browser confirm
        const logoutConfirmModal = new bootstrap.Modal(document.getElementById('logoutConfirmModal'));
        logoutConfirmModal.show();
      });
    }
    
    // Add event listener to the confirm logout button in the modal
    const confirmLogoutBtn = document.getElementById("confirmLogoutBtn");
    if (confirmLogoutBtn) {
      confirmLogoutBtn.addEventListener("click", function() {
        // Hide the confirmation modal
        const logoutConfirmModal = bootstrap.Modal.getInstance(document.getElementById('logoutConfirmModal'));
        logoutConfirmModal.hide();
        
        // Perform logout actions
        performLogout();
        
        // Show the success modal
        setTimeout(() => {
          const logoutSuccessModal = new bootstrap.Modal(document.getElementById('logoutSuccessModal'));
          logoutSuccessModal.show();
          
          // Redirect after a short delay
          setTimeout(() => {
            window.location.href = "../index.html";
          }, 2000);
        }, 500);
      });
    }
    
    // Function to add modal HTML to the page
    function addLogoutModals() {
      const modalHTML = `
        <!-- Logout Confirmation Modal -->
        <div class="modal fade" id="logoutConfirmModal" tabindex="-1" aria-labelledby="logoutConfirmModalLabel" aria-hidden="true">
          <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
              <div class="modal-header bg-light">
                <h5 class="modal-title" id="logoutConfirmModalLabel">Confirm Logout</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
              </div>
              <div class="modal-body">
                <div class="text-center mb-4">
                  <i class="bi bi-question-circle text-warning" style="font-size: 3rem;"></i>
                </div>
                <p class="text-center fs-5">Are you sure you want to logout?</p>
                <p class="text-center text-muted">You will be redirected to the login page.</p>
              </div>
              <div class="modal-footer justify-content-center">
                <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Cancel</button>
                <button type="button" class="btn btn-danger" id="confirmLogoutBtn">
                  <i class="bi bi-box-arrow-right me-2"></i>Logout
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Logout Success Modal -->
        <div class="modal fade" id="logoutSuccessModal" tabindex="-1" aria-labelledby="logoutSuccessModalLabel" aria-hidden="true">
          <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
              <div class="modal-body">
                <div class="text-center my-4">
                  <i class="bi bi-check-circle-fill text-success" style="font-size: 3rem;"></i>
                  <h4 class="mt-3">Logged Out Successfully</h4>
                  <p class="text-muted">Redirecting to login page...</p>
                  <div class="spinner-border spinner-border-sm text-primary mt-2" role="status">
                    <span class="visually-hidden">Loading...</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
      
      // Create a container for the modals and append to the body
      const modalContainer = document.createElement('div');
      modalContainer.innerHTML = modalHTML;
      document.body.appendChild(modalContainer);
    }
    
    // Function to perform logout actions
    function performLogout() {
      // Clear any user session data from localStorage
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      localStorage.removeItem("isLoggedIn");
      
      // Clear any session cookies
      document.cookie.split(";").forEach(function(c) {
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      });
    }
  });