document.addEventListener('DOMContentLoaded', async () => {
    const userId = window.location.pathname.split('/').pop();
    const profileForm = document.getElementById('profileForm');
    const passwordForm = document.getElementById('passwordForm');
  
    try {
      // Fetch user profile data from API
      const token = localStorage.getItem('token');
      const response = await fetch(`/admin/users/${userId}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    }); 
    
      if (!response.ok) {
        throw new Error('Failed to fetch user profile');
      }
  
      const users = await response.json(); // Parse JSON response
      const userData = users.user;
      console.log(userData)

      // Populate the form fields
      profileForm.fullName.value = userData.fullName || ''; // Update with your API field names
      profileForm.email.value = userData.email || '';
      const allowedSelect = profileForm.allowed;
  const adminSelect = profileForm.admin;

  if (userData.allowed !== undefined) {
    allowedSelect.value = String(userData.allowed); // Convert to string to match option values
  }

  if (userData.admin !== undefined) {
    adminSelect.value = String(userData.admin); // Convert to string to match option values
  }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  
    // Save profile form changes
    profileForm.addEventListener('submit', async (event) => {
      event.preventDefault();
  
      const updatedData = {
        fullName: profileForm.fullName.value,
        email: profileForm.email.value,
        allowed: profileForm.allowed.value,
        admin: profileForm.admin.value
      };
  
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/admin/users/profile/${userId}`, {
          method: 'PATCH', // Assuming the API uses PUT for updates
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`, },
          body: JSON.stringify(updatedData),
        });
  
        if (!response.ok) {
          throw new Error('Failed to update profile');
        }
  
        alert('Profile mis a jour avec success!');
        location.reload();
        
      } catch (error) {
        console.error('Error updating profile:', error);
      }
    });
  
    // Handle password change
    passwordForm.addEventListener('submit', async (event) => {
      event.preventDefault();
  
      const passwordData = {
        password: passwordForm.password.value,
        confirmPassword: passwordForm.confirm_password.value,
      };

      const password = passwordForm.password.value
      const confirmPassword = passwordForm.confirm_password.value
      if (!password || !confirmPassword) {
        alert('Les deux champs de mot de passe sont requis.');
        return;
      }
    
      if (password !== confirmPassword) {
        alert('Les mots de passe ne correspondent pas.');
        return;
      }
  
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/admin/users/password/${userId}`, {
          method: 'PATCH', // Assuming the API uses PUT for password updates
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify(passwordData),
        });
  
        if (!response.ok) {
            console.log(response)
            alert('Failed to update password')
          throw new Error('Failed to update password');
          
        }
  
        alert('Votre mot de passe a ete mis a jour avec success!');
        location.reload();
      } catch (error) {
        console.error('Error updating password:', error);
      }
    });
  });
  