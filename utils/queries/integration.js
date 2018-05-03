'use strict';

const {Integration} = require('../../models');
const errors = require('../errors');
const queries = require('../queries');

function throwIntegrationNotFoundIfNeeded(integration, options) {
  if (!integration && (!options || options.require)) {
    throw errors.notFoundError('integration_not_found', 'Integration not found');
  }
}

exports.getIntegration = async (app, channel, options) => {
  return this.findIntegration({app: app.id, channel}, options);
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
