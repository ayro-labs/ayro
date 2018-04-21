'use strict';

const chatService = require('../../services/chat');
const errors = require('../../utils/errors');
const constants = require('../../utils/constants');
const {logger} = require('@ayro/commons');

module.exports = (router, app) => {

  async function postMessage(req, res) {
    try {
      await chatService.pushMessage(constants.integration.channels.SLACK, req.body);
      res.end();
    } catch (err) {
      logger.error(err);
      errors.respondWithError(res, err);
    }
  }

  async function postProfile(req, res) {
    try {
      await chatService.postProfile(constants.integration.channels.SLACK, req.body);
      res.end();
    } catch (err) {
      logger.error(err);
      errors.respondWithError(res, err);
    }
  }

  async function postHelp(req, res) {
    try {
      await chatService.postHelp(constants.integration.channels.SLACK, req.body);
      res.end();
    } catch (err) {
      logger.error(err);
      errors.respondWithError(res, err);
    }
  }

  router.post('/', postMessage);
  router.post('/profile', postProfile);
  router.post('/help', postHelp);

  app.use('/chat/slack', router);

};
