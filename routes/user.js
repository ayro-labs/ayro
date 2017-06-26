'use strict';

let userService = require('../services/user'),
    isUserAuthenticated = require('../utils/middlewares').isUserAuthenticated,
    logger = require('../utils/logger'),
    errors = require('../utils/errors');

module.exports = function(router, app) {

  let updateUser = function(req, res, next) {
    userService.updateUser(req.user, req.body).then(function() {
      res.json();
    }).catch(function(err) {
      logger.error(err);
      errors.respondWithError(res, err);
    });
  };

  let updateDevice = function(req, res, next) {
    userService.getDevice(req.user, data.uid).then(function(device) {
      return userService.updateDevice(req.user, data);
    }).then(function(device) {
      res.json();
    }).catch(function(err) {
      logger.error(err);
      errors.respondWithError(res, err);
    });
  };

  router.put('/', isUserAuthenticated, updateUser);
  router.put('/devices', isUserAuthenticated, updateDevice);

  app.use('/users', router);

};