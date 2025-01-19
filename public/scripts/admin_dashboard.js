document.addEventListener('DOMContentLoaded', async () => {
  
    try {

     
       const dateRangePickerInput = document.getElementById('daterange-input');
   
     
        $(dateRangePickerInput).daterangepicker({
            opens: 'left',
        }, function (start, end, label) {
            console.log("A new date selection was made: " + start.format('YYYY-MM-DD') + ' to ' + end.format('YYYY-MM-DD'));
            
            // Fetch and process data within the selected date range
            fetchAndProcessData(start, end);
          //  window.location.href = `/exportExcelDateRange?startDate=${start.format('YYYY-MM-DD')}&endDate=${end.format('YYYY-MM-DD')}`;
        });

        const fetchAndProcessData = async (startDate, endDate) => {
            const token = localStorage.getItem('token');
            const response = await fetch(`/admin/cargo?start=${startDate.format('YYYY-MM-DD')}&end=${endDate.format('YYYY-MM-DD')}`, {
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
                if (isNaN(date)) return '';
                const day = String(date.getDate()).padStart(2, '0');
                const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
                const year = date.getFullYear();
                return `${day}/${month}/${year}`;
            };
            
            const dailyRecords = {};
            cargoData.forEach((item) => {
                const date = formatDate(item.createdAt);
                if (!date) return;
                dailyRecords[date] = (dailyRecords[date] || 0) + 1;
            });

            console.log('Daily Records:', dailyRecords);

            // Get the chart container
            const chartBody = document.getElementById('chart-data');
            chartBody.innerHTML = ''; // Clear existing rows

            // Calculate max value for normalization
            const maxValue = Math.max(...Object.values(dailyRecords), 0);

            // Populate the chart with data
            Object.entries(dailyRecords).forEach(([date, count]) => {
                const size = maxValue > 0 ? count / maxValue : 0;
                const row = `
                <tr>
                    <th scope="row">${date}</th>
                    <td style="--size: ${size};">
                    ${count}
                    </td>
                </tr>
                `;
                chartBody.innerHTML += row;
            });

            const groupedRecords = cargoData.reduce((acc, item) => {
                const user = item.userFullName || "Unknown User"; // Default to "Unknown User" if userFullName is missing
                if (!acc[user]) {
                    acc[user] = {
                        count: 0,
                        records: []
                    };
                }
                acc[user].count += 1; // Increment the count for this user
                acc[user].records.push(item); // Add the current record to this user's records
                return acc;
            }, {});

            console.log('Grouped Records:', groupedRecords);

            // Get the chart container
            const chartBodyUser = document.getElementById('chart-data-user');
            chartBodyUser.innerHTML = ''; // Clear existing rows

            // Loop through the grouped records and populate the chart
            Object.entries(groupedRecords).forEach(([user, data]) => {
                const row = `
                    <tr>
                        <th scope="row">${user}</th>
                        <td>${data.count}</td>
                    </tr>
                `;
                chartBodyUser.innerHTML += row;
            });
        };
    //     const token = localStorage.getItem('token');
    //     const response = await fetch(`/admin/cargo`, {
    //         method: 'GET',
    //         headers: {
    //             'Authorization': `Bearer ${token}`,
    //         },
    //     });

    //     if (!response.ok) {
    //         throw new Error('Failed to fetch cargo data');
    //     }

    //     const data = await response.json();
    //     const cargoData = data.cargoData;
    //     console.log('Cargo Data:', cargoData); // Log the entire cargo data to inspect the structure

    //     const formatDate = (dateString) => {
    //         const date = new Date(dateString);
    //         if (isNaN(date)) return '';
    //         const day = String(date.getDate()).padStart(2, '0');
    //         const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    //         const year = date.getFullYear();
    //         return `${day}/${month}/${year}`;
    //     };
        
    //     const dailyRecords = {};
    //     cargoData.forEach((item) => {
    //         const date = formatDate(item.createdAt);
    //         if (!date) return;
    //         dailyRecords[date] = (dailyRecords[date] || 0) + 1;
    //     });

    //     console.log('Daily Records:', dailyRecords);

    //     // Get the chart container
    //     const chartBody = document.getElementById('chart-data');
    //     chartBody.innerHTML = ''; // Clear existing rows

    //     // Calculate max value for normalization
    //     const maxValue = Math.max(...Object.values(dailyRecords), 0);

    //     // Populate the chart with data
    //     Object.entries(dailyRecords).forEach(([date, count]) => {
    //         const size = maxValue > 0 ? count / maxValue : 0;
    //         console.log(date)
    //         const row = `
    //     <tr>
    //         <th scope="row">${date}</th>
    //         <td style="--size: ${size};">
    //            ${count}
    //         </td>
    //     </tr>
    // `;
    //         chartBody.innerHTML += row;
    //     });


    //     const groupedRecords = cargoData.reduce((acc, item) => {
    //         const user = item.userFullName || "Unknown User"; // Default to "Unknown User" if userFullName is missing
    //         if (!acc[user]) {
    //             acc[user] = {
    //                 count: 0,
    //                 records: []
    //             };
    //         }
    //         acc[user].count += 1; // Increment the count for this user
    //         acc[user].records.push(item); // Add the current record to this user's records
    //         return acc;
    //     }, {});

    //     console.log('Grouped Records:', groupedRecords);

    //     // Get the chart container
    //     const chartBodyUser = document.getElementById('chart-data-user');
    //     chartBodyUser.innerHTML = ''; // Clear existing rows

    //     // Loop through the grouped records and populate the chart
    //     Object.entries(groupedRecords).forEach(([user, data]) => {
    //         const row = `
    //             <tr>
    //                 <th scope="row">${user}</th>
    //                 <td>${data.count}</td>
    //             </tr>
    //         `;
    //         chartBodyUser.innerHTML += row;
    //     });

       

    } catch (error) {
        console.error('Error fetching cargo data:', error);
        alert('An error occurred while fetching the cargo data.');
    }

})


$(document).ready(function () {
    
    const hasData = "<%= hasData %>"; // Boolean value passed from the server (true/false)
    const message = "<%= message %>"; // Dynamic message passed from the server

    console.log(message)

    // Check if there's no data and trigger SweetAlert if necessary
    if (hasData === 'false') {  // Ensure 'false' is treated as a string because it's passed from the server
        Swal.fire({
            icon: 'warning',
            title: 'No Data Available',
            text: message,
            confirmButtonText: 'OK',
        });
    }


    $('#addExportButton').click(function () {
        $('#addExportModal').modal('show');
    });

    $('input[name="daterange"]').daterangepicker({
        opens: 'left'
      }, function(start, end, label) {
        console.log("A new date selection was made: " + start.format('YYYY-MM-DD') + ' to ' + end.format('YYYY-MM-DD'));
        window.location.href = `/exportExcelDateRange?startDate=${start.format('YYYY-MM-DD')}&endDate=${end.format('YYYY-MM-DD')}`;
      });


    
});
