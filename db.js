const fs = require('fs');
const mysql = require('mysql');
require('dotenv').config();

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE
})
  
connection.connect();

const validWords = fs.readFileSync('valid.txt', 'utf8').split("\n");

let query = "INSERT INTO words(word) VALUES ";
for (let word of validWords) {
  query += `('${word}'),`;
}
query = query.slice(0, query.length - 1) + ';';

connection.query(query, (error, result, fields) => {
  if (error) {
    throw error;
  }
});

connection.query('SELECT COUNT(*) FROM words;', (error, result, fields) => {
  if (error) {
    throw error;
  }
})

connection.end(err => {
  if (err) {
    throw err;
  }
});