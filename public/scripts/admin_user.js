$(document).ready(function () {
    const token = localStorage.getItem('token');
    
    // Initialize DataTable
    const table = $('#userTable').DataTable({
        ajax: {
            url: '/admin/users',
            type: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
            dataSrc: 'users', // Path to array of data in JSON response
        },
        columns: [
            { data: 'email' },
            { data: 'fullName' },
            { data: 'allowed' },
            { data: 'admin' }
        ],
    });


    $('#userTable tbody').on('click', 'tr', function () {
        const rowData = table.row(this).data();
        if (rowData) {
            // Redirect to the desired URL with row-specific data
            window.location.href = `/administrateur/utilisateur/${rowData.id}`;
        }
    });

    $('#addUserButton').click(function () {
        $('#addUserModal').modal('show');
    });

    // Handle form submission
    $('#addUserForm').submit(function (e) {
        e.preventDefault(); // Prevent default form submission

        const formData = {
            email: $('#email').val(),
            fullName: $('#fullName').val(),
            password: $('#password').val(),
            confirm_password: $('#confirm_password').val(),
            allowed: $('#allowed').val(),
            admin: $('#admin').val(),
        };

        $.ajax({
            url: '/admin/users/registration',
            type: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            data: JSON.stringify(formData),
            success: function (response) {
                alert('User registered successfully');
                $('#addUserModal').modal('hide'); // Hide the modal
                table.ajax.reload(); // Reload the table data
            },
            error: function (error) {
                alert('Error registering user: ' + error.responseText);
            },
        });
    });

    // Export to Excel
    $('#exportExcel').click(function () {
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
    });
});