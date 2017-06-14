'use strict';

let settings = require('../configs/settings'),
    mongoose = require('mongoose'),
    Promise  = require('bluebird');

let Schema = mongoose.Schema;
let ObjectId = mongoose.Schema.Types.ObjectId;

mongoose.Promise = Promise;
mongoose.connect('mongodb://' + settings.database.host + ':' + settings.database.port + '/' + settings.database.schema);
mongoose.set('debug', settings.debug);

exports.Account = mongoose.model('Account', {
  first_name: String,
  last_name: String,
  email: String,
  password: String,
  picture: String,
  registration_date: Date
});

exports.AccountSecretKey = mongoose.model('AccountSecretKey', {
  account: {type: ObjectId, ref: 'Account'},
  secret: String,
  registration_date: Date
});

exports.Project = mongoose.model('Project', {
  account: {type: ObjectId, ref: 'Account'},
  name: String,
  token: String,
  registration_date: Date
});

exports.ProjectSecretKey = mongoose.model('ProjectSecretKey', {
  project: {type: ObjectId, ref: 'Project'},
  secret: String,
  registration_date: Date
});

exports.Integration = mongoose.model('Integration', {
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
  uid: String,
  platform: String,
  app_id: String,
  app_version: String,
  push_token: String,
  info: DeviceInfo,
  registration_date: Date
});

exports.Customer = mongoose.model('Customer', {
  project: {type: ObjectId, ref: 'Project'},
  uid: String,
  first_name: String,
  last_name: String,
  email: String,
  identified: Boolean,
  properties: Object,
  devices: [Device],
  sign_up_date: Date,
  registration_date: Date
});