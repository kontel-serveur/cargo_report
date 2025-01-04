document.addEventListener('DOMContentLoaded', async () => {
    const cargoId = window.location.pathname.split('/').pop();

    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/cargo/donnee/${cargoId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch cargo data');
        }

        const data = await response.json();
        const cargoData = data.cargoData;
        console.log(cargoData);

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
                            <input type="number" id="alarme_niveau_${index}" name="alarme[niveau]" value="${alarme.niveau}" class="formbold-form-input" disabled />
                        </div>
                        <div>
                            <label for="alarme_date_${index}" class="formbold-form-label">Date</label>
                            <input type="date" id="alarme_date_${index}" name="alarme[date]" value="${alarme.date}" class="formbold-form-input" disabled />
                        </div>
                    </div>

                    <div class="formbold-input-flex">
                        <div>
                            <label for="alarme_heure_${index}" class="formbold-form-label">Heure</label>
                            <input type="time" id="alarme_heure_${index}" name="alarme[heure]" value="${alarme.heure}" class="formbold-form-input" disabled />
                        </div>
                        <div>
                            <label for="alarme_lieu_${index}" class="formbold-form-label">Lieu</label>
                            <input type="text" id="alarme_lieu_${index}" name="alarme[lieu]" value="${alarme.lieu}" class="formbold-form-input" disabled />
                        </div>
                    </div>

                    <div>
                        <label for="alarme_observation_${index}" class="formbold-form-label">Observation</label>
                        <textarea rows="6" id="alarme_observation_${index}" name="alarme[observation]" class="formbold-form-input" disabled>${alarme.observation}</textarea>
                    </div>
                `;

                alarmeContainer.appendChild(alarmeItem);
            });
        } else {
            console.warn('Alarme data is not available or not an array');
        }

        // Fill other form fields
        document.getElementById('numero_de_transit').value = cargoData.numeroDeTransit;
        document.getElementById('numero_de_la_balise').value = cargoData.numeroDeBalise;
        document.getElementById('code_hs').value = cargoData.codeHS;
        document.getElementById('corridor').value = cargoData.corridor;
        document.getElementById('type_de_vehicule').value = cargoData.typeDeVehicule;
        document.getElementById('immatriculation').value = cargoData.immatriculation;
        document.getElementById('transitaire').value = cargoData.transitaire;
        document.getElementById('chauffeur').value = cargoData.chauffeur;
        document.getElementById('telephone').value = cargoData.telephone;
        document.getElementById('creation_date').value = cargoData.creationDate;
        document.getElementById('creation_heure_debut').value = cargoData.creationHeureDebut;
        document.getElementById('creation_heure_fin').value = cargoData.creationHeureFin;
        document.getElementById('cloture_date').value = cargoData.clotureDate;
        document.getElementById('cloture_heure').value = cargoData.clotureHeure;
        document.getElementById('cloture_lieu').value = cargoData.clotureLieu;
        document.getElementById('cloture_mode').value = cargoData.clotureMode;
        document.getElementById('duree').value = cargoData.duree;

    } catch (error) {
        console.error('Error fetching cargo data:', error);
        alert('An error occurred while fetching the cargo data.');
    }
});
