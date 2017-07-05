'use strict';

let User = require('../../models').User,
    Device = require('../../models').Device,
    errors = require('../../utils/errors'),
    Promise = require('bluebird'),
    _ = require('lodash');

let fillQuery = function(promise, options) {
  if (options) {
    if (!_.has(options, 'require')) {
      options.require = true;
    }
    if (options.populate) {
      promise.populate(options.populate);
    }
    if (options.lean) {
      promise.lean();
    }
  }
};

let throwUserNotFoundIfNeeded = function(user, options) {
  if (!user && (!options || options.require === true)) {
    throw errors.notFoundError('user.doesNotExist', 'User does not exist');
  }
};

let throwDeviceNotFoundIfNeeded = function(device, options) {
  if (!device && (!options || options.require === true)) {
    throw errors.notFoundError('device.doesNotExist', 'Device does not exist');
  }
};

exports.getUser = function(id, options) {
  return Promise.resolve().then(function() {
    let promise = User.findById(id);
    fillQuery(promise, options);
    return promise.exec();
  }).then(function(user) {
    throwUserNotFoundIfNeeded(user, options);
    return user;
  });
};

exports.findUser = function(query, options) {
  return Promise.resolve().then(function() {
    let promise = User.findOne(query);
    fillQuery(promise, options);
    return promise.exec();
  }).then(function(user) {
    throwUserNotFoundIfNeeded(user, options);
    return user;
  });
};

exports.updateUser = function(user, data) {
  return Promise.resolve().then(function() {
    if (data.first_name || data.last_name) {
      data.name_generated = false;
    }
    return User.findByIdAndUpdate(user.id, data, {new: true, runValidators: true}).exec();
  });
};

exports.getDevice = function(id, options) {
  return Promise.resolve().then(function() {
    let promise = Device.findById(id);
    fillQuery(promise, options);
    return promise.exec();
  }).then(function(device) {
    throwDeviceNotFoundIfNeeded(device, options);
    return device;
  });
};

exports.findDevice = function(query, options) {
  return Promise.resolve().then(function() {
    let promise = Device.findOne(query);
    fillQuery(promise, options);
    return promise.exec();
  }).then(function(device) {
    throwDeviceNotFoundIfNeeded(device, options);
    return device;
  });
};