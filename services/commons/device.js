'use strict';

const {Device} = require('models');
const constants = require('utils/constants');
const errors = require('utils/errors');
const userQueries = require('utils/queries/user');
const deviceQueries = require('utils/queries/device');
const detectBrowser = require('detect-browser');
const _ = require('lodash');

const UNALLOWED_ATTRS = ['_id', 'id', 'app', 'user', 'registration_date'];
const UNALLOWED_ATTRS_UPDATE = ['uid', 'channel', ...UNALLOWED_ATTRS];

function fixDeviceData(data) {
  if (data.platform === constants.device.platforms.BROWSER.id && data.info) {
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

exports.createDevice = async (user, data) => {
  if (!data.uid) {
    throw errors.ayroError('device_uid_required', 'Device unique id is required');
  }
  const loadedUser = await userQueries.getUser(user.id);
  const attrs = _.omit(data, UNALLOWED_ATTRS);
  fixDeviceData(attrs);
  const device = new Device(attrs);
  device.app = loadedUser.app;
  device.user = loadedUser.id;
  device.registration_date = new Date();
  return device.save();
};

exports.updateDevice = async (device, data) => {
  const loadedDevice = await deviceQueries.getDevice(device.id);
  const attrs = _.omit(data, UNALLOWED_ATTRS_UPDATE);
  fixDeviceData(attrs);
  await loadedDevice.update(attrs, {runValidators: true});
  loadedDevice.set(attrs);
  return loadedDevice;
};
