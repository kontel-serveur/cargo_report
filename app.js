require('express-async-errors');
require('dotenv').config();
const express = require('express');
const app = express();
const fs = require('fs')
const path = require('path')

const helmet = require('helmet')
const cors = require('cors')
const xss = require('xss-clean')

const bodyParser = require('body-parser');
const ExcelJS = require('exceljs')

const db = require('./models');
const {Cargo} = require('./models')


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
  const data = await Cargo.findAll(); 

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

  const dailyWorksheet = workbook.addWorksheet('Création Journalière');

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

  dailyWorksheet.eachRow((row, rowIndex) => {
    if (rowIndex === 1) {
      row.eachCell((cell) => {
        cell.font = dailyHeaderStyle.font;
        cell.alignment = dailyHeaderStyle.alignment;
        cell.fill = dailyHeaderStyle.fill;
        cell.border = dailyHeaderStyle.border;
      });
    }
  });


  let rowIndex = 2;
  Object.keys(dailyDataCount).forEach((dateKey) => {
    dailyWorksheet.addRow([dateKey, dailyDataCount[dateKey]]);
    rowIndex++;
  });



  const dateRowStyle = {
    font: { bold: true, name: 'Arial', size: 15, color: { argb: '000000' } },
    alignment: {horizontal: 'left', indent: 90, vertical: 'middle' },
    fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: '00b050' } }, // Green background
  };

  dailyWorksheet.columns.forEach((column) => {
    column.width = 20; 
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

  worksheet.mergeCells(`A1:U1`); 

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
    
    'Durée Trst'
  ]);
  headerRow2.eachCell((cell) => {
    cell.font = headerStyle.font;
    cell.alignment = headerStyle.alignment;
    cell.fill = headerStyle.fill2;
    cell.border = headerStyle.border; 
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
    ''
  ]);
  headerRow3.eachCell((cell) => {
    cell.font = headerStyle.font;
    cell.alignment = headerStyle.alignment;
    cell.fill = headerStyle.fill2;
    cell.border = headerStyle.border; 
  });

  worksheet.views = [{ state: 'frozen', ySplit: 3 }]; 

  Object.keys(groupedData).forEach((creationDate) => {
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

    groupedData[creationDate].forEach((cargo) => {
      const row = worksheet.addRow([
        cargo.numeroDeTransit || '',
        cargo.numeroDeBalise || '',
        cargo.codeHS || '',
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
      
      const alarmCount = cargo.alarme?.length || 1; // Default to 1 if no alarms
  row.height = Math.max(25, alarmCount * 25); // Adjust row height based on alarm count
  
  row.eachCell((cell) => {
    cell.alignment = { horizontal: 'left', vertical: 'top', wrapText: true }; // Text wrapping and alignment
  });
    });
  });
  

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

  app.use('/assets', express.static(path.join(__dirname, 'assets')));
  app.use(express.static(path.join(__dirname, 'public')));
const port = process.env.PORT || 3000;

db.sequelize.sync().then((req)=>{
    app.listen(port, () => {
        console.log(`Server running on port ${port}`);
      });
})