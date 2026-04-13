const ejs = require("ejs");

const pageHandler = (req, res, pageName, data = {}) => {
	ejs.renderFile(`./views/${pageName}.ejs`, data, (err, html) => {
		if (err) {
			res.statusCode = 500;
			res.setHeader("Content-Type", "text/plain");
			return res.end("Error rendering template\n", err);
		}
		ejs.renderFile("./views/layout.ejs", { body: html }, (err, finalHtml) => {
			if (err) {
				res.statusCode = 500;
				res.setHeader("Content-Type", "text/plain");
				return res.end("Error rendering layout\n");
			}
			res.setHeader("Content-Type", "text/html");
			return res.end(finalHtml);
		});
	});
};

module.exports = { pageHandler };
