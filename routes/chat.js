'use strict';

let chatService = require('../services/chat'),
    isUserAuthenticated = require('../utils/middlewares').isUserAuthenticated,
    logger = require('../utils/logger'),
    errors = require('../utils/errors');

module.exports = function(router, app) {

  let postMessage = function(req, res, next) {
    chatService.postMessage(req.user, req.params.platform, req.body).then(function() {
      res.json();
    }).catch(function(err) {
      logger.error(err);
      errors.respondWithError(res, err);
    });
  };

  let pushMessage = function(req, res, next) {
    chatService.pushMessage(req.params.channel, req.body).then(function() {
      res.json();
    }).catch(function(err) {
      logger.error(err);
      errors.respondWithError(res, err);
    });
  };

  router.post('/:platform', isUserAuthenticated, postMessage);
  router.post('/:channel/push', pushMessage);

  app.use('/chat', router);

};