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

module.exports = { getItems, getItemsBySlug };
