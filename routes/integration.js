'use strict';

const {App} = require('models');
const integrationService = require('services/integration');
const appService = require('services/app');
const userService = require('services/user');
const deviceService = require('services/device');
const constants = require('utils/constants');
const session = require('utils/session');
const errors = require('utils/errors');
const {accountAuthenticated, accountOwnsApp} = require('routes/middlewares');
const {logger} = require('@ayro/commons');

async function initIntegration(req, res, channel) {
  try {
    const app = await appService.getAppByToken(req.body.app_token);
    let integration = await integrationService.getIntegration(app, channel, {require: false});
    if (!integration) {
      switch (channel) {
        case constants.integration.channels.WEBSITE:
          integration = await integrationService.addWebsiteIntegration(app);
          break;
        case constants.integration.channels.WORDPRESS:
          integration = await integrationService.addWordPressIntegration(app);
          break;
        case constants.integration.channels.ANDROID:
          integration = await integrationService.addAndroidIntegration(app);
          break;
        default:
          // Nothing to do...
          break;
      }
    }
    const user = await userService.saveAnonymousUser(app, req.body.device.uid);
    const device = await deviceService.saveDevice(user, channel, req.body.device);
    const token = await session.createUserToken(user, device, channel);
    res.json({app, integration, user, device, token});
  } catch (err) {
    logger.error(err);
    errors.respondWithError(res, err);
  }
}

async function updateIntegration(req, res, channel) {
  try {
    const app = new App({id: req.params.app});
    let integration = null;
    switch (channel) {
      case constants.integration.channels.WEBSITE:
        integration = await integrationService.updateWebsiteIntegration(app, req.body);
        break;
      case constants.integration.channels.WORDPRESS:
        integration = await integrationService.updateWordPressIntegration(app, req.body);
        break;
      case constants.integration.channels.ANDROID:
        integration = await integrationService.updateAndroidIntegration(app, req.body);
        break;
      case constants.integration.channels.MESSENGER:
        integration = await integrationService.updateMessengerIntegration(app, req.body.page);
        break;
      case constants.integration.channels.SLACK:
        integration = await integrationService.updateSlackIntegration(app, req.body.channel);
        break;
      default:
        // Nothing to do...
        break;
    }
    res.json(integration);
  } catch (err) {
    logger.error(err);
    errors.respondWithError(res, err);
  }
}

async function removeIntegration(req, res, channel) {
  try {
    const app = new App({id: req.params.app});
    switch (channel) {
      case constants.integration.channels.WEBSITE:
        await integrationService.removeWebsiteIntegration(app);
        break;
      case constants.integration.channels.WORDPRESS:
        await integrationService.removeWordPressIntegration(app);
        break;
      case constants.integration.channels.ANDROID:
        await integrationService.removeAndroidIntegration(app);
        break;
      case constants.integration.channels.MESSENGER:
        await integrationService.removeMessengerIntegration(app);
        break;
      case constants.integration.channels.SLACK:
        await integrationService.removeSlackIntegration(app);
        break;
      default:
        // Nothing to do...
        break;
    }
    res.json({});
  } catch (err) {
    logger.error(err);
    errors.respondWithError(res, err);
  }
}

async function getIntegration(req, res) {
  try {
    const app = new App({id: req.params.app});
    const integration = await integrationService.getIntegration(app, req.params.channel, {require: req.query.require && req.query.require === 'true'});
    res.json(integration);
  } catch (err) {
    logger.error(err);
    errors.respondWithError(res, err);
  }
}

async function initWebsiteIntegration(req, res) {
  initIntegration(req, res, constants.integration.channels.WEBSITE);
}

async function updateWebsiteIntegration(req, res) {
  updateIntegration(req, res, constants.integration.channels.WEBSITE);
}

async function removeWebsiteIntegration(req, res) {
  removeIntegration(req, res, constants.integration.channels.WEBSITE);
}

async function initWordPressIntegration(req, res) {
  initIntegration(req, res, constants.integration.channels.WORDPRESS);
}

async function updateWordPressIntegration(req, res) {
  updateIntegration(req, res, constants.integration.channels.WORDPRESS);
}

async function removeWordPressIntegration(req, res) {
  removeIntegration(req, res, constants.integration.channels.WORDPRESS);
}

async function initAndroidIntegration(req, res) {
  initIntegration(req, res, constants.integration.channels.ANDROID);
}

async function updateAndroidIntegration(req, res) {
  updateIntegration(req, res, constants.integration.channels.ANDROID);
}

async function removeAndroidIntegration(req, res) {
  removeIntegration(req, res, constants.integration.channels.ANDROID);
}

async function addMessengerIntegration(req, res) {
  try {
    const app = new App({id: req.params.app});
    const integration = await integrationService.addMessengerIntegration(app, req.body.profile);
    res.json(integration);
  } catch (err) {
    logger.error(err);
    errors.respondWithError(res, err);
  }
}

async function updateMessengerIntegration(req, res) {
  updateIntegration(req, res, constants.integration.channels.MESSENGER);
}

async function removeMessengerIntegration(req, res) {
  removeIntegration(req, res, constants.integration.channels.MESSENGER);
}

async function listMessengerPages(req, res) {
  try {
    const app = new App({id: req.params.app});
    const pages = await integrationService.listMessengerPages(app);
    res.json(pages);
  } catch (err) {
    logger.error(err);
    errors.respondWithError(res, err);
  }
}

async function addSlackIntegration(req, res) {
  try {
    const app = new App({id: req.params.app});
    const integration = await integrationService.addSlackIntegration(app, req.body.access_token);
    res.json(integration);
  } catch (err) {
    logger.error(err);
    errors.respondWithError(res, err);
  }
}

async function updateSlackIntegration(req, res) {
  updateIntegration(req, res, constants.integration.channels.SLACK);
}

async function removeSlackIntegration(req, res) {
  removeIntegration(req, res, constants.integration.channels.SLACK);
}

async function listSlackChannels(req, res) {
  try {
    const app = new App({id: req.params.app});
    const channels = await integrationService.listSlackChannels(app);
    res.json(channels);
  } catch (err) {
    logger.error(err);
    errors.respondWithError(res, err);
  }
}

async function createSlackChannel(req, res) {
  try {
    const app = new App({id: req.params.app});
    const channel = await integrationService.createSlackChannel(app, req.body.channel);
    res.json(channel);
  } catch (err) {
    logger.error(err);
    errors.respondWithError(res, err);
  }
}

module.exports = (router, app) => {
  // Init integration routes
  app.post('/apps/integrations/website/init', initWebsiteIntegration);
  app.post('/apps/integrations/wordpress/init', initWordPressIntegration);
  app.post('/apps/integrations/android/init', initAndroidIntegration);

  // Other routes
  router.get('/:channel', [accountAuthenticated, accountOwnsApp], getIntegration);

  router.put('/website', [accountAuthenticated, accountOwnsApp], updateWebsiteIntegration);
  router.delete('/website', [accountAuthenticated, accountOwnsApp], removeWebsiteIntegration);

  router.put('/wordpress', [accountAuthenticated, accountOwnsApp], updateWordPressIntegration);
  router.delete('/wordpress', [accountAuthenticated, accountOwnsApp], removeWordPressIntegration);

  router.put('/android', [accountAuthenticated, accountOwnsApp], updateAndroidIntegration);
  router.delete('/android', [accountAuthenticated, accountOwnsApp], removeAndroidIntegration);

  router.post('/messenger', [accountAuthenticated, accountOwnsApp], addMessengerIntegration);
  router.put('/messenger', [accountAuthenticated, accountOwnsApp], updateMessengerIntegration);
  router.delete('/messenger', [accountAuthenticated, accountOwnsApp], removeMessengerIntegration);
  router.get('/messenger/pages', [accountAuthenticated, accountOwnsApp], listMessengerPages);

  router.post('/slack', [accountAuthenticated, accountOwnsApp], addSlackIntegration);
  router.put('/slack', [accountAuthenticated, accountOwnsApp], updateSlackIntegration);
  router.delete('/slack', [accountAuthenticated, accountOwnsApp], removeSlackIntegration);
  router.get('/slack/channels', [accountAuthenticated, accountOwnsApp], listSlackChannels);
  router.post('/slack/channels', [accountAuthenticated, accountOwnsApp], createSlackChannel);

  app.use('/apps/:app/integrations', router);
};
