const stepMenuOne = document.querySelector('.formbold-step-menu1');
const stepMenuTwo = document.querySelector('.formbold-step-menu2');
const stepMenuThree = document.querySelector('.formbold-step-menu3');

const stepOne = document.querySelector('.formbold-form-step-1');
const stepTwo = document.querySelector('.formbold-form-step-2');
const stepThree = document.querySelector('.formbold-form-step-3');

const formSubmitBtn = document.querySelector('.formbold-btn');
const formBackBtn = document.querySelector('.formbold-back-btn');

//const alarmeContainer = document.getElementById('alarme-container');
//const addAlarmeBtn = document.getElementById('add-alarme-btn');

// Add a new alarme section
/*addAlarmeBtn.addEventListener('click', () => {
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

*/

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




const transitaireContainer = document.getElementById('transitaire-container');
const addTransitaireBtn = document.getElementById('add-transitaire-btn');

// Add a new alarme section
addTransitaireBtn.addEventListener('click', () => {
  const transitaireItem = document.querySelector('.transitaire-item').cloneNode(true);

  // Clear input values
  transitaireItem.querySelectorAll('input').forEach(input => {
    input.value = '';
  });

  // Append the new section
  transitaireContainer.appendChild(transitaireItem);

  // Reattach remove event
  attachRemoveTransitaireEvent();
});

// Remove a section
const attachRemoveTransitaireEvent = () => {
  document.querySelectorAll('.remove-transitaire-btn').forEach(button => {
    button.addEventListener('click', (event) => {
      if (document.querySelectorAll('.transitaire-item').length > 1) {
        event.target.closest('.transitaire-item').remove();
      } else {
        alert('Au moins un transitaire est necessaire.');
      }
    });
  });
};

attachRemoveCodeEvent();

// Forward Navigation
/*document.getElementById('telephone').addEventListener('input', function () {
  const telephone = this.value;
  const telephoneError = document.getElementById('telephone-error');

  // Check if the phone number is exactly 8 digits
  const phoneRegex = /^\d{8}$/;
  if (!phoneRegex.test(telephone)) {
    telephoneError.style.display = 'block';  // Show the error message
  } else {
    telephoneError.style.display = 'none';  // Hide the error message
  }
}); */


document.getElementById('creation_heure_debut').addEventListener('input', updateHeureFinMin);
document.getElementById('creation_heure_fin').addEventListener('input', validateHeureFin);
document.getElementById('creation_date_fin').addEventListener('input', validateDateFin);

function updateHeureFinMin() {
  const creationHeureDebut = document.getElementById('creation_heure_debut').value;
  const creationHeureFin = document.getElementById('creation_heure_fin');

  if (creationHeureDebut) {
    // Set the 'min' attribute of 'Heure fin' to be at least 'Heure debut'
    creationHeureFin.setAttribute('min', creationHeureDebut);
  } else {
    // If no start time is selected, remove restriction
    creationHeureFin.removeAttribute('min');
  }
}

function validateHeureFin() {
  const creationHeureDebut = document.getElementById('creation_heure_debut').value;
  const creationHeureFinInput = document.getElementById('creation_heure_fin');
  const creationHeureFin = creationHeureFinInput.value;

  if (creationHeureDebut && creationHeureFin < creationHeureDebut) {
    // If 'Heure fin' is before 'Heure debut', set it equal to 'Heure debut'
  //  creationHeureFinInput.value = creationHeureDebut;
  }
}

function validateDateFin() {
  const creationDate = document.getElementById('creation_date').value;
  const creationDateFinInput = document.getElementById('creation_date_fin');

  if (creationDateFinInput.value < creationDate) {
    // If 'Date fin' is before 'Date debut', set it equal to 'Date debut'
 //   creationDateFinInput.value = creationDate;
  }
}

/*document.getElementById('creation_heure_debut').addEventListener('input', updateHeureFinMin);

function updateHeureFinMin() {
  const creationHeureDebut = document.getElementById('creation_heure_debut').value;
  const creationHeureFin = document.getElementById('creation_heure_fin');

  if (creationHeureDebut) {
    // Set the 'min' attribute of 'Heure fin' to be just after 'Heure debut'
    creationHeureFin.setAttribute('min', creationHeureDebut);
  } else {
    // If no start time is selected, allow any time for 'Heure fin'
    creationHeureFin.removeAttribute('min');
  }
}



// Ensure 'Heure fin' cannot be selected before 'Heure debut'
document.getElementById('creation_heure_fin').addEventListener('input', function () {
  const creationHeureDebut = document.getElementById('creation_heure_debut').value;
  const creationHeureFin = document.getElementById('creation_heure_fin').value;

  if (creationHeureDebut && creationHeureFin < creationHeureDebut) {
    // If 'Heure fin' is smaller than 'Heure debut', reset 'Heure fin' to match 'Heure debut'
    document.getElementById('creation_heure_fin').value = creationHeureDebut;
  }
}); */

formSubmitBtn.addEventListener("click", function (event) {
  event.preventDefault();

  if (stepMenuOne.classList.contains('active')) {
    stepMenuOne.classList.remove('active');
    stepMenuTwo.classList.add('active');

    stepOne.classList.remove('active');
    stepTwo.classList.add('active');

    formBackBtn.classList.add('active');
    formSubmitBtn.textContent = 'Soumettre'; // Change button text to "Submit"
  } else if (stepMenuTwo.classList.contains('active')) {
    // Ensure the form is selected correctly and then submit
    const form = document.querySelector('#cargoForm');

    if (form) {
      console.log('Form submitting...');

      const submit = async()=> {
        const token = localStorage.getItem('token');

        const numeroDeTransit = document.getElementById('numero_de_transit').value;
        const numeroDeBalise = document.getElementById('numero_de_la_balise').value;

        const codeContainer = document.getElementById('code-container');
        const codeItems = codeContainer.querySelectorAll('.code-item');

        const codeHS = [];
        codeItems.forEach((codeItem) => {
          const code_hs = codeItem.querySelector('input[name="code[code_hs]"]').value;
          codeHS.push({ code_hs });
        });

        const corridor = document.getElementById('corridor').value;
        const typeDeVehicule = document.getElementById('type_de_vehicule').value;
        const immatriculation = document.getElementById('immatriculation').value;

        const transitaireContainer = document.getElementById('transitaire-container');
        const transitaireItems = transitaireContainer.querySelectorAll('.transitaire-item');
        const transitaire = [];
        transitaireItems.forEach((transitaireItem) => {
          const Transitaire = transitaireItem.querySelector('input[name="transitaire[transitaire]"]').value;
          transitaire.push({ Transitaire });
        });

        const chauffeur = document.getElementById('chauffeur').value;
        const telephone = document.getElementById('telephone').value;
        const telephoneError = document.getElementById('telephone-error');

        // Check if the phone number is exactly 8 digits
        const phoneRegex = /^\d{8}$/;
        if (!phoneRegex.test(telephone)) {
       //   telephoneError.style.display = 'block'; // Show the error message if phone number is invalid
          return; // Prevent form submission if the phone number is not valid
        }

        // Hide error message before submitting
       /* telephoneError.style.display = 'none';*/
        const creationDate = document.getElementById('creation_date').value;
        const creationHeureDebut = document.getElementById('creation_heure_debut').value;
        const creationDateFin = document.getElementById('creation_date_fin').value || null;
        const creationHeureFin = document.getElementById('creation_heure_fin').value || null;

      /*  const alarmeContainer = document.getElementById('alarme-container');
        const alarmItems = alarmeContainer.querySelectorAll('.alarme-item');
        const alarme = [];
        alarmItems.forEach((alarmeItem) => {
          const niveau = alarmeItem.querySelector('select[name="alarme[niveau]"]').value;
          const date = alarmeItem.querySelector('input[name="alarme[date]"]').value;
          const heure = alarmeItem.querySelector('input[name="alarme[heure]"]').value;
          const lieu = alarmeItem.querySelector('input[name="alarme[lieu]"]').value;
          const observation = alarmeItem.querySelector('textarea[name="alarme[observation]"]').value;
          alarme.push({ niveau, date, heure, lieu, observation });
        });*/

        // Cloture fields are null
        const alarme = [];
        const clotureDate = null;
        const clotureHeure = null;
        const clotureLieu = null;
        const clotureMode = null;
        const duree = null;

        // Prepare the cargo data including the calculated duree
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
          duree, // Include duree here
        };

        console.log(cargoData)

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
           // alert('Cargo added successfully');
           alert(data)
            window.location.href = '/accueil';
          } else {
            const errorData = await response.json();
            console.error('Request failed:', errorData.message);
            alert('Request failed: ' + errorData.message);
          }
        } catch (error) {
          console.error('Error:', error);
          alert('An error occurred during submission');
        }
      }

      submit();
    } else {
      console.error('Form not found!');
    }
  }
});


// Backward Navigation
formBackBtn.addEventListener("click", function(event) {
  event.preventDefault();

  if (stepMenuTwo.classList.contains('active')) {
    stepMenuTwo.classList.remove('active');
    stepMenuOne.classList.add('active');
    
    stepTwo.classList.remove('active');
    stepOne.classList.add('active');
    
    formBackBtn.classList.remove('active'); // Hide back button on step 1
    formSubmitBtn.textContent = 'Suivant';
  }
});
