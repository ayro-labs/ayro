'use strict';

const pluginService = require('../../services/plugin');
const eventService = require('../../services/event');
const chatService = require('../../services/chat');
const errors = require('../../utils/errors');
const {userAuthenticated} = require('../../utils/middlewares');
const {logger} = require('@ayro/commons');

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
    await eventService.trackPostMessage(req.user);
    // Asynchronous because it can take a long time
    pluginService.messagePosted(req.user);
    res.json(chatMessage);
  } catch (err) {
    logger.error(err);
    errors.respondWithError(res, err);
  }
}

module.exports = (router, app) => {
  router.get('/', userAuthenticated, listMessages);
  router.post('/:channel', userAuthenticated, postMessage);

  app.use('/chat', router);
};
