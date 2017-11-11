const {App} = require('../models');
const appService = require('../services/app');
const integrationService = require('../services/integration');
const settings = require('../configs/settings');
const constants = require('../utils/constants');
const logger = require('../utils/logger');
const errors = require('../utils/errors');
const {isAccountAuthenticated} = require('../utils/middlewares');
const Promise = require('bluebird');
const multer = require('multer');

const upload = multer({dest: settings.appIconPath});

module.exports = (router, app) => {

  function listApps(req, res) {
    Promise.coroutine(function* () {
      try {
        const apps = yield appService.listApps(req.account, req.query.integrations === 'true');
        res.json(apps);
      } catch (err) {
        logger.error(err);
        errors.respondWithError(res, err);
      }
    })();
  }

  function getApp(req, res) {
    Promise.coroutine(function* () {
      try {
        const app = yield appService.getApp(req.account, req.params.app, req.query.integrations === 'true');
        res.json(app);
      } catch (err) {
        logger.error(err);
        errors.respondWithError(res, err);
      }
    })();
  }

  function createApp(req, res) {
    Promise.coroutine(function* () {
      try {
        const app = yield appService.createApp(req.account, req.body.name);
        res.json(app);
      } catch (err) {
        logger.error(err);
        errors.respondWithError(res, err);
      }
    })();
  }

  function updateApp(req, res) {
    Promise.coroutine(function* () {
      try {
        let app = new App({id: req.params.app});
        app = yield appService.updateApp(req.account, app, req.body.name);
        res.json(app);
      } catch (err) {
        logger.error(err);
        errors.respondWithError(res, err);
      }
    })();
  }

  function updateIcon(req, res) {
    Promise.coroutine(function* () {
      try {
        let app = new App({id: req.params.app});
        app = yield appService.updateIcon(req.account, app, req.file);
        res.json(app);
      } catch (err) {
        logger.error(err);
        errors.respondWithError(res, err);
      }
    })();
  }

  function deleteApp(req, res) {
    Promise.coroutine(function* () {
      try {
        const app = new App({id: req.params.app});
        yield appService.deleteApp(req.account, app);
        res.json({});
      } catch (err) {
        logger.error(err);
        errors.respondWithError(res, err);
      }
    })();
  }

  function getIntegration(req, res) {
    Promise.coroutine(function* () {
      try {
        const app = new App({id: req.params.app});
        const integration = yield integrationService.getIntegration(app, req.params.channel, {require: req.query.require ? req.query.require === 'true' : null});
        res.json(integration);
      } catch (err) {
        logger.error(err);
        errors.respondWithError(res, err);
      }
    })();
  }

  function initWebsiteIntegration(req, res) {
    Promise.coroutine(function* () {
      try {
        const app = yield appService.getAppByToken(req.body.app_token);
        let integration = yield integrationService.getIntegration(app, constants.integration.channels.WEBSITE, {require: false});
        integration = integration || (yield integrationService.addWebsiteIntegration(app));
        const appJSON = app.toJSON();
        delete appJSON.integrations;
        res.json({app: appJSON, integration});
      } catch (err) {
        logger.error(err);
        errors.respondWithError(res, err);
      }
    })();
  }

  function updateWebsiteIntegration(req, res) {
    Promise.coroutine(function* () {
      try {
        const app = new App({id: req.params.app});
        const integration = yield integrationService.updateWebsiteIntegration(app, req.body);
        res.json(integration);
      } catch (err) {
        logger.error(err);
        errors.respondWithError(res, err);
      }
    })();
  }

  function removeWebsiteIntegration(req, res) {
    Promise.coroutine(function* () {
      try {
        const app = new App({id: req.params.app});
        yield integrationService.removeWebsiteIntegration(app);
        res.json({});
      } catch (err) {
        logger.error(err);
        errors.respondWithError(res, err);
      }
    })();
  }

  function initAndroidIntegration(req, res) {
    Promise.coroutine(function* () {
      try {
        const app = yield appService.getAppByToken(req.body.app_token);
        let integration = yield integrationService.getIntegration(app, constants.integration.channels.ANDROID, {require: false});
        integration = integration || (yield integrationService.addAndroidIntegration(app));
        const appJSON = app.toJSON();
        delete appJSON.integrations;
        res.json({app: appJSON, integration});
      } catch (err) {
        logger.error(err);
        errors.respondWithError(res, err);
      }
    })();
  }

  function updateAndroidIntegration(req, res) {
    Promise.coroutine(function* () {
      try {
        const app = new App({id: req.params.app});
        const integration = yield integrationService.updateAndroidIntegration(app, req.body);
        res.json(integration);
      } catch (err) {
        logger.error(err);
        errors.respondWithError(res, err);
      }
    })();
  }

  function removeAndroidIntegration(req, res) {
    Promise.coroutine(function* () {
      try {
        const app = new App({id: req.params.app});
        yield integrationService.removeAndroidIntegration(app);
        res.json({});
      } catch (err) {
        logger.error(err);
        errors.respondWithError(res, err);
      }
    })();
  }

  function addMessengerIntegration(req, res) {
    Promise.coroutine(function* () {
      try {
        const app = new App({id: req.params.app});
        const integration = yield integrationService.addMessengerIntegration(app, req.body.profile);
        res.json(integration);
      } catch (err) {
        logger.error(err);
        errors.respondWithError(res, err);
      }
    })();
  }

  function updateMessengerIntegration(req, res) {
    Promise.coroutine(function* () {
      try {
        const app = new App({id: req.params.app});
        const integration = yield integrationService.updateMessengerIntegration(app, req.body.page);
        res.json(integration);
      } catch (err) {
        logger.error(err);
        errors.respondWithError(res, err);
      }
    })();
  }

  function removeMessengerIntegration(req, res) {
    Promise.coroutine(function* () {
      try {
        const app = new App({id: req.params.app});
        yield integrationService.removeMessengerIntegration(app);
        res.json({});
      } catch (err) {
        logger.error(err);
        errors.respondWithError(res, err);
      }
    })();
  }

  function listMessengerPages(req, res) {
    Promise.coroutine(function* () {
      try {
        const app = new App({id: req.params.app});
        const pages = yield integrationService.listMessengerPages(app);
        res.json(pages);
      } catch (err) {
        logger.error(err);
        errors.respondWithError(res, err);
      }
    })();
  }

  function addSlackIntegration(req, res) {
    Promise.coroutine(function* () {
      try {
        const app = new App({id: req.params.app});
        const integration = yield integrationService.addSlackIntegration(app, req.body.access_token);
        res.json(integration);
      } catch (err) {
        logger.error(err);
        errors.respondWithError(res, err);
      }
    })();
  }

  function updateSlackIntegration(req, res) {
    Promise.coroutine(function* () {
      try {
        const app = new App({id: req.params.app});
        const integration = yield integrationService.updateSlackIntegration(app, req.body.channel);
        res.json(integration);
      } catch (err) {
        logger.error(err);
        errors.respondWithError(res, err);
      }
    })();
  }

  function removeSlackIntegration(req, res) {
    Promise.coroutine(function* () {
      try {
        const app = new App({id: req.params.app});
        yield integrationService.removeSlackIntegration(app);
        res.json({});
      } catch (err) {
        logger.error(err);
        errors.respondWithError(res, err);
      }
    })();
  }

  function listSlackChannels(req, res) {
    Promise.coroutine(function* () {
      try {
        const app = new App({id: req.params.app});
        const channels = yield integrationService.listSlackChannels(app);
        res.json(channels);
      } catch (err) {
        logger.error(err);
        errors.respondWithError(res, err);
      }
    })();
  }

  function createSlackChannel(req, res) {
    Promise.coroutine(function* () {
      try {
        const app = new App({id: req.params.app});
        const channel = yield integrationService.createSlackChannel(app, req.body.channel);
        res.json(channel);
      } catch (err) {
        logger.error(err);
        errors.respondWithError(res, err);
      }
    })();
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
