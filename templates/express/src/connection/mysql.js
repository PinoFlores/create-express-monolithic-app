const mysql = require('mysql');

const { DATABASE_PORT, DATABASE_NAME } = process.env;

const conn = mysql.createConnection({
  user: 'root',
  password: '',
  host: 'localhost',
  port: DATABASE_PORT,
  database: DATABASE_NAME,
});

module.exports = {
  getConnection: () => conn,
};