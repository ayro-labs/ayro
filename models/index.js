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
    virtuals: true,
    transform: (doc, ret) => {
      return transform(ret, excludes);
    },
  });
  schema.set('toObject', {
    virtuals: true,
    transform: (doc, ret) => {
      return transform(ret, excludes);
    },
  });
  return schema;
}

const Account = new Schema({
  name: {type: String, required: true, trim: true},
  email: {type: String, required: true, trim: true, index: {unique: true}},
  password: {type: String, required: true},
  logo: {type: String, required: false},
  registration_date: {type: Date, required: true},
});

const App = new Schema({
  account: {type: ObjectId, ref: 'Account', required: true},
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
App.methods.getIntegration = function(channel) {
  return this.integrations.find(function(integration) {
    return integration.channel === channel;
  });
};
App.methods.listIntegrations = function(type) {
  return this.integrations.filter(function(integration) {
    return integration.type === type;
  });
};

const Integration = new Schema({
  app: {type: ObjectId, ref: 'App', required: true},
  type: {type: String, required: true, enum: _.values(constants.integration.types)},
  channel: {type: String, required: true, enum: _.values(constants.integration.channels)},
  configuration: {type: Object, required: false},
  registration_date: {type: Date, required: true},
});
Integration.index({app: 1, channel: 1}, {unique: true});
Integration.index({type: 1, 'configuration.page.id': 1});

const User = new Schema({
  app: {type: ObjectId, ref: 'App', required: true},
  uid: {type: String, required: true},
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
User.index({app: 1, uid: 1}, {unique: true});
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
  os_name: {type: String, required: false},
  os_version: {type: String, required: false},
  manufacturer: {type: String, required: false},
  model: {type: String, required: false},
  carrier: {type: String, required: false},
  // Web
  browser_name: {type: String, required: false},
  browser_version: {type: String, required: false},
  // Messenger
  profile_id: {type: String, required: false},
  profile_name: {type: String, required: false},
});

const Device = new Schema({
  user: {type: ObjectId, ref: 'User', required: true},
  uid: {type: String, required: true, index: {unique: true}},
  platform: {type: String, required: true},
  push_token: {type: String, required: false},
  info: {type: DeviceInfo, required: false},
  registration_date: {type: Date, required: true},
});
Device.methods.getPlatformName = function() {
  const platform = constants.device.platforms[_.toUpper(this.platform)];
  return platform ? platform.name : '';
};
Device.methods.isSmartphone = function() {
  return _.includes([constants.device.platforms.ANDROID.id, constants.device.platforms.IOS.id], this.platform);
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
});

const ChatMessage = new Schema({
  user: {type: ObjectId, ref: 'User', required: true},
  device: {type: ObjectId, ref: 'Device', required: true},
  agent: {type: Agent, required: false},
  text: {type: String, required: true},
  direction: {type: String, required: true, enum: _.values(constants.chatMessage.directions)},
  date: {type: Date, required: true},
}, {collection: 'chat_messages'});

exports.Account = mongoose.model('Account', customize(Account, ['password']));
exports.App = mongoose.model('App', customize(App));
exports.Integration = mongoose.model('Integration', customize(Integration));
exports.User = mongoose.model('User', customize(User));
exports.Device = mongoose.model('Device', customize(Device));
exports.ChatMessage = mongoose.model('ChatMessage', customize(ChatMessage));
