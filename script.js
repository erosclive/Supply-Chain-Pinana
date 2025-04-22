// Set active navigation based on current page
function setActiveNavigation() {
    // Get current page from URL
    let path = window.location.pathname.split("/").pop().toLowerCase();

    // Handle default cases (root or empty URL)
    if (path === "" || path === "index.html") {
        path = "index";
    } else {
        path = path.replace(".html", ""); 
    }

    console.log("Current page:", path); // Debugging log

    // Remove all active classes first
    const navLinks = document.querySelectorAll(".sidebar .nav-link");
    navLinks.forEach((link) => link.classList.remove("active"));

    // Find the matching nav link using data-page attribute
    navLinks.forEach((link) => {
        if (link.getAttribute("data-page") === path) {
            link.classList.add("active");
        }
    });
}

// Sidebar toggle for mobile view
function setupSidebarToggle() {
    const sidebar = document.getElementById("sidebar");
    const sidebarToggle = document.getElementById("sidebarToggle");

    if (sidebarToggle && sidebar) {
        sidebarToggle.addEventListener("click", () => {
            sidebar.classList.toggle("d-md-block");
        });
    }
}

// Initialize the script
document.addEventListener("DOMContentLoaded", () => {
    setActiveNavigation();
    setupSidebarToggle();
});
