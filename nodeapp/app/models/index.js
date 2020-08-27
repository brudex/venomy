const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const config = require('../../config/config');
const db = {};
console.log('The config is >>',JSON.stringify(config));
const sequelize = new Sequelize(config.db, config.dbuser, config.dbpass, {
  host: config.dbhost,
  dialect: 'mysql' /* one of 'mysql' | 'mariadb' | 'postgres' | 'mssql' */
});

fs.readdirSync(__dirname)
  .filter((file) => (file.indexOf('.') !== 0) && (file !== 'index.js'))
  .forEach((file) => {
    const model = sequelize['import'](path.join(__dirname, file));
    db[model.name] = model;
  });

Object.keys(db).forEach((modelName) => {
  if ('associate' in db[modelName]) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
