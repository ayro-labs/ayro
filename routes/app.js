const appService = require('../services/app');
const isAccountAuthenticated = require('../utils/middlewares').isAccountAuthenticated;
const logger = require('../utils/logger');
const errors = require('../utils/errors');

module.exports = (router, app) => {

  function createApp(req, res) {
    appService.createApp(req.account, req.body.name).then((app) => {
      res.json(app);
    }).catch((err) => {
      logger.error(err);
      errors.respondWithError(res, err);
    });
  }

  function listApps(req, res) {
    appService.listApps(req.account).then((apps) => {
      res.json(apps);
    }).catch((err) => {
      logger.error(err);
      errors.respondWithError(res, err);
    });
  }

  function addWebsite(req, res) {
    const app = {_id: req.params.app};
    appService.addWebsite(app, req.body).then((app) => {
      res.json(app);
    }).catch((err) => {
      logger.error(err);
      errors.respondWithError(res, err);
    });
  }

  function updateWebsite(req, res) {
    const app = {_id: req.params.app};
    appService.updateWebsite(app, req.body).then((app) => {
      res.json(app);
    }).catch((err) => {
      logger.error(err);
      errors.respondWithError(res, err);
    });
  }

  function removeWebsite(req, res) {
    const app = {_id: req.params.app};
    appService.removeWebsite(app).then((app) => {
      res.json(app);
    }).catch((err) => {
      logger.error(err);
      errors.respondWithError(res, err);
    });
  }

  function addAndroid(req, res) {
    const app = {_id: req.params.app};
    appService.addAndroid(app, req.body).then((app) => {
      res.json(app);
    }).catch((err) => {
      logger.error(err);
      errors.respondWithError(res, err);
    });
  }

  function updateAndroid(req, res) {
    const app = {_id: req.params.app};
    appService.updateAndroid(app, req.body).then((app) => {
      res.json(app);
    }).catch((err) => {
      logger.error(err);
      errors.respondWithError(res, err);
    });
  }

  function removeAndroid(req, res) {
    const app = {_id: req.params.app};
    appService.removeAndroid(app).then((app) => {
      res.json(app);
    }).catch((err) => {
      logger.error(err);
      errors.respondWithError(res, err);
    });
  }

  function addIOS(req, res) {
    const app = {_id: req.params.app};
    appService.addIOS(app, req.body).then((app) => {
      res.json(app);
    }).catch((err) => {
      logger.error(err);
      errors.respondWithError(res, err);
    });
  }

  function updateIOS(req, res) {
    const app = {_id: req.params.app};
    appService.updateIOS(app, req.body).then((app) => {
      res.json(app);
    }).catch((err) => {
      logger.error(err);
      errors.respondWithError(res, err);
    });
  }

  function removeIOS(req, res) {
    const app = {_id: req.params.app};
    appService.removeIOS(app).then((app) => {
      res.json(app);
    }).catch((err) => {
      logger.error(err);
      errors.respondWithError(res, err);
    });
  }

  function addSlack(req, res) {
    const app = {_id: req.params.app};
    appService.addSlack(app, req.body.api_token).then((app) => {
      res.json(app);
    }).catch((err) => {
      logger.error(err);
      errors.respondWithError(res, err);
    });
  }

  function updateSlack(req, res) {
    const app = {_id: req.params.app};
    appService.updateSlack(app, req.body).then((app) => {
      res.json(app);
    }).catch((err) => {
      logger.error(err);
      errors.respondWithError(res, err);
    });
  }

  function removeSlack(req, res) {
    const app = {_id: req.params.app};
    appService.removeSlack(app).then((app) => {
      res.json(app);
    }).catch((err) => {
      logger.error(err);
      errors.respondWithError(res, err);
    });
  }

  function listSlackChannels(req, res) {
    const app = {_id: req.params.app};
    appService.listSlackChannels(app).then((app) => {
      res.json(app);
    }).catch((err) => {
      logger.error(err);
      errors.respondWithError(res, err);
    });
  }

  function createSlackChannel(req, res) {
    const app = {_id: req.params.app};
    appService.createSlackChannel(app, req.body.channel).then((app) => {
      res.json(app);
    }).catch((err) => {
      logger.error(err);
      errors.respondWithError(res, err);
    });
  }

  router.post('/', isAccountAuthenticated, createApp);
  router.get('/', isAccountAuthenticated, listApps);

  router.post('/:app/integrations/website', isAccountAuthenticated, addWebsite);
  router.put('/:app/integrations/website', isAccountAuthenticated, updateWebsite);
  router.delete('/:app/integrations/website', isAccountAuthenticated, removeWebsite);

  router.post('/:app/integrations/android', isAccountAuthenticated, addAndroid);
  router.put('/:app/integrations/android', isAccountAuthenticated, updateAndroid);
  router.delete('/:app/integrations/android', isAccountAuthenticated, removeAndroid);

  router.post('/:app/integrations/ios', isAccountAuthenticated, addIOS);
  router.put('/:app/integrations/ios', isAccountAuthenticated, updateIOS);
  router.delete('/:app/integrations/ios', isAccountAuthenticated, removeIOS);

  router.post('/:app/integrations/slack', isAccountAuthenticated, addSlack);
  router.put('/:app/integrations/slack', isAccountAuthenticated, updateSlack);
  router.delete('/:app/integrations/slack', isAccountAuthenticated, removeSlack);
  router.get('/:app/integrations/slack/channels', isAccountAuthenticated, listSlackChannels);
  router.post('/:app/integrations/slack/channels', isAccountAuthenticated, createSlackChannel);

  app.use('/apps', router);

};
