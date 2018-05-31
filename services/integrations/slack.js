'use strict';

const constants = require('utils/constants');
const errors = require('utils/errors');
const apis = require('utils/apis');
const integrationQueries = require('utils/queries/integration');
const integrationCommons = require('services/commons/integration');
const _ = require('lodash');

const AYRO_BOT_USERNAME = 'Ayro';

async function postBotIntro(slackApi, user, channel) {
  const text = `Olá, eu sou o Ayro BOT! <@${user.id}> acabou de integrar este Workspace com o <https://ayro.io|Ayro>. Agora você pode conversar com seus clientes em tempo real, direto do Slack. Digite */ayro-help* para obter mais informações.`;
  await slackApi.chat.postMessage({
    text,
    channel: channel.id,
    username: AYRO_BOT_USERNAME,
    as_user: false,
  });
}

exports.addIntegration = async (app, accessToken) => {
  const slackApi = apis.slack(accessToken);
  const testResult = await slackApi.auth.test();
  const configuration = {
    team: {
      id: testResult.team_id,
      name: testResult.team,
      url: testResult.url,
    },
    user: {
      id: testResult.user_id,
      name: testResult.user,
      access_token: accessToken,
    },
  };
  let integration = await integrationQueries.findIntegration({channel: constants.integration.channels.SLACK, 'configuration.team.id': configuration.team.id}, {require: false});
  if (integration) {
    throw errors.ayroError('slack_workspace_already_integrated', 'Slack workspace already integrated');
  }
  const listResult = await slackApi.channels.list({exclude_archived: true, exclude_members: true});
  _.each(listResult.channels, (channel) => {
    if (channel.is_general) {
      configuration.channel = _.pick(channel, ['id', 'name']);
    }
  });
  integration = await integrationCommons.addIntegration(app, constants.integration.channels.SLACK, constants.integration.types.BUSINESS, configuration);
  await postBotIntro(slackApi, configuration.user, configuration.channel);
  return integration;
};

exports.updateIntegration = async (app, channel) => {
  const configuration = {channel};
  return integrationCommons.updateIntegration(app, constants.integration.channels.SLACK, configuration);
};

exports.removeIntegration = async (app) => {
  return integrationCommons.removeIntegration(app, constants.integration.channels.SLACK);
};

exports.listChannels = async (app) => {
  const integration = await integrationQueries.getIntegration(app, constants.integration.channels.SLACK);
  const slackApi = apis.slack(integration.configuration);
  const result = await slackApi.channels.list({exclude_archived: true, exclude_members: true});
  const channels = [];
  _.each(result.channels, (channel) => {
    channels.push(_.pick(channel, ['id', 'name']));
  });
  return channels;
};

exports.createChannel = async (app, channel) => {
  const integration = await integrationQueries.getIntegration(app, constants.integration.channels.SLACK);
  const slackApi = apis.slack(integration.configuration);
  const result = await slackApi.channels.create({name: channel});
  return _.pick(result.channel, ['id', 'name']);
};
