'use strict';

const accountService = require('../services/account');
const settings = require('../configs/settings');
const session = require('../utils/session');
const errors = require('../utils/errors');
const {isAccountAuthenticated, decodeToken} = require('../utils/middlewares');
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
      await decodeToken(req);
      if (req.account) {
        const account = await accountService.getAccount(req.account.id);
        res.json(account);
      } else {
        res.json(null);
      }
    } catch (err) {
      if (err.code === 'token_expired') {
        res.json(null);
        return;
      }
      logger.error(err);
      errors.respondWithError(res, err);
    }
  }

  async function login(req, res) {
    try {
      const account = await accountService.authenticate(req.body.email, req.body.password);
      const token = await session.createAccountToken(account);
      res.json({token, account});
    } catch (err) {
      logger.error(err);
      errors.respondWithError(res, err);
    }
  }

  async function logout(req, res) {
    try {
      if (req.token) {
        await session.destroyToken(req.token);
      }
      res.json({});
    } catch (err) {
      logger.error(err);
      errors.respondWithError(res, err);
    }
  }

  router.post('/', createAccount);
  router.put('/', isAccountAuthenticated, updateAccount);
  router.put('/logo', [isAccountAuthenticated, upload.single('logo')], updateLogo);
  router.get('/authenticated', getAuthenticatedAccount);
  router.post('/login', login);
  router.post('/logout', logout);

  app.use('/accounts', router);

};
