const accountService = require('../services/account');
const appService = require('../services/app');
const userService = require('../services/user');
const deviceService = require('../services/device');
const errors = require('../utils/errors');
const {isAccountAuthenticated, isUserAuthenticated} = require('../utils/middlewares');
const {logger} = require('@ayro/commons');
const Promise = require('bluebird');
const _ = require('lodash');

module.exports = (router, app) => {

  async function createSession(req, data) {
    return new Promise((resolve, reject) => {
      _.assign(req.session, data);
      req.session.create(null, (err, token) => {
        if (err) {
          reject(err);
        } else {
          resolve(token);
        }
      });
    });
  }

  async function accountSignIn(req, res) {
    try {
      const account = await accountService.authenticate(req.body.email, req.body.password);
      const token = await createSession(req, {account: {id: account.id}});
      res.json({token, account});
    } catch (err) {
      logger.error(err);
      errors.respondWithError(res, err);
    }
  }

  function accountSignOut(req, res) {
    req.session.destroy((err) => {
      if (!err) {
        res.json({});
      } else {
        logger.error(err);
        errors.respondWithError(res, err);
      }
    });
  }

  async function userSignIn(req, res) {
    try {
      const app = await appService.getAppByToken(req.body.app_token);
      const user = await userService.saveUser(app, req.body.user);
      const device = await deviceService.saveDevice(user, req.body.device);
      const token = await createSession(req, {user: {id: user.id}, device: {id: device.id}});
      res.json({token, user});
    } catch (err) {
      logger.error(err);
      errors.respondWithError(res, err);
    }
  }

  function userSignOut(req, res) {
    req.session.destroy((err) => {
      if (!err) {
        res.json({});
      } else {
        logger.error(err);
        errors.respondWithError(res, err);
      }
    });
  }

  router.post('/accounts', accountSignIn);
  router.delete('/accounts', isAccountAuthenticated, accountSignOut);
  router.post('/users', userSignIn);
  router.delete('/users', isUserAuthenticated, userSignOut);

  app.use('/auth', router);

};
