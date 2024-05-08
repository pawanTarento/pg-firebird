// connection.js
const { Sequelize } = require('sequelize');

// Replace the following values with your actual database credentials
const sequelize = new Sequelize('pg-db', 'pg-role', 'test1234', {
  host: 'localhost',
  dialect: 'postgres',
  pool: {
    max: 10, // Maximum number of connections in the pool
    min: 0, // Minimum number of connections in the pool
    acquire: 30000, // Maximum time, in milliseconds, that a connection can be idle before being released
    idle: 10000 // Maximum time, in milliseconds, that a connection can be idle before being closed
  }
});

module.exports = sequelize;
