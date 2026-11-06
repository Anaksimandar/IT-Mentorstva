const userService = require("../services/user.service.js");
const jwt = require("jsonwebtoken");

module.exports = {
  login: async (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    try {
      const user = await userService.login(email, password);
      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      // Affer successful login we will generate JWT token and send it back to the client
      const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
        expiresIn: "1h",
      });

      res.setHeader("Authorization", `Bearer ${token}`);
      return res.json({ message: "Login successful", user: user });
    } catch (err) {
      console.error("Error during login:", err);
      next(err);
    }
  },
  register: async (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    const name = req.body.name;
    console.log("Registering user:", { email, name });
    try {
      const user = await userService.register(email, password, name);
      res.json({ message: "User registered successfully", user });
    } catch (err) {
      next(err);
    }
  },
};
