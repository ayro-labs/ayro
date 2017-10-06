const User = require('../models').User;
const Device = require('../models').Device;
const ChatMessage = require('../models').ChatMessage;
const errors = require('../utils/errors');
const userCommons = require('./commons/user');
const randomName = require('node-random-name');
const Promise = require('bluebird');
const _ = require('lodash');

const $ = this;

exports.assignUserUid = (userData, deviceData) => {
  userData.identified = !_.isNil(userData.uid);
  userData.uid = userData.uid || deviceData.uid;
};

function removeDeviceIfNeeded(user, data) {
  return Promise.all([
    userCommons.getUser(user.id),
    userCommons.findDevice({user: user.id, platform: data.platform}, {require: false}),
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

exports.createUser = (app, data) => {
  return Promise.resolve().then(() => {
    if (!data.uid) {
      throw errors.chatzError('user.uid.required', 'User unique id is required');
    }
    delete data._id;
    const user = new User(data);
    user.app = app.id;
    user.registration_date = new Date();
    user.name_generated = false;
    if (!user.first_name && !user.last_name) {
      const names = _.split(randomName(), ' ');
      user.first_name = names[0];
      user.last_name = names[1];
      user.name_generated = true;
    }
    return user.save();
  });
};

exports.updateUser = (user, data) => {
  return userCommons.updateUser(user, data);
};

exports.saveUser = (app, data) => {
  return userCommons.findUser({app: app.id, uid: data.uid}, {require: false}).then((user) => {
    if (!user) {
      return $.createUser(app, data);
    }
    return $.updateUser(user, data);
  });
};

exports.createDevice = (user, data) => {
  return Promise.resolve().then(() => {
    if (!data.uid) {
      throw errors.chatzError('device.uid.required', 'Device unique id is required');
    }
    delete data._id;
    const device = new Device(data);
    device.user = user.id;
    device.registration_date = new Date();
    return device.save();
  });
};

exports.updateDevice = (device, data) => {
  return Device.findByIdAndUpdate(device.id, data, {new: true, runValidators: true}).exec();
};

exports.saveDevice = (user, data) => {
  return removeDeviceIfNeeded(user, data).then(() => {
    return userCommons.findDevice({uid: data.uid}, {require: false});
  }).then((device) => {
    if (!device) {
      return $.createDevice(user, data);
    }
    if (user.id !== device.user.toString()) {
      data.user = user.id;
    }
    return $.updateDevice(device, data);
  });
};
