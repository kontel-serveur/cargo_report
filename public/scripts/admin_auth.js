document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');

    if (!token) {
        window.location.href = '/';
    } else {
        fetch('/token-verification', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        })
        .then(response => response.json())
        .then(data => {
            if (!data.token) {
                // If token is invalid, redirect to login
                localStorage.removeItem('token');
                window.location.href = '/';
            } else {
                // Token is valid, now check if the user is an admin
                if (data.user && data.user.admin) {
                    console.log('Admin user verified');
                    // Allow access to admin-only pages
                } else {
                    console.log('Non-admin user');
                    // Redirect non-admin users to another page
                    window.location.href = '/forbidden'; // Update with your desired page
                }
            }
        })
        .catch(error => {
            console.error('Token verification failed:', error);
            localStorage.removeItem('token');
            window.location.href = '/';
        });
    }
});
