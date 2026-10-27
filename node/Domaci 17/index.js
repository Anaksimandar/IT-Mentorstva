const express = require("express");
const app = express();
const prisma = require("./prismaClient.js");
const authRoutes = require("./routes/auth.route.js");
const errorMiddleware = require("./middleware/error.middleware.js");

app.use(express.json());
app.use("/api", authRoutes);
app.use(errorMiddleware);

app.get("/", (req, res) => {
  res.send("Hello, World!");
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
