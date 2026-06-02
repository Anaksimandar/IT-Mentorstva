const http = require("http");
const fs = require("fs/promises");
const path = require("path");

const server = http.createServer(async (req, res) => {
  if (req.url === "/" && req.method === "GET") {
    const navigationPath = path.join(__dirname, "html", "components", "navigation.html");
    const footerPath = path.join(__dirname, "html", "components", "footer.html");

    try {
      [data, navigationData, footerData] = await Promise.all([
        fs.readFile(path.join(__dirname, "index.html"), "utf-8"),
        fs.readFile(path.join(__dirname, "html", "components", "navigation.html"), "utf-8"),
        fs.readFile(path.join(__dirname, "html", "components", "footer.html"), "utf-8"),
      ]);
      const finalData = data
        .replace("{{navigation}}", navigationData)
        .replace("{{footer}}", footerData);
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      res.write(finalData);
      res.end();
    } catch (err) {
      console.error("Greška pri čitanju datoteka:", err);
      res.writeHead(500, { "Content-Type": "text/html; charset=utf-8" });
      res.write("<h1>Došlo je do greške na serveru</h1>");
      return res.end();
    }
  } else if (req.url === "/about" && req.method === "GET") {
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.write("<h1>O nama</h1><p>Ovo je stranica o nama.</p>");
    res.end();
  } else {
    res.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
    res.write("<h1>Stranica nije pronađena</h1>");
    res.end();
  }
});

server.listen(3000, async () => {
  console.log("Server je pokrenut na portu 3000");
});
