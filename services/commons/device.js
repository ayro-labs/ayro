const Device = require('../../models').Device;
const errors = require('../../utils/errors');
const queries = require('../../utils/queries');
const Promise = require('bluebird');

function throwDeviceNotFoundIfNeeded(device, options) {
  if (!device && (!options || options.require)) {
    throw errors.notFoundError('device.doesNotExist', 'Device does not exist');
  }
}

exports.getDevice = (id, options) => {
  return Promise.resolve().then(() => {
    const promise = Device.findById(id);
    queries.fillQuery(promise, options);
    return promise.exec();
  }).then((device) => {
    throwDeviceNotFoundIfNeeded(device, options);
    return device;
  });
};

exports.findDevice = (query, options) => {
  return Promise.resolve().then(() => {
    const promise = Device.findOne(query);
    queries.fillQuery(promise, options);
    return promise.exec();
  }).then((device) => {
    throwDeviceNotFoundIfNeeded(device, options);
    return device;
  });
};

exports.findDevices = (query, options) => {
  return Promise.resolve().then(() => {
    const promise = Device.find(query);
    queries.fillQuery(promise, options);
    return promise.exec();
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
