'use strict';

let accountService = require('../services/account'),
    logger         = require('../utils/logger'),
    errors         = require('../utils/errors');

module.exports = function(router, app) {

  let createAccount = function(req, res, next) {
    accountService.createAccount(req.body.first_name, req.body.last_name, req.body.email, req.body.password).then(function(account) {
      res.json(account);
    }).catch(function(err) {
      logger.error(err);
      errors.respondWithError(res, err);
    });
  };

  router.post('/', createAccount);

  app.use('/accounts', router);

};