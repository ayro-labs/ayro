'use strict';

const userQueries = require('utils/queries/user');
const deviceQueries = require('utils/queries/device');
const deviceCommons = require('services/commons/device');
const _ = require('lodash');

async function removeOldDeviceIfNeeded(user, data) {
  const device = await deviceQueries.findDevice({user: user.id, channel: data.channel}, {require: false});
  if (device && device.uid !== data.uid) {
    await device.remove();
  }
}

exports.saveDevice = async (user, channel, data) => {
  const loadedUser = await userQueries.getUser(user.id);
  const attrs = _.cloneDeep(data);
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
  return deviceCommons.updateDevice(device, data);
};

exports.getDevice = async (id) => {
  return deviceQueries.getDevice(id);
};

exports.listDevices = async (user) => {
  return deviceQueries.findDevices({user: user.id});
};
