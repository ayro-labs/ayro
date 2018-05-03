'use strict';

const pluginService = require('../services/plugin');
const eventService = require('../services/event');
const errors = require('../utils/errors');
const {userAuthenticated} = require('../utils/middlewares');
const {logger} = require('@ayro/commons');

async function viewChat(req, res) {
  try {
    await eventService.trackViewChat(req.user);
    await pluginService.chatViewed(req.user, req.body.channel);
    res.json({});
  } catch (err) {
    logger.error(err);
    errors.respondWithError(res, err);
  }
}

module.exports = (router, app) => {
  router.post('/view_chat', userAuthenticated, viewChat);

  app.use('/events', router);
};
