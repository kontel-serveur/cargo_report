document.addEventListener('DOMContentLoaded', function () {
    const rowsPerPage = 10; // Number of rows per page
    let currentPage = 1; // Start at page 1
    let cargoData = []; // Array to hold the fetched data

    // Function to fetch and display cargo data
    async function fetchCargoData() {
        try {
            const token = localStorage.getItem('token'); // Get token from local storage
            
            const response = await fetch('/cargo/donnee', {
                method: 'GET', // Use GET method to fetch data
                headers: {
                    'Authorization': `Bearer ${token}`,
                }
            });

            if (response.ok) {
                const data = await response.json();
                cargoData = data.cargoData; // Store fetched data

                // Display data based on the current page
                displayData(currentPage);

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

    // Function to display data in the table
    function displayData(page) {
        const tableBody = document.getElementById('cargoDataBody');
        tableBody.innerHTML = ''; // Clear previous rows

        // Calculate the index range of data to display
        const startIndex = (page - 1) * rowsPerPage;
        const endIndex = startIndex + rowsPerPage;
        const paginatedData = cargoData.slice(startIndex, endIndex);

        // Loop through the data and insert rows into the table
        paginatedData.forEach(cargo => {
            const row = document.createElement('tr');
            if (cargo.id) {
                row.addEventListener('click', () => {
                    window.location.href = `/donnee/${cargo.id}`;
                });
            }
            row.innerHTML = `
                <td>${cargo.numeroDeTransit}</td>
                <td>${cargo.numeroDeBalise}</td>
                <td>${cargo.codeHS}</td>
                <td>${cargo.corridor}</td>
                <td>${cargo.typeDeVehicule}</td>
                <td>${cargo.immatriculation}</td>
                <td>${cargo.transitaire}</td>
                
            `;


            row.style.cursor = 'pointer';
            tableBody.appendChild(row);
        });

        // Update pagination buttons
        document.getElementById('prevPage').disabled = page === 1;
        document.getElementById('nextPage').disabled = page * rowsPerPage >= cargoData.length;
    }

    document.getElementById('exportExcel').addEventListener('click', function () {
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
    
        // Create a worksheet and workbook
        const worksheet = XLSX.utils.json_to_sheet(worksheetData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Cargo Data');
    
        // Export to Excel
        XLSX.writeFile(workbook, 'CargoData.xlsx');
    });
    


    // Event listeners for pagination buttons
    document.getElementById('prevPage').addEventListener('click', function () {
        if (currentPage > 1) {
            currentPage--;
            displayData(currentPage);
        }
    });

    document.getElementById('nextPage').addEventListener('click', function () {
        if (currentPage * rowsPerPage < cargoData.length) {
            currentPage++;
            displayData(currentPage);
        }
    });

    // Call fetchCargoData on page load
    fetchCargoData();
});