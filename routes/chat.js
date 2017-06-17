'use strict';

let chatService = require('../services/chat'),
    logger = require('../utils/logger'),
    errors = require('../utils/errors');

module.exports = function(router, app) {

  let postMessage = function(req, res, next) {
    chatService.postMessage(req.user, req.body).then(function() {
      res.json();
    }).catch(function(err) {
      logger.error(err);
      errors.respondWithError(res, err);
    });
  };

  let pushMessage = function(req, res, next) {
    let user = {_id: req.body.user};
    chatService.pushMessage(user, req.body.message).then(function() {
      res.json();
    }).catch(function(err) {
      logger.error(err);
      errors.respondWithError(res, err);
    });
  };

  router.post('/', postMessage);
  router.post('/push', pushMessage);

  app.use('/chat', router);

};