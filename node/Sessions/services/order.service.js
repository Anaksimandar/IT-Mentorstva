const pool = require("./my-sql");

const checkout = async (userId, order, items) => {
	// validate order data
	// make transaction - insert into order and insert into order_items
	const connection = await pool.getConnection();
	try {
		await connection.beginTransaction();
		const [orderResult] = await connection.query(
			"INSERT INTO orders(user_id, full_name, email, address, city, zip) VALUES(?,?,?,?,?,?)",
			[
				userId,
				order.fullName,
				order.email,
				order.address,
				order.city,
				order.zip,
			],
		);

		const orderId = orderResult.insertId;

		for (const item of items) {
			await connection.query(
				`INSERT INTO order_items(order_id, item_id, quantity, price)
                 VALUES (?, ?, ?, ?)`,
				[orderId, item.id, item.quantity, item.unitPrice],
			);
			console.log(item);
			const [result] = await connection.query(
				`UPDATE items
                 SET stock = stock - ?
                 WHERE id = ? AND stock >= ?`,
				[item.quantity, item.id, item.quantity],
			);

			if (result.affectedRows === 0) {
				throw new Error("Not enough stock");
			}
		}
		await connection.commit();

		return { orderId };
	} catch (error) {
		await connection.rollback();
		throw error;
	}
};

const getOrders = async (userId) => {
	try {
		const [orders] = await pool.query(
			`SELECT 
				orders.id AS order_id,
				orders.full_name,
				orders.email,
				orders.address,
				orders.city,
				orders.zip,
				order_items.id AS order_item_id,
				order_items.quantity,
				order_items.price AS item_price,
				items.name AS item_name
			FROM orders
			JOIN order_items ON orders.id = order_items.order_id
			JOIN items ON order_items.item_id = items.id
			WHERE user_id = ?`,
			[userId],
		);
		console.log(orders);

		return orders;
	} catch (error) {
		throw error;
	}
};

module.exports = {
	checkout,
	getOrders,
};
