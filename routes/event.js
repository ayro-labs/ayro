'use strict';

const pluginService = require('../services/plugin');
const metricService = require('../services/metric');
const errors = require('../utils/errors');
const {userAuthenticated} = require('../utils/middlewares');
const {logger} = require('@ayro/commons');

async function trackViewChat(req, res) {
  try {
    await metricService.incrementChatViews(req.user);
    await pluginService.chatViewed(req.user, req.channel);
    res.json({});
  } catch (err) {
    logger.error(err);
    errors.respondWithError(res, err);
  }
}

module.exports = (router, app) => {
  router.post('/view_chat', userAuthenticated, trackViewChat);

  app.use('/events', router);
};
