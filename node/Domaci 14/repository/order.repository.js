const db = require("../db/db");

const insertOrder = async (orderData) => {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const [orderResult] = await connection.query(
      "INSERT INTO orders (user_id, full_name, email, address, city, zip, payment_method) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [
        orderData.userId,
        orderData.fullName,
        orderData.email,
        orderData.address,
        orderData.city,
        orderData.zip,
        orderData.paymentMethod,
      ],
    );

    const orderId = orderResult.insertId;

    if (!Array.isArray(orderData.items) || orderData.items.length === 0) {
      throw new Error("Order must contain at least one item");
    }

    const values = [];
    const placeholders = orderData.items.map((item) => {
      values.push(orderId, item.id, item.quantity, item.price);
      return "(?, ?, ?, ?)";
    });

    await connection.query(
      `INSERT INTO order_items (order_id, item_id, quantity, price) VALUES ${placeholders.join(", ")}`,
      values,
    );

    for (const item of orderData.items) {
      await connection.query("UPDATE items SET stock = stock - ? WHERE id = ?", [
        item.quantity,
        item.id,
      ]);
    }

    await connection.commit();

    return { orderId, itemsInserted: orderData.items.length };
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
};

const findOrdersByUserId = async (userId) => {
  const connection = await db.getConnection();

  try {
    const [orders] = await connection.query("SELECT * FROM orders WHERE user_id = ?", [userId]);
    return orders;
  } finally {
    connection.release();
  }
};

const findOrderById = async (userId, orderId) => {
  console.log("Fetching order details for userId:", userId, "orderId:", orderId);
  const connection = await db.getConnection();
  try {
    const [order] = await connection.query(
      `
      SELECT * 
      FROM order_items as oi 
      JOIN orders as o ON o.id = oi.order_id 
      JOIN items as i ON i.id = oi.item_id 
      WHERE o.id = ? AND o.user_id = ?`,
      [orderId, userId],
    );
    return order;
  } finally {
    connection.release();
  }
};

module.exports = { insertOrder, findOrdersByUserId, findOrderById };
