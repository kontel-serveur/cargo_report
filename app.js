require('express-async-errors');
require('dotenv').config();
const express = require('express');
const app = express();
const fs = require('fs')
const path = require('path')
const { Sequelize, Op } = require('sequelize');
const helmet = require('helmet')
const cors = require('cors')
const xss = require('xss-clean')
const Swal = require('sweetalert2')

const bodyParser = require('body-parser');
const ExcelJS = require('exceljs')

const db = require('./models');
const {Cargo, DepassementDelai, CableDeverouille, CasSuspect} = require('./models')


const UserAuthentication = require('./middleware/User')
const AdminAuthentication = require('./middleware/Admin')

const UserRouter = require('./routes/User')
const TokenVerificationRouter = require('./routes/tokenVerification')
const CargoRouter = require('./routes/Cargo')
const ProfileRouter = require('./routes/Profile')

const AdminRouter = require('./routes/Admin');
const { name } = require('ejs');




app.set('trust proxy', 1);
app.use(express.json());
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(helmet())
app.use(cors())
app.use(xss())
app.use(bodyParser.json());

app.set('view engine', 'ejs')
app.set('views', './views')

app.use('/user', UserRouter)
app.use('/token-verification', UserAuthentication, TokenVerificationRouter)
app.use('/cargo', UserAuthentication, CargoRouter)
app.use('/profile', UserAuthentication, ProfileRouter)
app.use('/admin', AdminAuthentication, AdminRouter)

app.get('/exportExcel', async (req, res) => {
  //const data = await Cargo.findAll(); 
  async function fetchCargoWithDepassementDelai() {
    try {
        // Fetch Cargo and DepassementDelai data
        const [cargoData, depassementData] = await Promise.all([
            Cargo.findAll({ raw: true, where: { clotureDate: { [Sequelize.Op.ne]: null }, }, }),
            DepassementDelai.findAll({ raw: true }),
        ]);

        // Group DepassementDelai records by cargo foreign key
        const depassementGroupedByCargo = depassementData.reduce((acc, item) => {
            if (!acc[item.cargo]) {
                acc[item.cargo] = [];
            }
            acc[item.cargo].push(item);
            return acc;
        }, {});

        const cargoWithCableData = await Promise.all(cargoData.map(async (cargo) => {
          // Find one CableDeverouille record for the current cargo
          const cableDeverouille = await CableDeverouille.findOne({
              where: { cargo: cargo.id },
              raw: true, // Assuming you want raw data
          });

          const casSuspect = await CasSuspect.findOne({
            where: {cargo: cargo.id},
            raw: true
          })

          return {
              ...cargo,
              depassementDelais: depassementGroupedByCargo[cargo.id] || [],
              cableDeverouille: cableDeverouille || null, // Attach found CableDeverouille or null
              casSuspect: casSuspect || null
          };
      }));

        
        return cargoWithCableData;
    } catch (error) {
        console.error('Error fetching Cargo with DepassementDelai:', error);
        throw error;
    }
}

const data = await fetchCargoWithDepassementDelai()

console.log(data)

  if (!data || data.length === 0) {
    return res.status(404).send('No data to export.');
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString);
  if (isNaN(date)) return '';
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
  };

  const getLastMonthNameAndYearInFrench = () => {
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth());
    const options = { month: 'long', year: 'numeric' };
    return lastMonth.toLocaleDateString('fr-FR', options).toUpperCase();
  };
  

  const getCurrentMonth = () => {
    const now = new Date();
    return now.getMonth();
  };

  const groupedData = data.reduce((acc, cargo) => {
    const creationDate = formatDate(cargo.creationDate);
    if (!acc[creationDate]) acc[creationDate] = [];
    acc[creationDate].push(cargo);
    return acc;
  }, {});

  const currentMonth = getCurrentMonth();
  const dailyDataCount = {};

 
  for (let i = 1; i <= 31; i++) {
    const dateKey = `${String(i).padStart(2, '0')}/${String(currentMonth + 1).padStart(2, '0')}/${new Date().getFullYear()}`;
    dailyDataCount[dateKey] = 0;
  }

  // Count the data entries for each day
  Object.keys(groupedData).forEach((creationDate) => {
    const day = creationDate.split('/')[0]; // Get the day part of the date
    dailyDataCount[creationDate] = groupedData[creationDate].length;
  });



  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(`${getLastMonthNameAndYearInFrench()}`);

  const dailyWorksheet = workbook.addWorksheet('CREATION JOURNALIERE');

  const depassementDelaiWorksheet = workbook.addWorksheet('DEPASSEMENT DU DELAI')

  const cableDeverouileWorksheet = workbook.addWorksheet('CABLE DE SECURITE DEVEROUILLE')

  const casSuspectWorksheet = workbook.addWorksheet('CAS SUSPECT')

  const dailyHeaderStyle = {
    font: { bold: true, name: 'Arial', size: 12 },
    alignment: { horizontal: 'center', vertical: 'middle' },
    fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'ffff00' } },
    border: {
      top: { style: 'thin', color: { argb: '000000' } },
      left: { style: 'thin', color: { argb: '000000' } },
      right: { style: 'thin', color: { argb: '000000' } },
      bottom: { style: 'thin', color: { argb: '000000' } }
    }
  };

  // Create daily creation count worksheet header
  dailyWorksheet.addRow(['DATE', 'NOMBRE DE TRANSIT CREES']);
  depassementDelaiWorksheet.addRow(['N° du Trst', 
                                  'Type Vehicule', 
                                  'Immatriculation', 
                                  'Chauffeur', 
                                  'Date Creation', 
                                  'Date Cloture',
                                  'Duree du transit', 
                                  'Niveau', 
                                  'Observation'
                                              ])

  cableDeverouileWorksheet.addRow(['N° du Trst', 
                                                'Type Vehicule', 
                                                'Immatriculation', 
                                                'Chauffeur', 
                                                'Date Coupure', 
                                                'Heure', 
                                                
                                                            ])


  casSuspectWorksheet.addRow(['N° du Trst',
                              'N° Balise', 
                                                'Type Vehicule', 
                                                'Immatriculation',
                                                'Transitaire', 
                                                'Chauffeur', 
                                                'Date Creation', 
                                                'Date Cloture',
                                                'Commentaire' 
                                                
                                                            ])

  dailyWorksheet.eachRow((row, rowIndex) => {
    if (rowIndex === 1) {
      row.eachCell((cell) => {
        cell.font = dailyHeaderStyle.font;
        cell.alignment = dailyHeaderStyle.alignment;
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'ffffff' } };
        cell.border = dailyHeaderStyle.border;
      });
    }
  });


  depassementDelaiWorksheet.eachRow((row, rowIndex) => {
    row.height = 30;
    if (rowIndex === 1) {
      row.eachCell((cell) => {
        cell.font = dailyHeaderStyle.font;
        cell.alignment = dailyHeaderStyle.alignment;
        cell.fill =  { type: 'pattern', pattern: 'solid', fgColor: { argb: 'ffffff' } };
        cell.border = dailyHeaderStyle.border;
      });
    }
  });

  casSuspectWorksheet.eachRow((row, rowIndex) => {
    row.height = 30;
    if (rowIndex === 1) {
      row.eachCell((cell) => {
        cell.font = dailyHeaderStyle.font;
        cell.alignment = dailyHeaderStyle.alignment;
        cell.fill =  { type: 'pattern', pattern: 'solid', fgColor: { argb: 'ffffff' } };
        cell.border = dailyHeaderStyle.border;
      });
    }
  });


  let rowIndex = 2;
  Object.keys(dailyDataCount).forEach((dateKey) => {
    dailyWorksheet.addRow([dateKey, dailyDataCount[dateKey]]);
    rowIndex++;
  });

  data.forEach(cargo => {
  if (cargo.depassementDelais && cargo.depassementDelais.length > 0) {
    cargo.depassementDelais.forEach(delai => {
      depassementDelaiWorksheet.addRow([
        cargo.numeroDeTransit,    // 'Type Vehicule'
        cargo.typeDeVehicule, // 'Immatriculation'
        cargo.immatriculation,       // 'Chauffeur'
        cargo.chauffeur,
        formatDate(cargo.creationDate),
        formatDate(cargo.clotureDate),
        cargo.duree,
        delai.observation?.map(observation => observation.niveau).join('\n\n') || '',          // 'Niveau'
        delai.observation?.map(observation => observation.observation).join('\n\n') || '',      // 'Observation'
      ]);
    });
  }
});

depassementDelaiWorksheet.columns.forEach((column) => {
  column.width = 20; 
});
dailyWorksheet.columns.forEach((column) => {
  column.width = 20; 
});

data.forEach(cargo => {
  if (cargo.cableDeverouille && cargo.cableDeverouille !==null) {
    
      cableDeverouileWorksheet.addRow([
        cargo.numeroDeTransit,    // 'Type Vehicule'
        cargo.typeDeVehicule, // 'Immatriculation'
        cargo.immatriculation,       // 'Chauffeur'
        cargo.chauffeur,
        formatDate(cargo.cableDeverouille.dateCoupure),
        cargo.cableDeverouille.heureCoupure
      ]);
   
  }
});


data.forEach(cargo => {
  if (cargo.casSuspect && cargo.casSuspect !==null) {
    
      casSuspectWorksheet.addRow([
        cargo.numeroDeTransit,   
        cargo.numeroDeBalise, // 'Type Vehicule'
        cargo.typeDeVehicule, // 'Immatriculation'
        cargo.immatriculation, 
        //cargo.transitaire,
        Array.isArray(cargo.transitaire) ? cargo.transitaire.map(item => item.Transitaire).join('\n') : '',      // 'Chauffeur'
        cargo.chauffeur,
        formatDate(cargo.creationDate),
        formatDate(cargo.clotureDate),
        cargo.casSuspect.commentaire
      ]);
   
  }
});

cableDeverouileWorksheet.columns.forEach((column) => {
  column.width = 20; 
});




  const dateRowStyle = {
    font: { bold: true, name: 'Arial', size: 15, color: { argb: '000000' } },
    alignment: {horizontal: 'left', indent: 90, vertical: 'middle' },
    fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: '00b050' } }, // Green background
  };

  dailyWorksheet.columns.forEach((column) => {
    column.width = 20; 
  });

  casSuspectWorksheet.columns.forEach((column) => {
    column.width = 17; 
  });

  const headerStyle = {
    font: { bold: true, name: 'Arial' },
    fontHeader: { bold: true, name: 'Arial', size: 14 },
    alignment: {horizontal: 'center', vertical: 'middle' },
    fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'ffff00' } }, // Yellow background
    fill2: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'ffffff' } },
    border: { 
      top: { style: 'thin', color: { argb: '000000' } },
      left: { style: 'thin', color: { argb: '000000' } },
      right: { style: 'thin', color: { argb: '000000' } } 
    },
    
  };

  const headerRow1Style={
    alignment: {horizontal: 'left', indent: 90, vertical: 'middle' },
  }

  const dataStyle = {
    alignment: { horizontal: 'left' },
  };

  // Adjust header row to match image
  const headerRow1 = worksheet.addRow([
    `RAPPORT DE ${getLastMonthNameAndYearInFrench()}`
  ]);
  
  headerRow1.height = 35
  headerRow1.eachCell((cell) => {
    cell.font = headerStyle.fontHeader;
    cell.alignment = headerRow1Style.alignment;
    cell.fill = headerStyle.fill;
    cell.border = headerStyle.border; 
  });

  worksheet.mergeCells(`A1:V1`); 

  const headerRow2 = worksheet.addRow([
    'N° du Trst',
    'N° Balise',
    'Code HS',
    'Corridor',
    'Info Véhicule',
    
    '',
    'Personne de contact',
    '',
    '',
    'Création',
    '',
    '',
    'Alarme',
    '',
    '',
    '',
    '',
    'Cloture',
    '',
    '',
    '',
    'Durée Trst'
  ]);

  const mergeRange = 'E2:F2';
const mergedCells = worksheet.getCell('E2');

if (!mergedCells.isMerged) {
  worksheet.mergeCells(mergeRange); // Merge the 'Info Véhicule' column with the adjacent empty column
}

// Apply styles to the merged cell
const mergedCell = worksheet.getCell('E2');
mergedCell.font = headerStyle.font;
mergedCell.alignment = { horizontal: 'center', vertical: 'middle' };
mergedCell.fill = headerStyle.fill2;
mergedCell.border = {
  top: { style: 'thin', color: { argb: '000000' } },
  left: { style: 'thin', color: { argb: '000000' } },
  bottom: { style: 'thin', color: { argb: '000000' } },
  right: { style: 'thin', color: { argb: '000000' } }
};


const mergeRange2= 'G2:I2';
const mergedCells2 = worksheet.getCell('G2');

if (!mergedCells2.isMerged) {
  worksheet.mergeCells(mergeRange2); // Merge the 'Info Véhicule' column with the adjacent empty column
}

// Apply styles to the merged cell
const mergedCell2 = worksheet.getCell('G2');
mergedCell2.font = headerStyle.font;
mergedCell2.alignment = { horizontal: 'center', vertical: 'middle' };
mergedCell2.fill = headerStyle.fill2;
mergedCell2.border = {
  top: { style: 'thin', color: { argb: '000000' } },
  left: { style: 'thin', color: { argb: '000000' } },
  bottom: { style: 'thin', color: { argb: '000000' } },
  right: { style: 'thin', color: { argb: '000000' } }
};



const mergeRange3= 'J2:L2';
const mergedCells3 = worksheet.getCell('J2');

if (!mergedCells3.isMerged) {
  worksheet.mergeCells(mergeRange3); // Merge the 'Info Véhicule' column with the adjacent empty column
}

// Apply styles to the merged cell
const mergedCell3 = worksheet.getCell('J2');
mergedCell3.font = headerStyle.font;
mergedCell3.alignment = { horizontal: 'center', vertical: 'middle' };
mergedCell3.fill = headerStyle.fill2;
mergedCell3.border = {
  top: { style: 'thin', color: { argb: '000000' } },
  left: { style: 'thin', color: { argb: '000000' } },
  bottom: { style: 'thin', color: { argb: '000000' } },
  right: { style: 'thin', color: { argb: '000000' } }
};


const mergeRange4= 'M2:Q2';
const mergedCells4 = worksheet.getCell('M2');

if (!mergedCells4.isMerged) {
  worksheet.mergeCells(mergeRange4); // Merge the 'Info Véhicule' column with the adjacent empty column
}

// Apply styles to the merged cell
const mergedCell4 = worksheet.getCell('M2');
mergedCell4.font = headerStyle.font;
mergedCell4.alignment = { horizontal: 'center', vertical: 'middle' };
mergedCell4.fill = headerStyle.fill2;
mergedCell4.border = {
  top: { style: 'thin', color: { argb: '000000' } },
  left: { style: 'thin', color: { argb: '000000' } },
  bottom: { style: 'thin', color: { argb: '000000' } },
  right: { style: 'thin', color: { argb: '000000' } }
};



const mergeRange5= 'R2:U2';
const mergedCells5 = worksheet.getCell('R2');

if (!mergedCells5.isMerged) {
  worksheet.mergeCells(mergeRange5); // Merge the 'Info Véhicule' column with the adjacent empty column
}

// Apply styles to the merged cell
const mergedCell5 = worksheet.getCell('R2');
mergedCell5.font = headerStyle.font;
mergedCell5.alignment = { horizontal: 'center', vertical: 'middle' };
mergedCell5.fill = headerStyle.fill2;
mergedCell5.border = {
  top: { style: 'thin', color: { argb: '000000' } },
  left: { style: 'thin', color: { argb: '000000' } },
  bottom: { style: 'thin', color: { argb: '000000' } },
  right: { style: 'thin', color: { argb: '000000' } }
};


  headerRow2.eachCell((cell, i) => {
    cell.font = headerStyle.font;
    cell.alignment = headerStyle.alignment;
    cell.fill = headerStyle.fill2;
      cell.border = {
        top: { style: 'thin', color: { argb: '000000' } },
        left: { style: 'thin', color: { argb: '000000' } },
        bottom: { style: 'thin', color: { argb: '000000' } },
        right: { style: 'thin', color: { argb: '000000' } },
      };

    
    
    
  });

  const headerRow3 = worksheet.addRow([
    '',
    '',
    '',
    '',
    'Type Véhicule',
    'Immatriculation',
    'Transitaire',
    'Chauffeur',
    'Téléphone',
    'Date',
    'H Début',
    'H Fin',
    
    'Niveau',
    'Date',
    'Heure',
    'Lieu',
    'Observation',
    
    'Date',
    'Heure',
    'Lieu',
    'Mode',
    ''
  ]);
  headerRow3.eachCell((cell) => {
    cell.font = headerStyle.font;
    cell.alignment = headerStyle.alignment;
    cell.fill = headerStyle.fill2;
    cell.border = headerStyle.border; 
  });

  worksheet.views = [{ state: 'frozen', ySplit: 3 }]; 

 // const currentMonth = new Date().getMonth(); // Current month (0-11)
const currentYear = new Date().getFullYear(); // Current year
const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate(); // Get the number of days in the current month

// Loop through all the days of the current month
for (let day = 1; day <= daysInMonth; day++) {
    const creationDate = `${day < 10 ? '0' : ''}${day}/${currentMonth + 1 < 10 ? '0' : ''}${currentMonth + 1}/${currentYear}`;

    const dateRow = worksheet.addRow([`Le ${creationDate}`]);
    dateRow.height = 35;
    dateRow.eachCell({ includeEmpty: true }, (cell, colNumber) => {
        cell.font = dateRowStyle.font;
        cell.alignment = dateRowStyle.alignment;
        cell.fill = dateRowStyle.fill;

        if (colNumber === 1) {
            worksheet.mergeCells(`A${dateRow.number}:V${dateRow.number}`);
        }
    });

    // Check if there is data for the current creationDate
    if (groupedData[creationDate] && groupedData[creationDate].length > 0) {
        // If there is data for this date, loop through it
        groupedData[creationDate].forEach(async (cargo) => {
            const row = worksheet.addRow([
                cargo.numeroDeTransit || '',
                cargo.numeroDeBalise || '',
                Array.isArray(cargo.codeHS) ? cargo.codeHS.map(item => item.code_hs).join('\n') : '',
                cargo.corridor || '',
                cargo.typeDeVehicule || '',
                cargo.immatriculation || '',
                //cargo.transitaire || '',
                Array.isArray(cargo.transitaire) ? cargo.transitaire.map(item => item.Transitaire).join('\n') : '',
                cargo.chauffeur || '',
                cargo.telephone || '',
                creationDate,
                cargo.creationHeureDebut || '',
                cargo.creationHeureFin || '',
                cargo.alarme?.map(alarme => alarme.niveau).join('\n\n') || '',
                cargo.alarme?.map(alarme => formatDate(alarme.date)).join('\n\n') || '',
                cargo.alarme?.map(alarme => alarme.heure).join('\n\n') || '',
                cargo.alarme?.map(alarme => alarme.lieu).join('\n\n') || '',
                cargo.alarme?.map(alarme => alarme.observation).join('\n\n') || '',
                formatDate(cargo.clotureDate) || '',
                cargo.clotureHeure || '',
                cargo.clotureLieu || '',
                cargo.clotureMode || '',
                cargo.duree || ''
            ]);

            const codeCount = cargo.codeHS?.length || 1;
            const transitaireCount = cargo.transitaire?.length || 1;
            const alarmCount = cargo.alarme?.length || 1;
            const maxCount = Math.max(codeCount, alarmCount, transitaireCount);

            row.height = Math.max(25, maxCount * 25);

            row.eachCell((cell) => {
                cell.alignment = { horizontal: 'left', vertical: 'top', wrapText: true }; // Text wrapping and alignment
            });
        });
    } else {
        // If no data for the date, add a row with "Pas de création"
        const noCreationRow = worksheet.addRow(['PAS DE CREATION']);
        noCreationRow.height = 25;
        noCreationRow.eachCell({ includeEmpty: true }, (cell) => {
            cell.font = { name: 'Arial', size: 12 ,color: { argb: '' } }; // Style the "Pas de création" row
            cell.alignment = { horizontal: 'left', indent: 90, vertical: 'center', wrapText: true };
        });

        worksheet.mergeCells(`A${noCreationRow.number}:U${noCreationRow.number}`);
    }
    
}

const finRow = worksheet.addRow(['FIN']);
    finRow.height = 20; // Adjust height if necessary
    finRow.eachCell({ includeEmpty: true }, (cell) => {
        cell.font = { bold: true, name: 'Arial', size: 27 }; // Make "FIN" bold
        cell.alignment = { horizontal: 'left', indent: 90, vertical: 'middle' }; // Center align the "FIN"
    });

    worksheet.mergeCells(`A${finRow.number}:U${finRow.number}`);

  /*Object.keys(groupedData).forEach((creationDate) => {
    const dateRow = worksheet.addRow([`Le ${creationDate}`]);
    dateRow.height = 35; 
    dateRow.eachCell({ includeEmpty: true }, (cell, colNumber) => {
      cell.font = dateRowStyle.font;
      cell.alignment = dateRowStyle.alignment;
      cell.fill = dateRowStyle.fill;

      if (colNumber === 1) {
        worksheet.mergeCells(`A${dateRow.number}:U${dateRow.number}`); 
      }
    });

   
  

    groupedData[creationDate].forEach(async(cargo) => {
     
      const row = worksheet.addRow([
        cargo.numeroDeTransit || '',
        cargo.numeroDeBalise || '',
        //cargo.codeHS || '',
        //cargo.codeHS?.map(code_hs => code_hs.code_hs).join(`\n\n`) || '',
        Array.isArray(cargo.codeHS) 
        ? cargo.codeHS.map(item => item.code_hs).join('\n') 
        : '',
        cargo.corridor || '',
        cargo.typeDeVehicule || '',
        cargo.immatriculation || '',
        cargo.transitaire || '',
        cargo.chauffeur || '',
        cargo.telephone || '',
        creationDate, 
        cargo.creationHeureDebut || '',
        cargo.creationHeureFin || '',
        
        cargo.alarme?.map(alarme => alarme.niveau).join('\n\n') || '',
    cargo.alarme?.map(alarme => formatDate(alarme.date)).join('\n\n') || '',
    cargo.alarme?.map(alarme => alarme.heure).join('\n\n') || '',
    cargo.alarme?.map(alarme => alarme.lieu).join('\n\n') || '',
    cargo.alarme?.map(alarme => alarme.observation).join('\n\n') || '',
        
        formatDate(cargo.clotureDate) || '',
        cargo.clotureHeure || '',
        cargo.clotureLieu || '',
        cargo.duree || ''
      ]);

    //  const codeCount = cargo.codeHS?.length || 1; // Default to 1 if no alarms
    //  row.height = Math.max(25, codeCount * 25);
    //  const alarmCount = cargo.alarme?.length || 1; // Default to 1 if no alarms
  //row.height = Math.max(25, alarmCount * 25); // Adjust row height based on alarm count

  const codeCount = cargo.codeHS?.length || 1; // Default to 1 if no codeHS
const alarmCount = cargo.alarme?.length || 1; // Default to 1 if no alarms

// Determine the greater count
const maxCount = Math.max(codeCount, alarmCount);

// Set row height based on the larger count
row.height = Math.max(25, maxCount * 25);

 
  
  
  row.eachCell((cell) => {
    cell.alignment = { horizontal: 'left', vertical: 'top', wrapText: true }; // Text wrapping and alignment
  });
    });
  });*/
  

 /* worksheet.columns.forEach((column) => {
    column.width = 20; 
  });*/

  worksheet.columns.forEach((column, index) => {
    if (index === 16) {
      column.width = 40; 
    } else {
      column.width = 20;
    }
  });

  const fileName = `${getLastMonthNameAndYearInFrench()}.xlsx`;

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);


  await workbook.xlsx.write(res);
  res.end();
});


app.get('/exportExcelDateRange', async (req, res) => {
  const { startDate, endDate } = req.query; // Get startDate and endDate from the request query

  // Convert startDate and endDate to Date objects for comparison
  const start = startDate ? new Date(startDate) : null;
  const end = endDate ? new Date(endDate) : null;

  async function fetchCargoWithDepassementDelai() {
    try {
      // Fetch Cargo and DepassementDelai data
      const [cargoData, depassementData] = await Promise.all([
        Cargo.findAll({ raw: true }),
        DepassementDelai.findAll({ raw: true }),
      ]);

      // Group DepassementDelai records by cargo foreign key
      const depassementGroupedByCargo = depassementData.reduce((acc, item) => {
        if (!acc[item.cargo]) {
          acc[item.cargo] = [];
        }
        acc[item.cargo].push(item);
        return acc;
      }, {});

      const cargoWithCableData = await Promise.all(cargoData.map(async (cargo) => {
        // Apply date filtering for cargos based on creationDate and clotureDate
        const creationDate = new Date(cargo.creationDate);
        const clotureDate = new Date(cargo.clotureDate);

        // Skip cargos that don't match the date range filter
        if (
          (start && creationDate < start) ||
          (end && creationDate > end) ||
          (start && clotureDate < start) ||
          (end && clotureDate > end)
        ) {
          return null; // Skip this cargo if it doesn't match the date range
        }

        // Find one CableDeverouille record for the current cargo
        const cableDeverouille = await CableDeverouille.findOne({
          where: { cargo: cargo.id },
          raw: true, // Assuming you want raw data
        });

        const casSuspect = await CasSuspect.findOne({
          where: { cargo: cargo.id },
          raw: true
        });

        return {
          ...cargo,
          depassementDelais: depassementGroupedByCargo[cargo.id] || [],
          cableDeverouille: cableDeverouille || null, // Attach found CableDeverouille or null
          casSuspect: casSuspect || null
        };
      }));

      // Remove null values (cargos that were skipped due to date filtering)
      return cargoWithCableData.filter(cargo => cargo !== null);
    } catch (error) {
      console.error('Error fetching Cargo with DepassementDelai:', error);
      throw error;
    }
  }

  const data = await fetchCargoWithDepassementDelai();

  console.log(data);

  if (!data || data.length === 0) {
  //  return res.status(404).send('No data to export.');

  return res.render('NotFound');
  // return res.status(200).json({ success: false, message: 'No data to export.' });
   //const hasData = false;  // Example: no data available
   // const message = "There are no records available for this query."; 
   
   //return res.render('admin/dashboard', { hasData: hasData, message: message });
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    if (isNaN(date)) return '';
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const getLastMonthNameAndYearInFrench = () => {
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1);
    const options = { month: 'long', year: 'numeric' };
    return lastMonth.toLocaleDateString('fr-FR', options).toUpperCase();
  };

  const getCurrentMonth = () => {
    const now = new Date();
    return now.getMonth();
  };

  const groupedData = data.reduce((acc, cargo) => {
    const creationDate = formatDate(cargo.creationDate);
    if (!acc[creationDate]) acc[creationDate] = [];
    acc[creationDate].push(cargo);
    return acc;
  }, {});

  const currentMonth = getCurrentMonth();
  const dailyDataCount = {};

  // Ensure to count only data within the current month and the given date range
  for (let i = 1; i <= 31; i++) {
    const dateKey = `${String(i).padStart(2, '0')}/${String(currentMonth + 1).padStart(2, '0')}/${new Date().getFullYear()}`;
    dailyDataCount[dateKey] = 0;
  }

  // Count the data entries for each day within the filtered date range
  Object.keys(groupedData).forEach((creationDate) => {
    const day = creationDate.split('/')[0]; // Get the day part of the date
    dailyDataCount[creationDate] = groupedData[creationDate].length;
  });

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(`${getLastMonthNameAndYearInFrench()}`);
  const dailyWorksheet = workbook.addWorksheet('CREATION JOURNALIERE');
  const depassementDelaiWorksheet = workbook.addWorksheet('DEPASSEMENT DU DELAI');
  const cableDeverouileWorksheet = workbook.addWorksheet('CABLE DE SECURITE DEVEROUILLE');
  const casSuspectWorksheet = workbook.addWorksheet('CAS SUSPECT');

  const dailyHeaderStyle = {
    font: { bold: true, name: 'Arial', size: 12 },
    alignment: { horizontal: 'center', vertical: 'middle' },
    fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'ffff00' } },
    border: {
      top: { style: 'thin', color: { argb: '000000' } },
      left: { style: 'thin', color: { argb: '000000' } },
      right: { style: 'thin', color: { argb: '000000' } },
      bottom: { style: 'thin', color: { argb: '000000' } }
    }
  };

  // Create daily creation count worksheet header
  dailyWorksheet.addRow(['DATE', 'NOMBRE DE TRANSIT CREES']);
  depassementDelaiWorksheet.addRow(['N° du Trst', 
                                  'Type Vehicule', 
                                  'Immatriculation', 
                                  'Chauffeur', 
                                  'Date Creation', 
                                  'Date Cloture', 
                                  'Niveau', 
                                  'Observation'
                                              ]);

  cableDeverouileWorksheet.addRow(['N° du Trst', 
                                                'Type Vehicule', 
                                                'Immatriculation', 
                                                'Chauffeur', 
                                                'Date Coupure', 
                                                'Heure', 
                                                
                                                            ]);

  casSuspectWorksheet.addRow(['N° du Trst',
                              'N° Balise', 
                                                'Type Vehicule', 
                                                'Immatriculation',
                                                'Transitaire', 
                                                'Chauffeur', 
                                                'Date Creation', 
                                                'Date Cloture',
                                                'Commentaire' 
                                                
                                                            ]);

  // Add data rows to worksheets (following the same logic as before)


  dailyWorksheet.eachRow((row, rowIndex) => {
    if (rowIndex === 1) {
      row.eachCell((cell) => {
        cell.font = dailyHeaderStyle.font;
        cell.alignment = dailyHeaderStyle.alignment;
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'ffffff' } };
        cell.border = dailyHeaderStyle.border;
      });
    }
  });


  depassementDelaiWorksheet.eachRow((row, rowIndex) => {
    row.height = 30;
    if (rowIndex === 1) {
      row.eachCell((cell) => {
        cell.font = dailyHeaderStyle.font;
        cell.alignment = dailyHeaderStyle.alignment;
        cell.fill =  { type: 'pattern', pattern: 'solid', fgColor: { argb: 'ffffff' } };
        cell.border = dailyHeaderStyle.border;
      });
    }
  });

  casSuspectWorksheet.eachRow((row, rowIndex) => {
    row.height = 30;
    if (rowIndex === 1) {
      row.eachCell((cell) => {
        cell.font = dailyHeaderStyle.font;
        cell.alignment = dailyHeaderStyle.alignment;
        cell.fill =  { type: 'pattern', pattern: 'solid', fgColor: { argb: 'ffffff' } };
        cell.border = dailyHeaderStyle.border;
      });
    }
  });


  let rowIndex = 2;
  Object.keys(dailyDataCount).forEach((dateKey) => {
    dailyWorksheet.addRow([dateKey, dailyDataCount[dateKey]]);
    rowIndex++;
  });

  data.forEach(cargo => {
  if (cargo.depassementDelais && cargo.depassementDelais.length > 0) {
    cargo.depassementDelais.forEach(delai => {
      depassementDelaiWorksheet.addRow([
        cargo.numeroDeTransit,    // 'Type Vehicule'
        cargo.typeDeVehicule, // 'Immatriculation'
        cargo.immatriculation,       // 'Chauffeur'
        cargo.chauffeur,
        formatDate(cargo.creationDate),
        formatDate(cargo.clotureDate),
        delai.observation?.map(observation => observation.niveau).join('\n\n') || '',          // 'Niveau'
        delai.observation?.map(observation => observation.observation).join('\n\n') || '',      // 'Observation'
      ]);
    });
  }
});

depassementDelaiWorksheet.columns.forEach((column) => {
  column.width = 20; 
});

dailyWorksheet.columns.forEach((column) => {
  column.width = 20; 
});

data.forEach(cargo => {
  if (cargo.cableDeverouille && cargo.cableDeverouille !==null) {
    
      cableDeverouileWorksheet.addRow([
        cargo.numeroDeTransit,    // 'Type Vehicule'
        cargo.typeDeVehicule, // 'Immatriculation'
        cargo.immatriculation,       // 'Chauffeur'
        cargo.chauffeur,
        formatDate(cargo.cableDeverouille.dateCoupure),
        cargo.cableDeverouille.heureCoupure
      ]);
   
  }
});


data.forEach(cargo => {
  if (cargo.casSuspect && cargo.casSuspect !==null) {
    
      casSuspectWorksheet.addRow([
        cargo.numeroDeTransit,   
        cargo.numeroDeBalise, // 'Type Vehicule'
        cargo.typeDeVehicule, // 'Immatriculation'
        cargo.immatriculation, 
      //  cargo.transitaire,      // 'Chauffeur'
        Array.isArray(cargo.transitaire) ? cargo.transitaire.map(item => item.Transitaire).join('\n') : '',  
        cargo.chauffeur,
        formatDate(cargo.creationDate),
        formatDate(cargo.clotureDate),
        cargo.casSuspect.commentaire
      ]);
   
  }
});

cableDeverouileWorksheet.columns.forEach((column) => {
  column.width = 20; 
});




  const dateRowStyle = {
    font: { bold: true, name: 'Arial', size: 15, color: { argb: '000000' } },
    alignment: {horizontal: 'left', indent: 90, vertical: 'middle' },
    fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: '00b050' } }, // Green background
  };

  dailyWorksheet.columns.forEach((column) => {
    column.width = 20; 
  });

  casSuspectWorksheet.columns.forEach((column) => {
    column.width = 17; 
  });

  const headerStyle = {
    font: { bold: true, name: 'Arial' },
    fontHeader: { bold: true, name: 'Arial', size: 14 },
    alignment: {horizontal: 'center', vertical: 'middle' },
    fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'ffff00' } }, // Yellow background
    fill2: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'ffffff' } },
    border: { 
      top: { style: 'thin', color: { argb: '000000' } },
      left: { style: 'thin', color: { argb: '000000' } },
      right: { style: 'thin', color: { argb: '000000' } } 
    },
    
  };

  const headerRow1Style={
    alignment: {horizontal: 'left', indent: 90, vertical: 'middle' },
  }

  const dataStyle = {
    alignment: { horizontal: 'left' },
  };

  // Adjust header row to match image
  const headerRow1 = worksheet.addRow([
    `RAPPORT DU ${formatDate(start)} AU ${formatDate(end)}`
  ]);
  
  headerRow1.height = 35
  headerRow1.eachCell((cell) => {
    cell.font = headerStyle.fontHeader;
    cell.alignment = headerRow1Style.alignment;
    cell.fill = headerStyle.fill;
    cell.border = headerStyle.border; 
  });

  worksheet.mergeCells(`A1:V1`); 

  const headerRow2 = worksheet.addRow([
    'N° du Trst',
    'N° Balise',
    'Code HS',
    'Corridor',
    'Info Véhicule',
    '',
    '',
    'Personne de contact',
    '',
    '',
    'Création',
    '',
    'Alarme',
    '',
    '',
    '',
    '',
    'Cloture',
    '',
    '',
    '',
    
    'Durée Trst'
  ]);
  const mergeRange = 'E2:F2';
  const mergedCells = worksheet.getCell('E2');
  
  if (!mergedCells.isMerged) {
    worksheet.mergeCells(mergeRange); // Merge the 'Info Véhicule' column with the adjacent empty column
  }
  
  // Apply styles to the merged cell
  const mergedCell = worksheet.getCell('E2');
  mergedCell.font = headerStyle.font;
  mergedCell.alignment = { horizontal: 'center', vertical: 'middle' };
  mergedCell.fill = headerStyle.fill2;
  mergedCell.border = {
    top: { style: 'thin', color: { argb: '000000' } },
    left: { style: 'thin', color: { argb: '000000' } },
    bottom: { style: 'thin', color: { argb: '000000' } },
    right: { style: 'thin', color: { argb: '000000' } }
  };
  
  
  const mergeRange2= 'G2:I2';
  const mergedCells2 = worksheet.getCell('G2');
  
  if (!mergedCells2.isMerged) {
    worksheet.mergeCells(mergeRange2); // Merge the 'Info Véhicule' column with the adjacent empty column
  }
  
  // Apply styles to the merged cell
  const mergedCell2 = worksheet.getCell('G2');
  mergedCell2.font = headerStyle.font;
  mergedCell2.alignment = { horizontal: 'center', vertical: 'middle' };
  mergedCell2.fill = headerStyle.fill2;
  mergedCell2.border = {
    top: { style: 'thin', color: { argb: '000000' } },
    left: { style: 'thin', color: { argb: '000000' } },
    bottom: { style: 'thin', color: { argb: '000000' } },
    right: { style: 'thin', color: { argb: '000000' } }
  };
  
  
  
  const mergeRange3= 'J2:L2';
  const mergedCells3 = worksheet.getCell('J2');
  
  if (!mergedCells3.isMerged) {
    worksheet.mergeCells(mergeRange3); // Merge the 'Info Véhicule' column with the adjacent empty column
  }
  
  // Apply styles to the merged cell
  const mergedCell3 = worksheet.getCell('J2');
  mergedCell3.font = headerStyle.font;
  mergedCell3.alignment = { horizontal: 'center', vertical: 'middle' };
  mergedCell3.fill = headerStyle.fill2;
  mergedCell3.border = {
    top: { style: 'thin', color: { argb: '000000' } },
    left: { style: 'thin', color: { argb: '000000' } },
    bottom: { style: 'thin', color: { argb: '000000' } },
    right: { style: 'thin', color: { argb: '000000' } }
  };
  
  
  const mergeRange4= 'M2:Q2';
  const mergedCells4 = worksheet.getCell('M2');
  
  if (!mergedCells4.isMerged) {
    worksheet.mergeCells(mergeRange4); // Merge the 'Info Véhicule' column with the adjacent empty column
  }
  
  // Apply styles to the merged cell
  const mergedCell4 = worksheet.getCell('M2');
  mergedCell4.font = headerStyle.font;
  mergedCell4.alignment = { horizontal: 'center', vertical: 'middle' };
  mergedCell4.fill = headerStyle.fill2;
  mergedCell4.border = {
    top: { style: 'thin', color: { argb: '000000' } },
    left: { style: 'thin', color: { argb: '000000' } },
    bottom: { style: 'thin', color: { argb: '000000' } },
    right: { style: 'thin', color: { argb: '000000' } }
  };
  
  
  
  const mergeRange5= 'R2:U2';
  const mergedCells5 = worksheet.getCell('R2');
  
  if (!mergedCells5.isMerged) {
    worksheet.mergeCells(mergeRange5); // Merge the 'Info Véhicule' column with the adjacent empty column
  }
  
  // Apply styles to the merged cell
  const mergedCell5 = worksheet.getCell('R2');
  mergedCell5.font = headerStyle.font;
  mergedCell5.alignment = { horizontal: 'center', vertical: 'middle' };
  mergedCell5.fill = headerStyle.fill2;
  mergedCell5.border = {
    top: { style: 'thin', color: { argb: '000000' } },
    left: { style: 'thin', color: { argb: '000000' } },
    bottom: { style: 'thin', color: { argb: '000000' } },
    right: { style: 'thin', color: { argb: '000000' } }
  };
  
  
    headerRow2.eachCell((cell, i) => {
      cell.font = headerStyle.font;
      cell.alignment = headerStyle.alignment;
      cell.fill = headerStyle.fill2;
        cell.border = {
          top: { style: 'thin', color: { argb: '000000' } },
          left: { style: 'thin', color: { argb: '000000' } },
          bottom: { style: 'thin', color: { argb: '000000' } },
          right: { style: 'thin', color: { argb: '000000' } },
        };
  
      
      
      
    });

  const headerRow3 = worksheet.addRow([
    '',
    '',
    '',
    '',
    'Type Véhicule',
    'Immatriculation',
    'Transitaire',
    'Chauffeur',
    'Téléphone',
    'Date',
    'H Début',
    'H Fin',
    
    'Niveau',
    'Date',
    'Heure',
    'Lieu',
    'Observation',
    
    'Date',
    'Heure',
    'Lieu',
    'Mode',
    ''
  ]);
  headerRow3.eachCell((cell) => {
    cell.font = headerStyle.font;
    cell.alignment = headerStyle.alignment;
    cell.fill = headerStyle.fill2;
    cell.border = headerStyle.border; 
  });

  worksheet.views = [{ state: 'frozen', ySplit: 3 }]; 

  for (let day = start.getDate(); day <= end.getDate(); day++) {
    
    const currentDate = new Date(start.getFullYear(), start.getMonth(), day);
    console.log(start)
    
  
    const formattedDate = `${currentDate.getDate() < 10 ? '0' : ''}${currentDate.getDate()}/${currentDate.getMonth() + 1 < 10 ? '0' : ''}${currentDate.getMonth() + 1}/${currentDate.getFullYear()}`;

   
    const dateRow = worksheet.addRow([`Le ${formattedDate}`]);
    dateRow.height = 35;
    dateRow.eachCell({ includeEmpty: true }, (cell, colNumber) => {
        cell.font = dateRowStyle.font;
        cell.alignment = dateRowStyle.alignment;
        cell.fill = dateRowStyle.fill;

        if (colNumber === 1) {
            worksheet.mergeCells(`A${dateRow.number}:V${dateRow.number}`);
        }
    });

    // Check if there is data for the current date
    if (groupedData[formattedDate] && groupedData[formattedDate].length > 0) {
        // If there is data for this date, loop through it
        groupedData[formattedDate].forEach(async (cargo) => {
            const row = worksheet.addRow([
                cargo.numeroDeTransit || '',
                cargo.numeroDeBalise || '',
                Array.isArray(cargo.codeHS) ? cargo.codeHS.map(item => item.code_hs).join('\n') : '',
                cargo.corridor || '',
                cargo.typeDeVehicule || '',
                cargo.immatriculation || '',
               // cargo.transitaire || '',
                Array.isArray(cargo.transitaire) ? cargo.transitaire.map(item => item.Transitaire).join('\n') : '',
                cargo.chauffeur || '',
                cargo.telephone || '',
                formattedDate, // Using the formatted date for this column
                cargo.creationHeureDebut || '',
                cargo.creationHeureFin || '',
                cargo.alarme?.map(alarme => alarme.niveau).join('\n\n') || '',
                cargo.alarme?.map(alarme => formatDate(alarme.date)).join('\n\n') || '',
                cargo.alarme?.map(alarme => alarme.heure).join('\n\n') || '',
                cargo.alarme?.map(alarme => alarme.lieu).join('\n\n') || '',
                cargo.alarme?.map(alarme => alarme.observation).join('\n\n') || '',
                formatDate(cargo.clotureDate) || '',
                cargo.clotureHeure || '',
                cargo.clotureLieu || '',
                cargo.clotureMode || '',
                cargo.duree || ''
            ]);

            const codeCount = cargo.codeHS?.length || 1;
            const alarmCount = cargo.alarme?.length || 1;
            const maxCount = Math.max(codeCount, alarmCount);

            row.height = Math.max(25, maxCount * 25);

            row.eachCell((cell) => {
                cell.alignment = { horizontal: 'left', vertical: 'top', wrapText: true }; // Text wrapping and alignment
            });
        });
    } else {
        // If no data for the date, add a row with "Pas de création"
        const noCreationRow = worksheet.addRow(['PAS DE CREATION']);
        noCreationRow.height = 25;
        noCreationRow.eachCell({ includeEmpty: true }, (cell) => {
          cell.font = { name: 'Arial', size: 12 ,color: { argb: '' } };
          cell.alignment = { horizontal: 'left', indent: 90, vertical: 'center', wrapText: true };
        });

        worksheet.mergeCells(`A${noCreationRow.number}:V${noCreationRow.number}`);
    }
}

const finRow = worksheet.addRow(['FIN']);
    finRow.height = 20; // Adjust height if necessary
    finRow.eachCell({ includeEmpty: true }, (cell) => {
        cell.font = { bold: true, name: 'Arial', size: 27 }; // Make "FIN" bold
        cell.alignment = { horizontal: 'left', indent: 90, vertical: 'middle' }; // Center align the "FIN"
    });

    worksheet.mergeCells(`A${finRow.number}:V${finRow.number}`);

  /*Object.keys(groupedData).forEach((creationDate) => {
    const dateRow = worksheet.addRow([`Le ${creationDate}`]);
    dateRow.height = 35; 
    dateRow.eachCell({ includeEmpty: true }, (cell, colNumber) => {
      cell.font = dateRowStyle.font;
      cell.alignment = dateRowStyle.alignment;
      cell.fill = dateRowStyle.fill;

      if (colNumber === 1) {
        worksheet.mergeCells(`A${dateRow.number}:V${dateRow.number}`); 
      }
    });

   
  

    groupedData[creationDate].forEach(async(cargo) => {
     
      const row = worksheet.addRow([
        cargo.numeroDeTransit || '',
        cargo.numeroDeBalise || '',
        //cargo.codeHS || '',
        //cargo.codeHS?.map(code_hs => code_hs.code_hs).join(`\n\n`) || '',
        Array.isArray(cargo.codeHS) 
        ? cargo.codeHS.map(item => item.code_hs).join('\n') 
        : '',
        cargo.corridor || '',
        cargo.typeDeVehicule || '',
        cargo.immatriculation || '',
        cargo.transitaire || '',
        cargo.chauffeur || '',
        cargo.telephone || '',
        creationDate, 
        cargo.creationHeureDebut || '',
        cargo.creationHeureFin || '',
        
        cargo.alarme?.map(alarme => alarme.niveau).join('\n\n') || '',
    cargo.alarme?.map(alarme => formatDate(alarme.date)).join('\n\n') || '',
    cargo.alarme?.map(alarme => alarme.heure).join('\n\n') || '',
    cargo.alarme?.map(alarme => alarme.lieu).join('\n\n') || '',
    cargo.alarme?.map(alarme => alarme.observation).join('\n\n') || '',
        
        formatDate(cargo.clotureDate) || '',
        cargo.clotureHeure || '',
        cargo.clotureLieu || '',
        cargo.clotureMode || '',
        cargo.duree || ''
      ]);

    //  const codeCount = cargo.codeHS?.length || 1; // Default to 1 if no alarms
    //  row.height = Math.max(25, codeCount * 25);
    //  const alarmCount = cargo.alarme?.length || 1; // Default to 1 if no alarms
  //row.height = Math.max(25, alarmCount * 25); // Adjust row height based on alarm count

  const codeCount = cargo.codeHS?.length || 1; // Default to 1 if no codeHS
const alarmCount = cargo.alarme?.length || 1; // Default to 1 if no alarms

// Determine the greater count
const maxCount = Math.max(codeCount, alarmCount);

// Set row height based on the larger count
row.height = Math.max(25, maxCount * 25);

 
  
  
  row.eachCell((cell) => {
    cell.alignment = { horizontal: 'left', vertical: 'top', wrapText: true }; // Text wrapping and alignment
  });
    });
  });*/
  

 /* worksheet.columns.forEach((column) => {
    column.width = 20; 
  });*/

  worksheet.columns.forEach((column, index) => {
    if (index === 16) {
      column.width = 40; 
    } else {
      column.width = 20;
    }
  });

  const fileName = `${getLastMonthNameAndYearInFrench()}.xlsx`;

  // Send the Excel file
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename="RAPPORT-${formatDate(start)}-${formatDate(end)}.xlsx"`);

  await workbook.xlsx.write(res);
  res.end();
});


app.get('/',(req, res)=>{
  res.render('Login', {
    pageTitle: 'Login'
  })
  
  })

  app.get('/accueil', (req, res)=>{
    res.render('Home', {
      pageTitle: 'Bienvenue '
    })
    
    })

    app.get('/compte', (req, res)=>{
      res.render('Profile', {
        pageTitle: 'Profile'
      })
      
      })

    app.get('/donnee/:id', (req, res)=>{
      res.render('Data', {
        id: req.params.id,
        pageTitle: 'Donnee'
      })
      
      })

  app.get('/enregistrement', (req, res)=>{
    res.render('Index', {
      pageTitle: 'Enregistrement '
    })
    
    })

    app.get('/forbidden', (req, res)=>{
      res.render('Forbidden',{
        pageTitle: 'Forbidden'
      })
    })

    app.get('/administrateur', (req, res)=>{
      res.render('admin/Index')
    })

    app.get('/administrateur/cargo/:id', (req, res)=>{
      res.render('admin/Cargo')
    })

    app.get('/utilisateurs', (req, res)=>{
      res.render('admin/ui')
    })

    app.get('/administrateur/utilisateur/:id', (req, res)=>{
      res.render('admin/user_data')
    })

    app.get('/mon-profile', (req, res)=>{
      res.render('admin/blank')
    })

    app.get('/tableau-de-bord', (req, res)=>{
      res.render('admin/dashboard')
    })

  app.use('/assets', express.static(path.join(__dirname, 'assets')));
  app.use(express.static(path.join(__dirname, 'public')));
const port = process.env.PORT || 3000;

db.sequelize.sync().then((req)=>{
    app.listen(port, () => {
        console.log(`Server running on port ${port}`);
      });
})