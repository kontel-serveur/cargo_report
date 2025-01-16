$(document).ready(function () {
    const token = localStorage.getItem('token');

    // Initialize DataTable
    const table = $('#cargoTable').DataTable({
        ajax: {
            url: '/admin/cargo',
            type: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
            dataSrc: 'cargoData', // Path to array of data in JSON response
        },
        columns: [
            { data: 'numeroDeTransit' },
            { data: 'numeroDeBalise' },
            //{ data: 'codeHS' },
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
            { data: 'corridor' },
            { data: 'typeDeVehicule' },
            { data: 'immatriculation' },
            { data: 'transitaire' },
            {data: 'userFullName'}
        ],
    });

    $('#cargoTable tbody').on('click', 'tr', function () {
        const rowData = table.row(this).data();
        if (rowData) {
            // Redirect to the desired URL with row-specific data
            window.location.href = `/administrateur/cargo/${rowData.id}`;
        }
    });

    // Export to Excel
  /*  $('#exportExcel').click(function () {
        const data = table.ajax.json().cargoData;
        if (!data || data.length === 0) {
            alert('No data to export.');
            return;
        }

        // Format data for Excel
        const formatDate = (dateString) => {
            const date = new Date(dateString);
            if (isNaN(date)) return ''; // Return empty if date is invalid
            return date.toISOString().split('T')[0]; // Return in "yyyy-MM-dd" format
        };
        
        const worksheetData = data.map(cargo => ({
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
            'Enregistre par': cargo.userFullName
        }));

        const worksheet = XLSX.utils.json_to_sheet(worksheetData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Cargo Data');
        XLSX.writeFile(workbook, 'CargoData.xlsx');
    }); */

    $('#exportExcel').click(function () {
        window.location.href = '/exportExcel';
      
});

});