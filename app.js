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

const db = require('./models');


const UserAuthentication = require('./middleware/User')

const UserRouter = require('./routes/User')
const TokenVerificationRouter = require('./routes/tokenVerification')
const CargoRouter = require('./routes/Cargo')
const ProfileRouter = require('./routes/Profile')




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

    app.get('/admin', (req, res)=>{
      res.render('admin/Index')
    })

    app.get('/ui', (req, res)=>{
      res.render('admin/ui')
    })

    app.get('/blank', (req, res)=>{
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