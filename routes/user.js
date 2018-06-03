'use strict';

const {App} = require('models');
const appService = require('services/app');
const userService = require('services/user');
const deviceService = require('services/device');
const chatService = require('services/chat');
const constants = require('utils/constants');
const session = require('utils/session');
const errors = require('utils/errors');
const {userAuthenticated} = require('routes/middlewares');
const {logger} = require('@ayro/commons');
const _ = require('lodash');

const ALLOWED_USER_ATTRS = ['uid', 'first_name', 'last_name', 'email', 'photo_url', 'properties', 'sign_up_date'];
const ALLOWED_DEVICE_ATTRS = ['uid', 'platform', 'push_token', 'info'];

async function updateUser(req, res) {
  try {
    const user = await userService.updateUser(req.user, _.pick(req.body, ALLOWED_USER_ATTRS));
    res.json(user);
  } catch (err) {
    logger.error(err);
    errors.respondWithError(res, err);
  }
}

async function listDevices(req, res) {
  try {
    const devices = await deviceService.listDevices(req.user);
    res.json(devices);
  } catch (err) {
    logger.error(err);
    errors.respondWithError(res, err);
  }
}

async function updateDevice(req, res) {
  try {
    const device = await deviceService.updateDevice(req.device, _.pick(req.body, ALLOWED_DEVICE_ATTRS));
    res.json(device);
  } catch (err) {
    logger.error(err);
    errors.respondWithError(res, err);
  }
}

async function connectEmail(req, res) {
  try {
    const data = {
      platform: constants.device.platforms.EMAIL.id,
      info: {
        email: req.body.email,
      },
    };
    const channel = constants.integration.channels.EMAIL;
    const device = await deviceService.saveDevice(req.user, channel, data);
    await chatService.postDeviceConnected(req.user, device);
    res.json(device);
  } catch (err) {
    logger.error(err);
    errors.respondWithError(res, err);
  }
}

async function login(req, res) {
  try {
    const app = await appService.getAppByToken(req.body.app_token);
    const user = await userService.saveIdentifiedUser(app, _.pick(req.body.user, ALLOWED_USER_ATTRS), req.body.jwt);
    const device = await deviceService.saveDevice(user, req.channel, _.pick(req.body.device, ALLOWED_DEVICE_ATTRS));
    await userService.mergeUsers(req.user, user);
    await session.destroyToken(req.token);
    const token = await session.createUserToken(user, device, req.channel);
    res.json({user, device, token});
  } catch (err) {
    logger.error(err);
    errors.respondWithError(res, err);
  }
}

async function logout(req, res) {
  try {
    const authenticatedUser = await userService.getUser(req.user.id);
    const authenticatedDevice = await deviceService.getDevice(req.device.id);
    const app = new App({id: authenticatedUser.app});
    const user = await userService.saveAnonymousUser(app, authenticatedDevice.uid);
    const device = await deviceService.saveDevice(user, req.channel, authenticatedDevice.toObject());
    await session.destroyToken(req.token);
    const token = await session.createUserToken(user, device);
    res.json({user, device, token});
  } catch (err) {
    logger.error(err);
    errors.respondWithError(res, err);
  }
}

module.exports = (router, app) => {
  router.put('/', userAuthenticated, updateUser);
  router.get('/devices', userAuthenticated, listDevices);
  router.put('/devices', userAuthenticated, updateDevice);
  router.post('/connect/email', userAuthenticated, connectEmail);
  router.post('/login', userAuthenticated, login);
  router.post('/logout', userAuthenticated, logout);

  app.use('/users', router);
};
