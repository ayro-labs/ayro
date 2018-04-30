'use strict';

const {App, AppSecret, Integration} = require('../models');
const {User, Device, ChatMessage} = require('../models');
const settings = require('../configs/settings');
const hash = require('../utils/hash');
const files = require('../utils/files');
const appCommons = require('./commons/app');
const path = require('path');
const fs = require('fs');
const Promise = require('bluebird');
const _ = require('lodash');

const ALLOWED_ATTRS = ['name'];

const unlinkAsync = Promise.promisify(fs.unlink);

function getAppPopulateOption(withIntegrations, withPlugins) {
  const populate = [];
  if (withIntegrations) {
    populate.push('integrations');
  }
  if (withPlugins) {
    populate.push('plugins');
  }
  return populate;
}

exports.listApps = async (account, withIntegrations, withPlugins) => {
  return appCommons.findApps({account: account.id}, {populate: getAppPopulateOption(withIntegrations, withPlugins)});
};

exports.getApp = async (id, withIntegrations, withPlugins) => {
  return appCommons.getApp(id, {populate: getAppPopulateOption(withIntegrations, withPlugins)});
};

exports.appExists = async (query) => {
  const count = await App.count({query});
  return count > 0;
};

exports.getAppByToken = async (token, withIntegrations, withPlugins) => {
  return appCommons.findApp({token}, {populate: getAppPopulateOption(withIntegrations, withPlugins)});
};

exports.createApp = async (account, name) => {
  const token = await hash.token();
  const app = new App({name, token, account: account.id, registration_date: new Date()});
  return app.save();
};

exports.updateApp = async (app, data) => {
  const loadedApp = await appCommons.getApp(app.id);
  const attrs = _.pick(data, ALLOWED_ATTRS);
  await loadedApp.update(attrs, {runValidators: true});
  loadedApp.set(attrs);
  return loadedApp;
};

exports.updateIcon = async (app, iconFile) => {
  const loadedApp = await appCommons.getApp(app.id);
  const oldIconPath = loadedApp.icon ? path.join(settings.appIconPath, loadedApp.icon) : null;
  const icon = await files.fixAppIcon(loadedApp, iconFile.path);
  await loadedApp.update({icon}, {runValidators: true});
  loadedApp.icon = icon;
  if (oldIconPath) {
    await unlinkAsync(oldIconPath);
  }
  return loadedApp;
};

exports.deleteApp = async (app) => {
  const loadedApp = await appCommons.getApp(app.id);
  const users = await User.find({app: loadedApp.id}).select({_id: 1});
  const usersIds = users.map((user) => {
    return user.id;
  });
  await ChatMessage.remove({user: {$in: usersIds}});
  await Device.remove({user: {$in: usersIds}});
  await User.remove({app: loadedApp.id});
  await Integration.remove({app: loadedApp.id});
  await App.remove({_id: loadedApp.id});
};

exports.listAppSecrets = async (app) => {
  const loadedApp = await appCommons.getApp(app.id);
  const appSecrets = await AppSecret.find({app: loadedApp.id});
  return appSecrets;
};

exports.createAppSecret = async (app) => {
  const loadedApp = await appCommons.getApp(app.id);
  const appSecret = new AppSecret({
    app: loadedApp.id,
    secret: await hash.token(),
    registration_date: new Date(),
  });
  return appSecret.save();
};

exports.removeAppSecret = async (app, appSecret) => {
  const loadedApp = await appCommons.getApp(app.id);
  await AppSecret.remove({_id: appSecret.id, app: loadedApp.id});
};
