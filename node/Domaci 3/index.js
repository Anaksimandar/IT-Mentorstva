const http = require("http");
const { URL } = require("url");
const news = require("../news.json");
// Domaci 1:
// Ispisati odgovor, potpuno u html formatu, ukljucujuci doctype, head i body.
const server = http.createServer((req, res) => {
	const url = new URL(req.url, "http://localhost:3000");
	res.setHeader("Content-Type", "text/html");

	if (url.pathname === "/") {
		let newsHtml = "";
		news.forEach((item) => {
			newsHtml += `<h2>${item.title}</h2>
                <p>${item.releaseDate}</p>`;
		});
		const html = `<!DOCTYPE html>
        <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>News</title>
            </head>
            <body>
                ${newsHtml}
            </body>
        </html>`;

		res.end(html);
	}
});

server.listen(3000, () => {
	console.log("Server is running on port 3000");
});
