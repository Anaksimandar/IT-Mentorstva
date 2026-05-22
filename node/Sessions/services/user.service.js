const pool = require("./my-sql");
const bcrypt = require("bcrypt");

const getUsers = async () => {
	const [rows] = await pool.query("SELECT * FROM users");
	return rows;
};

const userExists = async (email) => {
	const [rows] = await pool.query("SELECT id FROM users WHERE email = ?", [
		email,
	]);
	return rows.length > 0;
};

const registerUser = async (name, email, password) => {
	if (await userExists(email)) {
		throw new Error("User already exists");
	}
	const saltRounds = 10;
	const hashedPassword = await bcrypt.hash(password, saltRounds);
	const [result] = await pool.query(
		"INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
		[name, email, hashedPassword],
	);
	return result.insertId;
};

const getUserByEmail = async (email) => {
	const [rows] = await pool.query(
		"SELECT * FROM users WHERE email = ? LIMIT 1",
		[email],
	);
	return rows[0];
};

const userExistsById = async (userId) => {
	const [rows] = await pool.query("SELECT id FROM users WHERE id = ?", [
		userId,
	]);
	return rows.length > 0;
};

const loginUser = async (email, password) => {
	const user = await getUserByEmail(email);

	if (user && (await bcrypt.compare(password, user.password))) {
		return user;
	}
	return undefined;
};

module.exports = { getUsers, registerUser, loginUser, userExistsById };
