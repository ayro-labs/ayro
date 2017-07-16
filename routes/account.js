const accountService = require('../services/account');
const isAccountAuthenticated = require('../utils/middlewares').isAccountAuthenticated;
const logger = require('../utils/logger');
const errors = require('../utils/errors');

module.exports = (router, app) => {

  function createAccount(req, res) {
    accountService.createAccount(req.body.name, req.body.email, req.body.password).then((account) => {
      res.json(account);
    }).catch((err) => {
      logger.error(err);
      errors.respondWithError(res, err);
    });
  }

  function getAuthenticatedAccount(req, res) {
    accountService.getAccount(req.account.id).then((account) => {
      res.json(account);
    }).catch((err) => {
      logger.error(err);
      errors.respondWithError(res, err);
    });
  }

  router.post('/', createAccount);
  router.get('/authenticated', isAccountAuthenticated, getAuthenticatedAccount);

  app.use('/accounts', router);

};
