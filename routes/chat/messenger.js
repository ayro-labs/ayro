const chatService = require('../../services/chat');
const logger = require('../../utils/logger');
const errors = require('../../utils/errors');
const constants = require('../../utils/constants');

module.exports = (router, app) => {

  function postMessage(req, res) {
    chatService.pushMessage(constants.integration.channels.MESSENGER, req.body).then(() => {
      res.json({});
    }).catch((err) => {
      logger.error(err);
      errors.respondWithError(res, err);
    });
  }

  router.post('/message', postMessage);

  app.use('/chat/messenger', router);

};
