const fs = require("fs");
const path = require("path");

const pageHandler = (req, res) => {
  // this handler we use for page requests
  const pageName = req.url === "/" ? "index" : req.url.slice(1);
  const fileName = pageName + ".html";
  const pagePath = path.join(__dirname, "..", "public", "html", fileName);

  try {
    const page = fs.readFileSync(pagePath, "utf8");
    res.writeHead(200, { "Content-Type": "text/html" });
    return res.end(page);
  } catch (err) {
    res.writeHead(404, { "Content-Type": "text/plain" });
    return res.end("Error with sending page");
  }
};
const staticHandler = (req, res) => {
  const extension = req.url.split(".")[1];
  const staticPath = path.join(__dirname, "..", req.url);

  try {
    const file = fs.readFileSync(staticPath, "utf8");
    res.writeHead(200, { "Content-Type": `text/${extension}` });
    return res.end(file);
  } catch (err) {
    res.writeHead(404, { "Content-Type": "text/plain" });
    return res.end("Error with sending static file");
  }
};
const apiHandler = (req, res) => {
  // this handler we use for api calls, like getting data from database, or sending data to database
};

module.exports = { pageHandler, staticHandler, apiHandler };
