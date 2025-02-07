export async function verifyToken() {
    const token = localStorage.getItem('token');

    if (!token) {
        window.location.href = '/';
        return false;
    }

    try {
        const response = await fetch('/token-verification', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });

        const data = await response.json();

        if (!data.token) {
            localStorage.removeItem('token');
            alert("Votre session a expiré");
            window.location.href = '/';
            return false;
        }

        return true; // Token is valid
    } catch (error) {
        console.error('Token verification failed:', error);
        localStorage.removeItem('token');
        window.location.href = '/';
        return false;
    }
}
