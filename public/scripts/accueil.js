document.addEventListener('DOMContentLoaded', async function () {
        const cargoTable = $('#cargoTable'); // jQuery selector for the table
        const exportButton = document.getElementById('exportExcel');
        let cargoData = []; // Array to hold the fetched data

        // Fetch cargo data
        async function fetchCargoData() {
            try {
                const token = localStorage.getItem('token'); // Get token from local storage
                const response = await fetch('/cargo/donnee', {
                    method: 'GET',
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (response.ok) {
                    const data = await response.json();
                    cargoData = data.cargoData;
                    initializeTable(data.cargoData);
                } else {
                    const errorData = await response.json();
                    console.error('Request failed:', errorData.message);
                    alert('Request failed: ' + errorData.message);
                }
            } catch (error) {
                console.error('Error:', error);
                alert('An error occurred while fetching data');
            }
        }

        // Populate table with data and initialize DataTables
        function initializeTable(data) {
            table = cargoTable.DataTable({
                data: data,
                columns: [
                    { data: 'numeroDeTransit', title: 'Numero de transit' },
                    { data: 'numeroDeBalise', title: 'Numero de la balise' },
                    //{ data: 'codeHS', title: 'Code Hs' },
                    {
                        data: 'codeHS',
                        title: 'Code Hs',
                        render: function (data) {
                            // Check if data is an array and map to extract 'code_hs' values
                            return Array.isArray(data)
                                ? data.map(item => item.code_hs).join(', ') // Join the extracted 'code_hs' values
                                : '';
                        },
                    },
                    { data: 'corridor', title: 'Corridor' },
                    { data: 'typeDeVehicule', title: 'Type de vehicule' },
                    { data: 'immatriculation', title: 'Immatriculation' },
                    { data: 'transitaire', title: 'Transitaire' },
                ],
                destroy: true, // Allows re-initializing the DataTable if called again
            });
    
            // Add click event listener to table rows
            $('#cargoTable tbody').on('click', 'tr', function () {
                const rowData = table.row(this).data();
                if (rowData) {
                    // Redirect to the desired URL with row-specific data
                    window.location.href = `/donnee/${rowData.id}`;
                }
            });
        }

        

        // Export data to Excel
        exportButton.addEventListener('click', function () {
            if (cargoData.length === 0) {
                alert('No data to export.');
                return;
            }

            const formatDate = (dateString) => {
                const date = new Date(dateString);
                if (isNaN(date)) return ''; // Return empty if date is invalid
                return date.toISOString().split('T')[0]; // Return in "yyyy-MM-dd" format
            };
        
            // Format data for Excel
            const worksheetData = cargoData.map(cargo => ({
                'Numero de transit': cargo.numeroDeTransit,
                'Numero de la balise': cargo.numeroDeBalise,
                'Code Hs': cargo.codeHS,
                'Corridor': cargo.corridor,
                'Type de vehicule': cargo.typeDeVehicule,
                'Immatriculation': cargo.immatriculation,
                'Transitaire': cargo.transitaire,
                'Chauffeur': cargo.chauffeur,
                'Telephone': cargo.telephone,
                'Creation Date': cargo.creationDate,
                'Creation Heure Debut': cargo.creationHeureDebut,
                'Creation Heure Fin': cargo.creationHeureFin,
                'Alarme': cargo.alarme.map(alarme => 
                    `Niveau: ${alarme.niveau || 'N/A'}, Date: ${formatDate(alarme.date) || 'N/A'}, Heure: ${alarme.heure || 'N/A'}, Lieu: ${alarme.lieu || 'N/A'}, Observation: ${alarme.observation || 'N/A'}`
                ).join(' | '), // Join multiple alarmes with a delimiter
                'Cloture Date': cargo.clotureDate,
                'Cloture Heure': cargo.clotureHeure,
                'Cloture Lieu': cargo.clotureLieu,
                'Cloture Mode': cargo.clotureMode,
                'Duree': cargo.duree,
            }));

            const worksheet = XLSX.utils.json_to_sheet(worksheetData);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Cargo Data');
            XLSX.writeFile(workbook, 'CargoData.xlsx');
        });

        // Fetch and display data on page load
        fetchCargoData();
    });