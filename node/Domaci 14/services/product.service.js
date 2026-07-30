const db = require("../db/db.js");

const getItemBySlug = async (itemSlug) => {
  const [rows] = await db.query("SELECT * FROM items WHERE slug = ? LIMIT 1", [itemSlug]);

  return rows[0];
};

const getAllItems = async () => {
  const [rows] = await db.query("SELECT * FROM items");
  return rows;
};

const getItemById = async (itemId) => {
  const [rows] = await db.query("SELECT * FROM items WHERE id = ? LIMIT 1", [itemId]);
  return rows[0];
};

const normalizeCartItems = (cartItems = []) => {
  if (!Array.isArray(cartItems)) {
    return [];
  }

  return cartItems.reduce((acc, item) => {
    if (!item) {
      return acc;
    }

    if (typeof item === "object" && item !== null && "itemId" in item) {
      acc.push({
        itemId: String(item.itemId),
        quantity: Number(item.quantity) > 0 ? Number(item.quantity) : 1,
      });
      return acc;
    }

    acc.push({ itemId: String(item), quantity: 1 });
    return acc;
  }, []);
};

const getCartItems = async (cartItems) => {
  const normalizedCart = normalizeCartItems(cartItems);
  if (normalizedCart.length === 0) return [];

  const itemIds = normalizedCart.map((entry) => entry.itemId);
  const uniqueIds = [...new Set(itemIds)];
  const placeholders = uniqueIds.map(() => "?").join(",");
  const sql = `SELECT i.* FROM items i WHERE i.id IN (${placeholders})`;
  const [rows] = await db.query(sql, uniqueIds);

  const quantityMap = new Map();
  normalizedCart.forEach(({ itemId, quantity }) => {
    const key = String(itemId);
    quantityMap.set(key, (quantityMap.get(key) || 0) + Number(quantity || 1));
  });

  return rows.map((item) => ({
    ...item,
    quantity: quantityMap.get(String(item.id)) || 0,
  }));
};

module.exports = { getItemBySlug, getAllItems, getCartItems, getItemById };
