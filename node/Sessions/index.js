const http = require("http");
const { getUsers } = require("./services/user.service");
const { getItems, getItemsBySlug } = require("./services/item.service");
const fs = require("fs");
const path = require("path");
const { pageHandler } = require("./handlers/page.handler");
const apiHandler = require("./handlers/api.handler");

const server = http.createServer(async (req, res) => {
	console.log(req.url);

	if (req.url === "/") {
		res.statusCode = 200;
		res.setHeader("Content-Type", "text/plain");
		pageHandler(req, res, "home");
	} else if (req.url === "/users") {
		const users = await getUsers();
		res.statusCode = 200;
		res.setHeader("Content-Type", "application/json");
		return res.end(JSON.stringify(users));
	} else if (req.url.startsWith("/public/")) {
		const extension = req.url.split(".").pop();
		const contentType =
			{
				css: "text/css",
				js: "application/javascript",
				png: "image/png",
				jpg: "image/jpeg",
				jpeg: "image/jpeg",
				svg: "image/svg+xml",
			}[extension] || "application/octet-stream";
		const filePath = path.join(__dirname, req.url);
		console.log(filePath);

		fs.readFile(filePath, (err, content) => {
			if (err) {
				res.statusCode = 404;
				res.setHeader("Content-Type", "text/plain");
				return res.end("Not Found\n");
			} else {
				res.statusCode = 200;
				res.setHeader("Content-Type", contentType);
				return res.end(content);
			}
		});
	} else if (req.url.match(/^\/product\/([\w-]+)$/)) {
		const productSlug = req.url.split("/").pop();
		console.log("called");

		const product = await getItemsBySlug(productSlug);
		pageHandler(req, res, "product-details", { product: product });
		console.log(product);
		if (product) {
		} else {
			res.statusCode = 404;
			res.setHeader("Content-Type", "text/plain");
			return res.end("Product Not Found\n");
		}
	} else if (req.url === "/products") {
		pageHandler(req, res, "products");
	} else if (req.url === "/register") {
		pageHandler(req, res, "register");
	} else if (req.url === "/login") {
		pageHandler(req, res, "login");
	} else if (req.url.startsWith("/api/")) {
		apiHandler(req, res);
	} else if (req.url === "/cart") {
		pageHandler(req, res, "cart");
	} else if (req.url === "/checkout") {
		pageHandler(req, res, "checkout");
	} else if (req.url === "/about") {
		pageHandler(req, res, "about");
	} else if (req.url === "/orders") {
		pageHandler(req, res, "orders");
	} else {
		res.statusCode = 404;
		res.setHeader("Content-Type", "text/plain");
		return res.end("Page Not Found\n");
	}
});

server.listen(3000, () => {
	console.log("Server is running on http://localhost:3000");
});
