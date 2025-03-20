document.addEventListener('DOMContentLoaded', async () => {
    const profileForm = document.getElementById('profileForm');
    const passwordForm = document.getElementById('passwordForm');
  
    try {
      // Fetch user profile data from API
      const token = localStorage.getItem('token');
      const response = await fetch('/profile/details', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    }); 
    
      if (!response.ok) {
        throw new Error('Failed to fetch user profile');
      }
  
      const userData = await response.json(); // Parse JSON response

      // Populate the form fields
      profileForm.fullName.value = userData.fullName || ''; // Update with your API field names
      profileForm.email.value = userData.email || '';
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  
    // Save profile form changes
    profileForm.addEventListener('submit', async (event) => {
      event.preventDefault();
  
      const updatedData = {
        fullName: profileForm.fullName.value,
        email: profileForm.email.value,
      };
  
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('/profile/update', {
          method: 'PATCH', // Assuming the API uses PUT for updates
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`, },
          body: JSON.stringify(updatedData),
        });
  
        if (!response.ok) {
          throw new Error('Failed to update profile');
        }
  
        alert('Votre profile a ete modifie avec success!');
        location.reload();
        
      } catch (error) {
        console.error('Error updating profile:', error);
      }
    });
  
    // Handle password change
    passwordForm.addEventListener('submit', async (event) => {
      event.preventDefault();
  
      const passwordData = {
        currentPassword: passwordForm.current_password.value,
        password: passwordForm.password.value,
        confirmPassword: passwordForm.confirm_password.value,
      };
  
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('/profile/password-change', {
          method: 'PATCH', // Assuming the API uses PUT for password updates
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify(passwordData),
        });
  
        if (!response.ok) {
          alert('Erreur lors le mis a jour de votre mot de passe!');
          throw new Error('Failed to update password');
        }
  
        alert('Votre profile a ete modifie avec success!');
        location.reload();
      } catch (error) {
        console.error('Error updating password:', error);
      }
    });
  });
  