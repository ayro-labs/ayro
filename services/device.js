'use strict';

const {Device} = require('../models');
const userQueries = require('../utils/queries/user');
const deviceQueries = require('../utils/queries/device');
const deviceCommons = require('./commons/device');

async function removeOldDeviceIfNeeded(user, data) {
  const device = await deviceQueries.findDevice({user: user.id, platform: data.platform}, {require: false});
  if (device && device.uid !== data.uid) {
    await Device.remove({_id: device.id});
  }
}

exports.saveDevice = async (user, data) => {
  const loadedUser = await userQueries.getUser(user.id);
  await removeOldDeviceIfNeeded(user, data);
  let device = await deviceQueries.findDevice({user: loadedUser.id, uid: data.uid}, {require: false});
  if (!device) {
    device = await deviceCommons.createDevice(loadedUser, data);
  } else {
    device = await deviceCommons.updateDevice(device, data);
  }
  return device;
};

exports.updateDevice = async (device, data) => {
  return deviceCommons.updateDevice(device, data);
};

exports.getDevice = async (id) => {
  return deviceQueries.getDevice(id);
};
