// sidebar.js
document.addEventListener("DOMContentLoaded", function () {
  const hamburger = document.getElementById('hamburger');
  const sidebar = document.getElementById('sidebar');

  // Add the event listener for the hamburger menu
  hamburger.addEventListener('click', function() {
    sidebar.classList.toggle('open');
  });

  document.getElementById('logout').addEventListener('click', function (event) {
    event.preventDefault();

    if (confirm('Are you sure you want to log out?')) {
        localStorage.removeItem('token');
        window.location.href = '/';
    }
});
});
