const {
	registerUser,
	loginUser,
	userExistsById,
} = require("../services/user.service");
const {
	getItems,
	getItemsBySlug,
	getUserCartItems,
	getItemById,
} = require("../services/item.service");
const querystring = require("querystring");
const {
	validateEmail,
	validatePassword,
	isPasswordSame,
	isCheckBoxChecked,
	validateName,
} = require("../helper/validator");
const {
	createSession,
	logout,
	getSession,
	addToShoppingCart,
} = require("../services/session.service");
const { checkout, getOrders } = require("../services/order.service");

const apiHandler = async (req, res) => {
	const urlMatch = req.url.match(/^\/api\/(.+)$/);
	console.log(urlMatch);

	if (!urlMatch) {
		res.statusCode = 404;
		return res.end("API Endpoint Not Found\n");
	}
	if (urlMatch[1] === "register" && req.method === "POST") {
		// Handle registration API endpoint
		let data = "";
		req.on("data", (chunk) => {
			data += chunk;
		});

		req.on("end", async () => {
			const { name, email, password, confirmPassword, terms } =
				JSON.parse(data);
			console.log(data);

			if (!validateName(name)) {
				res.statusCode = 400;
				res.setHeader("Content-Type", "application/json");
				return res.end(
					JSON.stringify({
						message: "Name must be at least 3 characters long",
					}),
				);
			}
			if (!validateEmail(email)) {
				res.statusCode = 400;
				res.setHeader("Content-Type", "application/json");
				return res.end(JSON.stringify({ message: "Invalid email format" }));
			}
			if (!validatePassword(password)) {
				res.statusCode = 400;
				res.setHeader("Content-Type", "application/json");
				return res.end(
					JSON.stringify({
						message: "Password must be at least 3 characters long",
					}),
				);
			}
			if (!isPasswordSame(password, confirmPassword)) {
				res.statusCode = 400;
				res.setHeader("Content-Type", "application/json");
				return res.end(JSON.stringify({ message: "Passwords do not match" }));
			}

			if (!isCheckBoxChecked(terms)) {
				res.statusCode = 400;
				res.setHeader("Content-Type", "application/json");
				return res.end(
					JSON.stringify({
						message: "You must accept the terms and conditions",
					}),
				);
			}
			try {
				const userId = await registerUser(name, email, password);
				const sessionId = createSession(userId);
				res.statusCode = 303;
				res.setHeader("Set-Cookie", `sid=${sessionId}; Path=/; HttpOnly`);
				res.setHeader("Location", "/");
				return res.end();
			} catch (error) {
				console.error("Error occurred while registering user:", error);
				res.statusCode = 500;
				res.setHeader("Content-Type", "application/json");
				return res.end(JSON.stringify({ message: error.message }));
			}
		});
	} else if (urlMatch[1] === "login" && req.method === "POST") {
		// Handle login API endpoint
		let data = "";
		req.on("data", (chunk) => {
			data += chunk;
		});
		req.on("end", async () => {
			const { email, password } = JSON.parse(data);
			console.log(data);

			if (!validateEmail(email)) {
				res.statusCode = 400;
				res.setHeader("Content-Type", "application/json");
				return res.end(JSON.stringify({ message: "Invalid email format" }));
			}
			if (!validatePassword(password)) {
				res.statusCode = 400;
				res.setHeader("Content-Type", "application/json");
				return res.end(
					JSON.stringify({
						message: "Password must be at least 3 characters long",
					}),
				);
			}
			try {
				const user = await loginUser(email, password);
				if (user) {
					const sessionId = createSession(user.id);
					res.statusCode = 303;
					res.setHeader("Set-Cookie", `sid=${sessionId}; Path=/; HttpOnly`);
					res.statusCode = 303;
					res.setHeader("Location", "/");
					return res.end();
				} else {
					res.statusCode = 401;
					res.setHeader("Content-Type", "application/json");
					return res.end(
						JSON.stringify({ message: "Invalid email or password" }),
					);
				}
			} catch (error) {
				console.error("Error occurred while logging in:", error);
				res.statusCode = 500;
				res.setHeader("Content-Type", "application/json");
				return res.end(JSON.stringify({ message: "Internal Server Error" }));
			}
		});
	} else if (urlMatch[1] === "logout") {
		const session = getSession(req);
		if (session) {
			logout(session.userId);
			res.setHeader("Set-Cookie", `sid=; Path=/; HttpOnly; Max-Age=0`);
			res.statusCode = 303;
			res.setHeader("Location", "/");
			return res.end();
		}
		res.statusCode = 401;
		res.setHeader("Content-Type", "application/json");
		return res.end(JSON.stringify({ message: "Not logged in" }));
	} else if (urlMatch[1] === "cart/add" && req.method === "POST") {
		let data = "";
		req.on("data", (chunk) => {
			data += chunk.toString();
		});
		req.on("end", async () => {
			const { productId, quantity } = JSON.parse(data);

			if (!productId) {
				res.statusCode = 400;
				res.setHeader("Content-Type", "application/json");
				return res.end(JSON.stringify({ message: "Product doesn't exist" }));
			}

			const session = getSession(req);
			if (!session) {
				res.statusCode = 401;
				res.setHeader("Content-Type", "application/json");
				return res.end(JSON.stringify({ message: "Not logged in" }));
			}

			try {
				// check stock before adding
				const product = await getItemById(productId);

				if (!product) {
					res.statusCode = 404;
					res.setHeader("Content-Type", "application/json");
					return res.end(JSON.stringify({ message: "Product not found" }));
				}

				// check how many user already has in cart
				const cart = session.shoppingCart || [];
				const existing = cart.find(
					(c) => String(c.productId) === String(productId),
				);
				const currentQuantity = existing ? existing.quantity : 0;
				const requestedQuantity = currentQuantity + (quantity || 1);

				if (requestedQuantity > product.amount) {
					res.statusCode = 400;
					res.setHeader("Content-Type", "application/json");
					return res.end(
						JSON.stringify({
							message: `Only ${product.amount} in stock`,
						}),
					);
				}

				addToShoppingCart(session.userId, productId);
				res.statusCode = 200;
				res.setHeader("Content-Type", "application/json");
				return res.end(JSON.stringify({ message: "Added to cart" }));
			} catch (err) {
				res.statusCode = 500;
				res.setHeader("Content-Type", "application/json");
				return res.end(JSON.stringify({ message: err.message }));
			}
		});
	} else if (urlMatch[1] === "products" && req.method === "GET") {
		try {
			const products = await getItems();

			res.statusCode = 200;
			res.setHeader("Content-Type", "application/json");
			res.end(JSON.stringify(products));
		} catch (e) {
			res.statusCode = 500;
			res.setHeader("Content-Type", "application/json");
			res.end(
				JSON.stringify({ message: `Couldnt return products ${e.message}` }),
			);
		}
	} else if (urlMatch[1] === "cart" && req.method === "GET") {
		const session = getSession(req);

		if (!session) {
			res.statusCode = 401;
			res.setHeader("Content-Type", "application/json");
			return res.end(JSON.stringify({ message: "Not logged in" }));
		}
		try {
			const cartItems = await getUserCartItems(session.shoppingCart);

			res.statusCode = 200;
			res.setHeader("Content-Type", "application/json");
			return res.end(JSON.stringify(cartItems));
		} catch (error) {
			console.error("Error occurred while fetching shopping cart:", error);
			res.statusCode = 500;
			res.setHeader("Content-Type", "application/json");
			return res.end(JSON.stringify({ message: "Internal Server Error" }));
		}
	} else if (urlMatch[1] === "checkout" && req.method === "POST") {
		const session = getSession(req);
		if (!session) {
			res.statusCode = 401;
			res.setHeader("Content-Type", "application/json");
			return res.end(JSON.stringify({ message: "Not logged in" }));
		}
		const userId = session.userId;
		const items = await getUserCartItems(session.shoppingCart);
		console.log(items);

		let data = "";
		req.on("data", (chunk) => {
			data += chunk.toString();
		});
		req.on("end", async () => {
			const order = JSON.parse(data);
			try {
				const userExists = userExistsById(userId);
				if (!userExists) {
					res.statusCode = 401;
					res.setHeader("Content-Type", "application/json");
					return res.end(JSON.stringify({ message: "User doesnt exists" }));
				}
			} catch (error) {
				res.statusCode = 500;
				res.setHeader("Content-Type", "application/json");
				return res.end(JSON.stringify({ message: "Internal Server Error" }));
			}

			try {
				const checkoutResult = await checkout(userId, order, items);
				res.setHeader("Content-Type", "application/json");
				res.statusCode = 200;
				return res.end(
					JSON.stringify({
						message: "Checkout successful",
						result: checkoutResult,
					}),
				);
			} catch (error) {
				console.error("Error occurred during checkout:", error);
				res.statusCode = 500;
				res.setHeader("Content-Type", "application/json");
				return res.end(JSON.stringify({ message: "Internal Server Error" }));
			}
		});
	} else if (urlMatch[1] === "orders" && req.method === "GET") {
		const session = getSession(req);
		if (!session) {
			res.statusCode = 401;
			res.setHeader("Content-Type", "application/json");
			return res.end(JSON.stringify({ message: "Not logged in" }));
		}
		try {
			const orders = await getOrders(session.userId);
			res.statusCode = 200;
			res.setHeader("Content-Type", "application/json");
			return res.end(JSON.stringify(orders));
		} catch (error) {
			console.error("Error occurred while fetching orders:", error);
			res.statusCode = 500;
			res.setHeader("Content-Type", "application/json");
			return res.end(JSON.stringify({ message: "Internal Server Error" }));
		}
	} else {
		res.statusCode = 404;
		res.setHeader("Content-Type", "text/plain");
		return res.end("API Endpoint Not Found\n");
	}
};

module.exports = apiHandler;
