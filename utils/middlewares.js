const errors = require('./errors');

exports.isUserAuthenticated = (req, res, next) => {
  if (req.session.user) {
    next();
  } else {
    errors.respondWithError(res, errors.permissionError('permission.denied', 'Permission denied'));
  }
};

exports.isAccountAuthenticated = (req, res, next) => {
  if (req.session.account) {
    next();
  } else {
    errors.respondWithError(res, errors.permissionError('permission.denied', 'Permission denied'));
  }
};
