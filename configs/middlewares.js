'use strict';

let Account = require('../models').Account,
    User = require('../models').User,
    logger = require('../utils/logger');

exports.configure = function(app) {

  logger.info('Configuring middlewares');

  // Sets the session account as a request attribute
  app.use(function(req, res, next) {
    if (req.session.account) {
      req.account = req.session.account;
      logger.debug('%s %s Account %s', req.method, req.path, req.account._id);
    }
    next();
  });

  // Sets the session user as a request attribute
  app.use(function(req, res, next) {
    if (req.session.user) {
      req.user = req.session.user;
      logger.debug('%s %s User %s', req.method, req.path, req.user._id);
    }
    next();
  });

};