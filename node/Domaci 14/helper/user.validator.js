const validateLoginData = (userData) => {
  const errors = [];
  if (!userData.email || !userData.password) {
    errors.push("Email and password are required");
  }
  if (userData.password.length < 6) {
    errors.push("Password must be at least 6 characters long");
  }
  return errors;
};

module.exports = {
  validateLoginData,
};
