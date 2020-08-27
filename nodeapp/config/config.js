const path = require('path');
const rootPath = path.normalize(__dirname + '/..');
const env = process.env.NODE_ENV || 'development';

const config = {
  development: {
    root: rootPath,
    app: {
      name: 'nodeapp'
    },
    port: process.env.PORT || 3000,
    dbhost: process.env.DBHOST || 'mysql',
    db: process.env.DBNAME || 'nodeapp',
    dbuser: process.env.DBUSER || 'admin',
    dbpass: process.env.DBPASS || 'pass'
  },

  test: {
    root: rootPath,
    app: {
      name: 'nodeapp'
    },
    port: process.env.PORT || 3000,
    dbhost: process.env.DBHOST || 'mysql',
    db: process.env.DBNAME || 'nodeapp',
    dbuser: process.env.DBUSER || 'admin',
    dbpass: process.env.DBPASS || 'pass'
  },

  production: {
    root: rootPath,
    app: {
      name: 'nodeapp'
    },
    port: process.env.PORT || 3000,
    dbhost: process.env.DBHOST || 'mysql',
    db: process.env.DBNAME || 'nodeapp',
    dbuser: process.env.DBUSER || 'admin',
    dbpass: process.env.DBPASS || 'pass'
  }
};

module.exports = config[env];
