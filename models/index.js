'use strict';

const settings = require('../configs/settings');
const constants = require('../utils/constants');
const {logger} = require('@ayro/commons');
const mongoose = require('mongoose');
const Promise = require('bluebird');
const _ = require('lodash');

const {Schema} = mongoose;
const {ObjectId} = Schema.Types;

const options = settings.mongo.username && settings.mongo.password ? {
  user: settings.mongo.username,
  pass: settings.mongo.password,
  authSource: 'admin',
} : {};

mongoose.Promise = Promise;
mongoose.set('debug', settings.mongo.debug);
mongoose.connect(`mongodb://${settings.mongo.host}:${settings.mongo.port}/${settings.mongo.schema}`, options).catch((err) => {
  logger.error('Could not connect to MongoDB.', err);
  process.exit(1);
});

function transform(obj, customTransform) {
  obj.id = obj._id;
  delete obj._id;
  delete obj.__v;
  if (customTransform) {
    customTransform(obj);
  }
  return obj;
}

function normalizeSchema(schema, customTransform) {
  schema.virtual('id').set(function(id) {
    this.set('_id', id);
  });
  schema.set('toJSON', {
    virtuals: true,
    transform: (doc, obj) => {
      return transform(obj, customTransform);
    },
  });
  schema.set('toObject', {
    virtuals: true,
    transform: (doc, obj) => {
      return transform(obj, customTransform);
    },
  });
  return schema;
}

const Account = new Schema({
  name: {type: String, required: true, trim: true},
  email: {type: String, required: true, trim: true, unique: true},
  password: {type: String, required: true},
  logo: {type: String, required: false},
  registration_date: {type: Date, required: true},
});

const App = new Schema({
  account: {type: ObjectId, ref: 'Account', required: true, index: true},
  name: {type: String, required: true, trim: true},
  icon: {type: String, required: false},
  token: {type: String, required: true},
  registration_date: {type: Date, required: true},
});
App.virtual('integrations', {
  ref: 'Integration',
  localField: '_id',
  foreignField: 'app',
});

const Integration = new Schema({
  app: {type: ObjectId, ref: 'App', required: true},
  type: {type: String, enum: _.values(constants.integration.types), required: true},
  channel: {type: String, enum: _.values(constants.integration.channels), required: true},
  configuration: {type: Object, required: false},
  registration_date: {type: Date, required: true},
});
Integration.index({app: 1, channel: 1}, {unique: true});
Integration.index({channel: 1, 'configuration.page.id': 1});
Integration.index({channel: 1, 'configuration.team.id': 1});

const User = new Schema({
  app: {type: ObjectId, ref: 'App', required: true},
  uid: {type: String, required: true},
  first_name: {type: String, required: false, trim: true},
  last_name: {type: String, required: false, trim: true},
  email: {type: String, required: false, trim: true},
  photo_url: {type: String, required: false},
  photo: {type: String, required: false},
  identified: {type: Boolean, required: true},
  random_name: {type: Boolean, required: true},
  properties: {type: Object, required: false},
  extra: {type: Object, required: false},
  sign_up_date: {type: Date, required: false},
  latest_device: {type: ObjectId, ref: 'Device', required: false},
  latest_channel: {type: String, enum: _.values(constants.integration.channels), required: false},
  registration_date: {type: Date, required: true},
});
User.index({app: 1, uid: 1}, {unique: true});
User.index({'extra.slack_channel.id': 1});
User.virtual('devices', {
  ref: 'Device',
  localField: '_id',
  foreignField: 'user',
});
User.methods.getFullName = function() {
  let fullName = '';
  if (this.first_name) {
    fullName = this.first_name + (this.last_name ? ` ${this.last_name}` : '');
  } else if (this.last_name) {
    fullName = this.last_name;
  }
  return fullName;
};

const DeviceInfo = new Schema({
  // Android
  app_id: {type: String, required: false},
  app_version: {type: String, required: false},
  manufacturer: {type: String, required: false},
  model: {type: String, required: false},
  carrier: {type: String, required: false},
  // Web
  browser_name: {type: String, required: false},
  browser_version: {type: String, required: false},
  location: {type: String, required: false},
  // Messenger
  profile_id: {type: String, required: false},
  profile_name: {type: String, required: false},
  profile_gender: {type: String, required: false},
  profile_picture: {type: String, required: false},
  profile_locale: {type: String, required: false},
  profile_timezone: {type: String, required: false},
  // Common
  operating_system: {type: String, required: false},
});

const Device = new Schema({
  user: {type: ObjectId, ref: 'User', required: true},
  uid: {type: String, required: true},
  platform: {type: String, required: true},
  push_token: {type: String, required: false},
  info: {type: DeviceInfo, required: false},
  registration_date: {type: Date, required: true},
});
Device.index({user: 1, uid: 1}, {unique: true});
Device.index({'info.profile_id': 1});
Device.methods.getPlatformName = function() {
  const platform = constants.device.platforms[_.toUpper(this.platform)];
  return platform ? platform.name : '';
};
Device.methods.isSmartphone = function() {
  return _.includes([constants.device.platforms.ANDROID.id], this.platform);
};
Device.methods.isAndroid = function() {
  return this.platform === constants.device.platforms.ANDROID.id;
};
Device.methods.isWeb = function() {
  return this.platform === constants.device.platforms.WEB.id;
};
Device.methods.isMessenger = function() {
  return this.platform === constants.device.platforms.MESSENGER.id;
};

const Agent = new Schema({
  id: {type: String, required: false},
  name: {type: String, required: false},
  photo_url: {type: String, required: false},
}, {_id: false});

const ChatMessage = new Schema({
  user: {type: ObjectId, ref: 'User', required: true, index: true},
  device: {type: ObjectId, ref: 'Device', required: true, index: true},
  agent: {type: Agent, required: false},
  text: {type: String, required: true},
  direction: {type: String, enum: _.values(constants.chatMessage.directions), required: true},
  date: {type: Date, required: true},
}, {collection: 'chat_messages'});
ChatMessage.index({date: 1}, {expireAfterSeconds: 7776000});

exports.Account = mongoose.model('Account', normalizeSchema(Account, (account) => {
  delete account.password;
}));
exports.App = mongoose.model('App', normalizeSchema(App));
exports.Integration = mongoose.model('Integration', normalizeSchema(Integration, (integration) => {
  if (_.has(integration, 'configuration.fcm.server_key')) {
    const serverKey = integration.configuration.fcm.server_key;
    const hiddenKey = '*************';
    integration.configuration.fcm.server_key = serverKey.length > 10 ? hiddenKey + serverKey.slice(-5) : hiddenKey;
  }
}));
exports.User = mongoose.model('User', normalizeSchema(User));
exports.Device = mongoose.model('Device', normalizeSchema(Device));
exports.ChatMessage = mongoose.model('ChatMessage', normalizeSchema(ChatMessage));
