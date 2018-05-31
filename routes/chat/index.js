'use strict';

const chatService = require('services/chat');
const metricService = require('services/metric');
const pluginService = require('services/plugin');
const errors = require('utils/errors');
const {userAuthenticated} = require('routes/middlewares');
const {logger} = require('@ayro/commons');

async function listMessages(req, res) {
  try {
    const chatMessages = await chatService.listMessages(req.user, req.channel);
    res.json(chatMessages);
  } catch (err) {
    logger.error(err);
    errors.respondWithError(res, err);
  }
}

async function postMessage(req, res) {
  try {
    const chatMessage = await chatService.postMessage(req.user, req.channel, req.body);
    // Asynchronously because it can take a long time
    (async () => {
      await metricService.incrementMessagesPosted(req.user);
      await pluginService.messagePosted(req.user);
    })();
    res.json(chatMessage);
  } catch (err) {
    logger.error(err);
    errors.respondWithError(res, err);
  }
}

module.exports = (router, app) => {
  router.get('/', userAuthenticated, listMessages);
  router.post('/', userAuthenticated, postMessage);

  app.use('/chat', router);
};
