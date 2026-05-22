const pool = require("./my-sql");

const getProducts = async () => {
	const [rows] = await pool.query("SELECT * FROM products");
	return rows;
};

const getProductBySlug = async (slug) => {
	const [rows] = await pool.query(
		"SELECT * FROM products WHERE slug = ? LIMIT 1",
		[slug],
	);
	return rows[0];
};

module.exports = { getProducts, getProductBySlug };
