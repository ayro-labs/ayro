const {Device} = require('../../models');
const constants = require('../../utils/constants');
const errors = require('../../utils/errors');
const queries = require('../../utils/queries');
const Promise = require('bluebird');
const detectBrowser = require('detect-browser');

function throwDeviceNotFoundIfNeeded(device, options) {
  if (!device && (!options || options.require)) {
    throw errors.notFoundError('device.doesNotExist', 'Device does not exist');
  }
}

function fixDeviceData(data) {
  delete data._id;
  if (data.platform === constants.device.platforms.WEB.id && data.info) {
    if (data.info.user_agent) {
      const browser = detectBrowser.parseUserAgent(data.info.user_agent);
      if (browser) {
        data.info.browser_name = browser.name;
        data.info.browser_version = browser.version;
        data.info.operating_system = browser.os;
      }
    }
  }
}

exports.getDevice = (id, options) => {
  return Promise.coroutine(function* () {
    const promise = Device.findById(id);
    queries.fillQuery(promise, options);
    const device = yield promise.exec();
    throwDeviceNotFoundIfNeeded(device, options);
    return device;
  })();
};

exports.findDevice = (query, options) => {
  return Promise.coroutine(function* () {
    const promise = Device.findOne(query);
    queries.fillQuery(promise, options);
    const device = yield promise.exec();
    throwDeviceNotFoundIfNeeded(device, options);
    return device;
  })();
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
    fixDeviceData(data);
    const device = new Device(data);
    device.user = user.id;
    device.registration_date = new Date();
    return device.save();
  });
};

exports.updateDevice = (device, data) => {
  return Promise.resolve().then(() => {
    fixDeviceData(data);
    return Device.findByIdAndUpdate(device.id, data, {new: true, runValidators: true}).exec();
  });
};
