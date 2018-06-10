'use strict';

const constants = require('utils/constants');
const hash = require('utils/hash');
const userQueries = require('database/queries/user');
const deviceQueries = require('database/queries/device');
const {Device} = require('models');
const detectBrowser = require('detect-browser');
const _ = require('lodash');

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
  const loadedUser = await userQueries.getUser(user.id);
  const attrs = _.cloneDeep(data);
  fixDeviceData(attrs);
  const device = new Device(attrs);
  device.app = loadedUser.app;
  device.user = loadedUser.id;
  device.registration_date = new Date();
  if (!device.uid) {
    device.uid = hash.uuid();
  }
  return device.save();
};


exports.updateDevice = async (device, data) => {
  const loadedDevice = await deviceQueries.getDevice(device.id);
  const attrs = _.cloneDeep(data);
  fixDeviceData(attrs);
  await loadedDevice.update(attrs, {runValidators: true});
  loadedDevice.set(attrs);
  return loadedDevice;
};
