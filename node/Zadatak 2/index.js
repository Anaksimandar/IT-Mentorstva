// Zadatak 2
// Ispisati na glavnoj stranici "Dobrodosli na glavnu stranicu" (ne u konzoli vec u pregledacu)

const http = require("http");

const server = http.createServer((req, res) => {
	if (req.url === "/") {
		res.statusCode = 200;
		res.setHeader("Content-Type", "text/plain");
		res.end("Dobrodosli na glavnu stranicu");
	}
});

server.listen(3000, () => {
	console.log("Server is running on port 3000");
});
