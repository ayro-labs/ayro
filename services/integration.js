'use strict';

let Project = require('../models').Project,
    modelUtils = require('../utils/model'),
    errors = require('../utils/errors'),
    Promise = require('bluebird'),
    _ = require('lodash');

const CHANNEL_USER = 'user';
const CHANNEL_BUSINESS = 'business';

const TYPE_WEBSITE = 'website';
const TYPE_ANDROID = 'android';
const TYPE_IOS = 'ios';
const TYPE_SLACK = 'slack';

const CONFIG_ANDROID = ['fcm.server_key', 'fcm.sender_id'];
const CONFIG_SLACK = ['token', 'username', 'channel'];

let addIntegration = function(project, type, channel, configuration) {
  return Project.findById(project._id).exec().then(function(project) {
    if (!project) {
      throw errors.notFoundError('project.doesNotExist', 'Project does not exist');
    }
    if (project.getIntegrationOfType(type)) {
      throw errors.chatzError('integration.alreadyExists', 'Integration already exists');
    }
    project.integrations.push({
      project: project._id,
      type: type,
      channel: channel,
      configuration: configuration,
      registration_date: new Date()
    });
    return modelUtils.toObject(project.save());
  });
};

let updateIntegration = function(project, type, configuration) {
  return Project.findById(project._id).exec().then(function(project) {
    if (!project) {
      throw errors.notFoundError('project.doesNotExist', 'Project does not exist');
    }
    let integration = project.getIntegrationOfType(type);
    if (!integration) {
      throw errors.notFoundError('integration.doesNotExist', 'Integration does not exist');
    }
    integration.configuration = configuration;
    return modelUtils.toObject(project.save());
  });
};

let removeIntegration = function(project, type) {
  return Project.findById(project._id).exec().then(function(project) {
    if (!project) {
      throw errors.notFoundError('project.doesNotExist', 'Project does not exist');
    }
    let integration = project.getIntegrationOfType(type);
    if (!integration) {
      throw errors.notFoundError('integration.doesNotExist', 'Integration does not exist');
    }
    project.integrations.pull(integration._id);
    return modelUtils.toObject(project.save());
  });
};

exports.addWebsite = function(project, configuration) {
  return addIntegration(project, TYPE_WEBSITE, CHANNEL_USER, configuration);
};

exports.updateWebsite = function(project, configuration)   {
  return updateIntegration(project, TYPE_WEBSITE, configuration);
};

exports.removeWebsite = function(project)   {
  return removeIntegration(project, TYPE_WEBSITE);
};

exports.addAndroid = function(project, configuration) {
  return addIntegration(project, TYPE_ANDROID, CHANNEL_USER, _.pick(configuration, CONFIG_ANDROID));
};

exports.updateAndroid = function(project, configuration)   {
  return updateIntegration(project, TYPE_ANDROID, _.pick(configuration, CONFIG_ANDROID));
};

exports.removeAndroid = function(project)   {
  return removeIntegration(project, TYPE_ANDROID);
};

exports.addIOS = function(project, configuration) {
  return addIntegration(project, TYPE_IOS, CHANNEL_USER, configuration);
};

exports.updateIOS = function(project, configuration)   {
  return updateIntegration(project, TYPE_IOS, configuration);
};

exports.removeIOS = function(project)   {
  return removeIntegration(project, TYPE_IOS);
};

exports.addSlack = function(project, configuration) {
  return addIntegration(project, TYPE_SLACK, CHANNEL_BUSINESS, _.pick(configuration, CONFIG_SLACK));
};

exports.updateSlack = function(project, configuration)   {
  return updateIntegration(project, TYPE_SLACK, CHANNEL_BUSINESS, _.pick(configuration, CONFIG_SLACK));
};

exports.removeSlack = function(project)   {
  return removeIntegration(project, TYPE_SLACK);
};