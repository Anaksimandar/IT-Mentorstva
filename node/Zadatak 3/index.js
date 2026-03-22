const http = require("http");
const { URL } = require("url");

const users = ["toma", "petar", "marko"];

const server = http.createServer((req, res) => {
	res.statusCode = 200;
	res.setHeader("Content-Type", "text/plain");
	console.log(req.url);
	const url = new URL(req.url, "http://localhost:3000");
	const name = url.searchParams.get("name");

	if (name != null && users.includes(name.toLowerCase())) {
		console.log(`Korisnik ${name} je pronadjen`);
	} else {
		console.log("Nije uneto ime");
	}

	res.statusCode = 200;
	res.end();
});

server.listen(3000, () => {
	console.log("Server is running on port 3000");
});
