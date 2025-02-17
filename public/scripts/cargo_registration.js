// login.js
document.getElementById('cargoForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    const token = localStorage.getItem('token');
  
    
    const numeroDeTransit = document.getElementById('numero_de_transit').value;
    const numeroDeBalise = document.getElementById('numero_de_la_balise').value;
    const codeHS = document.getElementById('code_hs').value;
    const corridor = document.getElementById('corridor').value;
    const typeDeVehicule = document.getElementById('type_de_vehicule').value;
    const immatriculation = document.getElementById('immatriculation').value;
    const transitaire = document.getElementById('transitaire').value;
    const chauffeur = document.getElementById('chauffeur').value;
    const telephone = document.getElementById('telephone').value;
    const creationDate = document.getElementById('creation_date').value;
    const creationHeureDebut = document.getElementById('creation_heure_debut').value;
    const creationDateFin = document.getElementById('creation_date_fin').value;
    const creationHeureFin = document.getElementById('creation_heure_fin').value;
    const alarme = document.getElementById('numero_de_transit').value;
    const clotureDate = document.getElementById('cloture_date').value;
    const clotureHeure = document.getElementById('cloture_heure').value;
    const clotureLieu = document.getElementById('cloture_lieu').value;
    const clotureMode = document.getElementById('cloture_mode').value;
    const duree = document.getElementById('duree').value;
  
    
    const cargoData = { 
      numeroDeTransit, 
      numeroDeBalise, 
      codeHS, 
      corridor, 
      typeDeVehicule, 
      immatriculation, 
      transitaire, 
      chauffeur, 
      telephone, 
      creationDate, 
      creationHeureDebut, 
      creationDateFin,
      creationHeureFin, 
      alarme, 
      clotureDate, 
      clotureHeure, 
      clotureLieu, 
      clotureMode, 
      duree
     };
  
    try {
      const response = await fetch('/cargo/donnee', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(cargoData),
      });
  
    
      if (response.ok) {
        const data = await response.json();
        console.log('Request successful:', data);
        //localStorage.setItem('token', data.token)
        // You can redirect or store the token here if needed
       // window.location.href = '/index';
      } else {
        const errorData = await response.json();
        console.error('Request failed:', errorData.message);
        alert('Request failed: ' + errorData.message);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred during login');
    }
  });
  