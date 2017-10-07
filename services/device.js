const User = require('../models').User;
const Device = require('../models').Device;
const ChatMessage = require('../models').ChatMessage;
const userCommons = require('./commons/user');
const deviceCommons = require('./commons/device');
const Promise = require('bluebird');

function removeDeviceIfNeeded(user, data) {
  return Promise.all([
    userCommons.getUser(user.id),
    deviceCommons.findDevice({user: user.id, platform: data.platform}, {require: false}),
  ]).spread((user, device) => {
    if (device && device.uid !== data.uid) {
      return ChatMessage.remove({user: device.user}).then(() => {
        return Device.remove({_id: device.id});
      }).then(() => {
        if (user.latest_device && user.latest_device.toString() === device.id) {
          user.latest_device = device.id;
          return User.updateOne({_id: user.id}, {$unset: ''});
        }
        return null;
      });
    }
    return null;
  });
}

exports.saveDevice = (user, data) => {
  return removeDeviceIfNeeded(user, data).then(() => {
    return deviceCommons.findDevice({uid: data.uid}, {require: false});
  }).then((device) => {
    if (!device) {
      return deviceCommons.createDevice(user, data);
    }
    if (user.id !== device.user.toString()) {
      data.user = user.id;
    }
    return deviceCommons.updateDevice(device, data);
  });
};

exports.updateDevice = (device, data) => {
  return deviceCommons.updateDevice(device, data);
};
