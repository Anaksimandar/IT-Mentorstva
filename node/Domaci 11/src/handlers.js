const fs = require("fs");
const path = require("path");
const querystring = require("querystring");
const ejs = require("ejs");
const pool = require("../db/db");
const { createUser, loginUser } = require("../services/user.service");

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
      // checking if user already exists
      try {
        const [existingUser] = await pool.query("SELECT * FROM users WHERE email = ?", [
          userData.email,
        ]);
        if (existingUser.length > 0) {
          res.writeHead(409, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ message: "User with this email already exists" }));
          return;
        }
      } catch (dbError) {
        console.error("Database error checking existing user:", dbError);
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "Database error" }));
        return;
      }
      try {
        const userId = await createUser(userData);
        console.log("New user created with ID:", userId);
        res.writeHead(201, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "User created successfully", userId }));
      } catch (error) {
        console.error("Error creating user:", error);
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
        const user = await loginUser(userData.email, userData.password);
        if (user) {
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ message: "Login successful", user }));
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
  }
};

module.exports = { pageHandler, staticHandler, apiHandler };
