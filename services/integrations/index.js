const appCommons = require('../commons/app');
const errors = require('../../utils/errors');
const _ = require('lodash');

const getIntegration = (app, type) => {
  const integration = app.getIntegration(type);
  if (!integration) {
    throw errors.notFoundError('integration.doesNotExist', 'Integration does not exist');
  }
  return integration;
};

exports.add = (app, channel, type, configuration) => {
  return appCommons.getApp(app.id).then((app) => {
    if (app.getIntegration(channel)) {
      throw errors.chatzError('integration.alreadyExists', 'Integration already exists');
    }
    app.integrations.push({
      channel,
      type,
      configuration,
      registration_date: new Date(),
    });
    return app.save();
  });
};

exports.update = (app, channel, configuration) => {
  return appCommons.getApp(app.id).then((app) => {
    const integration = getIntegration(app, channel);
    if (!integration) {
      throw errors.notFoundError('integration.doesNotExist', 'Integration does not exist');
    }
    if (!integration.configuration) {
      integration.configuration = {};
    }
    _.assign(integration.configuration, configuration);
    return app.save();
  });
};

exports.remove = (app, channel) => {
  return appCommons.getApp(app.id).then((app) => {
    const integration = getIntegration(app, channel);
    if (!integration) {
      throw errors.notFoundError('integration.doesNotExist', 'Integration does not exist');
    }
    app.integrations.pull(integration.id);
    return app.save();
  });
};

exports.getConfiguration = (app, channel) => {
  return appCommons.getApp(app.id).then((app) => {
    const integration = getIntegration(app, channel);
    return integration.configuration;
  });
};
