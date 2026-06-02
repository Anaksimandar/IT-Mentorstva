const http = require("http");
const products = require("./data/products.json");

const server = http.createServer((req, res) => {
  if (req.url.startsWith("/api/products") && req.method === "GET") {
    let responseData = [];
    res.writeHead(200, { "Content-Type": "application/json" });
    const status = req.url.includes("available") ? req.url.split("/").pop() : null;
    const response = status ? products.filter((product) => product.status === status) : products;
    res.end(JSON.stringify(response));
  } else {
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "Endpoint not found" }));
  }
});

server.listen(3000, () => {
  console.log("Server je pokrenut na portu 3000");
});
