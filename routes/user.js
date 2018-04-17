const userService = require('../services/user');
const deviceService = require('../services/device');
const errors = require('../utils/errors');
const {isUserAuthenticated} = require('../utils/middlewares');
const {logger} = require('@ayro/commons');

module.exports = (router, app) => {

  async function updateUser(req, res) {
    try {
      const user = await userService.updateUser(req.user, req.body);
      res.json(user);
    } catch (err) {
      logger.error(err);
      errors.respondWithError(res, err);
    }
  }

  async function updateDevice(req, res) {
    try {
      const device = await deviceService.updateDevice(req.device, req.body);
      res.json(device);
    } catch (err) {
      logger.error(err);
      errors.respondWithError(res, err);
    }
  }

  router.put('/', isUserAuthenticated, updateUser);
  router.put('/devices', isUserAuthenticated, updateDevice);

  app.use('/users', router);

};
