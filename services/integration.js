const integrationCommons = require('./commons/integration');
const websiteIntegration = require('./integrations/website');
const androidIntegration = require('./integrations/android');
const messengerIntegration = require('./integrations/messenger');
const slackIntegration = require('./integrations/slack');

exports.getIntegration = (app, channel, options) => {
  return integrationCommons.getIntegration(app, channel, options);
};

exports.addWebsiteIntegration = (app) => {
  return websiteIntegration.addIntegration(app);
};

exports.updateWebsiteIntegration = (app, configuration) => {
  return websiteIntegration.updateIntegration(app, configuration);
};

exports.removeWebsiteIntegration = (app) => {
  return websiteIntegration.removeIntegration(app);
};

exports.addAndroidIntegration = (app) => {
  return androidIntegration.addIntegration(app);
};

exports.updateAndroidIntegration = (app, configuration) => {
  return androidIntegration.updateIntegration(app, configuration);
};

exports.removeAndroidIntegration = (app) => {
  return androidIntegration.removeIntegration(app);
};

exports.addMessengerIntegration = (app, profile) => {
  return messengerIntegration.addIntegration(app, profile);
};

exports.updateMessengerIntegration = (app, page) => {
  return messengerIntegration.updateIntegration(app, page);
};

exports.removeMessengerIntegration = (app) => {
  return messengerIntegration.removeIntegration(app);
};

exports.listMessengerPages = (app) => {
  return messengerIntegration.listPages(app);
};

exports.addSlackIntegration = (app, accessToken) => {
  return slackIntegration.addIntegration(app, accessToken);
};

exports.updateSlackIntegration = (app, channel) => {
  return slackIntegration.updateIntegration(app, channel);
};

exports.removeSlackIntegration = (app) => {
  return slackIntegration.removeIntegration(app);
};

exports.listSlackChannels = (app) => {
  return slackIntegration.listChannels(app);
};

exports.createSlackChannel = (app, channel) => {
  return slackIntegration.createChannel(app, channel);
};
