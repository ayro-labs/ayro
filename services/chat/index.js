'use strict';

const {User, ChatMessage} = require('../../models');
const constants = require('../../utils/constants');
const errors = require('../../utils/errors');
const integrationQueries = require('../../utils/queries/integration');
const userQueries = require('../../utils/queries/user');
const userCommons = require('../commons/user');
const chatCommons = require('../commons/chat');
const slack = require('../integrations/slack');
const Promise = require('bluebird');
const _ = require('lodash');

function getBusinessChannelApi(channel) {
  switch (channel) {
    case constants.integration.channels.SLACK:
      return slack;
    default:
      return null;
  }
}

exports.listMessages = async (user, channel) => {
  const chatMessages = await ChatMessage.find({user: user.id, channel}).sort({date: 'desc'}).exec();
  return _.reverse(chatMessages);
};

exports.pushMessage = async (channel, data) => {
  const channelApi = getBusinessChannelApi(channel);
  if (!channelApi) {
    throw errors.ayroError('channel_not_supported', 'Channel not supported');
  }
  const integration = await channelApi.getIntegration(data);
  try {
    const agent = await channelApi.getAgent(integration.configuration, data);
    const user = await channelApi.getUser(data);
    const text = await channelApi.extractText(data);
    const chatMessage = await chatCommons.pushMessage(agent, user, text);
    await channelApi.confirmMessage(integration.configuration, data, user, chatMessage);
  } catch (err) {
    if (err.code === 'user_not_found') {
      await channelApi.postUserNotFound(integration.configuration, data);
    } else {
      await channelApi.postMessageError(integration.configuration, data);
    }
  }
};

exports.postMessage = async (user, channel, message) => {
  let loadedUser = await userQueries.getUser(user.id);
  const updatedData = {transient: false};
  if (channel !== loadedUser.latest_channel) {
    updatedData.latest_channel = channel;
  }
  loadedUser = await userCommons.updateUser(loadedUser, updatedData);
  await User.populate(loadedUser, 'app devices');
  const integrations = await integrationQueries.findIntegrations(loadedUser.app, constants.integration.types.BUSINESS);
  const chatMessage = new ChatMessage({
    channel,
    app: loadedUser.app.id,
    user: loadedUser.id,
    text: message.text,
    direction: constants.chatMessage.directions.OUTGOING,
    date: new Date(),
  });
  const promises = [];
  integrations.forEach((integration) => {
    const channelApi = getBusinessChannelApi(integration.channel);
    if (channelApi) {
      promises.push(channelApi.postMessage(integration.configuration, loadedUser, chatMessage.text));
    }
  });
  await Promise.all(promises);
  return chatMessage.save();
};

exports.postProfile = async (channel, data) => {
  const channelApi = getBusinessChannelApi(channel);
  if (!channelApi) {
    throw errors.ayroError('integration_not_supported', 'Integration not supported');
  }
  const integration = await channelApi.getIntegration(data);
  try {
    const user = await channelApi.getUser(data);
    await User.populate(user, 'app devices');
    await channelApi.postProfile(integration.configuration, user);
  } catch (err) {
    if (err.code === 'user_not_found') {
      await channelApi.postUserNotFound(integration.configuration, data);
    } else {
      await channelApi.postProfileError(integration.configuration, data);
    }
  }
};

exports.postHelp = async (channel, data) => {
  const channelApi = getBusinessChannelApi(channel);
  if (!channelApi) {
    throw errors.ayroError('integration_not_supported', 'Integration not supported');
  }
  const integration = await channelApi.getIntegration(data);
  await channelApi.postHelp(integration.configuration, data);
};
