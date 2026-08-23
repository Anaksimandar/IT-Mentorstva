const router = require("express").Router();
const authMiddleware = require("../middlewares/auth.middleware");
const companyController = require("../controllers/company.controller");
const jobController = require("../controllers/job.controller");
const technologyController = require("../controllers/technology.controller");
const { createJobValidation } = require("../validator/jobs/create");

router.get("/", authMiddleware.admin, jobController.showJobsAdmin);
router.post("/create", authMiddleware.admin, createJobValidation, jobController.addJob);
router.get("/remove", authMiddleware.admin, jobController.deleteJob);
router.get("/search", authMiddleware.admin, jobController.searchJobs);

module.exports = router;
