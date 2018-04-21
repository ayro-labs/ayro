'use strict';

const {Integration} = require('../../models');
const errors = require('../../utils/errors');
const queries = require('../../utils/queries');
const _ = require('lodash');

const $ = this;

function throwIntegrationNotFoundIfNeeded(integration, options) {
  if (!integration && (!options || options.require)) {
    throw errors.notFoundError('integration_not_found', 'Integration not found');
  }
}

exports.getIntegration = async (app, channel, options) => {
  const promise = Integration.findOne({app: app.id, channel});
  queries.fillQuery(promise, options);
  const integration = await promise.exec();
  throwIntegrationNotFoundIfNeeded(integration, options);
  return integration;
};

exports.findIntegration = async (query, options) => {
  const promise = Integration.findOne(query);
  queries.fillQuery(promise, options);
  const integration = await promise.exec();
  throwIntegrationNotFoundIfNeeded(integration, options);
  return integration;
};

exports.findIntegrations = async (app, type, options) => {
  const promise = Integration.find(type ? {app: app.id, type} : {app: app.id});
  queries.fillQuery(promise, options);
  return promise.exec();
};

exports.addIntegration = async (app, channel, type, configuration) => {
  let integration = await $.getIntegration(app, channel, {require: false});
  if (integration) {
    throw errors.ayroError('integration_already_exists', 'Integration already exists');
  }
  integration = new Integration({
    channel,
    type,
    configuration,
    app: app.id,
    registration_date: new Date(),
  });
  return integration.save();
};

exports.updateIntegration = async (app, channel, configuration) => {
  const integration = await $.getIntegration(app, channel);
  if (!integration.configuration) {
    integration.configuration = {};
  }
  _.assign(integration.configuration, configuration);
  if (configuration.fcm && _.isEmpty(configuration.fcm)) {
    delete integration.configuration.fcm;
  }
  await Integration.update({_id: integration.id}, {configuration: integration.configuration}).exec();
  return integration;
};

exports.removeIntegration = async (app, channel) => {
  const integration = await $.getIntegration(app, channel);
  await Integration.remove({_id: integration.id});
};
