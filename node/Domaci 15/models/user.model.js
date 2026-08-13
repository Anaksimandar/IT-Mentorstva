const bycrypt = require("bcrypt");
const db = require("../db/db");

const User = {
  getAll: async () => {
    try {
      const [rows] = await db.query("SELECT * FROM users");
      console.log("Users retrieved:", rows);
      return rows;
    } catch (error) {
      throw new Error("Error retrieving users: " + error.message);
    }
  },
  create: async (name, email, password, roleID) => {
    const hashedPassword = await bycrypt.hash(password, 10);
    const [result] = await db.execute(
      "INSERT INTO users (name, email, password, role_id) VALUES (?, ?, ?, ?)",
      [name, email, hashedPassword, roleID],
    );
    return result.insertId; // Return the inserted user ID
  },
  getByEmail: async (email) => {
    const [rows] = await db.execute("SELECT * FROM users WHERE email = ?", [email]);
    return rows[0]; // Return the user object or undefined if not found
  },
};

module.exports = User;
