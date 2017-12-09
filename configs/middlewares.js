const {Account, User, Device} = require('../models');
const {logger} = require('@ayro/commons');

exports.configure = (app) => {

  logger.info('Configuring middlewares');

  // Sets the session account as a request attribute
  app.use((req, res, next) => {
    if (req.session.account) {
      req.account = new Account(req.session.account);
      logger.debug('%s %s Account %s', req.method, req.path, req.account.id);
    }
    next();
  });

  // Sets the session user as a request attribute
  app.use((req, res, next) => {
    if (req.session.user) {
      req.user = new User(req.session.user);
      logger.debug('%s %s User %s', req.method, req.path, req.user.id);
    }
    if (req.session.device) {
      req.device = new Device(req.session.device);
    }
    next();
  });

};
