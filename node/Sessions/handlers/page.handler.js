const ejs = require("ejs");
const { getSession } = require("../services/session.service");

const pageHandler = (req, res, pageName, data = {}) => {
	const session = getSession(req);
	ejs.renderFile(`./views/${pageName}.ejs`, { ...data }, (err, html) => {
		if (err) {
			res.statusCode = 500;
			res.setHeader("Content-Type", "text/plain");
			return res.end("Error rendering template\n", err);
		}
		ejs.renderFile(
			"./views/layout.ejs",
			{ body: html, session: session },
			(err, finalHtml) => {
				if (err) {
					res.statusCode = 500;
					res.setHeader("Content-Type", "text/plain");
					return res.end("Error rendering layout\n", err.message);
				}
				res.setHeader("Content-Type", "text/html");
				return res.end(finalHtml);
			},
		);
	});
};

module.exports = { pageHandler };
