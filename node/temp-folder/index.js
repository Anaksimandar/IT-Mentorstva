const http = require("http");
const fs = require("fs");

const server = http.createServer((req, res) => {
  if (req.url === "/" && req.method === "GET") {
    res.writeHead(500, { "Content-Type": "text/html; charset=utf-8" });
    res.write("<h1>Dobrodošli na moju stranicu!</h1>");
    res.end();
  } else if (req.url === "/about" && req.method === "GET") {
    res.writeHead(500, { "Content-Type": "text/html; charset=utf-8" });
    res.write("<h1>O nama</h1><p>Ovo je stranica o nama.</p>");
    res.end();
  } else if (req.url === "/users" && req.method === "GET") {
    fs.readFile("data/users.json", "utf-8", (err, data) => {
      if (err) {
        res.writeHead(500, { "Content-Type": "text/html; charset=utf-8" });
        res.write("<h1>Greška prilikom čitanja korisnika</h1>");
        res.end();
      } else {
        const users = JSON.parse(data);
        res.write("<h1>Korisnici</h1>");
        users.forEach((user) => {
          res.write(`<p>Email: ${user.email}</p>`);
        });
        res.end();
      }
    });
  } else if (req.url === "/users" && req.method === "POST") {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString();
    });
    req.on("end", () => {
      const userData = JSON.parse(body);
      fs.readFile("data/users.json", "utf-8", (err, data) => {
        if (err) {
          res.writeHead(500, { "Content-Type": "text/html; charset=utf-8" });
          res.write("<h1>Greška prilikom čitanja korisnika</h1>");
          res.end();
        } else {
          const users = JSON.parse(data);
          // check if user already exists
          const userExists = users.some((user) => user.email === userData.email);
          if (userExists) {
            res.writeHead(400, { "Content-Type": "text/html; charset=utf-8" });
            res.write("<h1>Korisnik već postoji</h1>");
            res.end();
          } else {
            users.push(userData);
            fs.writeFile("data/users.json", JSON.stringify(users), (err) => {
              if (err) {
                res.writeHead(500, { "Content-Type": "text/html; charset=utf-8" });
                res.write("<h1>Greška prilikom spremanja korisnika</h1>");
                res.end();
              } else {
                res.writeHead(201, { "Content-Type": "text/html; charset=utf-8" });
                res.write("<h1>Korisnik dodat</h1>");
                res.end();
              }
            });
          }
        }
      });
    });
  } else {
    res.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
    res.write("<h1>Stranica nije pronađena</h1>");
    res.end();
  }
});

server.listen(3000, () => {
  console.log("Server je pokrenut na portu 3000");
});
