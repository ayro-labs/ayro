'use strict';

let appCommons = require('../commons/app'),
    errors = require('../../utils/errors'),
    App = require('../../models').App,
    _ = require('lodash');

let getIntegration = function(app, type) {
  let integration = app.getIntegration(type);
  if (!integration) {
    throw errors.notFoundError('integration.doesNotExist', 'Integration does not exist');
  }
  return integration;
};

exports.add = function(app, type, channel, configuration) {
  return appCommons.getApp(app.id).then(function(app) {
    if (app.getIntegration(type)) {
      throw errors.chatzError('integration.alreadyExists', 'Integration already exists');
    }
    app.integrations.push({
      type: type,
      channel: channel,
      configuration: configuration,
      registration_date: new Date()
    });
    return app.save();
  });
};

exports.update = function(app, type, configuration) {
  return appCommons.getApp(app.id).then(function(app) {
    let integration = getIntegration(app, type);
    _.assign(integration.configuration, configuration);
    return app.save();
  });
};

exports.remove = function(app, type) {
  return appCommons.getApp(app.id).then(function(app) {
    let integration = getIntegration(app, type);
    app.integrations.pull(integration.id);
    return app.save();
  });
};

exports.getConfiguration = function(app, type) {
  return appCommons.getApp(app.id).then(function(app) {
    let integration = getIntegration(app, type);
    return integration.configuration;
  });
};