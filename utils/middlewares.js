exports.isUserAuthenticated = (req, res, next) => {
  if (req.session.user) {
    next();
  } else {
    res.sendStatus(401);
  }
};

exports.isAccountAuthenticated = (req, res, next) => {
  if (req.session.account) {
    next();
  } else {
    res.sendStatus(401);
  }
};
