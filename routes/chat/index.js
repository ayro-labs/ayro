const chatService = require('../../services/chat');
const errors = require('../../utils/errors');
const {isUserAuthenticated} = require('../../utils/middlewares');
const {logger} = require('@ayro/commons');
const Promise = require('bluebird');

module.exports = (router, app) => {

  function listMessages(req, res) {
    Promise.coroutine(function* () {
      try {
        const chatMessages = yield chatService.listMessages(req.user, req.device);
        res.json(chatMessages);
      } catch (err) {
        logger.error(err);
        errors.respondWithError(res, err);
      }
    })();
  }

  function postMessage(req, res) {
    Promise.coroutine(function* () {
      try {
        const chatMessage = yield chatService.postMessage(req.user, req.device, req.params.channel, req.body);
        res.json(chatMessage);
      } catch (err) {
        logger.error(err);
        errors.respondWithError(res, err);
      }
    })();
  }

  router.get('/', isUserAuthenticated, listMessages);
  router.post('/:channel', isUserAuthenticated, postMessage);

  app.use('/chat', router);

};
