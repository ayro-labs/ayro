const {Device, ChatMessage} = require('../models');
const userCommons = require('./commons/user');
const deviceCommons = require('./commons/device');
const Promise = require('bluebird');

function removeDeviceIfNeeded(user, data) {
  return Promise.coroutine(function* () {
    const [currentUser, device] = yield Promise.all([
      userCommons.getUser(user.id),
      deviceCommons.findDevice({user: user.id, platform: data.platform}, {require: false}),
    ]);
    if (device && device.uid !== data.uid) {
      yield ChatMessage.remove({currentUser: device.currentUser});
      yield Device.remove({_id: device.id});
      if (currentUser.latest_device && currentUser.latest_device.toString() === device.id) {
        currentUser.latest_device = device.id;
        yield userCommons.updateUser(currentUser, {$unset: ''});
      }
    }
  })();
}

exports.saveDevice = (user, data) => {
  return Promise.coroutine(function* () {
    yield removeDeviceIfNeeded(user, data);
    const device = yield deviceCommons.findDevice({uid: data.uid}, {require: false});
    if (!device) {
      return deviceCommons.createDevice(user, data);
    }
    if (user.id !== device.user.toString()) {
      data.user = user.id;
    }
    return deviceCommons.updateDevice(device, data);
  })();
};

exports.updateDevice = (device, data) => {
  return deviceCommons.updateDevice(device, data);
};
