const chatService = require('../services/chat');
const isUserAuthenticated = require('../utils/middlewares').isUserAuthenticated;
const logger = require('../utils/logger');
const errors = require('../utils/errors');

module.exports = (router, app) => {

  const listMessages = (req, res) => {
    chatService.listMessages(req.device).then((messages) => {
      res.json(messages);
    }).catch((err) => {
      logger.error(err);
      errors.respondWithError(res, err);
    });
  };

  const postMessage = (req, res) => {
    chatService.postMessage(req.user, req.device, req.body).then((chatMessage) => {
      res.json(chatMessage);
    }).catch((err) => {
      logger.error(err);
      errors.respondWithError(res, err);
    });
  };

  const pushMessage = (req, res) => {
    chatService.pushMessage(req.params.channel, req.body).then(() => {
      res.json({});
    }).catch((err) => {
      logger.error(err);
      errors.respondWithError(res, err);
    });
  };

  router.get('/', isUserAuthenticated, listMessages);
  router.post('/:platform', isUserAuthenticated, postMessage);
  router.post('/:channel/push', pushMessage);

  app.use('/chat', router);

};
