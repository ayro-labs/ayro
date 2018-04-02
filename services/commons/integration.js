const {Integration} = require('../../models');
const errors = require('../../utils/errors');
const queries = require('../../utils/queries');
const Promise = require('bluebird');
const _ = require('lodash');

const $ = this;

function throwIntegrationNotFoundIfNeeded(integration, options) {
  if (!integration && (!options || options.require)) {
    throw errors.notFoundError('integration.doesNotExist', 'Integration does not exist');
  }
}

exports.getIntegration = (app, channel, options) => {
  return Promise.coroutine(function* () {
    const promise = Integration.findOne({app: app.id, channel});
    queries.fillQuery(promise, options);
    const integration = yield promise.exec();
    throwIntegrationNotFoundIfNeeded(integration, options);
    return integration;
  })();
};

exports.findIntegration = (query, options) => {
  return Promise.coroutine(function* () {
    const promise = Integration.findOne(query);
    queries.fillQuery(promise, options);
    const integration = yield promise.exec();
    throwIntegrationNotFoundIfNeeded(integration, options);
    return integration;
  })();
};

exports.findIntegrations = (app, type, options) => {
  return Promise.resolve().then(() => {
    const promise = Integration.find(type ? {app: app.id, type} : {app: app.id});
    queries.fillQuery(promise, options);
    return promise.exec();
  });
};

exports.addIntegration = (app, channel, type, configuration) => {
  return Promise.coroutine(function* () {
    let integration = yield $.getIntegration(app, channel, {require: false});
    if (integration) {
      throw errors.ayroError('integration.alreadyExists', 'Integration already exists');
    }
    integration = new Integration({
      channel,
      type,
      configuration,
      app: app.id,
      registration_date: new Date(),
    });
    return integration.save();
  })();
};

exports.updateIntegration = (app, channel, configuration) => {
  return Promise.coroutine(function* () {
    const integration = yield $.getIntegration(app, channel);
    if (!integration.configuration) {
      integration.configuration = {};
    }
    _.assign(integration.configuration, configuration);
    if (configuration.fcm && _.isEmpty(configuration.fcm)) {
      delete integration.configuration['fcm'];
    }
    yield Integration.update({_id: integration.id}, {configuration: integration.configuration}).exec();
    return integration;
  })();
};

exports.removeIntegration = (app, channel) => {
  return Promise.coroutine(function* () {
    const integration = yield $.getIntegration(app, channel);
    yield Integration.remove({_id: integration.id});
  })();
};
