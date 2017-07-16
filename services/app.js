const App = require('../models').App;
const constants = require('../utils/constants');
const cryptography = require('../utils/cryptography');
const integrations = require('./integrations');
const slackIntegration = require('./integrations/slack');
const appCommons = require('./commons/app');
const _ = require('lodash');

const CONFIG_WEBSITE = [];
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

exports.addWebsite = (app, configuration) => {
  return integrations.add(app, constants.integration.types.WEBSITE, constants.integration.channels.USER, _.pick(configuration, CONFIG_WEBSITE));
};

exports.updateWebsite = (app, configuration) => {
  return integrations.update(app, constants.integration.types.WEBSITE, _.pick(configuration, CONFIG_WEBSITE));
};

exports.removeWebsite = (app) => {
  return integrations.remove(app, constants.integration.types.WEBSITE);
};

exports.addAndroid = (app, configuration) => {
  return integrations.add(app, constants.integration.types.ANDROID, constants.integration.channels.USER, _.pick(configuration, CONFIG_ANDROID));
};

exports.updateAndroid = (app, configuration) => {
  return integrations.update(app, constants.integration.types.ANDROID, _.pick(configuration, CONFIG_ANDROID));
};

exports.removeAndroid = (app) => {
  return integrations.remove(app, constants.integration.types.ANDROID);
};

exports.addIOS = (app, configuration) => {
  return integrations.add(app, constants.integration.types.IOS, constants.integration.channels.USER, _.pick(configuration, CONFIG_IOS));
};

exports.updateIOS = (app, configuration) => {
  return integrations.update(app, constants.integration.types.IOS, _.pick(configuration, CONFIG_IOS));
};

exports.removeIOS = (app) => {
  return integrations.remove(app, constants.integration.types.IOS);
};

exports.addSlack = (app, apiToken) => {
  return slackIntegration.add(app, apiToken);
};

exports.updateSlack = (app, configuration) => {
  return integrations.update(app, constants.integration.types.SLACK, _.pick(configuration, CONFIG_SLACK_UPDATE));
};

exports.removeSlack = (app) => {
  return integrations.remove(app, constants.integration.types.SLACK);
};

exports.listSlackChannels = (app) => {
  return slackIntegration.listChannels(app);
};

exports.createSlackChannel = (app, channel) => {
  return slackIntegration.createChannel(app, channel);
};