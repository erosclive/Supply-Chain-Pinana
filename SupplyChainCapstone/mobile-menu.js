// Mobile Menu JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebar = document.querySelector('.sidebar');
    
    // Toggle sidebar on mobile
    if (sidebarToggle && sidebar) {
      sidebarToggle.addEventListener('click', function() {
        sidebar.classList.toggle('show');
      });
    }
    
    // Close sidebar when clicking outside on mobile
    document.addEventListener('click', function(event) {
      if (sidebar && 
          sidebar.classList.contains('show') && 
          !sidebar.contains(event.target) && 
          event.target !== sidebarToggle) {
        sidebar.classList.remove('show');
      }
    });
    
    // Close sidebar when window is resized to desktop size
    window.addEventListener('resize', function() {
      if (window.innerWidth >= 768 && sidebar && sidebar.classList.contains('show')) {
        sidebar.classList.remove('show');
      }
    });
  });
  
  