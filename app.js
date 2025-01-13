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
    return date.toISOString().split('T')[0]; 
  };

  const groupedData = data.reduce((acc, cargo) => {
    const creationDate = formatDate(cargo.creationDate);
    if (!acc[creationDate]) acc[creationDate] = [];
    acc[creationDate].push(cargo);
    return acc;
  }, {});

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Cargo Data');

  const dateRowStyle = {
    font: { bold: true },
    alignment: { horizontal: 'center', vertical: 'middle' },
    fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: '00b050' } }, // Green background
  };

  const headerStyle = {
    font: { bold: true, name: 'Arial' },
    fontHeader: { bold: true, name: 'Arial', size: 14 },
    alignment: { horizontal: 'center' },
    fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'ffff00' } }, // Yellow background
    fill2: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'ffffff' } },
    border: { 
      top: { style: 'thin', color: { argb: '000000' } },
      left: { style: 'thin', color: { argb: '000000' } },
      right: { style: 'thin', color: { argb: '000000' } } 
    },
    
  };

  const dataStyle = {
    alignment: { horizontal: 'left' },
  };

  // Adjust header row to match image
  const headerRow1 = worksheet.addRow([
    'RAPPORT DE NOVEMBRE 2024'
  ]);
  headerRow1.height = 35
  headerRow1.eachCell((cell) => {
    cell.font = headerStyle.fontHeader;
    cell.alignment = headerStyle.alignment;
    cell.fill = headerStyle.fill;
    cell.border = headerStyle.border; 
  });

  worksheet.mergeCells(`A1:L1`); 

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
        
        cargo.alarme?.map(alarme => alarme.niveau) || '', 
        cargo.alarme?.map(alarme => formatDate(alarme.date)) || '', 
        cargo.alarme?.map(alarme => alarme.heure) || '', 
        cargo.alarme?.map(alarme => alarme.lieu) || '', 
        cargo.alarme?.map(alarme => alarme.observation) || '',
        
        cargo.clotureDate || '',
        cargo.clotureHeure || '',
        cargo.clotureLieu || '',
        cargo.duree || ''
      ]);
      row.eachCell((cell) => {
        cell.alignment = dataStyle.alignment;
      });
    });
  });

  worksheet.columns.forEach((column) => {
    column.width = 20; 
  });

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', 'attachment; filename=CargoData.xlsx');

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