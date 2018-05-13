'use strict';

const {App, User, ChatMessage} = require('../../models');
const constants = require('../../utils/constants');
const errors = require('../../utils/errors');
const integrationQueries = require('../../utils/queries/integration');
const userQueries = require('../../utils/queries/user');
const userCommons = require('../commons/user');
const chatCommons = require('../commons/chat');
const slack = require('../integrations/slack');
const Promise = require('bluebird');
const _ = require('lodash');

const CHANNEL_EMAIL = 'email';

function getBusinessApi(channel) {
  switch (channel) {
    case constants.integration.channels.SLACK:
      return slack;
    default:
      return null;
  }
}

exports.listMessages = async (user, channel) => {
  return ChatMessage.find({user: user.id, channel}).sort({date: 'asc'}).exec();
};

exports.pushMessage = async (channel, data) => {
  const businessApi = getBusinessApi(channel);
  if (!businessApi) {
    throw errors.ayroError('channel_not_supported', 'Channel not supported');
  }
  const integration = await businessApi.getIntegration(data);
  try {
    const agent = await businessApi.getAgent(integration.configuration, data);
    const user = await businessApi.getUser(data);
    const text = await businessApi.getText(data);
    const chatMessage = await chatCommons.pushMessage(agent, user, text);
    await businessApi.confirmMessage(integration.configuration, data, user, chatMessage);
  } catch (err) {
    if (err.code === 'user_not_found') {
      await businessApi.postUserNotFound(integration.configuration, data);
    } else {
      await businessApi.postMessageError(integration.configuration, data);
    }
  }
};

exports.postMessage = async (user, channel, message) => {
  const loadedUser = await userQueries.getUser(user.id);
  const updatedData = {transient: false};
  if (channel !== loadedUser.latest_channel) {
    updatedData.latest_channel = channel;
  }
  const updatedUser = await userCommons.updateUser(loadedUser, updatedData);
  await User.populate(updatedUser, 'app devices');
  const integrations = await integrationQueries.findIntegrations(updatedUser.app, constants.integration.types.BUSINESS);
  const chatMessage = new ChatMessage({
    channel,
    app: updatedUser.app.id,
    user: updatedUser.id,
    type: constants.chatMessage.types.TEXT,
    text: message.text,
    direction: constants.chatMessage.directions.OUTGOING,
    date: new Date(),
  });
  const promises = [];
  _.each(integrations, (integration) => {
    const businessApi = getBusinessApi(integration.channel);
    if (businessApi) {
      // promises.push(businessApi.postMessage(integration.configuration, updatedUser, chatMessage));
    }
  });
  await Promise.all(promises);
  return chatMessage.save();
};

exports.postChannelConnected = async (user, channel, data) => {
  if (channel === CHANNEL_EMAIL) {
    const loadedUser = await userQueries.getUser(user.id);
    const app = new App({id: loadedUser.app});
    const integrations = await integrationQueries.findIntegrations(app, constants.integration.types.BUSINESS);
    const promises = [];
    _.each(integrations, (integration) => {
      const businessApi = getBusinessApi(integration.channel);
      if (businessApi) {
        promises.push(businessApi.postEmailConnected(integration.configuration, loadedUser, data.email));
      }
    });
    await Promise.all(promises);
  }
};

exports.postProfile = async (channel, data) => {
  const businessApi = getBusinessApi(channel);
  if (!businessApi) {
    throw errors.ayroError('integration_not_supported', 'Integration not supported');
  }
  const integration = await businessApi.getIntegration(data);
  try {
    const user = await businessApi.getUser(data);
    await User.populate(user, 'app devices');
    await businessApi.postProfile(integration.configuration, user);
  } catch (err) {
    if (['user_not_found', 'channel_not_found'].includes(err.code)) {
      await businessApi.postUserNotFound(integration.configuration, data);
    } else {
      await businessApi.postProfileError(integration.configuration, data);
    }
  }
};

exports.postHelp = async (channel, data) => {
  const businessApi = getBusinessApi(channel);
  if (!businessApi) {
    throw errors.ayroError('integration_not_supported', 'Integration not supported');
  }
  const integration = await businessApi.getIntegration(data);
  await businessApi.postHelp(integration.configuration, data);
};
