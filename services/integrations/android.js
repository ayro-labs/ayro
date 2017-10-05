const constants = require('../../utils/constants');
const integrationCommons = require('../commons/integration');
const _ = require('lodash');

const CONFIG_ANDROID = ['primary_color', 'conversation_color', 'fcm.server_key', 'fcm.sender_id'];
const DEFAULT_PRIMARY_COLOR = '#007bff';
const DEFAULT_CONVERSATION_COLOR = '#007bff';

exports.addIntegration = (app) => {
  return Promise.resolve().then(() => {
    const configuration = {
      primary_color: DEFAULT_PRIMARY_COLOR,
      conversation_color: DEFAULT_CONVERSATION_COLOR,
    };
    return integrationCommons.add(app, constants.integration.channels.ANDROID, constants.integration.types.USER, _.pick(configuration, CONFIG_ANDROID));
  });
};

exports.updateIntegration = (app, configuration) => {
  return integrationCommons.updateIntegration(app, constants.integration.channels.ANDROID, _.pick(configuration, CONFIG_ANDROID));
};

exports.removeIntegration = (app) => {
  return integrationCommons.removeIntegration(app, constants.integration.channels.ANDROID);
};

