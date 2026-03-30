const http = require("http");
const {
	handleStaticFiles,
	handleAPI,
	handleHtml,
} = require("./src/requestHandlers");
require("./listeners/handlePageEmitter");

const server = http.createServer((req, res) => {
	if (req.url.includes("/public")) {
		handleStaticFiles(req, res);
	} else if (req.url.startsWith("/api")) {
		handleAPI(req, res);
	} else if (req.url === "/") {
		handleHtml(req, res);
	} else {
		res.statusCode = 404;
		res.end("Not Found");
	}
});

server.listen(3000, () => {
	console.log("Server is running on port 3000");
});
