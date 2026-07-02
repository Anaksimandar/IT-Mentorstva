const fs = require("fs");
const path = require("path");
const querystring = require("querystring");
const ejs = require("ejs");
const pool = require("../db/db");
const { registerUser, loginUser } = require("../services/user.service");
const {
  createSession,
  getSession,
  getSessionId,
  logoutSession,
  addToCart,
} = require("../services/session.service");

const pageHandler = async (req, res, data = {}) => {
  const pageName = data.pageName || (req.url === "/" ? "index" : req.url.slice(1));
  const pagePath = path.join(__dirname, "..", "views", `${pageName}.ejs`);
  const layoutPath = path.join(__dirname, "..", "views", "layout.ejs");
  const userSession = getSession(req);
  if (pageName === "index") {
    try {
      const [items] = await pool.query("SELECT * FROM items");
      console.log(items);
      data.items = items;
    } catch (dbError) {
      console.error("Database error loading items:", dbError);
      data.items = [];
    }
  }
  ejs.renderFile(pagePath, { ...data, user: userSession }, (err, html) => {
    if (err) {
      console.error(err);
      res.writeHead(500, { "Content-Type": "text/html; charset=utf-8" });
      res.write("<h1>Greška prilikom učitavanja stranice</h1>");
      return res.end();
    }
    ejs.renderFile(layoutPath, { body: html, user: userSession }, (err, finalHtml) => {
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
const apiHandler = async (req, res) => {
  if (req.url === "/api/sign-in" && req.method === "POST") {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString();
    });
    req.on("end", async () => {
      let userData;
      userData = querystring.parse(body);
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
          const sessionId = createSession(userId);
          res.setHeader("Set-Cookie", `sessionId=${sessionId}; HttpOnly; Path=/; Max-Age=3600`);
          res.writeHead(302, { Location: "/" });
          return res.end(); // Always stop execution after sending // Redirect to home page after logout
        } else {
          res.writeHead(500, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ message: "Error creating user" }));
        }
      } catch (error) {
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: error.message }));
        return;
      }
      try {
        const userId = await createUser(userData);
        console.log("New user created with ID:", userId);
        res.writeHead(201, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "User created successfully", userId }));
      } catch (error) {
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "Error creating user" }));
      }
    });
  } else if (req.url === "/api/login" && req.method === "POST") {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString();
    });
    req.on("end", async () => {
      let userData;
      userData = querystring.parse(body);
      // validate data
      if (!userData.email || !userData.password) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "Email and password are required" }));
        return;
      }
      if (userData.password.length < 6) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "Password must be at least 6 characters long" }));
        return;
      }

      try {
        const userId = await loginUser(userData.email, userData.password);
        console.log(userId);

        if (userId) {
          // create session and set cookie here if needed
          const sessionId = createSession(userId);
          res.setHeader("Set-Cookie", `sessionId=${sessionId}; HttpOnly; Path=/; Max-Age=3600`);
          res.writeHead(302, { Location: "/" });
          return res.end();
        } else {
          res.writeHead(401, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ message: "Invalid email or password" }));
        }
      } catch (dbError) {
        console.error("Database error during login:", dbError);
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "Database error" }));
      }
    });
  } else if (req.url === "/api/logout" && req.method === "GET") {
    const sessionId = req.headers.cookie?.split("sessionId=")[1];
    if (sessionId) {
      const cookie = logoutSession(sessionId);
      res.setHeader("Set-Cookie", cookie);
    }
    res.writeHead(302, { Location: "/" });
    return res.end(); // Always stop execution after sending // Redirect to home page after logout
  } else if (req.url === "/api/add-to-cart" && req.method === "POST") {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString();
    });
    req.on("end", async () => {
      const formData = querystring.parse(body);
      const sessionId = getSessionId(req);
      if (sessionId) {
        const succesfullyAdded = addToCart(sessionId, formData.item_id);
        if (succesfullyAdded) {
          const previousUrl = req.headers["referer"] || "/";
          console.log(previousUrl);

          res.writeHead(302, { Location: previousUrl });
          return res.end();
        }
      }
      res.writeHead(401, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ message: "Not authenticated" }));
      return res.end();
    });
  } else {
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "API endpoint not found" }));
  }
};

module.exports = { pageHandler, staticHandler, apiHandler };
