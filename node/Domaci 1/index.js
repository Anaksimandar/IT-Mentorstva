const http = require("http");

// Domaci 1:
// Ako korisnik poseti '/kontakt' stranicu, preusmeriti ga na glavnu stranicu uz odgovarajuci statusni kod.
const server = http.createServer((req, res) => {
	res.statusCode = 200;
	res.setHeader("Content-Type", "text/plain");

	if (req.url === "/") {
		res.end("Dobrodosli na glavnu stranicu");
	} else if (req.url === "/kontakt") {
		res.writeHead(301, { location: "/" });
		res.end();
	} else {
		res.statusCode = 404;
		res.setHeader("Content-Type", "text/plain");
		res.end("404 Not Found");
	}
});

server.listen(3000, () => {
	console.log("Server is running on port 3000");
});
