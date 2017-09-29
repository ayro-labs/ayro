const chatService = require('../../services/chat');
const logger = require('../../utils/logger');
const errors = require('../../utils/errors');
const constants = require('../../utils/constants');

module.exports = (router, app) => {

  function postMessage(req, res) {
    chatService.pushMessage(constants.integration.channels.SLACK, req.body).then(() => {
      res.json({});
    }).catch((err) => {
      logger.error(err);
      errors.respondWithError(res, err);
    });
  }

  function postProfile(req, res) {
    chatService.postProfile(constants.integration.channels.SLACK, req.body).then(() => {
      res.json({});
    }).catch((err) => {
      logger.error(err);
      errors.respondWithError(res, err);
    });
  }

  router.post('/message', postMessage);
  router.post('/profile', postProfile);

  app.use('/chat/slack', router);

};
