'use strict';

exports.isUserAuthenticated = function(req, res, next) {
  if (req.session.user) {
    next();
  } else {
    res.sendStatus(401);
  }
};

exports.isAccountAuthenticated = function(req, res, next) {
  if (req.session.account) {
    next();
  } else {
    res.sendStatus(401);
  }
};