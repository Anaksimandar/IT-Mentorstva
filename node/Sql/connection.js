const sql = require("mysql2/promise");

const pool = sql.createPool({
	host: "localhost",
	user: "root",
	port: 3306,
	password: "",
	database: "it-mentorstva",
	waitForConnections: true,
	connectionLimit: 10,
	queueLimit: 0,
});

module.exports = pool;
