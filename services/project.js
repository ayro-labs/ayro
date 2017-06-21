'use strict';

let Project = require('../models').Project,
    ProjectSecretKey = require('../models').ProjectSecretKey,
    cryptography = require('../utils/cryptography'),
    modelUtils = require('../utils/model'),
    websiteIntegration = require('./integrations/website'),
    androidIntegration = require('./integrations/android'),
    iosIntegration = require('./integrations/ios'),
    slackIntegration = require('./integrations/slack'),
    Promise = require('bluebird');

exports.createProject = function(account, name) {
  return cryptography.generateId().then(function(token) {
    let project = new Project({
      account: account._id,
      name: name,
      token: token,
      registration_date: new Date()
    });
    return modelUtils.toObject(project.save());
  });
};

exports.getProject = function(id) {
  return Project.findById(id).lean().exec();
};

exports.getProjectByToken = function(token) {
  return Project.findOne({token: token}).lean().exec();
};

exports.listProjects = function(account) {
  return Project.find({account: account._id}).lean().exec();
};

exports.addWebsite = function(project, configuration) {
  return websiteIntegration.add(project, configuration);
};

exports.updateWebsite = function(project, configuration) {
  return websiteIntegration.update(project, configuration);
};

exports.removeWebsite = function(project) {
  return websiteIntegration.remove(project);
};

exports.addAndroid = function(project, configuration) {
  return androidIntegration.add(project, configuration);
};

exports.updateAndroid = function(project, configuration) {
  return androidIntegration.update(project, configuration);
};

exports.removeAndroid = function(project) {
  return androidIntegration.remove(project);
};

exports.addIOS = function(project, configuration) {
  return iosIntegration.add(project, configuration);
};

exports.updateIOS = function(project, configuration) {
  return iosIntegration.update(project, configuration);
};

exports.removeIOS = function(project) {
  return iosIntegration.remove(project);
};

exports.addSlack = function(project, configuration) {
  return slackIntegration.add(project, configuration);
};

exports.updateSlack = function(project, configuration) {
  return slackIntegration.update(project, configuration);
};

exports.removeSlack = function(project) {
  return slackIntegration.remove(project);
};

exports.listSlackChannels = function(project) {
  return slackIntegration.listChannels(project);
};

exports.createSlackChannel = function(project, channel) {
  return slackIntegration.createChannel(project, channel);
};