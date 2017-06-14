'use strict';

let isAccountAuthenticated = require('../utils/middlewares').isAccountAuthenticated,
    projectService         = require('../services/project'),
    logger                 = require('../utils/logger');

module.exports = function(router, app) {

  let createProject = function(req, res, next) {
    projectService.createProject(req.account, req.body.name).then(function(project) {
      res.json(project);
    }).catch(function(err) {
      logger.error(err);
      errors.respondWithError(res, err);
    });
  };

  router.post('/', isAccountAuthenticated, createProject);

  app.use('/projects', router);

};