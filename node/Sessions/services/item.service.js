const pool = require("./my-sql");

const getItems = async () => {
	const [rows] = await pool.query("SELECT * FROM items");
	return rows;
};

const getItemsBySlug = async (slug) => {
	const [rows] = await pool.query(
		"SELECT * FROM items WHERE slug = ? LIMIT 1",
		[slug],
	);
	return rows[0];
};

const getUserCartItems = async (shoppingCart) => {
	if (!shoppingCart || shoppingCart.length === 0) {
		return [];
	}
	const itemsIds = shoppingCart.map((item) => item.productId);
	try {
		if (!itemsIds || itemsIds.length === 0) {
			return [];
		}
		const [rows] = await pool.query("SELECT * FROM items WHERE id IN (?)", [
			itemsIds.map((id) => Number(id)),
		]);

		return rows.map((product) => {
			const cartItem = shoppingCart.find(
				(c) => String(c.productId) === String(product.id),
			);
			return {
				id: product.id,
				name: product.name,
				unitPrice: product.price,
				slug: product.slug,
				quantity: cartItem.quantity, // from session (what user wants)
			};
		});
	} catch (error) {
		console.error("Error fetching cart items:", error);
		return [];
	}
};

const getItemById = async (itemId) => {
	const [rows] = await pool.query("SELECT * FROM items WHERE id = ? LIMIT 1", [
		itemId,
	]);
	return rows[0];
};

const checkout = async (shoppingCart, userId) => {
	const cartItems = await getUserCartItems(shoppingCart);
};
module.exports = {
	getItems,
	getItemsBySlug,
	getUserCartItems,
	getItemById,
	checkout,
};
