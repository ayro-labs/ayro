'use strict';

const {App, AppSecret} = require('../models');
const appService = require('../services/app');
const integrationService = require('../services/integration');
const userService = require('../services/user');
const deviceService = require('../services/device');
const settings = require('../configs/settings');
const constants = require('../utils/constants');
const session = require('../utils/session');
const errors = require('../utils/errors');
const {isAccountAuthenticated} = require('../utils/middlewares');
const {logger} = require('@ayro/commons');
const multer = require('multer');

const upload = multer({dest: settings.appIconPath});

module.exports = (router, app) => {

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
        }
      }
      const user = await userService.saveAnonymousUser(app, req.body.device.uid);
      const device = await deviceService.saveDevice(user, req.body.device);
      const token = await session.createUserToken(user, device);
      res.json({app, integration, user, token});
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
      }
      res.json({});
    } catch (err) {
      logger.error(err);
      errors.respondWithError(res, err);
    }
  }

  async function listApps(req, res) {
    try {
      const apps = await appService.listApps(req.account, req.query.integrations === 'true');
      res.json(apps);
    } catch (err) {
      logger.error(err);
      errors.respondWithError(res, err);
    }
  }

  async function getApp(req, res) {
    try {
      const app = await appService.getApp(req.account, req.params.app, req.query.integrations === 'true');
      res.json(app);
    } catch (err) {
      logger.error(err);
      errors.respondWithError(res, err);
    }
  }

  async function createApp(req, res) {
    try {
      const app = await appService.createApp(req.account, req.body.name);
      res.json(app);
    } catch (err) {
      logger.error(err);
      errors.respondWithError(res, err);
    }
  }

  async function updateApp(req, res) {
    try {
      let app = new App({id: req.params.app});
      app = await appService.updateApp(req.account, app, req.body.name);
      res.json(app);
    } catch (err) {
      logger.error(err);
      errors.respondWithError(res, err);
    }
  }

  async function updateIcon(req, res) {
    try {
      let app = new App({id: req.params.app});
      app = await appService.updateIcon(req.account, app, req.file);
      res.json(app);
    } catch (err) {
      logger.error(err);
      errors.respondWithError(res, err);
    }
  }

  async function deleteApp(req, res) {
    try {
      const app = new App({id: req.params.app});
      await appService.deleteApp(req.account, app);
      res.json({});
    } catch (err) {
      logger.error(err);
      errors.respondWithError(res, err);
    }
  }

  async function listAppSecrets(req, res) {
    try {
      const app = new App({id: req.params.app});
      const appSecrets = await appService.listAppSecrets(req.account, app);
      res.json(appSecrets);
    } catch (err) {
      logger.error(err);
      errors.respondWithError(res, err);
    }
  }

  async function createAppSecret(req, res) {
    try {
      const app = new App({id: req.params.app});
      const appSecret = await appService.createAppSecret(req.account, app);
      res.json(appSecret);
    } catch (err) {
      logger.error(err);
      errors.respondWithError(res, err);
    }
  }

  async function removeAppSecret(req, res) {
    try {
      const app = new App({id: req.params.app});
      const appSecret = new AppSecret({id: req.params.app_secret});
      await appService.removeAppSecret(req.account, app, appSecret);
      res.json({});
    } catch (err) {
      logger.error(err);
      errors.respondWithError(res, err);
    }
  }

  async function getIntegration(req, res) {
    try {
      const app = new App({id: req.params.app});
      const integration = await integrationService.getIntegration(app, req.params.channel, {require: req.query.require ? req.query.require === 'true' : null});
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

  router.get('/', isAccountAuthenticated, listApps);
  router.get('/:app', isAccountAuthenticated, getApp);
  router.post('/', isAccountAuthenticated, createApp);
  router.put('/:app', isAccountAuthenticated, updateApp);
  router.put('/:app/icon', [isAccountAuthenticated, upload.single('icon')], updateIcon);
  router.delete('/:app', isAccountAuthenticated, deleteApp);

  router.get('/:app/secrets', isAccountAuthenticated, listAppSecrets);
  router.post('/:app/secrets', isAccountAuthenticated, createAppSecret);
  router.delete('/:app/secrets/:app_secret', isAccountAuthenticated, removeAppSecret);

  router.get('/:app/integrations/:channel', getIntegration);

  router.post('/integrations/website/init', initWebsiteIntegration);
  router.put('/:app/integrations/website', isAccountAuthenticated, updateWebsiteIntegration);
  router.delete('/:app/integrations/website', isAccountAuthenticated, removeWebsiteIntegration);

  router.post('/integrations/wordpress/init', initWordPressIntegration);
  router.put('/:app/integrations/wordpress', isAccountAuthenticated, updateWordPressIntegration);
  router.delete('/:app/integrations/wordpress', isAccountAuthenticated, removeWordPressIntegration);

  router.post('/integrations/android/init', initAndroidIntegration);
  router.put('/:app/integrations/android', isAccountAuthenticated, updateAndroidIntegration);
  router.delete('/:app/integrations/android', isAccountAuthenticated, removeAndroidIntegration);

  router.post('/:app/integrations/messenger', isAccountAuthenticated, addMessengerIntegration);
  router.put('/:app/integrations/messenger', isAccountAuthenticated, updateMessengerIntegration);
  router.delete('/:app/integrations/messenger', isAccountAuthenticated, removeMessengerIntegration);
  router.get('/:app/integrations/messenger/pages', isAccountAuthenticated, listMessengerPages);

  router.post('/:app/integrations/slack', isAccountAuthenticated, addSlackIntegration);
  router.put('/:app/integrations/slack', isAccountAuthenticated, updateSlackIntegration);
  router.delete('/:app/integrations/slack', isAccountAuthenticated, removeSlackIntegration);
  router.get('/:app/integrations/slack/channels', isAccountAuthenticated, listSlackChannels);
  router.post('/:app/integrations/slack/channels', isAccountAuthenticated, createSlackChannel);

  app.use('/apps', router);

};
