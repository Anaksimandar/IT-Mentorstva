const express = require("express");
const app = express();
const authRoutes = require("./routes/auth.route.js");
const errorMiddleware = require("./middleware/error.middleware.js");
const usersRoutes = require("./routes/users.route.js");
const eventsRoutes = require("./routes/event.route.js");

app.use(express.json());
app.use("/api", authRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/events", eventsRoutes);
app.use(errorMiddleware);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
