const Router = require("express").Router;
const authController = require("../controllers/auth.controller.js");

const router = Router();

router.post("/register", authController.register);
router.post("/login", authController.login);

module.exports = router;
