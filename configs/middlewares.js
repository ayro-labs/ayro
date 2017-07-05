'use strict';

let Account = require('../models').Account,
    User = require('../models').User,
    Device = require('../models').Device,
    logger = require('../utils/logger');

exports.configure = function(app) {

  logger.info('Configuring middlewares');

  app.use(function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Access-Control-Allow-Headers, Authorization, X-Token');
    next();
  });

  // Sets the session account as a request attribute
  app.use(function(req, res, next) {
    if (req.session.account) {
      req.account = new Account(req.session.account);
      logger.debug('%s %s Account %s', req.method, req.path, req.account._id);
    }
    next();
  });

  // Sets the session user as a request attribute
  app.use(function(req, res, next) {
    if (req.session.user) {
      req.user = new User(req.session.user);
      logger.debug('%s %s User %s', req.method, req.path, req.user._id);
    }
    if (req.session.device) {
      req.device = new Device(req.session.device);
    }
    next();
  });

};