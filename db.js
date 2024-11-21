// db.js
const mysql = require('mysql');

const db = mysql.createConnection({
  host: 'localhost', // Endereço do servidor MySQL
  user: 'scfp', // Seu usuário MySQL
  password: '12345', // Sua senha MySQL
  database: 'SCFP'
});

db.connect((err) => {
  if (err) {
    console.error('Erro ao conectar ao banco de dados:', err);
  } else {
    console.log('Conectado ao banco de dados MySQL.');
  }
});

module.exports = db;