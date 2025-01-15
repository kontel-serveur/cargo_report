'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const process = require('process');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/config.json')[env];
const db = {};

let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}

fs
  .readdirSync(__dirname)
  .filter(file => {
    return (
      file.indexOf('.') !== 0 &&
      file !== basename &&
      file.slice(-3) === '.js' &&
      file.indexOf('.test.js') === -1
    );
  })
  .forEach(file => {
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  });

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

const Cargo = require("../models/Cargo")(sequelize, Sequelize);
const DepassementDelai = require("../models/DepassementDelai")(sequelize, Sequelize);
const CableDeverouille = require("../models/CableDeverouille")(sequelize, Sequelize);

Cargo.hasMany(DepassementDelai,{
  foreignKey:{
    name: 'cargo',
    allowNull: false
  },
  onDelete: 'CASCADE',
})

DepassementDelai.belongsTo(Cargo,{
  foreignKey: {
    name: 'cargo',
    allowNull: false
  },
  onDelete: 'CASCADE',

})

Cargo.hasOne(CableDeverouille,{
  foreignKey:{
    name: 'cargo',
    allowNull: false
  },
  onDelete: 'CASCADE',
})

CableDeverouille.belongsTo(Cargo,{
  foreignKey: {
    name: 'cargo',
    allowNull: false
  },
  onDelete: 'CASCADE',

})

module.exports = db;
