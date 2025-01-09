document.getElementById('logout-link').addEventListener('click', function (event) {
    event.preventDefault();

    if (confirm('Are you sure you want to log out?')) {
        localStorage.removeItem('token');
        window.location.href = '/';
    }
});
