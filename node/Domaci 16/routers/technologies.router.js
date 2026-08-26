const router = require("express").Router();
const technologyController = require("../controllers/technology.controller");
const authMiddleware = require("../middlewares/auth.middleware");

router.get("/", authMiddleware.admin, technologyController.showTechnologies);
router.post("/add", authMiddleware.admin, technologyController.addTechnology);
router.get("/remove", authMiddleware.admin, technologyController.deleteTechnology);

module.exports = router;
