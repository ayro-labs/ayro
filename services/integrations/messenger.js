const integrations = require('.');
const constants = require('../../utils/constants');
const settings = require('../../configs/settings');
const Promise = require('bluebird');
const FB = require('fb');

function getFacebookApi(configuration) {
  return new FB.Facebook({
    appId: settings.facebook.appId,
    appSecret: settings.facebook.appSecret,
    accessToken: configuration.profile.access_token,
    version: 'v2.10',
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
  return integrations.getConfiguration(app, constants.integration.channels.MESSENGER).then((configuration) => {
    return getFacebookApi(configuration).api(page.id, {fields: ['id', 'name', 'access_token']}).then((result) => {
      configuration.page = {
        id: result.id,
        name: result.name,
        access_token: result.access_token,
      };
      return integrations.update(app, constants.integration.channels.MESSENGER, configuration);
    });
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
