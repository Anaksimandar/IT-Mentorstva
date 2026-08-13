const express = require("express");
const app = express();
const userRouter = require("./routers/user.router");
const ejs = require("ejs");
const session = require("express-session");
const FileStore = require("session-file-store")(session);
const homeRouter = require("./routers/home.router");
const authRouter = require("./routers/auth.router");
const adminRouter = require("./routers/admin.router");
const path = require("path");

app.use(
  session({
    store: new FileStore(),
    secret: "1234567890", // Replace with a strong secret in production
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

app.use("/user", userRouter);
app.use("/", homeRouter);
app.use("/auth", authRouter);
app.use("/admin", adminRouter);
app.get("/product", (req, res) => {
  res.send("Retrieving all products");
});

app.get("/", (req, res) => {
  res.render("index");
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
