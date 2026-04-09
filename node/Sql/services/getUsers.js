const pool = require("../connection");

const getUsers = async () => {
	const [rows] = await pool.query("SELECT * FROM users");
	return rows;
};

module.exports = { getUsers };
