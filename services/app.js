const App = require('../models').App;
const constants = require('../utils/constants');
const cryptography = require('../utils/cryptography');
const errors = require('../utils/errors');
const integrations = require('./integrations');
const slackIntegration = require('./integrations/slack');
const appCommons = require('./commons/app');
const _ = require('lodash');

const CONFIG_WEB = [];
const CONFIG_ANDROID = ['fcm.server_key', 'fcm.sender_id'];
const CONFIG_IOS = [];
const CONFIG_SLACK_UPDATE = ['channel', 'channel_id'];

exports.createApp = (account, name) => {
  return cryptography.generateId().then((token) => {
    const app = new App({
      account: account.id,
      name,
      token,
      registration_date: new Date(),
    });
    return app.save();
  });
};

exports.deleteApp = (account, app) => {
  return appCommons.getApp(app.id).then((app) => {
    if (account.id !== app.account.id) {
      throw errors.chatzError('app.delete.noPermission', 'Account do not have permission to delete this app');
    }
    return App.remove({_id: app.id});
  });
};

exports.getApp = (id) => {
  return App.findById(id).exec();
};

exports.getAppByToken = (token) => {
  return App.findOne({token}).exec();
};

exports.listApps = (account) => {
  return App.find({account: account.id}).exec();
};

exports.addWebIntegration = (app, configuration) => {
  return integrations.add(app, constants.integration.channels.WEB, constants.integration.types.CUSTOMER, _.pick(configuration, CONFIG_WEB));
};

exports.updateWebIntegration = (app, configuration) => {
  return integrations.update(app, constants.integration.channels.WEB, _.pick(configuration, CONFIG_WEB));
};

exports.removeWebIntegration = (app) => {
  return integrations.remove(app, constants.integration.channels.WEB);
};

exports.addAndroidIntegration = (app, configuration) => {
  return integrations.add(app, constants.integration.channels.ANDROID, constants.integration.types.CUSTOMER, _.pick(configuration, CONFIG_ANDROID));
};

exports.updateAndroidIntegration = (app, configuration) => {
  return integrations.update(app, constants.integration.channels.ANDROID, _.pick(configuration, CONFIG_ANDROID));
};

exports.removeAndroidIntegration = (app) => {
  return integrations.remove(app, constants.integration.channels.ANDROID);
};

exports.addIOSIntegration = (app, configuration) => {
  return integrations.add(app, constants.integration.channels.IOS, constants.integration.types.CUSTOMER, _.pick(configuration, CONFIG_IOS));
};

exports.updateIOSIntegration = (app, configuration) => {
  return integrations.update(app, constants.integration.channels.IOS, _.pick(configuration, CONFIG_IOS));
};

exports.removeIOSIntegration = (app) => {
  return integrations.remove(app, constants.integration.channels.IOS);
};

exports.addSlackIntegration = (app, apiToken) => {
  return slackIntegration.add(app, apiToken);
};

exports.updateSlackIntegration = (app, configuration) => {
  return integrations.update(app, constants.integration.channels.SLACK, _.pick(configuration, CONFIG_SLACK_UPDATE));
};

exports.removeSlackIntegration = (app) => {
  return integrations.remove(app, constants.integration.channels.SLACK);
};

exports.listSlackChannels = (app) => {
  return slackIntegration.listChannels(app);
};

exports.createSlackChannel = (app, channel) => {
  return slackIntegration.createChannel(app, channel);
};
