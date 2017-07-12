const userService = require('../services/user');
const isUserAuthenticated = require('../utils/middlewares').isUserAuthenticated;
const logger = require('../utils/logger');
const errors = require('../utils/errors');

module.exports = (router, app) => {

  const updateUser = (req, res) => {
    userService.updateUser(req.user, req.body).then(() => {
      res.json({});
    }).catch((err) => {
      logger.error(err);
      errors.respondWithError(res, err);
    });
  };

  const updateDevice = (req, res) => {
    userService.updateDevice(req.device, req.body).then(() => {
      res.json({});
    }).catch((err) => {
      logger.error(err);
      errors.respondWithError(res, err);
    });
  };

  router.put('/', isUserAuthenticated, updateUser);
  router.put('/devices', isUserAuthenticated, updateDevice);

  app.use('/users', router);

};
