const accountService = require('../services/account');
const appService = require('../services/app');
const userService = require('../services/user');
const logger = require('../utils/logger');
const errors = require('../utils/errors');
const isAccountAuthenticated = require('../utils/middlewares').isAccountAuthenticated;
const isUserAuthenticated = require('../utils/middlewares').isUserAuthenticated;
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
    accountService.authenticate(req.body.email, req.body.password).bind({}).then((account) => {
      this.account = account;
      return createSession(req, {account: {_id: account.id}});
    }).then((token) => {
      res.json({
        token,
        account: this.account,
      });
    }).catch((err) => {
      logger.error(err);
      errors.respondWithError(res, err);
    });
  }

  function accountSignOut(req, res) {
    req.session.destroy((err) => {
      if (err) {
        logger.error(err);
        errors.respondWithError(res, err);
        return;
      }
      res.json({});
    });
  }

  function userSignIn(req, res) {
    appService.getAppByToken(req.body.app_token).bind({}).then((app) => {
      userService.assignUserUid(req.body.user, req.body.device);
      return userService.saveUser(app, req.body.user);
    }).then((user) => {
      this.user = user;
      return userService.saveDevice(user, req.body.device);
    }).then((device) => {
      return createSession(req, {
        user: {_id: this.user.id},
        device: {_id: device.id},
      });
    }).then((token) => {
      res.json({
        token,
        user: this.user,
      });
    }).catch((err) => {
      logger.error(err);
      errors.respondWithError(res, err);
    });
  }


  function userSignOut(req, res) {
    req.session.destroy((err) => {
      if (err) {
        logger.error(err);
        errors.respondWithError(res, err);
        return;
      }
      res.json({});
    });
  }

  router.post('/accounts', accountSignIn);
  router.delete('/accounts', isAccountAuthenticated, accountSignOut);
  router.post('/users', userSignIn);
  router.delete('/users', isUserAuthenticated, userSignOut);

  app.use('/auth', router);

};
