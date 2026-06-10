const http = require("http");
const pool = require("./db/db");
const ejs = require("ejs");
const { pageHandler, staticHandler, apiHandler } = require("./src/handlers");
const { getSession } = require("./services/session.service");

const server = http.createServer((req, res) => {
  const session = getSession(req);

  if (req.url.startsWith("/api")) {
    apiHandler(req, res);
  } else if (req.url.startsWith("/public")) {
    staticHandler(req, res);
  } else {
    if (req.url === "/") {
      pageHandler(req, res, { user: session ? { name: session.name } : null });
      return;
    } else if (req.url === "/about") {
      pageHandler(req, res);
    } else if (req.url === "/sign-in") {
      pageHandler(req, res);
    } else if (req.url === "/login") {
      pageHandler(req, res);
    } else {
      res.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
      res.write("<h1>Stranica nije pronađena</h1>");
      return res.end();
    }
  }
});
server.listen(3000, () => {
  console.log("Server is running on port 3000");
});
