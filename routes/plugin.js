'use strict';

const {App} = require('../models');
const pluginService = require('../services/plugin');
const constants = require('../utils/constants');
const errors = require('../utils/errors');
const {accountAuthenticated, accountOwnsApp} = require('../utils/middlewares');
const {logger} = require('@ayro/commons');

module.exports = (router, app) => {

  async function addPlugin(req, res, type) {
    try {
      const app = new App({id: req.params.app});
      let plugin = null;
      switch (type) {
        case constants.plugin.types.OFFICE_HOURS:
          plugin = await pluginService.addOfficeHoursPlugin(app, req.body);
          break;
        case constants.plugin.types.GREETINGS_MESSAGE:
          plugin = await pluginService.addGreetingsMessagePlugin(app, req.body);
          break;
      }
      res.json(plugin);
    } catch (err) {
      logger.error(err);
      errors.respondWithError(res, err);
    }
  }

  async function updatePlugin(req, res, type) {
    try {
      const app = new App({id: req.params.app});
      let plugin = null;
      switch (type) {
        case constants.plugin.types.OFFICE_HOURS:
          plugin = await pluginService.updateOfficeHoursPlugin(app, req.body);
          break;
        case constants.plugin.types.GREETINGS_MESSAGE:
          plugin = await pluginService.updateGreetingsMessagePlugin(app, req.body);
          break;
      }
      res.json(plugin);
    } catch (err) {
      logger.error(err);
      errors.respondWithError(res, err);
    }
  }

  async function getPlugin(req, res) {
    try {
      const app = new App({id: req.params.app});
      const plugin = await pluginService.getPlugin(app, req.params.type, {require: req.query.require ? req.query.require === 'true' : null});
      res.json(plugin);
    } catch (err) {
      logger.error(err);
      errors.respondWithError(res, err);
    }
  }

  async function addOfficeHoursPlugin(req, res) {
    addPlugin(req, res, constants.plugin.types.OFFICE_HOURS);
  }

  async function updateOfficeHoursPlugin(req, res) {
    updatePlugin(req, res, constants.plugin.types.OFFICE_HOURS);
  }

  async function addGreetingsMessagePlugin(req, res) {
    addPlugin(req, res, constants.plugin.types.GREETINGS_MESSAGE);
  }

  async function updateGreetingsMessagePlugin(req, res) {
    updatePlugin(req, res, constants.plugin.types.GREETINGS_MESSAGE);
  }

  async function removePlugin(req, res) {
    try {
      const app = new App({id: req.params.app});
      await pluginService.removePlugin(app, req.params.type);
      res.json({});
    } catch (err) {
      logger.error(err);
      errors.respondWithError(res, err);
    }
  }

  router.get('/:type', [accountAuthenticated, accountOwnsApp], getPlugin);
  router.delete('/:type', [accountAuthenticated, accountOwnsApp], removePlugin);

  router.post('/office_hours', [accountAuthenticated, accountOwnsApp], addOfficeHoursPlugin);
  router.put('/office_hours', [accountAuthenticated, accountOwnsApp], updateOfficeHoursPlugin);

  router.post('/greetings_message', [accountAuthenticated, accountOwnsApp], addGreetingsMessagePlugin);
  router.put('/greetings_message', [accountAuthenticated, accountOwnsApp], updateGreetingsMessagePlugin);

  app.use('/apps/:app/plugins', router);

};
