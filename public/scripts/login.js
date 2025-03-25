// login.js
document.getElementById('loginForm').addEventListener('submit', async (event) => {
    event.preventDefault();
  
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
  
    
    const loginData = { email, password };
  
    try {
      const response = await fetch('user/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData),
      });
  
    
      if (response.ok) {
        const data = await response.json();
        console.log('Login successful:', data.token);
        localStorage.setItem('token', data.token)
        // You can redirect or store the token here if needed
        window.location.href = '/accueil';
      } else {
        const errorData = await response.json();
        console.error('Login failed:', errorData.message);
       // alert('Login failed: ' + errorData.message);
       alert('Invalid credentials')
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred during login');
    }
  });
  