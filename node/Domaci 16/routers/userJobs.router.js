const router = require("express").Router();
const authMiddleware = require("../middlewares/auth.middleware");
const jobController = require("../controllers/job.controller");

router.get("/", authMiddleware.auth, jobController.showJobsUser);
router.get("/search", authMiddleware.auth, jobController.searchJobsUser);
router.get("/:id", authMiddleware.auth, jobController.getJobById);
module.exports = router;
