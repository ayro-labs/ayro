const settings = require('../configs/settings');
const constants = require('../utils/constants');
const logger = require('../utils/logger');
const mongoose = require('mongoose');
const Promise = require('bluebird');
const _ = require('lodash');

const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

mongoose.Promise = Promise;
mongoose.set('debug', settings.database.debug);
mongoose.connect(`mongodb://${settings.database.host}:${settings.database.port}/${settings.database.schema}`, {
  useMongoClient: true,
}).catch((err) => {
  logger.error('Could not connect to mongodb.', err);
  process.exit(1);
});

function transform(ret, excludes) {
  ret.id = ret._id;
  _.forEach(excludes, (exclude) => {
    delete ret[exclude];
  });
  delete ret._id;
  delete ret.__v;
  return ret;
}

function customize(schema, excludes) {
  schema.virtual('id').set(function(id) {
    this.set('_id', id);
  });
  schema.set('toJSON', {
    transform: (doc, ret) => {
      return transform(ret, excludes);
    },
  });
  schema.set('toObject', {
    transform: (doc, ret) => {
      return transform(ret, excludes);
    },
  });
  return schema;
}

const Account = new Schema({
  first_name: {type: String, required: true, trim: true},
  last_name: {type: String, required: false, trim: true},
  email: {type: String, required: true, trim: true},
  password: {type: String, required: true},
  picture: {type: String, required: false},
  registration_date: {type: Date, required: true},
});

const AccountSecretKey = new Schema({
  account: {type: ObjectId, ref: 'Account', required: true},
  secret: {type: String, required: true},
  registration_date: {type: Date, required: true},
});

const Integration = new Schema({
  type: {type: String, required: true, enum: _.values(constants.integration.types)},
  channel: {type: String, required: true, enum: _.values(constants.integration.channels)},
  configuration: {type: Object, required: true},
  registration_date: {type: Date, required: true},
});

const App = new Schema({
  account: {type: ObjectId, ref: 'Account', required: true},
  name: {type: String, required: true, trim: true},
  token: {type: String, required: true},
  integrations: {type: [Integration], required: false},
  registration_date: {type: Date, required: true},
});
App.methods.getIntegration = function(type) {
  return this.integrations.find(function(integration) {
    return integration.type === type;
  });
};
App.methods.listIntegrationsOfChannel = function(channel) {
  return this.integrations.filter(function(integration) {
    return integration.channel === channel;
  });
};

const AppSecretKey = new Schema({
  app: {type: ObjectId, ref: 'App', required: true},
  secret: {type: String, required: true},
  registration_date: {type: Date, required: true},
});

const Author = new Schema({
  id: {type: String, required: false},
  name: {type: String, required: false},
  photo_url: {type: String, required: false},
});

const ChatMessage = new Schema({
  device: {type: ObjectId, ref: 'Device', required: true},
  author: {type: Author, required: false},
  text: {type: String, required: true},
  direction: {type: String, required: true, enum: _.values(constants.chatMessage.directions)},
  date: {type: Date, required: true},
}, {collection: 'chat_messages'});

const DeviceInfo = new Schema({
  // Android & iOS
  app_id: {type: String, required: false},
  app_version: {type: String, required: false},
  os_name: {type: String, required: false},
  os_version: {type: String, required: false},
  manufacturer: {type: String, required: false},
  model: {type: String, required: false},
  carrier: {type: String, required: false},
  // Web
  browser_name: {type: String, required: false},
  browser_version: {type: String, required: false},
});

const Device = new Schema({
  user: {type: ObjectId, ref: 'User', required: true},
  uid: {type: String, required: true},
  platform: {type: String, required: true},
  push_token: {type: String, required: false},
  info: {type: DeviceInfo, required: false},
  registration_date: {type: Date, required: true},
});
Device.methods.getPlatformName = function() {
  if (this.platform === constants.device.platforms.IOS) {
    return 'iOS';
  }
  return _.capitalize(this.platform);
};
Device.methods.isSmartphone = function() {
  return _.includes([constants.device.platforms.ANDROID, constants.device.platforms.IOS], this.platform);
};
Device.methods.isAndroid = function() {
  return this.platform === constants.device.platforms.ANDROID;
};
Device.methods.isIOS = function() {
  return this.platform === constants.device.platforms.IOS;
};
Device.methods.isWeb = function() {
  return this.platform === constants.device.platforms.WEB;
};

const User = new Schema({
  app: {type: ObjectId, ref: 'App', required: true},
  uid: {type: String, required: true, index: true},
  first_name: {type: String, required: false, trim: true},
  last_name: {type: String, required: false, trim: true},
  email: {type: String, required: false, trim: true},
  photo_url: {type: String, required: false},
  identified: {type: String, required: true},
  name_generated: {type: String, required: true},
  properties: {type: Object, required: false},
  extra: {type: Object, required: false},
  sign_up_date: {type: Date, required: false},
  latest_device: {type: ObjectId, ref: 'Device', required: false},
  registration_date: {type: Date, required: true},
});
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

exports.Account = mongoose.model('Account', customize(Account, ['password']));
exports.AccountSecretKey = mongoose.model('AccountSecretKey', customize(AccountSecretKey));
exports.App = mongoose.model('App', customize(App));
exports.AppSecretKey = mongoose.model('AppSecretKey', customize(AppSecretKey));
exports.ChatMessage = mongoose.model('ChatMessage', customize(ChatMessage));
exports.Device = mongoose.model('Device', customize(Device));
exports.User = mongoose.model('User', customize(User));
