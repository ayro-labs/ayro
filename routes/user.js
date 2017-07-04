'use strict';

let userService = require('../apis/user'),
    isUserAuthenticated = require('../utils/middlewares').isUserAuthenticated,
    logger = require('../utils/logger'),
    errors = require('../utils/errors');

module.exports = function(router, app) {

  let updateUser = function(req, res, next) {
    userService.updateUser(req.user, req.body).then(function() {
      res.json({});
    }).catch(function(err) {
      logger.error(err);
      errors.respondWithError(res, err);
    });
  };

  let updateDevice = function(req, res, next) {
    userService.updateDevice(req.device, req.body).then(function() {
      res.json({});
    }).catch(function(err) {
      logger.error(err);
      errors.respondWithError(res, err);
    });
  };

  router.put('/', isUserAuthenticated, updateUser);
  router.put('/devices', isUserAuthenticated, updateDevice);

  app.use('/users', router);

};