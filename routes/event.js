'use strict';

const eventService = require('../services/event');
const errors = require('../utils/errors');
const {userAuthenticated} = require('../utils/middlewares');
const {logger} = require('@ayro/commons');

module.exports = (router, app) => {

  async function viewChat(req, res, type) {
    try {
      await eventService.trackViewChat(req.user);
      res.json({});
    } catch (err) {
      logger.error(err);
      errors.respondWithError(res, err);
    }
  }

  router.post('/view_chat', userAuthenticated, viewChat);

  app.use('/events', router);

};
