const saveErrorAndRedirect = (req, res, route, errorMessage) => {
  req.session.error = errorMessage;
  req.session.save(() => {
    return res.redirect(route); // Redirect to the specified route with an error message
  });
};

module.exports = {
  saveErrorAndRedirect,
};
