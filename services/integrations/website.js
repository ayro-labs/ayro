'use strict';

const constants = require('../../utils/constants');
const integrationCommons = require('../commons/integration');
const _ = require('lodash');

const CONFIG_WEBSITE = ['primary_color', 'conversation_color'];
const DEFAULT_PRIMARY_COLOR = '#5c7382';
const DEFAULT_CONVERSATION_COLOR = '#007bff';

exports.addIntegration = async (app) => {
  const configuration = {
    primary_color: DEFAULT_PRIMARY_COLOR,
    conversation_color: DEFAULT_CONVERSATION_COLOR,
  };
  return integrationCommons.addIntegration(app, constants.integration.channels.WEBSITE, constants.integration.types.USER, _.pick(configuration, CONFIG_WEBSITE));
};

exports.updateIntegration = async (app, configuration) => {
  return integrationCommons.updateIntegration(app, constants.integration.channels.WEBSITE, _.pick(configuration, CONFIG_WEBSITE));
};

exports.removeIntegration = async (app) => {
  return integrationCommons.removeIntegration(app, constants.integration.channels.WEBSITE);
};
