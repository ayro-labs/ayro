const User = require('../../models').User;
const Device = require('../../models').Device;
const errors = require('../../utils/errors');
const Promise = require('bluebird');
const _ = require('lodash');

function fillQuery(promise, options) {
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
}

function throwUserNotFoundIfNeeded(user, options) {
  if (!user && (!options || options.require === true)) {
    throw errors.notFoundError('user.doesNotExist', 'User does not exist');
  }
}

function throwDeviceNotFoundIfNeeded(device, options) {
  if (!device && (!options || options.require === true)) {
    throw errors.notFoundError('device.doesNotExist', 'Device does not exist');
  }
}

exports.getUser = (id, options) => {
  return Promise.resolve().then(() => {
    const promise = User.findById(id);
    fillQuery(promise, options);
    return promise.exec();
  }).then((user) => {
    throwUserNotFoundIfNeeded(user, options);
    return user;
  });
};

exports.findUser = (query, options) => {
  return Promise.resolve().then(() => {
    const promise = User.findOne(query);
    fillQuery(promise, options);
    return promise.exec();
  }).then((user) => {
    throwUserNotFoundIfNeeded(user, options);
    return user;
  });
};

exports.updateUser = (user, data) => {
  return Promise.resolve().then(() => {
    if (data.first_name || data.last_name) {
      data.name_generated = false;
    }
    return User.findByIdAndUpdate(user.id, data, {new: true, runValidators: true}).exec();
  });
};

exports.getDevice = (id, options) => {
  return Promise.resolve().then(() => {
    const promise = Device.findById(id);
    fillQuery(promise, options);
    return promise.exec();
  }).then((device) => {
    throwDeviceNotFoundIfNeeded(device, options);
    return device;
  });
};

exports.findDevice = (query, options) => {
  return Promise.resolve().then(() => {
    const promise = Device.findOne(query);
    fillQuery(promise, options);
    return promise.exec();
  }).then((device) => {
    throwDeviceNotFoundIfNeeded(device, options);
    return device;
  });
};
