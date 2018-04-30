'use strict';

const chatService = require('../../services/chat');
const errors = require('../../utils/errors');
const {userAuthenticated} = require('../../utils/middlewares');
const {logger} = require('@ayro/commons');

module.exports = (router, app) => {

  async function listMessages(req, res) {
    try {
      const chatMessages = await chatService.listMessages(req.user, req.device);
      res.json(chatMessages);
    } catch (err) {
      logger.error(err);
      errors.respondWithError(res, err);
    }
  }

  async function postMessage(req, res) {
    try {
      const chatMessage = await chatService.postMessage(req.user, req.device, req.params.channel, req.body);
      res.json(chatMessage);
    } catch (err) {
      logger.error(err);
      errors.respondWithError(res, err);
    }
  }

  router.get('/', userAuthenticated, listMessages);
  router.post('/:channel', userAuthenticated, postMessage);

  app.use('/chat', router);

};
