const constants = require('../../utils/constants');
const apis = require('../../utils/apis');
const integrationCommons = require('../commons/integration');
const Promise = require('bluebird');
const _ = require('lodash');

function subscribePage(configuration) {
  return Promise.resolve().then(() => {
    if (configuration.page) {
      return apis.facebook(configuration, true).api(`${configuration.page.id}/subscribed_apps`, 'post');
    }
    return Promise.resolve();
  });
}

function unsubscribePage(configuration) {
  return Promise.resolve().then(() => {
    if (configuration.page) {
      return apis.facebook(configuration, true).api(`${configuration.page.id}/subscribed_apps`, 'delete');
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
    return integrationCommons.addIntegration(app, constants.integration.channels.MESSENGER, constants.integration.types.USER, configuration);
  });
};

exports.updateIntegration = (app, page) => {
  return integrationCommons.getConfiguration(app, constants.integration.channels.MESSENGER).bind({}).then((configuration) => {
    this.configurationOld = _.cloneDeep(configuration);
    this.configuration = configuration;
    return apis.facebook(configuration).api(page.id, {fields: ['id', 'name', 'access_token']});
  }).then((result) => {
    this.configuration.page = {
      id: result.id,
      name: result.name,
      access_token: result.access_token,
    };
    return integrationCommons.updateIntegration(app, constants.integration.channels.MESSENGER, this.configuration);
  }).tap(() => {
    return unsubscribePage(this.configurationOld);
  }).tap(() => {
    return subscribePage(this.configuration);
  });
};

exports.removeMessengerIntegration = (app) => {
  return integrationCommons.removeIntegration(app, constants.integration.channels.MESSENGER);
};

exports.listPages = (app) => {
  return integrationCommons.getConfiguration(app, constants.integration.channels.MESSENGER).then((configuration) => {
    return apis.facebook(configuration).api('me/accounts');
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
