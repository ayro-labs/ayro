'use strict';

let accountService = require('../services/account'),
    appService = require('../services/app'),
    userService = require('../services/user'),
    logger = require('../utils/logger'),
    errors = require('../utils/errors'),
    _ = require('lodash');

module.exports = function(router, app) {

  let createSession = function(req, data) {
    return new Promise(function(resolve, reject) {
      _.assign(req.session, data);
      req.session.create(null, function(err, token) {
        if (err) {
          reject(err);
        } else {
          resolve(token);
        }
      });
    });
  };

  let authenticateAccount = function(req, res, next) {
    accountService.authenticate(req.body.email, req.body.password).then(function(account) {
      return createSession(req, {account: {_id: account._id}});
    }).then(function(token) {
      res.json(token);
    }).catch(function(err) {
      logger.error(err);
      errors.respondWithError(res, err);
    });
  };

  let authenticateUser = function(req, res, next) {
    appService.getAppByToken(req.body.app_token).bind({}).then(function(app) {
      userService.assignUserUid(req.body.user, req.body.device);
      return userService.saveUser(app, req.body.user);
    }).then(function(user) {
      this.user = user;
      return userService.saveDevice(user, req.body.device);
    }).then(function(device) {
      return createSession(req, {
        user: {_id: this.user._id},
        device: {_id: device._id}
      });
    }).then(function(token) {
      res.json({
        token: token,
        user: this.user
      });
    }).catch(function(err) {
      logger.error(err);
      errors.respondWithError(res, err);
    });
  };

  router.post('/accounts', authenticateAccount);
  router.post('/users', authenticateUser);

  app.use('/auth', router);

};