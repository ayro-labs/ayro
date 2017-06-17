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

  router.post('/', isAccountAuthenticated, createProject);
  router.get('/', isAccountAuthenticated, listProjects);

  app.use('/projects', router);

};