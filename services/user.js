'use strict';

const {User, Device, ChatMessage} = require('../models');
const errors = require('../utils/errors');
const userCommons = require('./commons/user');
const deviceCommons = require('./commons/device');
const Promise = require('bluebird');
const _ = require('lodash');

exports.saveUser = async (app, data) => {
  data.identified = true;
  const user = await userCommons.findUser({app: app.id, uid: data.uid}, {require: false});
  return !user ? userCommons.createUser(app, data) : userCommons.updateUser(user, data);
};

exports.saveAnonymousUser = async (app, uid) => {
  return this.saveUser(app, {uid, identified: false});
};

exports.updateUser = async (user, data) => {
  return userCommons.updateUser(user, data);
};

exports.mergeUsers = async (user, survivingUser) => {
  if (user) {
    user = await userCommons.getUser(user.id);
    survivingUser = await userCommons.getUser(user.id);
    if (user.app.toString() !== survivingUser.app.toString()) {
      throw errors.internalError('Can not merge users from different apps');
    }
    if (!user.identified && !survivingUser.identified) {
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
          updateChatMessagePromises.push(ChatMessage.updateOne(
            {user: user.id, device: device.id},
            {user: survivingUser.id, survivingDevice: device.id},
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
