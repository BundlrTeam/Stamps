module.exports = (req, res, next) => {
  const email = req.header('x-user-email');
  if (email) {
    req.userEmail = email;
  }
  next();
};
