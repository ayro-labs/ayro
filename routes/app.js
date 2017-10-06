const App = require('../models').App;
const appService = require('../services/app');
const integrationService = require('../services/integration');
const settings = require('../configs/settings');
const constants = require('../utils/constants');
const logger = require('../utils/logger');
const errors = require('../utils/errors');
const isAccountAuthenticated = require('../utils/middlewares').isAccountAuthenticated;
const multer = require('multer');

const upload = multer({dest: settings.appIconPath});

module.exports = (router, app) => {

  function listApps(req, res) {
    appService.listApps(req.account, req.query.integrations ? Boolean(req.query.integrations) : false).then((apps) => {
      res.json(apps);
    }).catch((err) => {
      logger.error(err);
      errors.respondWithError(res, err);
    });
  }

  function getApp(req, res) {
    appService.getApp(req.account, req.params.app, req.query.integrations ? Boolean(req.query.integrations) : false).then((app) => {
      res.json(app);
    }).catch((err) => {
      logger.error(err);
      errors.respondWithError(res, err);
    });
  }

  function createApp(req, res) {
    appService.createApp(req.account, req.body.name).then((app) => {
      res.json(app);
    }).catch((err) => {
      logger.error(err);
      errors.respondWithError(res, err);
    });
  }

  function updateApp(req, res) {
    const app = new App({id: req.params.app});
    appService.updateApp(req.account, app, req.body.name).then((app) => {
      res.json(app);
    }).catch((err) => {
      logger.error(err);
      errors.respondWithError(res, err);
    });
  }

  function updateAppIcon(req, res) {
    const app = new App({id: req.params.app});
    appService.updateAppIcon(req.account, app, req.file).then((app) => {
      res.json(app);
    }).catch((err) => {
      logger.error(err);
      errors.respondWithError(res, err);
    });
  }

  function deleteApp(req, res) {
    const app = new App({id: req.params.app});
    appService.deleteApp(req.account, app).then(() => {
      res.json({});
    }).catch((err) => {
      logger.error(err);
      errors.respondWithError(res, err);
    });
  }

  function getIntegration(req, res) {
    const app = new App({id: req.params.app});
    integrationService.getIntegration(app, req.params.channel).then((integration) => {
      res.json(integration);
    }).catch((err) => {
      logger.error(err);
      errors.respondWithError(res, err);
    });
  }

  function initWebsiteIntegration(req, res) {
    appService.getAppByToken(req.body.app_token).bind({}).then((app) => {
      this.app = app;
      return integrationService.getIntegration(app, constants.integration.channels.WEBSITE, {require: false});
    }).then((integration) => {
      return integration || integrationService.addWebsiteIntegration(this.app);
    }).then((integration) => {
      res.json({app: this.app, integration});
    }).catch((err) => {
      logger.error(err);
      errors.respondWithError(res, err);
    });
  }

  function updateWebsiteIntegration(req, res) {
    const app = new App({id: req.params.app});
    integrationService.updateWebsiteIntegration(app, req.body).then((integration) => {
      res.json(integration);
    }).catch((err) => {
      logger.error(err);
      errors.respondWithError(res, err);
    });
  }

  function removeWebsiteIntegration(req, res) {
    const app = new App({id: req.params.app});
    integrationService.removeWebsiteIntegration(app).then(() => {
      res.json({});
    }).catch((err) => {
      logger.error(err);
      errors.respondWithError(res, err);
    });
  }

  function initAndroidIntegration(req, res) {
    appService.getAppByToken(req.body.app_token).bind({}).then((app) => {
      this.app = app;
      return integrationService.getIntegration(app, constants.integration.channels.ANDROID, {require: false});
    }).then((integration) => {
      return integration || integrationService.addAndroidIntegration(this.app);
    }).then((integration) => {
      res.json({app: this.app, integration});
    }).catch((err) => {
      logger.error(err);
      errors.respondWithError(res, err);
    });
  }

  function updateAndroidIntegration(req, res) {
    const app = new App({id: req.params.app});
    integrationService.updateAndroidIntegration(app, req.body).then((integration) => {
      res.json(integration);
    }).catch((err) => {
      logger.error(err);
      errors.respondWithError(res, err);
    });
  }

  function removeAndroidIntegration(req, res) {
    const app = new App({id: req.params.app});
    integrationService.removeAndroidIntegration(app).then(() => {
      res.json({});
    }).catch((err) => {
      logger.error(err);
      errors.respondWithError(res, err);
    });
  }

  function addMessengerIntegration(req, res) {
    const app = new App({id: req.params.app});
    integrationService.addMessengerIntegration(app, req.body.profile).then((integration) => {
      res.json(integration);
    }).catch((err) => {
      logger.error(err);
      errors.respondWithError(res, err);
    });
  }

  function updateMessengerIntegration(req, res) {
    const app = new App({id: req.params.app});
    integrationService.updateMessengerIntegration(app, req.body.page).then((integration) => {
      res.json(integration);
    }).catch((err) => {
      logger.error(err);
      errors.respondWithError(res, err);
    });
  }

  function removeMessengerIntegration(req, res) {
    const app = new App({id: req.params.app});
    integrationService.removeMessengerIntegration(app).then(() => {
      res.json({});
    }).catch((err) => {
      logger.error(err);
      errors.respondWithError(res, err);
    });
  }

  function listMessengerPages(req, res) {
    const app = new App({id: req.params.app});
    integrationService.listMessengerPages(app).then((pages) => {
      res.json(pages);
    }).catch((err) => {
      logger.error(err);
      errors.respondWithError(res, err);
    });
  }

  function addSlackIntegration(req, res) {
    const app = new App({id: req.params.app});
    integrationService.addSlackIntegration(app, req.body.access_token).then((integration) => {
      res.json(integration);
    }).catch((err) => {
      logger.error(err);
      errors.respondWithError(res, err);
    });
  }

  function updateSlackIntegration(req, res) {
    const app = new App({id: req.params.app});
    integrationService.updateSlackIntegration(app, req.body).then((integration) => {
      res.json(integration);
    }).catch((err) => {
      logger.error(err);
      errors.respondWithError(res, err);
    });
  }

  function removeSlackIntegration(req, res) {
    const app = new App({id: req.params.app});
    integrationService.removeSlackIntegration(app).then(() => {
      res.json({});
    }).catch((err) => {
      logger.error(err);
      errors.respondWithError(res, err);
    });
  }

  function listSlackChannels(req, res) {
    const app = new App({id: req.params.app});
    integrationService.listSlackChannels(app).then((channels) => {
      res.json(channels);
    }).catch((err) => {
      logger.error(err);
      errors.respondWithError(res, err);
    });
  }

  function createSlackChannel(req, res) {
    const app = new App({id: req.params.app});
    integrationService.createSlackChannel(app, req.body.channel).then((channel) => {
      res.json(channel);
    }).catch((err) => {
      logger.error(err);
      errors.respondWithError(res, err);
    });
  }

  router.get('/', isAccountAuthenticated, listApps);
  router.get('/:app', isAccountAuthenticated, getApp);
  router.post('/', isAccountAuthenticated, createApp);
  router.put('/:app', isAccountAuthenticated, updateApp);
  router.put('/:app/icon', [isAccountAuthenticated, upload.single('icon')], updateAppIcon);
  router.delete('/:app', isAccountAuthenticated, deleteApp);

  router.get('/:app/integrations/:channel', getIntegration);

  router.post('/integrations/website/init', initWebsiteIntegration);
  router.put('/:app/integrations/website', isAccountAuthenticated, updateWebsiteIntegration);
  router.delete('/:app/integrations/website', isAccountAuthenticated, removeWebsiteIntegration);

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
