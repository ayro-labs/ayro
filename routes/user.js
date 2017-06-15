'use strict';

let isUserAuthenticated = require('../utils/middlewares').isUserAuthenticated,
    userService         = require('../services/user'),
    logger              = require('../utils/logger');

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
    userService.updateDevice(req.user, req.body).then(function() {
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