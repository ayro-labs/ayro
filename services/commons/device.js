'use strict';

const {Device} = require('../../models');
const constants = require('../../utils/constants');
const errors = require('../../utils/errors');
const queries = require('../../utils/queries');
const detectBrowser = require('detect-browser');
const _ = require('lodash');

const ALLOWED_ATTRIBUTES = ['uid', 'platform', 'push_token', 'info'];

function throwDeviceNotFoundIfNeeded(device, options) {
  if (!device && (!options || options.require)) {
    throw errors.notFoundError('device_not_found', 'Device not found');
  }
}

function fixDeviceData(data) {
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

exports.getDevice = async (id, options) => {
  const promise = Device.findById(id);
  queries.fillQuery(promise, options);
  const device = await promise.exec();
  throwDeviceNotFoundIfNeeded(device, options);
  return device;
};

exports.findDevice = async (query, options) => {
  const promise = Device.findOne(query);
  queries.fillQuery(promise, options);
  const device = await promise.exec();
  throwDeviceNotFoundIfNeeded(device, options);
  return device;
};

exports.findDevices = async (query, options) => {
  const promise = Device.find(query);
  queries.fillQuery(promise, options);
  return promise.exec();
};

exports.createDevice = async (user, data) => {
  if (!data.uid) {
    throw errors.ayroError('device_uid_required', 'Device unique id is required');
  }
  const finalData = _.pick(data, ALLOWED_ATTRIBUTES);
  fixDeviceData(finalData);
  const device = new Device(finalData);
  device.user = user.id;
  device.registration_date = new Date();
  return device.save();
};

exports.updateDevice = async (device, data) => {
  const finalData = _.pick(data, ALLOWED_ATTRIBUTES);
  fixDeviceData(finalData);
  return Device.findByIdAndUpdate(device.id, finalData, {new: true, runValidators: true}).exec();
};
