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

exports.add = (app, type, channel, configuration) => {
  return appCommons.getApp(app.id).then((app) => {
    if (app.getIntegration(type)) {
      throw errors.chatzError('integration.alreadyExists', 'Integration already exists');
    }
    app.integrations.push({type, channel, configuration, registration_date: new Date()});
    return app.save();
  });
};

exports.update = (app, type, configuration) => {
  return appCommons.getApp(app.id).then((app) => {
    const integration = getIntegration(app, type);
    _.assign(integration.configuration, configuration);
    return app.save();
  });
};

exports.remove = (app, type) => {
  return appCommons.getApp(app.id).then((app) => {
    const integration = getIntegration(app, type);
    app.integrations.pull(integration.id);
    return app.save();
  });
};

exports.getConfiguration = (app, type) => {
  return appCommons.getApp(app.id).then((app) => {
    const integration = getIntegration(app, type);
    return integration.configuration;
  });
};
