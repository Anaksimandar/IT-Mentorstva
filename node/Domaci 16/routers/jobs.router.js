const router = require("express").Router();
const jobController = require("../controllers/job.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const createJobValidation = require("../validator/jobs/create");

module.exports = router;
