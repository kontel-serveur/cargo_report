document.addEventListener('DOMContentLoaded', async () => {
    const cargoId = window.location.pathname.split('/').pop();

    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/cargo/donnee/${cargoId}`, {
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

        // Check if alarme is defined and is an array
        if (Array.isArray(cargoData[0].alarme)) {
            const alarmeContainer = document.getElementById('alarme-container');
            cargoData[0].alarme.forEach((alarme, index) => {
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
        setInputValue('numero_de_transit', cargoData[0].numeroDeTransit);
        setInputValue('numero_de_la_balise', cargoData[0].numeroDeBalise);
        setInputValue('code_hs', cargoData[0].codeHS);
        setInputValue('corridor', cargoData[0].corridor);
        setInputValue('type_de_vehicule', cargoData[0].typeDeVehicule);
        setInputValue('immatriculation', cargoData[0].immatriculation);
        setInputValue('transitaire', cargoData[0].transitaire);
        setInputValue('chauffeur', cargoData[0].chauffeur);
        setInputValue('telephone', cargoData[0].telephone);
        setInputValue('creation_date', cargoData[0].creationDate);
        setInputValue('creation_heure_debut', cargoData[0].creationHeureDebut);
        setInputValue('creation_heure_fin', cargoData[0].creationHeureFin);
        setInputValue('cloture_date', cargoData[0].clotureDate);
        setInputValue('cloture_heure', cargoData[0].clotureHeure);
        setInputValue('cloture_lieu', cargoData[0].clotureLieu);
        setInputValue('cloture_mode', cargoData[0].clotureMode);
        setInputValue('duree', cargoData[0].duree);

    } catch (error) {
        console.error('Error fetching cargo data:', error);
        alert('An error occurred while fetching the cargo data.');
    }
});
