'use strict';

let User = require('../models').User,
    Device = require('../models').Device,
    errors = require('../utils/errors'),
    modelUtils = require('../utils/model'),
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
    user.app = app._id;
    user.registration_date = new Date();
    user.name_generated = false;
    if (!user.first_name && !user.last_name) {
      let names = _.split(randomName(), ' ');
      user.first_name = names[0];
      user.last_name = names[1];
      user.name_generated = true;
    }
    return modelUtils.toObject(user.save());
  });
};

exports.updateUser = function(user, data) {
  return Promise.resolve().then(function() {
    if (data.first_name || data.last_name) {
      data.name_generated = false;
    }
    return User.findByIdAndUpdate(user._id, data, {new: true, runValidators: true}).lean().exec();
  });
};

exports.saveUser = function(app, data) {
  return userCommons.findUser({app: app._id, uid: data.uid}, {require: false}).then(function(user) {
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
    device.user = user._id;
    device.registration_date = new Date();
    return modelUtils.toObject(device.save());
  });
};

exports.updateDevice = function(device, data) {
  return Promise.resolve().then(function() {
    delete data.uid;
    return Device.findByIdAndUpdate(device._id, data, {new: true, runValidators: true}).lean().exec();
  });
};

exports.saveDevice = function(user, data) {
  return $.getDevice(user, data.uid).then(function(device) {
    if (!device) {
      return $.createDevice(user, data);
    } else {
      return $.updateDevice(device, data);
    }
  });
};

exports.getDevice = function(user, uid) {
  return Device.findOne({user: user._id, uid: uid}).lean().exec();
};