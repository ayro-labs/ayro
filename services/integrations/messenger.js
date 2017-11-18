const constants = require('../../utils/constants');
const apis = require('../../utils/apis');
const integrationCommons = require('../commons/integration');
const Promise = require('bluebird');
const _ = require('lodash');

function subscribePage(configuration) {
  return Promise.coroutine(function* () {
    if (configuration.page) {
      yield apis.facebook(configuration, true).api(`${configuration.page.id}/subscribed_apps`, 'post');
    }
  })();
}

function unsubscribePage(configuration) {
  return Promise.coroutine(function* () {
    if (configuration.page) {
      try {
        yield apis.facebook(configuration, true).api(`${configuration.page.id}/subscribed_apps`, 'delete');
      } catch (err) {
        if (err.response.error.code !== 100) {
          throw err;
        }
      }
    }
  })();
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
  return Promise.coroutine(function* () {
    const integration = yield integrationCommons.getIntegration(app, constants.integration.channels.MESSENGER);
    const oldConfiguration = _.cloneDeep(integration.configuration);
    const result = yield apis.facebook(integration.configuration).api(page.id, {fields: ['id', 'name', 'access_token']});
    const configuration = {
      page: {
        id: result.id,
        name: result.name,
        access_token: result.access_token,
      },
    };
    yield unsubscribePage(oldConfiguration);
    yield subscribePage(configuration);
    return integrationCommons.updateIntegration(app, constants.integration.channels.MESSENGER, configuration);
  })();
};

exports.removeIntegration = (app) => {
  return integrationCommons.removeIntegration(app, constants.integration.channels.MESSENGER);
};

exports.listPages = (app) => {
  return Promise.coroutine(function* () {
    const integration = yield integrationCommons.getIntegration(app, constants.integration.channels.MESSENGER);
    const result = yield apis.facebook(integration.configuration).api('me/accounts');
    const pages = [];
    result.data.forEach((page) => {
      pages.push({
        id: page.id,
        name: page.name,
      });
    });
    return pages;
  })();
};

exports.extractUser = (data) => {
  return Promise.resolve(data);
};

exports.extractText = (data) => {
  return Promise.resolve(data);
};
