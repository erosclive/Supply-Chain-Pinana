document.addEventListener("DOMContentLoaded", function() {
    // Get the sidebar and toggle button elements
    const sidebar = document.getElementById("sidebar");
    const sidebarToggle = document.getElementById("sidebarToggle");
    const mainContent = document.querySelector(".main-content");
    
    // Function to toggle sidebar
    function toggleSidebar() {
      sidebar.classList.toggle("show");
      document.body.classList.toggle("sidebar-open");
    }
    
    // Add click event to sidebar toggle button
    if (sidebarToggle) {
      sidebarToggle.addEventListener("click", function(e) {
        e.preventDefault();
        toggleSidebar();
      });
    }
    
    // Close sidebar when clicking outside on mobile
    document.addEventListener("click", function(e) {
      const isMobile = window.innerWidth < 992;
      const isClickInsideSidebar = sidebar.contains(e.target);
      const isClickOnToggle = sidebarToggle.contains(e.target);
      
      if (isMobile && !isClickInsideSidebar && !isClickOnToggle && sidebar.classList.contains("show")) {
        toggleSidebar();
      }
    });
    
    // Close sidebar when window is resized to desktop size
    window.addEventListener("resize", function() {
      if (window.innerWidth >= 992 && sidebar.classList.contains("show")) {
        sidebar.classList.remove("show");
        document.body.classList.remove("sidebar-open");
      }
    });
  });