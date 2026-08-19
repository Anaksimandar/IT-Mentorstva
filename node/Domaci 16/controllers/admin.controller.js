const Company = require("../models/company.model");
const Technology = require("../models/technology.model");
const User = require("../models/user.model");
const Jobs = require("../models/job.model");
const { validationResult } = require("express-validator");
const CoreModel = require("../models/coreModel");

module.exports = {
  showCompanies: async (req, res) => {
    try {
      const companies = await CoreModel.getAll(Company.tableName); // Retrieve all companies from the model
      res.render("admin/companies", { companies: companies }); // Render the companies view with company data
    } catch (err) {
      console.error(err);
      res.status(500).send("Error retrieving companies");
    }
  },
  showTechnologies: async (req, res) => {
    try {
      const technologies = await CoreModel.getAll(Technology.tableName); // Retrieve all technologies from the model
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
      const affectedRows = await CoreModel.deleteById(Technology.tableName, id);
      if (affectedRows > 0) {
        return res.redirect("/admin/technologies"); // Redirect to the companies page after adding
      }
      console.error();
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
      const affectedRows = await CoreModel.deleteById(Company.tableName, id);
      if (affectedRows > 0) {
        return res.redirect("/admin/companies"); // Redirect to the companies page after adding
      }
      return res.status(500).send("Error removing company");
    } catch (err) {
      console.error(err);
      return res.status(500).send("Error removing technology");
    }
  },
  showJobs: async (req, res) => {
    try {
      return res.render("admin/jobs", {
        users: await CoreModel.getAll(User.tableName),
        technologies: await CoreModel.getAll(Technology.tableName),
        companies: await CoreModel.getAll(Company.tableName),
        jobs: await Jobs.getAll(),
      });
    } catch (err) {
      console.error(err);
      return res.status(500).send("Error preparing jobs panel");
    }
  },
  addJob: async (req, res) => {
    const users = await CoreModel.getAll(User.tableName);
    const technologiesList = await CoreModel.getAll(Technology.tableName);
    const companies = await CoreModel.getAll(Company.tableName);
    const jobs = await Jobs.getAll();

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.render("admin/jobs", {
        users: users,
        technologies: technologiesList,
        companies: companies,
        jobs: jobs,
        errors: errors.array(),
      });
    }

    const { userId, companyId, technologies, title, description, salary, due_date } = req.body;
    console.log(req.body);

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
  searchJobs: async (req, res) => {
    console.log(req.query);
    try {
      return res.render("admin/jobs", {
        users: await CoreModel.getAll(User.tableName),
        technologies: await CoreModel.getAll(Technology.tableName),
        companies: await CoreModel.getAll(Company.tableName),
        jobs: await Jobs.search(req.query),
      });
    } catch (err) {
      console.error(err);
      return res.status(500).send("Error preparing jobs panel");
    }
  },
  deleteJob: async (req, res) => {
    const { id } = req.query;
    try {
      const rowsAffected = await Jobs.delete(id);
      return res.render("admin/jobs", {
        users: await CoreModel.getAll(User.tableName),
        technologies: await CoreModel.getAll(Technology.tableName),
        companies: await CoreModel.getAll(Company.tableName),
        jobs: await Jobs.getAll(),
      });

      if (rowsAffected > 0) {
        return res.render("admin/jobs");
      }
    } catch (err) {
      console.error(err);
      return res.status(500).send("Error deleting job.");
    }
  },
};
