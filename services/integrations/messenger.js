const integrations = require('.');
const constants = require('../../utils/constants');
const Promise = require('bluebird');
const _ = require('lodash');

const CONFIG_ATTRIBUTES = ['profile.id', 'page.id'];

exports.addIntegration = (app, profileId, pageId) => {
  return Promise.resolve().then(() => {
    const configuration = {
      profile: {id: profileId},
      page: {id: pageId},
    };
    return integrations.add(app, constants.integration.channels.MESSENGER, constants.integration.types.BUSINESS, _.pick(configuration, CONFIG_ATTRIBUTES));
  });
};

exports.extractUser = (data) => {
  return Promise.resolve(data);
};

exports.extractText = (data) => {
  return Promise.resolve(data);
};
