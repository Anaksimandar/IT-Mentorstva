const Job = require("../models/job.model");
const CoreModel = require("../models/coreModel");
const User = require("../models/user.model");
const Technology = require("../models/technology.model");
const Company = require("../models/company.model");
const validationResult = require("express-validator").validationResult;

module.exports = {
  getJobById: async (req, res) => {
    const { id } = req.params;
    const userId = req.session.userId;
    if (id) {
      try {
        if (!req.session.viewedJobs) req.session.viewedJobs = [];

        if (!req.session.viewedJobs.includes(id)) {
          await Job.incrementViews(id); // ← just a plain +1, no DB-level duplicate check
          req.session.viewedJobs.push(id);
        }
        const job = await Job.getAll("WHERE job_ads.id = ?", [id]);
        if (!job) {
          return res.status(404).render("404", { message: "Job not found" });
        }
        console.log(job);

        res.render("job", { job: job[0] });
      } catch (err) {
        console.error(err);
        return res.status(500).send("Error deleting job.");
      }
    }
    return res.status(401);
  },
  showJobsAdmin: async (req, res) => {
    try {
      return res.render("admin/jobs", {
        users: await CoreModel.getAll(User.tableName),
        technologies: await CoreModel.getAll(Technology.tableName),
        companies: await CoreModel.getAll(Company.tableName),
        jobs: await Job.getAll(),
      });
    } catch (err) {
      console.error(err);
      return res.status(500).send("Error preparing jobs panel");
    }
  },
  showJobsUser: async (req, res) => {
    try {
      return res.render("jobs", {
        jobs: await Job.getAll(),
        technologies: await CoreModel.getAll(Technology.tableName),
      });
    } catch (err) {
      console.error(err);
      return res.status(500).send("Error preparing jobs panel");
    }
  },
  addJob: async (req, res) => {
    const users = await CoreModel.getAll(User.tableName);
    const technologiesList = await CoreModel.getAll(Technology.tableName);
    const companies = await CoreModel.getAll(Company.tableName);
    const jobs = await Job.getAll();

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.render("admin/jobs", {
        users: users,
        technologies: technologiesList,
        companies: companies,
        jobs: jobs,
        errors: errors.array(),
      });
    }

    const { userId, companyId, technologies, title, description, salary, due_date } = req.body;
    console.log(req.body);

    try {
      const jobId = await Job.create(
        userId,
        companyId,
        technologies,
        title,
        description,
        salary,
        due_date,
      );
      return res.status(201).send(`Job created successfully: + ${jobsId}`);
    } catch (err) {
      return res.status(500).send(err);
    }
  },
  searchJobsUser: async (req, res) => {
    try {
      return res.render("jobs", {
        technologies: await CoreModel.getAll(Technology.tableName),
        jobs: await Job.userSearch(req.query),
      });
    } catch (err) {
      console.error(err);
      return res.status(500).send("Error preparing jobs panel");
    }
  },
  searchJobs: async (req, res) => {
    try {
      return res.render("admin/jobs", {
        users: await CoreModel.getAll(User.tableName),
        technologies: await CoreModel.getAll(Technology.tableName),
        companies: await CoreModel.getAll(Company.tableName),
        jobs: await Job.search(req.query),
      });
    } catch (err) {
      console.error(err);
      return res.status(500).send("Error preparing jobs panel");
    }
  },
  deleteJob: async (req, res) => {
    const { id } = req.query;
    try {
      const rowsAffected = await Job.delete(id);
      if (rowsAffected > 0) {
        return res.render("admin/jobs", {
          users: await CoreModel.getAll(User.tableName),
          technologies: await CoreModel.getAll(Technology.tableName),
          companies: await CoreModel.getAll(Company.tableName),
          jobs: await Job.getAll(),
        });
      }
    } catch (err) {
      console.error(err);
      return res.status(500).send("Error deleting job.");
    }
  },
};
