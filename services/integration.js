const integrationCommons = require('./commons/integration');
const websiteIntegration = require('./integrations/website');
const wordPressIntegration = require('./integrations/wordpress');
const androidIntegration = require('./integrations/android');
const messengerIntegration = require('./integrations/messenger');
const slackIntegration = require('./integrations/slack');

exports.getIntegration = async (app, channel, options) => {
  return integrationCommons.getIntegration(app, channel, options);
};

exports.addWebsiteIntegration = async (app) => {
  return websiteIntegration.addIntegration(app);
};

exports.updateWebsiteIntegration = async (app, configuration) => {
  return websiteIntegration.updateIntegration(app, configuration);
};

exports.removeWebsiteIntegration = async (app) => {
  return websiteIntegration.removeIntegration(app);
};

exports.addWordPressIntegration = async (app) => {
  return wordPressIntegration.addIntegration(app);
};

exports.updateWordPressIntegration = async (app, configuration) => {
  return wordPressIntegration.updateIntegration(app, configuration);
};

exports.removeWordPressIntegration = async (app) => {
  return wordPressIntegration.removeIntegration(app);
};

exports.addAndroidIntegration = async (app) => {
  return androidIntegration.addIntegration(app);
};

exports.updateAndroidIntegration = async (app, configuration) => {
  return androidIntegration.updateIntegration(app, configuration);
};

exports.removeAndroidIntegration = async (app) => {
  return androidIntegration.removeIntegration(app);
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
