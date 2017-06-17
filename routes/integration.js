'use strict';

let integrationService = require('../services/integration'),
    isAccountAuthenticated = require('../utils/middlewares').isAccountAuthenticated,
    logger = require('../utils/logger'),
    errors = require('../utils/errors');

module.exports = function(router, app) {

  let addWebsite = function(req, res, next) {
    res.json();
  };

  let updateWebsite = function(req, res, next) {
    let project = {_id: req.body.project};
    integrationService.updateWebsite(project, req.body.configuration).then(function(project) {
      res.json(project);
    }).catch(function(err) {
      logger.error(err);
      errors.respondWithError(res, err);
    });
  };

  let addAndroid = function(req, res, next) {
    let project = {_id: req.body.project};
    integrationService.addAndroid(project, req.body.configuration).then(function(project) {
      res.json(project);
    }).catch(function(err) {
      logger.error(err);
      errors.respondWithError(res, err);
    });
  };

  let updateAndroid = function(req, res, next) {
    let project = {_id: req.body.project};
    integrationService.updateAndroid(project, req.body.configuration).then(function(project) {
      res.json(project);
    }).catch(function(err) {
      logger.error(err);
      errors.respondWithError(res, err);
    });
  };

  let addIOS = function(req, res, next) {
    res.json();
  };

  let updateIOS = function(req, res, next) {
    let project = {_id: req.body.project};
    integrationService.updateIOS(project, req.body.configuration).then(function(project) {
      res.json(project);
    }).catch(function(err) {
      logger.error(err);
      errors.respondWithError(res, err);
    });
  };

  let addSlack = function(req, res, next) {
    res.json();
  };

  let updateSlack = function(req, res, next) {
    let project = {_id: req.body.project};
    integrationService.updateSlack(project, req.body.configuration).then(function(project) {
      res.json(project);
    }).catch(function(err) {
      logger.error(err);
      errors.respondWithError(res, err);
    });
  };

  router.post('/website', isAccountAuthenticated, addWebsite);
  router.put('/website', isAccountAuthenticated, updateWebsite);
  router.post('/android', isAccountAuthenticated, addAndroid);
  router.put('/android', isAccountAuthenticated, updateAndroid);
  router.post('/ios', isAccountAuthenticated, addIOS);
  router.put('/ios', isAccountAuthenticated, updateIOS);
  router.post('/slack', isAccountAuthenticated, addSlack);
  router.put('/slack', isAccountAuthenticated, updateSlack);

  app.use('/integrations', router);

};