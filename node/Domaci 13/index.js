const http = require("http");
const ejs = require("ejs");
const { pageHandler, staticHandler, apiHandler } = require("./src/handlers");
const { getItemBySlug, getCartItems } = require("./services/product.service");
const { getSession, getCartItemsIds } = require("./services/session.service");

const server = http.createServer(async (req, res) => {
  if (req.url.startsWith("/api")) {
    apiHandler(req, res);
  } else if (req.url.startsWith("/public")) {
    staticHandler(req, res);
  } else {
    if (req.url === "/") {
      pageHandler(req, res);
      return;
    } else if (req.url === "/about") {
      pageHandler(req, res, { pageName: "about" });
      return;
    } else if (req.url === "/sign-in") {
      pageHandler(req, res, { pageName: "sign-in" });
      return;
    } else if (req.url === "/cart" && req.method === "GET") {
      const itemIds = getCartItemsIds(req);
      const items = await getCartItems(itemIds);
      console.log(items);
      return pageHandler(req, res, { item: items, pageName: "cart" });
      return res.writeHead(400, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ message: "All fields are required" }));
    } else if (req.url === "/login") {
      pageHandler(req, res, { pageName: "login" });
      return;
    }
    const productMatch = req.url.match(/^\/product\/([a-z0-9-]+)$/);
    if (productMatch) {
      const productName = productMatch[1];
      const item = await getItemBySlug(productName);
      if (item) {
        pageHandler(req, res, { item, pageName: "product" });
        return;
      }
    }
    res.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
    res.write("<h1>Stranica nije pronađena</h1>");
    return res.end();
  }
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
