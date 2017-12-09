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

  function createSession(req, data) {
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

  function accountSignIn(req, res) {
    Promise.coroutine(function* () {
      try {
        const account = yield accountService.authenticate(req.body.email, req.body.password);
        const token = yield createSession(req, {account: {id: account.id}});
        res.json({token, account});
      } catch (err) {
        logger.error(err);
        errors.respondWithError(res, err);
      }
    })();
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

  function userSignIn(req, res) {
    Promise.coroutine(function* () {
      try {
        const app = yield appService.getAppByToken(req.body.app_token);
        const user = yield userService.saveUser(app, req.body.user);
        const device = yield deviceService.saveDevice(user, req.body.device);
        const token = yield createSession(req, {user: {id: user.id}, device: {id: device.id}});
        res.json({token, user});
      } catch (err) {
        logger.error(err);
        errors.respondWithError(res, err);
      }
    })();
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
