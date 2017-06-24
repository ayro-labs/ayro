'use strict';

let appCommons = require('../commons/app'),
    modelUtils = require('../../utils/model'),
    errors = require('../../utils/errors'),
    App = require('../../models').App,
    _ = require('lodash');

let getIntegration = function(app, type) {
  let integration = app.getIntegrationOfType(type);
  if (!integration) {
    throw errors.notFoundError('integration.doesNotExist', 'Integration does not exist');
  }
  return integration;
};

exports.add = function(app, type, channel, configuration) {
  return appCommons.getApp(app._id).then(function(app) {
    if (app.getIntegrationOfType(type)) {
      throw errors.chatzError('integration.alreadyExists', 'Integration already exists');
    }
    app.integrations.push({
      type: type,
      channel: channel,
      configuration: configuration,
      registration_date: new Date()
    });
    return modelUtils.toObject(app.save());
  });
};

exports.update = function(app, type, configuration) {
  return appCommons.getApp(app._id).then(function(app) {
    let integration = getIntegration(app, type);
    _.assign(integration.configuration, configuration);
    return modelUtils.toObject(app.save());
  });
};

exports.remove = function(app, type) {
  return appCommons.getApp(app._id).then(function(app) {
    let integration = getIntegration(app, type);
    app.integrations.pull(integration._id);
    return modelUtils.toObject(app.save());
  });
};

exports.getConfiguration = function(app, type) {
  return appCommons.getApp(app._id).then(function(app) {
    let integration = getIntegration(app, type);
    return integration.configuration;
  });
};