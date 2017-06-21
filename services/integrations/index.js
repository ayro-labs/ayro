'use strict';

let Project = require('../../models').Project,
    modelUtils = require('../../utils/model'),
    errors = require('../../utils/errors');

exports.add = function(project, type, channel, configuration) {
  return Project.findById(project._id).exec().then(function(project) {
    if (!project) {
      throw errors.notFoundError('project.doesNotExist', 'Project does not exist');
    }
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

exports.remove = function(project, type) {
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