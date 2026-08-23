module.exports = (req, res, next) => {
  res.locals.currentUser = req.session && req.session.userId ? req.session : null;
  next();
};
