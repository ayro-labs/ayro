const chatService = require('../services/chat');
const logger = require('../utils/logger');
const errors = require('../utils/errors');
const isUserAuthenticated = require('../utils/middlewares').isUserAuthenticated;

module.exports = (router, app) => {

  function listMessages(req, res) {
    chatService.listMessages(req.user, req.device).then((messages) => {
      res.json(messages);
    }).catch((err) => {
      logger.error(err);
      errors.respondWithError(res, err);
    });
  }

  function postMessage(req, res) {
    chatService.postMessage(req.user, req.device, req.body).then((chatMessage) => {
      res.json(chatMessage);
    }).catch((err) => {
      logger.error(err);
      errors.respondWithError(res, err);
    });
  }

  function pushMessage(req, res) {
    chatService.pushMessage(req.params.channel, req.body).then(() => {
      res.json({});
    }).catch((err) => {
      logger.error(err);
      errors.respondWithError(res, err);
    });
  }

  function postProfile(req, res) {
    chatService.postProfile(req.params.channel, req.body).then(() => {
      res.json({});
    }).catch((err) => {
      logger.error(err);
      errors.respondWithError(res, err);
    });
  }

  router.get('/', isUserAuthenticated, listMessages);
  router.post('/:platform', isUserAuthenticated, postMessage);
  router.post('/:channel/push', pushMessage);
  router.post('/:channel/profile', postProfile);

  app.use('/chat', router);

};
