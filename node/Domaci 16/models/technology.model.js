const db = require("../db/db");
const { tableName } = require("./job.model");

const Technology = {
  tableName: "Technologies",
  getAll: async () => {
    try {
      const [rows] = await db.query("SELECT * FROM technologies");
      console.log("Technologies retrieved:", rows);
      return rows;
    } catch (error) {
      throw new Error("Error retrieving technologies: " + error.message);
    }
  },
  addTechnology: async (name) => {
    try {
      const [result] = await db.query("INSERT INTO technologies (name) VALUES (?)", [name]);
      console.log("Tech added with ID:", result.insertId);
      return result.insertId;
    } catch (error) {
      throw new Error("Error adding tech: " + error.message);
    }
  },
  deleteTechnology: async (id) => {
    try {
      const [result] = await db.query("DELETE FROM technologies WHERE id = ?", [id]);
      return result.affectedRows;
    } catch (error) {
      throw new Error("Error deleting tech: " + error.message);
    }
  },
};

module.exports = Technology;
