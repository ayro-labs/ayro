'use strict';

let Account  = require('../models').Account,
    Customer = require('../models').Customer,
    logger   = require('../utils/logger');

exports.configure = function(app) {

  logger.info('Configuring middlewares');

  // Sets the session account as a request attribute
  app.use(function(req, res, next) {
    if (req.session.account) {
      req.account = new Account(req.session.account);
      logger.debug('%s %s Account %s', req.method, req.path, req.account._id);
    }
    next();
  });

  // Sets the session customer as a request attribute
  app.use(function(req, res, next) {
    if (req.session.customer) {
      req.customer = new Customer(req.session.customer);
      logger.debug('%s %s User %s', req.method, req.path, req.customer._id);
    }
    next();
  });

};