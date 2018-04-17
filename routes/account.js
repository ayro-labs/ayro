const accountService = require('../services/account');
const settings = require('../configs/settings');
const errors = require('../utils/errors');
const {isAccountAuthenticated} = require('../utils/middlewares');
const {logger} = require('@ayro/commons');
const multer = require('multer');

const upload = multer({dest: settings.accountLogoPath});

module.exports = (router, app) => {

  async function createAccount(req, res) {
    try {
      const account = await accountService.createAccount(req.body.name, req.body.email, req.body.password);
      res.json(account);
    } catch (err) {
      logger.error(err);
      errors.respondWithError(res, err);
    }
  }

  async function updateAccount(req, res) {
    try {
      const account = await accountService.updateAccount(req.account, req.body);
      res.json(account);
    } catch (err) {
      logger.error(err);
      errors.respondWithError(res, err);
    }
  }

  async function updateLogo(req, res) {
    try {
      const account = await accountService.updateLogo(req.account, req.file);
      res.json(account);
    } catch (err) {
      logger.error(err);
      errors.respondWithError(res, err);
    }
  }

  async function getAuthenticatedAccount(req, res) {
    try {
      if (req.account) {
        const account = await accountService.getAccount(req.account.id);
        res.json(account);
      } else {
        res.json(null);
      }
    } catch (err) {
      logger.error(err);
      errors.respondWithError(res, err);
    }
  }

  router.post('/', createAccount);
  router.put('/', isAccountAuthenticated, updateAccount);
  router.put('/logo', [isAccountAuthenticated, upload.single('logo')], updateLogo);
  router.get('/authenticated', getAuthenticatedAccount);

  app.use('/accounts', router);

};
