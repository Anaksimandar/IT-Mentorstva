const Company = require("../models/company.model");
const Technology = require("../models/technology.model");
const User = require("../models/user.model");
const Jobs = require("../models/job.model");
const { validationResult } = require("express-validator");

module.exports = {
  showCompanies: async (req, res) => {
    try {
      const companies = await Company.getAll(); // Retrieve all companies from the model
      res.render("admin/companies", { companies: companies }); // Render the companies view with company data
    } catch (err) {
      console.error(err);
      res.status(500).send("Error retrieving companies");
    }
  },
  showTechnologies: async (req, res) => {
    try {
      const technologies = await Technology.getAll(); // Retrieve all technologies from the model
      res.render("admin/technologies", { technologies: technologies }); // Render the technologies view with technology data
    } catch (err) {
      console.error(err);
      res.status(500).send("Error retrieving technologies");
    }
  },
  addCompany: async (req, res) => {
    const { name } = req.body;
    if (!name) {
      return res.status(400).send("Company name is required");
    }
    try {
      await Company.addCompany(name);
      res.redirect("/admin/companies"); // Redirect to the companies page after adding
    } catch (err) {
      console.error(err);
      res.status(500).send("Error adding company");
    }
  },
  addTechnology: async (req, res) => {
    const { name } = req.body;
    if (!name) {
      return res.status(400).send("Technology name is required");
    }
    try {
      await Technology.addTechnology(name);
      res.redirect("/admin/technologies"); // Redirect to the companies page after adding
    } catch (err) {
      console.error(err);
      res.status(500).send("Error adding company");
    }
  },
  deleteTechnology: async (req, res) => {
    const { id } = req.query;
    if (!id) {
      return res.status(400).send("Id is required");
    }
    try {
      const affectedRows = await Technology.deleteTechnology(id);
      if (affectedRows > 0) {
        return res.redirect("/admin/technologies"); // Redirect to the companies page after adding
      }
      return res.status(500).send("Error removing technology");
    } catch (err) {
      console.error(err);
      res.status(500).send("Error removing technology");
    }
  },
  deleteCompany: async (req, res) => {
    const { id } = req.query;
    if (!id) {
      return res.status(400).send("Id is required");
    }
    try {
      const affectedRows = await Company.deleteCompany(id);
      if (affectedRows > 0) {
        return res.redirect("/admin/technologies"); // Redirect to the companies page after adding
      }
      return res.status(500).send("Error removing company");
    } catch (err) {
      console.error(err);
      return res.status(500).send("Error removing technology");
    }
  },
  showJobs: async (req, res) => {
    try {
      const users = await User.getAll();
      const technologies = await Technology.getAll();
      const companies = await Company.getAll();
      const jobs = await Jobs.getAll();

      return res.render("admin/jobs", {
        users: users,
        technologies: technologies,
        companies: companies,
        jobs: jobs,
      });
    } catch (err) {
      console.error(err);
      return res.status(500).send("Error preparing jobs panel");
    }
  },
  addJob: async (req, res) => {
    const { userId, companyId, technologies, title, description, salary, due_date } = req.body;
    try {
      const jobId = await Jobs.create(
        userId,
        companyId,
        technologies,
        title,
        description,
        salary,
        due_date,
      );
      return res.status(201).send("Job created successfully:", jobId);
    } catch (err) {
      return res.status(500).send(err);
    }
  },
};
