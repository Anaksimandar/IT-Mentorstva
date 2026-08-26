const CoreModel = require("../models/coreModel");
const Technology = require("../models/technology.model");

module.exports = {
  addTechnology: async (req, res) => {
    const { name } = req.body;
    if (!name) {
      return res.status(400).send("Technology name is required");
    }
    try {
      await Technology.addTechnology(name);
      return res.redirect("/admin/technologies"); // Redirect to the companies page after adding
    } catch (err) {
      console.error(err);
      return res.status(500).send("Error adding company");
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
      return res.status(500).send("Error removing technology");
    } catch (err) {
      console.error(err);
      return res.status(500).send("Error removing technology");
    }
  },
  showTechnologies: async (req, res) => {
    try {
      const technologies = await CoreModel.getAll(Technology.tableName); // Retrieve all technologies from the model
      return res.render("admin/technologies", { technologies: technologies }); // Render the technologies view with technology data
    } catch (err) {
      console.error(err);
      return res.status(500).send("Error retrieving technologies");
    }
  },
};
