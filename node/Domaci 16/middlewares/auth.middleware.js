module.exports = {
  auth: (req, res, next) => {
    if (!req.session || !req.session.userId) {
      return res.redirect("/login");
    }
    next();
  },
  guest: (req, res, next) => {
    if (req.session && req.session.userId) {
      return res.redirect("/dashboard");
    }
    next();
  },
  admin: (req, res, next) => {
    if (!req.session || !req.session.isLoggedIn) {
      return res.redirect("/login");
    }
    if (req.session.role !== "admin") {
      return res.redirect("/dashboard");
    }
    next();
  },
};
