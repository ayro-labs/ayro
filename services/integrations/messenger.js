'use strict';

const constants = require('../../utils/constants');
const errors = require('../../utils/errors');
const apis = require('../../utils/apis');
const integrationQueries = require('../../utils/queries/integration');
const integrationCommons = require('../commons/integration');
const _ = require('lodash');

async function subscribePage(configuration) {
  if (configuration.page) {
    await apis.facebook(configuration, true).api(`${configuration.page.id}/subscribed_apps`, 'post');
  }
}

async function unsubscribePage(configuration) {
  if (configuration.page) {
    try {
      await apis.facebook(configuration, true).api(`${configuration.page.id}/subscribed_apps`, 'delete');
    } catch (err) {
      if (err.response.error.code !== 100) {
        throw err;
      }
    }
  }
}

exports.addIntegration = async (app, profile) => {
  const configuration = {
    profile: {
      id: profile.id,
      name: profile.name,
      access_token: profile.access_token,
    },
  };
  return integrationCommons.addIntegration(app, constants.integration.channels.MESSENGER, constants.integration.types.USER, configuration);
};

exports.updateIntegration = async (app, page) => {
  const integration = await integrationQueries.getIntegration(app, constants.integration.channels.MESSENGER);
  const oldConfiguration = _.cloneDeep(integration.configuration);
  const result = await apis.facebook(integration.configuration).api(page.id, {fields: ['id', 'name', 'access_token']});
  const configuration = {
    page: {
      id: result.id,
      name: result.name,
      access_token: result.access_token,
    },
  };
  const integrationWithPage = await integrationQueries.findIntegration({channel: constants.integration.channels.MESSENGER, 'configuration.page.id': configuration.page.id}, {require: false});
  if (integrationWithPage) {
    throw errors.ayroError('facebook_page_already_integrated', 'Facebook page already integrated');
  }
  await unsubscribePage(oldConfiguration);
  await subscribePage(configuration);
  return integrationCommons.updateIntegration(app, constants.integration.channels.MESSENGER, configuration);
};

exports.removeIntegration = async (app) => {
  const integration = await integrationQueries.getIntegration(app, constants.integration.channels.MESSENGER);
  await unsubscribePage(integration.configuration);
  return integrationCommons.removeIntegration(app, constants.integration.channels.MESSENGER);
};

exports.listPages = async (app) => {
  const integration = await integrationQueries.getIntegration(app, constants.integration.channels.MESSENGER);
  const result = await apis.facebook(integration.configuration).api('me/accounts');
  const pages = [];
  _.each(result.data, (page) => {
    pages.push({
      id: page.id,
      name: page.name,
    });
  });
  return pages;
};
