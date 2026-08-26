const CoreModel = require("../models/coreModel");
const Company = require("../models/company.model");

module.exports = {
  showCompanies: async (req, res) => {
    try {
      const companies = await CoreModel.getAll(Company.tableName); // Retrieve all companies from the model
      return res.render("admin/companies", { companies: companies }); // Render the companies view with company data
    } catch (err) {
      console.error(err);
      return res.status(500).send("Error retrieving companies");
    }
  },

  addCompany: async (req, res) => {
    const { name } = req.body;
    if (!name) {
      return res.status(400).send("Company name is required");
    }
    try {
      await Company.addCompany(name);
      return res.redirect("/admin/companies"); // Redirect to the companies page after adding
    } catch (err) {
      console.error(err);
      return res.status(500).send("Error adding company");
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
};
