'use strict';

const {AppSecret, User, Device, ChatMessage} = require('../models');
const errors = require('../utils/errors');
const userCommons = require('./commons/user');
const deviceCommons = require('./commons/device');
const jwt = require('jsonwebtoken');
const Promise = require('bluebird');
const _ = require('lodash');

const JWT_SCOPE_USER = 'user';

async function saveUser(app, data, jwtToken) {
  if (data.identified && !jwtToken) {
    throw errors.ayroError('jwt_required', 'JWT token is required');
  }
  if (data.uid && jwtToken) {
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
    if (payload.scope !== JWT_SCOPE_USER || payload.user !== data.uid) {
      throw errors.ayroError('jwt_invalid', 'User\'s uid not match');
    }
  }
  const user = await userCommons.findUser({app: app.id, uid: data.uid}, {require: false});
  return !user ? userCommons.createUser(app, data) : userCommons.updateUser(user, data);
}

exports.saveIdentifiedUser = async (app, data, jwtToken) => {
  return saveUser(app, {...data, identified: true}, jwtToken);
};

exports.saveAnonymousUser = async (app, uid) => {
  return saveUser(app, {uid, identified: false});
};

exports.updateUser = async (user, data) => {
  return userCommons.updateUser(user, data);
};

exports.getUser = async (id) => {
  return userCommons.getUser(id);
};

exports.mergeUsers = async (user, survivingUser) => {
  if (user) {
    user = await userCommons.getUser(user.id);
    survivingUser = await userCommons.getUser(survivingUser.id);
    if (user.app.toString() !== survivingUser.app.toString()) {
      throw errors.internalError('Can not merge users from different apps');
    }
    if (!user.identified && survivingUser.identified) {
      const devices = await deviceCommons.findDevices({user: user.id});
      const survivingDevices = await deviceCommons.findDevices({user: survivingUser.id});
      const survivingDevicesByUid = _.keyBy(survivingDevices, (device) => {
        return device.uid;
      });
      const devicesIdsToRemove = [];
      const updateChatMessagePromises = [];
      _.each(devices, (device) => {
        const survivingDevice = survivingDevicesByUid[device.uid];
        if (survivingDevice) {
          updateChatMessagePromises.push(ChatMessage.updateMany(
            {user: user.id, device: device.id},
            {user: survivingUser.id, device: survivingDevice.id},
          ));
        } else {
          devicesIdsToRemove.push(device.id);
        }
      });
      await Promise.all(updateChatMessagePromises);
      await ChatMessage.remove({device: {$in: devicesIdsToRemove}});
      await Device.remove({user: user.id});
      await User.remove({_id: user.id});
    }
  }
};
