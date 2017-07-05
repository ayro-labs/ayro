'use strict';

let appService = require('../services/app'),
    isAccountAuthenticated = require('../utils/middlewares').isAccountAuthenticated,
    logger = require('../utils/logger'),
    errors = require('../utils/errors');

module.exports = function(router, app) {

  let createApp = function(req, res, next) {
    appService.createApp(req.account, req.body.name).then(function(app) {
      res.json(app);
    }).catch(function(err) {
      logger.error(err);
      errors.respondWithError(res, err);
    });
  };

  let listApps = function(req, res, next) {
    appService.listApps(req.account).then(function(apps) {
      res.json(apps);
    }).catch(function(err) {
      logger.error(err);
      errors.respondWithError(res, err);
    });
  };

  let addWebsite = function(req, res, next) {
    let app = {_id: req.params.app};
    appService.addWebsite(app, req.body).then(function(app) {
      res.json(app);
    }).catch(function(err) {
      logger.error(err);
      errors.respondWithError(res, err);
    });
  };

  let updateWebsite = function(req, res, next) {
    let app = {_id: req.params.app};
    appService.updateWebsite(app, req.body).then(function(app) {
      res.json(app);
    }).catch(function(err) {
      logger.error(err);
      errors.respondWithError(res, err);
    });
  };

  let removeWebsite = function(req, res, next) {
    let app = {_id: req.params.app};
    appService.removeWebsite(app).then(function(app) {
      res.json(app);
    }).catch(function(err) {
      logger.error(err);
      errors.respondWithError(res, err);
    });
  };

  let addAndroid = function(req, res, next) {
    let app = {_id: req.params.app};
    appService.addAndroid(app, req.body).then(function(app) {
      res.json(app);
    }).catch(function(err) {
      logger.error(err);
      errors.respondWithError(res, err);
    });
  };

  let updateAndroid = function(req, res, next) {
    let app = {_id: req.params.app};
    appService.updateAndroid(app, req.body).then(function(app) {
      res.json(app);
    }).catch(function(err) {
      logger.error(err);
      errors.respondWithError(res, err);
    });
  };

  let removeAndroid = function(req, res, next) {
    let app = {_id: req.params.app};
    appService.removeAndroid(app).then(function(app) {
      res.json(app);
    }).catch(function(err) {
      logger.error(err);
      errors.respondWithError(res, err);
    });
  };

  let addIOS = function(req, res, next) {
    let app = {_id: req.params.app};
    appService.addIOS(app, req.body).then(function(app) {
      res.json(app);
    }).catch(function(err) {
      logger.error(err);
      errors.respondWithError(res, err);
    });
  };

  let updateIOS = function(req, res, next) {
    let app = {_id: req.params.app};
    appService.updateIOS(app, req.body).then(function(app) {
      res.json(app);
    }).catch(function(err) {
      logger.error(err);
      errors.respondWithError(res, err);
    });
  };

  let removeIOS = function(req, res, next) {
    let app = {_id: req.params.app};
    appService.removeIOS(app).then(function(app) {
      res.json(app);
    }).catch(function(err) {
      logger.error(err);
      errors.respondWithError(res, err);
    });
  };

  let addSlack = function(req, res, next) {
    let app = {_id: req.params.app};
    appService.addSlack(app, req.body.api_token).then(function(app) {
      res.json(app);
    }).catch(function(err) {
      logger.error(err);
      errors.respondWithError(res, err);
    });
  };

  let updateSlack = function(req, res, next) {
    let app = {_id: req.params.app};
    appService.updateSlack(app, req.body).then(function(app) {
      res.json(app);
    }).catch(function(err) {
      logger.error(err);
      errors.respondWithError(res, err);
    });
  };

  let removeSlack = function(req, res, next) {
    let app = {_id: req.params.app};
    appService.removeSlack(app).then(function(app) {
      res.json(app);
    }).catch(function(err) {
      logger.error(err);
      errors.respondWithError(res, err);
    });
  };

  let listSlackChannels = function(req, res, next) {
    let app = {_id: req.params.app};
    appService.listSlackChannels(app).then(function(app) {
      res.json(app);
    }).catch(function(err) {
      logger.error(err);
      errors.respondWithError(res, err);
    });
  };

  let createSlackChannel = function(req, res, next) {
    let app = {_id: req.params.app};
    appService.createSlackChannel(app, req.body.channel).then(function(app) {
      res.json(app);
    }).catch(function(err) {
      logger.error(err);
      errors.respondWithError(res, err);
    });
  };

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