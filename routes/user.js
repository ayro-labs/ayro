const userService = require('../services/user');
const deviceService = require('../services/device');
const logger = require('../utils/logger');
const errors = require('../utils/errors');
const {isUserAuthenticated} = require('../utils/middlewares');
const Promise = require('bluebird');

module.exports = (router, app) => {

  function updateUser(req, res) {
    Promise.coroutine(function* () {
      try {
        const user = yield userService.updateUser(req.user, req.body);
        res.json(user);
      } catch (err) {
        logger.error(err);
        errors.respondWithError(res, err);
      }
    })();
  }

  function updateDevice(req, res) {
    Promise.coroutine(function* () {
      try {
        const device = yield deviceService.updateDevice(req.device, req.body);
        res.json(device);
      } catch (err) {
        logger.error(err);
        errors.respondWithError(res, err);
      }
    })();
  }

  router.put('/', isUserAuthenticated, updateUser);
  router.put('/devices', isUserAuthenticated, updateDevice);

  app.use('/users', router);

};
