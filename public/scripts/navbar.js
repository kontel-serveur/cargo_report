document.addEventListener("DOMContentLoaded", function () {
  const navbarToggle = document.querySelector(".navbar-toggle");
  const navbarMenu = document.querySelector(".navbar-menu");
  const sidebar = document.querySelector(".sidebar");
  const sidebarToggle = document.querySelector(".sidebar-toggle");

  // Toggle navbar menu on mobile
  navbarToggle.addEventListener("click", function () {
    navbarMenu.classList.toggle("active");
  });

  // Toggle sidebar on mobile
  sidebarToggle.addEventListener("click", function () {
    sidebar.classList.toggle("active");
    navbarMenu.classList.remove("active");
  });

  // Logout functionality
  const logoutButtons = document.querySelectorAll("#navbar-logout, #sidebar-logout");
  logoutButtons.forEach(button => {
    button.addEventListener("click", function (event) {
      event.preventDefault();

      // Remove the token
      localStorage.removeItem("token");

      // Redirect to the homepage
      window.location.href = "/";
    });
  });
});
