const fs = require("fs");
const path = require("path");
const ejs = require("ejs");
const pool = require("../db/db");

const pageHandler = async (req, res) => {
  const pageName = req.url === "/" ? "index" : req.url.slice(1);
  const pagePath = path.join(__dirname, "..", "views", `${pageName}.ejs`);
  const layoutPath = path.join(__dirname, "..", "views", "layout.ejs");

  let pageData = {};
  if (pageName === "index") {
    try {
      const [items] = await pool.query("SELECT * FROM items");
      console.log(items);
      pageData.items = items;
    } catch (dbError) {
      console.error("Database error loading items:", dbError);
      pageData.items = [];
    }
  }

  console.log(layoutPath);
  ejs.renderFile(pagePath, pageData, (err, html) => {
    if (err) {
      console.error(err);
      res.writeHead(500, { "Content-Type": "text/html; charset=utf-8" });
      res.write("<h1>Greška prilikom učitavanja stranice</h1>");
      return res.end();
    }
    ejs.renderFile(layoutPath, { body: html }, (err, finalHtml) => {
      if (err) {
        console.error(err);
        res.writeHead(500, { "Content-Type": "text/html; charset=utf-8" });
        res.write("<h1>Greška prilikom učitavanja stranice</h1>");
        return res.end();
      }
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      return res.end(finalHtml);
    });
  });
};
const staticHandler = (req, res) => {
  const imageExtensions = ["jpg", "jpeg", "png", "gif"];
  const extension = req.url.split(".")[1];
  const staticPath = path.join(__dirname, "..", req.url);
  console.log(path.join(__dirname, "..", req.url));
  const imageExtenstion = imageExtensions.includes(extension);

  try {
    const file = fs.readFileSync(staticPath, imageExtenstion ? null : "utf8"); // ako je slika onda ne koristimo encoding, jer nam treba buffer, a ne string
    if (imageExtenstion) {
      res.writeHead(200, { "Content-Type": `image/${extension}` });
    } else {
      res.writeHead(200, { "Content-Type": `text/${extension}` });
    }
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
