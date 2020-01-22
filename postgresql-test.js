const { Client } = require("pg");
let client = new Client({
  user: "postgres",
  host: "localhost",
  database: "spelling-bee",
  password: "password",
  port: 5432
});

client
  .connect()
  .then(() => console.log("Connected successfully!"))
  // .then(() =>
  //   client.query("INSERT INTO users (username, password) VALUES($1, $2)", [
  //     "Bilby",
  //     "passhash"
  //   ])
  // )
  .then(() => client.query("SELECT * FROM users"))
  .then(results => console.table(results.rows))
  .catch(err => console.error("ERROR: ", err));
