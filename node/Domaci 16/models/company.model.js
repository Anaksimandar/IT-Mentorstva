const db = require("../db/db");
const { tableName } = require("./job.model");

const Company = {
  tableName: "Companies",
  getAll: async () => {
    try {
      const [rows] = await db.query("SELECT * FROM companies");
      console.log("Companies retrieved:", rows);
      return rows;
    } catch (error) {
      throw new Error("Error retrieving companies: " + error.message);
    }
  },
  getAllTechnologies: async () => {
    try {
      const [rows] = await db.query("SELECT * FROM technologies");
      console.log("Technologies retrieved:", rows);
      return rows;
    } catch (error) {
      throw new Error("Error retrieving technologies: " + error.message);
    }
  },
  addCompany: async (name) => {
    try {
      const [result] = await db.query("INSERT INTO companies (name) VALUES (?)", [name]);
      console.log("Company added with ID:", result.insertId);
      return result.insertId;
    } catch (error) {
      throw new Error("Error adding company: " + error.message);
    }
  },
  deleteCompany: async (id) => {
    try {
      const [result] = await db.query("DELETE FROM companies WHERE id = ?", [id]);
      return result.affectedRows;
    } catch (error) {
      throw new Error("Error deleting company: " + error.message);
    }
  },
};

module.exports = Company;
