'use strict';

let projectCommons = require('../commons/project'),
    modelUtils = require('../../utils/model'),
    errors = require('../../utils/errors'),
    Project = require('../../models').Project;

let getIntegration = function(project, type) {
  let integration = project.getIntegrationOfType(type);
  if (!integration) {
    throw errors.notFoundError('integration.doesNotExist', 'Integration does not exist');
  }
  return integration;
};

exports.add = function(project, type, channel, configuration) {
  return projectCommons.getProject(project._id).then(function(project) {
    if (project.getIntegrationOfType(type)) {
      throw errors.chatzError('integration.alreadyExists', 'Integration already exists');
    }
    project.integrations.push({
      type: type,
      channel: channel,
      configuration: configuration,
      registration_date: new Date()
    });
    return modelUtils.toObject(project.save());
  });
};

exports.update = function(project, type, configuration) {
  return projectCommons.getProject(project._id).then(function(project) {
    let integration = getIntegration(project, type);
    integration.configuration = configuration;
    return modelUtils.toObject(project.save());
  });
};

exports.remove = function(project, type) {
  return projectCommons.getProject(project._id).then(function(project) {
    let integration = getIntegration(project, type);
    project.integrations.pull(integration._id);
    return modelUtils.toObject(project.save());
  });
};

exports.getConfiguration = function(project, type) {
  return projectCommons.getProject(project._id).then(function(project) {
    let integration = getIntegration(project, type);
    return integration.configuration;
  });
};