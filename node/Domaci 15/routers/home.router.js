const router = require("express").Router();
const homeController = require("../controllers/home.controller");
const authMiddleware = require("../middlewares/auth.middleware");

router.get("/login", authMiddleware.guest, homeController.showLogin);
router.get("/register", authMiddleware.guest, homeController.showRegister);
router.get("/dashboard", authMiddleware.auth, homeController.showDashboard);
router.get("/settings", authMiddleware.auth, homeController.showSettings);
router.get("/admin", authMiddleware.admin, homeController.showAdminPanel);

module.exports = router;
