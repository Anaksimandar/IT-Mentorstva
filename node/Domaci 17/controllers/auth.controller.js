const userService = require("../src/services/user.service.js");
const prismaStatusCodes = require("../config/prismaStatusCodes.js");

module.exports = {
  login: async (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    try {
      const user = await userService.login(email, password);
      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      return res.json({ message: "Login successful" });
    } catch (err) {
      next(err);
    }
  },
  register: async (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    const name = req.body.name;
    console.log("Registering user:", { email, name });
    try {
      const users = await userService.register(email, password, name);
      res.json(users);
    } catch (err) {
      next(err);
    }
  },
};
