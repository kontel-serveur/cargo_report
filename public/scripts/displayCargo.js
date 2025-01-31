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
        const depassementDelai = data.depassementDelai;
        const cableDeverouille = data.cableDeverouille;
        console.log('Cargo Data:', cargoData); // Log the entire cargo data to inspect the structure
        console.log(cableDeverouille)

        const formatDate = (dateString) => {
            const date = new Date(dateString);
            if (isNaN(date)) return ''; // Return empty if date is invalid
            return date.toISOString().split('T')[0]; // Return in "yyyy-MM-dd" format
        };

        if(Array.isArray(cargoData[0].codeHS)){
            const codeHSContainer = document.getElementById('code_hs_container');
            cargoData[0].codeHS.forEach((code, index) => {
                const codeHSItem = document.createElement('div');
                codeHSItem.innerHTML = `
                    <input type="text" id="code_hs" name="code_hs" value="${code.code_hs}" disabled>
                `

                codeHSContainer.appendChild(codeHSItem);
            })
        }

        if(Array.isArray(cargoData[0].transitaire)){
            const transitaireContainer = document.getElementById('transitaire_container');
            cargoData[0].transitaire.forEach((transitaire, index) => {
                const transitaireItem = document.createElement('div');
                transitaireItem.innerHTML = `
                    <input type="text" id="transitaire_${index}" name="transitaire" value="${transitaire.Transitaire}" disabled>
                `

                transitaireContainer.appendChild(transitaireItem);
            })
        }

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
                            <label for="alarme_date_${index}" class="formbold-form-label">Type</label>
                            <input type="text" id="alarme_type_${index}" name="alarme[type]" value="${alarme.type || ''}" class="formbold-form-input" disabled />
                        </div>
                        
                    </div>

                    <div class="formbold-input-flex">
                        <div>
                            <label for="alarme_heure_${index}" class="formbold-form-label">Heure</label>
                            <input type="time" id="alarme_heure_${index}" name="alarme[heure]" value="${alarme.heure || ''}" class="formbold-form-input" disabled />
                        </div>

                        <div>
                            <label for="alarme_date_${index}" class="formbold-form-label">Date</label>
                            <input type="date" id="alarme_date_${index}" name="alarme[date]" value="${formatDate(alarme.date) || ''}" class="formbold-form-input" disabled />
                        </div>
                        
                    </div>

                    <div>
                            <label for="alarme_lieu_${index}" class="formbold-form-label">Lieu</label>
                            <input type="text" id="alarme_lieu_${index}" name="alarme[lieu]" value="${alarme.lieu || ''}" class="formbold-form-input" disabled />
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



        if (Array.isArray(depassementDelai)) {
            const observationContainer = document.getElementById('observation-container-item');
        
            depassementDelai.forEach((item, index) => {
                // Check if 'observation' is an array
                
                if (Array.isArray(item.observation) && item.observation.length > 0) {
                    item.observation.forEach((obs, obsIndex) => {
                      
                        const observationItem = document.createElement('div');
                        observationItem.classList.add('observation-item-data');
        
                        observationItem.innerHTML = `
                            <div class="formbold-input-flex">
                                <div>
                                    <label for="observation_niveau_${index}_${obsIndex}" class="formbold-form-label">Niveau</label>
                                    <input type="number" id="observation_niveau_${index}_${obsIndex}" name="observation[niveau]" value="${obs.niveau || ''}" class="formbold-form-input" disabled />
                                </div>
                            </div>
        
                            <div>
                                <label for="observation_observation_${index}_${obsIndex}" class="formbold-form-label">Observation</label>
                                <textarea rows="6" id="observation_observation_${index}_${obsIndex}" name="observation[observation]" class="formbold-form-input" disabled>${obs.observation || ''}</textarea>
                            </div>
                        `;
        
                        observationContainer.appendChild(observationItem);
                    });
                } else {
                    console.warn(`Item ${index} does not contain a valid observation array`, item);
                }
            });
        } else {
            console.warn('Alarme data is not available or not an array', depassementDelai);
        }
        
        // Helper function to safely assign values
        const setInputValue = (id, value) => {
            const input = document.getElementById(id);
            if (input) {
                input.value = value || ''; // Assign an empty string if value is undefined
            }
        };

        const clotureDate = cargoData[0].clotureDate; 

        const buttons = [
            document.getElementById("addUserButton"),
            document.getElementById("addCableButton"),
            document.getElementById("addCommentButton"),
            document.getElementById("addAlarmeButton"),
            document.getElementById("addClotureButton")
        ];
        
        // Disable buttons if clotureDate is not null
        if (clotureDate) {
            buttons.forEach(button => button.disabled = true);
        }

        // Fill other form fields
        setInputValue('numero_de_transit', cargoData[0].numeroDeTransit);
        setInputValue('numero_de_la_balise', cargoData[0].numeroDeBalise);
     //   setInputValue('code_hs', cargoData[0].codeHS);
        setInputValue('corridor', cargoData[0].corridor);
        setInputValue('type_de_vehicule', cargoData[0].typeDeVehicule);
        setInputValue('immatriculation', cargoData[0].immatriculation);
      //  setInputValue('transitaire', cargoData[0].transitaire);
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

$(document).ready(function () {
    const token = localStorage.getItem('token');
    const cargoId = window.location.pathname.split('/').pop();

    const fetchCargoData = async () => {
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
    
            // Extract creation date and time
            const creationDate = cargoData[0].creationDate; // Assuming it's in YYYY-MM-DD format
            const creationTime = cargoData[0].creationHeureFin; // Assuming it's in HH:MM format
    
            return { creationDate, creationTime };
        } catch (error) {
            console.error("Error fetching cargo data:", error);
            return null;
        }
    };

    $('#addUserButton').click(function () {
        $('#addUserModal').modal('show');
    });


    const $addAlarmeBtn = $('#add-alarme-btn');
    const $alarmeContainer = $('#observation-container');

    // Add a new alarme section
    $addAlarmeBtn.on('click', () => {
        const $alarmeItem = $('.observation-item').first().clone();

        // Clear input values
        $alarmeItem.find('input, textarea').val('');

        // Append the new section
        $alarmeContainer.append($alarmeItem);

        // Reattach remove event
        attachRemoveEvent();
    });

    // Remove a section
    const attachRemoveEvent = () => {
        $('.remove-alarme-btn').off('click').on('click', function (event) {
            if ($('.observation-item').length > 1) {
                $(this).closest('.observation-item').remove();
            } else {
                alert('At least one observation is required.');
            }
        });
    };

    attachRemoveEvent();

    const getObservationData = () => {
        const observationData = [];
        $('.observation-item').each(function () {
            const $item = $(this);
            const niveau = $item.find('select[name="observation[niveau]"]').val();
            const observation = $item.find('textarea[name="observation[observation]"]').val();

            // Add each alarm object to the array
            observationData.push({ niveau, observation });
        });
        return observationData;
    };

    $('#addUserForm').submit(function (e) {
        e.preventDefault();

        const formData = {
            observation: getObservationData(),
        };

        $.ajax({
            url: `/cargo/depassement-delai/${cargoId}`,
            type: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            data: JSON.stringify(formData),
            success: function (response) {
                alert('Depassement de delai enregistre avec success');
                console.log(response)
                $('#addUserModal').modal('hide');
                //table.ajax.reload();
            },
            error: function (error) {
                alert("Erreur d'enregistrement du depassement de delai: " + error.responseText);
            },
        });
    });


    $('#addCableButton').click(function () {
        $('#addCableModal').modal('show');
    });

    fetchCargoData().then(data => {
        if (data) {
          const { creationDate, creationTime } = data;
    
          // Replace with actual creation date and time dynamically
          const $cableDateInput = $('input[name="cable_date"]');
          const $cableHeureInput = $('input[name="cable_time"]');
    
          // Set the minimum selectable date to the creation date
          $cableDateInput.attr('min', creationDate);
    
          // Function to update the minimum selectable heure (time) based on selected date
          function updateMinHeure() {
            const selectedDate = $cableDateInput.val();
            if (selectedDate === creationDate) {
              // Set min hour for current date to be just after the creation heure
              $cableHeureInput.attr('min', creationTime);
            } else {
              // Allow any time for other dates
              $cableHeureInput.removeAttr('min');
            }
          }
    
          // Event listener to update min time when date changes
          $cableDateInput.on('input', function() {
            updateMinHeure();
          });
    
          // Ensure time is not set before the minimum allowed time (based on creation hour)
          $cableHeureInput.on('input', function() {
            const selectedHeure = $cableHeureInput.val();
            if (selectedHeure && selectedHeure < creationTime) {
              // If heure is less than creationHeure, reset it to the creation heure
              $cableHeureInput.val(creationTime);
            }
          });
    
          // Call the updateMinHeure function on page load to set the min heure correctly
          updateMinHeure();
        }
      });

    // Handle form submission
    $('#addCableForm').submit(function (e) {
        e.preventDefault(); // Prevent default form submission

        const formData = {
            dateCoupure: $('#cable_date').val(),
            heureCoupure: $('#cable_time').val(),
           
        };

        $.ajax({
            url: `/cargo/cable-deverouille/${cargoId}`,
            type: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            data: JSON.stringify(formData),
            success: function (response) {
                alert('Cable deverouile enregistre avec success');
                $('#addCableModal').modal('hide'); // Hide the modal
                console.log(response)
                table.ajax.reload(); // Reload the table data
            },
            error: function (error) {
                alert("Erreur d'enregistrement du cable deverouille: " + error.responseText);
            },
        });
    });


    $('#addCommentButton').click(function () {
        $('#addCommentModal').modal('show');
    });

    // Handle form submission
    $('#addCommentForm').submit(function (e) {
        e.preventDefault(); // Prevent default form submission

        const formData = {
            commentaire: $('#commentaire').val(),
           
        };

        $.ajax({
            url: `/cargo/cas-suspect/${cargoId}`,
            type: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            data: JSON.stringify(formData),
            success: function (response) {
                alert('Cas suspect enregistre avec success');
                $('#addCommentModal').modal('hide'); // Hide the modal
                console.log(response)
                table.ajax.reload(); // Reload the table data
            },
            error: function (error) {
                alert("Erreur d'enregistrement du cas suspect: " + error.responseText);
            },
        });
    });



    $('#addAlarmeButton').click(function () {
        $('#addAlarmeModal').modal('show');
    });
    
    // Button and container selectors
    const $addAlarmeFormBtn = $('#add-alarme-form-btn');
    const $alarmeFormContainer = $('#alarme-form-container');
    
    // Add a new alarme section
    $addAlarmeFormBtn.on('click', () => {
        // Clone the first .alarme-form-item
        const $alarmeFormItem = $('.alarme-form-item').first().clone();
    
        // Clear input and textarea values
        $alarmeFormItem.find('select, textarea').val('');
    
        // Append the new section
        $alarmeFormContainer.append($alarmeFormItem);
    
        // Reattach remove event to the new button
        attachRemoveEventAlarme();
    });

    $(document).on('change', 'select[name="alarme[niveau]"]', function () {
        const niveau = $(this).val();
        const $typeSelect = $(this).closest('.alarme-form-item').find('select[name="alarme[type]"]');

        // Clear previous options
        $typeSelect.empty();

        // Add relevant options based on Niveau
        if (niveau === "2") {
            $typeSelect.append('<option value="Delai d\'expiration du transit">Delai d\'expiration du transit</option>');
        } else if (niveau === "3") {
            $typeSelect.append('<option value="Deviation de la route autorisee">Deviation de la route autorisee</option>');
            $typeSelect.append('<option value="Demi-tour">Demi-tour</option>');
            $typeSelect.append('<option value="Arret en zone dangereuse">Arret en zone dangereuse</option>');
            $typeSelect.append('<option value="Delai d\'expiration de la confirmation du retrait de l\'unite">Delai d\'expiration de la confirmation du retrait de l\'unite</option>');
            $typeSelect.append('<option value="Cable de securite deverouilee">Cable de securite deverouilee</option>');
            $typeSelect.append('<option value="Unite enlevee hors d\'une zone sure">Unite enlevee hors d\'une zone sure</option>');
        } else {
            // Default option if no Niveau is selected
            $typeSelect.append('<option value="">Choisissez le type d\'alarme</option>');
        }
    });


    fetchCargoData().then(data => {
        if (data) {
          const { creationDate, creationTime } = data;
    
          // Replace with actual creation date and time dynamically
          const $alarmeDateInput = $('input[name="alarme[date]"]');
          const $alarmeHeureInput = $('input[name="alarme[heure]"]');
    
          // Set the minimum selectable date to the creation date
          $alarmeDateInput.attr('min', creationDate);
    
          // Function to update the minimum selectable heure (time) based on selected date
          function updateMinHeure() {
            const selectedDate = $alarmeDateInput.val();
            if (selectedDate === creationDate) {
              // Set min hour for current date to be just after the creation heure
              $alarmeHeureInput.attr('min', creationTime);
            } else {
              // Allow any time for other dates
              $alarmeHeureInput.removeAttr('min');
            }
          }
    
          // Event listener to update min time when date changes
          $alarmeDateInput.on('input', function() {
            updateMinHeure();
          });
    
          // Ensure time is not set before the minimum allowed time (based on creation hour)
          $alarmeHeureInput.on('input', function() {
            const selectedHeure = $alarmeHeureInput.val();
            if (selectedHeure && selectedHeure < creationTime) {
              // If heure is less than creationHeure, reset it to the creation heure
              $alarmeHeureInput.val(creationTime);
            }
          });
    
          // Call the updateMinHeure function on page load to set the min heure correctly
          updateMinHeure();
        }
      });
    
    // Remove a section
    const attachRemoveEventAlarme = () => {
        $('.remove-alarme-btn').off('click').on('click', function () {
            if ($('.alarme-form-item').length > 1) {
                // Remove the closest .alarme-form-item
                $(this).closest('.alarme-form-item').remove();
            } else {
                alert('Au moins une observation est requise.');
            }
        });
    };
    
    // Attach events to existing elements on page load
    attachRemoveEventAlarme();


    const getAlarmeData = () => {
        const alarmeData = [];
        $('.alarme-form-item').each(function () {
            const $item = $(this);
            const niveau = $item.find('select[name="alarme[niveau]"]').val();
            const type = $item.find('select[name="alarme[type]"]').val();
            const date = $item.find('input[name="alarme[date]"]').val();
            const heure = $item.find('input[name="alarme[heure]"]').val();
            const lieu = $item.find('input[name="alarme[lieu]"]').val();
            const observation = $item.find('textarea[name="alarme[observation]"]').val();

            // Add each alarm object to the array
            alarmeData.push({ niveau, type, date, heure, lieu, observation });
        });
        return alarmeData;
    };

    $('#addAlarmeForm').submit(function (e) {
        e.preventDefault();

        const formData = {
            alarme: getAlarmeData(),
        };

        $.ajax({
            url: `/cargo/alarme/${cargoId}`,
            type: 'PATCH',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            data: JSON.stringify(formData),
            success: function (response) {
                alert('Alarme enregistre avec success');
                console.log(response)
                $('#addAlarmeModal').modal('hide');
                //table.ajax.reload();
            },
            error: function (error) {
                alert("Erreur d'enregistrement de l'alarme: " + error.responseText);
            },
        });



        
    });


    $('#addClotureButton').click(function () {
        $('#addClotureModal').modal('show');
    });

    fetchCargoData().then(data => {
        if (data) {
          const { creationDate, creationTime } = data;
    
          // Replace with actual creation date and time dynamically
          const $clotureDateInput = $('input[name="cloturedate"]');
          const $clotureHeureInput = $('input[name="clotureheure"]');
    
          // Set the minimum selectable date to the creation date
          $clotureDateInput.attr('min', creationDate);
    
          // Function to update the minimum selectable heure (time) based on selected date
          function updateMinHeure() {
            const selectedDate = $clotureDateInput.val();
            if (selectedDate === creationDate) {
              // Set min hour for current date to be just after the creation heure
              $clotureHeureInput.attr('min', creationTime);
            } else {
              // Allow any time for other dates
              $clotureHeureInput.removeAttr('min');
            }
          }
    
          // Event listener to update min time when date changes
          $clotureDateInput.on('input', function() {
            updateMinHeure();
          });
    
          // Ensure time is not set before the minimum allowed time (based on creation hour)
          $clotureHeureInput.on('input', function() {
            const selectedHeure = $clotureHeureInput.val();
            if (selectedHeure && selectedHeure < creationTime) {
              // If heure is less than creationHeure, reset it to the creation heure
              $clotureHeureInput.val(creationTime);
            }
          });
    
          // Call the updateMinHeure function on page load to set the min heure correctly
          updateMinHeure();
        }
      });

    // Handle form submission
    $('#addClotureForm').submit(function (e) {
        e.preventDefault(); // Prevent default form submission

        const formData = {
            clotureDate: $('#cloturedate').val(),
            clotureHeure: $('#clotureheure').val(),
            clotureLieu: $('#cloturelieu').val(),
            clotureMode: $('#cloturemode').val(),
           
        };

        $.ajax({
            url: `/cargo/cloture/${cargoId}`,
            type: 'PATCH',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            data: JSON.stringify(formData),
            success: function (response) {
                alert('Transit cloture avec success');
                $('#addClotureModal').modal('hide'); // Hide the modal
                console.log(response)
                table.ajax.reload(); // Reload the table data
            },
            error: function (error) {
                alert("Erreur d'enregistrement de la cloture: " + error.responseText);
            },
        });
    });
});
