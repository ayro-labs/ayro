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

  router.post('/', isUserAuthenticated, updateUser);

  app.use('/projects', router);

};