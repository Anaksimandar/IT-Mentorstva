const fs = require("fs");
const path = require("path");
const querystring = require("querystring");
const ejs = require("ejs");
const pool = require("../db/db");
const { findAllItems, findCartItems, getItemById } = require("../repository/product.repository");
const { registerUser, loginUser, findUserById } = require("../repository/user.repository");
const { readJsonBody } = require("../helper/readJsonBody");
const { validateLoginData } = require("../helper/user.validator");
const {
  insertSession,
  findSession,
  findSessionId,
  logoutSession,
  deleteCart,
  deleteItemFromCart,
} = require("../repository/session.repository");
const { sendResponse } = require("../helper/apiResponseHelper");
const { findOrdersByUserId, findOrderById } = require("../repository/order.repository");
const { addItemToCart, removeItemFromCart, createOrder } = require("../services/cart.service");

const pageHandler = async (req, res, data = {}) => {
  const pageName = data.pageName || (req.url === "/" ? "index" : req.url.slice(1));
  const pagePath = path.join(__dirname, "..", "views", `${pageName}.ejs`);
  const layoutPath = path.join(__dirname, "..", "views", "layout.ejs");
  const session = findSession(req);
  let user = null;
  if (session) {
    user = await findUserById(session.userId);
  }
  ejs.renderFile(pagePath, { ...data, user: user }, (err, html) => {
    console.log(session);
    if (err) {
      console.error(err);
      res.writeHead(500, { "Content-Type": "text/html; charset=utf-8" });
      return res.end("<h1>Greška prilikom učitavanja stranice</h1>");
    }
    ejs.renderFile(layoutPath, { body: html, user: user }, (err, finalHtml) => {
      if (err) {
        console.error(err);
        res.writeHead(500, { "Content-Type": "text/html; charset=utf-8" });
        return res.end("<h1>Greška prilikom učitavanja stranice</h1>");
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

const apiHandler = async (req, res) => {
  if (req.url === "/api/sign-in" && req.method === "POST") {
    let userData;
    try {
      userData = await readJsonBody(req);
    } catch (error) {
      console.error("Error reading JSON body:", error);
      res.writeHead(400, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ message: "Invalid JSON body" }));
    }
    // validate data
    if (!userData.name || !userData.email || !userData.password || !userData.confirmPassword) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ message: "All fields are required" }));
      return;
    }
    if (userData.name.length < 3) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ message: "Name must be at least 3 characters long" }));
      return;
    }
    if (userData.password.length < 6) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ message: "Password must be at least 6 characters long" }));
      return;
    }
    if (userData.password !== userData.confirmPassword) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ message: "Passwords do not match" }));
      return;
    }
    try {
      const userId = await registerUser(userData);
      if (userId) {
        const sessionId = insertSession(userId);
        res.setHeader("Set-Cookie", `sessionId=${sessionId}; HttpOnly; Path=/; Max-Age=3600`);
        return sendResponse(res, 201, { message: "User created successfully", userId });
      }
      return sendResponse(res, 500, { message: "Error creating user" });
    } catch (error) {
      return sendResponse(res, 500, { message: error.message });
    }
  } else if (req.url === "/api/login" && req.method === "POST") {
    let userData;
    try {
      userData = await readJsonBody(req);
    } catch (error) {
      console.error("Error reading JSON body:", error);
      res.writeHead(400, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ message: "Invalid JSON body" }));
    }
    // validate data
    const loginErrors = validateLoginData(userData);
    if (loginErrors.length > 0) {
      res.writeHead(400, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ message: loginErrors[0] }));
    }

    try {
      const userId = await loginUser(userData.email, userData.password);
      if (userId) {
        // create session and set cookie here if needed
        const sessionId = insertSession(userId);
        res.setHeader("Set-Cookie", `sessionId=${sessionId}; HttpOnly; Path=/; Max-Age=3600`);
        return sendResponse(res, 200, { message: "Login successful", userId });
      } else {
        return sendResponse(res, 401, { message: "Invalid email or password" });
      }
    } catch (dbError) {
      console.error("Database error during login:", dbError);
      return sendResponse(res, 500, { message: "Database error" });
    }
  } else if (req.url === "/api/logout" && req.method === "POST") {
    const sessionId = req.headers.cookie?.split("sessionId=")[1];
    if (sessionId) {
      const cookie = logoutSession(sessionId);
      res.setHeader("Set-Cookie", cookie);
      return sendResponse(res, 200, { message: "Logged out successfully" });
    }
    return sendResponse(res, 401, { message: "No active session found" });
  } else if (req.url === "/api/add-to-cart" && req.method === "POST") {
    const session = findSession(req);
    if (!session) {
      return sendResponse(res, 401, { message: "Not authenticated" });
    }

    let data;
    try {
      data = await readJsonBody(req);
      const itemId = data.item_id;
      const result = await addItemToCart(session, itemId);
      return sendResponse(res, 200, result);
    } catch (error) {
      console.error("Error adding item to cart:", error);
      return sendResponse(res, 400, { message: error.message || "Invalid request body" });
    }
  } else if (req.url === "/api/items" && req.method === "GET") {
    try {
      const items = await findAllItems();
      return sendResponse(res, 200, items);
    } catch (dbError) {
      console.error("Database error loading items:", dbError);
      return sendResponse(res, 500, { message: "Database error" });
    }
  } else if (req.url === "/api/cart" && req.method === "GET") {
    const session = findSession(req);
    if (!session) {
      return sendResponse(res, 401, { message: "Not authenticated" });
    }
    const items = await findCartItems(session.shoppingCart);
    return sendResponse(res, 200, items);
  } else if (req.url === "/api/remove-from-cart" && req.method === "POST") {
    const session = findSession(req);
    if (!session) {
      return sendResponse(res, 401, { message: "Not authenticated" });
    }
    let data;
    try {
      data = await readJsonBody(req);
      const itemId = data.item_id;

      const result = await removeItemFromCart(session, itemId);
      return sendResponse(res, 200, result);
    } catch (error) {
      console.error("Error removing item from cart:", error);
      return sendResponse(res, 400, { message: error.message || "Invalid request body" });
    }
    return sendResponse(res, 400, { message: "Could not remove item from cart" });
  } else if (req.url.startsWith("/api/order/") && req.method === "GET") {
    const session = findSession(req);
    if (!session) {
      return sendResponse(res, 401, { message: "Not authenticated" });
    }
    const orderMatch = req.url.match(/^\/api\/order\/([0-9]+)$/);
    const orderId = orderMatch ? orderMatch[1] : null;

    if (!orderId) {
      return sendResponse(res, 400, { message: "Missing order id" });
    }

    try {
      const order = await findOrderById(session.userId, orderId);
      return sendResponse(res, 200, order);
    } catch (error) {
      console.error("Error fetching order details:", error);
      return sendResponse(res, 500, { message: "Database error" });
    }
  } else if (req.url === "/api/checkout" && req.method === "POST") {
    const session = findSession(req);
    if (!session) {
      return sendResponse(res, 401, { message: "No active session found" });
    }
    let data;
    try {
      data = await readJsonBody(req);
      const result = await createOrder(session, data);
      deleteCart(session.sessionId); // Clear the cart after successful order creation
      return sendResponse(res, 201, result);
    } catch (error) {
      console.error("Error creating order:", error);
      return sendResponse(res, 400, { message: error.message || "Invalid request body" });
    }
  } else if (req.url === "/api/orders" && req.method === "GET") {
    const session = findSession(req);
    if (!session) {
      return sendResponse(res, 401, { message: "No active session found" });
    }
    try {
      const orders = await findOrdersByUserId(session.userId);
      return sendResponse(res, 200, orders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      return sendResponse(res, 500, { message: "Database error" });
    }
  } else {
    return sendResponse(res, 404, { message: "API endpoint not found" });
  }
};

module.exports = { pageHandler, staticHandler, apiHandler };
