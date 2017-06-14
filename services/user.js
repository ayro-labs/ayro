'use strict';

let User    = require('../models').User,
    Device  = require('../models').Device,
    errors  = require('../utils/errors'),
    Promise = require('bluebird'),
    _       = require('lodash'),
    $       = this;

exports.assignUserUid = function(userData, deviceData) {
  userData.identified = userData.uid ? true : false;
  userData.uid = userData.uid || deviceData.uid;
};

exports.createUser = function(project, data) {
  return Promise.resolve().then(function() {
    if (!data.uid) {
      throw errors.chatzError('user.uid.required', 'User unique id is required');
    }
    let user = new User(data);
    user.set('project', project);
    user.set('registration_date', new Date());
    return user.save();
  });
};

exports.updateUser = function(user, data) {
  return User.findByIdAndUpdate(user._id, data, {new: true});
};

exports.saveUser = function(project, data) {
  return $.getUser(project, data).then(function(user) {
    if (!user) {
      return $.createUser(project, data);
    } else {
      return $.updateUser(user, data);
    }
  });
};

exports.getUser = function(project, uid) {
  return User.findOne({project: project._id, uid: uid}).exec();
};

exports.createDevice = function(user, data) {
  return Promise.resolve().then(function() {
    let device = new Device(data);
    device.set('user', user);
    device.set('registration_date', new Date());
    return device.save();
  });
};

exports.updateDevice = function(device, data) {
  return Device.findByIdAndUpdate(device._id, data, {new: true});
};

exports.saveDevice = function(user, data) {
  return $.getDevice(user, data).then(function(user) {
    if (!device) {
      return $.createDevice(user, data);
    } else {
      return $.updateDevice(device, data);
    }
  });
};

exports.getDevice = function(user, uid) {
  return Device.findOne({user: user._id, uid: uid}).exec();
};