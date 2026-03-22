const http = require("http");
const { URL } = require("url");
const news = require("../news.json");

const server = http.createServer((req, res) => {
	const url = new URL(req.url, "http://localhost:3000");

	res.setHeader("Content-Type", "text/html; charset=utf-8");

	if (url.pathname === "/") {
		let result = "";
		news.forEach((n) => {
			result += "<h1>" + n.title + "</h1>\n";
		});
		res.statusCode = 200;
		res.end(result);
	} else {
		res.statusCode = 404;
		res.end("404 Not Found");
	}
});

server.listen(3002, () => {
	console.log("Server is running on port 3002");
});
