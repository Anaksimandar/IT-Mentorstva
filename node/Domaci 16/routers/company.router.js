const router = require("express").Router();
const companyController = require("../controllers/company.controller");
const authMiddleware = require("../middlewares/auth.middleware");

router.get("/", authMiddleware.admin, companyController.showCompanies);
router.post("/add", authMiddleware.admin, companyController.addCompany);
router.get("/remove", authMiddleware.admin, companyController.deleteCompany);

module.exports = router;
