'use strict';

let accountService = require('../services/account'),
    projectService = require('../services/project'),
    userService    = require('../services/user'),
    logger         = require('../utils/logger'),
    errors         = require('../utils/errors'),
    _              = require('lodash');

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
      return createSession(req, {account: account.toJSON()});
    }).then(function(token) {
      res.json(token);
    }).catch(function(err) {
      logger.error(err);
      errors.respondWithError(res, err);
    });
  };

  let authenticateUser = function(req, res, next) {
    projectService.getProjectByToken(req.body.project_token).bind({}).then(function(project) {
      userService.assignUserUid(req.body.user, req.body.device);
      return userService.saveUser(project, req.body.user);
    }).then(function(user) {
      this.user = user;
      return userService.saveDevice(user, req.body.device);
    }).then(function(device) {
      return createSession(req, {user: this.user.toJSON()});
    }).then(function(token) {
      res.json(token);
    }).catch(function(err) {
      logger.error(err);
      errors.respondWithError(res, err);
    });
  };

  router.post('/accounts', authenticateAccount);
  router.post('/users', authenticateUser);

  app.use('/auth', router);

};