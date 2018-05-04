'use strict';

const {AppSecret, ChatMessage} = require('../models');
const errors = require('../utils/errors');
const userQueries = require('../utils/queries/user');
const deviceQueries = require('../utils/queries/device');
const userCommons = require('./commons/user');
const jwt = require('jsonwebtoken');
const Promise = require('bluebird');
const _ = require('lodash');

const JWT_SCOPE_USER = 'user';

exports.saveIdentifiedUser = async (app, data, jwtToken) => {
  if (!jwtToken) {
    throw errors.ayroError('jwt_required', 'JWT token is required');
  }
  if (data.uid) {
    const decoded = jwt.decode(jwtToken, {complete: true});
    if (!decoded) {
      throw errors.ayroError('jwt_invalid', 'Invalid JWT token');
    }
    if (!decoded.header.kid) {
      throw errors.ayroError('jwt_invalid', 'JWT token requires kid header');
    }
    const appSecret = await AppSecret.findOne({_id: decoded.header.kid, app: app.id});
    if (!appSecret) {
      throw errors.ayroError('jwt_invalid', 'App secret not found');
    }
    const payload = jwt.verify(jwtToken, appSecret.secret);
    if (payload.scope !== JWT_SCOPE_USER || payload.userId !== data.uid) {
      throw errors.ayroError('jwt_invalid', 'User\'s uid not match');
    }
  }
  const user = await userQueries.findUser({app: app.id, uid: data.uid}, {require: false});
  return user ? userCommons.updateUser(user, data) : userCommons.createIdentifiedUser(app, data);
};

exports.saveAnonymousUser = async (app, uid) => {
  const user = await userQueries.findUser({app: app.id, uid}, {require: false});
  return user || userCommons.createAnonymousUser(app, {uid});
};

exports.updateUser = async (user, data) => {
  return userCommons.updateUser(user, data);
};

exports.getUser = async (id) => {
  return userQueries.getUser(id);
};

exports.mergeUsers = async (user, survivingUser) => {
  const loadedUser = await userQueries.getUser(user.id);
  const loadedSurvivingUser = await userQueries.getUser(survivingUser.id);
  if (loadedUser.app.toString() !== loadedSurvivingUser.app.toString()) {
    throw errors.internalError('Can not merge users from different apps');
  }
  if (!loadedUser.identified && loadedSurvivingUser.identified) {
    const devices = await deviceQueries.findDevices({user: loadedUser.id});
    const survivingDevices = await deviceQueries.findDevices({user: loadedSurvivingUser.id});
    const survivingDevicesByUid = _.keyBy(survivingDevices, (device) => {
      return device.uid;
    });
    const devicesIdsToRemove = [];
    const updateChatMessagePromises = [];
    _.each(devices, (device) => {
      const survivingDevice = survivingDevicesByUid[device.uid];
      if (survivingDevice) {
        updateChatMessagePromises.push(ChatMessage.updateMany(
          {user: loadedUser.id},
          {user: loadedSurvivingUser.id},
        ));
      } else {
        devicesIdsToRemove.push(device.id);
      }
    });
    await Promise.all(updateChatMessagePromises);
    await ChatMessage.remove({device: {$in: devicesIdsToRemove}});
    await loadedUser.update({transient: true}, {runValidators: true});
  }
};
