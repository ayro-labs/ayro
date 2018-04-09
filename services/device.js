const {Device, ChatMessage} = require('../models');
const userCommons = require('./commons/user');
const deviceCommons = require('./commons/device');
const Promise = require('bluebird');

function removeOldDeviceIfNeeded(user, data) {
  return Promise.coroutine(function* () {
    const device = yield deviceCommons.findDevice({user: user.id, platform: data.platform}, {require: false});
    if (device && device.uid !== data.uid) {
      yield ChatMessage.remove({user: device.user});
      yield Device.remove({_id: device.id});
      yield userCommons.updateUser(user, {$unset: {latest_device: ''}});
    }
  })();
}

exports.saveDevice = (user, data) => {
  return Promise.coroutine(function* () {
    yield removeOldDeviceIfNeeded(user, data);
    const device = yield deviceCommons.findDevice({uid: data.uid}, {require: false});
    let updatedDevice;
    if (!device) {
      updatedDevice = yield deviceCommons.createDevice(user, data);
    } else {
      if (user.id !== device.user.toString()) {
        data.user = user.id;
      }
      updatedDevice = yield deviceCommons.updateDevice(device, data);
    }
    yield userCommons.updateUser(user, {latest_device: updatedDevice.id});
    return updatedDevice;
  })();
};

exports.updateDevice = (device, data) => {
  return deviceCommons.updateDevice(device, data);
};
