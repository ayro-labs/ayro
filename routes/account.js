const accountService = require('../services/account');
const settings = require('../configs/settings');
const errors = require('../utils/errors');
const {isAccountAuthenticated} = require('../utils/middlewares');
const {logger} = require('@ayro/commons');
const Promise = require('bluebird');
const multer = require('multer');

const upload = multer({dest: settings.accountLogoPath});

module.exports = (router, app) => {

  function createAccount(req, res) {
    Promise.coroutine(function* () {
      try {
        const account = yield accountService.createAccount(req.body.name, req.body.email, req.body.password);
        res.json(account);
      } catch (err) {
        logger.error(err);
        errors.respondWithError(res, err);
      }
    })();
  }

  function updateAccount(req, res) {
    Promise.coroutine(function* () {
      try {
        const account = yield accountService.updateAccount(req.account, req.body);
        res.json(account);
      } catch (err) {
        logger.error(err);
        errors.respondWithError(res, err);
      }
    })();
  }

  function updateLogo(req, res) {
    Promise.coroutine(function* () {
      try {
        const account = yield accountService.updateLogo(req.account, req.file);
        res.json(account);
      } catch (err) {
        logger.error(err);
        errors.respondWithError(res, err);
      }
    })();
  }

  function getAuthenticatedAccount(req, res) {
    Promise.coroutine(function* () {
      try {
        if (req.account) {
          const account = yield accountService.getAccount(req.account.id);
          res.json(account);
        } else {
          res.json(null);
        }
      } catch (err) {
        logger.error(err);
        errors.respondWithError(res, err);
      }
    })();
  }

  router.post('/', createAccount);
  router.put('/', isAccountAuthenticated, updateAccount);
  router.put('/logo', [isAccountAuthenticated, upload.single('logo')], updateLogo);
  router.get('/authenticated', getAuthenticatedAccount);

  app.use('/accounts', router);

};
