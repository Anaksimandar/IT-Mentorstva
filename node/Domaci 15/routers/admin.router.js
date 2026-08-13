const router = require("express").Router();
const authMiddleware = require("../middlewares/auth.middleware");
const adminController = require("../controllers/admin.controller");

router.get("/companies", authMiddleware.admin, adminController.showCompanies);
router.get("/technologies", authMiddleware.admin, adminController.showTechnologies);
router.post("/company/add", authMiddleware.admin, adminController.addCompany);
router.post("/technology/add", authMiddleware.admin, adminController.addTechnology);
router.get("/technology/remove", authMiddleware.admin, adminController.deleteTechnology);
router.get("/company/remove", authMiddleware.admin, adminController.deleteCompany);
router.get("/jobs", authMiddleware.admin, adminController.showJobs);
router.post("/job/create", authMiddleware.admin, adminController.addJob);

module.exports = router;
