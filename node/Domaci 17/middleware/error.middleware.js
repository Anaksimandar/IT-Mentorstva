const { AppError } = require("../errors/AppError.js");

module.exports = (err, req, res, next) => {
  if (err instanceof AppError) {
    return res.status(err.status).json({ message: err.message });
  }
  return res.status(500).json({ message: "Internal server error", code: "INTERNAL" });
};
