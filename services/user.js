'use strict';

let User = require('../models').User,
    Device = require('../models').Device,
    errors = require('../utils/errors'),
    userCommons = require('./commons/user'),
    randomName = require('node-random-name'),
    Promise = require('bluebird'),
    _ = require('lodash'),
    $ = this;

exports.assignUserUid = function(userData, deviceData) {
  userData.identified = userData.uid ? true : false;
  userData.uid = userData.uid || deviceData.uid;
};

exports.createUser = function(app, data) {
  return Promise.resolve().then(function() {
    if (!data.uid) {
      throw errors.chatzError('user.uid.required', 'User unique id is required');
    }
    delete data._id;
    let user = new User(data);
    user.app = app.id;
    user.registration_date = new Date();
    user.name_generated = false;
    if (!user.first_name && !user.last_name) {
      let names = _.split(randomName(), ' ');
      user.first_name = names[0];
      user.last_name = names[1];
      user.name_generated = true;
    }
    return user.save();
  });
};

exports.updateUser = function(user, data) {
  return userCommons.updateUser(user, data);
};

exports.saveUser = function(app, data) {
  return userCommons.findUser({app: app.id, uid: data.uid}, {require: false}).then(function(user) {
    if (!user) {
      return $.createUser(app, data);
    } else {
      return $.updateUser(user, data);
    }
  });
};

exports.createDevice = function(user, data) {
  return Promise.resolve().then(function() {
    if (!data.uid) {
      throw errors.chatzError('device.uid.required', 'Device unique id is required');
    }
    delete data._id;
    let device = new Device(data);
    device.user = user.id;
    device.registration_date = new Date();
    return device.save();
  });
};

exports.updateDevice = function(device, data) {
  return Device.findByIdAndUpdate(device.id, data, {new: true, runValidators: true}).exec();
};

exports.saveDevice = function(user, data) {
  return userCommons.findDevice({user: user.id, uid: data.uid}, {require: false}).then(function(device) {
    if (!device) {
      return $.createDevice(user, data);
    } else {
      return $.updateDevice(device, data);
    }
  });
};