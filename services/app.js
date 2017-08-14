const App = require('../models').App;
const settings = require('../configs/settings');
const constants = require('../utils/constants');
const cryptography = require('../utils/cryptography');
const errors = require('../utils/errors');
const integrations = require('./integrations');
const slackIntegration = require('./integrations/slack');
const appCommons = require('./commons/app');
const path = require('path');
const fs = require('fs');
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

exports.updateApp = (account, app, name) => {
  return appCommons.getApp(app.id).then((app) => {
    if (account.id !== app.account.toString()) {
      throw errors.chatzError('app.delete.noPermission', 'Account do not have permission to update this app');
    }
    return App.findByIdAndUpdate(app.id, {name}, {new: true, runValidators: true}).exec();
  });
};

exports.updateAppIcon = (account, app, icon) => {
  return appCommons.getApp(app.id).then((app) => {
    if (account.id !== app.account.toString()) {
      throw errors.chatzError('app.delete.noPermission', 'Account do not have permission to update this app');
    }
    const iconName = app.id + path.extname(icon.originalname);
    const iconPath = path.join(settings.appIconPath, iconName);
    return new Promise((resolve, reject) => {
      fs.rename(icon.path, iconPath, (err) => {
        if (err) {
          reject(errors.chatzError('app.update.error', 'Error updating app icon', err));
          return;
        }
        resolve(App.findByIdAndUpdate(app.id, {icon: iconName}, {new: true, runValidators: true}).exec());
      });
    });
  });
};

exports.deleteApp = (account, app) => {
  return appCommons.getApp(app.id).then((app) => {
    if (account.id !== app.account.toString()) {
      throw errors.chatzError('app.delete.noPermission', 'Account do not have permission to delete this app');
    }
    return App.remove({_id: app.id});
  });
};

exports.getApp = (id) => {
  return appCommons.getApp(id);
};

exports.getAppByToken = (token) => {
  return appCommons.findApp({token});
};

exports.listApps = (account) => {
  return App.find({account: account.id}).exec();
};

exports.addWebsiteIntegration = (app, configuration) => {
  return integrations.add(app, constants.integration.channels.WEBSITE, constants.integration.types.CUSTOMER, _.pick(configuration, CONFIG_WEBSITE));
};

exports.updateWebsiteIntegration = (app, configuration) => {
  return integrations.update(app, constants.integration.channels.WEBSITE, _.pick(configuration, CONFIG_WEBSITE));
};

exports.removeWebsiteIntegration = (app) => {
  return integrations.remove(app, constants.integration.channels.WEBSITE);
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

exports.addSlackIntegration = (app, accessToken) => {
  return slackIntegration.add(app, accessToken);
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
