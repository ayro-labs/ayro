'use strict';

const {Device, ChatMessage} = require('../models');
const userCommons = require('./commons/user');
const deviceCommons = require('./commons/device');

async function removeOldDeviceIfNeeded(user, data) {
  const device = await deviceCommons.findDevice({user: user.id, platform: data.platform}, {require: false});
  if (device && device.uid !== data.uid) {
    await ChatMessage.remove({user: device.user});
    await Device.remove({_id: device.id});
    await userCommons.updateUser(user, {$unset: {latest_device: ''}});
  }
}

exports.saveDevice = async (user, data) => {
  await removeOldDeviceIfNeeded(user, data);
  const device = await deviceCommons.findDevice({uid: data.uid}, {require: false});
  let updatedDevice;
  if (!device) {
    updatedDevice = await deviceCommons.createDevice(user, data);
  } else {
    if (user.id !== device.user.toString()) {
      data.user = user.id;
    }
    updatedDevice = await deviceCommons.updateDevice(device, data);
  }
  await userCommons.updateUser(user, {latest_device: updatedDevice.id});
  return updatedDevice;
};

exports.updateDevice = async (device, data) => {
  return deviceCommons.updateDevice(device, data);
};
