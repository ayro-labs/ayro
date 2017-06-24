'use strict';

let App = require('../models').App,
    AppSecretKey = require('../models').AppSecretKey,
    cryptography = require('../utils/cryptography'),
    modelUtils = require('../utils/model'),
    websiteIntegration = require('./integrations/website'),
    androidIntegration = require('./integrations/android'),
    iosIntegration = require('./integrations/ios'),
    slackIntegration = require('./integrations/slack'),
    Promise = require('bluebird');

exports.createApp = function(account, name) {
  return cryptography.generateId().then(function(token) {
    let app = new App({
      account: account._id,
      name: name,
      token: token,
      registration_date: new Date()
    });
    return modelUtils.toObject(app.save());
  });
};

exports.getApp = function(id) {
  return App.findById(id).lean().exec();
};

exports.getAppByToken = function(token) {
  return App.findOne({token: token}).lean().exec();
};

exports.listApps = function(account) {
  return App.find({account: account._id}).lean().exec();
};

exports.addWebsite = function(app, configuration) {
  return websiteIntegration.add(app, configuration);
};

exports.updateWebsite = function(app, configuration) {
  return websiteIntegration.update(app, configuration);
};

exports.removeWebsite = function(app) {
  return websiteIntegration.remove(app);
};

exports.addAndroid = function(app, configuration) {
  return androidIntegration.add(app, configuration);
};

exports.updateAndroid = function(app, configuration) {
  return androidIntegration.update(app, configuration);
};

exports.removeAndroid = function(app) {
  return androidIntegration.remove(app);
};

exports.addIOS = function(app, configuration) {
  return iosIntegration.add(app, configuration);
};

exports.updateIOS = function(app, configuration) {
  return iosIntegration.update(app, configuration);
};

exports.removeIOS = function(app) {
  return iosIntegration.remove(app);
};

exports.addSlack = function(app, configuration) {
  return slackIntegration.add(app, configuration);
};

exports.updateSlack = function(app, configuration) {
  return slackIntegration.update(app, configuration);
};

exports.removeSlack = function(app) {
  return slackIntegration.remove(app);
};

exports.listSlackChannels = function(app) {
  return slackIntegration.listChannels(app);
};

exports.createSlackChannel = function(app, channel) {
  return slackIntegration.createChannel(app, channel);
};