const db = require("../db/db"); // your mysql2 pool, adjust path as needed

const CoreModel = {
  getAll: async (tableName) => {
    const [rows] = await db.query("SELECT * FROM " + tableName);
    return rows;
  },
  deleteById: async (tableName, id) => {
    const [rows] = await db.query("DELETE FROM " + tableName + " WHERE id = " + id);
    return rows.affectedRows;
  },
};

module.exports = CoreModel;
