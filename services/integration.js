'use strict';

const constants = require('utils/constants');
const integrationQueries = require('utils/queries/integration');
const integrationCommons = require('services/commons/integration');
const messengerIntegration = require('services/integrations/messenger');
const slackIntegration = require('services/integrations/slack');
const _ = require('lodash');

const CONFIG_WEBSITE = ['primary_color', 'conversation_color'];
const CONFIG_WORDPRESS = ['primary_color', 'conversation_color'];
const CONFIG_ANDROID = ['primary_color', 'conversation_color', 'fcm', 'fcm.server_key', 'fcm.sender_id'];
const DEFAULT_PRIMARY_COLOR = '#5c7382';
const DEFAULT_CONVERSATION_COLOR = '#007bff';

exports.getIntegration = async (app, channel, options) => {
  return integrationQueries.getIntegration(app, channel, options);
};

exports.addWebsiteIntegration = async (app) => {
  const configuration = {
    primary_color: DEFAULT_PRIMARY_COLOR,
    conversation_color: DEFAULT_CONVERSATION_COLOR,
  };
  return integrationCommons.addIntegration(app, constants.integration.channels.WEBSITE, constants.integration.types.USER, _.pick(configuration, CONFIG_WEBSITE));
};

exports.updateWebsiteIntegration = async (app, configuration) => {
  return integrationCommons.updateIntegration(app, constants.integration.channels.WEBSITE, _.pick(configuration, CONFIG_WEBSITE));
};

exports.removeWebsiteIntegration = async (app) => {
  return integrationCommons.removeIntegration(app, constants.integration.channels.WEBSITE);
};

exports.addWordPressIntegration = async (app) => {
  const configuration = {
    primary_color: DEFAULT_PRIMARY_COLOR,
    conversation_color: DEFAULT_CONVERSATION_COLOR,
  };
  return integrationCommons.addIntegration(app, constants.integration.channels.WORDPRESS, constants.integration.types.USER, _.pick(configuration, CONFIG_WORDPRESS));
};

exports.updateWordPressIntegration = async (app, configuration) => {
  return integrationCommons.updateIntegration(app, constants.integration.channels.WORDPRESS, _.pick(configuration, CONFIG_WORDPRESS));
};

exports.removeWordPressIntegration = async (app) => {
  return integrationCommons.removeIntegration(app, constants.integration.channels.WORDPRESS);
};

exports.addAndroidIntegration = async (app) => {
  const configuration = {
    primary_color: DEFAULT_PRIMARY_COLOR,
    conversation_color: DEFAULT_CONVERSATION_COLOR,
  };
  return integrationCommons.addIntegration(app, constants.integration.channels.ANDROID, constants.integration.types.USER, _.pick(configuration, CONFIG_ANDROID));
};

exports.updateAndroidIntegration = async (app, configuration) => {
  return integrationCommons.updateIntegration(app, constants.integration.channels.ANDROID, _.pick(configuration, CONFIG_ANDROID));
};

exports.removeAndroidIntegration = async (app) => {
  return integrationCommons.removeIntegration(app, constants.integration.channels.ANDROID);
};

exports.addMessengerIntegration = async (app, profile) => {
  return messengerIntegration.addIntegration(app, profile);
};

exports.updateMessengerIntegration = async (app, page) => {
  return messengerIntegration.updateIntegration(app, page);
};

exports.removeMessengerIntegration = async (app) => {
  return messengerIntegration.removeIntegration(app);
};

exports.listMessengerPages = async (app) => {
  return messengerIntegration.listPages(app);
};

exports.addSlackIntegration = async (app, accessToken) => {
  return slackIntegration.addIntegration(app, accessToken);
};

exports.updateSlackIntegration = async (app, channel) => {
  return slackIntegration.updateIntegration(app, channel);
};

exports.removeSlackIntegration = async (app) => {
  return slackIntegration.removeIntegration(app);
};

exports.listSlackChannels = async (app) => {
  return slackIntegration.listChannels(app);
};

exports.createSlackChannel = async (app, channel) => {
  return slackIntegration.createChannel(app, channel);
};
