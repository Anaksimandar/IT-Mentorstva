const express = require("express");
const app = express();
const jobRouter = require("./routers/jobs.router");
const ejs = require("ejs");
const session = require("express-session");
const FileStore = require("session-file-store")(session);
const homeRouter = require("./routers/home.router");
const authRouter = require("./routers/auth.router");
const adminJobsRouter = require("./routers/adminJobs.router");
const path = require("path");
const expressLayout = require("express-ejs-layouts");
const companyRouter = require("./routers/companies.router");
const technologyRouter = require("./routers/technologies.router");
const currentUserMiddlewere = require("./middlewares/currentUser.middleware");
const userJobsRouter = require("./routers/userJobs.router");

require("dotenv").config();

app.use(
  session({
    store: new FileStore(),
    secret: process.env.SESSION_SECRET, // Replace with a strong secret in production
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false,
      maxAge: 1000 * 60 * 60 * 24,
    },
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "ejs");
app.set("views", __dirname + "/views");
app.use(expressLayout);
app.set("layout", "index");

app.use(currentUserMiddlewere);
app.use("/", homeRouter);
app.use("/auth", authRouter);
app.use("/admin/companies", companyRouter);
app.use("/admin/technologies", technologyRouter);
app.use("/jobs", userJobsRouter);
app.use("/admin/jobs", adminJobsRouter);
app.get("/product", (req, res) => {
  res.send("Retrieving all products");
});

app.get("/", (req, res) => {
  res.render("home");
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
