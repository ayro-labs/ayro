const integrations = require('.');
const constants = require('../../utils/constants');
const settings = require('../../configs/settings');
const Promise = require('bluebird');
const FB = require('fb');
const _ = require('lodash');

function getFacebookApi(configuration, withPageToken) {
  return new FB.Facebook({
    appId: settings.facebook.appId,
    appSecret: settings.facebook.appSecret,
    accessToken: withPageToken && configuration.page ? configuration.page.access_token : configuration.profile.access_token,
    version: 'v2.10',
  });
}

function subscribePage(configuration) {
  return Promise.resolve().then(() => {
    if (configuration.page) {
      return getFacebookApi(configuration, true).api(`${configuration.page.id}/subscribed_apps`, 'post');
    }
    return Promise.resolve();
  });
}

function unsubscribePage(configuration) {
  return Promise.resolve().then(() => {
    if (configuration.page) {
      return getFacebookApi(configuration, true).api(`${configuration.page.id}/subscribed_apps`, 'delete');
    }
    return Promise.resolve();
  });
}

exports.addIntegration = (app, profile) => {
  return Promise.resolve().then(() => {
    const configuration = {
      profile: {
        id: profile.id,
        name: profile.name,
        access_token: profile.access_token,
      },
    };
    return integrations.add(app, constants.integration.channels.MESSENGER, constants.integration.types.USER, configuration);
  });
};

exports.updateIntegration = (app, page) => {
  return integrations.getConfiguration(app, constants.integration.channels.MESSENGER).bind({}).then((configuration) => {
    this.configurationOld = _.cloneDeep(configuration);
    this.configuration = configuration;
    return getFacebookApi(configuration).api(page.id, {fields: ['id', 'name', 'access_token']});
  }).then((result) => {
    this.configuration.page = {
      id: result.id,
      name: result.name,
      access_token: result.access_token,
    };
    return integrations.update(app, constants.integration.channels.MESSENGER, this.configuration);
  }).tap(() => {
    return unsubscribePage(this.configurationOld);
  }).tap(() => {
    return subscribePage(this.configuration);
  });
};

exports.listPages = (app) => {
  return integrations.getConfiguration(app, constants.integration.channels.MESSENGER).then((configuration) => {
    return getFacebookApi(configuration).api('me/accounts');
  }).then((result) => {
    const pages = [];
    result.data.forEach((page) => {
      pages.push({
        id: page.id,
        name: page.name,
      });
    });
    return pages;
  });
};

exports.extractUser = (data) => {
  return Promise.resolve(data);
};

exports.extractText = (data) => {
  return Promise.resolve(data);
};
