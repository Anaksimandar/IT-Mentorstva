const dbconnection = require("../db/db");
const bcrypt = require("bcrypt");

const getAllUsers = async (req, res) => {
  try {
    const [users] = await dbconnection.query("SELECT * FROM users");
    return users;
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
};

const userExistsByEmail = async (email) => {
  const [user] = await dbconnection.query("SELECT * FROM users WHERE email = ? LIMIT 1", [email]);
  console.log("User exists by email result:", user);
  return user[0]; // Return the user object if found, otherwise undefined
};

const loginUser = async (email, password) => {
  try {
    const user = await userExistsByEmail(email);
    if (!user) {
      return null; // No user found with the provided email
    }
    const isPasswordSame = await bcrypt.compare(password, user.password);
    if (!isPasswordSame) {
      return null; // Password does not match
    }
    return user.name; // Return the user ID if login is successful
  } catch (error) {
    console.error("Error logging in user:", error);
    throw error;
  }
};

const userExists = async (email) => {
  try {
    const [users] = await dbconnection.query("SELECT * FROM users WHERE email = ?", [email]);
    return users.length > 0;
  } catch (error) {
    console.error("Error checking if user exists:", error);
    throw error;
  }
};

const createUser = async (userData) => {
  const { name, email, password } = userData;
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
module.exports = {
  getAllUsers,
  createUser,
  userExists,
  loginUser,
};
