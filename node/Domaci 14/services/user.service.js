const { insertUser } = require("../repository/user.repository");
const { findUserByEmail } = require("../repository/user.repository");
const bcrypt = require("bcrypt");

const registerUser = async (userData) => {
  // validate data
  if (!userData.name || !userData.email || !userData.password || !userData.confirmPassword) {
    throw new Error("All fields are required");
    return;
  }
  if (userData.name.length < 3) {
    throw new Error("Name must be at least 3 characters long");
  }
  if (userData.password.length < 6) {
    throw new Error("Password must be at least 6 characters long");
  }
  if (userData.password !== userData.confirmPassword) {
    throw new Error("Passwords do not match");
  }
  try {
    const userId = await insertUser(userData);
    return userId;
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
};

const loginUser = async (userData) => {
  const errors = [];
  if (!userData.email || !userData.password) {
    throw new Error("Email and password are required");
  }
  if (userData.password.length < 6) {
    throw new Error("Password must be at least 6 characters long");
  }

  try {
    const user = await findUserByEmail(userData.email);
    if (!user) {
      throw new Error("Invalid email or password");
    }
    const isPasswordSame = await bcrypt.compare(userData.password, user.password);
    if (!isPasswordSame) {
      throw new Error("Invalid email or password");
    }
    return user.id; // Return the user ID so callers can use it
  } catch (error) {
    throw error;
  }
};

module.exports = {
  registerUser,
  loginUser,
};
