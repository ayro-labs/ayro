const chatService = require('../../services/chat');
const logger = require('../../utils/logger');
const errors = require('../../utils/errors');
const constants = require('../../utils/constants');
const Promise = require('bluebird');

module.exports = (router, app) => {

  function postMessage(req, res) {
    Promise.coroutine(function* () {
      try {
        yield chatService.pushMessage(constants.integration.channels.SLACK, req.body);
        res.json({});
      } catch (err) {
        logger.error(err);
        errors.respondWithError(res, err);
      }
    })();
  }

  function postProfile(req, res) {
    Promise.coroutine(function* () {
      try {
        yield chatService.postProfile(constants.integration.channels.SLACK, req.body);
        res.json({});
      } catch (err) {
        logger.error(err);
        errors.respondWithError(res, err);
      }
    })();
  }

  router.post('/', postMessage);
  router.post('/profile', postProfile);

  app.use('/chat/slack', router);

};
