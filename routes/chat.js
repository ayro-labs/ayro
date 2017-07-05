'use strict';

let chatService = require('../services/chat'),
    isUserAuthenticated = require('../utils/middlewares').isUserAuthenticated,
    logger = require('../utils/logger'),
    errors = require('../utils/errors');

module.exports = function(router, app) {

  let listMessages = function(req, res, next) {
    chatService.listMessages(req.device).then(function(messages) {
      res.json(messages);
    }).catch(function(err) {
      logger.error(err);
      errors.respondWithError(res, err);
    });
  };

  let postMessage = function(req, res, next) {
    chatService.postMessage(req.user, req.device, req.body).then(function() {
      res.json({});
    }).catch(function(err) {
      logger.error(err);
      errors.respondWithError(res, err);
    });
  };

  let pushMessage = function(req, res, next) {
    chatService.pushMessage(req.params.channel, req.body).then(function() {
      res.json({});
    }).catch(function(err) {
      logger.error(err);
      errors.respondWithError(res, err);
    });
  };

  router.get('/', isUserAuthenticated, listMessages);
  router.post('/:platform', isUserAuthenticated, postMessage);
  router.post('/:channel/push', pushMessage);

  app.use('/chat', router);

};