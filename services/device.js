'use strict';

const userQueries = require('database/queries/user');
const deviceQueries = require('database/queries/device');
const deviceCommons = require('services/commons/device');
const _ = require('lodash');

const ALLOWED_ATTRS = ['uid', 'platform', 'push_token', 'info'];

async function removeOldDeviceIfNeeded(user, data) {
  const device = await deviceQueries.findDevice({user: user.id, channel: data.channel}, {require: false});
  if (device && device.uid !== data.uid) {
    await device.remove();
  }
}

exports.saveDevice = async (user, channel, data) => {
  const loadedUser = await userQueries.getUser(user.id);
  const attrs = _.pick(data, ALLOWED_ATTRS);
  attrs.channel = channel;
  await removeOldDeviceIfNeeded(user, attrs);
  let device = attrs.uid ? await deviceQueries.findDevice({user: loadedUser.id, uid: attrs.uid}, {require: false}) : null;
  if (!device) {
    device = await deviceCommons.createDevice(loadedUser, attrs);
  } else {
    device = await deviceCommons.updateDevice(device, attrs);
  }
  return device;
};

exports.updateDevice = async (device, data) => {
  const attrs = _.pick(data, ALLOWED_ATTRS);
  return deviceCommons.updateDevice(device, attrs);
};

exports.getDevice = async (id) => {
  return deviceQueries.getDevice(id);
};

exports.listDevices = async (user) => {
  return deviceQueries.findDevices({user: user.id});
};
