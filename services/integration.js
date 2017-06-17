'use strict';

let Project = require('../models').Project,
    modelUtils = require('../utils/model'),
    errors = require('../utils/errors'),
    Promise = require('bluebird');

const CHANNEL_USER = 'user';
const CHANNEL_BUSINESS = 'business';

const TYPE_WEBSITE = 'website';
const TYPE_ANDROID = 'android';
const TYPE_IOS = 'ios';
const TYPE_SLACK = 'slack';

let addIntegration = function(project, type, configuration) {
  return Project.findById(project._id).exec().then(function(project) {
    if (project.getIntegrationOfType(type)) {
      throw errors.chatzError('integration.alreadyExists', 'Integration already exists');
    }
    project.integrations.push({
      project: project._id,
      type: type,
      registration_date: new Date(),
      configuration: configuration
    });
    return modelUtils.toObject(project.save());
  });
};

let updateIntegration = function(project, type, configuration) {
  return Project.findById(project._id).exec().then(function(project) {
    let integration = project.getIntegrationOfType(type);
    if (!integration) {
      throw errors.chatzError('integration.doesNotExist', 'Integration does not exist');
    }
    integration.configuration = configuration;
    return modelUtils.toObject(project.save());
  });
};

exports.addWebsite = function(project, configuration) {
  return addIntegration(project, TYPE_WEBSITE, CHANNEL_USER, configuration);
};

exports.updateWebsite = function(project, configuration)   {
  return updateIntegration(project, TYPE_WEBSITE, configuration);
};

exports.addAndroid = function(project, configuration) {
  return addIntegration(project, TYPE_ANDROID, CHANNEL_USER, configuration);
};

exports.updateAndroid = function(project, configuration)   {
  return updateIntegration(project, TYPE_ANDROID, configuration);
};

exports.addIOS = function(project, configuration) {
  return addIntegration(project, TYPE_IOS, CHANNEL_USER, configuration);
};

exports.updateIOS = function(project, configuration)   {
  return updateIntegration(project, TYPE_IOS, configuration);
};

exports.addSlack = function(project, configuration) {
  return addIntegration(project, TYPE_SLACK, CHANNEL_BUSINESS, configuration);
};

exports.updateSlack = function(project, configuration)   {
  return updateIntegration(project, TYPE_SLACK, CHANNEL_BUSINESS, configuration);
};