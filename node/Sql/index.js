const http = require("http");
const ejs = require("ejs");
const { getUsers } = require("./services/getUsers");
const { getProducts } = require("./services/getProducts");

const server = http.createServer(async (req, res) => {
	console.log(req.url);

	if (req.url === "/") {
		res.statusCode = 200;
		res.setHeader("Content-Type", "text/plain");
		ejs.renderFile("./views/index.ejs", {}, (err, html) => {
			if (err) {
				res.statusCode = 500;
				res.setHeader("Content-Type", "text/plain");
				res.end("Error rendering template\n");
			} else {
				res.setHeader("Content-Type", "text/html");
				res.end(html);
			}
		});
	} else if (req.url === "/users") {
		try {
			const users = await getUsers();

			ejs.renderFile("./views/users.ejs", { users: users }, (err, body) => {
				if (err) {
					res.writeHead(500, { "Content-Type": "text/plain" });
					res.end(err.toString());
				} else {
					ejs.renderFile("./views/layout.ejs", { body: body }, (err, html) => {
						if (err) {
							res.writeHead(500, { "Content-Type": "text/plain" });
							res.end(err.toString());
						}
						res.writeHead(200, { "Content-Type": "text/html" });
						res.end(html);
					});
				}
			});
		} catch (err) {
			console.error("Error fetching users:", err);
			res.statusCode = 500;
			res.setHeader("Content-Type", "text/plain");
			res.end("Internal Server Error\n");
			return;
		}
	} else if (req.url === "/products") {
		try {
			const products = await getProducts();
			ejs.renderFile(
				"./views/products.ejs",
				{ products: products },
				(err, body) => {
					if (err) {
						res.writeHead(500, { "Content-Type": "text/plain" });
						res.end(err.toString());
					} else {
						ejs.renderFile(
							"./views/layout.ejs",
							{ body: body },
							(err, html) => {
								if (err) {
									res.writeHead(500, { "Content-Type": "text/plain" });
									res.end(err.toString());
								}
								res.writeHead(200, { "Content-Type": "text/html" });
								res.end(html);
							},
						);
					}
				},
			);
		} catch (err) {
			console.error("Error fetching products:", err);
			res.statusCode = 500;
			res.setHeader("Content-Type", "text/plain");
			res.end("Internal Server Error\n");
			return;
		}
	} else if (req.url.startsWith("/public/")) {
		const filePath = `.${req.url}`;
		ejs.renderFile(filePath, {}, (err, content) => {
			if (err) {
				res.statusCode = 404;
				res.setHeader("Content-Type", "text/plain");
				res.end("Not Found\n");
			} else {
				const ext = filePath.split(".").pop();
				const contentType =
					{
						css: "text/css",
						js: "application/javascript",
						png: "image/png",
						jpg: "image/jpeg",
						svg: "image/svg+xml",
					}[ext] || "application/octet-stream";
				res.setHeader("Content-Type", contentType);
				res.end(content);
			}
		});
	} else {
		res.statusCode = 404;
		res.setHeader("Content-Type", "text/plain");
		res.end("Not Found\n");
	}
});

server.listen(3000, () => {
	console.log("Server running at http://localhost:3000/");
});
