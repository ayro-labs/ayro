'use strict';

const {Device} = require('../../models');
const constants = require('../../utils/constants');
const errors = require('../../utils/errors');
const userQueries = require('../../utils/queries/user');
const detectBrowser = require('detect-browser');
const _ = require('lodash');

const UNALLOWED_ATTRS = ['_id', 'id', 'user', 'registration_date'];

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

exports.createDevice = async (user, data) => {
  if (!data.uid) {
    throw errors.ayroError('device_uid_required', 'Device unique id is required');
  }
  const loadedUser = await userQueries.getUser(user.id);
  const finalData = _.omit(data, UNALLOWED_ATTRS);
  fixDeviceData(finalData);
  const device = new Device(finalData);
  device.app = loadedUser.app;
  device.user = loadedUser.id;
  device.registration_date = new Date();
  return device.save();
};

exports.updateDevice = async (device, data) => {
  const finalData = _.omit(data, UNALLOWED_ATTRS);
  fixDeviceData(finalData);
  return Device.findByIdAndUpdate(device.id, finalData, {new: true, runValidators: true}).exec();
};
