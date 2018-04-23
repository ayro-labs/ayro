'use strict';

const {App} = require('../models');
const appService = require('../services/app');
const userService = require('../services/user');
const deviceService = require('../services/device');
const session = require('../utils/session');
const errors = require('../utils/errors');
const {isUserAuthenticated, decodeToken} = require('../utils/middlewares');
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

  async function login(req, res) {
    try {
      await decodeToken(req);
      await session.destroyToken(req.token);
      const app = await appService.getAppByToken(req.body.app_token);
      const user = await userService.saveUser(app, req.body.user);
      const device = await deviceService.saveDevice(user, req.body.device);
      const token = await session.createUserToken(user, device);
      await userService.mergeUsers(req.user, user);
      res.json({user, token});
    } catch (err) {
      logger.error(err);
      errors.respondWithError(res, err);
    }
  }

  async function logout(req, res) {
    try {
      await session.destroyToken(req.token);
      const authenticatedUser = await userService.getUser(req.user.id);
      const authenticatedDevice = await deviceService.getDevice(req.device.id);
      const app = new App({id: authenticatedUser.app});
      const user = await userService.saveAnonymousUser(app, authenticatedDevice.uid);
      const device = await deviceService.saveDevice(user, authenticatedDevice.toObject());
      const token = await session.createUserToken(user, device);
      res.json({user, token});
    } catch (err) {
      logger.error(err);
      errors.respondWithError(res, err);
    }
  }

  router.put('/', isUserAuthenticated, updateUser);
  router.put('/devices', isUserAuthenticated, updateDevice);
  router.post('/login', login);
  router.post('/logout', isUserAuthenticated, logout);

  app.use('/users', router);

};
