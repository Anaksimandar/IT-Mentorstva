const router = require("express").Router();
const { getAllUsers } = require("../services/user.service.js");

router.get("/", async (req, res) => {
  const users = await getAllUsers();
  res.json({ users });
});

module.exports = router;
