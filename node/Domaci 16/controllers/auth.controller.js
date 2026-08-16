const db = require("../db/db");
const bycrypt = require("bcrypt");
const { saveErrorAndRedirect } = require("../helpers/session.helper");
const User = require("../models/user.model");

module.exports = {
  login: async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return saveErrorAndRedirect(req, res, "/login", "Invalid email or password");
    }
    try {
      const user = await User.getByEmail(email);
      if (!user) {
        return saveErrorAndRedirect(req, res, "/login", "Invalid email or password");
      }
      const isPasswordSame = await bycrypt.compare(password, user.password);
      if (!isPasswordSame) {
        return saveErrorAndRedirect(req, res, "/login", "Invalid email or password");
      }
      req.session.userId = user.id; // Store the user ID in the session
      req.session.isLoggedIn = true;
      req.session.name = user.name; // Store the user's name in the session
      req.session.role = Number(user.role_id) === 1 ? "admin" : "user";

      return req.session.save(() => {
        res.redirect("/dashboard");
      });
    } catch (error) {
      console.error("Error during login:", error);
      return res.status(500).send("Internal server error");
    }
  },
  register: async (req, res) => {
    const { name, email, password, confirmPassword } = req.body;
    const errors = [];
    if (password !== confirmPassword) {
      return res.status(400).send("Passwords do not match");
    }
    try {
      const user = await User.getByEmail(email);
      if (user) {
        return saveErrorAndRedirect(req, res, "/register", "Email already exists");
      }
    } catch (error) {
      console.error("Error checking user existence:", error);
      return res.status(500).send("Internal server error");
    }

    try {
      const roleId = password == "ADMIN_SIFRA" ? 1 : 2; // Assuming 1 is the ID for admin role and 2 for regular user role
      console.log("Role ID determined:", roleId);
      req.session.userId = await User.create(name, email, password, roleId);
      req.session.isLoggedIn = true; // Set a flag to indicate the user is logged in
      req.session.name = name; // Store the user's name in the session
      req.session.role = roleId === 1 ? "admin" : "user"; // Store the user's role in the session
      return req.session.save(() => {
        res.redirect("/dashboard");
      });
    } catch (error) {
      console.error("Error inserting user:", error);
      return res.status(500).send("Internal server error");
    }
  },
  logout: async (req, res) => {
    try {
      await req.session.destroy();
      return res.redirect("/login"); // Redirect to the login page after successful logout
    } catch (error) {
      console.error("Error destroying session:", error);
      return res.status(500).send("Internal server error");
    }
  },
};
