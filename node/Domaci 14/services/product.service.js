const db = require("../db/db.js");

const getItemBySlug = async (itemSlug) => {
  const [rows] = await db.query("SELECT * FROM items WHERE slug = ? LIMIT 1", [itemSlug]);

  return rows[0];
};

const getAllItems = async () => {
  const [rows] = await db.query("SELECT * FROM items");
  return rows;
};

const getCartItems = async (itemsIds) => {
  if (!Array.isArray(itemsIds) || itemsIds.length === 0) return [];

  const uniqueIds = [...new Set(itemsIds)];
  const placeholders = uniqueIds.map(() => "?").join(",");
  const sql = `SELECT i.* FROM items i WHERE i.id IN (${placeholders})`;
  const [rows] = await db.query(sql, uniqueIds);

  const quantityMap = new Map();
  itemsIds.forEach((id) => {
    quantityMap.set(id, (quantityMap.get(id) || 0) + 1);
  });

  return rows.map((item) => ({
    ...item,
    quantity: quantityMap.get(String(item.id)) || quantityMap.get(item.id) || 0,
  }));
};

module.exports = { getItemBySlug, getAllItems, getCartItems };
