'use strict';

let User = require('../models').User,
    Device = require('../models').Device,
    errors = require('../utils/errors'),
    modelUtils = require('../utils/model'),
    Promise = require('bluebird'),
    _ = require('lodash'),
    $ = this;

exports.assignUserUid = function(userData, deviceData) {
  userData.identified = userData.uid ? true : false;
  userData.uid = userData.uid || deviceData.uid;
};

exports.createUser = function(project, data) {
  return Promise.resolve().then(function() {
    if (!data.uid) {
      throw errors.chatzError('user.uid.required', 'User unique id is required');
    }
    delete data._id;
    let user = new User(data);
    user.project = project._id;
    user.registration_date = new Date();
    return modelUtils.toObject(user.save());
  });
};

exports.updateUser = function(user, data) {
  return User.findByIdAndUpdate(user._id, data, {new: true}).lean().exec();
};

exports.saveUser = function(project, data) {
  return $.getUser(project, data.uid).then(function(user) {
    if (!user) {
      return $.createUser(project, data);
    } else {
      return $.updateUser(user, data);
    }
  });
};

exports.getUser = function(project, uid) {
  return User.findOne({project: project._id, uid: uid}).lean().exec();
};

exports.createDevice = function(user, data) {
  return Promise.resolve().then(function() {
    if (!data.uid) {
      throw errors.chatzError('device.uid.required', 'Device unique id is required');
    }
    delete data._id;
    let device = new Device(data);
    device.user = user_.id;
    device.registration_date = new Date();
    return modelUtils.toObject(device.save());
  });
};

exports.updateDevice = function(device, data) {
  return Device.findByIdAndUpdate(device._id, data, {new: true}).lean().exec();
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