const stepMenuOne = document.querySelector('.formbold-step-menu1');
const stepMenuTwo = document.querySelector('.formbold-step-menu2');
const stepMenuThree = document.querySelector('.formbold-step-menu3');

const stepOne = document.querySelector('.formbold-form-step-1');
const stepTwo = document.querySelector('.formbold-form-step-2');
const stepThree = document.querySelector('.formbold-form-step-3');

const formSubmitBtn = document.querySelector('.formbold-btn');
const formBackBtn = document.querySelector('.formbold-back-btn');

const alarmeContainer = document.getElementById('alarme-container');
const addAlarmeBtn = document.getElementById('add-alarme-btn');

// Add a new alarme section
addAlarmeBtn.addEventListener('click', () => {
  const alarmeItem = document.querySelector('.alarme-item').cloneNode(true);

  // Clear input values
  alarmeItem.querySelectorAll('input, textarea').forEach(input => {
    input.value = '';
  });

  // Append the new section
  alarmeContainer.appendChild(alarmeItem);

  // Reattach remove event
  attachRemoveEvent();
});

// Remove a section
const attachRemoveEvent = () => {
  document.querySelectorAll('.remove-alarme-btn').forEach(button => {
    button.addEventListener('click', (event) => {
      if (document.querySelectorAll('.alarme-item').length > 1) {
        event.target.closest('.alarme-item').remove();
      } else {
        alert('At least one alarme is required.');
      }
    });
  });
};

attachRemoveEvent();



const codeContainer = document.getElementById('code-container');
const addCodeBtn = document.getElementById('add-code-btn');

// Add a new alarme section
addCodeBtn.addEventListener('click', () => {
  const codeItem = document.querySelector('.code-item').cloneNode(true);

  // Clear input values
  codeItem.querySelectorAll('input').forEach(input => {
    input.value = '';
  });

  // Append the new section
  codeContainer.appendChild(codeItem);

  // Reattach remove event
  attachRemoveCodeEvent();
});

// Remove a section
const attachRemoveCodeEvent = () => {
  document.querySelectorAll('.remove-code-btn').forEach(button => {
    button.addEventListener('click', (event) => {
      if (document.querySelectorAll('.code-item').length > 1) {
        event.target.closest('.code-item').remove();
      } else {
        alert('At least one code is required.');
      }
    });
  });
};

attachRemoveCodeEvent();

// Forward Navigation
formSubmitBtn.addEventListener("click", function(event) {
  event.preventDefault();

  if (stepMenuOne.classList.contains('active')) {
    stepMenuOne.classList.remove('active');
    stepMenuTwo.classList.add('active');
    
    stepOne.classList.remove('active');
    stepTwo.classList.add('active');
    
    formBackBtn.classList.add('active');
  } else if (stepMenuTwo.classList.contains('active')) {
    stepMenuTwo.classList.remove('active');
    stepMenuThree.classList.add('active');
    
    stepTwo.classList.remove('active');
    stepThree.classList.add('active');
    
    formBackBtn.classList.add('active'); // Ensure back button stays visible
    formSubmitBtn.textContent = 'Submit'; // Change button text to "Submit"
  } else if (stepMenuThree.classList.contains('active')) {
    // Ensure the form is selected correctly and then submit
    const form = document.querySelector('#cargoForm');
    if (form) {
      console.log('form submitting')

      async function submit(){
        const token = localStorage.getItem('token');
  
    
        const numeroDeTransit = document.getElementById('numero_de_transit').value;
        const numeroDeBalise = document.getElementById('numero_de_la_balise').value;
        //const codeHS = document.getElementById('code_hs').value;

        const codeContainer = document.getElementById('code-container');
        const codeItems = codeContainer.querySelectorAll('.code-item');
    
        const codeHS = [];
        
        codeItems.forEach((codeItem) => {
            const code_hs = codeItem.querySelector('input[name="code[code_hs]"]').value;
            
    
            // Add each alarm object to the alarmData array
            codeHS.push({
                code_hs
                
            });
        });

        const corridor = document.getElementById('corridor').value;
        const typeDeVehicule = document.getElementById('type_de_vehicule').value;
        const immatriculation = document.getElementById('immatriculation').value;
        const transitaire = document.getElementById('transitaire').value;
        const chauffeur = document.getElementById('chauffeur').value;
        const telephone = document.getElementById('telephone').value;
        const creationDate = document.getElementById('creation_date').value;
        const creationHeureDebut = document.getElementById('creation_heure_debut').value;
        const creationHeureFin = document.getElementById('creation_heure_fin').value;
        
        const alarmeContainer = document.getElementById('alarme-container');
    const alarmItems = alarmeContainer.querySelectorAll('.alarme-item');

    const alarme = [];
    
    alarmItems.forEach((alarmeItem) => {
        const niveau = alarmeItem.querySelector('select[name="alarme[niveau]"]').value;
        const date = alarmeItem.querySelector('input[name="alarme[date]"]').value;
        const heure = alarmeItem.querySelector('input[name="alarme[heure]"]').value;
        const lieu = alarmeItem.querySelector('input[name="alarme[lieu]"]').value;
        const observation = alarmeItem.querySelector('textarea[name="alarme[observation]"]').value;

        // Add each alarm object to the alarmData array
        alarme.push({
            niveau,
            date,
            heure,
            lieu,
            observation
        });
    });
    
        
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
          creationHeureFin, 
          alarme, 
          clotureDate, 
          clotureHeure, 
          clotureLieu, 
          clotureMode, 
          duree
         };
      
        try {
          const response = await fetch('/cargo/ajout', {
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
            alert(data);
            window.location.href = '/accueil';
          } else {
            const errorData = await response.json();
            console.error('Request failed:', errorData.message);
            alert('Request failed: ' + errorData.message);
          }
        } catch (error) {
          console.error('Error:', error);
          alert('An error occurred during login');
        }

        
      }
      submit()
      //form.submit();
    } else {
      console.error('Form not found!');
    }
  }
});

// Backward Navigation
formBackBtn.addEventListener("click", function(event) {
  event.preventDefault();

  if (stepMenuThree.classList.contains('active')) {
    stepMenuThree.classList.remove('active');
    stepMenuTwo.classList.add('active');
    
    stepThree.classList.remove('active');
    stepTwo.classList.add('active');
    
    formSubmitBtn.textContent = 'Next'; // Reset the button text to "Next"
  } else if (stepMenuTwo.classList.contains('active')) {
    stepMenuTwo.classList.remove('active');
    stepMenuOne.classList.add('active');
    
    stepTwo.classList.remove('active');
    stepOne.classList.add('active');
    
    formBackBtn.classList.remove('active'); // Hide back button on step 1
  }
});
