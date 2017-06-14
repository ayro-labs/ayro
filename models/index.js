'use strict';

let settings = require('../configs/settings'),
    mongoose = require('mongoose'),
    Promise  = require('bluebird');

let Schema = mongoose.Schema;
let ObjectId = Schema.Types.ObjectId;

mongoose.Promise = Promise;
mongoose.connect('mongodb://' + settings.database.host + ':' + settings.database.port + '/' + settings.database.schema);
mongoose.set('debug', settings.debug);

let Account = new Schema({
  first_name: String,
  last_name: String,
  email: String,
  password: String,
  picture: String,
  registration_date: Date
});

let AccountSecretKey = new Schema({
  account: {type: ObjectId, ref: 'Account'},
  secret: String,
  registration_date: Date
});

let Project = new Schema({
  account: {type: ObjectId, ref: 'Account'},
  name: String,
  token: String,
  registration_date: Date
});

let ProjectSecretKey = new Schema({
  project: {type: ObjectId, ref: 'Project'},
  secret: String,
  registration_date: Date
});

let Integration = new Schema({
  project: {type: ObjectId, ref: 'Project'},
  type: String,
  configuration: Object,
  registration_date: Date
});

let DeviceInfo = new Schema({
  model: String,
  carrier: String,
  os_name: String,
  os_version: String
});

let Device = new Schema({
  user: {type: ObjectId, ref: 'User'},
  uid: String,
  platform: String,
  app_id: String,
  app_version: String,
  push_token: String,
  info: DeviceInfo,
  registration_date: Date
});

let User = new Schema({
  project: {type: ObjectId, ref: 'Project'},
  uid: String,
  first_name: String,
  last_name: String,
  email: String,
  identified: Boolean,
  properties: Object,
  sign_up_date: Date,
  registration_date: Date
});
User.virtual('devices', {
  ref: 'Device',
  localField: '_id',
  foreignField: 'user'
});

exports.Account = mongoose.model('Account', Account);
exports.AccountSecretKey = mongoose.model('AccountSecretKey', AccountSecretKey);
exports.Project = mongoose.model('Project', Project);
exports.ProjectSecretKey = mongoose.model('ProjectSecretKey', ProjectSecretKey);
exports.Integration = mongoose.model('Integration', Integration);
exports.Device = mongoose.model('Device', Device);
exports.User = mongoose.model('User', User);