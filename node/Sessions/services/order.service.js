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

module.exports = {
	checkout,
};
