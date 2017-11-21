const {App} = require('../models');
const settings = require('../configs/settings');
const logger = require('../utils/logger');
const hash = require('../utils/hash');
const files = require('../utils/files');
const appCommons = require('./commons/app');
const path = require('path');
const fs = require('fs');
const Promise = require('bluebird');

const $ = this;

const renameAsync = Promise.promisify(fs.rename);

exports.listApps = (account, withIntegrations) => {
  return appCommons.findApps({account: account.id}, withIntegrations ? {populate: 'integrations'} : {});
};

exports.getApp = (account, id, withIntegrations) => {
  return appCommons.findApp({_id: id, account: account.id}, withIntegrations ? {populate: 'integrations'} : {});
};

exports.getAppByToken = (token, withIntegrations) => {
  return appCommons.findApp({token}, withIntegrations ? {populate: 'integrations'} : {});
};

exports.createApp = (account, name) => {
  return Promise.coroutine(function* () {
    const token = yield hash.token();
    const app = new App({name, token, account: account.id, registration_date: new Date()});
    return app.save();
  })();
};

exports.updateApp = (account, app, name) => {
  return Promise.coroutine(function* () {
    const currentApp = yield $.getApp(account, app.id);
    return App.findByIdAndUpdate(currentApp.id, {name}, {new: true, runValidators: true}).exec();
  })();
};

exports.updateIcon = (account, app, icon) => {
  return Promise.coroutine(function* () {
    const currentApp = yield $.getApp(account, app.id);
    const iconPath = path.join(settings.appIconPath, currentApp.id);
    yield renameAsync(icon.path, iconPath);
    try {
      currentApp.icon = currentApp.id;
      currentApp.icon = yield files.fixAppIcon(currentApp);
    } catch (err) {
      logger.debug('Could not fix icon of app %s: %s.', currentApp.id, err.message);
    }
    return App.findByIdAndUpdate(currentApp.id, {icon: currentApp.icon}, {new: true, runValidators: true}).exec();
  })();
};

exports.deleteApp = (account, app) => {
  return Promise.coroutine(function* () {
    const currentApp = yield $.getApp(account, app.id);
    return App.remove({_id: currentApp.id});
  })();
};
