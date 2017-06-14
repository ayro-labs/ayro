'use strict';

let accountService  = require('../services/account'),
    projectService  = require('../services/project'),
    customerService = require('../services/customer'),
    logger          = require('../utils/logger'),
    errors          = require('../utils/errors'),
    _               = require('lodash');

module.exports = function(router, app) {

  let createSession = function(req, data) {
    return new Promise(function(resolve, reject) {
      _.assign(req.session, data);
      req.session.create(null, function(err, token) {
        if (err) {
          reject(err);
        } else {
          resolve(token);
        }
      });
    });
  };

  let authenticateAccount = function(req, res, next) {
    accountService.authenticate(req.body.email, req.body.password).then(function(account) {
      return createSession(req, {account: account.toJSON()});
    }).then(function(token) {
      res.json(token);
    }).catch(function(err) {
      logger.error(err);
      errors.respondWithError(res, err);
    });
  };

  let authenticateCustomer = function(req, res, next) {
    projectService.getProjectByToken(req.body.project_token).bind({}).then(function(project) {
      customerService.assignCustomerUid(req.body.user, req.body.device);
      return customerService.saveCustomer(project, req.body.user);
    }).then(function(customer) {
      this.customer = customer;
      return customerService.saveDevice(customer, req.body.device);
    }).then(function(device) {
      return createSession(req, {customer: this.customer.toJSON()});
    }).then(function(token) {
      res.json(token);
    }).catch(function(err) {
      logger.error(err);
      errors.respondWithError(res, err);
    });
  };

  router.post('/accounts', authenticateAccount);
  router.post('/customers', authenticateCustomer);

  app.use('/auth', router);

};