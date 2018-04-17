const {App, Integration, User, Device, ChatMessage} = require('../models');
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
  const loadedApp = await $.getApp(account, app.id);
  return App.findByIdAndUpdate(loadedApp.id, {name}, {new: true, runValidators: true}).exec();
};

exports.updateIcon = async (account, app, icon) => {
  const loadedApp = await $.getApp(account, app.id);
  const oldIconPath = loadedApp.icon ? path.join(settings.appIconPath, loadedApp.icon) : null;
  loadedApp.icon = await files.fixAppIcon(loadedApp, icon.path);
  if (oldIconPath) {
    await unlinkAsync(oldIconPath);
  }
  return App.findByIdAndUpdate(loadedApp.id, {icon: loadedApp.icon}, {new: true, runValidators: true}).exec();
};

exports.deleteApp = async (account, app) => {
  const loadedApp = await $.getApp(account, app.id);
  const users = await User.find({app: loadedApp.id}).select({_id: 1});
  const usersIds = users.map((user) => {
    return user.id;
  });
  await ChatMessage.remove({user: {$in: usersIds}});
  await Device.remove({user: {$in: usersIds}});
  await User.remove({app: loadedApp.id});
  await Integration.remove({app: loadedApp.id});
  return App.remove({_id: loadedApp.id});
};
