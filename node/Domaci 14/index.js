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
    } else if (req.url === "/contact") {
      pageHandler(req, res, { pageName: "contact" });
      return;
    } else if (req.url === "/sign-in") {
      pageHandler(req, res, { pageName: "sign-in" });
      return;
    } else if (req.url === "/cart" && req.method === "GET") {
      return pageHandler(req, res, { pageName: "cart" });
    } else if (req.url === "/login") {
      pageHandler(req, res, { pageName: "login" });
      return;
    } else if (req.url === "/checkout" && req.method === "POST") {
      const userSession = getSession(req);
      if (!userSession) {
        res.writeHead(302, { Location: "/login" });
        return res.end();
      }
      apiHandler(req, res);
    } else if (req.url === "/checkout" && req.method === "GET") {
      const userSession = getSession(req);
      if (!userSession) {
        res.writeHead(302, { Location: "/login" });
        return res.end();
      }
      const cartItems = await getCartItems(userSession.shoppingCart || []);
      const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
      pageHandler(req, res, { pageName: "checkout", cartItems, total });
      return;
    } else if (req.url === "/orders" && req.method === "GET") {
      const userSession = getSession(req);
      if (!userSession) {
        res.writeHead(302, { Location: "/login" });
        return res.end();
      }
      pageHandler(req, res, { pageName: "orders" });
    }
  }

  const orderMatch = req.url.match(/^\/order?\/([0-9]+)$/);
  if (orderMatch) {
    const userSession = getSession(req);
    if (!userSession) {
      res.writeHead(302, { Location: "/login" });
      return res.end();
    }

    const orderId = orderMatch[1];
    console.log("Order ID:", orderId); // Log the orderId to verify it's being captured correctly
    pageHandler(req, res, {
      pageName: "order-details",
      orderId,
    });
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
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
