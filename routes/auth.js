const accountService = require('../services/account');
const appService = require('../services/app');
const userService = require('../services/user');
const logger = require('../utils/logger');
const errors = require('../utils/errors');
const _ = require('lodash');

module.exports = (router, app) => {

  const createSession = (req, data) => {
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
  };

  const authenticateAccount = (req, res) => {
    accountService.authenticate(req.body.email, req.body.password).then((account) => {
      return createSession(req, {account: {_id: account.id}});
    }).then((token) => {
      res.json(token);
    }).catch((err) => {
      logger.error(err);
      errors.respondWithError(res, err);
    });
  };

  const authenticateUser = (req, res) => {
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
  };

  router.post('/accounts', authenticateAccount);
  router.post('/users', authenticateUser);

  app.use('/auth', router);

};
