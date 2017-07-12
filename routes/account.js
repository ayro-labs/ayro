const accountService = require('../services/account');
const logger = require('../utils/logger');
const errors = require('../utils/errors');

module.exports = (router, app) => {

  const createAccount = (req, res) => {
    accountService.createAccount(req.body.first_name, req.body.last_name, req.body.email, req.body.password).then((account) => {
      res.json(account);
    }).catch((err) => {
      logger.error(err);
      errors.respondWithError(res, err);
    });
  };

  router.post('/', createAccount);

  app.use('/accounts', router);

};
