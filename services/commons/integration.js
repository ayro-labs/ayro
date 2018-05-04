'use strict';

const {Integration} = require('../../models');
const errors = require('../../utils/errors');
const integrationQueries = require('../../utils/queries/integration');
const _ = require('lodash');

exports.addIntegration = async (app, channel, type, configuration) => {
  let integration = await integrationQueries.getIntegration(app, channel, {require: false});
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
  const integration = await integrationQueries.getIntegration(app, channel);
  if (!integration.configuration) {
    integration.configuration = {};
  }
  const newConfiguration = _.cloneDeep(integration.configuration);
  _.assign(newConfiguration, configuration);
  if (configuration.fcm && _.isEmpty(configuration.fcm)) {
    delete newConfiguration.fcm;
  }
  await integration.update({configuration: newConfiguration}, {runValidators: true});
  integration.configuration = newConfiguration;
  return integration;
};

exports.removeIntegration = async (app, channel) => {
  const integration = await integrationQueries.getIntegration(app, channel);
  await integration.remove();
};
