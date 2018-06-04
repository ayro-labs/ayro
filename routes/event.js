'use strict';

const eventService = require('services/event');
const errors = require('utils/errors');
const {userAuthenticated} = require('routes/middlewares');
const {logger} = require('@ayro/commons');

async function trackViewChat(req, res) {
  try {
    await eventService.trackChatViews(req.user, req.channel);
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
