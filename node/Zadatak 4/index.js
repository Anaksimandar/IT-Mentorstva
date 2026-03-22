const http = require("http");
const { URL } = require("url");
const news = require("../news.json");

const server = http.createServer((req, res) => {
	const url = new URL(req.url, "http://localhost:3000");

	res.setHeader("Content-Type", "text/plain");

	if (url.pathname === "/") {
		res.statusCode = 200;
		res.end("Dobrodosli na glavnu stranicu");
	} else if (url.pathname === "/kontakt") {
		res.statusCode = 200;
		res.end("Dobrodosli na stranicu za kontakt");
	} else if (url.pathname === "/news") {
		const title = url.searchParams.get("title");
		if (title === null) {
			res.statusCode = 400;
			return res.end("Bad Request: Missing 'title' query parameter");
		}
		const newsExist = news.find(
			(n) => n.title.toLowerCase() === title.toLowerCase(),
		);
		if (newsExist) {
			res.end(
				`Vest "${newsExist.title}" je pronadjena, datum objavljivanja: ${newsExist.releaseDate}`,
			);
		} else {
			res.end(`Vest "${title}" nije pronadjena`);
		}
	} else {
		res.statusCode = 404;
		res.end("404 Not Found");
	}
});

server.listen(3001, () => {
	console.log("Server is running on port 3001");
});
