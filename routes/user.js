const userService = require('../services/user');
const logger = require('../utils/logger');
const errors = require('../utils/errors');
const isUserAuthenticated = require('../utils/middlewares').isUserAuthenticated;

module.exports = (router, app) => {

  function updateUser(req, res) {
    userService.updateUser(req.user, req.body).then(() => {
      res.json({});
    }).catch((err) => {
      logger.error(err);
      errors.respondWithError(res, err);
    });
  }

  function updateDevice(req, res) {
    userService.updateDevice(req.device, req.body).then(() => {
      res.json({});
    }).catch((err) => {
      logger.error(err);
      errors.respondWithError(res, err);
    });
  }

  router.put('/', isUserAuthenticated, updateUser);
  router.put('/devices', isUserAuthenticated, updateDevice);

  app.use('/users', router);

};
