const chatService = require('../../services/chat');
const errors = require('../../utils/errors');
const constants = require('../../utils/constants');
const {logger} = require('@ayro/commons');
const Promise = require('bluebird');

module.exports = (router, app) => {

  function postMessage(req, res) {
    Promise.coroutine(function* () {
      try {
        yield chatService.pushMessage(constants.integration.channels.SLACK, req.body);
        res.end();
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
        res.end();
      } catch (err) {
        logger.error(err);
        errors.respondWithError(res, err);
      }
    })();
  }

  function postHelp(req, res) {
    Promise.coroutine(function* () {
      try {
        yield chatService.postHelp(constants.integration.channels.SLACK, req.body);
        res.end();
      } catch (err) {
        logger.error(err);
        errors.respondWithError(res, err);
      }
    })();
  }

  router.post('/', postMessage);
  router.post('/profile', postProfile);
  router.post('/help', postHelp);


  app.use('/chat/twitter', router);

};
