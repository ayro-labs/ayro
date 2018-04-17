const {App} = require('../models');
const settings = require('../configs/settings');
const hash = require('../utils/hash');
const files = require('../utils/files');
const appCommons = require('./commons/app');
const path = require('path');
const fs = require('fs');
const Promise = require('bluebird');

const $ = this;

const unlinkAsync = Promise.promisify(fs.unlink);

exports.listApps = async (account, withIntegrations) => {
  return appCommons.findApps({account: account.id}, withIntegrations ? {populate: 'integrations'} : {});
};

exports.getApp = async (account, id, withIntegrations) => {
  return appCommons.findApp({_id: id, account: account.id}, withIntegrations ? {populate: 'integrations'} : {});
};

exports.getAppByToken = async (token, withIntegrations) => {
  return appCommons.findApp({token}, withIntegrations ? {populate: 'integrations'} : {});
};

exports.createApp = async (account, name) => {
  const token = await hash.token();
  const app = new App({name, token, account: account.id, registration_date: new Date()});
  return app.save();
};

exports.updateApp = async (account, app, name) => {
  const currentApp = await $.getApp(account, app.id);
  return App.findByIdAndUpdate(currentApp.id, {name}, {new: true, runValidators: true}).exec();
};

exports.updateIcon = async (account, app, icon) => {
  const currentApp = await $.getApp(account, app.id);
  const oldIconPath = currentApp.icon ? path.join(settings.appIconPath, currentApp.icon) : null;
  currentApp.icon = await files.fixAppIcon(currentApp, icon.path);
  if (oldIconPath) {
    await unlinkAsync(oldIconPath);
  }
  return App.findByIdAndUpdate(currentApp.id, {icon: currentApp.icon}, {new: true, runValidators: true}).exec();
};

exports.deleteApp = async (account, app) => {
  const currentApp = await $.getApp(account, app.id);
  return App.remove({_id: currentApp.id});
};
