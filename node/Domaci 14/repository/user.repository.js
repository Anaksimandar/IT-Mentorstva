const dbconnection = require("../db/db");
const bcrypt = require("bcrypt");

const findAllUsers = async (req, res) => {
  try {
    const [users] = await dbconnection.query("SELECT * FROM users");
    return users;
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
};

const findUserByEmail = async (email) => {
  const [user] = await dbconnection.query("SELECT * FROM users WHERE email = ? LIMIT 1", [email]);
  return user[0]; // Return the user object if found, otherwise undefined
};

const insertUser = async (userData) => {
  const { name, email, password } = userData;
  const userExists = await findUserByEmail(email);
  if (userExists) {
    throw new Error("User with this email already exists");
  }
  const hashedPassword = await bcrypt.hash(password, 10); // Hash the password before storing
  try {
    const [result] = await dbconnection.query(
      "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
      [name, email, hashedPassword],
    );
    return result.insertId; // Return the ID of the newly created user
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
};

const findUserById = async (userId) => {
  const [rows] = await dbconnection.query("SELECT * FROM users WHERE id = ? LIMIT 1", [userId]);
  return rows[0];
};

module.exports = {
  findAllUsers,
  insertUser,
  findUserById,
  findUserByEmail,
};
