'use strict';

let App = require('../models').App,
    AppSecretKey = require('../models').AppSecretKey,
    constants = require('../utils/constants'),
    cryptography = require('../utils/cryptography'),
    integrations = require('./integrations'),
    slackIntegration = require('./integrations/slack'),
    Promise = require('bluebird'),
    _ = require('lodash');

const CONFIG_WEBSITE = [];
const CONFIG_ANDROID = ['fcm.server_key', 'fcm.sender_id'];
const CONFIG_IOS = [];

exports.createApp = function(account, name) {
  return cryptography.generateId().then(function(token) {
    let app = new App({
      account: account.id,
      name: name,
      token: token,
      registration_date: new Date()
    });
    return app.save();
  });
};

exports.getApp = function(id) {
  return App.findById(id).exec();
};

exports.getAppByToken = function(token) {
  return App.findOne({token: token}).exec();
};

exports.listApps = function(account) {
  return App.find({account: account.id}).exec();
};

exports.addWebsite = function(app, configuration) {
  return integrations.add(app, constants.integration.types.WEBSITE, constants.integration.channels.USER, _.pick(configuration, CONFIG_WEBSITE));
};

exports.updateWebsite = function(app, configuration) {
  return integrations.update(app, constants.integration.types.WEBSITE, _.pick(configuration, CONFIG_WEBSITE));
};

exports.removeWebsite = function(app) {
  return integrations.remove(app, constants.integration.types.WEBSITE);
};

exports.addAndroid = function(app, configuration) {
  return integrations.add(app, constants.integration.types.ANDROID, constants.integration.channels.USER, _.pick(configuration, CONFIG_ANDROID));
};

exports.updateAndroid = function(app, configuration) {
  return integrations.update(app, constants.integration.types.ANDROID, _.pick(configuration, CONFIG_ANDROID));
};

exports.removeAndroid = function(app) {
  return integrations.remove(app, constants.integration.types.ANDROID);
};

exports.addIOS = function(app, configuration) {
  return integrations.add(app, constants.integration.types.IOS, constants.integration.channels.USER, _.pick(configuration, CONFIG_IOS));
};

exports.updateIOS = function(app, configuration) {
  return integrations.update(app, constants.integration.types.IOS, _.pick(configuration, CONFIG_IOS));
};

exports.removeIOS = function(app) {
  return integrations.remove(app, constants.integration.types.IOS);
};

exports.addSlack = function(app, apiToken) {
  return slackIntegration.add(app, apiToken);
};

exports.updateSlack = function(app, configuration) {
  return integrations.update(app, constants.integration.types.SLACK, _.pick(configuration, CONFIG_SLACK_UPDATE));
};

exports.removeSlack = function(app) {
  return integrations.remove(app, constants.integration.types.SLACK);
};

exports.listSlackChannels = function(app) {
  return slackIntegration.listChannels(app);
};

exports.createSlackChannel = function(app, channel) {
  return slackIntegration.createChannel(app, channel);
};