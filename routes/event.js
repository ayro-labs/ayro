'use strict';

const eventService = require('../services/event');
const errors = require('../utils/errors');
const {userAuthenticated} = require('../utils/middlewares');
const {logger} = require('@ayro/commons');

module.exports = (router, app) => {

  async function viewChat(req, res) {
    try {
      await eventService.trackViewChat(req.user, req.body.channel);
      res.json({});
    } catch (err) {
      logger.error(err);
      errors.respondWithError(res, err);
    }
  }

  router.post('/view_chat', userAuthenticated, viewChat);

  app.use('/events', router);

};
