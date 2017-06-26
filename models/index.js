'use strict';

let settings = require('../configs/settings'),
    constants = require('../utils/constants'),
    mongoose = require('mongoose'),
    Promise = require('bluebird'),
    _ = require('lodash');

let Schema = mongoose.Schema;
let ObjectId = Schema.Types.ObjectId;

mongoose.Promise = Promise;
mongoose.connect('mongodb://' + settings.database.host + ':' + settings.database.port + '/' + settings.database.schema);
mongoose.set('debug', settings.debug);

let Account = new Schema({
  first_name: {type: String, required: true, trim: true},
  last_name: {type: String, required: false, trim: true},
  email: {type: String, required: true, trim: true},
  password: {type: String, required: true},
  picture: {type: String, required: false},
  registration_date: {type: Date, required: true}
});

let AccountSecretKey = new Schema({
  account: {type: ObjectId, ref: 'Account'},
  secret: {type: String, required: true},
  registration_date: {type: Date, required: true}
});

let Integration = new Schema({
  type: {type: String, required: true, enum: _.values(constants.integration.types)},
  channel: {type: String, required: true, enum: _.values(constants.integration.channels)},
  configuration: {type: Object, required: true},
  registration_date: {type: Date, required: true}
});

let App = new Schema({
  account: {type: ObjectId, ref: 'Account'},
  name: {type: String, required: true, trim: true},
  token: {type: String, required: true},
  integrations: {type: [Integration], required: false},
  registration_date: {type: Date, required: true}
});
App.methods.getIntegration = function(type) {
  return this.integrations.find(function(integration) {
    return integration.type === type;
  })
};
App.methods.listIntegrationsOfChannel = function(channel) {
  return this.integrations.filter(function(integration) {
    return integration.channel === channel;
  })
};

let AppSecretKey = new Schema({
  app: {type: ObjectId, ref: 'App'},
  secret: {type: String, required: true},
  registration_date: {type: Date, required: true}
});

let DeviceInfo = new Schema({
  manufacturer: {type: String, required: false},
  model: {type: String, required: false},
  carrier: {type: String, required: false},
  os_name: {type: String, required: false},
  os_version: {type: String, required: false}
});

let Device = new Schema({
  user: {type: ObjectId, ref: 'User'},
  uid: {type: String, required: true},
  platform: {type: String, required: true},
  app_id: {type: String, required: false},
  app_version: {type: String, required: false},
  push_token: {type: String, required: false},
  info: {type: DeviceInfo, required: false},
  registration_date: {type: Date, required: true}
});
Device.methods.getPlatformName = function() {
  if (this.platform === constants.device.platforms.IOS) {
    return 'iOS';
  } else {
    return _.capitalize(this.platform);
  }
};
Device.methods.isSmartphone = function() {
  return _.includes([constants.device.platforms.ANDROID, constants.device.platforms.IOS], this.platform);
};

let User = new Schema({
  app: {type: ObjectId, ref: 'App'},
  uid: {type: String, required: true, index: true},
  first_name: {type: String, required: false, trim: true},
  last_name: {type: String, required: false, trim: true},
  email: {type: String, required: false, trim: true},
  identified: {type: String, required: true},
  name_generated: {type: String, required: true},
  properties: {type: Object, required: false},
  extra: {type: Object, required: false},
  sign_up_date: {type: Date, required: false},
  registration_date: {type: Date, required: true}
});
User.index({'extra.slack_channel.id': 1});
User.virtual('devices', {
  ref: 'Device',
  localField: '_id',
  foreignField: 'user'
});
User.methods.getFullName = function() {
  if (this.first_name) {
    return this.first_name + (this.last_name ? ' ' + this.last_name : '');
  } else if (this.last_name) {
    return this.last_name;
  } else {
    return '';
  }
};
User.methods.getDevice = function(platform) {
  return this.devices.find(function(device) {
    return device.platform === platform;
  })
};

exports.Account = mongoose.model('Account', Account);
exports.AccountSecretKey = mongoose.model('AccountSecretKey', AccountSecretKey);
exports.App = mongoose.model('App', App);
exports.AppSecretKey = mongoose.model('AppSecretKey', AppSecretKey);
exports.Device = mongoose.model('Device', Device);
exports.User = mongoose.model('User', User);