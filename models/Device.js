'use strict';

const constants = require('utils/constants');
const mongoose = require('mongoose');
const _ = require('lodash');

const {Schema} = mongoose;
const {ObjectId} = Schema.Types;

const DeviceInfo = new Schema({
  // Email
  email: {type: String},
  // Browser
  browser_name: {type: String},
  browser_version: {type: String},
  location: {type: String},
  // Android
  app_id: {type: String},
  app_version: {type: String},
  manufacturer: {type: String},
  model: {type: String},
  carrier: {type: String},
  // Messenger
  profile_id: {type: String},
  profile_name: {type: String},
  profile_gender: {type: String},
  profile_picture: {type: String},
  profile_locale: {type: String},
  profile_timezone: {type: String},
  // Common
  operating_system: {type: String},
}, {_id: false});

const Device = new Schema({
  app: {type: ObjectId, ref: 'App', required: true, index: true},
  user: {type: ObjectId, ref: 'User', required: true},
  uid: {type: String, required: true},
  platform: {type: String, required: true},
  channel: {type: String, enum: constants.integration.userChannels, required: true},
  push_token: {type: String},
  info: {type: DeviceInfo},
  registration_date: {type: Date, required: true},
});
Device.index({user: 1, uid: 1}, {unique: true});
Device.index({user: 1, channel: 1}, {unique: true});
Device.index(
  {platform: 1, 'info.profile_id': 1},
  {partialFilterExpression: {'info.profile_id': {$exists: true}}},
);
Device.methods.getPlatformName = function () {
  const platform = constants.device.platforms[_.toUpper(this.platform)];
  return platform ? platform.name : '';
};
Device.methods.isEmail = function () {
  return this.platform === constants.device.platforms.EMAIL.id;
};
Device.methods.isBrowser = function () {
  return this.platform === constants.device.platforms.BROWSER.id;
};
Device.methods.isSmartphone = function () {
  return _.includes([constants.device.platforms.ANDROID.id], this.platform);
};
Device.methods.isAndroid = function () {
  return this.platform === constants.device.platforms.ANDROID.id;
};
Device.methods.isMessenger = function () {
  return this.platform === constants.device.platforms.MESSENGER.id;
};

module.exports = Device;
