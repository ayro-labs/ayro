const accountService = require('../services/account');
const settings = require('../configs/settings');
const logger = require('../utils/logger');
const errors = require('../utils/errors');
const isAccountAuthenticated = require('../utils/middlewares').isAccountAuthenticated;
const multer = require('multer');

const upload = multer({dest: settings.accountLogoPath});

module.exports = (router, app) => {

  function createAccount(req, res) {
    accountService.createAccount(req.body.name, req.body.email, req.body.password).then((account) => {
      res.json(account);
    }).catch((err) => {
      logger.error(err);
      errors.respondWithError(res, err);
    });
  }

  function updateAccount(req, res) {
    accountService.updateAccount(req.account, req.body).then((account) => {
      res.json(account);
    }).catch((err) => {
      logger.error(err);
      errors.respondWithError(res, err);
    });
  }

  function updateAccountLogo(req, res) {
    accountService.updateAccountLogo(req.account, req.file).then((account) => {
      res.json(account);
    }).catch((err) => {
      logger.error(err);
      errors.respondWithError(res, err);
    });
  }

  function getAuthenticatedAccount(req, res) {
    if (req.account) {
      accountService.getAccount(req.account.id).then((account) => {
        res.json(account);
      }).catch((err) => {
        logger.error(err);
        errors.respondWithError(res, err);
      });
    } else {
      res.json(null);
    }
  }

  router.post('/', createAccount);
  router.put('/', isAccountAuthenticated, updateAccount);
  router.put('/logo', [isAccountAuthenticated, upload.single('logo')], updateAccountLogo);
  router.get('/authenticated', getAuthenticatedAccount);

  app.use('/accounts', router);

};
