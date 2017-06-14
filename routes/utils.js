'use strict';

exports.isCustomerAuthenticated = function(req, res, next) {
  if (req.session.customer) {
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