const http = require("http");
const ejs = require("ejs");
const fs = require("fs");
const { products } = require("./src/data");

const server = http.createServer((req, res) => {
	console.log(req.url);
	if (req.url.startsWith("/public/")) {
		const filePath = `.${req.url}`;
		const ext = filePath.split(".").pop();
		const contentType = ext === "css" ? "text/css" : "application/octet-stream";
		res.writeHead(200, { "Content-Type": contentType });

		fs.readFile(filePath, (err, data) => {
			if (err) {
				res.writeHead(404, { "Content-Type": "text/plain" });
				res.end("File not found");
			} else {
				res.end(data);
			}
		});
		return;
	}

	if (req.url === "/") {
		ejs.renderFile(
			"./views/home.ejs",
			{ name: "Aleksa", products: products },
			(err, body) => {
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
			},
		);
	}

	const productMatch = req.url.match(/^\/product\/([\w-]+)$/);
	if (productMatch) {
		res.writeHead(200, { "Content-Type": "text/plain" });
		const product = products.find((p) => p.slug === productMatch[1]);
		if (product) {
			return res.end(
				`You requested product: ${product.name}, Price: $${product.price}, Amount: ${product.amount}`,
			);
		} else {
			return res.end("Product not found");
		}
	} else {
		res.writeHead(404, { "Content-Type": "text/plain" });
		return res.end("Not found");
	}
});

server.listen(3000, () => {
	console.log("Server is listening on port 3000");
});
