const {App} = require('../models');
const appService = require('../services/app');
const integrationService = require('../services/integration');
const settings = require('../configs/settings');
const constants = require('../utils/constants');
const errors = require('../utils/errors');
const {isAccountAuthenticated} = require('../utils/middlewares');
const {logger} = require('@ayro/commons');
const multer = require('multer');

const upload = multer({dest: settings.appIconPath});

module.exports = (router, app) => {

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
    try {
      const app = await appService.getAppByToken(req.body.app_token);
      let integration = await integrationService.getIntegration(app, constants.integration.channels.WEBSITE, {require: false});
      integration = integration || (await integrationService.addWebsiteIntegration(app));
      const appJSON = app.toJSON();
      delete appJSON.integrations;
      res.json({app: appJSON, integration});
    } catch (err) {
      logger.error(err);
      errors.respondWithError(res, err);
    }
  }

  async function updateWebsiteIntegration(req, res) {
    try {
      const app = new App({id: req.params.app});
      const integration = await integrationService.updateWebsiteIntegration(app, req.body);
      res.json(integration);
    } catch (err) {
      logger.error(err);
      errors.respondWithError(res, err);
    }
  }

  async function removeWebsiteIntegration(req, res) {
    try {
      const app = new App({id: req.params.app});
      await integrationService.removeWebsiteIntegration(app);
      res.json({});
    } catch (err) {
      logger.error(err);
      errors.respondWithError(res, err);
    }
  }

  async function initWordPressIntegration(req, res) {
    try {
      const app = await appService.getAppByToken(req.body.app_token);
      let integration = await integrationService.getIntegration(app, constants.integration.channels.WORDPRESS, {require: false});
      integration = integration || (await integrationService.addWordPressIntegration(app));
      const appJSON = app.toJSON();
      delete appJSON.integrations;
      res.json({app: appJSON, integration});
    } catch (err) {
      logger.error(err);
      errors.respondWithError(res, err);
    }
  }

  async function updateWordPressIntegration(req, res) {
    try {
      const app = new App({id: req.params.app});
      const integration = await integrationService.updateWordPressIntegration(app, req.body);
      res.json(integration);
    } catch (err) {
      logger.error(err);
      errors.respondWithError(res, err);
    }
  }

  async function removeWordPressIntegration(req, res) {
    try {
      const app = new App({id: req.params.app});
      await integrationService.removeWordPressIntegration(app);
      res.json({});
    } catch (err) {
      logger.error(err);
      errors.respondWithError(res, err);
    }
  }

  async function initAndroidIntegration(req, res) {
    try {
      const app = await appService.getAppByToken(req.body.app_token);
      let integration = await integrationService.getIntegration(app, constants.integration.channels.ANDROID, {require: false});
      integration = integration || (await integrationService.addAndroidIntegration(app));
      const appJSON = app.toJSON();
      delete appJSON.integrations;
      res.json({app: appJSON, integration});
    } catch (err) {
      logger.error(err);
      errors.respondWithError(res, err);
    }
  }

  async function updateAndroidIntegration(req, res) {
    try {
      const app = new App({id: req.params.app});
      const integration = await integrationService.updateAndroidIntegration(app, req.body);
      res.json(integration);
    } catch (err) {
      logger.error(err);
      errors.respondWithError(res, err);
    }
  }

  async function removeAndroidIntegration(req, res) {
    try {
      const app = new App({id: req.params.app});
      await integrationService.removeAndroidIntegration(app);
      res.json({});
    } catch (err) {
      logger.error(err);
      errors.respondWithError(res, err);
    }
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
    try {
      const app = new App({id: req.params.app});
      const integration = await integrationService.updateMessengerIntegration(app, req.body.page);
      res.json(integration);
    } catch (err) {
      logger.error(err);
      errors.respondWithError(res, err);
    }
  }

  async function removeMessengerIntegration(req, res) {
    try {
      const app = new App({id: req.params.app});
      await integrationService.removeMessengerIntegration(app);
      res.json({});
    } catch (err) {
      logger.error(err);
      errors.respondWithError(res, err);
    }
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
    try {
      const app = new App({id: req.params.app});
      const integration = await integrationService.updateSlackIntegration(app, req.body.channel);
      res.json(integration);
    } catch (err) {
      logger.error(err);
      errors.respondWithError(res, err);
    }
  }

  async function removeSlackIntegration(req, res) {
    try {
      const app = new App({id: req.params.app});
      await integrationService.removeSlackIntegration(app);
      res.json({});
    } catch (err) {
      logger.error(err);
      errors.respondWithError(res, err);
    }
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
