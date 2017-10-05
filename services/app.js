const App = require('../models').App;
const settings = require('../configs/settings');
const cryptography = require('../utils/cryptography');
const errors = require('../utils/errors');
const appCommons = require('./commons/app');
const path = require('path');
const fs = require('fs');

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
  return this.getApp(account, app.id).then((app) => {
    return App.findByIdAndUpdate(app.id, {name}, {new: true, runValidators: true}).exec();
  });
};

exports.updateAppIcon = (account, app, icon) => {
  return this.getApp(account, app.id).then((app) => {
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
  return this.getApp(account, app.id).then((app) => {
    return App.remove({_id: app.id});
  }).then(() => {
    return null;
  });
};
