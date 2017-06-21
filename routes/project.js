'use strict';

let projectService = require('../services/project'),
    isAccountAuthenticated = require('../utils/middlewares').isAccountAuthenticated,
    logger = require('../utils/logger'),
    errors = require('../utils/errors');

module.exports = function(router, app) {

  let createProject = function(req, res, next) {
    projectService.createProject(req.account, req.body.name).then(function(project) {
      res.json(project);
    }).catch(function(err) {
      logger.error(err);
      errors.respondWithError(res, err);
    });
  };

  let listProjects = function(req, res, next) {
    projectService.listProjects(req.account).then(function(projects) {
      res.json(projects);
    }).catch(function(err) {
      logger.error(err);
      errors.respondWithError(res, err);
    });
  };

  let addWebsite = function(req, res, next) {
    let project = {_id: req.params.project};
    projectService.addWebsite(project, req.body).then(function(project) {
      res.json(project);
    }).catch(function(err) {
      logger.error(err);
      errors.respondWithError(res, err);
    });
  };

  let updateWebsite = function(req, res, next) {
    let project = {_id: req.params.project};
    projectService.updateWebsite(project, req.body).then(function(project) {
      res.json(project);
    }).catch(function(err) {
      logger.error(err);
      errors.respondWithError(res, err);
    });
  };

  let removeWebsite = function(req, res, next) {
    let project = {_id: req.params.project};
    projectService.removeWebsite(project).then(function(project) {
      res.json(project);
    }).catch(function(err) {
      logger.error(err);
      errors.respondWithError(res, err);
    });
  };

  let addAndroid = function(req, res, next) {
    let project = {_id: req.params.project};
    projectService.addAndroid(project, req.body).then(function(project) {
      res.json(project);
    }).catch(function(err) {
      logger.error(err);
      errors.respondWithError(res, err);
    });
  };

  let updateAndroid = function(req, res, next) {
    let project = {_id: req.params.project};
    projectService.updateAndroid(project, req.body).then(function(project) {
      res.json(project);
    }).catch(function(err) {
      logger.error(err);
      errors.respondWithError(res, err);
    });
  };

  let removeAndroid = function(req, res, next) {
    let project = {_id: req.params.project};
    projectService.removeAndroid(project).then(function(project) {
      res.json(project);
    }).catch(function(err) {
      logger.error(err);
      errors.respondWithError(res, err);
    });
  };

  let addIOS = function(req, res, next) {
    let project = {_id: req.params.project};
    projectService.addIOS(project, req.body).then(function(project) {
      res.json(project);
    }).catch(function(err) {
      logger.error(err);
      errors.respondWithError(res, err);
    });
  };

  let updateIOS = function(req, res, next) {
    let project = {_id: req.params.project};
    projectService.updateIOS(project, req.body).then(function(project) {
      res.json(project);
    }).catch(function(err) {
      logger.error(err);
      errors.respondWithError(res, err);
    });
  };

  let removeIOS = function(req, res, next) {
    let project = {_id: req.params.project};
    projectService.removeIOS(project).then(function(project) {
      res.json(project);
    }).catch(function(err) {
      logger.error(err);
      errors.respondWithError(res, err);
    });
  };

  let addSlack = function(req, res, next) {
    let project = {_id: req.params.project};
    projectService.addSlack(project, req.body.api_token).then(function(project) {
      res.json(project);
    }).catch(function(err) {
      logger.error(err);
      errors.respondWithError(res, err);
    });
  };

  let updateSlack = function(req, res, next) {
    let project = {_id: req.params.project};
    projectService.updateSlack(project, req.body).then(function(project) {
      res.json(project);
    }).catch(function(err) {
      logger.error(err);
      errors.respondWithError(res, err);
    });
  };

  let removeSlack = function(req, res, next) {
    let project = {_id: req.params.project};
    projectService.removeSlack(project).then(function(project) {
      res.json(project);
    }).catch(function(err) {
      logger.error(err);
      errors.respondWithError(res, err);
    });
  };

  let listSlackChannels = function(req, res, next) {
    let project = {_id: req.params.project};
    projectService.listSlackChannels(project).then(function(project) {
      res.json(project);
    }).catch(function(err) {
      logger.error(err);
      errors.respondWithError(res, err);
    });
  };

  let createSlackChannel = function(req, res, next) {
    let project = {_id: req.params.project};
    projectService.createSlackChannel(project, req.body.channel).then(function(project) {
      res.json(project);
    }).catch(function(err) {
      logger.error(err);
      errors.respondWithError(res, err);
    });
  };

  router.post('/', isAccountAuthenticated, createProject);
  router.get('/', isAccountAuthenticated, listProjects);

  router.post('/:project/integrations/website', isAccountAuthenticated, addWebsite);
  router.put('/:project/integrations/website', isAccountAuthenticated, updateWebsite);
  router.delete('/:project/integrations/website', isAccountAuthenticated, removeWebsite);

  router.post('/:project/integrations/android', isAccountAuthenticated, addAndroid);
  router.put('/:project/integrations/android', isAccountAuthenticated, updateAndroid);
  router.delete('/:project/integrations/android', isAccountAuthenticated, removeAndroid);

  router.post('/:project/integrations/ios', isAccountAuthenticated, addIOS);
  router.put('/:project/integrations/ios', isAccountAuthenticated, updateIOS);
  router.delete('/:project/integrations/ios', isAccountAuthenticated, removeIOS);

  router.post('/:project/integrations/slack', isAccountAuthenticated, addSlack);
  router.put('/:project/integrations/slack', isAccountAuthenticated, updateSlack);
  router.delete('/:project/integrations/slack', isAccountAuthenticated, removeSlack);
  router.get('/:project/integrations/slack/channels', isAccountAuthenticated, listSlackChannels);
  router.post('/:project/integrations/slack/channels', isAccountAuthenticated, createSlackChannel);

  app.use('/projects', router);

};