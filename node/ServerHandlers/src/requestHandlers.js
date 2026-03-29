const fs = require("fs");
const path = require("path");

const EXTENSION_CONTENT_TYPES = {
	js: "application/javascript",
	css: "text/css",
	jpg: "image/jpeg",
	jpeg: "image/jpeg",
	png: "image/png",
	gif: "image/gif",
	bmp: "image/bmp",
	svg: "image/svg+xml",
	webp: "image/webp",
};

function handleStaticFiles(req, res) {
	const url = req.url;
	console.log(url);

	const filePath = path.join(__dirname, "../", url);
	console.log(filePath);
	const ext = path.extname(url).slice(1);

	fs.readFile(filePath, (err, data) => {
		if (err) {
			res.statusCode = 404;
			return res.end("File Not Found");
		}
		const contentType =
			EXTENSION_CONTENT_TYPES[ext] || "application/octet-stream";
		res.setHeader("Content-Type", contentType);
		return res.end(data);
	});
}

function handleAPI(req, res) {
	console.log("API request received:", req.url);
}

function handleHtml(req, res) {
	const url = req.url == "/" ? "/index" : req.url;
	console.log(url);

	const filePath = path.join(__dirname, "../public/html/", url + ".html");
	console.log(filePath);

	fs.readFile(filePath, (err, data) => {
		if (err) {
			res.statusCode = 404;
			return res.end("File Not Found");
		}
		res.setHeader("Content-Type", "text/html");
		return res.end(data);
	});
}
module.exports = { handleStaticFiles, handleAPI, handleHtml };
