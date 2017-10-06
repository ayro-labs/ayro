const Integration = require('../../models').Integration;
const errors = require('../../utils/errors');
const Promise = require('bluebird');
const _ = require('lodash');

function fillQuery(promise, options) {
  if (options) {
    if (!_.has(options, 'require')) {
      options.require = true;
    }
    if (options.populate) {
      promise.populate(options.populate);
    }
    if (options.lean) {
      promise.lean();
    }
  }
}

function throwIntegrationNotFoundIfNeeded(integration, options) {
  if (!integration && (!options || options.require)) {
    throw errors.notFoundError('integration.doesNotExist', 'Integration does not exist');
  }
}

exports.listIntegrations = (app, type, options) => {
  return Promise.resolve().then(() => {
    const promise = Integration.find(type ? {app: app.id, type} : {app: app.id});
    fillQuery(promise, options);
    return promise.exec();
  }).then((integration) => {
    throwIntegrationNotFoundIfNeeded(integration, options);
    return integration;
  });
};

exports.getIntegration = (app, channel, options) => {
  return Promise.resolve().then(() => {
    const promise = Integration.findOne({app: app.id, channel});
    fillQuery(promise, options);
    return promise.exec();
  }).then((integration) => {
    throwIntegrationNotFoundIfNeeded(integration, options);
    return integration;
  });
};

exports.addIntegration = (app, channel, type, configuration) => {
  return this.getIntegration(app, channel, {require: false}).then((currentIntegration) => {
    if (currentIntegration) {
      throw errors.chatzError('integration.alreadyExists', 'Integration already exists');
    }
    const integration = new Integration({
      channel,
      type,
      configuration,
      app: app.id,
      registration_date: new Date(),
    });
    return integration.save();
  });
};

exports.updateIntegration = (app, channel, configuration) => {
  return this.getIntegration(app, channel, {require: true}).then((integration) => {
    if (!integration.configuration) {
      integration.configuration = {};
    }
    _.assign(integration.configuration, configuration);
    return Integration.updateOne({_id: integration.id}, integration.configuration).exec().then(() => {
      return integration;
    });
  });
};

exports.removeIntegration = (app, channel) => {
  return this.getIntegration(app, channel, {require: true}).then((integration) => {
    return Integration.remove({_id: integration.id});
  });
};
