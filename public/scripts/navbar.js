document.addEventListener("DOMContentLoaded", function () {
  const navbarToggle = document.querySelector(".navbar-toggle");
  const navbarMenu = document.querySelector(".navbar-menu");
  const sidebar = document.querySelector(".sidebar");
  const sidebarToggle = document.querySelector(".sidebar-toggle"); // Define the sidebar toggle
  
  // Toggle navbar menu on mobile
  navbarToggle.addEventListener("click", function () {
    navbarMenu.classList.toggle("active");
  });
  
  // Toggle sidebar on mobile
  sidebarToggle.addEventListener("click", function () {
    sidebar.classList.toggle("active");
    navbarMenu.classList.remove("active");  // Hide navbar menu when sidebar is active
  });
});
