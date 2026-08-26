const Company = require("../models/company.model");

module.exports = {
  showLogin: (req, res) => {
    const error = req.session.error; // Retrieve the error message from the session
    req.session.error = null; // Clear any previous error messages
    return res.render("login", { error: error }); // Pass the error message to the view
  },
  showRegister: (req, res) => {
    const error = req.session.error; // Retrieve the error message from the session
    req.session.error = null; // Clear any previous error messages
    return res.render("register", { error: error }); // Pass the error message to the view
  },
  showDashboard: (req, res) => {
    return res.render("dashboard", { name: req.session.name }); // Render the dashboard view with the user's name
  },
  showSettings: (req, res) => {
    return res.render("settings", { name: req.session.name }); // Render the settings view with the user's name
  },
  showAdminPanel: (req, res) => {
    return res.render("admin", { name: req.session.name }); // Render the admin panel view with the user's name
  },
};
