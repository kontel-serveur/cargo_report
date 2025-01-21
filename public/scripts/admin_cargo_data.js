document.addEventListener('DOMContentLoaded', async () => {
    const cargoId = window.location.pathname.split('/').pop();

    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/admin/cargo/${cargoId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch cargo data');
        }

        const data = await response.json();
        const cargoData = data.cargoData;
        console.log('Cargo Data:', cargoData); // Log the entire cargo data to inspect the structure

        const formatDate = (dateString) => {
            const date = new Date(dateString);
            if (isNaN(date)) return ''; // Return empty if date is invalid
            return date.toISOString().split('T')[0]; // Return in "yyyy-MM-dd" format
        };

        if(Array.isArray(cargoData.codeHS)){
            const codeHSContainer = document.getElementById('code_hs_container');
            cargoData.codeHS.forEach((code, index) => {
                const codeHSItem = document.createElement('div');
                codeHSItem.classList.add('code_hs_item')
                codeHSItem.innerHTML = `
                    <input type="text" id="code_hs" name="code_hs" value="${code.code_hs}" disabled>
                `

                codeHSContainer.appendChild(codeHSItem);
            })
        }


        if(Array.isArray(cargoData.transitaire)){
            const transitaireContainer = document.getElementById('transitaire-container');
            cargoData.transitaire.forEach((transitaire, index) => {
                const transitaireItem = document.createElement('div');
                transitaireItem.classList.add('transitaire_item')
                transitaireItem.innerHTML = `
                    <input type="text" id="transitaire" name="transitaire" value="${transitaire.Transitaire}" disabled>
                `

                transitaireContainer.appendChild(transitaireItem);
            })
        }

        // Check if alarme is defined and is an array
        if (Array.isArray(cargoData.alarme)) {
            const alarmeContainer = document.getElementById('alarme-container');
            cargoData.alarme.forEach((alarme, index) => {
                const alarmeItem = document.createElement('div');
                alarmeItem.classList.add('alarme-item');

                alarmeItem.innerHTML = `
                    <div class="formbold-input-flex">
                        <div>
                            <label for="alarme_niveau_${index}" class="formbold-form-label">Niveau</label>
                            <input type="number" id="alarme_niveau_${index}" name="alarme[niveau]" value="${alarme.niveau || ''}" class="formbold-form-input" disabled />
                        </div>
                        <div>
                            <label for="alarme_date_${index}" class="formbold-form-label">Date</label>
                            <input type="date" id="alarme_date_${index}" name="alarme[date]" value="${formatDate(alarme.date) || ''}" class="formbold-form-input" disabled />
                        </div>
                    </div>

                    <div class="formbold-input-flex">
                        <div>
                            <label for="alarme_heure_${index}" class="formbold-form-label">Heure</label>
                            <input type="time" id="alarme_heure_${index}" name="alarme[heure]" value="${alarme.heure || ''}" class="formbold-form-input" disabled />
                        </div>
                        <div>
                            <label for="alarme_lieu_${index}" class="formbold-form-label">Lieu</label>
                            <input type="text" id="alarme_lieu_${index}" name="alarme[lieu]" value="${alarme.lieu || ''}" class="formbold-form-input" disabled />
                        </div>
                    </div>

                    <div>
                        <label for="alarme_observation_${index}" class="formbold-form-label">Observation</label>
                        <textarea rows="6" id="alarme_observation_${index}" name="alarme[observation]" class="formbold-form-input" disabled>${alarme.observation || ''}</textarea>
                    </div>
                `;

                alarmeContainer.appendChild(alarmeItem);
            });
        } else {
            console.warn('Alarme data is not available or not an array', cargoData[0].alarme);
        }

        // Helper function to safely assign values
        const setInputValue = (id, value) => {
            const input = document.getElementById(id);
            if (input) {
                input.value = value || ''; // Assign an empty string if value is undefined
            }
        };

        // Fill other form fields
        setInputValue('numero_de_transit', cargoData.numeroDeTransit);
        setInputValue('numero_de_la_balise', cargoData.numeroDeBalise);
       // setInputValue('code_hs', cargoData.codeHS);
        setInputValue('corridor', cargoData.corridor);
        setInputValue('type_de_vehicule', cargoData.typeDeVehicule);
        setInputValue('immatriculation', cargoData.immatriculation);
      //  setInputValue('transitaire', cargoData.transitaire);
        setInputValue('chauffeur', cargoData.chauffeur);
        setInputValue('telephone', cargoData.telephone);
        setInputValue('creation_date', cargoData.creationDate);
        setInputValue('creation_heure_debut', cargoData.creationHeureDebut);
        setInputValue('creation_heure_fin', cargoData.creationHeureFin);
        setInputValue('cloture_date', cargoData.clotureDate);
        setInputValue('cloture_heure', cargoData.clotureHeure);
        setInputValue('cloture_lieu', cargoData.clotureLieu);
        setInputValue('cloture_mode', cargoData.clotureMode);
        setInputValue('duree', cargoData.duree);
        setInputValue('user', cargoData.userFullName);

    } catch (error) {
        console.error('Error fetching cargo data:', error);
        alert('An error occurred while fetching the cargo data.');
    }

    const cargoForm = document.getElementById('cargoForm');
    cargoForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const cargoId = window.location.pathname.split('/').pop();
        
        const numeroDeTransit = document.getElementById('numero_de_transit').value;
        const numeroDeBalise = document.getElementById('numero_de_la_balise').value;
        //const codeHS = document.getElementById('code_hs').value;
       // const codeContainer = document.getElementById('code-container');
        const codeItems = codeContainer.querySelectorAll('.code_hs_item');
    
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
            const niveau = alarmeItem.querySelector('input[name="alarme[niveau]"]').value;
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

             const token = localStorage.getItem('token');
             try {
                const response = await fetch(`/admin/cargo-update/${cargoId}`, {
                  method: 'PATCH',
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
                  location.reload();
                } else {
                  const errorData = await response.json();
                  console.error('Request failed:', errorData.message);
                  alert('Request failed: ' + errorData.message);
                }
              } catch (error) {
                console.error('Error:', error);
                alert('An error occurred during updating');
              }
      });
});
