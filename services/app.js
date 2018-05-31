'use strict';

const {App, AppSecret, Integration} = require('models');
const {User, Device, ChatMessage} = require('models');
const settings = require('configs/settings');
const hash = require('utils/hash');
const files = require('utils/files');
const appQueries = require('utils/queries/app');
const path = require('path');
const _ = require('lodash');

const ALLOWED_ATTRS = ['name'];

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
  return appQueries.findApps({account: account.id}, {populate: getAppPopulateOption(withIntegrations, withPlugins)});
};

exports.getApp = async (id, withIntegrations, withPlugins) => {
  return appQueries.getApp(id, {populate: getAppPopulateOption(withIntegrations, withPlugins)});
};

exports.appExists = async (query) => {
  const count = await App.count({query});
  return count > 0;
};

exports.getAppByToken = async (token, withIntegrations, withPlugins) => {
  return appQueries.findApp({token}, {populate: getAppPopulateOption(withIntegrations, withPlugins)});
};

exports.createApp = async (account, name) => {
  const token = await hash.token();
  const app = new App({name, token, account: account.id, registration_date: new Date()});
  return app.save();
};

exports.updateApp = async (app, data) => {
  const loadedApp = await appQueries.getApp(app.id);
  const attrs = _.pick(data, ALLOWED_ATTRS);
  await loadedApp.update(attrs, {runValidators: true});
  loadedApp.set(attrs);
  return loadedApp;
};

exports.updateIcon = async (app, iconFile) => {
  const loadedApp = await appQueries.getApp(app.id);
  const oldIconPath = loadedApp.icon ? path.join(settings.appIconPath, loadedApp.icon) : null;
  const icon = await files.fixAppIcon(loadedApp, iconFile.path);
  await loadedApp.update({icon}, {runValidators: true});
  loadedApp.icon = icon;
  if (oldIconPath && (await files.fileExists(oldIconPath))) {
    await files.removeFile(oldIconPath);
  }
  return loadedApp;
};

exports.deleteApp = async (app) => {
  const loadedApp = await appQueries.getApp(app.id);
  await ChatMessage.remove({app: loadedApp.id});
  await Device.remove({app: loadedApp.id});
  await User.remove({app: loadedApp.id});
  await Integration.remove({app: loadedApp.id});
  await loadedApp.remove();
};

exports.listAppSecrets = async (app) => {
  const loadedApp = await appQueries.getApp(app.id);
  const appSecrets = await AppSecret.find({app: loadedApp.id});
  return appSecrets;
};

exports.createAppSecret = async (app) => {
  const loadedApp = await appQueries.getApp(app.id);
  const appSecret = new AppSecret({
    app: loadedApp.id,
    secret: await hash.token(),
    registration_date: new Date(),
  });
  return appSecret.save();
};

exports.removeAppSecret = async (app, appSecret) => {
  const loadedApp = await appQueries.getApp(app.id);
  await AppSecret.remove({_id: appSecret.id, app: loadedApp.id});
};
